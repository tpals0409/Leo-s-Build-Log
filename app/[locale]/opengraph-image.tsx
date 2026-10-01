import { OG_SIZE, renderOg } from '@/lib/og';
import { localeOf } from '@/lib/page';

// 기본 링크 미리보기 이미지 — 하위 페이지가 따로 두지 않으면 이걸 쓴다
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = '레오의 빌드로그 · Leo’s Build Log';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  return renderOg({ locale: await localeOf(params) });
}
