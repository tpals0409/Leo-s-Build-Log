import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale, type Locale } from './i18n';
import { SITE } from './site';

// [locale] 페이지 전용 Next.js 헬퍼. (lib/i18n.ts는 node self-check에서도 쓰여서 Next 의존성을 두지 않는다)
// 페이지 metadata용: 자기 주소(canonical) + 다른 언어판(hreflang). path는 언어 접두어 뒤 부분 ('' | '/posts/x')
export const alternates = (locale: Locale, path: string) => ({
  canonical: `/${locale}${path}`,
  languages: { ko: `/ko${path}`, en: `/en${path}`, 'x-default': `/ko${path}` },
});

// [locale] 페이지 공통: params에서 언어 꺼내기. ko/en 외는 404.
// (layout의 dynamicParams=false는 페이지가 동적 렌더면 프로덕션에서 안 막아준다 — 여기서 직접 검사)
export const localeOf = async (params: Promise<{ locale: string }>): Promise<Locale> => {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
};

// 페이지 metadata 공통: 제목·설명·canonical/hreflang·링크 미리보기(OG/X 카드) 텍스트.
// 미리보기 이미지는 opengraph-image 파일이 자동으로 붙인다 ([locale]/ 기본, posts/[slug]/ 글 전용).
export function pageMeta(locale: Locale, path: string, m: { title?: string; description?: string; type?: 'website' | 'article' } = {}): Metadata {
  const title = m.title ?? SITE.name[locale];
  return {
    ...(m.title && { title: m.title }),
    ...(m.description && { description: m.description }),
    alternates: alternates(locale, path),
    openGraph: {
      title,
      description: m.description,
      url: `/${locale}${path}`,
      siteName: SITE.name[locale],
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      alternateLocale: locale === 'ko' ? 'en_US' : 'ko_KR',
      type: m.type ?? 'website',
    },
    twitter: { card: 'summary_large_image', title, description: m.description },
  };
}
