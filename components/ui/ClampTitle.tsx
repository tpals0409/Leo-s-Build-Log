'use client';
import { useEffect, useRef } from 'react';

// 카드 제목: 2줄까지 보이고, 카드에 마우스를 올리면 커서 옆 툴팁으로 전체 제목을 보여 준다(모든 카드)
// (globals.css float-tip, DESIGN.md §8). 커서를 따라 움직이고, 키보드 포커스면 제목 바로 아래에 뜬다.
// 툴팁은 body에 직접 붙인다: 카드 안에 두면 누를 때 press-card의 scale 때문에 fixed 기준이 카드로 바뀌어 위치가 튄다.
// 툴팁은 aria-hidden — 화면 낭독기는 원래 제목을 그대로 읽는다.
const TIP_CLASS = 'float-tip fixed z-50 max-w-xs rounded-card border border-line bg-surface px-3 py-2 t-body-sm text-fg';

export default function ClampTitle({ title, className = '' }: { title: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const card = el.closest('a');
    if (!card) return;
    const t = document.createElement('span');
    t.className = TIP_CLASS;
    t.setAttribute('aria-hidden', 'true');
    t.textContent = title;
    document.body.append(t);

    // 화면 밖으로 나가지 않게: 오른쪽 끝이면 왼쪽으로 당기고, 아래가 모자라면 커서 위로
    const place = (x: number, y: number) => {
      t.style.left = `${Math.max(8, Math.min(x + 12, innerWidth - t.offsetWidth - 8))}px`;
      t.style.top = `${y + 20 + t.offsetHeight > innerHeight ? y - t.offsetHeight - 12 : y + 20}px`;
    };
    const show = (on: boolean) => t.toggleAttribute('data-on', on);
    const enter = (e: PointerEvent) => e.pointerType === 'mouse' && (place(e.clientX, e.clientY), show(true));
    const move = (e: PointerEvent) => e.pointerType === 'mouse' && place(e.clientX, e.clientY);
    const leave = () => show(false);
    const focus = () => {
      if (!card.matches(':focus-visible')) return;
      const r = el.getBoundingClientRect();
      place(r.left - 12, r.bottom - 12);
      show(true);
    };
    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', leave);
    card.addEventListener('focus', focus);
    card.addEventListener('blur', leave);
    return () => {
      card.removeEventListener('pointerenter', enter);
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', leave);
      card.removeEventListener('focus', focus);
      card.removeEventListener('blur', leave);
      t.remove();
    };
  }, [title]);

  return (
    <h3 className={className}>
      <span ref={ref} className="line-clamp-2">{title}</span>
    </h3>
  );
}
