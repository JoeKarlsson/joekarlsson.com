export interface Role {
	company: string;
	title: string;
	startYear: number;
	endYear: number | null;
	location: string;
	logo?: string;
	tech: string[];
	bullets: string[];
}

export const summary =
	"Developer advocate and engineering lead with 15 years building developer communities, owning web presence end-to-end, and making complex products click for the developers who use them. I've run full DevRel functions (content strategy, community, events, docs, video, and the web properties themselves) at data and infrastructure companies. I know what it takes to grow a developer audience from scratch and keep them engaged.";

export const roles: Role[] = [
	{
		company: 'CloudQuery (now env0)',
		title: 'Senior Developer Advocate',
		startYear: 2024,
		endYear: null,
		location: 'Remote',
		logo: '/images/logos/cloudquery.webp',
		tech: ['Astro', 'TypeScript', 'React', 'Tailwind CSS', 'SEO', 'Analytics'],
		bullets: [
			'Sole owner of all CloudQuery web properties (marketing site, docs, and developer hub), responsible for the full developer experience from first impression to product activation',
			'Defined and execute end-to-end DevRel strategy: content roadmap, community growth, developer onboarding, event presence, webinar series, and video production',
			'Built organic developer acquisition channel from scratch: 4.9x impression growth, average search position improved from 21.0 to 10.3 in the first month',
			'Grew docs engagement 302% and drove Quickstart completions from zero to meaningful weekly volume through a full developer experience overhaul',
			'Organic MQLs +216% MoM; demo submissions 7x MoM; content strategy with a direct line to revenue',
		],
	},
	{
		company: 'Tinybird',
		title: 'Senior Developer Advocate',
		startYear: 2023,
		endYear: 2024,
		location: 'Remote',
		logo: '/images/logos/tinybird.webp',
		tech: ['Python', 'SQL', 'GCP', 'AWS', 'Kafka', 'Technical Writing'],
		bullets: [
			'Developed developer education content and onboarding material for a real-time data platform targeting data engineers and full-stack developers',
			'Built and engaged community through workshops, webinars, and online forums; represented Tinybird at industry conferences',
			'Produced technical demos and sample applications that reduced time-to-first-value for new developers',
		],
	},
	{
		company: 'SingleStore',
		title: 'Senior Developer Advocate',
		startYear: 2021,
		endYear: 2023,
		location: 'Remote',
		logo: '/images/logos/singlestore.webp',
		tech: ['JavaScript', 'Node.js', 'SQL', 'Video Production', 'Developer Relations'],
		bullets: [
			'Created technical content, conference talks, and documentation for developers migrating from traditional SQL databases',
			'Collaborated with the partnerships team on co-marketed demos, workshops, and developer events',
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
		tech: ['JavaScript', 'Node.js', 'React', 'Video', 'Community', 'Live Streaming'],
		bullets: [
			'Keynoted at MongoDB World and spoke at hundreds of developer conferences globally, driving community growth and product adoption at scale',
			'Owned MongoDB\'s live stream and video production; built a 25K+ TikTok following and was ranked #1 on "Must-Follow Developers on TikTok"',
			'Developed best practices content on schema design, Atlas, and NoSQL architecture that became some of the most referenced tutorials in the ecosystem',
			'TEDx Speaker: "The Art of Computer Science", delivered as both a TEDx talk and keynote at multiple conferences',
		],
	},
	{
		company: 'Best Buy',
		title: 'Front End Technical Lead',
		startYear: 2017,
		endYear: 2019,
		location: 'Minneapolis, MN',
		logo: '/images/logos/bestbuy.webp',
		tech: ['JavaScript', 'React', 'Redux', 'Node.js', 'CSS', 'AWS'],
		bullets: [
			'Led front end engineering on one of the top 3 largest eCommerce sites in North America, handling millions of users and thousands of requests per second',
			'Owned Account Home for bestbuy.com end-to-end: architecture, implementation, and a team of engineers through a full redesign',
			'Helped architect and scale one of the most performant retail front ends on the web, with a focus on reliability and user experience at scale',
			'Engineered AI-driven chatbot that reduced customer support call volume by 25%',
		],
	},
	{
		company: 'DevLeague',
		title: 'Full-Stack JavaScript Instructor',
		startYear: 2015,
		endYear: 2017,
		location: 'Honolulu, HI',
		logo: '/images/logos/devleague.webp',
		tech: ['JavaScript', 'React', 'Node.js', 'CSS', 'PostgreSQL'],
		bullets: [
			'Taught full-stack JavaScript at one of the top 10 coding bootcamps worldwide',
			'Developed curriculum and mentored students into engineering roles, building teaching instincts that underpin everything I do in DevRel',
		],
	},
];

export const highlights = [
	'TEDx Speaker: "The Art of Computer Science" (also delivered as a conference keynote)',
	'Ranked #1 on "10 Must-Follow Developers on TikTok"; 25K+ followers, 844K+ likes',
	'Hackathon organizer: "Stupid Shit No One In Hawaii Needs" (2016), sponsored by GitHub & Frontend Masters',
	'Published in The New Stack, MongoDB Developer Hub, Medium, and DEV Community',
	'Arctic Code Vault Contributor',
];

export const openSource = [
	{
		name: 'bechdel.io',
		description:
			'Bechdel Test script analyzer that parses film scripts to test for gender representation. A digital humanities project I built with my sister.',
		tech: ['React', 'Redux', 'D3', 'MongoDB', 'Express'],
		url: 'https://bechdel.io',
	},
	{
		name: 'Real-Time Graffiti Wall',
		description:
			'Collaborative canvas app where anyone on the internet can draw in real time. Built with WebSockets and the Canvas API.',
		tech: ['Canvas API', 'WebSockets', 'Node.js', 'JavaScript'],
		url: 'https://www.joekarlsson.com/blog/building-a-real-time-digital-graffiti-wall/',
	},
	{
		name: 'Spotify React Player',
		description:
			'Full Spotify player built in React using the Spotify Web API, with playback controls, search, and queue management.',
		tech: ['React', 'Spotify Web API', 'OAuth', 'JavaScript'],
		url: 'https://www.joekarlsson.com/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/',
	},
];

export const skills = [
	{
		category: 'Frontend',
		items: ['JavaScript', 'TypeScript', 'React', 'Astro', 'CSS', 'Tailwind CSS', 'D3.js'],
	},
	{
		category: 'DevRel & Content',
		items: [
			'Content Strategy',
			'Developer Experience',
			'Community',
			'Conference Speaking',
			'Video Production',
			'Webinars',
			'SEO',
		],
	},
	{
		category: 'Web & Infrastructure',
		items: ['Node.js', 'AWS', 'GCP', 'Docker', 'GitHub Actions', 'Analytics', 'A/B Testing'],
	},
];

export const education = {
	school: 'Gustavus Adolphus College',
	degree: 'Bachelor of Arts in Computer Science',
	years: '2008 - 2012',
	gpa: '3.5',
	minors: ['Art History', 'Math'],
};
