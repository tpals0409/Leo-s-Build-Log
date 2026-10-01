import FeaturedHero from '@/components/FeaturedHero';
import PostGrid from '@/components/PostGrid';
import ProjectGrid from '@/components/ProjectGrid';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import { getHome } from '@/lib/db';
import { DICT } from '@/lib/i18n';
import { localeOf } from '@/lib/page';
import { PROJECTS } from '@/lib/projects';

export const dynamic = 'force-dynamic';

// 대표 글 1 → 최신 글 3 → 프로젝트 4 (AGENTS.md 정보 구조)
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await localeOf(params);
  const t = DICT[locale].home;
  const { featured, latest } = await getHome(locale);

  return (
    <Container>
      {featured && <FeaturedHero post={featured} locale={locale} />}

      <section className={featured ? '' : 'pt-12'}>
        <SectionHeader title={t.latest} href={`/${locale}/posts`} linkLabel={t.all} />
        {latest.length ? <PostGrid posts={latest} locale={locale} cols={3} /> : <p className="py-12 text-muted">{t.empty}</p>}
      </section>

      <section className="mt-10 border-t border-line pt-10">
        <SectionHeader title={t.projects} href={`/${locale}/projects`} linkLabel={t.all} />
        <ProjectGrid projects={PROJECTS.slice(0, 4)} locale={locale} />
      </section>
    </Container>
  );
}
