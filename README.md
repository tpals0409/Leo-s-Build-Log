# Blog

Next.js(App Router) + PostgreSQL. 디자인: `DESIGN.md`, 목업: `블로그 목업.png`.

## 실행
```bash
cp .env.example .env   # 값 바꾸기
podman machine start   # macOS에서 처음 한 번
podman compose up -d --build
```
로컬 개발: `podman compose up -d db` 후 `.env.local`에 `DATABASE_URL`, `ADMIN_TOKEN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAIL` 넣고 `npm run dev`.
관리자: `/admin` (Google 로그인, `ADMIN_EMAIL` 계정만 → 발행/Featured 토글, 삭제). 세션은 30일, `ADMIN_TOKEN`을 바꾸면 모든 세션이 끊긴다.

Google OAuth 설정: Google Cloud Console → API 및 서비스 → 사용자 인증 정보 → OAuth 클라이언트 ID(웹 애플리케이션). 승인된 리디렉션 URI에 `<SITE_URL>/api/auth/google/callback`을 환경마다 등록 (예: `https://www.leosbuildlog.com/api/auth/google/callback`, `http://localhost:3000/api/auth/google/callback`).

## 글 올리기 API (AI용)
모든 쓰기 요청은 `Authorization: Bearer $ADMIN_TOKEN`.

- `POST /api/uploads` — multipart `file`(jpg/png/webp/gif/avif, ≤10MB) → `{ "url": "/uploads/<uuid>.jpg" }`
- `POST /api/posts` — JSON, slug 기준 생성/수정. **한/영 둘 다 필수**
  - 공통: `slug`(영문 소문자·숫자·하이픈, 한/영 공유), `category`(`ai-agent` | `engineering` | `retrospective`)
  - 선택: `project`(`algosu` | `finch` | `janus` | `pinlog`), `tags`(문자열 배열), `thumbnail`(업로드 URL), `featured`, `published`(기본 true)
  - 선택: `publishedAt` — 발행일(화면 표시·정렬 기준). 다른 곳에서 쓴 예전 글을 옮길 때 원래 날짜로
    - ISO 8601: `2023-07-15`(서울 자정) 또는 `2023-07-15T09:00:00+09:00`(시각을 쓰면 시간대 필수)
    - 생략하면 새 글은 지금 시각, 기존 글은 원래 날짜 유지. 기존 글에 주면 날짜 정정
    - 없는 날짜(2월 30일)·미래 날짜는 400 (예약 발행 없음). 날짜는 서울 시간으로 표시된다
  - 언어별: `ko`, `en` 각각 `{ title, html, summary? }` — `html`은 스타일 포함 완성 HTML 문서
  - 다이어그램·차트 등은 `<leo-*>` 태그로 — **[docs/post-components.md](docs/post-components.md)**, 견본 `/ko/design`. 잘못 쓰면 400과 이유
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

글 HTML은 상세 페이지에서 서버가 Shadow DOM으로 렌더한다(SEO용으로 본문이 HTML에 포함, 글 CSS는 격리).
움직이는 부분은 `<template data-demo data-height="400" data-title="…">완성 HTML</template>`로 감싸면 격리된 iframe에서 스크립트·CDN 라이브러리와 함께 실행된다.
그 밖의 `<script>`와 이벤트 속성은 제거된다.
주소: `/ko/...`, `/en/...` (`/`는 `/ko`로). 홈: 대표 글(featured) 1 / 최신 글 3 / 프로젝트 4.
DB 구조(`db/schema.sql`)를 바꾸면 테이블을 지우고 다시 만든다 — 마이그레이션 도구 없음.

## 백업과 복원
`scripts/backup.sh` — DB(`pg_dump`)와 업로드 이미지를 `backups/`에 날짜별로 저장하고 14일 지난 것은 지운다(`BACKUP_DIR`, `KEEP_DAYS`로 변경).
서버에서 매일 새벽 4시에 돌리려면 `crontab -e`에:
```
0 4 * * * cd /path/to/blog && sh scripts/backup.sh >> backups/backup.log 2>&1
```
`backups/`를 서버 밖(다른 디스크·클라우드)으로도 복사해 둘 것 — 같은 디스크에만 있으면 디스크가 망가질 때 같이 사라진다.

복원 (컨테이너가 떠 있는 상태에서):
```bash
gzip -cd backups/db-YYYYMMDD-HHMMSS.sql.gz | podman compose exec -T db psql -U blog -d blog
podman compose exec -T app sh -c 'rm -rf /app/uploads/* && tar -C /app -xzf -' < backups/uploads-YYYYMMDD-HHMMSS.tar.gz
```

## 운영 체크
- `SITE_URL`을 실제 도메인(https)으로 — canonical, hreflang, 링크 미리보기, sitemap, robots가 모두 이 값을 쓴다(재빌드 불필요, 재시작만).
- HTTPS 프록시는 `x-forwarded-proto`를 넘겨야 관리자 쿠키에 `Secure`가 붙는다.
- `/sitemap.xml`, `/robots.txt`는 자동 생성된다. 관리자·API·검색 페이지는 검색엔진에서 제외.

## k3s 배포 (이미지)
main에 푸시되면 CI가 검사를 통과한 뒤 `ghcr.io/tpals0409/leo-s-build-log:main-<git sha>` (linux/arm64)를 올린다. `latest` 태그는 없다.
매니페스트(aether-gitops 등)가 맞춰야 할 것:
- **포트** 3000, **probe** `GET /api/health` (DB를 안 봐서 DB 장애로 재시작되지 않음)
- **env**: `DATABASE_URL`, `ADMIN_TOKEN`, `SITE_URL`(https 도메인), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAIL`. `ADMIN_TOKEN`·`GOOGLE_CLIENT_SECRET`·DB 비밀번호는 SealedSecret 등으로
- **업로드**: `/app/uploads`에 PVC. 컨테이너는 `node`(uid 1000)로 돌므로 `securityContext.fsGroup: 1000`
  — ReadWriteOnce PVC면 **replicas 1** (여러 개 띄우려면 RWX 또는 오브젝트 스토리지로 바꿔야 함)
- **Postgres**: 별도로. 추후 챗봇(pgvector)을 생각하면 `pgvector/pgvector` 이미지. 스키마는 앱이 첫 쿼리 때 만든다
- **Ingress**: TLS는 Ingress(Traefik)에서. `X-Forwarded-Proto`가 넘어와야 관리자 쿠키에 `Secure`가 붙는다 (Traefik 기본값으로 넘김)
- **백업**: `scripts/backup.sh`는 compose 전용이다. k3s에선 `pg_dump` CronJob + 업로드 PVC 백업을 따로 둔다
- private 패키지면 `imagePullSecrets` (예: `ghcr-pull-secret`)

