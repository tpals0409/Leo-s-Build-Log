// 이미지 없으면 fog 배경 자리표시.
// 기본은 늦게 받기(lazy): 화면 근처에 올 때 받는다. 첫 화면 맨 위 큰 이미지(대표 글 첫 장, 글·프로젝트 머리)만 eager로 바로·먼저 받는다.
// 업로드 이미지(/uploads/…)는 폭을 줄인 사본 중에서 브라우저가 고른다(srcset, app/uploads/[name]/route.ts).
// sizes = 화면에 그려지는 폭 — 브라우저가 그 폭 × 화면 배율에 맞는 사본을 받는다.
const WIDTHS = [480, 800, 1200]; // lib/uploads.ts THUMB_WIDTHS와 같게

export default function Thumb({ src, className = '', eager = false, sizes = '100vw' }: { src?: string | null; className?: string; eager?: boolean; sizes?: string }) {
  const c = `block w-full select-none bg-fog object-cover ${className}`; // select-none: 모바일 길게 누르면 이미지가 선택돼 ::selection 색으로 덮이는 것 방지
  if (!src) return <div className={c} />;
  const resizable = src.startsWith('/uploads/');
  return (
    <img
      src={resizable ? `${src}?w=1200` : src}
      srcSet={resizable ? WIDTHS.map((w) => `${src}?w=${w} ${w}w`).join(', ') : undefined}
      sizes={resizable ? sizes : undefined}
      alt="" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" className={c}
    />
  );
}
