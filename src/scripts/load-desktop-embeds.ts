// Game and app embeds carry data-desktop-src instead of src, and only get a src at
// the md breakpoint and up. Hiding an iframe with CSS doesn't stop it loading
// (browsers fetch display:none iframes even with loading="lazy"), and the
// Connect AI × DOOM build running unseen crashed an iPhone. Phones get the
// poster or link next to the embed instead.
const desktopQuery = matchMedia('(min-width: 48rem)');

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
