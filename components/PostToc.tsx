'use client';
import { useEffect, useRef, useState } from 'react';

// 글 오른쪽 목차 (사용자 지정 2026-10-02, 화면 상하 가운데). 본문(Shadow DOM)의 h2를 읽어 만들고, 지금 읽는 소제목만 fg로 진하게.
// 본문 폭(1120) 바깥 오른쪽 여백에 고정 — 여백이 충분한 2xl(1536px) 이상에서만 보인다. 좁은 화면엔 없음.
const OFFSET = 96; // 고정 헤더(60px) 아래 여유 — 목차를 누르면 소제목이 이 높이에 온다

type Item = { el: HTMLElement; text: string };

export default function PostToc({ label }: { label: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(-1);
  const nav = useRef<HTMLElement>(null);

  const lock = useRef<number | null>(null); // 목차를 눌러 이동하는 동안 고정할 항목 (스크롤 중간 항목이 깜빡이지 않게)

  useEffect(() => {
    const root = document.querySelector('[data-post-body]')?.shadowRoot;
    if (!root) return;
    const list = [...root.querySelectorAll<HTMLElement>('h2')].map((el) => ({ el, text: el.textContent!.trim() }));
    setItems(list);
    // '지금 읽는 곳' = 기준선을 지난 마지막 소제목. 기준선은 평소 화면 위 30%,
    // 페이지 끝 한 화면 안에서는 바닥까지 내려간다 — 짧은 마지막 절들도 차례로 켜지고, 맨 끝에선 마지막 소제목.
    const update = () => {
      if (lock.current !== null) return;
      const rest = document.documentElement.scrollHeight - scrollY - innerHeight; // 아래로 남은 스크롤
      const near = Math.min(1, Math.max(0, 1 - rest / innerHeight)); // 끝에서 한 화면 안: 0 → 1
      const line = Math.max(OFFSET + 1, innerHeight * (0.3 + 0.7 * near));
      setActive(list.findLastIndex((i) => i.el.getBoundingClientRect().top <= line)); // 소제목 몇 개 위치만 읽어서 스크롤마다 바로 계산해도 가볍다
    };
    const release = () => { if (lock.current !== null) { lock.current = null; update(); } };
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update, { passive: true });
    addEventListener('scrollend', release);
    // 손으로 스크롤하면 고정을 바로 푼다
    const manual = () => release();
    addEventListener('wheel', manual, { passive: true });
    addEventListener('touchstart', manual, { passive: true });
    addEventListener('keydown', manual);
    return () => {
      for (const [e, h] of [['scroll', update], ['resize', update], ['scrollend', release], ['wheel', manual], ['touchstart', manual], ['keydown', manual]] as const) removeEventListener(e, h);
    };
  }, []);

  // 목차가 화면보다 길면 목차 안에서만 스크롤 — 지금 항목이 목차 밖으로 나가면 따라 내린다(페이지는 건드리지 않음)
  useEffect(() => {
    const box = nav.current;
    const el = box?.querySelectorAll('button')[active];
    if (!box || !el) return;
    if (el.offsetTop < box.scrollTop) box.scrollTop = el.offsetTop;
    else if (el.offsetTop + el.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = el.offsetTop + el.offsetHeight - box.clientHeight;
  }, [active]);

  if (items.length < 2) return null;
  const go = (i: number) => {
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    // 누른 항목을 바로 켜고, 이동이 끝날 때까지(scrollend, 없으면 1초) 그대로 둔다
    lock.current = i;
    setActive(i);
    setTimeout(() => { if (lock.current === i) { lock.current = null; } }, smooth ? 1000 : 50);
    scrollTo({ top: items[i].el.getBoundingClientRect().top + scrollY - OFFSET, behavior: smooth ? 'smooth' : 'auto' });
  };

  return (
    <nav ref={nav} aria-label={label} className="fixed left-[calc(50%+592px)] top-1/2 hidden max-h-[calc(100vh-10rem)] -translate-y-1/2 w-[calc(50%-624px)] max-w-60 overflow-y-auto overflow-x-hidden [overflow-wrap:anywhere] [scrollbar-width:none] 2xl:block">
      <ul className="border-l border-line">
        {items.map((item, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => go(i)}
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
