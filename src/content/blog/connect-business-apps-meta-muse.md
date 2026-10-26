---
title: 'How to Connect Your Business Apps to Meta Muse'
date: 2026-09-22
slug: 'connect-business-apps-meta-muse'
description: 'Connect enterprise data to Meta Muse with CData Connect AI. Add Salesforce, NetSuite, or HubSpot as a custom connector in about 10 minutes.'
categories: ['Dev Tools']
tags: ['mcp', 'ai-agents', 'meta-muse', 'tutorial', 'enterprise', 'cdata']
heroImage: '/images/blog/connect-business-apps-meta-muse/hero.webp'
heroAlt: 'Diagram of a business app window feeding into a CData Connect AI box, which feeds into the Meta logo, on a light gray background'
canonicalUrl: 'https://www.cdata.com/blog/muse'
faq:
  - question: 'Can Muse connect to Salesforce?'
    answer: "Not through a built-in connector as of September 2026. Muse's native connector list covers consumer and personal productivity apps. To connect Salesforce, add CData Connect AI as a custom connector in Muse using the MCP endpoint at https://mcp.cloud.cdata.com/mcp with a personal access token from your Connect AI settings. Once configured, you can query Salesforce data directly in your Muse conversation."
  - question: 'Does this require any technical knowledge?'
    answer: "You're giving Muse an endpoint URL and an API key in a chat conversation. CData Connect AI handles the connection to your data source from its end, and Muse handles the integration from its end."
  - question: 'Is my enterprise data secure?'
    answer: "Yes. On the Connect AI side, every request to the MCP endpoint travels over HTTPS and is authenticated against your personal access token before any data is returned. Your PAT is scoped to your account, never stored in the MCP server itself, and can be revoked or rotated at any time from Connect AI Settings > Personal Access Tokens. On the Muse side, credentials live in Muse's secure credential store, separate from the conversation thread. Your API key is never visible to the agent or included in any response. If you revoke the PAT in Connect AI, the connector stops working immediately with no action required in Muse."
  - question: 'What should my IT team know about this integration?'
    answer: "CData Connect AI uses HTTPS and token-based authentication for every request. Your organization's data never passes through Meta's servers directly. Muse sends a request to the MCP endpoint, Connect AI authenticates it against your personal access token, queries the configured data source, and returns only the rows that answer the question. Personal access tokens are scoped to individual user accounts and can be revoked from the Connect AI admin panel at any time. Connect AI also supports IP allowlisting if your organization requires network-level controls. For a full security overview, see the CData Connect AI security documentation or contact your CData account team."
  - question: "What if my data source isn't configured in Connect AI yet?"
    answer: "Configure it in Connect AI first. Log in, go to Sources, and add a connection for the system you want (Salesforce, NetSuite, HubSpot, and so on). Connect AI walks through authentication for each source. Once the connection shows as Authenticated, it's available through the MCP endpoint and your Muse connector will reach it automatically."
  - question: "Does this work on Muse's mobile app?"
    answer: 'Yes. Custom connectors configured on the web carry over to the Muse mobile app automatically.'
  - question: 'Can one connector give Muse access to multiple data sources?'
    answer: 'Yes. Connect AI exposes your configured data sources through one MCP endpoint. After you add the connector in Muse, your agent can query any of them without needing a separate custom connector for each source.'
tldr: 'Muse has no built-in connectors for Salesforce, HubSpot, NetSuite, or ServiceNow, but it accepts custom connectors. Add CData Connect AI as one with a Base64 Basic auth key built from your email and a personal access token, and Muse can query every source you set up in Connect AI. It takes about 10 minutes and no code.'
contentNotice: 'Originally published on the [CData blog](https://www.cdata.com/blog/muse).'
---

If you've been using [Meta Muse](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/) as your personal AI agent and you want it to actually reach your work systems ([Salesforce](https://www.cdata.com/drivers/salesforce/), [NetSuite](https://www.cdata.com/drivers/netsuite/), [HubSpot](https://www.cdata.com/drivers/hubspot/), [ServiceNow](https://www.cdata.com/drivers/servicenow/)), this post is for you. By the end, you'll have Muse connected to your enterprise data so you can ask it questions about your pipeline, your customers, or your open support tickets and get answers without switching apps. It takes about 10 minutes and doesn't require any technical background.

