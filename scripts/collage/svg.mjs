// A collage scene as an animated SVG for a post, so it plays inline like the post's diagrams:
// no <video>, so no play bar (Joe, 2026-11-10). The motion is SMIL stepped on the scene's own
// cadence (a pose every hold_frames), sampled from collage.cjs's elementPose, so it moves like
// the canvas and MP4 renders. Reduced motion and the pause button swap in the finished frame
// (.anim-live and .anim-still in src/styles/motion.css). The cut-outs ship beside it as WebP.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

import sharp from 'sharp';

const { elementPose, poseTime, seeded, easeOutBack, frameCount } = createRequire(import.meta.url)(
	'./collage.cjs',
);

// A post can't load Google Fonts (the CSP allows only the site's own), so a label must use one
// the site already serves. baseline: the canvas's textBaseline 'top' (the em box's top) down to
// the alphabetic baseline, in ems, measured in Chromium; the SVG sets the label on its baseline,
// because browsers disagree on dominant-baseline
const SITE_FONTS = {
	Anton: { css: 'var(--font-anton, Anton), Impact, sans-serif', baseline: 0.781 },
	'Hanken Grotesk': {
		css: "var(--font-hanken-grotesk, 'Hanken Grotesk'), Arial, sans-serif",
		baseline: 0.768,
	},
	'JetBrains Mono': {
		css: "var(--font-jetbrains-mono, 'JetBrains Mono'), Menlo, monospace",
		baseline: 0.773,
	},
};
// Cut-outs are stored at this share of the canvas width, sharp at the post's widest
const STORED_WIDTH = 1600;

const n = (v) => Math.round(v * 10) / 10;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const escapeXml = (s) =>
	String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/**
 * Everything drawn at `frame`: each element's centre, angle and shadow (null while it's off the
 * frame), and the label's opacity and top. The same jitter sequence as collage.cjs's draw(), so
 * the SVG and the MP4 wobble alike. sizes: each element's drawn [width, height].
 */
export function framePose(scene, sizes, frame) {
	const { width: W, height: H } = scene.canvas;
	const cadence = scene.cadence ?? {};
	const hold = Math.max(1, cadence.hold_frames ?? 2);
	const t = poseTime(frame, scene);
	const random = seeded((cadence.seed ?? 7) * 100003 + Math.floor(frame / hold));
	const jitterPx = cadence.jitter_px ?? 1.5;
	const jitterDeg = cadence.jitter_deg ?? 0.4;
	const elements = (scene.elements ?? []).map((spec, i) => {
		const [w, h] = sizes[i];
		const pose = elementPose(spec, t, W, H, w, h);
		if (!pose.visible) return null;
		const x = pose.x + (random() * 2 - 1) * jitterPx;
		const y = pose.y + (random() * 2 - 1) * jitterPx;
		let deg = (random() * 2 - 1) * jitterDeg + (pose.rotation ?? spec.rotation ?? 0);
		deg += (spec.enter_spin ?? 0) * Math.max(0, 1 - pose.progress);
		const s = spec.shadow;
		const shadow = s && {
			opacity: s.opacity ?? 0.3,
			// Canvas blur (Pillow's radius doubled) is twice a Gaussian's standard deviation
			blur: (s.blur ?? 8) * pose.shadowScale,
			dx: (s.dx ?? 6) * pose.shadowScale,
			dy: (s.dy ?? 6) * pose.shadowScale,
		};
		return { x, y, deg, shadow };
	});
	const label = scene.label;
	let labelPose = null;
	if (label && t >= (label.enter_at ?? 0)) {
		const p = clamp01((t - (label.enter_at ?? 0)) / 0.25);
		labelPose = {
			alpha: Math.min(1, p * 2),
			top: (label.y ?? H - 200) + (1 - easeOutBack(p)) * 24,
		};
	}
	return { elements, label: labelPose };
}

/** One SMIL animation stepping through a value per frame; nothing when it never changes. */
function stepped(values, dur, { attr, type }) {
	const keep = values.map((v, i) => i === 0 || v !== values[i - 1]);
	if (keep.filter(Boolean).length === 1) return '';
	const vals = values.filter((_, i) => keep[i]).join(';');
	const times = values
		.map((_, i) => (i / values.length).toFixed(4))
		.filter((_, i) => keep[i])
		.join(';');
	const tag = type
		? `animateTransform attributeName="transform" type="${type}"`
		: `animate attributeName="${attr}"`;
	return `<${tag} calcMode="discrete" values="${vals}" keyTimes="${times}" dur="${n(dur)}s" repeatCount="indefinite"/>`;
}

/**
 * The scene as SVG markup. images: each element's { href, w, h } (drawn size, canvas units).
 * Both layers take their starting attributes from one frame: the live layer from the first
 * and then animates, the still layer holds the last.
 */
