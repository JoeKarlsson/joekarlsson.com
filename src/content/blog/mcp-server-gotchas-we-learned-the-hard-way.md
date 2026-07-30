---
title: 'We Built an MCP Server and These Are the Gotchas Nobody Talks About'
date: 2025-07-29
slug: 'mcp-server-gotchas-we-learned-the-hard-way'
description: 'Lessons we learned from building an MCP server to bridge LLMs with cloud infrastructure databases. What we learned about tool descriptions, naming, context limits, and quirks, and how we fixed them.'
categories: ['Dev Tools']
tags: ['MCP', 'LLM', 'AI', 'Engineering', 'Go']
heroImage: '/images/blog/mcp-server-gotchas-we-learned-the-hard-way/thumbnail.webp'
heroAlt: 'MCP Server Gotchas Nobody Talks About'
canonicalUrl: 'https://www.cloudquery.io/blog/mcp-server-gotchas-we-learned-the-hard-way'
tldr: 'We built an MCP server in Go to let Claude and Cursor query our cloud infrastructure database directly. Short, vague tool descriptions confused the model - longer, domain-specific ones fixed it. Ambiguous tool names kept tools unused - renaming them to match intent made them indispensable. Raw schemas overwhelmed the context window - we filtered them down to high-signal columns. Even at temperature=0, LLMs showed non-determinism and selective attention.'
---

_Co-authored with Mariano Gappa at CloudQuery._

![The MCP Gotchas Nobody Talks About header](/images/blog/mcp-server-gotchas-we-learned-the-hard-way/header.webp)

We've been running an experiment at [CloudQuery](https://www.cloudquery.io/): What happens when you wire an LLM directly into your cloud infrastructure database?

