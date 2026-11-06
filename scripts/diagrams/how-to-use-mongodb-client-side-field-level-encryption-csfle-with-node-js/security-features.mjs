export const alt =
	'Which MongoDB security feature stops which attack. Role-based access control stops database privilege abuse, such as stolen credentials. TLS/SSL transport encryption stops network snooping, such as packet sniffing. Encryption at rest stops data theft, such as stolen disks. Client-side field level encryption (CSFLE) stops all four, including reading the database host’s memory, because sensitive fields stay encrypted on the host and in transit and only the client holds the keys.';

const FEATURES = [
	['RBAC', 'role-based access'],
	['TLS/SSL', 'in transit'],
	['At rest', 'encrypted disks'],
	['CSFLE', 'client-side fields'],
];
const THREATS = [
	['Privilege abuse', 'stolen credentials'],
	['Network snooping', 'packet sniffing'],
	['Data theft', 'stolen disks, files'],
	['Host memory', 'dumps, RAM scraping'],
];
/** Which threat each feature stops: row = threat, column = feature. */
const STOPS = [
	[1, 0, 0, 1],
	[0, 1, 0, 1],
	[0, 0, 1, 1],
	[0, 0, 0, 1],
];

function grid(f, { x, y, labelW, colW, rowH, size }) {
	FEATURES.forEach(([name, sub], c) => {
		const cx = x + labelW + c * colW + colW / 2;
		f.text(cx, y + 12, name, {
			font: 'display',
			size: size + 3,
			upper: true,
			color: c === 3 ? '#ff4fd8' : '#ededed',
		});
		if (colW > 80) f.note(cx, y + 32, sub, { anchor: 'middle', size: 12 });
	});
	THREATS.forEach(([name, sub], r) => {
		const ry = y + 52 + r * rowH;
		f.text(x, ry + rowH / 2 - 8, name, { size, anchor: 'start', weight: 700 });
		f.note(x, ry + rowH / 2 + 10, sub, { size: 13 });
		STOPS[r].forEach((stops, c) => {
			const bx = x + labelW + c * colW + 6;
			f.box({
				x: bx,
				y: ry + 6,
				w: colW - 12,
				h: rowH - 12,
				kind: stops ? (c === 3 ? 'pink' : 'chalk') : 'outline',
				icon: stops ? 'check' : 'x',
				size: 14,
			});
		});
	});
}

export const desktop = {
	height: 340,
	draw(f) {
		grid(f, { x: 16, y: 12, labelW: 160, colW: 112, rowH: 64, size: 15 });
		f.note(16, 328, 'Only CSFLE keeps the data encrypted on the database host itself.', {
			size: 14,
		});
	},
};

export const phone = {
	height: 380,
	draw(f) {
		grid(f, { x: 8, y: 12, labelW: 120, colW: 58, rowH: 70, size: 13 });
		f.note(8, 356, 'Only CSFLE keeps data encrypted on the host.', { size: 13 });
	},
};
