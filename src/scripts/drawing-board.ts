// Visitor strokes on the "Make a mark" board (src/components/DrawingBoard.astro).
// A mouse draws whenever it moves over the board; a pen draws while pressed. A finger
// draws only once drawing is on (a crayon tapped on a touch screen sets data-drawing,
// Done clears it), so until then a swipe across the board scrolls the page. Each
// stroke erases itself (.board-stroke in motion.css) and is removed when that
// animation ends.

type Point = [number, number];

// A stroke restarts after this many points, so old segments can start fading
const MAX_POINTS_PER_STROKE = 90;

/** A smooth SVG path through the points: quadratic curves via each midpoint. */
export function smoothPath(points: Point[]): string {
	if (points.length === 0) return '';
	const fmt = ([x, y]: Point) => `${x.toFixed(1)},${y.toFixed(1)}`;
	let d = `M${fmt(points[0])}`;
	for (let i = 1; i < points.length - 1; i++) {
		const [x, y] = points[i];
		const [nextX, nextY] = points[i + 1];
		d += ` Q${fmt(points[i])} ${fmt([(x + nextX) / 2, (y + nextY) / 2])}`;
	}
	return d;
}

export function initDrawingBoard(board: HTMLElement): void {
	const pad = board.querySelector<SVGSVGElement>('.drawing-board-pad');
	const layer = pad?.querySelector('g');
	if (!pad || !layer) throw new Error('Drawing board is missing its .drawing-board-pad layer');

	let color = board.querySelector<HTMLElement>('[data-crayon][aria-pressed="true"]')?.dataset
		.crayon;
	let stroke: SVGPathElement | null = null;
	let points: Point[] = [];
	let pressed = false;

	const isTouchScreen = window.matchMedia('(pointer: coarse)');
	const pen = board.querySelector<HTMLElement>('.board-pen');
	const paintPen = () => pen?.style.setProperty('--pen-color', color ?? '#ff4fd8');
	let pulsePending = false;
	paintPen();

	board.querySelectorAll<HTMLButtonElement>('[data-crayon]').forEach((button) => {
		button.addEventListener('pointerdown', (event) => event.stopPropagation());
		button.addEventListener('click', () => {
			color = button.dataset.crayon;
			board
				.querySelectorAll('[data-crayon]')
				.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
			if (isTouchScreen.matches) board.setAttribute('data-drawing', '');
			// The pen dot takes the new color, and pulses once it's back over the board
			paintPen();
			pulsePending = true;
		});
	});

	const done = board.querySelector<HTMLButtonElement>('[data-board-done]');
	done?.addEventListener('pointerdown', (event) => event.stopPropagation());
	done?.addEventListener('click', () => board.removeAttribute('data-drawing'));

	function startStroke() {
		points = [];
		stroke = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		stroke.setAttribute('pathLength', '1');
		stroke.setAttribute('class', 'board-stroke');
		stroke.setAttribute('stroke', color ?? '#ff4fd8');
		stroke.setAttribute('stroke-width', (6 + Math.random() * 6).toFixed(1));
		layer!.appendChild(stroke);
	}

	board.addEventListener('pointerdown', () => {
		pressed = true;
		stroke = null;
	});
	window.addEventListener('pointerup', () => {
		pressed = false;
		stroke = null;
	});
	// The browser took the touch over (a scroll, a pinch): end the stroke
	window.addEventListener('pointercancel', () => {
		pressed = false;
		stroke = null;
	});
	board.addEventListener('pointerleave', () => {
		stroke = null;
		board.removeAttribute('data-pen');
	});
	board.addEventListener('pointermove', (event) => {
		if (event.pointerType === 'mouse' && pen) {
			// Over the crayons and Done the normal pointer comes back
			const overControls = (event.target as Element).closest('button, .board-hint');
			board.toggleAttribute('data-pen', !overControls);
			if (!overControls && pulsePending) {
				pulsePending = false;
				pen.classList.remove('board-pen-pulse');
				void pen.offsetWidth;
				pen.classList.add('board-pen-pulse');
			}
			const boardBox = board.getBoundingClientRect();
			pen.style.translate = `${event.clientX - boardBox.left}px ${event.clientY - boardBox.top}px`;
		}
		if (event.pointerType === 'touch' && !board.hasAttribute('data-drawing')) return;
		if (event.pointerType !== 'mouse' && !pressed) return;
		const box = pad.getBoundingClientRect();
		if (!stroke || points.length > MAX_POINTS_PER_STROKE) startStroke();
		points.push([event.clientX - box.left, event.clientY - box.top]);
		stroke!.setAttribute('d', smoothPath(points));
	});
	layer.addEventListener('animationend', (event) => (event.target as Element).remove());
}
