import { isAdmin } from '@/lib/auth';
import { listAll, upsertPost } from '@/lib/db';
import { htmlToText } from '@/lib/text';

const unauthorized = () => Response.json({ error: 'unauthorized' }, { status: 401 });

export async function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  return Response.json(await listAll());
}

// 생성/수정 (slug 기준 upsert)
export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const b = await req.json().catch(() => null);
  const missing = ['slug', 'title', 'category', 'html'].filter((k) => typeof b?.[k] !== 'string' || !b[k]);
  if (missing.length) return Response.json({ error: `missing: ${missing.join(', ')}` }, { status: 400 });
  if (!/^[a-z0-9가-힣-]+$/.test(b.slug)) return Response.json({ error: 'slug: a-z 0-9 한글 - 만 허용' }, { status: 400 });
  const row = await upsertPost({ ...b, plain_text: htmlToText(b.html) });
  return Response.json({ slug: row.slug, url: `/posts/${encodeURIComponent(row.slug)}` });
}
