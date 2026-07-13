/**
 * Shared terminal utilities and command handlers
 * Used by both the homepage and 404 page terminals
 */

export interface TerminalConfig {
	variant: 'homepage' | '404';
	prompt: string;
	pages: Record<string, string>;
}

export interface CommandResult {
	lines: string[];
	action?: 'navigate' | 'clear' | 'matrix' | 'fake-delete';
	navigateTo?: string;
}

// Pages available for navigation
export const defaultPages: Record<string, string> = {
	home: '/',
	blog: '/blog',
	about: '/about',
	work: '/work',
	contact: '/contact',
	uses: '/uses',
	'talk-archive': '/talk-archive',
};

// All commands for tab completion
export const allCommands = [
	'help',
	'ls',
	'cd',
	'goto',
	'whoami',
	'cat',
	'uptime',
	'neofetch',
	'clear',
	'exit',
	'pwd',
	'hi',
	'hello',
	'hey',
	'coffee',
	'beer',
	'ping',
	'ssh',
	'hack',
	'matrix',
	'42',
	'fortune',
	'cowsay',
	'man',
	'xkcd',
	'rickroll',
	'rick',
	'docker',
	'npm',
	'yarn',
	'pnpm',
	'python',
	'node',
	'ruby',
	'make',
	'top',
	'htop',
	'ps',
	'nvidia-smi',
	'git',
	'echo',
	'sl',
	'please',
	'thanks',
	'nmap',
	'telnet',
	'traceroute',
];

// Cat files for tab completion
export const catFiles = [
	'about.md',
	'about',
	'work.md',
	'work',
	'readme',
	'music',
	'fails',
	'blog/iot',
	'blog/homelab',
	'cat',
];

// --- Utility functions ---

export function escapeHtml(str: string): string {
	const div = document.createElement('div');
	div.textContent = str;
	return div.innerHTML;
}

export function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

// --- Command handlers ---

export function cmdHelp(variant: 'homepage' | '404'): string[] {
	const baseHelp = [
		'<span class="text-yellow">Available commands:</span>',
		'',
		'  <span class="text-coral">help</span>         show this message',
		'  <span class="text-coral">ls</span>           list site pages',
		'  <span class="text-coral">cd</span> &lt;page&gt;    navigate to a page',
		'  <span class="text-coral">whoami</span>       who is this',
		'  <span class="text-coral">cat</span>          list available files',
		'  <span class="text-coral">cat about.md</span> about me',
		'  <span class="text-coral">cat work.md</span>  things I\'ve built',
		'  <span class="text-coral">cat readme</span>   read about this site',
		'  <span class="text-coral">neofetch</span>     system info',
		'  <span class="text-coral">uptime</span>       system uptime',
		'  <span class="text-coral">hack</span>         ???',
		'  <span class="text-coral">clear</span>        clear terminal',
		'',
	];

	if (variant === 'homepage') {
		// Insert extra commands before 'clear'
		const extraCmds = [
			'  <span class="text-coral">cat music</span>    current favorite albums',
			'  <span class="text-coral">cat fails</span>    project failures hall of fame',
			'  <span class="text-coral">cat blog/</span>    preview a blog post',
			'  <span class="text-coral">fortune</span>      random dev hot take',
			'  <span class="text-coral">cowsay</span>       moo',
			'  <span class="text-coral">man joe</span>      read the manual',
		];
		const clearIndex = baseHelp.findIndex((l) => l.includes('clear'));
		return [...baseHelp.slice(0, clearIndex), ...extraCmds, ...baseHelp.slice(clearIndex)];
	}
	return baseHelp;
}

