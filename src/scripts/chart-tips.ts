/**
 * Hover cards for the dots in a post's inline charts (scripts/diagrams). A chart marks a
 * group of dots with data-tips: one record per <circle>, in order, as "title|year|rating|kept"
 * lines. The card shows the dot nearest the pointer within a few units, so 2px dots don't need
 * pixel-perfect aim, and a pink ring marks it. Tapping works the same on touch screens.
 *
 * Styled here rather than in article.css: only posts with such charts pay for it, and the
 * article stylesheet is near its budget (tests/bundle-size.test.ts).
 */
const REACH = 12; // SVG units: how far from a dot the pointer can be and still pick it

interface Dot {
	x: number;
	y: number;
	tip: string[];
}

function cardElement(): HTMLDivElement {
	const card = document.createElement('div');
	card.className = 'chart-tip';
	card.setAttribute('role', 'status');
	card.setAttribute('aria-live', 'polite');
	Object.assign(card.style, {
		position: 'fixed',
		zIndex: '60',
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
	const parts = [`${kept}% of the script kept`];
	if (rating) parts.unshift(`IMDb ${rating}`);
	return [name, ` (${year})`, document.createElement('br'), parts.join(' · ')].map((part) =>
		typeof part === 'string' ? document.createTextNode(part) : part,
	);
}

export function initChartTips(): void {
	const groups = document.querySelectorAll<SVGGElement>('figure.diagram g[data-tips]');
	if (!groups.length) return;
	const card = cardElement();

	for (const group of groups) {
		const svg = group.ownerSVGElement;
		if (!svg) continue;
		const records = (group.dataset.tips ?? '').split('\n');
		const dots: Dot[] = [...group.querySelectorAll('circle')].map((c, i) => ({
			x: Number(c.getAttribute('cx')),
			y: Number(c.getAttribute('cy')),
			tip: (records[i] ?? '').split('|'),
		}));
		const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		ring.setAttribute('r', '6');
		ring.setAttribute('fill', 'none');
		ring.setAttribute('stroke', '#ff4fd8');
		ring.setAttribute('stroke-width', '2.5');
		ring.setAttribute('pointer-events', 'none');
		ring.style.display = 'none';
		svg.append(ring);

		const hide = () => {
			card.style.display = 'none';
			ring.style.display = 'none';
		};
		const show = (event: PointerEvent) => {
			const matrix = svg.getScreenCTM();
			if (!matrix) return;
			const at = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
			let best: Dot | null = null;
			let bestDistance = REACH * REACH;
			for (const dot of dots) {
				const distance = (dot.x - at.x) ** 2 + (dot.y - at.y) ** 2;
				if (distance < bestDistance) {
					bestDistance = distance;
					best = dot;
				}
			}
			if (!best) return hide();
			ring.setAttribute('cx', String(best.x));
			ring.setAttribute('cy', String(best.y));
			ring.style.display = '';
			card.replaceChildren(...describe(best.tip));
			card.style.display = 'block';
			const left = Math.min(event.clientX + 14, window.innerWidth - card.offsetWidth - 8);
			const top = event.clientY - card.offsetHeight - 12;
			card.style.left = `${left}px`;
			card.style.top = `${top < 8 ? event.clientY + 18 : top}px`;
		};
		svg.addEventListener('pointermove', show);
		svg.addEventListener('pointerdown', show);
		svg.addEventListener('pointerleave', hide);
	}
}
