// Writes Joe's JK mark (src/utils/watermark.mjs) into every diagram SVG under
// public/images that doesn't have one yet, inside its frame: it renders the diagram,
// then takes the first clear spot, trying the bottom-right corner, then bottom left,
// top right and top left, each from the edge inward. A diagram with no clear corner
// gets the least busy spot, and is listed so a person can look at it.
//
//   node scripts/watermark-diagrams.mjs [files...]   # default: all of public/images
//   node scripts/watermark-diagrams.mjs --force ...  # move existing marks too
//
// Needs the network (Google Fonts, the diagrams' typefaces).
import { globSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { jkMark, MARK_HEIGHT, MARK_WIDTH } from '../src/utils/watermark.mjs';

const MARK_SHARE = 0.06; // mark width as a share of the diagram's width
const GREEN = [0, 255, 0]; // page color behind the diagram: shows where it has no panel
const MARK_RE = /<g class="jk-mark"[^>]*>(?:<path[^>]*\/>){2}<\/g>/;

const args = process.argv.slice(2);
const force = args.includes('--force');
const named = args.filter((a) => a !== '--force');
const files = named.length ? named : globSync('public/images/**/*.svg').sort();

const fonts =
	'family=Anton&family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Hanken+Grotesk:wght@400;600;700&family=JetBrains+Mono';
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
// The collages' cut-out photos are /images/... paths: serve public/ under a made-up origin
const ORIGIN = 'http://diagram.test';
await page.route(`${ORIGIN}/**`, (route) => {
	const path = decodeURIComponent(new URL(route.request().url()).pathname);
	if (path === '/') return route.fulfill({ contentType: 'text/html', body: '' });
	route.fulfill({ path: `public${path}` }).catch(() => route.abort());
});
const busy = [];
let marked = 0;
try {
	for (const file of files) {
		let svg = readFileSync(file, 'utf8');
		if (MARK_RE.test(svg)) {
			if (!force) continue;
			svg = svg.replace(MARK_RE, '');
		}
		const viewBox = svg.match(/<svg\b[^>]*?\bviewBox="([^"]+)"/);
		if (!viewBox) throw new Error(`${file}: no viewBox`);
		const [minX, minY, width, height] = viewBox[1]
			.trim()
			.split(/[\s,]+/)
			.map(Number);

		// Rendered 1:1 with the viewBox, on a page served from public/ so its photos load
		await page.goto(`${ORIGIN}/`);
		await page.setViewportSize({ width: Math.ceil(width) + 20, height: Math.ceil(height) + 20 });
		await page.setContent(
			`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fonts}&display=block">
<style>:root{--font-anton:Anton,sans-serif;--font-hanken-grotesk:'Hanken Grotesk',sans-serif;--font-fraunces:Fraunces,serif;--font-jetbrains-mono:'JetBrains Mono',monospace}
body{margin:0;background:rgb(${GREEN})}svg{display:block;width:${width}px;height:${height}px}</style>
${svg}`,
			{ waitUntil: 'load' },
		);
		await page.evaluate(async () => {
			// Animated charts: measure their finished frame
			document.querySelectorAll('.anim-live').forEach((layer) => layer.remove());
			document.querySelectorAll('.anim-still').forEach((layer) => layer.removeAttribute('display'));
			await document.fonts.ready;
		});
		const shot = await page.locator('svg').first().screenshot();
		const { data, info } = await sharp(shot).raw().toBuffer({ resolveWithObject: true });
		const at = (x, y) => {
			const i =
				(Math.min(info.height - 1, y) * info.width + Math.min(info.width - 1, x)) * info.channels;
			return [data[i], data[i + 1], data[i + 2]];
		};
		// The background: the commonest color in a thin ring just inside the edges (the panel or
		// color field; the bare page, green here, when there's no frame). When that color is only
		// a thin margin around the panels (under a quarter of the diagram), the commonest color overall
		const [rw, rh] = [info.width, info.height];
		const key = (px) => px.map((c) => c >> 5).join();
		const mode = (keep) => {
			const counts = new Map();
			for (let y = 0; y < rh; y += 2)
				for (let x = 0; x < rw; x += 2) {
					if (!keep(x, y)) continue;
					const k = key(at(x, y));
					counts.set(k, (counts.get(k) ?? 0) + 1);
				}
			return [...counts].reduce((a, b) => (b[1] > a[1] ? b : a))[0];
		};
		const inRing = (x, y) => {
			const edge = Math.min(x, y, rw - 1 - x, rh - 1 - y) / Math.min(rw, rh);
			return edge >= 0.02 && edge <= 0.045;
		};
		const pixelsOf = (k) => {
			const pixels = [];
			for (let y = 0; y < rh; y += 2)
				for (let x = 0; x < rw; x += 2) if (key(at(x, y)) === k) pixels.push(at(x, y));
			return pixels;
		};
		const edgeKey = mode(inRing);
		const bgPixels =
			pixelsOf(edgeKey).length / (Math.ceil(rw / 2) * Math.ceil(rh / 2)) >= 0.25
				? pixelsOf(edgeKey)
				: pixelsOf(mode(() => true));
		const bg = [0, 1, 2].map((i) => bgPixels.reduce((sum, px) => sum + px[i], 0) / bgPixels.length);
		const far = (px) => Math.hypot(px[0] - bg[0], px[1] - bg[1], px[2] - bg[2]) > 48; // paper grain stays under this
		// A spot's share of pixels that aren't background, with a margin around it
		const measure = (x0, y0, w, h) => {
			const pad = h * 0.35;
			let off = 0,
				total = 0;
			for (
				let y = Math.max(0, Math.floor(y0 - pad));
				y < Math.min(rh, Math.ceil(y0 + h + pad));
				y++
			)
				for (
					let x = Math.max(0, Math.floor(x0 - pad));
					x < Math.min(rw, Math.ceil(x0 + w + pad));
					x++
				) {
					total++;
					if (far(at(x, y))) off++;
				}
			return { busy: off / total };
		};

		const scaleX = info.width / width;
		// Every spot in the frame, nearest the bottom-right corner first, then bottom left, top right, top left
		const spots = (markW) => {
			const markH = (markW * MARK_HEIGHT) / MARK_WIDTH;
			const inset = markH * 0.5;
			const step = markH / 2;
			const corners = [
				[1, 1],
				[0, 1],
				[1, 0],
				[0, 0],
			];
			const all = [];
			for (let y = inset; y <= height - markH - inset; y += step)
				for (let x = inset; x <= width - markW - inset; x += step) {
					const right = x + markW / 2 > width / 2;
					const bottom = y + markH / 2 > height / 2;
					const rank = corners.findIndex(([r, b]) => r === +right && b === +bottom);
					const cx = right ? width - x - markW : x;
					const cy = bottom ? height - y - markH : y;
					all.push({ x, y, w: markW, order: rank * 1e6 + Math.hypot(cx, cy) });
				}
			return all.sort((a, b) => a.order - b.order);
		};
		const measured = (list) =>
			list.map((s) => ({
				...s,
				...measure(
					s.x * scaleX,
					s.y * scaleX,
					s.w * scaleX,
					((s.w * MARK_HEIGHT) / MARK_WIDTH) * scaleX,
				),
			}));
		// Full size, then smaller marks, then the least busy spot (listed for a look)
		let pick;
		for (const share of [MARK_SHARE, 0.045, 0.035])
			pick ??= measured(spots(width * share)).find((s) => s.busy < 0.01);
		if (!pick) {
			pick = measured(spots(width * MARK_SHARE)).sort((a, b) => a.busy - b.busy)[0];
			busy.push(`${file} (busy ${pick.busy.toFixed(2)})`);
		}

		const mark = jkMark(minX + pick.x, minY + pick.y, pick.w);
		const end = svg.lastIndexOf('</svg>');
		writeFileSync(file, svg.slice(0, end) + mark + svg.slice(end));
		marked++;
	}
} finally {
	await browser.close();
}
console.log(`marked ${marked} of ${files.length}`);
if (busy.length) console.log(`no clear corner, look at these:\n  ${busy.join('\n  ')}`);
