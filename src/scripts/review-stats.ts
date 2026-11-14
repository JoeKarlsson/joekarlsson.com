// /reviews/stats/: the hover card on every poster, the dock-style swell on the rating
// wall, Ratings bars that light their wall row, numbers that roll like the site's slot
// machine, and crayon notes that wait to draw until they're on screen. Built with DOM
// calls only: the page's Trusted Types policy blocks HTML strings.
import { isMotionPaused } from './pause-motion';

type Film = [
	title: string,
	year: number,
	stars: string,
	rewatch: boolean,
	line: string,
	poster: string,
];

const SWELL_RADIUS = 70;
const SWELL_MAX = 1.9;
const CARD_WIDTH = 260;
const CARD_DELAY_MS = 150;

/** How much a wall tile grows with the pointer `distance` px from its center */
export function swellScale(distance: number): number {
	return distance < SWELL_RADIUS ? 1 + (SWELL_MAX - 1) * (1 - distance / SWELL_RADIUS) ** 2 : 1;
}

const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches || isMotionPaused();

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text = '') {
	const node = document.createElement(tag);
	node.className = className;
	node.textContent = text;
	return node;
}

function initCard(root: HTMLElement, films: Record<string, Film>) {
	const card = el('div', 'stats-card');
	card.setAttribute('aria-hidden', 'true');
	document.body.append(card);
	let current: HTMLElement | null = null;
	let timer = 0;

	const place = (link: HTMLElement) => {
		const r = link.getBoundingClientRect();
		// Clears the five-star posters' crayon star, which reaches past the poster
		const gap = 24;
		let x = r.right + gap;
		let origin = 'left';
		if (x + CARD_WIDTH > innerWidth - 8) {
			x = r.left - gap - CARD_WIDTH;
			origin = 'right';
		}
		const y = Math.min(
			Math.max(8, r.top + r.height / 2 - card.offsetHeight / 2),
			innerHeight - card.offsetHeight - 8,
		);
		card.style.left = `${Math.max(8, x)}px`;
		card.style.top = `${y}px`;
		card.style.setProperty('--origin', origin);
	};

	const show = (link: HTMLElement) => {
		const film = films[link.dataset.film!];
		if (!film) return;
		const [title, year, stars, rewatch, line, poster] = film;
		current = link;
		const img = el('img', '');
		img.src = poster;
		img.alt = '';
		const meta = el('div', 'text-sm text-muted', ` ${year}${rewatch ? ', rewatch' : ''}`);
		meta.prepend(el('span', 'text-pink', stars));
		card.replaceChildren(
			img,
			el('div', 'mt-3 mb-1 font-display text-[22px] leading-none uppercase', title),
			meta,
			...(line ? [el('p', 'mt-2 text-sm', line)] : []),
			el('div', 'mt-3 text-sm font-semibold text-pink', 'Read the review'),
		);
		place(link);
		card.classList.remove('on');
		void card.offsetWidth; // restart the entrance
		card.classList.add('on');
	};

	const hide = () => {
		clearTimeout(timer);
		current = null;
		card.classList.remove('on');
	};

	root.addEventListener('pointerover', (e) => {
		const link = (e.target as Element).closest<HTMLElement>('[data-film]');
		if (!link || e.pointerType === 'touch') return;
		clearTimeout(timer);
		// Already open: follow the pointer from poster to poster without the wait
		if (current) show(link);
		else timer = window.setTimeout(() => show(link), CARD_DELAY_MS);
	});
	root.addEventListener('pointerout', (e) => {
		const to = e.relatedTarget as Element | null;
		if ((e.target as Element).closest('[data-film]') && !to?.closest?.('[data-film]')) hide();
	});
	root.addEventListener('focusin', (e) => {
		const link = (e.target as Element).closest<HTMLElement>('[data-film]');
		if (link) show(link);
		else hide();
	});
	document.addEventListener('keydown', (e) => e.key === 'Escape' && hide());
	addEventListener(
		'scroll',
		() => (current && current === document.activeElement ? place(current) : hide()),
		{ passive: true },
	);
}

