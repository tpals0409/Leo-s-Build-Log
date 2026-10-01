import * as motion from 'motion/react-client';
import { reveal } from '@/lib/motion';

// 스크롤 등장. 서버 컴포넌트 안에서 써도 이 div만 클라이언트로 동작한다.
// 카드·섹션 전용 — 글 본문, 페이지 맨 위 제목에는 쓰지 않는다 (AGENTS.md).
export default function Reveal({ index = 0, className, children }: { index?: number; className?: string; children: React.ReactNode }) {
  return <motion.div {...reveal(index)} className={className}>{children}</motion.div>;
}
