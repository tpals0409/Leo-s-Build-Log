import type { PostCard as P } from '@/lib/db';
import PostCard from './PostCard';

const COLS = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' };

export default function PostGrid({ posts, cols = 3 }: { posts: P[]; cols?: keyof typeof COLS }) {
  return (
    <div className={`grid gap-5 sm:grid-cols-2 ${COLS[cols]}`}>
      {posts.map((p) => <PostCard key={p.id} post={p} size={cols === 4 ? 'sm' : 'md'} />)}
    </div>
  );
}
