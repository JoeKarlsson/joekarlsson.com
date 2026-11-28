/**
 * Pictures in a post become figures (DECISIONS.md, 2026-11-15 review page round):
 * - A paragraph of two or three pictures (or loops) is a .frame-pair: stacked one above the other
 *   at every width, wider than the text from tablets up (article.css; Joe, 2026-11-27: side by
 *   side each frame was too small to see). A picture's title labels it under the frame,
 *   `![alt](/a.webp "The Devils · 1971")`.
 * - One or two pictures with an all-italic line after them, in the next paragraph or on the
 *   next line of the same one, take that line as their figcaption.
 * Runs after rehype-spoilers: a spoiler paragraph's class, spoken label and Show spoiler button
 * move onto a wrapper around just the pictures, so the button covers the pictures, not the caption.
 */
export const PAIR_SIZES = '(min-width: 80rem) 464px, (min-width: 48rem) 50vw, 100vw';

const isBlank = (node) => node.type === 'text' && !node.value.trim();
// A loop from rehype-gif-video counts as a picture, so two clips can be compared too
const isImage = (node) =>
	node.type === 'element' &&
	(node.tagName === 'img' ||
		(node.tagName === 'video' && node.properties?.className?.includes('gif-video')));
const isEm = (node) => node?.type === 'element' && node.tagName === 'em';
const isSrOnly = (node) =>
	node.type === 'element' &&
	node.tagName === 'span' &&
	node.properties?.className?.includes('sr-only');
const isSpoilerShow = (node) =>
	node.type === 'element' &&
	node.tagName === 'button' &&
	node.properties?.className?.includes('spoiler-show');
const content = (node) => node.children.filter((child) => !isBlank(child));

// A paragraph's pictures, and an italic line written right under them in the same paragraph
const pictures = (node) => {
	if (node?.type !== 'element' || node.tagName !== 'p') return { images: [] };
	const children = content(node).filter((child) => !isSpoilerShow(child));
	const inlineCaption = children.length > 1 && isEm(children.at(-1)) ? children.at(-1) : undefined;
	const rest = inlineCaption ? children.slice(0, -1) : children;
	const images = rest.filter(isImage);
	return images.length >= 1 && images.length <= 3 && rest.every((c) => isImage(c) || isSrOnly(c))
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
			const isPair = images.length > 1;
			let pictured = isPair ? pairGrid(images) : images[0];
			if (paragraph.properties?.className?.includes('spoiler-frame')) {
				const wrapper = isPair ? pictured : element('div', 'spoiler-frame', [pictured]);
				wrapper.properties = {
					...paragraph.properties,
					...wrapper.properties,
					className: [...new Set([...wrapper.properties.className, 'spoiler-frame'])],
				};
				wrapper.children.unshift(...content(paragraph).filter(isSrOnly));
				wrapper.children.push(...content(paragraph).filter(isSpoilerShow));
				pictured = wrapper;
			}
			const figure = element('figure', isPair ? 'frame-pair' : 'frame', [
				pictured,
				...(caption ? [element('figcaption', 'frame-caption', caption.children)] : []),
			]);
			kids.splice(i, nextCaption ? next - i + 1 : 1, figure);
		}
	};
}
