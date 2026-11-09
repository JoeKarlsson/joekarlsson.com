import { describe, expect, it } from 'vitest';
import { findStandaloneVideoIds } from '../scripts/fetch-youtube-thumbnails.mjs';

describe('findStandaloneVideoIds', () => {
	it('finds bare, angle-bracketed and markdown links alone on a line', () => {
		const markdown = [
			'https://www.youtube.com/watch?v=GiNa2jen-lg&t=30s',
			'<https://youtu.be/0SARbwvhupQ>',
			'[Watch the talk](https://www.youtube.com/embed/1OuDyDdTDFw)',
			'[![Live coding](/images/blog/post/still.webp)](https://youtu.be/nFA2C5JgjPw)',
			'- [Create REST APIs from Kafka streams](https://youtu.be/eFnqE8c-WH4)',
		].join('\n\n');
		expect(findStandaloneVideoIds(markdown)).toEqual([
			'GiNa2jen-lg',
			'0SARbwvhupQ',
			'1OuDyDdTDFw',
			'nFA2C5JgjPw',
			'eFnqE8c-WH4',
		]);
	});

	it('skips a link inside a sentence, which stays a plain link', () => {
		expect(findStandaloneVideoIds('Watch [my talk](https://youtu.be/GiNa2jen-lg) first.')).toEqual(
			[],
		);
	});
});
