'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/ui/Button';

type Row = { slug: string; title: string; category: string; featured: boolean; published: boolean; created_at: string };

export default function AdminClient({ posts, error }: { posts: Row[] | null; error?: string }) {
  const router = useRouter();
  const [err, setErr] = useState('');

  const call = async (url: string, init: RequestInit) => {
    const r = await fetch(url, { ...init, headers: { 'content-type': 'application/json' } });
    if (!r.ok) return setErr((await r.json().catch(() => ({}))).error ?? r.statusText);
    setErr('');
    router.refresh();
  };

  if (!posts) {
    return (
      <form action="/api/auth/google" className="flex flex-wrap items-center gap-3">
        <Button>Google로 로그인</Button>
        {error && <p className="text-muted">{error === 'denied' ? '허용된 관리자 계정이 아닙니다.' : '로그인이 만료됐습니다. 다시 시도하세요.'}</p>}
      </form>
    );
  }

  return (
    <>
      <div className="flex justify-end pb-4">
        <button className="tap cursor-pointer t-body-sm text-link" onClick={() => call('/api/auth/logout', { method: 'POST' })}>로그아웃</button>
      </div>
      {err && <p className="text-muted">{err}</p>}
      <table className="w-full border-collapse t-body-sm [&_td]:border-b [&_td]:border-line [&_td]:px-2 [&_td]:py-3 [&_th]:border-b [&_th]:border-line [&_th]:px-2 [&_th]:py-3 [&_th]:text-left [&_th]:t-caption [&_th]:text-muted">
        <thead><tr><th>제목</th><th>카테고리</th><th>작성일</th><th>발행</th><th>Featured</th></tr></thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.slug}>
              <td><a className="text-link" href={`/ko/posts/${p.slug}`}>{p.title}</a></td>
              <td>{p.category}</td>
              <td>{p.created_at}</td>
              <td>{p.published ? '✓' : '—'}</td>
              <td>{p.featured ? '✓' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!posts.length && <p className="py-30 text-center text-muted">글이 없습니다. content/posts에 추가해 main에 머지하세요 (README 참고).</p>}
    </>
  );
}
