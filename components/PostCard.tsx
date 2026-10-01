import Link from 'next/link';
import type { PostCard as P } from '@/lib/db';
import { fmtDate } from '@/lib/format';
import Eyebrow from './ui/Eyebrow';
import Thumb from './ui/Thumb';

// md: 최신 이야기(3열), sm: 더 깊이 있는 이야기(4열)
const SIZE = {
  md: { thumb: 'aspect-2/1', title: 't-title3 font-medium' },
  sm: { thumb: 'aspect-5/2', title: 't-body font-medium' },
};

export default function PostCard({ post, size = 'md' }: { post: P; size?: keyof typeof SIZE }) {
  const s = SIZE[size];
  return (
    <Link href={`/posts/${encodeURIComponent(post.slug)}`} className="group flex flex-col gap-1.5">
      <Thumb src={post.thumbnail} className={`mb-3 rounded-card transition-opacity group-hover:opacity-90 ${s.thumb}`} />
      <Eyebrow>{post.category}</Eyebrow>
      <h3 className={s.title}>{post.title}</h3>
      {post.summary && <p className="t-body-sm text-muted">{post.summary}</p>}
      <time dateTime={post.created_at.toISOString()} className="mt-2 t-caption text-muted">{fmtDate(post.created_at)}</time>
    </Link>
  );
}
