export const fmtDate = (d: Date) => new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' }).format(d);
