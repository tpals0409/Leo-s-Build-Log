import type { Locale } from './i18n';

// 프로젝트는 코드로 관리한다 (자주 안 바뀜). 글은 posts.project에 이 slug로 연결된다.
// TODO(김세민): 소개 문구와 이미지 채우기 — 지금은 자리표시
type T = Record<Locale, string>;
type Item = { title: T; body: T; tech?: T }; // title·body는 쉬운 말, tech는 개발자용 세부(작게)

// 프로젝트 페이지의 케이스 스터디(있는 프로젝트만). 출처는 각 프로젝트 저장소의 README.
// screens: 화면 캡처. video가 있으면 움직이는 화면(mp4, src는 첫 장면 — 움직임 줄이기 설정이면 이것만 보임)
export type ProjectDetail = {
  banner: string;
  facts: { label: T; value: T }[];
  links: { label: T; href: string }[];
  problem: T;
  answers: Item[];
  mine: { intro: T; items: Item[] };
  fixes: Item[];
  screens: { src: string; video?: string; label: T }[];
  stack: { label: T; value: string }[];
};

export type Project = { slug: string; name: T; image: string | null; summary: T; detail?: ProjectDetail };

const TBD = { ko: '프로젝트 소개를 준비하고 있습니다.', en: 'Project details coming soon.' };

const F = '/projects/finch';

