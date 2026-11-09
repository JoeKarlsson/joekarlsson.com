---
name: blog-to-newsletter
description: Turn one of Joe's joekarlsson.com blog posts into a Works on My Machine newsletter issue written for subscribers, with email-safe images (JPEG, GIF flipbooks for clips, rasterized diagrams), the listmonk draft in ~/newsletter-drafts and the site page in src/content/newsletter. Use when Joe shares a post URL or slug and asks to turn it into a newsletter, adapt it for the newsletter, send it to subscribers, or make a newsletter version/recap of it.
---

# Blog post to newsletter issue

The issue is a letter to people who subscribed, not a copy of the post and not an ad for it. Readers get the story and what Joe learned in the email itself. The post keeps the reference material (settings, code, parts lists), and the email links to it.

This skill covers adapting the post. Sending (push to listmonk, test email, schedule, publish, stats) belongs to the `newsletter` skill in Joe's homelab repo: `~/claude/.claude/skills/newsletter/SKILL.md`. Read that file before you start. Its hard rules (send days, no `{{ .Subscriber.Name }}`, email images in `public/email/`, nothing goes to subscribers without Joe's approval) and its review gate apply here too.

## 1. Read the post and pick the shape

Read `src/content/blog/<slug>.md` in full, and look at every image, clip and diagram it uses.

- **Default: a full letter.** Joe, 2026-11-09, on the recording setup issue: "I don't want it to be a preview... I'd like to adapt it for a newsletter type audience." He has no affiliate links, so nothing is gained by holding information back. This is also what personal newsletter writers recommend (Simon Willison sends everything in full).
- **Preview only for list posts**, like the gift guide: a flipbook of the picks, one line each, and a button to the full list (`what-to-buy-a-homelabber-2026`). If you're unsure which shape fits, ask.
- Not every post deserves an issue. If a post is a thin update or pure reference material, say so before you write anything.

## 2. Write it for the inbox

**Length: about 800-1,000 words.** Joe called 1,640 words "kind of long" (2026-11-09). The OKF issue was about 800. The research on length is thin. Buttondown found no clear link between word count and clicks. Nielsen Norman found people read only about 19% of a newsletter and scan headings and first lines. So shorter and easier to scan wins.

**Keep:**

- The story and what Joe learned (for the recording setup: why it rolls, lighting wrong twice and the fix, one cable, "I'm recording").
- Opinions and advice ("light your face first").
- One or two real photos, a meme if the post has a good one, and a diagram if it explains the idea.

**Cut, and link to the post for:**

- Settings (mic EQ, camera modes).
- Code and YAML. Link to the post's section anchor (`/blog/<slug>/#<heading-slug>`), and check that the anchor exists in the built page.
- Parts and price tables. Keep the total and the advice ("the desk and the dock are what you could skip").
- Exact specs and weights. "It's inside the rating, but it sags" carries the point.
- Side tangents (frame-rate math, an editing LUT).

**Voice:**

- Joe's lines from the post stay his. Rearrange and trim them, but don't rewrite a line that already works. Adapting means choosing and joining his lines, not writing new ones.
- Lead with the point in the first 2-3 lines, then the backstory. That's what readers see in the preview, and most only scan the top. For the recording setup, the first draft opened on iPhone selfies, and the desk didn't show up until sentence 4. The positioning reviewer flagged it, and the fix was swapping the first two paragraphs.
- Condensing drifts facts. Merging two sentences can turn "part of why" into "why", or "what I wanted" into "what I got". Have the fact-checker compare the issue against the post line by line.
- The dek (`description`) sits right above the first paragraph, so it must not repeat the opening. Read them together.
- Say once, near the top, what's only in the post ("the full post has a video tour, before-and-after audio..."). End with a `<a class="button" ...>` to the post.
- Never add something Joe only said in chat. For example, "no affiliate links" stayed out until he asked for it.
- No sign-off and no title heading in the body. The email template adds both.

**Title:** the newsletter skill says a recap reuses its blog post's title. That's the default, but give the issue its own title when the blog title doesn't work in an inbox: it's long or SEO-shaped, it has a year that reads wrong on the send date, or it promises something the email can't deliver ("tour" when the video can't play). Joe approved this for the recording setup (2026-11-09): "A tour of my recording setup in 2027..." became "My Whole Recording Setup Is One Desk on Wheels". Keep the subject short, because phones cut it off after the "Works on My Machine:" prefix.

