/**
 * What goes on a newsletter issue's Poster card, worked out from its markdown alone.
 * scripts/generate-issue-cards.mjs draws the card; this file only decides the words,
 * the number and which crayon marks go where, so it can be tested without a browser.
 */
import { parse as parseYaml } from 'yaml';

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;

/** Frontmatter as an object, plus the markdown after it. */
export function splitIssue(markdown) {
	const match = markdown.match(FRONTMATTER);
	if (!match) throw new Error('Issue has no frontmatter block');
	return { data: parseYaml(match[1]), body: markdown.slice(match[0].length) };
}

/** TL;DR in Tech link roundups, as opposed to essays (which may also have come from Substack). */
export function isRoundup(title) {
	return /tl;dr in tech/i.test(title);
}

export function issueNumber(data) {
	if (Number.isInteger(data.issue)) return data.issue;
	const match = String(data.title).match(/#(\d+)/);
	return match ? Number(match[1]) : null;
}

/**
 * Link headlines from a roundup, in order. Issues from #64 on use `## [Headline](url)`;
 * some older ones use `**[Headline](url)**`. The oldest ones open each link with
 * `[tl;dr: ...`, which is a summary, not a headline, so those are skipped.
 */
export function extractHeadlines(body) {
	return [...body.matchAll(/^(?:## |\*\*)\[(.+?)\]\(/gm)]
		.map((match) => match[1].trim())
		.filter((headline) => !/^tl;dr/i.test(headline));
}

/** Essay titles drop emoji ("Why I Joined Viam 🤖"): Anton has no glyphs for them. */
function cleanTitle(title) {
	return title.replace(/\s*\p{Extended_Pictographic}️?/gu, '').trim();
}

/** FNV-1a, so a slug always picks the same marks and a rerun never changes a card. */
export function slugHash(slug) {
	let hash = 2166136261;
	for (const char of slug) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
	return hash >>> 0;
}

const SURROUND = ['oval', 'box'];
const CORNER = ['asterisk', 'burstDense', 'check'];
const UNDER = ['tally', 'double', 'hatch'];

/** Marks for the three slots around the number on a card without a photo. */
export function pickMarks(slug) {
	const hash = slugHash(slug);
	return {
		surround: SURROUND[hash % SURROUND.length],
		corner: CORNER[(hash >>> 3) % CORNER.length],
		under: UNDER[(hash >>> 6) % UNDER.length],
	};
}

/**
 * Everything the Poster card shows. With a photo: title on the left, photo boxed on the
 * right. Without one: the issue number (or year) circled on the right, and for a roundup
 * the lead headline as the title with the next two listed under it.
 */
export function cardContent({ data, body }) {
	const number = issueNumber(data);
	const date = data.date instanceof Date ? data.date : new Date(data.date);
	const content = {
		title: cleanTitle(String(data.title)),
		kicker: null,
		also: null,
		photo: data.cardPhoto ?? null,
		number: null,
		marks: null,
		date,
	};
	if (content.photo) return content;

	content.number = number ? `#${number}` : String(date.getUTCFullYear());
	content.marks = pickMarks(data.slug);
	if (isRoundup(data.title)) {
		const headlines = extractHeadlines(body);
		content.kicker = `TL;DR in Tech${number ? ` · Issue ${number}` : ''}`;
		if (headlines.length) {
			content.title = headlines[0];
			if (headlines.length > 1)
				content.also = `Also in this issue: ${headlines.slice(1, 3).join(' · ')}`;
		} else {
			content.title = 'TL;DR in Tech';
			content.also = 'The links I read that week, each with a tl;dr.';
		}
	}
	return content;
}

/** Alt text for the finished card. A photo card needs `cardPhotoAlt` to describe the photo. */
export function cardAlt(content, data) {
	if (content.photo) {
		if (!data.cardPhotoAlt)
			throw new Error(`${data.slug}: cardPhoto is set but cardPhotoAlt is missing`);
		return `Works on My Machine card for ${content.title}, with ${data.cardPhotoAlt} framed in a pink crayon box`;
	}
	if (content.kicker) {
		return `Works on My Machine card for ${content.kicker.replace(' · Issue', ' issue')}, leading with ${content.title}, with the issue number circled in pink crayon`;
	}
	return `Works on My Machine card for ${content.title}, with the year circled in pink crayon`;
}

/** Sets frontmatter fields in place, replacing existing lines and appending new ones. */
export function setFrontmatterFields(markdown, fields) {
	const match = markdown.match(FRONTMATTER);
	if (!match) throw new Error('Issue has no frontmatter block');
	const lines = match[1].split('\n');
	for (const [key, value] of Object.entries(fields)) {
		const line = `${key}: ${JSON.stringify(value)}`;
		const index = lines.findIndex((l) => l.startsWith(`${key}:`));
		if (index === -1) lines.push(line);
		else lines[index] = line;
	}
	return `---\n${lines.join('\n')}\n---\n${markdown.slice(match[0].length)}`;
}
