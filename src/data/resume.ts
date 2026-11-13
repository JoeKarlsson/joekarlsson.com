import nowFeed from './now-feed.json';

export interface BulletLink {
	label: string;
	url: string;
}

export type Bullet = string | { text: string; link: BulletLink };

export interface Role {
	company: string;
	title: string;
	startYear: number;
	endYear: number | null; // null = present
	location: string;
	logo?: string;
	tech: string[];
	bullets: Bullet[];
	// One or two sentences for /about and llms.txt
	summary: string;
}

export const roles: Role[] = [
	{
		company: 'CData',
		title: 'Principal Developer Marketing Engineer',
		startYear: 2026,
		endYear: null,
		location: 'Remote',
		logo: '/images/logos/cdata.webp',
		tech: ['MCP', 'AI Agents', 'SQL', 'REST APIs', 'SEO', 'Python'],
		summary:
			"Run developer marketing for CData's managed MCP platform, which connects AI agents to live enterprise data: docs, content, SEO and AEO, and how the platform is positioned.",
		bullets: [
			"Run developer marketing for Connect AI, CData's managed MCP platform that connects AI agents to live enterprise data, and own developer growth end to end",
			'Own the developer growth engine: technical docs, content, SEO and AEO, and how the platform is positioned to the engineers building on it',
			'Grow the organic developer adoption already forming around Connect AI',
			'Work with Product, Engineering, and Docs to keep the developer experience tight and make CData the obvious choice for connecting AI agents to enterprise data',
			'Build the demos, guides, and content that show developers how to solve their actual problem',
		],
	},
	{
		company: 'CloudQuery (now env0)',
		title: 'Head of Developer Relations',
		startYear: 2024,
		endYear: 2026,
		location: 'Remote',
		logo: '/images/logos/cloudquery.webp',
		tech: ['GCP', 'AWS', 'Azure', 'ClickHouse', 'Python', 'SQL'],
		summary:
			"Built DevRel from scratch and ran all of it: content, community, docs, events and video. Organic traffic grew 4x in 3 months. After the merger, the same content approach grew env0's organic traffic 106% in 3 weeks.",
		bullets: [
			'Built the Developer Relations function from scratch and ran all of it: content, community, docs, events, and video. Also owned the marketing site, docs, and developer hub, from the first Google result to trial activation',
			'Grew organic traffic 4x in under 3 months (about 1,350 to 5,600+ visitors a week). 426 keywords reached the top 10, including "cloud governance framework" (11 to 2) and "IT asset management" (43 to 7), and two target keywords hit #1',
			'Weekly search impressions reached 4.9x the previous all-time high, and trial signups rose 61% during the same push',
			'Rewrote the docs end to end: Quickstart completions went from zero to 25 a week, docs traffic grew 302%, and docs became a measurable activation channel',
			'Monthly MQLs hit 239% of target. Organic readers converted to trials and closed deals with no paid touchpoints',
			'Built a weekly audit that combined Search Console, Ahrefs, Plausible, and HubSpot, so every fix shipped as a tracked PR and I could tell which change moved which page',
			"Built the marketing team's Claude Code skills repo, which became shared internal tooling for both the CloudQuery and env0 brands, plus AI automations that produce sales one-pagers, discovery decks, and pitch slides",
			'Published 80+ technical posts on cloud security, IaC, and data engineering, ran a webinar series and the YouTube channel, and spoke at conferences',
			'Attended daily engineering standups and merged 480+ PRs into production',
			'After the merger with env0, ran the same content playbook on env0.com: organic traffic up 106% in 3 weeks',
		],
	},
	{
		company: 'Tinybird',
		title: 'Senior Developer Advocate',
		startYear: 2023,
		endYear: 2024,
		location: 'Remote',
		logo: '/images/logos/tinybird.webp',
		tech: [
			'SQL',
			'ClickHouse',
			'BigQuery',
			'Kafka',
			'Snowflake',
			'Redshift',
			'Python',
			'GCP',
			'AWS',
		],
		summary:
			'Built real-time analytics demos and proofs of concept, like fraud detection on BigQuery and Kafka, plus technical content, webinars and workshops.',
		bullets: [
			"Built custom demos on prospects' own stacks for the Sales team, showing exactly where Tinybird fit their architecture",
			'Built proofs of concept, including a fraud detection system on GCP, BigQuery, and Kafka (33% fewer fraudulent transactions) and a BigQuery IoT optimization for a trucking company (40% lower compute cost, 30% faster data retrieval)',
			'Made technical content, videos, webinars, and workshops on real-time analytics for a developer audience',
			'Built community through workshops, online forums, and conference talks',
		],
	},
	{
		company: 'SingleStore',
		title: 'Senior Developer Advocate',
		startYear: 2021,
		endYear: 2023,
		location: 'Remote',
		logo: '/images/logos/singlestore.webp',
		tech: ['SQL', 'MySQL', 'Go', 'Node.js'],
		summary:
			"Made tutorials, talks and demos for developers moving from MySQL and PostgreSQL to SingleStore's distributed SQL database.",
		bullets: [
			'Ran content and video for developers moving from MySQL and PostgreSQL: tutorials, conference talks, and demos',
			'Set up co-marketing with cloud and tooling partners: joint content, webinars, and conference activations with their marketing and DevRel teams',
			'Ran conference presence end to end, from talk submissions and booth plans to the content afterward',
			'Worked with Engineering, Docs, and Sales to line content up with launches, keep it technically accurate, and support pre-sales',
		],
	},
	{
		company: 'MongoDB',
		title: 'Senior Developer Advocate',
		startYear: 2019,
		endYear: 2021,
		location: 'Remote',
		logo: '/images/logos/mongodb.webp',
		tech: ['JavaScript', 'Node.js', 'Python', 'React', 'MongoDB', 'AWS'],
		summary:
			'Keynoted MongoDB World, built demos like the IoT kitty litter box, and made the schema design guides and videos. When COVID hit, moved to Twitch, YouTube and TikTok (25K followers).',
		bullets: [
			'Keynoted MongoDB World and ran global conference strategy. When COVID canceled events, I moved the program to Twitch, YouTube, and TikTok',
			'Grew a 25K+ TikTok following (844K+ likes) and ranked #1 on "10 Must-Follow Developers on TikTok"',
			'Built demos like an IoT kitty litter box and an IoT digital graffiti board',
			{
				text: "Wrote MongoDB's schema design, aggregation, and Atlas guides and videos, published on the MongoDB Developer Hub, The New Stack, and Medium",
				link: {
					label: 'MongoDB Schema Design Best Practices',
					url: 'https://www.youtube.com/watch?v=QAqK-R9HUhc',
				},
			},
		],
	},
	{
		company: 'Best Buy',
		title: 'Front End Technical Lead',
		startYear: 2017,
		endYear: 2019,
		location: 'Minneapolis, MN',
		logo: '/images/logos/bestbuy.webp',
		tech: ['JavaScript', 'Node.js', 'React', 'Redux', 'Express', 'AWS'],
		summary:
			'Led a team of 10 that owned Account Home on bestbuy.com, one of the top 3 eCommerce sites in North America, at thousands of requests per second.',
		bullets: [
			'Led a team of 10 engineers, QA, and product that owned Account Home on bestbuy.com, one of the top 3 eCommerce sites in North America (millions of users, thousands of requests per second)',
			'Led the full redesign and rebuild of Account Home with the UX, product, and backend teams',
			'Built an NLP chatbot that cut customer support call volume 25%',
		],
	},
	{
		company: 'DevLeague',
		title: 'Full-Stack JavaScript Instructor',
		startYear: 2015,
		endYear: 2017,
		location: 'Honolulu, HI',
		logo: '/images/logos/devleague.webp',
		tech: ['ES6', 'JavaScript', 'Node.js', 'React', 'Angular', 'PostgreSQL', 'AWS'],
		summary:
			'Taught full-stack JavaScript in Honolulu, wrote the curriculum, and mentored students into engineering jobs at local and national companies.',
		bullets: [
			"Taught full-stack JavaScript at Hawaii's first web development bootcamp, one of the top 10 coding bootcamps in the world",
			'Wrote the curriculum for its 12-week courses, led workshops, and mentored students into engineering jobs at local and national companies',
		],
	},
];

