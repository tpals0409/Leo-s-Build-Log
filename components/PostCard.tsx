import Link from 'next/link';
import type { PostCard as P } from '@/lib/db';
import { DICT, fmtDate, type Locale } from '@/lib/i18n';
import Eyebrow from './ui/Eyebrow';
import Thumb from './ui/Thumb';

// md: 3열 그리드용, sm: 4열 그리드용
const SIZE = {
  md: { thumb: 'aspect-2/1', title: 't-tile' },
  sm: { thumb: 'aspect-5/2', title: 't-body' },
};

export default function PostCard({ post, locale, size = 'md' }: { post: P; locale: Locale; size?: keyof typeof SIZE }) {
  const s = SIZE[size];
  return (
    <Link href={`/${locale}/posts/${post.slug}`} className="flex flex-col gap-1.5">
      <Thumb src={post.thumbnail} className={`mb-3 rounded-card ${s.thumb}`} />
      <Eyebrow>{DICT[locale].category[post.category]}</Eyebrow>
      <h3 className={s.title}>{post.title}</h3>
      {post.summary && <p className="t-body-sm text-muted">{post.summary}</p>}
      <time dateTime={post.created_at.toISOString()} className="mt-2 t-caption text-muted">{fmtDate(post.created_at, locale)}</time>
    </Link>
  );
}
