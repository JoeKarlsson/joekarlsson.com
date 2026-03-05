---
title: 'The Engineer’s Guide to Enriching Streams and Dimensions'
date: 2024-04-05
slug: 'the-engineers-guide-to-enriching-streams-and-dimensions'
description: 'Data - it’s the new oil, the new gold, the new …  you get the idea. There’s a whole lot of it, and it’s valuable. But unless you’re into data hoarding, the point isn’t just to collect it; you want …...'
categories: ['Databases']
heroImage: '/images/blog/the-engineers-guide-to-enriching-streams-and-dimensions/ac050f67-data-stream1-1024x488-1.webp'
---

Data - it’s the new oil, the new gold, the new …  you get the idea. There’s a whole lot of it, and it’s valuable. But unless you’re into data hoarding, the point isn’t just to collect it; you want to use it. You want to massage it, query it, build with it, and glean insights from it in real-time, right? Well, brace yourself, because you’re in for a treat.

## **The Power of Combined Data Warehouses and Data Streams**

What happens when you combine the real-time capabilities of streaming data with the solid storage and querying capabilities of a data warehouse? Pure magic, that’s what.

The combination is a process we data junkies like to call “enrichment.” When you can capture event streams in real time and join them with dimension tables in a data warehouse, you can accomplish some pretty powerful use cases. Data-source enrichment is a foundational element of a solid [real-time data strategy](https://www.tinybird.co/blog-posts/16-questions-real-time-data-strategy).

But how can you, as a developer, make this dream team a reality? By using a [real-time data platform](https://www.tinybird.co/product?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=streams-and-warehouses), that’s how.

Real-time data platforms (like [Tinybird](https://www.tinybird.co?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=streams-and-warehouses)) allow you to easily connect many data sources, handle [huge amounts of data](https://roadmap.sh/guides/scaling-databases) at top speeds and still manage to keep things simple when building real-time applications. With Tinybird, for example, you get the ease of SQL with the power of a [highly optimized query engine](https://thenewstack.io/why-clickhouse-should-be-your-next-database/) at your disposal.

## **Use Cases Combining a Data Warehouse with Data Streams**

Sure, all this talk about streams and warehouses is cool, but what does it look like in the wild? Time to dive into some specific examples of real-time data processing.

### **Use Case 1: Fraud Detection in Real Time Using Historical Data**

Imagine you’re a data engineer, and you’ve just been asked to help detect and prevent fraud on your platform. This task calls for some serious [real-time analytics](https://www.tinybird.co/blog-posts/real-time-analytics-a-definitive-guide?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=streams-and-warehouses).

As part of your [event-driven architecture](https://www.tinybird.co/blog-posts/event-driven-architecture-best-practices-for-databases-and-files?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=streams-and-warehouses), you have a steady flow of transactions entering your system via Kafka, with each transaction being a potential crime scene. To detect possible fraud, you need to analyze these transactions as they arrive, in real time.

On the other hand, you’ve got historical transaction data stored in your data warehouse, like Snowflake. It contains patterns of legitimate and fraudulent transactions from the past.

You can use a real-time data platform as an [online feature store](https://www.tinybird.co/blog-posts/using-tinybird-as-a-serverless-online-feature-store?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=streams-and-warehouses), using historical data in your data warehouse to model fraudulent behavior while computing features on the fly via event streams.

![Fraud detection architecture combining Kafka streams with Snowflake warehouse data](/images/blog/the-engineers-guide-to-enriching-streams-and-dimensions/1615e62b-image3-e1690299751174.webp)

For example, let’s assume you have historical transaction data stored in Snowflake, where each transaction is associated with a customer and has fields such as `transaction_amount`, `transaction_location`, etc. Also, let’s assume that there is a historical pattern of fraud where fraudulent transactions are typically significantly larger than a customer’s average transaction amount.

Now, let’s say a new transaction event comes in via your Kafka stream. You could use a SQL query like the one below to flag potentially fraudulent transactions based on comparing the incoming transaction amount with the customer’s historical average transaction amount:

```sql
SELECT
 kafka_stream.transaction_id,
 kafka_stream.customer_id,
 kafka_stream.transaction_amount,
 snowflake_warehouse.avg_transaction_amount,
 CASE
     WHEN kafka_stream.transaction_amount > 2 * snowflake_warehouse.avg_transaction_amount
          THEN 'Potential Fraud'
         ELSE 'Normal'
     END AS Fraud_Status
FROM
 kafka_stream
JOIN
 (SELECT customer_id, AVG(transaction_amount) AS avg_transaction_amount FROM snowflake_warehouse GROUP BY customer_id) AS snowflake_warehouse
ON
 kafka_stream.customer_id = snowflake_warehouse.customer_id
```

_To learn more about building a real-time fraud detection system, _[_check this out_](https://www.tinybird.co/blog-posts/how-to-build-a-real-time-fraud-detection-system?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=streams-and-warehouses)_. _

### **Use Case 2: Real-Time E-Commerce Personalization with Product Data **

In the fast-paced e-commerce industry, real-time insights are critical. You’re running an online store with transaction data flowing in via a Kafka stream and detailed product info stored in a Snowflake warehouse. The challenge? How to put the right offer before a shopper using data from these disparate sources.

Having a [real-time analytics e-commerce dashboard](https://www.tinybird.co/blog-posts/ecommerce-google-analytics-alternative?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=streams-and-warehouses) can certainly help your business assess how sales are going in real time, but you don’t want to stop there. You want to actually increase conversion rates and average order value by updating your web store with a [real-time personalization system](https://www.tinybird.co/use-cases/realtime-personalization?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=streams-and-warehouses).

A real-time data platform makes this possible. It can connect to your Kafka stream and data warehouse, pulling in live transaction data and product dimensions respectively. The advantage? You can write SQL queries to extract real-time insights such as top-selling products, shopper transaction history, sales trends and inventory status.

![E-commerce personalization architecture joining Kafka transactions with product data](/images/blog/the-engineers-guide-to-enriching-streams-and-dimensions/e59ad9e7-image2-e1690300048853.webp)

Here’s an example SQL query that combines transaction data from Kafka and hydrates the stream data with product data from Snowflake to get a complete list of the 100 most recent orders on the system. The beauty of real-time data is that it gives you an instant snapshot of your business, enabling data-driven decision-making on the fly.

```sql
SELECT
 kafka_stream.transaction_order_id,
 kafka_stream.transaction_orderDate,
 kafka_stream.transaction_product_id,
 snowflake_warehouse.product_name as Product,
 snowflake_warehouse.product_price as ValueUSD
FROM kafka_stream
JOIN snowflake_warehouse p on snowflake_warehouse.product_id = kafka_stream.transaction_product_id
ORDER BY orderDate DESC
LIMIT 100
```

_Check out a full example use case of an _[_e-commerce dashboard_](https://github.com/tinybirdco/demo-user-facing-saas-dashboard-signatures)_ using Kafka and Snowflake._

### **Use Case 3: Real-Time Log Analytics Informed by Historical Data**

In this scenario, you’re dealing with two types of data: streaming log events coming in hot from a streaming platform like Kafka, and historical log data chilling out in Snowflake, your data warehouse.

Yes, you want to monitor and analyze these log events in real time, but you also want to compare them with historical data to spot any trends or anomalies. That’s where you use a [real-time data platform](https://www.tinybird.co/product?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=streams-and-warehouses) to bring together your streaming log events and historical data, and then use a SQL query to analyze this data in real time.

![Log analytics architecture comparing streaming events with historical data](/images/blog/the-engineers-guide-to-enriching-streams-and-dimensions/74a7b57b-image1-e1690300220768.webp)

For example, suppose each log event has a `log_type` (such as “ERROR,” “WARNING,” “INFO”) and a `timestamp`. You want to know, in real time, how the count of each log type in the last hour compares to its average hourly count over the last 30 days.

Here’s a SQL query you might use for this purpose:

```sql
SELECT
 kafka_stream.log_type,
 COUNT(kafka_stream.log_type) OVER (PARTITION BY kafka_stream.log_type) AS current_hour_count,
 snowflake_warehouse.avg_hourly_count,
 CASE
     WHEN COUNT(kafka_stream.log_type) OVER (PARTITION BY kafka_stream.log_type) > 2 * snowflake_warehouse.avg_hourly_count THEN 'Anomaly Detected'
     ELSE 'Normal'
 END AS Anomaly_Status
FROM
 kafka_stream
JOIN
 (SELECT log_type, AVG(count) AS avg_hourly_count
 FROM
     (SELECT log_type, COUNT(*) as count
     FROM snowflake_warehouse
     WHERE timestamp >= NOW() - INTERVAL '30 DAYS'
     GROUP BY log_type, DATE(timestamp), EXTRACT(HOUR FROM timestamp))
 GROUP BY log_type) AS snowflake_warehouse
ON
 kafka_stream.log_type = snowflake_warehouse.log_type
WHERE
 kafka_stream.timestamp >= NOW() - INTERVAL '1 HOUR'
```

_Want to deep dive into log analytics? _[_Check out this starter kit_](https://www.tinybird.co/starter-kits/log-analytics?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=streams-and-warehouses)_. _

## **Wrapping Up**

Enriching streaming data with data warehouse data opens up a world of possibilities for creating nifty, data-savvy, real-time applications. Toss a real-time data platform like [Tinybird](https://www.tinybird.co?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=streams-and-warehouses) into the mix, and the whole process becomes as breezy as a walk in the park. Tinybird makes it possible to unify many data sources and handle enormous volumes of data at lightning speed, and it’s pretty fun to build and publish new real-time data products.
