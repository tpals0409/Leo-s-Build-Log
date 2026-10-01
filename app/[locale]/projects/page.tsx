import ProjectGrid from '@/components/ProjectGrid';
import Container from '@/components/ui/Container';
import { DICT } from '@/lib/i18n';
import { localeOf, pageMeta } from '@/lib/page';
import { PROJECTS } from '@/lib/projects';

// 요청 시 렌더: SITE_URL(canonical·OG 주소)을 빌드 때가 아니라 실행 환경에서 읽도록
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const locale = await localeOf(params);
  return pageMeta(locale, '/projects', { title: DICT[locale].projects.title });
}

export default async function ProjectsPage({ params }: Props) {
  const locale = await localeOf(params);
  return (
    <Container className="pb-20">
      <h1 className="pb-8 pt-12 t-section">{DICT[locale].projects.title}</h1>
      <ProjectGrid projects={PROJECTS} locale={locale} />
    </Container>
  );
}
