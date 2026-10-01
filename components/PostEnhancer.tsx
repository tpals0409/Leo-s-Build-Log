'use client';
import { useEffect } from 'react';

// 글 본문(shadow root)에 브라우저 쪽 동작을 붙인다. 글 HTML 자체엔 스크립트가 없다(정화됨) — 동작은 블로그 코드만.
//  - 차트: 마크(data-value)에 올리면 값 툴팁 (데이터를 읽는 기능 — 장식 호버 아님)
//  - 코드 블록: 복사 버튼
//  - 데모 iframe: 보내온 높이로 맞춤 (lib/postHtml.ts REPORT_HEIGHT)
export default function PostEnhancer() {
  useEffect(() => {
    const roots = [...document.querySelectorAll('[data-post-body]')].flatMap((h) => (h.shadowRoot ? [h.shadowRoot] : []));
    const ko = document.documentElement.lang === 'ko';
    const cleanups: (() => void)[] = [];

    for (const root of roots) {
      // 차트 툴팁
      for (const fig of root.querySelectorAll<HTMLElement>('[data-chart]')) {
        const tip = document.createElement('div');
        tip.className = 'leo-tooltip';
        tip.hidden = true;
        fig.append(tip);
        const move = (e: PointerEvent) => {
          const m = (e.target as Element).closest?.('[data-value]');
          if (!m) return void (tip.hidden = true);
          const d = (m as HTMLElement).dataset;
          tip.textContent = `${d.label}${d.series ? ` · ${d.series}` : ''}: ${d.value}`;
          const r = fig.getBoundingClientRect();
          tip.style.left = `${e.clientX - r.left}px`;
          tip.style.top = `${e.clientY - r.top}px`;
          tip.hidden = false;
        };
        const leave = () => void (tip.hidden = true);
        fig.addEventListener('pointermove', move);
        fig.addEventListener('pointerleave', leave);
        cleanups.push(() => (fig.removeEventListener('pointermove', move), fig.removeEventListener('pointerleave', leave), tip.remove()));
      }
      // 코드 복사
      for (const fig of root.querySelectorAll<HTMLElement>('.leo-code')) {
        const pre = fig.querySelector('pre');
        if (!pre) continue;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'leo-copy';
        btn.textContent = ko ? '복사' : 'Copy';
        btn.onclick = async () => {
          await navigator.clipboard.writeText(pre.innerText);
          btn.textContent = ko ? '복사됨' : 'Copied';
          setTimeout(() => (btn.textContent = ko ? '복사' : 'Copy'), 1500);
        };
        fig.append(btn);
        cleanups.push(() => btn.remove());
      }
    }

    // 데모 높이
    const onMessage = (e: MessageEvent) => {
      const h = e.data?.demoHeight;
      if (typeof h !== 'number') return;
      for (const root of roots)
        for (const f of root.querySelectorAll<HTMLIFrameElement>('iframe[data-demo-frame]'))
          if (f.contentWindow === e.source) f.style.height = `${Math.min(h, 4000)}px`;
    };
    addEventListener('message', onMessage);
    return () => {
      removeEventListener('message', onMessage);
      cleanups.forEach((c) => c());
    };
  }, []);
  return null;
}
