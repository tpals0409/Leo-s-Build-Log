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
      <Container className="flex h-15 items-center gap-4 sm:gap-8">
        <Link href={`/${locale}`} className="tap flex shrink-0 items-center gap-2 whitespace-nowrap t-body lg:t-tile">
          {/* 이름이 바로 옆에 있으니 이미지는 장식(alt 비움) */}
          <img src="/logo.webp" alt="" width={36} height={36} className="size-8 lg:size-9" />
          {SITE.name[locale]}
        </Link>
        <nav className="mx-auto hidden gap-6 t-body-sm md:flex lg:gap-10">
          {nav.map((n) => <Link key={n.href} href={n.href} className="tap">{n.label}</Link>)}
        </nav>
        <form action={`/${locale}/search`} role="search" className="relative ml-auto md:ml-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden className="absolute left-3 top-2.5 text-muted">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
          </svg>
          <input name="q" placeholder={t.search.placeholder} aria-label={t.search.placeholder}
            className="h-[34px] w-28 rounded-pill bg-fog pl-[34px] pr-3.5 t-caption sm:w-45" />
        </form>
        <div className="hidden md:block"><LocaleSwitch locale={locale} /></div>
      </Container>
      {/* 좁은 화면: 메뉴 + 언어 전환을 둘째 줄로 (첫 줄은 로고·검색만) */}
      <Container className="flex gap-6 pb-3 t-body-sm md:hidden">
        {nav.map((n) => <Link key={n.href} href={n.href} className="tap">{n.label}</Link>)}
        <span className="ml-auto"><LocaleSwitch locale={locale} /></span>
      </Container>
    </header>
  );
}
