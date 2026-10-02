import Link from 'next/link';
import PostGrid from '@/components/PostGrid';
import PostList from '@/components/PostList';
import Container from '@/components/ui/Container';
import { countPosts, listPosts } from '@/lib/db';
import { CATEGORIES, DICT, type Locale } from '@/lib/i18n';
import { localeOf, pageMeta } from '@/lib/page';

export const dynamic = 'force-dynamic';

const PER_PAGE = 12; // 그리드 3열 × 4줄

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ category?: string; view?: string; page?: string }> };
type State = { category: string; view: 'grid' | 'list'; page: number };

export async function generateMetadata({ params }: Props) {
  const locale = await localeOf(params);
  return pageMeta(locale, '/posts', { title: DICT[locale].posts.title });
}

// 카테고리·보기 방식·페이지는 주소에 둔다 (공유되고, 서버에서 바로 그려짐). 기본값은 주소에서 뺀다.
const href = (locale: Locale, s: State) => {
  const q = new URLSearchParams();
  if (s.category) q.set('category', s.category);
  if (s.view === 'list') q.set('view', 'list');
  if (s.page > 1) q.set('page', String(s.page));
  return `/${locale}/posts${q.size ? `?${q}` : ''}`;
};

// 카테고리 탭·보기 전환·페이지 번호가 같은 모양(DESIGN.md 탭: pill, 현재 것만 진하게)
const TAB = 'tap press inline-flex h-9 items-center justify-center rounded-pill bg-fog t-body-sm aria-[current=page]:bg-fg aria-[current=page]:text-surface';

export default async function PostsPage({ params, searchParams }: Props) {
  const locale = await localeOf(params);
  const t = DICT[locale];
  const sp = await searchParams;
  const category = (CATEGORIES as readonly string[]).includes(sp.category ?? '') ? sp.category! : '';
  const view = sp.view === 'list' ? 'list' : 'grid';
  const total = await countPosts(locale, { category });
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1));
  const posts = await listPosts(locale, { category }, { limit: PER_PAGE, offset: (page - 1) * PER_PAGE });
  const state: State = { category, view, page };
  const tabs = [{ key: '', label: t.posts.all }, ...CATEGORIES.map((c) => ({ key: c, label: t.category[c] }))];

  return (
    <Container className="pb-20">
      <h1 className="pb-6 pt-12 t-section">{t.posts.title}</h1>
      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link key={tab.key} href={href(locale, { ...state, category: tab.key, page: 1 })}
              aria-current={tab.key === category ? 'page' : undefined} className={`${TAB} px-[15px]`}>
              {tab.label}
            </Link>
          ))}
        </nav>
        <nav aria-label={t.posts.view} className="ml-auto flex gap-2">
          {(['grid', 'list'] as const).map((v) => (
            <Link key={v} href={href(locale, { ...state, view: v })} aria-label={t.posts[v]} title={t.posts[v]}
              aria-current={v === view ? 'page' : undefined} className={`${TAB} w-9`}>
              {v === 'grid' ? <GridIcon /> : <ListIcon />}
            </Link>
          ))}
        </nav>
      </div>
      {!posts.length ? <p className="py-30 text-center text-muted">{t.posts.empty}</p>
        : view === 'list' ? <PostList posts={posts} locale={locale} /> : <PostGrid posts={posts} locale={locale} />}
      {pages > 1 && (
        <nav aria-label={t.posts.pages} className="mt-14 flex flex-wrap justify-center gap-2">
          {page > 1 && <Link href={href(locale, { ...state, page: page - 1 })} aria-label={t.posts.prevPage} className={`${TAB} w-9`}>←</Link>}
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={href(locale, { ...state, page: n })} aria-label={t.posts.page(n)}
              aria-current={n === page ? 'page' : undefined} className={`${TAB} w-9`}>
              {n}
            </Link>
          ))}
          {page < pages && <Link href={href(locale, { ...state, page: page + 1 })} aria-label={t.posts.nextPage} className={`${TAB} w-9`}>→</Link>}
        </nav>
      )}
    </Container>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M2 3.5h12M2 8h12M2 12.5h12" />
    </svg>
  );
}
