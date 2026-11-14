/**
 * Hide a spoiler marked Discord style, `||like this||`, behind a blur (.spoiler, global.css).
 *
 * Hovering or focusing one shows it; clicking, tapping or pressing Enter on any of them shows
 * every spoiler in the review (reviews/[slug].astro). A screen reader hears "Spoiler:" first.
 * A mark only counts inside one run of plain text, and never in code, where `a || b` is an or.
 *
 * A picture that gives something away is marked by its title, `![alt](/frame.webp "spoiler")`.
 * Its paragraph becomes a .spoiler-frame: the picture stays blurred under a "Show spoiler" label
 * (hover doesn't show it, a picture is too big to brush past) until a click, tap or Enter shows
 * every spoiler in the review.
 */
export const SPOILER_MARK = /\|\|(?=\S)(.+?)(?<=\S)\|\|/g;

const SKIPPED = new Set(['code', 'pre', 'script', 'style']);

const spoiler = (value) => ({
	type: 'element',
	tagName: 'span',
	properties: { className: ['spoiler'], tabIndex: 0, role: 'button', ariaPressed: 'false' },
	children: [
		{
			type: 'element',
			tagName: 'span',
			properties: { className: ['sr-only'] },
			children: [{ type: 'text', value: 'Spoiler: ' }],
		},
		{ type: 'text', value },
	],
});

function splitText(value) {
	const parts = [];
	let last = 0;
	for (const match of value.matchAll(SPOILER_MARK)) {
		if (match.index > last) parts.push({ type: 'text', value: value.slice(last, match.index) });
		parts.push(spoiler(match[1]));
		last = match.index + match[0].length;
	}
	if (last === 0) return null;
	if (last < value.length) parts.push({ type: 'text', value: value.slice(last) });
	return parts;
}

export const SPOILER_FRAME_TITLE = 'spoiler';

const isSpoilerFrame = (child) =>
	child.type === 'element' &&
	child.tagName === 'img' &&
	child.properties?.title === SPOILER_FRAME_TITLE;

function markSpoilerFrame(paragraph) {
	const frame = paragraph.children.find(isSpoilerFrame);
	delete frame.properties.title;
	paragraph.properties = {
		...paragraph.properties,
		className: [...(paragraph.properties?.className ?? []), 'spoiler-frame'],
		tabIndex: 0,
		role: 'button',
		ariaPressed: 'false',
	};
	paragraph.children.unshift({
		type: 'element',
		tagName: 'span',
		properties: { className: ['sr-only'] },
		children: [{ type: 'text', value: 'Spoiler picture: ' }],
	});
}

function walk(node) {
	if (!node.children || SKIPPED.has(node.tagName)) return;
	if (node.tagName === 'p' && node.children.some(isSpoilerFrame)) markSpoilerFrame(node);
	node.children = node.children.flatMap((child) => {
		if (child.type === 'text') return splitText(child.value) ?? [child];
		walk(child);
		return [child];
	});
}

export default function rehypeSpoilers() {
	return (tree) => walk(tree);
}
