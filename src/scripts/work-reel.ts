// The /work/ hero reel plays a slice of each selected work in turn. Its caption and link
// follow the piece on screen, so clicking the reel opens what you're looking at.

/** Which slice of the reel is on screen at `seconds` (the last one holds to the end). */
export function reelPieceAt(seconds: number, sliceSeconds: number, count: number): number {
	return Math.min(count - 1, Math.max(0, Math.floor(seconds / sliceSeconds)));
}

export function initWorkReel(reel: HTMLAnchorElement): void {
	const pieces: { title: string; href: string }[] = JSON.parse(reel.dataset.reelPieces!);
	const sliceSeconds = Number(reel.dataset.reelSlice);
	const video = reel.querySelector('video')!;
	const title = reel.querySelector('[data-reel-title]')!;
	const position = reel.querySelector('[data-reel-position]')!;
	video.addEventListener('timeupdate', () => {
		const i = reelPieceAt(video.currentTime, sliceSeconds, pieces.length);
		if (reel.getAttribute('href') === pieces[i].href) return;
		reel.setAttribute('href', pieces[i].href);
		title.textContent = pieces[i].title;
		position.textContent = String(i + 1);
	});
}

const reel = document.querySelector<HTMLAnchorElement>('a[data-reel-pieces]');
if (reel) initWorkReel(reel);
