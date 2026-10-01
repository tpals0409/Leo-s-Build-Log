import Container from '@/components/ui/Container';
import { DICT } from '@/lib/i18n';
import { localeOf, pageMeta } from '@/lib/page';
import { SITE } from '@/lib/site';

// 요청 시 렌더: SITE_URL(canonical·OG 주소)을 빌드 때가 아니라 실행 환경에서 읽도록
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const locale = await localeOf(params);
  return pageMeta(locale, '/about', { title: DICT[locale].about.title });
}

// TODO(김세민): 소개 내용 — 지금은 자리표시
export default async function AboutPage({ params }: Props) {
  const locale = await localeOf(params);
  const t = DICT[locale].about;
  return (
    <Container className="pb-20">
      <h1 className="pb-8 pt-12 t-section">{t.title}</h1>
      <p className="t-body text-secondary">{t.placeholder}</p>
      <h2 className="mb-4 mt-16 t-tile">{t.contact}</h2>
      <ul className="flex flex-col gap-2">
        {SITE.contacts.filter((c) => c.href).map((c) => (
          <li key={c.label}><a href={c.href} className="tap text-link">{c.label}</a></li>
        ))}
      </ul>
    </Container>
  );
}
