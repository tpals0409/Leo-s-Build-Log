import * as motion from 'motion/react-client';
import { pageEnter } from '@/lib/motion';

// 페이지 진입 효과. template은 이동할 때마다 새로 마운트된다 (들어오는 것만, 나가는 효과 없음 — AGENTS.md).
export default function Template({ children }: { children: React.ReactNode }) {
  return <motion.div {...pageEnter}>{children}</motion.div>;
}
