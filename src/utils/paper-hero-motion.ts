// When a post's paper hero (src/components/PaperHero.astro) may boil. It is a still picture
// until every check passes, so a phone, a slow connection, a struggling device or a reader
// who asked for less motion never pays for it.

/** Connections too slow to spend anything on decoration */
const SLOW_CONNECTIONS = new Set(['slow-2g', '2g', '3g']);
/** Below this, the boil's repaints would be making the page itself janky */
export const MIN_SMOOTH_FPS = 40;

export interface BoilConditions {
	reducedMotion: boolean;
	motionPaused: boolean;
	// Not a phone: DESKTOP_EMBED_QUERY in src/scripts/load-desktop-embeds.ts
	wideScreen: boolean;
	saveData?: boolean;
	effectiveType?: string;
}

/** Everything that can be known before measuring the device */
export function mayBoil(conditions: BoilConditions): boolean {
	if (conditions.reducedMotion || conditions.motionPaused || !conditions.wideScreen) return false;
	if (conditions.saveData) return false;
	return !SLOW_CONNECTIONS.has(conditions.effectiveType ?? '');
}

/** The device kept up while the page settled */
export function keepsUp(framesPerSecond: number): boolean {
	return framesPerSecond >= MIN_SMOOTH_FPS;
}
