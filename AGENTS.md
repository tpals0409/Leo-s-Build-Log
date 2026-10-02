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
- **홈:** 대표 글 슬라이드(`post.json`의 `featured: true` 글 중 최신 5편, 5초마다 자동 전환 — 2026-10-02) → 최신 글 3개(3열, 대표 글 제외) → 프로젝트 카드 4개(4열).
  대표 글은 카테고리로 자동 선택하지 않고 직접 고른다(지금은 회고 중심).
- **프로젝트:** AlgoSu, FINCH, Janus, PinLog. 프로젝트별 페이지에 소개와 관련 글 목록. 글은 프로젝트에 연결될 수 있다.
- **연락:** 소개 페이지에만. 푸터는 두지 않는다(2026-10-01 삭제). 메뉴 항목으로도 두지 않는다.
- **챗봇(나에 대한 질의응답):** 예정. 위치는 만들 때 정한다. 미리 메뉴 자리를 만들지 않는다.

### 어디에 무엇이 있나
- 페이지: `app/[locale]/…` (홈, posts, posts/[slug], projects, projects/[slug], about, search). 관리자 `app/admin`은 언어 밖, 별도 root layout.
- 화면 문구: `lib/i18n.ts`의 `DICT` — **컴포넌트에 한글/영어 문구를 직접 쓰지 말고 ko/en 둘 다 여기에 추가한다.** 카테고리 키·라벨도 여기.
- 프로젝트: `lib/projects.ts` (코드로 관리, DB 아님). 블로그 이름·연락처: `lib/site.ts`. 프로젝트 소개와 이메일은 아직 자리표시(TODO).
- **글 원본은 git `content/posts/<slug>/`**(`post.json` + `ko.html` + `en.html`, 형식은 `content/README.md`). main 머지 → `content.yml`이 API로 DB에 반영.
  DB는 화면용 사본 — 글·발행·Featured를 API나 DB로 직접 바꾸지 말고 이 폴더를 고친다. 지우면 블로그에서도 지워진다.
- DB: `posts`(공통) + `post_translations`(ko/en 행). 등록 검증은 `lib/postInput.ts`(git 글은 `lib/content.ts`가 같은 검증 + `publishedAt` 필수).
- 새 페이지는 `lib/page.ts`의 `localeOf(params)`로 언어를 받고(ko/en 외 404), `generateMetadata`는 `pageMeta(locale, path, { title, description })`를 돌려준다
  (canonical·hreflang·링크 미리보기 텍스트가 한 번에 들어감).
- **`SITE_URL`은 실행 환경 값이다.** 컨테이너 빌드 때는 없으므로, metadata(canonical·OG)를 내는 페이지와 sitemap·robots는
  정적 생성되면 안 된다(`export const dynamic = 'force-dynamic'`). 새 정적 페이지를 만들면 주소가 `localhost`로 굳는다.
- 404: 언어 안의 `notFound()`는 `app/[locale]/not-found.tsx`(레이아웃 안, 주소로 언어 판단), 어떤 route에도 안 맞는 주소는
  `app/global-not-found.tsx`(Next 실험 기능, 한/영 함께). layout에서는 `notFound()`를 던지지 말 것 — 잡을 경계가 없어 Next 기본 404가 뜬다
  (`layoutLocale`이 ko로 대체하고, 페이지의 `localeOf`가 던진다).
- 링크 미리보기 이미지: `app/[locale]/opengraph-image.tsx`(기본: 로고+블로그 이름)를 모든 페이지가 물려받고, 글·프로젝트는 각 폴더의 `opengraph-image.tsx`가 제목 카드를 만든다.
  그리는 코드는 `lib/og.tsx` 하나 — 색은 `globals.css` 토큰 값을 옮겨 적은 것이라 토큰을 바꾸면 여기도 맞춘다.

## 디자인 시스템 (반드시 지킬 것)

