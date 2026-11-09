// Snapshot what I've recently shipped (merged GitHub PRs), watched (Letterboxd) and
// listened to (Audiobookshelf podcasts), plus live homelab stats (Prometheus) and
// GitHub profile counts for llms.txt, into
// src/data/now-feed.json, with covers saved as WebP under public/images/now/. The
// site reads the snapshot at build time, so visitors never reach Audiobookshelf or
// Prometheus. deploy.sh runs this before every build:
//   npm run update:now
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { loadEnvFile } from 'node:process';
import sharp from 'sharp';
import {
	parseLetterboxdFilms,
	summarizeGitHubProfile,
	truncateAtWord,
} from './now-feed-parsing.mjs';

// deploy.sh exports the main checkout's .env before running this, including from a
// worktree, which has none; run on its own, it reads .env here. Missing values fail below.
if (existsSync('.env')) loadEnvFile('.env');

const { AUDIOBOOKSHELF_URL, AUDIOBOOKSHELF_API_TOKEN, PROMETHEUS_URL } = process.env;
for (const [name, value] of Object.entries({
	AUDIOBOOKSHELF_URL,
	AUDIOBOOKSHELF_API_TOKEN,
	PROMETHEUS_URL,
})) {
	if (!value) throw new Error(`${name} is missing from .env`);
}

const GITHUB_USERNAME = 'JoeKarlsson';
const SHIPPING_WINDOW_DAYS = 30;
const SHIPPING_MAX_REPOS = 4;
// A sanity cap on paging so a broken `next` link can't loop forever. This site alone
// passed 500 commits in a month (November 2026), so leave plenty of room.
const MAX_COMMIT_PAGES_PER_REPO = 20;
const LATEST_COMMIT_MESSAGE_MAX_CHARS = 70;
const GITHUB_TOP_REPO_COUNT = 3;
// Same kind of cap for the owned-repo list, at 100 a page
const MAX_REPO_PAGES = 5;
const LETTERBOXD_RSS_URL = 'https://letterboxd.com/joekarlsson/rss/';
const ITEMS_PER_FEED = 4;
const REVIEW_EXCERPT_MAX_CHARS = 160;
const COVER_WIDTH_PX = 200;
const COVER_DIR = 'public/images/now';
const OUTPUT_PATH = 'src/data/now-feed.json';

async function fetchOrThrow(url, options) {
	const response = await fetch(url, options);
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response;
}

async function saveCoverAsWebp(imageUrl, fileName, fetchOptions) {
	const response = await fetchOrThrow(imageUrl, fetchOptions);
	await sharp(Buffer.from(await response.arrayBuffer()))
		.resize({ width: COVER_WIDTH_PX })
		.webp({ quality: 80 })
		.toFile(`${COVER_DIR}/${fileName}`);
	return `/images/now/${fileName}`;
}

async function fetchRecentFilms() {
	const rss = await (await fetchOrThrow(LETTERBOXD_RSS_URL)).text();
	const films = [];
	for (const { tmdbId, posterUrl, ...film } of parseLetterboxdFilms(rss, {
		limit: ITEMS_PER_FEED,
		reviewExcerptMaxChars: REVIEW_EXCERPT_MAX_CHARS,
	})) {
		films.push({ ...film, poster: await saveCoverAsWebp(posterUrl, `film-${tmdbId}.webp`) });
	}
	return films;
}