export const highlights = [
	'TEDx Speaker: "The Art of Computer Science" (delivered as TEDx talk and keynote at multiple conferences)',
	'100+ conference talks, workshops and podcasts since 2019, including a keynote at MongoDB World',
	'Ranked #1 on "10 Must-Follow Developers on TikTok"; 25K+ followers, 844K+ likes',
	'Hackathon organizer: co-organized "Stupid Shit No One In Hawaii Needs" (2016), sponsored by GitHub & Frontend Masters',
	'Published on the CData, CloudQuery, Tinybird, SingleStore and MongoDB developer blogs, The New Stack, Medium and DEV Community',
];

export const openSource = [
	{
		name: 'Connect AI × DOOM',
		description:
			'Ask Claude a business question and it builds a Doom level from the answer. Every monster is a live record pulled through the CData Connect AI MCP server.',
		tech: ['Python', 'MCP', 'Claude Code', 'CData Connect AI', 'SQL'],
		url: '/work/connect-ai-doom/',
	},
	{
		name: 'Screencast Director',
		description:
			'A macOS screen recorder that drafts the edit for me. It speeds up the typing, cuts dead air, zooms on clicks and adds captions, then I fix it on a timeline or ask an AI model to change it.',
		tech: ['Swift', 'ScreenCaptureKit', 'whisper.cpp', 'Claude'],
		url: '/work/screencast-director/',
	},
	{
		name: 'FollowSpot',
		description:
			'A browser teleprompter that listens with a local whisper.cpp model and follows along as I read, through flubs and ad-libs. The audio never leaves my machine.',
		tech: ['JavaScript', 'whisper.cpp', 'Web Audio'],
		url: '/work/followspot/',
	},
	{
		name: 'Punc',
		description:
			"Takes the words out of a book and leaves the punctuation where it was, so you can see the book's rhythm on its own.",
		tech: ['TypeScript', 'Canvas', 'SVG'],
		url: '/work/punc/',
	},
	{
		name: 'Bechdel.io',
		description:
			'Parses film scripts to check them against the Bechdel Test. A digital humanities project I built with my sister.',
		tech: ['Node.js', 'NLP', 'JavaScript', 'MongoDB'],
		url: '/work/bechdel-io/',
	},
	{
		name: 'Homelab',
		description: `${nowFeed.homelab.runningContainers} LXC containers on a ${nowFeed.homelab.proxmoxNodes}-node Proxmox cluster with two NVIDIA GPUs, every one managed in OpenTofu: Home Assistant, Plex, Frigate, Immich, and Prometheus and Loki monitoring.`,
		tech: ['Proxmox', 'LXC', 'OpenTofu', 'Prometheus', 'Home Assistant'],
		url: '/blog/how-to-get-started-building-a-homelab-server/',
	},
];

