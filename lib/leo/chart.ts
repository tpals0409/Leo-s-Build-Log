// <leo-chart> → 정적 SVG (서버 렌더, JS 없이 보임). 호버 툴팁은 PostEnhancer가 data-* 속성을 읽어 붙인다.
import type { Locale } from '../i18n.ts';
import { esc } from './util.ts';

export const CHART_TYPES = ['bar', 'hbar', 'line', 'donut'] as const;
type Data = { labels: string[]; series: { name: string; values: number[] }[] };

export function parseChart(text: string, type: string): { data?: Data; errors: string[] } {
  let d: Data;
  try {
    d = JSON.parse(text);
  } catch {
    return { errors: ['데이터 JSON을 읽을 수 없음 — {"labels":[…],"series":[{"name":"…","values":[…]}]}'] };
  }
  const errors: string[] = [];
  if (!Array.isArray(d?.labels) || !d.labels.length || !d.labels.every((l) => typeof l === 'string')) errors.push('labels: 문자열 배열(1개 이상)');
  if (!Array.isArray(d?.series) || !d.series.length) errors.push('series: 1개 이상');
  else
    d.series.forEach((s, i) => {
      if (typeof s?.name !== 'string') errors.push(`series[${i}].name: 문자열`);
      if (!Array.isArray(s?.values) || s.values.length !== d.labels?.length) errors.push(`series[${i}].values: labels와 같은 개수의 숫자`);
      else if (!s.values.every((v) => typeof v === 'number' && Number.isFinite(v) && v >= 0)) errors.push(`series[${i}].values: 0 이상의 숫자만`);
    });
  if (type === 'donut' && d.series?.length > 1) errors.push('donut: series는 1개만');
  if (type === 'line' && d.labels?.length < 2) errors.push('line: labels 2개 이상');
  return errors.length ? { errors } : { data: d, errors };
}

const W = 640;
// SVG 글자 폭 대략 추정 (한글·전각 ≈ 13px, 그 외 ≈ 7px @13px) → 칸을 넘으면 … 로 자른다 (전체 이름은 툴팁·표에)
const fit = (label: string, max: number) => {
  let w = 0, out = '';
  for (const ch of label) {
    w += /[\u1100-\u11ff\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]/.test(ch) ? 13 : 7;
    if (w > max - 8) return out.trimEnd() + '…';
    out += ch;
  }
  return label;
};
const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const e = 10 ** Math.floor(Math.log10(v));
  const f = v / e;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e;
};