**`DESIGN.md`를 엄격히 따른다.** 확인된 값만 쓰고, 빈칸을 그럴듯한 기본값으로 채우지 않는다(DESIGN.md "Unknowns").
DESIGN.md보다 우선하는 사용자 지정은 넷뿐: **레오 팔레트**(색), **Gmarket Sans**(블로그 화면) · **Pretendard**(글 본문), **목업 레이아웃**(이미지 모서리 등), **호버·등장 움직임**(아래).
구조: 토큰(`app/globals.css`) → UI 컴포넌트(`components/ui`) → 도메인 컴포넌트(`components`) → 페이지(`app`).

### 원칙 (DESIGN.md)
- **내용이 주인공, 컨트롤은 절제.** 상자·배경 채움·그림자로 감싸지 않는다. 구분은 여백(`--space-cluster` 20px)과 가는 선.
- **한 구성 안에 강조색은 하나**(`brand`). 나머지는 charcoal~sand 무채색 단계로.
- **글자는 6개 역할만.** 대문자·자간 벌린 작은 라벨(eyebrow) 쓰지 않는다.
- **호버·누름은 정해진 상호작용 유틸리티만 쓴다** (`app/globals.css`). DESIGN.md엔 호버·움직임이 없어서 사용자 지정(2026-10-01)으로 둔 것:
  `press`(버튼·탭: 호버 살짝 확대, 누르면 살짝 축소) · `press-card`(카드: 누를 때만) · `thumb-zoom`(카드 썸네일: 카드에 올리면 확대, 카드에 `group`) · `link-hover`(텍스트 링크 → 링크색) ·
  `arrow`(`ui/Arrow`의 →, 부모에 `group`) · `primary-hover`(채운 버튼 색, 팔레트 Brand → Deep Orange). `ui/Button`은 이미 `press`를 쓴다.
  새로 누를 수 있는 것을 만들면 이 중 하나를 붙인다. 글 본문(Shadow DOM) 안은 `lib/leo/style.ts`에 같은 값으로 있다(본문 링크·코드 복사 버튼).
- **등장 움직임도 정해진 셋만** (사용자 지정, 2026-10-01): `reveal`(카드 — `ui/Reveal`로 감싸면 화면 아래쪽 것만 스크롤 시 떠오름) ·
  `page-enter`(페이지 이동 시, `app/[locale]/template.tsx`) · `read-progress`(글 상단 읽기 진행 막대). 들어오는 것만, 나가는 효과 없음.
  글 본문·페이지 맨 위 제목에는 등장 효과를 쓰지 않는다. 시간·곡선은 토큰(`--duration-hover|reveal`, `--ease-standard`)만.
  움직임 줄이기 설정을 존중하고, 키보드 포커스 표시는 유지.
- **대표 글 슬라이드** (사용자 지정, 2026-10-02): `slide-fade`(겹친 슬라이드끼리 교차 페이드, `FeaturedHero`). 5초 간격, 마우스·포커스가 있으면 멈춤,
  점을 누르거나 가로로 끌면(스와이프·드래그) 자동 전환 끔, 움직임 줄이기 설정이면 자동 전환 안 함. 슬라이드를 한 칸에 겹쳐 높이가 바뀌지 않게 한다.
- **글 상단 썸네일 배경** (사용자 지정, 2026-10-02): 글 페이지 제목 영역(본문 폭, `rounded-panel`)에 썸네일을 `blur-xs`로 깔고 `bg-surface/60` 막을 얹는다.
  흐림은 여기만. 높이는 글자에 맞춰 모바일에서 첫 문단이 보이게.
- **이미지 위 글자** (2026-10-02 확정): 썸네일 위에 글자를 올릴 때는 가장 어두운 썸네일 기준으로도 4.5:1 이상이어야 한다.
  - 흰 막은 `bg-surface/60` 이상. 60%에서 실측 최악 대비: fg 6.0 · link 4.1 · secondary 3.7 · muted·label 미달 → **글자는 `fg`만, 링크는 `fg` + 밑줄.**
  - 대표 글 슬라이드(`/90`~`/70` 그라데이션)도 같은 원칙. 막을 더 옅게 하려면 썸네일을 다시 측정하고 이 표를 고친다.

