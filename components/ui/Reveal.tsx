'use client';
import { useEffect, useRef } from 'react';

// 스크롤 등장 (globals.css reveal). 카드 전용 — 글 본문·페이지 맨 위 제목에는 쓰지 않는다.
// 처음부터 화면 안에 있으면 건드리지 않는다(깜빡임 없음, 페이지 진입은 page-enter가 맡음). 아래쪽 것만 숨겼다가 보이면 나타난다.
export default function Reveal({ index = 0, className = '', children }: { index?: number; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (el.getBoundingClientRect().top < innerHeight) return;
    el.setAttribute('data-armed', '');
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      el.setAttribute('data-in', '');
      io.disconnect();
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ '--i': index } as React.CSSProperties}>{children}</div>;
}
