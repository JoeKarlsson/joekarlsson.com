// Swaps a click-to-play YouTube button (YouTubeFacade.astro, or a standalone link in
// a post via rehype-youtube-embed) for the youtube-nocookie player, playing.
// Until then the page costs one thumbnail instead of ~900KB of player scripts.
for (const button of document.querySelectorAll<HTMLButtonElement>('button.youtube-facade')) {
	button.addEventListener('click', () => {
		const iframe = document.createElement('iframe');
		iframe.src = `https://www.youtube-nocookie.com/embed/${button.dataset.youtubeId}?autoplay=1`;
		iframe.title = button.dataset.youtubeTitle ?? '';
		iframe.allow =
			'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
		iframe.allowFullscreen = true;
		iframe.className = 'block aspect-video w-full rounded-xl';
		iframe.style.border = '0';
		button.replaceWith(iframe);
		iframe.focus();
	});
}
