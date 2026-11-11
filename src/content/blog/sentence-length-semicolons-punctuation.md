---
title: 'Are English sentences getting shorter? About 40% of the drop is punctuation'
seoTitle: 'Are English sentences getting shorter?'
date: 2026-11-10T16:17:13Z
slug: 'sentence-length-semicolons-punctuation'
description: "Are English sentences getting shorter? In 1,959 Project Gutenberg books, about 40% of the drop in sentence length is periods doing the semicolon's job."
categories: ['Web Dev']
tags:
  ['punc', 'digital-humanities', 'data-analysis', 'punctuation', 'project-gutenberg', 'stylometry']
tldr: "I stripped the words from 1,959 Project Gutenberg books and tested the 130-year-old claim that English sentences got shorter. Words between periods fell from 30 (1700-49) to 15 (1900-49). About 40% of that drop is periods taking over the job semicolons and colons used to do, and the rest survives every check I ran, even in narration with the dialogue taken out. Semicolons fell from 10 to 2 per 1,000 words, and a writer's birth year explains that about as well as the publication date does. Punctuation alone names the author 34% of the time where chance is under 1%, and Dickens gets 0 of 20. You can drop your own .txt on Punc's read page and check any of it."
faq:
  - question: 'Are English sentences getting shorter?'
    answer: 'Yes, but by less than the famous numbers say. In 1,959 Project Gutenberg books, the median sentence fell from 30 words (1700-49) to 15 (1900-49) counting only periods, question marks and exclamation marks. Counting semicolons and colons as sentence ends too, it fell from 22 to 13, so about 40% of the drop is a change in punctuation and the rest is real shortening.'
  - question: 'Why did sentences get shorter?'
    answer: "Partly punctuation, and partly real shortening. Writers in the 1700s joined clauses with semicolons and colons where later writers used a period, so the same words count as more sentences. That explains about 40% of the drop in Punc's 1,959 books. The rest held up in narration with all dialogue removed, so it isn't only more dialogue either."
  - question: 'Is the semicolon dying out?'
    answer: "Yes, in books, for two centuries now. In Punc, the median book went from 10.1 semicolons per 1,000 words in 1775-99 to 1.8 in 1950-74, with the steepest fall after 1825. Babbel's 2025 Google Ngram analysis found the same direction for British books through 2022."
  - question: 'Is the drop in sentence length just more dialogue?'
    answer: "No. Dialogue rose from 5% to 28% of the words in Punc's books between 1775-99 and 1950-74, but with every quoted passage removed, the median narration still fell from 21.9 words between stops (1700-49) to 14.5 (1900-49)."
  - question: 'Can you identify an author from punctuation alone?'
    answer: 'Sometimes. Using only the share of ten marks in each book, a leave-one-out nearest-match test named the right author for 241 of 708 books by 132 authors, 34%, where guessing gets under 1%. Darmon and colleagues reached 62-72% in 2021 with richer punctuation features.'
  - question: 'How do I analyze the punctuation in my own book?'
    answer: 'Open the read page on punc.joekarlsson.com and drop in a .txt file. It runs in your browser, nothing is uploaded, and it shows the punctuation in reading order along with counts per 1,000 words and words per sentence. Punc is also an open-source TypeScript library and command line tool.'
heroImage: '/images/blog/sentence-length-semicolons-punctuation/thumb-0fe6b69b.webp'
heroAlt: "A compositor's hand holding a composing stick with a line of metal type set in it, loose pieces of type scattered on the table below (Groningen, 1965)"
---

In his 1894 history of the English paragraph, Edwin Lewis wrote that "the English sentence has decreased in average length at least one-half in three hundred years." People have been repeating some version of it ever since: English sentences are getting shorter.

Linguists have had a boring, sensible objection for decades. Maybe sentences didn't shrink so much as get cut up. A writer in 1750 joined clauses with semicolons and colons where a writer in 1950 would put a period. Same words, more sentences. Jeanne Fahnestock suggested the trend might be "a by-product of changing punctuation conventions" [[Fahnestock 2011, in Rudnicka 2018]](https://arxiv.org/abs/2502.04321), and Henry Oliver raised the same suspicion in November 2025 [[Oliver 2025]](https://worksinprogress.co/issue/the-logical-triumph-of-english/). I couldn't find anyone who had measured how much of the drop it explains across the 1700s and 1800s, when semicolons were everywhere.