We built an MCP server in Go (in fact, [our entire stack runs on Go](https://github.com/cloudquery/cloudquery)) that gives Claude or Cursor direct access to our cloud infrastructure database. We expected it to surface data faster. Instead, it taught us how brittle LLM assumptions can be, and how much care a tool like this demands.

In this post, we are going to dig in the gotchas that nobody warned us about, and the hard lessons we learned building and operating our own MCP server. We'll show exactly what broke, how we fixed it, and what we'd do differently if we were starting over.

## Tool Descriptions Are Everything

### What is a "Tool"?

In the context of an MCP server and LLMs, a [tool](https://modelcontextprotocol.io/docs/concepts/tools) is a function or endpoint that the LLM can call explicitly during a session. In our case, these are Go functions registered with the MCP server and exposed to Claude or Cursor through an OpenAI-style tool schema: name, description, parameters, and a handler.

The LLM reads the descriptions we provide for these tools and decides, on its own, when and how to invoke them to help answer the user's question. Conceptually, tools are an extension of the model's capabilities into an external API surface ([OpenAI functions spec](https://platform.openai.com/docs/guides/function-calling)). This is analogous to providing a set of CLI commands or API endpoints and letting the user figure out when to use them.

### The Problem

Initially, we wrote the descriptions as if another engineer would read them. Short and terse, in order to conserve the size of our context window:

```json
{
	"name": "list_plugins",
	"description": "Lists installed plugins"
}
```

It seemed obvious: why waste words? But in practice, Claude would call this tool sparingly, misinterpret what it was for, or outright ignore it. Instead of exploring our data, it would hallucinate tables or query against nonexistent schemas.

We confirmed this was not a one-off bug. LLMs, especially Claude and GPT, rely heavily on the description field of a tool when ranking which tool to call. Sparse descriptions lead to ambiguous or no calls at all ([Zhao et al., 2023](https://arxiv.org/abs/2306.05685)).

Experiments by Microsoft Research also show that increasing semantic richness in the function description improves tool selection accuracy by ~30% on average ([Microsoft Toolformer Paper](https://arxiv.org/abs/2302.04761)).

### How We Fixed Our Tool Descriptions

We rewrote every single tool description to be much longer and more specific, like this:

```json
{
	"name": "list_plugins",
	"description": "Discover available data sources in this CloudQuery deployment. Each plugin represents a cloud provider (aws, gcp, azure) or service (github, kubernetes) with dozens of tables containing structured resource data. Use this first to understand what data sources are available before searching for specific tables. Returns plugin names, versions, and resource counts to help you navigate the available data."
}
```

We focused on:

- Explaining the broader purpose ("discover available data sources")
- Mentioning specific domain terms (AWS, GCP, Kubernetes)
- Suggesting when and why the tool should be used
- Clarifying what the return payload looks like

![Meme showing two panels of Winnie the Pooh. Top panel: Pooh in a red shirt looking unimpressed with the caption 'Writing tool descriptions like you're talking to another engineer.' Bottom panel: Pooh in a tuxedo looking smug with the caption 'Writing tool descriptions like you're explaining to a literal alien.'](/images/blog/mcp-server-gotchas-we-learned-the-hard-way/image3.webp)

The character count increased from ~50 to ~400, and response quality improved dramatically. Instead of guessing, Claude systematically queried the tool to understand the data structure before proceeding.

We found that language models rank tool candidates by computing how well their description semantically aligns with the user's query intent. When the description lacks domain-specific or task-relevant terms, it loses out to hallucinations or irrelevant tools.

By packing the description with concrete signals - nouns, verbs, and context relevant to cloud data - it increases the embedding similarity between the query and the tool definition, making it much more likely to be called ([Wei et al., 2022](https://arxiv.org/abs/2206.07682)).

Longer descriptions also help because they compensate for the model's lack of world knowledge about your proprietary domain (in our case, cloud asset inventories). LLMs will not infer these details - they rely on you to teach them via the description.

### Multi-Tool Workflows

Even with detailed descriptions, we discovered another critical gap: LLMs struggled with knowing when and how to use tools in sequence. A user asking "show me all AWS security groups with open ports" requires multiple coordinated tool calls, but Claude would often skip steps, call tools in the wrong order, or make assumptions about data structure.

The breakthrough came when we embedded **recommended workflows** directly into each tool description. Here's the exact workflow we include in our `execute-query` tool:

```go
RECOMMENDED WORKFLOW (use these tools in sequence before executing queries):
1. First, use "list-installed-plugins" to see what data sources are available (aws, gcp, azure, github, kubernetes, etc.)
2. Then, use "table-search-regex" to find specific tables within those plugins that contain the data you need
3. Use "table-schemas" to get detailed column information for the tables you've identified
4. Use "column-search" to find specific columns across all tables if you need to locate particular data fields
5. Optionally, use "known-good-queries" to find similar query examples and learn the data structure patterns
6. Finally, use this tool to execute your crafted ClickHouse SQL query
```

This explicit sequencing transformed everything. Instead of Claude making random tool calls or hallucinating table structures, it now systematically follows this discovery-to-execution pipeline.

## How to Convince an LLM to Actually Use the Tool You Built

We wrote a tool specifically to help users write SQL queries by providing example queries. In the MCP server, this was registered as:

```go
s.AddTool(mcp.Tool{
    Name: "example_queries",
    Description: "Shows example queries for CloudQuery.",
    // ...
}, handleExampleQueries)
```

It sat there, unused. Claude kept asking for help writing queries while completely ignoring this tool. Not once during two weeks of testing did the model invoke it, even when explicitly asked for examples.

On inspection, this isn't unique to our setup. LLMs don't "understand" what your tool does. Instead, they make probabilistic guesses based on how well the name and description match their current token context ([OpenAI Docs](https://platform.openai.com/docs/guides/function-calling)). When the name is vague (`example_queries`) and the description lacks strong cues, the model often prefers to hallucinate a response rather than risk calling an ambiguous tool.

Studies on LLM tool use confirm that semantic disambiguation is critical: ambiguous names lower invocation frequency by >40% compared to explicit, task-oriented names ([Schick et al., 2023](https://arxiv.org/abs/2302.04761)).

### What We Changed

We changed two things:

1. Renamed the tool from `example_queries` to `known_good_queries`
2. Expanded the description to explicitly state what the tool provides and when to use it:

```go
s.AddTool(mcp.Tool{
    Name: "known_good_queries",
    Description: "Get proven, working SQL queries for common CloudQuery analysis tasks. Use this tool when you need query examples or want to see patterns for writing queries against cloud infrastructure data.",
    // ...
}, handleKnownGoodQueries)
```

This added clear, task-specific signals like proven, working SQL, common analysis tasks, and patterns.

![Meme showing Surprised Pikachu with the caption: 'Me when renaming a tool from "example queries" to "known good queries" magically makes the LLM use it.'](/images/blog/mcp-server-gotchas-we-learned-the-hard-way/image4.webp)

### Okay... but Why Did That Work?

First, the new name aligned better with the user's intent. `known_good_queries` explicitly signals to the LLM that the tool contains vetted, high-quality SQL, which is a much stronger match to prompts like "give me a working query".

Second, by using both intent (known good) and domain (SQL queries for CloudQuery), we reduced the cognitive gap between the model's understanding and the tool's purpose ([Zhao et al., 2023](https://arxiv.org/abs/2306.05685)).

## Context Window is Your Enemy

### Assume I know nothing. What's the Context Window Problem?

Every LLM has a fixed [context window](https://www.ibm.com/think/topics/context-window): the maximum number of tokens (roughly words and punctuation) it can keep in memory during a session. For Claude and GPT-4, this is anywhere between ~8K-200K tokens depending on the model variant ([Anthropic Docs](https://www.anthropic.com/news/claude-2), [OpenAI Docs](https://platform.openai.com/docs/guides/text-generation)).

We learned this the hard way: a single raw CloudQuery schema dump can easily exceed 50,000 tokens. Some of our more complex tables contain hundreds of columns and foreign keys. Feeding even a few of these tables into Claude consumed nearly its entire context window, leaving no room for query planning or instructions.

![Meme showing the 'This is fine' dog sitting calmly in a room on fire. Caption added: 'Your LLM trying to process 50,000 tokens of raw schema.' Dog says 'This is fine'.](/images/blog/mcp-server-gotchas-we-learned-the-hard-way/image5.webp)

Research shows that once the context window saturates, the model selectively forgets earlier tokens rather than gracefully degrading ([Xiong et al., 2023](https://arxiv.org/abs/2307.03172)). This means the model would ignore parts of our schema arbitrarily, which is not ideal.

### How We Fixed Our Context Window Problem

We built a filtering mechanism into the MCP server that strategically trims schema output before handing it to the LLM. We used Go with regular expressions and column ranking heuristics to discard irrelevant or redundant columns:

- Always keep primary keys
- Prioritize common, business-critical columns
- Drop low-signal or duplicated columns
- Cap the total number of columns returned

We observed on average about a 90% reduction in token usage after filtering, which allowed Claude to handle over 20 table schemas at once rather than choking after 3 to 4.

Filtering works because it preserves the salient structural information (primary keys, frequent columns) while eliminating noise. LLMs don't need to see every column to infer table purpose - they need the minimal set of high-signal fields.

By explicitly curating what went into the LLM, we freed up space in the context window for queries, instructions, and additional tables - making the system usable at scale.

## LLM Quirks We Had to Work Around

Even after solving tool descriptions, naming, and context window issues, we ran into behavior that would make any programmer shake their head.

**First**: non-determinism. In plain terms, this means you can send the exact same input to the model twice and still get slightly different outputs. Even when we set `temperature=0`, which is supposed to make the model always pick the most likely next word at every step, Claude sometimes chose different tools or wrote slightly different SQL.

Here's what's really going on:

- **Temperature** controls how "creative" or random the model's output is. At higher temperatures, it's more likely to pick less-obvious words or paths. At `temperature=0`, it always picks the most probable next word, which should make outputs repeatable.

- But that only removes one source of randomness. Other factors remain: live database queries returning in a different order, tiny timing differences from database batching or caching, hidden system prompts injected by the API, and even small differences in the hardware running the model. Together, these make it impossible to guarantee identical outputs every time ([Holtzman et al., 2020](https://arxiv.org/abs/1904.09751), [OpenAI Docs](https://platform.openai.com/docs/guides/text-generation)).

**Second**: selective attention. We'd hand Claude a list of 20 tables to analyze, and it would confidently pick 2-3 while ignoring the rest. This isn't laziness - it's how transformers prioritize what's at the start of the input or what looks most salient. When overwhelmed with too many options, the model tends to latch onto the first few and skip the rest.

## Final Thoughts

![Meme with four panels of an expanding brain, each representing increasing realization about tool descriptions: Top: 'LLMs are smart, they'll figure out my tools.' Second: 'I need better documentation for my tools.' Third: 'I need to think like an LLM when writing descriptions.' Bottom: 'I need to psychologically manipulate a statistical model into doing what I want.'](/images/blog/mcp-server-gotchas-we-learned-the-hard-way/image6.webp)

Building and running our own MCP server taught us more about LLM behavior than we expected, and not always the lessons we thought we'd learn. We set out to make it easier for Claude and Cursor to talk to our cloud infrastructure database. What we uncovered along the way was how fragile and opaque LLM interactions can be without deliberate engineering.

We covered four key gotchas:

- Why detailed, domain-specific **tool descriptions** are critical for the model to even notice and use your tools
- How a clear, intentional **tool name**, like `known_good_queries`, can flip a tool from ignored to most-used overnight
- How to fight the **context window limits** by filtering schemas down to just the high-signal columns
- And how to work around the inherent **non-determinism and selective attention** of transformers, even at temperature=0

None of these fixes changed our core functionality, but they dramatically improved how the model engaged with our system.

If you want to explore MCP servers further, you can find everything you need here:

- [Model Context Protocol documentation](https://modelcontextprotocol.io/docs/concepts/tools)
- [mark3labs/mcp-go](https://github.com/mark3labs/mcp-go) - the Go library we used
- [Anthropic's Go SDK](https://github.com/modelcontextprotocol/go-sdk) - the official SDK in development
