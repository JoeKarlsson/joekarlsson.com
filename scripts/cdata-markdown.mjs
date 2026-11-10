/**
 * cdata.com article HTML -> blog markdown, for scripts/import-cdata-posts.mjs.
 *
 * The scraped HTML is third-party content (CData's CMS) and the Astro markdown
 * pipeline renders raw HTML, so this treats it as untrusted (security audit run-1):
 * - text is HTML-escaped, so escaped prose like "&lt;img onerror&gt;" stays text
 * - every table gets a heading row first, so turndown-plugin-gfm never keeps one as
 *   raw HTML, and event-handler attributes are dropped
 * - links keep only http(s), mailto, root-relative and #fragment targets
 * - code fences are longer than any backtick run inside the code
 * - assertSafeMarkdown() rejects anything that still carries raw HTML or a script link
 */
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { tables } from 'turndown-plugin-gfm';

const SAFE_HREF = /^(https?:|mailto:|\/(?!\/)|#)/i;

export function isSafeHref(href) {
	return SAFE_HREF.test(String(href ?? '').trim());
}

// Raw HTML (a tag or doctype) left in markdown outside code, or a link whose target isn't
// a safe scheme. Returns the problems found, empty when clean. Comments are checked like
// any other text, not stripped first: a browser ends a malformed comment like
// `<!<!-- -->--` at its first `>`, so stripping well-formed-looking comments out of it
// would hide a live tag behind them. A plain `<!-- vale X = NO -->` has no tag and passes.
export function unsafeMarkdown(md) {
	const prose = md
		.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, '')
		.replace(/(`+)[\s\S]*?\1/g, '');
	const problems = [];
	for (const m of prose.matchAll(/<(?:[a-zA-Z][\w-]*[\s/>]|\/[a-zA-Z]|![a-zA-Z])/g)) {
		problems.push(`raw HTML: ${prose.slice(m.index, m.index + 40)}`);
	}
	for (const m of prose.matchAll(/\]\(\s*<?([^)\s>]*)/g)) {
		if (!isSafeHref(m[1])) problems.push(`unsafe link: ${m[1].slice(0, 40)}`);
	}
	return problems;
}

export function assertSafeMarkdown(md) {
	const problems = unsafeMarkdown(md);
	if (problems.length)
		throw new Error(`Imported markdown is not safe:\n- ${problems.join('\n- ')}`);
	return md;
}

function normalizeDom(html) {
	const { document } = new JSDOM(`<!doctype html><body>${html}</body>`).window;
	for (const el of document.body.querySelectorAll('*')) {
		for (const { name } of [...el.attributes]) {
			if (/^on/i.test(name) || name === 'style' || name === 'srcdoc') el.removeAttribute(name);
		}
	}
	for (const table of document.body.querySelectorAll('table')) {
		const first = table.rows[0];
		if (!first) continue;
		const isHeading = [...first.cells].every((c) => c.nodeName === 'TH');
		if (!isHeading) {
			for (const td of [...first.cells].filter((c) => c.nodeName === 'TD')) {
				const th = document.createElement('th');
				th.append(...td.childNodes);
				td.replaceWith(th);
			}
		}
		if (first.parentNode.nodeName !== 'THEAD') {
			const thead = document.createElement('thead');
			thead.append(first);
			table.prepend(thead);
		}
	}
	return document.body;
}

export function toMarkdown(html, origin) {
	const td = new TurndownService({
		headingStyle: 'atx',
		codeBlockStyle: 'fenced',
		bulletListMarker: '-',
		emDelimiter: '_',
	});
	td.use(tables);
	// Markdown punctuation plus HTML: `<` would start a tag, `&name;` an entity
	const escapeMarkdown = td.escape.bind(td);
	td.escape = (text) =>
		escapeMarkdown(text)
			.replace(/&(?=#?[a-zA-Z0-9]+;)/g, '&amp;')
			.replace(/</g, '&lt;');
	// Links to anything but http(s), mailto, / and # keep their text only
	td.addRule('unsafeLink', {
		filter: (node) =>
			node.nodeName === 'A' && node.hasAttribute('href') && !isSafeHref(node.getAttribute('href')),
		replacement: (content) => content,
	});
	// Turndown pads markers ("1.  x") and indents by 4; markdownlint wants "1. x"
	td.addRule('listItem', {
		filter: 'li',
		replacement: (content, node) => {
			const parent = node.parentNode;
			const marker =
				parent.nodeName === 'OL'
					? `${Number(parent.getAttribute('start') ?? 1) + [...parent.childNodes].filter((n) => n.nodeName === 'LI').indexOf(node)}.`
					: '-';
			const indent = ' '.repeat(marker.length + 1);
			const body = content.replace(/^\n+/, '').replace(/\n+$/, '').replace(/\n/g, `\n${indent}`);
			return `${marker} ${body}${node.nextSibling ? '\n' : ''}`;
		},
	});
	// CMS wraps code in <pre><code class="language-x"> or bare <pre>. The fence is one
	// backtick longer than the longest run in the code, so the code can't close it.
	td.addRule('pre', {
		filter: 'pre',
		replacement: (_c, node) => {
			const code = node.querySelector('code') ?? node;
			const lang = (code.getAttribute('class') ?? '').match(/language-([\w-]+)/)?.[1] ?? '';
			const text = code.textContent.replace(/\n$/, '');
			const longest = Math.max(0, ...[...text.matchAll(/`+/g)].map((m) => m[0].length));
			const fence = '`'.repeat(Math.max(3, longest + 1));
			return `\n\n${fence}${lang}\n${text}\n${fence}\n\n`;
		},
	});
	let md = td.turndown(normalizeDom(html));

	// Shift headings so the shallowest one is h2 (the page title is the h1)
	const levels = [...md.matchAll(/^(#{1,6}) /gm)].map((m) => m[1].length);
	const shift = levels.length ? Math.min(...levels) - 2 : 0;
	if (shift !== 0) {
		md = md.replace(/^(#{1,6}) /gm, (_m, h) => '#'.repeat(Math.max(2, h.length - shift)) + ' ');
	}

	return assertSafeMarkdown(
		md
			// STYLE_GUIDE: no em dashes
			.replace(/\s*—\s*/g, ' - ')
			.replace(/[‘’]/g, "'")
			.replace(/[“”]/g, '"')
			.replace(/ /g, ' ')
			// Relative CData links -> absolute
			.replace(/\]\(\/(?!\/)/g, `](${origin}/`)
			.replace(/\n{3,}/g, '\n\n')
			.trim() + '\n',
	);
}