I had a tool that could. [Punc](/work/punc/), my art project that strips the words out of a book and keeps only the punctuation, now holds 1,959 Project Gutenberg books (mostly out of copyright, so the trend runs to the 1970s), and every one of them has a semicolon count. So I counted semicolons and colons as sentence ends and checked how much of the decline in sentence length survives. Both sides are partly right. Sentences did get shorter, but by closer to a third than to Lewis's half once semicolons and colons count, and about 40% of the famous drop is punctuation.

You can see it before you count anything. Here are 1,000 words from the middle of _Tom Jones_ (1749) and 1,000 from the middle of _A Farewell to Arms_ (1929), with only the punctuation left. They're two famous extremes, not averages:

![The punctuation from 1,000 words in the middle of two novels, side by side on black, with semicolons and colons in pink. Tom Jones (1749) has 24 semicolons and colons and 41 sentence ends, its pink marks scattered all through the block. A Farewell to Arms (1929) has 1 semicolon and 166 sentence ends, a long block of periods and quotation marks with a single pink mark.](/images/blog/sentence-length-semicolons-punctuation/side-by-side.webp)

## Try Punc

<p class="embed-large:hidden">Punc's shelf is built for a bigger screen, so on a phone, <a href="https://punc.joekarlsson.com/">open it in a new tab</a>.</p>

<div class="@container hidden overflow-hidden rounded-lg embed-large:block">
  <iframe data-desktop-src="https://punc.joekarlsson.com/" title="Punc: a shelf of 1,959 Project Gutenberg books shown as their punctuation only, with a page to read your own text file" data-embed-project="Punc" class="block w-full" style="border:0;height:640px" allow="fullscreen" sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-downloads" loading="lazy"></iframe>
</div>

Pick any book off the shelf, or open the read page and drop in a .txt file of your own. It runs in your browser and nothing gets uploaded. The numbers below come from the same counting code, plus the Python checks described under How I counted.

## Prior work

