import assert from 'node:assert';
import { htmlToText } from './text.ts';
import { tokenOk } from './auth.ts';
import { toShadowHtml } from './postHtml.ts';
import { parsePostInput } from './postInput.ts';

assert.equal(htmlToText('<html><head><style>p{color:red}</style></head><body><h1>제목</h1><p>본문 &amp; 끝</p><script>alert(1)</script></body></html>'), '제목 본문 & 끝');
assert.equal(tokenOk('abc', 'abc'), true);
assert.equal(tokenOk('abd', 'abc'), false);
assert.equal(tokenOk('abc', undefined), false);
assert.equal(tokenOk('', 'abc'), false);

const doc = `<!doctype html><html><head><title>t</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif">
<style>body{font-family:Georgia} html body p{color:red} :root{--c:1} .body{x:1}</style></head>
<body class="b"><h1 onclick="steal()">제목</h1><p>본문</p><a href="javascript:alert(1)">x</a>
<script>fetch('/api/posts')</script><style>body h2{margin:0}</style></body></html>`;
const out = toShadowHtml(doc);
assert.ok(out.startsWith('<template shadowrootmode="open">'));
assert.ok(out.includes('<h1>제목</h1><p>본문</p>'), 'body content kept');
assert.ok(!/script|onclick|javascript:|<title>/i.test(out), 'unsafe stripped');
assert.ok(out.includes(':host{font-family:Georgia}'), 'body → :host');
assert.ok(out.includes(':host p{color:red}'), 'html body → :host');
assert.ok(out.includes(':host{--c:1}'), ':root → :host');
assert.ok(out.includes('.body{x:1}'), 'class .body untouched');
assert.ok(out.includes(':host h2{margin:0}'), 'body <style> rewritten too');
assert.ok(out.endsWith('family=Noto+Serif"></template>'.replace('"></template>', '">')), 'font link outside template');
assert.equal(out.match(/<\/template>/g)?.length, 1);
assert.ok(!toShadowHtml('<p>a</p></template><style>body{display:none}</style>').includes('</template><style>'), 'cannot escape template');

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
