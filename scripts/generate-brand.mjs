#!/usr/bin/env node
/**
 * Draws Joe's off-register logo into brand/logo/ (plus the site favicons in public/): pink
 * Anton letters with a hand-wobbled outline knocked up and left, like a misprint.
 *
 * Letters are real outlines from brand/source/Anton-Regular.ttf, not <text>, so every file
 * renders the same anywhere (an <img>, a slide, a PNG) with no font installed.
 *
 * Output, for each style x mark x theme:
 *   brand/logo/svg/{style}/{mark}-{theme}.svg             static, one wobble frame
 *   brand/logo/svg/{style}/{mark}-{theme}-animated.svg    boils (SMIL; plays in browsers and <img>)
 *   brand/logo/png/{style}/{mark}-{theme}.png             static
 *   brand/logo/animated/{style}/{mark}-{theme}.webp       animated, for slides, READMEs, chat
 *   brand/logo/animated/{style}/{mark}-on-{black,pink}.gif  the same as GIF, solid backgrounds only
 * And public/favicon.svg, favicon.ico, favicon-{16,32,192,512}.png, apple-touch-icon.png.
 *
 * Rasters are drawn in headless Chromium, not sharp: librsvg works the wobble out in output
 * pixels, so a big PNG came out spiky. Chromium wobbles in the logo's own units, like the site.
 *
 * Usage: node scripts/generate-brand.mjs   (or npm run brand)
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { create } from 'fontkitten';
import { chromium } from 'playwright';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = join(ROOT, 'brand/logo');
const PINK = '#ff4fd8';
const font = create(readFileSync(join(ROOT, 'brand/source/Anton-Regular.ttf')));

// Everything is measured in a space where the capitals are 100 units tall
const CAP = 100;
const SCALE = CAP / font.capHeight;

// fontkit paths are absolute M/L/Q/C/Z in font units (y up). Move each point to x, flip y
// onto a baseline at CAP, and scale to cap units.
export function glyphPath(svgPath, x) {
	const tokens = svgPath.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
	let out = '';
	let pair = [];
	for (const token of tokens) {
		if (/[A-Za-z]/.test(token)) {
			if (!'MLQCZ'.includes(token)) throw new Error(`Unexpected path command ${token}`);
			out += token;
			continue;
		}
		pair.push(Number(token));
		if (pair.length === 2) {
			const px = x + pair[0] * SCALE;
			const py = CAP - pair[1] * SCALE;
			out += `${+px.toFixed(2)} ${+py.toFixed(2)} `;
			pair = [];
		}
	}
	return out.trim();
}

// One line of text as a single path, caps 0..CAP tall, starting at x = 0
function textPath(text) {
	let x = 0;
	let d = '';
	for (const char of text) {
		const glyph = font.glyphForCodePoint(char.codePointAt(0));
		if (!glyph.id) throw new Error(`Anton has no glyph for "${char}"`);
		d += glyphPath(glyph.path.toSVG(), x) + ' ';
		x += glyph.advanceWidth * SCALE;
	}
	return { d: d.trim(), width: x };
}

// Scales a path's coordinates by k around the origin, then shifts it down by dy
function scalePath(d, k, dy = 0) {
	let i = 0;
	return d.replace(/-?\d*\.?\d+(?:e-?\d+)?/g, (n) => {
		const v = Number(n) * k + (i++ % 2 ? dy : 0);
		return String(+v.toFixed(2));
	});
}

// The marks, each as { d, width, height }
const MARKS = {
	jk: () => {
		const { d, width } = textPath('JK');
		return { d, width, height: CAP };
	},
	name: () => {
		const { d, width } = textPath('JOE KARLSSON');
		return { d, width, height: CAP };
	},
	// JOE over KARLSSON, both the same width
	stacked: () => {
		const top = textPath('JOE');
		const bottom = textPath('KARLSSON');
		const k = bottom.width / top.width;
		const gap = 16;
		const topHeight = CAP * k;
		return {
			d: `${scalePath(top.d, k)} ${scalePath(bottom.d, 1, topHeight + gap)}`,
			width: bottom.width,
			height: topHeight + gap + CAP,
		};
	},
};

// fill: the letters. line: the knocked-off outline. bg: null for transparent.
const THEMES = {
	'on-black': { bg: '#000', fill: PINK, line: '#fff', sparkle: PINK },
	'on-pink': { bg: PINK, fill: '#000', line: '#000', sparkle: '#000' },
	'for-dark': { bg: null, fill: PINK, line: '#fff', sparkle: PINK }, // transparent, dark surfaces
	'for-light': { bg: null, fill: PINK, line: '#000', sparkle: PINK }, // transparent, light surfaces
};

// 22 is the pick; the others are the riffs on it Joe liked (31/33 heavier and looser, 36 sparkles)
const STYLES = {
	'off-register': { stroke: 3.4, shift: [-5.6, -4.5], wobble: 4.5, frequency: 0.031 },
	'off-register-sparkles': {
		stroke: 3.4,
		shift: [-5.6, -4.5],
		wobble: 4.5,
		frequency: 0.031,
		sparkles: true,
	},
	'heavy-wobble': { stroke: 6.7, shift: [-5.6, -4.5], wobble: 10, frequency: 0.022 },
};

const SPARKLE = 'M0 -10 C1 -3 3 -1 10 0 C3 1 1 3 0 10 C-1 3 -3 1 -10 0 C-3 -1 -1 -3 0 -10Z';
const SEEDS = [1, 4, 8];

/**
 * One logo as an SVG string. frame picks a fixed wobble seed (static); animated cycles all
 * three seeds the way the site's links boil. square centres the mark in a square (icons).
 */
