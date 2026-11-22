// What other people have written about my work: research papers that cite it, press,
// interviews, newsletters, write-ups and threads. /featured/ lists all of it; the About page's
// Written about section shows only the lead story and the first three papers, then links here.
// Podcasts, radio and talks I appeared on live in talks.ts, never here (DECISIONS.md
// 2026-11-21: nothing here repeats As seen on). Every entry was opened and checked to name me
// or link my work; a dead link gets an archived copy, not removal.

export interface Paper {
	title: string;
	venue: string;
	year: number;
	url: string;
	// What of mine it cites, in my words
	cites: string;
	// The line from the paper that names me, copied exactly, and the part of it to highlight
	reference: string;
	highlight: string;
	// The sentence the citation hangs on, copied exactly, when the reference alone doesn't say
	// what they used it for
	context?: string;
}

export type CoverageKind = 'press' | 'interview' | 'newsletter' | 'writeup' | 'thread';

export interface Coverage {
	kind: CoverageKind;
	// The year, or the full date when I know it, 'YYYY-MM-DD'; left out when the page has none
	date?: string;
	outlet: string;
	title: string;
	url: string;
	// A short note after the title: "archived copy", a thread's comment count
	note?: string;
}

export const LEAD_STORY = {
	outlet: 'NPR',
	show: 'All Things Considered',
	year: 2026,
	title: 'At Minnesota’s state fair, crop artists depict the struggle over immigration enforcement',
	url: 'https://www.npr.org/2026/09/04/nx-s1-5954198/at-minnesotas-state-fair-crop-artists-depict-the-struggle-over-immigration-enforcement',
	// My line in the piece, exactly as NPR's transcript has it
	quote: 'It’s, like, uniquely political.',
	image: '/images/crop-art/riot-dog.webp',
	imageAlt:
		'Crop art mosaic reading Cave Canem Tumultum depicting the famous Greek riot dog Loukanikos running with a red bandana, made from white and dark seeds',
};

// About shows the first three
export const papers: Paper[] = [
	{
		title: 'LazyLog: A New Shared Log Abstraction for Low-Latency Applications',
		venue: 'SOSP',
		year: 2024,
		// The ACM page refuses automated visitors; this is the open copy NSF hosts
		url: 'https://par.nsf.gov/biblio/10557948',
		cites: 'my event sourcing with Kafka post',
		reference:
			'[62] Joe Karlsson. Event sourcing with Kafka. https://www.tinybird.co/blog-posts/event-sourcing-with-kafka.',
		highlight: 'Joe Karlsson. Event sourcing with Kafka.',
	},
	{
		title: 'Affective and Contextual Embedding for Sarcasm Detection',
		venue: 'COLING',
		year: 2020,
		url: 'https://aclanthology.org/2020.coling-main.20/',
		cites: 'my movie script scraper, which built their sarcasm dataset',
		context: 'a scraper was used to retrieve comedy movie transcripts',
		reference:
			'IMSDB:https://www.imsdb.com/, Scraper:https://github.com/JoeKarlsson/movie-script-scraper',
		highlight: 'Scraper:https://github.com/JoeKarlsson/movie-script-scraper',
	},
	{
		title: 'Three Shadowed Dimensions of Feminine Presence in Video Games',
		venue: 'DiGRA',
		year: 2016,
		url: 'https://dl.digra.org/index.php/dl/article/view/778',
		cites: 'the Bechdel Test Visualizer, the project before Bechdel.io',
		reference: 'Karlsson, Laurel, and Joe Karlsson. 2015. “The Bechdel Test Visualizer.”',
		highlight: 'Karlsson, Laurel, and Joe Karlsson. 2015. “The Bechdel Test Visualizer.”',
	},
	{
		title: 'LazyLog: A New Shared Log Abstraction and Design for Modern Low-Latency Applications',
		venue: 'ACM TOCS',
		year: 2026,
		url: 'https://jiyuuuhuuu.github.io/publications/2025-08-15-LazyLog-A-New-Shared-Log-Abstraction-and-Design-for-Modern-Low-Latency-Applications/',
		cites: 'my event sourcing with Kafka post, in the journal version of LazyLog',
		reference:
			'[62] Joe Karlsson. Event sourcing with Kafka. https://www.tinybird.co/blog-posts/event-sourcing-with-kafka.',
		highlight: 'Joe Karlsson. Event sourcing with Kafka.',
	},
	{
		title: 'Decision Engines: Real-Time Infrastructure for Fraud Detection & Fleet Management',
		venue: 'JCSTS',
		year: 2025,
		// The paper's DOI (10.32996/jcsts.2025.7.64) stopped resolving; the journal's page still works
		url: 'https://al-kindipublisher.com/index.php/jcsts/article/view/10036',
		cites: 'my real-time fraud detection post',
		reference:
			'[2] Joe Karlsson, "How to build a real-time fraud detection system," TinyBird, 2023.',
		highlight: 'Joe Karlsson, "How to build a real-time fraud detection system," TinyBird, 2023.',
	},
	{
		title:
			'Architectures and Optimization Strategies for Real-Time Machine Learning Recommendation Systems',
		venue: 'IJSRCSEIT',
		year: 2025,
		url: 'https://ijsrcseit.com/home/article/view/CSEIT25111258',
		cites: 'my real-time recommendation system post',
		reference:
			'[2]. Karlsson, J. (2023).” What it takes to build a real-time recommendation system.” Tinybird.',
		highlight:
			'Karlsson, J. (2023).” What it takes to build a real-time recommendation system.” Tinybird.',
	},
	{
		title: 'Analisis Fitur dan Keunggulan Database Mongo dalam Berbagai Bahasa Pemrograman',
		venue: 'JSK',
		year: 2023,
		url: 'https://ejournal.unpra.ac.id/index.php/jsk/article/view/122',
		cites: 'my MongoDB schema design article',
		reference: '[7] Karlsson, J. (2020, December 04). MongoDB Schema Design Best Practices.',
		highlight: 'Karlsson, J. (2020, December 04). MongoDB Schema Design Best Practices.',
	},
];

