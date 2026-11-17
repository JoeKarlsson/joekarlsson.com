/**
 * Curls the quotes in plain text that skips markdown's smart quotes (front matter, project
 * data, component strings): doesn't, Buffalo ’66, Nuke ’Em, “now playing”. `code` spans
 * and HTML tags (an href's quotes) keep theirs.
 * @param {string} text
 */
export function curlyApostrophes(text) {
	return text
		.split(/(`[^`]+`|<[^>]+>)/)
		.map((part, i) =>
			i % 2
				? part
				: part
						.replace(/(\w)'(?=\w|\s|$|[.,;:!?)])/g, '$1’')
						// A word's dropped start ('66, '90s, 'Em, 'til) is an apostrophe, not an open quote
						.replace(/(^|[\s(])'(?=\d|(?:em|til|n|cause)\b)/gi, '$1’')
						.replace(/(^|[\s([—-])'(?=\S)/g, '$1‘')
						.replace(/(^|[\s([—-])"(?=\S)/g, '$1“')
						// After a digit it's an inch mark (14" MacBook), which stays straight
						.replace(/(?<!\d)"/g, '”'),
		)
		.join('');
}

/**
 * Curls every string in a data file's records (projects.ts, talks.ts), except the values
 * under `keep` keys, which are code to copy. Throws on anything but plain objects and
 * arrays, so a Date or Map can't silently become {}.
 * @template T
 * @param {T} value
 * @param {Set<string>} [keep]
 * @param {string} [key]
 * @returns {T}
 */
export function curlEveryString(value, keep = new Set(), key = '') {
	if (typeof value === 'string')
		return /** @type {T} */ (keep.has(key) ? value : curlyApostrophes(value));
	if (Array.isArray(value))
		return /** @type {T} */ (value.map((item) => curlEveryString(item, keep)));
	if (value && typeof value === 'object') {
		if (Object.getPrototypeOf(value) !== Object.prototype)
			throw new Error(`curlEveryString can't walk ${Object.prototype.toString.call(value)}`);
		return /** @type {T} */ (
			Object.fromEntries(Object.entries(value).map(([k, v]) => [k, curlEveryString(v, keep, k)]))
		);
	}
	return value;
}
