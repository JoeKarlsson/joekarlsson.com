// Dithers a playing video[data-halftone] into the site's pink halftone, live, on a
// WebGL canvas laid over it. Pre-dithered video files run 10-40x the size of the
// original (codecs can't compress a field of dots), so the page ships the plain
// clip and draws the dots here, at screen resolution, the same size at any width.
//
// The video's parent must be `position: relative` and sized by the video. The
// canvas stays hidden until the clip first plays, so the halftone poster shows
// until then (and always, under reduced motion, when nothing plays). With no
// WebGL the clip plays in color.
//
// Follows scripts/media/halftone.py (dots on a 45-degree grid sized by
// brightness, contrast 1.15, over a soft pink duotone), but finer, with more of
// the duotone and a lift for dark footage, so screen recordings stay readable.

// Dot spacing in CSS pixels, unless the video sets data-halftone="6"
const DEFAULT_CELL_CSS_PX = 3;
const INK = [1, 0x4f / 255, 0xd8 / 255]; // #ff4fd8

const VERTEX_SHADER = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform sampler2D video;
uniform vec2 canvasSize;   // device pixels
uniform vec2 coverScale;   // object-fit: cover, as a UV scale around the center
uniform float cell;        // dot spacing, device pixels
uniform vec3 ink;

const float CONTRAST = 1.15;
const float DOTS_OVER_DUOTONE = 0.5;
// Lifts dark screen recordings (most project clips) so their UI reads through the dots
const float GAMMA = 0.7;
const mat2 ROTATE = mat2(0.70710678, 0.70710678, -0.70710678, 0.70710678);

// Grid space back to pixels. GLSL ES 1.0 has no transpose(), and a rotation's
// inverse is its transpose
vec2 unrotate(vec2 p) { return vec2(dot(p, ROTATE[0]), dot(p, ROTATE[1])); }

float brightness(vec2 pixel) {
	vec2 uv = (pixel / canvasSize - 0.5) * coverScale + 0.5;
	vec3 rgb = texture2D(video, clamp(uv, 0.0, 1.0)).rgb;
	float luma = pow(dot(rgb, vec3(0.299, 0.587, 0.114)), GAMMA);
	return clamp((luma - 0.5) * CONTRAST + 0.5, 0.0, 1.0);
}

void main() {
	vec2 pixel = vec2(gl_FragCoord.x, canvasSize.y - gl_FragCoord.y);
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
	vec3 tone = ink * brightness(pixel);
	gl_FragColor = vec4(mix(tone, ink * dots, DOTS_OVER_DUOTONE), 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
	const shader = gl.createShader(type)!;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(`Halftone shader: ${gl.getShaderInfoLog(shader)}`);
	}
	return shader;
}

function halftone(video: HTMLVideoElement): void {
	const canvas = document.createElement('canvas');
	canvas.setAttribute('aria-hidden', 'true');
	canvas.className = video.className;
	canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;visibility:hidden';
	const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
	if (!gl) return;
	video.after(canvas);

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
	const canvasSize = gl.getUniformLocation(program, 'canvasSize');
	const coverScale = gl.getUniformLocation(program, 'coverScale');
	const cell = gl.getUniformLocation(program, 'cell');
	const cellCssPx = Number(video.dataset.halftone) || DEFAULT_CELL_CSS_PX;

	function draw() {
		if (video.readyState < video.HAVE_CURRENT_DATA || !gl) return;
		const ratio = window.devicePixelRatio || 1;
		const width = Math.round(canvas.clientWidth * ratio);
		const height = Math.round(canvas.clientHeight * ratio);
		if (!width || !height) return;
		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
			gl.viewport(0, 0, width, height);
		}
		const canvasAspect = width / height;
		const videoAspect = video.videoWidth / video.videoHeight;
		gl.uniform2f(canvasSize, width, height);
		gl.uniform2f(
			coverScale,
			canvasAspect < videoAspect ? canvasAspect / videoAspect : 1,
			canvasAspect < videoAspect ? 1 : videoAspect / canvasAspect,
		);
		gl.uniform1f(cell, cellCssPx * ratio);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		canvas.style.visibility = 'visible';
	}

	// Redraw every new frame while playing, and once after a seek (scrubbing a
	// paused clip from its controls would otherwise show that frame in color)
	const onFrame = () => {
		draw();
		if (!video.paused) video.requestVideoFrameCallback(onFrame);
	};
	video.addEventListener('play', () => video.requestVideoFrameCallback(onFrame));
	video.addEventListener('seeked', draw);
}

// requestVideoFrameCallback: every current browser (Firefox since 132)
if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
	document.querySelectorAll<HTMLVideoElement>('video[data-halftone]').forEach(halftone);
}
