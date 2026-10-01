import { toShadowHtml } from '@/lib/postHtml';

// 서버에서 본문을 Shadow DOM으로 렌더 → 검색엔진이 HTML에서 바로 읽음, 글 CSS는 격리.
// 브라우저가 <template shadowrootmode>를 shadow root로 바꿔서 innerHTML이 비므로 hydration 경고만 끈다.
export default function PostBody({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: toShadowHtml(html) }} suppressHydrationWarning />;
}
