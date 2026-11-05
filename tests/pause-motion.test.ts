// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initPauseMotion, isMotionPaused } from '../src/scripts/pause-motion';

function fakeVideo(playing: boolean): HTMLVideoElement {
	const video = document.createElement('video');
	let paused = !playing;
	Object.defineProperty(video, 'paused', { get: () => paused });
	video.pause = vi.fn(() => {
		paused = true;
	});
	video.play = vi.fn(() => {
		paused = false;
		return Promise.resolve();
	});
	document.body.append(video);
	return video;
}

describe('pause motion button', () => {
	let button: HTMLButtonElement;

	beforeEach(() => {
		document.documentElement.className = '';
		document.body.innerHTML =
			'<button data-pause-motion aria-pressed="false" aria-label="Pause motion"></button>';
		button = document.querySelector('button')!;
		initPauseMotion(button);
	});

	it('pauses motion and playing videos, then resumes only those videos', () => {
		const playing = fakeVideo(true);
		const stopped = fakeVideo(false);

		button.click();
		expect(isMotionPaused()).toBe(true);
		expect(button.getAttribute('aria-pressed')).toBe('true');
		expect(button.getAttribute('aria-label')).toBe('Play motion');
		expect(playing.pause).toHaveBeenCalled();

		button.click();
		expect(isMotionPaused()).toBe(false);
		expect(button.getAttribute('aria-pressed')).toBe('false');
		expect(button.getAttribute('aria-label')).toBe('Pause motion');
		expect(playing.play).toHaveBeenCalled();
		expect(stopped.play).not.toHaveBeenCalled();
	});
});
