// Reports the first time a visitor clicks into each embed: YouTube iframes send
// "Video Play" (prop title), anything else "Project Embed Play" (prop project,
// from data-embed-project). Clicks inside an iframe never reach this page, but
// focus moving into the iframe blurs the window, so that is the signal. It
// counts a first interaction per page load, not every play.
const reported = new Set<HTMLIFrameElement>();

window.addEventListener('blur', () => {
	// activeElement only switches to the iframe after the blur event finishes.
	setTimeout(() => {
		const iframe = document.activeElement;
		if (!(iframe instanceof HTMLIFrameElement) || reported.has(iframe)) return;
		const plausible = window.plausible;
		if (typeof plausible !== 'function') return;
		reported.add(iframe);
		if (/(^|\.)youtube(-nocookie)?\.com$/.test(new URL(iframe.src, location.href).hostname)) {
			plausible('Video Play', { props: { title: iframe.title || 'Untitled' } });
		} else {
			plausible('Project Embed Play', {
				props: { project: iframe.dataset.embedProject || iframe.title || 'Unknown' },
			});
		}
	});
});
