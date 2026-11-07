// Safari on iPhone keeps an offscreen buffer for every filtered element, at 3x the
// pixels, and the diagrams' boil animation redraws them several times a second. When
// every crayon stroke's filter covered the whole figure (10 to 50 figures' worth of
// filtered area per diagram), posts with diagrams ran out of memory and the tab
// reloaded over and over. Each stroke's filter now covers just that stroke.
export const MAX_FILTERED_AREA_PER_FIGURE = 3;

/** Every filtered element's region added up, as a multiple of the figure's own area */
export function filteredAreaRatio(svg: string): number {
	const [, width, height] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/) ?? [];
	const figureArea = Number(width) * Number(height);
	const regions = new Map<string, number>();
	for (const filter of svg.matchAll(/<filter\b[^>]*>/g)) {
		const attr = (name: string) => filter[0].match(new RegExp(`\\s${name}="([^"]+)"`))?.[1];
		const id = attr('id');
		if (!id) continue;
		// A filter left in bounding-box units can't be sized from the file: count it as the whole figure
		const userSpace = attr('filterUnits') === 'userSpaceOnUse';
		regions.set(id, userSpace ? Number(attr('width')) * Number(attr('height')) : figureArea);
	}
	let total = 0;
	for (const [, id] of svg.matchAll(/filter="url\(#([^)]+)\)"/g)) total += regions.get(id) ?? 0;
	return total / figureArea;
}
