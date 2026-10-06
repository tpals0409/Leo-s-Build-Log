import { answer, chatEnabled, rateLimited, type ChatMessage } from '@/lib/chat';
import { LOCALES, type Locale } from '@/lib/i18n';

// 챗봇 API. 요청·응답 형식은 components/ChatWidget.tsx 맨 위 주석, 구현은 lib/chat.ts.
const MAX_LEN = 500;

export async function POST(req: Request) {
  if (!chatEnabled()) return new Response(null, { status: 503 });
  const body = (await req.json().catch(() => null)) as { locale?: string; messages?: ChatMessage[] } | null;
  const locale = body?.locale as Locale;
  const msgs = body?.messages;
  const valid = LOCALES.includes(locale) && Array.isArray(msgs) && msgs.length > 0 && msgs.length <= 20 && msgs.at(-1)?.role === 'user'
    && msgs.every((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.length <= (m.role === 'user' ? MAX_LEN : 4000));
  if (!valid) return Response.json({ error: 'bad request' }, { status: 400 });

  // Traefik이 붙여 주는 원래 주소(맨 앞). 없으면(로컬) 하나로 묶인다
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';
  if (rateLimited(ip)) return Response.json({ error: 'rate limited' }, { status: 429 });

  try {
    const stream = await answer(locale, msgs.map(({ role, content }) => ({ role, content })));
    return new Response(stream, { headers: { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store' } });
  } catch (e) {
    console.error('chat:', e);
    // pgvector 없음·키 오류 등 준비 안 됨은 503("준비 중"), 그 밖은 502("다시 시도")
    const msg = String(e);
    return new Response(null, { status: /vector|extension|401|403/.test(msg) ? 503 : 502 });
  }
}
