/**
 * Turn each question in a post's FAQ section into a <details> toggle.
 *
 * An FAQ is the run of content after an h2 called "Frequently Asked Questions",
 * "FAQ" or "FAQs", up to the next h2. Each h3 in it becomes the <summary> of its
 * own <details>, holding the answer that follows, so a reader on a phone sees a
 * short list of questions instead of several screens of answers. The answers stay
 * in the page, so search engines still read them.
 */
const FAQ_HEADING = /^(frequently asked questions|faqs?)$/i;

function textOf(node) {
	if (node.type === 'text') return node.value;
	return (node.children ?? []).map(textOf).join('');
}

// The pink plus that turns to a minus while the answer is open: both glyphs stacked
// in one cell so they crossfade (.icon-swap, motion.css)
const glyph = (attr, value) => ({
	type: 'element',
	tagName: 'span',
	properties: { [attr]: '' },
	children: [{ type: 'text', value }],
});
const faqSign = () => ({
	type: 'element',
	tagName: 'span',
	properties: { className: ['faq-sign', 'icon-swap'], ariaHidden: 'true' },
	children: [glyph('dataIconOff', '+'), glyph('dataIconOn', '–')],
});

const isHeading = (node, tagName) => node.type === 'element' && node.tagName === tagName;

export default function rehypeFaqDetails() {
	return (tree) => {
		const output = [];
		let inFaq = false;
		let question = null;

		for (const node of tree.children) {
			if (isHeading(node, 'h2')) {
				question = null;
				inFaq = FAQ_HEADING.test(textOf(node).trim());
				output.push(node);
			} else if (inFaq && isHeading(node, 'h3')) {
				question = {
					type: 'element',
					tagName: 'details',
					properties: { className: ['faq'] },
					children: [
						{ type: 'element', tagName: 'summary', properties: {}, children: [node, faqSign()] },
					],
				};
				output.push(question);
			} else if (question) {
				question.children.push(node);
			} else {
				output.push(node);
			}
		}

		tree.children = output;
	};
}
