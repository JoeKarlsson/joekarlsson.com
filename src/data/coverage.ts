// What other people have written about my work and built on it: research papers that cite it,
// code, courses and reading lists that use it, press, interviews, newsletters, write-ups and threads. /featured/ lists all of it; the About page's
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

export type CoverageKind =
	'press' | 'interview' | 'newsletter' | 'code' | 'course' | 'writeup' | 'reuse' | 'thread';

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

// /featured/'s share card, drawn from this file by scripts/generate-featured-card.mjs
export const SHARE_CARD = '/images/featured/share-0535b28a.webp';

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
		title: 'Low End-to-End Latency atop a Speculative Shared Log with Fix-Ante Ordering',
		venue: 'OSDI',
		year: 2025,
		url: 'https://www.usenix.org/conference/osdi25/presentation/bhat',
		cites: 'my event sourcing with Kafka post, and my real-time fraud detection post',
		reference:
			'[37] Joe Karlsson. Event sourcing with Kafka. https://www.tinybird.co/blog-posts/event-sourcing-with-kafka.',
		highlight: 'Joe Karlsson. Event sourcing with Kafka.',
	},
	{
		// The CHI 2016 extended abstracts
		title: 'Impromptu Crowd Science and the Mystery of the Bechdel-Wallace Test Movement',
		venue: 'CHI',
		year: 2016,
		url: 'https://dl.acm.org/doi/10.1145/2851581.2892580',
		cites: 'the Bechdel Test Visualizer, the project before Bechdel.io',
		reference:
			'Karlsson, L. and Karlsson, J. The Bechdel Test Visualizer. 2015. https://bechdeltest.herokuapp.com/.',
		highlight: 'Karlsson, L. and Karlsson, J. The Bechdel Test Visualizer.',
	},

	{
		title: 'Trademark Confusion After the Algorithmic Turn',
		venue: 'SMU Law Review',
		year: 2026,
		url: 'https://scholar.smu.edu/smulr/vol79/iss3/6',
		cites: 'my real-time recommendation system post and quotes it, in footnote 91',
		reference:
			'91. See Joe Karlsson, What it Takes to Build a Real-Time Recommendation System, Tinybird (Apr. 24, 2025) (“[R]eal-time recommendation systems dynamically adapt to user interactions as they happen . . . .”).',
		highlight: 'Joe Karlsson, What it Takes to Build a Real-Time Recommendation System, Tinybird',
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
		// The open copy; the sources list is the paper’s Zenodo appendix (10.5281/zenodo.10517104), which also keeps S70, the joekarlsson.com copy
		title: 'A Multivocal Mapping Study of MongoDB Smells',
		venue: 'IEEE SANER',
		year: 2024,
		url: 'https://folia.unifr.ch/documents/329705/files/Nagy_Lanza_2024_IEEE_SANER.pdf',
		cites: 'my MongoDB schema design article as a primary source, and its joekarlsson.com copy',
		reference:
			'S74,https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/',
		highlight:
			'https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/',
		context: 'then started a blog series on MongoDB Schema Design Best Practices (S74)',
	},
	{
		title: 'Case Study: Database Schema Design for Improved Performance in MongoDB',
		venue: 'IEEE ICECCME',
		year: 2023,
		url: 'https://ieeexplore.ieee.org/document/10252508',
		cites: 'my MongoDB schema design article',
		reference:
			'5. “MongoDB Schema Design Best Practices,” https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/, accessed: 2023-03-03.',
		highlight: '“MongoDB Schema Design Best Practices,”',
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
		title:
			'Secure WebSocket Based Broker and Architecture for Connecting IoT Devices and Web Based Applications',
		venue: 'IPSI Transactions',
		year: 2020,
		url: 'http://ipsitransactions.org/journals/papers/tar/2020jan/p2.pdf',
		cites: 'my complete guide to Node client-server communication',
		reference:
			'[19] J. Karlsson, ‘Complete Guide To Node Client-Server Communication’, Medium, 01-Aug-2016. [Online]. Available: https://medium.com/@joekarlsson/complete-guide-to-node-client-server-communication-b156440c029. [Accessed: 22-Oct-2019].',
		highlight: 'J. Karlsson, ‘Complete Guide To Node Client-Server Communication’',
	},

	{
		title:
			'Entwicklung einer Echtzeit-basierten Recommendation Engine auf Basis eines Stream-Processing Frameworks',
		venue: 'HS Düsseldorf thesis',
		year: 2025,
		// Names the post, not me: the reference has no author
		url: 'https://opus4.kobv.de/opus4-hs-duesseldorf/frontdoor/index/index/docId/5272',
		cites: 'my real-time recommendation system post, by title and link, in a bachelor’s thesis',
		context:
			'setzen viele Plattformen auf Stream-Processing-Technologien wie Apache Kafka und Flink [4]',
		reference:
			'[4] What it takes to build a real-time recommendation system, en. Adresse: https://www.tinybird.co/blog-posts/real-time-recommendation-system (besucht am 05. 01. 2025).',
		highlight: 'What it takes to build a real-time recommendation system',
	},
	{
		title: 'TravelMate AI',
		venue: 'UXAI',
		year: 2025,
		// UXAI 2025 proceedings (London), no DOI; ResearchGate hosts the paper
		url: 'https://www.researchgate.net/publication/401544593',
		cites: 'my real-time recommendation system post',
		context:
			'allowing the system to fine-tune the recommendation strategy during the ongoing travel experience(Karlsson, 2023)',
		reference:
			'Karlsson, J. (2023) What it takes to build a real-time recommendation system. Available at: https://www.tinybird.co/blog-posts/real-timerecommendationsystem (Accessed: 26 April 2025).',
		highlight: 'Karlsson, J. (2023) What it takes to build a real-time recommendation system.',
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
	{
		title: 'Developing An End-To-End E-Commerce Web Solution With Next.js',
		venue: 'VAMK thesis',
		year: 2023,
		url: 'https://www.theseus.fi/handle/10024/802367',
		cites: 'my MongoDB schema design article, for the data model of a Next.js shop',
		context:
			'Utilizing MongoDB in both applications enables a consistent data model and simplifies development and maintenance, ensuring efficient data management throughout the ecosystem. [21]',
		reference: '[21]:Joe Karlsson. MongoDB Schema Design Best Practices. 2022. Accessed:30.04.2023',
		highlight: 'Joe Karlsson. MongoDB Schema Design Best Practices.',
	},
	{
		title: 'Izrada web aplikacije za upravljanje kalendarom djelatnika fakulteta',
		venue: 'Pula thesis',
		year: 2023,
		url: 'https://repozitorij.unipu.hr/object/unipu:8182',
		cites:
			'my MongoDB aggregation pipeline vs SQL article, in a master’s thesis on a faculty calendar app',
		reference:
			'4. Karlsson, J. MongoDB Aggregation Pipeline Queries vs SQL Queries, 2022, Dostupno na: https://www.mongodb.com/developer/products/mongodb/sql-to-aggregation-pipeline/ (20. 8. 2023)',
		highlight: 'Karlsson, J. MongoDB Aggregation Pipeline Queries vs SQL Queries',
	},
	{
		title: 'Mobilna aplikacija za identifikaciju i njegu biljaka',
		venue: 'Pula thesis',
		year: 2022,
		url: 'https://repozitorij.unipu.hr/object/unipu:7327',
		cites: 'my MongoDB schema design article, in a master’s thesis on a plant-care app',
		reference:
			'Karlsson, J. (2022), MongoDB Schema Design Best Practices, dostupno na: https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/, [23.08.2022.]',
		highlight: 'Karlsson, J. (2022), MongoDB Schema Design Best Practices',
	},
	{
		title:
			'A Performance Comparison of SQL and NoSQL Database Management Systems for 5G Radio Base Station Configuration',
		venue: 'Linköping thesis',
		year: 2022,
		// Credits the article to MongoDB, where it ran under my byline
		url: 'https://liu.diva-portal.org/smash/record.jsf?pid=diva2:1681550',
		cites: 'my MongoDB schema design article, by link, in a master’s thesis',
		context:
			'for simpler 1-To-1 or 1-To-Many relationships embedding is often preferred, but for Many-To-Many, referencing might be the better choice to avoid duplicate data [32, 33]',
		reference:
			'[32] MongoDB. URL: https://www.mongodb.com/developer/article/mongodb-schema-design-best-practices/ (visited on 03/10/2022).',
		highlight: 'https://www.mongodb.com/developer/article/mongodb-schema-design-best-practices/',
	},
	{
		title: 'Machine Gaze on Women: How Everyday Machine-Vision-Technologies See Women in Films',
		venue: 'Springer',
		year: 2020,
		url: 'https://link.springer.com/chapter/10.1007/978-3-030-56100-0_15',
		cites:
			'the Bechdel Test Visualizer, in a chapter of Female Agencies and Subjectivities in Film and Television',
		// Springer's page refuses automated visitors; the line is from the chapter's Crossref record
		reference:
			'Karlsson, Joe. 2015. Bechdel Test Visualizer. Joe Karlsson Portfolio. https://www.joekarlsson.com/portfolio/bechdel-test-visualizer/. Accessed 15 February 2020.',
		highlight: 'Karlsson, Joe. 2015. Bechdel Test Visualizer.',
	},
	{
		// An MSc Data Science thesis at the International Hellenic University
		title: 'Music Recommendation System on a Social Media Platform Based on User Following Data',
		venue: 'IHU thesis',
		year: 2026,
		url: 'https://repository.ihu.gr/items/3e58d1da-94db-45a9-a386-fd2e90c9bd00',
		cites: 'my real-time recommendation system post',
		reference:
			'29. J. Karlsson, “What it takes to build a real-time recommendation system,” Tinybird.co, July 25, 2023. https://www.tinybird.co/blog/real-time-recommendation-system .',
		highlight: 'J. Karlsson, “What it takes to build a real-time recommendation system,”',
	},
	{
		// A CS4624 capstone final report
		title: 'Crisis Events News Coverage Analysis',
		venue: 'Virginia Tech',
		year: 2024,
		url: 'https://vtechworks.lib.vt.edu/items/60432e79-0da1-42fd-ba83-42e77eb47985',
		cites: 'my MongoDB schema design article',
		reference:
			'8. “MongoDB Schema Design Best Practices | MongoDB,” www.mongodb.com. https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/',
		highlight: '“MongoDB Schema Design Best Practices | MongoDB,”',
	},
	{
		// A bachelor’s thesis at Poltava State Agrarian University, Ukraine
		title: 'Проєктування інформаційної системи інтернет-магазину товарів для творчості',
		venue: 'Poltava thesis',
		year: 2026,
		url: 'https://dspace.pdau.edu.ua/items/0edeb853-2c81-41f4-9899-5d8841e0c7a3',
		cites: 'my MongoDB schema design article',
		reference:
			'22. MongoDB Schema Design Patterns. URL: https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/ (дата звернення: 25.04.2026).',
		highlight:
			'https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/',
	},
	{
		title:
			'Razvoj varnega komunikacijskega posrednika in učinkovite arhitekture za povezovanje interneta stvari in spletnih aplikacij',
		venue: 'Ljubljana thesis',
		year: 2019,
		// The PDF has no usable text layer; the line is copied from a render of page 83
		url: 'https://repozitorij.uni-lj.si/IzpisGradiva.php?id=109431',
		cites: 'my Node client-server communication guide, in a master’s thesis on IoT brokers',
		reference:
			'[33] J. Karlsson, “Complete Guide To Node Client-Server Communication”, Dosegljivo: https://medium.com/@joekarlsson/complete-guide-to- node-client-server-communication-b156440c029, [Dostopano: 20. 5. 2019]',
		highlight: 'J. Karlsson, “Complete Guide To Node Client-Server Communication”',
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
		kind: 'reuse',
		outlet: 'Colby Fayock',
		title: '50 Projects for React lists my React and MongoDB Stitch tutorial',
		url: 'https://github.com/colbyfayock/50-projects-for-react-and-the-static-web/tree/master/Personal%20%26%20Portfolio',
	},
	{
		kind: 'reuse',
		outlet: 'Bryan Guner',
		title: 'A data structures resource list includes my JavaScript repo',
		url: 'https://github.com/bgoonz/BGOONZ_BLOG_2.0/blob/master/src/pages/blog/data-structures-algorithms-resources.md',
	},

	// Found through Search Console's links report, 2026-11-22
	{
		kind: 'press',
		date: '2026-02-04',
		outlet: 'How-To Geek',
		title: '5 interesting things you can use your old desktop PC for',
		url: 'https://www.howtogeek.com/interesting-uses-old-desktop-pc/',
		note: 'links my homelab guide',
	},
	{
		kind: 'press',
		date: '2026-04-29',
		outlet: 'Gadget Hacks',
		title: 'Turn Google Home Mini into Home Assistant Speaker Using a Drop-In PCB',
		// Gadget Hacks refuses automated visitors; Joe opened it and checked the line by hand
		url: 'https://mods-n-hacks.gadgethacks.com/how-to/turn-google-home-mini-into-home-assistant-speaker-using-a-drop-in-pcb/',
		note: 'cites my wake-word tests',
	},
	{
		kind: 'writeup',
		date: '2026-08-31',
		outlet: 'ClickUp',
		title: 'Its guide to Claude writing skills uses my blog-writing skill as its example',
		url: 'https://clickup.com/blog/claude-skills-for-writing/',
	},
	{
		kind: 'writeup',
		date: '2026-11-10',
		outlet: 'TechUnbloated',
		title: 'Its OpenCode vs Claude Code comparison quotes my switch to OpenCode',
		url: 'https://techunbloated.com/opencode-vs-claude-code/',
	},
	{
		kind: 'newsletter',
		date: '2026-05-03',
		outlet: 'Python Hub Weekly Digest',
		title: 'Implementing MikroTik’s binary API protocol in Python',
		url: 'https://pythonhub.dev/digest/2026-05-03/',
	},
	{
		kind: 'newsletter',
		date: '2020-05-02',
		outlet: 'Weekly Thing #146',
		title: 'Jamie Thingelstad’s Minnebar notes, on my IoT kitty litter box talk',
		url: 'https://weekly.thingelstad.com/archive/146/',
	},

	// Found through Bing Webmaster Tools' backlinks and code searches, 2026-11-22
	{
		kind: 'writeup',
		date: '2020-07-28',
		outlet: 'Node.js Design Patterns, 3rd ed.',
		title: 'Mario Casciaro and Luciano Mammino’s book thanks me among the second edition’s readers',
		// Packt; the acknowledgements name me, as Google Books' search inside shows
		url: 'https://books.google.com/books?vid=ISBN9781839214110',
	},
	{
		kind: 'writeup',
		date: '2026-10-13',
		outlet: 'Trail',
		title: 'Build an MCP Server in Four Passes cites my MCP gotchas post on naming tools',
		url: 'https://trailhq.com/blog/build-an-mcp-server-in-four-passes',
	},
	{
		kind: 'writeup',
		date: '2026-10-06',
		outlet: 'Cheatgrid',
		title: 'Its DevRel program metrics cheat sheet links my Running DevRel post',
		url: 'https://cheatgrid.com/soft-skills/1423-devrel-program-metrics-strategy-and-portfolio-cheat-sheet',
	},
	{
		kind: 'writeup',
		date: '2026-09-15',
		outlet: 'Pilcrino',
		title: 'Its Claude Code blog workflow guide walks through my /blog command',
		url: 'https://pilcrino.com/blog/claude-code-blog-workflow',
	},
	{
		kind: 'writeup',
		date: '2026-08-26',
		outlet: 'SoftwareSeni',
		title: 'Cloud Versus Self-Hosted Voice AI links my local voice assistant post',
		url: 'https://softwareseni.com/cloud-versus-self-hosted-voice-ai-and-the-privacy-first-counter-current',
	},
	{
		kind: 'writeup',
		date: '2026-08-26',
		outlet: 'SoftwareSeni',
		title:
			'AI Voice Agents and the Multimodal Interface Revolution links my local voice assistant post',
		url: 'https://softwareseni.com/ai-voice-agents-and-the-multimodal-interface-revolution',
	},
	{
		kind: 'writeup',
		date: '2026-06-12',
		outlet: 'BioTeam',
		title: 'Its AWS ParallelCluster deadlines post cites my Python 3.9 Lambda deprecation guide',
		url: 'https://bioteam.net/blog/tech/cloud/your-old-aws-parallelcluster-stacks-will-not-break-in-2026',
	},
	{
		kind: 'writeup',
		date: '2026-05-05',
		outlet: 'juni (Bear Blog)',
		title: 'A personal blog’s link roundup includes my Self-Hosted Music Still Sucks post',
		url: 'https://juni-mp4.bearblog.dev/84-running-late-to-my-life/',
	},
	{
		kind: 'writeup',
		date: '2026-04-07',
		outlet: 'PADISO',
		title: 'Internal Tools with Claude Code at Scale links my skills-repo-as-internal-tooling post',
		url: 'https://padiso.co/blog/internal-tools-claude-code-scale',
	},
	{
		kind: 'writeup',
		date: '2025-06-07',
		outlet: 'IO (agentio.dev)',
		title: 'The Gateway to your Homelab opens by quoting my homelab guide',
		url: 'https://agentio.dev/posts/homelab',
	},
	{
		kind: 'writeup',
		outlet: 'Lonti',
		title: 'Facts vs. misconceptions about MongoDB quotes me on what NoSQL covers',
		url: 'https://www.lonti.com/blog/facts-vs-misconceptions-about-mongodb',
	},
	{
		kind: 'writeup',
		outlet: 'indiegrp',
		title: 'A home server how-to sends readers to my homelab guide for hardware and budget',
		url: 'https://indiegrp.com/articles/set-up-your-own-home-server-from-scratch-a-complete-how-to-guide',
	},
	{
		kind: 'code',
		date: '2019-01-18',
		outlet: '20Percent (gfitez)',
		title: 'A student project modifies my Python Sudoku generator to make its boards, and says so',
		url: 'https://github.com/gfitez/20Percent',
	},
	{
		kind: 'code',
		date: '2024-01-04',
		outlet: 'SchoolProjects (hudakj)',
		title: 'A school Sudoku notebook credits my Python Sudoku generator for its cell methods',
		url: 'https://github.com/hudakj/SchoolProjects/blob/master/SudokuFinal.ipynb',
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
		date: '2026',
		outlet: 'r/homelabindia',
		title: 'A thread from someone new to homelabbing links my work',
		url: 'https://www.reddit.com/r/homelabindia/comments/1wp54on/help_new_to_homelab/',
	},
	{
		kind: 'thread',
		date: '2026',
		outlet: 'r/selfhosted',
		title:
			'A reply in a thread on self-hosting an existing music library points to my self-hosted music post',
		url: 'https://www.reddit.com/r/selfhosted/comments/1vicy8c/help_with_selfhosting_an_existing_music/',
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
		date: '2025',
		outlet: 'r/Kotlin',
		title: 'A thread in r/Kotlin links my work',
		url: 'https://www.reddit.com/r/Kotlin/comments/1ku3d2v/i_cant_deal_with_my_sisters_cats_anymoreshe_has_4/',
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
		date: '2024',
		outlet: 'r/selfhosted',
		title: 'A thread on the Homepage dashboard not working behind Nginx links my work',
		url: 'https://www.reddit.com/r/selfhosted/comments/1e680fi/homepage_not_working_behind_nginx_please_help/',
	},
	{
		kind: 'thread',
		date: '2024-07-11',
		outlet: 'r/pihole',
		title: 'Custom domain names on your network with Nginx Proxy Manager and Pi-hole',
		url: 'https://www.reddit.com/r/pihole/comments/1e0z0em/adding_custom_domain_names_on_your_internal/',
		note: '8 comments',
	},
	{
		kind: 'thread',
		date: '2024',
		outlet: 'r/homelab',
		title: 'A thread on what to run on a secondhand EliteDesk 800 links my work',
		url: 'https://www.reddit.com/r/homelab/comments/1cjpxrr/stumbled_into_an_elitedesk_800_unsure_what_the/',
	},
	{
		kind: 'thread',
		date: '2021',
		outlet: 'r/mongodb',
		title: 'A thread on joining three collections in MongoDB links my work',
		url: 'https://www.reddit.com/r/mongodb/comments/ote2ah/need_help_in_joining_3_collections_foreign_key_in/',
	},

	// Found through links to my old addresses and employer bylines, and my analytics' referrers
	{
		kind: 'newsletter',
		date: '2025-06-17',
		outlet: 'ClickHouse newsletter',
		title:
			'ClickHouse’s June 2025 newsletter named me its featured community member and wrote up my CloudQuery full-text search post',
		url: 'https://clickhouse.com/blog/202506-newsletter',
	},
	{
		kind: 'newsletter',
		date: '2025-05-12',
		outlet: 'ClickHouse newsletter',
		title:
			'ClickHouse’s May 2025 newsletter summarizes my billion-row insert post (co-written with Mariano Gappa)',
		url: 'https://clickhouse.com/blog/202505-newsletter',
	},
	{
		kind: 'newsletter',
		date: '2025-04-16',
		outlet: 'ClickHouse newsletter',
		title:
			'ClickHouse’s April 2025 newsletter summarizes my Six Months with ClickHouse at CloudQuery post',
		url: 'https://clickhouse.com/blog/202504-newsletter',
	},
	{
		kind: 'writeup',
		date: '2026-08-26',
		outlet: 'Kevin Simback',
		title:
			'His guide to becoming an AI-native company uses my skills-repo post as one of its case studies',
		url: 'https://kevinsimback.com/writing/becoming-an-ai-native-company-start-with-shared-skills/',
	},
	{
		kind: 'writeup',
		date: '2026-05-09',
		outlet: 'Parallel Content',
		title:
			'Their developer marketing channels guide cites the traffic and signup numbers from my Running DevRel post',
		url: 'https://parallelcontent.ai/blog/developer-marketing-channels',
	},
	{
		kind: 'writeup',
		date: '2026-01-24',
		outlet: 'Mo Explains (formerly Everyday AI Blog)',
		title:
			'Their Claude Code for non-coders guide links my Claude Code blog skill post as the example of a custom writing skill',
		url: 'https://moexplains.com/claude-code-for-non-coders/',
	},
	{
		kind: 'writeup',
		date: '2026-01-06',
		outlet: 'Hubwiz',
		title: 'Hubwiz translated my Claude Code blog skill post into Chinese and links the original',
		url: 'https://www.hubwiz.com/blog/write-blogs-with-claude-skills/',
	},
	{
		kind: 'reuse',
		date: '2026-09-27',
		outlet: 'Songarr (TheMrAnderson)',
		title:
			'Songarr, a track-level music downloader, says my Self-Hosted Music Still Sucks post gave it both the idea and the name',
		url: 'https://github.com/TheMrAnderson/songarr',
	},
	{
		kind: 'writeup',
		date: '2023-06-13',
		outlet: 'Michael Truong (Medium)',
		title:
			'His Mongoose schema post quotes my MongoDB Schema Design Best Practices rule to decide whether to embed',
		url: 'https://medium.com/@truong.minh.michael/when-to-use-embedded-vs-reference-schema-in-mongoose-and-when-to-use-single-reference-vs-reference-36b757acab7e',
	},
	{
		kind: 'writeup',
		date: '2024-06-13',
		outlet: 'AdminCafe',
		title: 'A German homelab blog shared my homelab server guide with an excerpt and a link back',
		url: 'https://admincafe.de/archive/18143',
	},
	{
		kind: 'writeup',
		date: '2025-10-10',
		outlet: 'Malabar Matrix',
		title: 'Their home server networking post lists my homelab guide in its references',
		url: 'https://malabarmatrix.in/blog/02-self-hosting-network-architecture-from-scratch/',
	},
	{
		kind: 'writeup',
		date: '2026-06-06',
		outlet: 'Airi Pham',
		title: 'Her Building a Homelab Server post links my homelab guide first in its links',
		url: 'https://shaderw1tch.github.io/PhuongPham7112.github.io/2026/06/06/homelab-server/',
	},
	{
		kind: 'writeup',
		date: '2020-04-03',
		outlet: 'DJ Graham',
		title: 'He drew a sketchnote of my Building High Performance React Applications talk',
		url: 'https://deejaygraham.github.io/2020/04/03/high-performance-react-sketchnote/',
	},
	{
		kind: 'writeup',
		date: '2025',
		outlet: 'Deepak Sood (Deep Notes)',
		title: 'His ClickHouse notes list my CloudQuery ClickHouse posts under Advanced ClickHouse',
		url: 'https://deepaksood619.github.io/data-warehouses/clickhouse/intro',
	},
	{
		kind: 'writeup',
		date: '2026',
		outlet: 'pineman',
		title: 'His links page saves my CloudQuery full-text search post',
		url: 'https://pineman.github.io/links',
	},
	{
		kind: 'writeup',
		date: '2024-02-20',
		outlet: 'Matt Peyton',
		title: 'His bookmarks page saves my homelab server guide',
		url: 'https://github.com/MTPeyton/MTPeyton.github.io/blob/master/public/bookmarks/index.html',
	},
	{
		kind: 'course',
		date: '2024-01-08',
		outlet: 'General Assembly curriculum',
		title:
			'General Assembly’s MEN stack embedding lesson lists my MongoDB schema design post as its reference',
		url: 'https://github.com/ga-curriculum/men-stack-embedding-related-data-skyrockit/blob/main/references/README.md',
	},
	{
		kind: 'course',
		date: '2021-11-09',
		outlet: 'Re:Coded bootcamp curriculum',
		title:
			'Re:Coded’s backend bootcamp reading on schema design sends students to my MongoDB schema design post',
		url: 'https://github.com/ReCoded-Org/curriculum-backend-readings/blob/main/module3-crud-and-data-models/r1.2-principles-of-setting-up-your-schema/README.md',
	},
	{
		kind: 'course',
		date: '2024-05-05',
		outlet: 'RMIT COSC3060 course materials',
		title:
			'An RMIT web programming course’s schema design examples reuse the sample documents from my MongoDB schema design post',
		url: 'https://github.com/TomHuynhSG/COSC3060-Web-Programming-Studio-Materials/blob/main/mongodb%20%26%20mongoose/lecture/schema-design-examples/one-to-few/index.js',
	},
	{
		kind: 'course',
		date: '2024-08-09',
		outlet: 'OTUS Node.js course',
		title:
			'OTUS’s advanced MongoDB lesson builds its schema examples from the sample documents in my schema design post',
		url: 'https://github.com/OtusTeam/node/blob/main/2023-11/11%20-%20mongodb-advanced/src/shema-basics/one-to-one.js',
	},
	{
		kind: 'course',
		date: '2022-09-26',
		outlet: 'ICT50120 SaaS course (AdyGCode)',
		title: 'An Australian Diploma of IT course’s link list includes my MongoDB schema design post',
		url: 'https://github.com/AdyGCode/ICT50120-SaaS-Library/blob/main/_docs/ReadMe-99-Links.md',
	},
	{
		kind: 'course',
		date: '2018-07-09',
		outlet: 'NYCDA class notes',
		title: 'A New York Code + Design Academy class reading list links my data-structures repo',
		url: 'https://github.com/dpatlut/NYCDA-WDF-June18/blob/master/w04/d01/reading.md',
	},
	{
		kind: 'course',
		date: '2021-07-21',
		outlet: 'NxtWave Spotify Remix project',
		title:
			'NxtWave’s Spotify Remix course project tells students to follow my Spotify player tutorial to register their app',
		url: 'https://github.com/arunmacs/spotify-remix-react-v2.2/blob/main/README.md',
	},
	{
		kind: 'course',
		date: '2019-11-18',
		outlet: 'UW INFO 340 student project',
		title:
			'A University of Washington INFO 340 project credits my Spotify player tutorial for its auth code',
		url: 'https://github.com/info340b-au19/SpotGen/blob/master/src/Helper.js',
	},
	{
		kind: 'reuse',
		outlet: 'backend-cheats (cheatsnake)',
		title:
			'A 5,000-star backend developer handbook links my MongoDB schema design post as its MongoDB best practices',
		url: 'https://github.com/cheatsnake/backend-cheats',
	},
	{
		kind: 'reuse',
		outlet: 'programing-best-practices (dereknguyen269)',
		title: 'An awesome list of programming best practices links my MongoDB schema design post',
		url: 'https://github.com/dereknguyen269/programing-best-practices/blob/master/docs/database.md',
	},
	{
		kind: 'reuse',
		date: '2025-09-19',
		outlet: 'Platform Engineering Playbook',
		title:
			'The Platform Engineering Playbook’s MongoDB page lists my schema design post under specialized guides',
		url: 'https://github.com/vibesre/Platform-Engineering-Playbook/blob/main/docs/technical/mongodb.md',
	},
	{
		kind: 'reuse',
		date: '2026-06-22',
		outlet: 'Database design workshop (Faisal-Sey)',
		title:
			'A database design webinar’s further reading calls my MongoDB schema design post the guide to embedding vs referencing',
		url: 'https://github.com/Faisal-Sey/database-design-workshop/blob/main/resources/further-reading.md',
	},
	{
		kind: 'reuse',
		date: '2024-03-28',
		outlet: 'Agile Learning Institute mongoSchemaManager',
		title: 'A MongoDB schema manager’s README opens by citing my schema design post',
		url: 'https://github.com/agile-learning-institute/mongoSchemaManager',
	},
	{
		kind: 'reuse',
		date: '2022-04-10',
		outlet: 'Nikita Voloboev’s knowledge wiki',
		title:
			'Nikita Voloboev’s knowledge wiki lists my data-structures repo among data structures resources',
		url: 'https://github.com/past-nikiv/knowledge/blob/main/docs/computer-science/data-structures/data-structures.md',
	},
	{
		kind: 'reuse',
		date: '2020-04-12',
		outlet: 'card-game-generator (ITenthusiasm)',
		title:
			'A card game project’s notes recommend my Node client-server communication guide for WebSockets',
		url: 'https://github.com/ITenthusiasm/card-game-generator/blob/master/NOTES.md',
	},
	{
		kind: 'reuse',
		date: '2021-01-22',
		outlet: 'Pixelify (Vong3432)',
		title: 'Pixelify, an image pixelation app, links my pixelate-images tutorial from its nav bar',
		url: 'https://github.com/Vong3432/pixelify/blob/main/components/includes/Navbar.tsx',
	},
	{
		kind: 'code',
		date: '2018-01-23',
		outlet: 'OpenCV-Sudoku (patrick-gao)',
		title: 'A computer-vision Sudoku game builds its board generator on my Python Sudoku generator',
		url: 'https://github.com/patrick-gao/OpenCV-Sudoku/blob/master/sudokuGenerator.py',
	},
	{
		kind: 'code',
		date: '2017-08-01',
		outlet: 'PySudoku (prangongh)',
		title: 'A Flask Sudoku game generates its puzzles with my Python Sudoku generator',
		url: 'https://github.com/prangongh/PySudoku/blob/master/webserver.py',
	},
	{
		kind: 'code',
		date: '2018-10-16',
		outlet: 'mnist_sudoku_generator (kairess)',
		title: 'An MNIST sudoku generator makes its puzzles with my Python Sudoku generator',
		url: 'https://github.com/kairess/mnist_sudoku_generator',
	},
	{
		kind: 'code',
		date: '2025-02-10',
		outlet: 'Timewise (AD-Archer)',
		title: 'A mental health app’s music player thanks my React Spotify player for its code',
		url: 'https://github.com/AD-Archer/Timewise/blob/master/src/app/components/Music/SpotifyPlayer.tsx',
	},
	{
		kind: 'code',
		date: '2019-10-28',
		outlet: 'branch.out (ReadySetJoe)',
		title: 'A concert finder credits my React Spotify player in its footer',
		url: 'https://github.com/ReadySetJoe/branch-out/blob/master/frontend/static/src/App.js',
	},
	{
		kind: 'code',
		date: '2020-08-26',
		outlet: 'IEEE ITBA student branch',
		title: 'The website of ITBA’s IEEE student branch depends on my angular-instafeed package',
		url: 'https://github.com/ieee-itba-sb-it/IEEE-ITBA-website/blob/master/package.json',
		note: 'one of 15 dependents',
	},
	{
		kind: 'code',
		date: '2026-10-06',
		outlet: 'simple_prompter (simple-eiffel)',
		title:
			'A voice-following teleprompter for Windows lists my Followspot as prior art, down to its settings',
		url: 'https://github.com/simple-eiffel/simple_prompter/blob/main/.eiffel-workflow/research/REFERENCES.md',
	},
	{
		kind: 'thread',
		date: '2024-03-27',
		outlet: 'Stack Overflow (aneroid)',
		title:
			'A Stack Overflow answer on blocked users in a $lookup pipeline links the embedding-vs-referencing section of my MongoDB schema design post',
		url: 'https://stackoverflow.com/a/78229616',
	},
	{
		kind: 'thread',
		date: '2022-12-09',
		outlet: 'Stack Overflow (Ronnie Smith)',
		title: 'A Stack Overflow answer links my MongoDB schema design post',
		url: 'https://stackoverflow.com/a/74738491',
	},
	{
		kind: 'thread',
		date: '2022-02-17',
		outlet: 'Stack Overflow (sigrid)',
		title:
			'A Stack Overflow answer on double relationships between documents links my MongoDB schema design post',
		url: 'https://stackoverflow.com/a/71151842',
	},
	{
		kind: 'thread',
		date: '2021-05-28',
		outlet: 'Stack Overflow',
		title:
			'A Stack Overflow question on modeling a clothing catalog starts from my MongoDB schema design post',
		url: 'https://stackoverflow.com/q/67741010',
	},
	{
		kind: 'thread',
		date: '2021-02-15',
		outlet: 'Stack Overflow',
		title:
			'A Stack Overflow question works through my MongoDB CSFLE with Node.js guide step by step',
		url: 'https://stackoverflow.com/q/66202474',
	},
	{
		kind: 'thread',
		date: '2025-05-14',
		outlet: 'Hacker News (markhneedham)',
		title:
			'ClickHouse’s Mark Needham submitted my billion-row ClickHouse inserts post to Hacker News',
		url: 'https://news.ycombinator.com/item?id=43982292',
	},
	{
		kind: 'thread',
		date: '2026-04-26',
		outlet: 'Hacker News (mooreds)',
		title: 'Dan Moore submitted my Running DevRel in 2026 post to Hacker News',
		url: 'https://news.ycombinator.com/item?id=47909862',
	},
	{
		kind: 'thread',
		date: '2026-04-20',
		outlet: 'Hacker News (swq115)',
		title: 'A reader submitted my MikroTik binary API post to Hacker News',
		url: 'https://news.ycombinator.com/item?id=47833052',
	},
	{
		kind: 'thread',
		date: '2017-01-30',
		outlet: 'Hacker News (n0strom0)',
		title: 'A reader submitted my I Ran My First Hackathon post to Hacker News',
		url: 'https://news.ycombinator.com/item?id=13525366',
	},
	{
		kind: 'writeup',
		date: '2026-10-29',
		outlet: 'postby.ai',
		title: 'A teardown walks through my weekly SEO audit in Claude Code, step by step',
		url: 'https://postby.ai/teardowns/joe-karlsson-weekly-seo-audit/',
	},
	{
		kind: 'writeup',
		date: '2025',
		outlet: 'ZenML LLMOps Database',
		title: 'An LLMOps case-study database summarizes my CloudQuery post on building an MCP server',
		url: 'https://www.zenml.io/llmops-database/building-and-operating-an-mcp-server-for-llm-powered-cloud-infrastructure-queries',
	},
	{
		kind: 'writeup',
		outlet: 'hudi.blog',
		title:
			'A Korean post on database partitioning and sharding builds on my sharding vs. partitioning explainer',
		url: 'https://hudi.blog/db-partitioning-and-sharding/',
	},
	{
		kind: 'thread',
		date: '2026-04-06',
		outlet: 'Bluesky (goose.art)',
		title:
			'“Great article about the pain of self hosting your music collection”: a thread on my self-hosted music post',
		url: 'https://bsky.app/profile/goose.art/post/3miu23igfz22e',
		note: '5 replies',
	},
	{
		kind: 'thread',
		date: '2025-09-03',
		outlet: 'Bluesky (stpauligrrrl)',
		title: 'A State Fair crop art photo thread credits my von Trapp crop art piece',
		url: 'https://bsky.app/profile/stpauligrrrl.bsky.social/post/3lxwxi6mwpc2e',
	},
	{
		kind: 'reuse',
		date: '2026-04-27',
		outlet: '云云众生s (rocksun)',
		title: 'A Chinese translation of my New Stack post on multi-cloud blind spots',
		url: 'https://github.com/rocksun/mwblog/blob/HEAD/coding/multi-cloud-blind-spots/multi-cloud-blind-spots.md',
	},
	{
		kind: 'reuse',
		date: '2026-04-30',
		outlet: '云云众生s (rocksun)',
		title:
			'A Chinese translation of my New Stack post on why Terraform is green when your cloud is broken',
		url: 'https://github.com/rocksun/mwblog/blob/HEAD/cloudnative/terraform-state-infrastructure-drift/terraform-state-infrastructure-drift.md',
	},
	{
		kind: 'reuse',
		date: '2023-12-29',
		outlet: 'NestJS boilerplate (Brocoders)',
		title:
			'A NestJS starter with 4,400 stars recommends my MongoDB schema design article in its database docs',
		url: 'https://github.com/brocoders/nestjs-boilerplate/blob/HEAD/docs/database.md',
	},
	{
		kind: 'reuse',
		date: '2021',
		outlet: 'Interview-Science Book',
		title: 'A Chinese system design interview book links my sharding vs. partitioning explainer',
		url: 'https://github.com/Interview-Science/Book/blob/main/docs/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E8%AE%A1/%E5%BA%94%E7%94%A8%E6%A8%A1%E5%BC%8F.md',
	},
	{
		kind: 'reuse',
		date: '2022',
		outlet: 'CS-study',
		title: 'A Korean CS interview handbook links my sharding vs. partitioning explainer',
		url: 'https://github.com/CS-studi/CS-study/blob/master/CS/Database/ClusteringReplicationShardingPartitioning.md',
	},
	{
		kind: 'reuse',
		date: '2022',
		outlet: 'harryji168 Resources',
		title: 'An HTTP resources list recommends my complete guide to client-server communication',
		url: 'https://github.com/harryji168/Resources/blob/HEAD/HTTP-Protocol-resources.md',
	},
	{
		kind: 'reuse',
		date: '2018',
		outlet: 'coding-tips-tricks-resources',
		title: 'A web workers study guide links my live-coded web workers demo',
		url: 'https://github.com/philipstubbs13/coding-tips-tricks-resources/blob/HEAD/web_workers.md',
	},
	{
		kind: 'reuse',
		date: '2024',
		outlet: 'Nikita Voloboev’s knowledge wiki',
		title: 'His Tinybird page links my Tinybird live-coding video and code',
		url: 'https://github.com/past-nikiv/knowledge/blob/HEAD/docs/analytics/tinybird.md',
	},
	{
		kind: 'reuse',
		outlet: 'rmendes.net',
		title: 'Ricardo Mendes lists my blog in his blogroll',
		url: 'https://rmendes.net/blogroll/',
	},
	{
		kind: 'course',
		date: '2023-10-19',
		outlet: 'TWA Agile Full Stack Bootcamp 2022',
		title:
			'The bootcamp’s MongoDB for Dev module teaches schema design from my article, examples included',
		url: 'https://github.com/TWA-Agile-Full-Stack-Bootcamp-2022/MongoDB-For-Dev',
	},
	{
		kind: 'course',
		date: '2025',
		outlet: 'Bases de Datos 2 (Curso_BD2)',
		title:
			'A Colombian database course cites my MongoDB schema design article in its module 1 references',
		url: 'https://github.com/gisellopez1020/Curso_BD2/blob/HEAD/docs/05-Referencias/05-Referencias-Modulo-1.md',
	},
	{
		kind: 'course',
		date: '2024',
		outlet: 'GIS WS24 course (heintz-s)',
		title: 'A German GIS course’s MongoDB reading list links my schema design article',
		url: 'https://heintz-s.github.io/GIS-WS24/db/linksammlung/',
	},
	{
		kind: 'course',
		date: '2026',
		outlet: 'Bootcamp MongoDB CE (ergrato-dev)',
		title:
			'A 24-week Spanish MongoDB bootcamp assigns my schema design article in three weeks’ resources',
		url: 'https://github.com/ergrato-dev/bc-mongodb-ce/blob/HEAD/bootcamp/week-07-indices_basicos_y_explain/4-recursos/README.md',
	},
	{
		kind: 'code',
		date: '2023-08-17',
		outlet: 'General Assembly SEI45 project',
		title:
			'A General Assembly class project designs its MongoDB models from my schema design article',
		url: 'https://github.com/abigail-143/sei45-project3-BetterTimeBeerTime',
	},
	{
		kind: 'code',
		date: '2022-12-20',
		outlet: 'codestates WBABEProject-22',
		title:
			'A Korean bootcamp’s Go ordering system cites my schema design article for its review model',
		url: 'https://github.com/codestates/WBABEProject-22/blob/HEAD/model/review.go',
	},
	{
		kind: 'code',
		date: '2020-12-01',
		outlet: 'ACE for Sarcasm Detection (Babanejad et al.)',
		title: 'The code for the COLING sarcasm paper builds its movie-script dataset with my scraper',
		url: 'https://github.com/NastaranBa/ACE-for-Sarcasm-Detection',
	},
	{
		kind: 'code',
		date: '2020-06-26',
		outlet: 'word-trends (Hack-Your-Own-Holmes)',
		title: 'A word-trends project scrapes its movie scripts with my movie-script-scraper',
		url: 'https://github.com/Hack-Your-Own-Holmes/word-trends',
	},
	{
		kind: 'code',
		date: '2020-04-30',
		outlet: 'Spotify-Web-Player (kevin51jiang)',
		title: 'A Spotify web player “based off of” my React Spotify player tutorial',
		url: 'https://github.com/kevin51jiang/Spotify-Web-Player',
	},
	{
		kind: 'code',
		date: '2019-11-20',
		outlet: 'Spotify-Analytics (Sieg-Alejandro)',
		title: 'A Spotify analytics app built on my react-spotify-player',
		url: 'https://github.com/Sieg-Alejandro/Spotify-Analytics',
	},
	{
		kind: 'code',
		date: '2023-02-21',
		outlet: 'spotify-player (aryndavis)',
		title: 'A Spotify player scaffolded from my react-spotify-player',
		url: 'https://github.com/aryndavis/spotify-player',
	},
	{
		kind: 'code',
		date: '2022-02-13',
		outlet: 'playlist-musher (shoehair)',
		title: 'A playlist mixer that starts from my React Spotify code',
		url: 'https://github.com/shoehair/playlist-musher',
	},
	{
		kind: 'code',
		date: '2020-12-06',
		outlet: 'musical-lookbooks (namanagar)',
		title: 'A music lookbook app based on my react-spotify-player',
		url: 'https://github.com/namanagar/musical-lookbooks',
	},
	{
		kind: 'code',
		date: '2021-04-21',
		outlet: 'spotify-playback-sdk (tsukamil)',
		title: 'A Spotify playback SDK demo built from my React Spotify player',
		url: 'https://github.com/tsukamil/spotify-playback-sdk',
	},
	{
		kind: 'code',
		date: '2021-11-17',
		outlet: 'vue-spotify-player (jotaesteves)',
		title: 'A Vue port of my React Spotify player',
		url: 'https://github.com/jotaesteves/vue-spotify-player',
	},
	{
		kind: 'code',
		date: '2020-03-22',
		outlet: 'spotify-audio-feature-analysis (Hadryan)',
		title: 'A Spotify audio-feature analysis app that credits my react-spotify-player',
		url: 'https://github.com/Hadryan/spotify-audio-feature-analysis-react-app',
	},
	{
		kind: 'code',
		date: '2019-02-07',
		outlet: 'Juke (CBernsCode)',
		title: 'A jukebox app whose player follows my React Spotify player tutorial',
		url: 'https://github.com/CBernsCode/Juke/blob/HEAD/src/components/Player.js',
	},
	{
		kind: 'code',
		date: '2021-01-02',
		outlet: 'spotify-listen-along-nextjs (tytysam)',
		title: 'A listen-along Next.js app whose Spotify sign-in follows my tutorial',
		url: 'https://github.com/tytysam/spotify-listen-along-nextjs/blob/HEAD/server/authorization.js',
	},
	{
		kind: 'code',
		date: '2022-06-19',
		outlet: 'spotify-game (linakaval)',
		title: 'A Spotify game built on my React Spotify player',
		url: 'https://github.com/linakaval/spotify-game',
	},
	{
		kind: 'code',
		date: '2017-03-21',
		outlet: 'PythonSudoku (ashwinGokhale)',
		title: 'A Python Sudoku game generates its boards with my Sudoku generator',
		url: 'https://github.com/ashwinGokhale/PythonSudoku',
	},
	{
		kind: 'code',
		date: '2020-03-31',
		outlet: 'Angular_8_Instagram_Api (theduodecim)',
		title: 'An Angular 8 Instagram feed updated from my instafeed-2.0',
		url: 'https://github.com/theduodecim/Angular_8_Instagram_Api',
	},
	{
		kind: 'code',
		date: '2017-09-08',
		outlet: 'sequelize-demo (mstop4)',
		title: 'A Sequelize demo that follows my Sequelize cheat sheet',
		url: 'https://github.com/mstop4/sequelize-demo',
	},
	{
		kind: 'code',
		date: '2022-11-13',
		outlet: 'crm (denisjacquemin)',
		title: 'A CRM’s MongoDB notes are “inspired by” my schema design article, rules and all',
		url: 'https://github.com/denisjacquemin/crm/blob/HEAD/src/services/lib/mongo.md',
	},
];

// /featured/'s Cited in research, newest first. The sort is stable, so within a year the order
// above holds; About keeps the first three of `papers` as written
export const papersNewestFirst = papers.toSorted((a, b) => b.year - a.year);

// One kind's entries, newest first, undated last: the order /featured/ lists them in
export const coverageOf = (kind: CoverageKind) =>
	coverage
		.filter((entry) => entry.kind === kind)
		.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

// /featured/'s Built on my work section, right under the papers (DECISIONS.md 2026-11-22)
export const BUILT_ON_GROUPS: { kind: CoverageKind; heading: string }[] = [
	{ kind: 'code', heading: 'Code' },
	{ kind: 'course', heading: 'Taught in courses' },
	{ kind: 'reuse', heading: 'Recommended' },
];

export const COVERAGE_GROUPS: { kind: CoverageKind; heading: string }[] = [
	{ kind: 'press', heading: 'Press' },
	{ kind: 'interview', heading: 'Interviews' },
	{ kind: 'newsletter', heading: 'Newsletters' },
	{ kind: 'writeup', heading: 'Written up by others' },
	{ kind: 'thread', heading: 'Threads' },
];
