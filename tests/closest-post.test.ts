import { describe, expect, it } from 'vitest';
import { findClosestPost } from '../src/scripts/closest-post';

const posts = [
	{ href: '/blog/homelab-two-years-later/', title: 'My homelab two years later' },
	{ href: '/blog/mcp-server-inside-doom/', title: 'I put an MCP server inside DOOM' },
	{ href: '/newsletter/desk-on-wheels/', title: 'My whole recording setup is one desk on wheels' },
];

describe('findClosestPost', () => {
	it('matches a typo in the slug', () => {
		expect(findClosestPost('/blog/homelab-two-yeras-later/', posts)?.title).toBe(
			'My homelab two years later',
		);
	});

	it('matches an old URL shape with the same slug', () => {
		expect(findClosestPost('/2019/05/mcp-server-inside-doom.html', posts)?.href).toBe(
			'/blog/mcp-server-inside-doom/',
		);
		expect(findClosestPost('/desk-on-wheels', posts)?.href).toBe('/newsletter/desk-on-wheels/');
	});

	it('returns null when nothing is close', () => {
		expect(findClosestPost('/wp-admin/setup-config.php', posts)).toBeNull();
		expect(findClosestPost('/', posts)).toBeNull();
		expect(findClosestPost('/ai/', posts)).toBeNull();
	});
});
