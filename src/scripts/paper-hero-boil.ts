// Starts a post's paper hero boiling (src/components/PaperHero.astro), or leaves it still.
// The hero renders still; this adds .is-boiling only after the picture has loaded and the
// page has gone idle, and only if mayBoil() passes and the device then holds a smooth frame
// rate for a second. Offscreen, paused (pause-motion) or switched to reduced motion, it
// drops back to still.
import { DESKTOP_EMBED_QUERY } from './load-desktop-embeds';
import { MOTION_PAUSED_EVENT, MOTION_RESUMED_EVENT, isMotionPaused } from './pause-motion';
import { keepsUp, mayBoil } from '../utils/paper-hero-motion';

const BOILING = 'is-boiling';

interface NetworkInformation {
	saveData?: boolean;
	effectiveType?: string;
}

function pictureLoaded(img: HTMLImageElement): Promise<void> {
	if (img.complete) return Promise.resolve();
	return new Promise((resolve) => img.addEventListener('load', () => resolve(), { once: true }));
}

function whenIdle(): Promise<void> {
	return new Promise((resolve) =>
		'requestIdleCallback' in window
			? requestIdleCallback(() => resolve(), { timeout: 2000 })
			: setTimeout(resolve, 300),
	);
}

function framesPerSecond(sampleMs = 1000): Promise<number> {
	return new Promise((resolve) => {
		let frames = 0;
		const start = performance.now();
		const count = (now: number) => {
			frames++;
			if (now - start < sampleMs) requestAnimationFrame(count);
			else resolve((frames * 1000) / (now - start));
		};
		requestAnimationFrame(count);
	});
}

const hero = document.querySelector<HTMLElement>('.paper-hero');
const picture = hero?.querySelector<HTMLImageElement>('img');

if (hero && picture) {
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
	const wideScreen = matchMedia(DESKTOP_EMBED_QUERY);
	const allowed = () => {
		const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
		return mayBoil({
			reducedMotion: reducedMotion.matches,
			motionPaused: isMotionPaused(),
			wideScreen: wideScreen.matches,
			saveData: connection?.saveData,
			effectiveType: connection?.effectiveType,
		});
	};

	// Measured once, the first time everything else allows a boil
	let deviceKeepsUp: Promise<boolean> | undefined;
	let onScreen = true;
	const update = async () => {
		if (!onScreen || !allowed()) {
			hero.classList.remove(BOILING);
			return;
		}
		deviceKeepsUp ??= pictureLoaded(picture)
			.then(whenIdle)
			.then(() => framesPerSecond())
			.then(keepsUp);
		hero.classList.toggle(BOILING, (await deviceKeepsUp) && onScreen && allowed());
	};

	new IntersectionObserver(([entry]) => {
		onScreen = entry.isIntersecting;
		void update();
	}).observe(hero);
	reducedMotion.addEventListener('change', update);
	wideScreen.addEventListener('change', update);
	document.addEventListener(MOTION_PAUSED_EVENT, update);
	document.addEventListener(MOTION_RESUMED_EVENT, update);
}
