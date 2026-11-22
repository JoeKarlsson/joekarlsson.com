# Security policy

This repo is the source for [joekarlsson.com](https://www.joekarlsson.com), my personal site. If you found a security problem in the site or in this code, I want to hear about it.

## Reporting a vulnerability

Report it privately through [GitHub's private vulnerability reporting](https://github.com/JoeKarlsson/joekarlsson.com/security/advisories/new). Please don't open a public issue or pull request for it.

Helpful things to include:

- The page URL or file path
- Steps to reproduce, or a proof of concept
- What an attacker could do with it

I maintain this site by myself, so I can't promise a fixed response time. I'll confirm I got your report, keep you posted while I fix it, and credit you in the advisory if you'd like.

## What's in scope

- The live site at `www.joekarlsson.com`
- The code in this repo, including its GitHub Actions workflows

Out of scope:

- Third-party services the site links to or embeds (YouTube, Bluesky, Letterboxd and so on). Report those to their owners.
- Missing best-practice headers or settings that don't lead to a real attack
- Denial of service, spam and social engineering

## Supported versions

Only the current `main` branch and what's live on the site. There are no releases or older versions to patch.

## Testing

Good-faith research that stays within this policy is welcome, and I won't take action against you for it. Don't access data that isn't yours, don't degrade the site for other visitors, and give me a reasonable chance to fix a problem before you talk about it publicly.

There's no bug bounty. It's a personal site.
