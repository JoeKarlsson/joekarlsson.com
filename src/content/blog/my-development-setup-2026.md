---
title: 'My Development Setup in 2026'
date: 2026-09-30
slug: 'my-development-setup-2026'
description: 'My development setup in 2026: Ghostty, plain zsh, Handy voice input, git worktrees for concurrent Claude Code agents, and chezmoi. What I switched and why.'
categories: ['Dev Tools', 'Homelab']
tags:
  [
    'Claude Code',
    'dotfiles',
    'zsh',
    'Ghostty',
    'Starship',
    'Handy',
    'chezmoi',
    'Vale',
    'git worktrees',
    'developer tools',
  ]
heroImage: '/images/blog/my-development-setup-2026/hero.webp'
heroAlt: 'A 3D illustration of an orange desk with two monitors, a laptop, a keyboard, a key light, and a microphone on a boom arm'
tldr: 'My 2026 setup is built around speed, consistency, reliability, and reach, and it leans hard into running AI agents concurrently. I moved from iTerm2 and Oh My Zsh to Ghostty, plain zsh, and Starship, and cut shell startup by more than half. I talk to Claude Code through Handy, an open-source, local speech-to-text app. Several agents run at once in Ghostty splits and git worktrees, guided by version-controlled rules, hooks, and verification workflows that chezmoi deploys to every machine.'
faq:
  - question: 'What is in your development setup in 2026?'
    answer: 'As of September 2026: Ghostty as my terminal (replacing iTerm2), plain zsh with Starship (replacing Oh My Zsh and Powerlevel10k), Handy for local speech-to-text (replacing Superwhisper), several concurrent Claude Code agents in Ghostty splits and git worktrees, VS Code for reading and editing, Vale for prose linting, and chezmoi deploying one version-controlled dotfiles repo, including CLAUDE.md, to my Macs and a Linux dev container.'
  - question: 'How do you run multiple Claude Code agents at the same time without conflicts?'
    answer: "I run each agent in its own Ghostty split, and when several agents work on the same code, each one gets its own git worktree: a separate checkout of the repo on its own branch that shares one .git directory. Agents never see each other's half-finished changes, and I merge each branch when it is done. When agents share one checkout, I have them stage and commit in the same step, by path, never with git add -A."
  - question: 'Why switch from iTerm2 to Ghostty?'
    answer: 'Not because iTerm2 broke. I switched because Ghostty keeps its whole config in one plain text file I can version in my dotfiles, so every Mac gets an identical terminal, and because its splits suit running several Claude Code sessions side by side.'
  - question: 'Why use Handy instead of Superwhisper for talking to Claude Code?'
    answer: 'Handy is open source, free, and runs any local speech model, including Whisper and NVIDIA Parakeet, so transcription never leaves my Mac. I also point its transcript cleanup pass at a local model on my homelab instead of a cloud API.'
  - question: 'Is Oh My Zsh worth replacing with plain zsh?'
    answer: 'Yes, if you only use a few of its aliases. Oh My Zsh loaded thousands of lines of code on every new tab to provide a couple hundred git aliases, and my shell history showed I used two. Replacing it with about 50 lines of my own setup and Homebrew-installed plugins cut shell startup from about 108 ms to 46 ms.'
  - question: 'How do you keep CLAUDE.md consistent across machines?'
    answer: 'My global CLAUDE.md, settings.json, status line, and notification hook live in my dotfiles repo, and chezmoi deploys them to every Mac. A Linux dev container in my homelab pulls the same repo weekly, so every Claude Code session follows the same rules.'
  - question: 'Are local coding agents as good as Claude Code?'
    answer: 'No, not yet. I tried OpenCode and aider against Qwen3-Coder on a 16 GB RTX A4000, and they could not match Claude Code on long, multi-step changes across real systems. I have not yet tested the newer Qwen3.8 models on real coding work.'
---

The biggest change to my development setup in 2026 is **concurrency.** I rarely have only one agent working anymore. I usually have three to six Claude Code sessions going at once, on different tasks, until my brain starts to melt from the context switching. Agents amplify whatever environment you give them, and a messy one gets you messy work, faster. Most of what's below exists to make running several at once fast and safe.

I use this setup every day at my day job, and the worktree pattern came from work: five agents in one docs repo. It's built around four goals:

