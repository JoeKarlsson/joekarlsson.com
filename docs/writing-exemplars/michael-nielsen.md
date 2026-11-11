# Michael Nielsen: research writing exemplars

Michael Nielsen ([michaelnotebook.com](https://michaelnotebook.com/)) wrote _Neural Networks and Deep Learning_ and co-wrote the standard quantum computing textbook. I read his research essays as models of research-based tech writing. The rules I took from them are in `STYLE_GUIDE.md` under **Writing research posts**. This file shows how each essay is built, with short excerpts, so a draft can borrow the structure instead of the sentences.

Read for structure, not voice. He writes "we", hedges more than I do, uses en dashes and "Indeed", and runs 10,000+ words. The STYLE_GUIDE list "What I don't copy from him" still applies.

Audited November 2026. His older blog at michaelnielsen.org was offline then, so three good technical posts were left out: "How the Bitcoin protocol actually works", "Why Bloom filters work the way they do" and "How to crawl a quarter billion webpages in 40 hours". Read them through the Wayback Machine.

## 1. Augmenting Long-term Memory (2018)

[augmentingcognition.com/ltm.html](http://augmentingcognition.com/ltm.html), about 17,000 words. A personal practice turned into research: he used Anki for years, then wrote down what worked.

**How it's built:**

1. A documented scene: Luria testing the reporter Shereshevsky's memory in 1920s Moscow, with a quote from Luria's 1968 book.
2. The lineage: Vannevar Bush's memex, Engelbart, Ted Nelson, Berners-Lee's proposal for the web, a few sentences with citations.
3. The claim: "Anki makes memory a choice, rather than a haphazard event, to be left to chance."
4. What kind of essay it is ("a distillation of informal, ad hoc observations and rules of thumb") and what it won't cover.
5. Part I, his own use, from simple to advanced: how Anki works, the arithmetic, a case study reading the AlphaGo paper, shallow reads, reading across many papers, then a long list of patterns.
6. Part II, the wider question: does memory matter, what the research literature says, and where cognitive science stops being useful to a system designer.
7. Appendices: the full study-time model, and using Anki to learn APIs.

**Moves worth stealing:**

The arithmetic happens in the open, and it ends on a rule anyone can use:

> On average, it takes me about 8 seconds to review a card. Suppose I was using conventional flashcards, and reviewing them (say) once a week. If I wanted to remember something for the next 20 years, I'd need 20 years times 52 weeks per year times 8 seconds per card. That works out to a total review time of just over 2 hours for each card.

The full model goes in Appendix 1, which opens by saying how far to trust it: "the analysis is sensitive to the detailed assumptions made, so the time estimates shouldn't be taken too seriously."

A specific failure comes before the general rule. His card "How to create a soft link from linkname to filename?" kept failing, so he split it in two, and "Breaking this question into more atomic pieces turned a question I routinely got wrong into two questions I routinely got right." Then he keeps the result apart from the explanation:

> I'm not sure what's responsible for this effect. I suspect it's partly about focus.

An opinion with the cost named, parked in a sidenote so the main argument doesn't stall:

> As an outsider, I'm aware this comment won't make me any friends within the HCI community. On the other hand, I don't think it does any good to be silent, either.

**What I'd cut:** the four-paragraph intro that previews Part I and Part II in order. The claim arrives about 800 words in. For a reader coming from HN on a phone, it belongs on the first screen.

## 2. Reduced MNIST: how well can machines learn from small data? (2017)

[cognitivemedium.com/rmnist](https://cognitivemedium.com/rmnist), about 2,000 words. The closest match to my benchmark and homelab posts: a small experiment with code, a table and an honest miss.

**How it's built:**

1. A status line: "Exploratory working notes... not as a survey of prior literature, with which I am only very incompletely familiar."
2. What MNIST is, and why small data is interesting: "human beings don't need to see 60,000 examples to learn to recognize handwritten digits."
3. Why he did it, including the selfish reason (an excuse to try scikit-learn and PyTorch), and a link to the code.
4. Notation defined once: RMNIST/1, RMNIST/5, RMNIST/10.
5. **Baselines**: six classifiers in a table, with a warning that he barely tuned them.
6. The goal as numbers, before any results: "above 95% for RMNIST/1, and above 99.5% for RMNIST/10."
7. One section per technique, each with its results as a short list: **Convolutional network with dropout**, **Algorithmically expand the training data**, **Transfer learning**.
8. **Concluding thoughts**: the best numbers against the goal (92% on RMNIST/10, short of 99.5%), then open questions.

**Moves worth stealing:**

The headers are plain labels, and reading only them gives you the experiment. He says the gap he can't fill instead of guessing at it:

> Unfortunately, I don't know how well human beings do when trained using just very small number of example digits. As far as I know, the experiment has never been done.

It ends on a specific next question, not a summary: could you choose or build "super-trainers", small training sets that beat a random sample? "It'd be fascinating to see what such super-trainers look like, assuming they exist."

**What I'd cut:** "Spoiler: We won't get there. But we'll make some progress." That's a staged reveal. The results section already says it.

## 3. ASI existential risk: reconsidering alignment as a goal (2025)

[michaelnotebook.com/xriskbrief](https://michaelnotebook.com/xriskbrief/index.html), about 11,000 words with footnotes. An argument essay on a topic where smart people disagree.

**How it's built:**

1. A summary paragraph: the claim plus its two "underappreciated consequences", each numbered.
2. The disagreement, shown with named quotes: three prominent people worried about the risk, three dismissive, each in their own words and footnoted.
3. The cheap explanation (everyone is talking their book), thrown out with evidence, then his own: "sincerely held differences in underlying assumptions."
4. Assumptions and scope: assume superhuman AI exists, and this "isn't about the systems in widespread use today."
5. One concrete scenario (a bioweapon request), improved by objection and answer. Each objection is in the skeptic's own words.
6. The general case, then the alternative case.
7. **Conclusion**: no winner declared. It explains the disagreement as "differing thresholds for conviction," gives a historical parallel (early climate scientists split because they "believed different toy models"), and says plainly where he lands.
8. A dated postscript that critiques his own essay after a friend asked for the strongest counterarguments.

**Moves worth stealing:**

The scenario is announced as a tool, not as proof, which keeps a reader from grading it on the wrong test:

> The scenario is not intended to convince anyone to be concerned about existential risk. Rather, it's a vehicle to help understand and illustrate patterns of argument and counter-argument common in discussions of ASI xrisk.

He criticizes both camps in the conclusion, which earns the side he takes. Of the skeptics: they "only engage defensively, looking for minor holes that can justify dismissal, rather than trying to understand the best form of the argument."

**What I'd cut:** the apology for citations left out ("My apologies to those whose work is unfairly omitted").

## 4. Using spaced repetition systems to see through a piece of mathematics (2019)

[cognitivemedium.com/srs-mathematics](https://cognitivemedium.com/srs-mathematics), about 6,400 words.

**How it's built:** an opening question ("What does it mean to understand a piece of mathematics?"), the naive answer, then why it's wrong. Next comes the story that changed his mind: a Kolmogorov essay about the equals sign, which showed him "I could understand the equals sign much more deeply." The story turns into three numbered points, and then into the method.

**Moves worth stealing:** the turn from naive view to reality is two short paragraphs ("Naively, we perhaps think... In reality, mathematical understanding is much more nuanced"). He admits he might be misremembering his own source: he has never found the essay again and has "sometimes wondered if I imagined the essay."

**What I'd cut:** no section headers across 6,400 words. On this site that's a wall.

## 5. Discovery fiction (2023)

[michaelnotebook.com/df](https://michaelnotebook.com/df/index.html), about 2,500 words. The technique behind his Bitcoin and Bloom filter explainers, in his words: "a plausible story of how I could have discovered that result – an arc of small questions and ideas, false starts and backtracking, incremental steps eventually leading to the result."

For Bitcoin, he started with "an obviously flawed back-of-the-napkin idea," pointed out the obvious problem, made the obvious fix, and repeated "until eventually we 'discover' Bitcoin!" Each piece of the protocol shows up only when a problem needs it. He says he writes these for himself first, to check he could have reinvented the thing.

## 6. Scattered notes on writing I (2019)

[cognitivemedium.com/scattered-notes-writing-1](https://cognitivemedium.com/scattered-notes-writing-1), short. His close read of Carl Sagan's _Cosmos_. The useful idea is altitude:

> Throughout the book, Sagan is not dealing in small stakes. He does, of course, venture into minutiae on occasion; too long at too high an altitude detaches both the author and readers from a sense of what is real. But when he ventures into minutiae he always takes care to relate back to the big picture.

He also checks Sagan sentence by sentence: in the passage he quotes, "every single sentence offers an idea which, if unfamiliar, is extraordinary." That's a useful edit pass for a research post: read each sentence and ask whether it carries a new idea or only restates the last one.

## 7. How to be a wise optimist about science and technology? (2024)

[michaelnotebook.com/optimism](https://michaelnotebook.com/optimism/index.html), about 34,000 words. Too long to model, but the preface is a good opening. The first sentence is the thesis ("I believe the central problem of the 21st century is how civilization co-evolves with science and technology"). The second paragraph is the personal stake ("This essay emerged from a personal crisis"), with specifics: he considered changing careers and taking his neural networks book offline. Then he says what kind of essay it is and admits the length is a cost: "an ideal public-facing version would be much shorter and more focused."

## What my guide already had, and what's new

Already covered in STYLE_GUIDE.md, now with a second model: thesis first, plain-label headers, named frames, numbers with their source, saying whether a number is measured or estimated, linking primary sources, ending on what's still missing.

New from Nielsen, now in **Writing research posts**:

1. A status line saying what kind of post this is
2. A stated goal or prediction before results
3. Keeping the observation apart from the explanation ("I suspect")
4. Arithmetic in the open, ending on a usable rule
5. Discovery fiction for explaining how a system works
6. Named quotes from both sides before taking one
7. Crediting a source and saying where my numbers differ from it
8. One-line disclosure
9. Footnotes for side paths, an appendix for the full model
10. A dated update for answering critics

Where he breaks my rules: "we" voice, staged reveals ("The punchline is", "Spoiler:"), stacked hedges, long preview intros, long paragraphs, banned transitions and en dashes. My rules win on all of them.
