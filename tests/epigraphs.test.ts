import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// A chapter opener's epigraph (rehype-chapters.mjs) is a quote from the post itself, word for word
describe('epigraphs', () => {
	const dir = 'src/content/blog';
	for (const file of readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
		const text = readFileSync(`${dir}/${file}`, 'utf8');
		const quotes = [...text.matchAll(/^\s+quote: '(.+)'$/gm)].map((m) => m[1].replace(/''/g, "'"));
		const body = text.replace(/^---[\s\S]*?\n---/, '');
		for (const quote of quotes) {
			it(`${file} quotes its own text: ${quote.slice(0, 40)}`, () => {
				expect(body).toContain(quote);
			});
		}
	}
});
