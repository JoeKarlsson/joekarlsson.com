# Blog Post Notes: OpenTofu Proxmox Homelab Migration

Use these notes to pre-seed Phase 1 and skip redundant research.

---

## The Story (Three Acts)

### Act 1 — The Audit (months before migration)

Joe spent months building a comprehensive infrastructure health check system (`domains/proxmox/scripts/health-checks/`) before touching OpenTofu. The motivation: document what each container actually did. The revelation: discovering how broken things already were. Things failing silently. Tight coupling that wasn't obvious until you tried to write a test for it. The exercise of _trying to document_ the infrastructure is what made the problem undeniable — not a single incident, but the accumulated weight of years of click-ops finally made visible.

This is the opening hook. Writing tests for what each container was supposed to do and realizing half of them were silently failing, and that nobody (including Joe) could say with confidence what a given container was configured to do anymore.

### Act 2 — The Migration (~2 weeks)

Wave-based codification of 60+ containers using OpenTofu + MinIO state backend. Stateless services first, critical infrastructure last. Some container configuration had been running so long the original setup was lost — had to reverse-engineer from the running state. Things broke. Some gaps still being discovered and fixed today.

### Act 3 — Living With Immutability (ongoing, ~1 week post-migration)

A genuinely different mental model. Used to: SSH in, make a change, move on. Now: update `provision.sh.tpl`, run `tofu apply`, verify. Longer feedback cycles. But the payoff: always know the state of a container, git history as audit trail, drift detection is automatable, making changes without fear of permanently breaking something. One week in: troubleshooting is easier, less surprised by issues.

And one angle nobody else is writing about: LLM agents (like Claude Code) can read provision scripts to understand and troubleshoot containers without SSH access.

---

## Author's Experience & Opinions

**What hurt:**

