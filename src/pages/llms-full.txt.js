import { getCollection } from 'astro:content';

export async function GET() {
	const posts = await getCollection('blog');
	const postCount = posts.length;

	const sortedPosts = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

	const recentPosts = sortedPosts.slice(0, 10).map((post) => {
		const date = post.data.date.toISOString().split('T')[0];
		return `- [${post.data.title}](https://www.joekarlsson.com/blog/${post.data.slug}/): ${post.data.description || ''} (${date})`;
	});

	const body = `# Joe Karlsson - Full Site Guide

> Software Engineer and Developer Advocate specializing in data engineering, developer experience, and real-time data systems. Currently at CloudQuery building developer content and community for the open-source ELT framework. TEDx speaker with 100+ conference talks, 100,000+ social media followers, and a decade of experience across data infrastructure, DevRel, and front-end engineering. Runs a 40+ container Proxmox homelab with AI-powered smart home automations and local LLM inference. CS degree from Gustavus Adolphus College (2012).

## About Joe Karlsson

Joe Karlsson is a Software Engineer and Developer Advocate who helps developers build better data systems. His career spans teaching full-stack JavaScript in Honolulu, leading front-end engineering at Best Buy (one of North America's largest eCommerce sites), and building developer communities at MongoDB, SingleStore, Tinybird, and now CloudQuery.

He's a TEDx speaker ("The Art of Computer Science") with 100+ conference talks worldwide on databases, IoT, data engineering, and developer tools. He has 100,000+ followers across social media platforms including TikTok, Twitter/X, YouTube, and LinkedIn.

He's an avid homelab enthusiast running a Proxmox cluster with 40+ containers across two Dell PowerEdge R730 servers with dual NVIDIA GPUs. His smart home runs 90+ Home Assistant automations with local AI vision - his doorbell captures camera snapshots and describes visitors using a local LLM, entirely without cloud APIs.

He's a film buff who tracks everything on Letterboxd, a mechanical keyboard builder, and built an IoT-connected cat litter box and gave a conference talk about it.

## Areas of Expertise

### Data Engineering & Databases
Joe has spent most of his career working with data systems. He's worked at four database/data companies (MongoDB, SingleStore, Tinybird, CloudQuery) and written extensively about ClickHouse, MongoDB, SingleStore, real-time analytics, change data capture (CDC), schema design, sharding vs partitioning, data pipelines, ELT frameworks, and stream processing.

### Developer Experience & Advocacy
With 7+ years in DevRel roles, Joe specializes in developer content creation, community building, technical documentation, conference speaking, and making complex data topics accessible. He's given 100+ conference talks and created hundreds of tutorials, blog posts, and demos.

### Infrastructure & Self-Hosting
Joe runs production-grade self-hosted infrastructure: Proxmox clusters, LXC containers, Home Assistant, 10G networking, GPU passthrough for AI inference, and a full media/productivity stack replacing cloud services.

## Main Pages

- [Home](https://www.joekarlsson.com/): Latest blog posts, featured projects, and current updates
- [Blog](https://www.joekarlsson.com/blog): ${postCount} published posts organized by topic
- [About](https://www.joekarlsson.com/about): Biography, interests, and work history
- [Work](https://www.joekarlsson.com/work): Portfolio showcasing projects organized by category
- [Uses](https://www.joekarlsson.com/uses): Hardware, software, homelab infrastructure, and smart home setup
- [Contact](https://www.joekarlsson.com/contact): Social links organized by platform type
- [Talk Archive](https://www.joekarlsson.com/talk-archive): Conference talks, webinars, and presentations
- [Privacy Policy](https://www.joekarlsson.com/privacy-policy): Privacy statement and data handling practices

## Featured Projects

### IoT & Smart Home

- **IoT Kitty Litter Box**: Arduino-based smart pet monitoring system with weight sensors, Home Assistant integration, and automated health tracking. Conference talk topic. [GitHub](https://github.com/JoeKarlsson/iot-kitty-litter-box) (25+ stars)
- **MagicMirror**: Modular smart mirror display running on Raspberry Pi, showing weather, calendar, news, and custom modules.
- **Moodlite**: DIY Nanoleaf-style lighting system using programmable LED strips and custom firmware for ambient lighting control.
- **3D-Printed Planter**: Designed and printed custom postcard planter racks using CAD and FDM printing.
- **Proxmox Homelab Cluster**: Two Dell PowerEdge R730 servers with NVIDIA GPUs (RTX A4000 16GB + Quadro RTX 4000 8GB), 40+ LXC containers for media management, monitoring, databases, and smart home automation. 10G networking via MikroTik backbone with LACP bonds.
- **AI-Powered Smart Home**: Home Assistant with 90+ automations including local LLM doorbell vision, voice camera queries, infrastructure alert translation, laundry detection, weather-aware routines, and presence simulation. Zero cloud dependencies.

### Web & Applications

- **[React Spotify Player](https://github.com/JoeKarlsson/react-spotify-player)**: Web-based Spotify player built with React, demonstrating Spotify API integration. 130+ GitHub stars.
- **Bechdel.io**: Movie script analysis tool that tests films against the Bechdel Test criteria. [GitHub](https://github.com/JoeKarlsson/bechdel-test) (30+ stars)
- **Pixelate**: HTML5 Canvas image pixelation tool built with vanilla JavaScript. [GitHub](https://github.com/JoeKarlsson/Pixelate) (15+ stars)
- **Launch Target**: Web-based spaceship game.

### Education & Open Source

- **[Data Structures](https://github.com/JoeKarlsson/data-structures)**: JavaScript implementation of common data structures and algorithms. 185+ GitHub stars - Joe's most popular open-source project.
- **[Client-Server Communication Guide](https://github.com/JoeKarlsson/complete-guide-to-client-server-communication)**: Complete guide to Node.js client-server patterns. 43+ stars.
- **[Python Sudoku Generator/Solver](https://github.com/JoeKarlsson/python-sudoku-generator-solver)**: Python sudoku generator with 4 difficulty levels and brute force solver. 90+ stars.
- **MongoDB GraphQL Demo**: Example integration of MongoDB with GraphQL.
- **MongoDB CSFLE Demo**: Client-side field level encryption demonstration.

## GitHub Stats

- **537 followers** on GitHub
- **630+ total stars** across 60+ public repositories
- **223+ forks** of Joe's projects
- **Top repos**: data-structures (185 stars), react-spotify-player (131 stars), python-sudoku-generator-solver (90 stars)
- Profile: [github.com/JoeKarlsson](https://github.com/JoeKarlsson)

## Blog Topics

Joe writes regularly about:

- **Data Engineering & Databases**: ClickHouse, MongoDB, SingleStore - query optimization, schema design, sharding vs partitioning, CDC, real-time systems, data pipelines, ELT
- **Smart Homes & IoT**: Home Assistant, self-hosted infrastructure, privacy-focused automation, IoT device building
- **Development Tools**: React, Node.js, serverless, GraphQL, coding interviews
- **Infrastructure**: Proxmox, containers, Nginx Proxy Manager, AdGuard, self-hosting
- **Developer Relations**: Community building, content strategy, DevRel career advice
- **Personal**: Travel guides (Cuba, Oahu), music (Top 50 records), film

### Recent Posts

${recentPosts.join('\n')}

### Notable Posts

- "Self-Hosted Music Still Sucks in 2025" - self-hosting audio streaming
- "I Replaced My Smart Home With a Dumber Home - But At Least It's Private" - privacy-focused home automation
- "An Introduction to IoT (Internet of Toilets)" - the IoT litter box story
- "The Art of Computer Science" - TEDx talk companion piece
- "MongoDB Schema Design Best Practices" - database architecture guide
- "How to Get Started Building a Homelab Server in 2024" - beginner homelab guide
- "Why ClickHouse Should Be Your Next Database" - real-time analytics
- "How to Build a Real-Time Fraud Detection System" - streaming data patterns
- "Event Sourcing with Kafka: A Practical Example" - event-driven architecture

## Homelab & Self-Hosting Philosophy

Joe replaces SaaS dependencies with self-hosted alternatives that integrate with each other:

- **Photos**: Immich replaces Google Photos - GPU-accelerated face recognition, all data on NAS
- **Documents**: Paperless-ngx with AI auto-tagging via Paperless-AI
- **Calendar & Tasks**: Nextcloud CalDAV replaces iCloud - same Apple apps, own hardware
- **Media**: Sonarr/Radarr/Prowlarr -> Tdarr (GPU H.265 transcoding) -> Plex
- **Security**: Frigate GPU object detection -> Home Assistant automations -> local notifications
- **Monitoring**: Grafana + Prometheus + Loki across 40+ containers, ntfy push notifications
- **Analytics**: Plausible replaces Google Analytics - self-hosted, no cookies, GDPR compliant
- **Passwords**: 1Password primary + self-hosted Vaultwarden backup
- **DNS**: AdGuard Home (primary container + secondary Raspberry Pi)

## Smart Home Highlights

- **Doorbell AI Vision**: Frigate camera snapshot -> local LLM on GPU -> TTS announcement describing who's at the door
- **Voice Camera Queries**: "What's at the front door?" triggers real-time AI vision analysis via Home Assistant Assist
- **Infrastructure Alert Translation**: Prometheus alerts -> local LLM -> friendly natural-language notifications
- **Laundry Detection**: Vibration + contact sensors detect washer/dryer completion, combined notifications across 3 speakers
- **Power Night Mode**: HA SSHs into Proxmox at 11 PM, stops non-essential containers saving ~175W, restarts at 7 AM with health checks
- **Weather-Aware Mornings**: Checks forecast to decide curtain position, light scenes, and climate presets
- **Vacation Presence Simulation**: Mimics realistic light patterns, arms alarm, adjusts climate when away

## Speaking & Presentations

- **TEDx Speaker**: "The Art of Computer Science" - [Watch on TED.com](https://www.ted.com/talks/joe_karlsson_the_art_of_computer_science)
- **100+ Conference Talks**: Worldwide conferences on databases, IoT, data engineering, DevRel, and web development
- **Talk Archive**: Full list of past presentations available at [/talk-archive](https://www.joekarlsson.com/talk-archive/)
- **YouTube**: Recorded talks and tutorials at [youtube.com/joekarlsson](https://www.youtube.com/joekarlsson)

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
- **[JavaScript Jabber](https://topenddevs.com/podcasts/javascript-jabber/episodes/jsj-436-mongodb-basics-with-joe-karlsson)**: Two episodes - MongoDB Basics and Internet of Things (IoT)
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

- **CloudQuery** (2025-Present): Developer Advocate - building developer content, demos, tutorials, and community for the open-source ELT framework. Creating resources for data pipelines and cloud infrastructure visibility.
- **Tinybird** (2023-2025): Developer Advocate - helped developers build real-time analytics applications. Created documentation, demos, blog posts, webinars, and workshops for real-time data APIs.
- **SingleStore** (2021-2023): Senior Developer Advocate - led community engagement around scaling SQL workloads. Built demos and content for the distributed SQL database.
- **MongoDB** (2019-2021): Senior Developer Advocate - built developer community, created tutorials, demos, and educational content. Subject matter expert for developer experience.
- **Best Buy** (2017-2019): Front-end Technical Lead - engineered high-performance solutions for one of the top 10 eCommerce sites in North America. Scaled production apps handling thousands of requests per second.
- **DevLeague** (2015-2017): Full-Stack JavaScript Instructor - taught full-stack JavaScript at one of the top 10 coding bootcamps worldwide. Created curriculum and prepared students for software engineering careers in Honolulu, Hawaii.

## Social Media & Audience

Joe has 100,000+ followers across social media platforms.

### Primary
- [GitHub](https://github.com/JoeKarlsson): 537 followers, 630+ stars across 60+ repos
- [LinkedIn](https://www.linkedin.com/in/joekarlsson/): Professional network
- [Bluesky](https://bsky.app/profile/joekarlsson.com): Primary social platform

### Video & Audio
- [YouTube](https://www.youtube.com/joekarlsson): Talks, tutorials, and demos
- [TikTok](https://www.tiktok.com/@joekarlsson): Short-form tech content
- [Twitch](https://www.twitch.tv/joe_karlsson): Live coding and hangouts
- [Spotify](https://open.spotify.com/user/125084446): Playlists and listening

### Other
- [Twitter/X](https://twitter.com/JoeKarlsson1): Tech commentary
- [Threads](https://www.threads.net/@joekarlsson)
- [Instagram](https://www.instagram.com/joekarlsson/)
- [Letterboxd](https://letterboxd.com/joekarlsson/): Film reviews and ratings
- [Substack](https://joekarlsson.substack.com/): Newsletter
- [Reddit](https://www.reddit.com/user/joekarlsson)
- [Medium](https://medium.com/@joekarlsson)
- [npm](https://www.npmjs.com/~joekarlsson)

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
