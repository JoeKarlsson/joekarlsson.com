// Draws every img[data-halftone] and video[data-halftone] in the site's pink,
// live, so stills and clips get exactly the same treatment at any size: a
// pre-dithered file's dots shrink with the file, and pre-dithered video doesn't
// compress (a field of dots runs 10-40x the original). The page ships plain
// originals; this draws over each one on a canvas.
//
// Two looks, picked at build time by halftoneMode() (src/utils/halftone.ts):
// - data-halftone="dots": dots on a 45-degree grid sized by brightness, over a
//   soft pink duotone. For photos.
// - data-halftone="flat": just black and pink, no dots. Every post and project
//   card uses it, and so does anything with text in it
//   (src/data/images-with-text.json), which dots make unreadable.
//   Blog cards without text add data-halftone-hover="dots" to show dots on hover.
// Both lift dark footage and invert mostly white images (diagrams), so the
// ground stays black.
//
// One shared WebGL context renders and each element gets a 2D canvas copy, so a
// long blog list doesn't hit the browser's limit of about 16 WebGL contexts.
//
// The canvas is the element's next sibling, placed over it by offsetLeft/Top, so
// any layout works. While <html> has .halftone-on (set by an inline script in
// BaseHead), CSS hides img[data-halftone] so the color original never flashes.
// A video's still is data-halftone-poster, drawn before the clip plays (and
// always, under reduced motion). With no WebGL the originals show in color.

const CELL_CSS_PX = 3;
const INK = [1, 0x4f / 255, 0xd8 / 255]; // #ff4fd8
// Mean brightness (0-1) above which an image is inverted, like halftone.py's --invert-light
const LIGHT_IMAGE_MEAN = 140 / 255;

const VERTEX_SHADER = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform sampler2D source;
uniform vec2 canvasSize;   // device pixels
uniform vec2 fitScale;     // object-fit (cover or contain), as a UV scale
uniform vec2 fitOffset;    // object-position: where the scaled picture sits
uniform float cell;        // dot spacing, device pixels
uniform float invert;      // 1.0 flips a light image
uniform vec2 levels;       // the image's darkest and brightest tones, stretched to black and full pink
uniform float noDots;      // 1.0 draws the duotone without dots
uniform vec3 ink;

const float CONTRAST = 1.15;
const float DOTS_OVER_DUOTONE = 0.5;
const float GAMMA = 0.7;
const mat2 ROTATE = mat2(0.70710678, 0.70710678, -0.70710678, 0.70710678);

// Grid space back to pixels. GLSL ES 1.0 has no transpose(), and a rotation's
// inverse is its transpose
vec2 unrotate(vec2 p) { return vec2(dot(p, ROTATE[0]), dot(p, ROTATE[1])); }

// Source brightness, flipped for a light image; black outside the picture
// (the bars around an object-fit: contain clip)
float luma(vec2 pixel) {
	vec2 uv = pixel / canvasSize * fitScale + fitOffset;
	if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
	float value = dot(texture2D(source, uv).rgb, vec3(0.299, 0.587, 0.114));
	value = clamp((value - levels.x) / (levels.y - levels.x), 0.0, 1.0);
	return mix(value, 1.0 - value, invert);
}

float brightness(vec2 pixel) {
	return clamp((pow(luma(pixel), GAMMA) - 0.5) * CONTRAST + 0.5, 0.0, 1.0);
}

