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
