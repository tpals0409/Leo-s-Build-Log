'use client';
import { useEffect } from 'react';

// 글 속 데모 iframe이 보내는 높이에 맞춰 늘린다 (lib/postHtml.ts의 REPORT_HEIGHT).
export default function DemoAutoHeight() {
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const h = e.data?.demoHeight;
      if (typeof h !== 'number') return;
      for (const host of document.querySelectorAll('[data-post-body]')) {
        for (const f of host.shadowRoot?.querySelectorAll<HTMLIFrameElement>('iframe[data-demo-frame]') ?? []) {
          if (f.contentWindow === e.source) f.style.height = `${Math.min(h, 4000)}px`;
        }
      }
    };
    addEventListener('message', onMessage);
    return () => removeEventListener('message', onMessage);
  }, []);
  return null;
}
