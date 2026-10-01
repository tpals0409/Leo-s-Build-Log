import { writeFileSync } from 'node:fs';
import { postComponentsMarkdown } from '../lib/leo/docs.ts';

writeFileSync(new URL('../docs/post-components.md', import.meta.url), postComponentsMarkdown());
console.log('docs/post-components.md updated');
