'use client';
import { usePathname } from 'next/navigation';

// 페이지 진입 효과 (globals.css page-enter) — 들어오는 것만, 나가는 효과 없음.
// template은 바로 아래 경로(posts 등)가 같으면 다시 마운트되지 않아(/ko/posts → /ko/posts/x) 주소를 key로 준다.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div key={usePathname()} className="page-enter">{children}</div>;
}
