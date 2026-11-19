// Astro ships `is:inline` scripts as written, comments and indentation included, and the
// head's run on every page (about 7KB of each one). Minifies classic inline scripts after
// the build, before script-csp hashes them. Module scripts Astro has already minified.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minifySync } from 'vite';

const minified = new Map();

/** One script body, minified as a classic script: top-level names stay global. */
function minifyScript(body) {
	if (!minified.has(body)) {
		const { code, errors } = minifySync('inline.js', body);
		if (errors.length) throw new Error(`Inline script won't parse: ${errors[0].codeframe}`);
		minified.set(body, code.trim());
	}
	return minified.get(body);
}

/** The page with each classic inline script minified; external, module and data scripts untouched. */
export function withMinifiedScripts(html) {
	return html.replace(
		/<script\b([^>]*)>([\s\S]*?)(<\/script\b[^>]*>)/gi,
		(tag, attributes, body, end) =>
			/\s(src|type)=/i.test(attributes) || !body.trim()
				? tag
				: `<script${attributes}>${minifyScript(body)}${end}`,
	);
}

function htmlFiles(dir) {
	return readdirSync(dir, { withFileTypes: true, recursive: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
		.map((entry) => join(entry.parentPath, entry.name));
}

export default function minifyInlineScripts() {
	return {
		name: 'minify-inline-scripts',
		hooks: {
			'astro:build:done': ({ dir, logger }) => {
				const files = htmlFiles(fileURLToPath(dir));
				for (const file of files)
					writeFileSync(file, withMinifiedScripts(readFileSync(file, 'utf8')));
				logger.info(`Minified ${minified.size} inline scripts`);
			},
		},
	};
}
