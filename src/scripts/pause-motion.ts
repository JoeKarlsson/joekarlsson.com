// The "Pause motion" button: a <button data-pause-motion aria-pressed="false">.
// Pressing it sets .motion-paused on <html>, which freezes every CSS animation
// (src/styles/motion.css), and pauses playing videos. Resuming plays only the
// videos this button paused, so a clip the viewer stopped, or one held still for
// reduced motion, stays still.

export const PAUSED_CLASS = 'motion-paused';

export function isMotionPaused(): boolean {
	return document.documentElement.classList.contains(PAUSED_CLASS);
}

export function initPauseMotion(button: HTMLButtonElement): void {
	const pausedByButton = new Set<HTMLVideoElement>();

	button.addEventListener('click', () => {
		const pausing = !isMotionPaused();
		document.documentElement.classList.toggle(PAUSED_CLASS, pausing);
		button.setAttribute('aria-pressed', String(pausing));
		button.textContent = pausing ? 'Play motion' : 'Pause motion';

		if (pausing) {
			document.querySelectorAll('video').forEach((video) => {
				if (video.paused) return;
				// Tells in-view-play this pause isn't the viewer stopping the clip
				video.dataset.autoPausing = '1';
				video.pause();
				pausedByButton.add(video);
			});
		} else {
			pausedByButton.forEach((video) => video.play().catch(() => {}));
			pausedByButton.clear();
		}
	});
}
