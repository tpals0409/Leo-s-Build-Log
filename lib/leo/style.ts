// 글 컴포넌트 스타일 — DESIGN.md를 엄격히 따른다.
//  · 내용이 주인공: 상자·배경·그림자 없이 여백(--space-cluster 20px)과 가는 선으로 구분
//  · 강조색은 한 구성에 하나(brand). 나머지는 charcoal~sand 무채색 단계
//  · 글자는 DESIGN.md 6개 역할만(role()), 대문자 라벨·움직임·지어낸 호버 없음
// 값은 전부 토큰 var()로 — 숫자를 직접 쓰지 않는다 (check:design이 검사). 원형만 50%.
// 기본 요소 스타일(table 등)은 :where()로 우선순위 0 → 글 CSS가 항상 이긴다.
const role = (r: 'display' | 'section' | 'tile' | 'body' | 'body-sm' | 'caption', family = 'var(--font-sans)') =>
  `font:var(--fw-${r}) var(--fs-${r})/var(--lh-${r}) ${family};letter-spacing:var(--ls-${r})`;
const gap = 'var(--space-cluster)';

export const LEO_CSS = `
.leo-chart,.leo-figure,.leo-metrics,.leo-compare,.leo-steps,.leo-pipeline,.leo-timeline,.leo-callout,.leo-adr,.leo-code,.leo-tree,.leo-term{
  ${role('body')};color:var(--color-fg);margin:2em 0;box-sizing:border-box}
.leo-flow>:first-child{margin-top:0}.leo-flow>:last-child{margin-bottom:0}
.leo-error{${role('body-sm')};color:var(--color-brand-deep);border:1px dashed currentColor;padding:8px 15px}
.leo-sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* 그림·차트 — 테두리 없이, 제목과 설명만. 자기 폭에 반응한다(컨테이너 쿼리) */
.leo-figure,.leo-chart{position:relative;container-type:inline-size}
.leo-chart .leo-chart__svg--narrow{display:none}
@container (max-width:520px){
  /* 차트: 좁은 칸용으로 따로 그린 SVG (글자가 6px로 줄지 않게) */
  .leo-chart .leo-chart__svg--wide{display:none}
  .leo-chart .leo-chart__svg--narrow{display:block}
  /* 다이어그램: 원래 크기로, 넘치면 가로 스크롤 */
  .leo-figure__art{overflow-x:auto}
  .leo-figure__art svg{min-width:var(--w,auto)}
}
.leo-figure__title{margin:0 0 ${gap};${role('body')}}
.leo-figure__art svg,.leo-figure__art img{display:block;max-width:100%;height:auto;margin:0 auto}
.leo-figure figcaption{margin-top:8px;${role('caption')};color:var(--color-muted)}
.leo-chart svg{display:block;width:100%;height:auto;overflow:visible}
.leo-grid{stroke:var(--color-line);stroke-width:1}
.leo-axis{${role('caption')};fill:var(--color-muted)}.leo-axis--label{fill:var(--color-fg)}
.leo-value{${role('caption')};fill:var(--color-fg)}
.leo-donut-total{${role('tile')};fill:var(--color-fg)}
.leo-mark{cursor:default}
.leo-line{fill:none;stroke-width:2;stroke-linejoin:round}
.leo-dot{stroke:var(--color-surface);stroke-width:2}
/* 계열 색: 첫 계열만 강조색, 나머지는 회색 단계 */
.leo-s0{fill:var(--color-brand);stroke:var(--color-brand)}.leo-s1{fill:var(--color-charcoal);stroke:var(--color-charcoal)}
.leo-s2{fill:var(--color-muted);stroke:var(--color-muted)}.leo-s3{fill:var(--color-line);stroke:var(--color-line)}
.leo-s4{fill:var(--color-secondary);stroke:var(--color-secondary)}.leo-s5{fill:var(--color-fog);stroke:var(--color-fog)}
.leo-line.leo-s0,.leo-line.leo-s1,.leo-line.leo-s2,.leo-line.leo-s3,.leo-line.leo-s4,.leo-line.leo-s5{fill:none}
.leo-legend{display:flex;flex-wrap:wrap;gap:${gap};margin:8px 0 0;padding:0;list-style:none;${role('caption')};color:var(--color-secondary)}
.leo-legend li{display:flex;align-items:center;gap:8px}
.leo-swatch{width:10px;height:10px;border-radius:50%;display:inline-block}
.leo-swatch.leo-s0{background:var(--color-brand)}.leo-swatch.leo-s1{background:var(--color-charcoal)}.leo-swatch.leo-s2{background:var(--color-muted)}
.leo-swatch.leo-s3{background:var(--color-line)}.leo-swatch.leo-s4{background:var(--color-secondary)}.leo-swatch.leo-s5{background:var(--color-fog)}
.leo-tooltip{position:absolute;pointer-events:none;z-index:2;padding:8px 15px;background:var(--color-charcoal);color:var(--color-paper);
  ${role('caption')};white-space:nowrap;transform:translate(-50%,calc(-100% - 8px))}

/* 지표 — 큰 숫자, 위쪽 가는 선 */
.leo-metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:${gap}}
.leo-metric{border-top:1px solid var(--color-line);padding-top:${gap}}
.leo-metric p{margin:0}
.leo-metric__value{${role('section')}}
.leo-metric__unit{${role('body')};margin-left:4px;color:var(--color-secondary)}
.leo-metric__label{margin-top:8px!important;${role('body-sm')};color:var(--color-secondary)}
.leo-metric__delta{margin-top:8px!important;${role('caption')};color:var(--color-muted)}

/* 비교 — 나란한 칸, 위쪽 굵은 선 */
.leo-compare{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:${gap}}
.leo-side{border-top:2px solid var(--color-fg);padding-top:${gap}}
.leo-side__label{margin:0 0 8px;${role('caption')};color:var(--color-muted)}
:where(.post-root) :where(table){border-collapse:collapse;width:100%;margin:2em 0;${role('body-sm')}}
:where(.post-root) :where(th,td){border-bottom:1px solid var(--color-line);padding:8px 15px 8px 0;text-align:left;vertical-align:top}
:where(.post-root) :where(thead th){border-bottom:1px solid var(--color-fg);color:var(--color-secondary)}

/* 단계 — 번호는 글자로 */
.leo-steps{list-style:none;padding:0;counter-reset:leo-step}
.leo-step{display:grid;grid-template-columns:48px 1fr;border-top:1px solid var(--color-line);padding:${gap} 0;counter-increment:leo-step}
.leo-step::before{content:counter(leo-step);${role('tile')};color:var(--color-fg)}
.leo-step__title{margin:0 0 8px;${role('body')}}
.leo-step>.leo-flow{grid-column:2}

/* 파이프라인 — 단계 이름 뒤 → */
.leo-pipeline{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:${gap}}
.leo-stage{border-top:2px solid var(--color-fg);padding-top:${gap}}
.leo-stage__title{margin:0;${role('body')}}
.leo-stage:not(:last-child) .leo-stage__title::after{content:" →";color:var(--color-muted)}
.leo-stage__body{margin-top:8px;${role('body-sm')};color:var(--color-secondary)}

/* 타임라인 — 날짜 열 + 내용 열. 진행 중만 강조색 점 */
.leo-timeline{list-style:none;padding:0}
.leo-milestone{display:grid;grid-template-columns:120px 1fr;column-gap:${gap};border-top:1px solid var(--color-line);padding:${gap} 0}
.leo-milestone__date{margin:0;${role('caption')};color:var(--color-muted);padding-top:4px}
.leo-milestone__title{margin:0 0 8px;${role('body')}}
.leo-milestone>.leo-flow{grid-column:2}
.leo-milestone--now .leo-milestone__title::before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--color-brand);margin-right:8px;vertical-align:middle}
.leo-milestone--next{color:var(--color-muted)}

/* 콜아웃 — 위아래 가는 선, 종류는 제목 글자로만 */
.leo-callout{border-top:1px solid var(--color-fg);border-bottom:1px solid var(--color-line);padding:${gap} 0}
.leo-callout__title{margin:0 0 8px;${role('body-sm')};color:var(--color-secondary)}

/* ADR — 라벨 열 + 내용 열 */
.leo-adr__item{display:grid;grid-template-columns:120px 1fr;column-gap:${gap};border-top:1px solid var(--color-line);padding:${gap} 0}
.leo-adr__item:first-child{border-top-color:var(--color-fg)}
.leo-adr__label{margin:0;${role('caption')};color:var(--color-muted);padding-top:4px}

@media (max-width:640px){
  .leo-milestone,.leo-adr__item{grid-template-columns:1fr;row-gap:8px}
  .leo-milestone>.leo-flow{grid-column:1}
}

/* 코드 */
.leo-code{position:relative}
.leo-code__file{margin-bottom:8px;min-height:var(--lh-caption);${role('caption')};color:var(--color-muted)}
.leo-code pre,.leo-term pre{margin:0;padding:${gap} 0;overflow-x:auto;font:var(--fw-body) var(--fs-body-sm)/var(--lh-body) var(--font-mono);tab-size:2}
.leo-code pre{background:var(--color-fog)}
.leo-code .line{display:inline-block;min-width:100%;padding:0 ${gap};box-sizing:border-box}
.leo-code .leo-hl{background:color-mix(in srgb,var(--color-highlight) 45%,transparent)}
.leo-code .leo-add{background:color-mix(in srgb,var(--color-sage) 22%,transparent)}
.leo-code .leo-del{background:color-mix(in srgb,var(--color-brand) 16%,transparent)}
.leo-copy{position:absolute;right:0;top:0;padding:0;border:0;background:none;${role('caption')};color:var(--color-link);cursor:pointer}
.leo-copy::after{content:"";position:absolute;left:50%;top:50%;width:max(100%,44px);height:max(100%,44px);transform:translate(-50%,-50%)} /* 터치 영역 44px */

/* 파일 트리 — 상자 없이 고정폭 글자만 */
.leo-tree{margin:2em 0;font:var(--fw-body) var(--fs-body-sm)/var(--lh-body) var(--font-mono);overflow-x:auto}
.leo-tree__line,.leo-tree__note{color:var(--color-muted)}.leo-tree__file{color:var(--color-secondary)}

/* 터미널 — 어두운 면 하나로 구분 */
.leo-term{background:var(--color-charcoal);color:var(--color-line)}
.leo-term figcaption{padding:8px ${gap};${role('caption')};color:var(--color-line);border-bottom:1px solid color-mix(in srgb,var(--color-line) 20%,transparent)}
.leo-term pre{padding:${gap}}
.leo-term__prompt{color:var(--color-butter)}.leo-term__cmd{color:var(--color-paper)}.leo-term__out{color:var(--color-line)}
`;
