// After the build, writes a Markdown copy of every indexed page next to it for AI agents:
// /about/ -> /about.md, /blog/<slug>/ -> /blog/<slug>.md, / -> /index.md, and the
// llms.txt spec's /about/index.html.md. It converts the
// page's <main>, so it covers every page type without a template of its own, and drops
// what only works in a browser: scripts, forms, buttons, navigation, decorative icons
// and video. Diagrams become their alt text; the phone copy of a diagram is skipped.
import { JSDOM } from 'jsdom';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';

const SITE_URL = 'https://www.joekarlsson.com';

const REMOVED = [
	'script',
	'style',
	'noscript',
	'template',
	'button',
	'form',
	'dialog',
	'nav',
	'video',
	'[aria-hidden="true"]',
	'[hidden]',
	'[data-share-links]',
	// A short phone version of text the page also has in full
	'[data-phone-copy]',
	'input',
	'label',
	'select',
	'textarea',
].join(',');

function listPages(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return listPages(path);
		return entry.name === 'index.html' ? [path] : [];
	});
}

function tableToMarkdown(table) {
	const rows = [...table.querySelectorAll('tr')].map((row) =>
		[...row.children].map((cell) =>
			cell.textContent
				.replace(/\s+/g, ' ')
				// Backslashes first, or a cell's own `\|` would become `\\|`: an escaped
				// backslash followed by a real column break
				.replace(/\\/g, '\\\\')
				.replace(/\|/g, '\\|')
				.trim(),
		),
	);
	if (rows.length === 0) return '';
	const width = Math.max(...rows.map((row) => row.length));
	const line = (cells) =>
		`| ${Array.from({ length: width }, (_, i) => cells[i] ?? '').join(' | ')} |`;
	const [head, ...body] = rows;
	return `\n\n${[line(head), line(Array(width).fill('---')), ...body.map(line)].join('\n')}\n\n`;
}

const turndown = new TurndownService({
	headingStyle: 'atx',
	codeBlockStyle: 'fenced',
	bulletListMarker: '-',
});
turndown.addRule('table', { filter: 'table', replacement: (_, node) => tableToMarkdown(node) });
turndown.addRule('codeWithLanguage', {
	filter: (node) => node.nodeName === 'PRE',
	replacement: (_, node) =>
		`\n\n\`\`\`${node.getAttribute('data-language') ?? ''}\n${node.textContent.replace(/\n$/, '')}\n\`\`\`\n\n`,
});
turndown.addRule('iframe', {
	filter: 'iframe',
	replacement: (_, node) => {
		const src = node.getAttribute('src');
		return src ? `\n\n[Embedded: ${node.getAttribute('title') || src}](${src})\n\n` : '';
	},
});

/** The Markdown copy of one built page, or null for pages agents shouldn't get. */
export function pageToMarkdown(html, url) {
	// Checked as text first: ~2,000 old-URL redirect pages would each cost a DOM parse
	if (/<meta name="robots" content="[^"]*noindex|<meta http-equiv="refresh"/.test(html))
		return null;
	const { window } = new JSDOM(html, { url });
	// jsdom holds each page's DOM until its window closes; 400 open pages ran out of memory
	try {
		return convertDocument(window.document, url);
	} finally {
		window.close();
	}
}

// The text of an element with its pieces spaced: "Hanselminutes Document Databases",
// where textContent would run a card's title and subtitle together
function textPieces(element) {
	const walker = element.ownerDocument.createTreeWalker(element, 4 /* NodeFilter.SHOW_TEXT */);
	const pieces = [];
	while (walker.nextNode()) pieces.push(walker.currentNode.textContent.replace(/\s+/g, ' ').trim());
	return pieces.filter(Boolean);
}

const spacedText = (element) => textPieces(element).join(' ');

// Tags that format words inside a sentence. Anything else (span, div, li, time) is a
// box the layout places apart, so its text needs a space from the next box's.
const INLINE_FORMATTING = new Set([
	'A',
	'ABBR',
	'B',
	'CITE',
	'CODE',
	'EM',
	'I',
	'KBD',
	'MARK',
	'Q',
	'S',
	'SMALL',
	'STRONG',
	'SUB',
	'SUP',
	'U',
]);

function containerOf(node) {
	let top = node;
	let parent = node.parentNode;
	while (parent && INLINE_FORMATTING.has(parent.nodeName)) {
		top = parent;
		parent = parent.parentNode;
	}
	return { container: parent, top };
}

