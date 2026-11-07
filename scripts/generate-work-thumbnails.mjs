#!/usr/bin/env node
/**
 * Draws the thumbnail for each post I wrote for an employer: public/images/blog/{slug}/thumb-<hash>.webp,
 * set as the post's heroImage (so it is also the post's header and og:image).
 *
 * Every card is a picture, never text. scripts/work-thumbnail-plan.json says, per post, which
 * picture and how to treat it:
 * - picture: one of
 *     { "photo": "<Wikimedia Commons file URL>", "credit": "<Commons page URL>" }  public domain only
 *     { "image": "/images/blog/..." }    a meme or photo already in the post
 *     { "video": "/images/blog/....mp4", "at": 1.2 }   a frame from a reaction GIF (shipped as MP4)
 * - look: "halftone" (pink dots), "flat" (pink and black), "taped" (flat pink, printed and taped onto
 *   black at a tilt)
 * - focus: where to crop a tall picture to 16:9, 0 (top) to 1 (bottom), default 0.5
 * - whole: true keeps a taped picture uncropped (memes, so the caption survives); the print takes its shape
 * - ring: [left, top, width, height] in % of the picture, a crayon ring around the detail
 * - mark: { "name": <MARKS key>, "at": [left, top, width, height] in % of the card, "color": "pink"|"chalk" }
 * - tilt: degrees for a taped print
 * - alt: what the picture shows, used as heroAlt
 *
 * The cards are already pink, so the site's live pink pass skips them:
 * see isPretreatedThumbnail() in src/utils/halftone.ts, which keys on the thumb-<hash>.webp name.
 *
 * Commons photos are downloaded once into media-sources/work-thumbnails/ (git-ignored).
 *
 * Usage:
 *   node scripts/generate-work-thumbnails.mjs            # every post in the plan
 *   node scripts/generate-work-thumbnails.mjs <slug...>  # these posts
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { setFrontmatterFields } from './issue-card-content.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const PLAN = JSON.parse(readFileSync(join(ROOT, 'scripts/work-thumbnail-plan.json'), 'utf8'));
const CACHE = join(ROOT, 'media-sources/work-thumbnails');
const WIDTH = 1200;
const HEIGHT = 675;
const PINK = [255, 0x4f, 0xd8];
const COLORS = { pink: '#ff4fd8', chalk: '#ece6da' };
// The largest a taped print's picture gets, inside the card
const PRINT_BOX = [880, 520];
const LOOKS = new Set(['halftone', 'flat', 'taped']);
// Images are cached for 30 days, so a redrawn card needs a new URL: the name carries a hash of its bytes
const thumbPath = (slug, webp) =>
	`/images/blog/${slug}/thumb-${createHash('sha256').update(webp).digest('hex').slice(0, 8)}.webp`;

async function download(url, file) {
	const response = await fetch(url, {
		headers: { 'User-Agent': 'joekarlsson.com thumbnail generator' },
	});
	if (!response.ok) throw new Error(`${response.status} downloading ${url}`);
	mkdirSync(CACHE, { recursive: true });
	writeFileSync(file, Buffer.from(await response.arrayBuffer()));
}

/** The picture as an image buffer */
async function pictureBuffer(slug, picture) {
	if (picture.photo) {
		const file = join(CACHE, `${slug}.jpg`);
		if (!existsSync(file)) await download(picture.photo, file);
		return readFileSync(file);
	}
	if (picture.image) return readFileSync(join(ROOT, 'public', picture.image));
	if (picture.video) {
		const frame = execFileSync(
			'ffmpeg',
			[
				'-v',
				'error',
				'-ss',
				String(picture.at ?? 0),
				'-i',
				join(ROOT, 'public', picture.video),
				'-frames:v',
				'1',
				'-f',
				'image2pipe',
				'-vcodec',
				'png',
				'-',
			],
			{ maxBuffer: 64 * 1024 * 1024 },
		);
		if (!frame.length) throw new Error(`${slug}: no frame at ${picture.at}s in ${picture.video}`);
		return frame;
	}
	throw new Error(`${slug}: picture needs photo, image or video`);
}

