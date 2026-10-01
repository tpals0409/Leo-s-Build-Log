import { timingSafeEqual, createHash, createHmac } from 'node:crypto';

// 인증 두 갈래: API(스크립트·에이전트)는 Bearer ADMIN_TOKEN, 브라우저 /admin은 Google 로그인 → 서명된 세션 쿠키.
const hash = (s: string) => createHash('sha256').update(s).digest();

export function tokenOk(token: string | undefined | null, expected = process.env.ADMIN_TOKEN): boolean {
  if (!expected || !token) return false;
  return timingSafeEqual(hash(token), hash(expected));
}

// 세션 쿠키 = "만료시각.서명". 서명 키는 ADMIN_TOKEN에서 파생 → 비밀 하나 덜 관리, 토큰을 바꾸면 세션도 전부 끊긴다.
export const SESSION_COOKIE = 'admin_session';
export const SESSION_AGE = 60 * 60 * 24 * 30;
const sign = (exp: string, secret: string) => createHmac('sha256', `session:${secret}`).update(exp).digest('base64url');

export function makeSession(now = Date.now(), secret = process.env.ADMIN_TOKEN): string {
  if (!secret) throw new Error('ADMIN_TOKEN 필요');
  const exp = String(Math.floor(now / 1000) + SESSION_AGE);
  return `${exp}.${sign(exp, secret)}`;
}

export function sessionOk(value: string | undefined | null, now = Date.now(), secret = process.env.ADMIN_TOKEN): boolean {
  if (!secret || !value) return false;
  const [exp, sig] = value.split('.');
  if (!exp || !sig || !(Number(exp) > now / 1000)) return false;
  return timingSafeEqual(hash(sig), hash(sign(exp, secret)));
}

export function isAdmin(req: Request): boolean {
  if (tokenOk(req.headers.get('authorization')?.replace(/^Bearer /, ''))) return true;
  return sessionOk(req.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`))?.[1]);
}

// Google ID 토큰의 내용 검사. 토큰은 Google 토큰 엔드포인트에서 TLS로 직접 받으므로 서명 검증 대신 TLS를 믿는다(OIDC Core 3.1.3.7-6).
export function googleClaimsOk(
  c: { iss?: string; aud?: string; exp?: number; email?: string; email_verified?: boolean },
  clientId = process.env.GOOGLE_CLIENT_ID,
  adminEmail = process.env.ADMIN_EMAIL,
  now = Date.now(),
): boolean {
  if (!clientId || !adminEmail) return false;
  return (
    (c.iss === 'https://accounts.google.com' || c.iss === 'accounts.google.com') &&
    c.aud === clientId &&
    typeof c.exp === 'number' && c.exp > now / 1000 &&
    c.email_verified === true &&
    c.email?.toLowerCase() === adminEmail.trim().toLowerCase()
  );
}

// 프록시(Caddy·Ingress) 뒤에선 앱이 http로 받으므로 x-forwarded-proto를 본다. 로컬 http에선 Secure 없이.
export function cookieAttrs(req: Request, maxAge: number): string {
  const proto = req.headers.get('x-forwarded-proto') ?? new URL(req.url).protocol.replace(':', '');
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${proto === 'https' ? '; Secure' : ''}`;
}

export const googleRedirectUri = () => `${process.env.SITE_URL ?? 'http://localhost:3000'}/api/auth/google/callback`;
