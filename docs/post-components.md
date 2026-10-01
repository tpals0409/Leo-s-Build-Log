# 글 컴포넌트 (`<leo-*>`)

> 이 파일은 `lib/leo/specs.ts`에서 생성된다 (`npm run docs:post`). 직접 고치지 말 것.
> 견본: `/ko/design` — 실제 글과 같은 렌더 경로.

## 규칙
- 글은 완성 HTML 문서. 다이어그램·시각화는 아래 태그로 쓰면 서버가 블로그 디자인으로 그린다.
- 태그는 항상 닫는다 (`<leo-metric …></leo-metric>`). 속성값은 따옴표.
- 글 등록(`POST /api/posts`) 때 검사한다. 없는 태그·빠진 속성·잘못된 위치·잘못된 데이터는 이유와 함께 거절된다.
- Mermaid는 글 쓰는 쪽에서 SVG로 바꿔 `<leo-diagram>` 안에 넣는다:
  `npx -p @mermaid-js/mermaid-cli mmdc -i a.mmd -o a.svg -c mermaid.config.json -b transparent`
  (블로그 팔레트가 입혀진다. 가로로 긴 흐름은 `flowchart TD`가 작은 화면에서 읽기 좋다)
  **변환하는 컴퓨터에 Gmarket Sans가 설치돼 있어야 한다** (`public/fonts/*.ttf`). 없으면 다른 글꼴 폭으로 상자를 만들어 블로그에서 글자가 잘린다.
- 직접 만든 인터랙티브 예제는 `<template data-demo>` (격리 iframe). 외부 영상 등은 `https://` iframe.
- 글 안 `<script>`, `on*=` 속성, `javascript:` 링크, `srcdoc`은 제거된다.

## 구조·데이터

### `<leo-diagram>`

구조도·흐름도. Mermaid를 SVG로 바꿔서(mermaid.config.json 사용) 안에 넣는다. 이미지(<img>)도 된다.

| 속성 | 필수 | 값 | 설명 |
|---|---|---|---|
| `title` |  |  | 그림 제목 |
| `caption` |  |  | 그림 아래 설명 |

```html
<leo-diagram title="요청 흐름" caption="게이트웨이가 인증 후 서비스로 넘긴다">
  <svg viewBox="0 0 360 80" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="13">
    <rect x="4" y="20" width="96" height="40" rx="8" fill="none" stroke="#292725"/><text x="52" y="45" text-anchor="middle">Client</text>
    <rect x="132" y="20" width="96" height="40" rx="8" fill="none" stroke="#292725"/><text x="180" y="45" text-anchor="middle">Gateway</text>
    <rect x="260" y="20" width="96" height="40" rx="8" fill="none" stroke="#292725"/><text x="308" y="45" text-anchor="middle">Service</text>
    <path d="M100 40h28M228 40h28" stroke="#696866" stroke-width="1.5"/>
  </svg>
</leo-diagram>
```

### `<leo-chart>`

차트. 안에 JSON 데이터 {labels, series:[{name, values}]}. 값은 0 이상. 호버하면 값이 보인다.

안쪽은 글자 그대로(HTML 아님)

| 속성 | 필수 | 값 | 설명 |
|---|---|---|---|
| `type` | ✓ | `bar` `hbar` `line` `donut` | bar 세로 막대 · hbar 가로 막대(긴 라벨) · line 추이 · donut 비율(series 1개) |
| `title` |  |  | 차트 제목 |
| `unit` |  |  | 값 뒤에 붙는 단위 (예: ms, %, 회) |

```html
<leo-chart type="bar" title="빌드 시간" unit="s">
{"labels":["v1","v2","v3"],"series":[{"name":"빌드","values":[184,121,62]}]}
</leo-chart>
```

### `<leo-metrics>`

지표 카드 묶음.

안에 `<leo-metric>` 하나 이상 필요

```html
<leo-metrics>
  <leo-metric value="15" unit="jobs" label="CI 단계"></leo-metric>
  <leo-metric value="62" unit="s" label="빌드 시간" delta="-66%"></leo-metric>
  <leo-metric value="12" label="에이전트" note="Oracle + 11"></leo-metric>
</leo-metrics>
```

### `<leo-metric>`

지표 카드 하나.

`<leo-metrics>` 바로 안에서만 · 안쪽은 비움

| 속성 | 필수 | 값 | 설명 |
|---|---|---|---|
| `value` | ✓ |  | 큰 숫자 |
| `label` | ✓ |  | 설명 |
| `unit` |  |  | 단위 |
| `delta` |  |  | 변화량 (예: -66%, +3) |
| `note` |  |  | 보충 설명 한 줄 (예: Oracle + 11) |

### `<leo-compare>`

나란히 비교 (전/후, 장/단점, A/B). 표는 일반 <table>을 쓰면 기본 스타일이 붙는다.

안에 `<leo-side>` 하나 이상 필요

```html
<leo-compare>
  <leo-side label="Before"><p>매 요청 DB 조회, 응답 420ms</p></leo-side>
  <leo-side label="After"><p>캐시 후 응답 38ms</p></leo-side>
</leo-compare>
```

### `<leo-side>`

비교의 한쪽.

`<leo-compare>` 바로 안에서만

