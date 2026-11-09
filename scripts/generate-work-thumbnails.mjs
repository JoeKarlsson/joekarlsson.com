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
 * - look: "flat" (pink and black, the site's filter, no dots), "taped" (flat pink, printed and taped onto
 *   black at a tilt)
 * - focus: where to crop a tall picture to 16:9, 0 (top) to 1 (bottom), default 0.5
 * - whole: true keeps a taped picture uncropped (memes, so the caption survives); the print takes its shape
 * - ring: [left, top, width, height] in % of the picture, a crayon ring around the detail
 * - mark: { "name": <MARKS key>, "at": [left, top, width, height] in % of the card, "color": "pink"|"chalk" }
 * - tilt: degrees for a taped print
 * - inset: percent cut off every edge first, for a scan with a white margin
 * - alt: what the picture shows, used as heroAlt
 * - motion: makes the card an animated WebP (it still plays in every card and on iPhone):
 *     "boil"  the picture holds still while the mark and tape boil on the site's 0.5s loop
 *     "clip"  plays the picture's whole video (picture.video), the mark boiling along
 *             (from picture.at to picture.until seconds, at 10 fps)
 *
 * Any post can have a card, not only employer posts: the plan is keyed by slug.
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
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
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
const LOOKS = new Set(['flat', 'taped']);
const MOTIONS = new Set(['boil', 'clip']);
// The boil in src/layouts/BaseLayout.astro: its three seeds, 1/6 s each
const BOIL_SEEDS = [11, 22, 33];
const BOIL_MS = 167;
const CLIP_FPS = 10;
const CLIP_WIDTH = 960;
const MAX_ANIMATED_BYTES = 256 * 1024;
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

/** Cuts `inset` percent off every edge: the white margin around an archive scan */
async function trimEdges(sharp, buffer, inset) {
	const { width, height } = await sharp(buffer).rotate().metadata();
	const dx = Math.round((width * inset) / 100);
	const dy = Math.round((height * inset) / 100);
	return sharp(buffer)
		.rotate()
		.extract({ left: dx, top: dy, width: width - 2 * dx, height: height - 2 * dy })
		.png()
		.toBuffer();
}

/** A meme stays whole so its caption survives; everything else is cropped to the card's shape.
 * A taped print sits inside the card, so it needs fewer pixels */
async function fitPicture(sharp, original, entry) {
	const buffer = entry.inset ? await trimEdges(sharp, original, entry.inset) : original;
	if (entry.whole)
		return sharp(buffer)
			.rotate()
			.resize(PRINT_BOX[0], PRINT_BOX[1], { fit: 'inside' })
			.png()
			.toBuffer();
	const [w, h] = entry.look === 'taped' ? [880, 495] : [WIDTH, HEIGHT];
	return (await cropToCard(sharp, buffer, entry.focus, w, h)).png().toBuffer();
}

async function pinkDataUri(sharp, grey, width, height) {
	// Every picture is graded pink like the rest of the site; a taped print takes the flat tone,
	// which keeps meme captions readable
	const png = await sharp(tone(grey, 1), { raw: { width, height, channels: 3 } })
		.png()
		.toBuffer();
	return { uri: `data:image/png;base64,${png.toString('base64')}`, width, height };
}

async function pictureDataUri(sharp, slug, entry) {
	const fitted = await fitPicture(sharp, await pictureBuffer(slug, entry.picture), entry);
	const { width, height } = await sharp(fitted).metadata();
	return pinkDataUri(sharp, await greyLevels(sharp(fitted), width, height), width, height);
}

