import Link from 'next/link';
import { notFound } from 'next/navigation';
import PostBody from '@/components/PostBody';
import Container from '@/components/ui/Container';
import Eyebrow from '@/components/ui/Eyebrow';
import { getPost } from '@/lib/db';
import { DICT, fmtDate } from '@/lib/i18n';
import { alternates, localeOf } from '@/lib/page';
import { getProject } from '@/lib/projects';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const locale = await localeOf(params);
  const post = await getPost(slug, locale);
  return post ? { title: post.title, description: post.summary, alternates: alternates(locale, `/posts/${slug}`) } : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const locale = await localeOf(params);
  const post = await getPost(slug, locale);
  if (!post) notFound();
  const project = post.project ? getProject(post.project) : undefined;

  return (
    <article>
      <Container className="pb-8 pt-14 text-center">
        <Eyebrow>{DICT[locale].category[post.category]}</Eyebrow>
        <h1 className="mb-4 mt-3 t-headline font-bold">{post.title}</h1>
        <p className="t-body-sm text-muted">
          <time dateTime={post.created_at.toISOString()}>{fmtDate(post.created_at, locale)}</time>
          {project && <> · <Link href={`/${locale}/projects/${project.slug}`} className="text-link">{project.name}</Link></>}
        </p>
        {post.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {post.tags.map((tag) => <li key={tag} className="rounded-pill bg-fog px-3 py-1 t-caption text-secondary">#{tag}</li>)}
          </ul>
        )}
      </Container>
      <PostBody html={post.html} />
    </article>
  );
}
