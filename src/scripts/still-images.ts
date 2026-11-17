// An animated image (a boiling diagram card) can't be paused the way a video can, so
// wherever decoration may not boil (motion paused or reduced, a phone, Save-Data, a slow
// connection; mayBoil, the same check in-view-play makes) each one shows a still of its
// last frame instead. The build names that still in data-still
// (src/integrations/responsive-images.mjs).
import { DESKTOP_EMBED_QUERY } from './load-desktop-embeds';
import { MOTION_PAUSED_EVENT, MOTION_RESUMED_EVENT, isMotionPaused } from './pause-motion';
import { connectionHints, mayBoil } from '../utils/paper-hero-motion';

export function showStills(still: boolean, root: ParentNode = document): void {
	root.querySelectorAll<HTMLImageElement>('img[data-still]').forEach((img) => {
		if (still && !img.dataset.animatedSrc) {
			img.dataset.animatedSrc = img.getAttribute('src') ?? '';
			const srcset = img.getAttribute('srcset');
			if (srcset !== null) {
				img.dataset.animatedSrcset = srcset;
				// The still's same-width copies where the build made them, else the full still
				if (img.dataset.stillSrcset) img.setAttribute('srcset', img.dataset.stillSrcset);
				else img.removeAttribute('srcset');
			}
			img.setAttribute('src', img.dataset.still ?? '');
		} else if (!still && img.dataset.animatedSrc) {
			if (img.dataset.animatedSrcset) img.setAttribute('srcset', img.dataset.animatedSrcset);
			img.setAttribute('src', img.dataset.animatedSrc);
			delete img.dataset.animatedSrc;
			delete img.dataset.animatedSrcset;
		}
	});
}

export function initStillImages(): void {
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
	const wideScreen = matchMedia(DESKTOP_EMBED_QUERY);
	const update = () => {
		showStills(
			!mayBoil({
				reducedMotion: reducedMotion.matches,
				motionPaused: isMotionPaused(),
				wideScreen: wideScreen.matches,
				...connectionHints(),
			}),
		);
	};
	update();
	reducedMotion.addEventListener('change', update);
	wideScreen.addEventListener('change', update);
	document.addEventListener(MOTION_PAUSED_EVENT, update);
	document.addEventListener(MOTION_RESUMED_EVENT, update);
}
