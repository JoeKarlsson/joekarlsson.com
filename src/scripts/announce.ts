// Says a message through a live region. VoiceOver stays silent when a region gets the same
// words it last read, even after emptying it, so a repeat gets a trailing no-break space
// (Modern Web Guidance, copy-button guide)
const lastMessage = new WeakMap<Element, string>();

export function announce(region: Element, message: string) {
	const text = lastMessage.get(region) === message ? `${message}\u00A0` : message;
	region.textContent = text;
	lastMessage.set(region, text);
}
