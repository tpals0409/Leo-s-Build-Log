// 완성 HTML 문서 → 페이지에 SSR로 박을 Shadow DOM 조각.
// 본문이 페이지 HTML에 그대로 들어가 검색엔진이 읽고, 글 CSS는 shadow root 안에 갇힌다.

// shadow root 안에는 html/body가 없으니 문서 전체용 셀렉터를 :host로
const toHost = (css: string) =>
  css
    .replace(/\bhtml\s+body\b/g, 'body')
    .replace(/(^|[\s,{}])(html|body|:root)(?=\s*[,{.:#[>~+\s])/g, '$1:host');

// ponytail: 신뢰된 1인 작성자(AI 업로드) 전제의 정규식 정화. 외부 작성자를 받으면 DOMPurify로 교체.
// 글 스크립트는 블로그 권한(관리자 쿠키로 API 호출 등)으로 실행되므로 제거한다.
const stripUnsafe = (html: string) =>
  html
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<\/?(template|base|meta|title)\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["']?)\s*javascript:[^"'\s>]*\2/gi, '$1="#"');

const STYLE = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
const LINK = /<link\b[^>]*rel\s*=\s*["']?stylesheet[^>]*>/gi;
// @font-face는 shadow root 안에서 무시되므로 폰트 CSS(@font-face만 담김)는 문서 쪽에 둔다
const isFontCss = (tag: string) => /fonts\.googleapis\.com|cdn\.jsdelivr\.net\/.*font/i.test(tag);

export function toShadowHtml(doc: string): string {
  const head = doc.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1] ?? '';
  const body = doc.match(/<body\b[^>]*>([\s\S]*)<\/body\s*>/i)?.[1] ?? doc.replace(/<head\b[\s\S]*?<\/head\s*>/i, '');

  const links = head.match(LINK) ?? [];
  const fontLinks = links.filter(isFontCss);
  const styleLinks = links.filter((l) => !isFontCss(l));
  const headStyles = [...head.matchAll(STYLE)].map((m) => `<style>${toHost(m[1])}</style>`);
  const content = stripUnsafe(body).replace(STYLE, (_, css) => `<style>${toHost(css)}</style>`);

  // 블로그 스타일 상속 끊기 (iframe처럼 빈 문서에서 시작). 글의 :host 규칙이 뒤에 와서 이긴다.
  const reset = '<style>:host{all:initial;display:block}</style>';
  return `<template shadowrootmode="open">${reset}${styleLinks.join('')}${headStyles.join('')}${content}</template>${fontLinks.join('')}`;
}
