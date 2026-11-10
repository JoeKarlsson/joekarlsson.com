// Swaps a click-to-play YouTube button (YouTubeFacade.astro, or a standalone link in
// a post via rehype-youtube-embed) for the youtube-nocookie player, playing.
// Until then the page costs one thumbnail instead of ~900KB of player scripts.
// The thumbnail stays over the player while it loads, then fades out, so there's no
// black frame between them (motion.css, #16 in ~/.claude/knowledge/web-motion.md).
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
		const holder = document.createElement('div');
		holder.className = 'relative';
		button.replaceWith(holder);
		holder.append(iframe, button);
		button.classList.add('youtube-facade-loading');
		button.disabled = true;
		button.setAttribute('aria-hidden', 'true');
		iframe.focus();
		iframe.addEventListener(
			'load',
			() => {
				button.classList.add('youtube-facade-gone');
				// No transition under reduced motion, so no transitionend: a timer removes it
				setTimeout(() => button.remove(), 250);
			},
			{ once: true },
		);
	});
}
