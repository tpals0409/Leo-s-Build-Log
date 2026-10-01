import assert from 'node:assert';
import { htmlToText } from './text.ts';
import { tokenOk } from './auth.ts';

assert.equal(htmlToText('<html><head><style>p{color:red}</style></head><body><h1>제목</h1><p>본문 &amp; 끝</p><script>alert(1)</script></body></html>'), '제목 본문 & 끝');
assert.equal(tokenOk('abc', 'abc'), true);
assert.equal(tokenOk('abd', 'abc'), false);
assert.equal(tokenOk('abc', undefined), false);
assert.equal(tokenOk('', 'abc'), false);
console.log('ok');
