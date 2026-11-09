// Every talk, podcast, panel, livestream and demo video I've done, recorded or not: the one
// list /talks/ is built from. Merged from the old hand-written /talk-archive/ list, the
// YouTube videos in talk-videos.json (the health check reads that file, so it stays as it is; a test checks
// every video in it shows up here) and the audio-only podcast episodes on the NAS.
// `date` is when it happened, not when it went up on YouTube: 'YYYY-MM-DD', or 'YYYY-MM' /
// 'YYYY' when that's all I know. `videos` are YouTube IDs, the first one is the one the card
// plays; add more recordings of the same talk at the same event after it.
import { roles } from './resume';
import { formatDate } from '../utils/ui';

export type TalkKind = 'talk' | 'panel' | 'podcast' | 'livestream' | 'demo';

export interface Talk {
	title: string;
	kind: TalkKind;
	// The conference, meetup, show or channel
	event: string;
	// A city, or 'Online'; left out when I don't know
	place?: string;
	date: string;
	// Last day of a multi-day event
	end?: string;
	description?: string;
	videos?: string[];
	// The episode page, for a podcast with no video
	listen?: string;
	// The event's page for the talk
	link?: string;
	slides?: string;
	// My write-up of the talk, with the video and slides
	writeup?: string;
	// No recording from this event: a video of the same talk given somewhere else, which
	// the card plays, labeled with that event (it must be in another entry's `videos`)
	otherRecording?: string;
	// No recording at all: the event's own picture, graded pink by
	// scripts/fetch-talk-event-covers.mjs into /images/talks/events/
	cover?: string;
	// Nothing to show: no recording anywhere and no picture from the event. The card falls
	// back to a paper scrap with the event's name (tests/talks.test.ts allows only these)
	paperScrap?: true;
}

// The talks I wrote up, and their slides
const IOT = {
	writeup: '/blog/an-introduction-to-iot-internet-of-toilets/',
	slides:
		'https://speakerdeck.com/joekarlsson/an-introduction-to-iot-internet-of-toilets-or-how-i-built-an-iot-kitty-litter-box-using-javascript-20-mins',
};
const BECHDEL = {
	writeup: '/talks/bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive/',
	slides:
		'https://speakerdeck.com/joekarlsson/bechdel-dot-io-how-we-used-javascript-to-help-make-film-more-inclusive',
};
const SCHEMA = {
	writeup: '/talks/mongodb-schema-design-best-practices/',
	slides: 'https://speakerdeck.com/joekarlsson/mongodb-schema-design-best-practices',
};
const SQL_TO_NOSQL = {
	writeup: '/talks/from-sql-to-nosql-a-gentle-introduction-for-devs/',
	slides:
		'https://speakerdeck.com/joekarlsson/from-sql-to-nosql-a-gentle-introduction-for-developers',
};
const ART_OF_CS = {
	writeup: '/talks/the-art-of-computer-science/',
	slides: 'https://speakerdeck.com/joekarlsson/keynote-the-art-of-computer-science',
};

/** An Apple Podcasts episode page, without the affiliate tag */
const apple = (path: string) => `https://podcasts.apple.com/us/podcast/${path}`;