void main() {
	vec2 pixel = vec2(gl_FragCoord.x, canvasSize.y - gl_FragCoord.y);
	if (noDots > 0.5) {
		// Black to pink, straight from the auto-leveled brightness: a steep cutoff
		// blew out highlights and turned busy images to speckle
		gl_FragColor = vec4(ink * luma(pixel), 1.0);
		return;
	}
	vec3 tone = ink * brightness(pixel);
	vec2 grid = ROTATE * pixel / cell;
	// Bright dots outgrow their cell, so check the neighbors too
	float dots = 0.0;
	for (int dx = -1; dx <= 1; dx++) {
		for (int dy = -1; dy <= 1; dy++) {
			vec2 center = floor(grid) + 0.5 + vec2(dx, dy);
			float radius = 0.5 * 1.25 * sqrt(brightness(unrotate(center) * cell));
			float gap = length(grid - center) * cell;
			dots = max(dots, smoothstep(radius * cell + 0.75, radius * cell - 0.75, gap));
		}
	}
	gl_FragColor = vec4(mix(tone, ink * dots, DOTS_OVER_DUOTONE), 1.0);
}`;

type Source = HTMLImageElement | HTMLVideoElement;

interface Look {
	invert: boolean;
	// Darkest and brightest tones (0-1), like halftone.py's autocontrast
	low: number;
	high: number;
	flat: boolean;
	// object-fit: contain rather than cover
	contain: boolean;
	// object-position as fractions (0.5, 0.5 is centered), read on resize
	position: [number, number];
}

type Draw = (source: Source, target: HTMLCanvasElement, look: Look) => void;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
	const shader = gl.createShader(type)!;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(`Halftone shader: ${gl.getShaderInfoLog(shader)}`);
	}
	return shader;
}

function createRenderer(): Draw | null {
	const glCanvas = document.createElement('canvas');
	const gl = glCanvas.getContext('webgl', { antialias: false, alpha: false });
	if (!gl) return null;

	const program = gl.createProgram()!;
	gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
	gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
	gl.linkProgram(program);
	gl.useProgram(program);

	// One triangle pair covering the canvas
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
	const position = gl.getAttribLocation(program, 'position');
	gl.enableVertexAttribArray(position);
	gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

	gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.uniform3fv(gl.getUniformLocation(program, 'ink'), INK);
	const uniform = (name: string) => gl.getUniformLocation(program, name);
	const [canvasSize, fitScale, fitOffset, cell, invert, noDots, levels] = [
		'canvasSize',
		'fitScale',
		'fitOffset',
		'cell',
		'invert',
		'noDots',
		'levels',
	].map(uniform);

	return (source, target, look) => {
		const { width, height } = target;
		const sourceAspect =
			source instanceof HTMLVideoElement
				? source.videoWidth / source.videoHeight
				: source.naturalWidth / source.naturalHeight;
		const targetAspect = width / height;
		glCanvas.width = width;
		glCanvas.height = height;
		gl.viewport(0, 0, width, height);
		gl.uniform2f(canvasSize, width, height);
		// Cover crops the longer side of the picture; contain pads the shorter one
		const wider = targetAspect < sourceAspect;
		const scaleX = wider === look.contain ? 1 : targetAspect / sourceAspect;
		const scaleY = wider === look.contain ? sourceAspect / targetAspect : 1;
		gl.uniform2f(fitScale, scaleX, scaleY);
		// Same rule as CSS object-position: the leftover space splits by the percentage
		gl.uniform2f(fitOffset, (1 - scaleX) * look.position[0], (1 - scaleY) * look.position[1]);
		gl.uniform1f(cell, CELL_CSS_PX * (window.devicePixelRatio || 1));
		gl.uniform1f(invert, look.invert ? 1 : 0);
		gl.uniform1f(noDots, look.flat ? 1 : 0);
		gl.uniform2f(levels, look.low, look.high);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		// Copy out in the same task, before the WebGL buffer is cleared
		target.getContext('2d')!.drawImage(glCanvas, 0, 0);
	};
}

const SAMPLE_SIZE = 32;
// Ignore the darkest and brightest 2% when finding an image's range
const LEVELS_CUTOFF = 0.02;
// A range narrower than this (a flat color) is left as it is
const MIN_RANGE = 0.1;

/** An image's brightness (0-1): its mean, and its darkest and brightest tones. */
function measure(image: HTMLImageElement): { mean: number; low: number; high: number } {
	const sample = document.createElement('canvas');
	sample.width = sample.height = SAMPLE_SIZE;
	const context = sample.getContext('2d', { willReadFrequently: true })!;
	context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
	const { data } = context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
	const values: number[] = [];
	for (let i = 0; i < data.length; i += 4) {
		values.push((0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255);
	}
	values.sort((a, b) => a - b);
	const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
	const low = values[Math.floor(values.length * LEVELS_CUTOFF)];
	const high = values[Math.ceil(values.length * (1 - LEVELS_CUTOFF)) - 1];
	return high - low < MIN_RANGE ? { mean, low: 0, high: 1 } : { mean, low, high };
}

/** An element's object-position as fractions; anything not in percent counts as centered. */
function objectPosition(element: Element): [number, number] {
	const parts = getComputedStyle(element).objectPosition.split(' ');
	const fraction = (part = '50%') => (part.endsWith('%') ? parseFloat(part) / 100 : 0.5);
	return [fraction(parts[0]), fraction(parts[1])];
}

function attach(element: Source, draw: Draw): void {
	const canvas = document.createElement('canvas');
	canvas.setAttribute('aria-hidden', 'true');
	canvas.className = element.className;
	canvas.style.cssText = 'position:absolute;margin:0;pointer-events:none';
	element.after(canvas);

	const look: Look = {
		invert: false,
		low: 0,
		high: 1,
		flat: element.dataset.halftone === 'flat',
		contain: getComputedStyle(element).objectFit === 'contain',
		position: objectPosition(element),
	};
	// data-halftone-hover="dots": flat at rest, dots while its row (.blog-row) is hovered
	if (element.dataset.halftoneHover === 'dots') {
		const row = element.closest('.blog-row') ?? element.parentElement!;
		row.addEventListener('pointerenter', () => {
			look.flat = false;
			redraw();
		});
		row.addEventListener('pointerleave', () => {
			look.flat = true;
			redraw();
		});
	}

	// A video shows its still until the clip has a frame
	const still =
		element instanceof HTMLImageElement
			? element
			: Object.assign(new Image(), { src: element.dataset.halftonePoster ?? '' });
	let stillReady = false;

	const fit = (): boolean => {
		look.position = objectPosition(element);
		const ratio = window.devicePixelRatio || 1;
		const width = Math.round(element.offsetWidth * ratio);
		const height = Math.round(element.offsetHeight * ratio);
		if (!width || !height) return false;
		Object.assign(canvas.style, {
			left: `${element.offsetLeft}px`,
			top: `${element.offsetTop}px`,
			width: `${element.offsetWidth}px`,
			height: `${element.offsetHeight}px`,
		});
		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
		}
		return true;
	};

	const redraw = () => {
		if (!fit()) return;
		const video = element instanceof HTMLVideoElement ? element : null;
		const hasFrame =
			video &&
			video.readyState >= video.HAVE_CURRENT_DATA &&
			(video.currentTime > 0 || !video.paused);
		if (hasFrame) draw(video, canvas, look);
		else if (stillReady) draw(still, canvas, look);
	};

	// Not img.decode(): a lazy image starting to load cancels a pending decode
	const onStill = () => {
		const { mean, low, high } = measure(still);
		Object.assign(look, { invert: mean > LIGHT_IMAGE_MEAN, low, high });
		stillReady = true;
		redraw();
	};
	if (still.complete && still.naturalWidth) onStill();
	else if (still.src) {
		still.addEventListener('load', onStill, { once: true });
		still.addEventListener(
			'error',
			() => {
				throw new Error(`Halftone: ${still.currentSrc || still.src} failed to load`);
			},
			{ once: true },
		);
	}
	// Redraw when the element is resized or shown (a filtered list unhides rows)
	new ResizeObserver(redraw).observe(element);

	if (element instanceof HTMLVideoElement) {
		const onFrame = () => {
			redraw();
			if (!element.paused) element.requestVideoFrameCallback(onFrame);
		};
		element.addEventListener('play', () => element.requestVideoFrameCallback(onFrame));
		// Scrubbing a paused clip from its controls
		element.addEventListener('seeked', redraw);
	}
}

/** Shows the color originals, and gives clips their still back. */
function showOriginals(): void {
	document.documentElement.classList.remove('halftone-on');
	document
		.querySelectorAll<HTMLVideoElement>('video[data-halftone-poster]')
		.forEach((video) => (video.poster = video.dataset.halftonePoster!));
}

const elements = document.querySelectorAll<Source>('img[data-halftone], video[data-halftone]');
if (elements.length) {
	let draw: Draw | null;
	try {
		draw = 'requestVideoFrameCallback' in HTMLVideoElement.prototype ? createRenderer() : null;
	} catch (error) {
		// A shader the GPU rejects: never leave the images hidden, but still report it
		showOriginals();
		throw error;
	}
	if (draw) elements.forEach((element) => attach(element, draw));
	else showOriginals();
}