const FINCH: ProjectDetail = {
  banner: `${F}/banner-2240.webp`,
  facts: [
    { label: { ko: '기간', en: 'Period' }, value: { ko: '2026.08 – 2026.09 (6주)', en: 'Aug – Sep 2026 (6 weeks)' } },
    { label: { ko: '팀', en: 'Team' }, value: { ko: '5명 · 프론트엔드 2, 백엔드 1, AI 1, 인프라 1', en: '5 people · 2 frontend, 1 backend, 1 AI, 1 infra' } },
    { label: { ko: '역할', en: 'Role' }, value: { ko: 'AI 파트 리드', en: 'AI lead' } },
  ],
  links: [
    { label: { ko: '서비스', en: 'Live service' }, href: 'https://finchapp.org' },
    { label: { ko: '시연 영상', en: 'Demo video' }, href: 'https://youtu.be/4Cbu0-vMve4' },
    { label: { ko: 'GitHub', en: 'GitHub' }, href: 'https://github.com/Team-FINCH/finch-docs' },
  ],
  problem: {
    ko: '주식 앱의 시세·뉴스·공시는 누구에게나 같은 정보라, 내 포트폴리오에 어떤 의미인지는 직접 찾아봐야 함. 보유 종목과 거래 내역을 기준으로 개인화된 정보를 제공하되, LLM이 숫자를 지어내거나 투자를 권유하지 않아야 함.',
    en: 'Prices, news and filings in stock apps are the same for everyone, so you have to work out what they mean for your own portfolio. The goal: personalized information based on your holdings and trades, without the LLM making up numbers or giving investment advice.',
  },
  answers: [
    {
      title: { ko: '숫자는 계산 엔진이 산출', en: 'Numbers come from a calculation engine' },
      body: { ko: '수익률·비중·손익은 계산 엔진이 구하고, AI는 값이 들어갈 자리만 표시해 문장 작성', en: 'Returns, weights and P&L are computed by an engine. The AI writes sentences with markers where those values go.' },
    },
    {
      title: { ko: '답변 전송 전 검사', en: 'Answers are checked before they go out' },
      body: { ko: '숫자, 출처, 매수·매도 권유 여부 등 10가지 검사. 걸리면 다시 생성하고, 다시 걸리면 내보내지 않음', en: 'Ten checks cover numbers, sources and buy/sell advice. A failed answer is regenerated, and dropped if it fails again.' },
    },
    {
      title: { ko: 'AI는 계좌 조회만 가능', en: 'The AI only reads account data' },
      body: { ko: '계좌 데이터는 백엔드에서만 수정하고, AI는 조회용 내부 API만 사용', en: 'Only the backend changes account data. The AI uses a read-only internal API.' },
    },
    {
      title: { ko: '답변에 출처 표시', en: 'Answers show their sources' },
      body: { ko: '뉴스와 공시를 매일 수집해 두고, 답변에 쓴 자료를 각주로 첨부', en: 'News and filings are collected daily, and the ones used in an answer are attached as footnotes.' },
    },
  ],
  mine: {
    intro: {
      ko: 'AI 서버(FastAPI) 설계·구현 총괄. 브리핑·채팅·종목 분석·포트폴리오 진단 기능과 이를 받치는 출력 검사, 자료 수집·검색 담당',
      en: 'Led the design and build of the AI server (FastAPI): briefing, chat, stock analysis and portfolio diagnosis, plus the output checks and data collection and search behind them.',
    },
    items: [
    {
      title: { ko: '숫자 치환 구조', en: 'Number substitution' },
      body: { ko: 'LLM은 허용된 키만 쓰고 서버가 계산 엔진 값으로 치환. 계산되지 않은 숫자가 답변에 들어갈 경로 차단', en: 'The LLM writes only allowed keys and the server fills in engine values, so no uncomputed number can reach an answer.' },
      tech: { ko: 'LLM은 허용된 키로 {{return_005930}}처럼 쓰고 서버가 계산 엔진 값(+2.48%)으로 치환 · 응답은 텍스트·수치 segments로 분리', en: 'The LLM writes allowed keys like {{return_005930}}; the server substitutes engine values (+2.48%) · responses split into text/number segments' },
    },
    {
      title: { ko: '출력 검사 10종', en: 'Ten output checks' },
      body: { ko: '숫자·출처·금지 표현 등을 검사해 위반 시 사유를 붙여 재생성, 재실패 시 차단', en: 'Numbers, sources and banned phrases are checked; a failing answer is regenerated with the reason attached and blocked if it fails again.' },
      tech: { ko: '원시 숫자 · 엔진 값 불일치 · 인용 무결성 · 금지 표현 · 스키마 등', en: 'Raw numbers · engine mismatch · citation integrity · banned phrases · schema, and more' },
    },
    {
      title: { ko: '도구 기반 채팅 에이전트', en: 'Tool-using chat agent' },
      body: { ko: '질문에 맞는 조회 도구(계좌·수익률·시세·뉴스·공시)를 골라 호출하고, 조회 결과만으로 답변 작성', en: 'Picks the lookup tools a question needs (account, returns, prices, news, filings) and answers only from what they return.' },
      tech: { ko: '도구 선택 → 서술 2단계 · 도구 7종 병렬 호출, 최대 3턴·12호출 · 작업 큐(Postgres SKIP LOCKED)', en: 'Tool selection → narration · 7 tools in parallel, max 3 turns / 12 calls · job queue (Postgres SKIP LOCKED)' },
    },
    {
      title: { ko: '뉴스·공시 수집과 검색', en: 'News and filing collection and search' },
      body: { ko: '뉴스·공시·시세 정기 수집, 답변과 데일리 브리핑의 근거 자료 검색', en: 'Scheduled collection of news, filings and prices, searched as evidence for answers and the daily briefing.' },
      tech: { ko: '네이버 뉴스 · DART 공시 → 청크 · 임베딩(text-embedding-3-small) → pgvector + 어휘 검색, RRF 융합', en: 'Naver News · DART filings → chunking · embeddings (text-embedding-3-small) → pgvector + lexical search, RRF fusion' },
    },
    {
      title: { ko: 'TDD 기반 개발', en: 'Test-driven development' },
      body: { ko: '검사 규칙·숫자 치환·도구 호출을 테스트로 먼저 정의한 뒤 구현. 고정 포트폴리오 골든 테스트로 계산 결과 회귀 확인', en: 'Checks, number substitution and tool calls were defined as tests first, then implemented. Golden tests on a fixed portfolio catch calculation regressions.' },
      tech: { ko: 'pytest · 골든 테스트 · 테스트 708개', en: 'pytest · golden tests · 708 tests' },
    },
    ],
  },
  fixes: [
    {
      title: { ko: '답이 "확인되지 않았습니다"로만 나오던 문제', en: 'Answers that only said "could not be confirmed"' },
      body: { ko: '계좌 기록을 읽는 경로에 따라 숫자가 AI에게 넘어가지 않던 근본 원인을 찾아 수정', en: 'Found and fixed the root cause: depending on how the account was read, numbers never reached the AI.' },
    },
    {
      title: { ko: '채팅 답이 느리던 문제', en: 'Slow chat answers' },
      body: { ko: '모델 교체, 자료 선택 단계의 추론 비활성화, 여러 자료 동시 조회로 대기 시간 단축', en: 'Switched models, turned off reasoning in the tool-picking step and had tools called together to cut the wait.' },
    },
    {
      title: { ko: '멀쩡한 답을 검사가 막던 문제', en: 'Guards blocking good answers' },
      body: { ko: '운영에서 막힌 사유를 집계해 가장 많던 원인(각주 위치 때문에 문장을 잘못 나누던 것) 수정', en: 'Counted why answers were blocked in production and fixed the top cause: sentences split wrongly around footnotes.' },
    },
    {
      title: { ko: '실험 결과가 오염되던 문제', en: 'A polluted experiment' },
      body: { ko: '실패한 응답이 캐시에 남아 A/B 실험 비교를 가리던 문제를 찾아, 실험 시 캐시를 건너뛰도록 변경', en: 'Failed responses left in the cache were hiding the A/B comparison; experiments now bypass the cache.' },
    },
  ],
  screens: [
    { src: `${F}/home-704.webp`, label: { ko: '홈', en: 'Home' } },
    { src: `${F}/briefing-704.webp`, label: { ko: '데일리 브리핑', en: 'Daily briefing' } },
    { src: `${F}/stock.webp`, video: `${F}/stock.mp4`, label: { ko: '종목 상세', en: 'Stock detail' } },
    { src: `${F}/stock-ai-704.webp`, label: { ko: 'AI 종목 분석', en: 'AI stock analysis' } },
    { src: `${F}/order-check.webp`, video: `${F}/order-check.mp4`, label: { ko: '주문 전 AI 점검', en: 'AI pre-order check' } },
    { src: `${F}/diagnosis-704.webp`, label: { ko: 'AI 포트폴리오 진단', en: 'AI portfolio diagnosis' } },
    { src: `${F}/returns-factor-704.webp`, label: { ko: '수익률 분석', en: 'Return analysis' } },
    { src: `${F}/chat-answer.webp`, video: `${F}/chat-answer.mp4`, label: { ko: 'AI 채팅', en: 'AI chat' } },
  ],
  stack: [
    { label: { ko: 'AI', en: 'AI' }, value: 'Python · FastAPI · OpenAI · PostgreSQL + pgvector' },
    { label: { ko: '백엔드', en: 'Backend' }, value: 'Spring Boot 4 · PostgreSQL · Redis' },
    { label: { ko: '프론트엔드', en: 'Frontend' }, value: 'React 19 · TypeScript · Vite · TanStack Query · PWA' },
    { label: { ko: '인프라', en: 'Infra' }, value: 'k3s · Helm · Cloudflare Tunnel' },
  ],
};

export const PROJECTS: Project[] = [
  { slug: 'algosu', name: { ko: '알고수', en: 'AlgoSu' }, image: null, summary: TBD },
  {
    slug: 'finch', name: { ko: 'FINCH', en: 'FINCH' }, image: `${F}/banner-1120.webp`,
    summary: { ko: '포트폴리오 기반 나만의 AI 투자 비서', en: 'A personal AI investing assistant built on your portfolio' },
    detail: FINCH,
  },
  { slug: 'janus', name: { ko: 'Janus', en: 'Janus' }, image: null, summary: TBD },
  { slug: 'pinlog', name: { ko: '핀로그', en: 'PinLog' }, image: null, summary: TBD },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