function initSwell(wall: HTMLElement) {
	if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
	let frame = 0;
	let x = 0;
	let y = 0;
	let row: HTMLElement | null = null;
	const reset = (tiles: Iterable<HTMLElement>) => {
		for (const tile of tiles) tile.style.transform = '';
	};
	wall.querySelectorAll<HTMLElement>('.stats-wall').forEach((tiles) => {
		tiles.addEventListener('pointermove', (e) => {
			if (still()) return;
			[x, y, row] = [e.clientX, e.clientY, tiles];
			frame ||= requestAnimationFrame(() => {
				frame = 0;
				// Read every tile first, then write: interleaving forces a layout per tile
				const tiles = [...(row?.querySelectorAll<HTMLElement>('a') ?? [])];
				const scales = tiles.map((tile) => {
					const r = tile.getBoundingClientRect();
					return swellScale(Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y));
				});
				tiles.forEach((tile, i) => {
					tile.style.transform = scales[i] > 1.01 ? `scale(${scales[i].toFixed(3)})` : '';
					tile.style.zIndex = scales[i] > 1.3 ? '3' : '';
				});
			});
		});
		tiles.addEventListener('pointerleave', () => {
			row = null;
			reset(tiles.querySelectorAll('a'));
		});
	});
}

function initRatingLink(root: HTMLElement) {
	const wall = root.querySelector<HTMLElement>('[data-rating-wall]');
	if (!wall) return;
	const rowFor = (step: string) =>
		wall.querySelector<HTMLElement>(`:scope > [data-step="${step}"]`);
	root.querySelectorAll<HTMLElement>('[data-rating-chart] [data-step]').forEach((bar) => {
		const row = rowFor(bar.dataset.step!);
		if (!row) return;
		bar.addEventListener('pointerenter', () => {
			wall.classList.add('focus');
			row.classList.add('lit');
		});
		bar.addEventListener('pointerleave', () => {
			wall.classList.remove('focus');
			row.classList.remove('lit');
		});
		bar.addEventListener('click', () =>
			row.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'center' }),
		);
		row.addEventListener('pointerenter', () => bar.classList.add('lit'));
		row.addEventListener('pointerleave', () => bar.classList.remove('lit'));
	});
}

function initRoll(root: HTMLElement) {
	root.querySelectorAll<HTMLElement>('[data-roll]').forEach((number) => {
		const final = number.textContent!.trim();
		let rolling = false;
		number.addEventListener('pointerenter', () => {
			if (rolling || still()) return;
			rolling = true;
			const digits = [...final];
			let tick = 0;
			const timer = setInterval(() => {
				tick++;
				// Each digit spins a little longer than the one before it, then lands
				number.textContent = digits
					.map((c, i) =>
						/\d/.test(c) && tick < 6 + i * 3 ? String((Number(c) + tick + i) % 10) : c,
					)
					.join('');
				if (tick >= 6 + digits.length * 3) {
					clearInterval(timer);
					number.textContent = final;
					rolling = false;
				}
			}, 45);
		});
	});
}

function initNotes(root: HTMLElement) {
	if (still()) return;
	const notes = root.querySelectorAll<SVGElement>('.stats-note');
	const seen = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.removeAttribute('data-note-wait');
				seen.unobserve(entry.target);
			}
		},
		{ threshold: 0.6 },
	);
	notes.forEach((note) => {
		note.setAttribute('data-note-wait', '');
		seen.observe(note);
	});
}

export function initReviewStats(root: HTMLElement) {
	const data = document.getElementById('review-stats-films');
	initCard(root, JSON.parse(data!.textContent!));
	initSwell(root);
	initRatingLink(root);
	initRoll(root);
	initNotes(root);
}
