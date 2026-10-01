import { cookieAttrs, googleClaimsOk, googleRedirectUri, makeSession, SESSION_AGE, SESSION_COOKIE } from '@/lib/auth';

const back = (req: Request, error?: string, session?: string) => {
  const headers = new Headers({ location: `/admin${error ? `?error=${error}` : ''}` });
  headers.append('set-cookie', `oauth_google=; ${cookieAttrs(req, 0)}`);
  if (session) headers.append('set-cookie', `${SESSION_COOKIE}=${session}; ${cookieAttrs(req, SESSION_AGE)}`);
  return new Response(null, { status: 302, headers });
};

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const [state, verifier] = req.headers.get('cookie')?.match(/(?:^|;\s*)oauth_google=([^;]+)/)?.[1].split('.') ?? [];
  if (!state || !verifier || q.get('state') !== state || !q.get('code')) return back(req, 'state');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      code: q.get('code')!,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: googleRedirectUri(),
      grant_type: 'authorization_code',
      code_verifier: verifier,
    }),
  });
  const idToken: string | undefined = res.ok ? (await res.json()).id_token : undefined;
  let claims = {};
  try {
    claims = JSON.parse(Buffer.from(idToken?.split('.')[1] ?? '', 'base64url').toString());
  } catch {}
  if (!googleClaimsOk(claims)) return back(req, 'denied');
  return back(req, undefined, makeSession());
}
