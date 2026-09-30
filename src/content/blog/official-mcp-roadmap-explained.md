---
title: 'The Official MCP Roadmap: What Enterprise Teams Need to Plan for'
date: 2026-09-14
slug: 'official-mcp-roadmap-explained'
description: "The official MCP roadmap (Aug 22, 2026) maps five priorities. Here's what each means if you operate MCP servers, and what the spec still won't fix for you."
categories: ['Dev Tools']
tags: ['mcp', 'ai', 'enterprise', 'protocol', 'cdata']
heroImage: '/images/blog/official-mcp-roadmap-explained/hero-2.webp'
heroAlt: 'Illustration of a timeline with one highlighted milestone under the MCP logo'
canonicalUrl: 'https://www.cdata.com/blog/official-mcp-roadmap-explained'
faq:
  - question: 'What does the official MCP roadmap commit to?'
    answer: 'Five priority areas for the next spec release and beyond. No target dates, no version numbers. The priorities are: agentic messaging primitives, HTTP-native transport unification and hardening, agent identity and enterprise-ready security, improved primitives (tool result contracts and progressive discovery), and improved SDK developer experience (roadmap). "Commit to" is the right framing: these are the things the maintainers have said they''ll work on, not the things they''ve shipped.'
  - question: 'Does Priority 3 solve enterprise auth?'
    answer: "Partly. It addresses agent-to-server identity: which workload is calling your MCP server, proven via DPoP (RFC 9449), Workload Identity Federation, and token exchange. It doesn't address server-to-source credentials: the tokens and service accounts each MCP server uses to connect to the data sources behind it. Enterprise deployments have both problems. The roadmap solves one of them."
  - question: 'What is DPoP, and is it a new standard?'
    answer: "No. DPoP (Demonstrating Proof of Possession) has been a finalized IETF standard since September 2023 (RFC 9449). It binds an access token to a specific cryptographic key, so a stolen token can't be replayed by a different client. The roadmap's work is about adopting DPoP in MCP's auth flows, not finishing the RFC itself."
  - question: 'What is progressive discovery, and why does it matter for large tool catalogs?'
    answer: "When a server lists every available tool at connection time, large catalogs fill the model's context budget and degrade tool-selection quality. Progressive discovery lets servers offer a scoped initial catalog and expand it as the conversation narrows, so the model works with a relevant subset rather than the full list (roadmap). If you have a large tool catalog today, you're probably already hand-rolling some version of this. The roadmap is standardizing it."
  - question: 'How do I get a change into the MCP spec?'
    answer: 'File a Specification Enhancement Proposal (SEP) targeting one of the five current priority areas; those get expedited review and the strongest chance of acceptance. Raise it with the relevant Working Group and work with members during development. For earlier-stage ideas, the experimental-ext- repo pattern (SEP-2133) lets you build and test an extension before filing a proposal. Ship a working implementation, then propose it (roadmap).'
  - question: 'Is WIMSE a finished standard?'
    answer: 'No. The Workload Identity in Multi-System Environments working group is active at the IETF with multiple drafts in progress as of September 2026. No finalized RFC has been published. The roadmap describes ongoing engagement with WIMSE as the standards develop, not adoption of a finished spec (IETF WIMSE).'
  - question: 'What changed between the March 2026 and August 2026 roadmaps?'
    answer: 'The March roadmap had four priorities: transport evolution and scalability, agent communication, governance maturation, and enterprise readiness. The August version reorganizes to five, with SDK developer experience elevated to its own area and agent identity given a more specific definition (DPoP, Workload Identity Federation, WIMSE engagement) rather than the broader "enterprise readiness" framing from March (previous roadmap). The substance was there in March; August names it more precisely.'
tldr: 'The Aug. 22, 2026 MCP roadmap lists five priorities: agentic messaging, HTTP-native transport, agent identity and security, better primitives, and SDK developer experience. Agent identity carries the highest migration cost, so audit your auth first. Transport matters if you run stdio servers. The rest is mostly watch-and-wait.'
contentNotice: 'Originally published on the [CData blog](https://www.cdata.com/blog/official-mcp-roadmap-explained).'
---

