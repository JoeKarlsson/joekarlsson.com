// Draws YouTube thumbnails in the "concept" look Joe picked on 2026-11-09: Joe cut out of a video
// frame in natural color, a prop that shows the talk's idea on a paper stage, a short hook in Anton,
// an era-colored backdrop, and an optional pink event chip, all on a 1280x720 grid with 48px margins.
// The face column and prop column swap when Joe is turned left, so he faces the prop.
//
// Usage: npm run youtube:thumbnail -- <cards.json> <out dir>
// cards.json is an array of cards (paths relative to the file):
//   slug       output name (<slug>.png)
//   frame      the video still Joe is cut from
//   face       [x, y, w, h] of his face in the frame, as fractions
//   clip       [x0, y0, x1, y1] the part of the frame to cut from (a webcam corner), default whole frame
//   faceSide   "left" | "right": the side of the card his face goes on
//   hook       2-4 words, <em> for the pink word; hookSize in px (default 96)
//   bg         [inner, outer] radial backdrop colors for the era
//   stage      HTML positioned inside a 560x380 box under the hook (the prop); @@MARKS@@ is
//              replaced by stageMarks: [[markName, "pink"|"chalk", css, width], ...]
//   chip       the event, on a pink label in the top corner (optional)
//   arrow      false to drop the pink arrow from Joe to the prop
// Needs macOS: the cutout is Apple Vision person segmentation (scripts/youtube-thumbnail-cutout.swift,
// compiled on first run).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { MARKS, CHALK } from '../src/data/scribbles.ts';

const W = 1280;
const H = 720;
const M = 48; // margin on every side
const COL = (W - 3 * M) / 2; // two equal columns with a gutter: 568px
const STAGE = { w: 560, h: 380, top: 240 }; // the prop box, under the hook
const HEAD = 460; // head height on the card
const CROWN = 110; // room above his head
const PINK = '#ff4fd8';
const CUTOUT_SRC = new URL('./youtube-thumbnail-cutout.swift', import.meta.url).pathname;
const CUTOUT_BIN = path.join(os.homedir(), '.cache', 'joekarlsson', 'youtube-thumbnail-cutout');

function cutoutBinary() {
	const stale =
		!fs.existsSync(CUTOUT_BIN) || fs.statSync(CUTOUT_BIN).mtimeMs < fs.statSync(CUTOUT_SRC).mtimeMs;
	if (stale) {
		fs.mkdirSync(path.dirname(CUTOUT_BIN), { recursive: true });
		execFileSync('swiftc', ['-O', CUTOUT_SRC, '-o', CUTOUT_BIN]);
	}
	return CUTOUT_BIN;
}

/**
 * The segmentation mask can leave holes inside Joe (teeth, eyes, inside headphones). Anything the
 * background can't reach by flooding in from the edges is enclosed: fill small enclosed holes and
 * any on his face, and leave big ones (real background seen through him). Returns a new alpha.
 * faceBox is [cx, cy, rx, ry], an ellipse in pixels.
 */
export function fillHoles(alpha, w, h, faceBox) {
	const outside = new Uint8Array(w * h);
	const stack = [];
	const push = (i) => {
		if (!outside[i] && alpha[i] < 128) {
			outside[i] = 1;
			stack.push(i);
		}
	};
	for (let x = 0; x < w; x++) {
		push(x);
		push((h - 1) * w + x);
	}
	for (let y = 0; y < h; y++) {
		push(y * w);
		push(y * w + w - 1);
	}
	while (stack.length) {
		const i = stack.pop();
		const x = i % w;
		if (x > 0) push(i - 1);
		if (x < w - 1) push(i + 1);
		if (i >= w) push(i - w);
		if (i < w * (h - 1)) push(i + w);
	}
	const solid = Buffer.from(alpha);
	const seen = new Uint8Array(w * h);
	const maxHole = w * h * 0.0003;
	for (let start = 0; start < w * h; start++) {
		if (seen[start] || outside[start] || alpha[start] >= 128) continue;
		const region = [start];
		seen[start] = 1;
		for (let k = 0; k < region.length; k++) {
			const i = region[k];
			const x = i % w;
			for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
				if (j >= 0 && j < w * h && !seen[j] && !outside[j] && alpha[j] < 128) {
					seen[j] = 1;
					region.push(j);
				}
			}
		}
		let sx = 0;
		let sy = 0;
		for (const i of region) {
			sx += i % w;
			sy += Math.floor(i / w);
		}
		const onFace =
			faceBox &&
			((sx / region.length - faceBox[0]) / faceBox[2]) ** 2 +
				((sy / region.length - faceBox[1]) / faceBox[3]) ** 2 <=
				1;
		if (region.length <= maxHole || onFace) for (const i of region) solid[i] = 255;
	}
	return solid;
}

