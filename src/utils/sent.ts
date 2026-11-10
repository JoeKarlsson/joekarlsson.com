/** Sent by `when` (the build): an issue dated later is a scheduled send, not an archive entry */
export function isSent(date: Date, when: Date = new Date()): boolean {
	return date.valueOf() <= when.valueOf();
}
