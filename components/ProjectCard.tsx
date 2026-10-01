import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import type { Project } from '@/lib/projects';
import Thumb from './ui/Thumb';

export default function ProjectCard({ project, locale }: { project: Project; locale: Locale }) {
  return (
    <Link href={`/${locale}/projects/${project.slug}`} className="group press-card flex flex-col gap-1.5">
      <div className="mb-3 overflow-hidden rounded-card">
        <Thumb src={project.image} className="thumb-zoom aspect-5/2" />
      </div>
      <h3 className="t-body">{project.name}</h3>
      <p className="t-body-sm text-muted">{project.summary[locale]}</p>
    </Link>
  );
}
