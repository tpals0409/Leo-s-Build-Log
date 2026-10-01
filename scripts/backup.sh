#!/bin/sh
# DB + 업로드 이미지 백업. 서버에서 cron으로 매일 돌린다 (README 참고).
#   BACKUP_DIR (기본 ./backups), KEEP_DAYS (기본 14)
# 복원은 README의 "백업과 복원".
set -eu
cd "$(dirname "$0")/.."
RT=$(command -v podman >/dev/null 2>&1 && echo podman || echo docker)
DIR=${BACKUP_DIR:-backups}
KEEP=${KEEP_DAYS:-14}
TS=$(date +%Y%m%d-%H%M%S)
mkdir -p "$DIR"

# --clean --if-exists: 기존 DB 위에 그대로 복원할 수 있게
$RT compose exec -T db pg_dump -U blog --clean --if-exists blog | gzip > "$DIR/db-$TS.sql.gz"
$RT compose exec -T app tar -C /app -czf - uploads > "$DIR/uploads-$TS.tar.gz"

# 빈 파일이면 실패로 본다 (pipe 앞쪽 실패는 set -e로 안 잡힘)
for f in "$DIR/db-$TS.sql.gz" "$DIR/uploads-$TS.tar.gz"; do
  [ "$(gzip -cd "$f" | head -c 1 | wc -c)" -eq 1 ] || { echo "backup failed: $f is empty" >&2; exit 1; }
done

find "$DIR" -name 'db-*.sql.gz' -mtime +"$KEEP" -delete
find "$DIR" -name 'uploads-*.tar.gz' -mtime +"$KEEP" -delete
echo "backup ok: $DIR/db-$TS.sql.gz, $DIR/uploads-$TS.tar.gz"
