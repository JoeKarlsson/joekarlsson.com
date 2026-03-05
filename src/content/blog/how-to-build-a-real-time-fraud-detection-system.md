---
title: 'How to build a real-time fraud detection system'
date: 2024-03-30
slug: 'how-to-build-a-real-time-fraud-detection-system'
description: 'Financial fraud is a growing concern in our increasingly digital world. According to a report by PwC, almost half of the surveyed organizations experienced fraud in the past 2 years. For...'
categories: ['Databases']
heroImage: '/images/blog/how-to-build-a-real-time-fraud-detection-system/645935d81911cd8d715406a1_Fraud-prevention-Blog-4.webp'
---

Financial fraud is a growing concern in our increasingly digital world. According to a [report by PwC](https://www.pwc.com/fraudsurvey), almost half of the surveyed organizations experienced fraud in the past 2 years. For online payments, the situation is no different. As eCommerce continues to surge, so do attempts by cybercriminals to exploit vulnerabilities and commit fraud.

Need to build real-time fraud detection?

[Tinybird](https://www.tinybird.co) is a powerful real-time data platform for building real-time analytics use cases like fraud detection. Tinybird takes care of all of the data infrastructure, including data ingestion, data storage, data processing, and data access through APIs, and gives you an intuitive, SQL-based development environment to build and ship real-time use cases faster. [Get started for free](https://www.tinybird.co/blog-posts/how-to-build-a-real-time-fraud-detection-system) (with no time limit!) and build your first real-time fraud detection API in minutes.

Luckily, companies have a powerful weapon in their arsenal to fight back effectively: **real-time fraud detection systems**. These systems offer a proactive approach to identifying and stopping fraudulent transactions before they even happen. A solid real-time fraud detection system consists of the following components:

- **The ability to ingest transaction streams:** To detect fraud in real-time, you need access to transaction data as soon as it’s generated. This requires a system that can ingest and process high volumes of transaction data in real-time, capturing relevant details like user information, transaction amount, IP address, location, and other potential risk factors.

- **A way to analyze these transactions for potential fraud:** Once you have the data, the next step is to analyze it for patterns and anomalies that might indicate fraudulent activity. This involves developing algorithms or machine learning models that can identify suspicious transactions based on pre-defined rules or by learning from historical data. These rules or models should be flexible and easy to update, as fraudsters are constantly adapting their tactics to bypass existing security measures.

- **A system to monitor and act on your analysis in real-time:** Detecting potential fraud is only half the battle; you also need a way to act on that information as quickly as possible. This means having a system in place to monitor the results of your analysis, raise alerts when suspicious transactions are detected, and trigger appropriate actions, such as blocking the transaction, flagging it for manual review, or notifying the user. Additionally, a user-friendly, [real-time dashboard](https://www.tinybird.co/blog-posts/real-time-dashboard-step-by-step) is essential for visualizing the fraud detection data, allowing your team to monitor trends, track performance, and make informed decisions about your fraud prevention strategy.

> Real-time fraud detections systems can identify and halt fraudulent transactions by ingesting real-time transaction data streams, analyzing them for fraud, and exposing fraud risks, all within milliseconds after a transaction is initiated.

Together, these components form the backbone of a real-time fraud detection system that can help businesses stay one step ahead of fraudsters and protect their customers and assets.

## Why does fraud detection need to be real-time?

Imagine a world where every time you swipe your credit card or make an online purchase, you have to wait 15 minutes for the transaction to clear. Not only would this be incredibly frustrating, but it would also significantly disrupt the flow of commerce, as businesses would face delays in processing orders and receiving payments.

But, credit card fraud (and other types of online fraud) are a massive thorn in the side of eCommerce stores and the financial institutions where they bank. They need ways to detect fraudulent behavior and stop those real-time transactions – and allow all others – before the purchaser notices a delay. This is why fraud detection must happen in real-time.

Consumers expect quick, seamless transactions. They want to make a purchase and have it approved instantly, without any delays or inconvenience. Real-time analytics is an essential part of fraud detection and prevent to meet these expectations while maintaining a high level of security and preventing fraudulent transactions from going through.

> Fraud detection and prevention systems should operate in real-time so that financial institutions can prevent fraud while ensuring a seamless customer experience.

Real-time fraud detection offers several key benefits in many different use cases:

- **Improved customer experience:** By identifying and blocking fraudulent transactions in real-time, businesses can ensure that legitimate transactions are approved with very low latency, without causing any unnecessary delays for their customers. This contributes to a better overall experience and increased customer satisfaction and trust.

- **Prevention of financial loss:** Real-time fraud detection enables businesses to stop fraudulent transactions before they are completed, preventing financial losses and reducing the risk of chargebacks. This not only saves money but also protects the company’s reputation and customer relationships.

- **Faster response to emerging threats:** Fraudsters are constantly evolving their tactics and discovering new ways to exploit vulnerabilities in payment systems. Real-time fraud detection allows businesses to identify and respond to fraud risk more quickly, updating their algorithms and rules to stay ahead of the game.

- **Reduced manual review workload:** By automating the process of detecting and blocking suspicious transactions, real-time fraud detection reduces the need for manual reviews, freeing up resources and allowing your team to focus on more strategic tasks.

- **Data-driven decision making:** Real-time fraud detection provides valuable insights into transaction trends and patterns, allowing businesses to make data-driven decisions about their fraud prevention strategies and optimize their processes.

And by detecting fraud in real-time, companies can prevent the most common cases of fraud, including credit card fraud and account takeover fraud.

## How do you build a real-time fraud detection system?

As I mentioned above, real-time fraud detection systems consist of…

- A system to ingest data streams in real time.

- A system to process those streams and analyze them for potential fraud.

- A system that exposes fraud analysis to people and software processes.

- A system that visualizes analytics and long-term fraud risk trends.

Below I’ve described common tools used to build these 4 different systems.

### Ingesting real-time transaction data streams

Companies will often use streaming infrastructure to handle real-time transaction data. Apache Kafka is the de facto standard for streaming data, though companies can evaluate other options like Confluent, Redpanda, Amazon Kinesis, Google Pub/Sub, Tinybird [Events API](https://www.tinybird.co/docs/ingest/events-api), and others. Make sure you choose a platform that can scale to the amount of data you expect to process.

> To succeed, real-time fraud detection systems should capture transaction data as soon as it occurs using streaming platforms like Kafka.

### Processing and analyzing streams for fraud risk

Companies may use stream processing or [real-time analytics](https://www.tinybird.co/blog-posts/real-time-analytics-a-definitive-guide) tools to process streaming data for fraud. The most common stream processing platform is Apache Flink. For real-time analytics, companies often choose Tinybird. These same real-time processing patterns show up in other use cases too - I wrote about a similar architecture in my post on [what it takes to build a real-time recommendation system](/blog/what-it-takes-to-build-a-real-time-recommendation-system/).

> Stream processing and real-time analytics can be used to assess fraud risk in transaction data within milliseconds of the transaction being created.

### Exposing analysis to people and software processes

The data analysis that has been performed must be used to be valuable. This is a two-pronged fork: People need to monitor fraud detection systems (usually through visualization tools – see below), and software processes need to take the analysis data to halt fraudulent transactions. The ideal way to achieve both ends is through an API layer. Companies can publish their analysis as APIs to be consumed by both visualization tools and software processes that halt transactions.

> A popular way to expose fraud detection analysis is through APIs that can be consumed by both visualization tools and automated software processes that prevent fraudulent transactions from being processed.

Companies can build an API layer using a variety of web frameworks. Popular choices include Node.js, Ruby on Rails, Django or Flask for Python, and Spark or Spring for Java.

Alternatively, some real-time analytics platforms such as Tinybird enable quick publication of APIs over data analytics.

### Visualizing analytics and long-term fraud risk

Stopping fraudulent transactions through detection and software-powered interventions is important, but not fully sufficient. A real-time fraud detection system should also include a business intelligence layer to monitor fraud risk and assess long-term trends.

> Real-time fraud detection should be monitored over time using visualization tools.

Companies will often store analyzed fraud data in a data warehouse, such as BigQuery, Snowflake, or Redshift. Then, it can be queried and visualized in business intelligence tools like Tableau, Looker, or PowerBI.

Alternatively, some companies may choose more flexible internal tooling platforms like Retool or Hex. These tools give internal business analysts the ability to consume analytics and build customized dashboards.

## An example real-time fraud detection system with Tinybird and Retool

As mentioned above, [Tinybird](https://www.tinybird.co/) and [Retool](https://retool.com/) are popular tools that handle the core requirements for a real-time fraud detection system. These two tools work well together and provide everything you need to build a powerful real-time fraud detection system.

In the remainder of this blog post, I’ll walk through the process of creating the [real-time data ingestion](https://www.tinybird.co/blog-posts/real-time-data-ingestion), analysis, and publication of APIs for a real-time fraud detection application using Tinybird. Then, in a later blog, I’ll show you how to use Retool to visualize, monitor, and manage the fraud detection analysis that Tinybird generates.

> Note: If you want to check out the code, and try out the Tinybird CLI, you can [follow along](https://github.com/tinybirdco/fraud-detection-demo) with this tutorial on GitHub.

### Setting up Tinybird to ingest real-time transaction data

First things first, you’ll need to set up a Tinybird account. Head over to [Tinybird](https://ui.tinybird.co/) and sign up for a free account (if you haven’t already). Once you’re in, you’ll be greeted with a warm, welcoming dashboard that’ll make you feel right at home.

![Tinybird dashboard showing transactions data source with ingestion graph](/images/blog/how-to-build-a-real-time-fraud-detection-system/image-7-1024x613.webp)

Tinybird provides a user interface to monitor data ingestion and build analytics queries using SQL.

### Generating mock eCommerce data streams

Now, let’s talk data. We’ll be using [Mockingbird](https://mockingbird.tinybird.co/?template=Default), an open-source mock data stream generator, to stream real-time mock eCommerce transactions with some suspicious activity data thrown into the mix.

> Mockingbird is a free, open source data stream generator that I’ve used to create some mock financial transaction data without exposing any PII.

To send data to Tinybird, Mockingbird uses the Tinybird [Events API](https://www.tinybird.co/docs/guides/ingest/ingest-from-the-events-api) from the browser, which allows you to easily generate and send out mock data to test your applications.

![Tinybird Pipe editor with SQL query counting declined transactions per user](/images/blog/how-to-build-a-real-time-fraud-detection-system/image-10-1024x686.webp)

Generating mock data streams in Mockingbird and ingesting them into Tinybird.

Once you click “Generate,” your browser will begin streaming real-time transaction data to your Tinybird Workspace. Navigate to your Tinybird dashboard, click on the newly created `transactions` Data Source, and find your data being streamed into Tinybird in real-time.

> Tinybird can store billions of rows of transaction data for both long-term analysis and to inform real-time fraud detection processes.

> Note: I’m using Mockingbird and the Tinybird Events API for streaming ingest, but Tinybird natively supports many different sources such as Kafka, Confluent, Redpanda, Kinesis, Pub/Sub, and more.

![Tinybird transactions data source showing streamed rows with fraud fields](/images/blog/how-to-build-a-real-time-fraud-detection-system/image-1.webp)

The new Tinybird Data Source you just created

### Building fraud detection analysis with SQL

Once your data is prepared and flowing like a river of transactional goodness, it’s time to keep an eagle eye on it and observe your fraud detection system at work.

[Tinybird Pipes](https://www.tinybird.co/docs/concepts/pipes) are the secret sauce of real-time data processing. A Pipe in Tinybird contains one or more SQL queries that result in either an API Endpoint or a [Materialized View](https://www.tinybird.co/blog-posts/what-are-materialized-views-and-why-do-they-matter-for-realtime). Let’s create a Pipe to process the incoming data and filter out those sneaky fraudulent transactions.

To add a Pipe, click the Plus (+) icon in the left-side navigation bar next to the Pipes section.

Here’s a sample SQL query for detecting suspicious transactions with an amount greater than $900 and a location outside of the USA. Paste this query into the first node of your Pipe, and click “Run.” You should see a list of suspicious transactions populating the table below in real-time.

```sql
SELECT
  user_id,
  transaction_id,
  amount,
  location,
  timestamp
FROM transactions
WHERE CAST(amount AS Float64) > 900
AND location != 'USA'
```

### Publishing SQL analysis as APIs for consumption

With Tinybird you can publish the result of any Pipe as an HTTP Endpoint. So you can write your SQL query, click a button, and get a scalable, reliable & secure API with no effort.

You can use this API in various ways, such as:

- Generating alerts or notifications whenever suspicious activities are detected.

- Building software automation that halts fraudulent transactions in real-time.

- Creating custom dashboards or reports to monitor the performance of our fraud detection system (using a tool like Retool).

- Training and improving your fraud detection algorithms, using artificial intelligence or machine learning models to analyze historical data and identify patterns or anomalies that could indicate fraudulent activities.

> Tinybird makes it easy to publish fraud detection queries as APIs.

To create an API Endpoint with Tinybird, first open the Pipe that you want to publish and click the Create API Endpoint button in the top right of the screen (see Mark 1 below). Then select the Node that you want to publish (see Mark 2 below).

![Tinybird dashboard showing transactions data source with ingestion graph](/images/blog/how-to-build-a-real-time-fraud-detection-system/image-7.webp)

Tinybird makes it simple to publish SQL queries as APIs.

And that’s it. Your SQL is now a low-latency, scalable, and secure API.

## More example SQL queries for real-time fraud detection

But that’s not all! The nature of your real-time fraud-detection system will depend on the analytics you run. Below are some additional queries that you could use to identify potential fraud:

### Detecting purchases made outside of users’ usual location

This query selects the user ID and counts the number of transactions made outside of the user’s usual location. It filters only those with two or more transactions made from unusual locations. By running this query, we can identify whether a user’s transaction history contains suspicious activities related to location. Simply replace `'USER_ID'` with the actual user ID (or use Tinybird’s [templating language](https://www.tinybird.co/docs/query/query-parameters) to add query parameters to your published APIs) to detect fraud for a specific user.

```sql
SELECT
  user_id,
  COUNT(*) as num_transactions
FROM transactions
WHERE location NOT IN (SELECT DISTINCT location FROM transactions WHERE user_id = 'USER_ID')
GROUP BY user_id
HAVING COUNT(*) > 2
```

### Detecting high-velocity transactions

This query selects the user ID and counts the number of transactions that occurred within the last hour. It groups the results by user ID and filters only those with 10 or more transactions in the last hour.

```sql
SELECT
  user_id,
  COUNT(*) as num_transactions
FROM transactions
WHERE timestamp >= NOW() - INTERVAL '1' HOUR
GROUP BY user_id
HAVING COUNT(*) > 10
ORDER BY num_transactions DESC
```

### Detecting unusually large transactions

This query selects the transaction ID, user ID, and amount of transactions that are greater than $999.

```sql
SELECT transaction_id, user_id, amount
FROM transactions
WHERE CAST(amount AS Float64) > 999
ORDER BY amount DESC
```

### Detecting transactions made at unusual times

This query selects the user ID and counts the number of transactions made between 1:00 AM and 5:00 AM. It groups the results by user ID and filters only those with five or more transactions made during this time.

```sql
SELECT
  user_id,
  COUNT(*) as transaction_count
FROM transactions
WHERE
    EXTRACT(HOUR FROM timestamp) >= 1 AND
    EXTRACT(HOUR FROM timestamp) < 5
GROUP BY user_id
HAVING transaction_count >= 5
```

### Detecting users with a large number of declines transactions

This query selects the user ID and counts the number of declined transactions for each user. It groups the results by user ID and filters only those with three or more declined transactions.

```sql
SELECT
  user_id,
  COUNT(*) as num_transactions
FROM transactions
GROUP BY user_id
HAVING COUNT(*) > 3
ORDER BY num_transactions DESC
```

### Detecting transactions made from high-risk IP addresses

This query selects the user ID and counts the number of transactions made from IP addresses with a high-risk prefix (e.g., 123456, 234567, 345678). It groups the results by user ID and filters only those with two or more transactions from high-risk IP addresses.

```sql
SELECT
  user_id,
  COUNT(*) as num_transactions
FROM transactions
WHERE LEFT(REPLACE(location, '.', ''), 6) IN ('2451316197', '234567', '345678')
GROUP BY user_id
HAVING COUNT(*) > 1
```

user_idnum_transactionsTanya611Bill609Mary597

### Detecting unusual spending patterns

Finally, we can detect fraudulent activity by analyzing unusual spending patterns. This code selects the user_id, the average, and standard deviation of the transaction amount for each user, and filters only those whose maximum transaction amount is more than two standard deviations away from the average. This could indicate potential fraudulent activity.

```sql
SELECT
  user_id,
  AVG(CAST(amount AS Float64)) as avg_amount,
  SQRT(SUM(CAST(amount AS Float64) * CAST(amount AS Float64))
    / COUNT(*) - AVG(CAST(amount AS Float64))
    * AVG(CAST(amount AS Float64))) as stdev_amount
FROM transactions
GROUP BY user_id
HAVING
  AVG(CAST(amount AS Float64)) + 2 * SQRT(SUM(CAST(amount AS Float64)
    * CAST(amount AS Float64)) / COUNT(*) - AVG(CAST(amount AS Float64))
    * AVG(CAST(amount AS Float64))) < MAX(CAST(amount AS Float64))
```

## Summary

Congratulations, fraud-fighter! You’ve built a real-time fraud detection system using Tinybird, and now you’re ready to put those skills to work. Go forth and create your own fraud detection system, and remember, with great data comes great responsibility.

In the next part of this fraud-fighting adventure, I’ll explore how to build a dashboard using Retool components to visualize the fraud detection data in real-time. Stay tuned!

Ready to experience the industry-leading real-time analytics platform? [Try Tinybird today](https://ui.tinybird.co/signup), for free. Get started with the Build Plan – which is more than enough for most simple projects and has no time limit – and upgrade as you scale.

## FAQs

### Can I checkout this fraud detection code on GitHub?

Yes! The code for this demo fraud detection application can be found on the [Tinybird GitHub](https://github.com/tinybirdco/fraud-detection-demo).

### Can I use a different dataset for my fraud detection system?

Absolutely! The Mockingbird demo data is just an example. Feel free to use any dataset that suits your needs, as long as it contains the necessary fields for fraud detection.

### How can I enhance my fraud detection pipeline?

The example SQL provided was elementary. Improve your pipeline by adding more conditions and filters, such as checking for suspicious IP addresses or browser usage patterns. You can also being to include more personalized metrics by evaluating user histories and detecting transactions that don’t jive with that history. These advanced analytics will help improve the accuracy of your fraud detection system.

### Can I integrate Tinybird with other tools besides Retool?

Yes, Tinybird is quite the social butterfly. It can be integrated with various tools, such as data visualization platforms, BI tools, and more. Check out [Tinybird’s documentation](https://www.tinybird.co/docs) for more information on integrations.

### How do I handle false positives in my fraud detection system?

False positives can be a bit of a nuisance. To reduce them, fine-tune your fraud detection pipeline by adjusting your filters and conditions. Also, consider incorporating machine learning algorithms to improve the accuracy of your fraud detection system.

### How can I set up alerts for detected fraud?

You can set up alerts by integrating your Tinybird fraud detection pipeline with a notification tool, such as email, Slack, or SMS services. This way, you’ll be notified immediately when a fraudulent transaction is detected, allowing you to take swift action.

### Why use Tinybird for real-time fraud detection?

Using Tinybird for fraud detection is like having a trusty sidekick in your battle against digital villains. Some advantages of using Tinybird for real-time fraud detection include:

- **Speed:** Tinybird processes data at lightning speed, helping you identify fraudulent transactions before they can do any damage.

- **Scalability:** Whether you’re dealing with a trickle or a torrent of data, Tinybird scales smoothly to handle it all.

- **Flexibility:** Tinybird’s data pipelines are highly customizable, so you can create a fraud detection system tailored to your specific needs.

- **Integration:** Tinybird plays well with others, like Retool, allowing you to create powerful, cohesive fraud detection solutions.

### What schema did you use to generate data in Mockingbird?

Here you go!

```json
{
	"timestamp": {
		"type": "mockingbird.timestampNow"
	},
	"transaction_id": {
		"type": "finance.routingNumber"
	},
	"user_id": {
		"type": "mockingbird.pick",
		"params": [
			{
				"values": [
					"Mike",
					"John",
					"Jane",
					"Mary",
					"Bob",
					"Alice",
					"Joe",
					"Sue",
					"Ryan",
					"Jill",
					"Bill",
					"Jen",
					"Jack",
					"Jill",
					"Tom",
					"Tim",
					"Tina",
					"Terry",
					"Troy",
					"Tara",
					"Tanya",
					"Trevor",
					"Tucker",
					"Trent",
					"Trenton",
					"Mario"
				]
			}
		]
	},
	"amount": {
		"type": "finance.amount"
	},
	"ip_address": {
		"type": "internet.ip"
	},
	"browser": {
		"type": "mockingbird.pickWeighted",
		"params": [
			{
				"values": ["Chrome", "Brave", "Firefox", "Safari"],
				"weights": [65, 3, 8, 20]
			}
		]
	},
	"location": {
		"type": "mockingbird.pickWeighted",
		"params": [
			{
				"values": ["USA", "Spain", "UK", "Australia", "Mexico", "China", "Japan", "Canada"],
				"weights": [65, 20, 8, 1, 3, 1, 1, 1]
			}
		]
	},
	"is_declined": {
		"type": "mockingbird.pickWeighted",
		"params": [
			{
				"values": [true, false],
				"weights": [3, 98]
			}
		]
	},
	"fraud_flag": {
		"type": "mockingbird.pick",
		"params": [
			{
				"values": [false]
			}
		]
	}
}
```
