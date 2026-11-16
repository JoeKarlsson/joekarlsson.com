/**
 * Pictures in a post become figures (DECISIONS.md, 2026-11-15 review page round):
 * - A paragraph of two pictures is a .frame-pair: stacked on phones, side by side and wider than
 *   the text from tablets up (global.css). A picture's title labels it under the frame,
 *   `![alt](/a.webp "The Devils · 1971")`.
 * - One or two pictures with an all-italic line after them, in the next paragraph or on the
 *   next line of the same one, take that line as their figcaption.
 * Runs after rehype-spoilers: a spoiler paragraph's button (role, class, spoken label) moves onto
 * a wrapper around just the pictures, so the caption never becomes the button's name.
 */
export const PAIR_SIZES = '(min-width: 80rem) 464px, (min-width: 48rem) 50vw, 100vw';

const isBlank = (node) => node.type === 'text' && !node.value.trim();
const isImage = (node) => node.type === 'element' && node.tagName === 'img';
const isEm = (node) => node?.type === 'element' && node.tagName === 'em';
const isSrOnly = (node) =>
	node.type === 'element' &&
	node.tagName === 'span' &&
	node.properties?.className?.includes('sr-only');
const content = (node) => node.children.filter((child) => !isBlank(child));

// A paragraph's pictures, and an italic line written right under them in the same paragraph
const pictures = (node) => {
	if (node?.type !== 'element' || node.tagName !== 'p') return { images: [] };
	const children = content(node);
	const inlineCaption = children.length > 1 && isEm(children.at(-1)) ? children.at(-1) : undefined;
	const rest = inlineCaption ? children.slice(0, -1) : children;
	const images = rest.filter(isImage);
	return images.length >= 1 && images.length <= 2 && rest.every((c) => isImage(c) || isSrOnly(c))
		? { images, inlineCaption }
		: { images: [] };
};
const isCaption = (node) => {
	if (node?.type !== 'element' || node.tagName !== 'p') return false;
	const children = content(node);
	return children.length === 1 && isEm(children[0]);
};

const element = (tagName, className, children) => ({
	type: 'element',
	tagName,
	properties: { className: [className] },
	children,
});

// Side by side, each column is as wide as its frame's shape, so the two frames share a height
const columns = (images) =>
	images
		.map(({ properties: { width, height } }) =>
			width && height ? `${(Number(width) / Number(height)).toFixed(3)}fr` : '1fr',
		)
		.join(' ');

function pairGrid(images) {
	const grid = element(
		'div',
		'frame-pair-grid',
		images.map((img) => {
			const label = img.properties.title;
			delete img.properties.title;
			img.properties.sizes = PAIR_SIZES;
			return element('div', 'frame-pair-cell', [
				img,
				...(label
					? [element('span', 'frame-label', [{ type: 'text', value: String(label) }])]
					: []),
			]);
		}),
	);
	grid.properties.style = `--pair-columns: ${columns(images)}`;
	return grid;
}

export default function rehypeFrames() {
	return (tree) => {
		const kids = tree.children;
		for (let i = 0; i < kids.length; i++) {
			const { images, inlineCaption } = pictures(kids[i]);
			if (!images.length) continue;
			let next = i + 1;
			while (kids[next] && isBlank(kids[next])) next++;
			const nextCaption = !inlineCaption && isCaption(kids[next]) ? kids[next] : undefined;
			const caption = inlineCaption ?? (nextCaption && content(nextCaption)[0]);
			if (images.length === 1 && !caption) continue;

			const paragraph = kids[i];
			const isPair = images.length === 2;
			let pictured = isPair ? pairGrid(images) : images[0];
			if (paragraph.properties?.className?.includes('spoiler-frame')) {
				const button = isPair ? pictured : element('div', 'spoiler-frame', [pictured]);
				button.properties = {
					...paragraph.properties,
					...button.properties,
					className: [...new Set([...button.properties.className, 'spoiler-frame'])],
				};
				button.children.unshift(...content(paragraph).filter(isSrOnly));
				pictured = button;
			}
			const figure = element('figure', isPair ? 'frame-pair' : 'frame', [
				pictured,
				...(caption ? [element('figcaption', 'frame-caption', caption.children)] : []),
			]);
			kids.splice(i, nextCaption ? next - i + 1 : 1, figure);
		}
	};
}
