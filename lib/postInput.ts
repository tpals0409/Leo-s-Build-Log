import { CATEGORIES, LOCALES, type Category, type Locale } from './i18n.ts';
import { getProject } from './projects.ts';
import { validateLeo } from './leo/index.ts';

export type Translation = { title: string; summary: string; html: string };
export type PostInput = {
  slug: string;
  category: Category;
  project: string | null;
  tags: string[];
  thumbnail: string | null;
  featured: boolean;
  published: boolean;
} & Record<Locale, Translation>;

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

// API 본문 검증. 글은 ko/en 둘 다 있어야 한다 (AGENTS.md).
export function parsePostInput(b: any): { ok: true; value: PostInput } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const slug = str(b?.slug);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) errors.push('slug: 영문 소문자·숫자·하이픈 (예: agent-orchestration)');
  if (!CATEGORIES.includes(b?.category)) errors.push(`category: ${CATEGORIES.join(' | ')}`);
  const project = b?.project == null || b.project === '' ? null : str(b.project);
  if (project && !getProject(project)) errors.push(`project: 없는 프로젝트 "${project}"`);
  if (b?.tags != null && !(Array.isArray(b.tags) && b.tags.every((t: unknown) => typeof t === 'string')))
    errors.push('tags: 문자열 배열');

  const tr = {} as Record<Locale, Translation>;
  for (const l of LOCALES) {
    const t = b?.[l];
    if (!str(t?.title) || !str(t?.html)) errors.push(`${l}: { title, html } 필수 (한/영 둘 다 있어야 발행)`);
    else {
      tr[l] = { title: str(t.title), summary: str(t.summary), html: t.html };
      errors.push(...validateLeo(t.html).map((e) => `${l}.html ${e}`)); // 글 컴포넌트 태그 검사
    }
  }

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      slug,
      category: b.category,
      project,
      tags: (b.tags ?? []).map(str).filter(Boolean),
      thumbnail: str(b.thumbnail) || null,
      featured: b.featured === true,
      published: b.published !== false,
      ...tr,
    },
  };
}
