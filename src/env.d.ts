/// <reference types="astro/client" />

interface Window {
	plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
	tiktokEmbed?: { lib: { render: () => void } };
}
