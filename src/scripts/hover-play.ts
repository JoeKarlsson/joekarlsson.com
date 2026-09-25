// Hover or keyboard focus plays a video[data-hover-play]; leaving pauses and
// rewinds it. No autoplay: an unstoppable loop over five seconds fails WCAG 2.2.2.
//
// The trigger is the closest [data-hover-target] (a whole project card), or the
// video itself. A clip the viewer started from its own controls is left alone -
// only playback that hover started gets stopped on the way out.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
	document.querySelectorAll<HTMLVideoElement>('video[data-hover-play]').forEach((video) => {
		const trigger = video.closest<HTMLElement>('[data-hover-target]') ?? video;
		let hoverStarted = false;

		const play = () => {
			if (!video.paused) return;
			hoverStarted = true;
			video.play().catch(() => {});
		};
		const stop = () => {
			if (!hoverStarted) return;
			hoverStarted = false;
			video.pause();
			video.currentTime = 0;
		};

		trigger.addEventListener('mouseenter', play);
		trigger.addEventListener('focus', play);
		trigger.addEventListener('mouseleave', stop);
		trigger.addEventListener('blur', stop);
	});
}
