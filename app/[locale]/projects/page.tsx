import ProjectGrid from '@/components/ProjectGrid';
import Container from '@/components/ui/Container';
import { DICT } from '@/lib/i18n';
import { localeOf, pageMeta } from '@/lib/page';
import { PROJECTS } from '@/lib/projects';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const locale = await localeOf(params);
  return pageMeta(locale, '/projects', { title: DICT[locale].projects.title });
}

export default async function ProjectsPage({ params }: Props) {
  const locale = await localeOf(params);
  return (
    <Container className="pb-20">
      <h1 className="pb-8 pt-12 t-title1 font-bold">{DICT[locale].projects.title}</h1>
      <ProjectGrid projects={PROJECTS} locale={locale} />
    </Container>
  );
}
