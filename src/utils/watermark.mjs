// Joe's JK mark under the bottom-right corner of his own diagrams and charts, so a
// screenshot or a saved copy still says whose it is (DECISIONS 2026-11-24: option A,
// the off-register logo at 40%). Drawn into the SVG itself, so the page, the
// lightbox copy and the email JPEG (svg-to-email.mjs) all carry it. It gets its own
// strip below the drawing: pinned inside the corner it covered boxes and labels in
// about 40% of the site's diagrams. Paths only, no filter and no ids, so two
// diagrams on one page can't collide.

// brand/logo/svg/off-register/jk-for-dark.svg, without its wobble filter
const JK_PATH =
	'M26.59 100.91 Q19.83 100.91 14.26 98.3 Q8.69 95.68 5.43 90.54 Q2.16 85.4 2.16 77.9 L2.16 52.84 L21.93 52.84 L21.93 76.7 Q21.93 79.32 22.98 80.91 Q24.03 82.5 26.36 82.5 Q30.85 82.5 30.85 76.99 L30.85 0 L51.02 0 L51.02 75 Q51.02 82.95 47.9 88.78 Q44.77 94.6 39.26 97.76 Q33.75 100.91 26.59 100.91 Z M58.69 100 L58.69 0 L78.47 0 L78.47 40.06 L87.78 0 L107.9 0 L96.7 45.8 L110.23 100 L89.49 100 L78.58 51.59 L78.58 100 Z';
const MARK_WIDTH = 116; // the path's own width, outline included
const MARK_HEIGHT = 106;

const round = (n) => Math.round(n * 100) / 100;

/** The SVG markup, a strip taller, with the JK mark in that strip at the right. Unchanged when it has no usable viewBox. */
export function withWatermark(svg) {
	const open = svg.match(/<svg\b[^>]*>/);
	const viewBox = open?.[0].match(/\bviewBox="([^"]+)"/);
	if (!viewBox) return svg;
	const [minX, minY, width, height] = viewBox[1]
		.trim()
		.split(/[\s,]+/)
		.map(Number);
	if (![minX, minY, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return svg;
	const scale = (width * 0.06) / MARK_WIDTH; // about 6% of the width, as in the mockup
	const markHeight = MARK_HEIGHT * scale;
	const strip = markHeight * 1.4;
	const x = minX + width * 0.985 - MARK_WIDTH * scale;
	const y = minY + height + strip - markHeight;
	const tag = open[0]
		.replace(viewBox[0], `viewBox="${minX} ${minY} ${width} ${round(height + strip)}"`)
		// A fixed height attribute grows with the viewBox, so the drawing keeps its size
		.replace(
			/\bheight="([\d.]+)"/,
			(_, h) => `height="${round((Number(h) * (height + strip)) / height)}"`,
		);
	const mark =
		`<g class="jk-mark" opacity="0.4" aria-hidden="true" transform="translate(${round(x)} ${round(y)}) scale(${round(scale * 1000) / 1000})">` +
		`<path d="${JK_PATH}" fill="#ff4fd8"/>` +
		`<path d="${JK_PATH}" fill="none" stroke="#fff" stroke-width="3.4" stroke-linejoin="round" transform="translate(-5.6 -4.5)"/>` +
		`</g>`;
	const end = svg.lastIndexOf('</svg>');
	if (end === -1) return svg;
	return (
		svg.slice(0, open.index) +
		tag +
		svg.slice(open.index + open[0].length, end) +
		mark +
		svg.slice(end)
	);
}
