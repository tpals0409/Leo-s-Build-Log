import Link from 'next/link';
import Arrow from './Arrow';

export default function SectionHeader({ title, href, linkLabel = '모두 보기' }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-5 flex items-baseline justify-between">
      <h2 className="t-section">{title}</h2>
      {href && <Link href={href} className="tap group link-hover t-body-sm">{linkLabel} <Arrow /></Link>}
    </div>
  );
}
