export const esc = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// "3,5-7" → {3,5,6,7}
export const lineSet = (spec?: string) => {
  const s = new Set<number>();
  for (const part of (spec ?? '').split(',')) {
    const [a, b] = part.trim().split('-').map(Number);
    if (!a) continue;
    for (let n = a; n <= (b || a); n++) s.add(n);
  }
  return s;
};
