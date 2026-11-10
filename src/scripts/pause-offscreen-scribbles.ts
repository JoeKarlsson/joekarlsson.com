// Pauses each looping scribble (.redraw, .redraw-strokes) and each boiling post
// diagram while it's off screen.
// Every frame of a scribble runs its crayon and boil filters on the CPU, so a
// page of them kept a phone busy repainting marks nobody could see. Set inline
// rather than in CSS, which sits at its size budget (tests/bundle-size.test.ts);
// the pause-motion button's !important rule still wins over it. CSS doesn't reach a
// diagram's own SVG animations (charts, collages), so those are paused directly.
import { motionStill, visibleDiagrams } from './filter-animations';

const seen = new WeakSet<SVGSVGElement>();

const scribbles = document.querySelectorAll<SVGElement>(
	'svg.redraw, svg.redraw-strokes, .diagram svg',
);
if (scribbles.length) {
	const observer = new IntersectionObserver((entries) => {
		for (const { target, isIntersecting } of entries) {
			const state = isIntersecting ? '' : 'paused';
			if (target.closest('.diagram') && 'pauseAnimations' in target) {
				const svg = target as SVGSVGElement;
				// The first time it's seen, a figure starts from its first frame
				if (isIntersecting && !seen.has(svg)) {
					seen.add(svg);
					svg.setCurrentTime(0);
				}
				if (isIntersecting) visibleDiagrams.add(svg);
				else visibleDiagrams.delete(svg);
				if (isIntersecting && !motionStill()) svg.unpauseAnimations();
				else svg.pauseAnimations();
			}
			for (const element of [target, ...target.querySelectorAll('path, .d-flow, .d-callout')]) {
				(element as SVGElement).style.animationPlayState = state;
			}
		}
	});
	scribbles.forEach((scribble) => observer.observe(scribble));
}
