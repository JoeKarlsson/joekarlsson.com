---
title: 'Four Questions You Need To Ask When Choosing a Database'
date: 2021-12-29
slug: 'four-questions-you-need-to-ask-when-choosing-a-database'
description: 'Are you overwhelmed by the sheer amount of databases on the market today, and not sure where to start? Let’s say that you are a Software Developer, and you need to select a database for a brand new...'
categories: ['Databases']
heroImage: '/images/blog/four-questions-you-need-to-ask-when-choosing-a-database/img_blog_post_featured_bp-jk-top-4-questions-to-ask-when-choosing-a-database.webp'
heroAlt: 'Top 4 questions to ask when choosing a database'
contentNotice: false
tldr: 'Before picking a database, ask yourself four things: does it solve my actual problem, does it fit my tech stack, can my team learn it, and what will it really cost as we scale? I give you the specific sub-questions for each.'
---

Are you overwhelmed by the sheer amount of databases on the market today, and not sure where to start? Let’s say that you are a Software Developer, and you need to select a database for a brand new application or maybe you need to figure out a database to replace and upgrade your legacy database. There are so many databases out there on the market today and they often promise to do it all or they perform niche functions. When picking your next database, it’s important to understand what problems you are attempting to solve, so you can pick one that will fit your needs today, as well as in the future. So, what should you be considering when you are choosing your next database? Well, I’m glad you asked, because I’m here to help you. There is no silver bullet for picking a database for your application. That’s why it’s important to dig into your current and future needs by asking yourself these four questions. Be sure that you are asking yourself, your team, and the business these questions when you are evaluating databases.

- Note: For larger systems/applications, there’s usually a development TEAM, not a single developer. The choice of platform is likely to be made by the technical leader, or architect, or product manager – sometimes with, sometimes without input from the rest of the team.

## Does this database actually solve my problem?

The first question you need to ask yourself is, “Does this database actually solve the problem we are trying to solve?” Now, I know this is a broad question, and it helps to drill into outlining what the problem actually is, as well as how the database will be used by the business and by the engineering team. Not only that, but at this stage, it’s important to start forecasting how you might be using the database in the future. This is because migrating between databases is risky, and expensive, and you should try to prepare your data for as long as you can. It’s impossible to actually predict the future, but it can sure help to try to at this stage. Some additional questions you can ask yourself to determine if a database is solving your problems are:

- How much data do you expect to store when the application is mature?

- How many users do you expect to handle simultaneously at peak load?

- What availability, scalability, latency, throughput, and data consistency does your application need?

- How often will your database schemas change?

- Is your application read or write heavy?

- Do you need to use it for analytics? Relational and transactional workloads? Both?

- How fast do you need to retrieve data from the database? Does your data need to be consistent? Do you have an SLA?

- Can you handle any data loss? What kinds of guarantees do you need to keep your data consistent and to avoid loss?

- How long do you need to save your data for? Do you need to archive it?

- Do you need to follow some sort of compliance with your data? HIPAA, GDPR, CCPA, etc…

- What is the geographic distribution of your user population?

- What is the natural “shape” of your data?

- Does your application need online transaction processing (OLTP), analytic queries (OLAP), or both? For OLAP workloads, I've been impressed by [ClickHouse](/blog/why-clickhouse-should-be-your-next-database/). For document-oriented workloads, it's worth understanding [MongoDB schema design best practices](/blog/mongodb-schema-design-best-practices/). And if you need sub-second query latency on fresh data, take a look at my breakdown of [real-time databases](/blog/real-time-databases-what-developers-need-to-know/).

- What ratio of reads to writes do you expect in production?

- Do you have a budget? If so, will it cover licenses and support contracts?

- How strict are you with invalid data being sent to your database? (Ideally, you are very strict and do server-side data validation before persisting it to your database)

## Does this database integrate into my current tech stack?

It’s my humble opinion that the most important people to keep in mind when developing applications and selecting databases are the end users who will be using the software on top of your database. But the second most important people to keep in mind are the engineers that will be working with it directly. That’s why it’s so important to understand all the ways this database integrates with your applications tech stack. Be sure you ask your team these questions:

- What are your preferred programming languages?

- What programming language drivers does the database support? 

