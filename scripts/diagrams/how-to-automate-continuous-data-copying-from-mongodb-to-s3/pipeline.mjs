export const alt =
	'The pipeline: inside MongoDB Atlas, scheduled Trigger 1 runs every minute and inserts a new document into the Atlas cluster with insertOne. Scheduled Trigger 2 also runs every minute and sends an aggregate to the federated database instance, which reads the last 60 seconds of documents from the cluster. Its $out stage writes them as Parquet to events.parquet in an Amazon S3 bucket, replacing the file on every run.';

/** Atlas, its two triggers, and S3, placed by the layout's own coordinates. */
function draw(f, { group, t1, cluster, t2, fed, s3, notes }) {
	f.group({ ...group, label: 'MongoDB Atlas' });
	const trigger = (spot, n) =>
		f.box({ ...spot, label: `Trigger ${n}`, sub: 'every minute', icon: 'clock', stack: true });
	trigger(t1, 1);
	trigger(t2, 2);
	f.box({ ...cluster, kind: 'chalk', label: 'Cluster', logo: 'mongodb', stack: true });
	f.box({ ...fed, kind: 'pink', label: ['Federated', 'database'], logo: 'mongodb', stack: true });
	f.box({
		...s3,
		kind: 'chalk',
		label: 'S3 bucket',
		sub: 'events.parquet',
		subFont: 'mono',
		subSize: 13,
		logo: 'amazons3',
		stack: true,
	});
	const mid = (b) => b.y + b.h / 2;
	const centre = (b) => b.x + b.w / 2;
	f.arrow([
		[t1.x + t1.w + 2, mid(t1)],
		[cluster.x - 2, mid(t1)],
	]);
	f.arrow([
		[t2.x + t2.w + 2, mid(t2)],
		[fed.x - 2, mid(t2)],
	]);
	f.arrow([
		[centre(cluster), cluster.y + cluster.h + 2],
		[centre(cluster), fed.y - 2],
	]);
	const code = { font: 'mono', size: 13, anchor: 'middle' };
	f.note(...notes.insert, 'insertOne', code);
	f.note(...notes.aggregate, 'aggregate', code);
	f.note(...notes.read, 'last 60 s', { size: 14, anchor: notes.readAnchor });
	f.note(...notes.out, '$out', { ...code, anchor: notes.outAnchor });
	f.note(...notes.parquet, 'Parquet', { size: 14, anchor: notes.parquetAnchor });
}

export const desktop = {
	height: 400,
	draw(f) {
		const fed = { x: 256, y: 204, w: 150, h: 100 };
		const s3 = { x: 470, y: 204, w: 154, h: 100 };
		draw(f, {
			group: { x: 16, y: 40, w: 400, h: 278 },
			t1: { x: 30, y: 60, w: 150, h: 100 },
			cluster: { x: 256, y: 60, w: 150, h: 100 },
			t2: { x: 30, y: 204, w: 150, h: 100 },
			fed,
			s3,
			notes: {
				insert: [218, 96],
				aggregate: [218, 240],
				read: [341, 182],
				readAnchor: 'start',
				out: [443, 240],
				outAnchor: 'middle',
				parquet: [443, 269],
				parquetAnchor: 'middle',
			},
		});
		f.arrow([
			[fed.x + fed.w + 2, 254],
			[s3.x - 2, 254],
		]);
		f.handwrite(430, 350, 'Same name every run:');
		f.handwrite(430, 374, '$out replaces the file', {
			arrow: [[590, 340], [570, s3.y + s3.h + 6], 14],
		});
	},
};

export const phone = {
	height: 490,
	draw(f) {
		const fed = { x: 214, y: 216, w: 130, h: 100 };
		const s3 = { x: 190, y: 366, w: 154, h: 100 };
		draw(f, {
			group: { x: 8, y: 40, w: 344, h: 290 },
			t1: { x: 16, y: 60, w: 124, h: 100 },
			cluster: { x: 214, y: 60, w: 130, h: 100 },
			t2: { x: 16, y: 216, w: 124, h: 100 },
			fed,
			s3,
			notes: {
				insert: [177, 96],
				aggregate: [177, 252],
				read: [271, 188],
				readAnchor: 'end',
				out: [271, 341],
				outAnchor: 'end',
				parquet: [289, 341],
				parquetAnchor: 'start',
			},
		});
		f.arrow([
			[279, fed.y + fed.h + 2],
			[279, s3.y - 2],
		]);
		f.handwrite(16, 388, 'Same name every');
		f.handwrite(16, 412, 'run: $out replaces');
		f.handwrite(16, 436, 'the file', { arrow: [[96, 448], [186, 446], 16] });
	},
};
