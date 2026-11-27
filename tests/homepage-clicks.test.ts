// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { homepageClick } from '../src/scripts/homepage-clicks';

const HOME = new URL('https://www.joekarlsson.com/');

function page(html: string) {
	document.body.replaceChildren();
	const template = document.createElement('template');
	template.innerHTML = html; // test fixture only
	document.body.append(template.content);
	return (selector: string) => homepageClick(document.querySelector(selector), HOME);
}

describe('homepage clicks', () => {
	it('reports a section link with its section and destination', () => {
		const click = page(`
			<section aria-label="Introduction"><a id="hero" href="/about/">About</a></section>
			<section aria-labelledby="writing"><a href="/blog/x/"><span id="inner">Post</span></a></section>
			<section aria-labelledby="talks"><a id="out" href="https://www.youtube.com/watch?v=1">Talk</a></section>`);
		expect(click('#hero')).toEqual({ section: 'introduction', destination: '/about/' });
		expect(click('#inner')).toEqual({ section: 'writing', destination: '/blog/x/' });
		expect(click('#out')).toEqual({ section: 'talks', destination: 'www.youtube.com' });
	});

	it('skips links with their own event, jumps within the page, the footer and non-links', () => {
		const click = page(`
			<section aria-labelledby="writing">
				<a id="own" class="plausible-event-name=Newsletter+CTA+Click" href="/newsletter/">Sign up</a>
				<a id="jump" href="#works">Works</a>
				<p id="text">Words</p>
			</section>
			<footer><section aria-label="Links"><a id="foot" href="/rss.xml">RSS</a></section></footer>
			<a id="loose" href="/blog/">Blog</a>`);
		for (const id of ['#own', '#jump', '#text', '#foot', '#loose']) expect(click(id)).toBeNull();
	});
});
