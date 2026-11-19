import { describe, expect, it } from 'vitest';
import { withMinifiedScripts } from '../src/integrations/minify-inline-scripts.mjs';

describe('minify-inline-scripts', () => {
	it('minifies classic inline scripts and keeps their top-level names global', () => {
		const out = withMinifiedScripts(
			'<script>\n\t// a note\n\tconst visitors = [1, 2];\n\tfunction draw() {}\n</script>',
		);

		expect(out).not.toContain('a note');
		expect(out).toMatch(/visitors/);
		expect(out).toMatch(/draw/);
	});

	it('leaves module, external and data scripts alone', () => {
		const html = [
			'<script type="module">  a ( )  </script>',
			'<script src="/x.js"></script>',
			'<script type="application/ld+json">{ "a": 1 }</script>',
			'<script type="speculationrules">{ "prefetch": [] }</script>',
		].join('');

		expect(withMinifiedScripts(html)).toBe(html);
	});

	it('fails the build on a script that will not parse', () => {
		expect(() => withMinifiedScripts('<script>var a = (;</script>')).toThrow(/won't parse/);
	});
});
