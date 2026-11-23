#!/usr/bin/env node
/**
 * Draws the share card for /featured/ (DECISIONS.md 2026-11-22, option C): a black wall of
 * every outlet, course and thread in src/data/coverage.ts with the papers' venues lit pink,
 * and FEATURED, my name and the URL on a black plate. It writes
 * public/images/featured/share-{hash}.webp, named by its bytes so a redrawn card gets a new URL
 * past the image cache, and points SHARE_CARD in coverage.ts at it (src/pages/og/ makes the JPEG).
 *
 * Redraw it after adding to coverage.ts: npm run featured:card
 *
 * Needs the network for Google Fonts; it stops if Anton or Hanken Grotesk fail to load
 * rather than draw the card in a fallback face.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { coverage, papers } from '../src/data/coverage.ts';
import { CHALK, double } from '../src/data/scribbles.ts';

const ROOT = new URL('..', import.meta.url).pathname;
const DIR = 'images/featured';
const PINK = '#ff4fd8';

// "Hacker News (mooreds)" and "DB Weekly #320" are one name each on the wall
const outlets = [
	...new Set(coverage.map((entry) => entry.outlet.replace(/\s*(\(.*\)|#\d+)$/, '').trim())),
];
const venues = [...new Set(papers.map((paper) => paper.venue))];

// Runs in the page once the fonts load. Lays the outlets out in rows that each run off the
// card's right edge, then spreads the venues over the rows top to bottom, alternating left,
// right and middle. Rows pack from the left, so placing a venue only moves the names after it. A
// venue that would sit under the plate or off an edge tries the next-nearest name in its row,
// then the nearest row without a venue yet.
function buildWall({ outlets, venues }) {
	const wall = document.querySelector('.wall');
	const plate = document.querySelector('.plate').getBoundingClientRect();
	const visible = (el) => {
		const r = el.getBoundingClientRect();
		const inCard = r.left >= 0 && r.right <= 1200 && r.top >= 0 && r.bottom <= 630;
		const underPlate =
			r.right > plate.left && r.left < plate.right && r.bottom > plate.top && r.top < plate.bottom;
		return inCard && !underPlate;
	};
	let next = 0;
	const rows = [];
	const fill = (row) => {
		while (row.scrollWidth <= row.clientWidth)
			row.appendChild(document.createElement('span')).textContent =
				outlets[next++ % outlets.length];
	};
	while (wall.getBoundingClientRect().bottom < 630) {
		const row = wall.appendChild(document.createElement('div'));
		// Rows start at staggered offsets, like bricks, so the clipped left edge isn't a column
		row.style.marginLeft = `-${(rows.length * 53) % 140}px`;
		fill(row);
		rows.push(row);
	}
	const onCard = rows.filter((row) => {
		const r = row.getBoundingClientRect();
		return r.top >= 0 && r.bottom <= 630;
	});
	const across = [0.2, 0.8, 0.5, 0.35, 0.65, 0.15, 0.85, 0.5];
	const centre = (el) => (el.getBoundingClientRect().left + el.getBoundingClientRect().right) / 2;
	const tryRow = (row, venue, x) =>
		[...row.children]
			// Two venues side by side read as one name
			.filter(
				(el) =>
					![el, el.previousElementSibling, el.nextElementSibling].some((n) => n?.className === 'p'),
			)
			.sort((a, b) => Math.abs(centre(a) - x) - Math.abs(centre(b) - x))
			.some((spot) => {
				const outlet = spot.textContent;
				spot.textContent = venue;
				spot.className = 'p';
				// Two venues can share a row; the new one mustn't push the first off the edge
				if ([...row.querySelectorAll('.p')].every(visible)) return true;
				spot.textContent = outlet;
				spot.className = '';
				return false;
			});
	// Every venue gets its try, so one that fails doesn't stop the rest
	const placed = venues.map((venue, i) => {
		const want = Math.round((i * (onCard.length - 1)) / Math.max(1, venues.length - 1));
		const taken = (row) => (row.querySelector('.p') ? 1 : 0);
		const byPreference = onCard
			.map((row, k) => ({ row, k }))
			.sort((a, b) => taken(a.row) - taken(b.row) || Math.abs(a.k - want) - Math.abs(b.k - want));
		return byPreference.some(({ row }) => tryRow(row, venue, across[i % across.length] * 1200));
	});
	// A venue shorter than the name it replaced can leave a row short of the edge
	rows.forEach(fill);
	const pink = [...wall.querySelectorAll('.p')];
	// How many venues show, so a failure says how far off it is
	return placed.every(Boolean) && pink.every(visible) ? pink.length : pink.filter(visible).length;
}
// The crayon line's two long strokes, as SectionRule draws it
const rule = double.path.split(/(?=M)/).slice(0, 2).join(' ');

const html = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@700&display=block">
<style>
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: #000; position: relative; }
.wall { position: absolute; top: -14px; left: -40px; right: -40px; font: 400 40px/.98 Anton, sans-serif; text-transform: uppercase; color: #232323; }
.wall div { display: flex; gap: .3em; white-space: nowrap; }
.wall span { flex: none; }
.p { color: ${PINK}; }
.plate { position: absolute; left: 56px; bottom: 52px; background: #000; padding: 22px 30px 26px; }
.big { font: 400 168px/.86 Anton, sans-serif; text-transform: uppercase; color: ${CHALK}; }
svg { display: block; width: 100%; height: 26px; margin-top: 4px; }
.sub { margin-top: 14px; display: flex; gap: 28px; align-items: baseline; }
.name { font: 400 34px/1 Anton, sans-serif; text-transform: uppercase; color: ${PINK}; }
.url { font: 700 26px/1 'Hanken Grotesk', sans-serif; letter-spacing: .02em; color: #ededed; }
</style>
<div class="wall"></div>
<div class="plate">
	<div class="big">Featured</div>
	<svg viewBox="${double.viewBox}" preserveAspectRatio="none"><path d="${rule}" fill="none" stroke="${PINK}" stroke-width="7" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>
	<div class="sub"><span class="name">Joe Karlsson</span><span class="url">joekarlsson.com/featured</span></div>
</div>`;

const browser = await chromium.launch();
try {
	const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
	await page.setContent(html, { waitUntil: 'networkidle' });
	// A face only downloads once something asks for it, so ask for each one the card uses
	const fontsLoaded = await page.evaluate(async () => {
		const faces = ['40px Anton', '700 26px "Hanken Grotesk"'];
		await Promise.all(faces.map((face) => document.fonts.load(face)));
		return faces.every((face) => document.fonts.check(face));
	});
	if (!fontsLoaded)
		throw new Error('Anton or Hanken Grotesk did not load from Google Fonts; is the network up?');
	const shown = await page.evaluate(buildWall, { outlets, venues });
	if (shown !== venues.length)
		throw new Error(
			`Only ${shown} of ${venues.length} paper venues fit on the card where they can be seen`,
		);

	const card = await sharp(await page.screenshot({ type: 'png' }))
		.webp({ quality: 85 })
		.toBuffer();
	const name = `share-${createHash('sha256').update(card).digest('hex').slice(0, 8)}.webp`;
	const dir = join(ROOT, 'public', DIR);
	mkdirSync(dir, { recursive: true });
	for (const old of readdirSync(dir).filter((f) => /^share-\w+\.webp$/.test(f) && f !== name))
		rmSync(join(dir, old));
	writeFileSync(join(dir, name), card);

	const dataFile = join(ROOT, 'src/data/coverage.ts');
	const source = readFileSync(dataFile, 'utf8');
	const line = /^export const SHARE_CARD = '[^']*';$/m;
	if (!line.test(source)) throw new Error('coverage.ts has no SHARE_CARD line to update');
	writeFileSync(dataFile, source.replace(line, `export const SHARE_CARD = '/${DIR}/${name}';`));
	console.log(`/${DIR}/${name}`);
} finally {
	await browser.close();
}
