'use client';
import { useRef, useState } from 'react';
import { DICT, type Locale } from '@/lib/i18n';
import LoopVideo from './LoopVideo';

type Screen = { src: string; video?: string; label: string };

const SWIPE = 40; // 이만큼(px) 가로로 끌면 다음/이전 화면 (FeaturedHero와 같음)

// 프로젝트 화면 캡처: 누르면 화면 가득 크게(<dialog> — Esc·포커스 가두기는 브라우저가 처리), 좌우 화살표·방향키·스와이프로 넘김.
// 바깥(어두운 막)을 누르거나 닫기·Esc로 닫는다. 끝에서 넘기면 처음/마지막으로 돈다. 열고 닫는 효과는 없음(정해진 등장 움직임 밖).
export default function ScreenGallery({ screens, locale }: { screens: Screen[]; locale: Locale }) {
  const t = DICT[locale].projects;
  const ref = useRef<HTMLDialogElement>(null);
  const [i, setI] = useState<number | null>(null);
  const startX = useRef<number | null>(null);
  const swiped = useRef(false); // 끌어서 넘겼으면 손을 뗄 때의 클릭(막 누름 → 닫기)은 무시
  const open = (n: number) => (setI(n), ref.current?.showModal());
  const go = (d: number) => setI((n) => (n === null ? n : (n + d + screens.length) % screens.length));
  const s = i === null ? null : screens[i];

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
        {screens.map((x, n) => (
          <li key={x.src}>
            <button type="button" onClick={() => open(n)} aria-label={t.zoom(x.label)} className="press flex w-full cursor-zoom-in flex-col items-center gap-3">
              <Media s={x} />
              <span className="t-body-sm text-secondary">{x.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={ref}
        data-backdrop
        aria-label={s?.label}
        onClose={() => setI(null)}
        onClick={(e) => (swiped.current ? (swiped.current = false) : (e.target as HTMLElement).dataset.backdrop !== undefined && ref.current?.close())}
        onKeyDown={(e) => (e.key === 'ArrowLeft' ? go(-1) : e.key === 'ArrowRight' ? go(1) : null)}
        onPointerDown={(e) => ((startX.current = e.clientX), (swiped.current = false))}
        onPointerUp={(e) => {
          const dx = startX.current === null ? 0 : e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > SWIPE) (swiped.current = true), go(dx < 0 ? 1 : -1);
        }}
        className="fixed inset-0 m-0 size-full max-h-none max-w-none touch-pan-y bg-fg/90 p-0 text-surface"
      >
        {s && (
          <div data-backdrop className="flex size-full flex-col items-center justify-center gap-4 px-4 py-14">
            <Media s={s} big />
            <p className="t-body-sm">{s.label} <span className="opacity-70">{i! + 1} / {screens.length}</span></p>
          </div>
        )}
        {([[-1, t.prevScreen, 'left-0', 'M15 6l-6 6 6 6', 'arrow-back'], [1, t.nextScreen, 'right-0', 'M9 6l6 6-6 6', 'arrow']] as const).map(([d, label, side, path, move]) => (
          <button key={d} type="button" onClick={() => go(d)} aria-label={label}
            className={`group absolute inset-y-0 flex w-16 items-center justify-center sm:w-24 ${side}`}>
            <Icon d={path} className={move} />
          </button>
        ))}
        {/* 닫기는 화살표 영역(세로 전체) 위에 오도록 마지막에 */}
        <button type="button" onClick={() => ref.current?.close()} aria-label={t.close} className="press absolute right-3 top-3 p-3">
          <Icon d="M6 6l12 12M18 6L6 18" />
        </button>
      </dialog>
    </>
  );
}

// 캡처 한 장. 크게 볼 때는 화면 높이에 맞춘다(휴대폰 세로 화면). 움직이는 화면은 LoopVideo.
// mp4엔 투명도가 없어 원본 GIF의 투명한 바깥(모서리·그림자)이 흰색으로 남는다 → 휴대폰 테두리에 맞춰 잘라 낸다.
// 원본 340×668 실측: 테두리 위 8·오른쪽 20·아래 25·왼쪽 19px, 모서리 반지름 31px. 다른 캡처를 넣으면 다시 잴 것
const FRAME = 'inset(1.2% 5.9% 3.7% 5.6% round 9.1% / 4.6%)';

function Media({ s, big }: { s: Screen; big?: boolean }) {
  const c = big ? 'aspect-[352/692] h-full max-h-[calc(100dvh-9rem)] w-auto max-w-full' : 'aspect-[352/692] w-full';
  return s.video
    ? <LoopVideo key={s.src} src={s.video} poster={s.src} label={s.label} className={c} style={{ clipPath: FRAME }} />
    : <img src={s.src} alt={s.label} width={352} height={692} loading={big ? 'eager' : 'lazy'} decoding="async" className={c} />;
}

function Icon({ d, className = '' }: { d: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`size-7 ${className}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
