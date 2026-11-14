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

import { existsSync, readFileSync } from 'node:fs';

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
	mongodb: { color: '#47A248' },
	proxmox: { color: '#E57000' },
	synology: { color: '#B5B5B6' },
	ubiquiti: { color: '#0559C9' },
	mikrotik: { color: '#293239' },
	dell: { color: '#007DB8' },
	nginx: { color: '#009639' },
	plex: { color: '#EBAF00' },
	jellyfin: { color: '#00A4DC' },
	sonarr: { color: '#2596BE' },
	radarr: { color: '#FFC230' },
	qbittorrent: { color: '#2F67BA' },
	pihole: { color: '#96060C' },
	homeassistant: { color: '#18BCF2' },
	ollama: { color: '#000000' },
	opentofu: { color: '#FFDA18' },
	minio: { color: '#C72E49' },
	prometheus: { color: '#E6522C' },
	grafana: { color: '#F46800' },
	ansible: { color: '#EE0000' },
	git: { color: '#F05032' },
	tailscale: { color: '#242424' },
	debian: { color: '#A81D33' },
	nvidia: { color: '#76B900' },
	apple: { color: '#000000' },
	raspberrypi: { color: '#A22846' },
	arduino: { color: '#00878F' },
	termius: { color: '#000000' },
	seerr: { dark: 'seerr', light: 'seerr', black: 'seerr', white: 'seerr' },
	minecraft: { dark: 'minecraft', light: 'minecraft', black: 'minecraft', white: 'minecraft' },
	loki: { dark: 'loki', light: 'loki', black: 'loki', white: 'loki' },
	tinybird: { color: '#000000' },
	'tinybird-mark': { color: '#000000' },
	// Full-colour logos read on any surface, so every version is the same file
	litellm: { dark: 'litellm', light: 'litellm', black: 'litellm', white: 'litellm' },
	microsoftteams: {
		dark: 'microsoftteams',
		light: 'microsoftteams',
		black: 'microsoftteams',
		white: 'microsoftteams',
	},
	sharepoint: { dark: 'sharepoint', light: 'sharepoint', black: 'sharepoint', white: 'sharepoint' },
	sqlserver: { dark: 'sqlserver', light: 'sqlserver', black: 'sqlserver', white: 'sqlserver' },
	netsuite: { dark: 'netsuite', light: 'netsuite', black: 'netsuite', white: 'netsuite' },
	kubernetes: { color: '#326CE5' },
	apacheflink: { color: '#E6526F' },
	clickhouse: { color: '#FFCC01' },
	googlecloud: { color: '#4285F4' },
	modelcontextprotocol: { color: '#000000' },
	openai: { color: '#412991' },
	anthropic: { color: '#191919' },
	meta: { color: '#0467DF' },
	jira: { color: '#0052CC' },
	googleanalytics: { color: '#E37400' },
	slack: { color: '#4A154B' },
	snowflake: { color: '#29B5E8' },
	sap: { color: '#0FAAFF' },
	postgresql: { color: '#4169E1' },
	apachekafka: { color: '#231F20' },
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

// Repeat a removal until nothing changes, so a nested fragment like `<!<!-- -->-- -->`
// can't leave a new match behind after one pass
function removeAll(text, pattern) {
	let previous;
	do {
		previous = text;
		text = text.replace(pattern, '');
	} while (text !== previous);
	return text;
}

function readLogoFile(file, dir = 'logos') {
	const raw = removeAll(
		readFileSync(new URL(`./${dir}/${file}.svg`, import.meta.url), 'utf8'),
		/<!--[\s\S]*?-->/g,
	);
	const [, minX, minY, w, h] = raw
		.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/)
		.map(Number);
	// Class-based fills (.cls-1 { fill: ... } in a <style> block) become fill attributes,
	// because a <style> inside an inlined SVG would leak into the whole page
	const classFill = Object.fromEntries(
		[...raw.matchAll(/\.([\w-]+)\s*{[^}]*?fill:\s*([^;}]+)/g)].map((m) => [m[1], m[2].trim()]),
	);
	const inner = removeAll(
		raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''),
		/<style[\s\S]*?<\/style>/g,
	)
		.replace(/<title>[\s\S]*?<\/title>/, '')
		.replace(/class="([\w-]+)"/g, (_whole, c) => (classFill[c] ? `fill="${classFill[c]}"` : ''))
		.trim();
	return { viewBox: `${minX} ${minY} ${w} ${h}`, aspect: w / h, inner };
}

