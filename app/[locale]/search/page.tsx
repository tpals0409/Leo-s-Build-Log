import PostGrid from '@/components/PostGrid';
import Container from '@/components/ui/Container';
import { listPosts } from '@/lib/db';
import { DICT } from '@/lib/i18n';
import { localeOf } from '@/lib/page';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ params }: Props) {
  const locale = await localeOf(params);
  return { title: DICT[locale].search.placeholder, robots: { index: false } };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const locale = await localeOf(params);
  const t = DICT[locale].search;
  const q = ((await searchParams).q ?? '').trim();
  const posts = q ? await listPosts(locale, { q }) : [];

  return (
    <Container className="pb-20">
      <h1 className="pb-8 pt-12 t-section">{q ? t.title(q) : t.placeholder}</h1>
      {posts.length ? <PostGrid posts={posts} locale={locale} /> : q && <p className="py-30 text-center text-muted">{t.empty}</p>}
    </Container>
  );
}
