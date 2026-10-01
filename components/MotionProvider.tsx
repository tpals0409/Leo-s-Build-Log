'use client';
import { MotionConfig } from 'motion/react';

// OS의 '동작 줄이기' 설정을 모든 Motion 애니메이션에 적용
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