export const talks: Talk[] = [
	// 2026
	{
		title: 'How to Use ChatGPT Dots with Salesforce, Jira, and More',
		kind: 'demo',
		event: 'CData Software',
		date: '2026-11-03',
		description:
			'I connect a ChatGPT dot to hundreds of apps with one plugin (CData Connect AI), then ask it questions no single app can answer, across Salesforce, Zendesk and Snowflake.',
		videos: ['KYX-x-Ljwzo'],
	},
	{
		title: 'The Developer View: One Platform From MCP to Gateway',
		kind: 'talk',
		event: 'CData Software',
		date: '2026-11-05',
		videos: ['bzuIHRypcsQ'],
	},
	{
		title: 'How to Connect Your Business Apps to Meta Muse',
		kind: 'demo',
		event: 'CData Software',
		date: '2026-10-13',
		description:
			'Connecting Meta Muse to Salesforce, NetSuite, ServiceNow and other work apps with CData Connect AI and one custom connector.',
		videos: ['RxXiOeSHrBA'],
	},
	{
		title: 'What Is an AI Gateway? A 60-Second Breakdown',
		kind: 'demo',
		event: 'CData Software',
		date: '2026-09-25',
		description:
			'A quick overview of AI gateways, and why they matter once a whole company uses AI.',
		videos: ['679ms5EIgz8'],
	},
	{
		title: 'I Built an Internal Developer Platform and Developers Still Ping Me',
		kind: 'talk',
		event: 'DevOpsCon Amsterdam',
		place: 'Amsterdam, Netherlands',
		date: '2026-04-20',
		end: '2026-04-24',
		description:
			'Addressing the challenges that persist even after implementing an internal developer platform, focusing on ongoing support needs and platform adoption.',
		link: 'https://devopscon.io/platform-engineering-summit/internal-developers-platform-best-practice/',
		cover: '/images/talks/events/devopscon-amsterdam-2026.webp',
	},
	{
		title:
			"Operationalizing AWS Governance at Scale: Five Questions Your Team Can't Answer in Under Five Minutes",
		kind: 'talk',
		event: 'CloudQuery & AWS Webinar',
		place: 'Online',
		date: '2026-04-08',
		description:
			'Exploring five critical infrastructure questions that typically require hours to resolve, treating cloud governance as a data problem, and strategies for cross-cloud visibility and compliance. Co-presented with Keegan Mirazee from AWS.',
		link: 'https://www.cloudquery.io/events/five-questions-cloud-team',
		cover: '/images/talks/events/cloudquery-events.webp',
	},

	// 2025
	{
		title: 'From Chaos to Control: How CloudQuery Makes Cloud Data AI-Ready',
		kind: 'podcast',
		event: 'The SoftwarePlaza IT Podcast',
		date: '2025-08-18',
		listen: apple(
			'from-chaos-to-control-how-cloudquery-makes-cloud-data/id1790169619?i=1000722489800',
		),
		cover: '/images/talks/events/softwareplaza-it-podcast.webp',
	},
	{
		title: "Governance Isn't a Dirty Word: Making Policy Part of the Dev Flow",
		kind: 'podcast',
		event: 'Cloud Native Testing Podcast',
		date: '2025-06-04',
		videos: ['FlE1WI10aIo'],
		listen: apple(
			'governance-isnt-a-dirty-word-making-policy-part-of/id1797794562?i=1000711109449',
		),
	},
	{
		title: 'Nurture Your Network Before You Leverage It',
		kind: 'podcast',
		event: 'IT Career Energizer',
		date: '2025-06-03',
		videos: ['q-nUn0ygC-I'],
		listen: apple(
			'nurture-your-network-before-you-leverage-it-with-joe/id1231387865?i=1000710969771',
		),
	},
	{
		title:
			'Live Coding: Building a Multi-Cloud Asset Inventory with AWS & GCP using CloudQuery and Postgres',
		kind: 'livestream',
		event: 'CloudQuery YouTube',
		date: '2025',
		description:
			'Live coding session demonstrating how to build a multi-cloud asset inventory using CloudQuery to pull data from AWS and GCP, storing it in Postgres.',
		videos: ['nFA2C5JgjPw'],
	},
	{
		title: 'How to Manage Data Pipeline Complexity and Maintain High Data Quality',
		kind: 'talk',
		event: 'CloudQuery YouTube',
		date: '2025',
		description:
			'Strategies for handling data pipeline complexity and ensuring high data quality - best practices, tools, and techniques for data engineers and analysts.',
		videos: ['rHmCiIXkcow'],
	},
	{
		title: 'The Future of Security Engineering is Data Engineering',
		kind: 'talk',
		event: 'CloudQuery YouTube',
		date: '2025',
		description:
			'Exploring why security engineers need to learn SQL and how the future of security engineering lies in data engineering.',
		videos: ['kwcH--194dA'],
	},
	{
		title: 'What is Apache Arrow?',
		kind: 'demo',
		event: 'CloudQuery YouTube',
		date: '2024-06-21',
		description:
			'Deep dive into Apache Arrow with Yevgeny Pats (CloudQuery CEO) - exploring efficient data processing, cross-language support, and why CloudQuery chose Arrow for their ETL platform.',
		videos: ['hVW7kflCyIQ'],
	},

	// 2024
	{
		title: 'Cloud Asset Inventory & Management Webinar',
		kind: 'talk',
		event: 'CloudQuery',
		place: 'Online',
		date: '2024-12-19',
		description:
			'Creating a cloud asset inventory using CloudQuery to track resources across AWS and Azure, monitor changes, and query infrastructure with SQL. Co-presented with Yevgeny Pats (CloudQuery CEO).',
		link: 'https://www.cloudquery.io/events/cloud-asset-inventory',
		cover: '/images/talks/events/cloudquery-events.webp',
	},
	{
		title: 'Cloud Governance & Security Webinar',
		kind: 'talk',
		event: 'CloudQuery',
		place: 'Online',
		date: '2024-12-19',
		description:
			'Managing governance, security, and regulatory compliance across multi-cloud environments with security monitoring and automated remediation workflows.',
		link: 'https://www.cloudquery.io/events/cloud-governance-security',
		cover: '/images/talks/events/cloudquery-events.webp',
	},
	{
		title: 'Improve AWS Visibility & Governance Webinar',
		kind: 'talk',
		event: 'CloudQuery',
		place: 'Online',
		date: '2024-12-19',
		description:
			'Getting complete visibility into AWS infrastructure across all regions and accounts, with resource tracking, optimization, and SQL-based querying.',
		link: 'https://www.cloudquery.io/events/improve-aws-visibility',
		cover: '/images/talks/events/cloudquery-events.webp',
	},
	{
		title: 'Build Real-Time Data Products over Kafka',
		kind: 'livestream',
		event: 'Tinybird Live Coding',
		place: 'Online',
		date: '2024-01-09',
		description:
			'Live coding session on building real-time data products using Kafka. Co-hosted with Jim Moffitt.',
		cover: '/images/talks/events/tinybird-live-coding.webp',
	},

	// 2023
	{
		title: 'From Kafka to APIs in Minutes',
		kind: 'livestream',
		event: 'Tinybird Live Coding',
		place: 'Online',
		date: '2023-11-14',
		description:
			'Live coding session demonstrating rapid API development from Kafka streams. Co-hosted with Marc Gonzalez (Director of Data at Factorial).',
		cover: '/images/talks/events/tinybird-live-coding.webp',
	},
	{
		title: 'When Data is Your Brand and Your Job',
		kind: 'podcast',
		event: 'Screaming in the Cloud',
		date: '2023-10-12',
		listen: apple(
			'when-data-is-your-brand-and-your-job-with-joe-karlsson/id1361244178?i=1000631070586',
		),
		cover: '/images/talks/events/screaming-in-the-cloud.webp',
	},
	{
		title: 'Building Interactive Dashboards with Real-Time Data',
		kind: 'podcast',
		event: 'The Art of Communicating Data',
		date: '2023-06-14',
		listen: apple(
			'building-interactive-dashboards-with-real-time-data/id1603953771?i=1000616984317',
		),
		cover: '/images/talks/events/art-of-communicating-data.webp',
	},
	{
		title: 'Build Your Own Infrastructure Monitoring Application',
		kind: 'livestream',
		event: 'Tinybird Live Coding',
		place: 'Online',
		date: '2023-05-17',
		description:
			"Building a miniature version of Datadog's infrastructure monitoring tool - using Kafka to stream events and Tinybird's native Kafka connector for ingestion.",
		link: 'https://www.tinybird.co/live-coding-sessions/build-your-own-infrastructure-monitoring-application',
		videos: ['pFb91G14Clk'],
	},
	{
		title: 'Your Real Estate Relationships',
		kind: 'podcast',
		event: 'Beginner to Buyer (Chase)',
		date: '2023-05-15',
		videos: ['FyNSOh8JQB8'],
		listen: apple('your-real-estate-relationships/id1697980658?i=1000621440623'),
	},
	{
		title: 'DevRel in Open Source: Strategies, Challenges, and Growth',
		kind: 'podcast',
		event: 'The Hacking Open Source Business Podcast',
		date: '2023-05-04',
		videos: ['D7Ir_iY61LY'],
	},
	{
		title: 'Building a Real-Time API Speed Layer on Top of Snowflake',
		kind: 'talk',
		event: 'Tinybird',
		place: 'Online',
		date: '2023-04-27',
		videos: ['IOuXREaJj5Q'],
	},
	{
		title: 'Launch Week #2 Release Round-up',
		kind: 'livestream',
		event: 'Tinybird Live Coding',
		place: 'Online',
		date: '2023-04-21',
		description:
			"Recap of Tinybird's Launch Week #2 releases and new features. Co-hosted with Alasdair Brown.",
		videos: ['XrRnElPo-lU'],
	},

	// 2022
	{
		title: 'React Q&A Session',
		kind: 'livestream',
		event: 'React secret channel',
		place: 'Online',
		date: '2022-05-26',
		description: 'With Ladislav Navratil and Colby Fayock.',
		videos: ['DMdfyoqKGyE'],
	},
	{
		title: 'A Gentle Introduction to Building Data-Intensive Applications',
		kind: 'talk',
		event: 'Conf42 Golang 2022',
		place: 'Online',
		date: '2022-05-03',
		videos: ['jllPMWL5rK8'],
	},
	{
		title: 'How to Make Learning Databases Fun and Approachable',
		kind: 'podcast',
		event: 'CodeNewbie',
		date: '2022-03-14',
		listen: apple('s19-e6-how-to-make-learning-databases-fun-and/id919219256?i=1000553930444'),
		cover: '/images/talks/events/codenewbie.webp',
	},
	{
		title: 'DoK Talks #120: A Gentle Introduction to Building Data Intensive Applications',
		kind: 'talk',
		event: 'CNCF Data on Kubernetes',
		place: 'Online',
		date: '2022-03-09',
		description:
			'Gotchas and best practices for building, deploying, and scaling data-intensive apps - building a key-value store from scratch using only SQL. Co-presented with Bart Farrell.',
		// The second is a one-minute clip from it
		videos: ['v9GUB1A0T1k', 'fhb4N11Q8wo'],
		listen: apple('dok-talks-120-a-gentle-introduction-to-building/id1524821862?i=1000553416566'),
	},
	{
		title: 'TechTalk: Databases and DevOps',
		kind: 'talk',
		event: 'SingleStore',
		cover: '/images/talks/events/singlestore.webp',
		place: 'Online',
		date: '2022-02',
		description:
			'Live demo showing how to set up continuous database deployments using GitHub Actions. Co-presented with Rizel Scarlett (GitHub).',
	},
	{
		title: 'Diverse into Open Source',
		kind: 'talk',
		event: 'ACM IEM Diversion { init() }',
		place: 'Online',
		date: '2022-02-01',
		description: 'With Praveen Kumar Purushothaman.',
		videos: ['JrQyfY69vLM'],
	},
	{
		title: 'Diversion { init() } Exclusive Podcast',
		kind: 'podcast',
		event: 'ACM IEM',
		date: '2022-02-01',
		videos: ['N9aGu8MJops'],
	},

	// 2021
	{
		title: 'End of Year Wrap-up - 2021',
		kind: 'podcast',
		event: 'Community Pulse',
		date: '2021-12-13',
		listen: apple('end-of-year-wrap-up-2021-ep-64/id1218368182?i=1000544870853'),
		cover: '/images/talks/events/community-pulse-64.webp',
	},
	{
		title: 'DevRel and DevOps, Two Peas in a Pod',
		kind: 'podcast',
		event: 'DevOps State of Mind',
		date: '2021-11-30',
		listen: apple('devrel-and-devops-two-peas-in-a-pod/id1594456604?i=1000543501113'),
		cover: '/images/talks/events/devops-state-of-mind.webp',
	},
	{
		title: '5 Step Approach To Passing Any Technical Interview',
		kind: 'podcast',
		event: 'Kunal Kushwaha',
		date: '2021-11-28',
		videos: ['Sklb_UKyCm8'],
	},
	{
		title: 'Getting Started with SingleStore',
		kind: 'livestream',
		event: 'SingleStore',
		place: 'Online',
		date: '2021-11-17',
		videos: ['YRUGd6UaYyA'],
	},
	{
		title: 'Advocating for Junior Developers',
		kind: 'podcast',
		event: 'Constant Variables',
		date: '2021-11-16',
		videos: ['W-KBXeJjFWQ'],
		listen: apple(
			'advocating-for-junior-developers-with-joe-karlsson/id1322260749?i=1000542086908',
		),
	},
	{
		title: 'How to Hire and Develop the Best Spatial Data Talent Out There',
		kind: 'panel',
		event: 'CARTO',
		place: 'Online',
		date: '2021-10-28',
		videos: ['fcKb4ivzmh4'],
	},
	{
		title: 'Are You Afraid of the Dark',
		kind: 'podcast',
		event: 'Salute Your Skorts: Pod of the 90s',
		date: '2021-10-27',
		listen: apple('are-you-afraid-of-the-dark-featuring-joe-karlsson/id1590064038?i=1000539930690'),
		cover: '/images/talks/events/salute-your-skorts.webp',
	},
	{
		title: 'Web Day',
		kind: 'talk',
		event: 'Appwrite',
		place: 'Online',
		date: '2021-10-21',
		videos: ['L819UVzPkYo'],
	},
	{
		title: 'The Past, Present, and Future of Databases',
		kind: 'podcast',
		event: 'Aftercamp',
		date: '2021-10-06',
		videos: ['EXChh6b9bcM'],
	},
	{
		title: 'Episode 80',
		kind: 'podcast',
		event: 'Guidance Counselor 2.0',
		date: '2021-09-20',
		listen: apple(
			'episode-80-joe-karlsson-sr-developer-advocate-mongodb/id1256154656?i=1000535979257',
		),
		cover: '/images/talks/events/guidance-counselor-80.webp',
	},
	{
		title: 'Scaling Data-Intensive Applications with SingleStore and Redpanda Data',
		kind: 'talk',
		event: 'SingleStore',
		place: 'Online',
		date: '2021-09-15',
		videos: ['EDQjy_BMSyQ'],
	},
	{
		title: 'Getting Started with SingleStore',
		kind: 'demo',
		event: 'SingleStore',
		date: '2021-08-30',
		description:
			'A quick tour of SingleStore and its SQL Editor, and how to load and query a lot of data fast with SingleStore Pipelines.',
		videos: ['bIFrJJkUftA'],
	},
	{
		title: 'Mapping SQL Terms and Concepts to MongoDB',
		kind: 'demo',
		event: 'MongoDB',
		date: '2021-05-08',
		description:
			'For developers who know SQL: the terms and concepts in SQL databases, side by side with their MongoDB equivalents.',
		videos: ['UuNVpLIOHW8'],
	},
	{
		title: 'MongoDB VS Code Plugin: Tips and Tricks',
		kind: 'demo',
		event: 'MongoDB',
		date: '2021-04-24',
		description:
			'Setting up the MongoDB plugin for VS Code: connecting to a cluster, browsing collections and prototyping queries in Playgrounds. MongoDB has since marked this video deprecated.',
		videos: ['g1EjixJht6g'],
	},
	{
		title: 'MongoDB Schema Design Best Practices (10-Minute Version)',
		kind: 'demo',
		event: 'MongoDB',
		date: '2021-04-18',
		description: "A 10-minute version of my schema design talk, for MongoDB's YouTube channel.",
		videos: ['QAqK-R9HUhc'],
		writeup: SCHEMA.writeup,
	},
	{
		title: "Things I've Learned About Maintaining Large Codebases",
		kind: 'talk',
		event: 'CityJS Conference 2021',
		place: 'Online',
		date: '2021-06-28',
		videos: ['YEBroAHFSd0'],
	},
	{
		title: 'Joe Karlsson of MongoDB',
		kind: 'podcast',
		event: 'Uncaught Exceptions (Ep. 10)',
		date: '2021-05-26',
		videos: ['hXy9xKKd3Gw'],
		listen: apple('joe-karlsson-of-mongodb-ep-10/id1554201130?i=1000523815218'),
	},
	{
		title: 'MongoDB Patterns et Anti-Patterns',
		kind: 'talk',
		event: 'ConFoo 2021',
		place: 'Online',
		date: '2021-05-12',
		description: 'With Lauren Schaefer.',
		videos: ['I8N9KR73LhU'],
	},
	{
		title: 'Save The World And Money with MongoDB Data Lakes',
		kind: 'talk',
		event: 'Conf42 Cloud Native 2021',
		place: 'Online',
		date: '2021-04-29',
		description:
			"Using MongoDB's Data Lake service to auto-archive cold data to AWS S3 while maintaining query capabilities - reducing data center power consumption and costs.",
		videos: ['fAvVxQknDL0', '8KskhLOEbYI'],
		link: 'https://www.conf42.com/Cloud_Native_2021_Joe_Karlsson_save_the_world_data_lakes',
	},
	{
		title: 'The Art of Computer Science',
		kind: 'talk',
		event: 'TEDxYouth@LakeManalapan',
		date: '2021-03',
		videos: ['GiNa2jen-lg', 'CGb_6vkYws4'],
		...ART_OF_CS,
	},
	{
		title: "DevRel Content Channels: What's Hip. What's Cool. What's, Like, So Out.",
		kind: 'podcast',
		event: 'Community Pulse',
		date: '2021-03-19',
		listen: apple(
			'devrel-content-channels-whats-hip-whats-cool-whats/id1218368182?i=1000513704689',
		),
		cover: '/images/talks/events/community-pulse-devrel-channels.webp',
	},
	{
		title: 'DevRel and Professional Craziness',
		kind: 'podcast',
		event: 'Refactor',
		date: '2021-03-08',
		listen: apple('devrel-and-professional-craziness-with-joe/id1558440491?i=1000513048303'),
		cover: '/images/talks/events/refactor.webp',
	},
	{
		title: '8 Bits with Joe Karlsson',
		kind: 'podcast',
		event: '8 Bits (Microsoft Developer)',
		date: '2021-02-10',
		description: 'Hosted by Chloe Condon and Brandon Minnick.',
		videos: ['6bHYDUzY9j0'],
		listen: apple('8-bits-with-joe-karlsson/id1541214537?i=1000508572873'),
	},

	// 2020
	{
		title: 'An Intro To IoT (Internet of Toilets)',
		kind: 'talk',
		event: 'Nerdearla',
		place: 'Online',
		date: '2020-12-11',
		videos: ['Vki0F0N_mEg'],
		...IOT,
	},
	{
		title: 'React Wednesdays: MongoDB and GraphQL',
		kind: 'livestream',
		event: 'Kendo UI',
		place: 'Online',
		date: '2020-12-10',
		videos: ['4jaS_7vCi9g'],
	},
	{
		title: 'A Gentle Introduction to Serverless Apps With React',
		kind: 'podcast',
		event: 'React Round Up (REACT 126)',
		date: '2020-12-02',
		videos: ['jQ7ZcwyikvU'],
		listen: apple(
			'react-126-a-gentle-introduction-to-serverless-apps/id1364741140?i=1000501120243',
		),
	},
	{
		title: 'Code Editor Landscape and MongoDB for VS Code',
		kind: 'podcast',
		event: 'The MongoDB Podcast (Ep. 29)',
		date: '2020-11-25',
		listen: apple(
			'ep-29-code-editor-landscape-and-mongodb-for-vs-code/id1500452446?i=1000500201536',
		),
		cover: '/images/talks/events/mongodb-podcast-29.webp',
	},
	{
		title: 'Diving Deep Into Databases',
		kind: 'podcast',
		event: 'Coding Over Cocktails',
		date: '2020-11-11',
		listen: apple('diving-deep-into-databases-with-joe-karlsson/id1531450276?i=1000498062534'),
		cover: '/images/talks/events/coding-over-cocktails.webp',
	},
	{
		title: 'MongoDB Update for November 9, 2020',
		kind: 'podcast',
		event: 'The MongoDB Podcast',
		date: '2020-11-09',
		listen: apple('mongodb-update-for-november-9-2020/id1500452446?i=1000497762602'),
		cover: '/images/talks/events/mongodb-podcast-update-2020-11-09.webp',
	},
	{
		title: 'Bechdel.io: How We Used JavaScript To Help Make Film More Inclusive',
		kind: 'talk',
		event: 'DevFest WI 2020',
		place: 'Online',
		date: '2020-10-24',
		videos: ['7az78FYgwx4'],
		...BECHDEL,
	},
	{
		title: 'Internet of Toilets: How I Built a Kitty Litter Box Using JS',
		kind: 'talk',
		event: 'Conf42 JavaScript 2020',
		place: 'Online',
		date: '2020-10-21',
		videos: ['hVpgThAukUY', 'O7e_MQFA0tY'],
		...IOT,
	},
	{
		title: 'MongoDB Schema Design Best Practices',
		kind: 'talk',
		event: 'Conf42 JavaScript 2020',
		place: 'Online',
		date: '2020-10-21',
		videos: ['tYNaXn2wJJo', 'NvYNPzpXF8g'],
		...SCHEMA,
	},
	{
		title: 'From SQL to NoSQL: A Gentle Intro for Devs',
		kind: 'talk',
		event: 'Conf42 JavaScript 2020',
		place: 'Online',
		date: '2020-10-21',
		videos: ['Y9qSp8kd1u4', 'cClWDAFE0K0'],
		...SQL_TO_NOSQL,
	},
	{
		title: 'An Interview with Joe Karlsson, Developer Advocate at MongoDB',
		kind: 'podcast',
		event: 'GrizzTech Talks',
		date: '2020-10-16',
		listen: apple('an-interview-with-joe-karlsson-developer-advocate/id1513642189?i=1000494942738'),
		cover: '/images/talks/events/grizztech-talks.webp',
	},
	{
		title: 'A Gentle Introduction to Building Serverless Apps',
		kind: 'talk',
		event: 'React Virtual Conference (C# Corner)',
		place: 'Online',
		date: '2020-10-11',
		videos: ['cqCirMTuic8'],
	},
	{
		title: 'Building Your First GraphQL Client in JavaScript',
		kind: 'talk',
		event: 'YouTube',
		date: '2020-09-16',
		videos: ['87bPNnd6M7A'],
	},
	{
		title: 'An Introduction to IoT, or How I Built an IoT Kitty Litter Box Using JavaScript',
		kind: 'talk',
		event: 'DevNation Day 2020',
		place: 'Online',
		date: '2020-09-16',
		videos: ['chs89ujm1Cs'],
		...IOT,
	},
	{
		title: 'The Art of Computer Science',
		kind: 'talk',
		event: 'PennApps XXI (keynote)',
		place: 'Online',
		date: '2020-09',
		videos: ['EtduE9IHDS0'],
		...ART_OF_CS,
	},
	{
		title: 'Fall Guys with Adrienne Tacke',
		kind: 'livestream',
		event: 'Nic Raboy',
		place: 'Online',
		date: '2020-09-11',
		videos: ['LT181gBLST8'],
	},
	{
		title: 'MongoDB Schema Fundamentals',
		kind: 'podcast',
		event: 'JavaScript Jabber (JSJ 448)',
		date: '2020-09-08',
		listen: apple(
			'jsj-448-mongodb-schema-fundamentals-with-joe-karlsson/id496893300?i=1000490443472',
		),
		cover: '/images/talks/events/javascript-jabber-448.webp',
	},
	{
		title: 'An Introduction to IoT / How I Built an IoT Kitty Litter Box Using JavaScript',
		kind: 'talk',
		event: 'IoT Innovation Latam',
		otherRecording: 'zHvrtt5raA4',
		place: 'Online',
		date: '2020-09-07',
		end: '2020-09-08',
		description:
			'Building an IoT litter box with a Raspberry Pi and JavaScript - from sensor setup to reading inputs with Node.js.',
		...IOT,
	},
	{
		title: 'Document Databases and Mongo',
		kind: 'podcast',
		event: 'Hanselminutes with Scott Hanselman',
		date: '2020-09-03',
		videos: ['mUv4K8hRYRw'],
		listen: apple(
			'document-databases-and-mongo-with-engineer-joe-karlsson/id117488860?i=1000490004133',
		),
	},
	{
		title: 'Fall Guys with Adrienne Tacke and Ado Kukic',
		kind: 'livestream',
		event: 'Nic Raboy',
		place: 'Online',
		date: '2020-08-28',
		videos: ['JrvW-akBXzU'],
	},
	{
		title: 'Making Film More Inclusive with JavaScript',
		kind: 'talk',
		event: 'CascadiaJS 2020 August Meetup',
		place: 'Online',
		date: '2020-08-14',
		videos: ['KDH4esqOezA', 'EWYc7FKCKWY'],
		...BECHDEL,
	},
	{
		title: 'How Developer Advocacy is Changing',
		kind: 'podcast',
		event: 'The PIT Show',
		date: '2020-08-11',
		listen: apple(
			'how-developer-advocacy-is-changing-with-joe-karlsson/id1448707006?i=1000487802715',
		),
		cover: '/images/talks/events/pit-show.webp',
	},
	{
		title: 'An Introduction to IoT / How I Built an IoT Kitty Litter Box Using JavaScript',
		kind: 'talk',
		event: 'CodeLand:Distributed',
		place: 'Online',
		date: '2020-07-23',
		description:
			'Combining cats, computers, and crappy ideas into an IoT litter box using a Raspberry Pi and Node.js.',
		videos: ['zHvrtt5raA4', 'P_G5b6ArWVY'],
		...IOT,
	},
	{
		title: 'MongoDB Basics',
		kind: 'podcast',
		event: 'JavaScript Jabber (JSJ 436)',
		date: '2020-06-16',
		description:
			'What is MongoDB, how it works, how it differs from relational databases, and how it fits into modern web apps.',
		videos: ['8UseTYKBx0U'],
		listen: apple('jsj-436-mongodb-basics-with-joe-karlsson/id496893300?i=1000478156934'),
		link: 'https://javascriptjabber.com/jsj-436-mongodb-basics-with-joe-karlsson',
	},
	{
		title: 'Bechdel.io: How We Used MongoDB To Help Make Film More Inclusive',
		kind: 'talk',
		event: 'MongoDB World 2020 (mongodb.live)',
		place: 'Online',
		date: '2020-06-09',
		end: '2020-06-10',
		description:
			'How a brother-sister team built bechdel.io, a film script parsing tool that automatically runs the Bechdel Test using MongoDB.',
		videos: ['4W5fJTyfj1Q'],
		...BECHDEL,
	},
	{
		title: 'Building Your First GraphQL Client in JS',
		kind: 'talk',
		event: 'MongoDB World 2020 (mongodb.live)',
		place: 'Online',
		date: '2020-06-09',
		end: '2020-06-10',
		description:
			'Learn about GraphQL with MongoDB - schema architecture, query performance, error handling, and caching.',
		videos: ['7HczsHW7JA0'],
	},
	{
		title: 'An Introduction To IoT (Internet of Toilets)',
		kind: 'talk',
		event: 'Live Coders Conf',
		place: 'Online',
		date: '2020-06-06',
		description: 'IoT kitty litter box talk at the Live Coders Conference.',
		videos: ['CPyS9pwIBGg'],
		link: 'https://atndesign.github.io/Live-coders-conference/',
		...IOT,
	},
	{
		title: 'From SQL to NoSQL: A Gentle Introduction For JS Developers',
		kind: 'talk',
		event: 'Node.js Global Summit',
		otherRecording: '12IppjSDVCQ',
		date: '2020-05-30',
		description:
			'Changing your mindset from tabular data modeling to NoSQL - comparing SQL and MongoDB concepts for JavaScript developers.',
		...SQL_TO_NOSQL,
	},
	{
		title: 'MongoDB Schema Design Best Practices',
		kind: 'talk',
		event: 'Data Architecture Day',
		date: '2020-05-18',
		description:
			'Data modeling basics using real-world examples - common methodologies for designing MongoDB schemas.',
		videos: ['ay31FKx4maM', 'loLZ1zdq0gI'],
		...SCHEMA,
	},
	{
		title: 'From SQL to NoSQL: A Gentle Introduction For JS Developers',
		kind: 'talk',
		event: 'JS VidCon 2020',
		otherRecording: '12IppjSDVCQ',
		place: 'Online',
		date: '2020-05-07',
		description:
			'Comparing SQL and MongoDB for JavaScript developers, with a walkthrough of data modeling basics.',
		...SQL_TO_NOSQL,
	},
	{
		title: 'Internet of Things (IoT)',
		kind: 'podcast',
		event: 'JavaScript Jabber (JSJ 432)',
		date: '2020-05-05',
		description:
			'Walking through approaches, uses, and libraries for building IoT with JavaScript.',
		videos: ['MyuC5VdECA8'],
		listen: apple('jsj-432-internet-of-things-iot-with-joe-karlsson/id1237401284?i=1000473635907'),
		link: 'https://javascriptjabber.com/jsj-432-internet-of-things-iot-with-joe-karlsson',
	},
	{
		title: 'A Gentle Introduction to Building Serverless Apps',
		kind: 'talk',
		event: 'Byteconf React 2020',
		place: 'Online',
		date: '2020-05-01',
		description:
			'Beginner-friendly intro to serverless computing with MongoDB Stitch, including authentication and access rules.',
		// The whole first day's stream
		videos: ['MEeZLM1XVLI'],
	},
	{
		title: 'An Introduction to the Internet of Toilets',
		kind: 'talk',
		event: 'HalfStack Online',
		place: 'Online',
		date: '2020-05',
		videos: ['r2U5RXLr5Po'],
		...IOT,
	},
	{
		title: 'An Introduction To IoT (Internet of Toilets)',
		kind: 'talk',
		event: '(mini) Minnebar',
		otherRecording: 'CPyS9pwIBGg',
		place: 'Minneapolis, MN',
		date: '2020-04-25',
		description:
			'IoT litter box talk - setting up Node.js on a Raspberry Pi, connecting sensors, and reading inputs.',
		...IOT,
	},
	{
		title: 'MongoDB Schema Design Best Practices',
		kind: 'talk',
		event: 'YouTube',
		date: '2020-04-16',
		videos: ['leNCfU5SYR8'],
		...SCHEMA,
	},
	{
		title: 'MongoDB Schema Design Best Practices',
		kind: 'talk',
		event: 'MidwestPHP',
		otherRecording: 'tYNaXn2wJJo',
		place: 'Minneapolis, MN',
		date: '2020-04-02',
		end: '2020-04-04',
		description:
			'Data modeling with document databases - real-world examples of schema design for read-heavy and write-heavy applications.',
		...SCHEMA,
	},
	{
		title: 'Building An eCommerce Web App with Nader Dabit',
		kind: 'livestream',
		event: 'Twitch',
		place: 'Online',
		date: '2020-03-27',
		videos: ['1m8cCuig4hc'],
	},
	{
		title: 'Developing with GraphQL and MongoDB',
		kind: 'livestream',
		event: 'MongoDB (Ep. 2)',
		place: 'Online',
		date: '2020-03-12',
		videos: ['chL4FqQlMaY'],
	},
	{
		title: 'From SQL to NoSQL: A Gentle Introduction For Developers',
		kind: 'talk',
		event: 'JavaMN Meetup',
		otherRecording: '12IppjSDVCQ',
		place: 'Minneapolis, MN',
		date: '2020-03-10',
		description:
			'Comparing SQL and MongoDB concepts, with data modeling basics for developers transitioning to NoSQL.',
		...SQL_TO_NOSQL,
	},
	{
		title: 'An Introduction To IoT (Internet of Toilets)',
		kind: 'talk',
		event: 'Prime Digital Academy',
		otherRecording: 'CPyS9pwIBGg',
		place: 'Minneapolis, MN',
		date: '2020-03-02',
		description:
			'Hands-on walkthrough of building an IoT project with a Raspberry Pi and JavaScript.',
		...IOT,
	},
	{
		title: 'A Gentle Introduction to IoT',
		kind: 'talk',
		event: 'ConFoo Montreal',
		otherRecording: 'zHvrtt5raA4',
		place: 'Montreal, Canada',
		date: '2020-02-26',
		end: '2020-02-28',
		description:
			'Getting started with IoT using Raspberry Pi and Node.js - sensor setup and reading inputs.',
		...IOT,
	},
	{
		title: 'From SQL to NoSQL: A Gentle Introduction For Developers',
		kind: 'talk',
		event: 'ConFoo Montreal',
		place: 'Montreal, Canada',
		date: '2020-02-26',
		end: '2020-02-28',
		description:
			'Comparing SQL and NoSQL data modeling, with practical guidance for developers moving to MongoDB.',
		videos: ['12IppjSDVCQ'],
		...SQL_TO_NOSQL,
	},
	{
		title: 'Getting Started with GraphQL And Atlas',
		kind: 'talk',
		event: 'ConFoo Montreal',
		cover: '/images/talks/events/confoo-2020.webp',
		place: 'Montreal, Canada',
		date: '2020-02-26',
		end: '2020-02-28',
		description:
			'Step-by-step setup of GraphQL schemas and APIs on MongoDB Atlas for rapid application building.',
	},
	{
		title: 'Building Your First GraphQL Client in JS',
		kind: 'talk',
		event: 'MongoDB.local San Francisco 2020',
		place: 'San Francisco, CA',
		date: '2020-01-24',
		videos: ['XsD2ZKqMbgo'],
	},
	{
		title: 'Building an App with MongoDB and GraphQL',
		kind: 'livestream',
		event: 'Twitch',
		place: 'Online',
		date: '2020-01-09',
		videos: ['xjd8NPs-yKI'],
	},

	// 2019
	{
		title: 'How to Redeem a MongoDB Atlas Credit',
		kind: 'demo',
		event: 'YouTube',
		date: '2019-11-27',
		videos: ['FxeQ5eck3tw'],
	},
	{
		title: 'From SQL to NoSQL: Changing Your Mindset',
		kind: 'talk',
		event: 'MadHacks Fall 2019',
		date: '2019-10-19',
		description:
			'Comparing the terms and concepts in SQL databases and MongoDB, and the data modeling basics you need when you start using MongoDB.',
		videos: ['24JYU-l5uQc'],
	},
	{
		title: 'Bringing JavaScript to the IoT Edge',
		kind: 'talk',
		event: 'Node+JS Interactive 2019',
		place: 'Montreal, Canada',
		date: '2019-12-11',
		end: '2019-12-12',
		description:
			'Why JavaScript is positioned to power billions of IoT devices, the role of Node.js, and schema design patterns for sensor data in MongoDB.',
		videos: ['711Sb55fzdg'],
		...IOT,
	},
	{
		title: 'Building an IoT Kitty Litter Box',
		kind: 'livestream',
		event: 'Twitch',
		place: 'Online',
		date: '2019-11-25',
		videos: ['7u9S0nTCwbQ'],
	},
	{
		title: 'IoT with JS: A Gentle Introduction to IoT',
		kind: 'talk',
		event: 'NYC Code Camp 2019',
		otherRecording: 'ur3H2yZ8XHE',
		place: 'New York, NY',
		date: '2019-09-28',
		description:
			'Hands-on introduction to IoT with Raspberry Pi, Node.js, WebSockets, and sensor integration.',
		...IOT,
	},
	{
		title: 'IoT with JS: A Gentle Introduction to IoT',
		kind: 'talk',
		event: 'Grizzhacks',
		otherRecording: 'ur3H2yZ8XHE',
		place: 'Rochester, MI',
		date: '2019-09',
		description: 'Getting started with IoT using JavaScript, Raspberry Pi, and Node.js.',
		...IOT,
	},
	{
		title: 'Updating my Dotfiles',
		kind: 'livestream',
		event: 'Twitch',
		place: 'Online',
		date: '2019-09-04',
		videos: ['_cmG4z_S9AM'],
	},
	{
		title: 'A Gentle Introduction to Building Serverless Apps with MongoDB Stitch',
		kind: 'talk',
		event: 'ServerlessMN',
		place: 'Minneapolis, MN',
		date: '2019-08',
		description:
			'Beginner-friendly intro to serverless with MongoDB Stitch - authentication, access rules, and managed clusters.',
		videos: ['GZPQdzzj4n8'],
	},
	{
		title: 'JS and Parallel Processing(!?)',
		kind: 'talk',
		event: 'Midwest JS',
		otherRecording: 'jB5CtGIADJ0',
		place: 'Minneapolis, MN',
		date: '2019-08-07',
		end: '2019-08-09',
		description:
			"Exploring JavaScript's evolution from single-threaded to supporting processing threads for serious computation.",
	},
	{
		title: 'Building a GraphQL Client in JavaScript',
		kind: 'talk',
		event: 'Midwest JS',
		otherRecording: 'XsD2ZKqMbgo',
		place: 'Minneapolis, MN',
		date: '2019-08-07',
		end: '2019-08-09',
		description:
			'Workshop: GraphQL fundamentals, schema architecture, query performance, error handling, and caching.',
	},
	{
		title: 'Bechdel.io: The Future of Film and Feminism',
		kind: 'talk',
		event: 'The Association for Computers and the Humanities',
		place: 'Pittsburgh, PA',
		date: '2019-07-25',
		description:
			'How a collaborative digital humanities project created an automated Bechdel Test tool for macro-level feminist film analysis. With Laurel Karlsson.',
		videos: ['m0GWc5qw32w'],
		...BECHDEL,
	},
	{
		title: 'Building High Performance React Applications',
		kind: 'talk',
		event: 'Kansas City Developer Conference',
		otherRecording: '6z4g27TSO5I',
		place: 'Kansas City, MO',
		date: '2019-07-17',
		end: '2019-07-19',
		description:
			'Common React performance bottlenecks and practical ways to speed up real-world applications.',
	},
	{
		title: 'Building a GraphQL Client in JavaScript',
		kind: 'talk',
		event: 'Kansas City Developer Conference',
		otherRecording: 'XsD2ZKqMbgo',
		place: 'Kansas City, MO',
		date: '2019-07-17',
		end: '2019-07-19',
		description:
			'Workshop covering GraphQL philosophy, scalable schema design, performance optimization, and caching strategies.',
	},
	{
		title: 'JS + Parallel Processing(?!)',
		kind: 'talk',
		event: 'Prairie Dev Con Winnipeg 2019',
		place: 'Winnipeg, Canada',
		date: '2019-06-07',
		videos: ['CmhWzoo2IuE'],
	},
	{
		title: 'JS and Parallel Processing(!?)',
		kind: 'talk',
		event: 'Self.Conference',
		otherRecording: 'jB5CtGIADJ0',
		date: '2019-06-04',
		end: '2019-06-05',
		description:
			"JavaScript's journey from single-threaded to supporting parallel processing for time-consuming calculations.",
	},
	{
		title: 'UX + Engineering: A Tale of Two Cities',
		kind: 'talk',
		event: 'NDC Conferences',
		date: '2019-05-22',
		description: 'With Edward Ecker.',
		videos: ['nNhL5UluNtA'],
	},
	{
		title: 'JS and Parallel Processing (!?)',
		kind: 'talk',
		event: 'Minnebar',
		place: 'Minneapolis, MN',
		date: '2019-04-28',
		videos: ['jB5CtGIADJ0'],
	},
	{
		title: 'Moodlite Demo',
		kind: 'demo',
		event: 'YouTube',
		date: '2019-04-03',
		description:
			'Moodlite: open source, 3D-printable light triangles with addressable RGB LEDs, run by a NodeMCU controller you change from any browser.',
		videos: ['Eje1EPiiI5M', 'I2yMKgKkKvk'],
	},
	{
		title: 'IoT and JS(?!): A Gentle Introduction to the Internet of Things',
		kind: 'talk',
		event: 'Byteconf JavaScript 2019',
		place: 'Online',
		date: '2019-03-16',
		description:
			'IoT for web developers: why JavaScript is a good place to start with hardware, and a Morse code machine built on a Raspberry Pi with Express and the onoff package.',
		videos: ['ur3H2yZ8XHE'],
		...IOT,
	},
	{
		title: 'Building High Performance React Applications',
		kind: 'talk',
		event: 'Full Stack Toronto',
		place: 'Toronto, Canada',
		date: '2019-03-05',
		videos: ['6z4g27TSO5I'],
	},
	{
		title: 'A Gentle Introduction to Async-Await',
		kind: 'talk',
		event: 'YouTube',
		date: '2019-03-01',
		videos: ['FB4JQPUS9Bs', 'pX0F4eJb4lM'],
	},
	{
		title: 'UX + Engineering: How to Collaborate Together Better',
		kind: 'talk',
		event: 'YouTube',
		date: '2019-01-09',
		videos: ['ySVXOnLMFdc'],
	},

	// 2018
	{
		title: 'Generating a New SSH Key and Adding It to the SSH Agent',
		kind: 'demo',
		event: 'YouTube',
		date: '2018-12-26',
		description:
			'Generating an SSH key and adding it to ssh-agent, so your computer can talk to GitHub securely.',
		videos: ['p4Jhf729jgg'],
	},
	{
		title: 'How to Setup Git',
		kind: 'demo',
		event: 'YouTube',
		date: '2018-12-26',
		videos: ['ZYToLReowzs'],
	},
	{
		title: 'How to Setup Sublime Text Package Control',
		kind: 'demo',
		event: 'YouTube',
		date: '2018-12-26',
		videos: ['js7kt0LBlWA'],
	},
	{
		title: 'How to Setup jshint on Sublime Text',
		kind: 'demo',
		event: 'YouTube',
		date: '2018-12-26',
		videos: ['97KErHwCd7w'],
	},
	{
		title: 'GraphQL Tutorial and Live Coding',
		kind: 'livestream',
		event: 'Twitch',
		place: 'Online',
		date: '2018-12-30',
		videos: ['Z6vz07R2m0Y'],
	},
	{
		title: 'Building High Performance React Applications',
		kind: 'talk',
		event: 'Node.js',
		date: '2018-11-05',
		videos: ['xJYOipHkwNM'],
	},
	{
		title: 'Building High Performance React Applications',
		kind: 'talk',
		event: 'Web Rebels 2018',
		date: '2018-06-12',
		videos: ['JNs1ZvRzOYM'],
	},
	{
		title: 'Functional Programming for People Who Hate Math',
		kind: 'talk',
		event: 'MPLS Jr Devs 2018',
		place: 'Minneapolis, MN',
		date: '2018-06-12',
		description: 'In two parts.',
		videos: ['t26nBe43gwQ', 'Yl5DSL1cB-Q'],
	},
];