/** Joe cut out of the frame, scaled so his head is HEAD px tall with his face centered on faceX. */
async function person(card, dir, tmp, faceX) {
	const frame = path.resolve(dir, card.frame);
	const meta = await sharp(frame).metadata();
	const [fx, fy, fw, fh] = card.face;
	const [cx0, cy0, cx1, cy1] = card.clip ?? [0, 0, 1, 1];
	const scale = HEAD / (fh * meta.height * 1.45);
	const left = (fx + fw / 2) * meta.width - faceX / scale;
	const top = fy * meta.height - fh * meta.height * 0.4 - CROWN / scale;
	const clip = {
		left: Math.round(cx0 * meta.width),
		top: Math.round(cy0 * meta.height),
		width: Math.round((cx1 - cx0) * meta.width),
		height: Math.round((cy1 - cy0) * meta.height),
	};
	const webcamFile = path.join(tmp, 'webcam.png');
	const personFile = path.join(tmp, 'person.png');
	const webcam = await sharp(frame)
		.extract(clip)
		.resize(Math.round(clip.width * scale), Math.round(clip.height * scale), { kernel: 'lanczos3' })
		.modulate({ brightness: 1.08 })
		.sharpen({ sigma: 0.8 })
		.png()
		.toFile(webcamFile);
	execFileSync(cutoutBinary(), [webcamFile, personFile]);
	const { data: alpha, info } = await sharp(personFile)
		.extractChannel(3)
		.raw()
		.toBuffer({ resolveWithObject: true });
	const faceBox = [
		((fx + fw / 2) * meta.width - clip.left) * scale,
		((fy + fh * 0.55) * meta.height - clip.top) * scale,
		fw * meta.width * scale * 0.42,
		fh * meta.height * scale * 0.5,
	];
	const solid = fillHoles(alpha, info.width, info.height, faceBox);
	const rgb = await sharp(webcamFile).removeAlpha().raw().toBuffer();
	const png = await sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } })
		.joinChannel(solid, { raw: { width: info.width, height: info.height, channels: 1 } })
		.png()
		.toBuffer();
	return {
		uri: `data:image/png;base64,${png.toString('base64')}`,
		x: (clip.left - left) * scale,
		y: (clip.top - top) * scale,
		w: webcam.width,
		h: webcam.height,
	};
}

function mark(name, color, style, width = 9, flip = false) {
	const m = MARKS[name];
	const c = color === 'pink' ? PINK : CHALK;
	return `<svg class="mk" viewBox="${m.viewBox}" preserveAspectRatio="${m.stretch ? 'none' : 'xMidYMid meet'}" style="${style}${flip ? ';transform:scaleX(-1)' : ''}"><path d="${m.path}" stroke="#000" stroke-width="${width + 6}" opacity=".5"/><path d="${m.path}" stroke="${c}" stroke-width="${width}"/></svg>`;
}

