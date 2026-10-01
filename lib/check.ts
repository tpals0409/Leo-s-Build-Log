import assert from 'node:assert';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { htmlToText } from './text.ts';
import { googleClaimsOk, isAdmin, makeSession, sessionOk, tokenOk } from './auth.ts';
import {
  MAX_UPLOAD_REQUEST_SIZE,
  readUpload,
  safeUploadName,
  saveUpload,
  uploadExtension,
  validUploadContentLength,
} from './uploads.ts';
import { toShadowHtml } from './postHtml.ts';
import { parsePostInput, parsePublishedAt } from './postInput.ts';
import { fmtDate, ymd } from './i18n.ts';
import { validateLeo } from './leo/index.ts';
import { CODE_DOC, SPECS } from './leo/specs.ts';
import { postComponentsMarkdown } from './leo/docs.ts';
import { readFileSync } from 'node:fs';
import { loadContent } from './content.ts';

assert.equal(htmlToText('<html><head><style>p{color:red}</style></head><body><h1>제목</h1><p>본문 &amp; 끝</p><script>alert(1)</script></body></html>'), '제목 본문 & 끝');
assert.equal(tokenOk('abc', 'abc'), true);
assert.equal(tokenOk('abd', 'abc'), false);
assert.equal(tokenOk('abc', undefined), false);
assert.equal(tokenOk('', 'abc'), false);
assert.equal(isAdmin(new Request('http://localhost', { headers: { cookie: 'admin_session=%' } })), false);
{
  const t0 = Date.parse('2026-01-01T00:00:00Z'), s = makeSession(t0, 'k');
  assert.equal(sessionOk(s, t0, 'k'), true);
  assert.equal(sessionOk(s, t0, 'other'), false); // 토큰 바꾸면 세션 무효
  assert.equal(sessionOk(s, t0 + 31 * 864e5, 'k'), false); // 만료
  assert.equal(sessionOk(`${Number(s.split('.')[0]) + 999}.${s.split('.')[1]}`, t0, 'k'), false); // 만료시각 조작
  const c = { iss: 'https://accounts.google.com', aud: 'cid', exp: t0 / 1000 + 60, email: 'Me@Gmail.com', email_verified: true };
  assert.equal(googleClaimsOk(c, 'cid', 'me@gmail.com', t0), true);
  assert.equal(googleClaimsOk({ ...c, email: 'x@gmail.com' }, 'cid', 'me@gmail.com', t0), false);
  assert.equal(googleClaimsOk({ ...c, email_verified: false }, 'cid', 'me@gmail.com', t0), false);
  assert.equal(googleClaimsOk({ ...c, aud: 'other' }, 'cid', 'me@gmail.com', t0), false);
  assert.equal(googleClaimsOk({ ...c, exp: t0 / 1000 - 1 }, 'cid', 'me@gmail.com', t0), false);
  assert.equal(googleClaimsOk(c, 'cid', undefined, t0), false);
}

assert.equal(uploadExtension('photo.JPG', 'image/jpeg', 1), '.jpg');
assert.equal(uploadExtension('photo.jpg', 'image/png', 1), null);
assert.equal(uploadExtension('photo.svg', 'image/svg+xml', 1), null);
assert.equal(uploadExtension('photo.png', 'image/png', 10 * 1024 * 1024 + 1), null);
assert.equal(validUploadContentLength(null), false);
assert.equal(validUploadContentLength(''), false);
assert.equal(validUploadContentLength('not-a-number'), false);
assert.equal(validUploadContentLength('-1'), false);
assert.equal(validUploadContentLength(String(MAX_UPLOAD_REQUEST_SIZE)), true);
assert.equal(validUploadContentLength(String(MAX_UPLOAD_REQUEST_SIZE + 1)), false);
assert.equal(safeUploadName('123e4567-e89b-42d3-a456-426614174000.webp'), true);
assert.equal(safeUploadName('../secret.webp'), false);
assert.equal(safeUploadName('not-a-uuid.webp'), false);

