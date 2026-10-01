import type { Locale } from '@/lib/i18n';
import type { Project } from '@/lib/projects';
import ProjectCard from './ProjectCard';
import Reveal from './ui/Reveal';

export default function ProjectGrid({ projects, locale }: { projects: Project[]; locale: Locale }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {projects.map((p, i) => (
        <Reveal key={p.slug} index={i}><ProjectCard project={p} locale={locale} /></Reveal>
      ))}
    </div>
  );
}