async function fetchRecentPodcastEpisodes() {
	const authHeaders = { headers: { Authorization: `Bearer ${AUDIOBOOKSHELF_API_TOKEN}` } };
	const response = await fetchOrThrow(
		`${AUDIOBOOKSHELF_URL}/api/me/listening-sessions?itemsPerPage=100&page=0`,
		authHeaders,
	);
	const { sessions } = await response.json();
	const podcastSessions = sessions
		.filter((session) => session.mediaType === 'podcast' && session.episodeId)
		.sort((a, b) => b.updatedAt - a.updatedAt);

	const episodes = [];
	const seenEpisodeIds = new Set();
	for (const session of podcastSessions) {
		if (episodes.length === ITEMS_PER_FEED) break;
		if (seenEpisodeIds.has(session.episodeId)) continue;
		seenEpisodeIds.add(session.episodeId);
		// A session's mediaMetadata.title is the episode title; the show's own
		// metadata lives on the library item.
		const libraryItem = await (
			await fetchOrThrow(`${AUDIOBOOKSHELF_URL}/api/items/${session.libraryItemId}`, authHeaders)
		).json();
		const podcastMetadata = libraryItem.media.metadata;
		episodes.push({
			episodeTitle: session.displayTitle,
			podcastTitle: podcastMetadata.title,
			// Only public pages: never link to the Audiobookshelf server itself.
			url: podcastMetadata.itunesPageUrl || null,
			cover: await saveCoverAsWebp(
				`${AUDIOBOOKSHELF_URL}/api/items/${session.libraryItemId}/cover`,
				`podcast-${session.libraryItemId}.webp`,
				authHeaders,
			),
		});
	}
	if (episodes.length === 0) throw new Error('Audiobookshelf has no podcast listening sessions');
	return episodes;
}

const GITHUB_REQUEST_OPTIONS = {
	headers: {
		Accept: 'application/vnd.github+json',
		// Unauthenticated calls get 60 an hour, which a few deploys in a row used up.
		Authorization: `Bearer ${execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim()}`,
	},
};
// deploy.sh commits the snapshot on every deploy; those aren't work worth counting.
// The second message is the old name: drop it once it's older than the window.
const SNAPSHOT_REFRESH_COMMIT_MESSAGES = [
	'chore: Refresh now-feed snapshot',
	'chore: Refresh recently watched and listened snapshot',
];

async function fetchAllCommitsSince(repoFullName, sinceIso) {
	const commits = [];
	let url = `https://api.github.com/repos/${repoFullName}/commits?author=${GITHUB_USERNAME}&since=${sinceIso}&per_page=100`;
	for (let page = 1; url; page += 1) {
		if (page > MAX_COMMIT_PAGES_PER_REPO) {
			throw new Error(
				`${repoFullName} has over ${MAX_COMMIT_PAGES_PER_REPO * 100} commits since ${sinceIso}`,
			);
		}
		const response = await fetchOrThrow(url, GITHUB_REQUEST_OPTIONS);
		commits.push(...(await response.json()));
		url = response.headers.get('link')?.match(/<([^>]+)>; rel="next"/)?.[1];
	}
	return commits;
}

// Public repos I've committed to in the window, most recently pushed first.
async function fetchRecentlyShippedRepos() {
	const windowStart = new Date(Date.now() - SHIPPING_WINDOW_DAYS * 24 * 60 * 60 * 1000);
	const reposResponse = await fetchOrThrow(
		`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=20`,
		GITHUB_REQUEST_OPTIONS,
	);
	const candidateRepos = (await reposResponse.json()).filter(
		(repo) =>
			// Authenticated now, so filter private repos explicitly rather than trusting
			// the endpoint to leave them out.
			!repo.private &&
			!repo.fork &&
			// The profile README repo
			repo.name !== GITHUB_USERNAME &&
			new Date(repo.pushed_at) >= windowStart,
	);

	const shippedRepos = [];
	for (const repo of candidateRepos) {
		if (shippedRepos.length === SHIPPING_MAX_REPOS) break;
		const commits = (await fetchAllCommitsSince(repo.full_name, windowStart.toISOString())).filter(
			(commit) => !SNAPSHOT_REFRESH_COMMIT_MESSAGES.includes(commit.commit.message.trim()),
		);
		if (commits.length === 0) continue;
		const commitCountByDate = {};
		for (const commit of commits) {
			const date = new Date(commit.commit.author.date).toLocaleDateString('en-CA');
			commitCountByDate[date] = (commitCountByDate[date] || 0) + 1;
		}
		// Oldest first, today last, one entry per day including the empty ones.
		const dailyCommitCounts = Array.from({ length: SHIPPING_WINDOW_DAYS }, (_, index) => {
			const daysAgo = SHIPPING_WINDOW_DAYS - 1 - index;
			const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA');
			return commitCountByDate[date] || 0;
		});
		shippedRepos.push({
			name: repo.name,
			description: repo.description,
			url: repo.html_url,
			language: repo.language,
			commitCount: commits.length,
			dailyCommitCounts,
			// The API lists newest first.
			latestCommitMessage: truncateAtWord(
				commits[0].commit.message.split('\n')[0],
				LATEST_COMMIT_MESSAGE_MAX_CHARS,
			),
		});
	}
	return shippedRepos;
}

