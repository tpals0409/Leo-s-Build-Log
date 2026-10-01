import { timingSafeEqual, createHash } from 'node:crypto';

const hash = (s: string) => createHash('sha256').update(s).digest();

export function tokenOk(token: string | undefined | null, expected = process.env.ADMIN_TOKEN): boolean {
  if (!expected || !token) return false;
  return timingSafeEqual(hash(token), hash(expected));
}

export function isAdmin(req: Request): boolean {
  const bearer = req.headers.get('authorization')?.replace(/^Bearer /, '');
  const cookie = req.headers.get('cookie')?.match(/(?:^|;\s*)admin_token=([^;]+)/)?.[1];
  return tokenOk(bearer) || tokenOk(cookie && decodeURIComponent(cookie));
}
