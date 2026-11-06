// Drawing kit for post diagrams in the site's cut-paper style: torn paper boxes,
// chalk arrows, real logos, Anton names, and pink crayon only for callouts. A
// figure file (scripts/diagrams/<slug>/<name>.mjs) uses it to draw a desktop and a
// phone layout; render.mjs writes them to public/images/blog/<slug>/<name>.svg and
// <name>.phone.svg. The rules for drawing one are in .claude/skills/diagrams.
//
// The SVGs are inlined into the post by src/plugins/rehype-inline-diagrams.mjs, so
// the font stacks name the page's own font variables first and a plain family
// after, for when a file is opened on its own (RSS readers, a direct link).
// Everything is seeded, so re-rendering an unchanged figure gives the same file.

import { readFileSync } from 'node:fs';

/**
 * Real logos, transparent, from scripts/diagrams/logos (sources in its README).
 * Simple Icons files are one black path: they take their brand colour, or white
 * or black where that colour wouldn't read on the surface. Brand-kit logos come
 * in versions for dark and light surfaces, plus one-colour black and white.
 */
const LOGOS = {
	claude: { color: '#D97757' },
	salesforce: { color: '#00A1E0' },
	zendesk: { color: '#03363D' },
	stripe: { color: '#635BFF' },
	python: { color: '#3776AB' },
	amazonwebservices: { color: '#FF9900' },
	googlebigquery: { color: '#669DF6' },
	'connect-ai': {
		dark: 'connect-ai-color-on-dark',
		light: 'connect-ai-color-on-light',
		black: 'connect-ai-black',
		white: 'connect-ai-white',
	},
	cdata: { dark: 'cdata-color', light: 'cdata-black', black: 'cdata-black', white: 'cdata-white' },
};

/** What a box of each kind is filled with, so a logo on it can pick a version that reads. */
const SURFACES = {
	ink: '#000000',
	outline: '#000000',
	dashed: '#000000',
	chalk: '#ece6da',
	pink: '#ff4fd8',
};

