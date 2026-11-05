import { describe, expect, it } from 'vitest';
import {
	cardAlt,
	cardContent,
	extractHeadlines,
	pickMarks,
	setFrontmatterFields,
	splitIssue,
} from '../scripts/issue-card-content.mjs';

const roundup = (body: string, extra = '') =>
	splitIssue(`---
title: 'tl;dr in tech - Issue #99'
date: 2023-11-21
slug: 'tldr-in-tech-issue-99'
issue: 99
${extra}---

${body}`);

describe('extractHeadlines', () => {
	it('reads ## and bold link headlines in order and skips tl;dr summaries', () => {
		const body = [
			'## [Hashing](https://samwho.dev/hashing/)',
			'[tl;dr: A 101 on hash functions.](https://example.com)',
			'**[Which Meetings Should You Kill?](https://example.com/m)**  ',
			'**[tl;dr](https://example.com/t)**: not a headline',
		].join('\n\n');
		expect(extractHeadlines(body)).toEqual(['Hashing', 'Which Meetings Should You Kill?']);
	});
});

describe('cardContent', () => {
	it('leads a roundup with its first headline and lists the next two', () => {
		const content = cardContent(
			roundup('## [One](a)\n\n## [Two](b)\n\n## [Three](c)\n\n## [Four](d)'),
		);
		expect(content).toMatchObject({
			kicker: 'TL;DR in Tech · Issue 99',
			title: 'One',
			also: 'Also in this issue: Two · Three',
			number: '#99',
			photo: null,
		});
	});

	it('falls back to the newsletter name when no headline can be read', () => {
		const content = cardContent(roundup('[tl;dr: old format](https://example.com)'));
		expect(content.title).toBe('TL;DR in Tech');
		expect(content.also).toBe('The links I read that week, each with a tl;dr.');
	});

	it('gives an essay with a photo no number or marks, and an essay without one its year', () => {
		const withPhoto = splitIssue(
			"---\ntitle: 'Taste Matters More with AI'\ndate: 2026-10-12\nslug: taste\ncardPhoto: /p.webp\ncardPhotoAlt: a collage\n---\n",
		);
		expect(cardContent(withPhoto)).toMatchObject({
			photo: '/p.webp',
			number: null,
			marks: null,
			kicker: null,
		});
		expect(cardAlt(cardContent(withPhoto), withPhoto.data)).toContain('a collage');

		const noPhoto = splitIssue(
			"---\ntitle: 'Why I Joined Viam 🤖'\ndate: 2022-06-15\nslug: viam\n---\n",
		);
		expect(cardContent(noPhoto)).toMatchObject({
			title: 'Why I Joined Viam',
			number: '2022',
			kicker: null,
		});
	});

	it('refuses a photo without alt text', () => {
		const issue = splitIssue(
			"---\ntitle: 'X'\ndate: 2026-10-12\nslug: x\ncardPhoto: /p.webp\n---\n",
		);
		expect(() => cardAlt(cardContent(issue), issue.data)).toThrow(/cardPhotoAlt/);
	});
});

describe('pickMarks', () => {
	it('is stable for a slug and varies across slugs', () => {
		expect(pickMarks('tldr-in-tech-issue-99')).toEqual(pickMarks('tldr-in-tech-issue-99'));
		const picks = new Set(
			['a', 'b', 'c', 'd', 'e', 'f'].map((s) => JSON.stringify(pickMarks(`issue-${s}`))),
		);
		expect(picks.size).toBeGreaterThan(1);
	});
});

describe('setFrontmatterFields', () => {
	it('replaces an existing field, appends a new one, and leaves the body alone', () => {
		const md = "---\ntitle: 'X'\nheroImage: '/old.webp'\n---\n\nBody: text\n";
		expect(setFrontmatterFields(md, { heroImage: '/card.webp', heroAlt: "Joe's card" })).toBe(
			'---\ntitle: \'X\'\nheroImage: "/card.webp"\nheroAlt: "Joe\'s card"\n---\n\nBody: text\n',
		);
	});
});
