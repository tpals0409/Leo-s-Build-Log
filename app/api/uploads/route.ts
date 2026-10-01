import { isAdmin } from '@/lib/auth';
import { saveUpload, uploadExtension, validUploadContentLength } from '@/lib/uploads';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!isAdmin(req)) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const contentLength = req.headers.get('content-length');
  if (contentLength === null) {
    return Response.json({ error: 'content-length required' }, { status: 411 });
  }
  if (!validUploadContentLength(contentLength)) {
    return Response.json({ error: 'invalid or excessive content-length' }, { status: 413 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File) || !uploadExtension(file.name, file.type, file.size)) {
    return Response.json({ error: 'jpg/png/webp/gif/avif 파일을 10MB 이하로 올려 주세요' }, { status: 400 });
  }

  try {
    const saved = await saveUpload(file);
    return Response.json({ url: saved.url });
  } catch {
    return Response.json({ error: 'upload failed' }, { status: 500 });
  }
}
