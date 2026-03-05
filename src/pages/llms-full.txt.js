import { getCollection } from 'astro:content';

export async function GET() {
	const posts = await getCollection('blog');
	const postCount = posts.length;

	const sortedPosts = posts.sort(
		(a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
	);

	const recentPosts = sortedPosts.slice(0, 10).map((post) => {
		const date = post.data.date.toISOString().split('T')[0];
		return `- [${post.data.title}](https://www.joekarlsson.com/blog/${post.data.slug}/): ${post.data.description || ''} (${date})`;
	});

	const body = `# Joe Karlsson — Full Site Guide

> Software Engineer and Developer Advocate at CloudQuery. TEDx speaker, film buff, homelab enthusiast, and massive nerd. Runs a 40+ container Proxmox homelab with AI-powered smart home automations, local LLM inference, and zero cloud dependencies. This comprehensive guide covers Joe's writing, projects, speaking engagements, and professional background.

## About Joe Karlsson

Joe Karlsson is a Software Engineer and Developer Advocate who empowers developers to think creatively when building applications. A TEDx speaker and self-described "massive nerd," Joe combines technical depth with DevRel expertise, having worked at CloudQuery, Tinybird, SingleStore, MongoDB, Best Buy, and DevLeague.

He's an avid homelab enthusiast running a Proxmox cluster with 40+ containers across two Dell PowerEdge R730 servers with dual NVIDIA GPUs. His smart home runs 90+ Home Assistant automations with local AI vision — his doorbell captures camera snapshots and describes visitors using a local LLM, entirely without cloud APIs.

He's a film buff who tracks everything on Letterboxd, a mechanical keyboard builder, built an IoT-connected cat litter box and gave a conference talk about it, and uses Claude Code to manage his entire homelab infrastructure.

## Main Pages

- [Home](https://www.joekarlsson.com/): Latest blog posts, featured projects, and current updates
- [Blog](https://www.joekarlsson.com/blog): ${postCount} published posts organized by topic
- [About](https://www.joekarlsson.com/about): Biography, interests, and work history
- [Work](https://www.joekarlsson.com/work): Portfolio showcasing projects organized by category
- [Uses](https://www.joekarlsson.com/uses): Hardware, software, homelab infrastructure, and smart home setup
- [Contact](https://www.joekarlsson.com/contact): Social links organized by platform type
- [Talk Archive](https://www.joekarlsson.com/talk-archive): Conference talks, webinars, and presentations
- [Speaker Rider](https://www.joekarlsson.com/speaker-rider): Speaking engagement requirements and logistics
- [Privacy Policy](https://www.joekarlsson.com/privacy-policy): Privacy statement and data handling practices

## Featured Projects

### IoT & Smart Home

- **IoT Kitty Litter Box**: Arduino-based smart pet monitoring system with weight sensors, Home Assistant integration, and automated health tracking. Conference talk topic.
- **MagicMirror²**: Modular smart mirror display running on Raspberry Pi, showing weather, calendar, news, and custom modules.
- **Moodlite**: DIY Nanoleaf-style lighting system using programmable LED strips and custom firmware for ambient lighting control.
- **3D-Printed Planter**: Designed and printed custom postcard planter racks using CAD and FDM printing.
- **Proxmox Homelab Cluster**: Two Dell PowerEdge R730 servers with NVIDIA GPUs (RTX A4000 16GB + Quadro RTX 4000 8GB), 40+ LXC containers for media management, monitoring, databases, and smart home automation. 10G networking via MikroTik backbone with LACP bonds.
- **AI-Powered Smart Home**: Home Assistant with 90+ automations including local LLM doorbell vision, voice camera queries, infrastructure alert translation, laundry detection, weather-aware routines, and presence simulation. Zero cloud dependencies.

### Web & Applications

- **React Spotify Player**: Web-based Spotify player built with React, demonstrating Spotify API integration.
- **Bechdel.io**: Movie script analysis tool that tests films against the Bechdel Test criteria.
- **Pixelate**: HTML5 Canvas image pixelation tool built with vanilla JavaScript.
- **Launch Target**: Web-based spaceship game.

### Education & Open Source

- **[Data Structures](https://github.com/JoeKarlsson/data-structures)**: JavaScript implementation of common data structures. 185+ GitHub stars.
- **Client-Server Communication Guide**: Complete guide to Node.js client-server patterns.
- **MongoDB GraphQL Demo**: Example integration of MongoDB with GraphQL.
- **MongoDB CSFLE Demo**: Client-side field level encryption demonstration.

## Blog Topics

Joe writes regularly about:

- **Databases**: ClickHouse, MongoDB, SingleStore — query optimization, schema design, sharding vs partitioning, CDC, real-time systems
- **Smart Homes & IoT**: Home Assistant, self-hosted infrastructure, privacy-focused automation, IoT device building
- **Development Tools**: React, Node.js, serverless, GraphQL, coding interviews
- **Infrastructure**: Proxmox, containers, Nginx Proxy Manager, AdGuard, self-hosting
- **Developer Relations**: Community building, content strategy, DevRel career advice
- **Personal**: Travel guides (Cuba, Oahu), music (Top 50 records), film

### Recent Posts

${recentPosts.join('\n')}

### Notable Posts

- "Self-Hosted Music Still Sucks in 2025" — self-hosting audio streaming
- "I Replaced My Smart Home With a Dumber Home — But At Least It's Private" — privacy-focused home automation
- "An Introduction to IoT (Internet of Toilets)" — the IoT litter box story
- "The Art of Computer Science" — TEDx talk companion piece
- "MongoDB Schema Design Best Practices" — database architecture guide
- "How to Get Started Building a Homelab Server in 2024" — beginner homelab guide

## Homelab & Self-Hosting Philosophy

Joe replaces SaaS dependencies with self-hosted alternatives that integrate with each other:

- **Photos**: Immich replaces Google Photos — GPU-accelerated face recognition, all data on NAS
- **Documents**: Paperless-ngx with AI auto-tagging via Paperless-AI
- **Calendar & Tasks**: Nextcloud CalDAV replaces iCloud — same Apple apps, own hardware
- **Media**: Sonarr/Radarr/Prowlarr → Tdarr (GPU H.265 transcoding) → Plex
- **Security**: Frigate GPU object detection → Home Assistant automations → local notifications
- **Monitoring**: Grafana + Prometheus + Loki across 40+ containers, ntfy push notifications
- **Analytics**: Plausible replaces Google Analytics — self-hosted, no cookies, GDPR compliant
- **Passwords**: 1Password primary + self-hosted Vaultwarden backup
- **DNS**: AdGuard Home (primary container + secondary Raspberry Pi)

## Smart Home Highlights

- **Doorbell AI Vision**: Frigate camera snapshot → local LLM on GPU → TTS announcement describing who's at the door
- **Voice Camera Queries**: "What's at the front door?" triggers real-time AI vision analysis via Home Assistant Assist
- **Infrastructure Alert Translation**: Prometheus alerts → local LLM → friendly natural-language notifications
- **Laundry Detection**: Vibration + contact sensors detect washer/dryer completion, combined notifications across 3 speakers
- **Power Night Mode**: HA SSHs into Proxmox at 11 PM, stops non-essential containers saving ~175W, restarts at 7 AM with health checks
- **Weather-Aware Mornings**: Checks forecast to decide curtain position, light scenes, and climate presets
- **Vacation Presence Simulation**: Mimics realistic light patterns, arms alarm, adjusts climate when away

## Speaking & Presentations

- **TEDx Speaker**: "The Art of Computer Science"
- **Conference Speaker**: Hundreds of conferences worldwide on databases, IoT, DevRel, and web development
- **Talk Archive**: Full list of past presentations available at /talk-archive
- **Speaker Rider**: Detailed requirements for event organizers at /speaker-rider

## Professional Experience

- **CloudQuery** (2025–Present): Developer Advocate — data infrastructure and community engagement
- **Tinybird** (2023–2025): Developer Advocate — real-time data analytics
- **SingleStore** (2021–2023): Senior Developer Advocate — distributed SQL database
- **MongoDB** (2019–2021): Senior Developer Advocate — NoSQL databases
- **Best Buy** (2017–2019): Front-end Technical Lead — one of the largest eCommerce sites in North America
- **DevLeague** (2015–2017): Full-Stack JavaScript Instructor — one of the most highly-rated coding bootcamps

## Social Media

### Primary
- [GitHub](https://github.com/JoeKarlsson): Open-source repositories and project code
- [LinkedIn](https://www.linkedin.com/in/joekarlsson/): Professional network
- [Bluesky](https://bsky.app/profile/joekarlsson.com): Primary social platform

### Video & Audio
- [YouTube](https://www.youtube.com/joekarlsson): Talks, tutorials, and demos
- [Twitch](https://www.twitch.tv/joe_karlsson): Live coding and hangouts
- [Spotify](https://open.spotify.com/user/125084446): Playlists and listening

### Other
- [Threads](https://www.threads.net/@joekarlsson)
- [Instagram](https://www.instagram.com/joekarlsson/)
- [Letterboxd](https://letterboxd.com/joekarlsson/): Film reviews and ratings
- [Reddit](https://www.reddit.com/user/joekarlsson)
- [Medium](https://medium.com/@joekarlsson)
- [npm](https://www.npmjs.com/~joekarlsson)

## Key Interests & Expertise

- Smart Home Automation (Home Assistant, local AI vision, Zigbee, presence detection)
- Database Architecture (SQL, NoSQL, distributed systems, real-time analytics)
- DevOps & Infrastructure (Proxmox, LXC containers, 10G networking, GPU passthrough)
- AI Tools (Claude Code for infrastructure management, local LLMs for home automation)
- Open Source (community engagement, educational projects)
- Developer Advocacy (content creation, community building, conference speaking)
- Film & Entertainment (Letterboxd, Bechdel Test advocacy)
- IoT & Hardware (Arduino, Raspberry Pi, mechanical keyboards, 3D printing)
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
}
