import { describe, expect, it } from 'vitest';
import { terminalCard, wrapWords } from '../src/utils/terminal-card';

describe('wrapWords', () => {
	it('breaks at spaces and keeps every line within the width', () => {
		const lines = wrapWords(
			'Are English sentences getting shorter? About 40% of the drop is punctuation',
			20,
		);
		expect(lines.join(' ')).toBe(
			'Are English sentences getting shorter? About 40% of the drop is punctuation',
		);
		for (const line of lines) expect(line.length).toBeLessThanOrEqual(20);
	});
});

describe('terminalCard', () => {
	it('shows the live numbers and the newest post, and no line runs past 80 columns', () => {
		const card = terminalCard({
			runningContainers: 72,
			proxmoxNodes: 2,
			cpuThreads: 160,
			latestTitle: 'Are English sentences getting shorter? About 40% of the drop is punctuation',
			latestUrl: 'https://joekarlsson.com/blog/are-english-sentences-getting-shorter/',
		});
		// Strips the terminal color codes, which start with the ESC control character
		// eslint-disable-next-line no-control-regex
		const plain = card.replaceAll(/\x1b\[[0-9;]*m/g, '');
		expect(plain).toContain('run 72 containers');
		expect(plain).toContain('72 containers, 2 Proxmox nodes, 160 threads');
		expect(plain.replace(/\s+/g, ' ')).toContain(
			'getting shorter? About 40% of the drop is punctuation',
		);
		for (const line of plain.split('\n')) expect(line.length).toBeLessThanOrEqual(80);
	});
});
