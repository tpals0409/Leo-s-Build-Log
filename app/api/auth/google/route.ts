import { createHash, randomBytes } from 'node:crypto';
import { cookieAttrs, googleRedirectUri } from '@/lib/auth';

// /admin "Google로 로그인" → Google 동의 화면. state(CSRF)와 PKCE verifier를 10분짜리 쿠키에 담아 콜백에서 대조한다.
export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return new Response('GOOGLE_CLIENT_ID 미설정', { status: 500 });
  const state = randomBytes(16).toString('base64url');
  const verifier = randomBytes(32).toString('base64url');
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleRedirectUri(),
    response_type: 'code',
    scope: 'openid email',
    state,
    code_challenge: createHash('sha256').update(verifier).digest('base64url'),
    code_challenge_method: 'S256',
    ...(process.env.ADMIN_EMAIL && { login_hint: process.env.ADMIN_EMAIL }),
  }).toString();
  return new Response(null, {
    status: 302,
    headers: { location: url.toString(), 'set-cookie': `oauth_google=${state}.${verifier}; ${cookieAttrs(req, 600)}` },
  });
}