function luminance(hex) {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

function readLogoFile(file, dir = 'logos') {
	const raw = readFileSync(new URL(`./${dir}/${file}.svg`, import.meta.url), 'utf8').replace(
		/<!--[\s\S]*?-->/g,
		'',
	);
	const [, minX, minY, w, h] = raw
		.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/)
		.map(Number);
	const classFill = Object.fromEntries(
		[...raw.matchAll(/\.(cls-\d+)\s*{\s*fill:\s*([^;]+);/g)].map((m) => [m[1], m[2]]),
	);
	const inner = raw
		.replace(/^[\s\S]*?<svg[^>]*>/, '')
		.replace(/<\/svg>\s*$/, '')
		.replace(/<defs>[\s\S]*?<\/defs>/, '')
		.replace(/<title>[\s\S]*?<\/title>/, '')
		.replace(/class="(cls-\d+)"/g, (_, c) => `fill="${classFill[c]}"`)
		.trim();
	return { viewBox: `${minX} ${minY} ${w} ${h}`, aspect: w / h, inner };
}

/**
 * The version of a logo that reads on a surface (a box kind). A name that isn't a
 * logo is a Lucide icon from scripts/diagrams/icons, drawn in the surface's text colour.
 */
function loadLogo(name, surface = 'ink') {
	const entry = LOGOS[name];
	const background = SURFACES[surface];
	if (!entry) {
		const icon = readLogoFile(name, 'icons');
		const stroke = luminance(background) < 0.2 ? '#ededed' : '#000000';
		return {
			...icon,
			inner: `<g fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon.inner}</g>`,
		};
	}
	const isDark = luminance(background) < 0.2;
	if (!entry.color) {
		const file = surface === 'pink' ? entry.black : isDark ? entry.dark : entry.light;
		return readLogoFile(file);
	}
	const art = readLogoFile(name);
	const fill =
		contrast(entry.color, background) >= 3 ? entry.color : isDark ? '#ededed' : '#000000';
	return { ...art, inner: `<g fill="${fill}">${art.inner}</g>` };
}

export const COLORS = {
	ink: '#000000',
	paper: '#ededed',
	muted: '#a3a3a3',
	pink: '#ff4fd8',
	chalk: '#ece6da',
};

/** Desktop figures are drawn 1:1 with the 640px post column; phone ones at 360. */
export const DESKTOP_WIDTH = 640;
export const PHONE_WIDTH = 360;

const FONTS = {
	sans: "var(--font-hanken-grotesk, 'Hanken Grotesk'), Arial, sans-serif",
	display: 'var(--font-anton, Anton), Impact, sans-serif',
	mono: "var(--font-jetbrains-mono, 'JetBrains Mono'), Menlo, monospace",
	serif: 'Fraunces, Georgia, serif',
};

const escapeXml = (s) =>
	String(s)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
const n = (v) => Math.round(v * 10) / 10;

/** Rough average glyph width per font, in ems, for overflow checks (Anton is set in caps). */
const GLYPH_WIDTH = { display: 0.47, sans: 0.5, mono: 0.6, serif: 0.5 };
export function measure(content, size, font = 'sans', weight = 400) {
	const bold = font === 'sans' && weight >= 600 ? 1.1 : 1;
	return String(content).length * size * GLYPH_WIDTH[font] * bold;
}

/**
 * Start a figure. `id` must be unique across the site (the SVG is inlined and its
 * filter is looked up by id), so render.mjs passes slug-name-layout.
 * `issues` collects text that overflows its box or the canvas; render.mjs fails on any.
 */
export function createFigure({ id, width, height }) {
	let seed = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
	const random = () => {
		seed = (seed * 1664525 + 1013904223) >>> 0;
		return seed / 4294967296;
	};
	const jitter = (amount) => (random() - 0.5) * 2 * amount;
	const filter = `url(#${id}-crayon)`;
	const parts = [];
	const issues = [];

	/** One hand-drawn stroke from a to b: bowed a little, overshooting its ends. */
	function roughSegment(x1, y1, x2, y2, wobble, overshoot = 0.03) {
		const ox = (x2 - x1) * overshoot;
		const oy = (y2 - y1) * overshoot;
		const sx = x1 - ox + jitter(wobble);
		const sy = y1 - oy + jitter(wobble);
		const ex = x2 + ox + jitter(wobble);
		const ey = y2 + oy + jitter(wobble);
		const mx = (sx + ex) / 2 + jitter(wobble);
		const my = (sy + ey) / 2 + jitter(wobble);
		return `M${n(sx)},${n(sy)} Q${n(mx)},${n(my)} ${n(ex)},${n(ey)}`;
	}

	/** A closed outline through points, each nudged a little. */
	function wobblyShape(points, wobble) {
		return (
			'M' +
			points.map(([px, py]) => `${n(px + jitter(wobble))},${n(py + jitter(wobble))}`).join(' L') +
			' Z'
		);
	}

	/** A crayon stroke: arrows and callouts. */
	function stroke(d, color, strokeWidth = 3, extra = '') {
		parts.push(
			`<path d="${d}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" filter="${filter}"${extra}/>`,
		);
	}

	function text(x, y, content, opts = {}) {
		const {
			size = 17,
			font = 'sans',
			color = COLORS.paper,
			anchor = 'middle',
			weight = 400,
			upper = false,
		} = opts;
		const value = upper ? String(content).toUpperCase() : content;
		const w = measure(value, size, font, weight);
		const left = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
		if (left < 0 || left + w > width || y - size / 2 < 0 || y + size / 2 > height) {
			issues.push(`"${value}" runs off the ${width}x${height} canvas`);
		}
		parts.push(
			`<text x="${n(x)}" y="${n(y)}" font-family="${FONTS[font]}" font-size="${size}"${weight !== 400 ? ` font-weight="${weight}"` : ''} fill="${color}" text-anchor="${anchor}" dominant-baseline="central">${escapeXml(value)}</text>`,
		);
	}

	/** Text colour inside a box of this kind. */
	function onColor(kind) {
		return kind === 'pink' || kind === 'chalk' ? COLORS.ink : COLORS.paper;
	}

	/** A torn scrap of paper. */
	function scrap(x, y, w, h, color, edge, dashed = false) {
		const points = [];
		const step = 16;
		for (let i = 0; i < w; i += step) points.push([x + i, y]);
		for (let i = 0; i < h; i += step) points.push([x + w, y + i]);
		for (let i = w; i > 0; i -= step) points.push([x + i, y + h]);
		for (let i = h; i > 0; i -= step) points.push([x, y + i]);
		const edgeAttrs = edge
			? ` stroke="${edge}" stroke-width="2"${dashed ? ' stroke-dasharray="7 6"' : ''}`
			: '';
		parts.push(`<path d="${wobblyShape(points, 1.6)}" fill="${color}"${edgeAttrs}/>`);
	}

	/** A logo with its left edge at x, centred on cy, for a surface (box kind). Returns its width. */
	function logo(name, x, cy, logoHeight, surface = 'ink') {
		const art = loadLogo(name, surface);
		const w = logoHeight * art.aspect;
		parts.push(
			`<svg x="${n(x)}" y="${n(cy - logoHeight / 2)}" width="${n(w)}" height="${n(logoHeight)}" viewBox="${art.viewBox}">${art.inner}</svg>`,
		);
		return w;
	}

	function logoWidth(name, logoHeight) {
		return logoHeight * loadLogo(name).aspect;
	}

	/**
	 * A box: a torn scrap, tilted a little. kind: pink (the post's own system),
	 * chalk (what it talks to), outline (people, prompts, plain steps), dashed
	 * (sometimes or optional), ink (a chip inside another box, like a tool name).
	 * label: a string or array of lines, set in Anton caps when short (a name) and
	 * in Hanken when longer (a phrase); sub: smaller lines under it.
	 * logo: a product's logo before the label; icon: a Lucide icon there instead,
	 * for anything without a logo; stack: put that mark above the label instead of
	 * before it, for small boxes; wordmark: a logo that replaces the label.
	 */
	function box({
		x,
		y,
		w,
		h,
		kind = 'outline',
		label,
		sub,
		font = 'sans',
		size = 18,
		subFont = 'sans',
		subSize: subSizeOverride,
		logo: logoName,
		icon: iconName,
		stack = false,
		wordmark,
	}) {
		parts.push(
			`<g transform="rotate(${n(jitter(kind === 'ink' ? 1.5 : 1.2))} ${n(x + w / 2)} ${n(y + h / 2)})">`,
		);
		const fills = {
			pink: COLORS.pink,
			chalk: COLORS.chalk,
			ink: COLORS.ink,
			outline: COLORS.ink,
			dashed: COLORS.ink,
		};
		scrap(
			x,
			y,
			w,
			h,
			fills[kind],
			kind === 'outline' ? COLORS.paper : kind === 'dashed' ? COLORS.chalk : null,
			kind === 'dashed',
		);
		const labelLength = [label].flat().join(' ').length;
		if (font === 'sans' && kind !== 'ink' && labelLength <= 24) {
			font = 'display';
			size = Math.round(size * 1.2);
		}
		const color = onColor(kind);
		let cx = x + w / 2;
		let room = w - 20;
		if (wordmark) {
			// The product's own wordmark stands in for its name, with any sub-lines under it
			const subs = [sub ?? []].flat();
			const markH = Math.min(24, h * 0.3);
			const block = markH + subs.length * 20 + (subs.length ? 8 : 0);
			const markY = y + h / 2 - block / 2 + markH / 2;
			const markW = logoWidth(wordmark, markH);
			if (markW > room) issues.push(`the ${wordmark} wordmark is wider than its ${w}px box`);
			logo(wordmark, cx - markW / 2, markY, markH, kind);
			subs.forEach((line, i) =>
				text(cx, markY + markH / 2 + 18 + i * 20, line, { size: 15, color, weight: 600 }),
			);
			parts.push('</g>');
			return;
		}
		const mark = logoName ?? iconName;
		// The label's area: the whole box, or what's left under a stacked mark
		let areaTop = y;
		let areaH = h;
		if (mark && stack) {
			const iconH = Math.min(26, h * 0.34);
			logo(mark, cx - logoWidth(mark, iconH) / 2, y + 8 + iconH / 2, iconH, kind);
			areaTop = y + iconH + 8;
			areaH = h - iconH - 8;
		} else if (mark) {
			// A chip is small, so its mark sits closer to the edge
			const pad = kind === 'ink' ? 10 : 14;
			const iconH = Math.min(28, h * 0.5);
			const iconW = logo(mark, x + pad, y + h / 2, iconH, kind);
			cx = x + pad + iconW + (w - pad - iconW) / 2;
			room = w - pad * 2 - 6 - iconW;
		}
		const asList = (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
		const subSize =
			subSizeOverride ??
			(font === 'display'
				? Math.max(15, Math.round(size * 0.68))
				: Math.max(14, Math.round(size * 0.82)));
		const rows = [
			...asList(label).map((t) => ({ t, size, font })),
			...asList(sub).map((t) => ({ t, size: subSize, font: subFont })),
		];
		const total = rows.reduce((sum, r) => sum + r.size * 1.3, 0);
		if (total > areaH - 6)
			issues.push(`"${rows.map((r) => r.t).join(' / ')}" is taller than its ${h}px box`);
		let rowTop = areaTop + areaH / 2 - total / 2;
		rows.forEach((r) => {
			const upper = r.font === 'display';
			const rowWidth = measure(r.t, r.size, r.font, r.font === 'sans' ? 600 : 400);
			if (rowWidth > room)
				issues.push(
					`"${r.t}" is about ${Math.round(rowWidth)}px wide in ${Math.round(room)}px of room`,
				);
			text(cx, rowTop + r.size * 0.65, r.t, {
				size: r.size,
				font: r.font,
				color,
				weight: upper ? 400 : r.font === 'sans' ? 600 : 400,
				upper,
			});
			rowTop += r.size * 1.3;
		});
		parts.push('</g>');
	}

	/** A rounded start/end marker. */
	function pill({ x, y, w, h, label, size = 17 }) {
		const r = h / 2;
		const points = [];
		for (let i = 0; i <= 12; i++) {
			const a = -Math.PI / 2 + (i / 12) * Math.PI;
			points.push([x + w - r + Math.cos(a) * r, y + r + Math.sin(a) * r]);
		}
		for (let i = 0; i <= 12; i++) {
			const a = Math.PI / 2 + (i / 12) * Math.PI;
			points.push([x + r + Math.cos(a) * r, y + r + Math.sin(a) * r]);
		}
		parts.push(`<path d="${wobblyShape(points, 1.2)}" fill="${COLORS.chalk}"/>`);
		text(x + w / 2, y + h / 2, label, {
			size: size * 1.2,
			font: 'display',
			upper: true,
			color: COLORS.ink,
		});
	}

	/** A decision diamond centred on cx, cy. */
	function diamond({ cx, cy, w, h, label, size = 17 }) {
		const corners = [
			[cx, cy - h / 2],
			[cx + w / 2, cy],
			[cx, cy + h / 2],
			[cx - w / 2, cy],
		];
		parts.push(`<path d="${wobblyShape(corners, 1.5)}" fill="${COLORS.chalk}"/>`);
		if (measure(label, size * 1.2, 'display') > w * 0.62)
			issues.push(`"${label}" is too wide for its ${w}px diamond`);
		text(cx, cy, label, { size: size * 1.2, font: 'display', upper: true, color: COLORS.ink });
	}

	function head(x, y, angle, color, size = 11) {
		const a1 = angle + Math.PI - 0.62;
		const a2 = angle + Math.PI + 0.62;
		stroke(
			`M${n(x + Math.cos(a1) * size)},${n(y + Math.sin(a1) * size)} L${n(x)},${n(y)} L${n(x + Math.cos(a2) * size)},${n(y + Math.sin(a2) * size)}`,
			color,
		);
	}

	/**
	 * A chalk crayon arrow along a polyline of [x, y] points (right angles for flow
	 * lines). heads: 'end' (one way), 'both' (a request and its answer) or 'none'.
	 * dashed: sometimes. Pink is kept for crayonArrow, so a flow line never looks
	 * like a callout.
	 */
	function arrow(points, { heads = 'end', dashed = false } = {}) {
		const d = [];
		for (let i = 0; i < points.length - 1; i++)
			d.push(roughSegment(...points[i], ...points[i + 1], 1.5, 0));
		stroke(d.join(' '), COLORS.chalk, 3, dashed ? ' stroke-dasharray="7 7"' : '');
		const angleOf = ([ax, ay], [bx, by]) => Math.atan2(by - ay, bx - ax);
		const last = points.length - 1;
		if (heads === 'end' || heads === 'both')
			head(...points[last], angleOf(points[last - 1], points[last]), COLORS.chalk);
		if (heads === 'both') head(...points[0], angleOf(points[1], points[0]), COLORS.chalk);
	}

	/** A short label beside a line: gray, smaller. */
	function note(x, y, content, opts = {}) {
		text(x, y, content, { size: 15, color: COLORS.muted, anchor: 'start', ...opts });
	}

	/**
	 * Colour key, top right. Only when colour encodes two or more things the
	 * labels don't already say: [['pink', 'tool call to Doom'], ['logo:cdata', 'Connect AI step']].
	 */
	function legend(items, { right = width - 20, y = 28, size = 15 } = {}) {
		let x = right;
		[...items].reverse().forEach(([kind, label]) => {
			x -= measure(label, size, 'sans');
			text(x, y, label, { size, color: COLORS.muted, anchor: 'start' });
			if (kind.startsWith('logo:')) {
				x -= 8 + logoWidth(kind.slice(5), 16);
				logo(kind.slice(5), x, y, 16);
				x -= 22;
				return;
			}
			x -= 30;
			parts.push(
				`<rect x="${n(x)}" y="${n(y - 7)}" width="22" height="14" rx="3" fill="${COLORS[kind]}"/>`,
			);
			x -= 22;
		});
	}

	/**
	 * A container for parts that belong together: a darker sheet the boxes sit on,
	 * with a name tab at its top-left. Draw it before its contents.
	 */
	function group({ x, y, w, h, label }) {
		const tabW = measure(label, 17, 'display') + 26;
		scrap(x, y, w, h, '#2a2a2a');
		scrap(x, y - 22, tabW, 24, '#2a2a2a');
		text(x + 12, y - 9, label, {
			font: 'display',
			size: 17,
			anchor: 'start',
			upper: true,
			color: COLORS.chalk,
		});
	}

	/** A pink crayon arrow on a curve, from a callout note to what it explains. */
	function crayonArrow([x1, y1], [x2, y2], bend = 30) {
		const length = Math.hypot(x2 - x1, y2 - y1);
		const mx = (x1 + x2) / 2 - ((y2 - y1) / length) * bend;
		const my = (y1 + y2) / 2 + ((x2 - x1) / length) * bend;
		stroke(`M${n(x1)},${n(y1)} Q${n(mx)},${n(my)} ${n(x2)},${n(y2)}`, COLORS.pink, 3.5);
		const angle = Math.atan2(y2 - my, x2 - mx);
		const size = 13;
		stroke(
			`M${n(x2 + Math.cos(angle + Math.PI - 0.55) * size)},${n(y2 + Math.sin(angle + Math.PI - 0.55) * size)} L${n(x2)},${n(y2)} L${n(x2 + Math.cos(angle + Math.PI + 0.55) * size)},${n(y2 + Math.sin(angle + Math.PI + 0.55) * size)}`,
			COLORS.pink,
			3.5,
		);
	}

	/** A section title inside a figure: Anton caps. */
	function heading(x, y, content, opts = {}) {
		text(x, y, content, { size: 28, font: 'display', anchor: 'start', upper: true, ...opts });
	}

	function toString(label) {
		return [
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeXml(label)}">`,
			`<defs><filter id="${id}-crayon" filterUnits="userSpaceOnUse" x="-20" y="-20" width="${width + 40}" height="${height + 40}">`,
			'<feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="3" result="n"/>',
			'<feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" result="d"/>',
			'<feTurbulence type="fractalNoise" baseFrequency="2.2" seed="8" result="g"/>',
			'<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.5" result="holes"/>',
			'<feComposite in="d" in2="holes" operator="in"/>',
			'</filter></defs>',
			`<rect width="${width}" height="${height}" fill="${COLORS.ink}"/>`,
			...parts,
			'</svg>',
			'',
		].join('\n');
	}

	return {
		width,
		height,
		issues,
		onColor,
		logo,
		logoWidth,
		crayonArrow,
		group,
		box,
		pill,
		diamond,
		arrow,
		text,
		note,
		legend,
		heading,
		toString,
	};
}
