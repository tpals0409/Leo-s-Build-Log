import PostBody from '@/components/PostBody';
import Container from '@/components/ui/Container';
import { CODE_DOC, SPECS } from '@/lib/leo/specs';
import { esc } from '@/lib/leo/util';
import { localeOf, pageMeta } from '@/lib/page';

// 글 컴포넌트 견본. 메뉴에 없고 검색엔진 제외. 등록부(lib/leo/specs.ts)에서 만들고, 실제 글과 같은 렌더 경로(PostBody)를 탄다.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const locale = await localeOf(params);
  return { ...pageMeta(locale, '/design', { title: 'Post components' }), robots: { index: false } };
}

// 견본 페이지 자체도 DESIGN.md 역할만 쓴다
const role = (r: string, family = 'var(--font-sans)') => `font:var(--fw-${r}) var(--fs-${r})/var(--lh-${r}) ${family};letter-spacing:var(--ls-${r})`;
const STYLE = `<style>
body{${role('body')};color:var(--color-fg);max-width:760px;margin:0 auto;padding:0 24px 80px}
h2{${role('section')};margin:80px 0 20px;padding-top:20px;border-top:1px solid var(--color-fg)}
h3{${role('body', 'var(--font-mono)')};margin:60px 0 8px}
.desc{${role('body-sm')};color:var(--color-secondary);margin:0 0 20px}
.attrs code{${role('caption', 'var(--font-mono)')}}
details{margin-top:-1em}summary{cursor:pointer;color:var(--color-link);${role('caption')}}
</style>`;

function section(tag: string, desc: string, example: string, attrs = '') {
  return `<h3>${esc(tag)}</h3><p class="desc">${esc(desc)}</p>${attrs}${example}<details><summary>source</summary><pre><code class="language-html">${esc(example)}</code></pre></details>`;
}

function buildDoc() {
  const groups = [...new Set(SPECS.map((s) => s.group))];
  const parts = groups.map((g) => {
    const items = SPECS.filter((s) => s.group === g && s.example).map((s) => {
      // 예시가 있는 항목 + 그 자식 항목들의 속성표
      const family = SPECS.filter((c) => c === s || c.parent === s.tag);
      const rows = family.flatMap((c) => Object.entries(c.attrs ?? {}).map(([k, a]) =>
        `<tr><td><code>${esc(c.tag)}</code></td><td><code>${esc(k)}</code>${a.required ? ' *' : ''}</td><td>${esc(a.values?.join(' | ') ?? '')}</td><td>${esc(a.desc)}</td></tr>`));
      const table = rows.length ? `<table class="attrs"><thead><tr><th>태그</th><th>속성</th><th>값</th><th>설명</th></tr></thead><tbody>${rows.join('')}</tbody></table>` : '';
      return section(s.tag, s.desc, s.example, table);
    });
    if (g === '코드') items.unshift(section(CODE_DOC.tag, CODE_DOC.desc, CODE_DOC.example));
    return `<h2>${esc(g)}</h2>${items.join('')}`;
  });
  return `<html><head>${STYLE}</head><body>${parts.join('')}</body></html>`;
}

export default async function DesignPage({ params }: Props) {
  const locale = await localeOf(params);
  return (
    <>
      <Container className="pb-4 pt-12">
        <h1 className="t-section">Post components</h1>
        <p className="mt-2 t-body text-muted">글 HTML에 쓰는 &lt;leo-*&gt; 컴포넌트 견본 · 작성 규칙은 docs/post-components.md (* 필수)</p>
      </Container>
      <PostBody html={buildDoc()} locale={locale} />
    </>
  );
}
