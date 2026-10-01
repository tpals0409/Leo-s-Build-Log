import postgres from 'postgres';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export type Post = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  category: string;
  thumbnail: string | null;
  html: string;
  featured: boolean;
  published: boolean;
  created_at: Date;
};
export type PostCard = Omit<Post, 'html'>;

const g = globalThis as unknown as { sql?: postgres.Sql; ready?: Promise<unknown> };
const sql = (g.sql ??= postgres(process.env.DATABASE_URL!));
// 마이그레이션 도구 없음: 첫 쿼리 전에 schema.sql 한 번 실행
const ready = () => (g.ready ??= sql.unsafe(readFileSync(path.join(process.cwd(), 'db/schema.sql'), 'utf8')));

const cardCols = sql`id, slug, title, summary, category, thumbnail, featured, published, created_at`;

export async function getHome() {
  await ready();
  const [featured] = await sql<PostCard[]>`
    select ${cardCols} from posts where published and featured order by created_at desc limit 1`;
  const rest = await sql<PostCard[]>`
    select ${cardCols} from posts where published and id <> ${featured?.id ?? 0}
    order by created_at desc limit 7`;
  return { featured, latest: rest.slice(0, 3), deeper: rest.slice(3) };
}

export async function getPost(slug: string) {
  await ready();
  const [post] = await sql<Post[]>`select * from posts where slug = ${slug} and published`;
  return post;
}

export async function search(q: string, category?: string) {
  await ready();
  const like = `%${q.replace(/[\\%_]/g, '\\$&')}%`;
  return sql<PostCard[]>`
    select ${cardCols} from posts
    where published
      and (${q} = '' or title ilike ${like} or plain_text ilike ${like})
      and (${category ?? ''} = '' or lower(category) = lower(${category ?? ''}))
    order by created_at desc limit 50`;
}

export async function listAll() {
  await ready();
  return sql<PostCard[]>`select ${cardCols} from posts order by created_at desc`;
}

export type PostInput = {
  slug: string;
  title: string;
  summary?: string;
  category: string;
  thumbnail?: string | null;
  html: string;
  plain_text: string;
  featured?: boolean;
  published?: boolean;
};

export async function upsertPost(p: PostInput) {
  await ready();
  const [row] = await sql<{ slug: string }[]>`
    insert into posts (slug, title, summary, category, thumbnail, html, plain_text, featured, published)
    values (${p.slug}, ${p.title}, ${p.summary ?? ''}, ${p.category}, ${p.thumbnail ?? null},
            ${p.html}, ${p.plain_text}, ${p.featured ?? false}, ${p.published ?? true})
    on conflict (slug) do update set
      title = excluded.title, summary = excluded.summary, category = excluded.category,
      thumbnail = excluded.thumbnail, html = excluded.html, plain_text = excluded.plain_text,
      featured = excluded.featured, published = excluded.published, updated_at = now()
    returning slug`;
  return row;
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
