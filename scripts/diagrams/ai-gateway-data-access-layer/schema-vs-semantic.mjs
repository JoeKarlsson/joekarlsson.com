export const alt =
	'What the model actually receives. Raw schema: Salesforce fields like Id 0061E00001BnKLVQA3, StageName "Proposal/Price", Amount 480000.0 and IsWon false, so the model has to guess what they mean. Semantic context: the same deal as account Acme Corp, deal stage Proposal, amount $480,000, expected close September 30, 2026, win probability 65% and tier Enterprise, so the model answers accurately.';

const RAW = [
	'Id: 0061E00001BnKLVQA3',
	'AccountId: 0014p00002NmVWKAA3',
	'OwnerId: 0054p0000009LSDVAA4',
	'StageName: "Proposal/Price"',
	'Amount: 480000.0',
	'CloseDate: "2026-09-30"',
	'Probability: 65',
	'ForecastCategory: "Pipeline"',
	'Product_Editions__c: "CA-ENT"',
	'IsWon: false',
	'IsClosed: false',
];
const SEMANTIC = [
	['Account', 'Acme Corp'],
	['Deal stage', 'Proposal'],
	['Amount', '$480,000'],
	['Expected close', 'September 30, 2026'],
	['Win probability', '65%'],
	['Tier', 'Enterprise'],
];

/** The labelled fields on a chalk scrap, one per row. */
function semantic(f, x, y, w) {
	const h = SEMANTIC.length * 42 + 24;
	f.box({ x, y, w, h, kind: 'chalk' });
	SEMANTIC.forEach(([label, value], i) => {
		const rowY = y + 24 + i * 42;
		f.text(x + 18, rowY, label, { size: 14, anchor: 'start', color: '#000000' });
		f.text(x + 18, rowY + 19, value, { size: 18, anchor: 'start', weight: 700, color: '#000000' });
	});
	return h;
}

export const desktop = {
	height: 400,
	draw(f) {
		f.heading(16, 26, 'Raw schema', { size: 24 });
		f.heading(336, 26, 'Semantic context', { size: 24 });
		const h = Math.max(
			f.code({ x: 16, y: 50, w: 296, lines: RAW, size: 13 }),
			semantic(f, 336, 50, 288),
		);
		f.note(16, h + 80, 'The model has to guess what fields mean.');
		f.text(336, h + 80, 'The model answers accurately.', {
			size: 15,
			anchor: 'start',
			weight: 700,
		});
	},
};

export const phone = {
	height: 720,
	draw(f) {
		f.heading(16, 24, 'Raw schema', { size: 24 });
		const h = f.code({ x: 16, y: 46, w: 328, lines: RAW, size: 14 });
		f.note(16, h + 70, 'The model has to guess what fields mean.', { size: 14 });
		const top = h + 118;
		f.heading(16, top, 'Semantic context', { size: 24 });
		const h2 = semantic(f, 16, top + 22, 328);
		f.text(16, top + h2 + 46, 'The model answers accurately.', {
			size: 15,
			anchor: 'start',
			weight: 700,
		});
	},
};
