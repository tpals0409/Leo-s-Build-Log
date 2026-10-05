import type { DiagramKey } from './diagrams';
import type { Locale } from './i18n';

// 프로젝트는 코드로 관리한다 (자주 안 바뀜). 글은 posts.project에 이 slug로 연결된다.
type T = Record<Locale, string>;
type Item = { title: T; body: T; tech?: T }; // title·body는 쉬운 말, tech는 개발자용 세부(작게)

// 프로젝트 페이지의 케이스 스터디(있는 프로젝트만). 출처는 각 프로젝트 저장소의 README.
// screens: 화면 캡처. video가 있으면 움직이는 화면(mp4, src는 첫 장면 — 움직임 줄이기 설정이면 이것만 보임)
export type ProjectDetail = {
  banner: T; // 언어별 배너(2:1)
  // 프로젝트 색: 배너 디자인(형광펜 띠 tint, 강조 글자 deep)과 같은 값. 아키텍처·시나리오 그림의 강조 노드에 쓴다
  accent: { tint: string; deep: string };
  device: 'phone' | 'desktop'; // 화면 캡처 종류 (ScreenGallery)
  facts: { label: T; value: T }[];
  links: { label: T; href: string }[];
  problem: T;
  answers: Item[];
  mine: Item[];
  fixes: Item[];
  screens: { src: string; video?: string; label: T; size?: [number, number] }[]; // size: PC 캡처(16:9 + 맥 창 테두리)의 픽셀 크기
  // 포트폴리오(PDF)와 같은 그림·문구. 그림은 lib/diagrams.ts 데이터를 FlowDiagram이 그린다, notes는 그림 옆 ❶❷❸ 설명
  architecture: { diagram: DiagramKey; notes: Item[] };
  scenario: { diagram: DiagramKey; notes: Item[] };
  tech: { name: string; problem: T; role: T }[]; // 기술 사용 이유 — 직접 맡은 부분만
};

// image: 카드 썸네일(언어별)
export type Project = { slug: string; name: T; image: T | null; summary: T; detail?: ProjectDetail };


const F = '/projects/finch';

