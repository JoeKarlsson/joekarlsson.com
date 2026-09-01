---
title: 'The 2026-07-28 MCP Release Explained: What It Means for Enterprise Teams'
date: 2026-07-28
slug: 'mcp-2026-07-28-release-explained'
description: "The MCP 2026-07-28 release makes the protocol stateless, adds an extensions framework, and hardens authorization. Here's what each change actually means for teams running MCP in production."
categories: ['Dev Tools']
tags: ['mcp', 'ai', 'enterprise', 'protocol', 'cdata']
heroImage: '/images/blog/mcp-2026-07-28-release-explained/hero.webp'
heroAlt: 'The 2026-07-28 MCP Release Explained'
canonicalUrl: 'https://www.cdata.com/blog/mcp-2026-07-28-release'
contentNotice: 'Originally published on the [CData blog](https://www.cdata.com/blog/mcp-2026-07-28-release).'
tldr: 'Stateless protocol, formal extensions (MCP Apps + Tasks), stricter auth validation, full JSON Schema 2020-12. The big one is stateless - it finally makes MCP servers deployable like normal web services. Roots, Sampling, and Logging start deprecation with a ~12-month runway.'
---

The Model Context Protocol just shipped its largest revision since launch.

The 2026-07-28 release touches transport, extensions, authorization, and tool definitions in ways that matter a lot if you're running MCP in a production environment - and matter less if you're still experimenting locally. Let me break down what actually changed and why it matters.

## The protocol goes stateless

This is the big one.

Before this release, MCP had server-pinned sessions. Your client connected to a specific server instance and stayed there. That's fine for a local dev tool. It's a production nightmare for anything running at scale behind a load balancer.

The 2026-07-28 release makes each request self-contained - it carries everything the server needs to process it. Any instance can handle any request. This eliminates the Server-Sent Events limitations from the old model and means you can run MCP servers like normal stateless web services with standard failover and horizontal scaling.

If you've been holding back on MCP for production because of the session-pinning problem, this is the release you've been waiting for.

## A formal extensions framework

The original MCP spec bundled everything together: tool calls, sessions, UI primitives, task management, discovery - one monolithic spec. This release breaks that apart.

![Diagram showing MCP's 2026-07-28 restructuring: a single monolithic spec splits into a stateless protocol core with independently versioned, opt-in extension modules including MCP Apps and Tasks](/images/blog/mcp-2026-07-28-release-explained/mcp-extension-diagram.webp)

The new model has a small stateless core (tool calls + discovery, no server-pinned sessions) and independently versioned opt-in extension modules. The first two official extensions:

**MCP Apps** - sandboxed interfaces that render alongside tool results. Think structured UI that appears in the tool call response without requiring the client to implement custom rendering for every tool.

**Tasks** - long-running operations with ticket-based tracking. You kick off a task, get a ticket, and fetch the result when it's ready. This is the "call-now/fetch-later" pattern that agentic workflows actually need.

Organizations can adopt extensions independently. You don't have to implement Tasks just because you're implementing MCP Apps.

## Authorization gets stricter

The auth changes mostly hit the client side. Clients now verify token provenance through stricter discovery and verification processes aligned with RFC 9728 and RFC 9207.

In practice: if you're building an MCP client, you'll need to update how you validate tokens. If you're building an MCP server, less changes - you're still issuing tokens the same way.

This is the spec catching up to what serious deployments already needed. The governance and access control story for enterprise MCP has been thin; tightening auth is a necessary step.

## Tool schemas get more expressive

Tool definitions now support the full JSON Schema 2020-12 standard rather than a subset of it. This matters for two reasons.

First, you can define inputs and outputs more precisely - fewer ambiguous tool calls, better error messages when something's malformed. Second, you can express tighter security boundaries around what an agent is allowed to do with a given tool. Both are things production deployments actually need.

## What's getting deprecated

Roots, Sampling, and Logging start their deprecation clock with this release. Approximately 12-month runway before removal. If your implementation depends on any of these, start the migration planning now - don't wait until month 11.

## The honest enterprise context

Gartner's projection is that more than 40% of agentic AI projects will be canceled by end of 2027. The reason is usually not the AI itself - it's governance, access control, and auditability. Organizations can't get production sign-off on systems they can't audit.

This release is the spec acknowledging that reality. Stateless deployments, proper auth, formal extensions, expressive schemas - these aren't features for demos. They're the things you need to get MCP past your security team.

If you're planning MCP for production, the main action items from this release:

- Start designing for stateless - externalize any session state your current implementation keeps server-side
- Build toward the extension model rather than monolithic implementations
- Update client-side token validation to meet the new auth requirements as SDK support matures
- Plan migrations off Roots/Sampling/Logging if you use them

The protocol is maturing in the direction production needs it to go. That's worth paying attention to.
