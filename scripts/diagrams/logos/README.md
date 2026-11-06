# Diagram logos

Real logos for post diagrams, all transparent SVG. `draw.mjs` lists each one in
`LOGOS` and picks the version that reads on the surface it sits on.

| File                                                            | Source                                          | Use                                   |
| --------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------- |
| `claude.svg`                                                    | [Simple Icons](https://simpleicons.org) 13.21.0 | Claude, Claude Code                   |
| `salesforce.svg`, `zendesk.svg`, `stripe.svg`                   | Simple Icons 13.21.0                            | Those apps                            |
| `python.svg`                                                    | Simple Icons 13.21.0                            | Python code (play.py)                 |
| `amazonwebservices.svg`                                         | Simple Icons 13.21.0                            | AWS                                   |
| `googlebigquery.svg`                                            | Simple Icons 13.21.0                            | BigQuery                              |
| `openai.svg`, `anthropic.svg`, `meta.svg`                       | Simple Icons 13.21.0                            | OpenAI and ChatGPT, Anthropic, Meta   |
| `jira.svg`, `slack.svg`, `googleanalytics.svg`                  | Simple Icons 13.21.0                            | Those apps                            |
| `snowflake.svg`, `sap.svg`, `postgresql.svg`, `apachekafka.svg` | Simple Icons 13.21.0                            | Those data sources                    |
| `mongodb.svg`, `googlecloud.svg`                                | Simple Icons 13.21.0                            | MongoDB, Google Cloud                 |
| `modelcontextprotocol.svg`                                      | Simple Icons 15.10.0 (not in 13.21.0)           | MCP                                   |
| `connect-ai-color-on-dark.svg`                                  | CData brand kit, Connect AI agility-clarity     | Connect AI on black                   |
| `connect-ai-color-on-light.svg`                                 | CData brand kit, Connect AI agility-depth       | Connect AI on chalk or white          |
| `connect-ai-black.svg`, `connect-ai-white.svg`                  | CData brand kit, depth and clarity              | One-colour Connect AI (black on pink) |
| `cdata-color.svg`, `cdata-black.svg`, `cdata-white.svg`         | CData brand kit monograms                       | The CData mark                        |

Simple Icons files are a single black path: `draw.mjs` fills them with the
brand colour from `LOGOS`, or white or black when that colour falls under 3:1
contrast against the surface. The CData brand kit lives in
`~/Documents/dev/joe/connect-doom/brand/BRANDKIT/02 Logos`.

To add a logo: download the Simple Icons SVG (`https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/<name>.svg`)
or copy the company's own transparent SVG here, then add an entry to `LOGOS`.

Not available as a usable vector: Microsoft SQL Server (Microsoft had it removed
from Simple Icons), NetSuite, SharePoint, Microsoft Teams, Tinybird and Doom. Figures name those without a logo.
