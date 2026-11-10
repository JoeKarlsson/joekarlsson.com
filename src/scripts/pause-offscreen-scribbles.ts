// Pauses each looping scribble (.redraw, .redraw-strokes) and each boiling post
// diagram while it's off screen.
// Every frame of a scribble runs its crayon and boil filters on the CPU, so a
// page of them kept a phone busy repainting marks nobody could see. Set inline
// rather than in CSS, which sits at its size budget (tests/bundle-size.test.ts);
// the pause-motion button's !important rule still wins over it. CSS doesn't reach a
// diagram's own SVG animations (charts, collages), so those are paused directly.
import { mostlyInView, motionStill, visibleDiagrams } from './filter-animations';

const scribbles = document.querySelectorAll<SVGElement>(
	'svg.redraw, svg.redraw-strokes, .diagram svg',
);
if (scribbles.length) {
	const observer = new IntersectionObserver((entries) => {
		for (const { target, isIntersecting } of entries) {
			const state = isIntersecting ? '' : 'paused';
			for (const element of [target, ...target.querySelectorAll('path, .d-flow, .d-callout')]) {
				(element as SVGElement).style.animationPlayState = state;
			}
		}
	});
	scribbles.forEach((scribble) => observer.observe(scribble));
}

// A figure's animation starts from its first frame once it's mostly on screen and has
// sat there a beat, so a reader scrolling past doesn't miss it; after that it runs
// whenever any of it shows. Joe: they "start animating when they're not fully visible".
const START_DELAY_MS = 400;
const started = new WeakSet<SVGSVGElement>();
const timers = new WeakMap<SVGSVGElement, number>();
const figures = [...document.querySelectorAll<SVGSVGElement>('.diagram svg')].filter(
	(svg) => !svg.parentElement?.closest('svg'),
);
if (figures.length) {
	const play = (svg: SVGSVGElement) => {
		visibleDiagrams.add(svg);
		if (!motionStill()) svg.unpauseAnimations();
	};
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const svg = entry.target as SVGSVGElement;
				clearTimeout(timers.get(svg));
				if (!entry.isIntersecting) {
					visibleDiagrams.delete(svg);
					svg.pauseAnimations();
				} else if (started.has(svg)) {
					play(svg);
				} else if (mostlyInView(entry)) {
					timers.set(
						svg,
						window.setTimeout(() => {
							started.add(svg);
							svg.setCurrentTime(0);
							play(svg);
						}, START_DELAY_MS),
					);
				}
			}
		},
		{ threshold: [0, 0.3, 0.6, 1] },
	);
	figures.forEach((svg) => {
		svg.pauseAnimations();
		observer.observe(svg);
	});
}
