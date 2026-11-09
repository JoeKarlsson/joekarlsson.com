// An animated image (a boiling diagram card) can't be paused the way a video can, so
// while motion is paused (pause-motion) or reduced, each one shows a still of its last
// frame instead. The build names that still in data-still
// (src/integrations/responsive-images.mjs).
import { MOTION_PAUSED_EVENT, MOTION_RESUMED_EVENT, isMotionPaused } from './pause-motion';

export function showStills(still: boolean, root: ParentNode = document): void {
	root.querySelectorAll<HTMLImageElement>('img[data-still]').forEach((img) => {
		if (still && !img.dataset.animatedSrc) {
			img.dataset.animatedSrc = img.getAttribute('src') ?? '';
			const srcset = img.getAttribute('srcset');
			if (srcset !== null) {
				img.dataset.animatedSrcset = srcset;
				img.removeAttribute('srcset');
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
	const update = () => showStills(reducedMotion.matches || isMotionPaused());
	update();
	reducedMotion.addEventListener('change', update);
	document.addEventListener(MOTION_PAUSED_EVENT, update);
	document.addEventListener(MOTION_RESUMED_EVENT, update);
}
