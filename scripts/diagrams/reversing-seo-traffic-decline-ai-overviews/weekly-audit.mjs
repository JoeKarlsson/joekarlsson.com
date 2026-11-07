export const alt =
	'The weekly SEO audit loop. The /seo-analysis Claude Code skill pulls a snapshot from Google Search Console, Plausible, Ahrefs, GA4, HubSpot and PageSpeed. Then: diagnose which failure mode each page is in, pick the highest-ROI fixes (low-CTR pages, redirects and 404s, orphan pages, cannibalization, content gaps), ship them as a PR tagged SEO, content, docs, performance or fix, and 2-4 weeks later measure what each PR did to its URLs. Then it starts again the next week. That measurement is how I know one title and meta batch got +397 clicks.';

const SOURCES = [
	['googlesearchconsole', 'Search Console'],
	['plausibleanalytics', 'Plausible'],
	['ahrefs', 'Ahrefs'],
	['googleanalytics', 'GA4'],
	['hubspot', 'HubSpot'],
	['pagespeedinsights', 'PageSpeed'],
];

/** The five steps, top to bottom, each { y, h } placed by the layout. */
function steps(f, x, w, ys) {
	const opts = { x, w, size: 15, subSize: 14 };
	f.box({
		...opts,
		y: ys[0],
		h: 64,
		kind: 'pink',
		label: '/seo-analysis',
		font: 'mono',
		sub: 'multi-source snapshot',
		logo: 'claude',
	});
	f.box({
		...opts,
		y: ys[1],
		h: 64,
		kind: 'pink',
		label: 'Diagnose',
		sub: 'which failure mode?',
		icon: 'search',
	});
	f.box({
		...opts,
		y: ys[2],
		h: 96,
		kind: 'pink',
		label: 'Highest-ROI fixes',
		sub: ['low CTR, redirects + 404s,', 'orphan pages,', 'cannibalization, content gaps'],
		icon: 'list-checks',
	});
	f.box({
		...opts,
		y: ys[3],
		h: 82,
		kind: 'pink',
		label: 'Ship a tagged PR',
		sub: ['SEO, content, docs,', 'performance or fix'],
		logo: 'github',
	});
	f.box({
		...opts,
		y: ys[4],
		h: 64,
		kind: 'chalk',
		label: 'Measure',
		sub: '2-4 weeks later, per URL',
		icon: 'chart-line',
	});
}

export const desktop = {
	height: 580,
	draw(f) {
		const X = 262;
		const W = 290;
		const cx = X + W / 2;
		const ys = [40, 136, 232, 360, 474];
		f.group({ x: 16, y: 40, w: 200, h: 292, label: 'Sources' });
		SOURCES.forEach(([logo, label], i) =>
			f.box({ x: 28, y: 52 + i * 46, w: 176, h: 38, kind: 'chalk', label, size: 13, logo }),
		);
		f.arrow([
			[218, 72],
			[258, 72],
		]);
		steps(f, X, W, ys);
		f.arrow([
			[cx, 106],
			[cx, 132],
		]);
		f.arrow([
			[cx, 202],
			[cx, 228],
		]);
		f.arrow([
			[cx, 330],
			[cx, 356],
		]);
		f.arrow([
			[cx, 444],
			[cx, 470],
		]);
		// Back to the top, next week
		f.arrow([
			[556, 506],
			[590, 506],
			[590, 72],
			[556, 72],
		]);
		f.note(598, 272, 'next');
		f.note(598, 292, 'week');

		f.note(24, 458, 'How I know one title + meta', { size: 15 });
		f.note(24, 478, 'batch got +397 clicks', { size: 15 });
		f.crayonArrow([190, 484], [256, 508], -16);
	},
};

export const phone = {
	height: 860,
	draw(f) {
		const X = 52;
		const W = 296;
		const cx = X + W / 2;
		const ys = [232, 324, 416, 540, 650];
		f.group({ x: 10, y: 40, w: 340, h: 156, label: 'Sources' });
		SOURCES.forEach(([logo, label], i) =>
			f.box({
				x: 16 + (i % 2) * 168,
				y: 54 + Math.floor(i / 2) * 46,
				w: 160,
				h: 38,
				kind: 'chalk',
				label,
				size: 13,
				logo,
			}),
		);
		f.arrow([
			[cx, 198],
			[cx, 228],
		]);
		steps(f, X, W, ys);
		f.arrow([
			[cx, 298],
			[cx, 320],
		]);
		f.arrow([
			[cx, 390],
			[cx, 412],
		]);
		f.arrow([
			[cx, 514],
			[cx, 536],
		]);
		f.arrow([
			[cx, 624],
			[cx, 646],
		]);
		// Back to the top along the left edge, next week
		f.arrow([
			[cx, 716],
			[cx, 744],
			[22, 744],
			[22, 264],
			[48, 264],
		]);
		f.note(34, 766, 'next week');
		f.note(10, 814, 'How I know one title + meta', { size: 15 });
		f.note(10, 836, 'batch got +397 clicks', { size: 15 });
		f.crayonArrow([214, 818], [318, 722], -20);
	},
};
