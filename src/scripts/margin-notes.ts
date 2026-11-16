// A margin note and the words it's about (rehype-margin-notes.mjs) share a data-note number.
// Hovering either lights both; clicking either holds them lit, rings the words, and brings
// the other into view when it's off screen, like the pins on /uses (DECISIONS.md, round 7 A).
// Without this script the numbers are plain links between the two.

const pairOf = (n: string) => document.querySelectorAll<HTMLElement>(`.prose [data-note="${n}"]`);
// A code note (beside its line) pairs with that line the same way
const isNote = (el: Element) =>
	el.classList.contains('margin-note') || el.classList.contains('code-note');

function bringIntoView(el: HTMLElement) {
	const box = el.getBoundingClientRect();
	if (box.top >= 80 && box.bottom <= innerHeight - 40) return;
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
}

export function initMarginNotes() {
	document.querySelectorAll<HTMLElement>('.prose [data-note]').forEach((el) => {
		const n = el.dataset.note!;
		// Below 80rem only quotes and updates show; a term's phrase has nothing to point at there
		const noteShows = () => [...pairOf(n)].some((x) => isNote(x) && x.offsetParent);
		const light = () => noteShows() && pairOf(n).forEach((x) => x.classList.add('is-lit'));
		const unlight = () =>
			pairOf(n).forEach((x) => x.classList.contains('is-held') || x.classList.remove('is-lit'));
		// Keyboard focus lights the pair the same as a hover
		el.addEventListener('mouseenter', light);
		el.addEventListener('focusin', light);
		el.addEventListener('mouseleave', unlight);
		el.addEventListener('focusout', unlight);
		// A cite link goes to its source; its note is reached from the number beside it
		if (el.tagName === 'A' && !el.getAttribute('href')?.startsWith('#')) return;
		// A footnote number goes to the footnote list, the copy a screen reader can read
		if (el.matches('[data-footnote-ref]')) return;
		el.addEventListener('click', (event) => {
			// Selecting text (copying from a code line) isn't asking for the note
			if (getSelection()?.toString()) return;
			const link = (event.target as Element).closest('a');
			// Links inside a note (a quote's source, a see-also card) still go where they point
			if (link && !link.getAttribute('href')?.startsWith('#')) return;
			if (!noteShows()) return;
			event.preventDefault();
			document
				.querySelectorAll('.prose .is-held')
				.forEach((x) => x.classList.remove('is-held', 'is-lit'));
			const pair = [...pairOf(n)];
			pair.forEach((x) => x.classList.add('is-held', 'is-lit'));
			const fromNote = isNote(el) || !!el.closest('.margin-note');
			// The other end: the words, or whichever copy of the note shows at this width
			// A footnote's words are its number, so a sup is the fallback
			const other = fromNote
				? (pair.find((x) => !isNote(x) && x.tagName !== 'SUP' && !x.closest('sup')) ??
					pair.find((x) => !isNote(x)))
				: pair.find((x) => isNote(x) && x.offsetParent);
			if (!other) return;
			bringIntoView(other);
			// Focus follows, so a keyboard or screen reader user lands where the link pointed
			// Never into a note copy hidden from screen readers
			if (other.closest('[aria-hidden="true"]')) return;
			other.tabIndex = -1;
			other.focus({ preventScroll: true });
		});
	});
}
