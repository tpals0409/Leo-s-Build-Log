# Blog

Next.js 16 (App Router) + PostgreSQL + Tailwind v4, Podman으로 자체 호스팅. 실행/API는 README.md.

## 목적
김세민(GitHub `tpals0409`)의 기술자로서의 자기 PR. 방문자는 "이 사람 어떤 기술자지?"를 판단하러 오는 사람(채용 담당자, 동료 개발자)이다.
기조: **AI 에이전트로 일하는 개발자, 같이 일하고 싶은 사람.** 이건 화면에 쓸 문구가 아니라 판단 기준이다.
스스로 설명하는 문장 대신 글·프로젝트·이 저장소 자체로 드러나게 한다.

## 정보 구조 (2026-10-01 확정·구현)
목업(`블로그 목업.png`)의 레이아웃·디자인은 유지하되, 메뉴와 섹션 구성은 아래가 우선한다.

- **언어:** 모든 페이지가 `/ko/...`, `/en/...`로 분리. `/`는 `/ko`로 보낸다.
  - 브라우저 언어로 자동 이동하지 않는다. 헤더의 KO/EN 전환만.
  - 글은 **반드시 두 언어 모두** 있어야 발행된다. 등록 API는 ko/en을 함께 받고 하나라도 없으면 거절한다.
  - 페이지마다 서로를 가리키는 hreflang을 넣는다.
- **상단 메뉴:** 글 / 프로젝트 / 소개 (EN: Posts / Projects / About) + 검색 + KO/EN 전환. 메뉴는 콘텐츠 종류로 나누고, 글 주제로 나누지 않는다.
- **글 분류:** 카테고리 3개 — AI 에이전트 / 엔지니어링 / 회고 (EN: AI Agents / Engineering / Retrospective). 세부 주제는 태그.
- **홈:** 대표 글 1편(관리자가 고정) → 최신 글 3개(3열) → 프로젝트 카드 4개(4열).
- **프로젝트:** AlgoSu, FINCH, Janus, PinLog. 프로젝트별 페이지에 소개와 관련 글 목록. 글은 프로젝트에 연결될 수 있다.
- **연락:** 소개 페이지와 모든 페이지 푸터. 메뉴 항목으로는 두지 않는다.
- **챗봇(나에 대한 질의응답):** 예정. 위치는 만들 때 정한다. 미리 메뉴 자리를 만들지 않는다.

### 어디에 무엇이 있나
- 페이지: `app/[locale]/…` (홈, posts, posts/[slug], projects, projects/[slug], about, search). 관리자 `app/admin`은 언어 밖, 별도 root layout.
- 화면 문구: `lib/i18n.ts`의 `DICT` — **컴포넌트에 한글/영어 문구를 직접 쓰지 말고 ko/en 둘 다 여기에 추가한다.** 카테고리 키·라벨도 여기.
- 프로젝트: `lib/projects.ts` (코드로 관리, DB 아님). 소개·연락처: `lib/site.ts`. 둘 다 아직 자리표시(TODO).
- DB: `posts`(공통) + `post_translations`(ko/en 행). 등록 검증은 `lib/postInput.ts`.
- 새 페이지는 `lib/page.ts`의 `localeOf(params)`로 언어를 받고(ko/en 외 404), `generateMetadata`에서 `alternates(locale, path)`로 canonical·hreflang을 넣는다.

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
- `Header` `Footer` `LocaleSwitch` `FeaturedHero` `PostCard(size: md|sm)` `PostGrid(cols: 3|4)` `ProjectCard` `ProjectGrid` `PostBody`
- 도메인 컴포넌트는 `locale` prop을 받아 링크(`/${locale}/…`)와 문구를 만든다.

variant/size는 객체 맵(`const VARIANT = {...}`)으로 정의한다 (Button, PostCard 참고). 클래스 조합 라이브러리 추가 금지.

### 글 본문
글은 자체 스타일이 든 완성 HTML이고, `PostBody`가 서버에서 Shadow DOM으로 렌더한다(`lib/postHtml.ts`).
본문이 페이지 HTML에 들어가 검색엔진이 읽고, 글 CSS는 shadow root에 격리된다. 블로그 토큰 규칙은 글 HTML에 적용되지 않는다.
- 글의 `<script>`, `on*=` 속성, `javascript:` 링크는 제거된다(블로그 권한으로 실행되기 때문). 인터랙티브 글은 지원하지 않는다.
- 글 CSS의 `html`/`body`/`:root` 셀렉터는 `:host`로 바뀐다.

## 검증
- `npm run check:design` — 위 금지 규칙 검사. UI를 고친 뒤 반드시 통과시킬 것.
  git pre-commit 훅(`.githooks/`, `npm install` 시 자동 등록)이 커밋마다 실행한다. `--no-verify`로 우회하지 말 것.
- `npm run check` — auth, 텍스트 추출, 본문 변환, 글 등록 검증 self-check
- `npm run build`
