// 글 원본은 git: content/posts/<slug>/{post.json, ko.html, en.html}. main에 머지되면 Action이 API로 DB에 반영한다.
// post.json = 등록 API 본문에서 slug와 html을 뺀 것 (slug는 폴더 이름, html은 언어별 파일).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { LOCALES } from './i18n.ts';
import { parsePostInput } from './postInput.ts';

export const CONTENT_DIR = 'content/posts';

export function readPostDir(dir: string) {
  const meta = JSON.parse(readFileSync(path.join(dir, 'post.json'), 'utf8'));
  const body: any = { ...meta, slug: path.basename(dir) };
  for (const l of LOCALES) {
    const file = path.join(dir, `${l}.html`);
    body[l] = { ...meta[l], html: existsSync(file) ? readFileSync(file, 'utf8') : '' };
  }
  return body;
}

// 모든 글을 읽어 검증. 재현 가능하도록 git 원본은 publishedAt 필수 (생략하면 DB를 새로 채울 때 날짜가 바뀐다).
export function loadContent(root = CONTENT_DIR) {
  const posts: any[] = [], errors: string[] = [];
  const dirs = existsSync(root) ? readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()) : [];
  for (const d of dirs) {
    const dir = path.join(root, d.name);
    let body;
    try {
      body = readPostDir(dir);
    } catch (e) {
      errors.push(`${dir}/post.json: ${(e as Error).message}`);
      continue;
    }
    const parsed = parsePostInput(body);
    if (!parsed.ok) errors.push(...parsed.errors.map((e) => `${dir}: ${e}`));
    else if (!body.publishedAt) errors.push(`${dir}: publishedAt 필수 (예: 2026-10-01)`);
    else posts.push(body);
  }
  return { posts, errors };
}
