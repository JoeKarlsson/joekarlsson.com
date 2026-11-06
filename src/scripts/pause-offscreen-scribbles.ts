// Pauses each looping scribble (.redraw, .redraw-strokes) and each boiling post
// diagram while it's off screen.
// Every frame of a scribble runs its crayon and boil filters on the CPU, so a
// page of them kept a phone busy repainting marks nobody could see. Set inline
// rather than in CSS, which sits at its size budget (tests/bundle-size.test.ts);
// the pause-motion button's !important rule still wins over it.
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