### 토큰
- 글자 역할 `t-*` — 클래스 하나가 크기·행간·굵기·자간을 다 정한다(굵기 클래스 `font-*` 쓰지 않음):

  | 클래스 | DESIGN.md 역할 | 값 | 쓰는 곳 |
  |---|---|---|---|
  | `t-display` | Display Hero | 56/60 · 700 · -0.28px | 홈 히어로 |
  | `t-section` | Section | 40/44 · 700 | 페이지·섹션·글 제목, 모바일 히어로 |
  | `t-tile` | Tile Heading | 28/32 · 500 · 0.196px | 카드 제목, 로고(데스크톱), 대표 글 슬라이드 제목(모바일) |
  | `t-body` | Body | 17/25 · 500 · -0.374px | 본문·버튼·리드 |
  | `t-body-sm` | Body Small | 14/18 · 500 · -0.224px | 요약·메뉴·표·작은 버튼 |
  | `t-caption` | Caption | 12/16 · 500 · -0.12px | 날짜·카테고리·보조 |

  Gmarket Sans는 300·500·700뿐 → DESIGN.md의 400은 500(Gmarket 본문 굵기), 600은 700으로 대응.
  **글 본문(Shadow DOM) 안은 Pretendard**(`--font-post`): `lib/postHtml.ts`가 본문 안의 `--font-sans`를 Pretendard로, 굵기 토큰을 DESIGN.md 원래 값(400·600)으로 바꾼다. 글 CSS는 본문에 `var(--font-sans)`, 소제목(h2·h3)에 `var(--font-heading, var(--font-sans))`(Gmarket Sans)을 쓴다.
- 버튼(`ui/Button`): DESIGN.md 그대로 — lg 44px · 11px 21px · 17px, sm 36px · 8px 15px · 14px, 980px pill.
- 색(역할): `surface`(paper 흰 배경) `fg` `secondary` `muted` `label` `link` `primary` `primary-hover` `on-primary` `fog` `line` `highlight`
  - 팔레트 원색: `brand` `brand-deep` `lion` `cocoa` `butter` `sand` `cream` `sage` `steel` `charcoal` `paper` — 새 역할을 정할 때만.
  - **오렌지(`brand`)는 글자색 금지**(흰 배경 위 2.4:1). 오렌지 면 위 글자는 `on-primary`(charcoal). 새 글자색은 4.5:1 이상 확인.
- 모서리: `rounded-pill`(DESIGN.md 버튼·검색창·탭). `rounded-card`(10)·`rounded-panel`(18)은 **목업 실측, 이미지 전용** — 상자에 쓰지 않는다.
- 간격: `--space-cluster` 20px (DESIGN.md 콘텐츠 묶음).
- **모든 토큰은 CSS 변수로도 있다** (`@theme static`). 문자열 CSS(글 컴포넌트 `lib/leo/style.ts` 등)는 var()로:
  `--fs-*`·`--lh-*`·`--fw-*`·`--ls-*`(역할별) `--radius-*` `--space-cluster` `--color-*` `--font-sans|mono`
- 폭: `max-w-wrap` (1120px, `Container`). 라이트 모드만.
- 로고: `public/logo.webp`(헤더), `public/logo.png`(OG), `app/icon.png`·`app/apple-icon.png`. 배경 투명(apple-icon만 paper).

### 금지 (`npm run check:design`이 검사)
- 임의 글자/색/둥글기 값(`text-[17px]`, `rounded-[10px]`, `text-[#fff]`), Tailwind 기본 글자크기·팔레트, hex 색
- 굵기 클래스(`font-medium` 등) — 역할이 정한다
- `hover:`·`active:`, 움직임 클래스(`transition-*`, `animate-*`, `duration-*`, `ease-*`)를 직접 쓰는 것 — 위 상호작용 유틸리티로
- 문자열 CSS의 `font-size`·`line-height`·`font-weight`·`letter-spacing`·`border-radius` 숫자, `transition`·`animation`의 시간·곡선 숫자(토큰 var()로), `box-shadow`, (글 컴포넌트의) hex 색
- 레이아웃 임의값(`w-[calc(..)]`, `grid-cols-[..]`, `aspect-[..]`)은 허용. 원형은 `border-radius:50%`

새 값이 정말 필요하면 DESIGN.md에 근거가 있는지 먼저 본다. 없으면 만들지 말고 사용자에게 묻는다.

