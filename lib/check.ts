import assert from 'node:assert';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { htmlToText } from './text.ts';
import { isAdmin, tokenOk } from './auth.ts';
import {
  MAX_UPLOAD_REQUEST_SIZE,
  readUpload,
  safeUploadName,
  saveUpload,
  uploadExtension,
  validUploadContentLength,
} from './uploads.ts';
import { toShadowHtml } from './postHtml.ts';
import { parsePostInput } from './postInput.ts';

assert.equal(htmlToText('<html><head><style>p{color:red}</style></head><body><h1>제목</h1><p>본문 &amp; 끝</p><script>alert(1)</script></body></html>'), '제목 본문 & 끝');
assert.equal(tokenOk('abc', 'abc'), true);
assert.equal(tokenOk('abd', 'abc'), false);
assert.equal(tokenOk('abc', undefined), false);
assert.equal(tokenOk('', 'abc'), false);
assert.equal(isAdmin(new Request('http://localhost', { headers: { cookie: 'admin_token=%' } })), false);

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
const out = toShadowHtml(doc);
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
assert.ok(!toShadowHtml('<p>a</p></template><style>body{display:none}</style>').includes('</template><style>'), 'cannot escape template');

const demoDoc = `<html><body><p>설명</p><script>outside()</script>
<template data-demo data-height="400" data-title="Counter"><!doctype html><button onclick="n++">+</button><script src="https://cdn.jsdelivr.net/npm/chart.js"></script><script>let n=0"</script></template>
<p>끝</p></body></html>`;
const d = toShadowHtml(demoDoc);
const frame = d.match(/<iframe data-demo-frame[^>]*><\/iframe>/)?.[0] ?? '';
assert.ok(frame, 'demo → iframe');
assert.ok(frame.includes('sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"') && !frame.includes('allow-same-origin'), 'sandboxed, no same-origin');
assert.ok(frame.includes('height:400px') && frame.includes('title="Counter"'));
assert.ok(frame.includes('onclick=&quot;n++&quot;') && frame.includes('&lt;script&gt;let n=0&quot;&lt;/script&gt;'), 'demo scripts kept, escaped in srcdoc');
assert.ok(frame.includes('chart.js'), 'external lib allowed inside demo');
assert.ok(/srcdoc="&lt;!doctype html&gt;/.test(frame), 'doctype stays first (no quirks mode)');
assert.ok(!d.replace(frame, '').includes('outside()'), 'scripts outside demo still stripped');
assert.ok(d.indexOf('<p>설명</p>') < d.indexOf(frame) && d.indexOf(frame) < d.indexOf('<p>끝</p>'), 'demo stays in place');
assert.ok(toShadowHtml('<template data-demo>a</template>').includes('height:320px'), 'default height');

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
console.log('ok');
