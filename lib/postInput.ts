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
  publishedAt: Date | null; // 생략 → 새 글은 지금, 기존 글은 날짜 유지
} & Record<Locale, Translation>;

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

// publishedAt: ISO 8601. 날짜만(2023-07-15)이면 서울 자정, 시각을 쓰면 시간대(Z 또는 ±hh:mm) 필수.
// 실제로 있는 날짜인지(2월 30일 등) 확인하고, 미래 날짜는 예약 발행이 없어서 거절한다.
const ISO = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-](\d{2}):(\d{2})))?$/;
export function parsePublishedAt(v: unknown, now = new Date()): { date: Date | null; error?: string } {
  if (v == null || v === '') return { date: null };
  const m = typeof v === 'string' ? v.trim().match(ISO) : null;
  const fail = (why: string) => ({ date: null, error: `publishedAt: ${why} (예: 2023-07-15 또는 2023-07-15T09:00:00+09:00)` });
  if (!m) return fail('ISO 8601 형식이 아님 — 시각을 쓰면 시간대(Z 또는 +09:00) 필수');
  const [, y, mo, d, hh = '00', mi = '00', ss = '00', , oh = '0', om = '0'] = m;
  const day = new Date(Date.UTC(+y, +mo - 1, +d));
  if (day.getUTCFullYear() !== +y || day.getUTCMonth() !== +mo - 1 || day.getUTCDate() !== +d) return fail(`없는 날짜 ${y}-${mo}-${d}`);
  if (+hh > 23 || +mi > 59 || +ss > 59 || +oh > 14 || +om > 59) return fail('시각·시간대 범위를 벗어남');
  const date = new Date(m[4] ? (v as string).trim() : `${y}-${mo}-${d}T00:00:00+09:00`);
  if (Number.isNaN(date.getTime())) return fail('날짜를 읽을 수 없음');
  if (date.getTime() > now.getTime() + 60_000) return fail('미래 날짜는 받지 않음 (예약 발행 미지원)');
  return { date };
}

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
  const published = parsePublishedAt(b?.publishedAt);
  if (published.error) errors.push(published.error);

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
      publishedAt: published.date,
      ...tr,
    },
  };
}