## 3. Make every picture work in email

Inboxes don't play video or audio. Gmail and Outlook don't show SVG, and Outlook doesn't show WebP. Every picture needs two copies: an email copy in `public/email/<slug>/` (linked as `https://www.joekarlsson.com/email/<slug>/...`), and the site copy, either in `public/images/newsletter/<slug>/` or reused from the post's folder. The issue slug is the email title in kebab case.

| In the post | In the email |
| --- | --- |
| Photo or meme (WebP) | JPEG, 1056px wide (or the original width if smaller): `ffmpeg -i in.webp -vf "scale='min(1056,iw)':-2" -q:v 4 out.jpg` |
| Diagram (SVG) | `node .claude/skills/blog-to-newsletter/scripts/svg-to-email.mjs <desktop.svg> <out.jpg>` (use the desktop SVG, not `.phone.svg`) |
| Video clips that tell a story (before/after, stages, picks) | A flipbook GIF built from their posters: `node .claude/skills/blog-to-newsletter/scripts/flipbook.mjs <out.gif> 2 'poster.webp\|Label\|Note' ...` |
| A video tour or demo | Mention it and link to the post. If it's the heart of the post, add the poster as a JPEG linked to the post |
| Audio | A link to the post |

GIF rules:

- Keep it under 256KB. That's the site's limit before a GIF needs an MP4 sibling, and it's also safe for email.
- Classic Outlook may show only the first frame, so the first frame has to make sense on its own.
- Put the same GIF in `public/images/newsletter/<slug>/` for the site page.

Read every image you make before using it. Alt text is required on all of them.

## 4. Write the two files

**Site page:** `src/content/newsletter/<slug>.md`. Copy the frontmatter from `what-to-buy-a-homelabber-2026.md`:

- `recapOf: '<blog slug>'`. It keeps the issue off the blog list, homepage and RSS, and sets its canonical URL to the post. Google treats the canonical as a strong signal, so overlapping content doesn't hurt the post.
- `date`: the send day.
- `cardPhoto` / `cardPhotoAlt`: a photo whose subject survives a tall crop. Run `npm run newsletter:cards -- <slug>` and Read `card.webp`. For the recording setup, the front desk photo cropped down to a painting on the mat. The wide nook shot showed the rig.
- `cardPhotoAlt` is written into `heroAlt` after "with", so start it with "Joe's ...", not "My ...".
- A title over 45 characters needs a short `seoTitle` (a site test caps tab titles), like the OKF issue.
- Images use site paths (`/images/...`). Diagrams can stay as the post's SVG.

**Email draft:** `~/newsletter-drafts/<send date>-<slug>.md`. Use the same body, with each image swapped for its `https://www.joekarlsson.com/email/<slug>/...` copy. Front matter is `subject` ("Works on My Machine: <Title>"), `description` (the dek), `send_at`, and `recap_of`. Before you pick a send date, check the drafts folder for issues already scheduled. Sends go Tuesday to Friday at 9:00, one issue per day. Joe's issues have gone out on Thursdays, a week apart.

Work in a worktree (other sessions share the checkout), commit with explicit paths, and don't push until Joe approves. Anything on main goes live the next time any session deploys, because issue pages have no future-date filter.

## 5. Review, then show Joe

1. Run the newsletter skill's step 3 gate on the email draft: the voice/humanizer, fact-checker, E-E-A-T and positioning reviewers, in parallel. Point the fact-checker at the blog post as the source for first-hand claims. Tell it not to curl `/email/` URLs before deploy, because Cloudflare caches the 404 for hours.
2. Run `vale` with the main checkout's `.vale.ini`. In a worktree, run it from the main checkout, where `.vale/styles` exists.
3. Count the words: `awk 'n>=2{print} /^---$/{n++}' <file> | sed -E 's/!\[[^]]*\]\([^)]*\)//g' | wc -w`.
4. Run `npx astro build` and check that the issue page has its images, the button, and any section anchors you linked.
5. Open the email draft in VS Code (`code <draft>`). Give Joe a numbered summary: the shape, the word count, what was cut and linked, the send date, the reviewers' verdicts, and any questions.

After Joe approves, follow the newsletter skill's steps 3b-6: deploy so the `/email/` images are live, push, preview, test send, schedule, publish.