/** Crops to 16:9 around the focus line and scales to the card */
async function cropToCard(sharp, buffer, focus = 0.5, width = WIDTH, height = HEIGHT) {
	const image = sharp(buffer).rotate();
	const { width: w, height: h } = await image.metadata();
	const targetH = Math.round((w * height) / width);
	const region =
		targetH <= h
			? { left: 0, top: Math.round((h - targetH) * focus), width: w, height: targetH }
			: (() => {
					const targetW = Math.round((h * width) / height);
					return { left: Math.round((w - targetW) / 2), top: 0, width: targetW, height: h };
				})();
	return sharp(buffer).rotate().extract(region).resize(width, height);
}

/** Black-to-pink tone, stretched to the picture's own darkest and brightest */
async function greyLevels(pipeline, width, height) {
	const { data } = await pipeline
		.greyscale()
		.normalise()
		.raw()
		.toBuffer({ resolveWithObject: true });
	if (data.length !== width * height) throw new Error('unexpected channel count');
	return data;
}

function tone(grey, scale) {
	const out = Buffer.alloc(grey.length * 3);
	for (let i = 0; i < grey.length; i++) {
		const v = (grey[i] / 255) * scale;
		out[i * 3] = PINK[0] * v;
		out[i * 3 + 1] = PINK[1] * v;
		out[i * 3 + 2] = PINK[2] * v;
	}
	return out;
}

/** Pink dots on a 45-degree grid sized by brightness, over a half-strength pink tone (like src/scripts/halftone.ts) */
function halftone(grey, width, height) {
	const out = tone(grey, 0.5);
	const cell = 9;
	const cos = Math.SQRT1_2;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			// Position in the rotated grid, and the centre of its cell back in pixels
			const u = (x * cos + y * cos) / cell;
			const v = (-x * cos + y * cos) / cell;
			const cu = Math.floor(u) + 0.5;
			const cv = Math.floor(v) + 0.5;
			const cx = Math.round((cu - cv) * cos * cell);
			const cy = Math.round((cu + cv) * cos * cell);
			const sample =
				cx >= 0 && cx < width && cy >= 0 && cy < height ? grey[cy * width + cx] / 255 : 0;
			const radius = 0.72 * sample ** 0.8;
			const du = u - cu;
			const dv = v - cv;
			const distance = Math.sqrt(du * du + dv * dv);
			// One pixel of soft edge
			const cover = Math.min(1, Math.max(0, (radius - distance) * cell + 0.5));
			if (cover > 0) {
				const i = (y * width + x) * 3;
				for (let c = 0; c < 3; c++) out[i + c] = out[i + c] * (1 - cover) + PINK[c] * cover;
			}
		}
	}
	return out;
}

async function pictureDataUri(sharp, slug, entry) {
	const buffer = await pictureBuffer(slug, entry.picture);
	// A meme stays whole so its caption survives; everything else is cropped to the card's shape.
	// A taped print sits inside the card, so it needs fewer pixels
	let fitted;
	if (entry.whole) {
		fitted = await sharp(buffer)
			.rotate()
			.resize(PRINT_BOX[0], PRINT_BOX[1], { fit: 'inside' })
			.png()
			.toBuffer();
	} else {
		const [w, h] = entry.look === 'taped' ? [880, 495] : [WIDTH, HEIGHT];
		fitted = await (await cropToCard(sharp, buffer, entry.focus, w, h)).png().toBuffer();
	}
	const { width, height } = await sharp(fitted).metadata();
	// Every picture is graded pink like the rest of the site; a taped print takes the flat tone,
	// which keeps meme captions readable
	const grey = await greyLevels(sharp(fitted), width, height);
	const rgb = entry.look === 'halftone' ? halftone(grey, width, height) : tone(grey, 1);
	const png = await sharp(rgb, { raw: { width, height, channels: 3 } })
		.png()
		.toBuffer();
	return { uri: `data:image/png;base64,${png.toString('base64')}`, width, height };
}

function markSvg(MARKS, mark) {
	const shape = MARKS[mark.name];
	if (!shape) throw new Error(`No mark named ${mark.name} in src/data/scribbles.ts`);
	const [left, top, width, height] = mark.at;
	const color = COLORS[mark.color ?? 'chalk'];
	return `<svg class="m" viewBox="${shape.viewBox}" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%"><path d="${shape.path}" stroke="${color}" stroke-width="${mark.width ?? 8}"/></svg>`;
}

