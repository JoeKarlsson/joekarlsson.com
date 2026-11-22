// Clicking a section heading gives the link to that section (DECISIONS.md 2026-11-22, A): the
// address bar changes to it without a jump, the link is copied, and a "Link copied" tag shows
// over the heading. A post heading's # link (rehype-autolink-headings) does the same; without
// this script it still jumps to its section, as any link would.
const HEADINGS = 'main :is(h2, h3, h4)[id]:not(.sr-only, summary *, button *)';
const SHOW_MS = 1400;

function flash(heading: Element, text: string) {
	document.querySelector('.link-copied')?.remove();
	const tag = document.createElement('span');
	tag.className = 'link-copied';
	tag.setAttribute('role', 'status');
	tag.textContent = text;
	// Fixed on the page, not inside the heading, so the heading's text never changes
	const { left, top } = heading.getBoundingClientRect();
	tag.style.left = `${Math.max(8, left)}px`;
	tag.style.top = `${Math.max(8, top - 34)}px`;
	document.body.append(tag);
	setTimeout(() => tag.remove(), SHOW_MS);
}

export function initHeadingLinks() {
	for (const heading of document.querySelectorAll<HTMLElement>(HEADINGS))
		heading.dataset.headingLink = '';
	document.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const anchor = target.closest('.heading-anchor');
		const heading = anchor
			? anchor.closest('.heading-group')?.querySelector('[data-heading-link]')
			: target.closest('[data-heading-link]');
		if (!heading) return;
		// A link inside a heading goes where it points
		if (!anchor && target.closest('a')) return;
		// Dragging across a heading to select its words isn't a click on it
		if (getSelection()?.toString()) return;
		event.preventDefault();
		history.replaceState(history.state, '', `#${heading.id}`);
		// No clipboard (an old browser, a refused permission): the link is still in the address bar
		Promise.resolve()
			.then(() => navigator.clipboard.writeText(location.href))
			.then(
				() => flash(heading, 'Link copied'),
				() => flash(heading, 'Link in the address bar'),
			);
	});
}
