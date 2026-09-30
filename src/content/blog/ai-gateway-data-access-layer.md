---
title: "Enterprise Data Access for AI Agents: What Model Routing Doesn't Cover"
date: 2026-09-28
slug: 'ai-gateway-data-access-layer'
description: "Enterprise data access for AI agents is the part of the AI gateway stack most teams haven't built yet. Here's what it handles and why it matters now."
categories: ['Dev Tools']
tags: ['mcp', 'ai', 'enterprise', 'ai-agents', 'cdata']
heroImage: '/images/blog/ai-gateway-data-access-layer/hero.webp'
heroAlt: 'Diagram of an AI chip separated from a database server by a gateway boundary'
canonicalUrl: 'https://www.cdata.com/blog/ai-gateway-data-access-layer'
faq:
  - question: 'Is an AI data gateway the same as an AI gateway?'
    answer: 'No, though the terms overlap. An AI gateway is the broader category: the control layer between AI consumers and the models, tools, and data they use. An AI data gateway refers specifically to the data-access layer: the infrastructure that governs how AI agents retrieve data from enterprise systems, resolves schema and business context, and enforces source-system permissions. A complete AI gateway stack needs both layers. See what an AI gateway does for the full category definition.'
  - question: 'When do you need both the model-routing layer and the data-access layer?'
    answer: "The model-routing layer becomes necessary when you're working with more than one LLM provider, or when you need cost controls, failover, and unified audit logs for model traffic. The data-access layer becomes necessary when your agents need to retrieve live data from enterprise systems and that access needs to be governed, scoped to user permissions, and auditable. In practice, both become relevant as soon as an AI project moves from prototype to production."
  - question: 'Can my existing model-routing gateway handle enterprise data access?'
    answer: "No. Model-routing gateways (LiteLLM, Cloudflare AI Gateway, Portkey/Prisma AIRS) operate at the model boundary: they route requests, manage rate limits, and track token spend. They don't resolve enterprise data schemas, carry source-system permissions through to queries, or produce per-query data logs. The two layers operate at different points in the request lifecycle. A complete enterprise AI stack needs both."
  - question: 'What does the data-access layer log?'
    answer: 'A data-access layer logs the agent identity, the data source queried, the timestamp, and the fields returned. This is distinct from a routing gateway''s log (model, token count, latency, and cost). The data-access log answers "what did the AI see?" The routing log answers "what did the AI cost?" In regulated environments, both logs matter and neither substitutes for the other.'
  - question: 'What is the N times M integration problem in AI?'
    answer: 'The N times M integration problem is the engineering cost that arises when N agents and M data sources have no shared integration layer. Each agent-source pair requires its own custom connector. N agents times M sources equals N times M integrations. Each is hand-built. Each breaks when the upstream API changes. The engineering cost grows proportionally as both N and M increase. A managed data-access layer replaces N times M custom integrations with one governed connection per source.'
  - question: 'How does MCP fit into the data-access layer?'
    answer: "Model Context Protocol (MCP) is the transport standard for agent-to-tool communication: it standardizes how an agent makes a tool call and receives a response. What it doesn't standardize is the resolution logic inside the tool, including the auth flow, schema mapping, permission enforcement, and rate-limit handling that vary by data source. The data-access layer sits inside the MCP tool call. The agent calls the tool via MCP; the data-access layer translates that into a credentialed, permission-scoped, schema-resolved query against the source."
  - question: 'Does the EU AI Act require a data-access audit log?'
    answer: "Not as a single explicit article, but two EU provisions together create a strong compliance case for one. GDPR Article 30 requires records of processing activities when personal data is involved, which covers AI queries against CRM or HR systems. EU AI Act Article 26(6) requires deployers of high-risk AI systems to retain operational logs to the extent practicable. Note that EU AI Act Article 50 governs end-user disclosure (chatbot labeling, synthetic content marking) rather than data-access audit requirements. The data-access question (which agent accessed which source under what authority) is answered by GDPR Article 30 and Article 26(6). A routing log (which model, which tokens) doesn't address either provision. A data-access log does."
