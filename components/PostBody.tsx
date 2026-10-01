import type { Locale } from '@/lib/i18n';
import { toShadowHtml } from '@/lib/postHtml';
import PostEnhancer from './PostEnhancer';

// 서버에서 본문을 Shadow DOM으로 렌더 → 검색엔진이 HTML에서 바로 읽음, 글 CSS는 격리.
// 브라우저가 <template shadowrootmode>를 shadow root로 바꿔서 innerHTML이 비므로 hydration 경고만 끈다.
// 차트 툴팁·코드 복사·데모 높이는 PostEnhancer가 브라우저에서 붙인다.
export default async function PostBody({ html, locale }: { html: string; locale: Locale }) {
  return (
    <>
      <div data-post-body dangerouslySetInnerHTML={{ __html: await toShadowHtml(html, locale) }} suppressHydrationWarning />
      <PostEnhancer />
    </>
  );
}
