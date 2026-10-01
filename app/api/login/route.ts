import { tokenOk } from '@/lib/auth';

export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}));
  if (!tokenOk(token)) return Response.json({ error: 'wrong token' }, { status: 401 });
  // 프록시(Caddy 등) 뒤에선 앱이 http로 받으므로 x-forwarded-proto를 본다. 로컬 http에선 Secure 없이(로그인 가능하게).
  const proto = req.headers.get('x-forwarded-proto') ?? new URL(req.url).protocol.replace(':', '');
  const secure = proto === 'https' ? '; Secure' : '';
  return new Response(null, {
    status: 204,
    headers: { 'set-cookie': `admin_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${secure}` },
  });
}
