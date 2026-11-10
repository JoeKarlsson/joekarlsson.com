// Phones, on a post: once the post's title scrolls up under the nav bar, the bar
// shows the post's category, the minutes left and its title, with a pink line along
// its bottom edge for how far through the post you are. Header.astro draws the
// pieces; this fills them in from the <article>'s data attributes (BlogPost.astro).

/** How far through the body, 0 to 1: 0 while its top is still below the bar, 1 once its bottom is on screen. */
export function readingProgress(
	bodyTop: number,
	bodyHeight: number,
	barBottom: number,
	viewportHeight: number,
): number {
	const scrollable = bodyHeight - (viewportHeight - barBottom);
	if (scrollable <= 0) return 1;
	return Math.min(1, Math.max(0, (barBottom - bodyTop) / scrollable));
}

/** "Homelab · 15 min left": the category and the minutes still to read, either one optional. */
export function contextMeta(
	category: string | undefined,
	minutes: number,
	progress: number,
): string {
	const left = Math.ceil(minutes * (1 - progress));
	const time = minutes ? (left > 0 ? `${left} min left` : 'Done') : '';
	return [category, time].filter(Boolean).join(' · ');
}

export function initReadingContext(nav: HTMLElement): void {
	const article = document.querySelector<HTMLElement>('article[data-post-title]');
	if (!article) return;
	const title = article.querySelector('h1');
	const body = article.querySelector<HTMLElement>('.prose');
	const meta = nav.querySelector('[data-context-meta]');
	const name = nav.querySelector('[data-context-title]');
	const line = nav.querySelector<HTMLElement>('[data-read-progress]');
	if (!title || !body || !meta || !name || !line) {
		throw new Error('reading context: a post needs an h1 and .prose, the nav its context slots');
	}
	name.textContent = article.dataset.postTitle!;
	const category = article.dataset.postCategory;
	const minutes = Number(article.dataset.readingTime) || 0;

	const update = () => {
		const barBottom = nav.getBoundingClientRect().bottom;
		const showing = title.getBoundingClientRect().bottom < barBottom;
		nav.toggleAttribute('data-context-on', showing);
		if (!showing) return;
		const rect = body.getBoundingClientRect();
		const progress = readingProgress(rect.top, rect.height, barBottom, innerHeight);
		// scale, not width: no layout on every scroll
		line.style.scale = `${progress} 1`;
		meta.textContent = contextMeta(category, minutes, progress);
	};
	addEventListener('scroll', update, { passive: true });
	addEventListener('resize', update);
	update();
}
