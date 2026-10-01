import { tokenOk } from '@/lib/auth';

export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}));
  if (!tokenOk(token)) return Response.json({ error: 'wrong token' }, { status: 401 });
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  return new Response(null, {
    status: 204,
    headers: { 'set-cookie': `admin_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${secure}` },
  });
}
