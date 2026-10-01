// 글 안 컴포넌트 등록부 — 검증(lib/leo/index.ts), 견본 페이지(/design), 작성 문서(docs/post-components.md)가 모두 이걸 읽는다.
// 새 컴포넌트는 여기에 한 항목 추가 + lib/leo/style.ts에 스타일. 태그는 항상 닫는다(<leo-x>…</leo-x>).
import type { HTMLElement } from 'node-html-parser';
import type { Locale } from '../i18n.ts';
import { CHART_TYPES, parseChart, renderChart } from './chart.ts';
import { esc } from './util.ts';

export type Ctx = { locale: Locale };
type Attr = { required?: true; values?: readonly string[]; desc: string };
type Get = (name: string) => string | undefined;

export type Spec = {
  tag: string;
  group: '구조·데이터' | '서술' | '코드';
  desc: string;
  attrs?: Record<string, Attr>;
  parent?: string; // 이 태그 안에서만 쓸 수 있다
  needs?: string; // 자식으로 하나 이상 있어야 한다
  // html: 안쪽이 일반 HTML(다른 컴포넌트 포함 가능) / text: 안쪽 글자 그대로(JSON·트리·터미널) / none: 비움
  children: 'html' | 'text' | 'none';
  validate?: (el: HTMLElement) => string[];
  example: string;
  render: (a: Get, inner: string, ctx: Ctx) => string;
};

const L = (ctx: Ctx, [ko, en]: readonly [string, string]) => (ctx.locale === 'ko' ? ko : en);
const opt = (v: string | undefined, html: (v: string) => string) => (v ? html(esc(v)) : '');

const CALLOUT = { note: ['메모', 'Note'], tip: ['팁', 'Tip'], warn: ['주의', 'Caution'] } as const;
const ADR = { problem: ['문제', 'Problem'], decision: ['결정', 'Decision'], result: ['결과', 'Result'] } as const;

const adrItem = (kind: keyof typeof ADR): Spec => ({
  tag: `leo-${kind}`,
  group: '서술',
  desc: `ADR의 ${ADR[kind][0]} 칸`,
  parent: 'leo-adr',
  children: 'html',
  example: '',
  render: (_, inner, ctx) =>
    `<section class="leo-adr__item leo-adr__item--${kind}"><p class="leo-adr__label">${L(ctx, ADR[kind])}</p><div class="leo-flow">${inner}</div></section>`,
});