/** Every frame of a clip as pink pictures, stretched to the whole clip's levels so it doesn't flicker */
async function clipDataUris(sharp, slug, entry) {
	const { video, at = 0, until } = entry.picture;
	const dir = mkdtempSync(join(tmpdir(), 'thumb-clip-'));
	try {
		execFileSync('ffmpeg', [
			'-v',
			'error',
			'-ss',
			String(at),
			...(until === undefined ? [] : ['-to', String(until)]),
			'-i',
			join(ROOT, 'public', video),
			'-vf',
			`fps=${CLIP_FPS}`,
			join(dir, '%04d.png'),
		]);
		const greys = [];
		for (const file of readdirSync(dir).sort()) {
			const fitted = await fitPicture(sharp, readFileSync(join(dir, file)), entry);
			const { data, info } = await sharp(fitted)
				.greyscale()
				.raw()
				.toBuffer({ resolveWithObject: true });
			greys.push({ data, width: info.width, height: info.height });
		}
		if (!greys.length) throw new Error(`${slug}: no frames in ${entry.picture.video}`);
		// The clip's 1st and 99th percentile, as sharp's normalise() does for one picture
		const histogram = new Array(256).fill(0);
		for (const { data } of greys) for (const v of data) histogram[v]++;
		const total = histogram.reduce((a, b) => a + b);
		const percentile = (p) => {
			for (let v = 0, seen = 0; v < 256; v++) if ((seen += histogram[v]) >= total * p) return v;
			return 255;
		};
		const low = percentile(0.01);
		const span = Math.max(1, percentile(0.99) - low);
		const uris = [];
		for (const { data, width, height } of greys) {
			const stretched = Buffer.from(
				data.map((v) => Math.min(255, Math.max(0, ((v - low) / span) * 255))),
			);
			uris.push(await pinkDataUri(sharp, stretched, width, height));
		}
		return uris;
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

/** The card's frames as [png, ms shown]: one still, the boil, or the clip */
async function cardFrames(page, sharp, slug, entry, scribbles) {
	const shoot = async (picture, seed) => {
		await page.setContent(cardHtml(entry, picture, scribbles, seed), { waitUntil: 'networkidle' });
		return page.screenshot({ type: 'png' });
	};
	if (entry.motion === 'clip') {
		const frames = [];
		for (const [i, picture] of (await clipDataUris(sharp, slug, entry)).entries())
			frames.push([await shoot(picture, BOIL_SEEDS[i % BOIL_SEEDS.length]), 1000 / CLIP_FPS]);
		return frames;
	}
	const picture = await pictureDataUri(sharp, slug, entry);
	if (!entry.motion) return [[await shoot(picture, BOIL_SEEDS[0]), 0]];
	const frames = [];
	for (const seed of BOIL_SEEDS) frames.push([await shoot(picture, seed), BOIL_MS]);
	return frames;
}

/** A looping animated WebP; img2webp stores only what changes between frames. A clip changes
 * everywhere every frame, so it is drawn smaller and coarser (182 KB instead of 325 KB for 1.5s) */
async function animatedWebp(sharp, frames, clip) {
	const dir = mkdtempSync(join(tmpdir(), 'thumb-frames-'));
	try {
		const args = ['-loop', '0', '-min_size', '-lossy', '-q', clip ? '60' : '72'];
		for (const [i, [png, ms]] of frames.entries()) {
			const file = join(dir, `${String(i).padStart(4, '0')}.png`);
			writeFileSync(file, clip ? await sharp(png).resize(CLIP_WIDTH).png().toBuffer() : png);
			args.push('-d', String(ms), file);
		}
		const out = join(dir, 'card.webp');
		execFileSync('img2webp', [...args, '-o', out], { stdio: 'ignore' });
		return readFileSync(out);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

function markSvg(MARKS, mark, boil = '') {
	const shape = MARKS[mark.name];
	if (!shape) throw new Error(`No mark named ${mark.name} in src/data/scribbles.ts`);
	const [left, top, width, height] = mark.at;
	const color = COLORS[mark.color ?? 'chalk'];
	const stroke = mark.width ?? 8;
	// A boiling card's mark gets a dark edge, so chalk or pink still reads on a bright photo
	const edge = boil ? `<path d="${shape.path}" stroke="#000" stroke-width="${stroke + 8}"/>` : '';
	return `<svg class="m${boil}" viewBox="${shape.viewBox}" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%">${edge}<path d="${shape.path}" stroke="${color}" stroke-width="${stroke}"/></svg>`;
}

function ringSvg(RINGS, ring) {
	const [left, top, width, height] = ring;
	return `<svg class="m" viewBox="0 0 900 300" preserveAspectRatio="none" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%"><path d="${RINGS[0]}" stroke="${COLORS.chalk}" stroke-width="16"/></svg>`;
}

function cardHtml(entry, picture, { MARKS, RINGS }, seed) {
	const boil = entry.motion ? ' boil' : '';
	let body;
	if (entry.look === 'taped') {
		// The print is the picture plus a 16px white border, centred on the card
		const left = (WIDTH - picture.width - 32) / 2;
		const top = (HEIGHT - picture.height - 32) / 2;
		body = `<div class="print" style="left:${left}px;top:${top}px;width:${picture.width + 32}px;height:${picture.height + 32}px;transform:rotate(${entry.tilt ?? -3}deg)"><img src="${picture.uri}" alt="">${entry.ring ? ringSvg(RINGS, entry.ring) : ''}<span class="tape t1${boil}"></span><span class="tape t2${boil}"></span></div>`;
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
.boil { filter: url(#boil); }
</style></head><body>
<svg width="0" height="0" style="position:absolute"><filter id="crayon" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter><filter id="boil" x="-25%" y="-25%" width="150%" height="150%"><feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="1" seed="${seed}" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="5"/></filter></svg>
<div class="card">${body}${entry.mark ? markSvg(MARKS, entry.mark, boil) : ''}</div>
</body></html>`;
}

function validate(slug, entry) {
	if (!LOOKS.has(entry.look)) throw new Error(`${slug}: unknown look ${entry.look}`);
	if (!entry.alt) throw new Error(`${slug}: needs alt`);
	if (entry.motion && !MOTIONS.has(entry.motion))
		throw new Error(`${slug}: unknown motion ${entry.motion}`);
	if (entry.motion === 'clip' && !entry.picture.video)
		throw new Error(`${slug}: a clip needs picture.video`);
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
			const frames = await cardFrames(page, sharp, slug, entry, scribbles);
			const webp =
				frames.length === 1
					? await sharp(frames[0][0]).webp({ quality: 72 }).toBuffer()
					: await animatedWebp(sharp, frames, entry.motion === 'clip');
			// The pre-commit hook turns an animated WebP this big into an MP4 and deletes it
			// (.claude/rules/images.md), which would leave heroImage pointing at nothing
			if (frames.length > 1 && webp.length >= MAX_ANIMATED_BYTES)
				throw new Error(
					`${slug}: animated card is ${Math.round(webp.length / 1024)} KB, the limit is 256 KB. Try "look": "taped" (fewer pixels), a calmer photo, or a shorter clip`,
				);
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
