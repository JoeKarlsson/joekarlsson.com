/**
 * Unit tests for terminal-core.ts
 * Tests command handlers, utilities, and tab completion logic
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

// Set up DOM environment for escapeHtml
beforeAll(() => {
	const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
	global.document = dom.window.document;
});

// Import after DOM is set up
import {
	defaultPages,
	allCommands,
	catFiles,
	cmdHelp,
	cmdLs,
	cmdCd,
	cmdWhoami,
	cmdCatAbout,
	cmdCatWork,
	cmdCatReadme,
	cmdCatMusic,
	cmdCatFails,
	cmdCatEmpty,
	cmdUptime,
	cmdNeofetch,
	cmdFortune,
	cmdCowsay,
	cmdManJoe,
	cmdPwd,
	cmdHi,
	cmdCoffee,
	cmdBeer,
	cmd42,
	cmdPing,
	cmdSsh,
	cmdDocker,
	cmdNpm,
	cmdTop,
	cmdPs,
	cmdNvidiaSmi,
	cmdGit,
	cmdEcho,
	cmdSl,
	cmdPlease,
	cmdRickroll,
	cmdHack,
	cmdExit,
	cmdNotFound,
	cmdRm,
	cmdSudo,
	escapeHtml,
	sleep,
} from '../src/lib/terminal-core';

describe('Terminal Core - Constants', () => {
	describe('defaultPages', () => {
		it('contains all main navigation pages', () => {
			expect(defaultPages).toHaveProperty('home');
			expect(defaultPages).toHaveProperty('blog');
			expect(defaultPages).toHaveProperty('about');
			expect(defaultPages).toHaveProperty('work');
			expect(defaultPages).toHaveProperty('contact');
			expect(defaultPages).toHaveProperty('uses');
		});

		it('all pages have valid URL paths', () => {
			Object.values(defaultPages).forEach((url) => {
				expect(url).toMatch(/^\//);
			});
		});
	});

	describe('allCommands', () => {
		it('contains core commands', () => {
			expect(allCommands).toContain('help');
			expect(allCommands).toContain('ls');
			expect(allCommands).toContain('cd');
			expect(allCommands).toContain('cat');
			expect(allCommands).toContain('whoami');
			expect(allCommands).toContain('clear');
		});

		it('contains easter egg commands', () => {
			expect(allCommands).toContain('coffee');
			expect(allCommands).toContain('beer');
			expect(allCommands).toContain('matrix');
			expect(allCommands).toContain('hack');
			expect(allCommands).toContain('rickroll');
		});

		it('has no duplicates', () => {
			const unique = new Set(allCommands);
			expect(unique.size).toBe(allCommands.length);
		});
	});

	describe('catFiles', () => {
		it('contains available cat targets', () => {
			expect(catFiles).toContain('about.md');
			expect(catFiles).toContain('work.md');
			expect(catFiles).toContain('readme');
			expect(catFiles).toContain('music');
			expect(catFiles).toContain('fails');
		});
	});
});

describe('Terminal Core - Utilities', () => {
	describe('escapeHtml', () => {
		it('escapes HTML special characters', () => {
			expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
			expect(escapeHtml('a & b')).toBe('a &amp; b');
			// Note: textContent approach doesn't escape quotes
			expect(escapeHtml('"quotes"')).toBe('"quotes"');
		});

		it('returns empty string for empty input', () => {
			expect(escapeHtml('')).toBe('');
		});

		it('leaves normal text unchanged', () => {
			expect(escapeHtml('hello world')).toBe('hello world');
		});
	});

	describe('sleep', () => {
		it('returns a promise', () => {
			const result = sleep(0);
			expect(result).toBeInstanceOf(Promise);
		});

		it('resolves after specified time', async () => {
			const start = Date.now();
			await sleep(50);
			const elapsed = Date.now() - start;
			expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some tolerance
		});
	});
});

describe('Terminal Core - Command Handlers', () => {
	describe('cmdHelp', () => {
		it('returns help text for homepage variant', () => {
			const result = cmdHelp('homepage');
			expect(result.join('\n')).toContain('Available commands');
			expect(result.join('\n')).toContain('help');
			expect(result.join('\n')).toContain('ls');
			expect(result.join('\n')).toContain('cd');
		});

		it('returns help text for 404 variant', () => {
			const result = cmdHelp('404');
			expect(result.join('\n')).toContain('Available commands');
		});

		it('homepage includes extra commands not in 404', () => {
			const homepage = cmdHelp('homepage').join('\n');
			const four04 = cmdHelp('404').join('\n');

			expect(homepage).toContain('fortune');
			expect(homepage).toContain('cowsay');
			expect(homepage).toContain('man joe');
			expect(four04).not.toContain('fortune');
		});
	});

	describe('cmdLs', () => {
		it('lists all pages', () => {
			const result = cmdLs('', defaultPages);
			Object.keys(defaultPages).forEach((page) => {
				expect(result.join('\n')).toContain(page);
			});
		});

		it('shows hidden files with -a flag', () => {
			const result = cmdLs('-a', defaultPages);
			expect(result.join('\n')).toContain('.secrets');
			expect(result.join('\n')).toContain('.env');
			expect(result.join('\n')).toContain('.ssh');
		});

		it('shows hidden files with -la flag', () => {
			const result = cmdLs('-la', defaultPages);
			expect(result.join('\n')).toContain('.secrets');
		});
	});

	describe('cmdCd', () => {
		it('navigates to valid page', () => {
			const result = cmdCd('blog', defaultPages);
			expect(result.navigateTo).toBe('/blog');
		});

		it('handles tilde as home shortcut', () => {
			expect(cmdCd('~', defaultPages).navigateTo).toBe('/');
		});

		it('treats bare slash as empty (shows usage)', () => {
			// "/" gets stripped by replace(/^\//, '') leaving empty string
			const result = cmdCd('/', defaultPages);
			expect(result.navigateTo).toBeUndefined();
			expect(result.lines.join('\n')).toContain('usage');
		});

		it('returns error for invalid page', () => {
			const result = cmdCd('nonexistent', defaultPages);
			expect(result.navigateTo).toBeUndefined();
			expect(result.lines.join('\n')).toContain('no such page');
		});

		it('shows usage when no argument', () => {
			const result = cmdCd('', defaultPages);
			expect(result.lines.join('\n')).toContain('usage');
		});

		it('strips leading/trailing slashes', () => {
			const result = cmdCd('/blog/', defaultPages);
			expect(result.navigateTo).toBe('/blog');
		});
	});

	describe('cmdWhoami', () => {
		it('returns user info', () => {
			const result = cmdWhoami();
			expect(result.join('\n')).toContain('joe-karlsson');
			expect(result.join('\n')).toContain('developer marketing engineer');
		});
	});

	describe('cmdCatAbout', () => {
		it('returns about content', () => {
			const result = cmdCatAbout();
			expect(result.join('\n')).toContain('about.md');
			expect(result.join('\n')).toContain('Joe Karlsson');
		});
	});

	describe('cmdCatWork', () => {
		it('returns work content', () => {
			const result = cmdCatWork();
			expect(result.join('\n')).toContain('work.md');
			expect(result.join('\n')).toContain('IoT');
		});
	});

	describe('cmdCatReadme', () => {
		it('returns readme for homepage', () => {
			const result = cmdCatReadme('homepage');
			expect(result.join('\n')).toContain('README.md');
			expect(result.join('\n')).toContain('joekarlsson.com');
		});

		it('has different content for 404', () => {
			const result = cmdCatReadme('404');
			expect(result.join('\n')).toContain('404');
			expect(result.join('\n')).toContain('lost');
		});
	});

	describe('cmdCatMusic', () => {
		it('returns music list', () => {
			const result = cmdCatMusic();
			expect(result.join('\n')).toContain('music');
			expect(result.join('\n')).toContain('Radiohead');
		});
	});

	describe('cmdCatFails', () => {
		it('returns failure stories', () => {
			const result = cmdCatFails();
			expect(result.join('\n')).toContain('fails');
			expect(result.join('\n')).toContain('ERROR');
		});
	});

	describe('cmdCatEmpty', () => {
		it('lists available files for homepage', () => {
			const result = cmdCatEmpty('homepage');
			expect(result.join('\n')).toContain('about.md');
			expect(result.join('\n')).toContain('music');
			expect(result.join('\n')).toContain('fails');
		});

		it('lists fewer files for 404', () => {
			const homepage = cmdCatEmpty('homepage');
			const four04 = cmdCatEmpty('404');
			expect(homepage.length).toBeGreaterThan(four04.length);
		});
	});

	describe('cmdUptime', () => {
		it('returns uptime info', () => {
			const result = cmdUptime('homepage');
			expect(result.join('\n')).toContain('up');
			expect(result.join('\n')).toContain('load average');
		});
	});

	describe('cmdNeofetch', () => {
		it('returns system info', () => {
			const result = cmdNeofetch('homepage');
			expect(result.join('\n')).toContain('joekarlsson.com');
			expect(result.join('\n')).toContain('Astro');
		});

		it('has different output for 404', () => {
			const result = cmdNeofetch('404');
			expect(result.join('\n')).toContain('joekarlsson.com');
		});
	});

	describe('cmdFortune', () => {
		it('returns a fortune', () => {
			const result = cmdFortune();
			expect(result.length).toBeGreaterThan(0);
			expect(result.join('\n')).not.toBe('');
		});
	});

	describe('cmdCowsay', () => {
		it('returns ASCII cow', () => {
			const result = cmdCowsay();
			expect(result.join('\n')).toContain('(oo)');
			expect(result.join('\n')).toContain('||');
		});
	});

	describe('cmdManJoe', () => {
		it('returns man page format', () => {
			const result = cmdManJoe();
			expect(result.join('\n')).toContain('JOE(1)');
			expect(result.join('\n')).toContain('NAME');
			expect(result.join('\n')).toContain('SYNOPSIS');
		});
	});

	describe('cmdPwd', () => {
		it('returns correct path for homepage', () => {
			const result = cmdPwd('homepage');
			expect(result.join('\n')).toContain('/home/joe/joekarlsson.com');
		});

		it('returns correct path for 404', () => {
			const result = cmdPwd('404');
			expect(result.join('\n')).toContain('/home/joe/404');
		});
	});

	describe('cmdHi', () => {
		it('greets user on homepage', () => {
			const result = cmdHi('homepage');
			expect(result.join('\n')).toContain('Hey');
			expect(result.join('\n')).toContain('help');
		});

		it('greets user on 404', () => {
			const result = cmdHi('404');
			expect(result.join('\n')).toContain('404');
		});
	});

	describe('cmdCoffee', () => {
		it('returns coffee ASCII', () => {
			const result = cmdCoffee();
			expect(result.join('\n')).toContain('c[_]');
		});
	});

	describe('cmdBeer', () => {
		it('returns beer ASCII', () => {
			const result = cmdBeer();
			expect(result.join('\n')).toContain('~~~~');
		});
	});

	describe('cmd42', () => {
		it('returns hitchhiker reference', () => {
			const result = cmd42();
			expect(result.join('\n')).toContain('Ultimate Question');
		});
	});

	describe('cmdPing', () => {
		it('returns pong', () => {
			const result = cmdPing('homepage');
			expect(result.join('\n')).toContain('PONG');
		});
	});

	describe('cmdSsh', () => {
		it('returns connection refused', () => {
			const result = cmdSsh();
			expect(result.join('\n')).toContain('refused');
			expect(result.join('\n')).toContain('VPN');
		});
	});

	describe('cmdDocker', () => {
		it('returns container info on homepage', () => {
			const result = cmdDocker('homepage');
			expect(result.join('\n')).toContain('CONTAINER');
			expect(result.join('\n')).toContain('39 other containers');
		});

		it('returns different message on 404', () => {
			const result = cmdDocker('404');
			expect(result.join('\n')).toContain('404 page');
		});
	});

	describe('cmdNpm', () => {
		it('jokes about node_modules size', () => {
			const result = cmdNpm('homepage');
			expect(result.join('\n')).toContain('node_modules');
			expect(result.join('\n')).toContain('2.3GB');
		});
	});

	describe('cmdTop', () => {
		it('returns process list', () => {
			const result = cmdTop();
			expect(result.join('\n')).toContain('PID');
			expect(result.join('\n')).toContain('CPU');
		});
	});

	describe('cmdPs', () => {
		it('returns process list', () => {
			const result = cmdPs();
			expect(result.join('\n')).toContain('PID');
		});
	});

	describe('cmdNvidiaSmi', () => {
		it('returns GPU info', () => {
			const result = cmdNvidiaSmi();
			expect(result.join('\n')).toContain('NVIDIA');
			expect(result.join('\n')).toContain('RTX');
		});
	});

	describe('cmdGit', () => {
		it('returns git message', () => {
			const result = cmdGit('homepage');
			expect(result.join('\n')).toContain('committed');
		});
	});

	describe('cmdEcho', () => {
		it('echoes input', () => {
			const result = cmdEcho('hello world');
			expect(result.join('\n')).toContain('hello world');
		});

		it('handles empty input', () => {
			const result = cmdEcho('');
			expect(result.join('\n')).toContain('...');
		});
	});

	describe('cmdSl', () => {
		it('returns train ASCII', () => {
			const result = cmdSl();
			expect(result.join('\n')).toContain('====');
			expect(result.join('\n')).toContain("You meant 'ls'");
		});
	});

	describe('cmdPlease', () => {
		it('responds politely', () => {
			const result = cmdPlease();
			expect(result.join('\n')).toContain('welcome');
		});
	});

	describe('cmdRickroll', () => {
		it('never gonna give you up', () => {
			const result = cmdRickroll('homepage');
			expect(result.join('\n')).toContain('Never gonna give you up');
		});
	});

	describe('cmdHack', () => {
		it('triggers matrix on homepage', () => {
			const result = cmdHack('homepage');
			expect(result.action).toBe('matrix');
		});

		it('shows denied message on 404', () => {
			const result = cmdHack('404');
			expect(result.lines.join('\n')).toContain('ACCESS DENIED');
		});
	});

	describe('cmdExit', () => {
		it('navigates home on 404', () => {
			const result = cmdExit('404');
			expect(result.navigateTo).toBe('/');
		});

		it('stays on homepage', () => {
			const result = cmdExit('homepage');
			expect(result.navigateTo).toBeUndefined();
			expect(result.lines.join('\n')).toContain('already home');
		});
	});

	describe('cmdNotFound', () => {
		it('returns command not found message', () => {
			const result = cmdNotFound('foobar');
			expect(result.join('\n')).toContain('foobar');
			expect(result.join('\n')).toContain('command not found');
		});

		it('escapes HTML in command', () => {
			const result = cmdNotFound('<script>');
			expect(result.join('\n')).not.toContain('<script>');
			expect(result.join('\n')).toContain('&lt;script&gt;');
		});
	});

	describe('cmdRm', () => {
		it('refuses to delete', () => {
			const result = cmdRm();
			expect(result.join('\n')).toContain('absolutely not');
		});
	});

	describe('cmdSudo', () => {
		it('denies sudo', () => {
			const result = cmdSudo();
			expect(result.join('\n')).toContain('nice try');
		});
	});
});

describe('Tab Completion Logic', () => {
	// Helper function matching terminal implementation
	function findCompletions(input: string, commands: string[]): string[] {
		const lower = input.toLowerCase();
		return commands.filter((cmd) => cmd.toLowerCase().startsWith(lower)).sort();
	}

	it('finds matching commands', () => {
		const matches = findCompletions('hel', allCommands);
		expect(matches).toContain('hello');
		expect(matches).toContain('help');
	});

	it('returns first match alphabetically', () => {
		const matches = findCompletions('h', allCommands);
		expect(matches[0]).toBe('hack');
	});

	it('returns empty array for no matches', () => {
		const matches = findCompletions('xyz', allCommands);
		expect(matches).toHaveLength(0);
	});

	it('is case insensitive', () => {
		const matches = findCompletions('HELP', allCommands);
		expect(matches).toContain('help');
	});

	it('finds cat file completions', () => {
		const matches = findCompletions('about', catFiles);
		expect(matches).toContain('about.md');
		expect(matches).toContain('about');
	});
});
