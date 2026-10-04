import type { NextConfig } from 'next';

export default {
  output: 'standalone',
  // Shiki(코드 강조)의 언어 문법 수백 개를 번들하지 않고 node_modules에서 읽는다 — 번들하면 빌드 메모리가 2GB를 넘어 죽는다
  serverExternalPackages: ['shiki'],
  // root layout이 [locale]·admin 두 개라 일반 not-found가 안 먹는다 → app/global-not-found.tsx (실험 기능)
  experimental: { globalNotFound: true },
  // 언어 자동 감지 없음: /는 항상 한국어판 (AGENTS.md)
  redirects: async () => [{ source: '/', destination: '/ko', permanent: false }],
  // public/의 폰트·로고·소개 이미지는 브라우저·Cloudflare에 7일 (기본은 4시간). 이름에 해시가 없어서 1년(immutable)은 안 씀 —
  // 같은 이름으로 내용을 바꾸면(예: scripts/subset-fonts.sh 재실행) 최대 7일 옛 파일이 보일 수 있다. 업로드(/uploads)는 이미 1년.
  headers: async () => ['/fonts/:path*', '/logo-:name', '/logo.:ext', '/og-:name', '/about/:path*', '/projects/:path*'].map((source) => ({
    source,
    headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
  })),
} satisfies NextConfig;
