// Class strings shared across pages, so the same element looks the same everywhere.

/** Every page's column: the same width, gutters and top gap, so the left edge never jumps between pages. */
export const PAGE_CONTAINER = 'relative mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-7 md:pt-10';

/** The "On this page" sidebar beside one column (About, Uses, posts, projects, newsletter issues). */
export const SIDEBAR_GRID = 'xl:grid xl:grid-cols-[200px_1fr] xl:gap-10';

/** The title of a post, project or newsletter issue. */
export const ARTICLE_TITLE =
	'mb-4 font-display text-[clamp(2.4rem,1.6rem+3.2vw,4.25rem)] leading-[0.95] font-normal text-paper uppercase';

/** A heading inside an article, the size of a prose h2 (global.css). */
export const ARTICLE_HEADING =
	'mb-5 font-display text-[clamp(1.9rem,1.4rem+1.9vw,2.9rem)] leading-none font-normal text-paper uppercase';

/** A group heading under a section heading (Uses, About, the now feed). */
export const GROUP_HEADING =
	'font-display text-[clamp(24px,2vw,30px)] leading-none font-normal text-paper uppercase';

/** The title of one item in a list: a job, a talk, a project step. */
export const ITEM_TITLE = 'font-sans text-xl leading-snug font-semibold text-paper';

/** Dates, bylines, counts and other small gray metadata. */
export const META = 'text-sm text-muted';

/** The line or two in a PosterHero's dark panel, above the page's name. */
export const HERO_LEAD = 'text-[clamp(18px,1.5vw,22px)] text-paper';

/** A pink Anton section heading on a page (Home, About, Resume, Uses, Contact, Newsletter, 404). */
export const SECTION_HEADING =
	'relative mb-6 w-fit font-display text-[clamp(40px,4.6vw,64px)] leading-none font-normal text-pink uppercase';

/** The solid pink button. `sticker` tilts it on hover and squashes it when pressed (motion.css). */
export const PRIMARY_BUTTON =
	'sticker inline-flex items-center gap-2 rounded-md bg-pink px-[18px] py-3 font-semibold text-ink no-underline hover:bg-paper';

/** The outlined pink button beside a primary one. */
export const SECONDARY_BUTTON =
	'sticker inline-flex items-center gap-2 rounded-md border-2 border-pink px-4 py-2.5 font-semibold text-pink no-underline hover:border-paper hover:text-paper';

/** A paper-white link with a pink underline, in lists and running text outside prose. */
export const TEXT_LINK = 'text-paper underline decoration-pink underline-offset-4 hover:text-pink';

/** A bold pink "more" link, such as "All 178 posts →". It's an inline link, so py-3
 * grows its tap area to 44px tall without moving anything around it. */
export const MORE_LINK = 'py-3 font-semibold text-pink no-underline hover:text-paper';

/** One option in a filter row (blog categories, who posts were written for, project
 * categories). On phones each option is a 44px-tall tap target. */
export const FILTER_ACTIVE = 'cursor-pointer py-2.5 text-pink underline underline-offset-4 md:py-0';
export const FILTER_INACTIVE =
	'cursor-pointer py-2.5 text-paper no-underline hover:text-pink md:py-0';

/** The row of filter options itself. Phones space the rows with the options' own padding. */
export const FILTER_ROW = 'flex flex-wrap gap-x-5 md:gap-y-2';

/** "Nov 5, 2026": the one date format on the site. */
export function formatDate(date: Date): string {
	return date.toLocaleDateString('en-US', {
		timeZone: 'UTC',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}
