# Blog

Next.js 16 (App Router) + PostgreSQL + Tailwind v4, Podman으로 자체 호스팅. 실행/API는 README.md.

## 디자인 시스템 (반드시 지킬 것)

구조: **토큰(`app/globals.css`) → UI 컴포넌트(`components/ui`) → 도메인 컴포넌트(`components`) → 페이지(`app`)**.
`DESIGN.md`는 출처(레퍼런스)일 뿐, 실제 기준은 `app/globals.css`의 `@theme`과 `@utility`다.

### 토큰
- 색: `primary` `on-primary` `link` `fg` `muted` `secondary` `fog` `surface` `line` → `bg-primary`, `text-muted`, `border-line` …
- 글자: `t-display` `t-headline` `t-title1` `t-title2` `t-title3` `t-body-lg` `t-body` `t-body-sm` `t-caption` `t-label`
  - `t-*`는 크기·행간만. 굵기는 항상 `font-light|font-medium|font-bold`로 따로 붙인다 (`t-label`만 완성형).
- 둥글기: `rounded-pill`(버튼·검색창) `rounded-card`(썸네일·입력창) `rounded-panel`(큰 이미지)
- 폭: `max-w-wrap` (1120px, `Container`가 처리)
- 폰트: Gmarket Sans 하나 (300/500/700). 라이트 모드만.

### 금지
- `text-[17px]`, `rounded-[10px]`, `text-[#fff]` 같은 임의 글자/색/둥글기 값
- `text-sm`, `text-xl` 등 Tailwind 기본 글자크기, `bg-blue-500`, `bg-white` 등 기본 팔레트, hex 색
- 레이아웃 임의값(`w-[calc(..)]`, `grid-cols-[..]`, `aspect-[..]`, 컴포넌트 고유 padding)은 허용

새 값이 정말 필요하면 컴포넌트에 박지 말고 `globals.css`에 토큰을 추가한 뒤 쓴다.

### 컴포넌트
있는 것부터 쓴다. 새로 만들기 전에 `components/ui`, `components`를 확인.
- `ui/Button`, `ui/ButtonLink` — `variant: primary|outline`, `size: lg(44px)|sm(36px)`
- `ui/Container` `ui/Eyebrow` `ui/SectionHeader` `ui/Thumb`
- `Header` `FeaturedHero` `PostCard(size: md|sm)` `PostGrid(cols: 3|4)` `Quote` `PostFrame`

variant/size는 객체 맵(`const VARIANT = {...}`)으로 정의한다 (Button, PostCard 참고). 클래스 조합 라이브러리 추가 금지.

### 글 본문
글은 자체 스타일이 든 완성 HTML이고 `PostFrame`(sandbox iframe)에 격리된다. 블로그 토큰 규칙은 글 HTML에 적용되지 않는다.

## 검증
- `npm run check:design` — 위 금지 규칙 검사. UI를 고친 뒤 반드시 통과시킬 것.
  git pre-commit 훅(`.githooks/`, `npm install` 시 자동 등록)이 커밋마다 실행한다. `--no-verify`로 우회하지 말 것.
- `npm run check` — auth/텍스트 추출 self-check
- `npm run build`