The short version of why this is possible: Muse has a feature called Custom Connectors that lets you add any web service that isn't already in its built-in list. CData Connect AI is exactly that kind of service. You give Muse one URL and your credentials, and from that point on your Muse agent can reach every enterprise system you've set up in Connect AI.

**At a glance**

- **What is Muse:** Meta's personal AI agent, launched September 8, 2026, that connects to apps and runs tasks on your behalf from inside a secure cloud environment
- **What:** Add CData Connect AI as a custom connector in Muse so your AI agent can query any enterprise data source
- **Who:** Business users who want Muse to reach enterprise apps, no coding required
- **Time:** About 10 minutes
- **Prerequisites:** A [CData Connect AI account](https://www.cdata.com/ai/) with at least one data source configured, and access to Muse at [muse.ai](https://muse.ai)
- **First published:** September 22, 2026

## What Muse can connect out of the box (and where it stops)

Muse's built-in connector list targets personal use by design. The apps in there (Gmail, Google Calendar, OpenTable, Peloton, Plaid) reflect what people want a personal agent to handle outside of work. That works well for personal tasks.

Work apps didn't make the cut. Salesforce, HubSpot, NetSuite, ServiceNow, Dynamics 365: none of those systems are on the list. Meta built a path for this: [the Custom Connector feature](https://www.meta.com/help/artificial-intelligence/1687253048996149/) lets you add any service with a publicly accessible endpoint and API key or OAuth authentication. [CData Connect AI's MCP server](https://www.cdata.com/blog/mcp-build-vs-buy) fits that description exactly.

It exposes every data source you've already set up (Salesforce, NetSuite, BigQuery, SharePoint, and more) through one MCP endpoint. Add it to Muse once and your agent can query them all.

![CData Connect AI Sources page showing enterprise connections including Office 365, Google BigQuery, NetSuite, SharePoint, Stripe, and Microsoft Teams, with a mix of Authenticated and Not Authenticated statuses.](/images/blog/connect-business-apps-meta-muse/enterprise-connections.webp)

## What you'll need before you start

Have these ready before you open Muse:

- **A [CData Connect AI account](https://www.cdata.com/ai/)** with at least one data source configured (Salesforce, HubSpot, NetSuite, or whichever system you want Muse to reach). If you don't have one yet, the [quick start guide](https://docs.cloud.cdata.com/en/Quick-Start-Guide?utm_source=cdata-blog&utm_medium=cta&utm_campaign=mcp&utm_content=connect-enterprise-data-meta-muse) walks through setup.
- **The MCP endpoint URL:** `https://mcp.cloud.cdata.com/mcp`
- **A personal access token (PAT)** from your [Connect AI Settings > Personal Access Tokens](https://cloud.cdata.com/settings); copy the token value when you create it, because it's only shown once

## Step-by-step: connect enterprise data to Meta Muse via CData Connect AI

If you'd rather watch it done first, this three-minute video walks through the same five steps: creating a personal access token, building your API key, and adding the Connect AI endpoint in a Muse chat. The written steps that follow have every value you'll need to copy and paste.

[![Watch the walkthrough video: connecting HubSpot, Salesforce, and ServiceNow to Meta Muse through CData Connect AI](/images/blog/connect-business-apps-meta-muse/video-thumbnail.webp)](https://www.youtube.com/watch?v=RxXiOeSHrBA)

### Step 1: Generate a personal access token in Connect AI

Go to [Connect AI Settings > Personal Access Tokens](https://cloud.cdata.com/settings). Click **Create PAT**, name it something like "muse-connector," and copy the token immediately. The value is only shown once at creation.

![CData Connect AI Settings page with the Personal Access Tokens tab selected, showing a list of named tokens with creation dates and a Create PAT button in the top-right.](/images/blog/connect-business-apps-meta-muse/settings-page.webp)

### Step 2: Generate your API key

Muse authenticates to Connect AI with a single string: the word Basic, a space, then your email and personal access token (PAT) encoded in Base64. Enter your email and PAT in the [generator on the original post](https://www.cdata.com/blog/muse), and it builds that string for you.

Copy the string it returns. That's your API key for the next step.

Prefer to build it yourself? You can create the same string in your browser console or a terminal.

In your browser, right-click anywhere on this page, select **Inspect** (or press F12 on Windows / Cmd+Option+I on Mac), click the **Console** tab, and paste this, replacing the placeholders with your real email and PAT:

```js
console.log('Basic ' + btoa('you@yourcompany.com:YOUR_PAT_HERE'));
```

Press Enter. Copy the string it prints. That's your API key for the next step.

If you're comfortable with a terminal, the terminal version is:

```bash
echo -n "you@yourcompany.com:YOUR_PAT_HERE" | base64
```

Prefix that output with Basic (capital B, one space) and you have the same string.

### Step 3: Note your MCP endpoint URL

Your Connect AI MCP endpoint is always https://mcp.cloud.cdata.com/mcp. You can also confirm it on the [MCP Gateway page](https://cloud.cdata.com/ai-gateway/tool-servers) in Connect AI.

![CData Connect AI MCP Gateway detail view showing the cdata-connect-mcp tool server, with the Agent URL field and the cdata MCP server listed as exposing all Connect data sources.](/images/blog/connect-business-apps-meta-muse/mcp-gateway-detail.webp)

### Step 4: Open Muse and ask for a custom connector

Go to [muse.ai](https://muse.ai) and start a new chat. Type:

_I'd like to connect a custom MCP data server for my enterprise data._

Tell Muse the endpoint URL is https://mcp.cloud.cdata.com/mcp and that it uses API key authentication with the key going in the Authorization header. Muse will create a connector and ask you to connect.

### Step 5: Enter your API key and confirm the connection

When Muse shows the connector card with a **Connect** button, click it. You'll see the data connector dialog asking for your API key.

![The Muse custom connector dialog for CData Connect AI, showing the API key input field and a Connect button before the user submits credentials.](/images/blog/connect-business-apps-meta-muse/muse-custom-connector.webp)

Paste your full Basic string into the API key field and click **Add**.

Muse will test the connection. When it succeeds, you'll see confirmation that the handshake went through and your server reports 12 tools available.

From that point, Muse can reach every data source you've configured in Connect AI through one connector.

## What to ask Muse once it's connected

Once the connector is live, Muse can pull answers from your work data in plain language. The examples below depend on which sources you've connected in Connect AI. Each query only works if you have that specific connector set up and authenticated. Starting points by role:

### Sales (requires Salesforce)

Most sales managers run this check manually every Monday morning. With Muse connected to Salesforce, it's one question.

_Which deals in my Salesforce pipeline have had no activity in the past 30 days? List the next step on each._

![Muse chat titled Find inactive Salesforce deals: the user asks which pipeline deals have had no activity in 30 days, and Muse replies that queries are running across the US and JP Salesforce orgs, with a stale_opportunities.csv attachment](/images/blog/connect-business-apps-meta-muse/salesforce-deals.webp)

### Account management (requires HubSpot)

Useful before a customer call when you want context without digging through activity feeds.

_Summarize the last three touchpoints with Acme Corp in HubSpot, including any open support tickets._

### Operations and procurement (requires NetSuite or another ERP)

Works with NetSuite or any ERP source you've configured in Connect AI.

_What's our current inventory and lead time for the top five SKUs we reorder from this supplier?_

### IT and support (requires ServiceNow)

_Which P1 incidents in ServiceNow remain open past SLA right now?_

Ask this before a standup or status meeting instead of pulling a report manually.

## Which enterprise systems work with CData Connect AI

Every source you've already connected in Connect AI is available through the same MCP endpoint. One connector in Muse covers them. The systems that come up most for Muse use cases:

**Customer relationship management (CRM):** [Salesforce](https://www.cdata.com/drivers/salesforce/), [HubSpot](https://www.cdata.com/drivers/hubspot/), [Dynamics 365](https://www.cdata.com/drivers/dynamics365/), [Zoho CRM](https://www.cdata.com/drivers/zohocrm/)

**Enterprise resource planning (ERP):** [NetSuite](https://www.cdata.com/drivers/netsuite/), [SAP](https://www.cdata.com/drivers/sap/), [Oracle ERP Cloud](https://www.cdata.com/drivers/oracleerp/)

**Productivity:** [SharePoint](https://www.cdata.com/drivers/sharepoint/), [Microsoft Teams](https://www.cdata.com/drivers/msteams/), [OneDrive](https://www.cdata.com/drivers/onedrive/), Google Workspace

**Support:** [ServiceNow](https://www.cdata.com/drivers/servicenow/), [Zendesk](https://www.cdata.com/drivers/zendesk/), [Jira](https://www.cdata.com/drivers/jira/)

**Finance:** [QuickBooks](https://www.cdata.com/drivers/quickbooks/), [Stripe](https://www.cdata.com/drivers/stripe/), [Xero](https://www.cdata.com/drivers/xero/)

**Data warehouses:** [BigQuery](https://www.cdata.com/drivers/bigquery/), [Snowflake](https://www.cdata.com/drivers/snowflake/), [Redshift](https://www.cdata.com/drivers/redshift/), [Databricks](https://www.cdata.com/drivers/databricks/)

If a system you need isn't in that list, check the [full connector catalog](https://www.cdata.com/ai/connectors/). You can also use [custom MCP tools in Connect AI](https://www.cdata.com/blog/build-custom-mcp-tools-in-cdata-connect-ai) to scope exactly which data Muse can see within each source, down to specific tables or columns, which is useful when you want to give your Muse agent access to pipeline data without exposing the entire CRM schema.

## Connect your enterprise data to Muse with Connect AI

Add CData Connect AI as a custom connector in Muse and your agent can reach any enterprise system you've set up, Salesforce, NetSuite, ServiceNow, HubSpot, all from one connector and one conversation.

[Start your free trial of Connect AI](https://www.cdata.com/ai/signup/), then follow the [Connect AI quick start guide](https://docs.cloud.cdata.com/en/Quick-Start-Guide) to set up your first data source and add it to Muse.

## Frequently asked questions

**Can Muse connect to Salesforce?**

Not through a built-in connector as of September 2026. Muse's native connector list covers consumer and personal productivity apps. To connect Salesforce, add CData Connect AI as a custom connector in Muse using the MCP endpoint at https://mcp.cloud.cdata.com/mcp with a personal access token from your Connect AI settings. Once configured, you can query Salesforce data directly in your Muse conversation.

**Does this require any technical knowledge?**

You're giving Muse an endpoint URL and an API key in a chat conversation. CData Connect AI handles the connection to your data source from its end, and Muse handles the integration from its end.

**Is my enterprise data secure?**

Yes. On the Connect AI side, every request to the MCP endpoint travels over HTTPS and is authenticated against your personal access token before any data is returned. Your PAT is scoped to your account, never stored in the MCP server itself, and can be revoked or rotated at any time from Connect AI Settings > Personal Access Tokens. On the Muse side, credentials live in Muse's secure credential store, separate from the conversation thread. Your API key is never visible to the agent or included in any response. If you revoke the PAT in Connect AI, the connector stops working immediately with no action required in Muse.

**What should my IT team know about this integration?**

CData Connect AI uses HTTPS and token-based authentication for every request. Your organization's data never passes through Meta's servers directly. Muse sends a request to the MCP endpoint, Connect AI authenticates it against your personal access token, queries the configured data source, and returns only the rows that answer the question. Personal access tokens are scoped to individual user accounts and can be revoked from the Connect AI admin panel at any time. Connect AI also supports IP allowlisting if your organization requires network-level controls. For a full security overview, see the [CData Connect AI security documentation](https://docs.cloud.cdata.com/en/Security) or contact your CData account team.

**What if my data source isn't configured in Connect AI yet?**

Configure it in Connect AI first. Log in, go to Sources, and add a connection for the system you want (Salesforce, NetSuite, HubSpot, and so on). Connect AI walks through authentication for each source. Once the connection shows as Authenticated, it's available through the MCP endpoint and your Muse connector will reach it automatically.

**Does this work on Muse's mobile app?**

Yes. Custom connectors configured on the web carry over to the Muse mobile app automatically.

**Can one connector give Muse access to multiple data sources?**

Yes. Connect AI exposes your configured data sources through one MCP endpoint. After you add the connector in Muse, your agent can query any of them without needing a separate custom connector for each source.
