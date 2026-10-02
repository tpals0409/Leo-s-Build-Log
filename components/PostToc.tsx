'use client';
import { useEffect, useState } from 'react';

// 글 오른쪽 목차 (사용자 지정 2026-10-02, 화면 상하 가운데). 본문(Shadow DOM)의 h2를 읽어 만들고, 지금 읽는 소제목만 fg로 진하게.
// 본문 폭(1120) 바깥 오른쪽 여백에 고정 — 여백이 충분한 2xl(1536px) 이상에서만 보인다. 좁은 화면엔 없음.
const OFFSET = 96; // 고정 헤더(60px) 아래 여유 — 목차를 누르면 소제목이 이 높이에 온다

type Item = { el: HTMLElement; text: string };

export default function PostToc({ label }: { label: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const root = document.querySelector('[data-post-body]')?.shadowRoot;
    if (!root) return;
    const list = [...root.querySelectorAll<HTMLElement>('h2')].map((el) => ({ el, text: el.textContent!.trim() }));
    setItems(list);
    // 화면 위 30%를 지난 마지막 소제목이 '지금 읽는 곳'
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(list.findLastIndex((i) => i.el.getBoundingClientRect().top <= Math.max(OFFSET + 1, innerHeight * 0.3))));
    };
    update();
    addEventListener('scroll', update, { passive: true });
    return () => { removeEventListener('scroll', update); cancelAnimationFrame(frame); };
  }, []);

  if (items.length < 2) return null;
  const go = (el: HTMLElement) => {
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - OFFSET, behavior: smooth ? 'smooth' : 'auto' });
  };

  return (
    <nav aria-label={label} className="fixed left-[calc(50%+592px)] top-1/2 hidden max-h-[calc(100vh-10rem)] -translate-y-1/2 w-[calc(50%-624px)] max-w-60 overflow-y-auto 2xl:block">
      <ul className="border-l border-line">
        {items.map((item, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => go(item.el)}
              aria-current={i === active ? 'location' : undefined}
              className={`link-hover -ml-px block w-full border-l-2 py-1 text-left t-body-sm pl-3 ${i === active ? 'border-fg text-fg' : 'border-transparent text-muted'}`}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
