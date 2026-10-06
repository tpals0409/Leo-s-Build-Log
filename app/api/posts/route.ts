import { isAdmin } from '@/lib/auth';
import { refreshIndex } from '@/lib/chat';
import { listAll, upsertPost } from '@/lib/db';
import { parsePostInput } from '@/lib/postInput';

const unauthorized = () => Response.json({ error: 'unauthorized' }, { status: 401 });

export async function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  return Response.json(await listAll());
}

// 생성/수정 (slug 기준 upsert). ko/en 둘 다 필수 — 형식은 README.
export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const parsed = parsePostInput(await req.json().catch(() => null));
  if (!parsed.ok) return Response.json({ errors: parsed.errors }, { status: 400 });
  const row = await upsertPost(parsed.value);
  refreshIndex(); // 챗봇 색인: 바뀐 글만 다시 임베딩 (뒤에서)
  return Response.json({ slug: row.slug, urls: [`/ko/posts/${row.slug}`, `/en/posts/${row.slug}`] });
}
