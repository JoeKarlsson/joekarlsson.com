#!/usr/bin/env node
/**
 * Apply AI-generated alt text from batches 4-6 to blog markdown files.
 * Matches images by their current (weak) alt text and replaces with descriptive text.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, basename } from 'path';

const BLOG_DIR = new URL('../src/content/blog', import.meta.url).pathname;

// Map of old alt text → new descriptive alt text
const ALT_TEXT_MAP = {
	// Batch 4 - Oahu travel, how-i-work, Cuba, Craigslist, MongoDB
	'Download 4': 'Exotic tropical fruits at Honolulu Chinatown market stall',
	'Download 3': 'Koko Head trail stairs leading up the steep green hillside',
	'Download 1 1': 'Waimanalo Beach with turquoise water and dramatic mountain cliffs',
	'Download 2 1': 'Catamaran booze cruise boat anchored near Waikiki shoreline',
	'Download 3 1': 'Outdoor vendor stalls at Aloha Stadium Swap Meet',
	'Download 6': 'Aerial view of Dole Plantation pineapple-shaped hedge maze',
	'Beach wallpaper 1366x768 sunset over hawaiian beach beach wallpaper':
		'Golden sunset over Hawaiian beach with mountain silhouette',
	'Download 1 2': 'Diners seated on floor cushions at Banzai Sushi with red lanterns',
	'Download 2 2': 'The Spot food truck at Sharks Cove on North Shore',
	'Download 3 2': 'Two people doing yoga on paddleboards at Ala Moana Beach',
	'IMG 2685': 'Dual monitor desk setup with pink ambient backlighting and microphone',
	'IMG 2687': 'MacBook Air in vertical stand with pink Hue Play backlight',
	'IMG 2688': 'Under-desk cable management tray with tangled cables and pink glow',
	'Picadillo habanero 00': 'Plate of Cuban picadillo with rice and olives',
	'Comer barato en cuba pizza en trinidad': 'Cuban ham and cheese pizza on a plate',
	'IMG 1698': 'Cuban hamburger sandwich with ham patty and lettuce on a plate',
	'5109552558.html': 'Craigslist ad offering weekly beer stipend instead of pay for iOS developer',
	'5112497622.html': 'Craigslist ad seeking app developer for a million dollar idea',
	'1024x965': 'MongoDB Atlas connection dialog showing Cluster and Online Archive option',
	'IMG 2349': 'Hand holding a smart home voice assistant device with black cat watching',

	// Batch 5 - Google Sheets, MongoDB VSCode, MindsDB, sharding, CDC, SingleStore
	'D WZo Nh7oEuIoOwgCG itm9UH7 5nJkQtmd2J1K8JkuDTXGCbPq58XQlutZ':
		'Mac Force Quit dialog meme about Google Sheets loading too many rows',
	'Create apps script':
		'Google Sheets Extensions menu showing Apps Script option with shopping data',
	Appscript: 'Google Apps Script editor with Tinybird data sync code and execution log',
	'Api thumb 1': 'Tinybird SQL pipe querying customer shopping trends with API endpoint',
	'Atlas tiers 4f3f126eb9':
		'MongoDB Atlas cluster tier selection showing free, shared, and dedicated options',
	'Mongodb free teir a05d7b15e8':
		'MongoDB Atlas cloud provider and region selection for free tier cluster',
	'Vscode enter connection string b785102dae':
		'VS Code input field prompting for MongoDB connection string',
	'Vscode connections 72837b6be9':
		'VS Code MongoDB sidebar showing connected cluster with databases listed',
	'Mongodb vscode list documents 93b4799ade':
		'VS Code MongoDB sidebar showing document IDs in a collection',
	'Vscode view documents 869c85ac8e':
		'VS Code showing MongoDB linked list documents as JSON with context menu',
	'Mongodb vscode list schema a9e524af5c':
		'VS Code MongoDB sidebar displaying collection schema fields',
	'Vscode command pallete ee5840feb9': 'VS Code View menu highlighting Command Palette option',
	'Vscode add monogdb collection e7a65bf4de': 'VS Code prompt to enter new MongoDB collection name',
	'Vscode command palette 9c085765fe': 'VS Code prompt to enter new MongoDB database name',
	'Screenshot 08 18 at 17 24 1':
		'MindsDB connect to database and datasource integration dialogs for SingleStore',
	'Train new predictor':
		'MindsDB train new predictor dialog selecting smoker column for BMI prediction',
	'New query modal': 'MindsDB new query modal using BMI Predictor with smoker and children inputs',
	'Predicted bmi': 'MindsDB prediction result showing BMI of 25.12 with 46% confidence',
	'Diagram employee partition':
		'Vertical partitioning splitting Employee table into Employee and EmployeePicture tables',
	'Diagram load balanced partition placement':
		'Load-balanced partition placement across nodes in two availability groups',
	'Diagram shard key': 'Shard key example distributing people table rows by first name column',
	'Image 12 2':
		'CDC architecture diagram showing users, API, database, CDC tool, and message queue',
	'Create managed cluster buttons':
		'SingleStore portal with Create Cluster and Create Managed Cluster buttons highlighted',
	'Image 1 1':
		'Architecture diagram showing Events to Tinybird to Next.js to Tremor to Visualization',

	// Batch 6 - MongoDB Stitch, Spotify, streaming architecture, React perf, GIFs
	'EiuS UB08oHnOgB3TWbzPg': 'MongoDB Atlas left navigation showing Stitch Apps option',
	'K74T D89AdAMvi1pvGdQvA': 'MongoDB Stitch Create New Application button',
	'QZJMPVW p9VfYKI52vdx5g': 'Naming a new Stitch application TodoTutorial',
	JZ6jXYhaTsxkyO2oQfeaVw: 'Stitch UI left navigation showing Rules under MongoDB Atlas',
	'VgZ OI69Q7IqPRLS4yB5Gg': 'Add Collection dialog with todos database and item collection',
	HvsC4xkKircXYDgQHUmrOQ: 'Enabling Read and Write permissions for the default role',
	CKCcQ7cu4nfiv3tzrY2MQg: 'Completed React and MongoDB Stitch todo app demo',
	Q8TqczPy9qXktRPtwTsUZw: 'Spotify Developer Dashboard showing My New App button',
	'MYgEks YVy9 n1N5AjiGUw': 'Spotify app registration form',
	'VwwrjL8TM Ityqs6M3sB8Q': 'Spotify app Edit Settings button',
	'Tb4PLnsPM1MupL dMgh1xA': 'Setting redirect URL to localhost:3000 in Spotify app settings',
	Hz5eVZX6IbrXvwb2qEUcRA: 'Finished React Spotify player app demo',
	'1615e62b image3 e1690299751174':
		'Fraud detection architecture combining Kafka streams with Snowflake warehouse data',
	'E59ad9e7 image2 e1690300048853':
		'E-commerce personalization architecture joining Kafka transactions with product data',
	'74a7b57b image1 e1690300220768':
		'Log analytics architecture comparing streaming events with historical data',
	'98f17df0 image1': 'Typical real-time streaming data architecture diagram',
	'5a39a252 image2': 'Simplified streaming architecture using a real-time data platform',
	'6d5d5116 image1': 'Tinybird publishing a SQL query as an API endpoint',
	'64f2397e26737f58a3a8e5b2 RJqiXc4ZybopbNjI9ySkEeBL37h3SMQ7QE5yqkmAjfHKNho7ZJj08kuF7cu0OQL8WQ1izPa6wV4GCjiImJdYM7bRlAAPVRqkEypjP u2caVYBF3wXHp8y2CHMCm55uNR3POgx8hW5brl67iCM0HGpJM 7':
		'Animated real-time dashboard serving fresh data to concurrent users',
	'64f2398091cf83b3815b7b50 ZRt0Lu1RnKqHxkqJOBdNYJu1uuSj9E8MGpHtCWPgM8MzEen LaVw9rvJuvZQ616mmFodnS2RL9eQcgz6AtgmM602mnLdaiE06dOx5yreIcda30HzQ9clCGXatPuOsbRNr3aIxOH0 Aq1e6CbTOOaBK4 7':
		'Terminal output showing mock data being sent to Tinybird',
	'Image 14': 'Data seeding script sending mock data to Tinybird',
	'64f2397ff675358d751697ce eMd481MY7ykvzW9gjULlu31kUGuKfKxTFElfoWlkshBd DwNYcKEWUaeR3PB5YBxHmuo9l8kbxVIIjbHVDKDpfuUR6AKVTiOvUXeT0tcPT1TiE5y3czitN0WoHW76rZ7IF87Xe0LC00JcdCTQyogcdA 7':
		'Tinybird Pipe SQL node filtering signatures by account and date range',
	'Image 18': 'Bloom filter query time and scan size benchmark results',
	'Image 7 1': 'Tinybird UI showing how to add a new Pipe',
	'OVVNvjti wCFwDx': 'Chrome DevTools React performance profiling tab',
	KU08TdKUInB7duKPVnM4ow:
		'Performance comparison showing render time drop from 34ms to 16ms with keys',
	'UL63s4lQc9Yfv Lx Twc1g': 'Shallow vs deep comparison of JavaScript objects',
	'King of queens giphy': 'Frustrated reaction GIF about complicated setup',
	'Man sipping straw': 'Waiting patiently GIF while cluster deploys',
	'Scrubs high five': 'Celebratory high five GIF',
	'Psychic woman': 'Mind-reading prediction GIF',
	'Moira schitts creek im busy': 'Waiting impatiently GIF while cluster deploys',
	'DALL%C2%B7E 2023 03 28 15.51.00 internal collaboration for developer advocacy in the style of clip art 1024x1024':
		'Clip art illustration of internal collaboration for developer advocacy',
};

async function main() {
	console.log('=== Applying AI-generated alt text (Batches 4-6) ===\n');

	const files = await readdir(BLOG_DIR);
	const mdFiles = files.filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

	let totalChanges = 0;
	let filesChanged = 0;

	for (const file of mdFiles.sort()) {
		const filePath = join(BLOG_DIR, file);
		let content = await readFile(filePath, 'utf-8');
		let changed = false;

		for (const [oldAlt, newAlt] of Object.entries(ALT_TEXT_MAP)) {
			// Escape special regex chars in the old alt text
			const escaped = oldAlt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			// Match ![oldAlt](anything)
			const regex = new RegExp(`!\\[${escaped}\\]\\(([^)]+)\\)`, 'g');

			const newContent = content.replace(regex, (match, imgPath) => {
				totalChanges++;
				changed = true;
				return `![${newAlt}](${imgPath})`;
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
