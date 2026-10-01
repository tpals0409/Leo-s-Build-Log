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
- `POST /api/posts` — JSON, slug 기준 생성/수정
  - 필수: `slug`(a-z 0-9 한글 -), `title`, `category`, `html`(스타일 포함 완성 HTML 문서)
  - 선택: `summary`, `thumbnail`(업로드 URL), `featured`, `published`(기본 true)
- `PATCH /api/posts/:slug` — `{ "featured"?, "published"? }`
- `DELETE /api/posts/:slug`
- `GET /api/posts` — 전체 목록(미발행 포함)

```bash
curl -X POST localhost:3000/api/posts -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'content-type: application/json' \
  -d '{"slug":"hello","title":"첫 글","category":"Product","summary":"요약","html":"<!doctype html><html><body><h1>안녕</h1></body></html>"}'
```

글 HTML은 상세 페이지에서 서버가 Shadow DOM으로 렌더한다(SEO용으로 본문이 HTML에 포함, 글 CSS는 격리). `<script>`와 이벤트 속성은 제거된다.
홈: Featured 최신 1개 / 최신 3개 / 다음 4개 자동 배치.
