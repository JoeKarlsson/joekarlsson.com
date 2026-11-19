/**
 * A post's interlude: one line of the post's own text, set alone in big Fraunces italic between
 * two sections with a screen of black around it, like turning a page (big type round, 4A;
 * .interlude in global.css). The front matter names the section it follows and the line:
 *
 *   interlude:
 *     after: 'Static types came back'
 *     line: "That's the part I miss."
 *
 * The line repeats words the post already says, so screen readers skip it (aria-hidden).
 * Runs after the heading permalinks, so a heading may sit inside a .heading-group.
 */
import { h2Of, textOf } from './hast-text.mjs';

export default function rehypeInterlude() {
	return (tree, file) => {
		const interlude = file.data?.astro?.frontmatter?.interlude;
		if (!interlude) return;
		const { after, line } = interlude;

		// A heading or line edited out from under the interlude would otherwise vanish or misquote.
		// Match with straight quotes, since Markdown curls the post's; show the post's curled copy
		const straight = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
		const body = textOf(tree);
		const at0 = straight(body).indexOf(straight(line));
		if (at0 === -1) throw new Error(`Interlude "${line}": the post doesn't say that word for word`);
		const shown = body.slice(at0, at0 + line.length);
		const headings = tree.children
			.map((node, index) => ({ index, h2: h2Of(node) }))
			.filter((h) => h.h2);
		const afterAt = headings.findIndex((h) => textOf(h.h2).trim() === after);
		if (afterAt === -1) throw new Error(`Interlude after "${after}": no section has that heading`);
		const next = headings[afterAt + 1];
		if (!next) throw new Error(`Interlude after "${after}": it's the last section`);

		tree.children.splice(next.index, 0, {
			type: 'element',
			tagName: 'p',
			properties: { className: ['interlude'], ariaHidden: 'true' },
			children: [{ type: 'text', value: shown }],
		});
	};
}
