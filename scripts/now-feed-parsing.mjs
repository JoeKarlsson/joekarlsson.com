// The text and RSS parsing behind scripts/update-now-feed.mjs, kept free of network
// and file access so tests/now-feed-parsing.test.ts can run it on fixtures.

export function decodeEntities(text) {
	return text
		.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&');
}

export function truncateAtWord(text, maxChars) {
	if (text.length <= maxChars) return text;
	const lastSpace = text.lastIndexOf(' ', maxChars);
	// One long word: cut it, rather than slice(0, -1) keeping nearly all of it
	const cut = lastSpace > 0 ? text.slice(0, lastSpace) : text.slice(0, maxChars);
	return `${cut.replace(/[\s,.;:-]+$/, '')}...`;
}

export function readTag(itemXml, tag) {
	return itemXml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`))?.[1].trim();
}

/** The newest films in a Letterboxd RSS feed, with the poster URL still remote. */
export function parseLetterboxdFilms(rss, { limit, reviewExcerptMaxChars }) {
	const items = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
	// The feed also carries lists, which have no film title.
	const filmItems = items.filter((item) => readTag(item, 'letterboxd:filmTitle'));
	if (filmItems.length === 0) throw new Error('Letterboxd feed has no film entries');

	return filmItems.slice(0, limit).map((item) => {
		const description = readTag(item, 'description');
		const posterUrl = description.match(/<img src="([^"]+)"/)?.[1];
		if (!posterUrl) throw new Error(`No poster in Letterboxd item: ${readTag(item, 'link')}`);
		const isReview = readTag(item, 'guid').startsWith('letterboxd-review-');
		const reviewText = decodeEntities(
			description
				.replace(/<p><img[^>]*\/><\/p>/, '')
				.replace(/<p><em>This review may contain spoilers\.<\/em><\/p>/, '')
				.replace(/<[^>]+>/g, ' ')
				.replace(/\]\]>|<!\[CDATA\[/g, ''),
		)
			.replace(/\s+/g, ' ')
			.trim();
		const rating = readTag(item, 'letterboxd:memberRating');
		return {
			title: decodeEntities(readTag(item, 'letterboxd:filmTitle')),
			year: Number(readTag(item, 'letterboxd:filmYear')),
			rating: rating ? Number(rating) : null,
			reviewExcerpt: isReview ? truncateAtWord(reviewText, reviewExcerptMaxChars) : null,
			url: readTag(item, 'link'),
			tmdbId: readTag(item, 'tmdb:movieId'),
			posterUrl,
		};
	});
}

/**
 * Follower, repo, star and fork counts for llms.txt, from the GitHub user and their
 * owned repos. Forks and private repos don't count: they aren't my public work.
 */
export function summarizeGitHubProfile(user, repos, { topRepoCount }) {
	const ownPublicRepos = repos.filter((repo) => !repo.fork && !repo.private);
	const sum = (field) => ownPublicRepos.reduce((total, repo) => total + repo[field], 0);
	return {
		followers: user.followers,
		publicRepos: ownPublicRepos.length,
		stars: sum('stargazers_count'),
		forks: sum('forks_count'),
		topRepos: [...ownPublicRepos]
			.sort((a, b) => b.stargazers_count - a.stargazers_count)
			.slice(0, topRepoCount)
			.map((repo) => ({
				name: repo.name,
				url: repo.html_url,
				description: repo.description,
				stars: repo.stargazers_count,
			})),
	};
}
