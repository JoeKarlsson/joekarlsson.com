// The homepage funnel's next step: "Homepage CTA Click" with the section the link sits in
// and where it goes. The 2026-11-15 redesign dropped every tagged link from the homepage,
// so Plausible's "Homepage to a next step" funnel counted almost nothing (8 clicks from
// 388 visits in November). One listener covers every section, old and new.

export interface HomepageClick {
	section: string;
	destination: string;
}

/** What a click reports, or null for anything that isn't a homepage section's link, or already has its own event. */
export function homepageClick(target: EventTarget | null, page: URL): HomepageClick | null {
	if (!(target instanceof Element)) return null;
	const link = target.closest('a[href]');
	if (!link || (link.getAttribute('class') ?? '').includes('plausible-event-name=')) return null;
	const section = link.closest('section[aria-labelledby], section[aria-label]');
	if (!section || section.closest('footer, nav')) return null;
	const url = new URL(link.getAttribute('href')!, page);
	// A jump within the homepage isn't a next step
	if (url.origin === page.origin && url.pathname === page.pathname) return null;
	return {
		section: (section.getAttribute('aria-labelledby') ?? section.getAttribute('aria-label')!)
			.trim()
			.toLowerCase(),
		destination: url.origin === page.origin ? url.pathname : url.hostname,
	};
}

export function initHomepageClicks(): void {
	document.addEventListener('click', (event) => {
		const props = homepageClick(event.target, new URL(location.href));
		if (props) window.plausible?.('Homepage CTA Click', { props: { ...props } });
	});
}
