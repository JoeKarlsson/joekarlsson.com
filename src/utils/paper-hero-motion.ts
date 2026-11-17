// When decoration may boil (in-view-play, review stats). It stays still until every check
// passes, so a phone, a slow connection or a reader who asked for less motion never pays for it.

/** Connections too slow to spend anything on decoration */
const SLOW_CONNECTIONS = new Set(['slow-2g', '2g', '3g']);

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

/** The browser's Save-Data and connection speed hints, where it has them (Chromium) */
export function connectionHints(): Pick<BoilConditions, 'saveData' | 'effectiveType'> {
	const connection = (
		navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
	).connection;
	return { saveData: connection?.saveData, effectiveType: connection?.effectiveType };
}
