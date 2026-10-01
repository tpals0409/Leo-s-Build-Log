// 글 본문 HTML 처리: 파싱 → (정화 + leo 컴포넌트 렌더 + 코드 강조) → HTML.
// 정규식이 아니라 트리로 처리해서, 코드 예시 안의 "onclick=" 같은 글자는 건드리지 않고 실제 속성만 지운다.
import { HTMLElement, Node, NodeType, parse } from 'node-html-parser';
import { renderCode } from './code.ts';
import { type Ctx, SPEC_BY_TAG } from './specs.ts';
import { esc } from './util.ts';

const PARSE = { comment: true, blockTextElements: { script: true, style: true } };
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const DROP = new Set(['script', 'base', 'meta', 'title', 'noscript', 'object', 'frame', 'frameset']); // 글 HTML에서 통째로 버림
const UNWRAP = new Set(['template', 'html', 'head', 'body']); // 태그만 벗기고 안쪽은 둠
const URL_ATTR = /^(href|src|xlink:href|action|formaction)$/i;

const tagOf = (el: HTMLElement) => el.rawTagName?.toLowerCase() ?? '';
const isEl = (n: Node): n is HTMLElement => n.nodeType === NodeType.ELEMENT_NODE;

function attrs(el: HTMLElement) {
  return Object.entries(el.attributes)
    // on*: 이벤트 스크립트 / srcdoc: 블로그 권한으로 도는 iframe 내용 / javascript: 링크
    .filter(([k, v]) => !/^on/i.test(k) && k.toLowerCase() !== 'srcdoc' && !(URL_ATTR.test(k) && /^\s*javascript:/i.test(v)))
    .map(([k, v]) => (v === '' ? ` ${k}` : ` ${k}="${esc(v)}"`))
    .join('');
}

async function renderNode(n: Node, ctx: Ctx): Promise<string> {
  if (n.nodeType === NodeType.TEXT_NODE) return n.toString(); // 원문 그대로 (엔티티 유지)
  if (n.nodeType === NodeType.COMMENT_NODE) return /^<!--demo:\d+-->$/.test(n.toString()) ? n.toString() : '';
  if (!isEl(n)) return '';
  const tag = tagOf(n);
  if (DROP.has(tag)) return '';
  // 외부 임베드(유튜브 등)는 https iframe만 — 다른 출처라 블로그에 접근 못 함. 직접 만든 인터랙티브는 <template data-demo>
  if (tag === 'iframe' && !/^https:\/\//i.test(n.getAttribute('src') ?? '')) return '';
  const inner = () => renderChildren(n, ctx);

  // 코드 블록
  const code = tag === 'pre' && n.childNodes.filter(isEl).length === 1 ? n.querySelector('code') : null;
  if (code) {
    const lang = (code.getAttribute('class') ?? '').match(/language-([\w+#-]+)/)?.[1];
    return renderCode(code.text, { lang, file: code.getAttribute('data-file'), highlight: code.getAttribute('data-highlight') });
  }

  const spec = SPEC_BY_TAG.get(tag);
  if (spec) {
    const body = spec.children === 'text' ? n.text : spec.children === 'html' ? await inner() : '';
    return spec.render((k) => n.getAttribute(k), body, ctx);
  }
  if (tag.startsWith('leo-')) return `<p class="leo-error">${esc(`<${tag}>`)}: 없는 컴포넌트</p>`;
  if (UNWRAP.has(tag)) return inner();
  if (tag === 'style') return n.toString();
  if (VOID.has(tag)) return `<${n.rawTagName}${attrs(n)}>`;
  return `<${n.rawTagName}${attrs(n)}>${await inner()}</${n.rawTagName}>`;
}

async function renderChildren(el: HTMLElement, ctx: Ctx) {
  return (await Promise.all(el.childNodes.map((c) => renderNode(c, ctx)))).join('');
}

export async function renderBody(html: string, ctx: Ctx) {
  return renderChildren(parse(html, PARSE), ctx);
}

// 글 등록 때 검사. 오류 문구는 AI가 바로 고칠 수 있게 태그·속성 이름을 넣는다.
export function validateLeo(html: string): string[] {
  const errors: string[] = [];
  const walk = (el: HTMLElement) => {
    for (const c of el.childNodes) {
      if (!isEl(c)) continue;
      const tag = tagOf(c);
      if (tag.startsWith('leo-')) {
        const spec = SPEC_BY_TAG.get(tag);
        if (!spec) {
          errors.push(`<${tag}>: 없는 컴포넌트 (docs/post-components.md 참고)`);
          continue;
        }
        const where = `<${tag}>`;
        for (const [name, a] of Object.entries(spec.attrs ?? {})) {
          const v = c.getAttribute(name);
          if (a.required && !v) errors.push(`${where}: ${name} 속성 필수 — ${a.desc}`);
          if (v && a.values && !a.values.includes(v)) errors.push(`${where}: ${name}="${v}" — ${a.values.join(' | ')} 중 하나`);
        }
        if (spec.parent && tagOf(c.parentNode as HTMLElement) !== spec.parent) errors.push(`${where}: <${spec.parent}> 바로 안에서만 쓸 수 있음`);
        if (spec.needs && !c.childNodes.some((k) => isEl(k) && tagOf(k) === spec.needs)) errors.push(`${where}: 안에 <${spec.needs}>가 하나 이상 필요`);
        errors.push(...(spec.validate?.(c) ?? []).map((e) => `${where}: ${e}`));
        if (spec.children !== 'html') continue; // text/none 안쪽은 검사하지 않음
      }
      walk(c);
    }
  };
  walk(parse(html, PARSE));
  return errors;
}