### 컴포넌트
있는 것부터 쓴다. 새로 만들기 전에 `components/ui`, `components`를 확인.
- `ui/Button`, `ui/ButtonLink` — `variant: primary|outline`, `size: lg(44px)|sm(36px)` · `ui/Arrow`(호버 시 움직이는 →)
- `ui/Container` `ui/Eyebrow` `ui/SectionHeader` `ui/Thumb` `ui/Reveal`(스크롤 등장)
- `Header` `LocaleSwitch` `FeaturedHero` `PostCard(size: md|sm)` `PostGrid(cols: 3|4)` `ProjectCard` `ProjectGrid` `PostBody` `PostEnhancer`(차트 값 툴팁·코드 복사·데모 높이)
- 도메인 컴포넌트는 `locale` prop을 받아 링크(`/${locale}/…`)와 문구를 만든다.

variant/size는 객체 맵(`const VARIANT = {...}`)으로 정의한다 (Button, PostCard 참고). 클래스 조합 라이브러리 추가 금지.

### 글 본문
**글을 쓰기 전에 `docs/post-components.md`를 읽는다.** 다이어그램·차트·지표·비교·단계·타임라인·콜아웃·ADR·코드·파일 트리·터미널은
직접 HTML/CSS로 그리지 말고 `<leo-*>` 태그를 쓴다 — 서버가 블로그 디자인으로 그리고, 등록 때 검사한다. 견본은 `/ko/design`.
- 컴포넌트를 추가·수정할 때: `lib/leo/specs.ts`(등록부: 속성 규칙·예시·렌더) + `lib/leo/style.ts`(스타일) → `npm run docs:post`.
  예시는 반드시 검증을 통과해야 한다(`npm run check`가 모든 예시를 검증·렌더하고, 문서가 등록부와 다르면 실패).
- 처리 순서: 데모 슬롯 → `lib/leo`가 트리로 정화(스크립트·이벤트 속성 제거) + 컴포넌트 렌더 + 코드 강조(Shiki) → 글 CSS 변환.
글은 자체 스타일이 든 완성 HTML이고, `PostBody`가 서버에서 Shadow DOM으로 렌더한다(`lib/postHtml.ts`).
본문이 페이지 HTML에 들어가 검색엔진이 읽고, 글 CSS는 shadow root에 격리된다. 블로그 토큰 규칙은 글 HTML에 적용되지 않는다.
- **움직이는 부분(차트·토글·예제 등)은 반드시 `<template data-demo>`로 감싼다.** 그 안은 스크립트·외부 라이브러리(CDN)를 쓸 수 있는
  완성 HTML이고, 격리된 iframe(`sandbox`, same-origin 없음)으로 실행된다. 높이는 자동으로 맞고, `data-height`(초기 높이, 기본 320)·`data-title`(접근성 이름)을 줄 수 있다.
  데모 안 내용은 검색되지 않으니 설명 문장은 데모 바깥 본문에 쓴다.
- 데모 **바깥**의 `<script>`, `on*=` 속성, `javascript:` 링크는 제거된다(블로그 권한으로 실행되기 때문).
- 글 CSS의 `html`/`:root` 셀렉터는 `:host`로, `body` 셀렉터는 본문을 감싼 `.post-root`로 바뀐다.

## 검증
- `npm run check:design` — 위 금지 규칙 검사. UI를 고친 뒤 반드시 통과시킬 것.
  git pre-commit 훅(`.githooks/`, `npm install` 시 자동 등록)이 커밋마다 실행한다. `--no-verify`로 우회하지 말 것.
- `npm run check` — auth, 텍스트 추출, 본문 변환, 글 등록 검증, 글 컴포넌트 예시·문서 self-check, `content/posts`의 모든 글 검증
- `npm run build`
- GitHub Actions(`.github/workflows/ci.yml`)가 main 푸시·PR마다 위 세 가지를 Node 24로 다시 돌린다. 실패한 채로 두지 말 것.
  main 푸시는 검사 통과 후 k3s(arm64)용 이미지를 GHCR에 `main-<sha>`로 올린다. 배포 요건(포트·probe·PVC·env)은 README "k3s 배포".
