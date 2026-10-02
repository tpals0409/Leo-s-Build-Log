import type { PostCard as P } from '@/lib/db';
import type { Locale } from '@/lib/i18n';
import PostCard from './PostCard';
import Reveal from './ui/Reveal';

const COLS = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' };
// 카드 하나가 행 4개(썸네일·카테고리와 날짜·제목·요약)를 subgrid로 나눠 쓴다 → 같은 줄 카드끼리 제목 길이가 달라도 요약·날짜 위치가 맞는다

export default function PostGrid({ posts, locale, cols = 3 }: { posts: P[]; locale: Locale; cols?: keyof typeof COLS }) {
  return (
    <div className={`grid gap-5 sm:grid-cols-2 ${COLS[cols]}`}>
      {posts.map((p, i) => (
        <Reveal key={p.id} index={i} className="row-span-4 grid grid-rows-subgrid gap-y-1.5"><PostCard post={p} locale={locale} size={cols === 4 ? 'sm' : 'md'} /></Reveal>
      ))}
    </div>
  );
}
