import Link from 'next/link';
import PostGrid from '@/components/PostGrid';
import Container from '@/components/ui/Container';
import { listPosts } from '@/lib/db';
import { CATEGORIES, DICT } from '@/lib/i18n';
import { localeOf, pageMeta } from '@/lib/page';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ category?: string }> };

export async function generateMetadata({ params }: Props) {
  const locale = await localeOf(params);
  return pageMeta(locale, '/posts', { title: DICT[locale].posts.title });
}

export default async function PostsPage({ params, searchParams }: Props) {
  const locale = await localeOf(params);
  const t = DICT[locale];
  const { category = '' } = await searchParams;
  const active = (CATEGORIES as readonly string[]).includes(category) ? category : '';
  const posts = await listPosts(locale, { category: active });
  const tabs = [{ key: '', label: t.posts.all }, ...CATEGORIES.map((c) => ({ key: c, label: t.category[c] }))];

  return (
    <Container className="pb-20">
      <h1 className="pb-6 pt-12 t-section">{t.posts.title}</h1>
      <nav className="mb-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link key={tab.key} href={`/${locale}/posts${tab.key ? `?category=${tab.key}` : ''}`}
            aria-current={tab.key === active ? 'page' : undefined}
            className="tap inline-flex h-9 items-center rounded-pill bg-fog px-[15px] t-body-sm aria-[current=page]:bg-fg aria-[current=page]:text-surface">
            {tab.label}
          </Link>
        ))}
      </nav>
      {posts.length ? <PostGrid posts={posts} locale={locale} /> : <p className="py-30 text-center text-muted">{t.posts.empty}</p>}
    </Container>
  );
}