export function renderChart(text: string, attrs: { type: string; title?: string; unit?: string }, locale: Locale): string {
  const { data } = parseChart(text, attrs.type);
  if (!data) return `<p class="leo-error">leo-chart: 데이터 오류</p>`;
  const nf = new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { maximumFractionDigits: 2 });
  const unit = attrs.unit ?? '';
  const fmt = (v: number) => `${nf.format(v)}${unit}`;
  const multi = data.series.length > 1;
  const mark = (label: string, s: number, v: number) =>
    `data-label="${esc(label)}"${multi ? ` data-series="${esc(data.series[s].name)}"` : ''} data-value="${esc(fmt(v))}"`;
  const max = niceMax(Math.max(...data.series.flatMap((s) => s.values)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  let svg = '';
  let H = 300;

  if (attrs.type === 'bar' || attrs.type === 'line') {
    const m = { t: 16, r: 16, b: 40, l: 56 };
    const pw = W - m.l - m.r, ph = H - m.t - m.b;
    const y = (v: number) => m.t + ph - (v / max) * ph;
    svg += ticks.map((t) => `<line class="leo-grid" x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}"/><text class="leo-axis" x="${m.l - 8}" y="${y(t) + 4}" text-anchor="end">${esc(nf.format(t))}</text>`).join('');
    const n = data.labels.length;
    if (attrs.type === 'bar') {
      const gw = pw / n, bw = (gw * 0.68) / data.series.length;
      data.labels.forEach((label, i) => {
        const gx = m.l + i * gw + gw * 0.16;
        data.series.forEach((s, j) => {
          const v = s.values[i], x = gx + j * bw;
          svg += `<rect class="leo-mark leo-s${j}" x="${x}" y="${y(v)}" width="${bw - 2}" height="${m.t + ph - y(v)}" ${mark(label, j, v)}/>`;
          if (!multi) svg += `<text class="leo-value" x="${x + (bw - 2) / 2}" y="${y(v) - 6}" text-anchor="middle">${esc(fmt(v))}</text>`;
        });
        svg += `<text class="leo-axis" x="${m.l + i * gw + gw / 2}" y="${H - m.b + 20}" text-anchor="middle">${esc(fit(label, gw))}</text>`;
      });
    } else {
      const x = (i: number) => m.l + (i / (n - 1)) * pw;
      data.labels.forEach((label, i) => (svg += `<text class="leo-axis" x="${x(i)}" y="${H - m.b + 20}" text-anchor="middle">${esc(fit(label, pw / (n - 1)))}</text>`));
      data.series.forEach((s, j) => {
        svg += `<polyline class="leo-line leo-s${j}" points="${s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}"/>`;
        svg += s.values.map((v, i) => `<circle class="leo-mark leo-dot leo-s${j}" cx="${x(i)}" cy="${y(v)}" r="4.5" ${mark(data.labels[i], j, v)}/>`).join('');
      });
    }
  } else if (attrs.type === 'hbar') {
    const rowH = 14 + data.series.length * 18, m = { t: 8, r: 72, b: 8, l: 140 };
    H = m.t + m.b + data.labels.length * rowH;
    const pw = W - m.l - m.r;
    const x = (v: number) => (v / max) * pw;
    data.labels.forEach((label, i) => {
      const top = m.t + i * rowH + 7;
      svg += `<text class="leo-axis leo-axis--label" x="${m.l - 10}" y="${top + (data.series.length * 18) / 2 + 4}" text-anchor="end">${esc(fit(label, m.l - 10))}</text>`;
      data.series.forEach((s, j) => {
        const v = s.values[i], by = top + j * 18;
        svg += `<rect class="leo-mark leo-s${j}" x="${m.l}" y="${by}" width="${Math.max(x(v), 1)}" height="14" ${mark(label, j, v)}/>`;
        svg += `<text class="leo-value" x="${m.l + x(v) + 6}" y="${by + 11}">${esc(fmt(v))}</text>`;
      });
    });
  } else {
    // donut
    const vals = data.series[0].values, total = vals.reduce((a, b) => a + b, 0) || 1;
    const cx = 150, cy = 150, R = 120, r = 72;
    H = 300;
    let a0 = -Math.PI / 2;
    const pt = (rad: number, a: number) => `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
    vals.forEach((v, i) => {
      const a1 = a0 + (v / total) * Math.PI * 2 - (vals.length > 1 ? 0.012 : 0);
      const big = a1 - a0 > Math.PI ? 1 : 0;
      const d = v / total >= 0.9999
        ? `M${pt(R, 0)}A${R},${R} 0 1 1 ${pt(R, Math.PI)}A${R},${R} 0 1 1 ${pt(R, 0)}M${pt(r, 0)}A${r},${r} 0 1 0 ${pt(r, Math.PI)}A${r},${r} 0 1 0 ${pt(r, 0)}Z`
        : `M${pt(R, a0)}A${R},${R} 0 ${big} 1 ${pt(R, a1)}L${pt(r, a1)}A${r},${r} 0 ${big} 0 ${pt(r, a0)}Z`;
      svg += `<path class="leo-mark leo-s${i % 6}" fill-rule="evenodd" d="${d}" ${mark(data.labels[i], 0, v)}/>`;
      a0 = a0 + (v / total) * Math.PI * 2;
    });
    svg += `<text class="leo-donut-total" x="${cx}" y="${cy + 8}" text-anchor="middle">${esc(fmt(total))}</text>`;
    data.labels.forEach((label, i) => {
      const ly = 70 + i * 30;
      svg += `<rect class="leo-s${i % 6}" x="320" y="${ly - 11}" width="14" height="14"/><text class="leo-axis leo-axis--label" x="344" y="${ly}">${esc(fit(label, 150))}</text><text class="leo-value" x="${W - 16}" y="${ly}" text-anchor="end">${esc(fmt(vals[i]))} · ${nf.format(Math.round((vals[i] / total) * 1000) / 10)}%</text>`;
    });
  }

  const title = attrs.title ? `<p class="leo-figure__title">${esc(attrs.title)}</p>` : '';
  const legend = multi && attrs.type !== 'donut'
    ? `<ul class="leo-legend">${data.series.map((s, j) => `<li><span class="leo-swatch leo-s${j}"></span>${esc(s.name)}</li>`).join('')}</ul>`
    : '';
  // 검색엔진·스크린리더용 표 (화면엔 안 보임)
  const table = `<table class="leo-sr-only"><thead><tr><th></th>${data.series.map((s) => `<th>${esc(s.name)}</th>`).join('')}</tr></thead><tbody>${data.labels
    .map((l, i) => `<tr><th>${esc(l)}</th>${data.series.map((s) => `<td>${esc(fmt(s.values[i]))}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;
  return `<figure class="leo-chart leo-chart--${attrs.type}" data-chart>${title}<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(attrs.title ?? 'chart')}">${svg}</svg>${legend}${table}</figure>`;
}
