# 글 원본

글 하나 = 폴더 하나. 폴더 이름이 slug(영문 소문자·숫자·하이픈, 한/영 공유).

```
content/posts/<slug>/
  post.json   메타
  ko.html     한국어 본문 (완성 HTML 문서)
  en.html     영어 본문 — 둘 다 있어야 발행
```

`post.json`:
```json
{
  "category": "ai-agent",
  "project": "algosu",
  "tags": ["agent"],
  "publishedAt": "2026-10-01",
  "featured": false,
  "published": true,
  "ko": { "title": "제목", "summary": "요약" },
  "en": { "title": "Title", "summary": "Summary" }
}
```
- 필수: `category`(`ai-agent` | `engineering` | `retrospective`), `publishedAt`, `ko.title`, `en.title`
- 선택: `project`(`algosu` | `finch` | `janus` | `pinlog`), `tags`, `thumbnail`(글 폴더의 이미지 파일 이름, 예: `"thumbnail.png"` — 반영 때 업로드됨), `featured`(홈 대표 글, 최신 1편), `published`(기본 true), `summary`
- `publishedAt`: `2023-07-15`(서울 자정) 또는 `2023-07-15T09:00:00+09:00`. 미래 날짜 불가. 같은 날 글이 여러 편이면 시각을 달리 줘서 순서를 고정한다(같으면 목록 순서가 매번 달라질 수 있음)
- 본문 폭·여백은 블로그와 같게: 글 CSS `body{max-width:var(--container-wrap);box-sizing:border-box;margin:0 auto;padding:0 24px 80px}` (임의 폭 금지)
- 본문 작성 규칙: [docs/post-components.md](../docs/post-components.md) — 시각화는 `<leo-*>` 태그

반영: PR에서 `npm run check`가 모든 글을 검사하고, main에 머지되면 `.github/workflows/content.yml`이 운영 블로그에 반영한다.
폴더를 지우면 블로그에서도 지워진다. 발행 취소는 지우지 말고 `"published": false`.
로컬 확인: `BLOG_URL=http://localhost:3001 ADMIN_TOKEN=… node --experimental-strip-types scripts/sync-posts.ts`
