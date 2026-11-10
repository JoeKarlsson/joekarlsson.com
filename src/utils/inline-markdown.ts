// Project page text (src/data/projects.ts) as HTML: escaped, with `code` spans and
// [text](url) links, the only markdown those strings use
// http(s), root-relative and #fragment links only: a javascript: href would run
const SAFE_HREF = /^(https?:\/\/|\/(?!\/)|#)/i;
const LINK_CLASS = 'text-pink underline decoration-1 underline-offset-[0.2em] hover:text-paper';

export function inlineMarkdown(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/`([^`]+)`/g, '<code>$1</code>')
		.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (link, label, href) =>
			SAFE_HREF.test(href) ? `<a href="${href}" class="${LINK_CLASS}">${label}</a>` : link,
		);
}