- **Speed.** A new terminal window should be ready the instant it opens. Starting a new task should take seconds. And my agents should finish tasks quickly _and_ correctly, because a fast wrong answer isn't fast.
- **Consistency.** Anything I do more than twice becomes a skill, a workflow, a rule, or a hook, so it happens the same way every time, can run concurrently, and can be rolled back with git. That goes for my writing too, which runs through linter rules. And every machine I work on, across different operating systems, gets its environment from the same version-controlled repo.
- **Reliability.** My homelab has to stay up, and my agents have to do the job right. Both need checks.
- **Reach.** I can fix things from anywhere, including my phone.

The short version of what changed:

| What                   | Last year                  | Now                                          | Why                                             |
| ---------------------- | -------------------------- | -------------------------------------------- | ----------------------------------------------- |
| Terminal               | iTerm2                     | Ghostty                                      | One config file in my dotfiles, splits built in |
| Shell                  | Oh My Zsh + Powerlevel10k  | Plain zsh + Starship                         | Startup went from about 108 ms to 46 ms         |
| Talking to agents      | Superwhisper               | Handy, with local speech models              | Open source, transcription stays on my Mac      |
| Claude Code            | One session at a time      | Several agents in splits and git worktrees   | Three to six tasks at once without collisions   |
| Agent rules            | Lived on one laptop        | Version controlled, deployed by chezmoi      | Every machine's Claude follows the same rules   |
| Checking agent work    | Me, by eye                 | Verification workflows, hooks, health checks | Agents check their work before saying "done"    |
| Writing checks         | Spell check                | Vale rules for my voice and AI slop          | Same checks whether I wrote it or Claude did    |
| Containers             | Docker Desktop             | Colima + the open source docker CLI          | Tired of Docker Desktop's licensing changes     |
| Dotfiles               | Hand-rolled symlink script | chezmoi on macOS and Linux                   | My machines had quietly drifted apart           |
| Working away from home | Laptop on my home network  | iPhone to a homelab dev container            | Fixing Plex no longer waits until I'm home      |

"Last year" means 2025. Versions as of September 2026: Ghostty 1.3.1, Starship 1.26, Claude Code 2.1, chezmoi 2.73, and Handy 0.9.7, on macOS and Debian 13.

The full inventory of hardware and apps lives on my [uses page](/uses). This post is the why. Where it helps, I've tucked the actual config into collapsible blocks so you can copy it.

## Terminal and shell

### Ghostty, because the config is one text file

