// Phones fold long pages (Talks, Uses): each [data-phone-collapse] keeps its
// [data-collapse-heading] on screen and hides its [data-collapse-body] behind a +/–
// button. data-phone-collapse="open" starts a section open. Wider screens, and phones
// without JavaScript, see everything. A folded body is hidden="until-found", so the
// browser's find in page still reaches it and opens it (beforematch); Safari treats it as
// plain hidden.

/** Folds `body` the way find in page can still search, or unfolds it. */
function foldBody(body: HTMLElement, folded: boolean) {
	if (folded) body.setAttribute('hidden', 'until-found');
	else body.removeAttribute('hidden');
}

const PHONE = '(width < 48rem)';

function setOpen(section: HTMLElement, open: boolean) {
	const button = section.querySelector<HTMLButtonElement>('[data-collapse-toggle]');
	const body = section.querySelector<HTMLElement>('[data-collapse-body]');
	if (!button || !body) return;
	button.setAttribute('aria-expanded', String(open));
	foldBody(body, !open);
	section.toggleAttribute('data-collapsed', !open);
}

/** Opens the folded section holding `el`, if any. Folds are set once at load, so a page
 * loaded narrow and then widened (a phone turned sideways) keeps them. Returns whether
 * it opened one. */
export function openFoldAround(el: Element): boolean {
	const section = el.closest<HTMLElement>('[data-phone-collapse][data-collapsed]');
	if (!section) return false;
	setOpen(section, true);
	return true;
}

/** While a mouse is over a folded section (or something pointing into it), show its body
 * without opening it; `on: false` folds it back. A section opened meanwhile is left open. */
export function previewFoldAround(el: Element, on: boolean) {
	if (!window.matchMedia('(hover: hover)').matches) return;
	const section = el.closest<HTMLElement>('[data-phone-collapse][data-collapsed]');
	const body = section?.querySelector<HTMLElement>('[data-collapse-body]');
	if (body) foldBody(body, !on);
}

export function initPhoneCollapse() {
	if (!window.matchMedia(PHONE).matches) return;
	document.querySelectorAll<HTMLElement>('[data-phone-collapse]').forEach((section, i) => {
		const heading = section.querySelector<HTMLElement>('[data-collapse-heading]');
		const body = section.querySelector<HTMLElement>('[data-collapse-body]');
		if (!heading || !body) {
			throw new Error(`[data-phone-collapse] #${i} needs a heading and a body`);
		}
		body.id ||= `collapse-body-${i}`;

		// The heading's own content (text and crayon marks) moves into the button, in a
		// relative span so a mark keeps measuring against the words, not the whole row
		const label = document.createElement('span');
		label.className = 'relative';
		label.append(...heading.childNodes);

		// data-collapse-noun="talk" shows a count beside the sign: "1 talk", "4 talks"
		const noun = section.dataset.collapseNoun;
		const count = body.children.length;
		const countLabel = noun ? `${count} ${noun}${count === 1 ? '' : 's'}` : '';
		const sign = document.createElement('span');
		sign.className = 'flex shrink-0 items-baseline gap-2 font-sans text-sm text-muted';
		sign.setAttribute('aria-hidden', 'true');
		const signSwap = document.createElement('span');
		signSwap.className = 'icon-swap w-6 font-display text-4xl leading-none text-pink';
		signSwap.dataset.sign = '';
		const plus = document.createElement('span');
		plus.dataset.iconOff = '';
		plus.textContent = '+';
		const minus = document.createElement('span');
		minus.dataset.iconOn = '';
		minus.textContent = '–';
		signSwap.append(plus, minus);
		sign.append(countLabel, signSwap);

		const button = document.createElement('button');
		button.type = 'button';
		button.dataset.collapseToggle = '';
		button.setAttribute('aria-controls', body.id);
		button.className =
			'flex min-h-11 w-full cursor-pointer items-baseline justify-between gap-4 text-left';
		button.append(label, sign);
		heading.append(button);

		button.addEventListener('click', () =>
			setOpen(section, button.getAttribute('aria-expanded') !== 'true'),
		);
		// Find in page unfolds a match itself; this keeps the button and data-collapsed in step
		body.addEventListener('beforematch', () => setOpen(section, true));
		section.addEventListener('mouseenter', () => previewFoldAround(section, true));
		section.addEventListener('mouseleave', () => previewFoldAround(section, false));
		setOpen(section, section.dataset.phoneCollapse === 'open');
	});
	// A link straight to something inside a folded section (/talks/#era-2021) opens it
	const openHashTarget = () => {
		const target =
			location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
		if (target && openFoldAround(target)) target.scrollIntoView();
	};
	openHashTarget();
	// Folds animate only once their first state is styled, so nothing folds or grows on load
	document.body.getBoundingClientRect();
	document.documentElement.toggleAttribute('data-folds-ready', true);
	window.addEventListener('hashchange', openHashTarget);
}
