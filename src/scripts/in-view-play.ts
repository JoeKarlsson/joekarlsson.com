// Plays a video[data-autoplay-in-view] (the GIF stand-ins from rehype-gif-video)
// only while it is on screen, and pauses it when it scrolls away. With
// preload="none" nothing downloads until a clip is about to be seen, so a post
// with several clips doesn't pull them all on page load. Reduced-motion users get
// a still clip with controls. A clip the viewer paused from its controls stays
// paused.
const videos = document.querySelectorAll<HTMLVideoElement>('video[data-autoplay-in-view]');
if (videos.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
	const pausedByViewer = new WeakSet<HTMLVideoElement>();
	const observer = new IntersectionObserver(
		(entries) => {
			for (const { target, isIntersecting } of entries) {
				const video = target as HTMLVideoElement;
				if (isIntersecting) {
					if (!pausedByViewer.has(video)) video.play().catch(() => {});
				} else if (!video.paused) {
					video.dataset.autoPausing = '1';
					video.pause();
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
}
