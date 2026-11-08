// The Punc project page's How it's made figure (src/data/projects.ts): how a book
// becomes punctuation, from Punc's own code (src/text.ts, site/src/analyze.ts,
// site/scripts/fetch-books.mjs in JoeKarlsson/punc)
export const alt =
	"How Punc reads a book. A book comes from Project Gutenberg's most-read English books of the last 30 days, with Gutenberg's license header and footer cut off, or from your own plain text file, which is read in your browser and never uploaded. Punc folds the typography, so curly quotes become straight ones, long dashes become hyphens and an ellipsis becomes three periods. Then it counts the marks, period, comma, semicolon, colon, exclamation point, question mark, apostrophe, quotation mark, parentheses and hyphen, and keeps each one with its place in the book. Alice's Adventures in Wonderland drops 26,777 words and keeps 8,076 marks. The marks become four views: Score, every mark in reading order; Spiral, the whole book wound from the center out; Pages, the pages with the letters erased and the marks in place; and Counts, each mark through the book by tenth, with a fingerprint and the book's closest twin.";

const GUTENBERG = { label: 'Project Gutenberg', icon: 'book-open', kind: 'chalk' };
const OWN = { label: 'Your own .txt', icon: 'file-text', kind: 'chalk' };
const CUT = { label: 'Cut the license', icon: 'scroll-text', kind: 'pink' };
const FOLD = { label: 'Fold the typography', icon: 'merge', kind: 'pink' };
const COUNT = { label: 'Count the marks', icon: 'sigma', kind: 'pink' };
const VIEWS = [
	{ label: 'Score', sub: ['every mark,', 'in order'], icon: 'scroll-text' },
	{ label: 'Spiral', sub: ['whole book,', 'center out'], icon: 'refresh-cw' },
	{ label: 'Pages', sub: ['letters erased,', 'marks stay'], icon: 'file' },
	{ label: 'Counts', sub: ['by tenth,', 'plus a twin'], icon: 'chart-line' },
];
// Non-breaking and em spaces: SVG collapses runs of plain spaces
const FOLD_SUB = ['“ ” → "  ’ → \'', '— → -  … → ...'];
const MARKS = ['.', ',', ';', ':', '!', '?', "'", '"', '(', ')', '-'].join(' ');

export const desktop = {
	height: 624,
	draw(f) {
		f.box({
			x: 20,
			y: 16,
			w: 280,
			h: 74,
			size: 17,
			subSize: 14,
			sub: ['most read in English,', 'last 30 days'],
			...GUTENBERG,
		});
		f.box({
			x: 340,
			y: 16,
			w: 280,
			h: 74,
			size: 17,
			subSize: 14,
			sub: ['read in your browser,', 'never uploaded'],
			...OWN,
		});
		f.arrow([
			[160, 92],
			[160, 122],
		]);
		f.box({
			x: 30,
			y: 124,
			w: 260,
			h: 62,
			size: 16,
			subSize: 14,
			sub: 'header and footer',
			...CUT,
		});
		f.arrow([
			[160, 188],
			[160, 259],
			[168, 259],
		]);
		f.arrow([
			[480, 92],
			[480, 259],
			[472, 259],
		]);
		f.box({ x: 170, y: 220, w: 300, h: 78, size: 16, subSize: 14, sub: FOLD_SUB, ...FOLD });
		f.arrow([
			[320, 300],
			[320, 328],
		]);
		f.box({
			x: 170,
			y: 330,
			w: 300,
			h: 84,
			size: 16,
			subSize: 14,
			sub: [MARKS, 'each one with its place'],
			...COUNT,
		});
		const centers = [92, 244, 396, 548];
		for (const cx of centers) {
			f.arrow([
				[320, 416],
				[320, 444],
				[cx, 444],
				[cx, 492],
			]);
		}
		VIEWS.forEach((view, i) =>
			f.box({
				x: centers[i] - 66,
				y: 494,
				w: 132,
				h: 112,
				kind: 'outline',
				size: 16,
				subSize: 13,
				stack: true,
				...view,
			}),
		);
		f.note(24, 340, 'Alice:');
		f.note(24, 360, '26,777 words gone,');
		f.note(24, 380, '8,076 marks kept');
		f.crayonArrow([70, 394], [166, 404], -20);
	},
};

export const phone = {
	height: 900,
	draw(f) {
		f.box({
			x: 12,
			y: 16,
			w: 164,
			h: 112,
			size: 15,
			subSize: 13,
			stack: true,
			sub: ['most read,', 'last 30 days'],
			...GUTENBERG,
			label: 'Gutenberg',
		});
		f.box({
			x: 184,
			y: 16,
			w: 164,
			h: 112,
			size: 15,
			subSize: 13,
			stack: true,
			sub: ['in your browser,', 'never uploaded'],
			...OWN,
		});
		f.arrow([
			[94, 130],
			[94, 156],
		]);
		f.box({
			x: 12,
			y: 158,
			w: 164,
			h: 92,
			size: 14,
			subSize: 13,
			stack: true,
			sub: 'header, footer',
			...CUT,
			label: 'Cut license',
		});
		f.arrow([
			[94, 252],
			[94, 290],
		]);
		f.arrow([
			[266, 130],
			[266, 290],
		]);
		f.box({ x: 20, y: 292, w: 320, h: 84, size: 15, subSize: 14, sub: FOLD_SUB, ...FOLD });
		f.arrow([
			[180, 378],
			[180, 404],
		]);
		f.box({
			x: 20,
			y: 406,
			w: 320,
			h: 84,
			size: 15,
			subSize: 14,
			sub: [MARKS, 'each one with its place'],
			...COUNT,
		});
		f.note(20, 512, 'Alice: 26,777 words gone, 8,076 marks kept');
		f.arrow([
			[180, 524],
			[180, 560],
		]);
		f.group({ x: 12, y: 562, w: 336, h: 322, label: 'Four views' });
		VIEWS.forEach((view, i) =>
			f.box({
				x: i % 2 ? 186 : 26,
				y: 592 + Math.floor(i / 2) * 146,
				w: 148,
				h: 130,
				kind: 'outline',
				size: 15,
				subSize: 13,
				stack: true,
				...view,
			}),
		);
	},
};
