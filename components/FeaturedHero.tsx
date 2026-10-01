import Link from 'next/link';
import type { PostCard as P } from '@/lib/db';
import { DICT, type Locale } from '@/lib/i18n';
import Eyebrow from './ui/Eyebrow';
import Thumb from './ui/Thumb';

// 대표 글: 영역 전체가 링크. 썸네일을 가득 채우고 왼쪽을 흰 그라데이션으로 덮어 그 위에 제목 (lg 이상).
// 좁은 화면은 겹칠 자리가 없어 썸네일 아래에 제목.
export default function FeaturedHero({ post, locale }: { post: P; locale: Locale }) {
  return (
    <Link href={`/${locale}/posts/${post.slug}`} className="group press-card relative mb-10 mt-8 block">
      <div className="overflow-hidden rounded-panel">
        <Thumb src={post.thumbnail} className="thumb-zoom aspect-2/1 lg:aspect-[12/5]" />
      </div>
      <div className="pt-6 lg:absolute lg:inset-y-0 lg:left-0 lg:flex lg:w-full lg:items-center lg:bg-linear-to-r lg:from-surface/90 lg:via-surface/70 lg:via-40% lg:to-transparent lg:to-75% lg:pl-12 lg:pt-0">
        <div className="lg:w-2/5">
          <Eyebrow>{DICT[locale].home.featured}</Eyebrow>
          <h1 className="mb-4 mt-3 t-section">{post.title}</h1>
          {post.summary && <p className="t-body text-secondary">{post.summary}</p>}
        </div>
      </div>
    </Link>
  );
}
