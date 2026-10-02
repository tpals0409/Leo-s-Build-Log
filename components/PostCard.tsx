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
    <Link href={`/${locale}/posts/${post.slug}`} className="group press-card row-span-5 grid grid-rows-subgrid gap-y-1.5">
      <div className="mb-3 overflow-hidden rounded-card">
        <Thumb src={post.thumbnail} className={`thumb-zoom ${s.thumb}`} />
      </div>
      <Eyebrow>{DICT[locale].category[post.category]}</Eyebrow>
      <h3 className={s.title}>{post.title}</h3>
      <p className="line-clamp-3 t-body-sm text-muted">{post.summary}</p>{/* 요약은 3줄까지, 없어도 칸은 둔다 (subgrid 행 5개). 제목은 자르지 않는다 */}
      <time dateTime={post.created_at.toISOString()} className="mt-2 t-caption text-muted">{fmtDate(post.created_at, locale)}</time>
    </Link>
  );
}
