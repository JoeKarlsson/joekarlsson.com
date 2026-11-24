/**
 * Hover cards for the dots in a post's inline charts (scripts/diagrams). A chart marks a
 * group of dots with data-tips: one record per <circle>, in order, as "title|year|rating|kept"
 * lines. The card shows the dot nearest the pointer within a few units, so 2px dots don't need
 * pixel-perfect aim, and a pink ring marks it. Tapping works the same on touch screens.
 *
 * One listener on the document, not one per chart, so it also works on the copy of a chart the
 * lightbox (ImageLightbox.astro) shows when a reader clicks to zoom.
 *
 * Styled here rather than in article.css: only posts with such charts pay for it, and the
 * article stylesheet is near its budget (tests/bundle-size.test.ts).
 */
const REACH = 12; // SVG units: how far from a dot the pointer can be and still pick it
const TAP_MS = 600; // how long a touch on a dot keeps the lightbox from opening or closing

// -Infinity, not 0: performance.now() starts at 0 when the page loads, so 0 would read as a
// dot tapped at load and swallow every lightbox click in the page's first 600ms
let lastDotTap = -Infinity;
/**
 * True right after a touch picked a chart dot. The lightbox (ImageLightbox.astro,
 * lightbox-gestures.ts) checks it so that tap shows the card instead of opening or closing
 * the zoomed view; a mouse click still zooms.
 */
export const tappedChartDot = (): boolean => performance.now() - lastDotTap < TAP_MS;

interface Dot {
	x: number;
	y: number;
	tip: string[];
}

function cardElement(): HTMLDivElement {
	const card = document.createElement('div');
	card.className = 'chart-tip';
	Object.assign(card.style, {
		position: 'fixed',
		zIndex: '1000',
		pointerEvents: 'none',
		display: 'none',
		maxWidth: '260px',
		padding: '6px 10px',
		background: '#ededed',
		color: '#000',
		borderRadius: '3px',
		boxShadow: '3px 3px 0 #ff4fd8',
		font: "13px/1.35 var(--font-hanken-grotesk, 'Hanken Grotesk'), Arial, sans-serif",
	});
	document.body.append(card);
	return card;
}

/** The card's text, built as nodes so a title is never parsed as HTML. */
function describe([title, year, rating, kept]: string[]): Node[] {
	const name = document.createElement('strong');
	name.textContent = title;
	const lines = [`${kept}% of the script kept`];
	if (rating) lines.unshift(`IMDb rating ${Number(rating).toFixed(1)}`);
	return [name, ` (${year})`, ...lines.flatMap((line) => [document.createElement('br'), line])].map(
		(part) => (typeof part === 'string' ? document.createTextNode(part) : part),
	);
}

/** Each tip group's dots, read once per group (a lightbox copy is a new group). */
const dotsOf = new WeakMap<SVGGElement, Dot[]>();
function dots(group: SVGGElement): Dot[] {
	let found = dotsOf.get(group);
	if (!found) {
		const records = (group.dataset.tips ?? '').split('\n');
		found = [...group.querySelectorAll('circle')].map((c, i) => ({
			x: Number(c.getAttribute('cx')),
			y: Number(c.getAttribute('cy')),
			tip: (records[i] ?? '').split('|'),
		}));
		dotsOf.set(group, found);
	}
	return found;
}

export function initChartTips(): void {
	if (!document.querySelector('figure.diagram g[data-tips]')) return;
	const card = cardElement();
	const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	ring.setAttribute('r', '6');
	ring.setAttribute('fill', 'none');
	ring.setAttribute('stroke', '#ff4fd8');
	ring.setAttribute('stroke-width', '2.5');
	ring.setAttribute('pointer-events', 'none');

	const hide = () => {
		card.style.display = 'none';
		ring.remove();
	};
	const show = (event: PointerEvent) => {
		const svg = (event.target as Element | null)?.closest?.('svg');
		const group = svg?.querySelector<SVGGElement>('g[data-tips]');
		const matrix = svg?.getScreenCTM();
		if (!svg || !group || !matrix) return hide();
		const at = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
		let best: Dot | null = null;
		let bestDistance = REACH * REACH;
		for (const dot of dots(group)) {
			const distance = (dot.x - at.x) ** 2 + (dot.y - at.y) ** 2;
			if (distance < bestDistance) {
				bestDistance = distance;
				best = dot;
			}
		}
		if (!best) return hide();
		if (event.type === 'pointerdown' && event.pointerType !== 'mouse')
			lastDotTap = performance.now();
		ring.setAttribute('cx', String(best.x));
		ring.setAttribute('cy', String(best.y));
		if (ring.ownerSVGElement !== svg) svg.append(ring);
		// An open <dialog> (the lightbox) sits in the top layer, above any z-index: the card
		// has to live inside it to show
		const host = svg.closest('dialog') ?? document.body;
		if (card.parentElement !== host) host.append(card);
		card.replaceChildren(...describe(best.tip));
		card.style.display = 'block';
		const left = Math.min(event.clientX + 14, window.innerWidth - card.offsetWidth - 8);
		const top = event.clientY - card.offsetHeight - 12;
		card.style.left = `${left}px`;
		card.style.top = `${top < 8 ? event.clientY + 18 : top}px`;
	};
	document.addEventListener('pointermove', show, { passive: true });
	document.addEventListener('pointerdown', show, { passive: true });
	document.addEventListener('scroll', hide, { passive: true });
	document.addEventListener('keydown', (event) => event.key === 'Escape' && hide());
}
