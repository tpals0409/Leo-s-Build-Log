import { DIAGRAMS, type Diagram, type DiagramKey, type DiagramNode } from '@/lib/diagrams';
import type { Locale } from '@/lib/i18n';

// 아키텍처·사용자 시나리오 그림. 데이터(lib/diagrams.ts)의 좌표를 그대로 SVG 하나에 그린다 → 화면 폭에 맞춰 통째로 줄어든다.
// 노드 글자는 foreignObject 안의 실제 텍스트(검색·번역 가능), 크기는 글자 역할(t-*)을 좌표계 px로 쓴다.
// 강조 노드(key)만 프로젝트 색(배너와 같은 값: deep 테두리 + tint를 옅게 깐 바탕) — 한 그림에 강조색은 하나. 좁은 화면은 그림 칸 안에서 가로로 민다.
const NODE: Record<Exclude<DiagramNode['kind'], 'dec'>, string> = {
  user: 'rounded-card border border-line bg-surface',
  sys: 'rounded-card bg-fog',
  key: 'rounded-card border',
  db: 'rounded-pill bg-fog',
  ext: 'rounded-card border border-dashed border-line bg-surface text-muted',
  term: 'rounded-pill bg-fg text-surface',
};
const LINE = 'var(--color-muted)';

type Accent = { tint: string; deep: string };

export default function FlowDiagram({ name, locale, title, accent }: { name: DiagramKey; locale: Locale; title: string; accent: Accent }) {
  const d: Diagram = DIAGRAMS[name];
  const arrow = `arrow-${name}`;
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${d.w} ${d.h}`} className="block w-full min-w-[880px] overflow-visible">
        <title>{title}</title>
        <defs>
          <marker id={arrow} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={LINE} />
          </marker>
        </defs>
        {d.lanes.map((l) => (
          <g key={l.y}>
            <text x={0} y={l.y + 12} className="t-caption" fill={LINE}>{l.label[locale]}</text>
            <line x1={0} x2={d.w} y1={l.y + 20} y2={l.y + 20} stroke="var(--color-line)" strokeDasharray="6 6" />
          </g>
        ))}
        {d.edges.map((e) => (
          <path key={e.d} d={e.d} fill="none" stroke={LINE} strokeOpacity={0.6} strokeWidth={1.5} strokeDasharray={e.dashed ? '6 5' : undefined} markerEnd={`url(#${arrow})`} />
        ))}
        {d.labels.map((l) => (
          // 선 위 라벨: 바탕색 테두리(halo)로 선을 가린다 — 글자 폭을 몰라도 된다
          <text key={`${l.x},${l.y}`} x={l.x} y={l.y} textAnchor="middle" className="t-caption" fill={LINE} stroke="var(--color-surface)" strokeWidth={6} paintOrder="stroke">
            {l.text[locale]}
          </text>
        ))}
        {d.nodes.map((n) => <Node key={`${n.x},${n.y}`} n={n} locale={locale} accent={accent} />)}
      </svg>
    </div>
  );
}

function Node({ n, locale, accent }: { n: DiagramNode; locale: Locale; accent: Accent }) {
  if (n.kind === 'dec') {
    // 판단: 마름모 (원본은 정사각형을 45° 돌린 것 → 중심에서 꼭짓점까지 한 변 ÷ √2)
    const cx = n.x + n.w / 2, cy = n.y + n.h / 2, r = n.w / Math.SQRT2;
    return (
      <g>
        <polygon points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`} fill="var(--color-surface)" stroke={LINE} strokeWidth={1.5} strokeLinejoin="round" />
        <foreignObject x={n.x} y={n.y} width={n.w} height={n.h}>
          <div className="flex size-full items-center justify-center text-center t-body-sm text-muted [word-break:keep-all]">{n.title[locale]}</div>
        </foreignObject>
      </g>
    );
  }
  return (
    <foreignObject x={n.x} y={n.y} width={n.w} height={n.h}>
      <div className={`flex size-full flex-col items-center justify-center px-3 text-center [word-break:keep-all] ${NODE[n.kind]}`}
        style={n.kind === 'key' ? { borderColor: accent.deep, background: `color-mix(in srgb, ${accent.tint} 35%, var(--color-surface))` } : undefined}>
        <span className="t-body">{n.title[locale]}</span>
        {n.sub && <span className={`t-caption ${n.kind === 'term' ? '' : 'text-muted'}`}>{n.sub[locale]}</span>}
      </div>
    </foreignObject>
  );
}
