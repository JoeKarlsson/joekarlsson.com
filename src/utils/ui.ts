// Class strings shared across pages, so the same element looks the same everywhere.

/** A pink Anton section heading on a page (About, Resume, Uses, Contact, 404). */
export const SECTION_HEADING =
	'relative mb-6 w-fit font-display text-[clamp(40px,4.6vw,64px)] leading-none font-normal text-pink uppercase';

/** The solid pink button. */
export const PRIMARY_BUTTON =
	'inline-flex items-center gap-2 rounded-md bg-pink px-[18px] py-3 font-semibold text-ink no-underline hover:bg-paper';

/** The outlined pink button beside a primary one. */
export const SECONDARY_BUTTON =
	'inline-flex items-center gap-2 rounded-md border-2 border-pink px-4 py-2.5 font-semibold text-pink no-underline hover:border-paper hover:text-paper';

/** A bold pink "more" link, such as "All 178 posts →". */
export const MORE_LINK = 'font-semibold text-pink no-underline hover:text-paper';

/** One option in a filter row (blog categories, who posts were written for, project categories). */
export const FILTER_ACTIVE = 'cursor-pointer text-pink underline underline-offset-4';
export const FILTER_INACTIVE = 'cursor-pointer text-paper no-underline hover:text-pink';

/** The row of filter options itself. */
export const FILTER_ROW = 'flex flex-wrap gap-x-5 gap-y-2 text-[15px]';

/** "Nov 5, 2026": the one date format on the site. */
export function formatDate(date: Date): string {
	return date.toLocaleDateString('en-US', {
		timeZone: 'UTC',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}