function logoSvg({
	mark,
	theme,
	style = 'off-register',
	animated = false,
	frame = 0,
	square = false,
	strokeOverride,
}) {
	const m = MARKS[mark]();
	const t = THEMES[theme];
	const s = STYLES[style];
	const stroke = strokeOverride ?? s.stroke;
	const pad = s.sparkles ? 26 : 14;
	let w = m.width + pad * 2;
	let h = m.height + pad * 2;
	let ox = pad;
	let oy = pad;
	if (square) {
		const side = Math.max(w, h);
		ox += (side - w) / 2;
		oy += (side - h) / 2;
		w = h = side;
	}
	const turbulence = animated
		? `<feTurbulence type="fractalNoise" baseFrequency="${s.frequency}" numOctaves="2" seed="${SEEDS[0]}"><animate attributeName="seed" values="${SEEDS.join(';')}" dur="0.36s" calcMode="discrete" repeatCount="indefinite"/></feTurbulence>`
		: `<feTurbulence type="fractalNoise" baseFrequency="${s.frequency}" numOctaves="2" seed="${SEEDS[frame]}"/>`;
	const sparkles = s.sparkles
		? [
				[-8, -6, 1.1],
				[m.width + 10, -8, 0.8],
				[m.width + 12, m.height + 6, 0.6],
			]
				.map(([x, y, k], i) => {
					const pulse = animated
						? `<animateTransform attributeName="transform" type="scale" additive="sum" values="1;0.45;1" dur="1.8s" begin="${i * 0.6}s" repeatCount="indefinite"/>`
						: '';
					return `<g transform="translate(${+x.toFixed(1)} ${+y.toFixed(1)}) scale(${k})"><path d="${SPARKLE}" fill="${t.sparkle}">${pulse}</path></g>`;
				})
				.join('')
		: '';
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${+w.toFixed(1)} ${+h.toFixed(1)}" width="${Math.round(w)}" height="${Math.round(h)}">
<title>Joe Karlsson</title>
<defs><filter id="wobble" x="-10%" y="-10%" width="120%" height="120%">${turbulence}<feDisplacementMap in="SourceGraphic" scale="${s.wobble}"/></filter></defs>
${t.bg ? `<rect width="100%" height="100%" fill="${t.bg}"/>` : ''}<g transform="translate(${+ox.toFixed(1)} ${+oy.toFixed(1)})">
<path d="${m.d}" fill="${t.fill}"/>
<path d="${m.d}" fill="none" stroke="${t.line}" stroke-width="${stroke}" stroke-linejoin="round" transform="translate(${s.shift.join(' ')})" filter="url(#wobble)"/>
${sparkles}</g>
</svg>
`;
}

// An .ico holding PNG images (Vista onward and every browser read PNG entries): a 6-byte
// header, a 16-byte directory entry per image, then the images back to back
export function toIco(pngs, sizes) {
	const header = Buffer.alloc(6 + 16 * pngs.length);
	header.writeUInt16LE(0, 0);
	header.writeUInt16LE(1, 2); // 1 = icon
	header.writeUInt16LE(pngs.length, 4);
	let offset = header.length;
	pngs.forEach((png, i) => {
		const entry = 6 + 16 * i;
		header.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], entry); // 0 means 256
		header.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], entry + 1);
		header.writeUInt16LE(1, entry + 4); // colour planes
		header.writeUInt16LE(32, entry + 6); // bits per pixel
		header.writeUInt32LE(png.length, entry + 8);
		header.writeUInt32LE(offset, entry + 12);
		offset += png.length;
	});
	return Buffer.concat([header, ...pngs]);
}

// PNG widths per mark: big enough for slides and print-ish use
const PNG_WIDTH = { jk: 1024, name: 2000, stacked: 1200 };
const ANIMATED_WIDTH = { jk: 400, name: 900, stacked: 600 };

let page;
// The SVG drawn at `width` px wide in Chromium, as a PNG buffer (transparent where it has no bg)
async function rasterize(svg, width) {
	const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
	const height = Math.round((width * h) / w);
	await page.setViewportSize({ width, height });
	await page.setContent(
		`<body style="margin:0">${svg.replace(/width="\d+" height="\d+"/, `width="${width}" height="${height}"`)}`,
	);
	return page.screenshot({ omitBackground: true });
}

async function animatedFrames(options, width) {
	const frames = [];
	for (const frame of SEEDS.keys())
		frames.push(await rasterize(logoSvg({ ...options, frame }), width));
	return sharp(frames, { join: { animated: true } });
}

const STYLE_NOTES = {
	'off-register': 'The logo (round-four pick 22). Use this one unless there is a reason not to.',
	'off-register-sparkles':
		'22 with twinkling sparkles (36). For fun spots: stickers, sign-offs, celebration posts.',
	'heavy-wobble': 'Thick, loose outline (33). Reads at a distance: posters, video end cards.',
};
const THEME_NOTES = {
	'on-black': 'on black',
	'on-pink': 'on pink',
	'for-dark': 'transparent, for dark backgrounds',
	'for-light': 'transparent, for light backgrounds',
};

// brand/index.html: every logo, animated, with links to each format. Open it from disk.
function galleryHtml() {
	const card = (style, mark, theme) => {
		const name = `${mark}-${theme}`;
		const transparent = !THEMES[theme].bg;
		const links = [
			[`logo/svg/${style}/${name}.svg`, 'SVG'],
			[`logo/svg/${style}/${name}-animated.svg`, 'animated SVG'],
			[`logo/png/${style}/${name}.png`, `PNG ${PNG_WIDTH[mark]}px`],
			[`logo/animated/${style}/${name}.webp`, 'animated WebP'],
			...(transparent ? [] : [[`logo/animated/${style}/${name}.gif`, 'GIF']]),
		];
		return `<figure class="${transparent ? `t ${theme}` : ''}"><div class="pv"><img src="logo/svg/${style}/${name}-animated.svg" alt="Joe Karlsson logo, ${mark}, ${THEME_NOTES[theme]}"></div>
<figcaption><b>${name}</b> ${THEME_NOTES[theme]}<br>${links.map(([href, label]) => `<a href="${href}">${label}</a>`).join(' · ')}</figcaption></figure>`;
	};
	const sections = Object.keys(STYLES)
		.map(
			(style) => `<section><h2>${style}</h2><p>${STYLE_NOTES[style]}</p>
${Object.keys(MARKS)
	.map(
		(mark) =>
			`<div class="row ${mark}">${Object.keys(THEMES)
				.map((theme) => card(style, mark, theme))
				.join('')}</div>`,
	)
	.join('\n')}</section>`,
		)
		.join('\n');
	return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Joe Karlsson Logos</title>
<!-- Generated by scripts/generate-brand.mjs. Edit the script, not this file. -->
<style>
body { margin: 0; padding: 40px 16px 80px; background: #111; color: #ededed; font: 15px/1.5 system-ui, sans-serif; }
main { max-width: 1200px; margin: 0 auto; }
h1 { font-size: 40px; margin: 0 0 4px; } h2 { margin: 48px 0 0; color: ${PINK}; } p { color: #a3a3a3; margin: 4px 0 16px; }
a { color: ${PINK}; }
.row { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; margin-bottom: 16px; }
.row.name, .row.stacked { grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); }
figure { margin: 0; background: #1c1c1c; border: 1px solid #2a2a2a; border-radius: 4px; overflow: hidden; }
.pv { display: grid; place-items: center; height: 180px; padding: 16px; }
.pv img { max-width: 100%; max-height: 100%; }
.for-dark .pv { background: repeating-conic-gradient(#000 0 25%, #1a1a1a 0 50%) 0 0 / 20px 20px; }
.for-light .pv { background: repeating-conic-gradient(#fff 0 25%, #e8e8e8 0 50%) 0 0 / 20px 20px; }
figcaption { padding: 10px 12px; font-size: 13px; color: #a3a3a3; } figcaption b { color: #ededed; }
.icons { display: flex; gap: 16px; align-items: end; } .icons img { image-rendering: pixelated; }
</style></head><body><main>
<h1>Joe Karlsson logos</h1>
<p>Pink Anton letters with a hand-wobbled outline knocked up and left, like a misprint. Pink is ${PINK}, ink is #000, paper is #ededed. Regenerate everything with <code>npm run brand</code>. The rounds of options that led here are in <a href="explorations/round-1.html">round 1</a>, <a href="explorations/round-2.html">2</a>, <a href="explorations/round-3.html">3</a> and <a href="explorations/round-4.html">4</a>.</p>
<h2>Favicons</h2><p>Written to public/ by the same script.</p>
<div class="icons"><img src="../public/favicon-512x512.png" width="128" alt="Favicon, 512px"><img src="../public/favicon-32x32.png" width="64" alt="Favicon, 32px"><img src="../public/favicon-16x16.png" width="32" alt="Favicon, 16px"></div>
${sections}
</main></body></html>
`;
}

