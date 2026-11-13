// Crayon marks notice the mouse: when it comes near a self-drawing scribble
// (.redraw / .redraw-strokes from Scribble.astro), the mark starts drawing itself
// again from its first stroke. It fires once per approach, with a cooldown, so a
// cursor resting beside a mark doesn't keep restarting it. Under reduced motion or
// the pause button the marks aren't animating, so there's nothing to restart. A mark
// beside controls (.ignores-mouse) skips this: reaching for a button would redraw it.
import { isMotionPaused } from './pause-motion';

const NOTICE_DISTANCE_PX = 70;
// The mouse has to move this far away before the mark can notice it again
const FORGET_DISTANCE_PX = 180;
const COOLDOWN_MS = 2500;
const DRAW_ANIMATIONS = new Set(['redraw', 'redraw-stroke']);

/** Distance from a point to a rectangle (0 inside it). */
export function distanceToRect(
	x: number,
	y: number,
	rect: { left: number; top: number; right: number; bottom: number },
): number {
	const dx = Math.max(rect.left - x, 0, x - rect.right);
	const dy = Math.max(rect.top - y, 0, y - rect.bottom);
	return Math.hypot(dx, dy);
}

/** Restart a mark's draw-in: every stroke goes back to where the first one starts. */
function redrawNow(mark: SVGSVGElement) {
	const animations = mark
		.getAnimations({ subtree: true })
		.filter(
			(animation): animation is CSSAnimation =>
				animation instanceof CSSAnimation && DRAW_ANIMATIONS.has(animation.animationName),
		);
	if (!animations.length) return;
	const start = Math.min(
		...animations.map((animation) => Number(animation.effect!.getTiming().delay)),
	);
	animations.forEach((animation) => (animation.currentTime = start));
}

export function initScribbleNotice(): void {
	const marks = [
		...document.querySelectorAll<SVGSVGElement>(
			'svg:is(.redraw, .redraw-strokes):not(.ignores-mouse)',
		),
	];
	if (!marks.length) return;
	const near = new Set<SVGSVGElement>();
	const lastNoticed = new WeakMap<SVGSVGElement, number>();
	let pointer = { x: 0, y: 0 };
	let frame = 0;

	const check = () => {
		frame = 0;
		if (isMotionPaused()) return;
		const now = performance.now();
		for (const mark of marks) {
			const rect = mark.getBoundingClientRect();
			if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
			const distance = distanceToRect(pointer.x, pointer.y, rect);
			if (distance > FORGET_DISTANCE_PX) near.delete(mark);
			else if (distance < NOTICE_DISTANCE_PX && !near.has(mark)) {
				near.add(mark);
				if (now - (lastNoticed.get(mark) ?? -Infinity) > COOLDOWN_MS) {
					lastNoticed.set(mark, now);
					redrawNow(mark);
				}
			}
		}
	};

	window.addEventListener('pointermove', (event) => {
		if (event.pointerType !== 'mouse') return;
		pointer = { x: event.clientX, y: event.clientY };
		if (!frame) frame = requestAnimationFrame(check);
	});
}