export const education = {
	school: 'Gustavus Adolphus College',
	degree: 'Bachelor of Arts in Computer Science',
	years: '2008 - 2012',
	gpa: '3.5',
	minors: ['Art History', 'Math'],
};

export interface WritingSample {
	title: string;
	url: string;
	publisher: string;
	note?: string;
}

export interface WritingSampleGroup {
	category: string;
	items: WritingSample[];
}

export const writingSamples: WritingSampleGroup[] = [
	{
		category: 'AI Agents & MCP',
		items: [
			{
				title: 'I Wired Doom to Two MCP Servers and Let Claude Play It',
				url: 'https://www.cdata.com/blog/doom-mcp-server',
				publisher: 'CData',
			},
			{
				title: 'The Official MCP Roadmap, Explained for Enterprise Teams',
				url: 'https://www.cdata.com/blog/official-mcp-roadmap-explained',
				publisher: 'CData',
			},
			{
				title: 'Enterprise Data Access for AI Agents: The Missing Gateway',
				url: 'https://www.cdata.com/blog/ai-gateway-data-access-layer',
				publisher: 'CData',
			},
			{
				title: 'How We Made Our IDEs Data-Aware with a Go MCP Server',
				url: 'https://www.cloudquery.io/blog/how-we-made-our-ides-data-aware-with-a-go-mcp-server',
				publisher: 'CloudQuery',
			},
		],
	},
	{
		category: 'Database: Conceptual',
		items: [
			{
				title: "Database Partitioning vs. Sharding: What's the Difference?",
				url: 'https://www.singlestore.com/blog/database-sharding-vs-partitioning-whats-the-difference/',
				publisher: 'SingleStore',
			},
			{
				title: 'A Step-by-Step Guide to Build a Real-Time Dashboard',
				url: 'https://www.tinybird.co/blog/real-time-dashboard-step-by-step',
				publisher: 'Tinybird',
			},
			{
				title: 'From SQL to NoSQL: A Gentle Intro for Devs',
				url: 'https://www.youtube.com/watch?v=Y9qSp8kd1u4',
				publisher: 'Conf42 JavaScript 2020',
			},
			{
				title: 'MongoDB Schema Design Best Practices',
				url: 'https://www.youtube.com/watch?v=leNCfU5SYR8',
				publisher: 'MongoDB',
			},
		],
	},
	{
		category: 'Database: Deep Technical',
		items: [
			{
				title: 'How to Use SingleStore as a Key-Value Store',
				url: 'https://www.singlestore.com/blog/how-to-use-singlestore-as-a-key-value-store/',
				publisher: 'SingleStore',
			},
			{
				title: 'Using Bloom Filter Indexes for Real-Time Text Search in ClickHouse',
				url: 'https://www.tinybird.co/blog/using-bloom-filter-text-indexes-in-clickhouse',
				publisher: 'Tinybird',
				note: 'ghost-written',
			},
			{
				title: 'Why and How We Built Our Own Full-Text Search Engine with ClickHouse',
				url: 'https://www.cloudquery.io/blog/why-and-how-we-built-our-own-full-text-search-engine-with-clickhouse',
				publisher: 'CloudQuery',
			},
			{
				title: 'How We Handle Billion-Row ClickHouse Inserts with UUID Range Bucketing',
				url: 'https://www.cloudquery.io/blog/how-we-handle-billion-row-clickhouse-inserts-with-uuid-range-bucketing',
				publisher: 'CloudQuery',
			},
		],
	},
	{
		category: 'Cloud & Data Pipelines',
		items: [
			{
				title: 'Building AI-Powered Cloud Security Data Pipelines',
				url: 'https://www.cloudquery.io/blog/building-secure-ai-powered-cloud-security-data-pipeline-risk-detection',
				publisher: 'CloudQuery',
			},
			{
				title: 'Steampipe vs CloudQuery: Architecture and Trade-offs',
				url: 'https://www.cloudquery.io/blog/steampipe-vs-cloudquery',
				publisher: 'CloudQuery',
			},
		],
	},
	{
		category: 'Webinars & Conference Talks',
		items: [
			{
				title: 'What is Apache Arrow?',
				url: 'https://www.youtube.com/watch?v=hVW7kflCyIQ',
				publisher: 'CloudQuery',
			},
			{
				title: 'Databases and DevOps w/ Rizel Scarlett from GitHub',
				url: 'https://www.singlestore.com/resources/webinar-databases-and-devops-joe-karlsson-and-rizel-scarlett-github-2022-02/',
				publisher: 'SingleStore',
			},
		],
	},
	{
		category: 'Case Studies',
		items: [
			{
				title: 'Unicorne + CloudQuery Case Study',
				url: 'https://www.cloudquery.io/blog/unicorne-cloudquery-case-study',
				publisher: 'CloudQuery',
			},
			{
				title: 'Tempus: Multi-Cloud Asset Inventory',
				url: 'https://www.cloudquery.io/blog/tempus-multi-cloud-asset-inventory?category=case-studies',
				publisher: 'CloudQuery',
			},
		],
	},
	{
		category: 'DevRel & Strategy',
		items: [
			{
				title: 'Running DevRel in 2027 Means Owning Three Discovery Surfaces',
				url: 'https://joekarlsson.com/blog/running-devrel/',
				publisher: 'joekarlsson.com',
			},
			{
				title: 'What I Learned When I Could Finally Prove My Work Mattered',
				url: 'https://www.cdata.com/blog/what-i-learned-proving-my-work-mattered',
				publisher: 'CData',
			},
		],
	},
	{
		category: 'Technical Documentation',
		items: [
			{
				title: 'CloudQuery Platform Documentation',
				url: 'https://www.cloudquery.io/docs/platform/introduction',
				publisher: 'CloudQuery',
				note: 'sole author',
			},
		],
	},
];

