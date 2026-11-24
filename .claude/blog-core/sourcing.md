# Sourcing

Core file (`.claude/blog-core.md`). Every significant factual claim links to a source, so readers and answer engines can verify it. Enforced while writing, by `blog-fact-checker`, by `blog-seo-aeo-reviewer`'s inline-evidence check and by `blog-eeat-reviewer`.

- **Cite inline, at the point of assertion.** Version numbers, capability claims, stats, benchmarks, standards and competitive points get a link right where the claim is made, not in a references list at the end.
- **Link every product, tool and protocol at its first mention** to its docs, with a short definition (`demo-and-how-to-posts.md`, **Define and link at first mention**).
- **Primary sources only**: official docs, release notes and changelogs, standards bodies, papers, the author's own post or talk, the forum thread where the fix was found. Not roundups that quote them, SEO listicles or marketing pages.
- **Competitive claims link to the competitor's own documentation**, never its marketing pages, and must be verifiable against it.
- **A source likely to change** (pricing, a README, a promise a company walked back) gets cited as a dated Wayback Machine snapshot, not the live page.
- **Quotes match their source exactly**, in quotation marks as published, with `…` where you cut. Otherwise paraphrase.
- **Every quote links its source at the quote.** A quote from a book names the book (author, title, year) and links it (publisher, Open Library or Google Books page), plus the article where you read it if that's how you found it. Joe (2026-11-24): "We need citations or links to books for all quotes."
- **Verify every link resolves** before the post ships, and follow redirects to the final URL.
- **If a claim can't be verified, cut or soften it**, never guess a number, date or source. A removed claim beats a fabricated citation.
- **Explain the why with research.** A causal claim ("animation keeps its script because...", "action films rewrite because...") needs a named source: a filmmaker or practitioner interview, data study, paper or book, with the quote confirmed on the page. Joe (2026-11-24): "FIND RESEARCH. Back up points and explain what everything means and WHY it is that way with research. BACK UP OUR CLAIMS." Where nothing explains it, say so in the post, or mark it plainly as Joe's guess.
- **Date-sensitive claims carry their date**: "as of <month year>" on prices, versions and "currently running" lists.

## Personal site only

- Sources the post quotes, argues with or leans on get a `cite:` link title, and a short exact quote can lead the margin note with `| quote:` (`/blog-new`, **Margins**). Product, docs and repo links stay plain links (DECISIONS.md, 2026-11-15).
