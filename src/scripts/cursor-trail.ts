// A short pink crayon line that follows the mouse and shortens away behind it, so
// every page feels touched. Mouse only (touch scrolls), never over the "Make a mark"
// board (it draws there already), and off under reduced motion or the pause button.
import { smoothPath } from './drawing-board';
import { isMotionPaused } from './pause-motion';

// How long a point of the trail lives, in ms
export const TRAIL_LIFETIME_MS = 650;

export type TimedPoint = { x: number; y: number; time: number };

/** The points still young enough to draw at `now`. */
export function livePoints(points: TimedPoint[], now: number): TimedPoint[] {
	return points.filter((point) => now - point.time < TRAIL_LIFETIME_MS);
}

/** No trail while reading: the blog and the newsletter, index pages and all (Joe). */
export function hasCursorTrail(pathname: string): boolean {
	return !/^\/(blog|newsletter)(\/|$)/.test(pathname);
}

export function initCursorTrail(): void {
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	overlay.setAttribute('aria-hidden', 'true');
	overlay.style.cssText =
		'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60;overflow:visible';
	const trail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	Object.entries({
		fill: 'none',
		stroke: '#ff4fd8',
		'stroke-width': '5',
		'stroke-linecap': 'round',
		'stroke-linejoin': 'round',
		filter: 'url(#crayon)',
	}).forEach(([name, value]) => trail.setAttribute(name, value));
	overlay.appendChild(trail);
	document.body.appendChild(overlay);

	let points: TimedPoint[] = [];
	let frame = 0;

	const render = () => {
		points = livePoints(points, performance.now());
		trail.setAttribute('d', smoothPath(points.map(({ x, y }) => [x, y])));
		frame = points.length ? requestAnimationFrame(render) : 0;
	};

	window.addEventListener('pointermove', (event) => {
		if (event.pointerType !== 'mouse' || reducedMotion.matches || isMotionPaused()) return;
		if ((event.target as Element).closest?.('.drawing-board')) return;
		points.push({ x: event.clientX, y: event.clientY, time: performance.now() });
		if (!frame) frame = requestAnimationFrame(render);
	});
}