export const skills = [
	{
		category: 'Languages',
		items: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Swift', 'SQL'],
	},
	{
		category: 'AI & Agents',
		items: [
			'MCP Servers',
			'Claude Code (skills, hooks, subagents)',
			'AI Agents',
			'LLM APIs',
			'Local Models (whisper.cpp, Ollama)',
			'Sales and Content Automation',
		],
	},
	{
		category: 'Databases',
		items: [
			'MongoDB',
			'PostgreSQL',
			'MySQL',
			'ClickHouse',
			'Redis',
			'Elasticsearch',
			'SingleStore',
		],
	},
	{
		category: 'Cloud & Data',
		items: ['AWS', 'GCP', 'Azure', 'BigQuery', 'Snowflake', 'Kafka', 'Airflow'],
	},
	{
		category: 'Infrastructure',
		items: ['Proxmox', 'OpenTofu', 'Docker', 'Linux', 'Prometheus', 'Grafana', 'Home Assistant'],
	},
	{
		category: 'Frontend',
		items: ['React', 'Redux', 'Astro', 'Tailwind CSS', 'D3.js', 'Canvas', 'WebGL'],
	},
	{
		category: 'DevRel & Marketing',
		items: [
			'Technical Writing',
			'Developer Docs',
			'Conference Speaking',
			'Video',
			'Content Strategy',
			'SEO',
			'AEO',
			'Conversion Optimization',
			'Sales Enablement',
			'Marketing Analytics',
			'Community',
			'Webinars',
		],
	},
];
