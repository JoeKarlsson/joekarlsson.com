// Clicking a section heading gives the link to that section (DECISIONS.md 2026-11-22, A): the
// address bar changes to it without a jump, the link is copied, and a "Link copied" tag shows
// by the heading. A post heading's # link (rehype-autolink-headings) does the same; without
// this script it still jumps to its section, as any link would. The newsletter signup and
// Keep reading headings close a page rather than start a section, so they're left out.
// The keyboard gets it too (Joe, 2026-11-22): a post heading's # link is in the Tab order, and
// a section page's heading, which has no # link, gets one around its words, so Enter on it is
// a click on a real link and screen readers hear a link inside a heading.
const HEADINGS =
	'main :is(h2, h3, h4)[id]:not(.sr-only, summary *, button *, #keep-exploring, #post-newsletter-heading)';
const SHOW_MS = 1400;
const GAP_PX = 8;
// .link-copied's height (global.css): one 12px line and 6px of padding above and below. The tag
// is placed while empty, since a live region that arrives with its words is skipped
const TAG_HEIGHT_PX = 24;

let tag: HTMLElement;

function flash(heading: Element, text: string) {
	// Above the heading, unless that would cover the sticky nav: then just under it
	const rect = heading.getBoundingClientRect();
	const navBottom = document.querySelector('header.sticky')?.getBoundingClientRect().bottom ?? 0;
	const above = rect.top - TAG_HEIGHT_PX - GAP_PX;
	const top = above > navBottom + GAP_PX ? above : rect.bottom + GAP_PX;
	// On the page, not fixed to the screen, so it stays by its heading if you scroll
	tag.style.left = `${Math.max(GAP_PX, rect.left) + scrollX}px`;
	tag.style.top = `${top + scrollY}px`;
	// Hidden by opacity, never display or hidden, so it stays a live region; the words go in on
	// the next frame, once it's in place
	requestAnimationFrame(() => {
		tag.textContent = text;
		tag.classList.add('on');
	});
	clearTimeout(Number(tag.dataset.timer));
	tag.dataset.timer = String(
		setTimeout(() => {
			tag.classList.remove('on');
			tag.textContent = '';
		}, SHOW_MS),
	);
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

export function initHeadingLinks() {
	const headings = document.querySelectorAll<HTMLElement>(HEADINGS);
	if (!headings.length) return;
	for (const heading of headings) {
		heading.dataset.headingLink = '';
		// A section page's heading becomes a link to itself, unless it already holds a link
		if (heading.closest('.heading-group') || heading.querySelector('a')) continue;
		const self = document.createElement('a');
		self.className = 'heading-self-link';
		self.href = `#${heading.id}`;
		self.append(...heading.childNodes);
		heading.append(self);
	}
	tag = document.createElement('span');
	tag.className = 'link-copied';
	tag.setAttribute('role', 'status');
	document.body.append(tag);
	document.addEventListener('click', (event) => {
		// A modified or middle click on a heading link opens it in a new tab, as on any link
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
			return;
		const target = event.target;
		if (!(target instanceof Element)) return;
		const hash = target.closest('.heading-anchor');
		const heading = hash
			? hash.closest('.heading-group')?.querySelector('[data-heading-link]')
			: target.closest('[data-heading-link]');
		if (!heading) return;
		// Any other link inside a heading goes where it points
		if (!hash && target.closest('a:not(.heading-self-link)')) return;
		// Dragging across a heading to select its words isn't a click on it
		if (getSelection()?.toString()) return;
		event.preventDefault();
		copyLinkTo(heading);
	});
}