function html(card, p, faceLeft) {
	const faceColX = faceLeft ? M : M * 2 + COL;
	const propColX = faceLeft ? M * 2 + COL : M;
	const stageX = propColX + (COL - STAGE.w) / 2;
	const arrowX = M + COL - 70; // in the gutter, pointing from Joe to the prop
	const stageMarks = (card.stageMarks ?? []).map(([n, c, st, w]) => mark(n, c, st, w)).join('');
	return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@700;800&family=Courier+Prime:wght@700&display=block">
<style>
* { box-sizing: border-box; margin: 0; }
body { width: ${W}px; height: ${H}px; overflow: hidden; position: relative; font-family: 'Hanken Grotesk';
  background: radial-gradient(circle at ${faceColX + COL / 2}px 330px, ${card.bg[0]} 0%, ${card.bg[1]} 70%); }
.person { position: absolute; left: ${p.x}px; top: ${p.y}px; width: ${p.w}px; height: ${p.h}px; z-index: 3; filter: drop-shadow(0 18px 24px rgba(0,0,0,.55)); }
.hook { position: absolute; left: ${propColX}px; width: ${COL}px; top: ${M}px; z-index: 6; text-align: center; font: 400 ${card.hookSize ?? 96}px/.92 Anton; text-transform: uppercase; color: #fff; -webkit-text-stroke: 4px #000; paint-order: stroke fill; text-shadow: 0 5px 0 #000; }
.hook em { font-style: normal; color: ${PINK}; }
.stage { position: absolute; left: ${stageX}px; top: ${STAGE.top}px; width: ${STAGE.w}px; height: ${STAGE.h}px; z-index: 2; }
.stage > * { position: absolute; }
.paper { background: #f4efe4; color: #111; box-shadow: 0 10px 0 rgba(0,0,0,.45); }
.tape { position: absolute; width: 110px; height: 34px; background: rgba(236,230,218,.8); }
.sticker { border-radius: 50%; background: #fff; display: grid; place-items: center; box-shadow: 0 6px 0 rgba(0,0,0,.5); z-index: 4; }
.chip { position: absolute; ${faceLeft ? 'left' : 'right'}: ${M}px; top: ${M}px; z-index: 6; font: 400 34px/1 Anton; letter-spacing: .04em; text-transform: uppercase; color: #000; background: ${PINK}; padding: 8px 14px 6px; transform: rotate(-2deg); }
.mk { position: absolute; overflow: visible; z-index: 5; }
.mk path { fill: none; stroke-linecap: round; stroke-linejoin: round; filter: url(#crayon); }
</style></head><body>
<svg width="0" height="0" style="position:absolute"><filter id="crayon" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter></svg>
<div class="stage">${card.stage.replace('@@MARKS@@', stageMarks)}</div>
<img class="person" src="${p.uri}">
${card.chip ? `<div class="chip">${card.chip}</div>` : ''}
<div class="hook">${card.hook}</div>
${card.arrow === false ? '' : mark('arrow', 'pink', `left:${arrowX}px;top:480px;width:180px;height:120px`, 12, !faceLeft)}
</body></html>`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const [cardsFile, outDir] = process.argv.slice(2);
	if (!cardsFile || !outDir) {
		throw new Error('Usage: npm run youtube:thumbnail -- <cards.json> <out dir>');
	}
	const { chromium } = await import('playwright');
	const dir = path.dirname(path.resolve(cardsFile));
	const cards = JSON.parse(fs.readFileSync(cardsFile, 'utf8'));
	fs.mkdirSync(outDir, { recursive: true });
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: W, height: H } });
	for (const card of cards) {
		const faceLeft = (card.faceSide ?? 'left') === 'left';
		const faceX = faceLeft ? M + COL / 2 : M * 2 + COL + COL / 2;
		const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'youtube-thumbnail-'));
		const p = await person(card, dir, tmp, faceX);
		await page.setContent(html(card, p, faceLeft), { waitUntil: 'networkidle' });
		await page.evaluate(() => document.fonts.ready);
		const out = path.join(outDir, `${card.slug}.png`);
		await page.screenshot({ path: out });
		fs.rmSync(tmp, { recursive: true });
		console.log(out);
	}
	await browser.close();
}