// Talks, podcasts, livestreams and demos (tutorial and demo videos), the four kinds the page
// counts and filters by. A panel counts as a talk.
export type TalkGroup = 'talk' | 'podcast' | 'livestream' | 'demo';
export const TALK_GROUPS: TalkGroup[] = ['talk', 'podcast', 'livestream', 'demo'];
export const groupOf = (talk: Talk): TalkGroup => (talk.kind === 'panel' ? 'talk' : talk.kind);

/** "12 talks, 3 podcasts, 1 livestream", leaving out the kinds with none */
export function countByGroup(list: Talk[]): string {
	return TALK_GROUPS.map(
		(group) => [group, list.filter((t) => groupOf(t) === group).length] as const,
	)
		.filter(([, n]) => n > 0)
		.map(([group, n]) => `${n} ${group}${n === 1 ? '' : 's'}`)
		.join(', ');
}

/** "Nov 5, 2026", "Apr 20-24, 2026", "Mar 2022" or "2025", from how much of the date I know */
export function formatTalkDate({ date, end }: Pick<Talk, 'date' | 'end'>): string {
	if (/^\d{4}$/.test(date)) return date;
	const start = new Date(`${date.length === 7 ? `${date}-01` : date}T00:00:00Z`);
	if (date.length === 7) {
		return start.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short' });
	}
	if (!end) return formatDate(start);
	const last = new Date(`${end}T00:00:00Z`);
	const month = (d: Date) => d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short' });
	const lastDay =
		month(last) === month(start) ? last.getUTCDate() : `${month(last)} ${last.getUTCDate()}`;
	return `${month(start)} ${start.getUTCDate()}-${lastDay}, ${start.getUTCFullYear()}`;
}

