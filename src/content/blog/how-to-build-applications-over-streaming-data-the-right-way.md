---
title: "How to Build Applications over Streaming Data the Right Way"
date: 2024-04-05
slug: "how-to-build-applications-over-streaming-data-the-right-way"
description: "In the bustling metropolis of modern data ecosystems, streaming data is the lifeblood coursing through its veins, much like the traffic on a busy city highway. Each packet of data, akin to a vehicle,..."
categories: ["Blog"]
heroImage: "/images/blog/how-to-build-applications-over-streaming-data-the-right-way/462e6fa8-traffic1-1024x683-1.jpg"
---

In the bustling metropolis of modern data ecosystems, streaming data is the lifeblood coursing through its veins, much like the traffic on a busy city highway. Each packet of data, akin to a vehicle, has a specific destination. Some are on a leisurely ride to a data lake for historical analysis, while others are zipping toward [real-time analytics](https://www.tinybird.co/blog-posts/real-time-analytics-a-definitive-guide?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=apps-over-streaming-data) engines, where they will be used to power automation, user-facing features and real-time operational intelligence. This blog post is your roadmap to learn how to how to build applications over Streaming Data the right way.

## What Is Streaming Data?

Streaming data opens up a whole new world of possibilities for application development. Consider a traffic management system. With batch processing, it might be able to tell you there was a traffic jam two hours ago. In contrast, a streaming data approach could alert drivers about congestion ahead in real time, allowing them to make informed decisions and take alternative routes immediately. The value of real-time insights like these cannot be overstated in today’s fast-paced, data-driven world.

[Apache Kafka](https://kafka.apache.org/) is one popular tool used to handle massive amounts of streaming data, making it a key player in [streaming data architecture](https://www.tinybird.co/blog-posts/real-time-streaming-data-architectures-that-scale?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=apps-over-streaming-data). It acts like a highway for data, enabling it to move smoothly and efficiently from one application to another.

The power of streaming data lies in its immediacy. In a world where real-time information can drive key business decisions and provide superior user experiences, understanding and effectively using streaming data is essential.

## Key Use Cases for Streaming Data Applications

The practical uses for streaming data are numerous and span many industries. Let’s take a closer look at a few along with some practical codebases that demonstrate how these work in the real world.

- [**Web analytics**](https://www.tinybird.co/starter-kits/web-analytics?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=apps-over-streaming-data)**:** Understanding user behavior in real time can be a game-changer for businesses. For example, real-time analytics can help identify trending products, understand customer navigation paths and even detect problematic user experiences, enabling businesses to react and adapt swiftly.

- [**Log analytics**](https://www.tinybird.co/starter-kits/log-analytics?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=apps-over-streaming-data)**:** Log data from applications, systems and networks can be voluminous and fast-moving. By streaming and analyzing log data in real time, IT teams can swiftly detect and mitigate issues, ensuring high system performance and availability.

- [**E-commerce order tracking**](https://github.com/tinybirdco/demo-user-facing-saas-dashboard-signatures)**:** In the era of instant gratification, customers want to know the status of their orders in real time. Streaming data applications can track orders from the moment they’re placed, through various stages of the fulfillment process, all the way to delivery, providing customers with up-to-the-minute updates.

- [**Fraud detection**](https://www.tinybird.co/blog-posts/how-to-build-a-real-time-fraud-detection-system?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=apps-over-streaming-data)**:** Fraudsters are continually evolving their tactics, making real-time detection crucial. Streaming data applications can help detect fraudulent patterns and anomalies as they occur, triggering immediate alerts and actions to prevent significant losses.

- [**Real-time personalization**](https://www.tinybird.co/blog-posts/clickhouse-query-optimization?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=apps-over-streaming-data)**:** Personalizing user experiences based on real-time behavior can significantly boost customer engagement and conversion rates. Whether it’s recommending a product based on what a customer is currently browsing or sending targeted offers based on their in-app activity, streaming data makes it possible.

## Building Real-Time Applications the Hard Way

A typical [real-time data architecture](https://www.tinybird.co/blog-posts/real-time-streaming-data-architectures-that-scale?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=apps-over-streaming-data) for applications built over streaming data might resemble something like this:

[![](https://cdn.thenewstack.io/media/2023/08/98f17df0-image1.jpg)](https://cdn.thenewstack.io/media/2023/08/98f17df0-image1.jpg)

- **Kafka:** Apache Kafka functions as the entry point for real-time data, offering robust data ingestion capabilities. It manages the capture, buffering and ordering of continuous data streams, making the data ready for downstream processing.

- **Flink:** Apache Flink is a stream processing engine that can handle the continuous flow of data from Kafka. It executes operations such as filtering, aggregation and some analytics on the real-time data over small time windows, transforming raw data into more usable metrics. Depending on the database and use case, stream processing may be unnecessary here.

- **ClickHouse:** ClickHouse, a [real-time database](https://www.tinybird.co/blog-posts/real-time-databases-what-developers-need-to-know?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=apps-over-streaming-data), serves as a fast and scalable storage system for processed results. It allows [efficient querying](https://thenewstack.io/clickhouse-rapidly-rivals-other-open-source-databases-in-active-contributors/) over large volumes of data, enabling rapid access to insights derived from the processed streams.

- **Backend/ORM:** The backend, along with an object-relational mapping (ORM) layer, offers an abstraction over the database. It simplifies data interactions and manages the complexities of data transactions and operations, ensuring the consistency and integrity of data.

- **APIs:** APIs form the conduit between the backend and frontend, facilitating the flow of processed data. They expose the data and insights to the [frontend](https://thenewstack.io/frontend-development/), enabling real-time data interaction and access for users.

- **Frontend:** The frontend is responsible for presenting the data to users in an accessible and meaningful manner. It handles data visualization and user interactions, translating complex data into understandable and actionable insights.

### Challenges of Building Applications over Streaming Data

While this architecture serves its purpose, it presents several challenges:

- **Complex setup and management:** Deploying this architecture involves setting up numerous components, each requiring unique expertise. This necessitates substantial effort and a broad knowledge base. Post-deployment, the complexity persists in the form of management tasks like updates, patches, performance monitoring and user access control. As such, this architecture demands continuous operational effort and a high level of expertise.

- **Scalability issues:** [Scaling](https://roadmap.sh/guides/scaling-databases) the system to accommodate increasing data volumes and throughput needs can be challenging. As the system expands, so does its complexity, potentially leading to performance bottlenecks or resource contention. The need for data consistency across an increasingly large system can further complicate the scaling process. Therefore, growth in data volume and throughput introduces additional complexities.

- **Integrating new data streams:** Adding new data sources into the system can present difficulties. Integration of these data streams requires careful schema planning, transformation and possible re-architecture. Furthermore, each new data source may bring unique requirements or formats, further complicating the integration process. This architecture, therefore, poses challenges to the smooth and efficient integration of new data streams.

- **Fault tolerance:** The architecture must be designed to recover quickly from failures while maintaining data integrity. This includes designing redundancies, backups and automatic recovery mechanisms. However, ensuring that these measures work effectively without disrupting regular operations or compromising data integrity can be difficult. Hence, the requirement of fault tolerance in this architecture necessitates careful and often complex design.

## Building Real-Time Applications with a Real-Time Data Platform

Real-time data platforms like Tinybird aim to simplify building applications over streaming data by addressing many of the aforementioned challenges. The result is a simplified streaming data architecture that consolidates many components into a single system:

[![](https://cdn.thenewstack.io/media/2023/08/5a39a252-image2.jpg)](https://cdn.thenewstack.io/media/2023/08/5a39a252-image2.jpg)

With real-time data platforms, you need only focus on your data source (such as Kafka) and your frontend. Within Tinybird, several functionalities get abstracted away, including:

- [**Materialized views**](https://www.tinybird.co/blog-posts/what-are-materialized-views-and-why-do-they-matter-for-realtime?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=apps-over-streaming-data)**:** Raw data can be pre-processed and stored in a format optimized for low-latency, analytical queries.

- [**OLAP**](https://www.tinybird.co/docs/faq/architecture.html?highlight=olap&utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=apps-over-streaming-data#what-is-clickhouse)**:** Online analytical processing capabilities for multidimensional analytical queries.

- [**SQL transformations**](https://www.tinybird.co/docs/guides/best-practices-for-faster-sql.html)**:** Transformations and processing are done using SQL, a familiar language for most developers.

- [**API layer**](https://www.tinybird.co/docs/api-reference/api-reference.html?highlight=sql)**:** It autogenerates fully documented APIs to expose processed data, reducing the need to build and maintain a separate backend layer.

This abstraction significantly simplifies the process of building applications over streaming data, letting developers focus on extracting value from the data rather than the intricacies of infrastructure.

## Building an Application over Streaming Data: A Simple Tutorial

Now, let’s build a simple streaming data application using Apache Kafka and Tinybird. To provide a practical, hands-on experience, we will include code snippets and architectural diagrams that are based on the code in [this GitHub repository](https://github.com/tinybirdco/demo-user-facing-saas-dashboard-signatures).

We are going to assume you have set up a Kafka cluster (or some managed version like Confluent), and you want to build an application that uses this data. In this example, the data streaming through Kafka is a real-time feed of e-commerce transactions. Let’s see how you might build an application backend using Tinybird.

### Capturing Streaming Data in the Real-Time Data Platform

The first step in building an application over streaming data is to capture the data in flight. In Tinybird, we can do that using its native [Kafka Connector](https://www.tinybird.co/docs/ingest/kafka.html?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=apps-over-streaming-data).

Using the Tinybird CLI, you can connect to a Kafka topic with a simple command:

```
bash tb connection create kafka –bootstrap_servers $SERVER_URL –key $ACCESS_KEY –secret $ACCESS_SECRET
```

From there, you can create a [Tinybird Data Source](https://www.tinybird.co/docs/concepts/data-sources.html) with a schema that matches the topic. Once you’ve done this, you’ll have streaming data being written into an optimized columnar data store that’s ready for building metrics.

## Creating Real-Time Data Pipelines with SQL

In Tinybird, we use [Pipes](https://www.tinybird.co/docs/concepts/pipes.html?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=apps-over-streaming-data) to develop real-time pipelines using SQL. Below are some examples of metrics that we could process over data in your Tinybird Data Sources using Pipes.

### Retrieving the Most Recent Transaction

This query retrieves the 10 most recent transactions sorted by the timestamp in descending order.

```
SELECT orderID, fullName, orderDate, products, quantity
FROM transactions
ORDER BY __timestamp
DESC LIMIT 10
```

### Identifying Top-Selling Products

This query finds the top five best-selling products. It counts the number of occurrences of each product and sorts them in descending order.

```
SELECT products, COUNT(*) as count
FROM transactions
GROUP BY products
ORDER BY count
DESC LIMIT 5
```

Of course, these are just examples. The kinds of transformations you can build with SQL are nearly unbounded.

### Building APIs with Tinybird

Any backend requires an API layer to connect the database to the frontend application. In typical development, this requires an ORM, but with Tinybird, the [APIs are generated automatically](https://www.tinybird.co/docs/concepts/apis.html?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=apps-over-streaming-data) from the SQL you write.

Once you’re happy with your SQL, you simply publish the query as an endpoint, and it becomes a secure, documented and, most importantly, scalable API.

![](https://cdn.thenewstack.io/media/2023/08/6d5d5116-image1.gif)

Tinybird APIs will serve real-time transformations over the freshest streaming data. This endpoint can then be used in any application that requires the latest transaction data, enabling real-time data features within the application.

Moreover, Tinybird’s powerful query engine can handle complex queries over large data streams with low latency, making it adept at building responsive, real-time applications.
