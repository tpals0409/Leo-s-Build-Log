'use client';
import { useEffect, useRef, useState } from 'react';
import { DICT, type Locale } from '@/lib/i18n';
import Button from './ui/Button';

// 챗봇(레오에 대해 물어보기): 모든 페이지 오른쪽 아래 버튼 → 넓은 화면은 오른쪽 아래 창, 좁은 화면은 전체 화면.
// 레이아웃에 있어 페이지를 옮겨도 대화가 남는다(새로고침하면 사라짐). 여닫는 효과는 없음(정해진 등장 움직임 밖).
//
// API 약속 (app/api/chat/route.ts — 백엔드는 서버 쪽에서 구현):
//   POST /api/chat  { locale: 'ko'|'en', messages: { role: 'user'|'assistant', content: string }[] }  (마지막이 이번 질문)
//   200 → application/x-ndjson, 한 줄에 하나:  {"type":"text","text":"…"} (이어 붙임)  ·  {"type":"sources","items":[{"title":"…","href":"/ko/posts/…"}]}
//   429 → 요청 제한("잠시 뒤에"), 503 → 준비 중, 그 밖 → 실패. 블로그와 무관한 질문의 거절은 답 글(text)로 온다.
type Source = { title: string; href: string };
type Msg = { role: 'user' | 'assistant'; content: string; sources?: Source[]; error?: boolean };

export default function ChatWidget({ locale }: { locale: Locale }) {
  const t = DICT[locale].chat;
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); }, [msgs]);

  const close = () => (setOpen(false), toggleRef.current?.focus());
  const patchLast = (f: (m: Msg) => Msg) => setMsgs((ms) => [...ms.slice(0, -1), f(ms[ms.length - 1])]);

  async function ask(q: string) {
    q = q.trim();
    if (!q || busy) return;
    const history = [...msgs.filter((m) => !m.error), { role: 'user' as const, content: q }];
    setMsgs([...msgs, { role: 'user', content: q }, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ locale, messages: history.map(({ role, content }) => ({ role, content })) }),
      });
      if (!res.ok || !res.body) {
        const text = res.status === 429 ? t.rateLimited : res.status === 503 || res.status === 404 ? t.unavailable : t.failed;
        return patchLast(() => ({ role: 'assistant', content: text, error: true }));
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines.filter(Boolean)) {
          const ev = JSON.parse(line) as { type: 'text'; text: string } | { type: 'sources'; items: Source[] };
          patchLast((m) => (ev.type === 'text' ? { ...m, content: m.content + ev.text } : { ...m, sources: ev.items }));
        }
      }
    } catch {
      patchLast(() => ({ role: 'assistant', content: t.failed, error: true }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-label={t.title}
          data-chat-open
          onKeyDown={(e) => e.key === 'Escape' && close()}
          className="fixed inset-0 z-40 flex flex-col bg-surface sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[min(600px,calc(100dvh-8rem))] sm:w-[380px] sm:rounded-card sm:border sm:border-line"
        >
          <header className="flex items-center gap-3 border-b border-line px-4 py-3">
            <img src="/logo.webp" alt="" width={32} height={32} className="size-8" />
            <div className="min-w-0 flex-1">
              <p className="t-body text-fg">{t.title}</p>
              <p className="t-caption text-muted">{t.sub}</p>
            </div>
            <button type="button" onClick={close} aria-label={t.close} className="press p-2 text-secondary">
              <Icon d="M6 6l12 12M18 6L6 18" />
            </button>
          </header>

          <div ref={listRef} aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4">
            <Bubble role="assistant">{t.greeting}</Bubble>
            {msgs.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {t.suggestions.map((s) => <Button key={s} variant="outline" size="sm" onClick={() => ask(s)}>{s}</Button>)}
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <Bubble role={m.role} muted={m.error || !m.content}>{m.content || t.thinking}</Bubble>
                {m.sources && m.sources.length > 0 && (
                  <div className="flex flex-col gap-1 px-1">
                    <p className="t-caption text-muted">{t.sources}</p>
                    {m.sources.map((s) => <a key={s.href} href={s.href} className="link-hover t-body-sm text-fg underline">{s.title}</a>)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={(e) => (e.preventDefault(), ask(input))} className="flex gap-2 border-t border-line p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              maxLength={500}
              className="h-11 min-w-0 flex-1 rounded-pill border border-line bg-surface px-4 t-body-sm text-fg placeholder:text-muted"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label={t.send} className="press primary-hover grid size-11 shrink-0 place-items-center rounded-pill bg-primary text-on-primary disabled:opacity-40">
              <Icon d="M12 19V5M5 12l7-7 7 7" />
            </button>
          </form>
        </section>
      )}

      <button
        ref={toggleRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? t.close : t.open}
        aria-expanded={open}
        className={`press primary-hover fixed bottom-5 right-5 z-40 size-14 place-items-center rounded-pill bg-primary text-on-primary ${open ? 'hidden sm:grid' : 'grid'}`}
      >
        <Icon big d={open ? 'M6 6l12 12M18 6L6 18' : 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z'} />
      </button>
    </>
  );
}

// 말풍선: 내 질문은 주황(primary), 답은 fog. 모서리는 카드 반지름(이미지 전용 규칙의 예외, DESIGN.md §8)
function Bubble({ role, muted, children }: { role: Msg['role']; muted?: boolean; children: React.ReactNode }) {
  const tone = role === 'user' ? 'self-end bg-primary text-on-primary' : `self-start bg-fog ${muted ? 'text-muted' : 'text-fg'}`;
  return <p className={`max-w-[85%] whitespace-pre-wrap rounded-card px-3.5 py-2.5 t-body-sm ${tone}`}>{children}</p>;
}

function Icon({ d, big }: { d: string; big?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={big ? 'size-7' : 'size-5'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
