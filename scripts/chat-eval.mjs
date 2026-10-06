// 챗봇 수용 테스트: content/profile/acceptance-tests.json의 질문을 로컬 API에 보내 답과 금지 표현을 본다(OpenAI 호출 비용 발생).
//   npm run dev 를 띄운 뒤:  node scripts/chat-eval.mjs [http://localhost:3001]
// 판정은 사람이 읽고 한다 — must_not 문구가 그대로 들어 있으면 FAIL로 표시만 한다.
import { readFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:3001';
const tests = JSON.parse(readFileSync(new URL('../content/profile/acceptance-tests.json', import.meta.url), 'utf8'));
let n = 0;
for (const t of tests) {
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    // 요청 제한(IP별 분당 5회)에 걸리지 않게 질문마다 다른 주소로
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.250.0.${++n}` },
    body: JSON.stringify({ locale: 'ko', messages: [{ role: 'user', content: t.question }] }),
  });
  let text = '', sources = [];
  for (const line of (await res.text()).split('\n').filter(Boolean)) {
    const e = JSON.parse(line);
    if (e.type === 'text') text += e.text; else if (e.type === 'sources') sources = e.items.map((s) => s.title);
  }
  const bad = (t.must_not ?? []).filter((m) => text.includes(m));
  console.log(`${bad.length ? 'FAIL' : '    '} ${res.status} Q: ${t.question}\n     기대: ${t.expected_behavior ?? t.expected_claim_ids?.join(', ')}\n     답: ${text}\n     출처: ${sources.join(', ') || '-'}${bad.length ? `\n     금지 표현: ${bad.join(', ')}` : ''}\n`);
}
