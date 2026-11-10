// GitHub rejects a workflow file it can't parse (a job key defined twice, say)
// without running any job, including the ntfy failure alert, so CI goes quiet
// instead of red. That happened from Nov 6 to Nov 9 2026. This runs in
// `npm test`, so the pre-push hook stops a broken workflow before GitHub sees it.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseDocument } from 'yaml';

export function findWorkflowErrors(text) {
	const doc = parseDocument(text, { uniqueKeys: true });
	const errors = doc.errors.map((error) => error.message);
	if (errors.length === 0 && !doc.get('jobs')) errors.push('no `jobs:` section');
	// A tag like @v7 can be moved to new code by whoever controls the action's repo, and
	// these jobs hold write tokens. Pin each action to a commit (security audit run-1);
	// Dependabot keeps the SHAs and their # vX comments current.
	for (const [, action] of text.matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)) {
		if (!action.startsWith('./') && !/@[0-9a-f]{40}$/.test(action)) {
			errors.push(`${action} is not pinned to a commit SHA`);
		}
	}
	return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const dir = '.github/workflows';
	let failed = false;
	for (const file of readdirSync(dir).filter((name) => /\.ya?ml$/.test(name))) {
		const errors = findWorkflowErrors(readFileSync(join(dir, file), 'utf8'));
		for (const message of errors) console.error(`${dir}/${file}: ${message}`);
		failed ||= errors.length > 0;
	}
	if (failed) process.exit(1);
	console.log('Workflow files parse cleanly');
}
