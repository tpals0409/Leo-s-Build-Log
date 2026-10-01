# Blog

Next.js(App Router) + PostgreSQL. 디자인: `DESIGN.md`, 목업: `블로그 목업.png`.

## 실행
```bash
cp .env.example .env   # 값 바꾸기
podman machine start   # macOS에서 처음 한 번
podman compose up -d --build
```
로컬 개발: `podman compose up -d db` 후 `.env.local`에 `DATABASE_URL`, `ADMIN_TOKEN` 넣고 `npm run dev`.
관리자: `/admin` (토큰 로그인 → 발행/Featured 토글, 삭제).

## 글 올리기 API (AI용)
모든 쓰기 요청은 `Authorization: Bearer $ADMIN_TOKEN`.

- `POST /api/uploads` — multipart `file`(jpg/png/webp/gif/avif, ≤10MB) → `{ "url": "/uploads/<uuid>.jpg" }`
- `POST /api/posts` — JSON, slug 기준 생성/수정. **한/영 둘 다 필수**
  - 공통: `slug`(영문 소문자·숫자·하이픈, 한/영 공유), `category`(`ai-agent` | `engineering` | `retrospective`)
  - 선택: `project`(`algosu` | `finch` | `janus` | `pinlog`), `tags`(문자열 배열), `thumbnail`(업로드 URL), `featured`, `published`(기본 true)
  - 언어별: `ko`, `en` 각각 `{ title, html, summary? }` — `html`은 스타일 포함 완성 HTML 문서
- `PATCH /api/posts/:slug` — `{ "featured"?, "published"? }`
- `DELETE /api/posts/:slug`
- `GET /api/posts` — 전체 목록(미발행 포함)

```bash
curl -X POST localhost:3000/api/posts -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'content-type: application/json' \
  -d '{"slug":"hello","category":"ai-agent","project":"algosu","tags":["agent"],
       "ko":{"title":"첫 글","summary":"요약","html":"<!doctype html><html><body><h1>안녕</h1></body></html>"},
       "en":{"title":"First post","summary":"Summary","html":"<!doctype html><html><body><h1>Hello</h1></body></html>"}}'
```

글 HTML은 상세 페이지에서 서버가 Shadow DOM으로 렌더한다(SEO용으로 본문이 HTML에 포함, 글 CSS는 격리). `<script>`와 이벤트 속성은 제거된다.
주소: `/ko/...`, `/en/...` (`/`는 `/ko`로). 홈: 대표 글(featured) 1 / 최신 글 3 / 프로젝트 4.
DB 구조(`db/schema.sql`)를 바꾸면 테이블을 지우고 다시 만든다 — 마이그레이션 도구 없음.