export function collageSvg(scene, images, { id, alt }) {
	const { width: W, height: H, fps = 24, grain = 0 } = scene.canvas;
	const sizes = images.map((img) => [img.w, img.h]);
	const frames = Array.from({ length: frameCount(scene) }, (_, f) => framePose(scene, sizes, f));
	const dur = frames.length / fps;
	const over = (pick, opts) => stepped(frames.map(pick), dur, opts);
	const label = scene.label;
	const font = label && SITE_FONTS[label.font_family ?? 'Anton'];
	if (label && !font)
		throw new Error(
			`label font "${label.font_family}" isn't one the site serves (${Object.keys(SITE_FONTS).join(', ')})`,
		);

	const layer = (pose, animate) => {
		const parts = images.map((img, i) => {
			const el = pose.elements[i];
			const at = el ?? { x: 0, y: 0, deg: 0, shadow: null };
			const a = (pick, opts) => (animate ? over((p) => pick(p.elements[i]), opts) : '');
			const shadow = scene.elements[i].shadow
				? (() => {
						const sh = at.shadow ?? { dx: 0, dy: 0, blur: 0, opacity: 0 };
						return `<filter id="${id}-${animate ? 'l' : 's'}${i}" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="${n(sh.dx)}" dy="${n(sh.dy)}" stdDeviation="${n(sh.blur)}" flood-color="#000" flood-opacity="${sh.opacity}">${a((e) => n(e?.shadow?.dx ?? 0), { attr: 'dx' })}${a((e) => n(e?.shadow?.dy ?? 0), { attr: 'dy' })}${a((e) => n(e?.shadow?.blur ?? 0), { attr: 'stdDeviation' })}</feDropShadow></filter>`;
					})()
				: '';
			const filter = shadow ? ` filter="url(#${id}-${animate ? 'l' : 's'}${i})"` : '';
			return [
				shadow,
				`<g${filter} visibility="${el ? 'visible' : 'hidden'}">${a((e) => (e ? 'visible' : 'hidden'), { attr: 'visibility' })}`,
				`<g transform="translate(${n(at.x)} ${n(at.y)})">${a((e) => (e ? `${n(e.x)} ${n(e.y)}` : '0 0'), { type: 'translate' })}`,
				`<g transform="rotate(${n(at.deg)})">${a((e) => String(e ? n(e.deg) : 0), { type: 'rotate' })}`,
				`<image href="${img.href}" x="${n(-img.w / 2)}" y="${n(-img.h / 2)}" width="${n(img.w)}" height="${n(img.h)}"/>`,
				'</g></g></g>',
			].join('');
		});
		if (label) {
			const size = label.size ?? 80;
			const lp = pose.label ?? { alpha: 0, top: label.y ?? H - 200 };
			const baseline = (l) => n(l.top + size * font.baseline);
			const a = (pick, opts) =>
				animate ? over((p) => pick(p.label ?? { alpha: 0, top: lp.top }), opts) : '';
			parts.push(
				`<text x="${label.x ?? 80}" y="${baseline(lp)}" opacity="${n(lp.alpha)}" text-anchor="${label.align === 'center' ? 'middle' : label.align === 'right' ? 'end' : 'start'}" font-family="${escapeXml(font.css)}" font-size="${size}" font-weight="${label.weight ?? 400}" letter-spacing="${label.tracking ?? 0}" fill="${label.color ?? '#0A0A0A'}">${escapeXml(label.text ?? '')}${a((l) => n(l.alpha), { attr: 'opacity' })}${a(baseline, { attr: 'y' })}</text>`,
			);
		}
		return parts.join('');
	};

	const grainFilter =
		grain > 0
			? `<filter id="${id}-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" seed="99" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 ${grain}"/></filter><rect width="${W}" height="${H}" filter="url(#${id}-grain)"/>`
			: '';
	return [
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escapeXml(alt)}">`,
		`<rect width="${W}" height="${H}" fill="${scene.canvas.background_hex ?? '#1F3FB0'}"/>`,
		grainFilter,
		`<g class="anim-live">${layer(frames[0], true)}</g>`,
		`<g class="anim-still" display="none">${layer(frames[frames.length - 1], false)}</g>`,
		'</svg>',
		'',
	].join('\n');
}

/**
 * A post's copy: <post>.svg, with each cut-out beside it as <post>-<element>.webp. post is a
 * path under public/ (public/images/blog/<slug>/<name>); the post references <name>.svg and
 * src/plugins/rehype-inline-diagrams.mjs inlines it.
 */
export async function writePostSvg(scene, scenePath, post, alt) {
	if (!post.startsWith('public/')) throw new Error(`--post must be a path under public/: ${post}`);
	const name = path.basename(post);
	const ratio = Math.min(1, STORED_WIDTH / scene.canvas.width);
	fs.mkdirSync(path.dirname(post), { recursive: true });
	const images = await Promise.all(
		scene.elements.map(async (el) => {
			const source = path.resolve(path.dirname(scenePath), el.image);
			const { width, height } = await sharp(source).metadata();
			const scale = el.scale ?? 1;
			const out = `${post}-${path.basename(el.image, path.extname(el.image))}.webp`;
			await sharp(source)
				.resize(Math.round(width * scale * ratio))
				.webp({ quality: 85, alphaQuality: 90 })
				.toFile(out);
			return { href: out.replace(/^public/, ''), w: width * scale, h: height * scale };
		}),
	);
	fs.writeFileSync(`${post}.svg`, collageSvg(scene, images, { id: `collage-${name}`, alt }));
	return [`${post}.svg`, ...images.map((img) => `public${img.href}`)];
}
