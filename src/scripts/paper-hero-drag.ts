// A post's paper hero (src/components/PaperHero.astro) is a toy: grab a strip of tape or
// the topic scrap and it stretches out a little with a lift, resisting the farther it's
// pulled, then springs back into place with a small overshoot when let go. The overshoot
// is allowed here because the hero is decoration, not everyday UI (#13). The piece
// follows the pointer 1:1 while held and animates only on release (#14).
import { rubberClamp } from '../utils/rubber-band';

// Free travel before the pull starts to resist, and how much farther it can ever go
const LEASH_PX = 24;
const GIVE_PX = 50;
const SPRING_BACK_MS = 520;
const SPRING_BACK = 'linear(0, 0.35 8%, 0.8 17%, 1.05 28%, 1.09 35%, 1.03 50%, 0.99 64%, 1)';

function currentTranslate(piece: HTMLElement): { x: number; y: number } {
	const [x = 0, y = 0] = getComputedStyle(piece).translate.split(' ').map(parseFloat);
	return { x: x || 0, y: y || 0 };
}

export function initPaperHeroDrag(hero: HTMLElement): void {
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	for (const piece of hero.querySelectorAll<HTMLElement>('.ph-tape, .ph-tag')) {
		let grab: { x: number; y: number; from: { x: number; y: number } } | null = null;
		let at = { x: 0, y: 0 };
		let springBack: Animation | undefined;

		piece.addEventListener('pointerdown', (event) => {
			// A finger scrolls the page instead (touch-action, PaperHero.astro)
			if (event.button !== 0 || event.pointerType === 'touch') return;
			piece.setPointerCapture(event.pointerId);
			// Caught mid-spring: hold it where it is instead of jumping home
			const from = currentTranslate(piece);
			springBack?.cancel();
			at = from;
			piece.style.translate = `${from.x}px ${from.y}px`;
			grab = { x: event.clientX, y: event.clientY, from };
			piece.toggleAttribute('data-held', true);
		});
		piece.addEventListener('pointermove', (event) => {
			if (!grab) return;
			const leash = (value: number) => rubberClamp(value, -LEASH_PX, LEASH_PX, GIVE_PX);
			at = {
				x: leash(grab.from.x + event.clientX - grab.x),
				y: leash(grab.from.y + event.clientY - grab.y),
			};
			piece.style.translate = `${at.x}px ${at.y}px`;
		});
		const letGo = () => {
			if (!grab) return;
			grab = null;
			piece.removeAttribute('data-held');
			const from = `${at.x}px ${at.y}px`;
			at = { x: 0, y: 0 };
			piece.style.translate = '';
			if (reducedMotion.matches) return;
			springBack = piece.animate([{ translate: from }, { translate: '0px 0px' }], {
				duration: SPRING_BACK_MS,
				easing: SPRING_BACK,
			});
		};
		piece.addEventListener('pointerup', letGo);
		piece.addEventListener('pointercancel', letGo);
	}
}
