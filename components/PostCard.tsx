import Link from 'next/link';
import type { PostCard as P } from '@/lib/db';
import { DICT, fmtDate, type Locale } from '@/lib/i18n';
import ClampTitle from './ui/ClampTitle';
import Thumb from './ui/Thumb';

// md: 3열 그리드용, sm: 4열 그리드용
const SIZE = {
  md: { thumb: 'aspect-2/1', title: 't-tile', sizes: '(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw' },
  sm: { thumb: 'aspect-5/2', title: 't-body', sizes: '(min-width: 1024px) 270px, (min-width: 640px) 50vw, 100vw' },
};

// 카테고리(또는 label) · 날짜 한 줄 — 카드와 목록 보기가 같이 쓴다
export function PostMeta({ post, locale, label, end, tone }: { post: P; locale: Locale; label?: string; end?: boolean; tone?: 'text-fg' }) {
  // tone: 이미지 위처럼 label·muted 대비가 모자란 곳은 전부 fg (AGENTS.md '이미지 위 글자')
  const name = <span className={tone ?? 'text-label'}>{label ?? DICT[locale].category[post.category]}</span>;
  const date = <time dateTime={post.created_at.toISOString()} className={tone ?? 'text-muted'}>{fmtDate(post.created_at, locale)}</time>;
  const dot = <span className={tone ?? 'text-muted'}> · </span>;
  // end(오른쪽 정렬, '다음 글 →'): 날짜 · 문구 — 화살표가 바깥쪽 끝에 오게
  return <p className={`t-caption ${end ? 'text-right' : ''}`}>{end ? <>{date}{dot}{name}</> : <>{name}{dot}{date}</>}</p>;
}

export default function PostCard({ post, locale, size = 'md' }: { post: P; locale: Locale; size?: keyof typeof SIZE }) {
  const s = SIZE[size];
  return (
    <Link href={`/${locale}/posts/${post.slug}`} className="group press-card row-span-4 grid grid-rows-subgrid gap-y-1.5">
      <div className="mb-3 overflow-hidden rounded-card">
        <Thumb src={post.thumbnail} sizes={s.sizes} className={`thumb-zoom ${s.thumb}`} />
      </div>
      <PostMeta post={post} locale={locale} />
      <ClampTitle title={post.title} className={s.title} />
      <p className="line-clamp-2 t-body-sm text-muted">{post.summary}</p>{/* 제목·요약 모두 2줄까지(잘린 제목은 ClampTitle이 띄워 보여 준다). 요약이 없어도 칸은 둔다 (subgrid 행 4개) */}
    </Link>
  );
}
