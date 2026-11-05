// A short pink crayon line that follows the mouse and shortens away behind it, so
// every page feels touched. As the line ages it curls: each bit of it swings
// round a circle that grows with age, so the tail just behind the cursor is
// straight and the end coils into curlicues before it fades. The curl wanders
// like a hand would: every so often it picks a new turn and size at random (a
// tight loop, a lazy swoop, a curl the other way) and eases into it. Mouse only
// (touch scrolls), never over the "Make a mark" board (it draws there already),
// and off under reduced motion or the pause button.
import { smoothPath } from './drawing-board';
import { isMotionPaused } from './pause-motion';

// How long a point of the trail lives, in ms
export const TRAIL_LIFETIME_MS = 800;
// Points are filled in this close together, so fast moves still loop smoothly
const POINT_SPACING = 4;
// How far round the curl turns per px of line, at its laziest and tightest.
// Turn x reach > 1 makes a loop; below that it's a swoop.
const TURN_RANGE = [0.03, 0.26] as const;
// How wide a curl gets, in px, reached as a point dies
const REACH_RANGE = [5, 24] as const;
// How much line, in px, before the curl picks a new turn and reach
const STRETCH_RANGE = [24, 90] as const;
// How quickly the curl eases toward its new turn and reach, per point
const EASE = 0.2;

type Random = () => number;

// The wandering curl: where it's heading and how far until it changes its mind
export type Curl = {
	turn: number;
	reach: number;
	targetTurn: number;
	targetReach: number;
	untilChange: number;
};

// `angle` is where round its curl the point sits; `reach` is the curl's size there
export type TimedPoint = { x: number; y: number; time: number; angle: number; reach: number };

const between = ([low, high]: readonly [number, number], random: Random) =>
	low + (high - low) * random();

function pickTargets(curl: Curl, random: Random): void {
	curl.targetTurn = between(TURN_RANGE, random) * (random() < 0.5 ? -1 : 1);
	curl.targetReach = between(REACH_RANGE, random);
	curl.untilChange = between(STRETCH_RANGE, random);
}

/** A fresh curl, already at its first random turn and reach. */
export function newCurl(random: Random = Math.random): Curl {
	const curl = { turn: 0, reach: 0, targetTurn: 0, targetReach: 0, untilChange: 0 };
	pickTargets(curl, random);
	curl.turn = curl.targetTurn;
	curl.reach = curl.targetReach;
	return curl;
}

/** Moves the curl on by `length` px of line, picking new targets when it's due. */
export function advanceCurl(curl: Curl, length: number, random: Random = Math.random): void {
	curl.untilChange -= length;
	if (curl.untilChange <= 0) pickTargets(curl, random);
	curl.turn += (curl.targetTurn - curl.turn) * EASE;
	curl.reach += (curl.targetReach - curl.reach) * EASE;
}

/** The points still young enough to draw at `now`. */
export function livePoints(points: TimedPoint[], now: number): TimedPoint[] {
	return points.filter((point) => now - point.time < TRAIL_LIFETIME_MS);
}

/** Where a point is drawn at `now`: on the cursor's path when new, then swinging
 * further out round its curl as it ages. */
export function curledPoint(point: TimedPoint, now: number): [number, number] {
	const age = Math.min((now - point.time) / TRAIL_LIFETIME_MS, 1);
	// Square root, so curls open out quickly and loop instead of scalloping
	const radius = point.reach * Math.sqrt(age);
	return [point.x + radius * Math.cos(point.angle), point.y + radius * Math.sin(point.angle)];
}

/** The points for a move from the last point to (x, y), filled in every
 * POINT_SPACING px so the curls stay round however fast the mouse moves, each
 * turned on round the wandering curl. */
export function pointsAlongMove(
	last: TimedPoint | undefined,
	x: number,
	y: number,
	time: number,
	curl: Curl,
	random: Random = Math.random,
): TimedPoint[] {
	if (!last) return [{ x, y, time, angle: random() * Math.PI * 2, reach: curl.reach }];
	const length = Math.hypot(x - last.x, y - last.y);
	const steps = Math.max(1, Math.ceil(length / POINT_SPACING));
	let angle = last.angle;
	return Array.from({ length: steps }, (_, i) => {
		const t = (i + 1) / steps;
		advanceCurl(curl, length / steps, random);
		angle += curl.turn * (length / steps);
		return {
			x: last.x + (x - last.x) * t,
			y: last.y + (y - last.y) * t,
			time: last.time + (time - last.time) * t,
			angle,
			reach: curl.reach,
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
	const curl = newCurl();
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
		points.push(
			...pointsAlongMove(points.at(-1), event.clientX, event.clientY, performance.now(), curl),
		);
		if (!frame) frame = requestAnimationFrame(render);
	});
}
