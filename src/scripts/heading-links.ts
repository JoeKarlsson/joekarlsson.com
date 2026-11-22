// Clicking a section heading gives the link to that section (DECISIONS.md 2026-11-22, A): the
// address bar changes to it without a jump, the link is copied, and a "Link copied" tag shows
// by the heading. A post heading's # link (rehype-autolink-headings) does the same; without
// this script it still jumps to its section, as any link would. The newsletter signup and
// Keep reading headings close a page rather than start a section, so they're left out.
// The keyboard gets it too (Joe, 2026-11-22): a post heading's # link is in the Tab order and
// shows when focused; a section page's heading, which has no # link, takes focus itself and
// copies on Enter or Space.
const HEADINGS =
	'main :is(h2, h3, h4)[id]:not(.sr-only, summary *, button *, #keep-exploring, #post-newsletter-heading)';
const SHOW_MS = 1400;
const GAP_PX = 8;

let tag: HTMLElement;

function flash(heading: Element, text: string) {
	// One status element, filled on each click: screen readers skip a live region that
	// arrives with its words already in it
	tag.textContent = text;
	// Shown before it's measured: a hidden tag has no height
	tag.hidden = false;
	// Above the heading, unless that would cover the sticky nav: then just under it
	const rect = heading.getBoundingClientRect();
	const navBottom = document.querySelector('header.sticky')?.getBoundingClientRect().bottom ?? 0;
	const above = rect.top - tag.offsetHeight - GAP_PX;
	const top = above > navBottom + GAP_PX ? above : rect.bottom + GAP_PX;
	// On the page, not fixed to the screen, so it stays by its heading if you scroll
	tag.style.left = `${Math.max(GAP_PX, rect.left) + scrollX}px`;
	tag.style.top = `${top + scrollY}px`;
	clearTimeout(Number(tag.dataset.timer));
	tag.dataset.timer = String(
		setTimeout(() => {
			tag.hidden = true;
			tag.textContent = '';
		}, SHOW_MS),
	);
}

export function initHeadingLinks() {
	const headings = document.querySelectorAll<HTMLElement>(HEADINGS);
	if (!headings.length) return;
	for (const heading of headings) {
		heading.dataset.headingLink = '';
		if (!heading.closest('.heading-group')) heading.tabIndex = 0;
	}
	tag = document.createElement('span');
	tag.className = 'link-copied';
	tag.setAttribute('role', 'status');
	tag.hidden = true;
	document.body.append(tag);
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
		copyLinkTo(heading);
	});
	document.addEventListener('keydown', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLElement) || !target.matches('[data-heading-link]')) return;
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		copyLinkTo(target);
	});
}

function copyLinkTo(heading: Element) {
	history.replaceState(history.state, '', `#${heading.id}`);
	// No clipboard (an old browser, a refused permission): the link is still in the address bar
	Promise.resolve()
		.then(() => navigator.clipboard.writeText(location.href))
		.then(
			() => flash(heading, 'Link copied'),
			() => flash(heading, 'Link in the address bar'),
		);
}
