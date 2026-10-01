import { isAdmin } from '@/lib/auth';
import { deletePost } from '@/lib/db';

type Ctx = { params: Promise<{ slug: string }> };
const unauthorized = () => Response.json({ error: 'unauthorized' }, { status: 401 });

export async function DELETE(req: Request, { params }: Ctx) {
  if (!isAdmin(req)) return unauthorized();
  const { slug } = await params;
  return (await deletePost(slug)) ? new Response(null, { status: 204 }) : Response.json({ error: 'not found' }, { status: 404 });
}