function ringSvg(RINGS, ring) {
	const [left, top, width, height] = ring;
	return `<svg class="m" viewBox="0 0 900 300" preserveAspectRatio="none" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%"><path d="${RINGS[0]}" stroke="${COLORS.chalk}" stroke-width="16"/></svg>`;
}

function cardHtml(entry, picture, { MARKS, RINGS }) {
	let body;
	if (entry.look === 'taped') {
		// The print is the picture plus a 16px white border, centred on the card
		const left = (WIDTH - picture.width - 32) / 2;
		const top = (HEIGHT - picture.height - 32) / 2;
		body = `<div class="print" style="left:${left}px;top:${top}px;width:${picture.width + 32}px;height:${picture.height + 32}px;transform:rotate(${entry.tilt ?? -3}deg)"><img src="${picture.uri}" alt="">${entry.ring ? ringSvg(RINGS, entry.ring) : ''}<span class="tape t1"></span><span class="tape t2"></span></div>`;
	} else {
		body = `<img class="full" src="${picture.uri}" alt="">`;
	}
	return `<!doctype html><html><head><meta charset="utf-8">
<style>
* { box-sizing: border-box; margin: 0; }
body { width: ${WIDTH}px; height: ${HEIGHT}px; background: #000; overflow: hidden; }
.card { position: relative; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
.full { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.m { position: absolute; overflow: visible; }
.m path { fill: none; stroke-linecap: round; stroke-linejoin: round; filter: url(#crayon); }
.print { position: absolute; background: #fff; padding: 16px; }
.print img { display: block; width: 100%; height: 100%; object-fit: cover; }
.tape { position: absolute; width: 170px; height: 50px; background: rgba(236, 230, 218, 0.85); transform: rotate(-32deg); }
.t1 { left: -50px; top: -8px; }
.t2 { right: -50px; bottom: -8px; }
</style></head><body>
<svg width="0" height="0" style="position:absolute"><filter id="crayon" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter></svg>
<div class="card">${body}${entry.mark ? markSvg(MARKS, entry.mark) : ''}</div>
</body></html>`;
}

function validate(slug, entry) {
	if (!LOOKS.has(entry.look)) throw new Error(`${slug}: unknown look ${entry.look}`);
	if (!entry.alt) throw new Error(`${slug}: needs alt`);
}

async function main() {
	const slugs = process.argv.slice(2);
	const unknown = slugs.filter((slug) => !PLAN[slug]);
	if (unknown.length)
		throw new Error(`Not in scripts/work-thumbnail-plan.json: ${unknown.join(', ')}`);
	const targets = slugs.length ? slugs : Object.keys(PLAN);
	for (const slug of targets) validate(slug, PLAN[slug]);

	const [{ chromium }, { default: sharp }, scribbles] = await Promise.all([
		import('playwright'),
		import('sharp'),
		import('../src/data/scribbles.ts'),
	]);
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
	try {
		for (const slug of targets) {
			const entry = PLAN[slug];
			const post = join(ROOT, 'src/content/blog', `${slug}.md`);
			if (!existsSync(post)) throw new Error(`${slug}: no post at ${post}`);
			const picture = await pictureDataUri(sharp, slug, entry);
			await page.setContent(cardHtml(entry, picture, scribbles), {
				waitUntil: 'networkidle',
			});
			const png = await page.screenshot({ type: 'png' });
			const webp = await sharp(png).webp({ quality: 72 }).toBuffer();
			const hero = thumbPath(slug, webp);
			const dir = join(ROOT, 'public/images/blog', slug);
			mkdirSync(dir, { recursive: true });
			// The card this one replaces
			for (const file of readdirSync(dir))
				if (/^thumb(-[0-9a-f]{8})?\.webp$/.test(file)) rmSync(join(dir, file));
			writeFileSync(join(ROOT, 'public', hero), webp);
			const markdown = readFileSync(post, 'utf8');
			writeFileSync(post, setFrontmatterFields(markdown, { heroImage: hero, heroAlt: entry.alt }));
			console.log(`thumbnail: ${slug}`);
		}
	} finally {
		await browser.close();
	}
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
