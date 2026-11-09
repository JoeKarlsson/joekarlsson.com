#!/usr/bin/env node
// Turns a cut-paper diagram (scripts/diagrams) into a boiling 16:9 card thumbnail: an
// animated WebP named thumb-<hash>.webp so the live pink pass leaves it alone
// (isPretreatedThumbnail) and a redraw gets a new URL past the 30-day image cache. An
// animated image plays in every card and on iPhone with no card changes. Since the live
// pass skips it, each frame is graded black-to-pink here, the same tone as the site's flat
// filter, so it sits with the other cards.
//
//   node scripts/boiling-thumbnail.mjs <diagram.svg | frames dir> <output dir> [--view x,y,w,h]
//
// One SVG: the boil's three frames on the site's 0.5s loop. A directory of SVGs (an
// animation, like the self-solving Sudoku): one frame each, in name order, each with the
// next boil seed, the first and last held so the start and the finished state read.
// --view crops the diagram to a 16:9 window of its own coordinates, so a taller
// diagram can fill the card. Prints the new file's path.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

// Cards show at most about 700px wide, and every pixel counts in a many-frame animation
const WIDTH = 960;
const HEIGHT = 540;
// The boil in src/layouts/BaseLayout.astro: same filter, its three seeds, 1/6 s each
const SEEDS = [11, 22, 33];
const FRAME_MS = 167;
// An animation's frames: quick enough to read as motion, with a pause at each end
const STEP_MS = 220;
const FIRST_MS = 900;
const LAST_MS = 2400;
// The site's pink (src/scripts/halftone.ts INK)
const PINK = [0xff, 0x4f, 0xd8];
// Brightness that maps to full pink: the diagrams' chalk, the brightest thing they draw
const CHALK_LUMA = 0.299 * 0xec + 0.587 * 0xe6 + 0.114 * 0xda;

/** Black-to-pink, by brightness. Fixed levels, not per frame, so an animation doesn't flicker */
async function gradePink(file) {
	const { data, info } = await sharp(file)
		.removeAlpha()
		.greyscale()
		.raw()
		.toBuffer({ resolveWithObject: true });
	const out = Buffer.alloc(info.width * info.height * 3);
	for (let i = 0; i < data.length; i++) {
		const v = Math.min(1, data[i] / CHALK_LUMA);
		out[i * 3] = PINK[0] * v;
		out[i * 3 + 1] = PINK[1] * v;
		out[i * 3 + 2] = PINK[2] * v;
	}
	await sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } })
		.png()
		.toFile(file.replace(/\.png$/, '-pink.png'));
	return file.replace(/\.png$/, '-pink.png');
}

const [input, outDir, flag, view] = process.argv.slice(2);
if (!input || !outDir || (flag && flag !== '--view')) {
	console.error(
		'Usage: node scripts/boiling-thumbnail.mjs <diagram.svg | frames dir> <output dir> [--view x,y,w,h]',
	);
	process.exit(2);
}

/** A frame's SVG, cropped by --view and sized to the card */
function fit(svg) {
	let out = svg;
	if (view) {
		const [, , w, h] = view.split(',').map(Number);
		if (Math.abs(w / h - WIDTH / HEIGHT) > 0.01) throw new Error(`--view ${view} isn't 16:9`);
		out = out.replace(/viewBox="[^"]*"/, `viewBox="${view.replaceAll(',', ' ')}"`);
	}
	return out.replace(
		/(<svg\b[^>]*?) width="[^"]*" height="[^"]*"/,
		`$1 width="${WIDTH}" height="${HEIGHT}"`,
	);
}

const animation = statSync(input).isDirectory();
const svgs = animation
	? readdirSync(input)
			.filter((file) => file.endsWith('.svg'))
			.sort()
			.map((file) => readFileSync(join(input, file), 'utf8'))
	: [readFileSync(input, 'utf8')];
if (!svgs.length) throw new Error(`No .svg frames in ${input}`);
// [svg, boil seed, how long the frame shows]
const shots = animation
	? svgs.map((svg, i) => [
			svg,
			SEEDS[i % SEEDS.length],
			i === 0 ? FIRST_MS : i === svgs.length - 1 ? LAST_MS : STEP_MS,
		])
	: SEEDS.map((seed) => [svgs[0], seed, FRAME_MS]);

const page = `<!doctype html><html><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;700&family=JetBrains+Mono:wght@400;700&family=Fraunces&display=block">
<style>
	body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; background: #000; overflow: hidden; }
	svg { display: block; }
	:is(.d-flow, .d-callout, .d-paper) { filter: url(#boil); }
</style></head><body>
<svg width="0" height="0" style="position:absolute"><filter id="boil" x="-25%" y="-25%" width="150%" height="150%">
<feTurbulence id="noise" type="turbulence" baseFrequency="0.02" numOctaves="1" seed="${SEEDS[0]}" result="w"/>
<feDisplacementMap in="SourceGraphic" in2="w" scale="5"/></filter></svg>
<div id="stage"></div></body></html>`;

const work = mkdtempSync(join(tmpdir(), 'boiling-thumbnail-'));
const browser = await chromium.launch();
try {
	const tab = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
	await tab.setContent(page, { waitUntil: 'networkidle' });
	const frameArgs = [];
	for (const [i, [svg, seed, ms]] of shots.entries()) {
		await tab.evaluate(
			([markup, s]) => {
				document.getElementById('stage').innerHTML = markup;
				document.getElementById('noise').setAttribute('seed', String(s));
			},
			[fit(svg), seed],
		);
		await tab.evaluate(() => document.fonts.ready);
		await tab.waitForTimeout(150);
		const frame = join(work, `${String(i).padStart(3, '0')}.png`);
		await tab.screenshot({ path: frame });
		frameArgs.push('-d', String(ms), await gradePink(frame));
	}
	const animated = join(work, 'thumb.webp');
	execFileSync(
		'img2webp',
		['-loop', '0', '-min_size', '-lossy', '-q', '75', ...frameArgs, '-o', animated],
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
