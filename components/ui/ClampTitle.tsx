'use client';
import { useEffect, useRef } from 'react';

// 카드 제목: 2줄까지 보이고, 카드에 마우스를 올리면 커서 옆 툴팁으로 전체 제목을 보여 준다(잘렸는지와 상관없이 모든 카드)
// (globals.css float-tip, DESIGN.md §8). 커서를 따라 움직이고, 키보드 포커스면 제목 바로 아래에 뜬다.
// 부모 카드(링크)에 group. 툴팁은 aria-hidden — 화면 낭독기는 원래 제목을 그대로 읽는다.
export default function ClampTitle({ title, className = '' }: { title: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const tip = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const t = tip.current!;
    // 화면 밖으로 나가지 않게: 오른쪽 끝이면 왼쪽으로 당기고, 아래가 모자라면 커서 위로
    const place = (x: number, y: number) => {
      t.style.left = `${Math.max(8, Math.min(x + 12, innerWidth - t.offsetWidth - 8))}px`;
      t.style.top = `${y + 20 + t.offsetHeight > innerHeight ? y - t.offsetHeight - 12 : y + 20}px`;
    };
    const card = el.closest('a');
    const move = (e: PointerEvent) => place(e.clientX, e.clientY);
    const focus = () => {
      const r = el.getBoundingClientRect();
      place(r.left - 12, r.bottom - 12);
    };
    card?.addEventListener('pointermove', move);
    card?.addEventListener('focus', focus);
    return () => {
      card?.removeEventListener('pointermove', move);
      card?.removeEventListener('focus', focus);
    };
  }, []);

  return (
    <h3 className={className}>
      <span ref={ref} className="line-clamp-2">{title}</span>
      <span ref={tip} aria-hidden className="float-tip fixed z-50 max-w-xs rounded-card border border-line bg-surface px-3 py-2 t-body-sm text-fg">
        {title}
      </span>
    </h3>
  );
}
