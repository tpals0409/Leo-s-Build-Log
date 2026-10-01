import type { NextConfig } from 'next';

export default {
  output: 'standalone',
  // Shiki(코드 강조)의 언어 문법 수백 개를 번들하지 않고 node_modules에서 읽는다 — 번들하면 빌드 메모리가 2GB를 넘어 죽는다
  serverExternalPackages: ['shiki'],
  // root layout이 [locale]·admin 두 개라 일반 not-found가 안 먹는다 → app/global-not-found.tsx (실험 기능)
  experimental: { globalNotFound: true },
  // 언어 자동 감지 없음: /는 항상 한국어판 (AGENTS.md)
  redirects: async () => [{ source: '/', destination: '/ko', permanent: false }],
} satisfies NextConfig;
