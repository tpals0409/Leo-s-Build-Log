import Link from 'next/link';
import type { PostCard as P } from '@/lib/db';
import { DICT, fmtDate, type Locale } from '@/lib/i18n';
import ClampTitle from './ui/ClampTitle';
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
      <ClampTitle title={post.title} className={s.title} />
      <p className="line-clamp-2 t-body-sm text-muted">{post.summary}</p>{/* 제목·요약 모두 2줄까지(잘린 제목은 ClampTitle이 띄워 보여 준다). 요약이 없어도 칸은 둔다 (subgrid 행 5개) */}
      <time dateTime={post.created_at.toISOString()} className="mt-2 t-caption text-muted">{fmtDate(post.created_at, locale)}</time>
    </Link>
  );
}
