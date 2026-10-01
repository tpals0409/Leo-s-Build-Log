// content/posts → 블로그 API. main에 머지되면 .github/workflows/content.yml이 실행한다.
//   node --experimental-strip-types scripts/sync-posts.ts [--delete slug …]
// 모든 글을 upsert(같은 내용이면 결과도 같음) + --delete로 받은 slug만 삭제.
// 지울 글은 "이번 푸시에서 폴더가 사라진 글"로 Action이 넘겨준다 — git에 없는 DB 글을 전부 지우지 않는다(옮기기 전 글 보호).
// ponytail: 매번 전체 upsert. 글이 수백 편이 되면 바뀐 폴더만.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { CONTENT_DIR, loadContent, localFile } from '../lib/content.ts';
import { MIME } from '../lib/uploads.ts';

const api = `${process.env.BLOG_URL ?? 'https://www.leosbuildlog.com'}/api/posts`;
const token = process.env.ADMIN_TOKEN;
if (!token) throw new Error('ADMIN_TOKEN 필요');
const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'user-agent': 'leos-build-log-sync/1.0' };

const { posts, errors } = loadContent();
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

let failed = false;
// 글 폴더의 썸네일 → /api/uploads (내용 해시 이름이라 매번 올려도 같은 주소)
async function upload(file: string) {
  const form = new FormData();
  form.append('file', new File([readFileSync(file)], path.basename(file), { type: MIME[path.extname(file).toLowerCase()] }));
  const r = await fetch(`${api.replace(/posts$/, 'uploads')}`, { method: 'POST', headers: { authorization: headers.authorization, 'user-agent': headers['user-agent'] }, body: form });
  if (!r.ok) throw new Error(`upload ${file}: ${r.status} ${await r.text()}`);
  return (await r.json()).url as string;
}

for (const p of posts) {
  if (localFile(p.thumbnail)) p.thumbnail = await upload(path.join(CONTENT_DIR, p.slug, p.thumbnail));
  const r = await fetch(api, { method: 'POST', headers, body: JSON.stringify(p) });
  console.log(`${r.ok ? 'ok ' : 'ERR'} ${p.slug}${r.ok ? '' : ` ${r.status} ${await r.text()}`}`);
  failed ||= !r.ok;
}
const i = process.argv.indexOf('--delete');
for (const slug of i < 0 ? [] : process.argv.slice(i + 1)) {
  if (posts.some((p) => p.slug === slug)) continue; // 다시 생긴 글(이름 되돌리기 등)은 지우지 않음
  const r = await fetch(`${api}/${encodeURIComponent(slug)}`, { method: 'DELETE', headers });
  console.log(`${r.ok || r.status === 404 ? 'del' : 'ERR'} ${slug}${r.ok || r.status === 404 ? '' : ` ${r.status}`}`);
  failed ||= !r.ok && r.status !== 404;
}
process.exit(failed ? 1 : 0);
