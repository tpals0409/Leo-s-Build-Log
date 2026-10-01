// 이미지 없으면 fog 배경 자리표시
export default function Thumb({ src, className = '' }: { src?: string | null; className?: string }) {
  const c = `block w-full bg-fog object-cover ${className}`;
  return src ? <img src={src} alt="" className={c} /> : <div className={c} />;
}
