---
title: 'LiteLLM or CData Connect AI? Choosing the Right Enterprise AI Gateway in 2026'
date: 2026-09-28
slug: 'litellm-vs-cdata-connect-ai'
description: 'LiteLLM vs enterprise AI gateway, 2026 comparison: MCP governance, data connectivity, and when to use each. For IT admins and AI engineers.'
categories: ['Dev Tools']
tags: ['mcp', 'ai', 'enterprise', 'litellm', 'cdata']
heroImage: '/images/blog/litellm-vs-cdata-connect-ai/hero-2.webp'
heroAlt: 'Illustration of a high-speed train, representing an AI gateway routing traffic'
canonicalUrl: 'https://www.cdata.com/blog/litellm-vs-cdata-connect-ai'
faq:
  - question: 'Is LiteLLM free?'
    answer: 'Partially. The core LiteLLM proxy is open-source under an MIT license and free to use. Enterprise features (SSO with Okta, Microsoft Entra ID, or SAML 2.0; team RBAC; immutable audit logs; support commitments) require a paid subscription with custom pricing. The enterprise/ directory in the repo is under a separate proprietary license.'
  - question: 'Does LiteLLM support MCP servers?'
    answer: "Yes. LiteLLM added MCP gateway support in v1.80.18 (MCP protocol version 2025-11-25). It acts as an MCP proxy: it forwards requests from AI clients to upstream MCP servers you configure, injects credentials at the wire level, and namespaces tools by server. Enterprise features (v1.95 and later) add per-key and per-team MCP entitlement management and dynamic credential renewal. LiteLLM doesn't provide its own enterprise data connectors through MCP. You connect it to whatever MCP servers you operate or build."
  - question: 'What is the difference between an LLM proxy and an enterprise AI gateway?'
    answer: 'An LLM proxy routes traffic between AI applications and model providers. It manages which model handles which request, tracks token usage, and enforces rate limits and budgets. An enterprise AI gateway extends that scope to include governed access to data systems, identity management tied to the individual user rather than a service account, and MCP server governance that enforces trust at the tool level. LiteLLM is a well-built LLM proxy. CData Connect AI targets the broader category that includes data connectivity and source-system governance alongside model routing.'
  - question: 'Can CData Connect AI replace LiteLLM?'
    answer: "They're not direct substitutes. LiteLLM has more model provider breadth (100+ targets) and a larger contributor base for self-hosted LLM routing. Where Connect AI goes further is the data layer: governed live access to hundreds of enterprise data sources, passthrough identity to source systems, and MCP governance at the trust level rather than the credential level. Connect AI also provides OpenAI- and Anthropic-compatible endpoints, so existing applications can switch by changing only the base URL and API key for those provider integrations (confirm with the Connect AI team that your specific configuration is supported before migrating). Teams sometimes run both, with LiteLLM handling broad model routing at the application tier and Connect AI handling governed data access through MCP."
  - question: 'How does CData handle identity for MCP tool calls?'
    answer: "CData Connect AI resolves each request to the individual caller and applies their permissions in each connected source system before anything runs. When an agent requests Salesforce data through Connect AI's MCP interface, Salesforce sees the request as the individual user, not as a Connect AI service account. The user's row-level security, field-level permissions, and object access controls apply automatically. The gateway doesn't need to maintain a copy of those permissions; it passes the identity through and lets each source enforce its own."
  - question: 'What happened in the March 2026 LiteLLM supply chain incident?'
    answer: "In March 2026, LiteLLM's PyPI package was compromised as part of the TeamPCP supply chain campaign. Malicious versions (1.82.7 and 1.82.8) were published to PyPI and exposed roughly 434,000 CI/CD pipelines across more than 2,500 organizations. BerriAI identified and remediated the incident. Technical analysis is available from Datadog Security Labs and SecurityWeek. For enterprise security teams, it illustrates the supply chain risk inherent to self-hosted open-source infrastructure in AI toolchains, and it's one factor that informs the choice between self-hosted and managed deployment models."
