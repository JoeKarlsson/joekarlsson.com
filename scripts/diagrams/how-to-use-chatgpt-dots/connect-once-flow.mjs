export const alt =
	'Salesforce, Jira, Google Analytics, NetSuite and hundreds more business apps, including on-premises ones, connect once to CData Connect AI, which gives one sign-in, permissions and a query log. One plugin links it to your ChatGPT dot, which answers in ChatGPT, in Slack and Teams, and on a schedule.';

const APPS = [
	{ mark: 'salesforce', name: ['Salesforce'] },
	{ mark: 'jira', name: ['Jira'] },
	{ mark: 'googleanalytics', name: ['Google', 'Analytics'] },
	{ mark: 'netsuite', name: ['NetSuite'] },
	{ mark: 'boxes', name: ['Hundreds more', 'incl. on-premises'] },
];

const OUTPUTS = [
	{ label: ['Answers in', 'ChatGPT'], logo: 'openai' },
	{ label: ['Slack and', 'Teams'], logo: 'slack' },
	{ label: ['Scheduled', 'checks'], icon: 'calendar-clock' },
];

/** An app as its logo or icon with its name under it. */
function app(f, { mark, name }, cx, y) {
	f.logo(mark, cx - f.logoWidth(mark, 28) / 2, y, 28);
	name.forEach((line, i) =>
		f.text(cx, y + 32 + i * 18, line, {
			size: 14,
			weight: i ? 400 : 600,
			color: i ? '#a3a3a3' : '#ededed',
		}),
	);
}

export const desktop = {
	height: 590,
	draw(f) {
		f.group({ x: 16, y: 34, w: 608, h: 120, label: 'Your business apps' });
		const centers = [76, 198, 320, 442, 564];
		APPS.forEach((a, i) => app(f, a, centers[i], 66));
		centers.forEach((cx) =>
			f.arrow(
				[
					[cx, 156],
					[cx, 176],
					[320, 176],
					[320, 200],
				],
				{ heads: 'both' },
			),
		);
		f.box({
			x: 170,
			y: 202,
			w: 300,
			h: 124,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: ['one sign-in', 'permissions', 'a query log'],
		});
		f.arrow(
			[
				[320, 328],
				[320, 384],
			],
			{ heads: 'both' },
		);
		f.note(334, 356, 'one plugin', { weight: 700 });
		f.box({
			x: 190,
			y: 386,
			w: 260,
			h: 60,
			kind: 'pink',
			label: 'Your ChatGPT dot',
			logo: 'openai',
		});
		const outs = [110, 320, 530];
		outs.forEach((cx) =>
			f.arrow([
				[320, 448],
				[320, 470],
				[cx, 470],
				[cx, 494],
			]),
		);
		OUTPUTS.forEach((o, i) => f.box({ x: outs[i] - 100, y: 496, w: 200, h: 70, size: 16, ...o }));
	},
};

export const phone = {
	height: 700,
	draw(f) {
		f.group({ x: 8, y: 34, w: 344, h: 190, label: 'Your business apps' });
		[0, 1, 2].forEach((i) => app(f, APPS[i], [66, 180, 294][i], 64));
		[3, 4].forEach((i) => app(f, APPS[i], [118, 242][i - 3], 150));
		f.arrow(
			[
				[180, 226],
				[180, 268],
			],
			{ heads: 'both' },
		);
		f.box({
			x: 40,
			y: 270,
			w: 280,
			h: 124,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: ['one sign-in', 'permissions', 'a query log'],
		});
		f.arrow(
			[
				[180, 396],
				[180, 442],
			],
			{ heads: 'both' },
		);
		f.note(194, 419, 'one plugin', { weight: 700 });
		f.box({
			x: 40,
			y: 444,
			w: 280,
			h: 60,
			kind: 'pink',
			label: 'Your ChatGPT dot',
			logo: 'openai',
		});
		const outs = [64, 180, 296];
		outs.forEach((cx) =>
			f.arrow([
				[180, 506],
				[180, 526],
				[cx, 526],
				[cx, 550],
			]),
		);
		OUTPUTS.forEach((o, i) =>
			f.box({ x: outs[i] - 54, y: 552, w: 108, h: 120, size: 14, stack: true, ...o }),
		);
	},
};
