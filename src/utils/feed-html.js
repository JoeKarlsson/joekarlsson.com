// Feed readers strip inline SVG, so an inlined post diagram goes back to being its
// desktop file as a plain image (src/plugins/rehype-inline-diagrams.mjs)
export function diagramsAsImages(html) {
	return html.replace(
		/<figure class="diagram" data-diagram-src="([^"]+)" data-diagram-alt="([^"]*)">[\s\S]*?<\/figure>/g,
		'<p><img src="$1" alt="$2"></p>',
	);
}

// Feed readers run no scripts, so a lazy video still (data-poster, set by in-view-play.ts
// on the site) becomes a plain poster, or the video shows as an empty box
export function postersForFeeds(html) {
	return html.replace(/\sdata-poster="/g, ' poster="');
}

// Feed readers ignore popover, so a link's hover preview (rehype-post-previews.mjs) would show
// as a card in the middle of the sentence
export function withoutLinkPreviews(html) {
	return html.replace(/<span popover="hint"[^>]*class="link-peek"[^>]*>[\s\S]*?<\/span>/g, '');
}

// Feed readers have no margin, so a margin note (rehype-margin-notes.mjs) would repeat what the
// line already says: its citation, footnote, quote or code comment, or a front-matter note's
// phone copy (mn-narrow), which repeats the note kept in the feed. Note bodies hold no <div>.
export function withoutMarginCopies(html) {
	return html.replace(
		/<aside class="(?:margin|code)-note"[^>]*>[\s\S]*?<\/aside>|<span class="code-note-rule"[^>]*><\/span>|<div role="note" class="[^"]*\bmn-narrow\b[^"]*"[^>]*>[\s\S]*?<\/div>/g,
		'',
	);
}

// What only works on the page, with its CSS and scripts: the crayon rings round noted words
// (an empty box in a reader), heading # links, chapter numerals, FAQ +/- signs, the phone copy
// of a note's number, a post's interlude (a line the post already says), the giant quote mark, citation numbers whose notes the feed drops, and desktop-only embeds,
// which have no src until a script sets one (their phone link, just before, stays)
const PAGE_ONLY = [
	/<svg class="hover-ring[^"]*"[\s\S]*?<\/svg>/g,
	/<a class="heading-anchor"[^>]*>[\s\S]*?<\/a>/g,
	/<span class="chapter-num"[^>]*>[^<]*<\/span>/g,
	/<p class="interlude"[^>]*>[^<]*<\/p>/g,
	/<span class="quote-mark"[^>]*>[^<]*<\/span>/g,
	/<span class="faq-sign[^"]*"[^>]*>(?:<span[^>]*>[^<]*<\/span>)*<\/span>/g,
	/<sup class="cite-num mn-num mn-phone">[\s\S]*?<\/sup>/g,
	/<sup class="cite-num"[^>]*>[^<]*<\/sup>/g,
	/<div class="[^"]*"[^>]*>\s*<iframe data-desktop-src[\s\S]*?<\/iframe>\s*<\/div>/g,
];
export function withoutPageOnlyParts(html) {
	return PAGE_ONLY.reduce((out, pattern) => out.replace(pattern, ''), html);
}
