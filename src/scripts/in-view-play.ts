// Plays a video[data-autoplay-in-view] (the GIF stand-ins from rehype-gif-video,
// homepage loops, project clips) only while it is on screen, and pauses it when it
// scrolls away. With preload="none" nothing downloads until a clip is about to be
// seen, so a page with several clips doesn't pull them all on load. Reduced-motion
// users get a still clip. A clip the viewer paused from its controls stays paused,
// and nothing starts while the pause-motion button is on; when it's turned off,
// the clips on screen start.
import { MOTION_RESUMED_EVENT, isMotionPaused } from './pause-motion';

const videos = document.querySelectorAll<HTMLVideoElement>('video[data-autoplay-in-view]');
if (videos.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
	const pausedByViewer = new WeakSet<HTMLVideoElement>();
	const onScreen = new Set<HTMLVideoElement>();
	const play = (video: HTMLVideoElement) => {
		if (!pausedByViewer.has(video) && !isMotionPaused()) video.play().catch(() => {});
	};
	const observer = new IntersectionObserver(
		(entries) => {
			for (const { target, isIntersecting } of entries) {
				const video = target as HTMLVideoElement;
				if (isIntersecting) {
					onScreen.add(video);
					play(video);
				} else {
					onScreen.delete(video);
					if (!video.paused) {
						video.dataset.autoPausing = '1';
						video.pause();
					}
				}
			}
		},
		{ rootMargin: '200px 0px' },
	);
	videos.forEach((video) => {
		video.addEventListener('pause', () => {
			if (video.dataset.autoPausing) delete video.dataset.autoPausing;
			else pausedByViewer.add(video);
		});
		video.addEventListener('play', () => pausedByViewer.delete(video));
		observer.observe(video);
	});
	// Motion was paused when these scrolled in (perhaps on another page), so start them now
	document.addEventListener(MOTION_RESUMED_EVENT, () => onScreen.forEach((video) => play(video)));
}