async function fetchGitHubProfile() {
	const user = await (
		await fetchOrThrow(`https://api.github.com/users/${GITHUB_USERNAME}`, GITHUB_REQUEST_OPTIONS)
	).json();
	const repos = [];
	let url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?type=owner&per_page=100`;
	for (let page = 1; url; page += 1) {
		if (page > MAX_REPO_PAGES)
			throw new Error(`${GITHUB_USERNAME} has over ${MAX_REPO_PAGES * 100} repos`);
		const response = await fetchOrThrow(url, GITHUB_REQUEST_OPTIONS);
		repos.push(...(await response.json()));
		url = response.headers.get('link')?.match(/<([^>]+)>; rel="next"/)?.[1];
	}
	return summarizeGitHubProfile(user, repos, { topRepoCount: GITHUB_TOP_REPO_COUNT });
}

async function queryPrometheusScalar(promql) {
	const response = await fetchOrThrow(
		`${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent(promql)}`,
	);
	const { data } = await response.json();
	if (data.result.length !== 1) throw new Error(`Prometheus returned no value for: ${promql}`);
	return Number(data.result[0].value[1]);
}

async function fetchHomelabStats() {
	const [runningContainers, proxmoxNodes, cpuThreads, memoryBytes] = await Promise.all([
		queryPrometheusScalar('sum(pve_up{id=~"lxc/.*"})'),
		queryPrometheusScalar('count(pve_up{id=~"node/.*"})'),
		queryPrometheusScalar('sum(pve_cpu_usage_limit{id=~"node/.*"})'),
		queryPrometheusScalar('sum(pve_memory_size_bytes{id=~"node/.*"})'),
	]);
	return {
		runningContainers,
		proxmoxNodes,
		cpuThreads,
		// GiB, matching what Proxmox reports
		memoryGB: Math.round(memoryBytes / 1024 ** 3),
	};
}

mkdirSync(COVER_DIR, { recursive: true });
const [shippedRepos, films, podcastEpisodes, homelab, github] = await Promise.all([
	fetchRecentlyShippedRepos(),
	fetchRecentFilms(),
	fetchRecentPodcastEpisodes(),
	fetchHomelabStats(),
	fetchGitHubProfile(),
]);
// Delete covers the new snapshot no longer uses, only after every feed succeeded.
const coversInUse = new Set(
	[...films.map((film) => film.poster), ...podcastEpisodes.map((episode) => episode.cover)].map(
		(path) => path.split('/').pop(),
	),
);
for (const file of readdirSync(COVER_DIR)) {
	if (!coversInUse.has(file)) rmSync(`${COVER_DIR}/${file}`);
}
writeFileSync(
	OUTPUT_PATH,
	JSON.stringify(
		{
			updatedAt: new Date().toLocaleDateString('en-CA'),
			shippingWindowDays: SHIPPING_WINDOW_DAYS,
			shippedRepos,
			films,
			podcastEpisodes,
			homelab,
			github,
		},
		null,
		'\t',
	) + '\n',
);
console.log(
	`Wrote ${shippedRepos.length} shipped repos, ${films.length} films, ${podcastEpisodes.length} podcast episodes, homelab stats and GitHub counts to ${OUTPUT_PATH}`,
);
