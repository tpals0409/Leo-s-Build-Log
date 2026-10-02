import Link from 'next/link';
import { notFound } from 'next/navigation';
import PostBody from '@/components/PostBody';
import PostToc from '@/components/PostToc';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Thumb from '@/components/ui/Thumb';
import ClampTitle from '@/components/ui/ClampTitle';
import { getAdjacent, getPost, type PostCard as PostCardData } from '@/lib/db';
import { DICT, fmtDate, type Locale } from '@/lib/i18n';
import { localeOf, pageMeta } from '@/lib/page';
import { getProject } from '@/lib/projects';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const locale = await localeOf(params);
  const post = await getPost(slug, locale);
  return post ? pageMeta(locale, `/posts/${slug}`, { title: post.title, description: post.summary, type: 'article', ownImage: true }) : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const locale = await localeOf(params);
  const post = await getPost(slug, locale);
  if (!post) notFound();
  const project = post.project ? getProject(post.project) : undefined;
  const { prev, next } = await getAdjacent(post, locale);
  const t = DICT[locale].posts;

  return (
    <article className="pb-20">
      <div aria-hidden className="read-progress fixed inset-x-0 top-0 z-20 h-0.5 bg-primary" />
      {/* 썸네일을 살짝 흐리게 깔고 흰 막(60%)을 얹어 그 위에 제목 (사용자 지정 2026-10-02).
          흐리게 깔아서 작은 사본(sizes 240px → 480~800w)으로 충분. 이미지 위 글자는 전부 fg(가장 어두운 썸네일에서도 6:1), 링크는 fg+밑줄 — AGENTS.md '이미지 위 글자' 규칙. 높이는 글자에 맞춤 → 모바일에서도 첫 문단이 첫 화면에 */}
      <Container className={post.thumbnail ? 'pb-14 pt-8' : 'pb-14 pt-14'}>
        <header className={post.thumbnail ? 'relative isolate overflow-hidden rounded-panel px-6 py-14 text-center' : 'text-center'}>
          {post.thumbnail && (
            <>
              <Thumb src={post.thumbnail} eager sizes="240px" className="absolute inset-0 -z-10 h-full scale-105 blur-xs" />
              <div aria-hidden className="absolute inset-0 -z-10 bg-surface/60" />
            </>
          )}
          <Eyebrow tone={post.thumbnail ? 'text-fg' : 'text-label'}>{DICT[locale].category[post.category]}</Eyebrow>
          <h1 className="mb-4 mt-3 t-section">{post.title}</h1>
          <p className={`t-body-sm ${post.thumbnail ? 'text-fg' : 'text-muted'}`}>
            <time dateTime={post.created_at.toISOString()}>{fmtDate(post.created_at, locale)}</time>
            {project && <> · <Link href={`/${locale}/projects/${project.slug}`} className={`tap ${post.thumbnail ? 'text-fg underline' : 'text-link'}`}>{project.name[locale]}</Link></>}
          </p>
          {post.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap justify-center gap-2">
              {post.tags.map((tag) => <li key={tag} className="rounded-pill bg-fog px-3 py-1 t-caption text-secondary">#{tag}</li>)}
            </ul>
          )}
        </header>
      </Container>
      <PostBody html={post.html} locale={locale} />
      <PostToc label={t.toc} />
      {(prev || next) && (
        <Container>
          {/* 본문 끝: 가는 선 아래 두 칸. 글 맨 위 제목 영역처럼 흐린 썸네일 위에 글자(사용자 지정 2026-10-02). 이전 = 더 오래된 글(왼쪽), 다음 = 더 새로운 글(오른쪽) */}
          <nav aria-label={t.nav} className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-10 sm:gap-5">
            {prev ? <Adjacent post={prev} locale={locale} label={t.prev} /> : <Edge text={t.first} />}
            {next ? <Adjacent post={next} locale={locale} label={t.next} end /> : <Edge text={t.latest} />}
          </nav>
        </Container>
      )}
    </article>
  );
}

// 이전·다음 글: 글 맨 위 제목 영역과 같은 모양 — 흐린 썸네일 + 흰 막(60%) 위에 글자. 이미지 위 글자는 전부 fg (AGENTS.md '이미지 위 글자').
// 휴대폰에서도 좌우 두 칸(왼쪽 이전·오른쪽 다음) — 위아래로 쌓으면 방향이 안 읽힌다. 좁으면 글자·여백만 줄인다.
// '← 이전 글' / '다음 글 →'은 제목 길이와 상관없이 카드 맨 위에 고정, 다음 글은 오른쪽 정렬.
// 올리면 화살표가 가리키는 쪽으로 움직이고(arrow) 썸네일이 살짝 확대, 누르면 살짝 눌림(press-card).
function Adjacent({ post, locale, label, end }: { post: PostCardData; locale: Locale; label: string; end?: boolean }) {
  return (
    <Link href={`/${locale}/posts/${post.slug}`}
      className={`group press-card relative isolate flex min-h-44 flex-col gap-2 overflow-hidden rounded-panel p-4 sm:gap-3 sm:p-6 ${end ? 'items-end text-right' : ''}`}>
      <span aria-hidden className="absolute inset-0 -z-10 scale-105">
        <Thumb src={post.thumbnail} sizes="240px" className="thumb-zoom h-full blur-xs" />
      </span>
      <span aria-hidden className="absolute inset-0 -z-10 bg-surface/60" />
      {/* 맨 위 고정: 꺾쇠 화살표(감싸는 원 없이) + 이전/다음 글. 올리면 화살표가 가리키는 쪽으로 */}
      <span className={`flex items-center gap-1 t-body-sm text-fg sm:gap-2 sm:t-body ${end ? 'flex-row-reverse' : ''}`}>
        <svg aria-hidden viewBox="0 0 24 24" className={`size-5 shrink-0 sm:size-6 ${end ? 'arrow' : 'arrow-back'}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={end ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
        </svg>
        {label}
      </span>
      <ClampTitle title={post.title} className="t-body text-fg sm:t-tile" />
      <time dateTime={post.created_at.toISOString()} className="mt-auto t-caption text-fg">{fmtDate(post.created_at, locale)}</time>
    </Link>
  );
}

// 이전·다음 글이 없는 쪽: 빈 칸 대신 '가장 처음/최신 글' 안내. 상자 없이 글자만, 카드가 있을 자리의 한가운데.
function Edge({ text }: { text: string }) {
  return <p className="flex items-center justify-center p-4 text-center t-body-sm text-muted sm:t-body">{text}</p>;
}
