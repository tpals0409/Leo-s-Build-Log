import type { NextConfig } from 'next';

export default {
  output: 'standalone',
  // root layout이 [locale]·admin 두 개라 일반 not-found가 안 먹는다 → app/global-not-found.tsx (실험 기능)
  experimental: { globalNotFound: true },
  // 언어 자동 감지 없음: /는 항상 한국어판 (AGENTS.md)
  redirects: async () => [{ source: '/', destination: '/ko', permanent: false }],
} satisfies NextConfig;