const FINCH: ProjectDetail = {
  banner: { ko: `${F}/banner-v3-2240.webp`, en: `${F}/banner-en-2240.webp` },
  accent: { tint: '#F2CF5B', deep: '#9A6A00' },
  device: 'phone',
  facts: [
    { label: { ko: '기간', en: 'Period' }, value: { ko: '2026.08 – 2026.09 (6주)', en: 'Aug – Sep 2026 (6 weeks)' } },
    { label: { ko: '팀', en: 'Team' }, value: { ko: '5명', en: '5 people' } },
    { label: { ko: '역할', en: 'Role' }, value: { ko: 'AI 파트 리드', en: 'AI lead' } },
  ],
  links: [
    { label: { ko: '데모', en: 'Demo' }, href: 'https://finchapp.org' },
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
  mine: [
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
    { src: `${F}/stock-v2.webp`, video: `${F}/stock-v2.mp4`, label: { ko: '종목 상세', en: 'Stock detail' } },
    { src: `${F}/stock-ai-704.webp`, label: { ko: 'AI 종목 분석', en: 'AI stock analysis' } },
    { src: `${F}/order-check-v2.webp`, video: `${F}/order-check-v2.mp4`, label: { ko: '주문 전 AI 점검', en: 'AI pre-order check' } },
    { src: `${F}/diagnosis-704.webp`, label: { ko: 'AI 포트폴리오 진단', en: 'AI portfolio diagnosis' } },
    { src: `${F}/returns-factor-704.webp`, label: { ko: '수익률 분석', en: 'Return analysis' } },
    { src: `${F}/chat-answer-v2.webp`, video: `${F}/chat-answer-v2.mp4`, label: { ko: 'AI 채팅', en: 'AI chat' } },
  ],
  architecture: {
    diagram: 'finch-arch',
    notes: [
      { title: { ko: '책임 분리', en: 'Separation of duties' }, body: { ko: '수치·위험 판정 = Kotlin 엔진, 설명 = LLM', en: 'Numbers and risk calls = Kotlin engine; explanation = LLM' } },
      { title: { ko: '원장 단일화', en: 'Single ledger' }, body: { ko: '잔고·손익은 충전·체결 기록에서만 계산', en: 'Balances and P&L are computed only from deposit and trade records' } },
      { title: { ko: '데이터 수집', en: 'Data collection' }, body: { ko: '보유·관심·최근 조회 종목 중심으로 호출량 관리', en: 'Calls focused on held, watched and recently viewed stocks' } },
    ],
  },
  scenario: {
    diagram: 'finch-scenario',
    notes: [
      { title: { ko: '사용자 흐름', en: 'User flow' }, body: { ko: '가입 → 탐색 → 모의 매매 → 포트폴리오 → AI 질문', en: 'Sign up → explore → paper trading → portfolio → ask the AI' } },
      { title: { ko: '시스템 흐름', en: 'System flow' }, body: { ko: '시세 수집 → 원장 기록 → 계산 엔진 → LLM 설명', en: 'Price collection → ledger → calculation engine → LLM explanation' } },
      { title: { ko: '책임 분리', en: 'Separation of duties' }, body: { ko: '수치·위험 판정은 엔진, 설명은 LLM — AI는 원장을 바꾸지 않음', en: 'The engine decides numbers and risk, the LLM explains — the AI never changes the ledger' } },
    ],
  },
  tech: [
    { name: 'numpy · pandas', problem: { ko: 'LLM이 생성한 금융 수치의 오류', en: 'Errors in financial figures generated by the LLM' }, role: { ko: '수익률·위험 판정을 결정론 계산으로 고정', en: 'Returns and risk calls fixed by deterministic computation' } },
    { name: 'LLM API', problem: { ko: '요청마다 전체 프롬프트 재전송 비용', en: 'Cost of resending the full prompt on every request' }, role: { ko: '고정 구간 캐시, 설명만 생성', en: 'Cached fixed prefix; only the explanation is generated' } },
    { name: 'FastAPI', problem: { ko: 'AI 서버 외부 노출 시 인증 경계 훼손', en: 'Exposing the AI server would break the auth boundary' }, role: { ko: '백엔드 뒤 내부 호출 전용', en: 'Internal calls only, behind the backend' } },
    { name: 'PostgreSQL', problem: { ko: '시세·종목 데이터의 백엔드 의존', en: 'Price and stock data depended on the backend' }, role: { ko: 'AI 파트 소유 DB에 직접 적재', en: 'Loaded directly into a DB owned by the AI part' } },
    { name: 'pydantic-settings', problem: { ko: '백엔드 원장 API 완성 전 개발 정체', en: 'Development blocked until the backend ledger API was ready' }, role: { ko: '설정값 하나로 시드·백엔드 원장 출처 전환', en: 'One setting switches between seed data and the backend ledger' } },
  ],
};

const A = '/projects/algosu';

// 출처: tpals0409/AlgoSu README. 화면은 algo-su.com 데모(읽기 전용, 라이트 모드)에서 캡처 — 데모 안내 띠와 깨진 데모 아바타는 가림
const ALGOSU: ProjectDetail = {
  banner: { ko: `${A}/banner-2240.webp`, en: `${A}/banner-en-2240.webp` },
  accent: { tint: '#C9BEEA', deep: '#6A55A8' },
  device: 'desktop',
  facts: [
    { label: { ko: '기간', en: 'Period' }, value: { ko: '2026.02 – 현재 (운영 중)', en: 'Feb 2026 – present (live)' } },
    { label: { ko: '팀', en: 'Team' }, value: { ko: '1인 개발', en: 'Solo' } },
    { label: { ko: '역할', en: 'Role' }, value: { ko: '기획 · 설계 · 프론트엔드 · 백엔드 · 인프라 · 운영', en: 'Planning · design · frontend · backend · infra · operations' } },
  ],
  links: [
    { label: { ko: '서비스', en: 'Live service' }, href: 'https://algo-su.com' },
    { label: { ko: '데모', en: 'Demo' }, href: 'https://algo-su.com/login' },
    { label: { ko: 'GitHub', en: 'GitHub' }, href: 'https://github.com/tpals0409/AlgoSu' },
  ],
  problem: {
    ko: '알고리즘 스터디의 문제 관리, 코드 제출, 풀이 기록, 코드 리뷰를 한곳에서 이어 주는 도구가 필요했음. 혼자 기획부터 운영까지 맡으면서, AI 에이전트가 만든 코드를 믿고 배포할 수 있는 개발 방식도 함께 풀어야 했음.',
    en: 'An algorithm study group needed one place for problems, code submissions, solution history and code review. Building and running it alone also meant finding a way to ship AI-agent-written code with confidence.',
  },
  answers: [
    {
      title: { ko: '제출부터 AI 분석까지 한 흐름', en: 'One flow from submission to AI review' },
      body: { ko: '코드를 제출하면 GitHub 저장과 Claude 코드 분석이 이어서 처리되고, 진행 상태를 실시간으로 확인', en: 'A submission is saved to GitHub and reviewed by Claude in sequence, with progress shown live.' },
    },
    {
      title: { ko: '오래 걸리는 작업은 비동기로', en: 'Slow work runs asynchronously' },
      body: { ko: 'GitHub 저장과 AI 분석을 큐로 분리하고, 제출 상태는 Saga로 관리해 지연·실패 시 재시도·복구', en: 'GitHub saves and AI analysis run off a queue, and a saga tracks each submission so delays and failures are retried and recovered.' },
    },
    {
      title: { ko: '스터디룸에서 함께 리뷰', en: 'Reviewing together in the study room' },
      body: { ko: '문제별로 멤버의 제출 코드와 AI 점수를 모아 보고, 스터디 노트를 공유', en: 'Each problem gathers members\' code and AI scores, with a shared study note.' },
    },
  ],
  mine: [
      {
        title: { ko: '서비스 경계 설계', en: 'Service boundaries' },
        body: { ko: 'Gateway·Identity·Problem·Submission 서비스와 GitHub·AI 워커로 책임을 나누고, 서비스별 DB로 데이터 소유권 분리', en: 'Gateway, Identity, Problem and Submission services plus GitHub and AI workers, each service owning its own database.' },
        tech: { ko: 'Next.js · NestJS · TypeORM · FastAPI · PostgreSQL · RabbitMQ · Redis', en: 'Next.js · NestJS · TypeORM · FastAPI · PostgreSQL · RabbitMQ · Redis' },
      },
      {
        title: { ko: '제출 Saga와 실시간 상태', en: 'Submission saga and live status' },
        body: { ko: '제출 → GitHub 저장 → AI 분석의 상태 전이·타임아웃·재시도 설계, 진행 상태를 Redis와 SSE로 전달', en: 'State transitions, timeouts and retries for submit → GitHub save → AI analysis, with progress pushed over Redis and SSE.' },
        tech: { ko: 'Saga · RabbitMQ · Redis 이벤트 · SSE · GitHub App · Claude API', en: 'Saga · RabbitMQ · Redis events · SSE · GitHub App · Claude API' },
      },
      {
        title: { ko: 'AI 에이전트 역할 분담', en: 'Role-based AI agents' },
        body: { ko: 'Gateway 보안, 제출 흐름, DB 스키마처럼 영역을 나눠 에이전트별 맥락을 좁히고, 설계 판단과 AI 구현을 구분해 기록', en: 'Work split by area (gateway security, submission flow, DB schema) to keep each agent\'s context narrow, with design decisions recorded apart from AI implementation.' },
        tech: { ko: 'ADR · 개발 기록', en: 'ADRs · dev log' },
      },
      {
        title: { ko: 'AI 생성 코드 검증과 배포', en: 'Verifying and shipping AI-written code' },
        body: { ko: '린트·타입 검사·테스트·보안 검사를 CI에 넣고, 이미지를 GitOps로 k3s에 배포. 운영 상태는 지표로 확인', en: 'Lint, type checks, tests and security scans in CI, images shipped to k3s through GitOps, and operations watched through metrics.' },
        tech: { ko: 'GitHub Actions · GHCR · Argo CD · k3s · Prometheus · Grafana', en: 'GitHub Actions · GHCR · Argo CD · k3s · Prometheus · Grafana' },
      },
  ],
  fixes: [
    {
      title: { ko: '새 버전 롤아웃이 멈춘 문제', en: 'A stuck rollout' },
      body: { ko: '헬스 체크 회귀와 환경변수 누락으로 새 버전이 뜨지 않았지만 기존 Pod가 응답해 드러나지 않던 문제. 헬스 체크와 설정을 고치고 SealedSecret을 다시 봉인해 복구', en: 'A health-check regression and a missing env var kept the new version from starting, hidden because old pods still answered. Fixed the check and config and resealed the SealedSecret.' },
    },
    {
      title: { ko: 'Gateway가 Identity DB에 직접 접근하던 문제', en: 'Gateway reading the Identity DB directly' },
      body: { ko: 'Identity API 호출로 옮겨 서비스 경계를 구현에 반영. 내부 HTTP 호출과 장애 의존성이 늘어나는 비용도 함께 검토', en: 'Moved to Identity API calls so the boundary holds in code, weighing the added internal HTTP calls and failure coupling.' },
    },
  ],
  screens: [
    { src: `${A}/dashboard-mac.webp`, label: { ko: '대시보드', en: 'Dashboard' }, size: [1920, 1148] },
    { src: `${A}/problems-mac.webp`, label: { ko: '문제 목록', en: 'Problems' }, size: [1920, 1148] },
    { src: `${A}/room-mac.webp`, label: { ko: '스터디룸', en: 'Study room' }, size: [1920, 1148] },
    { src: `${A}/room-problem-mac.webp`, label: { ko: '멤버별 제출', en: 'Submissions by member' }, size: [1920, 1148] },
    { src: `${A}/submission-mac.webp`, label: { ko: '코드와 AI 분석', en: 'Code and AI review' }, size: [1920, 1148] },
    { src: `${A}/analytics-mac.webp`, label: { ko: '통계', en: 'Analytics' }, size: [1920, 1148] },
  ],
  architecture: {
    diagram: 'algosu-arch',
    notes: [
      { title: { ko: '서비스 경계', en: 'Service boundaries' }, body: { ko: 'Identity·Problem·Submission이 각자 DB를 소유', en: 'Identity, Problem and Submission each own their database' } },
      { title: { ko: '비동기 분리', en: 'Async split' }, body: { ko: 'GitHub Worker·AI Analysis는 큐 소비자', en: 'GitHub Worker and AI Analysis consume from the queue' } },
      { title: { ko: '상태 전달', en: 'Status delivery' }, body: { ko: 'Submission → Redis 이벤트 → Gateway → SSE', en: 'Submission → Redis event → Gateway → SSE' } },
    ],
  },
  scenario: {
    diagram: 'algosu-scenario',
    notes: [
      { title: { ko: '사용자 흐름', en: 'User flow' }, body: { ko: '문제 선택 → 제출 → 진행 상태 → 피드백 → 대시보드', en: 'Pick a problem → submit → progress → feedback → dashboard' } },
      { title: { ko: '시스템 흐름', en: 'System flow' }, body: { ko: '저장 → 큐 발행 → GitHub 커밋 → AI 분석 → SSE', en: 'Save → publish to queue → GitHub commit → AI analysis → SSE' } },
      { title: { ko: '실패 경로', en: 'Failure path' }, body: { ko: 'DLQ 보존 · 재시작 시 미완료 Saga 재개', en: 'Kept in the DLQ; unfinished sagas resume on restart' } },
    ],
  },
  tech: [
    { name: 'Saga Pattern · 상태 머신', problem: { ko: '여러 서비스에 걸친 제출 처리의 실패 지점 추적 불가', en: 'No way to tell where a multi-service submission failed' }, role: { ko: '6단계 상태로 진행·실패 관리, 재시작 시 미완료 작업 재개', en: 'Six states track progress and failure; unfinished work resumes on restart' } },
    { name: 'RabbitMQ · DLQ', problem: { ko: '처리 시간이 다른 GitHub·AI 작업의 동기 결합', en: 'GitHub and AI work with very different durations coupled synchronously' }, role: { ko: '비동기 분리, 반복 실패 메시지 보관', en: 'Async split; repeatedly failing messages are kept' } },
    { name: 'Redis Pub/Sub · SSE', problem: { ko: '제출·분석 상태의 실시간 전달', en: 'Delivering submission and analysis status in real time' }, role: { ko: '서버 푸시, 공유 subscriber로 커넥션 고갈 방지', en: 'Server push, with a shared subscriber to avoid exhausting connections' } },
    { name: 'NestJS · PostgreSQL', problem: { ko: '서비스 간 책임과 데이터 소유권 혼재', en: 'Responsibilities and data ownership mixed across services' }, role: { ko: '서비스 분리, 서비스별 DB 소유', en: 'Separate services, each owning its database' } },
    { name: 'k3s · ArgoCD · GitHub Actions', problem: { ko: '단일 ARM VM에 여러 서비스 운영', en: 'Running many services on a single ARM VM' }, role: { ko: '경량 클러스터, GitOps 배포, 변경 서비스만 검사·빌드', en: 'Lightweight cluster, GitOps deploys, only changed services checked and built' } },
    { name: 'Prometheus · Grafana · Loki · Structured Logging', problem: { ko: '자원 설정과 간헐 오류의 근거 부재', en: 'No evidence for resource settings or intermittent errors' }, role: { ko: '지표로 커넥션 풀·자원 조정, 구조화 로그로 오류 경로 추적', en: 'Metrics to tune connection pools and resources, structured logs to trace errors' } },
  ],
};

const J = '/projects/janus';

// 출처: tpals0409/Janus README·V1_AUDIT.md. 화면은 로컬 앱(v1.0.30, 라이트 모드)의 janus-qa-fixture 프로젝트에서 캡처
const JANUS: ProjectDetail = {
  banner: { ko: `${J}/banner-v4-2240.webp`, en: `${J}/banner-en-v3-2240.webp` },
  accent: { tint: '#BFE3CC', deep: '#23794A' },
  device: 'desktop',
  facts: [
    { label: { ko: '기간', en: 'Period' }, value: { ko: '2026.08 – 현재 (개발 중)', en: 'Aug 2026 – present' } },
    { label: { ko: '팀', en: 'Team' }, value: { ko: '1인 개발', en: 'Solo' } },
    { label: { ko: '역할', en: 'Role' }, value: { ko: '기획 · 설계 · 데스크톱 앱 · 백엔드 · 로컬 추론', en: 'Planning · design · desktop app · backend · local inference' } },
  ],
  links: [
    { label: { ko: 'GitHub', en: 'GitHub' }, href: 'https://github.com/tpals0409/Janus' },
  ],
  problem: {
    ko: '코딩 에이전트가 답변을 마쳐도 파일 변경 확인, 테스트, 리뷰, 커밋이 남음. 로컬 컴퓨터의 제한된 자원으로 검증된 작업 결과를 얼마나 얻을 수 있는지가 출발점.',
    en: 'When a coding agent finishes answering, checking the changes, testing, reviewing and committing are still left. The starting question: how much verified work can limited local hardware produce?',
  },
  answers: [
    {
      title: { ko: 'Task 하나에 작업 맥락을 모음', en: 'One Task holds the whole context' },
      body: { ko: '대화·터미널·에디터·미리보기·리뷰를 Task에 모으고, 실행 중·입력 필요·실패·리뷰 대기 상태를 구분', en: 'Chat, terminal, editor, preview and review live in one Task, with running, needs-input, failed and awaiting-review kept apart.' },
    },
    {
      title: { ko: '로컬 모델과 구독형 CLI', en: 'Local model or your existing CLI' },
      body: { ko: 'MLX 로컬 모델(Qwen 27B 4-bit)이 기본이고, 이미 로그인한 Claude Code·Codex CLI도 실행기로 선택', en: 'A local MLX model (Qwen 27B 4-bit) by default, or an already signed-in Claude Code or Codex CLI as the runner.' },
    },
    {
      title: { ko: '검증한 변경만 커밋', en: 'Only verified changes are committed' },
      body: { ko: 'Git diff를 기준으로 검증과 리뷰를 거쳐 커밋하고, 선택적으로 gh CLI로 push·PR까지 연결', en: 'Changes are verified and reviewed against the Git diff before commit, optionally continuing to push and PR through gh.' },
    },
  ],
  mine: [
      {
        title: { ko: '예산을 건 위임', en: 'Delegation with a budget' },
        body: { ko: '오케스트레이터가 하위 작업을 worker에 맡기되 worker 수와 시간·토큰·단계 예산을 제한하고, AgentProfile로 쓸 도구를 정함', en: 'The orchestrator hands sub-tasks to workers under caps on worker count, time, tokens and steps, with AgentProfiles deciding the tools.' },
        tech: { ko: '오케스트레이터 · worker · AgentProfile · 자원 스케줄러', en: 'Orchestrator · workers · AgentProfile · resource scheduler' },
      },
      {
        title: { ko: '생성과 검증의 대기 분리', en: 'Generation and verification overlap' },
        body: { ko: '로컬 모델의 생성 슬롯과 도구·검증 작업을 따로 관리해, 생성을 기다리는 동안 할 수 있는 검증을 겹쳐 실행', en: 'Model generation slots and tool/verification work are scheduled separately, so verification runs while generation waits.' },
        tech: { ko: 'MLX · 생성 슬롯 · 큐 우선순위 · 시간·토큰 상한', en: 'MLX · generation slots · queue priority · time and token caps' },
      },
      {
        title: { ko: '상태를 나눠 기록', en: 'Separate states, honestly reported' },
        body: { ko: '실행 종료, 검증 완료, 리뷰 수락, 커밋·push 성공을 서로 다른 상태로 다루고, push 전 Janus가 기록한 커밋과 HEAD 일치를 확인', en: 'Run finished, verified, review accepted and committed/pushed are distinct states, and a push requires the recorded commit to match HEAD.' },
        tech: { ko: 'Git diff · revision 단위 리뷰 · SHA 확인 · gh CLI', en: 'Git diff · per-revision review · SHA check · gh CLI' },
      },
      {
        title: { ko: '실행 경로별 권한 경계', en: 'Permission boundaries per runner' },
        body: { ko: '로컬 모델과 Claude Code 경로는 Janus의 도구 승인 흐름을 쓰고, 경로마다 다른 통제 범위를 문서로 공개', en: 'The local and Claude Code paths go through Janus\'s tool approvals, and each runner\'s limits are documented openly.' },
        tech: { ko: 'MCP · 기본 거부 승인 · HTTP/WS 토큰·Origin 검사', en: 'MCP · default-deny approvals · HTTP/WS token and Origin checks' },
      },
      {
        title: { ko: '문서와 코드 일치 검사', en: 'Docs checked against code' },
        body: { ko: '설계 문서가 현재 기능을 보장하는 것처럼 읽히지 않도록 주요 설명을 코드와 대조하는 테스트를 CI에 둠', en: 'A CI test compares key claims in the docs with the code, so old design notes never read as current features.' },
        tech: { ko: 'pytest · TypeScript 검사 · 번들 크기 · 의존성 감사 · macOS 패키징 CI', en: 'pytest · TypeScript checks · bundle size · dependency audit · macOS packaging CI' },
      },
  ],
  fixes: [
    {
      title: { ko: 'worker 효율 개선', en: 'Worker efficiency' },
      body: { ko: '같은 고정 worker 정책에서 수용 검증 통과 14/15를 유지하며 소요 시간 109.9초 → 88.1초, 프롬프트 토큰 14,855 → 10,993으로 감소 (2026-08-23 v1 감사)', en: 'Under the same fixed-worker policy, acceptance held at 14/15 while wall time fell from 109.9 s to 88.1 s and prompt tokens from 14,855 to 10,993 (v1 audit, 2026-08-23).' },
    },
    {
      title: { ko: '실제 27B 모델로 반복 검증', en: 'Repeated runs on the real 27B model' },
      body: { ko: 'TaskSuite 45회 중 44회 수용 검증 통과, 281회 복구 반복 후 일시 상태 잔여 0과 SQLite 무결성 확인', en: '44 of 45 TaskSuite runs passed acceptance, and a 281-cycle recovery soak left zero transient state with SQLite integrity intact.' },
    },
    {
      title: { ko: '중단된 작업을 성공으로 표시하지 않기', en: 'Interrupted work never shows as done' },
      body: { ko: '앱이 다시 시작되면 이전 작업을 중단 상태로 복구하고, 작업 데이터 백업·복원과 민감정보를 뺀 진단 묶음 제공', en: 'After a restart, unfinished work is restored as interrupted, with backup/restore and a redacted diagnostics bundle.' },
    },
  ],
  screens: [
    { src: `${J}/task-dark.webp`, label: { ko: '작업과 하위 에이전트', en: 'Task and sub-agents' }, size: [1920, 1148] },
    { src: `${J}/editor-dark.webp`, label: { ko: '코드 편집기', en: 'Code editor' }, size: [1920, 1148] },
    { src: `${J}/worker-dark.webp`, label: { ko: '워커 상세', en: 'Worker detail' }, size: [1920, 1148] },
    { src: `${J}/model-dark.webp`, label: { ko: '실행 모델 선택', en: 'Choosing the runner' }, size: [1920, 1148] },
    { src: `${J}/today-dark.webp`, label: { ko: '사람을 기다리는 작업', en: 'Tasks waiting on you' }, size: [1920, 1148] },
    { src: `${J}/agents-dark.webp`, label: { ko: '에이전트 대시보드', en: 'Agent dashboard' }, size: [1920, 1148] },
  ],
  architecture: {
    diagram: 'janus-arch',
    notes: [
      { title: { ko: '로컬 우선', en: 'Local first' }, body: { ko: 'MLX 로컬 모델(Qwen 27B 4-bit)로 기기 내 추론', en: 'On-device inference with a local MLX model (Qwen 27B 4-bit)' } },
      { title: { ko: '자원 제한', en: 'Resource limits' }, body: { ko: 'worker 수와 시간·토큰·단계 예산을 제한', en: 'Caps on worker count and time, token and step budgets' } },
      { title: { ko: '상태 구분', en: 'Distinct states' }, body: { ko: '실행 종료 ≠ 검증 완료 ≠ 리뷰 수락 ≠ 커밋 성공', en: 'Run finished ≠ verified ≠ review accepted ≠ committed' } },
    ],
  },
  scenario: {
    diagram: 'janus-scenario',
    notes: [
      { title: { ko: '사용자 흐름', en: 'User flow' }, body: { ko: 'Task → 실행기 → 도구 승인 → diff·검증 → 리뷰 수락', en: 'Task → runner → tool approval → diff and verification → accept review' } },
      { title: { ko: '시스템 흐름', en: 'System flow' }, body: { ko: '에이전트 실행 → 도구 실행 → Git diff·테스트 → 커밋', en: 'Agent run → tool execution → Git diff and tests → commit' } },
      { title: { ko: '상태 구분', en: 'Distinct states' }, body: { ko: '답변 완료 ≠ 작업 성공 — 검증 실패 시 재실행', en: 'A finished answer ≠ a successful task — rerun when verification fails' } },
    ],
  },
  tech: [
    { name: '로컬 LLM · MLX', problem: { ko: '코드·작업 맥락의 외부 반출 금지', en: 'Code and task context must not leave the machine' }, role: { ko: '기기 내 추론으로 Agent 실행', en: 'Agents run on on-device inference' } },
    { name: 'Python', problem: { ko: '워커의 쓰기 권한·자원 사용 무제한', en: 'Workers with unlimited write access and resources' }, role: { ko: '읽기 전용 강제, 워커별 단계·토큰·시간 예산', en: 'Read-only enforced; per-worker step, token and time budgets' } },
    { name: 'Git', problem: { ko: '변경 출처 불분명, 답변 완료 ≠ 작업 성공', en: 'Unclear origin of changes; a finished answer is not a finished task' }, role: { ko: 'diff·브랜치를 변경 기준으로, 검증 결과를 완료 기준으로', en: 'Diff and branch define the change; verification defines done' } },
    { name: 'FastAPI · SQLite', problem: { ko: '로컬 실행과 화면의 연결, Task 상태 보존', en: 'Connecting local execution to the UI and keeping Task state' }, role: { ko: '로컬 API 연결, Task·세션 기록 저장', en: 'Local API plus stored Task and session records' } },
    { name: 'Electron · React · TypeScript', problem: { ko: '대화·터미널·에디터·리뷰의 분산', en: 'Chat, terminal, editor and review scattered across tools' }, role: { ko: '한 화면에서 변경·검증·리뷰·커밋 상태 표시', en: 'Changes, verification, review and commit state on one screen' } },
  ],
};

const P = '/projects/pinlog';

// 화면·소개 출처: 팀 저장소(Team-PinLog)와 프론트엔드 담당 팀원의 케이스 스터디. 인프라(본인 몫)는 Team-PinLog/infra README
const PINLOG: ProjectDetail = {
  banner: { ko: `${P}/banner-2240.webp`, en: `${P}/banner-en-2240.webp` },
  accent: { tint: '#9FDCCB', deep: '#1E8A73' },
  device: 'desktop',
  facts: [
    { label: { ko: '기간', en: 'Period' }, value: { ko: '2026.07 – 2026.08 (5주)', en: 'Jul – Aug 2026 (5 weeks)' } },
    { label: { ko: '팀', en: 'Team' }, value: { ko: '6명', en: '6 people' } },
    { label: { ko: '역할', en: 'Role' }, value: { ko: '인프라 리드', en: 'Infra lead' } },
  ],
  links: [
    { label: { ko: '시연 영상', en: 'Demo video' }, href: 'https://youtu.be/lD5MbHL9TZ8' },
    { label: { ko: 'GitHub', en: 'GitHub' }, href: 'https://github.com/Team-PinLog/infra' },
  ],
  problem: {
    ko: '장소를 저장해도 이름이 떠오르지 않으면 다시 찾기 어렵고, 저장한 이유와 경험은 남지 않음. 인프라는 클라우드 권한 없이 주어진 서버 한 대 위에서 여러 서비스를 배포·운영해야 했음.',
    en: 'Saved places are hard to find again once you forget the name, and why you saved them is lost. On the infra side, several services had to be deployed and run on a single given server without cloud API access.',
  },
  answers: [
    {
      title: { ko: '저장한 맥락을 자연어로 검색', en: 'Natural-language search over your own context' },
      body: { ko: '장소와 함께 저장한 이유·경험을 기록하고, 장소 이름 대신 문장으로 다시 찾음', en: 'Places are saved with the reason and experience behind them, and found again by a sentence instead of a name.' },
    },
    {
      title: { ko: '익명 컬렉션으로 발견', en: 'Discovery through anonymous collections' },
      body: { ko: '신원과 맥락 원문을 드러내지 않는 공개 컬렉션에서 다른 사람의 취향을 발견하고, 발견한 장소에 나만의 맥락을 더함', en: 'Public collections that hide identity and original notes let you discover others\' taste, then add your own context to what you find.' },
    },
    {
      title: { ko: '서버 한 대에서 GitOps 배포', en: 'GitOps on a single server' },
      body: { ko: '모든 서비스를 공용 Helm 차트로 배포하고, Git에 선언한 상태를 Argo CD가 k3s에 반영', en: 'Every service ships through a shared Helm chart, and Argo CD applies the state declared in Git to k3s.' },
    },
  ],
  mine: [
      {
        title: { ko: '검증된 이미지만 배포', en: 'Only verified images ship' },
        body: { ko: '서비스 CI 성공과 레지스트리 digest를 확인한 뒤 배포 변경 PR 자동 생성, 병합 직전 커밋 재확인. 롤백도 Git revert로 기록', en: 'Deploy PRs are opened only after CI success and the registry digest are verified, the commit is rechecked before merge, and rollbacks are recorded as Git reverts.' },
        tech: { ko: 'GitHub Actions · private GHCR · full commit SHA + image digest 고정 · Helm · Argo CD ApplicationSet', en: 'GitHub Actions · private GHCR · pinned full commit SHA + image digest · Helm · Argo CD ApplicationSet' },
      },
      {
        title: { ko: '서버 한 대의 자원 분리', en: 'Splitting one server\'s resources' },
        body: { ko: '개발·운영 영역 분리와 자원 상한, 관측 도구 용량 제한으로 서비스끼리의 자원 경쟁 방지', en: 'Separate dev and prod areas, resource ceilings and capped observability storage keep services from starving each other.' },
        tech: { ko: 'namespace 분리 · 자원 예산 · NetworkPolicy · Pod Security Admission', en: 'Namespaces · resource budgets · NetworkPolicy · Pod Security Admission' },
      },
      {
        title: { ko: 'AI 운영 알림', en: 'AI-assisted alerts' },
        body: { ko: '경보와 관련된 메트릭·로그를 제한된 범위에서 조회해 한국어 알림으로 정리. AI가 실패하거나 근거가 부족하면 규칙 기반 알림으로 대체, 클러스터는 자동 변경하지 않음', en: 'Alerts are summarized in Korean from a limited set of related metrics and logs. If the AI fails or evidence is thin, a rule-based alert goes out instead, and nothing in the cluster is changed automatically.' },
        tech: { ko: 'Alertmanager → Sentinel Receiver(민감정보 제거 · 허용 필드 JSON) → AI API → 출력 검증 → Mattermost', en: 'Alertmanager → Sentinel Receiver (redaction · allow-listed JSON) → AI API → output validation → Mattermost' },
      },
      {
        title: { ko: '관측과 외부 감시', en: 'Observability and external probes' },
        body: { ko: '메트릭·로그 수집과 대시보드 구성. 서버 전체가 멈춰도 알 수 있도록 외부 HTTPS·TLS 확인 경로를 별도 운영', en: 'Metrics, logs and dashboards, plus a separate external HTTPS/TLS probe so a full server outage is still reported.' },
        tech: { ko: 'Prometheus · Loki · Alloy · Grafana · GitHub-hosted 외부 probe', en: 'Prometheus · Loki · Alloy · Grafana · GitHub-hosted external probe' },
      },
      {
        title: { ko: '시크릿과 접근 권한', en: 'Secrets and access' },
        body: { ko: '시크릿은 암호화해 Git에 보관하고, 배포 자동화 토큰은 저장소별 최소 권한으로 분리', en: 'Secrets are encrypted in Git, and deploy automation tokens are scoped per repository with least privilege.' },
        tech: { ko: 'Sealed Secrets · 최소 권한 토큰 · Cloudflare Tunnel · Traefik', en: 'Sealed Secrets · least-privilege tokens · Cloudflare Tunnel · Traefik' },
      },
  ],
  fixes: [
    {
      title: { ko: '컨테이너 런타임이 CPU를 계속 점유하던 문제', en: 'Container runtime eating CPU' },
      body: { ko: 'Docker와 cri-dockerd 경로에서 Kubelet의 반복 조회가 CPU를 점유하던 문제를 K3s 내장 containerd로 전환해 해결. DB 백업·설정 보존·롤백 경로를 갖춘 절차로 전환', en: 'Kubelet polling through Docker and cri-dockerd kept the CPU busy; switching to K3s embedded containerd removed that layer, using a procedure with DB backup, preserved config and a rollback path.' },
    },
    {
      title: { ko: '깨진 백업이 최신 복구 지점이 될 수 있던 문제', en: 'A broken backup could become the latest restore point' },
      body: { ko: 'dump 생성 후 archive를 검사하고, 검증한 파일만 latest.dump로 원자적으로 반영하도록 변경', en: 'Dumps are now checked as archives, and only verified files are atomically promoted to latest.dump.' },
    },
  ],
  screens: [
    { src: `${P}/natural-search-mac16.webp`, video: `${P}/natural-search-mac16.mp4`, label: { ko: '자연어 검색', en: 'Natural-language search' }, size: [960, 574] },
    { src: `${P}/search-result-mac16.webp`, label: { ko: '검색 결과', en: 'Search results' }, size: [1200, 718] },
    { src: `${P}/add-place-image-mac16.webp`, video: `${P}/add-place-image-mac16.mp4`, label: { ko: '장소 추가 (사진)', en: 'Add a place (photo)' }, size: [960, 574] },
    { src: `${P}/add-place-text-mac16.webp`, video: `${P}/add-place-text-mac16.mp4`, label: { ko: '장소 추가 (검색)', en: 'Add a place (search)' }, size: [960, 574] },
    { src: `${P}/map-marker-mac16.webp`, video: `${P}/map-marker-mac16.mp4`, label: { ko: '지도 → 레코드', en: 'Map → record' }, size: [960, 574] },
    { src: `${P}/record-detail-mac16.webp`, label: { ko: '레코드 상세', en: 'Record detail' }, size: [1200, 718] },
    { src: `${P}/feed-mac16.webp`, video: `${P}/feed-mac16.mp4`, label: { ko: '피드', en: 'Feed' }, size: [960, 574] },
    { src: `${P}/library-mac16.webp`, video: `${P}/library-mac16.mp4`, label: { ko: '라이브러리', en: 'Library' }, size: [960, 574] },
  ],
  architecture: {
    diagram: 'pinlog-arch',
    notes: [
      { title: { ko: '런타임', en: 'Runtime' }, body: { ko: 'k3s 내장 containerd (Docker·cri-dockerd 제거)', en: 'k3s embedded containerd (Docker and cri-dockerd removed)' } },
      { title: { ko: '배포', en: 'Delivery' }, body: { ko: 'GitHub Actions → 인프라 저장소 PR → Argo CD → Helm·ApplicationSet', en: 'GitHub Actions → infra repo PR → Argo CD → Helm and ApplicationSet' } },
      { title: { ko: '관측', en: 'Observability' }, body: { ko: 'Prometheus·Alertmanager·Loki → Sentinel(자체 제작 알림 요약 봇) → Mattermost → 사람', en: 'Prometheus, Alertmanager, Loki → Sentinel (in-house alert summarizer) → Mattermost → a person' } },
    ],
  },
  scenario: {
    diagram: 'pinlog-scenario',
    notes: [
      { title: { ko: '사용자 흐름', en: 'User flow' }, body: { ko: '위치 선택 → 기록 → 목록 → 자연어 검색 → 기록 열기', en: 'Pick a spot → record → list → natural-language search → open the record' } },
      { title: { ko: '시스템 흐름', en: 'System flow' }, body: { ko: '저장 → AI 검색(내 기록 매칭) → 결과 강조', en: 'Save → AI search over your records → highlighted results' } },
      { title: { ko: '반복 경로', en: 'Retry path' }, body: { ko: '원하는 장소가 아니면 검색어를 바꿔 다시 찾기', en: 'Not the place you meant? Rephrase and search again' } },
    ],
  },
  tech: [
    { name: 'k3s', problem: { ko: '4 vCPU·15GiB 단일 VM에 여러 서비스 배치', en: 'Fitting several services on one 4 vCPU / 15 GiB VM' }, role: { ko: '경량 클러스터로 3개 서비스와 관측 스택 운영', en: 'A lightweight cluster runs three services plus observability' } },
    { name: 'containerd', problem: { ko: 'Docker·cri-dockerd 경로의 CPU throttling', en: 'CPU throttling on the Docker / cri-dockerd path' }, role: { ko: 'k3s 내장 런타임 전환, 호출 경로 5단 → 3단', en: 'Switched to the k3s built-in runtime; call path cut from 5 hops to 3' } },
    { name: 'ArgoCD · Helm', problem: { ko: '서비스마다 반복되는 배포 구성', en: 'The same deploy config repeated for every service' }, role: { ko: '공통 차트 · ApplicationSet, 설정 파일 추가로 배포 단위 생성', en: 'Shared chart and ApplicationSet; a new deploy unit is one config file' } },
    { name: 'GitHub Actions', problem: { ko: '검토 없는 운영 반영, 배포 이미지 추적 불가', en: 'Unreviewed changes reaching prod; untraceable images' }, role: { ko: 'commit SHA·digest 고정, 인프라 PR과 필수 검사 후 반영', en: 'Pinned commit SHA and digest, applied via infra PR after required checks' } },
    { name: 'Prometheus · Alertmanager · Loki', problem: { ko: '장애 징후의 사후 인지', en: 'Noticing trouble only after the fact' }, role: { ko: '지표 기반 알림, 알림 관련 로그만 근거 조회', en: 'Metric-based alerts, pulling only the related logs as evidence' } },
    { name: 'LLM API · Mattermost', problem: { ko: '반복 알림의 수동 분류', en: 'Triaging repeated alerts by hand' }, role: { ko: '알림·로그 요약 전달 자동화, 서버 변경은 사람 결정', en: 'Automated alert and log summaries; server changes stay a human decision' } },
  ],
};

export const PROJECTS: Project[] = [
  {
    slug: 'algosu', name: { ko: '알고수', en: 'AlgoSu' }, image: { ko: `${A}/banner-1120.webp`, en: `${A}/banner-en-1120.webp` },
    summary: { ko: '코드 제출부터 GitHub 저장, AI 코드 분석까지 이어지는 알고리즘 스터디 관리 서비스', en: 'An algorithm study tool that carries a submission through GitHub saving to AI code review' },
    detail: ALGOSU,
  },
  {
    slug: 'finch', name: { ko: '핀치', en: 'FINCH' }, image: { ko: `${F}/banner-v3-1120.webp`, en: `${F}/banner-en-1120.webp` },
    summary: { ko: '포트폴리오 기반 나만의 AI 투자 비서', en: 'A personal AI investing assistant built on your portfolio' },
    detail: FINCH,
  },
  {
    slug: 'janus', name: { ko: '야누스', en: 'Janus' }, image: { ko: `${J}/banner-v4-1120.webp`, en: `${J}/banner-en-v3-1120.webp` },
    summary: { ko: '로컬 LLM 기반 에이전트 코딩 IDE', en: 'An agentic coding IDE on a local LLM' },
    detail: JANUS,
  },
  {
    slug: 'pinlog', name: { ko: '핀로그', en: 'PinLog' }, image: { ko: `${P}/banner-1120.webp`, en: `${P}/banner-en-1120.webp` },
    summary: { ko: '장소 이름이 기억나지 않아도 경험과 감정으로 다시 찾는 AI 장소 기록 서비스', en: 'An AI place journal that finds places again by experience and feeling, even when you forget the name' },
    detail: PINLOG,
  },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
