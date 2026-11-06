import sharp from 'sharp';

// From the project root, where Astro runs: once this is bundled into a page,
// import.meta.url points inside dist/
const PUBLIC_DIR = `${process.cwd()}/public/`;

/**
 * The intrinsic width and height of an image served from public/, for an <img>'s
 * width and height attributes: the browser reserves the space before the file loads,
 * so the text under it doesn't jump. CSS (`height: auto`) still scales it to its slot.
 *
 * A missing file throws, so a broken image fails the build instead of shipping.
 */
export async function localImageSize(src, publicDir = PUBLIC_DIR) {
	const path = publicDir + decodeURIComponent(src.split(/[?#]/)[0]).slice(1);
	const { width, height } = await sharp(path)
		.metadata()
		.catch((error) => {
			throw new Error(`Image ${src} not found in public/: ${error.message}`);
		});
	return { width, height };
}