tldr: "LiteLLM is a strong self-hosted LLM router: 100+ providers, cost tracking, budgets. It doesn't connect to enterprise data, and its MCP proxy runs under a service account, so source-system permissions don't apply. Connect AI governs the data side with per-user passthrough identity. Plenty of teams need both."
contentNotice: 'Originally published on the [CData blog](https://www.cdata.com/blog/litellm-vs-cdata-connect-ai).'
---

Building enterprise AI infrastructure usually starts the same way: LiteLLM goes on the shortlist. It's open source, MIT-licensed, routes to 100+ model providers behind one OpenAI-compatible endpoint and deploys to Docker or Kubernetes in an afternoon. It has real enterprise deployments at Netflix, NASA, Ramp, and Okta and one of the most active contributor bases in open-source LLM tooling.

[CData Connect AI](https://www.cdata.com/ai/) takes a different approach. It's a managed platform that combines an [AI gateway](https://www.cdata.com/ai/) and a [Model Context Protocol (MCP) gateway](https://cloud.cdata.com/docs/MCP.html). It focuses on governing how AI agents reach live enterprise data (Salesforce, Oracle, ServiceNow, SQL databases, and hundreds more) rather than routing between model providers. Behind both gateways is the Self-Learning Context Engine, which keeps a semantic map of your data: what each field means, how sources join, and how your business defines metrics like ARR. Agents search that context before they query instead of scanning every schema, and each correction and newly connected source makes it more accurate. It's all built on 15 years of enterprise data connectivity infrastructure.

They solve different problems. They're sometimes complementary. This post covers what each does well, where each falls short, and how to tell which one belongs in your stack, or whether you need both.

### At a glance

<!-- vale JoeKarlsson.BannedWords = NO -->

|                                         | **LiteLLM (OSS)**                                                     | **LiteLLM Enterprise**               | **CData Connect AI**                                                                                                               |
| --------------------------------------- | --------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| What it is                              | Open-source LLM proxy/router                                          | LiteLLM OSS + SSO, audit, guardrails | Managed enterprise AI gateway with MCP and data connectivity                                                                       |
| LLM provider breadth                    | [100+ providers](https://docs.litellm.ai/docs/providers)              | 100+ providers                       | Major providers (OpenAI, Anthropic, Gemini, Bedrock, and others)                                                                   |
| MCP support                             | Proxy ([since v1.80.18](https://github.com/BerriAI/litellm/releases)) | Plus per-key entitlements            | Native registry, trust-level ceiling, passthrough identity                                                                         |
| Data source connectivity                | None                                                                  | None                                 | Hundreds of live enterprise connectors                                                                                             |
| Passthrough identity to source          | No                                                                    | No                                   | Yes                                                                                                                                |
| SSO / enterprise RBAC                   | Enterprise-only                                                       | Yes                                  | Yes                                                                                                                                |
| Audit logging                           | Enterprise-only                                                       | Yes                                  | Yes, plus control plane audit                                                                                                      |
| Context engine                          | No                                                                    | No                                   | Self-Learning Context Engine: semantic map of structured data and unstructured docs, stored as Open Knowledge Format (OKF) files   |
| Semantic context / business definitions | No                                                                    | No                                   | Yes (import from dbt, Power BI, Microsoft Fabric, Snowflake, Databricks, LookML; manual entry; auto-generated from docs and wikis) |
| How agents find the right data          | Not applicable; no data layer                                         | Not applicable; no data layer        | search\_context MCP tool returns the relevant tables, metrics, and joins before the agent queries                                  |
| Model routing                           | Rules you configure (latency, cost, usage, fallbacks, Auto-Router)    | Same as OSS                          | Context-aware: the router picks the model based on which data the prompt touches                                                   |
| Deployment model                        | Self-hosted only                                                      | Self-hosted only                     | Managed, plus on-premises agent                                                                                                    |
| Setup / time to first query             | Redis + PostgreSQL + Docker or Helm required; variable                | Same as OSS                          | Connect a source, configure MCP endpoint, first query in minutes                                                                   |
| Compliance                              | SOC 2 Type 2, ISO 27001                                               | SOC 2 Type 2, ISO 27001              | SOC 2 Type 2, ISO 27001, [HIPAA](https://www.hhs.gov/hipaa/index.html), GDPR                                                       |
| Organizational knowledge accumulation   | No                                                                    | No                                   | Yes: learns from user corrections, query patterns, newly connected sources, and human review of conflicts                          |

<!-- vale JoeKarlsson.BannedWords = YES -->

## What is LiteLLM?

LiteLLM is an open-source LLM proxy and router [available on GitHub](https://github.com/BerriAI/litellm) under an MIT license. It sits between your applications and the model providers: you send requests to one OpenAI-compatible endpoint, and LiteLLM routes them to whichever of its 100+ supported providers you've configured. Teams use it to avoid coupling every service to individual provider SDKs and to get unified cost tracking, rate limiting, and observability across all their model calls in one place. The enterprise tier adds SSO, RBAC, and audit logging on top of the open-source core.

## What does LiteLLM do well?

LiteLLM does one thing and does it well: one [OpenAI-compatible interface](https://docs.litellm.ai/docs/simple_proxy) in front of every major LLM provider, with token tracking, rate limiting, and budget enforcement included. It ships as a Docker container, deploys to Kubernetes via [Helm charts](https://docs.litellm.ai/docs/proxy/deploy) (EKS, GKE, and AKS are all documented), and the contributor base is active enough that the GitHub repo had about 58,000 stars and more than 46,000 commits as of September 2026.

LiteLLM supports latency-based routing, cost-based routing (always picks the cheapest provider for the current request), usage-based routing, session affinity for conversation pinning, and fallback chains across provider groups. The Auto-Router v2, released in July 2026 as part of v1.94.0, added a plugin architecture for custom routing logic. If your team wants one LLM proxy so different services don't wire individual provider SDKs, LiteLLM handles that cleanly.

Token budgets and rate limits are both well-developed. You can set per-key, per-user, per-team, and per-organization caps with hard stops. The observability integration list is long: Langfuse, Langsmith, Datadog, OpenTelemetry, Honeycomb, and 20+ more. For engineering teams who need a unified cost and latency view across providers without building it themselves, this is a real capability.

The OSS tier also supports semantic caching via Redis, Qdrant, and Valkey. [LiteLLM's own documentation](https://docs.litellm.ai/) warns that it's built for single-shot prompts and will replay stale responses on multi-turn or agentic traffic, worth knowing before deploying it behind long-running agents.

## Where does LiteLLM fall short for enterprise use?

**MCP governance is credential-scoped, not data-permission-scoped.** LiteLLM added [MCP gateway support in v1.80.18](https://docs.litellm.ai/docs/mcp) (MCP protocol version 2025-11-25). It acts as a proxy: it forwards requests from AI clients to upstream MCP servers, injects credentials at the wire level, and namespaces tools by server. Access is controllable per virtual key, team, and organization at the gateway level. What it doesn't do: federate the caller's identity to the downstream data source. The data source sees the service account LiteLLM connects with, not the individual who initiated the request. Row-level security, field-level permissions, and source-system role-based access control (RBAC) don't apply. An agent reading from Salesforce through LiteLLM's MCP proxy sees everything the service account can see, regardless of what the person who triggered the request is authorized to access.

**No native data connectivity.** LiteLLM routes AI traffic. It has no Salesforce connector, no Oracle bridge, no JDBC/ODBC layer, and no live query path to enterprise systems. Two integrations in the docs are regularly misread as data connectivity:

1. The [Snowflake provider](https://docs.litellm.ai/docs/providers/snowflake) routes prompts to Snowflake Cortex LLMs. It's an inference endpoint, not a data query layer. It doesn't read Snowflake tables.
2. The Salesforce "integration" referenced in the [Scalekit tutorial](https://docs.litellm.ai/docs/tutorials/scalekit_agentkit) is a third-party OAuth credential delegation layer for agent tool calls. LiteLLM provides no native Salesforce connector.

If your agents need to read from CRMs, ERPs, data warehouses, or on-premises systems, LiteLLM is not the layer that provides that access.

**Single sign-on (SSO), RBAC, and audit logging require the enterprise license.** The open-source build has virtual keys and basic role structures, but SSO (Okta, Microsoft Entra ID, SAML 2.0, [added in v1.95.0](https://github.com/BerriAI/litellm/releases/tag/v1.95.0)), enterprise RBAC, and immutable audit logs are all behind a paid license with custom annual pricing. Without the enterprise tier, teams often fall back to shared keys or maintain their own SSO layer outside LiteLLM.

## What is CData Connect AI?

[CData Connect AI](https://www.cdata.com/ai/) is a managed enterprise AI gateway built on the Model Context Protocol (MCP). It sits between AI agents and your enterprise systems, providing governed, live access to hundreds of data sources (Salesforce, Oracle, ServiceNow, NetSuite, SQL databases, and more) without requiring data movement or replication. Where LiteLLM routes traffic between applications and model providers, Connect AI focuses on the connection and context between AI and the underlying business data that makes agents actually useful.

CData has built data connectivity infrastructure for over 15 years. Connect AI is the gateway layer built on top of that connectivity base, adding identity-aware MCP governance, a semantic context layer, and compliance controls designed for regulated enterprise environments. The MCP Gateway is available now. The AI Gateway, Context Engine, and Policy Engine are in limited access.

## How does MCP governance differ between LiteLLM and CData Connect AI?

![Side-by-side architecture diagram comparing LiteLLM's credential-scoped MCP proxy model (where the data source sees only a service account) with CData Connect AI's passthrough identity model (where the data source sees the individual user's identity and enforces their permissions).](/images/blog/litellm-vs-cdata-connect-ai/litellm-connact-ai.webp)

In LiteLLM's MCP gateway model, credentials are injected at the gateway level. An agent authenticates to LiteLLM with a virtual key. LiteLLM holds the MCP server credentials (or forwards them from client-held credential storage, a pattern [added in v1.94.0](https://github.com/BerriAI/litellm/releases/tag/v1.94.0)). The MCP server and the data source behind it see a service identity, not the individual who authorized the agent. This works for many use cases: developer tooling, internal automation, workloads where the service account's permissions are the right scope. It breaks when source-system RBAC has to be respected, because the data source has no visibility into which user initiated the request.

CData Connect AI uses passthrough identity. The gateway resolves each request to the individual caller and applies their permissions in each connected source system. When an agent handles a Salesforce query on behalf of a sales rep, Connect AI sends the request as that rep. The rep sees what they're authorized to see. A manager making the same request through the same agent sees a broader result set. The data source enforces its own access controls. The gateway doesn't need to duplicate them.

The trust-level ceiling (Low, Medium, High) adds a second enforcement layer, checked at every individual tool invocation rather than just at login. Low restricts agents to read-only access. Medium adds create and update. High adds delete and other destructive operations. Tools are sorted into these tiers automatically based on what they do; admins can override individual tools. This aligns with the human-oversight and record-keeping obligations the [EU AI Act](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689) sets out for high-risk systems, provisions that take full effect [Dec. 2, 2027](https://artificialintelligenceact.eu/transparency-rules-article-50/). For more on [what secure MCP deployments look like at the infrastructure level](https://www.cdata.com/blog/building-secure-mcp-servers-for-multi-agent-deployments/), that's covered separately.

For a broader comparison of MCP deployment models, see [MCP gateway vs. consolidated MCP platform](https://www.cdata.com/blog/mcp-gateway-vs-consolidated-mcp-platform/).

## Does LiteLLM connect to enterprise data sources?

An LLM proxy sits between your application and the model APIs. It routes traffic, tracks cost and enforces rate limits. It doesn't know what Salesforce is. It doesn't know you have a Snowflake warehouse, an Oracle ERP, an on-premises SAP instance, or a SharePoint site where half the contract history lives. Those systems exist entirely outside the proxy's view, and [that's the gap most AI gateway comparisons don't address](https://www.cdata.com/blog/what-is-an-llm-gateway/).

CData's position in the stack is different. Connect AI is built on a connectivity layer that reaches [hundreds of enterprise sources](https://cloud.cdata.com/) live, without replication. When [an agent handles a question that spans Salesforce and a SQL Server finance database](https://www.cdata.com/blog/build-ai-copilot-salesforce-netsuite-snowflake/), Connect AI runs the join across both systems at query time, applies each system's access controls, and returns a resolved result. The model receives a governed, shaped dataset, not raw tables from multiple sources that it then has to reason across.

Snowflake and Databricks both shipped [MCP gateway](https://www.cdata.com/blog/mcp-gateway-vs-consolidated-mcp-platform/) capabilities in 2026: Snowflake at [Black Hat on July 28](https://www.snowflake.com/en/blog/enterprise-ai-security-agentic-mcp-governance/) and Databricks at the [Data + AI Summit in June](https://www.databricks.com/blog/ai-governance-data-ai-summit-2026-whats-new-unity-ai-gateway). Both proxy third-party MCP servers and add governance on top. Both govern access strongest where the data already lives on their platform. Snowflake's gateway is strongest over Snowflake data; Databricks' over the lakehouse. Neither resolves what "customer" means across two systems that live somewhere else, and neither reaches the broader stack an enterprise runs alongside a warehouse.

For teams whose data is concentrated in Snowflake or Databricks, platform-native governance may be sufficient. For teams running Salesforce, Oracle, ServiceNow, NetSuite, and a dozen other systems alongside a warehouse, it isn't.

## What is CData's Context Engine?

Every stateless gateway starts fresh. The agent resolves "enterprise segment" from scratch on every request, has no idea your fiscal year starts in February, and can't tell which Salesforce field holds the number your finance team actually trusts. [CData Connect AI's Context Engine](https://www.cdata.com/blog/context-engineering-intelligent-data-connectivity) stores that meaning, so the agent doesn't have to rediscover it.

**What's available now:**

Connect AI imports existing semantic models from the tools where they already live: dbt, Power BI, Microsoft Fabric, Snowflake, Databricks, and LookML. When your analytics team has already defined "Revenue" and "Enterprise Segment," those definitions carry into Connect AI automatically, so agents resolve terms the same way your analysts do. The agent's answer reconciles with the dashboard rather than contradicting it.

On top of imported definitions, you can define [cross-source virtual schemas and semantic views](https://www.cdata.com/ai/) that span multiple systems as one queryable model. A concept like "active customer" that joins a CRM, a billing system, and a support platform becomes a single entity without building a pipeline. For teams without an existing semantic layer, Connect AI proposes definitions by analyzing source metadata and sample data.

Coming Q4 2026: vocabulary and correction learning from agent traffic, and shared organizational knowledge promotion across users. Per Atlan's analysis of Gartner research, context graph self-learning is projected as a capability more than 50% of AI agent systems will adopt by 2028. The infrastructure for it ships this year, compounding organizational learning below the agent level rather than in any single session.

## How do LiteLLM and CData Connect AI compare on compliance and deployment?

LiteLLM is always self-hosted. Running it in production means owning the Redis cluster (for caching and rate limits), the PostgreSQL database (for usage logging), and the infrastructure to keep both healthy. There's no SLA on the community edition. The enterprise license adds support commitments and removes some operational risk, but you're still maintaining the deployment.

Getting started with LiteLLM typically takes a few hours to a day: pulling the Docker image is fast, but wiring in Redis, PostgreSQL, your provider keys, and your first routing rules adds setup time before you run a real query.

Connect AI is faster to first value. [Sign up](https://www.cdata.com/ai/signup/), connect a data source, and your MCP endpoint is configured and queryable in minutes, with no infrastructure to provision and no cluster to manage. For developers who want to evaluate whether governed data access through MCP fits their use case, that's a meaningful difference.

Connect AI is a managed service with an on-premises agent for sources that can't be reached from the cloud. The on-premises agent extends Connect AI's reach to network-isolated systems behind a firewall without opening inbound ports. For teams with strict data privacy requirements, CData's [data connector drivers](https://www.cdata.com/drivers/) (ODBC, JDBC, ADO.NET, and others) can also be deployed fully on-premises, keeping data movement entirely within your own infrastructure. For [enterprise MCP deployment patterns and best practices](https://www.cdata.com/blog/deploy-mcp-servers-cdata-2026/), that's documented separately.

**Compliance.** LiteLLM holds [SOC 2 Type 2 and ISO 27001](https://www.cdata.com/security/). HIPAA coverage isn't claimed on their enterprise page. CData Connect AI holds SOC 2 Type 2, ISO 27001, [HIPAA](https://www.hhs.gov/hipaa/index.html), and GDPR compliance, with data residency controls and provider retention policy routing for zero-data-retention requirements.

**EU AI Act.** The EU AI Act's [Article 50 transparency obligations](https://artificialintelligenceact.eu/transparency-rules-article-50/) took effect Aug. 2, 2026, requiring disclosure when users interact with AI systems. Full high-risk AI enforcement follows [Dec. 2, 2027](https://artificialintelligenceact.eu/transparency-rules-article-50/). Agents that invoke MCP tools against regulated data sources will be in scope. Per-action logging and human oversight mechanisms need to be architected in, not added after the fact.

**Supply chain.** In March 2026, [LiteLLM's PyPI package was compromised](https://securitylabs.datadoghq.com/articles/litellm-compromised-pypi-teampcp-supply-chain-campaign/) in the TeamPCP campaign. Roughly [434,000 CI/CD pipelines](https://www.securityweek.com/over-2500-organizations-impacted-by-litellm-supply-chain-attack/) across more than 2,500 organizations were exposed. BerriAI identified and remediated the incident. A managed deployment moves the package update path to the vendor, under a controlled release process and published security attestations, rather than depending on each team's own update hygiene.

## When should you use LiteLLM?

LiteLLM is the right tool when your primary problem is LLM routing and cost management at the model-traffic layer:

1. You need a unified OpenAI-compatible interface across many providers and want to operate it yourself
2. Your applications work with data that stays in the prompt, not live-queried from enterprise systems
3. You need maximum model flexibility: 100+ providers accessible without changing application code
4. Full deployment control matters more than managed SLAs
5. Governance is handled at another layer of your stack and you need the routing layer to stay lightweight

## When should you use CData Connect AI?

Connect AI is the right tool when the problem includes governed data access, not only model routing:

1. Agents need live, governed access to enterprise systems: CRMs, ERPs, databases, SaaS applications, on-premises sources
2. Audit and identity need to trace to the individual human; source-system RBAC has to be respected rather than bypassed with a service account
3. MCP governance needs to enforce trust levels at the tool invocation level, not only at the virtual key level
4. Enterprise SSO, System for Cross-domain Identity Management (SCIM) provisioning, and RBAC are requirements from IT or security, not nice-to-haves
5. HIPAA or GDPR compliance covers the data the agents are accessing
6. You're building toward agentic write-back and need the governance infrastructure to do it safely

## LiteLLM vs CData Connect AI: which is right for your team?

| **If your primary need is…**                                    | **Start with…**  |
| --------------------------------------------------------------- | ---------------- |
| Self-hosted LLM routing across many providers                   | LiteLLM          |
| Cost visibility and token budget enforcement at the model layer | LiteLLM          |
| Governed live access to enterprise data through MCP             | CData Connect AI |
| Per-user identity enforcement and source-system RBAC via agents | CData Connect AI |
| Enterprise SSO, HIPAA compliance, or EU AI Act audit readiness  | CData Connect AI |
| Maximum model breadth (100+ providers, any LLM)                 | LiteLLM          |

## Try CData Connect AI

CData Connect AI's MCP Gateway is available now. Connect a data source, point your MCP clients at the gateway endpoint, and see what the platform resolves before the model runs.

[Get started with CData Connect AI](https://docs.cloud.cdata.com/en/Quick-Start-Guide)

## Frequently asked questions

**Is LiteLLM free?**

Partially. The core LiteLLM proxy is open-source under an MIT license and free to use. Enterprise features (SSO with Okta, Microsoft Entra ID, or SAML 2.0; team RBAC; immutable audit logs; support commitments) require a paid subscription with custom pricing. The enterprise/ directory in the repo is under a separate proprietary license.

**Does LiteLLM support MCP servers?**

Yes. LiteLLM added MCP gateway support in v1.80.18 (MCP protocol version 2025-11-25). It acts as an MCP proxy: it forwards requests from AI clients to upstream MCP servers you configure, injects credentials at the wire level, and namespaces tools by server. Enterprise features (v1.95 and later) add per-key and per-team MCP entitlement management and dynamic credential renewal. LiteLLM doesn't provide its own enterprise data connectors through MCP. You connect it to whatever MCP servers you operate or build.

**What is the difference between an LLM proxy and an enterprise AI gateway?**

An LLM proxy routes traffic between AI applications and model providers. It manages which model handles which request, tracks token usage, and enforces rate limits and budgets. An enterprise AI gateway extends that scope to include governed access to data systems, identity management tied to the individual user rather than a service account, and MCP server governance that enforces trust at the tool level. LiteLLM is a well-built LLM proxy. CData Connect AI targets the broader category that includes data connectivity and source-system governance alongside model routing.

**Can CData Connect AI replace LiteLLM?**

They're not direct substitutes. LiteLLM has more model provider breadth (100+ targets) and a larger contributor base for self-hosted LLM routing. Where Connect AI goes further is the data layer: governed live access to hundreds of enterprise data sources, passthrough identity to source systems, and MCP governance at the trust level rather than the credential level. Connect AI also provides OpenAI- and Anthropic-compatible endpoints, so existing applications can switch by changing only the base URL and API key for those provider integrations (confirm with the Connect AI team that your specific configuration is supported before migrating). Teams sometimes run both, with LiteLLM handling broad model routing at the application tier and Connect AI handling governed data access through MCP.

**How does CData handle identity for MCP tool calls?**

CData Connect AI resolves each request to the individual caller and applies their permissions in each connected source system before anything runs. When an agent requests Salesforce data through Connect AI's MCP interface, Salesforce sees the request as the individual user, not as a Connect AI service account. The user's row-level security, field-level permissions, and object access controls apply automatically. The gateway doesn't need to maintain a copy of those permissions; it passes the identity through and lets each source enforce its own.

**What happened in the March 2026 LiteLLM supply chain incident?**

In March 2026, LiteLLM's PyPI package was compromised as part of the TeamPCP supply chain campaign. Malicious versions (1.82.7 and 1.82.8) were published to PyPI and exposed roughly 434,000 CI/CD pipelines across more than 2,500 organizations. BerriAI identified and remediated the incident. Technical analysis is available from [Datadog Security Labs](https://securitylabs.datadoghq.com/articles/litellm-compromised-pypi-teampcp-supply-chain-campaign/) and [SecurityWeek](https://www.securityweek.com/over-2500-organizations-impacted-by-litellm-supply-chain-attack/). For enterprise security teams, it illustrates the supply chain risk inherent to self-hosted open-source infrastructure in AI toolchains, and it's one factor that informs the choice between self-hosted and managed deployment models.
