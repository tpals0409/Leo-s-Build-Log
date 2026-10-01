import PostGrid from '@/components/PostGrid';
import Container from '@/components/ui/Container';
import { search } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q = '', category = '' } = await searchParams;
  const posts = await search(q.trim(), category);
  const title = q ? `‘${q}’ 검색 결과` : category || '모든 이야기';

  return (
    <Container className="pb-20">
      <h1 className="pb-8 pt-12 t-title1 font-bold">{title}</h1>
      {posts.length ? <PostGrid posts={posts} /> : <p className="py-30 text-center text-muted">결과가 없습니다.</p>}
    </Container>
  );
}