- Does this database need to connect to any of your business intelligence tools?

- What about other databases? Can the database integrate or will you need to write custom code?

- How is data going to be ingested into the database? CSV files from S3? Kafka pipelines? Event driven requests. Bulk imports?

- Will the data need to be transformed at all? How will you do this?

- Will you be integrating any machine learning into your data pipeline?

- Do you need to migrate your data into the new database? Is there a tool to assist you? Will you need to build one? What’s the risk?

Note: SingleStore is MySQL wire compatible so, chances are you already know how to use it, and it integrates with most languages and services out of the box. 

## Is this database easy to learn?

To me, this is often the most overlooked question when evaluating new databases. Your engineers will be working directly with the most important asset, your data. It’s important that the team understands how this database works and how to tune it for optimal performance. That’s why you should look into how healthy the developer community around the database is since these are the folks you will be turning to if you need assistance. Note: It’s important to understand how the engineers on your team learn, and what’s important to them. The point is not to prescribe HOW your team learns how to use the new database, but instead ensure that they have resources available in a way that works for them and time to dig in and learn. 

- Does the database use a common language like SQL or does it use a custom language (Many NoSQL use non-standard languages)?

- What kind of data and engineering culture do you have? Do you have a legion of SQL diehards that refuse to learn NoSQL? Are they open to learning something new?

- Does this database have documentation available online? Do they provide examples? Are they up to date?

- Do they have certifications available?

- Are their training materials available online? Are they free? Paid?

- Is there training materials available in different programming languages and mediums (written, video, live streamed)? 

- Are the languages the training materials are presented going to be understood by the team?

- Is there a community available to answer my questions?

- How healthy is the developer community? Can I get my questions answered quickly if I get stuck?

- Are there getting-started guides for my tech stack with the database? Are they up to date?

Note: The [SingleStore Training](https://www.singlestore.com/training/) page includes more self paced courses like Schema Design, Data Ingestion, Optimizing Queries, and more. And if you run into any issues or get stuck, make sure to connect with the [SingleStore community](https://www.singlestore.com/forum/) and get all of your questions answered, or check out more cool developer content on our [SingleStore Developer](https://developers.singlestore.com/) page. The community forums are the best place to get your SingleStore questions answered.

## How much does this database cost?

I find that many application developers don’t care much for how much running a database costs. But if you’ve ever looked at a cloud bill for running a database, you know that isn’t a trivial matter. Databases are sticky, which means that once you are saving your data in one, it’s hard to leave (i.e. Oracle). Oftentimes, databases start out quite affordable, but as you scale up your data usage the costs can start to exponentially increase. It’s important to not only understand the initial costs of the database, but the cost of migrating, and how the costs will change with the projected growth of your application over time. 

- What’s the initial cost of the database?

- Will you have to hire any new engineers to help manage the database?

- What’s the billing model for this database? Do they charge by license? Is it free and open source? Do they charge by the hour? Do they charge based on your total data stored? Do they charge based on data being transferred over the wire?

- How fast are your data demands currently growing? What do you predict they will be in 1 year? 5 years? 10 years?

- How will the costs scale as our data demands grow over time? What will it cost when we are saving 5x our current storage requirements? 10x? 100x?

- Will we need to duplicate our data into a staging or development environment? Will this affect cost?

- Will there be any other services required to run this database? What will those costs be?

- Is there a free tier for developers?

## Choosing a database

There is no single answer when trying to find the perfect database for you. But these are the four questions you need to ask when choosing a database:

- Does this database actually solve my problem?

- Does this database integrate into my current tech stack?

- Is this database easy to learn?

- How much does this database cost?

The most important thing is understanding all the tradeoffs and evaluating and prioritizing your needs to find a database that will work best for you, your team, and your application. That being said, I would totally recommend checking out [SingleStore](https://singlestore.com/). It’s massively scalable, is wire compatible with MySQL so you can use it anywhere, and handles a ton of different data types (like Key-Value, Document, Relational, Geo-Spatial, Text Search and more!). [So be sure to try SingleStore for free today.](https://www.singlestore.com/managed-service-trial/) Follow us on [X](https://x.com/singlestoredevs) to keep up on more cool dev stuff.
