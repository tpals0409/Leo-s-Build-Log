import type { Metadata } from 'next';
import Header from '@/components/Header';
import MotionProvider from '@/components/MotionProvider';
import { LOCALES } from '@/lib/i18n';
import { layoutLocale, pageMeta } from '@/lib/page';
import { SITE, SITE_URL } from '@/lib/site';
import '../globals.css';

export const dynamicParams = false; // ko, en 외 언어는 404 (프로덕션 보장은 localeOf가 함)
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await layoutLocale(params);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: SITE.name[locale], template: `%s — ${SITE.name[locale]}` },
    ...pageMeta(locale, ''),
  };
}

export default async function LocaleLayout({ children, params }: Props & { children: React.ReactNode }) {
  const locale = await layoutLocale(params);
  return (
    <html lang={locale}>
      <body>
        <Header locale={locale} />
        <MotionProvider>
          <main>{children}</main>
        </MotionProvider>
      </body>
    </html>
  );
}
