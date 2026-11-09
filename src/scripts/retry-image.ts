/**
 * Refetches an image once after it fails, then calls onFailedTwice if that fails too.
 * A dropped request on a flaky connection would otherwise leave the picture blank.
 * Setting the attribute again, even to the same value, makes the browser fetch it again.
 */
export function retryImageLoadOnce(
	image: HTMLImageElement,
	onFailedTwice: () => void,
	delayMs = 1000,
): void {
	const retryAttribute = image.hasAttribute('srcset') ? 'srcset' : 'src';
	let retried = false;
	const onError = () => {
		if (retried) return onFailedTwice();
		retried = true;
		image.addEventListener('error', onError, { once: true });
		setTimeout(
			() => image.setAttribute(retryAttribute, image.getAttribute(retryAttribute) ?? ''),
			delayMs,
		);
	};
	image.addEventListener('error', onError, { once: true });
}