// The jobs I gave these talks for, newest first, with their years from resume.ts. A job's
// last year is also the next one's first, so `since` is the month a talk starts counting
// for that job: CData from May 2026; CloudQuery after Tinybird's last live coding session
// (January 2024); Tinybird from its first one (April 2023); SingleStore from "Why I joined
// SingleStore" (August 2021); MongoDB from August 2019 (KCDC and ACH in July 2019 were
// Best Buy talks).
const ERA_STARTS: { company: string; label: string; since: string }[] = [
	{ company: 'CData', label: 'CData', since: '2026-05' },
	{ company: 'CloudQuery (now env0)', label: 'CloudQuery', since: '2024-02' },
	{ company: 'Tinybird', label: 'Tinybird', since: '2023-04' },
	{ company: 'SingleStore', label: 'SingleStore', since: '2021-08' },
	{ company: 'MongoDB', label: 'MongoDB', since: '2019-08' },
	{ company: 'Best Buy', label: 'Best Buy', since: '0000' },
];

export interface TalkEra {
	slug: string;
	years: string;
	label: string;
	since: string;
	talks: Talk[];
}

/** Which era a talk falls in: the newest one it's on or after */
export function eraIndexFor(date: string): number {
	return ERA_STARTS.findIndex((era) => date >= era.since);
}

export const TALK_ERAS: TalkEra[] = ERA_STARTS.map((era, i) => {
	const role = roles.find((r) => r.company === era.company);
	if (!role) throw new Error(`talks.ts: no role named "${era.company}" in resume.ts`);
	return {
		slug: `era-${role.startYear}`,
		years: `${role.startYear}–${role.endYear ?? ''}`,
		label: era.label,
		since: era.since,
		talks: talks
			.filter((t) => eraIndexFor(t.date) === i)
			.sort((a, b) => b.date.localeCompare(a.date)),
	};
});
