import fs from 'node:fs';
import path from 'node:path';

import { visit } from 'unist-util-visit';
import { localImageSize } from '../utils/image-size.mjs';

const PUBLIC_DIR = 'public';

/**
 * Swap <img src="foo.gif"> or <img src="foo.webp"> for a <video> when a sibling
 * foo.mp4 exists.
 *
 * Animated GIF and animated WebP are both wildly inefficient - the h264
 * versions in public/images run 50-95% smaller. Rewriting at build time means
 * markdown keeps referencing the original and posts never need editing; drop an
 * .mp4 beside it (see scripts/convert-gifs-to-video.sh and
 * scripts/convert-animated-webp-to-video.mjs) and it gets picked up.
 *
 * Existence of the sibling .mp4 is the whole test, which is what makes it safe
 * to probe .webp at all: the converters only ever emit one for an animated
 * source, so the site's several hundred still WebPs are untouched. The one way
 * to fool it is to park an unrelated foo.mp4 next to a still foo.webp.
 *
 * Anything with no .mp4 sibling is left alone, so this is safe to run against a
 * partially converted image directory.
 *
 * controls is deliberate: an autoplaying loop with no way to stop it fails
 * WCAG 2.2.2, and these clips run well past five seconds.
 */
export default function rehypeGifVideo() {
	return async (tree) => {
		const withPosters = [];
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName !== 'img' || !node.properties?.src) return;
			if (!parent || index === null) return;

			const src = String(node.properties.src);
			if (!/\.(gif|webp)$/i.test(src)) return;

			const mp4Src = src.replace(/\.(gif|webp)$/i, '.mp4');

			// src is site-absolute (/images/...), which maps onto public/
			const mp4Path = path.join(PUBLIC_DIR, mp4Src.replace(/^\//, ''));
			if (!fs.existsSync(mp4Path)) return;

			const alt = node.properties.alt ? String(node.properties.alt) : '';
			// An optional foo-poster.webp beside foo.mp4 shows until the clip loads.
			const posterSrc = mp4Src.replace(/\.mp4$/, '-poster.webp');
			const hasPoster = fs.existsSync(path.join(PUBLIC_DIR, posterSrc.replace(/^\//, '')));

			const video = {
				type: 'element',
				tagName: 'video',
				properties: {
					src: mp4Src,
					// Played and paused by src/scripts/in-view-play.ts as it scrolls in
					// and out of view, so nothing downloads until it's about to be seen.
					dataAutoplayInView: true,
					loop: true,
					muted: true,
					playsinline: true,
					controls: true,
					preload: 'none',
					// data-poster, not poster: a poster downloads at load, so a page of clips
					// fetched every still before its hero. in-view-play.ts sets it as the clip
					// nears the screen; width and height hold its space until then.
					...(hasPoster ? { dataPoster: posterSrc } : {}),
					// The GIF's alt text names the clip. No role="img": axe flags it
					// on a <video>, and it never stopped axe asking for a manual
					// captions review either (these clips have no sound).
					'aria-label': alt,
					className: ['gif-video'],
				},
				children: [{ type: 'text', value: alt }],
			};
			parent.children[index] = video;
			if (hasPoster) withPosters.push(video);
		});
		for (const video of withPosters) {
			const { width, height } = await localImageSize(video.properties.dataPoster);
			Object.assign(video.properties, { width, height });
		}
	};
}
