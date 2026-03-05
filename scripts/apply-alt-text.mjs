#!/usr/bin/env node
/**
 * Apply AI-generated alt text to blog markdown files.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, basename } from 'path';

const BLOG_DIR = new URL('../src/content/blog', import.meta.url).pathname;

const ALT_TEXT_MAP = {
	// Batch 1 - event-sourcing-with-kafka
	'/images/blog/event-sourcing-with-kafka-a-practical-example/image.webp':
		'Data flow diagram showing deposit, withdrawal, and transfer events flowing through Kafka topics to a consumer',
	'/images/blog/event-sourcing-with-kafka-a-practical-example/image-1.webp':
		'Timeline showing event sourcing with snapshots, replaying four balance events from $100 to $75',
	'/images/blog/event-sourcing-with-kafka-a-practical-example/image-4.webp':
		'Tinybird UI showing the transaction snapshots copy pipe with SQL query',
	'/images/blog/event-sourcing-with-kafka-a-practical-example/image-3.webp':
		'Tinybird context menu showing Duplicate Pipe option for the transaction snapshots copy pipe',
	'/images/blog/event-sourcing-with-kafka-a-practical-example/image-2.webp':
		'Tinybird UI showing the current account balance pipe with Create API Endpoint dropdown',

	// Batch 1 - real-time-dashboard
	'/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-16.webp':
		'Hide the Pain Harold meme about looking at a real-time dashboard instead of a spreadsheet',
	'/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-14.webp':
		'Terminal output showing npm run seed sending account and signature data to Tinybird',
	'/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-11.webp':
		'Tinybird create workspace dialog with signature_dashboard workspace name',
	'/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-5.webp':
		'Tinybird auth tokens management page showing workspace and user tokens',
	'/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-10.webp':
		'Tinybird signatures data source showing 2k rows with ingestion graph and data preview',
	'/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-9.webp':
		'Tinybird retrieve_signatures pipe node with SQL query using dynamic date parameters',
	'/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-7.webp':
		'Tinybird endpoint pipe node with SQL joining signatures and accounts to rank organizations',
	'/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-15.webp':
		'Tinybird pipe overview showing ranking_of_top_organizations with four dynamic parameters',
	'/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-12.webp':
		'Tinybird Create API Endpoint dropdown selecting the endpoint node',
	'/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-13.webp':
		'Tinybird API sample usage showing HTTP endpoint URL and JSON response with organization rankings',
	'/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-8.webp':
		'Bar chart of top organizations creating signatures with tooltip showing Wuckert Group at 1136',
	'/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-6.webp':
		'Complete real-time dashboard with bar chart, line chart, activities table, and verified users donut chart',

	// Batch 2 - bloom-filter-indexes
	'/images/blog/using-bloom-filter-indexes-for-real-time-text-search-in-clickhouse/image-8.gif':
		'Animated needle in a haystack illustration',
	'/images/blog/using-bloom-filter-indexes-for-real-time-text-search-in-clickhouse/image-18.webp':
		'Bar chart showing scan size reduction across Bloom filter configurations',
	'/images/blog/using-bloom-filter-indexes-for-real-time-text-search-in-clickhouse/image-7.gif':
		'Animated diagram of Bloom filter hashing Hello into a bit array',
	'/images/blog/using-bloom-filter-indexes-for-real-time-text-search-in-clickhouse/image-2.webp':
		'Table of ngrambf_v1 Bloom filter test configurations and parameters',
	'/images/blog/using-bloom-filter-indexes-for-real-time-text-search-in-clickhouse/image-4.webp':
		'Table comparing query time and speedup for Bloom filter configurations',
	'/images/blog/using-bloom-filter-indexes-for-real-time-text-search-in-clickhouse/image-5.webp':
		'Table comparing data scanned and scan size reduction per configuration',
	'/images/blog/using-bloom-filter-indexes-for-real-time-text-search-in-clickhouse/image-3.webp':
		'Table of combined speedup and scan reduction results per configuration',
	'/images/blog/using-bloom-filter-indexes-for-real-time-text-search-in-clickhouse/image-1.webp':
		'Table of compressed Bloom filter index sizes versus column data size',

	// Batch 2 - fraud-detection
	'/images/blog/how-to-build-a-real-time-fraud-detection-system/image-7-1024x613.webp':
		'Tinybird dashboard showing transactions data source with ingestion graph',
	'/images/blog/how-to-build-a-real-time-fraud-detection-system/image-10-1024x686.webp':
		'Tinybird Pipe editor with SQL query counting declined transactions per user',
	'/images/blog/how-to-build-a-real-time-fraud-detection-system/image-1.webp':
		'Tinybird transactions data source showing streamed rows with fraud fields',
	'/images/blog/how-to-build-a-real-time-fraud-detection-system/image-7.webp':
		'Tinybird dashboard showing transactions data source with ingestion graph',

	// Batch 2 - mongodb
	'/images/blog/how-to-use-mongodb-client-side-field-level-encryption-csfle-with-node-js/d2c1030de0b2c0ceb58e2c4e5c000d1575cf3902.webp':
		'Terminal showing npm install errors for libmongocrypt static linking',
	'/images/blog/how-to-manage-mongodb-data-at-scale/54043a0d68774605663ff8db091510960f96e958.gif':
		'Animated celebration GIF of people dancing',
	'/images/blog/how-to-manage-mongodb-data-at-scale/49c82ef8426d2c44a93bcd26bf71c5be6a16dbe9.webp':
		'MongoDB Compass showing sample_mflix.comments collection with 50303 documents',

	// Batch 3
	'/images/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/image-840x1024.webp':
		'Home Assistant automations list showing voice assist commands',
	'/images/blog/what-it-takes-to-build-a-real-time-recommendation-system/image-15.webp':
		'Diagram comparing content-based and collaborative filtering approaches',
	'/images/blog/what-it-takes-to-build-a-real-time-recommendation-system/image-11-1024x642.webp':
		'Content-based versus collaborative filtering recommendation system flowchart',
	'/images/blog/bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive/download-1024x586.webp':
		'Tweet by Laurie Voss about applying the Bechdel test to code',
	'/images/blog/how-to-query-google-sheets-with-sql-in-real-time/image.webp':
		'Tinybird workspace showing customer shopping trends data source table',
	'/images/blog/real-time-databases-what-developers-need-to-know/image-17.webp':
		'PostgreSQL official website homepage in a browser window',
	'/images/blog/modern-data-management-with-real-time-change-data-capture/image-16-1024x577.webp':
		'Browser sending events to a database via change data capture code',
	'/images/blog/one-week-in-oahu-a-tourists-travel-itinerary/download-1024x640.webp':
		'Aerial view of Hanauma Bay with turquoise water and green hillside',
	'/images/blog/one-week-in-oahu-a-tourists-travel-itinerary/proxy.duckduckgo.webp':
		'Vibrant sunset over Lanikai Beach with the Mokulua Islands',
	'/images/blog/one-week-in-oahu-a-tourists-travel-itinerary/download-1.webp':
		'Assorted mochi ice cream on a dark plate with fresh berries',
	'/images/blog/one-week-in-oahu-a-tourists-travel-itinerary/download-5.webp':
		'Outdoor fruit market in Honolulu Chinatown with tropical produce',
};

async function main() {
	console.log('=== Applying AI-generated alt text ===\n');

	const files = await readdir(BLOG_DIR);
	const mdFiles = files.filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

	let totalChanges = 0;
	let filesChanged = 0;

	for (const file of mdFiles.sort()) {
		const filePath = join(BLOG_DIR, file);
		let content = await readFile(filePath, 'utf-8');
		let changed = false;

		for (const [imgPath, altText] of Object.entries(ALT_TEXT_MAP)) {
			// Match ![anything](imgPath) and replace the alt text
			const escaped = imgPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const regex = new RegExp(`!\\[([^\\]]*)\\]\\(${escaped}\\)`, 'g');

			const newContent = content.replace(regex, (match, oldAlt) => {
				if (oldAlt !== altText) {
					totalChanges++;
					changed = true;
					return `![${altText}](${imgPath})`;
				}
				return match;
			});
			content = newContent;
		}

		if (changed) {
			await writeFile(filePath, content, 'utf-8');
			filesChanged++;
			console.log(`  Updated: ${file}`);
		}
	}

	console.log(`\n--- Summary ---`);
	console.log(`Files updated: ${filesChanged}`);
	console.log(`Alt texts replaced: ${totalChanges}`);
}

main().catch(console.error);
