import Link from 'next/link';
import { DICT, type Locale } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import LocaleSwitch from './LocaleSwitch';
import Container from './ui/Container';

export default function Header({ locale }: { locale: Locale }) {
  const t = DICT[locale];
  const nav = [
    { href: `/${locale}/posts`, label: t.nav.posts },
    { href: `/${locale}/projects`, label: t.nav.projects },
    { href: `/${locale}/about`, label: t.nav.about },
  ];
  return (
    <header className="sticky top-0 z-10 border-b border-line/60 bg-surface/85 backdrop-blur-xl backdrop-saturate-180">
      <Container className="flex h-15 items-center gap-8">
        <Link href={`/${locale}`} className="t-title2 font-medium">{SITE.name}</Link>
        <nav className="mx-auto hidden gap-10 t-body-sm font-medium lg:flex">
          {nav.map((n) => <Link key={n.href} href={n.href} className="hover:text-link">{n.label}</Link>)}
        </nav>
        <form action={`/${locale}/search`} role="search" className="relative ml-auto lg:ml-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden className="absolute left-3 top-2.5 text-muted">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
          </svg>
          <input name="q" placeholder={t.search.placeholder} aria-label={t.search.placeholder}
            className="h-[34px] w-36 rounded-pill bg-fog pl-[34px] pr-3.5 t-caption sm:w-45" />
        </form>
        <LocaleSwitch locale={locale} />
      </Container>
      {/* 좁은 화면: 메뉴를 한 줄로 */}
      <Container className="flex gap-6 pb-3 t-body-sm font-medium lg:hidden">
        {nav.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
      </Container>
    </header>
  );
}
