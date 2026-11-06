export const alt =
	'One CData Connect AI gateway serves three agents: an HR assistant, a finance monitor and a sales analyst. Each connects to its own workspace, with its own toolkit and read-only access: HR to people tools on SQL Server, finance to finance tools on BigQuery, and sales to opportunity tools on Salesforce.';

const AGENTS = [
	['HR', 'assistant'],
	['Finance', 'monitor'],
	['Sales', 'analyst'],
];
const WORKSPACES = [
	['HR', 'people.*'],
	['Finance', 'finance.*'],
	['Sales', 'opps.*'],
];
const SOURCES = [
	['SQL Server', 'database'],
	['BigQuery', 'googlebigquery'],
	['Salesforce', 'salesforce'],
];

export const desktop = {
	height: 500,
	draw(f) {
		const xs = [30, 245, 460];
		xs.forEach((x, i) => {
			const cx = x + 75;
			f.box({ x, y: 30, w: 150, h: 60, label: AGENTS[i], size: 16, icon: 'bot' });
			f.arrow(
				[
					[cx, 92],
					[cx, 150],
				],
				{ heads: 'both' },
			);
		});
		f.box({ x: 20, y: 152, w: 600, h: 214, kind: 'chalk' });
		f.logo('connect-ai', 320 - f.logoWidth('connect-ai', 24) / 2, 180, 24, 'chalk');
		xs.forEach((x, i) => {
			const [name, toolkit] = WORKSPACES[i];
			f.box({
				x: x + 5,
				y: 212,
				w: 140,
				h: 136,
				label: [name, 'workspace'],
				sub: ['toolkit:', toolkit, 'read-only'],
				size: 16,
				subSize: 14,
			});
		});
		xs.forEach((x, i) => {
			const cx = x + 75;
			const [name, logo] = SOURCES[i];
			f.arrow(
				[
					[cx, 368],
					[cx, 420],
				],
				{ heads: 'both' },
			);
			f.box({ x, y: 422, w: 150, h: 56, label: name, logo, size: 15 });
		});
	},
};

export const phone = {
	height: 546,
	draw(f) {
		const xs = [16, 128, 240];
		xs.forEach((x, i) => {
			const cx = x + 52;
			f.box({ x, y: 20, w: 104, h: 88, label: AGENTS[i], size: 14, icon: 'bot', stack: true });
			f.arrow(
				[
					[cx, 110],
					[cx, 162],
				],
				{ heads: 'both' },
			);
		});
		f.box({ x: 8, y: 164, w: 344, h: 236, kind: 'chalk' });
		f.logo('connect-ai', 180 - f.logoWidth('connect-ai', 22) / 2, 190, 22, 'chalk');
		xs.forEach((x, i) => {
			const [name, toolkit] = WORKSPACES[i];
			f.box({
				x,
				y: 222,
				w: 104,
				h: 160,
				label: [name],
				sub: ['workspace', 'toolkit:', toolkit, 'read-only'],
				size: 14,
				subSize: 14,
			});
		});
		xs.forEach((x, i) => {
			const cx = x + 52;
			const [name, logo] = SOURCES[i];
			f.arrow(
				[
					[cx, 402],
					[cx, 446],
				],
				{ heads: 'both' },
			);
			f.logo(logo, cx - f.logoWidth(logo, 28) / 2, 470, 28);
			f.text(cx, 506, name, { size: 14, weight: 600 });
		});
	},
};
