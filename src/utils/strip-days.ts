/**
 * The day each cell of a commit strip stands for ("Nov 4"), oldest first, ending on
 * `lastDay` (YYYY-MM-DD, the now-feed snapshot's day). Worked in UTC so the build
 * machine's time zone can't shift a label by a day.
 */
export function stripDayLabels(lastDay: string, dayCount: number): string[] {
	const end = new Date(`${lastDay}T12:00:00Z`);
	return Array.from({ length: dayCount }, (_, index) => {
		const day = new Date(end);
		day.setUTCDate(end.getUTCDate() - (dayCount - 1 - index));
		return day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
	});
}
