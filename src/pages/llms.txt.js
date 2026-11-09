import nowFeed from '../data/now-feed.json';
import {
	absoluteUrl,
	getBlogPosts,
	getNewsletter,
	listBlogSections,
	listFeaturedWork,
	listPopularPosts,
	listSitePages,
} from '../utils/llms';

// The lists below build from the site itself (src/utils/llms.ts); only the bio is
// written by hand.
export async function GET() {
	const posts = await getBlogPosts();
	const newsletter = await getNewsletter();
	const { github } = nowFeed;

	const body = `# Joe Karlsson

> Developer Marketing Engineer specializing in data engineering, developer experience, and real-time data systems. Currently at CData, leading developer growth for the managed MCP platform that connects AI agents to live enterprise data. TEDx speaker, 100+ conference talks, 100,000+ social media followers. Runs a ${nowFeed.homelab.runningContainers}-container Proxmox homelab with AI-powered smart home automations. CS degree from Gustavus Adolphus College. Writing about databases, data pipelines, smart homes, developer tools, and the things I build.

This file offers a summary. For full details, every post and every project, see [llms-full.txt](https://www.joekarlsson.com/llms-full.txt).

Every page also comes as Markdown: swap the trailing slash for .md (https://www.joekarlsson.com/about/ is https://www.joekarlsson.com/about.md, and the homepage is /index.md).

## Pages

${listSitePages().join('\n')}

## Blog

${posts.length} posts. Every post with its date is in [llms-full.txt](${absoluteUrl('/llms-full.txt')}).

${listBlogSections(posts).join('\n')}

### Most Read

${listPopularPosts(posts, 10).join('\n')}

## Newsletter

[Works on My Machine](${absoluteUrl('/newsletter/')}): ${newsletter.count} issues on tech writing, AI, homelab builds and open source, plus ${newsletter.backIssueCount} back issues of TL;DR in Tech.

${newsletter.lines.slice(0, 5).join('\n')}

## Areas of Expertise

- **Data Engineering & Databases**: ClickHouse, MongoDB, SingleStore, real-time analytics, CDC, schema design, sharding, partitioning, data pipelines, ELT
- **Developer Marketing & Experience**: Developer marketing, developer advocacy, developer tools, API design, documentation, SEO/AEO, community building
- **Infrastructure & Self-Hosting**: Proxmox, LXC containers, Home Assistant, 10G networking, GPU passthrough, local AI inference

## Selected Works

${listFeaturedWork().join('\n')}

## Most-Starred Open Source

${github.topRepos.map((repo) => `- [${repo.name}](${repo.url}): ${repo.description} (${repo.stars} stars)`).join('\n')}

## Notable Talks

- "The Art of Computer Science" (TEDx / keynote)
- "An Introduction to IoT (Internet of Toilets)"
- "DevOps and Databases"
- "How to Build a Data Stack Your Company Actually Uses"
- "Building High Performance React Applications"
- "How to Secure Your Cloud by Building a CSPM System in 15 Minutes"

## Podcast Appearances

- Hanselminutes with Scott Hanselman - Document Databases and MongoDB
- Screaming in the Cloud with Corey Quinn (Last Week in AWS) - Data as a Brand
- JavaScript Jabber - MongoDB Basics + IoT episodes
- CodeNewbie - Making databases fun and approachable

## Press & Recognition

- Ranked #1 on "10 Must-Follow Developers on TikTok" list
- Featured on Hawaii Public Radio (Bytemarks Cafe)
- Published author on MongoDB Developer Hub and Tinybird blog

## What Makes Joe Interesting

- Runs AI vision on doorbell cameras using local LLMs - no cloud APIs
- Built an IoT cat litter box and gave a conference talk about it
- 100,000+ followers across social media (TikTok, Twitter/X, YouTube, LinkedIn)
- ${github.stars} GitHub stars across ${github.publicRepos} public repositories
- Self-hosts everything: photos (Immich), documents (Paperless-ngx), passwords (Vaultwarden), analytics (Plausible), calendar (Nextcloud CalDAV)
- Film obsessive who tracks everything on Letterboxd
- Mechanical keyboard builder (custom wood-case POK3R with Cherry MX Blues)

## Availability

Joe is available for conference talks, podcast guest spots, webinars, and technical collaborations. Preferred topics: data engineering, databases, developer tools, IoT, smart homes, and self-hosting. Contact via [joekarlsson.com/contact](https://www.joekarlsson.com/contact/).

## Social & Contact

- [GitHub](https://github.com/JoeKarlsson): ${github.followers} followers, ${github.stars} stars, ${github.publicRepos} public repos
- [LinkedIn](https://www.linkedin.com/in/joekarlsson/)
- [Bluesky](https://bsky.app/profile/joekarlsson.com)
- [YouTube](https://www.youtube.com/joekarlsson)
- [TikTok](https://www.tiktok.com/@joekarlsson)
- [Threads](https://www.threads.net/@joekarlsson)
- [Letterboxd](https://letterboxd.com/joekarlsson/)

## Education

- **B.A. Computer Science** - Gustavus Adolphus College, St. Peter, Minnesota (2012)

## Experience

- **CData** (2026-Present): Principal Developer Marketing Manager - leading developer growth for the managed MCP platform that connects AI agents to live enterprise data
- **CloudQuery** (2024-2026): Head of Developer Relations - built the DevRel function from scratch for the open-source ELT framework for data pipelines and cloud infrastructure
- **Tinybird** (2023-2024): Senior Developer Advocate - real-time analytics and data APIs
- **SingleStore** (2021-2023): Senior Developer Advocate - distributed SQL database
- **MongoDB** (2019-2021): Senior Developer Advocate - NoSQL databases and developer community
- **Best Buy** (2017-2019): Front-end Technical Lead - one of the largest eCommerce sites in North America
- **DevLeague** (2015-2017): Full-Stack JavaScript Instructor - one of the most highly-rated coding bootcamps
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
}
