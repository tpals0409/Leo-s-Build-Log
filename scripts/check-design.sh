#!/bin/sh
# 디자인 토큰 규칙 검사 (CLAUDE.md 참고). 위반이 있으면 출력하고 exit 1.
# 레이아웃용 임의값(w-[calc..], grid-cols-[..], aspect-[..], px-[..])은 허용.
cd "$(dirname "$0")/.." || exit 1
P='slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black'
fail=0
check() { # 메시지 정규식
  out=$(grep -rnE "$2" app components --include='*.tsx')
  [ -n "$out" ] && { echo "✗ $1"; echo "$out" | sed 's/^/  /'; fail=1; }
}
check '임의 글자/색/둥글기 값 → t-*, 색·radius 토큰' '(text|leading|tracking|font|bg|border|rounded|ring|fill|stroke|outline)-\['
check 'Tailwind 기본 팔레트 → 색 토큰' "(bg|text|border|ring|fill|stroke|outline|from|via|to|divide|placeholder)-($P)([^a-z]|$)"
check 'Tailwind 기본 글자크기 → t-*' 'text-(xs|sm|base|lg|[0-9]?xl)([^a-z-]|$)'
check 'hex 색상 → 색 토큰' '#[0-9a-fA-F]{3,8}([^0-9a-zA-Z]|$)'
check 'hover:/active: 금지 — DESIGN.md는 호버를 정하지 않음 (예외: 팔레트가 정한 버튼 호버 primary-hover)' '(^|["{ `])(hover|active):[a-z0-9[(-]'
# 문자열로 쓰는 CSS(글 컴포넌트 lib/leo/style.ts, 견본 페이지 등)도 토큰 var()만 — Tailwind 클래스를 못 쓰는 곳
css() { # 메시지 정규식 (app, components, lib의 .ts/.tsx — OG 이미지 렌더러는 CSS 변수를 못 읽어서 제외)
  out=$(grep -rnE "$2" app components lib --include='*.ts' --include='*.tsx' | grep -v '^lib/og.tsx:')
  [ -n "$out" ] && { echo "✗ $1"; echo "$out" | sed 's/^/  /'; fail=1; }
}
css 'CSS 글자 크기·행간·굵기·자간 숫자 → var(--fs-*)/var(--lh-*)/var(--fw-*)/var(--ls-*)' '(font-size|line-height|font-weight|letter-spacing):-?[0-9.]'
css 'CSS 모서리 숫자 → var(--radius-pill|card|panel) (원형은 50%)' 'border-radius:[0-9.]+(px|em|rem)'
css '움직임 금지 — DESIGN.md에 움직임 토큰 없음' '(transition|animation):'
css 'CSS 그림자 → 쓰지 않음 (평면 디자인)' 'box-shadow:'
out=$(grep -nE '#[0-9a-fA-F]{3,8}([^0-9a-zA-Z]|$)' lib/leo/style.ts); [ -n "$out" ] && { echo '✗ hex 색상 → var(--color-*) (lib/leo/style.ts)'; echo "$out" | sed 's/^/  /'; fail=1; }
check '굵기 클래스 금지 → 타이포 역할 t-*가 굵기까지 정함' '(^|["{ `])font-(thin|light|normal|medium|semibold|bold|black)([^a-z-]|$)'
check '움직임 클래스 금지 — DESIGN.md에 움직임 토큰 없음' '(^|["{ `])(transition|animate|duration|ease)-[a-z0-9[]'
[ $fail = 0 ] && echo 'design check ok'
exit $fail
