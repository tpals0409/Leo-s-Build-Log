import type { PostCard as P } from '@/lib/db';
import type { Locale } from '@/lib/i18n';
import PostCard from './PostCard';

const COLS = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' };

export default function PostGrid({ posts, locale, cols = 3 }: { posts: P[]; locale: Locale; cols?: keyof typeof COLS }) {
  return (
    <div className={`grid gap-5 sm:grid-cols-2 ${COLS[cols]}`}>
      {posts.map((p) => (
        <div key={p.id}><PostCard post={p} locale={locale} size={cols === 4 ? 'sm' : 'md'} /></div>
      ))}
    </div>
  );
}
