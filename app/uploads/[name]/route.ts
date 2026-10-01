import { readUpload } from '@/lib/uploads';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Context = { params: Promise<{ name: string }> };

export async function GET(_req: Request, { params }: Context) {
  try {
    const { name } = await params;
    const file = await readUpload(name);
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
