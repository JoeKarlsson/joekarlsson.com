// Draws every img[data-halftone] and video[data-halftone] in the site's pink,
// live, so stills and clips get exactly the same treatment at any size. The page
// ships plain originals; this draws over each one on a canvas.
//
// One look: black to pink, clear, with no halftone dots (Joe dropped the dots
// site-wide, DECISIONS.md 2026-11-15). It lifts dark footage and inverts mostly
// white images (diagrams), so the ground stays black.
// A bright photo (a sunny sky) can trip the invert too; data-halftone-no-invert
// keeps it the right way round.
//
// One shared WebGL context renders and each element gets a 2D canvas copy, so a
// long blog list doesn't hit the browser's limit of about 16 WebGL contexts.
//
// The canvas is the element's next sibling, placed over it by offsetLeft/Top, so
// any layout works. While <html> has .halftone-on (set by an inline script in
// BaseHead), CSS hides the originals (opacity 0) so the color never flashes.
// A video's still is its poster, drawn before the clip plays (and
// always, under reduced motion). With no WebGL, or only a software one, the
// originals show in color.

import { retryImageLoadOnce } from './retry-image';

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
uniform float invert;      // 1.0 flips a light image
uniform vec2 levels;       // the image's darkest and brightest tones, stretched to black and full pink
uniform vec3 ink;

// Source brightness, flipped for a light image; black outside the picture
// (the bars around an object-fit: contain clip)
float luma(vec2 pixel) {
	vec2 uv = pixel / canvasSize * fitScale + fitOffset;
	if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
	float value = dot(texture2D(source, uv).rgb, vec3(0.299, 0.587, 0.114));
	value = clamp((value - levels.x) / (levels.y - levels.x), 0.0, 1.0);
	return mix(value, 1.0 - value, invert);
}

void main() {
	vec2 pixel = vec2(gl_FragCoord.x, canvasSize.y - gl_FragCoord.y);
	// Black to pink, straight from the auto-leveled brightness: a steep cutoff
	// blew out highlights and turned busy images to speckle
	gl_FragColor = vec4(ink * luma(pixel), 1.0);
}`;

type Source = HTMLImageElement | HTMLVideoElement;

interface Look {
	invert: boolean;
	// Darkest and brightest tones (0-1), like halftone.py's autocontrast
	low: number;
	high: number;
	// object-fit: contain rather than cover
	contain: boolean;
	// object-position as fractions (0.5, 0.5 is centered), read on resize
	position: [number, number];
}

type Draw = (source: Source, target: HTMLCanvasElement, look: Look) => void;

// Every attached picture's redraw, for when a lost WebGL context comes back
const redrawAll = new Set<() => void>();

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
	const shader = gl.createShader(type)!;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(`Halftone shader: ${gl.getShaderInfoLog(shader)}`);
	}
	return shader;
}

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software/i;

function createRenderer(): Draw | null {
	const glCanvas = document.createElement('canvas');
	// No software WebGL: there a frame takes ~100ms, so clips starved the page
	// (its load event never fired on a GPU-less CI runner). Those visitors get the originals.
	const gl = glCanvas.getContext('webgl', {
		antialias: false,
		alpha: false,
		failIfMajorPerformanceCaveat: true,
	});
	if (!gl) return null;
	// Chrome doesn't count SwiftShader under ANGLE as a performance caveat, so check its name
	const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
	const renderer = debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : '';
	if (SOFTWARE_RENDERER.test(renderer)) return null;

	// Everything the GPU holds; built again when a lost context comes back
	const setUp = () => {
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
		return {
			canvasSize: uniform('canvasSize'),
			fitScale: uniform('fitScale'),
			fitOffset: uniform('fitOffset'),
			invert: uniform('invert'),
			levels: uniform('levels'),
		};
	};
	let uniforms = setUp();

	// iOS Safari drops a page's WebGL context to free GPU memory (often after a switch to
	// another app). Drawing with the lost context painted every picture solid black, so
	// show the originals until it comes back, then draw everything in pink again.
	glCanvas.addEventListener('webglcontextlost', (event) => {
		event.preventDefault();
		showOriginals();
	});
	glCanvas.addEventListener('webglcontextrestored', () => {
		uniforms = setUp();
		document.documentElement.classList.add('halftone-on');
		redrawAll.forEach((redraw) => redraw());
	});

	return (source, target, look) => {
		if (gl.isContextLost()) return;
		const { canvasSize, fitScale, fitOffset, invert, levels } = uniforms;
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
		gl.uniform1f(invert, look.invert ? 1 : 0);
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
		contain: getComputedStyle(element).objectFit === 'contain',
		position: objectPosition(element),
	};
	// A video shows its still until the clip has a frame
	const still =
		element instanceof HTMLImageElement
			? element
			: Object.assign(new Image(), { src: element.poster || element.dataset.poster || '' });
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

	redrawAll.add(redraw);

	// Place the canvas now: left where it lands in the flow until the still loads,
	// it jumped into place later, a layout shift
	fit();

	// Not img.decode(): a lazy image starting to load cancels a pending decode
	const onStill = () => {
		const { mean, low, high } = measure(still);
		const invert = mean > LIGHT_IMAGE_MEAN && element.dataset.halftoneNoInvert === undefined;
		Object.assign(look, { invert, low, high });
		stillReady = true;
		redraw();
	};
	if (still.complete && still.naturalWidth) onStill();
	else if (still.src) {
		still.addEventListener('load', onStill, { once: true });
		retryImageLoadOnce(still, () => {
			throw new Error(`Halftone: ${still.currentSrc || still.src} failed to load twice`);
		});
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

/** Shows the color originals. */
function showOriginals(): void {
	document.documentElement.classList.remove('halftone-on');
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
	if (draw) {
		// BaseHead's 3s fallback may have shown the originals already on a slow load
		document.documentElement.classList.add('halftone-on', 'halftone-ready');
		// Set up each picture only as it nears the screen: doing all of them at load
		// (a canvas, a pixel sample and a forced layout each) cost a phone 1-2s of main
		// thread on /work/ and held back the first screen. A hidden one (a filtered-out
		// row) never intersects, so it waits until it's shown.
		const attachWhenNear = new IntersectionObserver(
			(entries) => {
				for (const { target, isIntersecting } of entries) {
					if (!isIntersecting) continue;
					attachWhenNear.unobserve(target);
					attach(target as Source, draw);
				}
			},
			{ rootMargin: '400px 0px' },
		);
		elements.forEach((element) => attachWhenNear.observe(element));
	} else showOriginals();
}
