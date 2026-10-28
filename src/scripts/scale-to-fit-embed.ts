// Renders an iframe[data-native-width][data-native-height] at that native size and
// scales it down to fill its container. For embeds that refuse to run below a
// minimum window: the Connect AI × DOOM web build needs at least 900x560, wider
// than the blog column. The container sets the aspect ratio and clips; without
// JavaScript the iframe shows at native size, cropped.
const scaledEmbeds = document.querySelectorAll<HTMLIFrameElement>(
	'iframe[data-native-width][data-native-height]',
);
if (scaledEmbeds.length) {
	const observer = new ResizeObserver((entries) => {
		for (const { target } of entries) {
			const frame = target.querySelector<HTMLIFrameElement>('iframe[data-native-width]');
			if (!frame) continue;
			const scale = (target as HTMLElement).clientWidth / Number(frame.dataset.nativeWidth);
			frame.style.transform = `scale(${scale})`;
		}
	});
	scaledEmbeds.forEach((frame) => {
		Object.assign(frame.style, {
			width: `${frame.dataset.nativeWidth}px`,
			height: `${frame.dataset.nativeHeight}px`,
			transformOrigin: '0 0',
		});
		if (frame.parentElement) observer.observe(frame.parentElement);
	});
}
