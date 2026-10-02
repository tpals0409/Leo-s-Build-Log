import type { Locale } from './i18n';

type L = Record<Locale, string>;

// 소개·연락 정보 — 출처는 김세민 이력서(2026-10). 비어 있는 연락처는 화면에 안 나온다.
export const SITE = {
  name: { ko: '레오의 빌드로그', en: 'Leo’s Build Log' } satisfies L,
  contacts: [
    { label: 'Email', href: 'mailto:tpalsdlapfnd@gmail.com', text: 'tpalsdlapfnd@gmail.com' },
    { label: 'GitHub', href: 'https://github.com/tpals0409', text: 'github.com/tpals0409' },
  ],
};

// 소개 페이지의 경력 데이터. 화면 문구(제목·버튼 등)는 lib/i18n.ts의 DICT.about.
// 기술 숙련도는 본인이 매긴 5단계(이력서 그대로, 보수적으로). 이력서에 없던 NestJS·Next.js·Docker·파인튜닝·Java와 풀스택 묶음 값은 본인이 다시 매김(2026-10-02).
export const PROFILE = {
  skills: [
    {
      group: 'ai',
      items: [
        [{ ko: 'Agent 오케스트레이션', en: 'Agent orchestration' }, 4],
        [{ ko: '컨텍스트 엔지니어링', en: 'Context engineering' }, 4],
        [{ ko: 'RAG', en: 'RAG' }, 4],
        [{ ko: 'LLM API', en: 'LLM API' }, 4],
        [{ ko: '하네스 엔지니어링', en: 'Harness engineering' }, 3],
        [{ ko: '로컬 LLM', en: 'Local LLM' }, 3],
        [{ ko: '파인튜닝', en: 'Fine-tuning' }, 2],
      ],
    },
    {
      group: 'backend',
      items: [
        [{ ko: 'Python', en: 'Python' }, 4],
        [{ ko: 'Java', en: 'Java' }, 3],
        [{ ko: 'TypeScript', en: 'TypeScript' }, 2],
        [{ ko: 'FastAPI', en: 'FastAPI' }, 2],
        [{ ko: 'NestJS', en: 'NestJS' }, 2],
        [{ ko: 'Next.js', en: 'Next.js' }, 2],
        [{ ko: 'RabbitMQ', en: 'RabbitMQ' }, 2],
        [{ ko: 'Redis', en: 'Redis' }, 2],
        [{ ko: 'PostgreSQL', en: 'PostgreSQL' }, 2],
      ],
    },
    {
      group: 'ops',
      items: [
        [{ ko: 'Kubernetes', en: 'Kubernetes' }, 3],
        [{ ko: 'Argo CD', en: 'Argo CD' }, 3],
        [{ ko: 'GitHub Actions', en: 'GitHub Actions' }, 3],
        [{ ko: 'Docker', en: 'Docker' }, 2],
        [{ ko: 'Prometheus', en: 'Prometheus' }, 2],
        [{ ko: 'Grafana', en: 'Grafana' }, 2],
        [{ ko: 'Loki', en: 'Loki' }, 2],
      ],
    },
  ] as const satisfies readonly { group: 'ai' | 'backend' | 'ops'; items: readonly (readonly [L, number])[] }[],
  // 회사명은 소개 페이지 활동에만 (교육 회고 글은 익명 유지)
  activities: [
    {
      date: '2026.09',
      title: { ko: '신입 개발자 대상 AX 교육 보조강사 - 현대오토에버', en: 'Assistant instructor, AX training for new developers - Hyundai AutoEver' },
      body: {
        ko: '약 50명 대상 Claude Code 기반 AI Agent 실습 지원',
        en: 'Supported about 50 trainees in hands-on AI agent practice with Claude Code',
      },
    },
    {
      date: '2026.06',
      title: { ko: '기업 임원 대상 AX 교육 보조강사 - 삼성전자', en: 'Assistant instructor, AX training for executives - Samsung Electronics' },
      body: {
        ko: '약 30명 대상 AI Agent 실습 지원, 실습 질문 응대와 교육 운영 보조',
        en: 'Supported about 30 executives in hands-on AI agent practice, answered their questions, and helped run the sessions',
      },
    },
  ],
  education: [
    { date: '2026.01 –', name: { ko: '삼성 청년 SW·AI 아카데미 15기', en: 'Samsung Software & AI Academy for Youth, cohort 15' }, note: { ko: 'Java 트랙', en: 'Java track' } },
    { date: '2024.07 – 12', name: { ko: '카카오테크 부트캠프', en: 'Kakao Tech Bootcamp' }, note: { ko: '생성형 AI 과정', en: 'Generative AI course' } },
    { date: '2018.03 – 2025.02', name: { ko: '한국공학대학교 소프트웨어공학과 졸업', en: 'B.S. in Software Engineering, Tech University of Korea' } },
    { date: '2024.07', name: { ko: '빅데이터분석기사', en: 'Engineer Big Data Analysis (Korea)' } },
    { date: '2024.04', name: { ko: 'SQL 개발자(SQLD)', en: 'SQL Developer (SQLD)' } },
  ] as { date: string; name: L; note?: L }[],
};

export const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
