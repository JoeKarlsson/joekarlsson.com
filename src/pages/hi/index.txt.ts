// `curl -L joekarlsson.com/hi`: Caddy answers /hi with a redirect to /hi/, and its
// file_server serves index.txt there as text/plain. Numbers come from the now-feed
// snapshot, so they match the rest of the site at each deploy.
import nowFeed from '../../data/now-feed.json';
import { getFeedPosts } from '../../utils/posts';
import { terminalCard } from '../../utils/terminal-card';

export async function GET() {
	const [latest] = await getFeedPosts();
	return new Response(
		terminalCard({
			...nowFeed.homelab,
			latestTitle: latest.data.title,
			latestUrl: new URL(latest.href, 'https://joekarlsson.com').href,
		}),
		{ headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
	);
}
