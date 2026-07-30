---
title: 'How We Made Our IDEs Data-Aware with a Go MCP Server'
date: 2025-07-29
slug: 'how-we-made-our-ides-data-aware-with-a-go-mcp-server'
description: 'How we built a Go-based MCP server to make AI Assistants data-aware, bridging code and database, which ended up transforming the way we code.'
categories: ['Dev Tools']
tags: ['MCP', 'LLM', 'AI', 'Engineering', 'Go']
heroImage: '/images/blog/how-we-made-our-ides-data-aware-with-a-go-mcp-server/thumbnail.webp'
heroAlt: 'How we made our IDEs data-aware with a Go MCP Server'
canonicalUrl: 'https://www.cloudquery.io/blog/how-we-made-our-ides-data-aware-with-a-go-mcp-server'
tldr: 'We built a Go-based MCP server that bridges the gap between AI code assistants and our cloud infrastructure data. By exposing database schemas, queries, and insights directly to Claude, Cursor (or any client that supports MCP), our AI assistant now understands both our code and data. This eliminated context-switching, sped up workflows (from hours to minutes), and unlocked new ways to audit, analyze, and troubleshoot infrastructure.'
---

_Co-authored with Mariano Gappa at CloudQuery._

![How we made our IDEs data-aware with a Go MCP Server header](/images/blog/how-we-made-our-ides-data-aware-with-a-go-mcp-server/header.webp)

Most developers (and our own team) have been fully using AI code assistance to help with all aspects of building software. We have found that our AI-assisted IDEs know our functions, suggest completions, and help debug issues. However, their usefulness stopped dead at our database. AI assistants have zero understanding of what's actually in our tables, what queries make sense, or how your data connects together. This often results in hallucinations/bad data if you ever were to ask it a question about cloud infrastructure.

