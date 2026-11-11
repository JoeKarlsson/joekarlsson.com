// The "Pause motion" button: a <button data-pause-motion aria-pressed="false">.
// Pressing it sets .motion-paused on <html>, which freezes every CSS animation
// (src/styles/motion.css), and pauses playing videos. Resuming plays the videos
// this button paused, and tells in-view-play to start the clips on screen, so a
// clip the viewer stopped, or one held still for reduced motion, stays still.
//
// The choice is remembered across pages: an inline script in BaseHead puts the
// class back before the page paints (PAUSED_STORAGE_KEY), and this script sets the
// button to match.

export const PAUSED_CLASS = 'motion-paused';
// Read by the inline script in BaseHead, which has to run before this module loads
export const PAUSED_STORAGE_KEY = 'motion-paused';
// Fired on document when motion resumes, for in-view-play
export const MOTION_RESUMED_EVENT = 'motion-resumed';
// Fired on document when the button pauses motion, for still-images
export const MOTION_PAUSED_EVENT = 'motion-paused';

export function isMotionPaused(): boolean {
	return document.documentElement.classList.contains(PAUSED_CLASS);
}

function rememberPaused(paused: boolean): void {
	// Browser storage can be blocked (private windows, site data off); the pause
	// still works on this page, it just isn't remembered
	try {
		if (paused) localStorage.setItem(PAUSED_STORAGE_KEY, '1');
		else localStorage.removeItem(PAUSED_STORAGE_KEY);
	} catch {
		// Not remembered; nothing else to do
	}
}

// A toggle keeps one name, "Pause motion", and aria-pressed carries the state; a name
// that also flips to "Play motion" read as "Play motion, pressed"
function showState(button: HTMLButtonElement, paused: boolean): void {
	button.setAttribute('aria-pressed', String(paused));
}

export function initPauseMotion(button: HTMLButtonElement): void {
	const pausedByButton = new Set<HTMLVideoElement>();
	showState(button, isMotionPaused());

	button.addEventListener('click', () => {
		const pausing = !isMotionPaused();
		document.documentElement.classList.toggle(PAUSED_CLASS, pausing);
		showState(button, pausing);
		rememberPaused(pausing);

		if (pausing) {
			document.querySelectorAll('video').forEach((video) => {
				if (video.paused) return;
				// Tells in-view-play this pause isn't the viewer stopping the clip
				video.dataset.autoPausing = '1';
				video.pause();
				pausedByButton.add(video);
			});
			document.dispatchEvent(new Event(MOTION_PAUSED_EVENT));
		} else {
			pausedByButton.forEach((video) => video.play().catch(() => {}));
			pausedByButton.clear();
			document.dispatchEvent(new Event(MOTION_RESUMED_EVENT));
		}
	});
}
