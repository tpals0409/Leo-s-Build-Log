'use client';
import { useRef, useState } from 'react';
import { DICT, type Locale } from '@/lib/i18n';
import LoopVideo from './LoopVideo';

type Screen = { src: string; video?: string; label: string; size?: [number, number] };
export type Device = 'phone' | 'desktop';

const SWIPE = 40; // 이만큼(px) 가로로 끌면 다음/이전 화면 (FeaturedHero와 같음)

// 프로젝트 화면 캡처: 누르면 화면 가득 크게(<dialog> — Esc·포커스 가두기는 브라우저가 처리), 좌우 화살표·방향키·스와이프로 넘김.
// 바깥(어두운 막)을 누르거나 닫기·Esc로 닫는다. 끝에서 넘기면 처음/마지막으로 돈다. 열고 닫는 효과는 없음(정해진 등장 움직임 밖).
// device: 휴대폰 세로 캡처(FINCH)는 넓으면 4열, PC 가로 캡처(PinLog)는 2열(좁으면 1열).
export default function ScreenGallery({ screens, locale, device = 'phone' }: { screens: Screen[]; locale: Locale; device?: Device }) {
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
      <ul className={`grid gap-x-5 gap-y-8 ${device === 'phone' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {screens.map((x, n) => (
          <li key={x.src}>
            <button type="button" onClick={() => open(n)} aria-label={t.zoom(x.label)} className="press flex w-full cursor-zoom-in flex-col items-center gap-3">
              <Media s={x} device={device} />
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
        className="fixed inset-0 m-0 size-full max-h-none max-w-none touch-pan-y bg-fg p-0 text-surface"
      >
        {/* 위: 닫기 / 가운데: 캡처(남는 높이를 다 씀) / 아래: ‹ 이름 n/8 › 한 줄. 컨트롤을 캡처 위에 겹치지 않는다(좁은 화면에서도) */}
        <div data-backdrop className="flex size-full flex-col items-center px-4 pb-4 pt-2">
          <button type="button" onClick={() => ref.current?.close()} aria-label={t.close} className="press self-end p-3">
            <Icon d="M6 6l12 12M18 6L6 18" />
          </button>
          <div data-backdrop className="flex min-h-0 w-full flex-1 items-center justify-center py-2">
            {s && <Media s={s} device={device} big />}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => go(-1)} aria-label={t.prevScreen} className="group p-3"><Icon d="M15 6l-6 6 6 6" className="arrow-back" /></button>
            <p aria-live="polite" className="min-w-36 text-center t-body-sm">{s?.label} <span className="opacity-70">{i === null ? '' : `${i + 1} / ${screens.length}`}</span></p>
            <button type="button" onClick={() => go(1)} aria-label={t.nextScreen} className="group p-3"><Icon d="M9 6l6 6-6 6" className="arrow" /></button>
          </div>
        </div>
      </dialog>
    </>
  );
}

// 캡처 한 장. 움직이는 화면은 LoopVideo.
// 휴대폰(FINCH): 세로 352×692. 크게 볼 때는 닫기·아래 줄을 뺀 남는 높이에 맞춘다.
// PC(PinLog): 맥 창 테두리를 입힌 캡처라 장마다 비율이 조금 다르다(16:10·16:9 + 제목 줄) → 목록에선 같은 칸(1200×795) 가운데에, 크게 볼 땐 폭과 남는 높이 중 작은 쪽에 맞춘다.
const PHONE = { small: 'aspect-[352/692] w-full', big: 'aspect-[352/692] h-full w-auto max-w-full' };
const CHROME = 'calc(100dvh - 10rem)'; // 크게 볼 때 닫기·아래 줄·여백을 뺀 높이
// mp4엔 투명도가 없어 원본의 투명한 바깥(휴대폰 모서리·그림자, 맥 창 둥근 모서리)이 채워져 보인다 → 테두리 모양대로 잘라 낸다.
// 휴대폰: FINCH 원본 340×668 실측 — 테두리 위 8·오른쪽 20·아래 25·왼쪽 19px, 모서리 반지름 31px. 다른 휴대폰 캡처를 넣으면 다시 잴 것
const PHONE_FRAME = 'inset(1.2% 5.9% 3.7% 5.6% round 9.1% / 4.6%)';
// 맥 창: 모서리 반지름 = 폭 × 0.0115 (테두리를 만든 스크립트와 같은 값)
const macFrame = ([w, h]: [number, number]) => { const r = Math.round(w * 0.0115); return `inset(0 round ${(r / w) * 100}% / ${(r / h) * 100}%)`; };

function Media({ s, device, big }: { s: Screen; device: Device; big?: boolean }) {
  if (device === 'phone') {
    const c = big ? PHONE.big : PHONE.small;
    return s.video
      ? <LoopVideo key={s.src} src={s.video} poster={s.src} label={s.label} className={c} style={{ clipPath: PHONE_FRAME }} />
      : <img src={s.src} alt={s.label} width={352} height={692} loading={big ? 'eager' : 'lazy'} decoding="async" className={c} />;
  }
  const [w, h] = s.size ?? [1200, 795];
  const style = { aspectRatio: `${w} / ${h}`, width: big ? `min(100%, calc(${CHROME} * ${w / h}))` : '100%' };
  const m = s.video
    ? <LoopVideo key={s.src} src={s.video} poster={s.src} label={s.label} style={{ ...style, clipPath: macFrame([w, h]) }} />
    : <img src={s.src} alt={s.label} width={w} height={h} loading={big ? 'eager' : 'lazy'} decoding="async" style={style} />;
  return big ? m : <div className="flex aspect-[1200/795] w-full items-center justify-center">{m}</div>;
}

function Icon({ d, className = '' }: { d: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`size-7 ${className}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
