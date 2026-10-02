import { notFound } from 'next/navigation';
import { DICT } from '@/lib/i18n';
import { OG_SIZE, renderOg } from '@/lib/og';
import { localeOf } from '@/lib/page';
import { getProject } from '@/lib/projects';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Project preview';

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const locale = await localeOf(params);
  const project = getProject((await params).slug);
  if (!project) notFound();
  return renderOg({ locale, title: project.name[locale], label: DICT[locale].projects.title });
}
