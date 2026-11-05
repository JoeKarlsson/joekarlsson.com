// A short pink crayon line that follows the mouse and shortens away behind it, so
// every page feels touched. As the line ages it curls: each bit of it swings
// round a circle that grows with age, turning faster the further along the line
// it is, so the tail just behind the cursor is straight and the end coils into
// curlicues before it fades. Mouse only (touch scrolls), never over the "Make a mark"
// board (it draws there already), and off under reduced motion or the pause button.
import { smoothPath } from './drawing-board';
import { isMotionPaused } from './pause-motion';

// How long a point of the trail lives, in ms
export const TRAIL_LIFETIME_MS = 800;
// The widest a curl gets, in px, reached as a point dies
const CURL_RADIUS = 16;
// How far round the curl turns per px of line. Radius x turn > 1 makes loops.
const CURL_TURN = 0.14;
// Points are filled in this close together, so fast moves still loop smoothly
const POINT_SPACING = 4;

// `distance` is how far along the line the point is, in px
export type TimedPoint = { x: number; y: number; time: number; distance: number };

/** The points still young enough to draw at `now`. */
export function livePoints(points: TimedPoint[], now: number): TimedPoint[] {
	return points.filter((point) => now - point.time < TRAIL_LIFETIME_MS);
}

/** Where a point is drawn at `now`: on the cursor's path when new, then swinging
 * further out round its curl as it ages. */
export function curledPoint(point: TimedPoint, now: number): [number, number] {
	const age = Math.min((now - point.time) / TRAIL_LIFETIME_MS, 1);
	// Square root, so curls open out quickly and loop instead of scalloping
	const radius = CURL_RADIUS * Math.sqrt(age);
	const angle = point.distance * CURL_TURN;
	return [point.x + radius * Math.cos(angle), point.y + radius * Math.sin(angle)];
}

/** The points for a move from the last point to (x, y), filled in every
 * POINT_SPACING px so the curls stay round however fast the mouse moves. */
export function pointsAlongMove(
	last: TimedPoint | undefined,
	x: number,
	y: number,
	time: number,
): TimedPoint[] {
	if (!last) return [{ x, y, time, distance: 0 }];
	const length = Math.hypot(x - last.x, y - last.y);
	const steps = Math.max(1, Math.ceil(length / POINT_SPACING));
	return Array.from({ length: steps }, (_, i) => {
		const t = (i + 1) / steps;
		return {
			x: last.x + (x - last.x) * t,
			y: last.y + (y - last.y) * t,
			time: last.time + (time - last.time) * t,
			distance: last.distance + length * t,
		};
	});
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
		const now = performance.now();
		points = livePoints(points, now);
		trail.setAttribute('d', smoothPath(points.map((point) => curledPoint(point, now))));
		frame = points.length ? requestAnimationFrame(render) : 0;
	};

	window.addEventListener('pointermove', (event) => {
		if (event.pointerType !== 'mouse' || reducedMotion.matches || isMotionPaused()) return;
		if ((event.target as Element).closest?.('.drawing-board')) return;
		points.push(...pointsAlongMove(points.at(-1), event.clientX, event.clientY, performance.now()));
		if (!frame) frame = requestAnimationFrame(render);
	});
}
