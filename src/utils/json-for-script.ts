// JSON for an inline <script> element (JSON-LD, data islands). JSON.stringify leaves
// `<` alone, so a string holding `</script>` (an imported title, a FAQ answer) would
// close the element and the rest would parse as HTML. Escaping `<` as \u003c keeps
// the same JSON value; the two line separators are escaped for old JS parsers.
export function jsonForScript(value: unknown): string {
	return JSON.stringify(value)
		.replace(/</g, '\\u003c')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');
}
