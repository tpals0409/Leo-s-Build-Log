// k8s liveness/readiness probe용. DB를 건드리지 않는다 — DB 장애로 앱이 재시작되는 연쇄를 막기 위해.
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ ok: true });
}
