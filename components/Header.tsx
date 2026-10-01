import Link from 'next/link';
import Container from './ui/Container';

const NAV = ['Product', 'Technology', 'People', 'Our Planet', 'Culture'];

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line/60 bg-surface/85 backdrop-blur-xl backdrop-saturate-180">
      <Container className="flex h-15 items-center gap-8">
        <Link href="/" className="t-title2 font-medium">Blog</Link>
        <nav className="mx-auto hidden gap-10 t-body-sm font-medium lg:flex">
          {NAV.map((c) => (
            <Link key={c} href={`/search?category=${encodeURIComponent(c)}`} className="hover:text-link">{c}</Link>
          ))}
        </nav>
        <form action="/search" role="search" className="relative ml-auto lg:ml-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden className="absolute left-3 top-2.5 text-muted">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
          </svg>
          <input name="q" placeholder="블로그 검색" aria-label="블로그 검색"
            className="h-[34px] w-36 rounded-pill bg-fog pl-[34px] pr-3.5 t-caption sm:w-45" />
        </form>
      </Container>
    </header>
  );
}
