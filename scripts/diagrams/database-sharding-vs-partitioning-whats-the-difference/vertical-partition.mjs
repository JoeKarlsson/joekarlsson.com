export const alt =
	'Vertical partitioning splits the Employee table (EmployeeID, FirstName, LastName and Picture) by column into two tables: Employee with EmployeeID, FirstName and LastName, and EmployeePicture with EmployeeID and the wide Picture column.';

/** A table as a chalk scrap: its name on top, a chip per column, wide columns in pink. */
function table(f, { x, y, w, name, columns, wide = [] }) {
	const h = 52 + columns.length * 44;
	f.box({ x, y, w, h, kind: 'chalk' });
	f.text(x + w / 2, y + 26, name, { font: 'display', size: 20, upper: true, color: '#000000' });
	columns.forEach((column, i) =>
		f.box({
			x: x + 16,
			y: y + 48 + i * 44,
			w: w - 32,
			h: 36,
			kind: wide.includes(column) ? 'pink' : 'ink',
			label: column,
			font: 'mono',
			size: 14,
		}),
	);
	return h;
}

const EMPLOYEE = ['EmployeeID', 'FirstName', 'LastName', 'Picture'];

export const desktop = {
	height: 430,
	draw(f) {
		table(f, { x: 16, y: 100, w: 210, name: 'Employee', columns: EMPLOYEE, wide: ['Picture'] });
		f.arrow([
			[228, 210],
			[300, 210],
			[300, 110],
			[398, 110],
		]);
		f.arrow([
			[300, 210],
			[300, 330],
			[398, 330],
		]);
		f.note(234, 178, 'split by', { size: 14 });
		f.note(234, 196, 'column', { size: 14 });
		table(f, {
			x: 400,
			y: 16,
			w: 224,
			name: 'Employee',
			columns: ['EmployeeID', 'FirstName', 'LastName'],
		});
		table(f, {
			x: 400,
			y: 256,
			w: 224,
			name: 'EmployeePicture',
			columns: ['EmployeeID', 'Picture'],
			wide: ['Picture'],
		});
	},
};

export const phone = {
	height: 560,
	draw(f) {
		table(f, { x: 70, y: 16, w: 220, name: 'Employee', columns: EMPLOYEE, wide: ['Picture'] });
		f.arrow([
			[180, 246],
			[180, 272],
			[96, 272],
			[96, 298],
		]);
		f.arrow([
			[180, 272],
			[264, 272],
			[264, 298],
		]);
		f.note(192, 260, 'split by column', { size: 14 });
		table(f, {
			x: 12,
			y: 300,
			w: 168,
			name: 'Employee',
			columns: ['EmployeeID', 'FirstName', 'LastName'],
		});
		table(f, {
			x: 188,
			y: 300,
			w: 160,
			name: 'EmployeePicture',
			columns: ['EmployeeID', 'Picture'],
			wide: ['Picture'],
		});
	},
};
