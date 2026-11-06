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
					children: [{ type: 'element', tagName: 'summary', properties: {}, children: [node] }],
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
