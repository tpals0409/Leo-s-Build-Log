import Link from 'next/link';
import type { PostCard as P } from '@/lib/db';
import type { Locale } from '@/lib/i18n';
import { PostMeta } from './PostCard';
import ClampTitle from './ui/ClampTitle';
import Thumb from './ui/Thumb';

// 글 목록의 리스트 보기: 왼쪽 작은 썸네일 + 오른쪽 카테고리·날짜 / 제목 / 요약. 줄 사이는 가는 선.
// 상호작용은 카드와 같다(올리면 썸네일 확대·제목 툴팁, 누르면 살짝 눌림).
export default function PostList({ posts, locale }: { posts: P[]; locale: Locale }) {
  return (
    <ul className="border-b border-line">
      {posts.map((post) => (
        <li key={post.id} className="border-t border-line">
          <Link href={`/${locale}/posts/${post.slug}`} className="group press-card flex items-center gap-5 py-5">
            <span className="w-28 shrink-0 overflow-hidden rounded-card sm:w-40">
              <Thumb src={post.thumbnail} sizes="(min-width: 640px) 160px, 112px" className="thumb-zoom aspect-3/2" />
            </span>
            <span className="flex min-w-0 flex-col gap-1.5">
              <PostMeta post={post} locale={locale} />
              <ClampTitle title={post.title} className="t-body sm:t-tile" />
              <span className="line-clamp-1 t-body-sm text-muted max-sm:hidden">{post.summary}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
