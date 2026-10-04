import type { Locale } from './i18n';

// 프로젝트는 코드로 관리한다 (자주 안 바뀜). 글은 posts.project에 이 slug로 연결된다.
// TODO(김세민): 소개 문구와 이미지 채우기 — 지금은 자리표시
type T = Record<Locale, string>;
type Item = { title: T; body: T };

// 프로젝트 페이지의 케이스 스터디(있는 프로젝트만). 출처는 각 프로젝트 저장소의 README.
// screens: 화면 캡처. video가 있으면 움직이는 화면(mp4, src는 첫 장면 — 움직임 줄이기 설정이면 이것만 보임)
export type ProjectDetail = {
  banner: string;
  facts: { label: T; value: T }[];
  links: { label: T; href: string }[];
  problem: T;
  answers: Item[];
  mine: { intro: T; items: Item[] };
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
    { label: { ko: '맡은 일', en: 'My role' }, value: { ko: 'AI 서버 (finch-ai 커밋의 75%)', en: 'AI server (75% of finch-ai commits)' } },
    { label: { ko: '규모', en: 'Scale' }, value: { ko: '커밋 1,400+ · 자동화 테스트 1,300+', en: '1,400+ commits · 1,300+ automated tests' } },
    { label: { ko: '운영', en: 'Running' }, value: { ko: '실서비스 배포 (k3s, Cloudflare Tunnel, 설치형 PWA)', en: 'Live service (k3s, Cloudflare Tunnel, installable PWA)' } },
  ],
  links: [
    { label: { ko: '서비스', en: 'Live service' }, href: 'https://finchapp.org' },
    { label: { ko: '시연 영상', en: 'Demo video' }, href: 'https://youtu.be/4Cbu0-vMve4' },
    { label: { ko: 'GitHub', en: 'GitHub' }, href: 'https://github.com/Team-FINCH/finch-docs' },
  ],
  problem: {
    ko: '주식 앱은 "얼마가 됐는지"는 보여 주지만 "왜 그렇게 됐는지"는 알려 주지 않습니다. 그렇다고 LLM에게 그냥 물으면 숫자를 지어내고 투자를 권유합니다. 금융 서비스에서는 둘 다 치명적입니다.',
    en: 'Stock apps show how much you made or lost, but not why. Asking an LLM directly is worse: it makes up numbers and gives investment advice. In a financial service, both are fatal.',
  },
  answers: [
    {
      title: { ko: 'AI는 숫자를 쓰지 않습니다', en: 'The AI never writes numbers' },
      body: { ko: '수익률·비중·손익은 계산 엔진이 만들고, AI는 자리표시자로만 문장을 씁니다. 서버가 엔진 값으로 바꿔 넣습니다.', en: 'Returns, weights and P&L come from a calculation engine. The AI writes sentences with placeholders only, and the server fills in the engine values.' },
    },
    {
      title: { ko: '내보내기 전에 10가지 자동 검사', en: 'Ten automatic checks before anything ships' },
      body: { ko: '지어낸 숫자, 근거 없는 인용, 인과 단정, 매수·매도 권유를 잡아 다시 만들거나 막습니다. 틀린 답을 내느니 답하지 않습니다.', en: 'Made-up numbers, unsupported citations, causal claims and buy/sell advice are caught and regenerated or blocked. No answer beats a wrong one.' },
    },
    {
      title: { ko: 'AI는 돈을 움직일 수 없습니다', en: 'The AI cannot move money' },
      body: { ko: '원장은 백엔드만 쓰고, AI는 읽기 전용 내부 API로만 접근합니다. 잔고를 바꾸는 경로가 구조적으로 없습니다.', en: 'Only the backend writes the ledger; the AI reads it through a read-only internal API. There is no path for it to change a balance.' },
    },
    {
      title: { ko: '모든 설명에 근거', en: 'Every explanation cites its source' },
      body: { ko: '뉴스·공시를 매일 모아 검색하고, 답변마다 출처 각주를 답니다.', en: 'News and filings are collected daily and searched, and every answer carries source footnotes.' },
    },
  ],
  mine: {
    intro: {
      ko: '금융 LLM의 두 가지 실패, 숫자를 지어내는 것과 투자를 권유하는 것을 프롬프트가 아니라 구조로 막는 AI 서버(FastAPI)를 맡았습니다.',
      en: 'I built the AI server (FastAPI) that blocks the two failures of a financial LLM, invented numbers and investment advice, by structure rather than by prompt.',
    },
    items: [
      {
        title: { ko: '숫자 대신 자리표시자', en: 'Placeholders instead of numbers' },
        body: { ko: 'LLM은 허용된 키 목록 안에서 "삼성전자는 {{return_005930}} 올랐습니다"처럼 쓰고, 서버가 엔진 값 +2.48%로 바꿉니다. 응답은 글자와 수치 조각으로 나뉘어 나가 화면이 수치만 따로 강조할 수 있습니다.', en: 'The LLM writes "Samsung rose {{return_005930}}" from an allowed key list and the server swaps in the engine value, +2.48%. Responses go out as text and number segments so the app can highlight the numbers.' },
      },
      {
        title: { ko: '출력 검사 10종', en: 'Ten output guards' },
        body: { ko: '날것의 숫자, 엔진과 다른 값, 없는 각주, 금지 표현, 길이·스키마 위반을 검사합니다. 위반하면 사유를 붙여 다시 만들고, 또 실패하면 막습니다.', en: 'Raw numbers, values that differ from the engine, missing footnotes, banned phrases and length/schema violations are checked. A violation is regenerated with the reason attached, then blocked if it fails again.' },
      },
      {
        title: { ko: '도구를 고르는 채팅 에이전트', en: 'A chat agent that picks its tools' },
        body: { ko: '"오늘 내 주식 왜 떨어졌어?"에 포트폴리오·수익률 분해·시세·뉴스·공시 도구를 골라 부릅니다. 최대 3턴·12호출로 묶고, 작업 큐(SKIP LOCKED)로 오래 걸리는 답을 처리합니다.', en: 'For "why did my stocks drop today?" it calls portfolio, return attribution, quote, news and filing tools, capped at 3 turns and 12 calls, with long answers handled by a job queue (SKIP LOCKED).' },
      },
      {
        title: { ko: '근거 수집과 검색', en: 'Collecting and searching sources' },
        body: { ko: '뉴스·공시·시세를 정해진 시각에 모아 임베딩하고, pgvector와 어휘 검색을 RRF로 섞어 찾습니다. 매일 아침 데일리 브리핑도 여기서 만듭니다.', en: 'News, filings and prices are collected on a schedule and embedded, then searched by fusing pgvector and lexical results with RRF. The morning daily briefing is built here too.' },
      },
      {
        title: { ko: '테스트 708개', en: '708 tests' },
        body: { ko: '검사 규칙과 치환, 도구 호출을 자동화 테스트로 고정했습니다.', en: 'Guard rules, substitution and tool calls are pinned down by automated tests.' },
      },
    ],
  },
  screens: [
    { src: `${F}/home.webp`, label: { ko: '홈', en: 'Home' } },
    { src: `${F}/briefing.webp`, label: { ko: '데일리 브리핑', en: 'Daily briefing' } },
    { src: `${F}/stock.webp`, video: `${F}/stock.mp4`, label: { ko: '종목 상세', en: 'Stock detail' } },
    { src: `${F}/stock-ai.webp`, label: { ko: 'AI 종목 분석', en: 'AI stock analysis' } },
    { src: `${F}/order-check.webp`, video: `${F}/order-check.mp4`, label: { ko: '주문 전 AI 점검', en: 'AI pre-order check' } },
    { src: `${F}/diagnosis.webp`, label: { ko: 'AI 포트폴리오 진단', en: 'AI portfolio diagnosis' } },
    { src: `${F}/returns-factor.webp`, label: { ko: '수익률 분석', en: 'Return analysis' } },
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
    summary: { ko: '내 계좌를 읽고, 숫자로 설명하는 AI 투자 비서', en: 'An AI investing assistant that reads your account and explains it with real numbers' },
    detail: FINCH,
  },
  { slug: 'janus', name: { ko: 'Janus', en: 'Janus' }, image: null, summary: TBD },
  { slug: 'pinlog', name: { ko: '핀로그', en: 'PinLog' }, image: null, summary: TBD },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
