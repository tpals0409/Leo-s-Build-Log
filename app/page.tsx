import FeaturedHero from '@/components/FeaturedHero';
import PostGrid from '@/components/PostGrid';
import Quote from '@/components/Quote';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import { getHome } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { featured, latest, deeper } = await getHome();
  if (!featured && !latest.length) return <Container className="py-30 text-center text-muted">아직 글이 없습니다.</Container>;

  return (
    <Container>
      {featured && <FeaturedHero post={featured} />}

      {latest.length > 0 && (
        <section>
          <SectionHeader title="최신 이야기" href="/search" />
          <PostGrid posts={latest} cols={3} />
        </section>
      )}

      {deeper.length > 0 && (
        <section className="mt-10 border-t border-line pt-10">
          <SectionHeader title="더 깊이 있는 이야기" href="/search" />
          <PostGrid posts={deeper} cols={4} />
        </section>
      )}

      <Quote text="기술은 사람을 위한 것이어야 합니다." cite="더 나은 내일을 위해" />
    </Container>
  );
}
