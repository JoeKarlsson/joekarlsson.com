// Game and app embeds carry data-desktop-src instead of src, and only get a src at
// the md breakpoint and up, on a screen tall enough not to be a phone on its side. Hiding an iframe with CSS doesn't stop it loading
// (browsers fetch display:none iframes even with loading="lazy"), and the
// Connect AI × DOOM build running unseen crashed an iPhone. Phones get the
// poster or link next to the embed instead.
// Wide AND tall: a big phone sideways is over 48rem wide but too short. Matches the
// embed-large variant in src/styles/global.css (a test checks they agree).
export const DESKTOP_EMBED_QUERY = '(width >= 48rem) and (height >= 32rem)';
const desktopQuery = matchMedia(DESKTOP_EMBED_QUERY);

// Even on desktop a game waits until it is about a screen away: the DOOM build is 8 MB,
// too much to pull at page open for readers who never scroll down to it. Created on the
// first wide match, so a phone never makes one.
let nearScreen: IntersectionObserver | undefined;

function loadDesktopEmbedsWhenWide() {
	if (!desktopQuery.matches) return;
	nearScreen ??= new IntersectionObserver(
		(entries) => {
			for (const { target, isIntersecting } of entries) {
				// Narrowed to a phone since it was observed: wait for the next wide match
				if (!isIntersecting || !desktopQuery.matches) continue;
				const frame = target as HTMLIFrameElement;
				nearScreen!.unobserve(frame);
				frame.src = frame.dataset.desktopSrc!;
			}
		},
		{ rootMargin: '100% 0px' },
	);
	document
		.querySelectorAll<HTMLIFrameElement>('iframe[data-desktop-src]:not([src])')
		.forEach((frame) => nearScreen!.observe(frame));
}

loadDesktopEmbedsWhenWide();
desktopQuery.addEventListener('change', loadDesktopEmbedsWhenWide);
