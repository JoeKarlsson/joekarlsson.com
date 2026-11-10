// The paper-collage stop-motion compositor, ported from pasteup's scripts/assemble.py (MIT,
// vendored in .claude/skills/explainers/vendor/tmoody1973__pasteup) so one scene.json plays in a
// browser canvas (posts, the preview player) and renders to MP4 through scripts/collage/render.mjs.
//
// Same recipe as pasteup: a flat color field, cut-out elements that build the frame one at a time
// from the edges, on twos, with per-pose jitter, an easeOutBack snap, a shadow that rides wide in
// flight and settles on landing, and a real-type label last. Schema: references/motion-recipes.md
// in the pasteup vendor folder. A classic script (window.Collage) so file:// pages can load it, and
// CommonJS for the tests.
(function (root) {
	const clamp01 = (x) => Math.max(0, Math.min(1, x));

	/** Snap into place with ~8-10 percent overshoot, then settle. */
	function easeOutBack(t, overshoot = 1.70158) {
		t -= 1;
		return t * t * ((overshoot + 1) * t + overshoot) + 1;
	}

	/** De Casteljau; t past 1 extrapolates along the end tangent, so the overshoot rides the path. */
	function bezier(points, t) {
		let pts = points.map(([x, y]) => [x, y]);
		while (pts.length > 1)
			pts = pts
				.slice(1)
				.map((b, i) => [pts[i][0] + (b[0] - pts[i][0]) * t, pts[i][1] + (b[1] - pts[i][1]) * t]);
		return pts[0];
	}

	/** mulberry32: the same seed and pose always give the same jitter, so renders repeat. */
	function seeded(seed) {
		return () => {
			seed = (seed + 0x6d2b79f5) | 0;
			let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	/** Where an element is at time t: { visible, x, y, shadowScale, progress }. */
	function elementPose(spec, t, canvasW, canvasH, w, h) {
		const enterAt = spec.enter_at ?? 0;
		const duration = Math.max(spec.enter_duration ?? 0.5, 1e-6);
		const tx = spec.x;
		const ty = spec.y;
		if (t < enterAt)
			return {
				visible: false,
				x: tx,
				y: ty,
				rotation: spec.rotation ?? 0,
				shadowScale: 1,
				progress: 0,
			};
		const p = clamp01((t - enterAt) / duration);
		const e = easeOutBack(p);
		let x;
		let y;
		if (spec.enter_path) {
			[x, y] = bezier([...spec.enter_path, [tx, ty]], e);
		} else {
			const margin = Math.max(w, h);
			const starts = {
				left: [-margin, ty],
				right: [canvasW + margin, ty],
				top: [tx, -margin],
				bottom: [tx, canvasH + margin],
			};
			const [sx, sy] = starts[spec.enter_from ?? 'left'] ?? [tx, ty];
			x = sx + (tx - sx) * e;
			y = sy + (ty - sy) * e;
		}
		const landed = { x, y, rotation: spec.rotation ?? 0 };
		const moved = afterMoves(spec.moves, t, landed);
		return {
			visible: true,
			x: moved.x,
			y: moved.y,
			rotation: moved.rotation,
			shadowScale: Math.max(1 + 0.6 * (1 - clamp01(p * 1.2)), moved.lift),
			progress: p,
		};
	}

	const EASES = {
		back: easeOutBack,
		// a fall: starts slow, speeds up, no settle
		in: (t) => t * t * t,
		out: (t) => 1 - (1 - t) ** 3,
	};

	/**
	 * moves: changes after a piece lands, in time order, each
	 * { at, duration = 0.5, x?, y?, rotation?, ease = 'back' | 'in' | 'out' }. A move starts
	 * from wherever the last one left the piece, so a split, a fall off the frame and a slide back
	 * for the loop are just three moves. lift is the shadow scale while a move is under way.
	 */
	function afterMoves(moves, t, landed) {
		let from = landed;
		let lift = 1;
		for (const move of moves ?? []) {
			if (t < move.at) break;
			const p = clamp01((t - move.at) / Math.max(move.duration ?? 0.5, 1e-6));
			const e = (EASES[move.ease ?? 'back'] ?? easeOutBack)(p);
			const to = {
				x: move.x ?? from.x,
				y: move.y ?? from.y,
				rotation: move.rotation ?? from.rotation,
			};
			const pose = {
				x: from.x + (to.x - from.x) * e,
				y: from.y + (to.y - from.y) * e,
				rotation: from.rotation + (to.rotation - from.rotation) * e,
			};
			lift = p < 1 ? 1.4 : 1;
			if (p < 1) return { ...pose, lift };
			from = to;
		}
		return { ...from, lift };
	}

	/** The time of the pose a frame shows: a new pose every hold_frames frames. */
	function poseTime(frame, scene) {
		const hold = Math.max(1, scene.cadence?.hold_frames ?? 2);
		return (Math.floor(frame / hold) * hold) / (scene.canvas.fps ?? 24);
	}

	/** Fine paper fiber: fixed noise, so the field doesn't swim from frame to frame. */
	function grainLayer(doc, w, h, amount) {
		const layer = doc.createElement('canvas');
		layer.width = w;
		layer.height = h;
		const g = layer.getContext('2d');
		const image = g.createImageData(w, h);
		const random = seeded(99);
		for (let i = 0; i < image.data.length; i += 4) {
			const v = random() * 255;
			image.data.set([v, v, v, amount * 255], i);
		}
		g.putImageData(image, 0, 0);
		return layer;
	}

	/** Loads a scene's images (paths relative to base) and returns what draw() needs. */
	async function load(scene, base, doc = document) {
		const images = await Promise.all(
			(scene.elements ?? []).map(
				(el) =>
					new Promise((resolve, reject) => {
						const img = new Image();
						img.onload = () => resolve(img);
						img.onerror = () => reject(new Error(`cannot load ${el.image}`));
						img.src = new URL(el.image, base).href;
					}),
			),
		);
		const { width, height, grain = 0 } = scene.canvas;
		const font =
			scene.label?.font_family && `${scene.label.size ?? 80}px ${scene.label.font_family}`;
		// fonts.load resolves even when the font never arrives; the label would ship in a fallback face
		if (font && !(await doc.fonts.load(font)).length) throw new Error(`font did not load: ${font}`);
		return { scene, images, grain: grain > 0 ? grainLayer(doc, width, height, grain) : null };
	}

	/** Draws the pose for `frame` onto a 2D context sized to the scene's canvas. */
	function draw(ctx, loaded, frame) {
		const { scene, images, grain } = loaded;
		const { width: W, height: H } = scene.canvas;
		const cadence = scene.cadence ?? {};
		const hold = Math.max(1, cadence.hold_frames ?? 2);
		const t = poseTime(frame, scene);
		const random = seeded((cadence.seed ?? 7) * 100003 + Math.floor(frame / hold));
		const jitterPx = cadence.jitter_px ?? 1.5;
		const jitterDeg = cadence.jitter_deg ?? 0.4;

		ctx.save();
		ctx.fillStyle = scene.canvas.background_hex ?? '#1F3FB0';
		ctx.fillRect(0, 0, W, H);
		if (grain) ctx.drawImage(grain, 0, 0);

		(scene.elements ?? []).forEach((spec, i) => {
			const img = images[i];
			const scale = spec.scale ?? 1;
			const w = img.naturalWidth * scale;
			const h = img.naturalHeight * scale;
			const pose = elementPose(spec, t, W, H, w, h);
			if (!pose.visible) return;
			const jx = (random() * 2 - 1) * jitterPx;
			const jy = (random() * 2 - 1) * jitterPx;
			let deg = (random() * 2 - 1) * jitterDeg + pose.rotation;
			// enter_spin: extra rotation that unwinds as the piece lands
			deg += (spec.enter_spin ?? 0) * Math.max(0, 1 - pose.progress);
			const shadow = spec.shadow;
			ctx.save();
			if (shadow) {
				ctx.shadowColor = `rgba(0,0,0,${shadow.opacity ?? 0.3})`;
				// Canvas blur is about twice Pillow's Gaussian radius
				ctx.shadowBlur = (shadow.blur ?? 8) * 2 * pose.shadowScale;
				ctx.shadowOffsetX = (shadow.dx ?? 6) * pose.shadowScale;
				ctx.shadowOffsetY = (shadow.dy ?? 6) * pose.shadowScale;
			}
			ctx.translate(pose.x + jx, pose.y + jy);
			ctx.rotate((deg * Math.PI) / 180);
			ctx.drawImage(img, -w / 2, -h / 2, w, h);
			ctx.restore();
		});

		const label = scene.label;
		if (label && t >= (label.enter_at ?? 0)) {
			const p = clamp01((t - (label.enter_at ?? 0)) / 0.25);
			ctx.save();
			ctx.globalAlpha = Math.min(1, p * 2);
			ctx.fillStyle = label.color ?? '#0A0A0A';
			ctx.font = `${label.weight ?? 400} ${label.size ?? 80}px ${label.font_family ?? 'sans-serif'}`;
			ctx.letterSpacing = `${label.tracking ?? 0}px`;
			ctx.textBaseline = 'top';
			// align: 'center' sets the label centered on x
			ctx.textAlign = label.align ?? 'left';
			ctx.fillText(
				label.text ?? '',
				label.x ?? 80,
				(label.y ?? H - 200) + (1 - easeOutBack(p)) * 24,
			);
			ctx.restore();
		}
		ctx.restore();
	}

	const frameCount = (scene) => Math.round(scene.duration * (scene.canvas.fps ?? 24));

	const api = { easeOutBack, bezier, seeded, elementPose, poseTime, frameCount, load, draw };
	if (typeof module !== 'undefined') module.exports = api;
	else root.Collage = api;
})(typeof window !== 'undefined' ? window : globalThis);
