#!/usr/bin/env bash
# Gmarket Sans TTF(각 2.4MB) → 글자를 줄인 WOFF2 (public/fonts/GmarketSans*.woff2, 각 200~300KB).
# 남기는 글자: KS X 1001 한글 2,350자 + 영문·숫자·기호 + 지금 블로그(글·화면 문구)에 쓰인 모든 글자.
# 새 글에 2,350자 밖의 글자가 생기면 다시 돌린다. 필요: pip install fonttools brotli (pyftsubset)
set -euo pipefail
cd "$(dirname "$0")/.."
chars=$(mktemp)
python3 - "$chars" <<'PY'
import glob, os, sys
chars = set()
for cp in range(0xAC00, 0xD7A4):  # euc_kr에서 2바이트 = KS X 1001 완성형 2,350자 (8바이트는 조합형 확장)
    try:
        if len(chr(cp).encode('euc_kr')) == 2: chars.add(chr(cp))
    except UnicodeEncodeError: pass
for a, b in [(0x20, 0x7E), (0xA0, 0xFF), (0x2010, 0x206F), (0x2190, 0x22FF), (0x2460, 0x24FF),
             (0x25A0, 0x25FF), (0x3000, 0x303F), (0x3130, 0x318F), (0xFF01, 0xFF5E)]:
    chars.update(map(chr, range(a, b + 1)))
files = glob.glob('content/posts/*/*') + glob.glob('lib/**/*', recursive=True) \
      + glob.glob('components/**/*', recursive=True) + glob.glob('app/**/*', recursive=True)
for f in files:
    if os.path.isfile(f) and f.endswith(('.html', '.json', '.ts', '.tsx')):
        chars.update(c for c in open(f, encoding='utf-8').read() if ord(c) >= 0x20)
open(sys.argv[1], 'w', encoding='utf-8').write(''.join(sorted(chars)))
PY
for w in Light Medium Bold; do
  pyftsubset "public/fonts/GmarketSansTTF$w.ttf" --text-file="$chars" --flavor=woff2 \
    --layout-features='*' --output-file="public/fonts/GmarketSans$w.woff2"
done
rm "$chars"
ls -l public/fonts/*.woff2
