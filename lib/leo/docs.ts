// docs/post-components.md 생성기. 손으로 고치지 말고 `npm run docs:post` — 등록부와 어긋나면 `npm run check`가 실패한다.
import { CODE_DOC, SPECS } from './specs.ts';

export function postComponentsMarkdown() {
  const out: string[] = [
    '# 글 컴포넌트 (`<leo-*>`)',
    '',
    '> 이 파일은 `lib/leo/specs.ts`에서 생성된다 (`npm run docs:post`). 직접 고치지 말 것.',
    '> 견본: `/ko/design` — 실제 글과 같은 렌더 경로.',
    '',
    '## 규칙',
    '- 글은 완성 HTML 문서. 다이어그램·시각화는 아래 태그로 쓰면 서버가 블로그 디자인으로 그린다.',
    '- 태그는 항상 닫는다 (`<leo-metric …></leo-metric>`). 속성값은 따옴표.',
    '- 글 등록(`POST /api/posts`) 때 검사한다. 없는 태그·빠진 속성·잘못된 위치·잘못된 데이터는 이유와 함께 거절된다.',
    '- Mermaid는 글 쓰는 쪽에서 SVG로 바꿔 `<leo-diagram>` 안에 넣는다:',
    '  `npx -p @mermaid-js/mermaid-cli mmdc -i a.mmd -o a.svg -c mermaid.config.json -b transparent`',
    '  (블로그 팔레트가 입혀진다. 가로로 긴 흐름은 `flowchart TD`가 작은 화면에서 읽기 좋다)',
    '- 직접 만든 인터랙티브 예제는 `<template data-demo>` (격리 iframe). 외부 영상 등은 `https://` iframe.',
    '- 글 안 `<script>`, `on*=` 속성, `javascript:` 링크, `srcdoc`은 제거된다.',
    '',
  ];
  for (const group of [...new Set(SPECS.map((s) => s.group))]) {
    out.push(`## ${group}`, '');
    if (group === '코드') out.push(`### \`${CODE_DOC.tag}\``, '', CODE_DOC.desc, '', '```html', CODE_DOC.example, '```', '');
    for (const s of SPECS.filter((x) => x.group === group)) {
      out.push(`### \`<${s.tag}>\``, '', s.desc);
      const notes = [
        s.parent && `\`<${s.parent}>\` 바로 안에서만`,
        s.needs && `안에 \`<${s.needs}>\` 하나 이상 필요`,
        s.children === 'text' && '안쪽은 글자 그대로(HTML 아님)',
        s.children === 'none' && '안쪽은 비움',
      ].filter(Boolean);
      if (notes.length) out.push('', notes.join(' · '));
      const attrs = Object.entries(s.attrs ?? {});
      if (attrs.length) {
        out.push('', '| 속성 | 필수 | 값 | 설명 |', '|---|---|---|---|');
        for (const [k, a] of attrs) out.push(`| \`${k}\` | ${a.required ? '✓' : ''} | ${a.values?.map((v) => `\`${v}\``).join(' ') ?? ''} | ${a.desc} |`);
      }
      if (s.example) out.push('', '```html', s.example, '```');
      out.push('');
    }
  }
  return out.join('\n');
}
