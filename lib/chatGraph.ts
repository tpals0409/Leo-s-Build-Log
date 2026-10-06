import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// 챗봇의 "레오에 대한 사실" 그래프 (Neo4j). 원본은 content/profile/knowledge.json(개인 LLM 위키에서 고른 공개용 주장) — Neo4j는 사본.
// 질문 임베딩과 가까운 주장을 벡터 색인으로 찾고, 그 주장이 가리키는 프로젝트의 다른 주장(이웃)까지 꺼낸다.
// 앱은 Neo4j HTTP API로 고정된 질의만 보낸다(모델이 만든 Cypher는 실행하지 않음). NEO4J_URL이 없거나 연결이 안 되면 사실 없이 답한다.

const URL_ = process.env.NEO4J_URL; // 예: http://neo4j:7474
const DB = process.env.NEO4J_DATABASE ?? 'neo4j';
const AUTH = `Basic ${Buffer.from(`${process.env.NEO4J_USER ?? 'neo4j'}:${process.env.NEO4J_PASSWORD ?? ''}`).toString('base64')}`;
export const graphEnabled = () => Boolean(URL_);

type Stmt = { statement: string; parameters?: Record<string, unknown> };
type Result = { columns: string[]; data: { row: unknown[] }[] };

// 한 트랜잭션으로 실행. 스키마(색인·제약) 변경은 데이터 쓰기와 같은 트랜잭션에 둘 수 없어 따로 부른다
async function cypher(...statements: Stmt[]): Promise<Result[]> {
  const res = await fetch(`${URL_}/db/${DB}/tx/commit`, {
    method: 'POST',
    headers: { authorization: AUTH, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ statements }),
  });
  if (!res.ok) throw new Error(`Neo4j ${res.status}`);
  const body = (await res.json()) as { results: Result[]; errors: { code: string; message: string }[] };
  if (body.errors.length) throw new Error(`Neo4j ${body.errors[0].code}: ${body.errors[0].message}`);
  return body.results;
}

type Node = { id: string; type: 'Author' | 'Project' | 'Claim' | 'EvidenceReference'; name?: string; text?: string; kind?: string; visibility?: string; source_recorded_at?: string };
type Knowledge = { nodes: Node[]; relationships: { source: string; type: 'ABOUT' | 'SUPPORTED_BY'; target: string }[] };

// 그래프를 원본(knowledge.json)과 같게: 내용 해시가 다르면 PortfolioPublic 노드를 전부 지우고 다시 넣는다(주장 수십 개라 통째로).
export async function syncGraph(embed: (texts: string[]) => Promise<number[][]>, embedModel: string) {
  const raw = readFileSync(path.join(process.cwd(), 'content/profile/knowledge.json'), 'utf8');
  const hash = createHash('sha256').update(`${embedModel}\n${raw}`).digest('hex').slice(0, 16);
  const [meta] = await cypher({ statement: `MATCH (m:PortfolioMeta {id: 'meta'}) RETURN m.hash` });
  if (meta.data[0]?.row[0] === hash) return;

  const k = JSON.parse(raw) as Knowledge;
  const of = (type: Node['type']) => k.nodes.filter((n) => n.type === type);
  const names = new Map(of('Project').map((p) => [p.id, p.name!]));
  const claims = of('Claim').filter((c) => c.visibility === 'public');
  // 주장 문장만으로는 어느 프로젝트 얘기인지 몰라 검색에서 밀린다 → 프로젝트 이름을 앞에 붙여 임베딩
  const projectOf = new Map(k.relationships.filter((r) => r.type === 'ABOUT' && names.has(r.target)).map((r) => [r.source, names.get(r.target)!]));
  const vectors = await embed(claims.map((c) => `${projectOf.get(c.id) ?? ''}\n${c.text}`));

  await cypher({ statement: 'CREATE CONSTRAINT portfolio_public_id IF NOT EXISTS FOR (n:PortfolioPublic) REQUIRE n.id IS UNIQUE' });
  await cypher(
    { statement: 'MATCH (n:PortfolioPublic) DETACH DELETE n' },
    { statement: 'UNWIND $xs AS x CREATE (:PortfolioPublic:Author {id: x.id, name: x.name})', parameters: { xs: of('Author') } },
    { statement: 'UNWIND $xs AS x CREATE (:PortfolioPublic:Project {id: x.id, name: x.name})', parameters: { xs: of('Project') } },
    { statement: 'UNWIND $xs AS x CREATE (:PortfolioPublic:EvidenceReference {id: x.id})', parameters: { xs: of('EvidenceReference') } },
    {
      statement: 'UNWIND $xs AS x CREATE (:PortfolioPublic:Claim {id: x.id, text: x.text, kind: x.kind, visibility: x.visibility, recorded: x.recorded, embedding: x.embedding})',
      parameters: { xs: claims.map((c, i) => ({ id: c.id, text: c.text, kind: c.kind, visibility: c.visibility, recorded: c.source_recorded_at, embedding: vectors[i] })) },
    },
    { statement: 'UNWIND $xs AS r MATCH (a:PortfolioPublic {id: r.source}), (b:PortfolioPublic {id: r.target}) CREATE (a)-[:ABOUT]->(b)', parameters: { xs: k.relationships.filter((r) => r.type === 'ABOUT') } },
    { statement: 'UNWIND $xs AS r MATCH (a:PortfolioPublic {id: r.source}), (b:PortfolioPublic {id: r.target}) CREATE (a)-[:SUPPORTED_BY]->(b)', parameters: { xs: k.relationships.filter((r) => r.type === 'SUPPORTED_BY') } },
  );
  await cypher({
    statement: `CREATE VECTOR INDEX portfolio_claim_embedding IF NOT EXISTS FOR (c:Claim) ON c.embedding
      OPTIONS {indexConfig: {\`vector.dimensions\`: ${vectors[0]?.length ?? 1536}, \`vector.similarity_function\`: 'cosine'}}`,
  });
  await cypher({ statement: `MERGE (m:PortfolioMeta {id: 'meta'}) SET m.hash = $hash`, parameters: { hash } });
}

export type Fact = { project: string; text: string; kind: string; recorded: string };

// 질문과 가까운 주장 6개 → 그 주장들이 가리키는 프로젝트 중 가까운 둘의 주장 전부(이웃) + 프로젝트 없는 주장(레오 자신에 대한 것)
export async function graphFacts(q: number[]): Promise<Fact[]> {
  const [r] = await cypher({
    statement: `
      CALL db.index.vector.queryNodes('portfolio_claim_embedding', 6, $q) YIELD node AS c, score
      WHERE c.visibility = 'public'
      OPTIONAL MATCH (c)-[:ABOUT]->(p:Project)
      WITH c, p, score ORDER BY score DESC
      WITH collect(c) AS hits, [x IN collect(DISTINCT p) WHERE x IS NOT NULL][0..2] AS projects
      CALL {
        WITH projects
        UNWIND projects AS p
        MATCH (s:Claim)-[:ABOUT]->(p) WHERE s.visibility = 'public'
        RETURN collect({project: p.name, text: s.text, kind: s.kind, recorded: s.recorded}) AS neighbors
      }
      RETURN neighbors + [c IN hits WHERE NOT (c)-[:ABOUT]->(:Project) | {project: '', text: c.text, kind: c.kind, recorded: c.recorded}]`,
    parameters: { q },
  });
  return (r.data[0]?.row[0] as Fact[] | undefined) ?? [];
}
