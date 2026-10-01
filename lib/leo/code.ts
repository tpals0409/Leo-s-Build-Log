// <pre><code class="language-ts" data-file="a.ts" data-highlight="3,5-7"> → Shiki 문법 강조 (서버).
import { createHighlighter, type Highlighter, type ThemeRegistration } from 'shiki';
import { esc, lineSet } from './util.ts';

// 테마: DESIGN.md "강조색 하나" — 키워드만 강조색(brand 계열), 나머지는 charcoal~muted 무채색.
// 각 색은 code 배경(fog #F5F5F7) 위 대비 4.5:1 이상.
const THEME: ThemeRegistration = {
  name: 'leo',
  type: 'light',
  colors: { 'editor.background': '#F5F5F7', 'editor.foreground': '#292725' },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#696866', fontStyle: 'italic' } }, // muted 5.1
    { scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.operator.new', 'keyword.control', 'entity.name.tag'], settings: { foreground: '#9B5124' } }, // 강조 5.4
    { scope: ['string', 'string.quoted', 'string.template', 'entity.other.attribute-name', 'constant.numeric', 'constant.language'], settings: { foreground: '#494746' } }, // secondary 8.5
  ],
};

// 운영에선 프로세스 전체에서 하나(globalThis). 개발 중엔 모듈이 다시 로드될 때 새로 만든다 — 테마를 고치면 바로 보이게
const g = (process.env.NODE_ENV === 'production' ? globalThis : {}) as { leoShiki?: Promise<Highlighter> };
const highlighter = () => (g.leoShiki ??= createHighlighter({ themes: [THEME], langs: [] }));

export async function renderCode(code: string, attrs: { lang?: string; file?: string; highlight?: string }): Promise<string> {
  const h = await highlighter();
  let lang = (attrs.lang ?? 'text').toLowerCase();
  if (!['text', 'plaintext', 'txt'].includes(lang) && !h.getLoadedLanguages().includes(lang)) {
    try {
      await h.loadLanguage(lang as Parameters<Highlighter['loadLanguage']>[0]);
    } catch {
      lang = 'text'; // 모르는 언어는 강조 없이
    }
  }
  const src = code.replace(/^\n/, '').replace(/\n\s*$/, '');
  const lines = src.split('\n');
  const marked = lineSet(attrs.highlight);
  const html = h.codeToHtml(src, {
    lang: ['text', 'plaintext', 'txt'].includes(lang) ? 'text' : lang,
    theme: 'leo',
    transformers: [
      {
        line(node, n) {
          if (marked.has(n)) this.addClassToHast(node, 'leo-hl');
          if (lang === 'diff') {
            const c = lines[n - 1]?.[0];
            if (c === '+') this.addClassToHast(node, 'leo-add');
            if (c === '-') this.addClassToHast(node, 'leo-del');
          }
        },
      },
    ],
  });
  // 파일명 줄은 비어 있어도 둔다 — 복사 버튼(PostEnhancer)이 이 줄 오른쪽에 붙는다
  const file = `<figcaption class="leo-code__file">${esc(attrs.file ?? '')}</figcaption>`;
  return `<figure class="leo-code" data-lang="${esc(lang)}">${file}${html}</figure>`;
}
