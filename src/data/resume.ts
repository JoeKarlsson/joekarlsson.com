export interface Role {
	company: string;
	title: string;
	startYear: number;
	endYear: number | null; // null = present
	location: string;
	logo?: string;
	tech: string[];
	bullets: string[];
}

export const roles: Role[] = [
	{
		company: 'CloudQuery',
		title: 'Senior Developer Advocate',
		startYear: 2024,
		endYear: null,
		location: 'Remote',
		logo: '/images/logos/cloudquery.webp',
		tech: ['GCP', 'AWS', 'Azure', 'ClickHouse', 'Python', 'SQL'],
		bullets: [
			'Own the entire web presence — sole owner of all CloudQuery web properties including the marketing site, docs, and developer hub; responsible for the full developer experience from first Google result to trial activation',
			'Solo DevRel function — own content strategy, community, social channels, event strategy, webinar series, and video production',
			'Speak at conferences and staff booth during event season; produce webinars and demo videos that feed directly into the sales pipeline',
			'Authored 80+ blog posts and learning center articles; 373 PRs merged across website, docs, SEO, and analytics with before/after measurement on each',
			'In the first 4 weeks: organic MQLs +216% MoM (6 → 19), demo submissions 7x MoM, non-branded organic traffic up 44% over 3 months',
			'In the first 4 weeks: search impressions 4.9x to a new all-time high (9,980 → 49,220/week); average position improved from 21.0 to 10.3',
			'In the first 4 weeks: docs traffic +302% (48 → 191 weekly visitors); Quickstart completions 0 → 23/week after full docs rewrite',
			'Confirmed $10K SQO with direct organic first-touch attribution — prospect found CloudQuery via Google, no paid assist',
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
			'Built real-time fraud detection system on GCP/BigQuery/Kafka — achieved 33% reduction in fraudulent transactions',
			'Optimized BigQuery for IoT trucking firm: materialized views reduced compute costs 40% and sped up data retrieval 30%',
			'Built community through workshops, webinars, and online forums; represented Tinybird at industry conferences',
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
			"Created technical content, conference talks, and documentation for SingleStore's HTAP database targeting developers migrating from MySQL and PostgreSQL",
			'Collaborated with the partnerships team on co-marketed demos and workshops with cloud and tooling partners',
			'Represented SingleStore at developer conferences and produced video content covering real-time analytics use cases',
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
			'Keynoted at MongoDB World and spoke at hundreds of developer conferences globally on databases, JavaScript, and NoSQL architecture',
			'Developed MongoDB best practices content — schema design, aggregation, and Atlas — that became some of the most widely referenced tutorials in the ecosystem',
			'Owned MongoDB\'s live stream and video production, growing the channel and building a 25K+ TikTok following; ranked #1 on "Must-Follow Developers on TikTok"',
			'Published extensively across MongoDB Developer Hub, The New Stack, and Medium',
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
			'Led front end engineering on one of the top 3 largest eCommerce sites in North America — a platform handling millions of users and thousands of requests per second',
			'Owned Account Home for bestbuy.com: led a team of engineers through a full redesign and implementation, partnering closely with UX, product, and backend teams',
			'Helped architect and scale one of the largest and most performant eCommerce front ends on the web, with a focus on reliability and user experience at scale',
			'Engineered AI-driven chatbot using NLP and ML — reduced customer support call volume by 25%',
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
	'TEDx Speaker — "The Art of Computer Science" (delivered as TEDx talk and keynote at multiple conferences)',
	'Ranked #1 on "10 Must-Follow Developers on TikTok" — 25K+ followers, 844K+ likes',
	'Hackathon organizer — co-organized "Stupid Shit No One In Hawaii Needs" (2016), sponsored by GitHub & Frontend Masters',
	"Arctic Code Vault Contributor — code preserved in GitHub's Arctic Code Vault",
	'Published in The New Stack, MongoDB Developer Hub, Tinybird blog, Medium, DEV Community',
];

export const openSource = [
	{
		name: 'bechdel.io',
		description:
			'Bechdel Test script analyzer — collaborative digital humanities project with my sister. Parses film scripts to test for gender representation.',
		tech: ['React', 'Redux', 'MongoDB', 'D3', 'Express'],
		url: 'https://bechdel.io',
	},
	{
		name: 'Homelab',
		description:
			'20+ self-hosted services running on bare metal and VMs — Proxmox, Unraid, TrueNAS, Jellyfin, Home Assistant, Authentik, Immich, and more.',
		tech: ['Proxmox', 'Docker', 'Tailscale', 'Caddy', 'Home Assistant'],
		url: '/blog/how-to-get-started-building-a-homelab-server-in-2024/',
	},
	{
		name: 'Real-Time Inventory Management System',
		description:
			'Fully scalable real-time inventory management backend and dashboard for eCommerce platforms.',
		tech: ['Tinybird', 'ClickHouse', 'Python', 'Svelte', 'Tailwind'],
		url: 'https://github.com/tinybirdco/real-time-inventory-management-system',
	},
];

export const education = {
	school: 'Gustavus Adolphus College',
	degree: 'Bachelor of Arts in Computer Science',
	years: '2008 - 2012',
	gpa: '3.5',
	minors: ['Art History', 'Math'],
};

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
		category: 'Frontend',
		items: ['React', 'Redux', 'Astro', 'Tailwind CSS', 'D3.js'],
	},
	{
		category: 'DevRel',
		items: [
			'Technical Writing',
			'Conference Speaking',
			'Content Strategy',
			'SEO',
			'Community',
			'Webinars',
		],
	},
];
