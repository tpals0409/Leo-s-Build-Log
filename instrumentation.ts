// 서버가 뜰 때 한 번: 첫 방문자 대신 서버가 스스로 데운다(배포 직후 첫 요청이 수십 초 걸리던 문제).
// DB 스키마 준비·페이지 모듈 로딩(주요 페이지를 자기 자신에게 요청) + 코드 강조기(Shiki) 생성.
// 끝나기 전엔 /api/health가 503 → k3s가 데워지지 않은 컨테이너로 요청을 보내지 않는다.
// 실패해도 최대 60초 뒤엔 준비 완료로 친다(DB 장애로 앱이 영영 안 뜨거나 재시작되는 것을 막기 위해).
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const g = globalThis as { leoWarm?: boolean };
  if (process.env.NODE_ENV !== 'production') { g.leoWarm = true; return; }

  const base = `http://127.0.0.1:${process.env.PORT ?? 3000}`;
  const until = Date.now() + 60_000;
  const get = async (path: string) => {
    while (Date.now() < until) {
      try { if ((await fetch(base + path)).ok) return; } catch { /* 아직 안 떴음 */ }
      await new Promise((r) => setTimeout(r, 500));
    }
  };
  const shiki = import('./lib/leo/code').then(({ renderCode }) =>
    Promise.all(['ts', 'bash', 'yaml', 'json'].map((lang) => renderCode('x', { lang })))).catch(() => {});

  // register()가 끝나야 서버가 요청을 받으므로 기다리지 않고 뒤에서 돈다
  void (async () => {
    await get('/ko'); // 첫 요청이 DB 스키마를 만든다 — 나머지는 그 뒤에
    await Promise.all([get('/en'), get('/ko/posts'), get('/ko/about'), get('/sitemap.xml'), shiki]);
    g.leoWarm = true;
  })().catch(() => { g.leoWarm = true; });
  setTimeout(() => { g.leoWarm = true; }, 60_000).unref();
}
