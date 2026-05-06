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
}

export const roles: Role[] = [
	{
		company: 'CloudQuery (now env0)',
		title: 'Head of Developer Relations',
		startYear: 2024,
		endYear: null,
		location: 'Remote',
		logo: '/images/logos/cloudquery.webp',
		tech: ['GCP', 'AWS', 'Azure', 'ClickHouse', 'Python', 'SQL'],
		bullets: [
			'Embedded cross-functionally across Sales, Product, and Engineering - partner with Sales on enablement assets, serve as product owner of all marketing channels, and attend daily engineering standups; 373+ PRs merged directly into company apps and growing daily',
			'Sole owner of all CloudQuery web properties including the marketing site, docs, and developer hub; responsible for the full developer experience from first Google result to trial activation',
			'Built AI automations for sales enablement asset production (one-pagers, discovery decks, pitch slides) - enabling the team to scale output without adding headcount',
			'Built interactive demos and reference architectures used in conference talks, customer demos, and blog content - including an end-to-end secure AI data pipelines architecture',
			'Built and own the entire DevRel function from scratch: content strategy, community, event strategy, and full video and social production',
			'Produce content across every format: 80+ blog posts and learning center articles, YouTube tutorials, product demo videos, webinar series, and social content across LinkedIn, X, and developer communities; speak at conferences and staff booth during event season',
			'Organic MQLs +216% MoM; demo submissions 7x MoM; non-branded organic traffic up 44% over 3 months',
			'Search impressions 4.9x to a new all-time high; average position improved from 21 to 10',
			'Docs traffic +302%; Quickstart completions from zero to meaningful weekly volume after full docs rewrite',
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
		bullets: [
			"Partnered closely with the Sales team on pre-sales support and customer demos - integrated with prospects' existing tech stacks to build tailored demos that showed exactly how Tinybird fit their architecture",
			'Built real-time technical integrations for demos and customer proof-of-concepts: fraud detection system on GCP/BigQuery/Kafka (33% reduction in fraudulent transactions); BigQuery IoT optimization for a trucking firm (40% compute cost reduction, 30% faster data retrieval)',
			'Produced technical content, videos, and webinars covering real-time analytics use cases for a developer audience',
			'Built community through workshops, online forums, and conference representation',
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
		bullets: [
			"Led content and video production strategy for SingleStore's developer audience - technical tutorials, conference talks, and demos targeting developers migrating from MySQL and PostgreSQL",
			'Built co-marketing partnerships with cloud providers and tooling partners, coordinating joint content, webinars, and conference activations with their marketing and DevRel teams',
			'Planned and executed developer conference presence end-to-end: talk submissions, booth strategy, event logistics, and post-event content amplification',
			'Worked cross-functionally with Engineering, Documentation, and Sales to align content with product launches, maintain technical accuracy, and support pre-sales needs',
		],
	},
	{
		company: 'MongoDB',
		title: 'Developer Advocate',
		startYear: 2019,
		endYear: 2021,
		location: 'Remote',
		logo: '/images/logos/mongodb.webp',
		tech: ['JavaScript', 'Node.js', 'Python', 'React', 'MongoDB', 'AWS'],
		bullets: [
			"Keynoted at MongoDB World and led global conference event strategy; when COVID hit, pivoted to lead MongoDB's digital growth strategy across Twitch, YouTube, and social - driving developer awareness and product adoption through an entirely new channel mix",
			'Built memorable technical demos to showcase MongoDB features in creative, engaging ways: IoT kitty litter box, IoT digital graffiti board, and dozens of other projects that drove community growth and product awareness',
			'Owned MongoDB\'s live stream and video production, building a 25K+ TikTok following; ranked #1 on "Must-Follow Developers on TikTok"',
			{
				text: 'Played a key role in defining and standardizing MongoDB developer best practices - authored canonical guides and videos on schema design, aggregation, and Atlas that became the reference point for the ecosystem; published across MongoDB Developer Hub, The New Stack, and Medium',
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
		bullets: [
			'Led a cross-functional team of 10 engineers, QA, and product on one of the top 3 largest eCommerce sites in North America - a platform handling millions of users and thousands of requests per second',
			'Owned Account Home for bestbuy.com end-to-end: drove full redesign and implementation partnering closely with UX, product, and backend teams',
			'Engineered AI-driven chatbot using NLP and ML that reduced customer support call volume by 25%',
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
		bullets: [
			'Taught full-stack JavaScript at one of the top 10 coding bootcamps worldwide',
			'Developed curriculum, led workshops, and mentored students into engineering roles at local and national companies',
		],
	},
];

export const highlights = [
	'TEDx Speaker: "The Art of Computer Science" (delivered as TEDx talk and keynote at multiple conferences)',
	'Ranked #1 on "10 Must-Follow Developers on TikTok"; 25K+ followers, 844K+ likes',
	'Hackathon organizer: co-organized "Stupid Shit No One In Hawaii Needs" (2016), sponsored by GitHub & Frontend Masters',
	'Published in The New Stack, MongoDB Developer Hub, Tinybird blog, Medium, DEV Community',
];

export const openSource = [
	{
		name: 'Secure AI Data Pipelines',
		description:
			'End-to-end reference architecture for building secure AI data pipelines. Built for conference talks and customer demos; shows how to move data safely into AI workflows at scale.',
		tech: ['Python', 'SQL', 'GCP', 'CloudQuery', 'AI/LLM'],
		url: 'https://github.com/cloudquery/secure-ai-data-pipelines-demo',
	},
	{
		name: 'bechdel.io',
		description:
			'Bechdel Test script analyzer; a collaborative digital humanities project with my sister. Parses film scripts to test for gender representation.',
		tech: ['React', 'Redux', 'MongoDB', 'D3', 'Express'],
		url: 'https://bechdel.io',
	},
	{
		name: 'Homelab',
		description:
			'20+ self-hosted services running on bare metal and VMs: Proxmox, Unraid, TrueNAS, Jellyfin, Home Assistant, Authentik, Immich, and more.',
		tech: ['Proxmox', 'Docker', 'Tailscale', 'Caddy', 'Home Assistant'],
		url: '/blog/how-to-get-started-building-a-homelab-server-in-2024/',
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
		category: 'DevRel & Documentation',
		items: [
			{
				title: 'What I Learned Running DevRel in 2026',
				url: 'https://joekarlsson.com/blog/running-devrel-2026/',
				publisher: 'joekarlsson.com',
			},
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
		items: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'SQL'],
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
		category: 'AI & Automation',
		items: [
			'LLM APIs',
			'AI Workflow Automation',
			'Prompt Engineering',
			'AI-assisted Content Pipelines',
			'Sales Enablement Automation',
		],
	},
	{
		category: 'Frontend',
		items: ['React', 'Redux', 'Astro', 'Tailwind CSS', 'D3.js'],
	},
	{
		category: 'DevRel & Marketing',
		items: [
			'Technical Writing',
			'Conference Speaking',
			'Content Strategy',
			'SEO',
			'Conversion Optimization',
			'Sales Enablement',
			'Marketing Analytics',
			'Community',
			'Webinars',
		],
	},
];
