import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { projects } from '../../data/projects';
import { DEFAULT_OG_IMAGE, ogJpegPath } from '../../utils/og-image';

// Every image a page can pass to BaseHead as its share image. A page that passes an image
// missing here gets an og:image that 404s; tests/build-output.test.ts catches that.
export async function getStaticPaths() {
	const blog = await getCollection('blog');
	const newsletter = await getCollection('newsletter');
	const images = new Set<string>([
		DEFAULT_OG_IMAGE,
		'/images/uses/desk-2026.webp',
		...projects.map((p) => p.image),
		...[...blog, ...newsletter].flatMap((entry) => entry.data.heroImage ?? []),
	]);
	return [...images]
		.filter((image) => !/^https?:\/\//.test(image))
		.map((image) => ({
			params: {
				path: ogJpegPath(image)
					.replace(/^\/og\//, '')
					.replace(/\.jpg$/, ''),
			},
			props: { source: resolve('public', image.replace(/^\//, '')) },
		}));
}

export const GET: APIRoute = async ({ props }) => {
	// An animated card (a boiling diagram thumbnail) shares its last frame, where the
	// animation ends on its finished state; sharp reads the first unless told
	const { pages = 1 } = await sharp(props.source).metadata();
	const jpeg = await sharp(props.source, { page: pages - 1 })
		.resize(1200, 630, { fit: 'cover' })
		.flatten({ background: '#000000' })
		.jpeg({ quality: 82, mozjpeg: true })
		.toBuffer();
	return new Response(new Uint8Array(jpeg), { headers: { 'Content-Type': 'image/jpeg' } });
};
