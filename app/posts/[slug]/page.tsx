import { notFound } from 'next/navigation';
import PostFrame from '@/components/PostFrame';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import { getPost } from '@/lib/db';
import { fmtDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const post = await getPost(decodeURIComponent((await params).slug));
  return post ? { title: `${post.title} — Blog`, description: post.summary } : {};
}

export default async function PostPage({ params }: Props) {
  const post = await getPost(decodeURIComponent((await params).slug));
  if (!post) notFound();
  return (
    <article>
      <Container className="pb-8 pt-14 text-center">
        <Eyebrow>{post.category}</Eyebrow>
        <h1 className="mb-4 mt-3 t-headline font-bold">{post.title}</h1>
        <time dateTime={post.created_at.toISOString()} className="text-muted">{fmtDate(post.created_at)}</time>
      </Container>
      <PostFrame html={post.html} title={post.title} />
    </article>
  );
}
