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
[ $fail = 0 ] && echo 'design check ok'
exit $fail
