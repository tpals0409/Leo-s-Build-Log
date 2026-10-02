import type { Metadata } from 'next';
import Header from '@/components/Header';
import { LOCALES } from '@/lib/i18n';
import { layoutLocale, pageMeta } from '@/lib/page';
import { SITE, SITE_URL } from '@/lib/site';
import '../globals.css';

export const dynamicParams = false; // ko, en 외 언어는 404 (프로덕션 보장은 localeOf가 함)
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

const FONTS = ['GmarketSansMedium.woff2', 'GmarketSansBold.woff2'];

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await layoutLocale(params);
  return {
    metadataBase: new URL(SITE_URL),
    title: SITE.name[locale], // 탭 제목은 어느 페이지든 블로그 이름 (lib/page.ts pageMeta)
    ...pageMeta(locale, ''),
  };
}

export default async function LocaleLayout({ children, params }: Props & { children: React.ReactNode }) {
  const locale = await layoutLocale(params);
  return (
    <html lang={locale}>
      <head>
        {/* 화면 글꼴(Gmarket Sans) 두 굵기를 CSS보다 먼저 요청 — 글자가 기본 글꼴로 떴다가 바뀌는 깜빡임을 줄인다 */}
        {FONTS.map((f) => <link key={f} rel="preload" href={`/fonts/${f}`} as="font" type="font/woff2" crossOrigin="anonymous" />)}
      </head>
      <body>
        <Header locale={locale} />
        <main>{children}</main>
      </body>
    </html>
  );
}
