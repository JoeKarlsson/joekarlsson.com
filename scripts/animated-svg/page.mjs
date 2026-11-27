// Opens one of the site's animated SVGs (a diagram, chart or collage --post figure) in
// headless Chromium with its animations paused, so a tool can step it to any time t.
// The idea, a picture that is a pure function of time and can be checked frame by frame,
// is Lemo-Opuscar's (core/render/page.mjs, MIT, github.com/lemomo-ai/lemo-opuscar).
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

// The site's own faces, so text measures and looks as it does in a post.
const FONTS =
	'https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=block';

/**
 * Timeline of an SVG's SMIL animations, read from its markup.
 * `end` is when the last one finishes its first run; `loops` says whether any
 * animation other than a filter boil repeats forever, so the figure starts over.
 */
export function timeline(markup) {
	let end = 0;
	let loops = false;
	for (const [tag] of markup.matchAll(/<(?:animate|animateTransform|animateMotion|set)\b[^>]*>/g)) {
		const attr = (name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
		const seconds = (v) => (v?.endsWith('ms') ? parseFloat(v) / 1000 : parseFloat(v ?? '0') || 0);
		const begin = seconds(attr('begin'));
		const dur = seconds(attr('dur'));
		end = Math.max(end, begin + dur);
		// A boil re-seeds a filter forever; it never moves text, so it doesn't make the figure loop
		const boil = /attributeName="(seed|baseFrequency|scale)"/.test(tag);
		if (attr('repeatCount') === 'indefinite' && !boil) loops = true;
	}
	return { end, loops };
}

/** Launch Chromium with the SVG inline on a bare page, animations paused at 0. */
export async function openSvg(file, { scale = 1 } = {}) {
	const markup = readFileSync(file, 'utf8');
	const browser = await chromium.launch();
	const page = await browser.newPage({ deviceScaleFactor: scale });
	await page.setContent(
		`<!doctype html><html><head><link rel="stylesheet" href="${FONTS}"><style>
			body { margin: 0; background: #000; }
			svg { display: block; }
			.anim-still { display: none; }
		</style></head><body>${markup}</body></html>`,
		{ waitUntil: 'networkidle' },
	);
	await page.evaluate(() => document.fonts.ready);
	await page.evaluate(() => document.querySelector('svg').pauseAnimations());
	const size = await page.evaluate(() => {
		const r = document.querySelector('svg').getBoundingClientRect();
		return { width: r.width, height: r.height };
	});
	await page.setViewportSize({ width: Math.ceil(size.width), height: Math.ceil(size.height) });
	return { browser, page, markup, size, ...timeline(markup) };
}

/** Step the paused SVG to second t. */
export async function seek(page, t) {
	await page.evaluate((time) => document.querySelector('svg').setCurrentTime(time), t);
}
