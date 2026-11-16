/**
 * Curls the apostrophes in plain text that skips markdown's smart quotes (front matter,
 * component strings): doesn't, Proxmox's, the hosts' racks. `code` spans keep theirs.
 * @param {string} text
 */
export function curlyApostrophes(text) {
	return text
		.split(/(`[^`]+`)/)
		.map((part, i) => (i % 2 ? part : part.replace(/(\w)'(?=\w|\s|$|[.,;:!?)])/g, '$1’')))
		.join('');
}
