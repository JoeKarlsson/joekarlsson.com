import fs from 'node:fs';
import path from 'node:path';

import { visit } from 'unist-util-visit';

/**
 * Inline a post's diagrams. Markdown references the desktop file like any image,
 * ![alt](/images/blog/<slug>/<name>.svg), and this swaps the paragraph holding it
 * for a <figure class="diagram"> with that SVG and, when one exists, its
 * <name>.phone.svg sibling. global.css shows one or the other at 640px.
 *
 * Inlined rather than an <img> so the figures use the page's own fonts (an SVG
 * loaded as an image can't), stay sharp and searchable, and skip the 500px
 * height cap on post images. The files come from scripts/diagrams (npm run
 * diagrams) and carry their own role="img" and aria-label; the markdown alt
 * replaces that label so the post stays the source of truth.
 *
 * Like rehype-gif-video this reads public/ from disk, which Astro doesn't track:
 * after re-rendering a figure, clear node_modules/.astro before a local build.
 */
export default function rehypeInlineDiagrams({ publicDir = 'public' } = {}) {
	return (tree) => {
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName !== 'p' || !parent || index === null) return;
			const children = node.children.filter(
				(child) => !(child.type === 'text' && !child.value.trim()),
			);
			const img = children[0];
			if (children.length !== 1 || img.type !== 'element' || img.tagName !== 'img') return;

			const src = String(img.properties?.src ?? '');
			if (!/^\/images\/.+\.svg$/.test(src) || src.endsWith('.phone.svg')) return;
			const figure = inlineDiagram(src, String(img.properties.alt ?? ''), publicDir);
			if (figure) parent.children[index] = figure;
		});
	};
}

/**
 * One diagram as a hast <figure class="diagram">: the desktop SVG and, when it
 * exists, its .phone.svg sibling. Null when the file isn't in public/. Project
 * pages (src/pages/work/[slug].astro) use it for their How it's made diagram.
 */
export function inlineDiagram(src, alt, publicDir = 'public') {
	const root = path.resolve(publicDir);
	const desktopPath = path.resolve(root, src.slice(1));
	// Only files under public/: an `..` in the src must not inline any SVG on disk
	if (!desktopPath.startsWith(root + path.sep) || !fs.existsSync(desktopPath)) return null;
	const phonePath = desktopPath.replace(/\.svg$/, '.phone.svg');
	const svg = (file) => withLabel(fs.readFileSync(file, 'utf8'), alt);
	const versions = [{ className: 'diagram-wide', file: desktopPath }];
	if (fs.existsSync(phonePath)) versions.push({ className: 'diagram-phone', file: phonePath });
	return {
		type: 'element',
		tagName: 'figure',
		properties: { className: ['diagram'], dataDiagramSrc: src, dataDiagramAlt: alt },
		children: versions.map(({ className, file }) => ({
			type: 'element',
			tagName: 'div',
			properties: { className: [className] },
			children: [{ type: 'raw', value: svg(file) }],
		})),
	};
}

const escapeAttribute = (s) =>
	s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** The SVG with the post's alt text as its label, and no XML declaration. Its photos
 * (a collage's cut-outs) load as it nears the screen: an <image href> in inline SVG
 * fetches at load like any image, and a long post's collages took the bandwidth its
 * hero needed. pause-offscreen-scribbles.ts puts href back from data-href. */
function withLabel(svg, alt) {
	const markup = svg
		.replace(/^<\?xml[^>]*>\s*/, '')
		.trim()
		.replace(/<image href="\//g, '<image data-href="/');
	if (!alt) return markup;
	// A function, not a replacement string: alt text like "$105 a year" would otherwise
	// read "$1" as the captured group and paste the <svg> attributes into the label
	return markup.replace(
		/<svg\b([^>]*?)\saria-label="[^"]*"/,
		(_, attributes) => `<svg${attributes} aria-label="${escapeAttribute(alt)}"`,
	);
}
