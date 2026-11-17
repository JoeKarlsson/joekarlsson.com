import { joinLastWord } from '../plugins/rehype-no-widows.mjs';
import { curlyApostrophes } from './curly-apostrophes.mjs';

// Project page text (src/data/projects.ts) as HTML: escaped, with `code` spans and
// [text](url) links, the only markdown those strings use. Curled, and the last word kept
// off a line of its own like a post's (rehype-no-widows)
// http(s), root-relative and #fragment links only: a javascript: href would run
const SAFE_HREF = /^(https?:\/\/|\/(?!\/)|#)/i;
const LINK_CLASS = 'text-pink underline decoration-1 underline-offset-[0.2em] hover:text-paper';

export function inlineMarkdown(text: string): string {
	const curled = curlyApostrophes(text);
	// A trailing code span keeps its own spaces, so `npm run build` still copies
	return (/`\S*$/.test(curled) ? curled : joinLastWord(curled))
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/`([^`]+)`/g, '<code>$1</code>')
		.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (link, label, href) =>
			SAFE_HREF.test(href) ? `<a href="${href}" class="${LINK_CLASS}">${label}</a>` : link,
		);
}
