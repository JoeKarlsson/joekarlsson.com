---
title: 'A step-by-step guide to build a real-time dashboard'
date: 2024-03-30
slug: 'a-step-by-step-guide-to-build-a-real-time-dashboard'
description: 'Can you imagine shipping a new user-facing dashboard only to have your users met with a visualization that takes several seconds or even minutes to load? No way, right? Your users would get...'
categories: ['Databases']
heroImage: '/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/64f23ec5d8fe4c29723ee435_Build-a-real-time-dashboard-step-.webp'
heroAlt: 'Step-by-step guide to building a real-time dashboard with Tinybird and Next.js'
tldr: 'I walk through building a real-time dashboard from scratch using Tinybird for the data backend and Next.js for the frontend. You will learn how to ingest streaming data, write SQL queries, publish them as APIs, and wire it all up to live charts.'
---

Can you imagine shipping a new user-facing dashboard only to have your users met with a visualization that takes several seconds or even _minutes_ to load? No way, right? Your users would get frustrated by the opportunities missed, efficiencies destroyed, and decisions delayed based on outdated information and a horrible user experience.

Sadly, this is the status quo for many who build dashboards into their products. If you don’t know how to build real-time data architectures, you’ll be stuck with inefficient, legacy business intelligence platforms that can’t keep pace with user-facing features.