**Last year:** [iTerm2](https://iterm2.com/), which I'd used for about a decade. **Now:** [Ghostty](https://ghostty.org/).

iTerm never broke. I switched for two reasons. Ghostty's config is one plain text file, so it lives in my dotfiles and every Mac gets the identical terminal. And I spend my day in **splits** now, and I wanted splits that behave exactly how I expect with zero setup on a new machine.

A normal session is one Ghostty window cut into four or five panes, each running a separate [Claude Code](https://code.claude.com/docs) session on a separate job. The screenshot below is a real afternoon: orphaned OpenTofu state, a Last.fm replacement, my social post scheduler, a music server's web UI, and this post. I glance across them like a row of monitors.

I don't run tmux on the Mac. Ghostty's native splits do what I need with nothing extra to configure.

That's also why I don't use the Claude Code extension for VS Code. It gives me one Claude inside one editor. Ghostty gives me as many as I want.

![A Ghostty window split into five panes, each running its own Claude Code session on a different task, with a status line under each pane naming the task](/images/blog/my-development-setup-2026/ghostty-claude-code-splits.webp)

<details>
<summary>Show my Ghostty split settings</summary>

```ini
# Every split re-balances all panes evenly, like iTerm
keybind = cmd+d=new_split:right
keybind = chain=equalize_splits
keybind = cmd+shift+d=new_split:down
keybind = chain=equalize_splits
keybind = cmd+w=close_surface
keybind = chain=equalize_splits

# New tabs and splits open in the current directory
window-inherit-working-directory = true

# Install Ghostty's terminfo on hosts I SSH into
shell-integration-features = no-cursor,ssh-env,ssh-terminfo
```

</details>

### Plain zsh: startup from 108 ms to 46 ms

I noticed lag. Opening a new tab had a small but real delay, and I open a lot of tabs. So I audited it: startup was around 108 ms, mostly [Oh My Zsh](https://ohmyz.sh/) plus a handful of tools spawning a subprocess every time a shell started. After the cleanup it was 46 ms, and new tabs feel instant. That's warm-cache `.zshrc` load time in a real pty, timed with zprof and per-section timers under `env -i`, so my agent's environment didn't skew it. The first numbers lied, too: a cold completion cache made `compinit` look like 460 ms. Warm, it's 7 ms.

What I learned from measuring: **aliases are free, subprocesses aren't.** Dozens of aliases cost nothing measurable. Every `eval "$(some-tool init)"` did.

The bigger job was deciding what to keep. My shell was still set up for how I worked years ago, so I threw out everything I don't use day to day anymore: Oh My Zsh itself (a couple hundred git aliases, of which my history showed I used two), [nvm](https://github.com/nvm-sh/nvm) and its 779 MB, a local MongoDB install I hadn't touched in ages, Python tooling I'd stopped using, leftover config for an editor I'd uninstalled, and a joke alias called `yolo` that committed with a random message from whatthecommit.com.

![Monkey Puppet meme: the puppet glancing away awkwardly, captioned "My shell history when I ask which of Oh My Zsh's 200 git aliases I actually use"](/images/blog/my-development-setup-2026/monkey-puppet-oh-my-zsh-aliases.webp)

Now it's [zsh](https://www.zsh.org/), about 50 lines of my own setup, and two plugins ([zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions) and [zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting)) installed with [Homebrew](https://brew.sh/), so they update the same way on every Mac.

<details>
<summary>Show the core of my .zshrc</summary>

```bash
# Shell core (plain zsh, no framework; plugins come from Homebrew)
HISTFILE=~/.zsh_history
HISTSIZE=50000
SAVEHIST=10000
setopt APPEND_HISTORY SHARE_HISTORY EXTENDED_HISTORY HIST_EXPIRE_DUPS_FIRST
setopt HIST_IGNORE_DUPS HIST_IGNORE_SPACE HIST_VERIFY

# Completion: full rebuild of the dump at most once a day, cached otherwise
autoload -Uz compinit
() {
  setopt local_options extended_glob
  local dump=${ZDOTDIR:-$HOME}/.zcompdump
  if [[ -f $dump && -z $dump(#qN.mh+24) ]]; then compinit -C -d $dump; else compinit -d $dump; fi
  [[ $dump.zwc -nt $dump ]] || zcompile $dump   # compiled dump loads faster
}

# Cache each tool's init script instead of spawning it on every startup.
# Keyed on the resolved binary path (the Homebrew Cellar path includes the
# version), so a brew upgrade regenerates it automatically.
_cached_init() {  # _cached_init <name> <cmd> [args...]
  local name=$1; shift
  local bin=${commands[$1]:A} cache=~/.cache/zsh/init-$name.zsh
  if [[ ! -s $cache || "$(<$cache.src)" != $bin ]] 2>/dev/null; then
    mkdir -p ${cache:h} && "$@" >| $cache && print -r -- $bin >| $cache.src
  fi
  source $cache
}
_cached_init fzf fzf --zsh
_cached_init zoxide zoxide init zsh

# mise shims instead of `mise activate`: no hook before every prompt
export PATH="$HOME/.local/share/mise/shims:$PATH"

# Must be last: it wraps every widget defined above
source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
```

</details>

One more change, because of agents. Claude Code runs its commands in a shell that loads my `.zshrc`, and my `cp -i` alias sat at an invisible "overwrite?" prompt and hung a task. Claude Code [sets `CLAUDECODE=1`](https://code.claude.com/docs/en/env-vars), so the human-only stuff now steps aside:

```bash
# Human-only niceties. Claude Code (CLAUDECODE=1) runs commands through
# this file too, and interactive prompts hang it.
if [[ -z $CLAUDECODE ]]; then
  alias cp='cp -iv'
  alias mv='mv -iv'
  cd() { builtin cd "$@"; [[ -o interactive ]] && ll; }
fi
```

Your shell has a second user now. Go read your `.zshrc` with that in mind.

### Aliases: git and getting around

The aliases that survived are the ones I type without thinking. Git, and moving between directories. `gs` is probably the most-typed thing on my keyboard.

<details>
<summary>Show my everyday aliases</summary>

```bash
# Git
alias g="git"
alias gs="git status"
alias ga="git add"
alias gcm="git commit -m"
alias gco="git checkout"

# Getting around
alias ..='cd ../'
alias ...='cd ../../'
alias ~="cd ~"
alias dev="cd ~/Documents/dev"
alias docs="cd ~/Documents"
alias dl="cd ~/Downloads"
alias dt="cd ~/Desktop"
alias f='open -a Finder ./'     # open this folder in Finder
alias e="code ."                # open this folder in VS Code
mcd() { mkdir -p "$1" && cd "$1"; }   # make a directory and cd into it
```

</details>

For everything else, [zoxide](https://github.com/ajeetdsouza/zoxide) handles the jumping: `z blog` takes me to this repo from anywhere.

The one thing I added back is [atuin](https://atuin.sh/) for Ctrl-R, local only with no sync. It isn't free. It adds about 14 ms before every command, and its init quietly rewired zsh-autosuggestions to spawn `atuin search` on every keystroke, which I switched back to plain history. Searchable history with directory, exit code, and duration is worth 14 ms to me. The keystroke thing wasn't.

### Starship, because Powerlevel10k is on life support

I loved [Powerlevel10k](https://github.com/romkatv/powerlevel10k), but its README has said "NO NEW FEATURES ARE IN THE WORKS" and "MOST BUGS WILL GO UNFIXED" since 2024. I don't want the thing I look at thousands of times a day to be one macOS update away from breaking. I looked at [Oh My Posh](https://ohmyposh.dev/) (best looking, my runner-up), [Pure](https://github.com/sindresorhus/pure) (fast, almost no segments), Spaceship, and just staying on p10k. I picked [Starship](https://starship.rs/) because it's the one I'd bet is still maintained in five years: works in any shell, one TOML file.

It costs me something. p10k is still faster in git repos. It keeps a background daemon that already knows the repo state, and it draws a cached prompt before `.zshrc` finishes loading. Starship runs every module synchronously and waits for all of them.

I use the catppuccin-powerline preset with two things turned off: git status counts and language versions. Out of the box they ran `git status` and `node --version` before every prompt. When I want the details, I type `gs`.

<details>
<summary>Show what I trimmed from the Starship preset</summary>

```toml
# catppuccin-powerline preset, trimmed for speed:
#  - git_status off: a full `git status` every prompt cost ~50 ms in repos
#    (branch alone ~8 ms)
#  - language version segment removed: each module launches its runtime
#    (node --version ~65 ms)
palette = 'catppuccin_mocha'

[git_status]
disabled = true
```

</details>

## Running three to six agents at once

### Voice: Handy with a local speech model

**Last year:** [Superwhisper](https://superwhisper.com/). **Now:** [Handy](https://handy.computer/).

I talk to my agents far more than I type to them. Hold a key, say what I want, let go, and the text lands in whichever Claude pane has focus. It feels a lot like having Jarvis: I narrate the problem the way I'd explain it to a coworker, and the agent goes and does it. Talking also makes me explain what I want instead of firing off half a thought.

Superwhisper was good. Handy is [open source](https://github.com/cjpais/Handy), free, and runs any local model I want: Whisper, or NVIDIA's [Parakeet](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3), which is what I use. Its cleanup pass (punctuation, misheard words) points at a local model on my homelab GPU, so nothing leaves hardware I own. Keeping my data on hardware I own isn't one of the four goals. It's the constraint on all of them.

### One git worktree per agent

Two agents sharing one git checkout will happily commit each other's work. One of my commits once swept up three files a different session had left staged. So there's a rule now: stage and commit in the same step, by path, never `git add -A`.

![Spider-Man Pointing at Spider-Man meme: two identical Spider-Men pointing at each other, captioned "Two Claude Code agents in one git checkout, looking at a commit full of each other's half-finished files"](/images/blog/my-development-setup-2026/spiderman-pointing-shared-checkout.webp)

That's enough when agents touch different parts of a repo. When they're in the same code, each one gets its own [git worktree](https://git-scm.com/docs/git-worktree): a separate checkout on its own branch, sharing one `.git`. Nobody sees anybody's half-finished changes, and I merge each branch when it's done.

```bash
git worktree add ../docs-nav -b nav-cleanup   # new checkout on a new branch
cd ../docs-nav && claude                      # this agent works here
git worktree remove ../docs-nav               # clean up after merging
```

At work I've had five agents in one docs repo at once, each in its own worktree: one restructuring navigation, one fixing broken links, a few rewriting pages. The costs are small. Each worktree needs its own `npm install`, dev servers can fight over a port, and I still resolve conflicts at merge time.

More agents doesn't mean less review. Every repo has tests for everything, I read all the code before it merges, and on a collaborative project other people review and test it too. Agents write the code. Humans still sign off on it.

### Status line: which pane is which

With five panes open, I need to know which is which at a glance. Claude Code runs a [status line script](https://code.claude.com/docs/en/statusline) at the bottom of every session. Mine shows the session title, directory, git branch (with a `*` if there are uncommitted changes), model, and how much context is used.

The title is the useful part. Each pane labels itself ("Orphan tofu state," "Dev setup workflow and philosophy"), and a notification hook uses the same title, so when an agent needs me I know which one. The context percentage tells me when it's time to wrap a session up.

![Close-up of five Claude Code status lines side by side, each starting with a session title in pink followed by the working directory](/images/blog/my-development-setup-2026/claude-code-status-line.webp)

<details>
<summary>Show my Claude Code status line script</summary>

```bash
#!/usr/bin/env bash
# Claude Code status line: session title, dir + git branch/status,
# model, and context usage. Requires jq.
input=$(cat)

cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // empty')
[ -z "$cwd" ] && cwd=$(pwd)
model=$(echo "$input" | jq -r '.model.display_name // empty')
used=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
title=$(echo "$input" | jq -r '.session_name // empty')
# Keep long titles from pushing the rest off narrow splits
[ ${#title} -gt 50 ] && title="${title:0:49}…"

dir="$cwd"
case "$dir" in
  "$HOME") dir="~" ;;
  "$HOME"/*) dir="~/${dir#"$HOME"/}" ;;
esac

branch=""; dirty=""
if git -C "$cwd" --no-optional-locks rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  branch=$(git -C "$cwd" --no-optional-locks symbolic-ref --short HEAD 2>/dev/null \
    || git -C "$cwd" --no-optional-locks rev-parse --short HEAD 2>/dev/null)
  [ -n "$(git -C "$cwd" --no-optional-locks status --porcelain 2>/dev/null | head -n 1)" ] && dirty="*"
fi

out=$(printf '\033[34m%s\033[0m' "$dir")
[ -n "$title" ] && out="$(printf '\033[1;35m%s\033[0m' "$title") $out"
[ -n "$branch" ] && out="$out $(printf '\033[32m%s%s\033[0m' "$branch" "$dirty")"
[ -n "$model" ] && out="$out $(printf '\033[36m%s\033[0m' "$model")"
[ -n "$used" ] && out="$out $(printf '\033[33mctx %.0f%%\033[0m' "$used")"

printf '%s\n' "$out"
```

</details>

## Rules, hooks, and checks for agents

### Rules: one CLAUDE.md, deployed to every machine

What I've learned this year: **agents need a way to verify their own work.** Without one, a capable agent will confidently tell you it's done. With one, it checks, and when the check fails, it fixes the problem and checks again.

So anything I do more than twice gets written down as a rule, a skill, a hook, or a linter, and all of it lives in git.

The rules live in `CLAUDE.md`, the file Claude reads at the start of every session. Mine is in my dotfiles, and [chezmoi](https://www.chezmoi.io/) deploys it to every machine, including the Linux container I reach from my phone. Change a rule once, push, and every Claude I talk to follows it.

Every rule started as a mistake. "Test the change you made" is a verification workflow in one sentence, and it's the one that changed the most. The "match the effort to the risk" line came after Claude ran my entire test suite to change a comment. The Word rule came from edits that passed validation and then vanished when Word reopened a stale OneDrive copy.

![UNO Draw 25 Cards meme: the card says "Run the tests before saying it's done" and the man holding a huge hand of cards is labeled "Claude, before I put it in CLAUDE.md"](/images/blog/my-development-setup-2026/uno-draw-25-run-the-tests.webp)

<details>
<summary>Show excerpts from my global CLAUDE.md</summary>

```markdown
## Testing

**Test the change you made.** Before calling it done, run the specific
feature, fix, or test once and confirm it works. Don't claim something works
without running it. If it fails, fix it and run it again. Don't ask me to
check something you could check yourself.

**Past that, use your judgment.** Match the effort to the risk.

- Tests: run the tests for the area you changed, not the whole suite by default.
- Check once. Don't confirm the same thing several different ways.

## Git Workflow

1. Always fetch the latest changes before making any changes.
2. Commit messages follow `feat:`, `fix:`, or `chore:`.
3. When a change is ready, commit it directly and push. Don't create a PR
   unless I explicitly request one.

## Editing Word documents: verify in Word, not just on disk

A .docx edit is not done until I can see it in Word. A correct file on disk
proves nothing: Word and OneDrive can silently replace it.
```

</details>

Workflows bake the same idea in. My homelab health check reports every finding, proposes a fix, and waits for my go-ahead. My [blog pipeline](/blog/building-a-claude-code-blog-skill-what-i-learned-systematizing-content-creation/) fact-checks every claim and link before I see a draft. I wrote more about project-level `CLAUDE.md` files in [how my Claude Code skills repo accidentally became internal tooling](/blog/my-personal-claude-code-skills-repo-accidentally-became-internal-tooling/).

### Hooks: rules that can't be ignored

A rule is a suggestion Claude usually follows. A hook is a script that runs before a tool call and can block it.

Every container in my homelab is managed by [OpenTofu](https://opentofu.org/) and supposed to be immutable, so a hook blocks Claude from writing inside one and points it at the provision script. Read-only commands pass through. Another blocks restoring a Home Assistant backup without my OK. It's a pattern list, not a sandbox, but it catches the mistakes agents make in practice.

<details>
<summary>Show part of the immutable-infrastructure hook</summary>

```python
#!/usr/bin/env python3
"""
Claude Code PreToolUse hook that blocks write operations inside immutable
Proxmox containers. All containers managed by OpenTofu are immutable: changes
must go through provision.sh.tpl + tofu apply, never direct shell access.

Read-only operations pass through (df, du, ls, cat, grep, journalctl,
systemctl status, ...). A command is allowed only if every pipeline segment
is a known read-only binary AND it contains no write indicator.
"""

WRITE_PATTERNS = [
    r"apt-get\s+(install|remove|purge|upgrade)",
    r"\bsed\s+-i\b",
    r"\bsystemctl\s+(enable|disable|mask|unmask|start|stop|restart)\b",
    r"\brm\s+",
    r"\bdocker\s+(run|pull|build|compose|up|create|rm|stop|start|restart)\b",
    # ...
]
```

</details>

If you're letting an agent near real systems, learn hooks first.

## Editing and writing

### Editor: VS Code

[VS Code](https://code.visualstudio.com/) didn't change. What I do in it did. It used to be where I wrote code; now it's where I **read and edit what agents wrote**.

For anything bigger than a quick fix, I have Claude write the plan to a markdown file, then I open it in VS Code and edit it like a normal document. Cut steps, reorder, fix what it misunderstood. Claude works from my version. That's faster than correcting a plan through chat, and it leaves a record of what Claude and I agreed to.

I dropped [GitHub Copilot](https://github.com/features/copilot) after it changed its billing model. [Prettier](https://prettier.io/), [ESLint](https://eslint.org/), [markdownlint](https://github.com/DavidAnson/markdownlint), and [cspell](https://cspell.org/) run on save.

### Linters: my voice, written down as rules

This is the part of my setup I'm proudest of, and the one nobody asks about.

<!-- vale JoeKarlsson.BannedWords = NO -->
<!-- vale JoeKarlsson.BannedOpenings = NO -->
<!-- vale Slop.Vocabulary = NO -->

When an AI helps you write, the drafts drift toward _generic_. Em dashes everywhere. "Robust." "Seamless." Sentences that all run the same length. After the fifth draft of something, I can't see it anymore. So I wrote it down as rules for [Vale](https://vale.sh/), a prose linter:

- **My own style, `JoeKarlsson`.** Banned words (the "delve, leverage, robust" list), banned openings like "In today's world," AI filler, and no em dashes.
- **[vale-llm-slop](https://github.com/Syntaf/vale-llm-slop)** for common LLM phrasing.
- **An `ai-tells` style with 137 rules** for the structural habits AI writing falls into: "not X, but Y," announcement headings, closing pleasantries, defensive hedges.
- **[write-good](https://github.com/errata-ai/write-good) and [proselint](https://github.com/errata-ai/proselint)**, minus the rules that fight my voice. I start sentences with "So." Fine.

<!-- vale JoeKarlsson.BannedWords = YES -->
<!-- vale JoeKarlsson.BannedOpenings = YES -->
<!-- vale Slop.Vocabulary = YES -->

![Clown Applying Makeup meme in four panels: "Let AI help write my blog posts," "Get annoyed by all the em dashes," "Write 137 lint rules against AI slop," and, in full clown makeup, "Turn off the rules that flag my own voice"](/images/blog/my-development-setup-2026/clown-makeup-ai-slop-linters.webp)

A [LanguageTool](https://languagetool.org/) server in my homelab handles grammar without sending drafts anywhere. And the part that matters: **agents run the same checks.** The linters run in the editor, before commits, and in CI, so the rules apply whether I wrote the sentence or Claude did.

<details>
<summary>Show my blog's Vale config</summary>

```ini
StylesPath = .vale/styles
MinAlertLevel = warning

Packages = https://github.com/Syntaf/vale-llm-slop/releases/latest/download/vale-llm-slop.zip, write-good

[*.md]
BasedOnStyles = JoeKarlsson, Slop, write-good

# write-good: disable rules that conflict with my voice
write-good.EPrime = NO
write-good.So = NO
write-good.Passive = warning
write-good.Weasel = warning
```

</details>

## Reach and reliability

### Remote: a dev container I drive from my iPhone

**Last year:** if something broke, I needed a laptop on my home network. **Now:** I need my phone.

`claude-dev` is a Debian container on my [Proxmox](https://www.proxmox.com/) cluster with Claude Code, my homelab repo, and the same `CLAUDE.md` as my laptops. On my iPhone I use [Termius](https://termius.com/), which supports [mosh](https://mosh.org/), over [Tailscale](https://tailscale.com/).

```
iPhone (Termius)
   |  mosh over Tailscale
   v
claude-dev (Debian LXC on Proxmox)
   |  on login: clean up stale sessions -> git pull -> claude
   v
Claude Code  --ssh-->  Plex, Home Assistant, Proxmox nodes, NAS ...
```

I run a [Plex](https://www.plex.tv/) server for friends and family, which makes me their on-call support whether I like it or not. When someone texts me that Plex is broken and I'm out, I open Termius, tell Claude what they told me, and let it dig through logs and fix it while I keep doing whatever I was doing. A push notification tells me when it's done. Mosh is what makes it work on a phone: elevators, Wi-Fi to cell, a locked screen, and it picks right back up.

![Buff Doge vs. Cheems meme: Buff Doge labeled "Me in 2026: fixes Plex from my phone while I'm out" next to a crying Cheems labeled "Me in 2025: I'll look at it when I get home"](/images/blog/my-development-setup-2026/buff-doge-cheems-plex-on-call.webp)

The container updates itself every Sunday, Claude Code and dotfiles included. It's managed by OpenTofu like the rest of the lab, which I covered in [moving the whole homelab into OpenTofu](/blog/opentofu-proxmox-immutable-homelab/).

### Homelab: git push is the deploy

My laptops only edit. When I push the homelab repo, a git hook syncs it to an always-on Proxmox node, which applies the change and checks for drift. Every change is a commit, so rolling back is a `git revert`.

Every machine also has a health check: 156 checks for the homelab, covering all 64 services, one for my Mac, and `bin/doctor` for my dotfiles. All of them report and wait for my go-ahead before fixing anything, because the first time I pointed cleanup tools at my Mac, `npm doctor` quietly deleted 3.3 GB of cache and an uninstaller nearly deleted live 1Password data.

### Local models: not my coding tool

Handy's transcription runs locally, and [Home Assistant](https://www.home-assistant.io/)'s voice assistant runs on a 16 GB RTX A4000 in [the rack I built over the last two years](/blog/homelab-two-years-later/) (more in [running local voice AI on a GPU in Proxmox](/blog/local-voice-ai-home-assistant-gpu/)).

For code, I tried [OpenCode](https://opencode.ai/) and [aider](https://aider.chat/) with [Qwen3-Coder](https://github.com/QwenLM/Qwen3-Coder). Neither was close to Claude Code on long, multi-step work, partly because [a GPU shared with Plex and photo processing](/blog/proxmox-gpu-passthrough-multi-service/) means small context windows. I keep hearing the new Qwen3.8 models are excellent. I haven't tested one on real work, so I won't pretend to know.

## Everything else

### Secrets and git: 1Password

SSH keys live in [1Password](https://1password.com/) and get served by [its SSH agent](https://www.1password.dev/ssh/). My SSH config is in my dotfiles; the keys never are. Commits are signed with the same key, Touch ID once per session.

My git config got an upgrade, mostly from Scott Chacon's [How Core Git Developers Configure Git](https://blog.gitbutler.com/how-git-core-devs-configure-git/). It pays off when I'm merging five worktree branches back in a row: `zdiff3` shows the original in conflicts, `rerere` replays conflict resolutions I've already made, and [delta](https://github.com/dandavison/delta) makes diffs readable. delta only kicks in when git writes to a terminal, so an agent piping `git diff` still gets plain text.

<details>
<summary>Show my git config highlights</summary>

```ini
[diff]
    algorithm = histogram     # cleaner diffs when code moves around
    colorMoved = default
[merge]
    conflictStyle = zdiff3    # show the common ancestor in conflicts
[rerere]
    enabled = true            # remember how I resolved a conflict
[rebase]
    autosquash = true
    autostash = true
[push]
    autoSetupRemote = true
[fetch]
    prune = true
[help]
    autocorrect = prompt      # ask before running git's guess at a typo
[core]
    pager = delta
[gpg]
    format = ssh
[gpg "ssh"]
    program = /Applications/1Password.app/Contents/MacOS/op-ssh-sign
[commit]
    gpgsign = true
```

</details>

### CLI tools

- **[mise](https://mise.jdx.dev/)** replaced nvm and the wrapper functions I'd written to keep nvm from slowing down my shell. I use its shims, so nothing runs before each prompt.
- **[ripgrep](https://github.com/BurntSushi/ripgrep), [fd](https://github.com/sharkdp/fd), [fzf](https://github.com/junegunn/fzf), [jq](https://jqlang.org/), and [gh](https://cli.github.com/).** fzf uses fd under the hood, so fuzzy file search respects `.gitignore`.
- **[Colima](https://github.com/abiosoft/colima)** replaced [Docker Desktop](https://www.docker.com/products/docker-desktop/). I got tired of Docker's licensing and pricing changes, and I didn't want my containers depending on a company making moves like that. Colima is open source and works with the regular docker CLI, so nothing else changed.
- **[Topgrade](https://github.com/topgrade-rs/topgrade)** updates Homebrew, App Store apps, mise, npm globals, VS Code extensions, and Claude Code in one command. I turned off the steps that reboot the Mac or pull git repos over uncommitted work.

![Left Exit 12 Off Ramp meme: the highway sign reads "Keep paying for Docker Desktop" straight ahead and "Colima" on the exit, and a car labeled "Me after one more licensing change" swerves onto the exit](/images/blog/my-development-setup-2026/left-exit-12-colima.webp)

<details>
<summary>Show my Topgrade settings</summary>

```toml
# topgrade.toml: skip steps that reboot or touch my repos
[misc]
disable = ["system", "git_repos", "containers", "colima", "uv", "poetry", "pnpm"]
```

</details>

### Dotfiles: chezmoi

**Last year:** a hand-rolled `install.sh` that symlinked files into my home directory. **Now:** [chezmoi](https://www.chezmoi.io/).

The script worked for one Mac. It fell apart with several machines that were mostly the same, one of which wasn't a Mac at all. When I audited it, one laptop had months of uncommitted changes and another had pushed commits that conflicted with them. "My dotfiles are in git" and "my machines match my dotfiles" are different claims.

chezmoi fixes that with machine profiles. Each Mac gets asked once whether it's work or personal; Linux is always a server, so provisioning a container never hangs on a prompt. The Linux container skips the Mac stuff but gets the same git config and the same `CLAUDE.md`. Everything that isn't a template is a symlink, so editing `~/.zshrc` edits the repo.

<details>
<summary>Show my chezmoi machine-type config</summary>

```go-template
{{- /* Macs are asked once at `chezmoi init`.
       Linux is always "server" so provisioning never waits on a prompt. */ -}}
{{- $machine := "server" -}}
{{- if eq .chezmoi.os "darwin" -}}
{{-   $machine = promptChoiceOnce . "machine" "Machine type" (list "work" "personal") "personal" -}}
{{- end -}}
# Plain files are symlinks into the source dir, so editing ~/.zshrc edits the
# repo. Templates (.tmpl) are rendered copies: edit them with `chezmoi edit`.
mode = "symlink"

[data]
    machine = {{ $machine | quote }}
```

</details>

A new Mac is one clone and `install.sh`, which is now a short bootstrap: install Homebrew and chezmoi, then hand off to `chezmoi init`. `bin/doctor` keeps it honest afterward.

## What I'd keep and what's still broken

I'd keep all of it, but worktrees, the shared `CLAUDE.md`, and hooks are the three I'd set up first on a new machine. Those are what let me hand off more work and trust what comes back. The terminal and shell changes are nice. Those three are why running six agents doesn't end in a mess.

Still broken or missing:

- **Worktrees have overhead.** Every one needs its own `npm install`, dev servers fight over ports, and merge conflicts still land on me.
- **Hooks are pattern lists, not a sandbox.** They catch the mistakes agents make in practice, and anything the list doesn't anticipate gets through.
- **Local models aren't good enough for coding yet**, at least not on a 16 GB card shared with Plex and photo processing.

Next on my list: testing one of the bigger Qwen3.8 models on real coding work, and getting these dotfiles running cleanly on more than macOS and Debian.
