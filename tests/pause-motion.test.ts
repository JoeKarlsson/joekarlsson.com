// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	MOTION_RESUMED_EVENT,
	PAUSED_CLASS,
	PAUSED_STORAGE_KEY,
	initPauseMotion,
	isMotionPaused,
} from '../src/scripts/pause-motion';

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
		localStorage.clear();
		document.documentElement.className = '';
		document.body.innerHTML =
			'<button data-pause-motion aria-pressed="false" aria-label="Pause motion"><span data-pause-label>Pause motion</span></button>';
		button = document.querySelector('button')!;
		initPauseMotion(button);
	});

	it('pauses motion and playing videos, then resumes only those videos', () => {
		const playing = fakeVideo(true);
		const stopped = fakeVideo(false);

		button.click();
		expect(isMotionPaused()).toBe(true);
		expect(button.getAttribute('aria-pressed')).toBe('true');
		// One name in both states; aria-pressed says which
		expect(button.getAttribute('aria-label')).toBe('Pause motion');
		expect(button.textContent).toBe('Pause motion');
		expect(playing.pause).toHaveBeenCalled();

		button.click();
		expect(isMotionPaused()).toBe(false);
		expect(button.getAttribute('aria-pressed')).toBe('false');
		expect(button.getAttribute('aria-label')).toBe('Pause motion');
		expect(playing.play).toHaveBeenCalled();
		expect(stopped.play).not.toHaveBeenCalled();
	});

	it('remembers the pause for the next page, and forgets it on resume', () => {
		button.click();
		expect(localStorage.getItem(PAUSED_STORAGE_KEY)).toBe('1');
		button.click();
		expect(localStorage.getItem(PAUSED_STORAGE_KEY)).toBeNull();
	});

	it('shows the remembered pause on a new page, and resuming starts clips on screen', () => {
		// The next page: BaseHead's inline script already put the class back
		document.documentElement.className = PAUSED_CLASS;
		document.body.innerHTML =
			'<button data-pause-motion aria-pressed="false" aria-label="Pause motion"></button>';
		const next = document.querySelector('button')!;
		initPauseMotion(next);
		expect(next.getAttribute('aria-pressed')).toBe('true');

		const resumed = vi.fn();
		document.addEventListener(MOTION_RESUMED_EVENT, resumed);
		next.click();
		expect(isMotionPaused()).toBe(false);
		expect(resumed).toHaveBeenCalledOnce();
	});
});
