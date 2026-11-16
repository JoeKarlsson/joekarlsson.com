// One share of markdown-pages.mjs's pages, converted on its own thread
import { parentPort, workerData } from 'node:worker_threads';
import { writeMarkdownPages } from './markdown-pages.mjs';

parentPort.postMessage(await writeMarkdownPages(workerData.distDir, workerData.files));
