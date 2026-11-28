// The Joe Pastel boil (styles/joe-pastel.css): steps every .pastel-boil line through its
// three frames, the same drawing with its pastel edge re-grained (ss01, ss02), at the site's
// boil cadence. A script, not a CSS animation: WebKit runs a font-feature-settings
// animation but never repaints it, so on an iPhone the letters would never move.
// It boils only while mayBoil allows (not on phones, slow connections, reduced motion or
// while paused) and while the line is on screen.
import { MOTION_PAUSED_EVENT, MOTION_RESUMED_EVENT, isMotionPaused } from './pause-motion';
import { DESKTOP_EMBED_QUERY } from './load-desktop-embeds';
import { connectionHints, mayBoil } from '../utils/paper-hero-motion';

const FRAME_MS = 500 / 3; // three frames every 0.5 s, like the #boil filter
const FRAMES = 3;

/** The frame after `frame`, wrapping round. */
export function nextFrame(frame: number): number {
	return (frame + 1) % FRAMES;
}

export function initPastelBoil(lines: HTMLElement[]): void {
	if (!lines.length) return;
	const onScreen = new Set<HTMLElement>();
	let timer = 0;
	let frame = 0;

	const allowed = () =>
		mayBoil({
			reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
			motionPaused: isMotionPaused(),
			wideScreen: matchMedia(DESKTOP_EMBED_QUERY).matches,
			...connectionHints(),
		});

	const update = () => {
		const run = allowed() && onScreen.size > 0;
		if (run && !timer) {
			timer = window.setInterval(() => {
				frame = nextFrame(frame);
				onScreen.forEach((line) => (line.dataset.frame = String(frame)));
			}, FRAME_MS);
		} else if (!run && timer) {
			clearInterval(timer);
			timer = 0;
		}
	};

	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			const line = entry.target as HTMLElement;
			if (entry.isIntersecting) onScreen.add(line);
			else onScreen.delete(line);
		}
		update();
	});
	lines.forEach((line) => observer.observe(line));
	document.addEventListener(MOTION_PAUSED_EVENT, update);
	document.addEventListener(MOTION_RESUMED_EVENT, update);
	matchMedia(DESKTOP_EMBED_QUERY).addEventListener('change', update);
	matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', update);
}
