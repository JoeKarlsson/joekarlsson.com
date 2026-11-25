// Joe's JK mark, drawn into each of his diagrams and charts so a screenshot, a crop
// or a saved copy still says whose it is (DECISIONS 2026-11-24: the off-register logo
// at 40%, inside the frame). scripts/watermark-diagrams.mjs picks each diagram's
// clear spot and writes this group into its SVG file. Paths only, no filter and no
// ids, so two diagrams on one page can't collide.

// brand/logo/svg/off-register/jk-for-dark.svg, without its wobble filter
const JK_PATH =
	'M26.59 100.91 Q19.83 100.91 14.26 98.3 Q8.69 95.68 5.43 90.54 Q2.16 85.4 2.16 77.9 L2.16 52.84 L21.93 52.84 L21.93 76.7 Q21.93 79.32 22.98 80.91 Q24.03 82.5 26.36 82.5 Q30.85 82.5 30.85 76.99 L30.85 0 L51.02 0 L51.02 75 Q51.02 82.95 47.9 88.78 Q44.77 94.6 39.26 97.76 Q33.75 100.91 26.59 100.91 Z M58.69 100 L58.69 0 L78.47 0 L78.47 40.06 L87.78 0 L107.9 0 L96.7 45.8 L110.23 100 L89.49 100 L78.58 51.59 L78.58 100 Z';
/** The mark's own size in path units, outline included. */
export const MARK_WIDTH = 116;
export const MARK_HEIGHT = 106;

const round = (n) => Math.round(n * 100) / 100;

/** The mark as an SVG group, its top-left corner at (x, y), `width` user units wide. */
export function jkMark(x, y, width) {
	const scale = Math.round((width / MARK_WIDTH) * 1000) / 1000;
	return (
		`<g class="jk-mark" opacity="0.4" aria-hidden="true" transform="translate(${round(x)} ${round(y)}) scale(${scale})">` +
		`<path d="${JK_PATH}" fill="#ff4fd8"/>` +
		`<path d="${JK_PATH}" fill="none" stroke="#fff" stroke-width="3.4" stroke-linejoin="round" transform="translate(-5.6 -4.5)"/>` +
		`</g>`
	);
}