At [CloudQuery](https://www.cloudquery.io/), we've been running an experiment for months: what happens when you bridge that gap? We built an MCP server in Go (in fact, [our entire stack runs on Go](https://github.com/cloudquery/cloudquery)) that gives Claude or Cursor direct access to our cloud infrastructure database, and the results have fundamentally changed how our engineering team works.

This post covers what we learned about making LLMs truly data-aware, the technical gotchas nobody talks about, and why this pattern could transform how any team with substantial data operates.

## We noticed something...

We noticed something frustrating: our engineers (and users) were constantly switching between an AI assistant for code analysis and our platform for actual data queries.

**The workflow looked like this:**

- Claude/Cursor helps us write Go code for infrastructure analysis
- Engineer switches to CloudQuery to understand available tables
- Copy-paste table schemas back to Claude
- Manually explain column meanings and relationships
- Write more SQL queries, debug them separately
- Go back to Claude with the results for further analysis

![Meme with two panels: left shows a woman yelling and pointing while another woman holds her back, captioned: 'Engineers frantically switching between Claude for code and CloudQuery for data, copy-pasting schemas, manually explaining relationships.' Right panel shows a cat sitting at a dinner table looking indifferent, captioned: 'Claude completely clueless about what's actually in your database.'](/images/blog/how-we-made-our-ides-data-aware-with-a-go-mcp-server/image1.webp)

**We realized: What if AI Assistants could directly explore our data layer?**

By building an MCP server that exposes our database schemas, query capabilities, and data insights directly to your AI Assistant, we bridged this gap. Now Claude/Cursor/whatever doesn't just know our Go code - it knows our actual cloud infrastructure data.

## What We Built

When Anthropic dropped the Model Context Protocol in November with SDKs for [Python](https://github.com/modelcontextprotocol/python-sdk), [TypeScript](https://github.com/modelcontextprotocol/typescript-sdk), [Java](https://github.com/modelcontextprotocol/java-sdk), and [Kotlin](https://github.com/modelcontextprotocol/kotlin-sdk), but not Go, we had a problem. But also an opportunity.

We built our MCP server specifically to expose our data layer to Claude. We're using the [mark3labs/mcp-go](https://github.com/mark3labs/mcp-go) library since Anthropic doesn't have an official Go SDK yet (though [they're working on it](https://github.com/modelcontextprotocol/go-sdk)).

Here's what a bare bones MCP server looks like:

```go
package main

import (
    "context"
    "log"
    "github.com/mark3labs/mcp-go/mcp"
    "github.com/mark3labs/mcp-go/server"
)

func main() {
    s := server.NewMCPServer(
        "cloudquery-mcp",
        "1.0.0",
        server.WithLogging(),
    )

    s.AddTool(mcp.Tool{
        Name: "list_tables",
        Description: "List all available tables in the database",
        InputSchema: mcp.ToolInputSchema{
            Type: "object",
            Properties: map[string]interface{}{
                "pattern": {
                    "type": "string",
                    "description": "Optional regex pattern to filter table names",
                },
            },
        },
    }, handleListTables)

    if err := s.Serve(context.Background()); err != nil {
        log.Fatal(err)
    }
}
```

We created six specific tools that give your AI Assistant complete access to our data layer:

**Data Discovery Tools:**

- `list_installed_plugins` - Shows what cloud providers and services are available
- `table_search_regex` - Finds tables using pattern matching across all data sources
- `table_schemas` - Retrieves detailed schema information for specific tables

**Data Analysis Tools:**

- `column_search` - Locates specific fields across all tables (finding "tag" columns across different cloud providers)
- `execute_clickhouse_sql_query` - Runs analytical queries against our ClickHouse cluster
- `known_good_queries` - Provides working SQL examples for common infrastructure analysis

Each tool is designed around data exploration workflows rather than just exposing database operations. When your AI Assistant needs to understand our AWS security groups, it can now:

1. Discover that the AWS integration exists and is syncing data
2. Search for security-related tables
3. Retrieve the `aws_ec2_security_groups` schema
4. Execute queries to find groups allowing port 22 access
5. Cross-reference with instance data to assess actual risk

## Coding when the LLM Knows Your Data

The transformation in our engineering workflow has been dramatic. Here are specific examples of how bridging the code-data gap changed our day-to-day operations:

### Infrastructure Troubleshooting

**Before MCP server:** We suspected our CloudQuery sync wasn't converging properly. Resources would appear, disappear, then reappear in our database. To investigate required:

1. SSH into our server cluster
2. Write complex SQL queries joining sync metadata tables
3. Analyze patterns across multiple time windows
4. Cross-reference with CloudQuery's internal state tables
5. Document findings for the team

Total time: 2-3 hours, requiring deep SQL knowledge.

**After MCP server:** "Check if our asset sync data is converging properly for the production AWS account."

Claude uses our MCP tools to:

- Query sync run metadata across time windows
- Analyze resource count patterns and state transitions
- Cross-reference with expected AWS API responses
- Generate a comprehensive convergence report

![Screenshot of Claude's interface with the input box contains the question: 'Can you check if our CloudQuery asset sync data is converging for our production AWS account?' And showing Claude using the CloudQuery MCP server to query and analyze cloud asset data directly.](/images/blog/how-we-made-our-ides-data-aware-with-a-go-mcp-server/image5.gif)

### Security Analysis

Our security team regularly needs to audit cloud configurations. Previously, this meant:

1. Engineer receives security question about EC2 instances
2. Manually explores CloudQuery tables to understand schema
3. Writes queries to find relevant security groups, NACLs, instances
4. Cross-references data across multiple tables
5. Formats findings for security team

**Now:** "Audit our production AWS environment for instances with overly permissive security groups."

![Composite image showing a chat interface where a user asks: 'Can you help me find some security risks in my CloudQuery asset inventory?' The assistant replies with a plan to identify EC2 instances with public IPs and unrestricted SSH, and to create a dashboard. On the right, an AWS EC2 Security Dashboard is displayed, highlighting 7 instances with unrestricted SSH, 23 public instances, 34.2% permissive security group ratio, and 156 total instances.](/images/blog/how-we-made-our-ides-data-aware-with-a-go-mcp-server/image4.webp)

Your AI Assistant automatically:

- Explores EC2 instance and security group tables
- Identifies problematic configurations
- Cross-references with actual instance usage
- Provides remediation priorities

The security team gets actionable insights instead of raw data dumps.

## Final Thoughts

By giving Claude/Cursor direct access to our data layer through structured tools, we've created something genuinely new: an AI assistant that understands both our code AND our data.

![Epic Handshake meme. Left arm labeled 'Your Code,' right arm labeled 'Your Data,' and the handshake labeled 'MCP Server.'](/images/blog/how-we-made-our-ides-data-aware-with-a-go-mcp-server/image6.webp)

This pattern isn't specific to CloudQuery. Any team with substantial databases could benefit from this approach:

- **E-commerce teams:** AI Assistants could explore user behavior tables, understand purchase patterns, and suggest optimizations
- **SaaS companies:** Expose usage analytics, feature adoption data, and customer segments
- **Financial services:** Bridge the gap between trading algorithms and market data
- **Healthcare platforms:** Connect clinical code with patient data insights (with proper privacy controls)

The productivity gains compound when your AI assistant has full context of both code and data layers.

### The Bigger Picture

Building an MCP server taught me more about how LLMs actually work than months of reading papers. When you watch your AI assistants make decisions about data exploration, tool selection, and query optimization, you start understanding the practical potential of AI-assisted development.

**The code-data bridge we built isn't just a productivity hack. It's a preview of how software development changes when your AI assistant has full context of both your code and your data.**

I'd argue 99.99% of developers haven't thought of this pattern yet. But exposing your data layer to LLMs through MCP servers genuinely supercharges what's possible with AI-assisted development. The barrier between "I have a question about our data" and "I have a comprehensive answer" basically disappears.

That changes everything.
