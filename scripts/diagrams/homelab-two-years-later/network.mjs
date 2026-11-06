export const alt =
	'The home network: the internet comes in through a fiber ONT in bridge mode to the UniFi Cloud Gateway Ultra (router, firewall, DHCP and WiFi controller), then to the MikroTik CRS317 10G switch. The MikroTik connects prxbox1 and prxbox2 over 2x10G LACP (20Gbps) and the UniFi US24 1G switch over a 1G uplink. The US24 connects the Synology NAS (2x1G), the iDRACs, IoT devices and cameras, and three UniFi U7 Pro access points (upstairs, main floor and basement). Four VLANs: default LAN 192.168.0.0/24 for servers, the workstation and trusted devices; guest 192.168.20.0/24 with internet, DNS and speakers; IoT 192.168.30.0/24 with Home Assistant, DNS, the music server and internet; and cameras 192.168.40.0/24 with Frigate, Home Assistant and DNS.';

const VLANS = [
	['Default LAN', '192.168.0.0/24', 'servers, workstation, trusted'],
	['Guest', '192.168.20.0/24', 'internet, DNS, speakers'],
	['IoT', '192.168.30.0/24', 'Home Assistant, DNS, music, internet'],
	['Cameras', '192.168.40.0/24', 'Frigate, Home Assistant, DNS'],
];

/** The four VLANs as a list: name, subnet, what each can reach. */
function vlans(f, { x, y, w, stacked }) {
	const rowH = stacked ? 58 : 30;
	f.group({ x, y, w, h: 24 + VLANS.length * rowH, label: 'VLANs' });
	VLANS.forEach(([name, subnet, reach], i) => {
		const rowY = y + 24 + i * rowH;
		f.text(x + 14, rowY, name, { size: 14, anchor: 'start', weight: 700 });
		if (stacked) {
			f.text(x + 14, rowY + 18, subnet, {
				font: 'mono',
				size: 13,
				anchor: 'start',
				color: '#ededed',
			});
			f.note(x + 14, rowY + 36, reach, { size: 13 });
		} else {
			f.text(x + 120, rowY, subnet, { font: 'mono', size: 13, anchor: 'start', color: '#ededed' });
			f.note(x + 260, rowY, reach, { size: 13 });
		}
	});
}

export const desktop = {
	height: 690,
	draw(f) {
		const spine = [
			{ y: 16, h: 50, label: 'Internet', icon: 'globe' },
			{ y: 92, h: 50, label: 'Fiber ONT', sub: 'bridge mode', icon: 'router' },
			{
				y: 168,
				h: 64,
				label: 'Cloud Gateway Ultra',
				sub: 'router, firewall, DHCP, WiFi',
				logo: 'ubiquiti',
			},
			{
				y: 258,
				h: 56,
				label: 'MikroTik CRS317',
				sub: '10G switch',
				logo: 'mikrotik',
				kind: 'pink',
			},
		];
		spine.forEach((s, i) => {
			f.box({ x: 170, w: 300, size: 15, subSize: 13, ...s });
			if (i < spine.length - 1)
				f.arrow(
					[
						[320, s.y + s.h + 2],
						[320, spine[i + 1].y - 2],
					],
					{ heads: 'both' },
				);
		});
		const row = [
			{ x: 16, label: 'prxbox1', logo: 'proxmox' },
			{ x: 228, label: 'prxbox2', logo: 'proxmox' },
			{ x: 440, label: 'UniFi US24', sub: '1G switch', logo: 'ubiquiti' },
		];
		row.forEach((r) =>
			f.arrow(
				[
					[320, 316],
					[320, 334],
					[r.x + 92, 334],
					[r.x + 92, 352],
				],
				{ heads: 'both' },
			),
		);
		f.note(110, 322, '2×10G LACP, 20Gbps', { anchor: 'middle', size: 13 });
		f.note(532, 322, '1G uplink', { anchor: 'middle', size: 13 });
		row.forEach((r) => f.box({ y: 354, w: 184, h: 56, size: 15, subSize: 13, ...r }));
		const devices = [
			{ x: 228, label: 'Synology NAS', sub: '2×1G', logo: 'synology' },
			{ x: 434, label: ['3 U7 Pro', 'access points'], logo: 'ubiquiti' },
		];
		f.arrow(
			[
				[532, 412],
				[532, 432],
				[320, 432],
				[320, 450],
			],
			{ heads: 'both' },
		);
		f.arrow(
			[
				[532, 412],
				[532, 450],
			],
			{ heads: 'both' },
		);
		devices.forEach((d) => f.box({ y: 452, w: 190, h: 60, size: 14, subSize: 13, ...d }));
		f.note(16, 470, 'also on the 1G switch:', { size: 13 });
		f.note(16, 488, 'iDRACs, IoT devices, cameras', { size: 13 });
		vlans(f, { x: 16, y: 560, w: 608 });
	},
};

export const phone = {
	height: 1080,
	draw(f) {
		const spine = [
			{ y: 16, h: 48, label: 'Internet', icon: 'globe' },
			{ y: 88, h: 54, label: 'Fiber ONT', sub: 'bridge mode', icon: 'router' },
			{
				y: 166,
				h: 70,
				label: ['Cloud Gateway', 'Ultra'],
				sub: 'router, firewall, DHCP, WiFi',
				logo: 'ubiquiti',
			},
			{
				y: 260,
				h: 56,
				label: 'MikroTik CRS317',
				sub: '10G switch',
				logo: 'mikrotik',
				kind: 'pink',
			},
		];
		spine.forEach((s, i) => {
			f.box({ x: 30, w: 300, size: 14, subSize: 13, ...s });
			if (i < spine.length - 1)
				f.arrow(
					[
						[180, s.y + s.h + 2],
						[180, spine[i + 1].y - 2],
					],
					{ heads: 'both' },
				);
		});
		const xs = [64, 180, 296];
		const row = [
			{ label: 'prxbox1', logo: 'proxmox' },
			{ label: 'prxbox2', logo: 'proxmox' },
			{ label: 'US24', sub: '1G switch', logo: 'ubiquiti' },
		];
		xs.forEach((cx) =>
			f.arrow(
				[
					[180, 318],
					[180, 336],
					[cx, 336],
					[cx, 356],
				],
				{ heads: 'both' },
			),
		);
		row.forEach((r, i) =>
			f.box({ x: xs[i] - 54, y: 358, w: 108, h: 90, size: 14, subSize: 13, stack: true, ...r }),
		);
		f.note(16, 470, 'prxboxes: 2×10G LACP, 20Gbps', { size: 13 });
		f.note(16, 488, 'US24: 1G uplink', { size: 13 });
		f.arrow(
			[
				[296, 450],
				[296, 520],
			],
			{ heads: 'both' },
		);
		f.group({ x: 8, y: 530, w: 344, h: 214, label: 'On the 1G switch' });
		f.box({
			x: 20,
			y: 548,
			w: 156,
			h: 108,
			label: ['Synology', 'NAS'],
			sub: '2×1G',
			logo: 'synology',
			size: 14,
			subSize: 13,
			stack: true,
		});
		f.box({
			x: 184,
			y: 548,
			w: 156,
			h: 108,
			label: ['3 U7 Pro', 'APs'],
			logo: 'ubiquiti',
			size: 14,
			stack: true,
		});
		f.note(20, 682, 'iDRACs, IoT devices, cameras', { size: 13 });
		f.note(20, 704, 'APs: upstairs, main floor, basement', { size: 13 });
		vlans(f, { x: 8, y: 788, w: 344, stacked: true });
	},
};
