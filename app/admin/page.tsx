import { cookies } from 'next/headers';
import Container from '@/components/ui/Container';
import { SESSION_COOKIE, sessionOk } from '@/lib/auth';
import { listAll } from '@/lib/db';
import { ymd } from '@/lib/i18n';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  const posts = sessionOk((await cookies()).get(SESSION_COOKIE)?.value) ? await listAll() : null;
  const { error } = await searchParams;
  return (
    <Container className="pb-20">
      <h1 className="pb-8 pt-12 t-section">관리자</h1>
      <AdminClient posts={posts?.map((p) => ({ ...p, created_at: ymd(p.created_at) })) ?? null} error={error} />
    </Container>
  );
}
