import nowFeed from '../data/now-feed.json';
import {
	absoluteUrl,
	getBlogPosts,
	getNewsletter,
	listAllWork,
	listBlogSections,
	listFeaturedWork,
	listPopularPosts,
	listSitePages,
	listTalkPages,
	postLine,
	listExperience,
	listSocialSections,
} from '../utils/llms';

// The lists below build from the site itself (src/utils/llms.ts); only the bio and
// the talks, podcasts and press sections are written by hand.
export async function GET() {
	const posts = await getBlogPosts();
	const newsletter = await getNewsletter();
	const talkPages = await listTalkPages();
	const { github } = nowFeed;

	const body = `# Joe Karlsson - Full Site Guide

> Principal Developer Marketing Engineer specializing in data engineering, developer experience, and real-time data systems. Currently at CData, leading developer growth for the managed MCP platform that connects AI agents to live enterprise data. TEDx speaker with 100+ conference talks, 100,000+ social media followers, and a decade of experience across data infrastructure, DevRel, and front-end engineering. Runs a ${nowFeed.homelab.runningContainers}-container Proxmox homelab with AI-powered smart home automations and local LLM inference. CS degree from Gustavus Adolphus College (2012).

## About Joe Karlsson

Joe Karlsson is a Developer Marketing Engineer who helps developers build better data systems. His career spans teaching full-stack JavaScript in Honolulu, leading front-end engineering at Best Buy (one of North America's largest eCommerce sites), and building developer communities at MongoDB, SingleStore, Tinybird, CloudQuery, and now CData - where he leads developer marketing for the managed MCP platform that connects AI agents to live enterprise data.

He's a TEDx speaker ("The Art of Computer Science") with 100+ conference talks worldwide on databases, IoT, data engineering, and developer tools. He has 100,000+ followers across social media platforms including TikTok, Twitter/X, YouTube, and LinkedIn.

He's an avid homelab enthusiast running a Proxmox cluster with ${nowFeed.homelab.runningContainers} containers across ${nowFeed.homelab.proxmoxNodes} Dell PowerEdge R730 servers with dual NVIDIA GPUs. His smart home runs 90+ Home Assistant automations with local AI vision - his doorbell captures camera snapshots and describes visitors using a local LLM, entirely without cloud APIs.

He's a film buff who tracks everything on Letterboxd, a mechanical keyboard builder, and built an IoT-connected cat litter box and gave a conference talk about it.

## Areas of Expertise

### Data Engineering & Databases
Joe has spent most of his career working with data systems. He's worked at four database/data companies (MongoDB, SingleStore, Tinybird, CloudQuery) and written extensively about ClickHouse, MongoDB, SingleStore, real-time analytics, change data capture (CDC), schema design, sharding vs partitioning, data pipelines, ELT frameworks, and stream processing.

### Developer Experience & Advocacy
With 7+ years in DevRel roles, Joe specializes in developer content creation, community building, technical documentation, conference speaking, and making complex data topics accessible. He's given 100+ conference talks and created hundreds of tutorials, blog posts, and demos.

### Infrastructure & Self-Hosting
Joe runs production-grade self-hosted infrastructure: Proxmox clusters, LXC containers, Home Assistant, 10G networking, GPU passthrough for AI inference, and a full media/productivity stack replacing cloud services.

## Pages

Every page also comes as Markdown: swap the trailing slash for .md (https://www.joekarlsson.com/about/ is https://www.joekarlsson.com/about.md, and the homepage is /index.md).

${listSitePages().join('\n')}

## Selected Works

${listFeaturedWork().join('\n')}

### All Projects

${listAllWork().join('\n')}

## GitHub Stats

- **${github.followers} followers** on GitHub
- **${github.stars} total stars** across ${github.publicRepos} public repositories
- **${github.forks} forks** of Joe's projects
- **Top repos**: ${github.topRepos.map((repo) => `[${repo.name}](${repo.url}) (${repo.stars} stars)`).join(', ')}
- Profile: [github.com/JoeKarlsson](https://github.com/JoeKarlsson)

## Blog Topics

Joe writes regularly about:

- **Data Engineering & Databases**: ClickHouse, MongoDB, SingleStore - query optimization, schema design, sharding vs partitioning, CDC, real-time systems, data pipelines, ELT
- **Smart Homes & IoT**: Home Assistant, self-hosted infrastructure, privacy-focused automation, IoT device building
- **Development Tools**: React, Node.js, serverless, GraphQL, coding interviews
- **Infrastructure**: Proxmox, containers, Nginx Proxy Manager, AdGuard, self-hosting
- **Developer Relations**: Community building, content strategy, DevRel career advice
- **Personal**: Travel guides (Cuba, Oahu), music (Top 50 records), film

### Blog Sections

${listBlogSections(posts).join('\n')}

### Most Read

${listPopularPosts(posts, 10).join('\n')}

### All Posts

All ${posts.length} posts, newest first.

${posts.map(postLine).join('\n')}

## Newsletter

[Works on My Machine](${absoluteUrl('/newsletter/')}) is Joe's newsletter on tech writing, AI, homelab builds and open source. Every issue, newest first:

${newsletter.lines.join('\n')}

The archive also holds ${newsletter.backIssueCount} back issues of TL;DR in Tech, an earlier link roundup.

## Homelab & Self-Hosting Philosophy

Joe replaces SaaS dependencies with self-hosted alternatives that integrate with each other:

- **Photos**: Immich replaces Google Photos - GPU-accelerated face recognition, all data on NAS
- **Documents**: Paperless-ngx with AI auto-tagging via Paperless-AI
- **Calendar & Tasks**: Nextcloud CalDAV replaces iCloud - same Apple apps, own hardware
- **Media**: Sonarr/Radarr/Prowlarr -> Tdarr (GPU H.265 transcoding) -> Plex
- **Security**: Frigate GPU object detection -> Home Assistant automations -> local notifications
- **Monitoring**: Grafana + Prometheus + Loki across ${nowFeed.homelab.runningContainers} containers, ntfy push notifications
- **Analytics**: Plausible replaces Google Analytics - self-hosted, no cookies, GDPR compliant
- **Passwords**: 1Password primary + self-hosted Vaultwarden backup
- **DNS**: AdGuard Home (primary container + secondary Raspberry Pi)

## Smart Home Highlights

- **Doorbell AI Vision**: Frigate camera snapshot -> local LLM on GPU -> TTS announcement describing who's at the door
- **Voice Camera Queries**: "What's at the front door?" triggers real-time AI vision analysis via Home Assistant Assist
- **Infrastructure Alert Translation**: Prometheus alerts -> local LLM -> friendly natural-language notifications
- **Laundry Detection**: Vibration + contact sensors detect washer/dryer completion, combined notifications across 3 speakers
- **Weather-Aware Mornings**: Checks forecast to decide curtain position, light scenes, and climate presets
- **Vacation Presence Simulation**: Mimics realistic light patterns, arms alarm, adjusts climate when away

## Speaking & Presentations

- **TEDx Speaker**: "The Art of Computer Science" - [Watch on TED.com](https://www.ted.com/talks/joe_karlsson_the_art_of_computer_science)
- **100+ Conference Talks**: Worldwide conferences on databases, IoT, data engineering, DevRel, and web development
- **Talks**: Every talk, podcast, livestream and demo video, with recordings, at [/talks](https://www.joekarlsson.com/talks/)
- **YouTube**: Recorded talks and tutorials at [youtube.com/joekarlsson](https://www.youtube.com/joekarlsson)

### Talk Write-ups

The talks I wrote up in full, each with its recording:

${talkPages.join('\n')}

### Notable Talk Titles

- "[Keynote] The Art of Computer Science" - TEDx talk and conference keynote about the intersection of coding and artistic expression
- "An Introduction to IoT (Internet of Toilets)" - Building an IoT cat litter box with Raspberry Pi and JavaScript
- "DevOps and Databases" - Live demo incorporating databases into DevOps pipelines with GitHub Actions
- "How to Build a Data Stack Your Company Actually Uses" - Aligning data infrastructure with organizational needs
- "Building High Performance React Applications" - Front-end performance optimization
- "How to Secure Your Cloud by Building a CSPM System in 15 Minutes" - Hands-on cloud security with open-source tools

## Podcast Appearances

- **[Hanselminutes with Scott Hanselman](https://hanselminutes.com/752/document-databases-and-mongo-with-engineer-joe-karlsson)**: Document Databases and MongoDB - how document DBs differ from relational databases
- **[Screaming in the Cloud with Corey Quinn](https://www.lastweekinaws.com/podcast/screaming-in-the-cloud/when-data-is-your-brand-and-your-job-with-joe-karlsson/)** (Last Week in AWS): "When Data is Your Brand and Your Job" - data engineering, AI, and building a personal brand
- **JavaScript Jabber**: Two episodes - MongoDB Basics and Internet of Things (IoT)
- **[CodeNewbie](https://dev.to/codenewbie/s19-e6-how-to-make-learning-databases-fun-and-approachable-joe-karlsson)**: S19:E6 - "How to make learning databases fun and approachable"
- **Reach or Miss Podcast**: Episode 182 - career journey from bootcamp instructor to Developer Advocate

## Press & Recognition

- **Ranked #1 on ["10 Must-Follow Developers on TikTok"](https://unclebigbay.com/10-must-follow-developers-on-tik-tok)** list
- **Featured on Hawaii Public Radio** (Bytemarks Cafe) - discussed the Stupid Shit Hackathon in Honolulu
- **Published author on MongoDB Developer Hub** - multiple tutorials and articles on MongoDB best practices
- **Published author on Tinybird blog** - articles on real-time data analytics
- **Sessionize verified speaker** with active speaking profile

## Availability

Joe is available for:
- **Conference talks & keynotes**: Data engineering, databases, developer tools, IoT, smart homes, self-hosting
- **Podcast guest spots**: Data, DevRel, career, tech culture, homelab/self-hosting
- **Webinars & workshops**: Hands-on database tutorials, data pipeline demos, cloud security
- **Technical collaborations**: Open source, content partnerships, developer community projects

Contact via [joekarlsson.com/contact](https://www.joekarlsson.com/contact/) or connect on [LinkedIn](https://www.linkedin.com/in/joekarlsson/).

## Education

- **B.A. Computer Science** - Gustavus Adolphus College, St. Peter, Minnesota (Class of 2012)

## Professional Experience

${listExperience().join('\n')}

## Social Media & Audience

Joe has 100,000+ followers across social media platforms.

- [GitHub](https://github.com/JoeKarlsson): ${github.followers} followers, ${github.stars} stars across ${github.publicRepos} repos
- [Newsletter](${absoluteUrl('/newsletter/')}): Works on My Machine, plus the TL;DR in Tech archive

${listSocialSections()}

## Key Interests & Expertise

- Data Engineering & Pipelines (ELT, CDC, real-time analytics, stream processing)
- Database Architecture (SQL, NoSQL, distributed systems, ClickHouse, MongoDB)
- Developer Experience & Advocacy (content creation, community building, conference speaking)
- Smart Home Automation (Home Assistant, local AI vision, Zigbee, presence detection)
- DevOps & Infrastructure (Proxmox, LXC containers, 10G networking, GPU passthrough)
- AI & Local LLMs (local inference for home automation, GPU-accelerated AI workflows)
- Open Source (community engagement, educational projects)
- Film & Entertainment (Letterboxd, Bechdel Test advocacy)
- IoT & Hardware (Arduino, Raspberry Pi, mechanical keyboards, 3D printing)
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
}
