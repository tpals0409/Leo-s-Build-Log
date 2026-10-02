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
const sql = (g.sql ??= postgres(process.env.DATABASE_URL!, { onnotice: () => {} })); // schema.sql의 'already exists' 알림 끔
// 마이그레이션 도구 없음: 첫 쿼리 전에 schema.sql 한 번 실행
const ready = () => (g.ready ??= sql.unsafe(readFileSync(path.join(process.cwd(), 'db/schema.sql'), 'utf8')));

const cardCols = sql`p.id, p.slug, p.category, p.project, p.tags, p.thumbnail, p.featured, p.published, p.created_at, t.title, t.summary`;
const fromLocale = (locale: Locale) => sql`posts p join post_translations t on t.post_id = p.id and t.locale = ${locale}`;

export async function getHome(locale: Locale) {
  await ready();
  // 대표 글은 최신 5편까지 슬라이드 — 더 오래된 featured는 최신 글 목록으로 돌아간다
  const featured = await sql<PostCard[]>`
    select ${cardCols} from ${fromLocale(locale)} where p.published and p.featured
    order by p.created_at desc limit 5`;
  const latest = await sql<PostCard[]>`
    select ${cardCols} from ${fromLocale(locale)} where p.published and not (p.id = any(${featured.map((p) => p.id)}::int[]))
    order by p.created_at desc limit 3`;
  return { featured, latest };
}

type Filter = { category?: string; project?: string; q?: string };
const filterSql = (f: Filter) => {
  const like = `%${(f.q ?? '').replace(/[\\%_]/g, '\\$&')}%`;
  return sql`
    where p.published
      and (${f.category ?? ''} = '' or p.category = ${f.category ?? ''})
      and (${f.project ?? ''} = '' or p.project = ${f.project ?? ''})
      and (${f.q ?? ''} = '' or t.title ilike ${like} or t.plain_text ilike ${like})`;
};

export async function listPosts(locale: Locale, f: Filter = {}, page: { limit?: number; offset?: number } = {}) {
  await ready();
  return sql<PostCard[]>`
    select ${cardCols} from ${fromLocale(locale)} ${filterSql(f)}
    order by p.created_at desc limit ${page.limit ?? 100} offset ${page.offset ?? 0}`;
}

export async function countPosts(locale: Locale, f: Filter = {}) {
  await ready();
  const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from ${fromLocale(locale)} ${filterSql(f)}`;
  return n;
}

export async function getPost(slug: string, locale: Locale) {
  await ready();
  const [post] = await sql<Post[]>`
    select ${cardCols}, t.html from ${fromLocale(locale)} where p.slug = ${slug} and p.published`;
  return post;
}

// 글 아래 이전(더 오래된)·다음(더 새로운) 글. 같은 시각이면 id로 순서를 정한다
export async function getAdjacent(post: Post, locale: Locale) {
  await ready();
  const [prev] = await sql<PostCard[]>`
    select ${cardCols} from ${fromLocale(locale)} where p.published and (p.created_at, p.id) < (${post.created_at}, ${post.id})
    order by p.created_at desc, p.id desc limit 1`;
  const [next] = await sql<PostCard[]>`
    select ${cardCols} from ${fromLocale(locale)} where p.published and (p.created_at, p.id) > (${post.created_at}, ${post.id})
    order by p.created_at, p.id limit 1`;
  return { prev, next };
}

// sitemap용: 발행된 글 주소와 수정일
export async function listSlugs() {
  await ready();
  return sql<{ slug: string; project: string | null; updated_at: Date }[]>`
    select slug, project, updated_at from posts where published order by created_at desc`;
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
      insert into posts (slug, category, project, tags, thumbnail, featured, published, created_at)
      values (${p.slug}, ${p.category}, ${p.project}, ${p.tags}, ${p.thumbnail}, ${p.featured}, ${p.published},
              coalesce(${p.publishedAt}::timestamptz, now()))
      on conflict (slug) do update set
        category = excluded.category, project = excluded.project, tags = excluded.tags,
        thumbnail = excluded.thumbnail, featured = excluded.featured, published = excluded.published,
        -- publishedAt을 주면 날짜 정정, 생략하면 기존 발행일 유지
        created_at = coalesce(${p.publishedAt}::timestamptz, posts.created_at),
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


export async function deletePost(slug: string) {
  await ready();
  const r = await sql`delete from posts where slug = ${slug}`;
  return r.count > 0;
}
