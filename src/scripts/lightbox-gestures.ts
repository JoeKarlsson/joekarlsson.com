// Touch and mouse gestures for the enlarged picture or diagram (ImageLightbox.astro):
// - swipe down to close: the picture follows the finger and the page shows through as it
//   goes; let go past SWIPE_CLOSE_PX (or flick) and it falls away, otherwise it settles back
// - pinch, double-tap or ctrl+scroll (a trackpad pinch) to zoom up to MAX_ZOOM, drag to
//   pan, rubber-banding past the edges
// - a single tap closes, after DOUBLE_TAP_MS so a second tap can zoom instead
// While a finger is down nothing tweens (#14 in ~/.claude/knowledge/web-motion.md); only
// the release animates. Under reduced motion the release lands at once.
import { rubberBand, rubberClamp } from '../utils/rubber-band';

const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;
const DOUBLE_TAP_MS = 250;
const TAP_SLOP_PX = 6;
const SWIPE_CLOSE_PX = 120;
const FLICK_PX_PER_MS = 0.6;
const SETTLE = 'transform 0.22s var(--ease-enter)';
const FALL_AWAY_MS = 175;

interface LightboxGestures {
	/** Back to unzoomed and in place, at once: call before opening or a morph close. */
	reset(): void;
}

export function initLightboxGestures(
	dialog: HTMLDialogElement,
	shown: () => HTMLElement | SVGSVGElement,
	close: (how: 'morph' | 'fell-away') => void,
): LightboxGestures {
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	let scale = 1;
	let x = 0;
	let y = 0;

	const paint = (transition = 'none') => {
		const picture = shown();
		picture.style.transition = reducedMotion.matches ? 'none' : transition;
		picture.style.transform =
			scale === 1 && x === 0 && y === 0 ? '' : `translate(${x}px, ${y}px) scale(${scale})`;
	};
	// How much of the page shows through while swiping down: 1 is none
	const fade = (opacity: number) => dialog.style.setProperty('--lightbox-fade', String(opacity));

	const reset = () => {
		clearTimeout(tapTimer);
		scale = 1;
		x = 0;
		y = 0;
		paint();
		fade(1);
	};

	// How far a picture at the current scale can move before its edges come inside the
	// screen. fitToScreen (ImageLightbox.astro) sets its unscaled size in px.
	const panLimits = () => {
		const picture = shown();
		return {
			x: Math.max(0, (parseFloat(picture.style.width) * scale - dialog.clientWidth) / 2),
			y: Math.max(0, (parseFloat(picture.style.height) * scale - dialog.clientHeight) / 2),
		};
	};
	const clampToLimits = () => {
		const limits = panLimits();
		x = Math.min(limits.x, Math.max(-limits.x, x));
		y = Math.min(limits.y, Math.max(-limits.y, y));
	};
	const settle = () => {
		scale = Math.min(MAX_ZOOM, Math.max(1, scale));
		clampToLimits();
		paint(SETTLE);
		fade(1);
	};
	// Zoom to `next`, keeping the point under (clientX, clientY) where it is
	const zoomAt = (next: number, clientX: number, clientY: number) => {
		const box = dialog.getBoundingClientRect();
		const fromCenterX = clientX - box.left - box.width / 2;
		const fromCenterY = clientY - box.top - box.height / 2;
		x = fromCenterX - (fromCenterX - x) * (next / scale);
		y = fromCenterY - (fromCenterY - y) * (next / scale);
		scale = next;
	};

	const fallAway = () => {
		y += dialog.clientHeight;
		paint(`transform ${FALL_AWAY_MS}ms var(--ease-exit)`);
		fade(0);
		setTimeout(() => close('fell-away'), reducedMotion.matches ? 0 : FALL_AWAY_MS);
	};

	const pointers = new Map<number, { x: number; y: number }>();
	let drag: { x: number; y: number; fromX: number; fromY: number; at: number } | null = null;
	let pinch: {
		distance: number;
		scale: number;
		x: number;
		y: number;
		midX: number;
		midY: number;
	} | null = null;
	let moved = false;
	let lastTapAt = 0;
	let tapTimer: ReturnType<typeof setTimeout> | undefined;

	dialog.addEventListener('pointerdown', (event) => {
		if ((event.target as Element).closest('button') || event.button !== 0) return;
		// A press after a tap is a drag or a double-tap, not the tap's close
		clearTimeout(tapTimer);
		dialog.setPointerCapture(event.pointerId);
		pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
		moved = false;
		if (pointers.size === 2) {
			const [a, b] = [...pointers.values()];
			pinch = {
				distance: Math.hypot(a.x - b.x, a.y - b.y),
				scale,
				x,
				y,
				midX: (a.x + b.x) / 2,
				midY: (a.y + b.y) / 2,
			};
			drag = null;
		} else if (pointers.size === 1) {
			drag = { x: event.clientX, y: event.clientY, fromX: x, fromY: y, at: performance.now() };
		}
		paint();
	});

	dialog.addEventListener('pointermove', (event) => {
		if (!pointers.has(event.pointerId)) return;
		pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
		if (pinch && pointers.size === 2) {
			const [a, b] = [...pointers.values()];
			const wanted = (pinch.scale * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.distance;
			const next =
				wanted < 1
					? 1 - rubberBand(1 - wanted, 0.4)
					: wanted > MAX_ZOOM
						? MAX_ZOOM + rubberBand(wanted - MAX_ZOOM, 1)
						: wanted;
			scale = pinch.scale;
			x = pinch.x;
			y = pinch.y;
			zoomAt(next, pinch.midX, pinch.midY);
			moved = true;
			paint();
			return;
		}
		if (!drag) return;
		const dx = event.clientX - drag.x;
		const dy = event.clientY - drag.y;
		if (Math.hypot(dx, dy) > TAP_SLOP_PX) moved = true;
		if (!moved) return;
		if (scale > 1) {
			const limits = panLimits();
			x = rubberClamp(drag.fromX + dx, -limits.x, limits.x, 90);
			y = rubberClamp(drag.fromY + dy, -limits.y, limits.y, 90);
		} else {
			// Down follows the finger; up resists, since up doesn't close
			y = dy > 0 ? dy : -rubberBand(-dy, 40);
			fade(1 - Math.min(0.75, Math.max(0, y) / 420));
		}
		paint();
	});

	const release = (event: PointerEvent) => {
		if (!pointers.has(event.pointerId)) return;
		pointers.delete(event.pointerId);
		if (pinch) {
			if (pointers.size < 2) {
				pinch = null;
				drag = null;
				settle();
				// The finger still down pans straight on
				const [rest] = [...pointers.values()];
				if (rest) drag = { x: rest.x, y: rest.y, fromX: x, fromY: y, at: performance.now() };
				moved = true;
			}
			return;
		}
		if (!drag) return;
		const flicked =
			(event.clientY - drag.y) / Math.max(1, performance.now() - drag.at) > FLICK_PX_PER_MS;
		drag = null;
		if (!moved) {
			const now = performance.now();
			if (now - lastTapAt < DOUBLE_TAP_MS) {
				clearTimeout(tapTimer);
				lastTapAt = 0;
				if (scale > 1) scale = 1;
				else zoomAt(DOUBLE_TAP_ZOOM, event.clientX, event.clientY);
				settle();
			} else {
				lastTapAt = now;
				tapTimer = setTimeout(() => scale === 1 && close('morph'), DOUBLE_TAP_MS);
			}
			return;
		}
		if (scale > 1) {
			settle();
			return;
		}
		if (y > SWIPE_CLOSE_PX || (flicked && y > 30)) fallAway();
		else {
			y = 0;
			paint(SETTLE);
			fade(1);
		}
	};
	dialog.addEventListener('pointerup', release);
	dialog.addEventListener('pointercancel', release);

	dialog.addEventListener(
		'wheel',
		(event) => {
			if (!event.ctrlKey) return;
			// A trackpad pinch arrives as ctrl+wheel; without this the page would zoom
			event.preventDefault();
			zoomAt(
				Math.min(MAX_ZOOM, Math.max(1, scale * Math.exp(-event.deltaY * 0.01))),
				event.clientX,
				event.clientY,
			);
			clampToLimits();
			paint();
		},
		{ passive: false },
	);

	return { reset };
}
