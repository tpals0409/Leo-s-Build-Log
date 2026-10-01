// 움직임 토큰 — Motion props는 여기 프리셋만 쓴다 (AGENTS.md, check:design이 인라인 값을 막음).
// 기조: 은은하게. 짧고 작은 움직임, 내용이 주인공.

export const EASE = [0.25, 0.1, 0.25, 1] as const; // CSS의 ease-standard와 같은 곡선
export const DURATION = { fast: 0.2, base: 0.45 } as const;

// 스크롤 등장: 카드·섹션 전용. 글 본문과 페이지 맨 위 제목에는 쓰지 않는다(JS 전엔 투명하므로).
export const reveal = (index = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px 0px -10% 0px' },
  transition: { duration: DURATION.base, ease: EASE, delay: Math.min(index, 4) * 0.06 },
});

// 페이지 진입: 위치만 움직이고 투명도는 건드리지 않는다 → JS가 늦어도 내용은 보인다.
export const pageEnter = {
  initial: { y: 8 },
  animate: { y: 0 },
  transition: { duration: DURATION.base, ease: EASE },
};
