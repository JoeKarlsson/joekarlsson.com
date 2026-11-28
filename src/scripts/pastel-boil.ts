// The Joe Pastel boil (styles/joe-pastel.css): steps every .pastel-boil line through its
// three frames, the same drawing with its pastel edge re-grained (ss01, ss02), at the site's
// boil cadence. A script, not a CSS animation: WebKit runs a font-feature-settings
// animation but never repaints it, so on an iPhone the letters would never move.
// It boils only while mayBoil allows (not on phones, slow connections, reduced motion or
// while paused), while the line is on screen in a visible tab, and only once the font is in
// (font-display: optional may leave the fallback for the whole page). Frames come from the
// #boil filter's own SVG clock, so the line steps with the boiling scribbles around it, and
// pausing holds both. Stopped, the line shows the default drawing, the smoothest of the three.
import { MOTION_PAUSED_EVENT, MOTION_RESUMED_EVENT, isMotionPaused } from './pause-motion';
import { DESKTOP_EMBED_QUERY } from './load-desktop-embeds';
import { boilFrameAt, connectionHints, mayBoil } from '../utils/paper-hero-motion';

export function initPastelBoil(lines: HTMLElement[]): void {
	if (!lines.length) return;
	const clock = document.querySelector<SVGSVGElement>('svg[data-motion-filters]');
	const now = () =>
		typeof clock?.getCurrentTime === 'function' ? clock.getCurrentTime() * 1000 : performance.now();
	const onScreen = new Set<HTMLElement>();
	let timer = 0;

	const allowed = () =>
		!document.hidden &&
		document.fonts.check('1em "Joe Pastel"') &&
		mayBoil({
			reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
			motionPaused: isMotionPaused(),
			wideScreen: matchMedia(DESKTOP_EMBED_QUERY).matches,
			...connectionHints(),
		});

	const tick = () => {
		const { frame, untilNext } = boilFrameAt(now());
		onScreen.forEach((line) => (line.dataset.frame = String(frame)));
		timer = window.setTimeout(tick, untilNext + 1);
	};

	const update = () => {
		const run = allowed() && onScreen.size > 0;
		if (run && !timer) tick();
		else if (!run && timer) {
			clearTimeout(timer);
			timer = 0;
			lines.forEach((line) => delete line.dataset.frame);
		}
	};

	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			const line = entry.target as HTMLElement;
			if (entry.isIntersecting) onScreen.add(line);
			else {
				onScreen.delete(line);
				delete line.dataset.frame;
			}
		}
		update();
	});
	lines.forEach((line) => observer.observe(line));
	document.addEventListener(MOTION_PAUSED_EVENT, update);
	document.addEventListener(MOTION_RESUMED_EVENT, update);
	document.addEventListener('visibilitychange', update);
	document.fonts.addEventListener('loadingdone', update);
	matchMedia(DESKTOP_EMBED_QUERY).addEventListener('change', update);
	matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', update);
}
