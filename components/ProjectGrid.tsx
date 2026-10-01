import type { Locale } from '@/lib/i18n';
import type { Project } from '@/lib/projects';
import ProjectCard from './ProjectCard';

export default function ProjectGrid({ projects, locale }: { projects: Project[]; locale: Locale }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {projects.map((p) => <ProjectCard key={p.slug} project={p} locale={locale} />)}
    </div>
  );
}