export const SPECS: Spec[] = [
  // ── 구조·데이터 ─────────────────────────────────────────
  {
    tag: 'leo-diagram',
    group: '구조·데이터',
    desc: '구조도·흐름도. Mermaid를 SVG로 바꿔서(mermaid.config.json 사용) 안에 넣는다. 이미지(<img>)도 된다.',
    attrs: { title: { desc: '그림 제목' }, caption: { desc: '그림 아래 설명' } },
    children: 'html',
    validate: (el) => (el.querySelector('svg, img') ? [] : ['안에 <svg> 또는 <img>가 필요 (Mermaid는 mmdc로 SVG 변환)']),
    example: `<leo-diagram title="요청 흐름" caption="게이트웨이가 인증 후 서비스로 넘긴다">
  <svg viewBox="0 0 360 80" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="13">
    <rect x="4" y="20" width="96" height="40" rx="8" fill="none" stroke="#292725"/><text x="52" y="45" text-anchor="middle">Client</text>
    <rect x="132" y="20" width="96" height="40" rx="8" fill="none" stroke="#292725"/><text x="180" y="45" text-anchor="middle">Gateway</text>
    <rect x="260" y="20" width="96" height="40" rx="8" fill="none" stroke="#292725"/><text x="308" y="45" text-anchor="middle">Service</text>
    <path d="M100 40h28M228 40h28" stroke="#696866" stroke-width="1.5"/>
  </svg>
</leo-diagram>`,
    render: (a, inner) => {
      // SVG 원래 폭 → 좁은 칸에서 줄이지 않고 이 폭으로 그려 가로 스크롤 (style.ts). 너무 넓으면 960에서 자름
      const w = Number(inner.match(/<svg\b[^>]*\bviewBox="[\d.-]+[\s,]+[\d.-]+[\s,]+([\d.]+)/i)?.[1]);
      const art = w ? ` style="--w:${Math.min(Math.round(w), 960)}px"` : '';
      return `<figure class="leo-figure">${opt(a('title'), (t) => `<p class="leo-figure__title">${t}</p>`)}<div class="leo-figure__art"${art}>${inner}</div>${opt(a('caption'), (c) => `<figcaption>${c}</figcaption>`)}</figure>`;
    },
  },
  {
    tag: 'leo-chart',
    group: '구조·데이터',
    desc: '차트. 안에 JSON 데이터 {labels, series:[{name, values}]}. 값은 0 이상. 호버하면 값이 보인다.',
    attrs: {
      type: { required: true, values: CHART_TYPES, desc: 'bar 세로 막대 · hbar 가로 막대(긴 라벨) · line 추이 · donut 비율(series 1개)' },
      title: { desc: '차트 제목' },
      unit: { desc: '값 뒤에 붙는 단위 (예: ms, %, 회)' },
    },
    children: 'text',
    validate: (el) => parseChart(el.text, el.getAttribute('type') ?? '').errors,
    example: `<leo-chart type="bar" title="빌드 시간" unit="s">
{"labels":["v1","v2","v3"],"series":[{"name":"빌드","values":[184,121,62]}]}
</leo-chart>`,
    render: (a, inner, ctx) => renderChart(inner, { type: a('type')!, title: a('title'), unit: a('unit') }, ctx.locale),
  },
  {
    tag: 'leo-metrics',
    group: '구조·데이터',
    desc: '지표 카드 묶음.',
    needs: 'leo-metric',
    children: 'html',
    example: `<leo-metrics>
  <leo-metric value="15" unit="jobs" label="CI 단계"></leo-metric>
  <leo-metric value="62" unit="s" label="빌드 시간" delta="-66%"></leo-metric>
  <leo-metric value="12" label="에이전트"></leo-metric>
</leo-metrics>`,
    render: (_, inner) => `<div class="leo-metrics">${inner}</div>`,
  },
  {
    tag: 'leo-metric',
    group: '구조·데이터',
    desc: '지표 카드 하나.',
    parent: 'leo-metrics',
    attrs: {
      value: { required: true, desc: '큰 숫자' },
      label: { required: true, desc: '설명' },
      unit: { desc: '단위' },
      delta: { desc: '변화량 (예: -66%, +3)' },
    },
    children: 'none',
    example: '',
    render: (a) =>
      `<div class="leo-metric"><p class="leo-metric__value">${esc(a('value')!)}${opt(a('unit'), (u) => `<span class="leo-metric__unit">${u}</span>`)}</p><p class="leo-metric__label">${esc(a('label')!)}</p>${opt(a('delta'), (d) => `<p class="leo-metric__delta">${d}</p>`)}</div>`,
  },
  {
    tag: 'leo-compare',
    group: '구조·데이터',
    desc: '나란히 비교 (전/후, 장/단점, A/B). 표는 일반 <table>을 쓰면 기본 스타일이 붙는다.',
    needs: 'leo-side',
    children: 'html',
    example: `<leo-compare>
  <leo-side label="Before"><p>매 요청 DB 조회, 응답 420ms</p></leo-side>
  <leo-side label="After"><p>캐시 후 응답 38ms</p></leo-side>
</leo-compare>`,
    render: (_, inner) => `<div class="leo-compare">${inner}</div>`,
  },
  {
    tag: 'leo-side',
    group: '구조·데이터',
    desc: '비교의 한쪽.',
    parent: 'leo-compare',
    attrs: { label: { required: true, desc: '머리글' } },
    children: 'html',
    example: '',
    render: (a, inner) =>
      `<section class="leo-side"><p class="leo-side__label">${esc(a('label')!)}</p><div class="leo-flow">${inner}</div></section>`,
  },
  // ── 서술 ────────────────────────────────────────────────
  {
    tag: 'leo-steps',
    group: '서술',
    desc: '번호가 붙는 단계.',
    needs: 'leo-step',
    children: 'html',
    example: `<leo-steps>
  <leo-step title="문제 정의"><p>성공 기준을 먼저 적는다.</p></leo-step>
  <leo-step title="작업 분해"><p>에이전트에게 맥락과 단위를 준다.</p></leo-step>
  <leo-step title="검증"><p>테스트와 실제 동작으로 확인한다.</p></leo-step>
</leo-steps>`,
    render: (_, inner) => `<ol class="leo-steps">${inner}</ol>`,
  },
  {
    tag: 'leo-step',
    group: '서술',
    desc: '단계 하나.',
    parent: 'leo-steps',
    attrs: { title: { required: true, desc: '단계 제목' } },
    children: 'html',
    example: '',
    render: (a, inner) => `<li class="leo-step"><p class="leo-step__title">${esc(a('title')!)}</p><div class="leo-flow">${inner}</div></li>`,
  },
  {
    tag: 'leo-pipeline',
    group: '서술',
    desc: '화살표로 이어지는 흐름 (넓은 화면 가로, 좁은 화면 세로).',
    needs: 'leo-stage',
    children: 'html',
    example: `<leo-pipeline>
  <leo-stage title="Lint">ESLint · tsc</leo-stage>
  <leo-stage title="Test">단위 · 통합</leo-stage>
  <leo-stage title="Build">arm64 이미지</leo-stage>
  <leo-stage title="Deploy">ArgoCD</leo-stage>
</leo-pipeline>`,
    render: (_, inner) => `<ol class="leo-pipeline">${inner}</ol>`,
  },
  {
    tag: 'leo-stage',
    group: '서술',
    desc: '파이프라인 단계 하나 (안쪽은 짧은 설명).',
    parent: 'leo-pipeline',
    attrs: { title: { required: true, desc: '단계 이름' } },
    children: 'html',
    example: '',
    render: (a, inner) =>
      `<li class="leo-stage"><p class="leo-stage__title">${esc(a('title')!)}</p>${inner.trim() ? `<div class="leo-stage__body">${inner}</div>` : ''}</li>`,
  },
  {
    tag: 'leo-timeline',
    group: '서술',
    desc: '기간별 마일스톤.',
    needs: 'leo-milestone',
    children: 'html',
    example: `<leo-timeline>
  <leo-milestone date="2026.04" title="MSA 설계" status="done"><p>서비스 6개로 분리</p></leo-milestone>
  <leo-milestone date="2026.06" title="에이전트 12명 운영" status="now"><p>오케스트레이션 정착</p></leo-milestone>
  <leo-milestone date="2026.09" title="모델 독립 하네스" status="next"></leo-milestone>
</leo-timeline>`,
    render: (_, inner) => `<ol class="leo-timeline">${inner}</ol>`,
  },
  {
    tag: 'leo-milestone',
    group: '서술',
    desc: '마일스톤 하나.',
    parent: 'leo-timeline',
    attrs: {
      date: { required: true, desc: '시점 (자유 형식)' },
      title: { required: true, desc: '제목' },
      status: { values: ['done', 'now', 'next'], desc: '완료·진행 중·예정 (기본 done)' },
    },
    children: 'html',
    example: '',
    render: (a, inner) =>
      `<li class="leo-milestone leo-milestone--${a('status') ?? 'done'}"><p class="leo-milestone__date">${esc(a('date')!)}</p><p class="leo-milestone__title">${esc(a('title')!)}</p>${inner.trim() ? `<div class="leo-flow">${inner}</div>` : ''}</li>`,
  },
  {
    tag: 'leo-callout',
    group: '서술',
    desc: '강조 박스.',
    attrs: { type: { values: ['note', 'tip', 'warn'], desc: '메모·팁·주의 (기본 note)' }, title: { desc: '제목 (기본: 종류 이름)' } },
    children: 'html',
    example: `<leo-callout type="tip"><p>에이전트에게는 결과물보다 <strong>성공 기준</strong>을 먼저 준다.</p></leo-callout>`,
    render: (a, inner, ctx) => {
      const t = (a('type') ?? 'note') as keyof typeof CALLOUT;
      return `<aside class="leo-callout leo-callout--${t}"><p class="leo-callout__title">${esc(a('title') ?? L(ctx, CALLOUT[t]))}</p><div class="leo-flow">${inner}</div></aside>`;
    },
  },
  {
    tag: 'leo-adr',
    group: '서술',
    desc: '문제 → 결정 → 결과 흐름 (ADR). 안에 leo-problem, leo-decision, leo-result.',
    needs: 'leo-decision',
    children: 'html',
    example: `<leo-adr>
  <leo-problem><p>세션이 4개 레이어에서 따로 만료돼 사용자가 자주 로그아웃됐다.</p></leo-problem>
  <leo-decision><p>만료 정책을 게이트웨이 한 곳으로 모았다.</p></leo-decision>
  <leo-result><p>강제 로그아웃 문의가 0건이 됐다.</p></leo-result>
</leo-adr>`,
    render: (_, inner) => `<div class="leo-adr">${inner}</div>`,
  },
  adrItem('problem'),
  adrItem('decision'),
  adrItem('result'),
  // ── 코드 ────────────────────────────────────────────────
  {
    tag: 'leo-tree',
    group: '코드',
    desc: '파일 트리. 안에 경로를 2칸 들여쓰기로. 폴더는 /로 끝내고, # 뒤는 설명.',
    children: 'text',
    example: `<leo-tree>
app/
  [locale]/
    posts/
      [slug]/page.tsx   # 글 상세
  api/
    posts/route.ts      # 글 등록 API
lib/
  leo/                  # 글 컴포넌트
</leo-tree>`,
    render: (_, text) => renderTree(text),
  },
  {
    tag: 'leo-terminal',
    group: '코드',
    desc: '터미널. "$ "로 시작하는 줄은 명령, 나머지는 출력.',
    attrs: { title: { desc: '창 제목 (기본 Terminal)' } },
    children: 'text',
    example: `<leo-terminal>
$ npm run check:design
design check ok
$ podman compose up -d
 Container blog-app-1 Started
</leo-terminal>`,
    render: (a, text) => {
      const body = text
        .replace(/^\n/, '')
        .replace(/\n\s*$/, '')
        .split('\n')
        .map((l) => (l.startsWith('$ ') ? `<span class="leo-term__prompt">$</span> <span class="leo-term__cmd">${esc(l.slice(2))}</span>` : `<span class="leo-term__out">${esc(l)}</span>`))
        .join('\n');
      return `<figure class="leo-term"><figcaption>${esc(a('title') ?? 'Terminal')}</figcaption><pre>${body}</pre></figure>`;
    },
  },
];

// 코드 블록은 leo 태그가 아니라 표준 <pre><code>다. 문서·견본용 설명만 둔다 (렌더는 lib/leo/code.ts).
export const CODE_DOC = {
  tag: 'pre > code',
  desc: '코드 블록. 서버에서 문법 강조. class="language-xxx"(ts, tsx, js, py, go, sh, yaml, json, sql, diff …), data-file(파일명), data-highlight(강조할 줄 "3,5-7"). 코드 안의 < > & 는 &lt; &gt; &amp; 로.',
  example: `<pre><code class="language-ts" data-file="lib/page.ts" data-highlight="3">export const localeOf = async (params: Promise<{ locale: string }>) => {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
};</code></pre>`,
};

export const SPEC_BY_TAG = new Map(SPECS.map((s) => [s.tag, s]));

// 2칸 들여쓰기 → ├── └── │ 트리
function renderTree(text: string) {
  const lines = text.replace(/\t/g, '  ').split('\n').filter((l) => l.trim());
  if (!lines.length) return '';
  const indent = (l: string) => l.match(/^ */)![0].length;
  const base = Math.min(...lines.map(indent));
  const items = lines.map((l) => {
    const [name, ...note] = l.trim().split(/\s+#\s?/);
    return { depth: Math.floor((indent(l) - base) / 2), name, note: note.join(' # ') };
  });
  const isLast = items.map((it, i) => {
    for (let j = i + 1; j < items.length; j++) {
      if (items[j].depth < it.depth) return true;
      if (items[j].depth === it.depth) return false;
    }
    return true;
  });
  const lastAt: boolean[] = [];
  const rows = items.map((it, i) => {
    lastAt[it.depth] = isLast[i];
    let prefix = '';
    for (let d = 1; d < it.depth; d++) prefix += lastAt[d] ? '    ' : '│   ';
    if (it.depth > 0) prefix += isLast[i] ? '└── ' : '├── ';
    const cls = it.name.endsWith('/') ? 'leo-tree__dir' : 'leo-tree__file';
    return `<span class="leo-tree__line">${prefix}</span><span class="${cls}">${esc(it.name)}</span>${it.note ? `<span class="leo-tree__note">  # ${esc(it.note)}</span>` : ''}`;
  });
  return `<pre class="leo-tree">${rows.join('\n')}</pre>`;
}