// "Mar 5, 2026" in one span and "My Homelab" in the next render apart in a browser but
// run together as text ("2026My Homelab"): put a space between text in different boxes
function spaceApartBoxes(root) {
	const walker = root.ownerDocument.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
	let previous;
	while (walker.nextNode()) {
		const current = walker.currentNode;
		if (!current.textContent.trim() || current.parentNode.closest('pre')) continue;
		if (previous && /\S$/.test(previous.textContent) && /^\S/.test(current.textContent)) {
			const before = containerOf(previous);
			const after = containerOf(current);
			if (before.container !== after.container) after.top.before(' ');
		}
		previous = current;
	}
}

function convertDocument(document, url) {
	const main = document.querySelector('main');
	if (!main) return null;

	// Accordion headings (the jobs on /about/) carry the only copy of their title
	main.querySelectorAll('button[aria-expanded]').forEach((button) => {
		const heading = document.createElement('p');
		heading.innerHTML = '<strong></strong>';
		heading.firstChild.textContent = spacedText(button);
		button.replaceWith(heading);
	});
	main.querySelectorAll(REMOVED).forEach((el) => el.remove());
	// Hidden until a script shows it, like the post search's empty message; "hidden
	// md:block" is only hidden on phones, so it stays
	main.querySelectorAll('.hidden').forEach((el) => {
		if (
			![...el.classList].some((c) =>
				/:(block|flex|grid|inline|inline-block|inline-flex|table|contents)$/.test(c),
			)
		)
			el.remove();
	});
	// A card is one big link around a picture, a title and a blurb: "[Title](url): blurb"
	main.querySelectorAll('a[href]').forEach((a) => {
		const hasBlocks = a.querySelector('img, picture, h1, h2, h3, h4, h5, h6, p, div, figure');
		// Or a name and a description in sibling spans, like the accounts on /contact/
		const hasTextParts =
			[...a.children].filter((child) => child.textContent.trim()).length > 1 &&
			![...a.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim());
		if (!hasBlocks && !hasTextParts) return;
		const [title, ...blurb] = textPieces(a);
		if (!title) return;
		const link = document.createElement('a');
		link.setAttribute('href', a.getAttribute('href'));
		link.textContent = title;
		const line = document.createElement('p');
		line.append(link);
		if (blurb.length) line.append(`: ${blurb.join(' ')}`);
		a.replaceWith(line);
	});
	// Links set side by side with no text between ("Source", "Blog Post") get a separator
	main.querySelectorAll('a[href]').forEach((a) => {
		if (a.previousSibling?.nodeName === 'A') a.before(' · ');
	});

	// Diagrams ship a desktop and a phone drawing with the same label: keep one, as text
	let lastDiagramLabel;
	main.querySelectorAll('svg').forEach((svg) => {
		const label = svg.getAttribute('role') === 'img' && svg.getAttribute('aria-label');
		if (label && label !== lastDiagramLabel) {
			const text = document.createElement('p');
			text.innerHTML = '<em></em>';
			text.firstChild.textContent = `Diagram: ${label}`;
			svg.replaceWith(text);
			lastDiagramLabel = label;
		} else {
			svg.remove();
		}
	});
	main.querySelectorAll('img').forEach((img) => {
		if (!img.getAttribute('alt')) img.remove();
		else img.setAttribute('src', img.src);
	});
	main.querySelectorAll('a[href]').forEach((a) => {
		// The # links rehype-autolink-headings puts beside each heading have no text
		if (!a.textContent.trim() && !a.querySelector('img')) a.remove();
		else a.setAttribute('href', a.href);
	});

	spaceApartBoxes(main);

	const title = document.title.replace(/ \| Joe Karlsson$/, '');
	const description =
		document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
	const body = turndown
		.turndown(main)
		.replace(/\n{3,}/g, '\n\n')
		.trim();
	return `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\nurl: ${url}\n---\n\n${body}\n`;
}

/** /about/index.html -> /about.md; the homepage -> /index.md */
export function markdownPathFor(htmlPath) {
	return htmlPath === 'index.html' ? 'index.md' : htmlPath.replace(/\/index\.html$/, '.md');
}

export default function markdownPages() {
	return {
		name: 'markdown-pages',
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				const distDir = fileURLToPath(dir);
				let written = 0;
				for (const file of listPages(distDir)) {
					const htmlPath = relative(distDir, file);
					const urlPath =
						htmlPath === 'index.html' ? '/' : `/${htmlPath.slice(0, -'index.html'.length)}`;
					const markdown = pageToMarkdown(readFileSync(file, 'utf8'), `${SITE_URL}${urlPath}`);
					if (!markdown) continue;
					writeFileSync(join(distDir, markdownPathFor(htmlPath)), markdown);
					// The llms.txt spec's own convention, which some agents try first
					writeFileSync(`${file}.md`, markdown);
					written += 1;
					// A closed jsdom window is only freed once the event loop turns
					await new Promise((resolve) => setImmediate(resolve));
				}
				logger.info(`Wrote ${written} Markdown pages`);
			},
		},
	};
}
