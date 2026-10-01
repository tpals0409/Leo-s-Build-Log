import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic'; // SITE_URL을 실행 환경에서 읽도록

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/ko/search', '/en/search'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