Learn how to build a real-time dashboard from end-to-end in our online free training on March 13th. [Register here](https://www.tinybird.co/live-coding-sessions/kafka-real-time-dashboard?utm_campaign=q1-2024-blog-lcs-referral).

The contrast of this scenario with today’s [real-time analytics landscape](https://www.tinybird.co/blog-posts/real-time-analytics-a-definitive-guide) couldn’t be more stark, underlining just how vital it is to give your users immediate access to data analytics.

![Hide the Pain Harold meme about looking at a real-time dashboard instead of a spreadsheet](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-16.webp)

Release the pain, Harold.

In this post, we’re going to build real-time dashboards from scratch within a user-facing application. And we’re not doing it the old-fashioned way, oh no! We’re using some of my personal favorite tech out there: Tinybird, Tremor, and Next.js.

This post will walk through all of the steps to building a real-time dashboard using just these 3 tools. You can follow along here without any prior knowledge or resources, or if you’d like to work with and augment an existing project, you can clone this [GitHub repo](https://github.com/tinybirdco/signatures-dashboard) (which is the culmination of this guide, and then some).

> In this post you’ll learn to create a real-time dashboard from scratch (for free) using Tinybird, Tremor, and Next.js.

And by the way, you can do all of this for free. 🤑

Before we jump in, let’s talk about what we mean by a “real-time dashboard” and why most dashboards aren’t “real-time.” If you’re just here for the tutorial, you can [skip ahead](https://www.tinybird.co/blog-posts/real-time-dashboard-step-by-step#tutorial--building-a-real-time-data-analytics-dashboard).

## What is a real-time dashboard?

A real-time dashboard is an interactive [real-time data visualization](https://www.tinybird.co/blog-posts/real-time-data-visualization) that displays continually updated metrics. It incorporates data that is just seconds old, refreshes almost instantaneously, and can support many concurrent viewers at once. Unlike traditional business intelligence dashboards that update on a periodic or batch basis, real-time dashboards pull in data as it is created, processed, or changed, providing an up-to-the-second snapshot of a system or process.

![Animated real-time dashboard serving fresh data to concurrent users](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/64f2397e26737f58a3a8e5b2_RJqiXc4ZybopbNjI9ySkEeBL3.gif)

A real-time dashboard should serve fresh data quickly to many concurrent users.

The primary components of a real-time dashboard include:

- **Data Sources**: The real-time feeds of information from various systems, services, and devices. Examples include sensor readings, user activity on a website, sales transactions, or social media interactions.

- **Data Processing Engine**: The system that aggregates, filters, and transforms the raw data from various sources into a format that can be consumed by a frontend application.

- **Visualization Layer**: The frontend app that brings the data to life through graphs, charts, maps, and other visuals. In a real-time dashboard, these visual components update near-instantaneously, reflecting the most current state of the data sources.

- **Interactive Controls**: Components by which users can interact with real-time dashboards, such as by adjusting filters, drilling down into detailed views, or setting alerts for specific conditions. These features empower users to explore data in more depth and respond to changes more swiftly.

### Why are most dashboards slow?

Let’s be honest, most dashboards aren’t of the “real-time” variety. But why?

![Terminal output showing npm run seed sending account and signature data to Tinybird](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-14.webp)

The problem is the underlying architecture and the manner in which the data is handled. Here are the main reasons that dashboards are slow:

- **Batch ETL (Extract, Transform, Load) Processes**: Many dashboards rely on batch ETL processes that collect, transform, and load data at specific intervals. These time-bound processes result in data that isn’t fresh. It doesn’t matter if a dashboard can refresh in 50 milliseconds if the data it’s showing is hours or days old.

- **Complex Business Intelligence (BI) Tools**: BI tools were designed for a small handful of users to run and visualize complex analytical queries over a database or data warehouse. While they are powerful for internal reporting and dashboarding, they tend to be slow. They’re not optimized for user-facing applications and often struggle with high query latencies and minimal user concurrency.

- **Poorly Configured Data Stack**: Most databases, data warehouses, and data processing layers aren’t optimized for [real-time analytics](https://www.tinybird.co/blog-posts/real-time-analytics-a-definitive-guide). Things like inefficient indexing, [row-based storage](https://www.tinybird.co/blog-posts/when-to-use-columnar-database), improper data partitioning, and lack of in-memory processing can all cause bottlenecks in the data flow.

- **Poorly Designed Queries**: Inefficient or poorly constructed queries can significantly slow down data retrieval. Bad indexing, heavy joins, and full table scans all contribute to slow dashboards.

- **Lack of Scalability**: Real-time dashboards need to be able to scale with big data and with many concurrent users. A modern real-time dashboard must be built with scalability in mind to ensure that performance does not degrade as demand grows.

> Most dashboards are slow because the underlying data pipelines are slow.

To build real-time dashboards, you need a real-time streaming data architecture. For more information on building such an architecture, [read this post](https://www.tinybird.co/blog-posts/real-time-streaming-data-architectures-that-scale). And if you're still figuring out which database to use under the hood, I put together a breakdown of [real-time databases and what developers need to know](/blog/real-time-databases-what-developers-need-to-know/) about each option.

## Tutorial: Building a real-time data analytics dashboard

Okay, so what are we building? Imagine you’re a DocuSign competitor. You’re building a SaaS to disrupt the document signature space, and as a part of that, you want to give your users a real-time data analytics dashboard so they can monitor how, when, where, and what is happening with their documents in real time.

> We’re building a real-time dashboard for a hypothetical DocuSign competitor.

Let’s build that dashboard.

To do so, we’ll be using:

- [Tinybird](https://www.tinybird.co/) for [real-time data ingestion](https://www.tinybird.co/blog-posts/real-time-data-ingestion), real-time data processing, and real-time APIs.

- [Tremor](https://www.tremor.so/) components for the data visualization. It turns those numbers and statistics into something beautiful.

- [Next.js](https://nextjs.org/) as a fully-featured React framework. It ensures everything looks slick and runs smoothly.

What will _you_ build?

This is just an example project. The specific use case is irrelevant. You can take the structure we’re about to explore and apply it to pretty much any use case you can dream of. So follow along, and learn how to build _any_ real-time dashboard.

### The Tech Stack

Here’s the flow of what we’re building today:

![Architecture diagram showing Events to Tinybird to Next.js to Tremor to Visualization](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-1-1.webp)

In this tutorial, we’ll use Tinybird to capture event streams, process them with SQL, and expose the transformations as real-time APIs. Then we’ll use Tremor components in a Next.js app to build a beautiful, responsive, real-time dashboard.

- **Events** (like a document being sent, signed, or received) will be sent to the [Tinybird Events API](https://www.tinybird.co/docs/ingest/events-api.html), an HTTP streaming endpoint that captures events and writes them to a [columnar base](https://www.tinybird.co/blog-posts/what-is-a-columnar-database) optimized for [real-time analytics](https://www.tinybird.co/blog-posts/real-time-analytics-a-definitive-guide).

- **Tinybird** is a [real-time data platform](https://www.tinybird.co/blog-posts/real-time-data-platforms) that we can use to build real-time metrics with SQL and instantly publish them as APIs.

- **Tremor** will then poll the API endpoints we publish in Tinybird and visualize the real-time metrics as beautiful visualizations.

- **Next.js** as a React framework for building our dashboard.

## How to build a real-time dashboard from scratch

To build a real-time dashboard from scratch, you’ll follow these steps:

- [Step 0: Install prerequisites](https://www.tinybird.co/blog-posts/real-time-dashboard-step-by-step#step-0--install-prerequisites)

- [Step 1: Create a mock data stream](https://www.tinybird.co/blog-posts/real-time-dashboard-step-by-step#step-1--create-a-mock-data-stream)

- [Step 2: Build dashboard metrics with SQL in Tinybird](https://www.tinybird.co/blog-posts/real-time-dashboard-step-by-step#step-2--build-dashboard-metrics-with-sql-in-tinybird)

- [Step 3: Publish metrics as APIs using Tinybird](https://www.tinybird.co/blog-posts/real-time-dashboard-step-by-step#step-3--publish-metrics-as-apis-using-tinybird)

- [Step 4: Create real-time dashboard components with Tremor and Next.js](https://www.tinybird.co/blog-posts/real-time-dashboard-step-by-step#step-4--create-real-time-dashboard-components-with-tremor-and-next-js)

### Step 0: Install Prerequisites

Before you get started, you’ll need to have the following prerequisites installed:

- Node.js (version 18 or above)

- Python (version 3.8 or above)

For information on installing those, check out their docs: [Node.js](https://nodejs.org/en/download) and [Python](https://www.python.org/downloads/).

#### Initialize your Next.js project

Once you have those installed, create a new Next.js app. In this demo, I’ll be using plain JavaScript files (no TypeScript) and Tailwind CSS.

```bash
npx create-next-app signatures-dashboard --js --tailwind --eslint --src-dir
```

When prompted, select “Yes” for App Router and “No” for customizing the default import alias.

```bash
cd signatures-dashboard
mkdir data-project data-project/utils
```

Next, create some folders in your Next.js project. We’ll use these for the Tinybird resources we create later.

#### Create a Tinybird Account and Workspace

Tinybird is the [real-time data platform](https://www.tinybird.co/blog-posts/real-time-data-platforms) that underpins our real-time dashboard. If you’re new to Tinybird, [create a free account here](https://www.tinybird.co/signup?referrer=https%3A%2F%2Fwww.tinybird.co%2Fblog-posts%2Freal-time-dashboard-step-by-step). After you’ve created an account, you’ll be prompted to create a Workspace. Go ahead and do that. You can choose the region in which you’d like to host your Workspace, and I recommend you choose the one that’s geographically closest to you and your users. I’ve created mine in the `EU` region and named it `signatures_dashboard`.

![Tinybird create workspace dialog with signature_dashboard workspace name](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-11.webp)

#### Install the Tinybird CLI

The Tinybird CLI is a command-line tool that allows you to interact with Tinybird’s API. You will use it to create and manage the data project resources that underpin your real-time dashboard.

To install the Tinybird CLI, run the following commands:

```bash
python3 -mvenv .e
. .e/bin/activate
pip install tinybird-cli
tb auth –interactive
```

Choose the region in which you created your Workspace. You’ll then be prompted for your Admin token. Go to[ https://ui.tinybird.co/tokens](https://ui.tinybird.co/tokens) (or [https://ui.us-east.tinybird.co/tokens](https://ui.tinybird.co/tokens) for US-East regions) and copy the token with admin rights. Paste it into the CLI and press enter.

![Tinybird auth tokens management page showing workspace and user tokens](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-5.webp)

You’ll be authenticated to your workspace, and your auth details will be saved in a `.tinyb` file in the current working directory.

WarningYour Admin token has full read/write privileges for your Workspace. Don’t share it or publish it in your application. You can find more detailed info about Tinybird Auth Tokens in the [docs](https://www.tinybird.co/docs/api-reference/token-api.html).

```bash
echo ".tinyb" >> .gitignore
```

Per the warning above, ensure that the `.tinyb` file is not publicly exposed by adding it to your `.gitignore` file:

### Step 1: Create a mock data stream

If you’re building a real-time data dashboard using existing data streams, then you won’t need to follow this step. But since I’m building a dashboard for a hypothetical document signature SaaS, I’ll need some mock data to work with!

To get that mock data, I used the JavaScript Faker library (the same library that powers [Mockingbird](https://mockingbird.tinybird.co), the [free, open-source mock data stream generator](https://www.tinybird.co/blog-posts/mockingbird-announcement-mock-data-generator) by Tinybird).

We’re going to use the [`mockDataGenerator.js`](https://github.com/tinybirdco/demo-user-facing-saas-dashboard-signatures) script in the linked repository to create some mock account and signatures data and send it to Tinybird.

But before we do, let’s peek into this code to get a feel for what it’s doing.

The `mockDataGenerator.js` script generates mock user accounts, with fields like `account_id`, `organization`, `phone_number`, and various certification statuses related to the account’s means of identification:

```js
const generateAccountPayload = () => {
	const status = ['active', 'inactive', 'pending'];
	const id = faker.number.int({ min: 10000, max: 99999 });
	account_id_list.push(id);

	return {
		account_id: id,
		organization: faker.company.name(),
		status: status[faker.number.int({ min: 0, max: 2 })],
		role: faker.person.jobTitle(),
		certified_SMS: faker.datatype.boolean(),
		phone: faker.phone.number(),
		email: faker.internet.email(),
		person: faker.person.fullName(),
		certified_email: faker.datatype.boolean(),
		photo_id_certified: faker.datatype.boolean(),
		created_on: faker.date
			.between({ from: '2020-01-01', to: '2023-12-31' })
			.toISOString()
			.substring(0, 10),
		timestamp: Date.now(),
	};
};
```

```js
const generateSignaturePayload = (
	account_id,
	status,
	signatureType,
	signature_id,
	since,
	until,
	created_on,
) => {
	return {
		signature_id,
		account_id,
		status,
		signatureType,
		since: since.toISOString().substring(0, 10),
		until: until.toISOString().substring(0, 10),
		created_on: created_on.toISOString().substring(0, 10),
		timestamp: Date.now(),
		uuid: faker.string.uuid(),
	};
};
```

In addition, the code generates mock data events about the document signature process, with variable `status` values such as `in_queue`, `signing`, `expired`, and `error`, amongst others:

```js
const finalStatus = faker.helpers.weightedArrayElement([
	{ weight: 7.5, value: 'completed' },
	{ weight: 1, value: 'expired' },
	{ weight: 0.5, value: 'canceled' },
	{ weight: 0.5, value: 'declined' },
	{ weight: 0.5, value: 'error' },
]); // 7.5/10 chance of being completed, 1/10 chance of being expired, 0.5/10 chance of being canceled, declined or error
```

Finally, the generator will create and send a final status for the signature using some weighted values:

```bash
cd data-project
ls
# mockDataGenerator.js      utils
```

Now download the [`mockDataGenerator.js`](https://github.com/tinybirdco/demo-user-facing-saas-dashboard-signatures) file from the repository or copy the code into a new file called `mockDataGenerator.js` and place it into the `data-project` directory.

You may have noticed that this script utilizes a couple of helper functions to access your Tinybird token and send the data to Tinybird with an HTTP request using the [Tinybird Events API](https://www.tinybird.co/docs/ingest/events-api.html). These helper functions are located in the [`tinybird.js`](https://github.com/tinybirdco/demo-user-facing-saas-dashboard-signatures) file in the repo. Download that and add it to the `data-project/utils` directory.

```js
export async function send_data_to_tinybird(name, token, payload) {
	const events_url = 'https://api.tinybird.co/v0/events?name=';

	return fetch(events_url + name, {
		method: 'POST',
		body: JSON.stringify(payload),
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
		.then((res) => res.json())
		.catch((error) => console.log(error));
}
```

Below is the code for the helper function that sends data to Tinybird via the Events API.

The Tinybird Events API is useful for two reasons:

- It allows for the flexible and efficient ingestion of data, representing various stages of signatures, directly into the Tinybird platform without needing complex streaming infrastructure.

- It allows you to stream events directly from your application instead of relying on batch ETLs or change data capture which requires the events to first be logged in a transactional database, which can add lag to the data pipeline.

```bash
npm install @faker-js/faker
```

You’ll also need to install the Faker library:

```json
“seed”: “node data-project/mockDataGenerator.js”
```

To run this file and start sending mock data to Tinybird, you’re going to create a custom script in our `package.json` file. So open up that file and add the following to the `scripts`:

Note that since our code is using ES modules, we’ll need to add `”type”: “module”` to the `package.json` file to be able to run the script and access the modules. For more information on why, you can read [this helpful post](https://www.codeconcisely.com/posts/nextjs-esm/).

```json
{
	"name": "signatures-dashboard",
	"version": "0.1.0",
	"private": true,
	"type": "module",
	"scripts": {
		"seed": "node data-project/mockDataGenerator.js",
		"dev": "next dev",
		"build": "next build",
		"start": "next start",
		"lint": "next lint"
	},
	"dependencies": {
		"@faker-js/faker": "^8.0.2",
		"autoprefixer": "10.4.15",
		"eslint": "8.48.0",
		"eslint-config-next": "13.4.19",
		"next": "13.4.19",
		"postcss": "8.4.28",
		"react": "18.2.0",
		"react-dom": "18.2.0",
		"tailwindcss": "3.3.3"
	}
}
```

Once you’re done, your `package.json` should look something like this:

```bash
mv next.config.js next.config.cjs
mv postcss.config.js postcss.config.cjs
```

Also, since we’re setting the type as `module`, we’ll need to treat our Next.js and PostCSS config scripts as CommonJS scripts:

```bash
npm run seed
```

To begin sending this mock data to Tinybird, run the following command from your local project directory (assuming you added the script to your `package.json`):

You should start seeing your mock data being sent to Tinybird.

![Terminal output showing mock data being sent to Tinybird](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/64f2398091cf83b3815b7b50_ZRt0Lu1RnKqHxkqJOBdNYJu1u.webp)

![Data seeding script sending mock data to Tinybird](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-14.webp)

Sending mock data to Tinybird with our data seeding script.

Let this mock data generator run in the background so you can have some data to play with in the next step.

To verify that the data is flowing properly into Tinybird, inspect the Tinybird Data Sources. In the Tinybird UI, navigate to the `signatures` and `accounts` Data Sources to confirm that the data has been received. The latest records should be visible.

![Tinybird signatures data source showing 2k rows with ingestion graph and data preview](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-10.webp)

```bash
tb sql “select count() from signatures”
```

Likewise, you can use the Tinybird CLI to monitor rows being created in the data sources. For example:

This will return the current number of rows in the `signatures` Data Source. If your mock data creation is working (and still running in the background), you’ll see that number tick up.

> Reminder: This project is using mock data streams to simulate data generated by a hypothetical document signatures app. If you have your own app that’s generating data, you don’t need to do this! You can just add the helper functions to your codebase and call them to send data directly from your app to Tinybird.

### Step 2: Build dashboard metrics with SQL in Tinybird

You now have events streaming into Tinybird, which will ensure your real-time dashboard has access to fresh data. The next step is to build real-time metrics using [Tinybird Pipes](https://www.tinybird.co/docs/concepts/pipes.html).

In Tinybird, a Pipe is a set of chained, composable nodes of SQL that process, transform, and enrich data in your Data Sources.

Here’s why you’ll love Pipes:

- **Performance:** Pipes process new data in real time, allowing for rapid transformations on streaming data sets.

- **Flexibility:** Pipes let you define custom data processing flows using filters, aggregations, and joins, enabling complex analytics and insights.

- **Scalability:** Pipes can handle massive volumes of data, scaling with your needs.

- **Ease of Use:** Pipes break up larger SQL queries into manageable nodes, which makes it easier to prototype, debug, and identify performance bottlenecks.

- **Maintainability:** Pipes organize the data workflow intuitively, making it easier to understand and modify.

To create a new Pipe in the Tinybird UI, start from your Workspace dashboard ([https://ui.tinybird.co](https://ui.tinybird.co)). Click the Plus (`+`) icon in the left-side navigation bar next to the Pipes section.

Now for the fun part. Define your real-time dashboard metrics using chained nodes of SQL. Below, for example, is a node that filters and groups signature data by `account_id` for a specified date range, then orders the results by the total count.

![Tinybird Pipe SQL node filtering signatures by account and date range](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/64f2397ff675358d751697ce_eMd481MY7ykvzW9gjULlu31kU.webp)

```sql
SELECT
  account_id,
  count() AS total
FROM signatures
WHERE
	fromUnixTimestamp64Milli(timestamp)
	BETWEEN '2023-01-01'
	AND '2024-01-01'
GROUP BY account_id
HAVING total > 0
ORDER BY total DESC
```

#### Making your queries more dynamic

The SQL above uses static date range filters, but as I described earlier, real-time dashboards should be interactive. Instead of hardcoding the date range, we want our users to be able to select a dynamic range and have the results refresh in real time.

You can do this in Tinybird with its [templating language](https://www.tinybird.co/docs/query/query-parameters), which lets you define dynamic, typed query parameters as well as add custom logic such as `if/else` statements and more.

Take a look at the updated SQL below using the Tinybird templating language. I’ve made two changes:

- Added an `if defined` statement. This clause tells the Pipe to execute the statements only if a certain parameter is passed. In this case, I’ve created logic such that if a boolean tag called `completed` is passed, the Pipe calculates the number of completed signatures. Otherwise, it calculates all signatures.

- Added `date_from` and `date_to` query parameters (`Date` type), which will dynamically change the filter based on the date values passed.

```sql
SELECT
  account_id,
  {% if defined(completed) %}
    countIf(status = 'completed') total
  {% else %}
    count() total
  {% end %}
FROM signatures
WHERE
    fromUnixTimestamp64Milli(timestamp)
    BETWEEN {{
        Date(
            date_from,
            '2023-01-01',
            description="Initial date",
            required=True,
        )
    }}
    AND {{
Date(
  date_to,
   '2024-01-01',
   description="End date",
    required=True
)
     }}
GROUP BY account_id
HAVING total > 0
ORDER BY total DESC
```

Now, name this node `retrieve_signatures`.

![Tinybird retrieve_signatures pipe node with SQL query using dynamic date parameters](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-9.webp)

```sql
SELECT
  organization,
  sum(total) AS org_total
FROM retrieve_signatures
LEFT JOIN accounts ON accounts.account_id = retrieve_signatures.account_id
GROUP BY organization
ORDER BY org_total DESC
LIMIT {{Int8(limit, 10, description="The number of rows accounts to retrieve", required=False)}}
```

Below this node, create a new Node with the following SQL:

Name this node `endpoint`.

![Tinybird endpoint pipe node with SQL joining signatures and accounts to rank organizations](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-7.webp)

You now have a 2-node Pipe that gets the top <`limit`> organizations by signatures within a date range, either completed or total depending on whether you pass a `completed` query parameter.

At the top of the UI, name this Pipe `ranking_of_top_organizations_creating_signatures`.

![Tinybird pipe overview showing ranking_of_top_organizations with four dynamic parameters](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-15.webp)

### Step 3: Publish metrics as APIs using Tinybird

You’ll want to build an API (Application Programming Interface) for your dashboard to ensure smooth integration, accessibility, and interaction with other applications or services.

Here’s why real-time APIs are so important for fast dashboards with many users:

- **Integration & Interoperability:** APIs allow your dashboard to be accessed programmatically by other applications. This enables a deeper integration with different platforms, tools, or third-party services.

- **Scalability:** Through APIs, the dashboard can be quickly and easily scaled to serve multiple clients, including web, mobile, or IoT devices. This ensures that as your needs grow, your architecture can adapt without major redesigns.

- **Real-Time Data Access:** If your dashboard relies on real-time or frequently updated data, APIs are essential for providing up-to-the-minute access to the information, enhancing decision-making and user experience.

With Tinybird, it’s trivial to create low-latency, high-concurrency REST APIs from your Pipes. Simply open the Pipe that you want to publish and click the “Create API Endpoint” button in the top right corner of the screen. Then select the Node that you want to publish, in this case `endpoint`.

![Tinybird Create API Endpoint dropdown selecting the endpoint node](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-12.webp)

With that, your API has been created! You’ll be greeted with an API page that contains a usage monitoring chart, parameter documentation, and sample usage. In addition, the API has been secured through an automatically generated read-only Auth Token.

Now let’s test your new API! Copy the HTTP endpoint from the sample usage and paste it directly into your browser to see the response.

![Tinybird API sample usage showing HTTP endpoint URL and JSON response with organization rankings](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-13.webp)

Within the endpoint URL, you will notice the `date_from` and `date_to` parameters. These control the date range for the query, and they can be modified to filter the results accordingly. You’ll also see the `limit` parameter, which controls how many rows are returned.

Try altering the values for these parameters in the browser’s address bar. As you change the dates or limit and refresh the page, you should see different data returned in response to your query. This behavior verifies that the dynamic filtering is working correctly, allowing the query to adapt to different user inputs or requirements.

```json
"statistics": {
    "elapsed": 0.001110996,
    "rows_read": 4738,
    "bytes_read": 101594
}
```

If you request the data in a JSON format, you’ll also receive some metadata about the response, including statistics about the query latency:

In the above example, the API response took barely 1 millisecond, which is a recipe for fast dashboards! You can utilize this metadata to continue to monitor your dashboard query performance and optimize as needed.

#### Pulling your Tinybird project into your local directory

If you want to pull the Tinybird resources into your local directory so that you can manage this project with git, you can do so as follows.

```bash
tb pull –auto
mv datasources pipes data-project/
```

In your terminal, start by pulling the Tinybird data project and putting the resources into your `data-project` directory:

You’ll see a confirmation that 3 resources (`signatures.datasource`, `accounts.datasource`, and `ranking_of_top_organizations_creating_signatures.pipe`) were written into two subfolders, `datasources` and `pipes`, which were created by using the `--auto` flag.

As you add additional resources in the Tinybird UI, simply use that same command to pull files from Tinybird. You can then add them to your git commits and push them to your remote repository.

If you create data project resources locally, you can push them to the Tinybird server with `tb push`. For more information on managing Tinybird data projects in the CLI, check out [this CLI overview](https://www.tinybird.co/docs/cli/overview).

### Step 4: Create real-time dashboard components with Tremor and Next.js

Now that you have a low-latency API with real-time dashboard metrics, let’s create the visualization layer using Next.js and Tremor. These two tools give us a scalable and responsive interface that can effectively integrate with Tinybird’s APIs to display data dynamically.

Here’s how you can get started:

#### Add Tremor to your Next.js app

We’re going to use Tremor to create a simple bar chart that displays the signature count for each organization. Tremor gives you beautiful React chart components that you can deploy easily and customize as needed.

```bash
npx @tremor/cli@latest init
```

Start by installing Tremor with the CLI:

Select `Next` as your framework and allow Tremor to overwrite your existing `tailwind.config.js`.

#### Set up environment variables

```bash
NEXT_PUBLIC_TINYBIRD_HOST=your_tinybird_host # (e.g. api.tinybird.co)
NEXT_PUBLIC_TINYBIRD_TOKEN=your_tinybird_token
```

Next, you need to add your Tinybird host and admin token as environment variables so you can run the project locally. Add the following to your `.env.local` file:

#### Set up your index.js

```bash
cd src/pages
code index.js
```

Let’s create an index page to build and display our real-time dashboard.

Next.js may have made a default `index.js`, in which case start by clearing its contents.

#### Import UI libraries

```jsx
'use client';

import { Card, Text, Subtitle, Title, BarChart } from '@tremor/react';
import React, { useState, useEffect } from 'react';
```

To build your dashboard component, you will need to import various UI elements and functionalities from the libraries provided. Make sure you have the following libraries and components imported at the beginning of your file:

> Note we’re using the `use client;` directive to render the components on the client side. For more details on this, check out the [Next.js docs](https://nextjs.org/docs/app/building-your-application/rendering#network-boundary).

#### Define constants and states

```js
// Get your Tinybird host and token from the .env file
const TINYBIRD_HOST = process.env.NEXT_PUBLIC_TINYBIRD_HOST; // The host URL for the Tinybird API
const TINYBIRD_TOKEN = process.env.NEXT_PUBLIC_TINYBIRD_TOKEN; // The access token for authentication with the Tinybird API

export default function Dashboard() {
    // React state hook for managing the "newSignaturesPerDay" data
    // Initializes data with an array containing an object with default values for the top orgs creating signatures
    const [ranking_of_top_organizations_creating_signatures, setData] = useState([{
    	"organization": "",
    	"org_total": 0,
    }]);

    // Initializes latency with an integer 0
    const [latency, setLatency] = useState(0);
```

Inside your main component, define the constants and states required for this specific component. We’re going to set the state for the chart data and the latency of the query (so we can see how fast this dashboard is!):

#### Connect your dashboard to your Tinybird API

You’ll need to write a function to fetch data from Tinybird. Note that for the sake of brevity, we are hardcoding the dates and using the default limit in the Tinybird API. You could set up a [Tremor datepicker](https://www.tremor.so/docs/ui/date-range-picker) and/or [number input](https://www.tremor.so/docs/components/number-input) if you wanted to dynamically update the dashboard components from within the UI.

```js
// Define hardcoded date range for the query
const dateFrom = new Date(2023, 0, 1); // Start date for the query (January 1st, 2023; JavaScript months are 0-indexed)
const dateTo = new Date(2023, 11, 31); // End date for the query (December 31st, 2023)

// Format for passing as a query parameter
const dateFromFormatted = dateFrom.toISOString().substring(0, 10);
const dateToFormatted = dateTo.toISOString().substring(0, 10);

// Constructing the URL for fetching data, including host, token, and date range
const topRankingOfOrganizationsCreatingSignaturesURL = `https://${TINYBIRD_HOST}/v0/pipes/ranking_of_top_organizations_creating_signatures.json?token=${TINYBIRD_TOKEN}&date_from=${dateFromFormatted}&date_to=${dateToFormatted}`;

// Function to fetch data from Tinybird URL
const fetchTinybirdUrl = async (fetchUrl, setData, setLatency) => {
	const data = await fetch(fetchUrl); // Performing an asynchronous HTTP fetch request
	const jsonData = await data.json(); // Parsing the response as JSON
	console.log(jsonData.data); // Logging the parsed data for debugging purposes
	console.log(jsonData.statistics.elapsed);
	setData(jsonData.data); // Setting the state with the fetched data
	setLatency(jsonData.statistics.elapsed); // Setting the state with the query latency from Tinybird
};
```

#### Configure the Tinybird API Call

You need to define the specific URL for the Tinybird API call and make the fetch request using the `fetchTinybirdUrl` function inside the `useEffect` hook:

```js
// useEffect hook to handle side-effects (in this case, fetching data) in a functional component
useEffect(() => {
	// Calling the fetchTinybirdUrl function with the URL and state setter function
	// The function fetches the data and updates the state
	fetchTinybirdUrl(topRankingOfOrganizationsCreatingSignaturesURL, setData, setLatency);
}, [topRankingOfOrganizationsCreatingSignaturesURL]); // The effect will rerun if the value of topRankingOfOrganizationsCreatingSignaturesURL changes
```

#### Render the Component

Finally, include the rendering code to display the “Ranking of the top organizations creating signatures” in the component’s return statement:

```jsx
return (
    <Card>
            <Title>Top Organizations Creating Signatures</Title>
            <Subtitle>
                Ranked from highest to lowest
            </Subtitle>
            <BarChart
                className="mt-6"
                data={ranking_of_top_organizations_creating_signatures}
                index="organization"
                categories={["org_total"]}
                colors={["blue", "red"]}
                yAxisWidth={48}
                showXAxis={true}
            />
            <Text>Latency: {latency*1000} ms</Text>
        </Card>
);
}
```

To view your real-time dashboard component, run the following:

[View the interactive dashboard snippet](https://snippets.tinybird.co/XQAAAAJbAAAAAAAAAABBKUqGk9nLKvRhdt7jwU0BO7-jo5YmrmXP95NHxwkAEidOTOER9mmwsKD-ochEVM96Dr8kw2mNXVOJsQLOq4_LRekG_lci3pLAg8wCoZQ3nc1ISo6Mjjc5ygf-hv8A/embed)

Navigate to `​​`[`http://localhost:3000/`](http://localhost:3000/) in your browser. You should see something like this:

![Bar chart of top organizations creating signatures with tooltip showing Wuckert Group at 1136](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-8.webp)

And that’s it! You’ve created a real-time dashboard component using Tinybird, Tremor, and Next.js. You’ll notice the dashboard is rendering very quickly by taking a peek at the latency number below the component. In my case, Tinybird returned the data for my dashboard in a little over 40 milliseconds aggregating over about a million rows. Not too bad for a relatively unoptimized query!

## Next Steps

This tutorial showed you how to build a single real-time dashboard component, but you probably want to add additional components and interactive elements.

If you need ideas, check out the [GitHub repository for this project](https://github.com/tinybirdco/signatures-dashboard). It has some additional components including new visualizations (and Tinybird Pipes to support them) plus an interactive data range picker.

![Complete real-time dashboard with bar chart, line chart, activities table, and verified users donut chart](/images/blog/a-step-by-step-guide-to-build-a-real-time-dashboard/image-6.webp)

You can also spend some time optimizing your data project for faster responses and minimal data processing using fine-tuned indexes, Materialized Views, and more. For tips on [optimizing SQL queries](https://www.tinybird.co/docs/guides/best-practices-for-faster-sql.html) or [building Materialized Views](https://www.tinybird.co/docs/guides/materialized-views.html), check out the [Tinybird docs](https://www.tinybird.co/docs).

## Wrapping up

If you are interested in building real-time dashboards or any other real-time visualizations, you need a data stack and frontend library that can keep pace. In this tutorial, you learned how to use modern tooling to build an end-to-end real-time data pipeline and dashboard. With Tinybird, Tremor, and Next.js, it’s possible to build a real-time dashboard from scratch in less than an hour.

The combination of Tinybird, Next.js, and Tremor provides a powerful solution for building real-time dashboards, but the real “speed layer” here is Tinybird. Here’s why Tinybird is perfect for building real-time data visualizations:

- **Real-Time Data Ingestion and Processing**: Tinybird can handle large streams of data in real time. Unlike traditional batch ETL processes, it can ingest, process, and analyze millions of events per second on the fly. This means that your dashboard can reflect changes almost instantly, keeping the insights fresh and timely.

- **Highly Optimized Query Engine**: Tinybird’s query engine is built to execute complex analytical queries in milliseconds. It can handle filtering, aggregating, or joining data without breaking a sweat, which means your dashboards won’t experience lagging refresh times.

- **Scalable Architecture**: Tinybird is a scalable, serverless real-time data platform. It flexibly scales storage and compute resources based on demand. As your data volumes and user loads increase, Tinybird responds to ensure fast dashboards at scale.

- **Integration with Streaming Sources**: Tinybird includes many first-class connectors for streaming data sources (like Apache Kafka, Google Pub/Sub, Amazon Kinesis, and more), so you can unify data from multiple sources directly into your visualization layer.

- **Real-time API Publication:** Tinybird is designed specifically for user-facing applications. With Tinybird, you can [instantly publish SQL-based metrics as APIs](https://www.tinybird.co/docs/concepts/apis.html) that you can integrate into your frontend.

- **Compatibility with Next.js and Tremor**: Tinybird’s architecture and API are designed to work seamlessly with modern frontend frameworks like Next.js and visualization tools like Tremor. This integration creates a smooth workflow from data ingestion to visualization.

- **Easy to Use**: Even with all its powerful capabilities, Tinybird remains accessible to developers. Its simplified SQL-based query language and well-documented APIs mean that building and maintaining a real-time dashboard does not require specialized skills or extensive training.

If you’re dabbling in real-time data processing or looking to shift to event-driven architectures for your dashboards, [Tinybird](https://www.tinybird.co/) could be for you. It’s free to start and designed to help you build real-time data pipelines fast. You can [sign up here](https://www.tinybird.co/signup?referrer=https%3A%2F%2Fwww.tinybird.co%2Fblog-posts%2Freal-time-dashboard-step-by-step) (no credit card required!)

Stuck somewhere along the way? Join the [Tinybird Slack community](https://www.tinybird.co/community) for help. Want to dive deeper into Tinybird? The [Tinybird docs](https://www.tinybird.co/docs) are a great place to start.

## Additional Resources

- [Tinybird Documentation](https://www.tinybird.co/docs)

- [Tinybird Web Analytics Starter Kit](https://www.tinybird.co/starter-kits/web-analytics)

- [Tremor Documentation](https://www.tremor.so/docs/getting-started/installation)

- [Next.js Documentation](https://nextjs.org/docs)

## FAQs

### What are the technologies used for creating a real-time dashboard, and why?

The application uses Tinybird for real-time data ingestion and real-time analytics, Tremor for data visualization, and Next.js as a fully-featured React framework. These technologies are chosen for their efficiency in processing large streams of real-time data, visualizing it in a user-friendly way, and ensuring a smooth and visually appealing rendering.

### What makes Tinybird essential for real-time data handling in the tech stack?

Tinybird provides real-time data ingestion and processing, optimized query execution, scalable architecture, compatibility with streaming sources, integration with modern frontend frameworks, and accessibility to developers. Its architecture is tailor-made for real-time analytics dashboards, making it an essential part of this process.

### How can I set up the Tinybird CLI?

Setting up Tinybird CLI involves creating a virtual environment, activating it, installing Tinybird CLI using pip, authenticating with Tinybird, and securing the Tinybird config file. Detailed instructions are provided in the post.

### What is the role of the mock data generator, and how does it work?

The mock data generator simulates the signature flow by generating random accounts, simulating signature statuses, determining final status, and sending payloads to Tinybird. It uses the Events API to send HTTP events to Tinybird for efficient data ingestion.

### Why are most data dashboards slow, and how does this application overcome that?

Traditional dashboards are slow due to issues like batch ETL processes, complex BI tools, heavy data stack, poorly designed queries, and lack of scalability. By using Tinybird, Next.js, and Tremor, this application overcomes these issues with real-time processing, optimized queries, and scalable architecture.

### What are the primary components of a real-time dashboard?

A real-time dashboard consists of Data Sources, a real-time data processing engine, a real-time visualization layer, and interactive controls. They collectively provide an up-to-the-second snapshot of critical metrics and KPIs, allowing users to interact with the data and gain insights instantly.

### How can I verify that the data is flowing properly from the data seeder to Tinybird?

You can verify the data flow by inspecting the `signatures` or `accounts` Data Source in Tinybird to confirm that the data has been received and reviewing the Ingestion Metrics.

### Can the structure described in the post be applied to other use cases besides signatures?

Yes, the structure and technologies can be adapted to almost any use case that requires real-time data handling, making it highly versatile.

### What precautions should be taken with Tinybird authentication tokens?

The admin token should be kept secure and not shared or published. It’s essential to hide secrets by adding the Tinybird config file to the `.gitignore` file, ensuring that it won’t be committed to the repository.