const uploadTmp = await mkdtemp(path.join(os.tmpdir(), 'blog-upload-check-'));
try {
  const saved = await saveUpload(
    new File([new Uint8Array([0xff, 0xd8, 0xff])], 'photo.jpg', { type: 'image/jpeg' }),
    uploadTmp,
    () => '123e4567-e89b-42d3-a456-426614174000',
  );
  assert.equal(saved.url, '/uploads/123e4567-e89b-42d3-a456-426614174000.jpg');
  assert.deepEqual(await readFile(path.join(uploadTmp, saved.name)), Buffer.from([0xff, 0xd8, 0xff]));
  const loaded = await readUpload(saved.name, uploadTmp);
  assert.equal(loaded.type, 'image/jpeg');
  assert.deepEqual(loaded.data, Buffer.from([0xff, 0xd8, 0xff]));
  await assert.rejects(() => readUpload('../secret.jpg', uploadTmp));
  // 기본 이름은 내용 해시: 같은 이미지를 두 번 올려도 같은 주소, 오류 없음
  const png = () => new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1])], 'a.png', { type: 'image/png' });
  const h1 = await saveUpload(png(), uploadTmp), h2 = await saveUpload(png(), uploadTmp);
  assert.equal(h1.url, h2.url);
  assert.match(h1.name, /^[0-9a-f]{32}\.png$/);
  assert.equal(safeUploadName(h1.name), true);

  const imageSignatures = [
    { name: 'valid.jpg', type: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
    { name: 'valid.png', type: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
    { name: 'valid.gif', type: 'image/gif', bytes: [...Buffer.from('GIF89a')] },
    { name: 'valid.webp', type: 'image/webp', bytes: [...Buffer.from('RIFF0000WEBP')] },
    { name: 'valid.avif', type: 'image/avif', bytes: [0, 0, 0, 16, ...Buffer.from('ftypavif'), 0, 0, 0, 0] },
  ];
  for (const [index, image] of imageSignatures.entries()) {
    await saveUpload(
      new File([new Uint8Array(image.bytes)], image.name, { type: image.type }),
      uploadTmp,
      () => `123e4567-e89b-42d3-a456-${String(index + 1).padStart(12, '0')}`,
    );
  }
  const spoofRejections = await Promise.all(imageSignatures.map(async (image, index) => {
    try {
      await saveUpload(
        new File([new Uint8Array([0x6e, 0x6f, 0x70, 0x65])], image.name, { type: image.type }),
        uploadTmp,
        () => `123e4567-e89b-42d3-a456-${String(index + 101).padStart(12, '0')}`,
      );
      return false;
    } catch {
      return true;
    }
  }));
  assert.deepEqual(spoofRejections, [true, true, true, true, true], 'spoofed image bytes rejected before write');
} finally {
  await rm(uploadTmp, { recursive: true, force: true });
}

const doc = `<!doctype html><html><head><title>t</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif">
<style>body{font-family:Georgia} html body p{color:red} :root{--c:1} .body{x:1}</style></head>
<body class="b"><h1 onclick="steal()">제목</h1><p>본문</p><a href="javascript:alert(1)">x</a>
<script>fetch('/api/posts')</script><style>body h2{margin:0}</style></body></html>`;
const out = (await toShadowHtml(doc, 'ko'));
assert.ok(out.startsWith('<template shadowrootmode="open">'));
assert.ok(out.includes('<div class="post-root"><h1>제목</h1><p>본문</p>'), 'body content kept, wrapped');
assert.ok(!/script|onclick|javascript:|<title>/i.test(out), 'unsafe stripped');
assert.ok(out.includes('.post-root{font-family:Georgia}'), 'body → .post-root');
assert.ok(out.includes('.post-root p{color:red}'), 'html body → .post-root');
assert.ok(out.includes(':host{--c:1}'), ':root → :host');
assert.ok(out.includes('.body{x:1}'), 'class .body untouched');
assert.ok(out.includes('.post-root h2{margin:0}'), 'body <style> rewritten too');
assert.ok(out.endsWith('family=Noto+Serif"></template>'.replace('"></template>', '">')), 'font link outside template');
assert.equal(out.match(/<\/template>/g)?.length, 1);
assert.ok(!(await toShadowHtml('<p>a</p></template><style>body{display:none}</style>', 'ko')).includes('</template><style>'), 'cannot escape template');

const demoDoc = `<html><body><p>설명</p><script>outside()</script>
<template data-demo data-height="400" data-title="Counter"><!doctype html><button onclick="n++">+</button><script src="https://cdn.jsdelivr.net/npm/chart.js"></script><script>let n=0"</script></template>
<p>끝</p></body></html>`;
const d = (await toShadowHtml(demoDoc, 'ko'));
const frame = d.match(/<iframe data-demo-frame[^>]*><\/iframe>/)?.[0] ?? '';
assert.ok(frame, 'demo → iframe');
assert.ok(frame.includes('sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"') && !frame.includes('allow-same-origin'), 'sandboxed, no same-origin');
assert.ok(frame.includes('height:400px') && frame.includes('title="Counter"'));
assert.ok(frame.includes('onclick=&quot;n++&quot;') && frame.includes('&lt;script&gt;let n=0&quot;&lt;/script&gt;'), 'demo scripts kept, escaped in srcdoc');
assert.ok(frame.includes('chart.js'), 'external lib allowed inside demo');
assert.ok(/srcdoc="&lt;!doctype html&gt;/.test(frame), 'doctype stays first (no quirks mode)');
assert.ok(!d.replace(frame, '').includes('outside()'), 'scripts outside demo still stripped');
assert.ok(d.indexOf('<p>설명</p>') < d.indexOf(frame) && d.indexOf(frame) < d.indexOf('<p>끝</p>'), 'demo stays in place');
assert.ok((await toShadowHtml('<template data-demo>a</template>', 'ko')).includes('height:320px'), 'default height');

const good = { slug: 'agent-orchestration', category: 'ai-agent', project: 'algosu', tags: ['claude-code'],
  ko: { title: '제목', summary: '요약', html: '<p>본문</p>' }, en: { title: 'Title', html: '<p>Body</p>' } };
const r = parsePostInput(good);
assert.ok(r.ok && r.value.en.summary === '' && r.value.published === true && r.value.featured === false);
const errs = (b: unknown) => { const x = parsePostInput(b); return x.ok ? [] : x.errors; };
assert.ok(errs({ ...good, en: undefined }).some((e) => e.startsWith('en:')), 'en required');
assert.ok(errs({ ...good, ko: { title: '제목' } }).some((e) => e.startsWith('ko:')), 'ko html required');
assert.ok(errs({ ...good, slug: '한글-slug' }).some((e) => e.startsWith('slug')), 'ascii slug');
assert.ok(errs({ ...good, slug: 'Bad_Slug' }).some((e) => e.startsWith('slug')));
assert.ok(errs({ ...good, category: 'cicd' }).some((e) => e.startsWith('category')), 'old category rejected');
assert.ok(errs({ ...good, project: 'nope' }).some((e) => e.startsWith('project')));
assert.ok(parsePostInput({ ...good, project: '' }).ok, 'empty project = none');
assert.equal(errs(null).length, 4, 'null body → slug, category, ko, en');

// ── 글 컴포넌트 (lib/leo) ──
// 등록부의 모든 예시는 검증을 통과하고 오류 없이 렌더돼야 한다 (문서·견본 페이지가 깨진 예시를 보여주지 않게)
const allExamples = SPECS.map((s) => s.example).filter(Boolean).join('\n') + CODE_DOC.example;
assert.deepEqual(validateLeo(allExamples), [], 'all registry examples validate');
const rendered = await toShadowHtml(`<body>${allExamples}</body>`, 'ko');
assert.ok(!rendered.includes('class="leo-error"'), 'all examples render');
assert.ok(rendered.includes('class="shiki leo"'), 'code highlighted with leo theme');
assert.ok(/class="line leo-hl"/.test(rendered), 'data-highlight marks line');
assert.ok(rendered.includes('└── ') && rendered.includes('├── '), 'tree connectors');
assert.ok(rendered.includes('data-value="184s"'), 'chart marks carry tooltip data');
// 코드 예시 안의 글자는 정화되지 않는다 (예전 정규식 정화는 onclick=… 글자를 지웠다)
const codeDoc = await toShadowHtml('<pre><code class="language-html">&lt;button onclick="go()"&gt;x&lt;/button&gt;</code></pre><p onclick="evil()">p</p>', 'ko');
assert.ok(codeDoc.includes('onclick') && !codeDoc.includes('evil'), 'code text kept, real attribute removed');
assert.ok((await toShadowHtml('<iframe srcdoc="<script>x</script>"></iframe><iframe src="https://www.youtube.com/embed/x"></iframe><iframe src="http://x"></iframe>', 'ko')).match(/<iframe/g)?.length === 1, 'only https iframe, no srcdoc');
assert.ok((await toShadowHtml('<leo-nope>x</leo-nope>', 'ko')).includes('class="leo-error"'), 'unknown tag shows error box');
// 검증 오류 문구
const v = (h: string) => validateLeo(h).join(' | ');
assert.match(v('<leo-chart>{}</leo-chart>'), /type 속성 필수/);
assert.match(v('<leo-chart type="pie">{}</leo-chart>'), /type="pie"/);
assert.match(v('<leo-chart type="bar">{"labels":["a"],"series":[{"name":"x","values":[1,2]}]}</leo-chart>'), /labels와 같은 개수/);
assert.match(v('<leo-metric value="1" label="a"></leo-metric>'), /<leo-metrics> 바로 안에서만/);
assert.match(v('<leo-steps></leo-steps>'), /<leo-step>가 하나 이상/);
assert.match(v('<leo-diagram></leo-diagram>'), /<svg> 또는 <img>/);
assert.match(v('<leo-sparkle></leo-sparkle>'), /없는 컴포넌트/);
const bad = parsePostInput({ ...good, en: { title: 'T', html: '<leo-callout type="danger">x</leo-callout>' } });
assert.ok(!bad.ok && bad.errors.some((e) => e.startsWith('en.html <leo-callout>')), 'post upload rejects bad component');
assert.equal(readFileSync(new URL('../docs/post-components.md', import.meta.url), 'utf8'), postComponentsMarkdown(), 'docs/post-components.md가 등록부와 다름 — npm run docs:post');

// ── 발행일 (publishedAt) ──
const NOW = new Date('2026-10-01T03:00:00Z');
const pa = (v: unknown) => parsePublishedAt(v, NOW);
assert.equal(pa(undefined).date, null, '생략 → null (새 글은 now, 기존 글은 유지)');
assert.equal(pa('2023-07-15T00:00:00+09:00').date?.toISOString(), '2023-07-14T15:00:00.000Z', '시간대 반영');
assert.equal(pa('2023-07-15').date?.toISOString(), '2023-07-14T15:00:00.000Z', '날짜만 → 서울 자정');
assert.equal(pa('2022-11-03T09:00:00Z').date?.toISOString(), '2022-11-03T09:00:00.000Z');
assert.match(pa('2023-02-30').error ?? '', /없는 날짜/, '2월 30일 거절');
assert.match(pa('2024-02-29T10:00:00+09:00').error ?? 'ok', /ok/, '윤년 2/29는 허용');
assert.match(pa('2023-07-15T09:00:00').error ?? '', /시간대/, '시각에 시간대 없으면 거절');
assert.match(pa('2023/07/15').error ?? '', /ISO 8601/);
assert.match(pa('2023-07-15T25:00:00+09:00').error ?? '', /범위/);
assert.match(pa('2026-12-25').error ?? '', /미래/, '미래 날짜 거절');
assert.match(pa(20230715).error ?? '', /ISO 8601/, '숫자 거절');
assert.ok(!parsePostInput({ ...good, publishedAt: 'yesterday' }).ok, 'post upload rejects bad publishedAt');
const withDate = parsePostInput({ ...good, publishedAt: '2023-07-15' });
assert.ok(withDate.ok && withDate.value.publishedAt instanceof Date);
// 표시는 서울 기준 — 서버가 UTC여도 자정 KST 글이 전날로 보이지 않는다
assert.equal(fmtDate(new Date('2023-07-14T15:00:00Z'), 'ko'), '2023년 7월 15일');
assert.equal(fmtDate(new Date('2023-07-14T15:00:00Z'), 'en'), 'July 15, 2023');
assert.equal(ymd(new Date('2023-07-14T15:00:00Z')), '2023-07-15');
// git 글 원본: 폴더 → 등록 본문, 빠진 publishedAt·언어 파일은 오류
{
  const root = await mkdtemp(path.join(os.tmpdir(), 'blog-content-check-'));
  const { mkdir, writeFile } = await import('node:fs/promises');
  const meta = { category: 'engineering', publishedAt: '2026-10-01', ko: { title: '제목' }, en: { title: 'Title' } };
  await mkdir(path.join(root, 'good'));
  await writeFile(path.join(root, 'good/post.json'), JSON.stringify(meta));
  await writeFile(path.join(root, 'good/ko.html'), '<p>본문</p>');
  await writeFile(path.join(root, 'good/en.html'), '<p>body</p>');
  await mkdir(path.join(root, 'no-date'));
  await writeFile(path.join(root, 'no-date/post.json'), JSON.stringify({ ...meta, publishedAt: undefined }));
  await writeFile(path.join(root, 'no-date/ko.html'), '<p>본문</p>');
  await writeFile(path.join(root, 'no-date/en.html'), '<p>body</p>');
  await mkdir(path.join(root, 'no-en'));
  await writeFile(path.join(root, 'no-en/post.json'), JSON.stringify(meta));
  await writeFile(path.join(root, 'no-en/ko.html'), '<p>본문</p>');
  const c = loadContent(root);
  await rm(root, { recursive: true });
  assert.deepEqual(c.posts.map((p) => [p.slug, p.ko.html, p.en.title]), [['good', '<p>본문</p>', 'Title']]);
  assert.equal(c.errors.length, 2);
  assert.ok(c.errors.some((e) => e.includes('no-date') && e.includes('publishedAt')));
  assert.ok(c.errors.some((e) => e.includes('no-en') && e.includes('en:')));
}
// 저장소의 실제 글이 전부 등록 규칙을 통과하는지 (PR에서 깨진 글을 막는다)
assert.deepEqual(loadContent().errors, []);

console.log('ok');
