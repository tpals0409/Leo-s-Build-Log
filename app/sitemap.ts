import type { MetadataRoute } from 'next';
import { listSlugs } from '@/lib/db';
import { LOCALES } from '@/lib/i18n';
import { PROJECTS } from '@/lib/projects';
import { SITE_URL } from '@/lib/site';

// 요청 시 생성: DB의 글 목록 + 실행 환경의 SITE_URL (빌드 때 DB가 없어도 됨)
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listSlugs();
  const pages: { path: string; lastModified?: Date }[] = [
    { path: '' },
    { path: '/posts' },
    { path: '/projects' },
    { path: '/about' },
    ...PROJECTS.map((p) => ({ path: `/projects/${p.slug}` })),
    ...posts.map((p) => ({ path: `/posts/${p.slug}`, lastModified: p.updated_at })),
  ];
  // 언어마다 한 줄씩, 서로를 alternates로 연결 (글은 항상 ko/en 둘 다 있음)
  return pages.flatMap(({ path, lastModified }) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])) },
    })),
  );
}