| 속성 | 필수 | 값 | 설명 |
|---|---|---|---|
| `label` | ✓ |  | 머리글 |

## 서술

### `<leo-steps>`

번호가 붙는 단계.

안에 `<leo-step>` 하나 이상 필요

```html
<leo-steps>
  <leo-step title="문제 정의"><p>성공 기준을 먼저 적는다.</p></leo-step>
  <leo-step title="작업 분해"><p>에이전트에게 맥락과 단위를 준다.</p></leo-step>
  <leo-step title="검증"><p>테스트와 실제 동작으로 확인한다.</p></leo-step>
</leo-steps>
```

### `<leo-step>`

단계 하나.

`<leo-steps>` 바로 안에서만

| 속성 | 필수 | 값 | 설명 |
|---|---|---|---|
| `title` | ✓ |  | 단계 제목 |

### `<leo-pipeline>`

화살표로 이어지는 흐름 (넓은 화면 가로, 좁은 화면 세로).

안에 `<leo-stage>` 하나 이상 필요

```html
<leo-pipeline>
  <leo-stage title="Lint">ESLint · tsc</leo-stage>
  <leo-stage title="Test">단위 · 통합</leo-stage>
  <leo-stage title="Build">arm64 이미지</leo-stage>
  <leo-stage title="Deploy">ArgoCD</leo-stage>
</leo-pipeline>
```

### `<leo-stage>`

파이프라인 단계 하나 (안쪽은 짧은 설명).

`<leo-pipeline>` 바로 안에서만

| 속성 | 필수 | 값 | 설명 |
|---|---|---|---|
| `title` | ✓ |  | 단계 이름 |

### `<leo-timeline>`

기간별 마일스톤.

안에 `<leo-milestone>` 하나 이상 필요

```html
<leo-timeline>
  <leo-milestone date="2026.04" title="MSA 설계" status="done"><p>서비스 6개로 분리</p></leo-milestone>
  <leo-milestone date="2026.06" title="에이전트 12명 운영" status="now"><p>오케스트레이션 정착</p></leo-milestone>
  <leo-milestone date="2026.09" title="모델 독립 하네스" status="next"></leo-milestone>
</leo-timeline>
```

### `<leo-milestone>`

마일스톤 하나.

`<leo-timeline>` 바로 안에서만

| 속성 | 필수 | 값 | 설명 |
|---|---|---|---|
| `date` | ✓ |  | 시점 (자유 형식) |
| `title` | ✓ |  | 제목 |
| `status` |  | `done` `now` `next` | 완료·진행 중·예정 (기본 done) |

### `<leo-callout>`

강조 박스.

| 속성 | 필수 | 값 | 설명 |
|---|---|---|---|
| `type` |  | `note` `tip` `warn` | 메모·팁·주의 (기본 note) |
| `title` |  |  | 제목 (기본: 종류 이름) |

```html
<leo-callout type="tip"><p>에이전트에게는 결과물보다 <strong>성공 기준</strong>을 먼저 준다.</p></leo-callout>
```

### `<leo-adr>`

문제 → 결정 → 결과 흐름 (ADR). 안에 leo-problem, leo-decision, leo-result.

안에 `<leo-decision>` 하나 이상 필요

```html
<leo-adr>
  <leo-problem><p>세션이 4개 레이어에서 따로 만료돼 사용자가 자주 로그아웃됐다.</p></leo-problem>
  <leo-decision><p>만료 정책을 게이트웨이 한 곳으로 모았다.</p></leo-decision>
  <leo-result><p>강제 로그아웃 문의가 0건이 됐다.</p></leo-result>
</leo-adr>
```

### `<leo-problem>`

ADR의 문제 칸

`<leo-adr>` 바로 안에서만

### `<leo-decision>`

ADR의 결정 칸

`<leo-adr>` 바로 안에서만

### `<leo-result>`

ADR의 결과 칸

`<leo-adr>` 바로 안에서만

## 코드

### `pre > code`

코드 블록. 서버에서 문법 강조. class="language-xxx"(ts, tsx, js, py, go, sh, yaml, json, sql, diff …), data-file(파일명), data-highlight(강조할 줄 "3,5-7"). 코드 안의 < > & 는 &lt; &gt; &amp; 로.

```html
<pre><code class="language-ts" data-file="lib/page.ts" data-highlight="3">export const localeOf = async (params: Promise<{ locale: string }>) => {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
};</code></pre>
```

### `<leo-tree>`

파일 트리. 안에 경로를 2칸 들여쓰기로. 폴더는 /로 끝내고, # 뒤는 설명.

안쪽은 글자 그대로(HTML 아님)

```html
<leo-tree>
app/
  [locale]/
    posts/
      [slug]/page.tsx   # 글 상세
  api/
    posts/route.ts      # 글 등록 API
lib/
  leo/                  # 글 컴포넌트
</leo-tree>
```

### `<leo-terminal>`

터미널. "$ "로 시작하는 줄은 명령, 나머지는 출력.

안쪽은 글자 그대로(HTML 아님)

| 속성 | 필수 | 값 | 설명 |
|---|---|---|---|
| `title` |  |  | 창 제목 (기본 Terminal) |

```html
<leo-terminal>
$ npm run check:design
design check ok
$ podman compose up -d
 Container blog-app-1 Started
</leo-terminal>
```
