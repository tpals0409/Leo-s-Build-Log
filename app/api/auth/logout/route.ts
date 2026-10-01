import { cookieAttrs, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req: Request) {
  return new Response(null, { status: 204, headers: { 'set-cookie': `${SESSION_COOKIE}=; ${cookieAttrs(req, 0)}` } });
}
