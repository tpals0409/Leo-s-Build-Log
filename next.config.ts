import type { NextConfig } from 'next';

export default {
  output: 'standalone',
  // 언어 자동 감지 없음: /는 항상 한국어판 (AGENTS.md)
  redirects: async () => [{ source: '/', destination: '/ko', permanent: false }],
} satisfies NextConfig;
