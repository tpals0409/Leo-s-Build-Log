'use client';
import { useEffect, useRef } from 'react';

// 움직이는 화면 캡처(원본 GIF를 mp4로 줄인 것). 화면에 보일 때만 소리 없이 반복 재생하고, 벗어나면 멈춘다.
// 움직임 줄이기 설정이면 재생하지 않고 첫 장면(poster)만 보인다. 컨트롤 없음 — 장식이 아니라 내용이라 alt 대신 label.
export default function LoopVideo({ src, poster, label, className = '', style }: { src: string; poster: string; label: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={src} poster={poster} aria-label={label} muted loop playsInline preload="none" className={className} style={style} />;
}
