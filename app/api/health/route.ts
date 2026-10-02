// k8s probe용. DB를 직접 보지 않는다 — DB 장애로 앱이 재시작되는 연쇄를 막기 위해.
// 서버가 막 떴을 땐 데우기(instrumentation.ts)가 끝날 때까지 503 (최대 60초) → 데워지지 않은 컨테이너로 트래픽이 가지 않게.
export const dynamic = 'force-dynamic';

export function GET() {
  const warm = (globalThis as { leoWarm?: boolean }).leoWarm === true;
  return Response.json({ ok: warm, warming: !warm }, { status: warm ? 200 : 503 });
}
