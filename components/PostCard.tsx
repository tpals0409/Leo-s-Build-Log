import Link from 'next/link';
import type { PostCard as P } from '@/lib/db';
import { DICT, fmtDate, type Locale } from '@/lib/i18n';
import ClampTitle from './ui/ClampTitle';
import Thumb from './ui/Thumb';

// md: 3열 그리드용, sm: 4열 그리드용
const SIZE = {
  md: { thumb: 'aspect-2/1', title: 't-tile' },
  sm: { thumb: 'aspect-5/2', title: 't-body' },
};

// 카테고리(또는 label) · 날짜 한 줄 — 카드와 목록 보기가 같이 쓴다
export function PostMeta({ post, locale, label, end }: { post: P; locale: Locale; label?: string; end?: boolean }) {
  return (
    <p className={`t-caption ${end ? 'text-right' : ''}`}>
      <span className="text-label">{label ?? DICT[locale].category[post.category]}</span>
      <span className="text-muted"> · <time dateTime={post.created_at.toISOString()}>{fmtDate(post.created_at, locale)}</time></span>
    </p>
  );
}

// label: 카테고리 자리에 대신 쓸 문구 (글 아래 '← 이전 글' 등), labelEnd: 그 줄을 오른쪽 끝에 ('다음 글 →')
export default function PostCard({ post, locale, size = 'md', label, labelEnd }: { post: P; locale: Locale; size?: keyof typeof SIZE; label?: string; labelEnd?: boolean }) {
  const s = SIZE[size];
  return (
    <Link href={`/${locale}/posts/${post.slug}`} className="group press-card row-span-4 grid grid-rows-subgrid gap-y-1.5">
      <div className="mb-3 overflow-hidden rounded-card">
        <Thumb src={post.thumbnail} className={`thumb-zoom ${s.thumb}`} />
      </div>
      <PostMeta post={post} locale={locale} label={label} end={labelEnd} />
      <ClampTitle title={post.title} className={s.title} />
      <p className="line-clamp-2 t-body-sm text-muted">{post.summary}</p>{/* 제목·요약 모두 2줄까지(잘린 제목은 ClampTitle이 띄워 보여 준다). 요약이 없어도 칸은 둔다 (subgrid 행 4개) */}
    </Link>
  );
}
