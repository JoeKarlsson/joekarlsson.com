/**
 * Open each big section of a long post like a book chapter: a giant outlined numeral, the
 * heading in Fraunces italic and, when the post's front matter gives one, an epigraph quoted
 * from that section (art book round 2, pick 8B; .chapter in article.css).
 *
 * Long means 3,000 words or more with at least four sections. Every h2 counts except the
 * closing reference lists and an FAQ, which stay plain headings. Runs after the heading
 * permalinks, so it wraps the .heading-group they made.
 */
import { h2Of, textOf } from './hast-text.mjs';
import { joinLastWord } from './rehype-no-widows.mjs';
import { isPaper } from './rehype-paper-citations.mjs';

const LONG_POST_WORDS = 3000;
const MIN_CHAPTERS = 4;
export const NOT_CHAPTERS =
	/^(references|sources|footnotes|further reading|faqs?|frequently asked questions)$/i;

const el = (tagName, properties, children) => ({ type: 'element', tagName, properties, children });
const text = (value) => ({ type: 'text', value });

export default function rehypeChapters() {
	return (tree, file) => {
		// A paper numbers its own sections instead (DECISIONS.md, 2026-11-22)
		if (isPaper(file)) return;
		const words = textOf(tree).split(/\s+/).filter(Boolean).length;
		const chapters = tree.children.filter((node) => {
			const h2 = node.type === 'element' && h2Of(node);
			return h2 && !NOT_CHAPTERS.test(textOf(h2).trim());
		});
		if (words < LONG_POST_WORDS || chapters.length < MIN_CHAPTERS) return;

		const epigraphs = file.data?.astro?.frontmatter?.epigraphs ?? [];
		const titles = chapters.map((node) => textOf(h2Of(node)).trim());
		for (const e of epigraphs) {
			// An epigraph whose section heading changed would vanish silently
			if (!titles.includes(e.section)) {
				throw new Error(`Epigraph for "${e.section}": no chapter has that heading`);
			}
		}
		chapters.forEach((node, i) => {
			const title = titles[i];
			const epigraph = epigraphs.find((e) => e.section === title);
			// Firefox left a chapter title's last word on its own line under balance
			const lastWords = h2Of(node).children.findLast((c) => c.type === 'text' && c.value.trim());
			if (lastWords) lastWords.value = joinLastWord(lastWords.value);
			const chapter = el('div', { className: ['chapter'] }, [
				el('span', { className: ['chapter-num'], ariaHidden: 'true' }, [
					text(String(i + 1).padStart(2, '0')),
				]),
				el('div', {}, [
					{ ...node },
					...(epigraph
						? [
								el('blockquote', { className: ['epigraph'] }, [
									el('p', {}, [text(`“${epigraph.quote}”`)]),
									el('cite', {}, [text(epigraph.cite)]),
								]),
							]
						: []),
				]),
			]);
			Object.assign(node, chapter);
		});
	};
}
