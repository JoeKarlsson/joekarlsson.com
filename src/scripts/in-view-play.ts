// Plays a video[data-autoplay-in-view] (the GIF stand-ins from rehype-gif-video,
// homepage loops, project clips) only while it is on screen, and pauses it when it
// scrolls away. With preload="none" nothing downloads until a clip is about to be
// seen, so a page with several clips doesn't pull them all on load. Reduced-motion
// users get a still clip. A clip the viewer paused from its controls stays paused,
// and nothing starts while the pause-motion button is on; when it's turned off,
// the clips on screen start.
import { MOTION_RESUMED_EVENT, isMotionPaused } from './pause-motion';

const videos = document.querySelectorAll<HTMLVideoElement>('video[data-autoplay-in-view]');

// A clip hidden on phones or far down the page keeps its still in data-poster and gets
// it as it nears the screen: a poster attribute downloads at load, even on a hidden
// clip (ProjectCard). Under reduced motion too, where the still is all there is.
const lazyPosters = document.querySelectorAll<HTMLVideoElement>('video[data-poster]');
if (lazyPosters.length) {
	const posterObserver = new IntersectionObserver(
		(entries) => {
			for (const { target, isIntersecting } of entries) {
				if (!isIntersecting) continue;
				const video = target as HTMLVideoElement;
				posterObserver.unobserve(video);
				video.poster = video.dataset.poster!;
			}
		},
		{ rootMargin: '400px 0px' },
	);
	lazyPosters.forEach((video) => posterObserver.observe(video));
}
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
			// Only a clip with controls, on a visible page, can be paused by the viewer.
			// Any other pause is the browser's (hidden tab, display asleep), and counting
			// it as the viewer's froze the homepage montage for good.
			else if (video.controls && document.visibilityState === 'visible') pausedByViewer.add(video);
		});
		video.addEventListener('play', () => pausedByViewer.delete(video));
		observer.observe(video);
	});
	// Motion was paused when these scrolled in (perhaps on another page), so start them now
	document.addEventListener(MOTION_RESUMED_EVENT, () => onScreen.forEach((video) => play(video)));
	// The browser may pause clips while the tab is hidden and not start them again
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') onScreen.forEach((video) => play(video));
	});
}
