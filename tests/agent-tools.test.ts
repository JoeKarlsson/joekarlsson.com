import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Security audit run-1: an agent that reads attacker-writable web pages must not
// also hold a shell, and /analytics (visitor-set strings, secrets in reach) stays
// read-only. Tool lists come from each file's frontmatter.
const tools = (file: string, key: string) =>
	(readFileSync(file, 'utf8').match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1] ?? '')
		.split(',')
		.map((t) => t.trim());

describe('Claude agent tools', () => {
	const agents = readdirSync('.claude/agents')
		.filter((f) => f.endsWith('.md'))
		.map((f) => `.claude/agents/${f}`);

	it.each(agents)('%s does not pair web reading with Bash', (file) => {
		const list = tools(file, 'tools');
		const readsWeb = list.some((t) => t === 'WebFetch' || t === 'WebSearch');
		expect(readsWeb && list.includes('Bash')).toBe(false);
	});

	it('/analytics cannot fetch or edit', () => {
		const list = tools('.claude/commands/analytics.md', 'allowed-tools');
		expect(list).not.toContain('WebFetch');
		expect(list).not.toContain('Edit');
		expect(list).not.toContain('Write');
	});

	it('/analytics pipes every Plausible call through the sanitizer', () => {
		const text = readFileSync('.claude/commands/analytics.md', 'utf8');
		const calls = text.match(/api\/v2\/query/g) ?? [];
		const cleaned = text.match(/\| node scripts\/untrusted-text\.mjs/g) ?? [];
		expect(calls.length).toBeGreaterThan(0);
		expect(cleaned.length).toBe(calls.length);
	});
});
