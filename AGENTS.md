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
- **연락:** 소개 페이지에만. 푸터는 두지 않는다(2026-10-01 삭제). 메뉴 항목으로도 두지 않는다.
- **챗봇(나에 대한 질의응답):** 예정. 위치는 만들 때 정한다. 미리 메뉴 자리를 만들지 않는다.

### 어디에 무엇이 있나
- 페이지: `app/[locale]/…` (홈, posts, posts/[slug], projects, projects/[slug], about, search). 관리자 `app/admin`은 언어 밖, 별도 root layout.
- 화면 문구: `lib/i18n.ts`의 `DICT` — **컴포넌트에 한글/영어 문구를 직접 쓰지 말고 ko/en 둘 다 여기에 추가한다.** 카테고리 키·라벨도 여기.
- 프로젝트: `lib/projects.ts` (코드로 관리, DB 아님). 블로그 이름·연락처: `lib/site.ts`. 프로젝트 소개와 이메일은 아직 자리표시(TODO).
- DB: `posts`(공통) + `post_translations`(ko/en 행). 등록 검증은 `lib/postInput.ts`.
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

구조: **토큰(`app/globals.css`) → UI 컴포넌트(`components/ui`) → 도메인 컴포넌트(`components`) → 페이지(`app`)**.
`DESIGN.md`(Apple)는 타이포·레이아웃 레퍼런스일 뿐이고, 색은 **레오 팔레트**(2026-10-01)다. 실제 기준은 `app/globals.css`의 `@theme`과 `@utility`.

### 토큰
- 색(역할): `surface`(paper — 팔레트에 맞춘 흰색 배경) `fg` `secondary` `muted` `label` `link` `link-hover` `primary` `primary-hover` `on-primary` `fog` `line` `highlight`
  → `bg-surface`, `text-muted`, `text-label`, `border-line` … 컴포넌트는 역할 이름만 쓴다.
- 색(팔레트 원색): `brand` `brand-deep` `lion` `cocoa` `butter` `sand` `cream` `sage` `steel` `charcoal` (+ 배경용 `paper`) — 그래픽용, 또는 새 역할을 정의할 때.
  - **오렌지(`brand`)는 글자색으로 쓰지 않는다**(흰 배경 위 2.4:1). 오렌지 면 위 글자는 `on-primary`(charcoal), 흰색 금지(2.5:1).
  - 새 글자색 조합은 배경(paper) 대비 4.5:1 이상인지 확인한다(`globals.css` 주석에 대비값). `fog`(cream) 면 위라면 그 위에서도 확인.
- 글자: `t-display` `t-headline` `t-title1` `t-title2` `t-title3` `t-body-lg` `t-body` `t-body-sm` `t-caption` `t-label`
  - `t-*`는 크기·행간만. 굵기는 항상 `font-light|font-medium|font-bold`로 따로 붙인다 (`t-label`만 완성형).
- 둥글기: `rounded-pill`(버튼·검색창) `rounded-card`(썸네일·입력창) `rounded-panel`(큰 이미지)
- 곡선: `ease-standard` (CSS) = `EASE` (`lib/motion.ts`)
- 폭: `max-w-wrap` (1120px, `Container`가 처리)
- 폰트: Gmarket Sans 하나 (300/500/700). 라이트 모드만.
- 로고: `public/logo.webp`(헤더), `public/logo.png`(OG 이미지), `app/icon.png`·`app/apple-icon.png`. 배경 투명(apple-icon만 paper — iOS는 투명 부분을 검게 칠함).

### 금지
- `text-[17px]`, `rounded-[10px]`, `text-[#fff]` 같은 임의 글자/색/둥글기 값
- `text-sm`, `text-xl` 등 Tailwind 기본 글자크기, `bg-blue-500`, `bg-white` 등 기본 팔레트, hex 색
- 레이아웃 임의값(`w-[calc(..)]`, `grid-cols-[..]`, `aspect-[..]`, 컴포넌트 고유 padding)은 허용

새 값이 정말 필요하면 컴포넌트에 박지 말고 `globals.css`에 토큰을 추가한 뒤 쓴다.

### 움직임 (Motion)
기조는 **은은하게** — 짧고 작은 움직임, 내용이 주인공. 라이브러리는 Motion(`motion`).
- Motion props는 `lib/motion.ts` 프리셋만 쓴다(`{...reveal(i)}`, `{...pageEnter}`). `initial={{…}}` 같은 인라인 값 금지(`check:design`이 막음).
  새 움직임이 필요하면 `lib/motion.ts`에 프리셋을 추가한다.
- 서버 컴포넌트에서는 `motion/react-client`를 쓴다(그 요소만 클라이언트로 동작). 컴포넌트 전체를 `'use client'`로 바꾸지 않는다.
- 스크롤 등장(`ui/Reveal`)은 카드·섹션에만. **글 본문과 페이지 맨 위 제목에는 쓰지 않는다**(JS 전엔 투명해서 검색·가독성 손해).
- 페이지 전환은 들어오는 효과만(`app/[locale]/template.tsx`). 나가는 효과는 Next 내부 API가 필요해서 하지 않는다.
- 호버·클릭은 CSS 유틸리티(`app/globals.css`)로만. DESIGN.md엔 호버가 없어서 이건 우리 확장이다.
  - `press` — 버튼·탭: 호버 시 살짝 확대, 누르면 살짝 축소 (`Button`은 이미 적용)
  - `link-hover` — 텍스트 링크: Deep Orange(`link-hover`)로 부드럽게
  - `primary-hover` — 채운 버튼 호버 색 (`Button` primary에 이미 적용)
  - `arrow` — 링크 끝 →: `<Arrow />` 컴포넌트 + 부모에 `group`. 호버 시 오른쪽으로 3px
  - `press-card` — 카드: 누를 때만 살짝. 썸네일 확대는 카드 안에서 `group-hover:` (`PostCard`, `ProjectCard`)
  - `hover:…`/`active:…`를 직접 쓰지 않는다(`check:design`이 막음). 동작 줄이기는 유틸리티가 처리한다.
- 동작 줄이기 설정은 `MotionProvider`(Motion)와 `motion-reduce:`(CSS)로 존중한다.

### 컴포넌트
있는 것부터 쓴다. 새로 만들기 전에 `components/ui`, `components`를 확인.
- `ui/Button`, `ui/ButtonLink` — `variant: primary|outline`, `size: lg(44px)|sm(36px)`
- `ui/Container` `ui/Eyebrow` `ui/SectionHeader` `ui/Thumb` `ui/Reveal` `ui/Arrow`
- `Header` `LocaleSwitch` `FeaturedHero` `PostCard(size: md|sm)` `PostGrid(cols: 3|4)` `ProjectCard` `ProjectGrid` `PostBody` `DemoAutoHeight` `ReadingProgress` `MotionProvider`
- 도메인 컴포넌트는 `locale` prop을 받아 링크(`/${locale}/…`)와 문구를 만든다.

variant/size는 객체 맵(`const VARIANT = {...}`)으로 정의한다 (Button, PostCard 참고). 클래스 조합 라이브러리 추가 금지.

### 글 본문
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
- `npm run check` — auth, 텍스트 추출, 본문 변환, 글 등록 검증 self-check
- `npm run build`
- GitHub Actions(`.github/workflows/ci.yml`)가 main 푸시·PR마다 위 세 가지를 Node 24로 다시 돌린다. 실패한 채로 두지 말 것.
  main 푸시는 검사 통과 후 k3s(arm64)용 이미지를 GHCR에 `main-<sha>`로 올린다. 배포 요건(포트·probe·PVC·env)은 README "k3s 배포".
