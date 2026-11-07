// Game and app embeds carry data-desktop-src instead of src, and only get a src at
// the md breakpoint and up, on a screen tall enough not to be a phone on its side. Hiding an iframe with CSS doesn't stop it loading
// (browsers fetch display:none iframes even with loading="lazy"), and the
// Connect AI × DOOM build running unseen crashed an iPhone. Phones get the
// poster or link next to the embed instead.
// Wide AND tall: a big phone sideways is over 48rem wide but too short. Matches the
// embed-large variant in src/styles/global.css (a test checks they agree).
export const DESKTOP_EMBED_QUERY = '(width >= 48rem) and (height >= 32rem)';
const desktopQuery = matchMedia(DESKTOP_EMBED_QUERY);

function loadDesktopEmbedsWhenWide() {
	if (!desktopQuery.matches) return;
	document
		.querySelectorAll<HTMLIFrameElement>('iframe[data-desktop-src]:not([src])')
		.forEach((frame) => {
			frame.src = frame.dataset.desktopSrc!;
		});
}

loadDesktopEmbedsWhenWide();
desktopQuery.addEventListener('change', loadDesktopEmbedsWhenWide);