tldr: 'Model routing is a solved, cheap layer. Getting agents to query enterprise systems with the right permissions, business meaning, and an audit trail is not, and that cost grows with every agent and source you add. GDPR Article 30 and EU AI Act Article 26(6) put the logging obligation at the data layer.'
contentNotice: 'Originally published on the [CData blog](https://www.cdata.com/blog/ai-gateway-data-access-layer).'
---

You've got model routing sorted. A routing layer, a config file, one endpoint: the model underneath your application is a runtime variable. That part's relatively easy.

The part that isn't: getting your AI agent to reliably query your CRM, your data warehouse, your ERP, and a dozen other systems, scoped to what the requesting user is allowed to see, returning data that means something, and leaving an audit trail of what got accessed.

This post covers the difference between those two problems, why they have completely different architectures, and what a data-access layer needs to handle.

### At a glance

**The two layers:** Model routing (the top layer) sits between your application and your LLM providers and handles routing, fallback, rate limits, caching, observability, and key management. Enterprise data access (the bottom layer) sits between AI agents and the business systems they need to reach: [Salesforce](https://docs.cloud.cdata.com/en/Data-Sources/Salesforce), [SAP HANA](https://docs.cloud.cdata.com/en/Data-Sources/SAPHANA), [Snowflake](https://docs.cloud.cdata.com/en/Data-Sources/Snowflake), [PostgreSQL](https://docs.cloud.cdata.com/en/Data-Sources/PostgreSQL), [HubSpot](https://docs.cloud.cdata.com/en/Data-Sources/HubSpot), [NetSuite](https://docs.cloud.cdata.com/en/Data-Sources/NetSuite), and hundreds more.

**Where the market stands:** Palo Alto Networks completed the Portkey acquisition on May 29, 2026, absorbing it into Prisma AIRS. Open-source models held a 60/40 global token-share lead over proprietary models by mid-June 2026 (per [dirac.run analytics](https://dirac.run/labs-market-share), which tracks LLM API traffic across providers). Model routing is settled. Enterprise data access is not.

**What the data-access layer handles:** Schema resolution (what field values mean in your organization, not just where they live), permission passthrough from source-system role-based access control, per-query audit logging, and Model Context Protocol (MCP) tool calls from any agent in your fleet.

## How the model-routing layer became infrastructure

The model-routing layer has a clean definition: it sits between your application and your LLM providers and handles routing, fallback, rate limits, caching, observability, and key management. See [what an AI gateway does](https://www.cdata.com/blog/what-is-an-ai-gateway) for the full breakdown. What's worth examining here is how the category moved from a one-person script to [enterprise AI gateway design patterns](https://www.cdata.com/blog/enterprise-ai-gateway-trusted-data) in roughly 18 months.

![An Application box sends requests to an AI Gateway with a deep navy header, a two-pixel yellow accent rule, and sublabels for routes, rate limits, caching, and observability. Three arrows fan out to provider boxes labeled OpenAI, Anthropic, and open-source models.](/images/blog/ai-gateway-data-access-layer/ai-gateway-model-routing-layer.webp)

_The model-routing layer. One endpoint for your application, multiple providers behind it._

The OpenAI API became a de facto compatibility standard. LiteLLM wraps every major model provider behind a single endpoint. Cloudflare AI Gateway offers the same routing on a free tier. The model underneath your application became a config value, not a code change.

Open-source models became competitive at the same time. Per [dirac.run analytics](https://dirac.run/labs-market-share), proprietary models held a 60/40 lead in global token share in March 2026. By mid-June, that reversed: open-source models including DeepSeek and Mistral held the 60/40 lead, across roughly 6 trillion tokens a day. The [66x price gap between GPT-4o at $10 per million output tokens](https://developers.openai.com/api/docs/pricing) and [Ministral 8B at $0.15 per million](https://mistral.ai/pricing/) matters more every month the smaller model closes on benchmarks. A 10-person team routing all requests through a flagship model pays about $36,000 a year in API costs. (Illustrative: 3.6 billion output tokens a year, GPT-4o at $10 per million output tokens, input costs excluded.) With smart routing (70% of requests to cheaper capable models, 30% to the flagship), that drops to around $11,000. For most request classes, output quality is comparable. The config file is the only thing that changes.

![OSS vs Proprietary Token Share chart from dirac.run: open-source models cross above proprietary in mid-June 2026 to hold a 60/40 lead, covering approximately 6 trillion tokens per day](/images/blog/ai-gateway-data-access-layer/proprierty-token-share.webp)

_Open-source token share flipped past proprietary in mid-June 2026. Source:_ [_dirac.run analytics_](https://dirac.run/labs-market-share)_._

Security infrastructure absorbed the category. Palo Alto Networks [announced its intent to acquire Portkey](https://www.paloaltonetworks.com/company/press/2026/palo-alto-networks-to-acquire-portkey-to-secure-the-rise-of-ai-agents) on April 30, 2026, and completed it May 29. Portkey now ships as the AI gateway component inside Prisma AIRS.

For teams building AI agents today, buying or forking a routing gateway is the first step. The layer had an off-the-shelf answer and a falling cost curve. The question is what didn't get built alongside it.

## Why enterprise data access for AI agents requires a separate layer

When an AI agent needs live business data, routing it to the right model doesn't help. The model needs the data in the first place. For summarizing a pasted document, the routing layer is enough. For questions about business operations (pipeline coverage, accounts at risk, which feature is driving churn), the agent needs to reach the systems that hold the answer. For what goes wrong when it doesn't, see [why routing without context fails](https://www.cdata.com/blog/ai-gateway-context-layer) and [why enterprise AI needs more than a gateway](https://www.cdata.com/blog/enterprises-needs-more-than-gateways).

![A connected top row shows Application, AI Gateway, and LLM Provider, annotated "gateway stops here". A dashed arrow descends labeled "needs data" toward a dashed question-mark box. Below sit five disconnected dashed boxes: Salesforce, Snowflake, SAP, PostgreSQL, and Jira. Footer reads: DATA LAYER: MISSING.](/images/blog/ai-gateway-data-access-layer/ai-gateway-missing-layer.webp)

_The routing gateway stops at the model boundary. Everything below it is unbuilt._

The reason enterprise data access didn't get built like model routing is a missing standard.

The model-routing problem collapsed because the OpenAI API request shape became a de facto compatibility interface. LiteLLM, Cloudflare, and Portkey all implement the same endpoint. N providers became one interface.

Enterprise data has no equivalent. [Model Context Protocol (MCP)](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation), governed by the Linux Foundation's Agentic AI Foundation and counting 13,000+ community servers and 97 million software development kit (SDK) downloads per month as of March 2026, standardizes the transport between an agent and a tool. What it doesn't standardize is what happens inside the tool when it needs to reach [Salesforce](https://docs.cloud.cdata.com/en/Data-Sources/Salesforce), [SAP HANA](https://docs.cloud.cdata.com/en/Data-Sources/SAPHANA), [Snowflake](https://docs.cloud.cdata.com/en/Data-Sources/Snowflake), [HubSpot](https://docs.cloud.cdata.com/en/Data-Sources/HubSpot), or a [PostgreSQL](https://docs.cloud.cdata.com/en/Data-Sources/PostgreSQL) instance.

Each of those sources carries its own:

- Auth flow (OAuth 2.0 with connected-app permission sets for [Salesforce](https://docs.cloud.cdata.com/en/Data-Sources/Salesforce); Security Assertion Markup Language (SAML) with role-based principals for [SAP HANA](https://docs.cloud.cdata.com/en/Data-Sources/SAPHANA); certificate auth for [PostgreSQL](https://docs.cloud.cdata.com/en/Data-Sources/PostgreSQL))
- Schema shape and business semantics (field naming, custom fields like StageName\_\_c in Salesforce or CUSTRECORD\_ in [NetSuite](https://docs.cloud.cdata.com/en/Data-Sources/NetSuite), data types that vary by source)
- Permission model ([Salesforce](https://docs.cloud.cdata.com/en/Data-Sources/Salesforce) permission sets, [Snowflake](https://docs.cloud.cdata.com/en/Data-Sources/Snowflake) grants, [SAP HANA](https://docs.cloud.cdata.com/en/Data-Sources/SAPHANA) authorization objects, each enforced differently)
- Rate-limit behavior (per-minute call ceilings, bulk-API quotas, and concurrency limits, all varying by source and plan tier)
- MCP moves the call to the agent. It doesn't resolve any of these. The integration work lives after the handshake.

This is the N times M problem applied to enterprise data. With N AI agents and M data sources and no shared resolution layer, the result is N times M custom integrations. Each is hand-built. Each breaks when the upstream API changes. [Replicating data into a warehouse or cache](https://www.cdata.com/blog/live-data-access-vs-replicated-ai-agents) doesn't solve it: you trade real-time accuracy for a managed copy, and agents running on stale data answer questions about last week's numbers.

At five agents and 10 data sources, that's 50 integrations. At 20 agents and 30 sources, that's 600. The engineering cost is proportional to the number of sources, and the number of sources only grows.

![Three navy Agent boxes sit across the top; five white data-source boxes (Salesforce, Snowflake, SAP HANA, PostgreSQL, and NetSuite) stack down the left. Every agent connects to every source with a gray crossing line, producing 15 lines total. Caption: 3 agents times 5 sources equals 15 custom integrations; add more agents and it compounds fast.](/images/blog/ai-gateway-data-access-layer/ai-gateway-nm-problem.webp)

_3 agents × 5 sources = 15 custom integrations. The number compounds with every agent and source you add._

Call this the inverted cost curve. The model-routing layer gets cheaper as open-source alternatives become competitive on benchmarks and per-token prices fall. Each new source added to an agent fleet is a new integration event. Each upstream API update is a maintenance event. The data-access layer's cost rises.

That asymmetry is the structural reason most organizations built one layer and not the other: the routing layer had an off-the-shelf answer. The data-access layer didn't. [MCP architecture patterns that address the governance side](https://www.cdata.com/blog/enterprise-mcp-architecture-patterns-for-data-integration) help centralize governance, but they don't remove the per-source integration cost.

![Two-layer architecture diagram. Top row labeled MODEL ROUTING: Application box connects to an AI Gateway (navy, yellow accent) which fans to OpenAI, Anthropic, and open-source models. A horizontal gray line separates the layers. Bottom row labeled ENTERPRISE DATA ACCESS: AI Agent box connects to a Data Gateway labeled CData Connect AI (navy, yellow accent) which fans to Salesforce, SAP HANA, Snowflake, and PostgreSQL.](/images/blog/ai-gateway-data-access-layer/ai-gateway-two-layer-stack.webp)

_The complete two-layer stack. Model routing and enterprise data access operate at different boundaries, have different compliance owners, and have opposite cost curves._

## What the data-access layer handles

A data-access layer (the AI agent data layer between agents and enterprise systems) does four things a routing gateway can't.

### Schema resolution

Enterprise data doesn't arrive pre-labeled for an agent. StageName\_\_c = 'Proposal' is a Salesforce field value. Whether it counts as "in the pipeline" depends on how your sales team defines pipeline, and that definition doesn't live in the field name. It lives in your organization's business logic.

I watched an agent report a pipeline number that was off by a full quarter because it read every opportunity with StageName\_\_c = 'Proposal' as committed pipeline. The sales team counted Proposal as pipeline only after a signed mutual action plan. The schema had no idea. A data-access layer that carries organizational context alongside schema structure returns data an agent can reason with. The same problem appears across [NetSuite](https://docs.cloud.cdata.com/en/Data-Sources/NetSuite) custom record types, [SAP HANA](https://docs.cloud.cdata.com/en/Data-Sources/SAPHANA) client codes, and any ERP where business logic lives in field values, not field names.

![Two-column comparison. Left column "Raw Schema" shows raw Salesforce field data in monospace: cryptic IDs, StageName, Amount, CloseDate, boolean flags; navy footer reads "model has to guess what fields mean". Right column "Semantic Context" shows the same data with clear labels: Account Acme Corp, Deal stage Proposal, Amount $480,000, Expected close September 30 2026, Win probability 65%, Tier Enterprise; yellow footer reads "model answers accurately".](/images/blog/ai-gateway-data-access-layer/ai-gateway-schema-vs-semantic.webp)

_Raw schema vs. semantic context. The data-access layer is what produces the right side._

### Permission passthrough

Source-system access control should carry through to every agent query. If a sales rep doesn't have access to a deal record in Salesforce, the AI assistant helping that rep shouldn't either. Permission passthrough carries existing role-based access control from the source system through to the query, without re-implementing it at the gateway layer.

This applies the same way for [Snowflake](https://docs.cloud.cdata.com/en/Data-Sources/Snowflake) grants, [HubSpot](https://docs.cloud.cdata.com/en/Data-Sources/HubSpot) user permissions, [ServiceNow](https://docs.cloud.cdata.com/en/Data-Sources/ServiceNow) roles, and any other source that carries its own access model. Note the limit: permission passthrough is only as good as the source system's own model. If Salesforce permissions are already too loose, passing them through faithfully passes the problem through too. [Managing data permissions for enterprise AI agents](https://www.cdata.com/blog/managing-data-permissions-enterprise-ai-agents) covers why re-implementation creates drift and why the source-system model remains authoritative.

### Per-query audit logging

A routing gateway logs which model received a prompt, how many tokens it processed, and what the latency was. The data-access layer produces a different record: which agent queried which source, under which identity, at what time, and which fields came back. The model log answers "what did the AI cost?" The data log answers "what did the AI see?" In regulated environments, you need both. Most organizations today have only one.

### MCP-native tool calls

Because the data-access layer speaks MCP natively, agents make standard tool calls. The layer handles protocol translation to each source's native interface. Build the connection once; every MCP-speaking agent in your fleet can use it. This is what distinguishes a managed data-access layer from N times M custom integrations. See [what an MCP gateway does that API gateways cannot](https://www.cdata.com/blog/mcp-gateway-vs-api-gateway) for how the protocol comparison works in practice.

CData Connect AI is a managed data-access layer that handles all four. One governed connection per source, rather than N times M custom integrations, with schema resolution, permission passthrough, and audit logging handled before a row reaches the agent.

## Why compliance obligations land below the model boundary

The EU AI Office's enforcement powers over general-purpose AI model providers took effect August 2, 2026. Those provider-side obligations are not what creates the compliance pressure for enterprises deploying agents. Two other provisions do.

The EU General Data Protection Regulation (GDPR) [Article 30](https://gdpr-info.eu/art-30-gdpr/) requires organizations to maintain records of processing activities when personal data is involved. When an AI agent queries a customer relationship management (CRM) or HR system, that query may constitute processing of personal data, and the record-keeping obligation attaches to the access itself.

[EU AI Act Article 26(6)](https://artificialintelligenceact.eu/article/26/) adds a logging obligation for deployers of high-risk AI systems: they must retain logs of system operation to the extent practicable. For AI agents acting on enterprise data, that's a requirement for audit trails at the data layer, not just at the model layer.

These provisions require an answer to one question: which data did this agent access, from which source, and under whose identity? A routing log can't answer it. A data-access log can, or nothing can. Organizations that built the routing layer and stopped have an observability gap exactly where the obligation sits.

The specific controls that belong at the data-access layer are per-query logs, purpose limitation, and data minimization per source, each mapped to the relevant provision.

## Two scenarios in practice

Here's what the data-access layer handles in a live request.

**The sales assistant scenario.** Consider a sales rep asking an AI assistant: "What's the status on the Acme account?" The agent makes an MCP tool call. The data-access layer runs a credentialed [Salesforce](https://docs.cloud.cdata.com/en/Data-Sources/Salesforce) query scoped to that rep's access level, resolves the relevant fields against the organization's pipeline definitions, and returns structured data the agent can use. The agent never sees raw schema. If the rep doesn't have access to a deal record, neither does the agent. The same pattern applies for a [HubSpot](https://docs.cloud.cdata.com/en/Data-Sources/HubSpot) contact, a [NetSuite](https://docs.cloud.cdata.com/en/Data-Sources/NetSuite) invoice, or a [Snowflake](https://docs.cloud.cdata.com/en/Data-Sources/Snowflake) analytics table: one MCP call, one governed response.

![Left-to-right flow diagram. A Sales Rep asks "What's the status on Acme?" A request arrow leads to an AI Assistant (navy, yellow accent) labeled "understands intent, calls tool". An MCP tool call arrow goes to a Data Gateway labeled "translates intent, scoped credentials, audit log". A query arrow reaches Salesforce; records return. A composed answer flows back to the Sales Rep. A dashed annotation below the Data Gateway reads "rep's access level enforced, every access logged". Footer: answer in approximately 2 seconds, no raw schema exposure, full audit trail.](/images/blog/ai-gateway-data-access-layer/ai-gateway-sales-scenario-flow.webp)

_The full request flow. The data-access layer handles credential scoping, schema resolution, and audit logging. The agent sees structured data, not raw schema._

Without the data-access layer, the agent either receives raw schema and guesses, or it relies on a custom Salesforce integration that someone built and now someone maintains. For teams evaluating [native Salesforce MCP vs. CData Connect AI](https://www.cdata.com/blog/native-salesforce-mcp-vs-cdata-connect-ai-2026), the permission-handling difference is the practical distinction that matters.

**The developer debugging scenario.** Consider a developer paged because customer queries are failing and the cause isn't obvious. The question spans three systems: query logs in [PostgreSQL](https://docs.cloud.cdata.com/en/Data-Sources/PostgreSQL), subscription status in [Salesforce](https://docs.cloud.cdata.com/en/Data-Sources/Salesforce), and error traces in Datadog. Without a data-access layer, answering it requires three separate integrations. With one, the agent makes three governed MCP tool calls under the developer's service-account credentials, gets structured context from each, and surfaces the likely cause. The audit log records all three accesses. None retrieved data beyond what the developer's account permits.

For teams building toward a multi-source agent architecture, a [step-by-step multi-source AI copilot build](https://www.cdata.com/blog/build-ai-copilot-salesforce-netsuite-snowflake) covers the connectivity pattern in detail.

Both scenarios follow the same structure: the routing layer gets the request to the right model; the data-access layer gets the model the data it needs, scoped to what the requesting user is permitted to see.

If you're standing up agents now, build the data-access layer before the second agent, not after the fifth. The integration count is the thing that compounds.

## Connect your enterprise data to any AI agent

CData Connect AI is the data-access layer in this stack. It's a managed MCP platform that connects AI agents to hundreds of enterprise sources, including [Salesforce](https://docs.cloud.cdata.com/en/Data-Sources/Salesforce), [Snowflake](https://docs.cloud.cdata.com/en/Data-Sources/Snowflake), [HubSpot](https://docs.cloud.cdata.com/en/Data-Sources/HubSpot), [NetSuite](https://docs.cloud.cdata.com/en/Data-Sources/NetSuite), [ServiceNow](https://docs.cloud.cdata.com/en/Data-Sources/ServiceNow), [PostgreSQL](https://docs.cloud.cdata.com/en/Data-Sources/PostgreSQL), [MySQL](https://docs.cloud.cdata.com/en/Data-Sources/MySQL), [Google BigQuery](https://docs.cloud.cdata.com/en/Data-Sources/GoogleBigQuery), and SAP HANA, with schema resolution and permission passthrough handled before a row reaches the agent. Every query is logged by agent identity, source, and fields returned, so the Article 30 and Article 26(6) records exist without a separate logging build.

If your agents need to reach enterprise data without building and maintaining custom connectors for each source, [start a free trial of CData Connect AI](https://www.cdata.com/ai/signup/).

## Frequently asked questions

<!-- vale Slop.Assistant = NO -->

**Is an AI data gateway the same as an AI gateway?**

<!-- vale Slop.Assistant = YES -->

No, though the terms overlap. An AI gateway is the broader category: the control layer between AI consumers and the models, tools, and data they use. An AI data gateway refers specifically to the data-access layer: the infrastructure that governs how AI agents retrieve data from enterprise systems, resolves schema and business context, and enforces source-system permissions. A complete AI gateway stack needs both layers. See [what an AI gateway does](https://www.cdata.com/blog/what-is-an-ai-gateway) for the full category definition.

**When do you need both the model-routing layer and the data-access layer?**

<!-- vale Slop.Assistant = NO -->

The model-routing layer becomes necessary when you're working with more than one LLM provider, or when you need cost controls, failover, and unified audit logs for model traffic. The data-access layer becomes necessary when your agents need to retrieve live data from enterprise systems and that access needs to be governed, scoped to user permissions, and auditable. In practice, both become relevant as soon as an AI project moves from prototype to production.

<!-- vale Slop.Assistant = YES -->

**Can my existing model-routing gateway handle enterprise data access?**

No. Model-routing gateways (LiteLLM, Cloudflare AI Gateway, Portkey/Prisma AIRS) operate at the model boundary: they route requests, manage rate limits, and track token spend. They don't resolve enterprise data schemas, carry source-system permissions through to queries, or produce per-query data logs. The two layers operate at different points in the request lifecycle. A complete enterprise AI stack needs both.

**What does the data-access layer log?**

A data-access layer logs the agent identity, the data source queried, the timestamp, and the fields returned. This is distinct from a routing gateway's log (model, token count, latency, and cost). The data-access log answers "what did the AI see?" The routing log answers "what did the AI cost?" In regulated environments, both logs matter and neither substitutes for the other.

**What is the N times M integration problem in AI?**

The N times M integration problem is the engineering cost that arises when N agents and M data sources have no shared integration layer. Each agent-source pair requires its own custom connector. N agents times M sources equals N times M integrations. Each is hand-built. Each breaks when the upstream API changes. The engineering cost grows proportionally as both N and M increase. A managed data-access layer replaces N times M custom integrations with one governed connection per source.

**How does MCP fit into the data-access layer?**

Model Context Protocol (MCP) is the transport standard for agent-to-tool communication: it standardizes how an agent makes a tool call and receives a response. What it doesn't standardize is the resolution logic inside the tool, including the auth flow, schema mapping, permission enforcement, and rate-limit handling that vary by data source. The data-access layer sits inside the MCP tool call. The agent calls the tool via MCP; the data-access layer translates that into a credentialed, permission-scoped, schema-resolved query against the source.

**Does the EU AI Act require a data-access audit log?**

Not as a single explicit article, but two EU provisions together create a strong compliance case for one. GDPR Article 30 requires records of processing activities when personal data is involved, which covers AI queries against CRM or HR systems. EU AI Act Article 26(6) requires deployers of high-risk AI systems to retain operational logs to the extent practicable. Note that EU AI Act Article 50 governs end-user disclosure (chatbot labeling, synthetic content marking) rather than data-access audit requirements. The data-access question (which agent accessed which source under what authority) is answered by GDPR Article 30 and Article 26(6). A routing log (which model, which tokens) doesn't address either provision. A data-access log does.
