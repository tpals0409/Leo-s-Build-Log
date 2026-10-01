import { notFound } from 'next/navigation';
import PostGrid from '@/components/PostGrid';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Thumb from '@/components/ui/Thumb';
import { listPosts } from '@/lib/db';
import { DICT } from '@/lib/i18n';
import { localeOf, pageMeta } from '@/lib/page';
import { getProject } from '@/lib/projects';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const locale = await localeOf(params);
  const project = getProject(slug);
  return project ? pageMeta(locale, `/projects/${slug}`, { title: project.name, description: project.summary[locale] }) : {};
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const locale = await localeOf(params);
  const project = getProject(slug);
  if (!project) notFound();
  const t = DICT[locale].projects;
  const posts = await listPosts(locale, { project: slug });

  return (
    <Container className="pb-20">
      <h1 className="pb-4 pt-12 t-title1 font-bold">{project.name}</h1>
      <p className="mb-8 t-body-lg text-secondary">{project.summary[locale]}</p>
      <Thumb src={project.image} className="mb-12 aspect-[2.1/1] rounded-panel" />
      <SectionHeader title={t.posts} />
      {posts.length ? <PostGrid posts={posts} locale={locale} /> : <p className="py-12 text-muted">{t.noPosts}</p>}
    </Container>
  );
}
