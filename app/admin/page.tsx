import { cookies } from 'next/headers';
import Container from '@/components/ui/Container';
import { tokenOk } from '@/lib/auth';
import { listAll } from '@/lib/db';
import { ymd } from '@/lib/i18n';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const token = (await cookies()).get('admin_token')?.value;
  const posts = tokenOk(token) ? await listAll() : null;
  return (
    <Container className="pb-20">
      <h1 className="pb-8 pt-12 t-section">관리자</h1>
      <AdminClient posts={posts?.map((p) => ({ ...p, created_at: ymd(p.created_at) })) ?? null} />
    </Container>
  );
}
