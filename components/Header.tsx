import Link from 'next/link';
import { DICT, type Locale } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import LocaleSwitch from './LocaleSwitch';
import Container from './ui/Container';

// 가로 로고 비율(높이 36 기준 폭) — 이미지가 로드되기 전 자리 잡기용
const LOGO = { ko: 147, en: 158 } as const;

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
        <Link href={`/${locale}`} className="tap press shrink-0">
          {/* 로고 시트(2026-10-02)의 가로 로고: 난간 고양이 + 레터링. 언어마다 한 장 (public/logo-ko|en.webp) */}
          <img src={`/logo-${locale}.webp`} alt={SITE.name[locale]} width={LOGO[locale]} height={36} className="h-8 w-auto lg:h-10" />
        </Link>
        <nav className="mx-auto hidden gap-6 t-body-sm md:flex lg:gap-10">
          {nav.map((n) => <Link key={n.href} href={n.href} className="tap link-hover">{n.label}</Link>)}
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
      <Container className="flex items-center gap-6 pb-3 t-body-sm md:hidden">
        {nav.map((n) => <Link key={n.href} href={n.href} className="tap link-hover">{n.label}</Link>)}
        <span className="ml-auto"><LocaleSwitch locale={locale} /></span>
      </Container>
    </header>
  );
}