export const coverage: Coverage[] = [
	// Press. The NPR lead story is LEAD_STORY; member stations ran it too
	{
		kind: 'press',
		date: '2026-09-04',
		outlet: 'NPR All Things Considered',
		title: LEAD_STORY.title,
		url: LEAD_STORY.url,
		note: 'and member stations',
	},
	{
		kind: 'press',
		date: '2025-04-04',
		outlet: 'Star Tribune',
		title:
			'‘Seeds of Justice’ crop art exhibition at U.S. Courthouse in Minneapolis takes on the law',
		url: 'https://www.startribune.com/seeds-of-justice-crop-art-exhibition-at-us-courthouse-in-minneapolis-takes-on-the-law/601321666',
	},
	{
		kind: 'press',
		date: '2025-04-02',
		outlet: 'Minnesota Lawyer',
		title: '‘Seeds of Justice’ exhibit combines crops, art and the law',
		url: 'https://minnlawyer.com/2025/04/02/seeds-of-justice-crop-art-exhibit-mn-court/',
	},

	// Interviews
	{
		kind: 'interview',
		date: '2021-11-24',
		outlet: 'SingleStore',
		title: 'Hello Joe Karlsson, Developer Advocate',
		// SingleStore took the post down; the Wayback Machine has it
		url: 'https://web.archive.org/web/20240301134836/https://www.singlestore.com/blog/hello-joe-karlsson-developer-advocate/',
		note: 'archived copy',
	},

	// Newsletters
	{
		kind: 'newsletter',
		date: '2026-04-23',
		outlet: 'Python Weekly #742',
		title: 'Implementing MikroTik’s binary API protocol in Python',
		url: 'https://www.pythonweekly.com/p/python-weekly-issue-742-april-23-2026',
	},
	{
		kind: 'newsletter',
		date: '2021-04-23',
		outlet: 'DB Weekly #351',
		title: 'MongoDB Schema Design Best Practices',
		url: 'https://dbweekly.com/issues/351',
	},
	{
		kind: 'newsletter',
		date: '2020-09-04',
		outlet: 'DB Weekly #320',
		title: 'Document Databases and Mongo, my Hanselminutes episode',
		url: 'https://dbweekly.com/issues/320',
	},

	// Write-ups and recommendations by other people
	{
		kind: 'writeup',
		date: '2026-03-30',
		outlet: 'Theo Dammaretz',
		title: 'Claude Code learnings, on my content pipeline',
		url: 'https://dammaretz.fr/blog/claude-code-learning-for-code-and-productivity/',
	},
	{
		kind: 'writeup',
		date: '2026-11-13',
		outlet: 'Hardpoint',
		title: 'Its docs cite my local voice assistant post',
		url: 'https://dotcipher.github.io/hardpoint/',
	},
	{
		kind: 'writeup',
		date: '2025-12-11',
		outlet: 'Ted Neward',
		title: 'His research notes on homelabs list my getting-started guide',
		url: 'https://research.tedneward.com/hardware/homelab.html',
	},
	{
		kind: 'writeup',
		date: '2020-07-31',
		outlet: 'Dana Ottaviani',
		title: 'CodeLand 2020 recap, on the IoT kitty litter talk',
		// Her site is offline; the post's source is on GitHub
		url: 'https://github.com/Dana94/2019-website/blob/master/blog/2020-07-31-codeland-2020-part-1.md',
	},
	{
		kind: 'writeup',
		date: '2019-07-16',
		outlet: 'Phil Hawksworth',
		title: 'Reflecting on London’s first JAMstack conference',
		url: 'https://dev.to/philhawksworth/reflecting-on-london-s-first-jamstack-conference-13e9',
	},
	{
		kind: 'writeup',
		outlet: 'Adrian Ward',
		title: 'My Setup links my homelab guide',
		url: 'https://www.obiee.co.uk/my-setup/',
	},
	{
		kind: 'writeup',
		outlet: 'Colby Fayock',
		title: '50 Projects for React lists my React and MongoDB Stitch tutorial',
		url: 'https://github.com/colbyfayock/50-projects-for-react-and-the-static-web/tree/master/Personal%20%26%20Portfolio',
	},
	{
		kind: 'writeup',
		outlet: 'Bryan Guner',
		title: 'A data structures resource list includes my JavaScript repo',
		url: 'https://github.com/bgoonz/BGOONZ_BLOG_2.0/blob/master/src/pages/blog/data-structures-algorithms-resources.md',
	},
	{
		kind: 'writeup',
		outlet: 'kairess',
		title: 'An MNIST sudoku generator built on my Python sudoku solver',
		url: 'https://github.com/kairess/mnist_sudoku_generator',
	},

	// Threads, with their comment counts when I found them
	{
		kind: 'thread',
		date: '2026-10-05',
		outlet: 'Hacker News',
		title: 'My Homelab Two Years Later, Every Upgrade and What It Cost',
		url: 'https://news.ycombinator.com/item?id=49965959',
		note: '16 comments',
	},
	{
		kind: 'thread',
		date: '2026-05-13',
		outlet: 'r/JellyfinCommunity',
		title: 'StreamRoll, custom AI pre-rolls for Jellyfin',
		url: 'https://www.reddit.com/r/JellyfinCommunity/comments/1tca5c8/i_made_a_free_oss_tool_that_generates_custom_ai/',
		note: '22 comments',
	},
	{
		kind: 'thread',
		date: '2026-05-13',
		outlet: 'r/PlexPrerolls',
		title: 'StreamRoll, custom AI pre-rolls for Plex',
		url: 'https://www.reddit.com/r/PlexPrerolls/comments/1tc8trf/i_built_a_free_opensource_tool_that_generates/',
		note: '13 comments',
	},
	{
		kind: 'thread',
		date: '2026-05-13',
		outlet: 'r/emby',
		title: 'StreamRoll, custom AI pre-rolls for Emby',
		url: 'https://www.reddit.com/r/emby/comments/1tca7co/free_tool_i_built_that_generates_custom_ai/',
		note: '9 comments',
	},
	{
		kind: 'thread',
		date: '2025-09-05',
		outlet: 'Hacker News',
		title: 'A reply in “I ditched Spotify” points to my music stack post',
		url: 'https://news.ycombinator.com/item?id=45138801',
	},
	{
		kind: 'thread',
		date: '2025-08-04',
		outlet: 'r/mcp',
		title: 'We Built an MCP Server and These Are the Gotchas Nobody Talks About',
		url: 'https://www.reddit.com/r/mcp/comments/1mhk5bw/we_built_an_mcp_server_and_these_are_the_gotchas/',
		note: '8 comments',
	},
	{
		kind: 'thread',
		date: '2025-02-25',
		outlet: 'Lemmy',
		title: 'Getting Started with Self-Hosting? recommends my homelab guide',
		url: 'https://lemmy.dbzer0.com/post/38648988',
	},
	{
		kind: 'thread',
		date: '2024-07-11',
		outlet: 'r/pihole',
		title: 'Custom domain names on your network with Nginx Proxy Manager and Pi-hole',
		url: 'https://www.reddit.com/r/pihole/comments/1e0z0em/adding_custom_domain_names_on_your_internal/',
		note: '8 comments',
	},
];

export const COVERAGE_GROUPS: { kind: CoverageKind; heading: string }[] = [
	{ kind: 'press', heading: 'Press' },
	{ kind: 'interview', heading: 'Interviews' },
	{ kind: 'newsletter', heading: 'Newsletters' },
	{ kind: 'writeup', heading: 'Written up by others' },
	{ kind: 'thread', heading: 'Threads' },
];
