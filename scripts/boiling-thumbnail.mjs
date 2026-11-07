#!/usr/bin/env node
// Turns a cut-paper diagram (scripts/diagrams) into a boiling 16:9 card thumbnail: an
// animated WebP of the boil's three frames on the site's 0.5s loop, named
// thumb-<hash>.webp so the live pink pass leaves it alone (isPretreatedThumbnail) and a
// redraw gets a new URL past the 30-day image cache. An animated image plays in every
// card and on iPhone with no card changes.
//
//   node scripts/boiling-thumbnail.mjs <diagram.svg> <output dir> [--view x,y,w,h]
//
// --view crops the diagram to a 16:9 window of its own coordinates, so a taller
// diagram can fill the card. Prints the new file's path.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const WIDTH = 1200;
const HEIGHT = 675;
// The boil in src/layouts/BaseLayout.astro: same filter, its three seeds, 1/6 s each
const SEEDS = [11, 22, 33];
const FRAME_MS = 167;

const [svgPath, outDir, flag, view] = process.argv.slice(2);
if (!svgPath || !outDir || (flag && flag !== '--view')) {
	console.error(
		'Usage: node scripts/boiling-thumbnail.mjs <diagram.svg> <output dir> [--view x,y,w,h]',
	);
	process.exit(2);
}
let svg = readFileSync(svgPath, 'utf8');
if (view) {
	const [, , w, h] = view.split(',').map(Number);
	if (Math.abs(w / h - WIDTH / HEIGHT) > 0.01) throw new Error(`--view ${view} isn't 16:9`);
	svg = svg.replace(/viewBox="[^"]*"/, `viewBox="${view.replaceAll(',', ' ')}"`);
}
svg = svg.replace(
	/(<svg\b[^>]*?) width="[^"]*" height="[^"]*"/,
	`$1 width="${WIDTH}" height="${HEIGHT}"`,
);

const page = `<!doctype html><html><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;700&family=JetBrains+Mono&family=Fraunces&display=block">
<style>
	body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; background: #000; overflow: hidden; }
	svg { display: block; }
	:is(.d-flow, .d-callout, .d-paper) { filter: url(#boil); }
</style></head><body>
<svg width="0" height="0" style="position:absolute"><filter id="boil" x="-25%" y="-25%" width="150%" height="150%">
<feTurbulence id="noise" type="turbulence" baseFrequency="0.02" numOctaves="1" seed="${SEEDS[0]}" result="w"/>
<feDisplacementMap in="SourceGraphic" in2="w" scale="5"/></filter></svg>
${svg}</body></html>`;

const work = mkdtempSync(join(tmpdir(), 'boiling-thumbnail-'));
const browser = await chromium.launch();
try {
	const tab = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
	await tab.setContent(page, { waitUntil: 'networkidle' });
	await tab.evaluate(() => document.fonts.ready);
	const frames = [];
	for (const seed of SEEDS) {
		await tab.evaluate(
			(s) => document.getElementById('noise').setAttribute('seed', String(s)),
			seed,
		);
		await tab.waitForTimeout(150);
		const frame = join(work, `${seed}.png`);
		await tab.screenshot({ path: frame });
		frames.push(frame);
	}
	const animated = join(work, 'thumb.webp');
	execFileSync(
		'img2webp',
		['-loop', '0', '-lossy', '-q', '80', '-d', String(FRAME_MS), ...frames, '-o', animated],
		{
			stdio: 'ignore',
		},
	);
	const hash = createHash('sha256').update(readFileSync(animated)).digest('hex').slice(0, 8);
	mkdirSync(outDir, { recursive: true });
	const out = join(outDir, `thumb-${hash}.webp`);
	renameSync(animated, out);
	console.log(out);
} finally {
	await browser.close();
	rmSync(work, { recursive: true, force: true });
}