async function main() {
	const browser = await chromium.launch();
	page = await browser.newPage();
	let count = 0;
	for (const style of Object.keys(STYLES)) {
		for (const dir of ['svg', 'png', 'animated'])
			mkdirSync(join(OUT, dir, style), { recursive: true });
		for (const mark of Object.keys(MARKS)) {
			for (const theme of Object.keys(THEMES)) {
				const name = `${mark}-${theme}`;
				const options = { mark, theme, style };
				writeFileSync(join(OUT, 'svg', style, `${name}.svg`), logoSvg(options));
				writeFileSync(
					join(OUT, 'svg', style, `${name}-animated.svg`),
					logoSvg({ ...options, animated: true }),
				);
				await sharp(await rasterize(logoSvg(options), PNG_WIDTH[mark])).toFile(
					join(OUT, 'png', style, `${name}.png`),
				);
				// Three wobble frames, 120ms each, like the site's boil. Sparkles hold still here.
				const frames = await animatedFrames(options, ANIMATED_WIDTH[mark]);
				const timing = { delay: [120, 120, 120], loop: 0 };
				await frames
					.clone()
					.webp(timing)
					.toFile(join(OUT, 'animated', style, `${name}.webp`));
				count += 4;
				if (THEMES[theme].bg) {
					await frames.gif(timing).toFile(join(OUT, 'animated', style, `${name}.gif`));
					count += 1;
				}
			}
		}
	}

	// Favicons: the JK on black, edge to edge, with an outline heavy enough to survive 16px
	const favicon = logoSvg({ mark: 'jk', theme: 'on-black', square: true, strokeOverride: 4.2 });
	writeFileSync(join(ROOT, 'public/favicon.svg'), favicon);
	for (const [file, size] of [
		['favicon-16x16', 16],
		['favicon-32x32', 32],
		['apple-touch-icon', 180],
		['favicon-192x192', 192],
		['favicon-512x512', 512],
	]) {
		await sharp(await rasterize(favicon, size)).toFile(join(ROOT, 'public', `${file}.png`));
	}
	// /favicon.ico, for RSS readers and clients that fetch it without reading the link tags
	const icoSizes = [16, 32, 48];
	const icoPngs = [];
	for (const size of icoSizes) icoPngs.push(await rasterize(favicon, size));
	writeFileSync(join(ROOT, 'public/favicon.ico'), toIco(icoPngs, icoSizes));
	await browser.close();
	writeFileSync(join(ROOT, 'brand/index.html'), galleryHtml());
	console.log(`Wrote ${count} logo files to brand/logo/ and the favicons to public/`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
