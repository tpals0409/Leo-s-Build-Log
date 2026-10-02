import { readUpload, readUploadResized } from '@/lib/uploads';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Context = { params: Promise<{ name: string }> };

// ?w=480|800|1200 이면 폭을 줄인 webp 사본 (ui/Thumb의 srcset). 주소가 .webp 등 확장자로 끝나서 Cloudflare가 쿼리까지 묶어 캐시한다.
export async function GET(req: Request, { params }: Context) {
  try {
    const { name } = await params;
    const w = new URL(req.url).searchParams.get('w');
    // 줄이기에 실패하면(정해지지 않은 폭, 이미지 라이브러리 문제) 원본을 준다 — 썸네일이 깨지는 것보다 크더라도 보이는 게 낫다
    const file = w ? await readUploadResized(name, Number(w)).catch(() => readUpload(name)) : await readUpload(name);
    return new Response(new Uint8Array(file.data), {
      headers: {
        'content-type': file.type,
        'cache-control': 'public, max-age=31536000, immutable',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch {
    return new Response('not found', { status: 404 });
  }
}
