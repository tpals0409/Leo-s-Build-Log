'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { PostCard as P } from '@/lib/db';
import { DICT, type Locale } from '@/lib/i18n';
import Eyebrow from './ui/Eyebrow';
import Thumb from './ui/Thumb';

const INTERVAL = 5000; // 사용자 지정 (2026-10-02)
const SWIPE = 40; // 이만큼(px) 가로로 끌면 다음/이전 글

// 대표 글(featured) 슬라이드: 영역 전체가 링크. 썸네일을 가득 채우고 흰 그라데이션 위에 제목 — 넓은 화면은 왼쪽, 좁은 화면은 아래(세로 3:4, 제목만 t-tile).
// 이미지 위 글자는 전부 fg (AGENTS.md '이미지 위 글자'). 슬라이드를 한 칸에 겹쳐 쌓는다 → 넘어갈 때 화면이 흔들리지 않음.
// 마우스·키보드 포커스가 있으면 멈추고, 점을 누르거나 가로로 끌면(스와이프·드래그) 자동 넘김을 끈다. 움직임 줄이기 설정이면 자동으로 넘기지 않는다.
export default function FeaturedHero({ posts, locale }: { posts: P[]; locale: Locale }) {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const [stopped, setStopped] = useState(false);
  const t = DICT[locale].home;
  const startX = useRef<number | null>(null);
  const swiped = useRef(false); // 끌어서 넘겼으면 손을 뗄 때의 링크 클릭은 무시

  const go = (n: number) => (setI((n + posts.length) % posts.length), setStopped(true));

  useEffect(() => {
    if (posts.length < 2 || held || stopped || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % posts.length), INTERVAL);
    return () => clearInterval(id);
  }, [posts.length, held, stopped]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t.featured}
      className="mb-10 mt-8"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}
    >
      <div
        className="grid touch-pan-y"
        onPointerDown={(e) => ((startX.current = e.clientX), (swiped.current = false))}
        onPointerUp={(e) => {
          const dx = startX.current === null ? 0 : e.clientX - startX.current;
          startX.current = null;
          if (posts.length > 1 && Math.abs(dx) > SWIPE) (swiped.current = true), go(dx < 0 ? i + 1 : i - 1);
        }}
        onPointerCancel={() => (startX.current = null)}
        onClickCapture={(e) => swiped.current && (e.preventDefault(), (swiped.current = false))}
        onDragStart={(e) => e.preventDefault()}
      >
        {posts.map((post, n) => (
          // fade는 바깥 div, press-card는 링크 — 한 요소에 transition 유틸리티가 둘이면 하나가 덮인다
          <div key={post.slug} inert={n !== i} data-on={n === i ? '' : undefined} className="slide-fade col-start-1 row-start-1">
            <Link href={`/${locale}/posts/${post.slug}`} className="group press-card relative block">
              <div className="overflow-hidden rounded-panel">
                <Thumb src={post.thumbnail} className="thumb-zoom aspect-3/4 lg:aspect-[12/5]" />
              </div>
              <div className="absolute inset-0 flex items-end rounded-panel bg-linear-to-t from-surface/90 via-surface/70 via-35% to-transparent to-60% p-6 lg:items-center lg:bg-linear-to-r lg:via-40% lg:to-75% lg:p-0 lg:pl-12">
                <div className="lg:w-2/5">
                  <Eyebrow tone="text-fg">{t.featured}</Eyebrow>
                  <h2 className="mt-3 t-tile lg:mb-4 lg:t-section">{post.title}</h2>
                  {post.summary && <p className="hidden t-body text-fg lg:block">{post.summary}</p>}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      {posts.length > 1 && (
        <div className="mt-3 flex justify-center">
          {posts.map((post, n) => (
            <button
              key={post.slug}
              type="button"
              aria-label={t.slide(n + 1)}
              aria-current={n === i}
              onClick={() => go(n)}
              className="press p-2"
            >
              <span className={`block size-2 rounded-pill ${n === i ? 'bg-primary' : 'bg-line'}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
