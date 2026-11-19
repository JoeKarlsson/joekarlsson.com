import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// An HTML comment in an .astro template ships in every page that renders it: 104 of them
// were 6.2MB across the site and 73KB of /blog/ (one per card). {/* */} is dropped at build.
const astroFiles = readdirSync('src', { recursive: true, encoding: 'utf8' })
	.filter((path) => path.endsWith('.astro'))
	.map((path) => join('src', path));

describe('.astro templates', () => {
	it('write notes as {/* */}, not HTML comments that ship to visitors', () => {
		const offenders = astroFiles.filter((file) => readFileSync(file, 'utf8').includes('<!--'));
		expect(offenders).toEqual([]);
	});
});
