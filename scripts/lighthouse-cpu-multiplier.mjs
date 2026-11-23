#!/usr/bin/env node
/**
 * Prints the CPU slowdown Lighthouse CI should use on this machine.
 *
 *   node scripts/lighthouse-cpu-multiplier.mjs   # prints e.g. 2.45
 *
 * Lighthouse's CPU throttling is relative to the machine it runs on, and GitHub's runners come
 * in two speeds: Lighthouse's benchmarkIndex was about 2,400 on the slow ones and 3,500-4,500 on
 * the fast ones (Nov 2026). With a fixed 4x the slow runners simulated a slower phone, and
 * /reviews/stats/ failed the 150 ms blocking-time gate on every slow runner and passed on every
 * fast one. Lighthouse's throttling docs say to calibrate to the device
 * (github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md), so this measures the runner
 * and scales 4x to it: every runner then simulates the phone a 4,000 runner does at 4x, the
 * machine the gates in .lighthouserc.json were measured on.
 */
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const REFERENCE_INDEX = 4000;
const REFERENCE_MULTIPLIER = 4;

/** The slowdown that makes a machine with this benchmarkIndex simulate the reference phone. */
export function cpuMultiplier(benchmarkIndex) {
	if (!(benchmarkIndex > 0)) throw new Error(`benchmarkIndex must be positive, got ${benchmarkIndex}`);
	return Math.max(1, Math.round((REFERENCE_MULTIPLIER * benchmarkIndex * 100) / REFERENCE_INDEX) / 100);
}

async function measureBenchmarkIndex() {
	const chromeLauncher = await import('chrome-launcher');
	const { default: lighthouse } = await import('lighthouse');
	const server = http.createServer((_, res) => res.end('<!doctype html><title>cpu</title><p>cpu'));
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
	const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new'] });
	try {
		const url = `http://127.0.0.1:${server.address().port}/`;
		const indexes = [];
		for (let i = 0; i < 3; i++) {
			const result = await lighthouse(url, {
				port: chrome.port,
				onlyAudits: ['viewport'],
				logLevel: 'error',
			});
			indexes.push(result.lhr.environment.benchmarkIndex);
		}
		return indexes.sort((a, b) => a - b)[1];
	} finally {
		await chrome.kill();
		server.close();
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const index = await measureBenchmarkIndex();
	const multiplier = cpuMultiplier(index);
	console.error(`benchmarkIndex ${Math.round(index)} -> cpuSlowdownMultiplier ${multiplier}`);
	console.log(multiplier);
}
