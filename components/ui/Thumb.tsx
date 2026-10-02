// 이미지 없으면 fog 배경 자리표시
export default function Thumb({ src, className = '' }: { src?: string | null; className?: string }) {
  const c = `block w-full select-none bg-fog object-cover ${className}`; // select-none: 모바일 길게 누르면 이미지가 선택돼 ::selection 색으로 덮이는 것 방지
  return src ? <img src={src} alt="" className={c} /> : <div className={c} />;
}
