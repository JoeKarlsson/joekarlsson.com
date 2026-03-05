import { getCollection } from 'astro:content';

export async function GET() {
	const posts = await getCollection('blog');
	const postCount = posts.length;

	const body = `# Joe Karlsson

> Software Engineer and Developer Advocate at CloudQuery. TEDx speaker, film buff, homelab enthusiast, and massive nerd. Runs a 40+ container Proxmox homelab with AI-powered smart home automations. Writing about databases, smart homes, developer tools, and the things I build.

## Pages

- [Home](https://www.joekarlsson.com/): Latest content and featured projects
- [Blog](https://www.joekarlsson.com/blog): ${postCount} posts covering databases, smart homes, dev tools, IoT, and DevRel
- [About](https://www.joekarlsson.com/about): Biography and background
- [Work](https://www.joekarlsson.com/work): Portfolio of projects and technical work
- [Uses](https://www.joekarlsson.com/uses): Hardware, software, homelab, and smart home setup
- [Contact](https://www.joekarlsson.com/contact): Social links and ways to connect
- [Talk Archive](https://www.joekarlsson.com/talk-archive): Conference talks and presentations
- [Privacy Policy](https://www.joekarlsson.com/privacy-policy): Privacy and data policy

## Featured Projects

- IoT Kitty Litter Box: Smart pet monitoring system with Home Assistant integration
- MagicMirror²: Raspberry Pi smart mirror display system
- Moodlite: DIY Nanoleaf lighting system clone
- Bechdel.io: Movie script analysis tool for the Bechdel Test
- [Data Structures](https://github.com/JoeKarlsson/data-structures): Educational repo with 185+ GitHub stars
- Proxmox Homelab Cluster: Two Dell R730 servers, 40+ containers, dual GPUs, 10G networking
- AI-Powered Smart Home: 90+ Home Assistant automations with local LLM vision and voice control

## What Makes Joe Interesting

- Runs AI vision on doorbell cameras using local LLMs - no cloud APIs
- Built an IoT cat litter box and gave a TEDx-adjacent conference talk about it
- Self-hosts everything: photos (Immich), documents (Paperless-ngx), passwords (Vaultwarden), analytics (Plausible), calendar (Nextcloud CalDAV)
- Uses Claude Code (CLI) to manage his entire homelab infrastructure
- Film obsessive who tracks everything on Letterboxd
- Mechanical keyboard builder (custom wood-case POK3R with Cherry MX Blues)

## Social & Contact

- [GitHub](https://github.com/JoeKarlsson)
- [LinkedIn](https://www.linkedin.com/in/joekarlsson/)
- [Bluesky](https://bsky.app/profile/joekarlsson.com)
- [YouTube](https://www.youtube.com/joekarlsson)
- [Threads](https://www.threads.net/@joekarlsson)
- [Letterboxd](https://letterboxd.com/joekarlsson/)

## Experience

- **CloudQuery** (2025–Present): Developer Advocate
- **Tinybird** (2023–2025): Developer Advocate
- **SingleStore** (2021–2023): Senior Developer Advocate
- **MongoDB** (2019–2021): Senior Developer Advocate
- **Best Buy** (2017–2019): Front-end Technical Lead
- **DevLeague** (2015–2017): Full-Stack JavaScript Instructor
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
}
