// 완성 HTML 문서 → 페이지에 SSR로 박을 Shadow DOM 조각.
// 본문이 페이지 HTML에 그대로 들어가 검색엔진이 읽고, 글 CSS는 shadow root 안에 갇힌다.
// 정화(스크립트·이벤트 속성 제거)와 <leo-*> 컴포넌트·코드 강조는 lib/leo가 트리로 처리한다.
import type { Locale } from './i18n.ts';
import { renderBody } from './leo/index.ts';
import { LEO_CSS } from './leo/style.ts';

// shadow root 안에는 html/body가 없다: html·:root → :host(상속값용), body → 본문을 감싼 .post-root.
// body를 :host로 보내면 안 된다 — 호스트 요소는 블로그 문서 쪽이라 Tailwind 리셋(margin·padding 0)이 :host 규칙을 이긴다.
const SEL_END = '(?=\\s*[,{.:#[>~+\\s])';
const toHost = (css: string) =>
  css
    .replace(/\bhtml\s+body\b/g, 'body')
    .replace(new RegExp(`(^|[\\s,{}])(html|:root)${SEL_END}`, 'g'), '$1:host')
    .replace(new RegExp(`(^|[\\s,{}])body${SEL_END}`, 'g'), '$1.post-root');

// 인터랙티브 부분: <template data-demo data-height="400" data-title="…">완성 HTML(스크립트 OK)</template>
// → 격리된 iframe(allow-same-origin 없음: 블로그 쿠키·DOM·API 접근 불가, 외부 라이브러리는 로드 가능).
const DEMO = /<template\b([^>]*\bdata-demo\b[^>]*)>([\s\S]*?)<\/template\s*>/gi;
const attr = (attrs: string, name: string) => attrs.match(new RegExp(`\\b${name}\\s*=\\s*["']?([^"'>]*)`, 'i'))?.[1];
const escAttr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// 데모 끝에 붙여서 높이를 부모(DemoAutoHeight)로 알린다. 앞에 붙이면 <!doctype>이 밀려 quirks 모드가 된다.
const REPORT_HEIGHT =
  "<script>new ResizeObserver(()=>parent.postMessage({demoHeight:document.documentElement.scrollHeight},'*')).observe(document.documentElement)</script>";

const demoFrame = (attrs: string, inner: string) => {
  const height = Number(attr(attrs, 'data-height')) || 320;
  const title = attr(attrs, 'data-title') || 'Interactive demo';
  return `<iframe data-demo-frame title="${escAttr(title)}" loading="lazy" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" style="display:block;width:100%;height:${height}px;border:0" srcdoc="${escAttr(inner + REPORT_HEIGHT)}"></iframe>`;
};

const STYLE = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
const LINK = /<link\b[^>]*rel\s*=\s*["']?stylesheet[^>]*>/gi;
// @font-face는 shadow root 안에서 무시되므로 폰트 CSS(@font-face만 담김)는 문서 쪽에 둔다
const isFontCss = (tag: string) => /fonts\.googleapis\.com|cdn\.jsdelivr\.net\/.*font/i.test(tag);

const cache = new Map<string, string>(); // ponytail: 프로세스 메모리 캐시(최대 200개). 글이 아주 많아지면 LRU/외부 캐시로

export async function toShadowHtml(doc: string, locale: Locale): Promise<string> {
  const key = `${locale}\u0000${doc}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const head = doc.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1] ?? '';
  const body = doc.match(/<body\b[^>]*>([\s\S]*)<\/body\s*>/i)?.[1] ?? doc.replace(/<head\b[\s\S]*?<\/head\s*>/i, '');

  const links = head.match(LINK) ?? [];
  const fontLinks = links.filter(isFontCss);
  const styleLinks = links.filter((l) => !isFontCss(l));
  const headStyles = [...head.matchAll(STYLE)].map((m) => `<style>${toHost(m[1])}</style>`);
  // 데모를 먼저 자리표시로 빼둔다 — 정화 단계가 데모 안 스크립트·onclick까지 지우지 않게
  const demos: string[] = [];
  const withSlots = body.replace(DEMO, (_, attrs, inner) => `<!--demo:${demos.push(demoFrame(attrs, inner)) - 1}-->`);
  const content = (await renderBody(withSlots, { locale }))
    .replace(STYLE, (_, css) => `<style>${toHost(css)}</style>`)
    .replace(/<!--demo:(\d+)-->/g, (_, i) => demos[Number(i)]);

  // 블로그 스타일 상속 끊기 (iframe처럼 빈 문서에서 시작). 그다음 컴포넌트 스타일, 마지막에 글 스타일(글이 덮어쓸 수 있게).
  const reset = '<style>:host{all:initial;display:block}</style>';
  const out = `<template shadowrootmode="open">${reset}<style>${LEO_CSS}</style>${styleLinks.join('')}${headStyles.join('')}<div class="post-root">${content}</div></template>${fontLinks.join('')}`;
  if (cache.size >= 200) cache.delete(cache.keys().next().value!);
  cache.set(key, out);
  return out;
}
