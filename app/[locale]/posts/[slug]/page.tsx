import Link from 'next/link';
import { notFound } from 'next/navigation';
import PostBody from '@/components/PostBody';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import Thumb from '@/components/ui/Thumb';
import { getPost } from '@/lib/db';
import { DICT, fmtDate } from '@/lib/i18n';
import { localeOf, pageMeta } from '@/lib/page';
import { getProject } from '@/lib/projects';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const locale = await localeOf(params);
  const post = await getPost(slug, locale);
  return post ? pageMeta(locale, `/posts/${slug}`, { title: post.title, description: post.summary, type: 'article' }) : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const locale = await localeOf(params);
  const post = await getPost(slug, locale);
  if (!post) notFound();
  const project = post.project ? getProject(post.project) : undefined;

  return (
    <article className="pb-20">
      <div aria-hidden className="read-progress fixed inset-x-0 top-0 z-20 h-0.5 bg-primary" />
      {/* 썸네일을 살짝 흐리게 깔고 흰 막(60%)을 얹어 그 위에 제목 (사용자 지정 2026-10-02).
          이미지 위 글자는 전부 fg(가장 어두운 썸네일에서도 6:1), 링크는 fg+밑줄 — AGENTS.md '이미지 위 글자' 규칙. 높이는 글자에 맞춤 → 모바일에서도 첫 문단이 첫 화면에 */}
      <Container className={post.thumbnail ? 'pb-14 pt-8' : 'pb-14 pt-14'}>
        <header className={post.thumbnail ? 'relative isolate overflow-hidden rounded-panel px-6 py-14 text-center' : 'text-center'}>
          {post.thumbnail && (
            <>
              <Thumb src={post.thumbnail} className="absolute inset-0 -z-10 h-full scale-105 blur-xs" />
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
    </article>
  );
}
