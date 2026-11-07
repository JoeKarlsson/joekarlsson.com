import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// Desktop-only embeds (games) must not load on a phone either way up: a big iPhone
// turned sideways is 932x430 CSS px, over the md width, and a game loading there is
// what crashed an iPhone. The loader script and the CSS that swaps in the poster
// must use the same rule, or a sideways phone gets an empty frame and no poster.
const script = readFileSync('src/scripts/load-desktop-embeds.ts', 'utf8');
const css = readFileSync('src/styles/global.css', 'utf8');
const query = script.match(/DESKTOP_EMBED_QUERY = '([^']+)'/)?.[1] ?? '';

/** Whether a "(width >= Xrem) and (height >= Yrem)" query matches a CSS-pixel screen */
function matches(width: number, height: number): boolean {
	const [, minWidth, minHeight] =
		query.match(/width >= ([\d.]+)rem\) and \(height >= ([\d.]+)rem/) ?? [];
	return width >= Number(minWidth) * 16 && height >= Number(minHeight) * 16;
}

describe('desktop-only embeds', () => {
	it('the loader and the embed-large CSS variant use the same query', () => {
		expect(query).not.toBe('');
		expect(css).toContain(`@custom-variant embed-large (@media ${query});`);
	});

	it('load on laptops and tablets but not on phones, upright or sideways', () => {
		expect(matches(1280, 720)).toBe(true); // small laptop window
		expect(matches(1024, 768)).toBe(true); // iPad sideways
		expect(matches(820, 1180)).toBe(true); // iPad upright
		expect(matches(430, 932)).toBe(false); // iPhone Pro Max upright
		expect(matches(932, 430)).toBe(false); // iPhone Pro Max sideways
		expect(matches(844, 390)).toBe(false); // iPhone sideways
	});
});
