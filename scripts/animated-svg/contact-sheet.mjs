// A contact sheet of an animated SVG: one frame every --every seconds, tiled into a PNG
// with each frame's time under it, so a review reads the whole animation at a glance
// instead of scrubbing it. From Lemo-Opuscar's review loop (core/render/still.mjs and
// sheet.py, MIT).
//
//   node scripts/animated-svg/contact-sheet.mjs <file.svg> <out.png> [--every 0.5] [--cols 4]
import sharp from 'sharp';
import { openSvg, seek } from './page.mjs';

const [file, out, ...rest] = process.argv.slice(2);
if (!file || !out) {
	console.error('usage: contact-sheet.mjs <file.svg> <out.png> [--every 0.5] [--cols 4]');
	process.exit(1);
}
const opt = (name, fallback) => {
	const i = rest.indexOf(name);
	return i >= 0 ? Number(rest[i + 1]) : fallback;
};
const every = opt('--every', 0.5);
const cols = opt('--cols', 4);
if (!(every > 0) || !(cols >= 1)) throw new Error('--every and --cols take positive numbers');

const TILE = 480;
const CAPTION = 28;
const { browser, page, end, size } = await openSvg(file);
if (end === 0) {
	await browser.close();
	throw new Error(`${file} has no animation`);
}
const tileH = Math.round((size.height / size.width) * TILE);
const tiles = [];
for (let t = 0; t <= end + 1e-6; t += every) {
	await seek(page, t);
	const shot = await page.locator('body > svg').screenshot();
	tiles.push({ t, png: await sharp(shot).resize(TILE, tileH).png().toBuffer() });
}
await browser.close();

const rows = Math.ceil(tiles.length / cols);
const cellH = tileH + CAPTION;
const composites = tiles.flatMap(({ t, png }, i) => {
	const left = (i % cols) * TILE;
	const top = Math.floor(i / cols) * cellH;
	const caption = Buffer.from(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${CAPTION}"><text x="8" y="20" font-family="Menlo, monospace" font-size="16" fill="#ededed">${t.toFixed(2)}s</text></svg>`,
	);
	return [
		{ input: png, left, top },
		{ input: caption, left, top: top + tileH },
	];
});
await sharp({
	create: { width: cols * TILE, height: rows * cellH, channels: 3, background: '#1d1d1d' },
})
	.composite(composites)
	.png()
	.toFile(out);
console.log(`${tiles.length} frames → ${out}`);