The model context protocol (MCP) core maintainers published their updated roadmap on Aug. 22, 2026 ([The New MCP Roadmap](https://blog.modelcontextprotocol.io/posts/mcp-roadmap/)). If you're an engineering or AI lead managing MCP servers for a large team or enterprise deployment, this covers what you need to know: what each of the five priorities means in practice, which ones require migration work and which you can safely watch from a distance, and where the gaps stay even after all five ship. One thing to understand upfront, because it shapes every planning call in this post: the agent identity work solves which workload is calling your MCP server, using standards for proving a workload's identity without storing long-lived credentials. It doesn't touch what that server hands to Salesforce, SQL Server, or your data warehouse to open the connection behind it. Two different auth problems; the roadmap picks up one.

**The short version:** The [official MCP roadmap](https://blog.modelcontextprotocol.io/posts/mcp-roadmap/) was published Aug. 22, 2026 by core maintainers David Soria Parra and Den Delimarsky. It covers five priority areas for the next spec release and beyond: (1) agentic messaging primitives, (2) HTTP-native transport unification and hardening, (3) agent identity and enterprise-ready security, (4) improved primitives, (5) improved SDK developer experience. No target dates or version numbers are given for any of them. The current stable release is 2026-07-28.

## Five priorities, ranked by urgency

Not all five priorities are equally urgent, and the roadmap won't tell you which to move on first because giving that guidance isn't its job. Here's my read.

![A 2-by-2 matrix plotting five MCP roadmap priorities by migration cost (x-axis, Low to High) and urgency (y-axis, Watch to Act now). Priority 3, Agent identity and security, sits in the high-cost, act-now quadrant and is highlighted in yellow as the most urgent item requiring immediate attention. Priorities 2 (Transport unification) and 4 (Improved primitives) are center-right and above the midline. Priority 1 (Agentic messaging) and Priority 5 (SDK developer experience) are low-cost items in the watch zone. A callout in the bottom-right notes that Stateless core, Tasks extension, and MRTR already shipped on 2026-07-28 and are not plotted as open priorities.](/images/blog/official-mcp-roadmap-explained/mcproadmap1.webp)

<!-- vale JoeKarlsson.BannedWords = NO -->

| **Priority area**              | **Migration cost** | **What I'd actually do**                                                                                                                                                                                                                                                         |
| ------------------------------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3: Agent identity and security | High               | Audit your current auth flows for browser-based OAuth and bare bearer tokens (tokens that grant access to whoever holds them, with no proof of who's presenting them) in machine-to-machine contexts. This is the work that has a clear destination; start moving toward it now. |
| 2: HTTP-native transport       | Medium             | If you're already on Streamable HTTP for remote, this only touches your local setup. If you're still on stdio plus the deprecated SSE transport, plan a second migration.                                                                                                        |
| 4: Improved primitives         | Medium             | Tool result contracts are changing. Design your large tool catalogs for progressive discovery now; retrofitting it later is real work.                                                                                                                                           |
| 1: Agentic messaging           | Low                | Nothing to migrate. The design decision is whether to build a non-standard event delivery layer now or wait for the spec to land. My answer is wait.                                                                                                                             |
| 5: SDK developer experience    | Low                | Watch for the conformance testing harness and update your CI when it ships. Nothing else to do.                                                                                                                                                                                  |

<!-- vale JoeKarlsson.BannedWords = YES -->

## What already shipped

The [2026-07-28 MCP release](https://www.cdata.com/blog/mcp-2026-07-28-release/) covers these in full. I'm not going to restate it here; read [that post](https://www.cdata.com/blog/mcp-2026-07-28-release/) if you want the mechanics. The short version of what's already in production:

Stateless core via [SEP-2575](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2575) and SEP-2567: no more server-pinned sessions. server/discover for upfront capability discovery. Cacheable list results (SEP-2549) with TTL metadata. Tasks as a first-class extension ([SEP-2663](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2663)). Multi Round-Trip Requests ([SEP-2322](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2322)) for server-initiated patterns without held SSE connections. Client ID Metadata Documents and Enterprise-Managed Authorization for corporate identity provider integration.

The five roadmap priorities are what comes after all of that. None of them are already shipped.

## Priority 3: Agent identity and enterprise-ready security

I'm going to start here instead of with Priority 1, because this is where the actual urgency is.

The problem the roadmap is solving in Priority 3 is a real one. Browser-based OAuth flows don't map onto machine-to-machine calls. When an agent calls your MCP server with no human in the loop, the question "which workload is this" shouldn't be answered by a flow that was designed for a person clicking through a consent screen. The roadmap's answer: Demonstrating Proof of Possession (DPoP) ([RFC 9449, finalized by the IETF in September 2023](https://www.rfc-editor.org/rfc/rfc9449)), Workload Identity Federation, and standard token exchange pathways.

Let me be specific about what these actually do, because "identity standards" is easy to wave past.

DPoP binds a token to a specific cryptographic key. If someone extracts the token, they can't use it from a different client, because they don't have the key. That's a meaningful security improvement over bare bearer tokens, which are effectively cash: whoever holds them can spend them. Workload Identity Federation replaces stored service account credentials with short-lived tokens issued by a trusted platform (your cloud provider, Kubernetes, whatever trust anchor you're using). Nothing sensitive needs to be stored or rotated manually. Token exchange (RFC 8693) gives a service a path to swap one token type for another without re-authenticating: an agent holds a user token, needs a scoped service token to call a downstream system, and can exchange without starting over. The Core Maintainers are also engaging directly with the IETF OAuth working group and WIMSE (Workload Identity in Multi-System Environments), an active working group with no finalized RFC as of September 2026.

This is worth doing. It addresses real risks: the access control gaps and token security weaknesses that the [NSA's advisory on enterprise MCP security](https://media.defense.gov/2026/Jun/02/2003943289/-1/-1/0/CSI_MCP_SECURITY.PDF) catalogued earlier this year.

![Diagram showing two auth boundaries in an MCP deployment. On the left, a navy dashed line marks the agent-to-server identity boundary, labeled "Covered by roadmap," with DPoP, Workload Identity Federation, and token exchange listed below. On the right, a gray dashed line with a lock icon marks the server-to-source credentials boundary, labeled "Not in roadmap," with OAuth tokens, service accounts, and API keys listed below. An AI Agent box connects through the first boundary to an MCP Server, which fans out through the second boundary to Salesforce, SQL Server, an on-premises database, and a REST API.](/images/blog/official-mcp-roadmap-explained/mcproadmap2.webp)

### What the priority doesn't address

The agent-to-server trust problem is not the same as the server-to-source trust problem. DPoP tells your MCP server which workload is calling it. It doesn't tell Salesforce, SQL Server, or NetSuite anything. The credential your server uses to open the source connection is a separate thing: a per-connector OAuth token, a service account key, an API key. Each source system has its own auth model. The roadmap has no opinion on this. Enterprise teams hit this problem consistently when putting MCP into production, because authentication against real systems is where the friction is, and it's the thing you have to solve for each source individually.

If you're building this yourself, you're looking at two parallel workstreams. The agent-to-server work has a clear spec destination: DPoP adoption and Workload Identity Federation, when SDK support arrives. The server-to-source work is yours regardless of what the roadmap ships, and it's the harder one to standardize because every source is different. For the current state of the latter, the [enterprise MCP security playbook](https://www.cdata.com/blog/enterprise-mcp-security-playbook/) covers what you can do today.

CData Connect AI is built specifically for the server-to-source side: you register each source credential once, Connect AI applies the requesting user's own source-system permissions at query time, and logs every query. When the Priority 3 work lands, it slots on top of that layer rather than replacing it.

## Priority 2: HTTP-native transport unification and hardening

This one's a migration, and understanding what you're migrating is important.

Streamable HTTP is a standard HTTP-based transport that lets a server stream events back to a client without holding a persistent connection open. It's already the standard for remote MCP servers since the 2026-07-28 release. stdio (which pipes communication through process standard input and output) has always been the local server transport: it's simple, works well for local dev, and doesn't translate to remote deployment. The older SSE transport is deprecated.

What Priority 2 does: it extends Streamable HTTP to local servers as well, so there's one transport instead of two. What you run locally behaves the same as what you run in production. For teams running a centralized MCP gateway, [what an MCP gateway governs that an API gateway can't](https://www.cdata.com/blog/mcp-gateway-vs-api-gateway/) covers why unified HTTP transport changes the governance equation.

<!-- vale JoeKarlsson.BannedWords = NO -->

If your remote server is already on Streamable HTTP: nothing changes for that. The work is on the local side. If you're running stdio plus the deprecated SSE locally (the pre-07-28 pattern), you've already migrated once. This is the second step. The practical question is whether your local setup (test harnesses, SDK versions, any stdio wrappers) can run Streamable HTTP, or whether you need a compatibility shim while SDK support catches up.

<!-- vale JoeKarlsson.BannedWords = YES -->

## Priority 4: Improved primitives

Two separate things under one label, and they have different planning implications.

**Tool result contracts.** Right now, a tools/call response can return the same output in more than one form, and there's no standard for which form a client will surface to the model. Tool authors write defensively, clients handle results inconsistently, models see more variation than they should. The fix: standardize the contract. The planning question is whether to align your tool responses with the spec's direction now or wait for the final definition. My honest answer: if you're building new tools today, orient toward what's coming. If you have a large existing tool catalog, don't refactor proactively; wait until you know what the spec actually requires.

**Progressive discovery.** Serving a client every available tool at connection time works fine at small scale. At large scale it doesn't: context budget fills, the model's ability to select the right tool degrades. The spec's answer is progressive discovery (servers offer an entry-level catalog and expand it as the conversation narrows, keeping the active tool set small and relevant). If you have a large tool catalog today, you're probably already hand-rolling some version of this. The roadmap is standardizing what teams have been building anyway.

The design decision here has timing embedded in it: retrofitting progressive discovery onto a large catalog is more expensive than designing for it upfront.

## Priority 1: Agentic messaging primitives

The protocol today is request-response: a client asks, a server answers. Agentic workflows increasingly want the reverse: a server that can push, not just respond. A job finishes, a threshold crosses, upstream data changes. Today's coverage is partial: subscriptions/listen (MCP's existing mechanism for a client to subscribe to resource changes) and progress notifications give you something, but not a standard event delivery model.

The roadmap extends this into server-initiated events, webhooks, and channels, with the Agents, Transports, and Triggers and Events Working Groups leading the design.

Here's my read: there's nothing to migrate here. The question is architectural. If your MCP server needs to push events today, you're choosing between polling, a held SSE connection, or a hand-rolled webhook. The roadmap is standardizing the webhook pattern. My strong recommendation: if you're building internal tooling that only your clients will ever use, do whatever works. If you're building anything you expect to be client-agnostic, wait for the Working Groups to finalize the design before committing to a non-standard event delivery layer. The migration cost if you don't wait could be real.

## Priority 5: Improved SDK developer experience

Conformance testing at the spec level, better documentation, and SDK ergonomics. The maintainers note this grows in importance as developers use agents to write MCP code rather than writing it directly.

My interest in this is the conformance testing specifically. If you've written your own test coverage for spec compliance (and you should have), you've tested against your interpretation of the spec, not the spec itself. Spec-level conformance testing gives you a check on edge cases you may have missed, and for teams adopting at scale, it's a forcing function toward consistent behavior. Servers that pass the same conformance suite are less likely to produce the subtle incompatibilities that break client-server pairs in production.

<!-- vale JoeKarlsson.BannedWords = NO -->

Nothing to migrate. Watch for the test harness, integrate it into your CI when it ships, call it done.

<!-- vale JoeKarlsson.BannedWords = YES -->

## The bigger picture: what this roadmap won't fix

The analysis I want to leave you with is the one I started with: the roadmap solves one of two trust problems in enterprise MCP. DPoP, Workload Identity Federation, and standard token exchange are a solid answer to agent-to-server identity. They're not a solid answer to the following:

**Source credentials.** DPoP tells your MCP server which agent is calling it. It doesn't tell Salesforce, SQL Server, or your on-premises data warehouse to trust that agent's identity. The credential your server uses to open the source connection is yours to manage for each source, individually, per their own auth model.

**Per-user authorization inside the source.** Whether the data an agent retrieves honors what the requesting user can actually see in the source system is a governance question that lives above the protocol. Source-system RBAC doesn't flow through an MCP server unless someone built that enforcement. The spec doesn't build it for you.

**Audit logging.** Whether you can reconstruct what an agent queried, on whose behalf, and when. In practice, enterprise teams evaluate deployment model and data residency before they evaluate logging coverage. Logging becomes the question in the security review that follows first deployment. If you're doing that review now, query audit logging is the gap to close before the roadmap's identity work gives you a cleaner picture of who called what.

These aren't criticisms of the roadmap. They're the engineering work that was always on your side of the boundary. The [enterprise MCP deployment guide](https://www.cdata.com/blog/enterprise-mcp-deployment-guide/) covers this operational layer for teams who need to address it today. What the roadmap is doing is moving the agent-to-server boundary closer to where server-to-source already had to be. That makes the gap more visible, not larger.

## Connect your MCP servers to enterprise data with governance built in

The roadmap's direction is clear: MCP is getting the identity and primitive infrastructure that production systems need. The three gaps that stay (source credentials, per-user authorization, query audit logging) require a governance layer above the protocol.

CData Connect AI is that layer for enterprise data. Your AI agents query [hundreds of enterprise data sources](https://cloud.cdata.com/) through one managed layer. You register each source credential once, Connect AI enforces each user's existing source-system permissions at query time, and logs every query. The agent-to-server identity work the roadmap is standardizing slots on top of it. Follow the [Connect AI quick start](https://docs.cloud.cdata.com/en/Quick-Start-Guide?utm_source=cdata-blog&utm_medium=cta&utm_campaign=mcp&utm_content=official-mcp-roadmap-explained) to connect a source and see what governed MCP access looks like from a client.

## Frequently asked questions

**What does the official MCP roadmap commit to?**

Five priority areas for the next spec release and beyond. No target dates, no version numbers. The priorities are: agentic messaging primitives, HTTP-native transport unification and hardening, agent identity and enterprise-ready security, improved primitives (tool result contracts and progressive discovery), and improved SDK developer experience ([roadmap](https://blog.modelcontextprotocol.io/posts/mcp-roadmap/)). "Commit to" is the right framing: these are the things the maintainers have said they'll work on, not the things they've shipped.

**Does Priority 3 solve enterprise auth?**

Partly. It addresses agent-to-server identity: which workload is calling your MCP server, proven via DPoP ([RFC 9449](https://www.rfc-editor.org/rfc/rfc9449)), Workload Identity Federation, and token exchange. It doesn't address server-to-source credentials: the tokens and service accounts each MCP server uses to connect to the data sources behind it. Enterprise deployments have both problems. The roadmap solves one of them.

**What is DPoP, and is it a new standard?**

No. DPoP (Demonstrating Proof of Possession) has been a finalized IETF standard since September 2023 ([RFC 9449](https://www.rfc-editor.org/rfc/rfc9449)). It binds an access token to a specific cryptographic key, so a stolen token can't be replayed by a different client. The roadmap's work is about adopting DPoP in MCP's auth flows, not finishing the RFC itself.

**What is progressive discovery, and why does it matter for large tool catalogs?**

When a server lists every available tool at connection time, large catalogs fill the model's context budget and degrade tool-selection quality. Progressive discovery lets servers offer a scoped initial catalog and expand it as the conversation narrows, so the model works with a relevant subset rather than the full list ([roadmap](https://blog.modelcontextprotocol.io/posts/mcp-roadmap/)). If you have a large tool catalog today, you're probably already hand-rolling some version of this. The roadmap is standardizing it.

**How do I get a change into the MCP spec?**

File a Specification Enhancement Proposal (SEP) targeting one of the five current priority areas; those get expedited review and the strongest chance of acceptance. Raise it with the relevant Working Group and work with members during development. For earlier-stage ideas, the experimental-ext- repo pattern ([SEP-2133](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2133)) lets you build and test an extension before filing a proposal. Ship a working implementation, then propose it ([roadmap](https://blog.modelcontextprotocol.io/posts/mcp-roadmap/)).

**Is WIMSE a finished standard?**

No. The Workload Identity in Multi-System Environments working group is active at the IETF with multiple drafts in progress as of September 2026. No finalized RFC has been published. The roadmap describes ongoing engagement with WIMSE as the standards develop, not adoption of a finished spec ([IETF WIMSE](https://datatracker.ietf.org/wg/wimse/about/)).

**What changed between the March 2026 and August 2026 roadmaps?**

The March roadmap had four priorities: transport evolution and scalability, agent communication, governance maturation, and enterprise readiness. The August version reorganizes to five, with SDK developer experience elevated to its own area and agent identity given a more specific definition (DPoP, Workload Identity Federation, WIMSE engagement) rather than the broader "enterprise readiness" framing from March ([previous roadmap](https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)). The substance was there in March; August names it more precisely.

## References

1. Model Context Protocol. [The New MCP Roadmap](https://blog.modelcontextprotocol.io/posts/mcp-roadmap/). Aug. 22, 2026.
2. Model Context Protocol. [The 2026 MCP Roadmap](https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/). March 9, 2026.
3. Model Context Protocol. [The 2026-07-28 Specification Release Candidate](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/).
4. [RFC 9449: OAuth 2.0 Demonstrating Proof of Possession (DPoP)](https://www.rfc-editor.org/rfc/rfc9449). September 2023.
5. [IETF WIMSE](https://datatracker.ietf.org/wg/wimse/about/) Working Group. [Workload Identity in Multi-System Environments](https://datatracker.ietf.org/wg/wimse/about/).
6. Model Context Protocol. [SEP-2663: Tasks Extension](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2663).
7. Model Context Protocol. [SEP-2322: Multi Round-Trip Requests](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2322).
8. [SEP-2133: Extensions Framework](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2133).
9. [The 2026-07-28 MCP Release Explained: What It Means for Enterprise Teams](https://www.cdata.com/blog/mcp-2026-07-28-release/).
10. [RFC 8693: OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693).
