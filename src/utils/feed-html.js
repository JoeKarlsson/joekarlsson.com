// Feed readers strip inline SVG, so an inlined post diagram goes back to being its
// desktop file as a plain image (src/plugins/rehype-inline-diagrams.mjs)
export function diagramsAsImages(html) {
	return html.replace(
		/<figure class="diagram" data-diagram-src="([^"]+)" data-diagram-alt="([^"]*)">[\s\S]*?<\/figure>/g,
		'<p><img src="$1" alt="$2"></p>',
	);
}
