// The boil and warble filters (BaseLayout's svg[data-motion-filters]) animate their
// noise seed in SVG, because iPhone Safari won't repaint a CSS animation that swaps
// filter URLs. CSS animation-play-state doesn't reach SVG animations, so this holds
// them still while the pause button is on (.motion-paused on <html>) or the viewer
// asks for reduced motion, and lets them run otherwise.
import { PAUSED_CLASS } from './pause-motion';

export function syncFilterAnimations(reducedMotion: boolean): void {
	const still = reducedMotion || document.documentElement.classList.contains(PAUSED_CLASS);
	document.querySelectorAll<SVGSVGElement>('svg[data-motion-filters]').forEach((svg) => {
		if (still) svg.pauseAnimations();
		else svg.unpauseAnimations();
	});
}

export function initFilterAnimations(): void {
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
	const sync = () => syncFilterAnimations(reducedMotion.matches);
	sync();
	reducedMotion.addEventListener('change', sync);
	new MutationObserver(sync).observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['class'],
	});
}