export function cmdLs(args: string, pages: Record<string, string>): string[] {
	const entries = Object.keys(pages).map((p) => `  <span class="text-teal">${p}/</span>`);
	if (args.includes('-a') || args.includes('-la') || args.includes('-al')) {
		return [
			'<span class="text-dim">drwxr-xr-x  joe  staff</span>',
			'  <span class="text-dim">.secrets/</span>     <span class="text-coral">[REDACTED]</span>',
			'  <span class="text-dim">.env</span>          <span class="text-coral">[NICE TRY]</span>',
			'  <span class="text-dim">.ssh/</span>         <span class="text-coral">[NOPE]</span>',
			...entries,
			'',
		];
	}
	return ['<span class="text-dim">drwxr-xr-x  joe  staff</span>', ...entries, ''];
}

export function cmdCd(
	args: string,
	pages: Record<string, string>,
): { lines: string[]; navigateTo?: string } {
	const target = args.trim().replace(/^\//, '').replace(/\/$/, '');
	if (!target) return { lines: ['<span class="text-dim">usage: cd &lt;page&gt;</span>', ''] };
	if (target === '~' || target === '/') {
		return { lines: ['Navigating to home...'], navigateTo: '/' };
	}
	const url = pages[target];
	if (url) {
		return { lines: [`Navigating to /${target}...`], navigateTo: url };
	}
	return {
		lines: [
			`<span class="text-coral">cd: no such page: ${target}</span>`,
			`<span class="text-dim">try 'ls' to see available pages</span>`,
			'',
		],
	};
}

export function cmdWhoami(): string[] {
	return ['<span class="text-teal">joe-karlsson</span> - developer marketing engineer', ''];
}

export function cmdCatAbout(): string[] {
	return [
		'',
		'  <span class="text-yellow">## about.md</span>',
		'',
		'  Hey, I\'m <span class="text-coral">Joe Karlsson</span>.',
		'  Engineer who does developer marketing.',
		'',
		'  I help developers build cool stuff - through demos,',
		'  blog posts, talks, videos, whatever works. Currently',
		'  doing that at <span class="text-white">CData</span>, on the MCP',
		'  platform that wires AI agents to enterprise data.',
		'',
		'  Outside of work I run a <span class="text-teal">40+ container homelab</span>,',
		'  watch way too many movies, and build things that',
		"  probably shouldn't be connected to the internet.",
		'',
		'  I once built an IoT cat toilet and gave a conference',
		'  talk about it. Also a <span class="text-white">TEDx speaker</span>. I contain',
		'  multitudes.',
		'',
	];
}

export function cmdCatWork(): string[] {
	return [
		'',
		'  <span class="text-yellow">## work.md</span>',
		'',
		'  <span class="text-coral">IoT Smart Litter Box</span>',
		'  Built an internet-connected cat toilet. Gave a',
		'  <span class="text-white">TEDx talk</span> about it. Yes, really.',
		'',
		'  <span class="text-coral">40+ Container Homelab</span>',
		'  Proxmox cluster, dual GPUs, Home Assistant,',
		'  media automation, monitoring - the works.',
		'',
		'  <span class="text-coral">Developer Marketing</span>',
		'  Spoken at hundreds of conferences. Built demos,',
		'  docs, and tools at CData, CloudQuery, Tinybird,',
		'  SingleStore, and MongoDB.',
		'',
		'  <span class="text-dim">See everything → <span class="text-teal">cd work</span></span>',
		'',
	];
}

export function cmdCatReadme(variant: 'homepage' | '404'): string[] {
	const base = [
		'<span class="text-yellow">README.md</span>',
		'',
		'  Welcome to joekarlsson.com!',
		'',
		'  This site is where I write about software engineering,',
		'  developer marketing, homelabs, IoT cat litter boxes,',
		"  and whatever else I'm nerding out about.",
		'',
		'  Built with Astro. Powered by coffee and stubbornness.',
	];

	if (variant === '404') {
		return [
			...base,
			'',
			"  You found the 404 page, which means you're either",
			'  lost or curious. Either way, I respect it.',
			'',
			'  <span class="text-dim">Type \'ls\' to see where you can go.</span>',
			'',
		];
	}
	return [...base, '  <span class="text-dim">Type \'ls\' to see where you can go.</span>', ''];
}

export function cmdUptime(variant: 'homepage' | '404'): string[] {
	const extra = variant === '404' ? ' (since last mass container migration)' : '';
	return [
		`  up <span class="text-green">42 days, 3 hours, 17 minutes</span>${extra}`,
		'  load average: 0.42, 0.69, 1.21',
		'  <span class="text-dim">vibes: immaculate</span>',
		'',
	];
}

export function cmdNeofetch(variant: 'homepage' | '404'): string[] {
	if (variant === '404') {
		return [
			'',
			'  <span class="text-coral"> ██╗ ██████╗ ███████╗</span>    <span class="text-teal">joe</span>@<span class="text-teal">joekarlsson.com</span>',
			'  <span class="text-coral"> ██║██╔═══██╗██╔════╝</span>    ─────────────────────',
			'  <span class="text-coral"> ██║██║   ██║█████╗  </span>    <span class="text-coral">OS</span>: Astro, self-hosted on Proxmox',
			'  <span class="text-coral">██  ██║   ██║██╔══╝  </span>    <span class="text-coral">Host</span>: Dell PowerEdge R730',
			'  <span class="text-coral">╚█████╔╝██████╔╝███████╗</span>    <span class="text-coral">Kernel</span>: caffeine-6.1.0',
			'  <span class="text-coral"> ╚════╝ ╚═════╝ ╚══════╝</span>    <span class="text-coral">Uptime</span>: 42 days',
			'                          <span class="text-coral">Shell</span>: bash + vibes',
			'                          <span class="text-coral">GPU</span>: RTX A4000 + Quadro RTX 4000',
			'                          <span class="text-coral">Containers</span>: 40+',
			'                          <span class="text-coral">Cats</span>: 2 (1 IoT-enabled)',
			'                          <span class="text-coral">Coffee</span>: ████████████░░ 86%',
			'',
			'                          <span style="color:#ff6b6b">██</span><span style="color:#fdae84">██</span><span style="color:#fde68a">██</span><span style="color:#86efac">██</span><span style="color:#8bcbc8">██</span><span style="color:#c4b5fd">██</span><span style="color:#f0abfc">██</span>',
			'',
		];
	}
	return [
		'',
		'  <span class="text-teal">joe</span>@<span class="text-teal">joekarlsson.com</span>',
		'  ─────────────────────',
		'  <span class="text-coral">OS</span>:         Astro, self-hosted on Proxmox',
		'  <span class="text-coral">Host</span>:       Dell PowerEdge R730',
		'  <span class="text-coral">Homelab</span>:    Proxmox Cluster x2',
		'  <span class="text-coral">GPU</span>:        RTX A4000 + Quadro RTX 4000',
		'  <span class="text-coral">Containers</span>: 40+',
		'  <span class="text-coral">Shell</span>:      bash + vibes',
		'  <span class="text-coral">Work</span>:       CData (MCP + AI agents)',
		'  <span class="text-coral">Cats</span>:       2 (1 IoT-enabled)',
		'',
		'  <span style="color:#ff6b6b">██</span><span style="color:#fdae84">██</span><span style="color:#fde68a">██</span><span style="color:#86efac">██</span><span style="color:#8bcbc8">██</span><span style="color:#c4b5fd">██</span><span style="color:#f0abfc">██</span>',
		'',
	];
}

// Homepage-only commands
export function cmdCatMusic(): string[] {
	return [
		'',
		'  <span class="text-yellow">## /etc/music - current favorites</span>',
		'',
		'  <span class="text-coral">1.</span> Radiohead - OK Computer',
		'  <span class="text-coral">2.</span> LCD Soundsystem - Sound of Silver',
		'  <span class="text-coral">3.</span> Talking Heads - Remain in Light',
		'  <span class="text-coral">4.</span> Bon Iver - For Emma, Forever Ago',
		'  <span class="text-coral">5.</span> Japanese Breakfast - Jubilee',
		'',
		'  <span class="text-dim">$ spotify --shuffle --repeat</span>',
		'',
	];
}

export function cmdCatFails(): string[] {
	return [
		'',
		'  <span class="text-yellow">## /var/log/fails - project failures hall of fame</span>',
		'',
		'  <span class="text-coral">[ERROR]</span> Forgot to set up RAID. Lost 2TB of Linux ISOs.',
		'  <span class="text-coral">[ERROR]</span> Ran docker system prune -a on prod. On purpose. By accident.',
		'  <span class="text-coral">[ERROR]</span> IoT toilet sensor fell in the toilet. Twice.',
		'  <span class="text-coral">[ERROR]</span> Accidentally exposed Portainer to the internet for 3 months.',
		'  <span class="text-coral">[ERROR]</span> Bought a second server to "save money on cloud bills."',
		'  <span class="text-coral">[ERROR]</span> Tried to mass-transcode 4K movies on a Raspberry Pi.',
		'',
		'  <span class="text-dim">errors: 6 | lessons learned: debatable</span>',
		'',
	];
}

export function cmdCatBlogIot(): string[] {
	return [
		'',
		'  <span class="text-yellow">## How I Built an IoT Smart Litter Box</span>',
		'',
		'  It started as a joke. "What if my cat\'s toilet was',
		'  connected to the internet?" Turns out, it\'s not as',
		'  ridiculous as it sounds. I used a Raspberry Pi, some',
		'  sensors, and way too much free time to build a litter',
		'  box that tweets when my cat uses it...',
		'',
		'  <span class="text-dim">-- truncated. visit <span class="text-teal">/blog/how-i-built-an-iot-kitty-litter-box</span> for full post --</span>',
		'',
	];
}

export function cmdCatBlogHomelab(): string[] {
	return [
		'',
		'  <span class="text-yellow">## My Homelab Setup</span>',
		'',
		'  I run a Proxmox cluster with two nodes, dual GPUs,',
		'  40+ Docker containers, and enough storage to make',
		'  my electricity bill a recurring source of regret.',
		'  Home Assistant, Plex, Arr stack, monitoring, the',
		'  whole nine yards...',
		'',
		'  <span class="text-dim">-- truncated. visit <span class="text-teal">/blog/homelab</span> for full post --</span>',
		'',
	];
}

export function cmdCatBlogList(): string[] {
	return [
		'<span class="text-yellow">Available blog previews:</span>',
		'',
		'  <span class="text-teal">cat blog/iot</span>      IoT litter box project',
		'  <span class="text-teal">cat blog/homelab</span>  homelab setup',
		'',
		'<span class="text-dim">Or visit the full blog → <span class="text-coral">cd blog</span></span>',
		'',
	];
}

export function cmdCatCat(): string[] {
	return [
		'',
		'    <span class="text-coral">/\\_/\\</span>',
		'   <span class="text-coral">( o.o )</span>',
		'    <span class="text-coral">> ^ <</span>',
		'',
		'  <span class="text-dim">meow. (IoT-enabled)</span>',
		'',
	];
}

export function cmdCatEmpty(variant: 'homepage' | '404'): string[] {
	const base = [
		'<span class="text-yellow">Available files:</span>',
		'',
		'  <span class="text-teal">about.md</span>  about me',
		'  <span class="text-teal">work.md</span>   things I\'ve built',
		'  <span class="text-teal">readme</span>    about this site',
	];

	if (variant === 'homepage') {
		return [
			...base,
			'  <span class="text-teal">music</span>        current favorite albums',
			'  <span class="text-teal">fails</span>        project failures hall of fame',
			'  <span class="text-teal">blog/iot</span>     IoT blog preview',
			'  <span class="text-teal">blog/homelab</span> homelab blog preview',
			'  <span class="text-teal">cat</span>          ???',
			'',
			'<span class="text-dim">usage: cat &lt;filename&gt;</span>',
			'',
		];
	}
	return [...base, '', '<span class="text-dim">usage: cat &lt;filename&gt;</span>', ''];
}

const fortunes = [
	'Hot take: YAML is just spicy JSON.',
	"The best database is the one you don't have to manage at 3am.",
	'Docker compose is my love language.',
	'There are two types of homelabbers: those who have lost data, and those who are about to.',
	"Every time I say 'one more container' my wife sighs.",
	'The IoT in IoT stands for Internet of Toilets.',
	'My homelab has more uptime than most startups.',
	'Self-hosting is just paying the electricity company instead of AWS.',
	'Kubernetes is just Docker with anxiety.',
	'I mass-assigned GPU transcoding jobs at 2am on a Tuesday. On purpose.',
];

export function cmdFortune(): string[] {
	const f = fortunes[Math.floor(Math.random() * fortunes.length)];
	return ['', `  <span class="text-yellow">${f}</span>`, ''];
}

const cowQuotes = [
	'I built an IoT cat toilet. No regrets.',
	'My homelab has more containers than sense.',
	'Have you tried turning it off and on again?',
	'Self-hosting: because I trust myself more than AWS.',
	'40+ containers and counting.',
];

export function cmdCowsay(): string[] {
	const quote = cowQuotes[Math.floor(Math.random() * cowQuotes.length)];
	const padded = quote.length < 36 ? quote + ' '.repeat(36 - quote.length) : quote;
	const border = '_'.repeat(padded.length + 2);
	return [
		` ${border}`,
		`/ ${padded} \\`,
		`\\ ${' '.repeat(padded.length)} /`,
		` ${'-'.repeat(padded.length + 2)}`,
		'        \\   ^__^',
		'         \\  (oo)\\_______',
		'            (__)\\       )\\/\\',
		'                ||----w |',
		'                ||     ||',
		'',
	];
}

export function cmdManJoe(): string[] {
	return [
		'<span class="text-yellow">JOE(1)                    User Commands                    JOE(1)</span>',
		'',
		'<span class="text-white">NAME</span>',
		'       joe - developer marketing engineer',
		'',
		'<span class="text-white">SYNOPSIS</span>',
		'       joe [--verbose] [--homelab] [--cats]',
		'',
		'<span class="text-white">DESCRIPTION</span>',
		'       Full man page available at <span class="text-teal">/man</span>',
		'',
		'<span class="text-white">SEE ALSO</span>',
		'       joekarlsson.com/about, joekarlsson.com/work',
		'',
	];
}

// Shared easter egg commands
export function cmdPwd(variant: 'homepage' | '404'): string[] {
	const path = variant === '404' ? '/home/joe/404' : '/home/joe/joekarlsson.com';
	return [`<span class="text-teal">${path}</span>`, ''];
}

export function cmdHi(variant: 'homepage' | '404'): string[] {
	if (variant === '404') {
		return [
			'',
			'  <span class="text-coral">Hey!</span> You found the 404 page.',
			'  <span class="text-dim">Type \'ls\' to find your way back.</span>',
			'',
		];
	}
	return [
		'',
		'  <span class="text-coral">Hey!</span> Welcome to my corner of the internet.',
		'  <span class="text-dim">Type \'help\' to see what you can do here.</span>',
		'',
	];
}

export function cmdCurlWget(): string[] {
	return ["<span class=\"text-dim\">You're already here. Try 'cat readme' instead.</span>", ''];
}

export function cmdChmod(): string[] {
	return ['<span class="text-coral">chmod: nice try, script kiddie.</span>', ''];
}

export function cmdChown(): string[] {
	return ['<span class="text-coral">chown: you don\'t own me.</span>', ''];
}

export function cmdKill(variant: 'homepage' | '404'): string[] {
	const target = variant === '404' ? '404' : 'website';
	return [
		`<span class="text-coral">kill: process "${target}" ${variant === '404' ? 'refuses to die' : 'is immortal'}.</span>`,
		'',
	];
}

export function cmdShutdown(): string[] {
	return [
		'<span class="text-coral">Error: This website runs on pure stubbornness.</span>',
		'<span class="text-dim">It cannot be stopped.</span>',
		'',
	];
}

export function cmdDd(): string[] {
	return [
		'<span class="text-coral">dd: permission denied</span>',
		'<span class="text-dim">Nice try. My disks are safe.</span>',
		'',
	];
}

export function cmdMkfs(): string[] {
	return ['<span class="text-coral">Whoa there. This is a website, not your homelab.</span>', ''];
}

export function cmdFork(): string[] {
	return [
		'<span class="text-coral">:(){ :|:& };: detected</span>',
		'<span class="text-dim">Fork bombs don\'t work here. I\'ve seen things.</span>',
		'',
	];
}

export function cmdDeltree(): string[] {
	return [
		'<span class="text-coral">This isn\'t Windows 95.</span>',
		'<span class="text-dim">But I appreciate the nostalgia.</span>',
		'',
	];
}

export function cmdDrop(): string[] {
	return [
		'<span class="text-coral">DROP TABLE users; --</span>',
		'<span class="text-dim">Nice try, Bobby Tables. This is a static site.</span>',
		'',
	];
}

export function cmdVim(): string[] {
	return [
		'<span class="text-dim">You\'re now trapped in vim.</span>',
		'<span class="text-dim">Just kidding. Type :q to... wait, that won\'t work here either.</span>',
		'',
	];
}

export function cmdEmacs(): string[] {
	return ['<span class="text-dim">Emacs? In this economy?</span>', ''];
}

export function cmdNano(): string[] {
	return ['<span class="text-green">Finally, someone with taste.</span>', ''];
}

export function cmdGit(variant: 'homepage' | '404'): string[] {
	if (variant === '404') {
		return [
			'<span class="text-coral">git: this site is already committed.</span>',
			'<span class="text-dim">No takebacks.</span>',
			'',
		];
	}
	return [
		'<span class="text-coral">git: this site is already committed.</span>',
		'<span class="text-dim">125+ commits and mass refactors. No takebacks.</span>',
		'',
	];
}

export function cmdEcho(args: string): string[] {
	return [
		`<span class="text-teal">${escapeHtml(args) || '...'}</span>`,
		'<span class="text-dim">(...echo... ...echo...)</span>',
		'',
	];
}

export function cmdSl(): string[] {
	return [
		'',
		'<span class="text-dim">      ====        ________                ___________</span>',
		'<span class="text-dim">  _D _|  |_______/        \\__I_I_____===__|_________|</span>',
		'<span class="text-dim">   |(_)---  |   H\\________/ |   |        =|___ ___|</span>',
		'<span class="text-dim">   /     |  |   H  |  |     |   |         ||_| |_||</span>',
		'<span class="text-dim">  |      |  |   H  |__--------------------| [___] |</span>',
		'<span class="text-dim">  | ________|___H__/__|_____/[][]~\\_______|       |</span>',
		'<span class="text-dim">  |/ |   |-----------I_____I [][] []  D   |=======|__</span>',
		'',
		"<span class=\"text-coral\">You meant 'ls', didn't you?</span>",
		'',
	];
}

export function cmdPlease(): string[] {
	return [
		'<span class="text-green">You\'re welcome! Such nice manners.</span>',
		'<span class="text-dim">Type \'help\' if you need anything.</span>',
		'',
	];
}

export function cmdCoffee(): string[] {
	return [
		'',
		'    <span class="text-coral">   )</span>',
		'    <span class="text-coral">  (</span>',
		'    <span class="text-coral">c[_]</span>',
		'',
		'<span class="text-dim">Coffee level: ████████░░ 80%</span>',
		'<span class="text-dim">Homelab uptime directly correlated.</span>',
		'',
	];
}

export function cmdBeer(): string[] {
	return [
		'',
		'    <span class="text-yellow">  .~~~~.</span>',
		'    <span class="text-yellow">  i====i_</span>',
		'    <span class="text-yellow">  |cccc|_)</span>',
		'    <span class="text-yellow">  |cccc|</span>',
		'    <span class="text-yellow">  `-==-\'</span>',
		'',
		'<span class="text-dim">It\'s mass container migration o\'clock somewhere.</span>',
		'',
	];
}

export function cmd42(): string[] {
	return [
		'<span class="text-green">The Answer to the Ultimate Question of Life,</span>',
		'<span class="text-green">the Universe, and Everything.</span>',
		'',
		'<span class="text-dim">...but what was the question?</span>',
		'',
	];
}

export function cmdXkcd(): string[] {
	return [
		'<span class="text-dim">I see you\'re a person of culture.</span>',
		'<span class="text-teal">sudo make me a sandwich</span>',
		'',
	];
}

export function cmdRickroll(variant: 'homepage' | '404'): string[] {
	const lastLine =
		variant === '404'
			? 'Never gonna run around and desert you'
			: 'Never gonna run around and mass migrate containers';
	return [
		'<span class="text-coral">Never gonna give you up</span>',
		'<span class="text-coral">Never gonna let you down</span>',
		`<span class="text-coral">${lastLine}</span>`,
		'',
	];
}

export function cmdPing(variant: 'homepage' | '404'): string[] {
	if (variant === '404') {
		return [
			'<span class="text-green">PONG!</span>',
			'<span class="text-dim">64 bytes from 404.joekarlsson.com: icmp_seq=1 ttl=64 time=0.404ms</span>',
			'',
		];
	}
	return [
		'<span class="text-green">PONG!</span>',
		'<span class="text-dim">64 bytes from joekarlsson.com: icmp_seq=1 ttl=64 time=0.042ms</span>',
		'<span class="text-dim">vibes: excellent</span>',
		'',
	];
}

export function cmdSsh(): string[] {
	return [
		'<span class="text-coral">ssh: Connection refused</span>',
		'<span class="text-dim">Nice try. My homelab is behind a VPN.</span>',
		'',
	];
}

export function cmdDocker(variant: 'homepage' | '404'): string[] {
	if (variant === '404') {
		return [
			'<span class="text-dim">This is a 404 page, not a dev environment.</span>',
			'<span class="text-dim">Type \'ls\' to find your way home.</span>',
			'',
		];
	}
	return [
		'<span class="text-teal">CONTAINER ID   IMAGE              STATUS</span>',
		'<span class="text-dim">a1b2c3d4e5f6   joekarlsson.com    Up 42 days</span>',
		'<span class="text-dim">...and 39 other containers</span>',
		'',
	];
}

export function cmdNpm(variant: 'homepage' | '404'): string[] {
	if (variant === '404') {
		return [
			'<span class="text-dim">This is a 404 page, not a dev environment.</span>',
			'<span class="text-dim">Type \'ls\' to find your way home.</span>',
			'',
		];
	}
	return [
		'<span class="text-dim">node_modules: 2.3GB</span>',
		'<span class="text-dim">actual code: 47KB</span>',
		'<span class="text-coral">This is fine.</span>',
		'',
	];
}

export function cmdPython(cmd: string): string[] {
	return [
		`<span class="text-dim">${cmd} 3.x.x</span>`,
		'<span class="text-dim">>>> print("hello from the terminal")</span>',
		'<span class="text-teal">hello from the terminal</span>',
		'<span class="text-dim">>>> # this isn\'t a real REPL though</span>',
		'',
	];
}

export function cmdMake(): string[] {
	return [
		'<span class="text-dim">make: *** No targets specified.</span>',
		"<span class=\"text-dim\">Try 'make coffee' or 'make sense'</span>",
		'',
	];
}

export function cmdTop(): string[] {
	return [
		'<span class="text-teal">  PID  USER     CPU%  MEM%  COMMAND</span>',
		'<span class="text-dim">    1  joe      4.2%  69%   mass-containers</span>',
		'<span class="text-dim">    2  joe      0.1%  1%    good-vibes</span>',
		'<span class="text-dim">    3  joe      99%   42%   overthinking</span>',
		'',
	];
}

export function cmdPs(): string[] {
	return [
		'<span class="text-dim">  PID TTY          TIME CMD</span>',
		'<span class="text-dim">    1 pts/0    00:00:00 being-awesome</span>',
		'<span class="text-dim">    2 pts/0    00:42:00 mass-migration</span>',
		'',
	];
}

export function cmdTouch(): string[] {
	return [
		'<span class="text-coral">Permission denied.</span>',
		'<span class="text-dim">This is a read-only filesystem. Very static. Much HTML.</span>',
		'',
	];
}

export function cmdNvidiaSmi(): string[] {
	return [
		'<span class="text-teal">+-----------------------------------------------------------------------------+</span>',
		'<span class="text-teal">| NVIDIA-SMI 535.xx    Driver: 535.xx    CUDA: 12.x                          |</span>',
		'<span class="text-teal">|-------------------------------+----------------------+----------------------|</span>',
		'<span class="text-dim">| RTX A4000              | 42°C    | 8% |   2GB / 16GB  | jellyfin-transcode |</span>',
		'<span class="text-dim">| Quadro RTX 4000        | 38°C    | 0% |   1GB /  8GB  | frigate-detection  |</span>',
		'<span class="text-teal">+-----------------------------------------------------------------------------+</span>',
		'',
	];
}

export function cmdNmap(variant: 'homepage' | '404'): string[] {
	const port =
		variant === '404' ? '404/tcp  open     not-found' : '22/tcp   filtered ssh (nice try)';
	return [
		'<span class="text-coral">Scanning...</span>',
		'<span class="text-dim">PORT     STATE    SERVICE</span>',
		variant === '404'
			? `<span class="text-dim">${port}</span>`
			: '<span class="text-dim">443/tcp  open     https</span>',
		variant === 'homepage' ? `<span class="text-dim">${port}</span>` : '',
		'',
	].filter(Boolean);
}

export function cmdFrustration(variant: 'homepage' | '404'): string[] {
	if (variant === '404') {
		return [
			'<span class="text-dim">I understand. 404s are frustrating.</span>',
			"<span class=\"text-dim\">Type 'ls' to find what you're looking for.</span>",
			'',
		];
	}
	return [
		'<span class="text-dim">I understand. Debugging is hard.</span>',
		'<span class="text-dim">Have you tried mass migrating your containers?</span>',
		'',
	];
}

export function cmdWhy(variant: 'homepage' | '404'): string[] {
	if (variant === '404') {
		return ['<span class="text-dim">Because the page doesn\'t exist. Sorry!</span>', ''];
	}
	return ['<span class="text-dim">Why not?</span>', ''];
}

export function cmdRm(): string[] {
	return ['<span class="text-coral">absolutely not.</span>', ''];
}

export function cmdSudo(): string[] {
	return ['<span class="text-coral">nice try.</span>', ''];
}

export function cmdExit(variant: 'homepage' | '404'): { lines: string[]; navigateTo?: string } {
	if (variant === '404') {
		return { lines: ['Goodbye! Navigating home...'], navigateTo: '/' };
	}
	return { lines: ['<span class="text-dim">You\'re already home.</span>', ''] };
}

export function cmdHack(variant: 'homepage' | '404'): { lines: string[]; action?: string } {
	if (variant === '404') {
		return {
			lines: [
				'',
				'  <span class="text-green">Initiating hack sequence...</span>',
				'  <span class="text-green">████████████████████░░░░░░ 76%</span>',
				'  <span class="text-coral">ACCESS DENIED</span>',
				'',
				'  <span class="text-dim">Nice try. The mainframe remains secure.</span>',
				'  <span class="text-dim">(visit the homepage for the full experience)</span>',
				'',
			],
		};
	}
	return { lines: [], action: 'matrix' };
}

export function cmdNotFound(cmd: string): string[] {
	return [`<span class="text-dim">${escapeHtml(cmd)}: command not found. try 'help'</span>`, ''];
}
