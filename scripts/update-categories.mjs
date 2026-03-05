#!/usr/bin/env node
/**
 * Update blog post categories from generic "Blog"/"Tech Talk" to specific topics.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const BLOG_DIR = new URL('../src/content/blog', import.meta.url).pathname;

// Map of filename → categories
const CATEGORY_MAP = {
	// Databases (30)
	'event-sourcing-with-kafka-a-practical-example.md': ['Databases'],
	'a-step-by-step-guide-to-build-a-real-time-dashboard.md': ['Databases'],
	'database-sharding-vs-partitioning-whats-the-difference.md': ['Databases'],
	'databases-and-devops-how-to-usesinglestore-with-github-actions.md': ['Databases', 'Dev Tools'],
	'data-warehouses-are-terrible-application-backends.md': ['Databases'],
	'four-questions-you-need-to-ask-when-choosing-a-database.md': ['Databases'],
	'from-sql-to-nosql-a-gentle-introduction-for-devs.md': ['Databases'],
	'how-to-add-machine-learning-predictions-with-singlestore-and-mindsdb.md': ['Databases'],
	'how-to-build-a-real-time-fraud-detection-system.md': ['Databases'],
	'how-to-build-applications-over-streaming-data-the-right-way.md': ['Databases'],
	'how-to-get-started-with-singlestore.md': ['Databases'],
	'how-to-manage-mongodb-data-at-scale.md': ['Databases'],
	'how-to-query-from-multiple-mongodb-databases.md': ['Databases'],
	'how-to-query-google-sheets-with-sql-in-real-time.md': ['Databases'],
	'how-to-seed-a-mongodb-database-with-fake-data.md': ['Databases'],
	'how-to-use-custom-archival-rules-and-partitioning-on-mongodb-atlas-online-archive.md': [
		'Databases',
	],
	'how-to-use-mongodb-client-side-field-level-encryption-csfle-with-node-js.md': ['Databases'],
	'how-to-use-singlestore-and-node-js.md': ['Databases'],
	'how-to-use-singlestore-as-a-key-value-store.md': ['Databases'],
	'how-to-use-the-mongodb-visual-studio-code-plugin.md': ['Databases', 'Dev Tools'],
	'linked-lists-and-mongodb-a-gentle-introduction.md': ['Databases'],
	'modern-data-management-with-real-time-change-data-capture.md': ['Databases'],
	'mongodb-aggregation-pipeline-queries-vs-sql-queries.md': ['Databases'],
	'mongodb-schema-design-best-practices.md': ['Databases'],
	'real-time-databases-what-developers-need-to-know.md': ['Databases'],
	'save-the-world-and-money-with-mongodb-atlas-data-lake.md': ['Databases'],
	'the-engineers-guide-to-enriching-streams-and-dimensions.md': ['Databases'],
	'using-bloom-filter-indexes-for-real-time-text-search-in-clickhouse.md': ['Databases'],
	'what-it-takes-to-build-a-real-time-recommendation-system.md': ['Databases'],
	'why-clickhouse-should-be-your-next-database.md': ['Databases'],
	'getting-started-with-graphql-and-atlas.md': ['Databases', 'Dev Tools'],

	// Dev Tools
	'building-high-performance-react-applications.md': ['Dev Tools'],
	'a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes.md':
		['Dev Tools', 'Databases'],
	'how-to-build-a-spotify-player-with-react-in-15-minutes.md': ['Dev Tools'],
	'complete-guide-node-client-server-communication.md': ['Dev Tools'],
	'how-to-pixelate-images-with-html5-and-javascript.md': ['Dev Tools'],
	'a-gentle-introduction-to-building-serverless-apps.md': ['Dev Tools'],
	'building-a-claude-code-blog-skill-what-i-learned-systematizing-content-creation.md': [
		'Dev Tools',
	],

	// Smart Home
	'how-to-get-started-with-home-assistant-in-2023.md': ['Smart Home'],
	'i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private.md': ['Smart Home'],
	'self-hosted-music-still-sucks-in-2025.md': ['Smart Home', 'Homelab'],

	// Homelab
	'how-to-get-started-building-a-homelab-server-in-2024.md': ['Homelab'],
	'adding-custom-domain-names-on-your-internal-network-using-nginx-proxy-manager-and-pi-hole.md': [
		'Homelab',
	],

	// Film
	'bechdel-test-script-parser-works.md': ['Film'],
	'bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive.md': ['Film'],

	// DevRel
	'developer-advocacy-in-2023.md': ['DevRel'],
	'devrel-as-dev-zero.md': ['DevRel'],
	'treat-content-development-for-your-open-source-project-like-your-open-source-project.md': [
		'DevRel',
	],
	'i-ran-my-first-hackathon-and-so-can-you.md': ['DevRel'],

	// IoT
	'an-introduction-to-iot-internet-of-toilets.md': ['IoT'],
	'iot-and-js-a-gentle-introduction-to-the-internet-of-things.md': ['IoT'],
	'from-digital-design-to-real-world-object-creating-a-3d-printed-postcard-planter-rack.md': [
		'IoT',
	],

	// Travel
	'a-brief-cuba-travel-guide.md': ['Travel'],
	'one-week-in-oahu-a-tourists-travel-itinerary.md': ['Travel'],

	// Career
	'10-things-i-learned-at-startup-weekend.md': ['Career'],
	'how-to-find-a-technical-co-founder.md': ['Career'],
	'how-to-pass-coding-interview.md': ['Career'],
	'my-top-resources-for-learning-how-to-code.md': ['Career'],
	'the-tech-talks-that-have-had-the-biggest-impact-on-my-career.md': ['Career'],
	'an-engineers-guide-to-knowing-if-you-are-done-with-a-project.md': ['Career'],
	'the-art-of-computer-science.md': ['Career'],

	// Personal
	'how-i-work.md': ['Personal'],
	'my-relationship-with-the-internet.md': ['Personal'],
	'overwhelmed-by-the-web.md': ['Personal'],
	'psa-activate-2-step-verification-on-your-email-account.md': ['Personal'],
	'how-to-explain-to-your-dad-why-snapchat-is-so-awesome.md': ['Personal'],
	'my-top-50-records.md': ['Personal'],
	'i-was-on-hawaii-public-radio-to-talk-about-the-stupid-shit-hackathon.md': ['Personal'],
};

async function main() {
	console.log('=== Updating Blog Categories ===\n');

	const files = await readdir(BLOG_DIR);
	const mdFiles = files.filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

	let updated = 0;
	let unmapped = [];

	for (const file of mdFiles.sort()) {
		const filePath = join(BLOG_DIR, file);
		const content = await readFile(filePath, 'utf-8');

		const newCats = CATEGORY_MAP[file];
		if (!newCats) {
			// Extract current categories for reporting
			const match = content.match(/^categories:\s*\[([^\]]*)\]/m);
			const current = match ? match[1] : 'none';
			unmapped.push(`  ${file} (current: ${current})`);
			continue;
		}

		const catsString = JSON.stringify(newCats);
		const newContent = content.replace(/^categories:\s*\[.*\]$/m, `categories: ${catsString}`);

		if (newContent !== content) {
			await writeFile(filePath, newContent, 'utf-8');
			updated++;
			console.log(`  ${file} → ${newCats.join(', ')}`);
		}
	}

	if (unmapped.length > 0) {
		console.log(`\nUnmapped files (${unmapped.length}):`);
		unmapped.forEach((u) => console.log(u));
	}

	console.log(`\n--- Summary ---`);
	console.log(`Updated: ${updated}`);
	console.log(`Unmapped: ${unmapped.length}`);
}

main().catch(console.error);
