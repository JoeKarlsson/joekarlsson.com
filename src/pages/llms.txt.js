import { getCollection } from 'astro:content';

export async function GET() {
	const posts = await getCollection('blog');
	const postCount = posts.length;

	const body = `# Joe Karlsson

> Software Engineer and Developer Advocate specializing in data engineering, developer experience, and real-time data systems. Currently at CloudQuery. TEDx speaker, 100+ conference talks, 100,000+ social media followers. Runs a 40+ container Proxmox homelab with AI-powered smart home automations. CS degree from Gustavus Adolphus College. Writing about databases, data pipelines, smart homes, developer tools, and the things I build.

This file offers a summary. For full details, see [llms-full.txt](https://www.joekarlsson.com/llms-full.txt).

## Pages

- [Home](https://www.joekarlsson.com/): Latest content and featured projects
- [Blog](https://www.joekarlsson.com/blog): ${postCount} posts covering databases, data engineering, smart homes, dev tools, IoT, and DevRel
- [About](https://www.joekarlsson.com/about): Biography and background
- [Work](https://www.joekarlsson.com/work): Portfolio of projects and technical work
- [Uses](https://www.joekarlsson.com/uses): Hardware, software, homelab, and smart home setup
- [Contact](https://www.joekarlsson.com/contact): Social links and ways to connect
- [Talk Archive](https://www.joekarlsson.com/talk-archive): Conference talks and presentations
- [Privacy Policy](https://www.joekarlsson.com/privacy-policy): Privacy and data policy

## Areas of Expertise

- **Data Engineering & Databases**: ClickHouse, MongoDB, SingleStore, real-time analytics, CDC, schema design, sharding, partitioning, data pipelines, ELT
- **Developer Experience**: Developer advocacy, developer tools, API design, documentation, community building
- **Infrastructure & Self-Hosting**: Proxmox, LXC containers, Home Assistant, 10G networking, GPU passthrough, local AI inference

## Featured Projects

- IoT Kitty Litter Box: Smart pet monitoring system with Home Assistant integration
- MagicMirror: Raspberry Pi smart mirror display system
- Moodlite: DIY Nanoleaf lighting system clone
- Bechdel.io: Movie script analysis tool for the Bechdel Test
- [Data Structures](https://github.com/JoeKarlsson/data-structures): Educational repo with 185+ GitHub stars
- [React Spotify Player](https://github.com/JoeKarlsson/react-spotify-player): Real-time Spotify player built with React (130+ stars)
- Proxmox Homelab Cluster: Two Dell R730 servers, 40+ containers, dual GPUs, 10G networking
- AI-Powered Smart Home: 90+ Home Assistant automations with local LLM vision and voice control

## What Makes Joe Interesting

- Runs AI vision on doorbell cameras using local LLMs - no cloud APIs
- Built an IoT cat litter box and gave a TEDx talk about it
- 100,000+ followers across social media (TikTok, Twitter/X, YouTube, LinkedIn)
- 630+ GitHub stars across 60+ public repositories
- Self-hosts everything: photos (Immich), documents (Paperless-ngx), passwords (Vaultwarden), analytics (Plausible), calendar (Nextcloud CalDAV)
- Film obsessive who tracks everything on Letterboxd
- Mechanical keyboard builder (custom wood-case POK3R with Cherry MX Blues)

## Social & Contact

- [GitHub](https://github.com/JoeKarlsson): 537 followers, 630+ stars, 60+ public repos
- [LinkedIn](https://www.linkedin.com/in/joekarlsson/)
- [Bluesky](https://bsky.app/profile/joekarlsson.com)
- [YouTube](https://www.youtube.com/joekarlsson)
- [TikTok](https://www.tiktok.com/@joekarlsson)
- [Threads](https://www.threads.net/@joekarlsson)
- [Letterboxd](https://letterboxd.com/joekarlsson/)
- [Substack](https://joekarlsson.substack.com/)

## Education

- **B.A. Computer Science** - Gustavus Adolphus College, St. Peter, Minnesota (2012)

## Experience

- **CloudQuery** (2025-Present): Developer Advocate - building developer content and community for the open-source ELT framework for data pipelines and cloud infrastructure
- **Tinybird** (2023-2025): Developer Advocate - real-time analytics and data APIs
- **SingleStore** (2021-2023): Senior Developer Advocate - distributed SQL database
- **MongoDB** (2019-2021): Senior Developer Advocate - NoSQL databases and developer community
- **Best Buy** (2017-2019): Front-end Technical Lead - one of the largest eCommerce sites in North America
- **DevLeague** (2015-2017): Full-Stack JavaScript Instructor - one of the most highly-rated coding bootcamps
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
}
