// Plays a video[data-autoplay-in-view] (the GIF stand-ins from rehype-gif-video,
// homepage loops, project clips) only while it is on screen, and pauses it when it
// scrolls away. With preload="none" nothing downloads until a clip is about to be
// seen, so a page with several clips doesn't pull them all on load. Reduced-motion
// users get a still clip. A clip the viewer paused from its controls stays paused,
// and nothing starts while the pause-motion button is on; when it's turned off,
// the clips on screen start. Inside a post's text, only one clip plays at a time: the
// one most in view, once it's mostly on screen, like the post's animated figures.
import { mostlyInView } from './filter-animations';
import { DESKTOP_EMBED_QUERY } from './load-desktop-embeds';
import { MOTION_RESUMED_EVENT, isMotionPaused } from './pause-motion';
import { mayBoil } from '../utils/paper-hero-motion';

// A clip marked data-phone-still (a post's montage loops) only autoplays where a paper
// hero may boil: a wide screen, motion allowed, no Save-Data, no 2g/3g. Everywhere else
// its poster, a still from the clip, is what shows; the controls still play it on request.
const wideScreen = matchMedia(DESKTOP_EMBED_QUERY);
function mayAutoplay(video: HTMLVideoElement): boolean {
	if (!video.hasAttribute('data-phone-still')) return true;
	const connection = (
		navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
	).connection;
	return mayBoil({
		reducedMotion: false,
		motionPaused: isMotionPaused(),
		wideScreen: wideScreen.matches,
		saveData: connection?.saveData,
		effectiveType: connection?.effectiveType,
	});
}

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
		if (!pausedByViewer.has(video) && !isMotionPaused() && mayAutoplay(video))
			video.play().catch(() => {});
	};
	const autoPause = (video: HTMLVideoElement) => {
		if (video.paused) return;
		video.dataset.autoPausing = '1';
		video.pause();
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
					autoPause(video);
				}
			}
		},
		{ rootMargin: '200px 0px' },
	);
	// A post's clips: two loops side by side split the reader's attention, and a 200px
	// head start plays the opening of a one-off clip before anyone can see it. So the
	// clip most in view plays, once it's mostly on screen, and the rest wait.
	const visibleHeight = new Map<HTMLVideoElement, number>();
	const postObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const video = entry.target as HTMLVideoElement;
				if (mostlyInView(entry)) visibleHeight.set(video, entry.intersectionRect.height);
				else visibleHeight.delete(video);
				// A clip started from its controls still stops once it's off screen
				if (!entry.isIntersecting) autoPause(video);
			}
			const [leader] = [...visibleHeight].sort((a, b) => b[1] - a[1])[0] ?? [];
			onScreen.forEach((video) => {
				if (video.closest('.prose') && video !== leader) {
					onScreen.delete(video);
					autoPause(video);
				}
			});
			if (leader && !onScreen.has(leader)) {
				onScreen.add(leader);
				play(leader);
			}
		},
		{ threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
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
		if (video.closest('.prose')) postObserver.observe(video);
		else observer.observe(video);
	});
	// Motion was paused when these scrolled in (perhaps on another page), so start them now
	document.addEventListener(MOTION_RESUMED_EVENT, () => onScreen.forEach((video) => play(video)));
	// The browser may pause clips while the tab is hidden and not start them again
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') onScreen.forEach((video) => play(video));
	});
}
