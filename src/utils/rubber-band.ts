/**
 * Movement past a limit that resists more the farther it's pulled (#19 in
 * ~/.claude/knowledge/web-motion.md): `over` pixels past the limit become fewer, never
 * more than `give`.
 */
export function rubberBand(over: number, give: number): number {
	return give * (1 - 1 / (over / give + 1));
}

/** `value` kept between `min` and `max`, rubber-banding past either end. */
export function rubberClamp(value: number, min: number, max: number, give: number): number {
	if (value < min) return min - rubberBand(min - value, give);
	if (value > max) return max + rubberBand(value - max, give);
	return value;
}
