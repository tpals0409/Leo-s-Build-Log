'use client';
import { useEffect, useRef } from 'react';

// 글 HTML 안에서 높이를 부모로 보고. 링크는 새 탭으로.
const INJECT = `<base target="_blank"><script>
new ResizeObserver(() => parent.postMessage({ h: document.documentElement.scrollHeight }, '*'))
  .observe(document.documentElement);
</script>`;

export default function PostFrame({ html, title }: { html: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source === ref.current?.contentWindow && typeof e.data?.h === 'number') ref.current!.style.height = `${e.data.h}px`;
    };
    addEventListener('message', onMsg);
    return () => removeEventListener('message', onMsg);
  }, []);
  // allow-same-origin 없음: 글 스크립트는 블로그 쿠키·DOM에 접근 불가
  return (
    <iframe ref={ref} className="block min-h-[60vh] w-full border-0" title={title} srcDoc={INJECT + html}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" />
  );
}
