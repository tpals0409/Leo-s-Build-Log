import type { PostCard as P } from '@/lib/db';
import { DICT, type Locale } from '@/lib/i18n';
import { ButtonLink } from './ui/Button';
import Eyebrow from './ui/Eyebrow';
import Thumb from './ui/Thumb';

export default function FeaturedHero({ post, locale }: { post: P; locale: Locale }) {
  return (
    <section className="grid items-center gap-12 pb-10 pt-8 lg:grid-cols-[5fr_7fr]">
      <div>
        <Eyebrow>{DICT[locale].home.featured}</Eyebrow>
        <h1 className="mb-6 mt-4 t-headline font-bold sm:t-display">{post.title}</h1>
        {post.summary && <p className="mb-9 t-body-lg text-secondary">{post.summary}</p>}
        <ButtonLink href={`/${locale}/posts/${post.slug}`}>{DICT[locale].home.read} →</ButtonLink>
      </div>
      {/* lg 이상: 오른쪽 화면 끝까지 붙임 */}
      <Thumb src={post.thumbnail}
        className="aspect-[2.1/1] rounded-panel lg:w-[calc(100%_+_max(24px,_(100vw_-_var(--container-wrap))_/_2_+_24px))] lg:max-w-none lg:rounded-r-none" />
    </section>
  );
}