- Some configuration details were hard to capture; some got lost
- Feedback cycles are longer (can't SSH in and make live changes)
- Reproducing containers from scratch is hard when the original setup was never documented
- Had to reverse-engineer running state for many services
- Still uncovering gaps from the initial audit

**What worked:**

- One container at a time — don't batch migrate
- Plan phase per container when using Claude Code
- Wave-based approach (stateless pilot first, stateful/critical last)
- Never destroy old container until new one is verified for 24-48h

**The honest take:** "Some stuff will get lost. Find it when services break and document it in code this time. It's a process, not a switch."

---

## Proposed Title (Joe's Voice)

"Two Weeks, 60 Containers, and the End of My Click-Ops Era"

Alternatives:

- "I Codified My Entire Proxmox Homelab in Two Weeks and Only Cried Once"
- "40 Containers Were Breaking Daily Until I Finally Gave Up on Click-Ops"

---

## Category, Length, Audience

- **Category:** Homelab
- **Audience:** Homelabbers already running Proxmox who are considering IaC
- **Estimated length:** Long (2500-3500 words)

---

## Architecture to Cover

- **MinIO state backend** (not Terraform Cloud): self-hosted, free, already in the lab as CT 202
- **Reusable module**: `modules/proxmox-lxc/` for consistent Debian 12 baseline — write once, call 60 times
- **provision.sh.tpl as source of truth**: everything the container needs in one idempotent bash script
- **Wave-based migration**: stateless services first (Waves 1-3), heavy stateful last (Waves 4-5)
- **Immutability enforcement**: Proxmox `protection` flag + CLAUDE.md rule = no SSH changes to managed containers

Wave structure used:

- Wave 0: MinIO state backend
- Wave 1-3: Stateless/config-heavy/media stack (~35 services)
- Wave 4: Heavy stateful (Tdarr, Paperless, Nextcloud, Immich, Frigate, Ollama, Plex, ~12 services)
- Wave 5: Critical infrastructure (NPM, Authentik, MariaDB, Zigbee2MQTT, PBS, ~8 services)

---

## Pain Points (Most Engaging Content)

1. **The macOS `mktemp` bug** — juiciest one. `mktemp /tmp/provision-XXXXXX.sh` on macOS doesn't randomize when there's a suffix. Second run creates the file literally as `/tmp/provision-XXXXXX.sh`. SSH with no stdin returns 0 instantly. `tofu apply` completes in exactly 20 seconds (the sleep timer), no provisioning happened, all output suppressed. Took real time to debug. Fix: use bare `mktemp` with no path argument.

2. **Idempotency is harder than it sounds**: provision scripts run again whenever content changes. `apt-get install` without `-y` hangs interactively. Every step needs a guard or must be genuinely safe to repeat.

3. **Output suppression when sensitive values in local-exec**: if the provision script contains an API token, OpenTofu hides ALL output. Flying blind — have to SSH and check `journalctl` to debug.

4. **Stateful services are risky to re-provision**: databases, Nextcloud, Immich — a careless script change + `tofu apply` could wipe data. Required careful design.

5. **Stale state lock**: if `tofu apply` dies mid-run (Ctrl-C, network drop), MinIO holds the lock. Fix: `tofu force-unlock -force <lock-id>`.

6. **`${...}` in heredocs inside provision scripts**: configs that use their own `${...}` (Prometheus, systemd) need `$${...}` to escape through OpenTofu's template engine.

---

## Results / Benefits

- Troubleshooting is easier — guaranteed to understand container state
- Less surprised by issues one week in
- Git history IS the audit trail: `git log opentofu/services/sonarr/` shows every change
- Any container rebuilds from `tofu apply` in minutes
- New services take ~30 minutes to add
- Observability baked in: every container gets Prometheus node-exporter + Promtail automatically
- **Novel angle:** LLM coding agents can read provision scripts to troubleshoot containers without needing SSH

---

## Practical Recommendations (End of Post)

Joe's hard-won advice:

1. **Do the audit first.** Build health checks or document what each container does _before_ touching OpenTofu. The gaps will change your migration order.
2. **One container at a time.** Don't batch migrate. Go one by one, verify, move on.
3. **Use a plan phase for each container** (especially with Claude Code). Treat each migration as its own mini-project.
4. **Make an onboarding document** covering what "migrated" means: OpenTofu provisioned, static IP, reverse proxy, auth, monitoring, health check, backups, docs. Joe's checklist: `.claude/skills/service-onboarding/SKILL.md`
5. **The feedback cycle is longer. Accept it.** You'll miss `apt-get install` + done. But you won't miss not knowing what you did to a container 8 months ago.
6. **Some stuff will get lost.** Config that was never written down won't survive the migration. Find it when services break, document it in code.

---

## Competitive Landscape

**What's saturated:**

- "Deploy your first VM with OpenTofu on Proxmox" — everywhere
- Terraform vs OpenTofu licensing debate — exhaustively covered
- Three-tool stack tutorials (Packer + OpenTofu + Ansible) — the canonical homelab IaC narrative
- Kubernetes on Proxmox with IaC (Talos + OpenTofu)

**What's missing from the space (our angle):**

- **Migration from existing setup** — almost everything is "build from scratch." Stories about retrofitting IaC onto a running 60+ container homelab barely exist.
- **Honest retrospectives** — most posts are success narratives. "Some config got lost," "feedback cycles are longer," "still finding gaps" is what homelabbers in the middle of this actually need.
- **Audit-before-migration** — nobody talks about building health checks to understand what you have _before_ codifying it.
- **LLM agents + IaC** — genuinely novel, not found in existing content.

**Closest competitor:** "Over engineering my homelab so I don't pay cloud providers" (ergaster.org, Aug 2025) — personal narrative, OpenTofu, honest voice. But no migration story, no existing-chaos context.

---

## SEO Targets

- **Primary:** "OpenTofu Proxmox homelab"
- **Secondary:** "infrastructure as code homelab", "Proxmox IaC migration"
- **Long-tail:** "migrate existing Proxmox containers OpenTofu"

Use primary keyword in: title, slug, meta description, first paragraph, at least one H2.

---

## Internal Links to Find

Search joekarlsson.com for posts related to: homelab, self-hosting, Proxmox, monitoring, home server. Link naturally from 2-3 relevant sections.

---

## Source Material (Local Files)

- Migration plan: `/Users/joe/claude/opentofu/MIGRATION_PLAN.md`
- Gotchas/lessons: `/Users/joe/claude/opentofu/README.md` (lines 667-850)
- Health check scripts: `/Users/joe/claude/domains/proxmox/scripts/health-checks/`
- Service onboarding checklist: `/Users/joe/claude/.claude/skills/service-onboarding/SKILL.md`
- Proxmox domain notes: `/Users/joe/claude/domains/proxmox/CLAUDE.md`
