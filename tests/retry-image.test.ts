// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { retryImageLoadOnce } from '../src/scripts/retry-image';

describe('retryImageLoadOnce', () => {
	it('refetches once, then reports the second failure', () => {
		vi.useFakeTimers();
		const image = document.createElement('img');
		image.setAttribute('srcset', '/a.webp 1x');
		const setAttribute = vi.spyOn(image, 'setAttribute');
		const onFailedTwice = vi.fn();
		retryImageLoadOnce(image, onFailedTwice);

		image.dispatchEvent(new Event('error'));
		vi.runAllTimers();
		expect(setAttribute).toHaveBeenCalledWith('srcset', '/a.webp 1x');
		expect(onFailedTwice).not.toHaveBeenCalled();

		image.dispatchEvent(new Event('error'));
		expect(onFailedTwice).toHaveBeenCalledOnce();
		vi.useRealTimers();
	});
});
