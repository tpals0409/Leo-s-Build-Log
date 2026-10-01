import Container from '@/components/ui/Container';
import { DICT } from '@/lib/i18n';
import { localeOf, pageMeta } from '@/lib/page';
import { SITE } from '@/lib/site';

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
      <h1 className="pb-8 pt-12 t-title1 font-bold">{t.title}</h1>
      <p className="t-body-lg text-secondary">{t.placeholder}</p>
      <h2 className="mb-4 mt-16 t-title2 font-bold">{t.contact}</h2>
      <ul className="flex flex-col gap-2">
        {SITE.contacts.filter((c) => c.href).map((c) => (
          <li key={c.label}><a href={c.href} className="text-link">{c.label}</a></li>
        ))}
      </ul>
    </Container>
  );
}
