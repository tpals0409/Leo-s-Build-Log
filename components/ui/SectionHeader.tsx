import Link from 'next/link';

export default function SectionHeader({ title, href, linkLabel = '모두 보기' }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-5 flex items-baseline justify-between">
      <h2 className="t-title2 font-bold">{title}</h2>
      {href && <Link href={href} className="t-body-sm font-medium">{linkLabel} →</Link>}
    </div>
  );
}
