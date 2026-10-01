import { notFound } from 'next/navigation';
import { getPost } from '@/lib/db';
import { DICT } from '@/lib/i18n';
import { OG_SIZE, renderOg } from '@/lib/og';
import { localeOf } from '@/lib/page';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Post preview';

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const locale = await localeOf(params);
  const post = await getPost((await params).slug, locale);
  if (!post) notFound();
  return renderOg({ locale, title: post.title, label: DICT[locale].category[post.category] });
}
