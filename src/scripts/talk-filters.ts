// /talks/' filter row: All, Talks, Podcasts, Livestreams or Has video. It hides the cards
// that don't match, and an era (with its index link) left with none. The row stays hidden
// without JavaScript, so everything shows.
import { FILTER_ACTIVE, FILTER_INACTIVE } from '../utils/ui';

function matches(card: HTMLElement, filter: string): boolean {
	if (filter === 'all') return true;
	if (filter === 'video') return card.hasAttribute('data-talk-video');
	return card.dataset.talkGroup === filter;
}

export function initTalkFilters() {
	const row = document.querySelector<HTMLElement>('[data-talk-filters]');
	if (!row) return;
	const buttons = [...row.querySelectorAll<HTMLButtonElement>('[data-talk-filter]')];
	row.hidden = false;

	const apply = (filter: string) => {
		for (const button of buttons) {
			const on = button.dataset.talkFilter === filter;
			button.setAttribute('aria-pressed', String(on));
			button.className = on ? FILTER_ACTIVE : FILTER_INACTIVE;
		}
		for (const era of document.querySelectorAll<HTMLElement>('.talk-era')) {
			let shown = 0;
			for (const card of era.querySelectorAll<HTMLElement>('.talk-card')) {
				card.hidden = !matches(card, filter);
				if (!card.hidden) shown++;
			}
			era.hidden = shown === 0;
			const link = document.querySelector<HTMLElement>(`.talk-era-link[href="#${era.id}"]`);
			if (link) link.hidden = era.hidden;
		}
	};

	for (const button of buttons) {
		button.addEventListener('click', () => apply(button.dataset.talkFilter!));
	}
}
