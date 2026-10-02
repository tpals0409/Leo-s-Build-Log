// tone: 이미지 위처럼 label(lion) 대비가 모자란 곳은 fg
export default function Eyebrow({ children, tone = 'text-label' }: { children: React.ReactNode; tone?: 'text-label' | 'text-fg' }) {
  return <span className={`t-caption ${tone}`}>{children}</span>;
}
