import postgres from 'postgres';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Category, Locale } from './i18n';
import type { PostInput } from './postInput';
import { htmlToText } from './text';

// 목록용 (본문 제외). title/summary는 요청한 언어.
export type PostCard = {
  id: number;
  slug: string;
  category: Category;
  project: string | null;
  tags: string[];
  thumbnail: string | null;
  featured: boolean;
  published: boolean;
  created_at: Date;
  title: string;
  summary: string;
};
export type Post = PostCard & { html: string };

const g = globalThis as unknown as { sql?: postgres.Sql; ready?: Promise<unknown> };
const sql = (g.sql ??= postgres(process.env.DATABASE_URL!));
// 마이그레이션 도구 없음: 첫 쿼리 전에 schema.sql 한 번 실행
const ready = () => (g.ready ??= sql.unsafe(readFileSync(path.join(process.cwd(), 'db/schema.sql'), 'utf8')));

const cardCols = sql`p.id, p.slug, p.category, p.project, p.tags, p.thumbnail, p.featured, p.published, p.created_at, t.title, t.summary`;
const fromLocale = (locale: Locale) => sql`posts p join post_translations t on t.post_id = p.id and t.locale = ${locale}`;

export async function getHome(locale: Locale) {
  await ready();
  const [featured] = await sql<PostCard[]>`
    select ${cardCols} from ${fromLocale(locale)} where p.published and p.featured
    order by p.created_at desc limit 1`;
  const latest = await sql<PostCard[]>`
    select ${cardCols} from ${fromLocale(locale)} where p.published and p.id <> ${featured?.id ?? 0}
    order by p.created_at desc limit 3`;
  return { featured, latest };
}

export async function listPosts(locale: Locale, f: { category?: string; project?: string; q?: string } = {}) {
  await ready();
  const like = `%${(f.q ?? '').replace(/[\\%_]/g, '\\$&')}%`;
  return sql<PostCard[]>`
    select ${cardCols} from ${fromLocale(locale)}
    where p.published
      and (${f.category ?? ''} = '' or p.category = ${f.category ?? ''})
      and (${f.project ?? ''} = '' or p.project = ${f.project ?? ''})
      and (${f.q ?? ''} = '' or t.title ilike ${like} or t.plain_text ilike ${like})
    order by p.created_at desc limit 100`;
}

export async function getPost(slug: string, locale: Locale) {
  await ready();
  const [post] = await sql<Post[]>`
    select ${cardCols}, t.html from ${fromLocale(locale)} where p.slug = ${slug} and p.published`;
  return post;
}

// 관리자용: 미발행 포함, 한글 제목
export async function listAll() {
  await ready();
  return sql<PostCard[]>`select ${cardCols} from ${fromLocale('ko')} order by p.created_at desc`;
}

export async function upsertPost(p: PostInput) {
  await ready();
  return sql.begin(async (tx) => {
    const [row] = await tx<{ id: number; slug: string }[]>`
      insert into posts (slug, category, project, tags, thumbnail, featured, published)
      values (${p.slug}, ${p.category}, ${p.project}, ${p.tags}, ${p.thumbnail}, ${p.featured}, ${p.published})
      on conflict (slug) do update set
        category = excluded.category, project = excluded.project, tags = excluded.tags,
        thumbnail = excluded.thumbnail, featured = excluded.featured, published = excluded.published,
        updated_at = now()
      returning id, slug`;
    for (const locale of ['ko', 'en'] as const) {
      const t = p[locale];
      await tx`
        insert into post_translations (post_id, locale, title, summary, html, plain_text)
        values (${row.id}, ${locale}, ${t.title}, ${t.summary}, ${t.html}, ${htmlToText(t.html)})
        on conflict (post_id, locale) do update set
          title = excluded.title, summary = excluded.summary, html = excluded.html, plain_text = excluded.plain_text`;
    }
    return row;
  });
}

export async function patchPost(slug: string, f: { featured?: boolean; published?: boolean }) {
  await ready();
  const [row] = await sql<{ slug: string }[]>`
    update posts set
      featured = coalesce(${f.featured ?? null}::boolean, featured),
      published = coalesce(${f.published ?? null}::boolean, published),
      updated_at = now()
    where slug = ${slug} returning slug`;
  return row;
}

export async function deletePost(slug: string) {
  await ready();
  const r = await sql`delete from posts where slug = ${slug}`;
  return r.count > 0;
}