/**
 * The version of a logo that reads on a surface (a box kind). A name that isn't a
 * logo is a Lucide icon from scripts/diagrams/icons, drawn in the surface's text colour.
 */
/**
 * A logo not listed in LOGOS can describe itself in logos/<name>.json:
 * { "color": "#hex" } for a one-colour mark, or {} for a full-colour logo that
 * reads on any surface. Lets several people add logos without editing this file.
 */
function sidecarEntry(name) {
	const json = new URL(`./logos/${name}.json`, import.meta.url);
	if (!existsSync(json)) return undefined;
	const { color } = JSON.parse(readFileSync(json, 'utf8'));
	return color ? { color } : { dark: name, light: name, black: name, white: name };
}

function loadLogo(name, surface = 'ink') {
	const entry = LOGOS[name] ?? sidecarEntry(name);
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
/** The crayon look for one stroke: wobbled edges and waxy gaps, over the given region */
function crayonFilter(filterId, { x, y, width, height }) {
	return [
		`<filter id="${filterId}" filterUnits="userSpaceOnUse" x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}">`,
		'<feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="3" result="n"/>',
		'<feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" result="d"/>',
		'<feTurbulence type="fractalNoise" baseFrequency="2.2" seed="8" result="g"/>',
		'<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.5" result="holes"/>',
		'<feComposite in="d" in2="holes" operator="in"/>',
		'</filter>',
	].join('');
}

export function createFigure({ id, width, height }) {
	let seed = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
	const random = () => {
		seed = (seed * 1664525 + 1013904223) >>> 0;
		return seed / 4294967296;
	};
	const jitter = (amount) => (random() - 0.5) * 2 * amount;
	// One crayon filter per stroke, sized to that stroke. A filter sized to the whole
	// figure made Safari on iPhone keep a full-figure buffer (3x the pixels) for every
	// arrow, and the boil animation redrew them all; long posts ran out of memory and
	// the tab reloaded over and over. Noise is in user space, so the look is the same.
	const crayonFilters = [];
	// Drawn in this order, so arrows never sink under a box and callouts sit on top
	const layers = { groups: [], boxes: [], lines: [], callouts: [] };
	let target = layers.boxes;
	const onLayer = (name, draw) => {
		const previous = target;
		target = layers[name];
		draw();
		target = previous;
	};
	const issues = [];
	let logoCount = 0;
	// What the collision check needs: where text and boxes are, and every line drawn
	const textBoxes = [];
	const boxRects = [];
	const lines = [];

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
		// Paths here are absolute M/L/Q coordinate pairs, so every other number is an x
		const numbers = d.match(/-?\d+(\.\d+)?/g).map(Number);
		const xs = numbers.filter((_, i) => i % 2 === 0);
		const ys = numbers.filter((_, i) => i % 2 === 1);
		// Room for the stroke's width and the displacement
		const pad = strokeWidth + 8;
		const filterId = `${id}-crayon-${crayonFilters.length + 1}`;
		crayonFilters.push(
			crayonFilter(filterId, {
				x: Math.min(...xs) - pad,
				y: Math.min(...ys) - pad,
				width: Math.max(...xs) - Math.min(...xs) + pad * 2,
				height: Math.max(...ys) - Math.min(...ys) + pad * 2,
			}),
		);
		target.push(
			`<path d="${d}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" filter="url(#${filterId})"${extra}/>`,
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
		// A phone figure shows at about 343 of its 360 units: 13 is the smallest that stays readable
		if (width <= PHONE_WIDTH && size < 13)
			issues.push(`"${value}" is ${size}px; phone text must be 13px or more`);
		const w = measure(value, size, font, weight);
		const left = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
		textBoxes.push({
			label: String(value),
			x0: left,
			x1: left + w,
			y0: y - size * 0.45,
			y1: y + size * 0.45,
		});
		if (left < 0 || left + w > width || y - size / 2 < 0 || y + size / 2 > height) {
			issues.push(`"${value}" runs off the ${width}x${height} canvas`);
		}
		target.push(
			`<text x="${n(x)}" y="${n(y)}" font-family="${FONTS[font]}" font-size="${size}"${weight !== 400 ? ` font-weight="${weight}"` : ''} fill="${color}" text-anchor="${anchor}" dominant-baseline="central"${font === 'mono' ? ' xml:space="preserve"' : ''}>${escapeXml(value)}</text>`,
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
		target.push(
			`<path class="d-paper" d="${wobblyShape(points, 1.6)}" fill="${color}"${edgeAttrs}/>`,
		);
	}

	/** A logo with its left edge at x, centred on cy, for a surface (box kind). Returns its width. */
	function logo(name, x, cy, logoHeight, surface = 'ink') {
		const art = loadLogo(name, surface);
		const w = logoHeight * art.aspect;
		// Gradient and clip ids must be unique on the page: every figure is inlined
		// twice (desktop and phone) and a logo can appear several times in each
		logoCount++;
		const prefix = `${id}-l${logoCount}-`;
		const inner = art.inner
			.replace(/\bid="([^"]+)"/g, (_, ref) => `id="${prefix}${ref}"`)
			.replace(/url\(#([^)]+)\)/g, (_, ref) => `url(#${prefix}${ref})`)
			.replace(/href="#([^"]+)"/g, (_, ref) => `href="#${prefix}${ref}"`);
		target.push(
			`<svg x="${n(x)}" y="${n(cy - logoHeight / 2)}" width="${n(w)}" height="${n(logoHeight)}" viewBox="${art.viewBox}">${inner}</svg>`,
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
	 * @param {{ x: number, y: number, w: number, h: number, kind?: string, label?: string | string[], sub?: string | string[], font?: string, size?: number, subFont?: string, subSize?: number, logo?: string, icon?: string, stack?: boolean, wordmark?: string }} spec
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
		boxRects.push({ label: [label ?? wordmark ?? kind].flat().join(' '), x, y, w, h });
		target.push(
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
			target.push('</g>');
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
		target.push('</g>');
	}

	/** A rounded start/end marker. */
	function pill({ x, y, w, h, label, size = 17 }) {
		boxRects.push({ label, x, y, w, h });
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
		target.push(`<path d="${wobblyShape(points, 1.2)}" fill="${COLORS.chalk}"/>`);
		text(x + w / 2, y + h / 2, label, {
			size: size * 1.2,
			font: 'display',
			upper: true,
			color: COLORS.ink,
		});
	}

	/** A decision diamond centred on cx, cy. */
	function diamond({ cx, cy, w, h, label, size = 17 }) {
		// The part of a diamond wide enough to hold its label
		boxRects.push({ label, x: cx - w * 0.35, y: cy - h / 4, w: w * 0.7, h: h / 2 });
		const corners = [
			[cx, cy - h / 2],
			[cx + w / 2, cy],
			[cx, cy + h / 2],
			[cx - w / 2, cy],
		];
		target.push(`<path d="${wobblyShape(corners, 1.5)}" fill="${COLORS.chalk}"/>`);
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
	function arrow(points, options) {
		onLayer('lines', () => drawArrow(points, options));
	}

	function drawArrow(points, { heads = 'end', dashed = false } = {}) {
		lines.push({ points, kind: 'arrow' });
		// Wrapped so CSS can boil a whole arrow without replacing its crayon filter
		target.push('<g class="d-flow">');
		const d = [];
		for (let i = 0; i < points.length - 1; i++)
			d.push(roughSegment(...points[i], ...points[i + 1], 1.5, 0));
		stroke(d.join(' '), COLORS.chalk, 3, dashed ? ' stroke-dasharray="7 7"' : '');
		const angleOf = ([ax, ay], [bx, by]) => Math.atan2(by - ay, bx - ax);
		const last = points.length - 1;
		if (heads === 'end' || heads === 'both')
			head(...points[last], angleOf(points[last - 1], points[last]), COLORS.chalk);
		if (heads === 'both') head(...points[0], angleOf(points[1], points[0]), COLORS.chalk);
		target.push('</g>');
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
			target.push(
				`<rect x="${n(x)}" y="${n(y - 7)}" width="22" height="14" rx="3" fill="${COLORS[kind]}"/>`,
			);
			x -= 22;
		});
	}

	/**
	 * A container for parts that belong together: a darker sheet the boxes sit on,
	 * with a name tab at its top-left. Draw it before its contents.
	 */
	function group(spec) {
		onLayer('groups', () => drawGroup(spec));
	}

	function drawGroup({ x, y, w, h, label, logo: tabLogo }) {
		// A product's container shows the product's own wordmark on its tab
		const tabW = tabLogo ? logoWidth(tabLogo, 15) + 24 : measure(label, 17, 'display') + 26;
		scrap(x, y, w, h, '#2a2a2a');
		scrap(x, y - 22, tabW, 24, '#2a2a2a');
		if (tabLogo) {
			logo(tabLogo, x + 12, y - 10, 15);
			return;
		}
		text(x + 12, y - 9, label, {
			font: 'display',
			size: 17,
			anchor: 'start',
			upper: true,
			color: COLORS.chalk,
		});
	}

	/** A pink crayon arrow on a curve, from a callout note to what it explains. */
	function crayonArrow(from, to, bend) {
		onLayer('callouts', () => drawCrayonArrow(from, to, bend));
	}

	function drawCrayonArrow([x1, y1], [x2, y2], bend = 30) {
		const length = Math.hypot(x2 - x1, y2 - y1);
		const mx = (x1 + x2) / 2 - ((y2 - y1) / length) * bend;
		const my = (y1 + y2) / 2 + ((x2 - x1) / length) * bend;
		const curve = [];
		for (let t = 0; t <= 1.0001; t += 0.05) {
			curve.push([
				(1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t ** 2 * x2,
				(1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t ** 2 * y2,
			]);
		}
		lines.push({ points: curve, kind: 'callout' });
		target.push('<g class="d-callout">');
		stroke(`M${n(x1)},${n(y1)} Q${n(mx)},${n(my)} ${n(x2)},${n(y2)}`, COLORS.pink, 3.5);
		const angle = Math.atan2(y2 - my, x2 - mx);
		const size = 13;
		stroke(
			`M${n(x2 + Math.cos(angle + Math.PI - 0.55) * size)},${n(y2 + Math.sin(angle + Math.PI - 0.55) * size)} L${n(x2)},${n(y2)} L${n(x2 + Math.cos(angle + Math.PI + 0.55) * size)},${n(y2 + Math.sin(angle + Math.PI + 0.55) * size)}`,
			COLORS.pink,
			3.5,
		);
		target.push('</g>');
	}

	/**
	 * A code block on a black scrap: monospace lines, the ones in `highlight`
	 * (indexes) in pink. For a schema, a query or a config the figure is about.
	 */
	function code({ x, y, w, lines, size = 15, highlight = [] }) {
		const lineH = size * 1.55;
		const h = lines.length * lineH + 24;
		boxRects.push({ label: 'code block', x, y, w, h });
		target.push(`<g transform="rotate(${n(jitter(0.6))} ${n(x + w / 2)} ${n(y + h / 2)})">`);
		scrap(x, y, w, h, COLORS.ink, COLORS.paper);
		lines.forEach((line, i) => {
			const lineY = y + 12 + lineH * (i + 0.5);
			if (measure(line, size, 'mono') > w - 28)
				issues.push(`code line "${line}" is wider than its ${w}px block`);
			text(x + 14, lineY, line, {
				font: 'mono',
				size,
				anchor: 'start',
				color: highlight.includes(i) ? COLORS.pink : COLORS.paper,
				weight: highlight.includes(i) ? 700 : 400,
			});
		});
		target.push('</g>');
		return h;
	}

	/**
	 * A small table on a black scrap: a title, column headers and rows in
	 * monospace, with the column at `highlight` (an index) in pink. Empty strings
	 * leave a row blank. Returns its height.
	 */
	function table({ x, y, title, columns, rows, colW, size = 14, highlight = -1 }) {
		const rowH = size * 2;
		const w = columns.length * colW;
		const h = 34 + rowH * (rows.length + 1) + 8;
		boxRects.push({ label: title, x: x - 8, y, w: w + 16, h });
		target.push(`<g transform="rotate(${n(jitter(0.8))} ${n(x + w / 2)} ${n(y + h / 2)})">`);
		scrap(x - 8, y, w + 16, h, COLORS.ink, COLORS.paper);
		text(x + 2, y + 18, title, {
			font: 'mono',
			size: size + 1,
			anchor: 'start',
			weight: 700,
			color: COLORS.paper,
		});
		const gridTop = y + 34;
		for (let r = 0; r <= rows.length + 1; r++) {
			const lineY = gridTop + r * rowH;
			target.push(
				`<path d="M${n(x)},${n(lineY)} L${n(x + w)},${n(lineY)}" stroke="${COLORS.muted}" stroke-width="1"/>`,
			);
		}
		for (let c = 0; c <= columns.length; c++) {
			const lineX = x + c * colW;
			target.push(
				`<path d="M${n(lineX)},${n(gridTop)} L${n(lineX)},${n(gridTop + rowH * (rows.length + 1))}" stroke="${COLORS.muted}" stroke-width="1"/>`,
			);
		}
		[columns, ...rows].forEach((row, r) =>
			row.forEach((cell, c) => {
				if (!cell) return;
				if (measure(cell, size, 'mono') > colW - 10)
					issues.push(`table cell "${cell}" is wider than its ${colW}px column`);
				const color = c === highlight ? COLORS.pink : r === 0 ? COLORS.muted : COLORS.paper;
				text(x + c * colW + 6, gridTop + rowH * (r + 0.5), cell, {
					font: 'mono',
					size,
					anchor: 'start',
					color,
					weight: c === highlight ? 700 : 400,
				});
			}),
		);
		target.push('</g>');
		return h;
	}

	/**
	 * A plain line that belongs to a shape, not the flow: a cell divider, a cross-out.
	 * Drawn with the boxes and left out of the arrow check.
	 */
	function line(points, { color = COLORS.ink, width: strokeWidth = 2 } = {}) {
		target.push(
			`<path d="M${points.map(([px, py]) => `${n(px)},${n(py)}`).join(' L')}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`,
		);
	}

	/** A filled dot, like a pointer in a list node. */
	function dot(cx, cy, r = 5, color = COLORS.ink) {
		target.push(`<circle cx="${n(cx)}" cy="${n(cy)}" r="${r}" fill="${color}"/>`);
	}

	// Charts build in once when they scroll into view (src/scripts/pause-offscreen-scribbles.ts
	// starts a figure's SMIL from its first frame), then hold the finished chart. Motion is
	// stepped at 12 fps like the post animations, eases out and never overshoots a value. The
	// desktop SVG carries a live layer and a still one (motion.css shows the still under
	// reduced motion or paused motion); a phone gets the still alone, like every post figure.
	const BUILD_FPS = 12;
	const animates = width !== PHONE_WIDTH;
	let wipeCount = 0;
	/** SMIL values stepped at 12 fps from 0 to 1, eased out, for value(p). */
	function buildSteps(dur, value) {
		const frames = Math.max(2, Math.round(dur * BUILD_FPS));
		return Array.from({ length: frames + 1 }, (_, i) => value(1 - (1 - i / frames) ** 3)).join(';');
	}
	function buildAnimation(tag, attrs, begin, dur, value) {
		return `<${tag} ${attrs} calcMode="discrete" values="${buildSteps(dur, value)}" begin="${n(begin)}s" dur="${n(dur)}s" fill="freeze"/>`;
	}
	/** Draws a chart's data marks: on desktop a live layer that builds plus its still. */
	function buildLayers(draw) {
		if (!animates) return draw(false);
		target.push('<g class="anim-live">');
		draw(true);
		target.push('</g><g class="anim-still" display="none">');
		draw(false);
		target.push('</g>');
	}
	/** Wraps what drawMark draws so it grows out of (ox, oy) along one axis, starting at begin. */
	function grow(live, ox, oy, axis, begin, dur, drawMark) {
		if (!live) return drawMark();
		const from = axis === 'x' ? '0 1' : '1 0';
		target.push(
			`<g transform="translate(${n(ox)} ${n(oy)})"><g transform="scale(${from})">`,
			buildAnimation(
				'animateTransform',
				'attributeName="transform" type="scale"',
				begin,
				dur,
				(p) => (axis === 'x' ? `${Math.round(p * 100) / 100} 1` : `1 ${Math.round(p * 100) / 100}`),
			),
			`<g transform="translate(${n(-ox)} ${n(-oy)})">`,
		);
		drawMark();
		target.push('</g></g></g>');
	}
	/** Wraps what drawMark draws so it fades in at begin. */
	function fadeIn(live, begin, drawMark) {
		if (!live) return drawMark();
		target.push(
			'<g opacity="0">',
			buildAnimation(
				'animate',
				'attributeName="opacity"',
				begin,
				0.25,
				(p) => Math.round(p * 100) / 100,
			),
		);
		drawMark();
		target.push('</g>');
	}

	/**
	 * A bar chart with its value printed on every bar, so no gridlines are needed.
	 * bars: [{ label, value, highlight? }]; highlight bars are pink, the rest chalk.
	 * horizontal: bars run left to right with labels on the left (better on phones
	 * and for long labels). format turns a value into its printed label. Scale
	 * starts at zero.
	 */
	const BAR_GROW = 0.6; // seconds each bar takes to grow
	const BAR_STAGGER = 0.15; // seconds between one bar starting and the next
	function barChart({
		x,
		y,
		w,
		h,
		bars,
		max,
		format = (v) => String(v),
		horizontal = false,
		labelW = 120,
		size = 14,
	}) {
		const top = max ?? Math.max(...bars.map((b) => b.value));
		if (horizontal) {
			const rowH = h / bars.length;
			const barH = Math.min(36, rowH * 0.62);
			const room = w - labelW - 64;
			line(
				[
					[x + labelW, y],
					[x + labelW, y + h],
				],
				{ color: COLORS.muted, width: 1.5 },
			);
			bars.forEach((b, i) =>
				text(x + labelW - 10, y + rowH * (i + 0.5), b.label, {
					size,
					anchor: 'end',
					color: COLORS.paper,
				}),
			);
			buildLayers((live) =>
				bars.forEach((b, i) => {
					const cy = y + rowH * (i + 0.5);
					const bw = Math.max(3, (b.value / top) * room);
					const begin = i * BAR_STAGGER;
					grow(live, x + labelW, cy, 'x', begin, BAR_GROW, () =>
						scrap(x + labelW, cy - barH / 2, bw, barH, b.highlight ? COLORS.pink : COLORS.chalk),
					);
					fadeIn(live, begin + BAR_GROW, () =>
						text(x + labelW + bw + 8, cy, format(b.value), {
							size,
							anchor: 'start',
							weight: 700,
							color: b.highlight ? COLORS.pink : COLORS.paper,
						}),
					);
				}),
			);
			return;
		}
		const colW = w / bars.length;
		const barW = Math.min(64, colW * 0.6);
		const plotTop = y + size + 10;
		const base = y + h - size * 2.4;
		line(
			[
				[x, base],
				[x + w, base],
			],
			{ color: COLORS.muted, width: 1.5 },
		);
		buildLayers((live) =>
			bars.forEach((b, i) => {
				const cx = x + colW * (i + 0.5);
				const bh = Math.max(3, (b.value / top) * (base - plotTop));
				const begin = i * BAR_STAGGER;
				grow(live, cx, base, 'y', begin, BAR_GROW, () =>
					scrap(cx - barW / 2, base - bh, barW, bh, b.highlight ? COLORS.pink : COLORS.chalk),
				);
				fadeIn(live, begin + BAR_GROW, () =>
					text(cx, base - bh - size * 0.8, format(b.value), {
						size,
						weight: 700,
						color: b.highlight ? COLORS.pink : COLORS.paper,
					}),
				);
			}),
		);
		bars.forEach((b, i) => {
			const cx = x + colW * (i + 0.5);
			[b.label]
				.flat()
				.forEach((l, j) =>
					text(cx, base + size * 0.9 + j * size * 1.2, l, { size: size - 1, color: COLORS.paper }),
				);
		});
	}

	/**
	 * A line chart. series: [{ name, points: [[xValue, yValue], ...], highlight? }],
	 * all sharing one x and y scale. xTicks / yTicks: [[value, label], ...].
	 * The highlighted series is pink crayon, others chalk; each is named at its end.
	 */
	function lineChart({
		x,
		y,
		w,
		h,
		series,
		xMin,
		xMax,
		yMin = 0,
		yMax,
		xTicks = [],
		yTicks = [],
		size = 13,
		nameW = 90,
	}) {
		const plotW = w - 44 - nameW;
		const px = (v) => x + 44 + ((v - xMin) / (xMax - xMin)) * plotW;
		const py = (v) => y + h - 22 - ((v - yMin) / (yMax - yMin)) * (h - 34);
		line(
			[
				[x + 44, y + h - 22],
				[x + 44 + plotW, y + h - 22],
			],
			{ color: COLORS.muted, width: 1.5 },
		);
		yTicks.forEach(([v, l]) => {
			line(
				[
					[x + 44, py(v)],
					[x + 44 + plotW, py(v)],
				],
				{ color: '#2a2a2a', width: 1 },
			);
			text(x + 38, py(v), l, { size, anchor: 'end', color: COLORS.muted });
		});
		xTicks.forEach(([v, l]) => text(px(v), y + h - 6, l, { size, color: COLORS.muted }));
		// Every series draws left to right together behind one wipe, then each is named
		const DRAW = 1.4;
		buildLayers((live) => {
			if (live) {
				const wipeId = `${id}-wipe-${++wipeCount}`;
				const left = x + 44 - 8;
				const full = plotW + 16;
				target.push(
					`<clipPath id="${wipeId}"><rect x="${n(left)}" y="${n(y - 8)}" width="0" height="${n(h + 16)}">`,
					buildAnimation('animate', 'attributeName="width"', 0, DRAW, (p) => n(p * full)),
					`</rect></clipPath><g clip-path="url(#${wipeId})">`,
				);
			}
			series.forEach((s) => {
				const color = s.highlight ? COLORS.pink : COLORS.chalk;
				const d = s.points.map(([a, b], i) => `${i ? 'L' : 'M'}${n(px(a))},${n(py(b))}`).join(' ');
				target.push('<g class="d-flow">');
				stroke(d, color, 3.5);
				target.push('</g>');
			});
			if (live) target.push('</g>');
			series.forEach((s) => {
				const color = s.highlight ? COLORS.pink : COLORS.chalk;
				const [lx, ly] = s.points[s.points.length - 1];
				fadeIn(live, DRAW, () =>
					text(px(lx) + 8, py(ly), s.name, { size, anchor: 'start', weight: 700, color }),
				);
			});
		});
	}

	/** A section title inside a figure: Anton caps. */
	function heading(x, y, content, opts = {}) {
		text(x, y, content, { size: 28, font: 'display', anchor: 'start', upper: true, ...opts });
	}

	/**
	 * Every arrow and callout must stay clear of text and run between boxes, not
	 * through them: an arrow over a label hides it, and one that ends inside a box
	 * looks buried. The ends of a line may touch the box it starts or stops at.
	 */
	function checkLines() {
		const inside = (px, py, r, pad) =>
			px > r.x + pad && px < r.x + r.w - pad && py > r.y + pad && py < r.y + r.h - pad;
		const near = (px, py, t) => px > t.x0 - 1 && px < t.x1 + 1 && py > t.y0 - 1 && py < t.y1 + 1;
		lines.forEach(({ points, kind }) => {
			const what = kind === 'callout' ? 'A callout arrow' : 'An arrow';
			const found = new Set();
			const total = points
				.slice(1)
				.reduce((sum, p, i) => sum + Math.hypot(p[0] - points[i][0], p[1] - points[i][1]), 0);
			let travelled = 0;
			for (let i = 0; i < points.length - 1; i++) {
				const [ax, ay] = points[i];
				const [bx, by] = points[i + 1];
				const length = Math.hypot(bx - ax, by - ay);
				for (let d = 0; d <= length; d += 2) {
					const px = ax + ((bx - ax) * d) / (length || 1);
					const py = ay + ((by - ay) * d) / (length || 1);
					const along = travelled + d;
					// Skip the ends, where a line meets its box and the callout meets its target
					const endRoom = kind === 'callout' ? 12 : 6;
					if (along < endRoom || along > total - endRoom) continue;
					textBoxes.forEach((t) => near(px, py, t) && found.add(`${what} runs over "${t.label}"`));
					boxRects.forEach(
						(r) => inside(px, py, r, 6) && found.add(`${what} runs through the "${r.label}" box`),
					);
				}
				travelled += length;
			}
			if (kind === 'arrow') {
				[points[0], points[points.length - 1]].forEach(([px, py]) =>
					boxRects.forEach(
						(r) =>
							inside(px, py, r, 4) && found.add(`${what} ends buried inside the "${r.label}" box`),
					),
				);
			}
			found.forEach((issue) => issues.push(issue));
		});
		// Text either sits inside a box or clear of it: half on, half off covers the edge
		textBoxes.forEach((t) =>
			boxRects.forEach((r) => {
				const overlaps = t.x0 < r.x + r.w && t.x1 > r.x && t.y0 < r.y + r.h && t.y1 > r.y;
				const inside =
					t.x0 >= r.x - 2 && t.x1 <= r.x + r.w + 2 && t.y0 >= r.y - 2 && t.y1 <= r.y + r.h + 2;
				if (overlaps && !inside)
					issues.push(`"${t.label}" runs into the edge of the "${r.label}" box`);
			}),
		);
	}

	/**
	 * SVG markup the kit has no part for: an animated figure's moving pieces, on top of
	 * everything, or with layer 'groups' something that sits under the text (a chart's panel).
	 */
	function raw(markup, layer = 'callouts') {
		layers[layer].push(markup);
	}

	function toString(label) {
		checkLines();
		return [
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeXml(label)}">`,
			`<defs>${crayonFilters.join('')}</defs>`,
			`<rect width="${width}" height="${height}" fill="${COLORS.ink}"/>`,
			...layers.groups,
			...layers.boxes,
			...layers.lines,
			...layers.callouts,
			'</svg>',
			'',
		].join('\n');
	}

	return {
		code,
		table,
		barChart,
		lineChart,
		buildLayers,
		fadeIn,
		line,
		dot,
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
		raw,
		toString,
	};
}