People have counted this by hand for a long time. In 1893 Lucius Sherman tallied words per sentence in English prose and got 41.4 for Richard Hooker (1590s) against 22.5 for Thomas Macaulay's _Essay on History_ (1828) [[Sherman 1893, p. 259]](https://archive.org/details/analyticsofliter00sheruoft). Lewis did the same and got roughly the same answer. The current headline version is Babbel's 2025 press release, built on Google Ngram data, which says British books went from one semicolon every 90 words in 1781 to one every 390 in 2022 [[Babbel 2025]](https://www.babbel.com/press/en-gb/releases/semicolon).

![A page from Lucius Sherman's 1893 Analytics of Literature: a table of words per sentence in each of five hundred-sentence stretches, averaging 63.02 for Fabyan, 49.82 for Spenser, 41.40 for Hooker and 22.45 for Macaulay](/images/blog/sentence-length-semicolons-punctuation/sherman-1893-table.webp)

_Lucius Sherman's hand count of words per sentence, Analytics of Literature, 1893, p. 259 ([Internet Archive](https://archive.org/details/analyticsofliter00sheruoft/page/259/mode/1up))._

The punctuation objection has been around nearly as long. Douglas Biber and Susan Conrad point to "a much more extensive use of colons and semicolons in earlier historical periods" [[Biber and Conrad 2009, in Rudnicka 2018]](https://arxiv.org/abs/2502.04321). Karolina Rudnicka's 2018 chapter reviews both sides with data from the Corpus of Historical American English, and it's where I'd start if you want the literature.

One detail in Rudnicka's review set up the test for me. Ingrid Westin, who studied 20th-century newspaper editorials, reported that counting sentences two ways, once ending them only at periods and once at semicolons and colons too, gave almost the same pattern over time (Westin 2002, as summarized by Rudnicka). That's what you'd expect if punctuation mattered once and then stopped mattering: by 1900 hardly anyone was using enough semicolons to change the count. So if sentences glued together with semicolons explain some of the decline, the two ways of counting should sit far apart before 1800 and meet once the semicolon dies out.

I'll use two measures for the rest of the post:

- **Words between periods:** words divided by sentence ends (`.`, `?`, `!`). This is what everyone measures.
- **Words between stops:** the same, but semicolons and colons count as ends too.[^tunit]

## About 40% of the sentence length drop is punctuation

That's what the data shows, across the 954 books with a first-publication date between 1600 and 1974 (the other dated books are older or newer, and about 45% of the shelf has no date I could pin down). Words between periods rise to 30.3 in 1700-49 (just 18 books) and fall to 14.5 by 1900-49 (445 books). Words between stops fall from 21.6 to 13.3 over the same span. Taken at face value, 47% of the drop disappears once semicolons and colons count. By 1950-74 the two lines meet at 12.5 and 12.4, because modern books barely use either mark, which matches Westin's result.

I measure from 1700-49, the peak, not from Lewis's Elizabethans. Nine of the shelf's 21 books from 1600-49 are plays, which run about 8 words a sentence and drag that period's median down. The 11 prose books from those years have a median of 42 words, close to Sherman's 41 for Hooker, but 11 books is too few to measure from.

![Line chart of median sentence length in 954 dated Project Gutenberg books, by 50-year period from 1600 to 1974. Counting only periods, question marks and exclamation marks as sentence ends, sentences peak at 30.3 words in 1700-49 and fall to 14.5 in 1900-49 and 12.5 in 1950-74. Counting semicolons and colons as stops too, the second line runs from 21.6 in 1700-49 to 13.3 in 1900-49, and the two lines meet at 12.4 in 1950-74. The gap between them, the glued sentences, is widest before 1800.](/images/blog/sentence-length-semicolons-punctuation/chart-sentence-length.svg)

Here's what one of those glued sentences looks like, punctuated the way the first edition of Adam Smith's _The Wealth of Nations_ printed it in 1776 [[Smith 1776, vol. 2]](https://archive.org/details/inquiryintonatur02smit_0). Most writers today would make it three. Checking this example against the first edition is also how I found that Gutenberg's copy of the same book adds semicolons Smith never printed (more under Limitations).

![Paper collage on hot pink: a printed strip of Adam Smith's 1776 sentence "A shepherd has a great deal of leisure; a husbandman, in the rude state of husbandry, has some; an artificer or manufacturer has none at all" is cut by a pair of old iron shears at each semicolon. Each semicolon's top dot and tail fall away, leaving a period, and pasted-in words "A" and "An" start the new sentences. The label reads: Same words. Three sentences.](/images/blog/sentence-length-semicolons-punctuation/scissors-cut.svg)

![A scan of the 1776 first edition of The Wealth of Nations, in its original long-s type: "A shepherd has a great deal of leisure; a husbandman, in the rude state of husbandry, has some; an artificer or manufacturer has none at all."](/images/blog/sentence-length-semicolons-punctuation/smith-1776-shepherd.webp)

_The same sentence in the first edition of The Wealth of Nations, London, 1776, vol. 2 ([Internet Archive](https://archive.org/details/inquiryintonatur02smit_0))._

That 47% assumes every semicolon and colon joins two clauses that could each stand alone as a sentence, and they don't. Plenty of semicolons separate items in a long list, and plenty of colons just introduce a quotation.

So I pulled 100 random semicolons and colons out of 1700s English prose and had each one coded, checking whether the words after the mark could stand as their own sentence. Claude did that first pass while I wrote the analysis. For the semicolons, 43 of 60 did (72%). For the colons, 23 of 40 did (58%). The rest were things like a run of "that" clauses in a list, a colon setting up a quotation, or a chapter heading. If each mark counts only as often as it actually glues two sentences together, the 47% drops to 38%.

A second, separate Claude agent that saw only the passages and the rule coded the same 100 and agreed on 95 (Cohen's kappa 0.89). That's one model family agreeing with itself, not two linguists, so treat the 38% as a careful estimate. It also coded 100 marks from 1900-49 books, to check whether the marks changed jobs. The semicolons mostly hadn't (62% still glue two clauses), but the colons had: only 18% did, because by then a colon mostly introduced a list or a quotation. Using each era's own rates still gives 38%.

![One hundred paper slips, one for each semicolon and colon pulled at random from 1700s English prose and coded twice, by two separate Claude agents that agreed on 95 of 100. Each turns over to pink if the mark glues two clauses that could each stand as a sentence, or dark if it separates a list, introduces a quotation, or sits in a heading or footnote. 43 of 60 semicolons glue two clauses (72%), and 23 of 40 colons do (58%).](/images/blog/sentence-length-semicolons-punctuation/chart-hand-coded.svg)

Other ways of counting move the number around. A stricter sentence splitter that skips "Mr.", initials, ellipses and dialogue tags like `"Help!" he cried` gives 52%. Counting dashes as stops gives 43%. Semicolons alone give 42%. Taking out plays and poetry, dropping translated books, or measuring from 1750 instead of 1700 all land between 48% and 58%. The 58% rests on just 13 English-original books from 1700-49 and drops to 49% measured from 1750. Every version falls between 38% and 58%, and only the two weighted ones account for the marks that don't glue anything. Weighting takes about 10 points off any of the others, which is why I treat 40% as the floor of the range and not the middle.

![Dot and interval chart: the share of the 1700-49 to 1900-49 drop in sentence length that disappears when semicolons and colons count as sentence ends, measured eleven ways with 95% bootstrap intervals. Weighted by the hand-coded glue rate: 38% (28 to 48). Weighted with a strict sentence splitter: 42%. Semicolons only: 42%. Dashes counted too: 43%. Base count: 47% (38 to 60). Plays and poetry removed: 48%. English originals: 48%. Measured from 1750-99: 49%. Strict sentence splitter: 52%. Narration only: 54%. English originals by both checks: 58% (50 to 61). Every estimate lands between 38% and 58%; a line marks about 40%.](/images/blog/sentence-length-semicolons-punctuation/chart-every-count.svg)

I'm calling it about 40%. The bottom of that range is the number I can defend against someone who knows what a semicolon does, and none of the point estimates drops below a third.

## Dialogue explains little of the rest

The obvious suspect for the other 60% is dialogue. Speech is short, and the share of words inside quotation marks in Punc's books goes from 5% in 1775-99 to 28% in 1950-74. Question marks climb too, from 1.9 to 5.3 per 1,000 words. Muzny, Algee-Hewitt and Jurafsky found a rise in the same direction in 1,100 novels, about one more quotation per 1,000 words every 25 years [[Muzny et al. 2017]](https://academic.oup.com/dsh/article/32/suppl_2/ii31/3865424).

It's mostly not dialogue, though. I cut every quoted passage out of every book and measured only the narration. Words between stops in narration still fall from 21.9 (1700-49) to 14.5 (1900-49), a 7.4-word fall against 8.3 for the full text, so dialogue accounts for roughly a tenth of it. If anything that understates the narration's fall: plenty of 1700s novels don't put speech in quotation marks, so some short spoken lines are still in the early narration counts.

![Line chart of median words between stops (periods, question marks, exclamation marks, semicolons and colons), by 50-year period from 1700-49 to 1950-74. Narration alone, with every quoted word removed, falls from 21.9 words in 1700-49 to 14.5 in 1900-49 and 13.0 in 1950-74. All the text falls from 21.6 to 13.3 and 12.4. The two lines fall together, so sentences got shorter outside dialogue too. The 1700-49 period has only 18 books.](/images/blog/sentence-length-semicolons-punctuation/chart-narration.svg)

## Semicolons fell from 10 to 2 per 1,000 words

Counting only 25-year periods with at least 20 books (the same rule Punc's Numbers page now uses), the median book has 10.1 semicolons per 1,000 words in 1775-99, 12.6 in 1800-24, 8.6 in 1850-74, 4.6 in 1900-24 and 1.8 in 1950-74. The steepest fall comes after 1825. That matches Rudnicka's finding in American English: "a dramatic decrease in the frequency of use of semicolons happening between 1810 and 1900." Commas fell too, from 86 to 63 per 1,000 words, but not nearly as far.

![Two dot charts on one time axis, by 25-year period from 1600 to 1974, medians per 1,000 words. Semicolons fall from 10.1 in 1775-99 to 4.6 in 1900-24 and 1.8 in 1950-74, with the steepest fall after 1825. Commas, above for scale, fall less: from 85.9 to 63.1 over the same periods. Periods before 1775 have fewer than 20 books each and are drawn hollow.](/images/blog/sentence-length-semicolons-punctuation/chart-semicolons.svg)

Babbel's 1781 peak of one semicolon every 90 words works out to 11 per 1,000. Punc's median for 1775-99 is 10.1, from a different set of books. I wouldn't lean on that too hard, because Google's scans of pre-1800 books trip over the long s, but it's a nice check.

One result doesn't line up. Darmon, Bazzi, Howison and Porter found semicolons fell "less noticeably" in their 14,947 Gutenberg documents [[Darmon et al. 2021]](https://arxiv.org/abs/1901.00519). It isn't a matter of units: measured as a share of all marks instead of per 1,000 words, Punc's median still falls from 6% of marks in 1775-99 to under 1% in 1950-74. They also dated each book by the middle of its author's life, since Gutenberg doesn't record publication dates, and worked with a different slice of the library. I can't tell you which of those explains the gap.

## Careers and generations

If writers dropped the semicolon, you'd expect to see it in their careers. Seventeen authors on the shelf have five or more dated books spanning 20 or more years. Eight of them use fewer semicolons over time and nine use more, and the median slope is about zero. Dickens drops from about 12 semicolons per 1,000 words to 6, and Henry James from 12 to 7. Jane Austen, Mark Twain and G. K. Chesterton rise, though Austen's first dated book is juvenilia.

Seventeen authors is a hint, not a result, so I tried something with more data. Gutenberg's [catalog](https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv) lists author birth years, which let me put birth year and publication year in the same model for 748 English-original books from 1750 to 1974. Each takes about half of the semicolon's fall: -3.1 per 1,000 words per century for publication year and -3.7 for birth year. Resampling authors rather than books, neither interval crosses zero (publication year only just), but the two overlap almost completely, and birth year and publication year move together, so this can't separate them.

![Seventeen authors with five or more dated books spanning 20 or more years, each drawn as a line from the fitted semicolon rate of their first book to their last, over the median book of the whole shelf by 25-year period. Eight fall and nine rise. Dickens falls from 11.8 to 5.6 semicolons per 1,000 words (1836-1870), Henry James from 12.4 to 6.8; Jane Austen rises from 6.0 to 15.5 and Mark Twain from 8.6 to 13.6. In a model of 748 English-original books from 1750 to 1974 with both, publication year accounts for -3.1 semicolons per 1,000 words per century (95% interval -5.9 to -0.5) and author birth year for -3.7 (-6.2 to -1.1).](/images/blog/sentence-length-semicolons-punctuation/chart-careers.svg)

So I can't rule out either one, and both probably contributed. Writers born later used fewer semicolons, which fits Underwood and colleagues' finding, in 10,830 works of fiction from 1880 to 1999, that 54.7% of the change explained by time is explained better by an author's birth year than by the book's publication year [[Underwood et al. 2022]](https://sociologicalscience.com/articles-v9-8-184/). And books published later used fewer, even from the same generation. Since individual careers barely move, my guess is that the "later" half belongs to publishers and later editors more than to authors changing their minds. I can't prove that from punctuation counts.

## Punctuation as a fingerprint

Part of the semicolon's fall tracks when a writer was born, which suggests punctuation is partly personal habit. So how personal is it? Punc gives every book a fingerprint of ten numbers: the share of its marks that are commas, periods, double quotes, apostrophes, semicolons, colons, dashes, question marks, exclamation marks and parentheses. Then it plays a guessing game. Take one book away, average each author's other books, and guess whichever author's average is closest.

For the 132 authors with at least three works on the shelf, it names the right author for 241 of 708 books, 34%. Guessing at random gets 1 in 132, under 1%. I shuffled the author labels 20 times and reran the test, and the shuffled runs averaged 0.8%. None beat 2%.

![Punctuation alone names the author of 241 of 708 books (34%), across 132 authors with three or more works: the books drop as dots into a pink pile named right and a larger chalk pile named wrong. Underneath, on a percent scale: with author labels shuffled, the same test gets 0.8% (chance is 1 in 132); with labels shuffled only among books of the same genre, 4.2%. English originals alone get 35%.](/images/blog/sentence-length-semicolons-punctuation/chart-authorship.svg)

Genre could be doing the work. Plays punctuate like plays and mysteries punctuate like mysteries, so maybe the test was just recognizing genre. To check, I shuffled the author labels only among books with the same genre tags. That version scores 4.2%, against 0.8% for a full shuffle and 34% with the real labels. With translations removed, 104 authors still score 35%. So genre explains a little of it.

Translators are a real caveat, though. Plato goes 12 of 18, and every one of those books is somebody's translation, so that's a translator's fingerprint as much as Plato's.

For comparison, Darmon and colleagues reached 62-72% across 651 authors using the order of the marks and the spacing between them as well as their shares. Their setup differs (at least ten documents per author and an 80/20 train-and-test split, against my three works and leave one out), so the numbers aren't directly comparable. Punc's version only counts how often each mark shows up.

Dickens goes 0 for 20. His books get taken for Robert E. Howard, the pulp writer who created Conan the Barbarian, seven times, plus Dumas three times and Dostoyevsky twice. _The Pickwick Papers_, _Nicholas Nickleby_, _The Old Curiosity Shop_ and _David Copperfield_ all go to Howard. My guess is range: Dickens wrote in so many registers that his average fits none of his books well, but I haven't tested that. Oscar Wilde, who wrote plays, essays, a novel and fairy tales, is 0 of 14.

![Charles Dickens in his fifties, bearded, in a dark coat, photographed in profile](/images/blog/sentence-length-semicolons-punctuation/dickens-gurney.webp)

_Charles Dickens, photographed by Jeremiah Gurney around 1867 ([Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dickens_Gurney_head.jpg))._

![Charles Dickens is 0 of 20: going by punctuation alone, none of his 20 books is matched to him. Each book flies from his shelf to the author it was taken for: Robert E. Howard 7, Alexandre Dumas 3, Fyodor Dostoyevsky 2, and one each to Jules Verne, Robert Louis Stevenson, Homer, Edgar Allan Poe, Jacob Grimm, Leo Tolstoy, John Milton and Bertrand Russell.](/images/blog/sentence-length-semicolons-punctuation/chart-dickens.svg)

No single mark carries the signature. Leave any one mark out of the fingerprint and accuracy drops by about 3 points at most. The period matters most (30.9% without it), and double quotes matter least.

![Bar chart: how often punctuation alone names the author when one of the ten tracked marks is left out of the fingerprint, against 34% with all ten. Without the period: 30.9%. Without the comma or the colon: 31.4%. Without the apostrophe or question mark: 32.1%. Without the semicolon, dash or parentheses: 32.3%. Without the exclamation mark: 32.6%. Without the double quote: 33.8%. No single mark carries the signature.](/images/blog/sentence-length-semicolons-punctuation/chart-leave-one-mark.svg)

Genres do have fingerprints of their own. Mystery and crime has the most dialogue on the shelf (42% of its words are in quotes), the most question marks of any prose genre and the fewest semicolons. Plays are the loudest, with 9.3 exclamation marks per 1,000 words and 8.5 words a sentence. History and philosophy are the quietest, at under one exclamation mark per 1,000 words.

## Why I built Punc

A lot of what steers you through a book isn't the words. A comma tells you to take a breath, a period tells you to stop, and an exclamation point tells you someone is yelling. You follow every one of those instructions while you read, and you almost never notice them. Punc takes the words away and leaves the instructions, so you can see a book's rhythm on its own. Alice's Adventures in Wonderland comes out loud and nervous, full of exclamation points and questions, which is how the book feels to read.

![Paper collage on black: a printed page from Alice's Adventures in Wonderland, beginning "Well!" thought Alice to herself, lands on the field. Its punctuation turns pink, then the words tear away in clumps and fly off, the blank paper drops out, and only the pink quotation marks, commas, exclamation marks and parentheses are left floating where they were. The label reads: Only the instructions.](/images/blog/sentence-length-semicolons-punctuation/words-leave.svg)

It's an erasure, like the blackout poems I make on paper, except a blackout poem keeps a few words and Punc keeps none. It's a sibling of [linger](/work/linger/), my other erasure piece. I started it in 2016 after reading Adam J. Calhoun's essay [Punctuation in novels](https://medium.com/@neuroecology/punctuation-in-novels-8f316d542ec4), which was itself inspired by Nicholas Rougeux's posters [Between the Words](https://www.c82.net/work/between-the-words). Ray Farias wrote most of the original code. In 2026 I came back to it and filled the shelf with Gutenberg's most-downloaded books.

I built it to make pictures. Once the shelf held 1,959 books, though, the pictures turned into a dataset, and the dataset could test a claim people have been making since the 1890s.

Counting style is old. Lewis and Sherman counted sentences by hand. Frederick Mosteller and David Wallace used the rates of words like "upon" to argue that Madison wrote the disputed Federalist Papers [Mosteller and Wallace 1964]. John Burrows' Delta made comparing writers by their most common words a standard method [[Burrows 2002]](https://doi.org/10.1093/llc/17.3.267). The Stanford Literary Lab, Ted Underwood and many others took it to whole libraries. The Literary Lab's [pamphlet on style at the scale of the sentence](https://litlab.stanford.edu/LiteraryLabPamphlet5.pdf) opens with its authors disagreeing about whether their own measure captures style at all. In 2015 my sister and I built a [screenplay parser for the Bechdel test](/blog/bechdel-test-script-parser-works/) in the same spirit.

![Page 217 of a 1788 edition of The Federalist in long-s type, from the copy Thomas Jefferson owned: a passage arguing that taxes on land unite the interests of the wealthiest landlord and the poorest tenant, with semicolons all through it](/images/blog/sentence-length-semicolons-punctuation/jefferson-federalist.webp)

_A page from Thomas Jefferson's copy of The Federalist, 1788, Library of Congress ([Wikimedia Commons](<https://commons.wikimedia.org/wiki/File:Page_217_from_Thomas_Jefferson%27s_copy_of_The_Federalist_(1788)_LCCN2004665672.jpg>))._

I think art and data analysis together are good ground for this kind of research. Making a picture of a text makes you look at it in a way nobody planned, and that's where you find evidence you weren't looking for, which is the fun part. I wrote more about making art with code in [Rereading Hackers and Painters as a painter who codes with AI agents](/blog/hackers-and-painters-ai-agents/).

## How I counted

**Corpus.** Gutenberg's 2,000 most-downloaded English books as of November 2026, minus dictionaries, encyclopedias, repeat editions and the few without a plain text, plus a few favorites: 1,959 books, about 2.5% of [Gutenberg's](https://www.gutenberg.org/) roughly 80,000. Gutenberg's license header and footer are cut at the `*** START` and `*** END` lines.

**Dates.** First publication, taken from [Wikidata's](https://www.wikidata.org/) date for the work, with a hand-checked override list in Punc's fetch script. Translations take the original's year, which is why I flag translations and rerun without them. The 114 books from before 1600 are left out of everything over time.

**Counting.** Curly quotes and long dashes fold into their plain versions. Rates are per 1,000 words. Punc ends a sentence at any run of `.`, `?` or `!`, and the stricter splitter is there as a check on that. Dialogue is the share of words inside double quotes.

**Statistics.** Medians of per-book values, so one enormous book can't swing a period. Bootstrap intervals come from resampling books within each period, and for the generations model, from resampling authors, since one writer's books aren't independent. The generations test is a least-squares fit of semicolons per 1,000 words on publication year and author birth year, for authors aged 15 to 90 at publication. Attribution uses the Hellinger distance between the ten-mark fingerprints.

**Hand-coding.** 100 marks drawn at random (seed 42) from 49 English-original prose books dated 1700-1799, coded first by Claude and then, without seeing those codes, by a separate Claude agent (Claude Opus 5.5), which agreed on 95 of 100. A second set of 100 from 382 books dated 1900-1949 was coded by the agent alone. The prompt and both sets of codes are in the repo.

The table behind the main result:

| Period    | Books | Words between periods | Words between stops |
| --------- | ----: | --------------------: | ------------------: |
| 1600-1649 |    21 |                  20.9 |                13.9 |
| 1650-1699 |    13 |                  24.3 |                16.6 |
| 1700-1749 |    18 |                  30.3 |                21.6 |
| 1750-1799 |    48 |                  27.3 |                19.8 |
| 1800-1849 |    96 |                  21.4 |                16.4 |
| 1850-1899 |   288 |                  17.9 |                15.0 |
| 1900-1949 |   445 |                  14.5 |                13.3 |
| 1950-1974 |    25 |                  12.5 |                12.4 |

Punc's counting code is the same TypeScript the site runs, [on GitHub](https://github.com/JoeKarlsson/punc). The Python scripts behind the new analyses, the hand-coded sample and a ledger of every number in this post are in the repo's [`analysis/` folder](https://github.com/JoeKarlsson/punc/tree/1ac6cf4/analysis), pinned to the commit this post used. I wrote those scripts with Claude Code. Before adding anything new, they reproduce Punc's own numbers: the same period medians and the same 241 of 708 authors.

## Limitations

- **Editors.** Gutenberg texts are often later editions, and editors change punctuation in both directions. Gutenberg's _Wealth of Nations_ has "hurtful to the landlord; it is frequently hurtful to the tenant; and it is always hurtful to the community," where Smith's 1776 first edition has a period after "landlord" and a comma after "tenant." That semicolon after "tenant" turned up as item 5 of my 100 hand-coded marks, so the problem reaches the sample too. Editors add semicolons as well as remove them, and I can't say which way the editions push the totals.
- **Few early books, and almost no recent ones.** Before 1800 each 50-year period has 13 to 48 books, so the intervals are wide. At the other end, Gutenberg carries books that are public domain in the US, which mostly means books published before 1931 [[Duke CSPD 2026]](https://web.law.duke.edu/cspd/publicdomainday/2026/). Only 67 of the 1,073 dated books on the shelf came out after 1930, so the trend stops in the 1970s and says nothing about the last 50 years.
- **The hand-coding** was done by Claude, twice, not by a person: 100 marks from the 1700s coded by two separate agents, and 100 from 1900-49 coded by one. A linguist coding a few hundred more would tighten the 40%.
- **Only about half the shelf has a date.** 1,073 of 1,959 books have a first-publication year (954 of them fall in the 1600-1974 trend charts). The undated ones are out of every over-time number, and I haven't checked whether they differ from the dated ones.
- **Translations slip through.** I flag them from Gutenberg's catalog and from each book's title page, and some still get past both (_Candide_ does).
- **The shelf is today's taste.** These are the books people download now, not a sample of what was printed then. For what it's worth, popularity barely tracks punctuation. The strongest link between download rank and any measure is question marks, at a rank correlation of -0.19.
- **Dialogue means double quotes.** Books that use single quotes, and plays, undercount it.
- **It's all correlation.** Nothing here says why writers changed.

## Run it on your own books

Punc's [read page](https://punc.joekarlsson.com/read.html) takes any .txt file. Drop one in and it runs in your browser, nothing gets uploaded, and you get the same counts I used here. The [library and command line tool](https://github.com/JoeKarlsson/punc) make PDF, SVG and PNG versions of the pictures if you want to print them.

A few experiments I'd love to see someone run:

- Your own writing from ten years ago against your writing today. Did you lose your semicolons?
- Two translations of the same book. Does the translator's fingerprint beat the author's?
- A novel published this year against the 1950-74 line.
- Whether books start quiet. In my data, question and exclamation marks run about 3.5 per 1,000 words in a book's first tenth and 4.8 through the middle, even after cutting the front matter. I haven't checked it any harder than that.
- Anything that breaks one of the results above. [Open an issue on Punc's repo](https://github.com/JoeKarlsson/punc/issues) and tell me.

Go play with it.

## References

- Babbel (2025). [Is the semicolon dying? Research reveals usage in British English books plummets by almost half in two decades](https://www.babbel.com/press/en-gb/releases/semicolon). Press release, May 20, 2025.
- Biber, D. and Conrad, S. (2009). _Register, Genre, and Style_. Cambridge University Press.
- Burrows, J. (2002). "Delta": A measure of stylistic difference and a guide to likely authorship. _Literary and Linguistic Computing_ 17(3), 267-287. [doi:10.1093/llc/17.3.267](https://doi.org/10.1093/llc/17.3.267)
- Calhoun, A. J. (2016). [Punctuation in novels](https://medium.com/@neuroecology/punctuation-in-novels-8f316d542ec4). Medium.
- Darmon, A. N. M., Bazzi, M., Howison, S. D. and Porter, M. A. (2021). Pull out all the stops: Textual analysis via punctuation sequences. _European Journal of Applied Mathematics_ 32, 1069-1105. [arXiv:1901.00519](https://arxiv.org/abs/1901.00519)
- Fahnestock, J. (2011). _Rhetorical Style: The Uses of Language in Persuasion_. Oxford University Press.
- Hunt, K. W. (1965). _Grammatical Structures Written at Three Grade Levels_. National Council of Teachers of English.
- Lewis, E. H. (1894). _The History of the English Paragraph_. University of Chicago Press.
- Mosteller, F. and Wallace, D. L. (1964). _Inference and Disputed Authorship: The Federalist_. Addison-Wesley.
- Muzny, G., Algee-Hewitt, M. and Jurafsky, D. (2017). [Dialogism in the novel](https://academic.oup.com/dsh/article/32/suppl_2/ii31/3865424). _Digital Scholarship in the Humanities_ 32 (suppl. 2), ii31-ii52.
- Oliver, H. (2025). [The triumph of logical English](https://worksinprogress.co/issue/the-logical-triumph-of-english/). _Works in Progress_ 21, November 26, 2025.
- Rougeux, N. [Between the Words](https://www.c82.net/work/between-the-words).
- Rudnicka, K. (2018). Variation of sentence length across time and genre. In R. J. Whitt (ed.), _Diachronic Corpora, Genre, and Language Change_, 220-240. John Benjamins. [arXiv:2502.04321](https://arxiv.org/abs/2502.04321)
- Sherman, L. A. (1893). [_Analytics of Literature_](https://archive.org/details/analyticsofliter00sheruoft). Ginn.
- Smith, A. (1776). [_An Inquiry into the Nature and Causes of the Wealth of Nations_](https://archive.org/details/inquiryintonatur02smit_0), vol. 2. Strahan and Cadell.
- Underwood, T., Kiley, K., Shang, W. and Vaisey, S. (2022). [Cohort succession explains most change in literary culture](https://sociologicalscience.com/articles-v9-8-184/). _Sociological Science_ 9, 184-205.
- Westin, I. (2002). _Language Change in English Newspaper Editorials_. Rodopi.
- Duke Center for the Study of the Public Domain (2026). [Public Domain Day 2026](https://web.law.duke.edu/cspd/publicdomainday/2026/).

[^tunit]: Linguists will recognize words between stops as a crude version of the T-unit [Hunt 1965]: a main clause plus whatever hangs off it. It's crude because not every semicolon or colon starts a new main clause, which is the problem the hand-coded sample in the main results takes on.
