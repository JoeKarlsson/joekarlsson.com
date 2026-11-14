// Shows a link's post preview (rehype-post-previews.mjs) on hover or focus where the browser
// has anchor positioning but not `interestfor`, which does this natively (Chrome 142+).
// Touch screens and browsers without anchor positioning keep plain links (global.css).
const SHOW_DELAY_MS = 500; // Chrome's interestfor default
const HIDE_DELAY_MS = 250;

export function initLinkPeek(): void {
	if ('interestForElement' in HTMLAnchorElement.prototype) return;
	if (!CSS.supports('anchor-name: --a') || !matchMedia('(hover: hover)').matches) return;
	document.querySelectorAll<HTMLAnchorElement>('a[interestfor]').forEach((link) => {
		const card = document.getElementById(link.getAttribute('interestfor')!);
		if (!card) throw new Error(`link-peek: no preview #${link.getAttribute('interestfor')}`);
		let timer: ReturnType<typeof setTimeout>;
		const later = (open: boolean) => () => {
			clearTimeout(timer);
			timer = setTimeout(() => card.togglePopover(open), open ? SHOW_DELAY_MS : HIDE_DELAY_MS);
		};
		link.addEventListener('pointerenter', later(true));
		link.addEventListener('focus', later(true));
		link.addEventListener('pointerleave', later(false));
		link.addEventListener('blur', later(false));
		// The pointer can cross onto the card without it closing (WCAG 1.4.13)
		card.addEventListener('pointerenter', () => clearTimeout(timer));
		card.addEventListener('pointerleave', later(false));
	});
}
