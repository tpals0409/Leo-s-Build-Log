import type { PostCard as P } from '@/lib/db';
import { ButtonLink } from './ui/Button';
import Eyebrow from './ui/Eyebrow';
import Thumb from './ui/Thumb';

export default function FeaturedHero({ post }: { post: P }) {
  return (
    <section className="grid items-center gap-12 pb-10 pt-8 lg:grid-cols-[5fr_7fr]">
      <div>
        <Eyebrow>Featured</Eyebrow>
        <h1 className="mb-6 mt-4 text-4xl/11 font-bold tracking-[-0.28px] sm:text-5xl/15">{post.title}</h1>
        {post.summary && <p className="mb-9 text-[19px]/[30px] text-secondary">{post.summary}</p>}
        <ButtonLink href={`/posts/${encodeURIComponent(post.slug)}`}>최신 소식 보기 →</ButtonLink>
      </div>
      {/* lg 이상: 오른쪽 화면 끝까지 붙임 */}
      <Thumb src={post.thumbnail}
        className="aspect-[2.1/1] rounded-[18px] lg:w-[calc(100%_+_max(24px,_(100vw_-_var(--container-wrap))_/_2_+_24px))] lg:max-w-none lg:rounded-r-none" />
    </section>
  );
}
