import fs from 'node:fs';
import path from 'node:path';

import { visit } from 'unist-util-visit';

const PUBLIC_DIR = 'public';

/**
 * Swap <img src="foo.gif"> for a <video> when a sibling foo.mp4 exists.
 *
 * Animated GIFs are wildly inefficient - the h264 versions in public/images
 * run about 80% smaller. Rewriting at build time means markdown keeps
 * referencing the .gif and posts never need editing; drop an .mp4 next to a
 * .gif (see scripts/convert-gifs-to-video.sh) and it gets picked up.
 *
 * A GIF with no .mp4 sibling is left alone, so this is safe to run against a
 * partially converted image directory.
 *
 * controls is deliberate: an autoplaying loop with no way to stop it fails
 * WCAG 2.2.2, and these clips run well past five seconds.
 */
export default function rehypeGifVideo() {
	return (tree) => {
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName !== 'img' || !node.properties?.src) return;
			if (!parent || index === null) return;

			const src = String(node.properties.src);
			if (!src.toLowerCase().endsWith('.gif')) return;

			const mp4Src = src.replace(/\.gif$/i, '.mp4');

			// src is site-absolute (/images/...), which maps onto public/
			const mp4Path = path.join(PUBLIC_DIR, mp4Src.replace(/^\//, ''));
			if (!fs.existsSync(mp4Path)) return;

			const alt = node.properties.alt ? String(node.properties.alt) : '';

			parent.children[index] = {
				type: 'element',
				tagName: 'video',
				properties: {
					src: mp4Src,
					autoplay: true,
					loop: true,
					muted: true,
					playsinline: true,
					controls: true,
					preload: 'metadata',
					// These are silent screen recordings standing in for GIFs, so
					// they are animated images rather than media. role=img says that
					// to assistive tech and keeps axe's video-caption rule - which
					// assumes spoken audio - from demanding a captions track.
					role: 'img',
					'aria-label': alt,
					className: ['gif-video'],
				},
				children: [{ type: 'text', value: alt }],
			};
		});
	};
}
