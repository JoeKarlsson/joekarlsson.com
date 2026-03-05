---
title: 'What it takes to build a real-time recommendation system'
date: 2024-03-30
slug: 'what-it-takes-to-build-a-real-time-recommendation-system'
description: 'Real-time, personalized recommendations have become a foundational part of our online experiences. From streaming services suggesting our next binge-worthy TV series to e-commerce platforms offering...'
categories: ['Databases']
heroImage: '/images/blog/what-it-takes-to-build-a-real-time-recommendation-system/64be9b1121ab250bbca26d13_Confluent-ConnectorWhat-it-takes-to.webp'
---

Real-time, personalized recommendations have become a foundational part of our online experiences. From streaming services suggesting our next binge-worthy TV series to e-commerce platforms offering tailored product recommendations, real-time recommendation systems have revolutionized how we discover and engage with content and products.

In this blog post, you will learn what a real-time recommendation system (aka “recsys”) is and what it takes to build one.

How to start building a real-time recommendation system

[Tinybird](https://www.tinybird.co) is a [real-time data platform](https://www.tinybird.co/product) that makes it possible to build powerful real-time recommendation engines with nothing but SQL. To learn more about Tinybird, check out the [documentation](https://www.tinybird.co/docs) or [sign up](https://www.tinybird.co/signup?referrer=https%3A%2F%2Fwww.tinybird.co%2Fblog-posts%2Freal-time-recommendation-system) for free

## What is a real-time recommendation system?

A real-time recommendation system is a class of [real-time data analytics](https://www.tinybird.co/blog-posts/real-time-analytics-a-definitive-guide) that uses an intelligent software algorithm to analyze user behavior and deliver personalized recommendations in real time.

Unlike traditional batch recommendation systems, which use long-running extract, transform, and load (ETL) workflows over static datasets, real-time recommendation systems dynamically adapt to user interactions as they happen, providing low-latency recommendations within a user session.

![Image 11 1](/images/blog/what-it-takes-to-build-a-real-time-recommendation-system/image-11-1.webp)

Unlike batch recommendation systems, real-time recommendation systems use streaming data platforms and real-time databases to make recommendations to users as they are browsing and based on the most up-to-date data.

### Using machine learning in real-time recommendation systems

Real-time recommendation systems often use machine learning models or advanced data processing techniques to predict user preferences and offer personalized suggestions. The most advanced real-time rec sys will use an [online feature store](https://www.tinybird.co/blog-posts/using-tinybird-as-a-serverless-online-feature-store) or real-time model inference system paired with a long-term model training system to both provide the best recommendations in real-time and continuously retrain and optimize the model based on user feedback.

A common advantage of real-time recommendation systems is their ability to handle dynamic and unpredictable user behavior. Traditional recommendation systems often struggle to adapt to sudden changes in user preferences or trends, as they rely on pre-processed data. In contrast, real-time recommendation systems that utilize machine learning can quickly adjust their recommendations based on new user interactions, ensuring the suggestions remain timely and effective.

> Real-time recommendation systems often use online machine learning models, however machine learning is not a prerequisite, and many real-time recommenders can use heuristic analysis developed in simple languages like SQL.

By integrating real-time recommendation systems powered by machine learning models into various online platforms, engineers can build differentiated features that enhance user engagement, increase average order value, boost conversion rates and average order values, and ultimately drive revenue growth.

Of course, not every recommendation system uses machine learning or artificial intelligence. Some models may be quite simple, utilizing stream processing or [real-time analytics](https://www.tinybird.co/blog-posts/real-time-analytics-a-definitive-guide) to compute recommendations on the fly, often using tried-and-true query languages such as SQL. The complexity of the system will depend on the use case.

### Real-time recommendation systems and data warehouses

One of the key features of real-time recommendation systems is their ability to pair both historical trends, stored in a data warehouse like Snowflake or BigQuery, with real-time event streams like those from Apache Kafka. These systems capture and process user interactions as they happen and compare them to historical data, allowing for immediate, and well-informed, response and recommendation generation.

For example, when a user visits an e-commerce website, the real-time recommendation system can analyze their browsing behavior, purchase history, cohort analysis, and other relevant data to suggest products that they are most likely to buy at that moment.

![Diagram comparing content-based and collaborative filtering approaches](/images/blog/what-it-takes-to-build-a-real-time-recommendation-system/image-15.webp)

Real-time recommenders make recommendations based on streaming user activity events and historic data that is often stored in a data warehouse.

### Content-based and collaboration-based systems

Real-time recommendation systems also take into account contextual information to provide more accurate and relevant recommendations. This often falls into two filtering categories: Content-based filtering and collaborative filtering.

#### Content-based filtering

Real-time recommendation systems use content-based filtering to analyze how a single user has acted in the past. Like what movies they’ve watched, or what clothes they’ve bought. In essence, a content-based recommender will place content that is similar to content a user has enjoyed in the past.

#### Collaborative filtering

Collaborative filtering involves making recommendations based on what similar users have done. Using cohort analysis, real-time recommendation systems can put something in front of a user based on what similar users have enjoyed, often using a technique called [matrix factorization](https://developers.google.com/machine-learning/recommendation/collaborative/matrix).

By lumping a user into a cohort of similar users, collaborative filtering helps make broader connections that single users might not have made on their own, increasing user engagement and satisfaction.

Of course, many successful real-time recommendation systems pair both content-based and collaborative filtering.

![Content-based versus collaborative filtering recommendation system flowchart](/images/blog/what-it-takes-to-build-a-real-time-recommendation-system/image-11-1024x642.webp)

Content-based filtering makes recommendations for content that matches content a user has already consumed, while collaborative filtering recommends content that similar users have consumed and enjoyed.

## Real-world examples of real-time recommendation systems

Real-time recommendation systems have found applications in various industries, including e-commerce, streaming services, social media platforms, and online advertising. But these few stand out as exceptional examples of real-time recommendation systems done right.

> Netflix, TikTok, Twitter, Spotify, and Amazon are well-known for their powerful real-time recommendation systems.

### Netflix

Perhaps the most prominent example is Netflix, the popular streaming service. Netflix’s recommendation system analyzes user viewing patterns, ratings, and interactions to generate personalized movie and TV show suggestions, all in real time.

Thanks to its real-time recsys, Netflix knows whether you like crime dramas or romcoms, when you like to watch them, and what you’re most likely to watch after finishing the season finale of Succession.

Many streaming services have attempted to copycat Netflix’s real-time recommendation system, but few have succeeded.

You can read more about Netflix’s world-class, real-time recsys [here](https://scale.com/blog/netflix-recommendation-personalization#-%20Justin%20Basilico,%20Director%20of%20Machine%20Learning%20and%20Recommender%20Systems%20at%20Netflix).

### TikTok

The newcomers to the social media zeitgeist have built a powerful recommendation system that analyzes user behavior and interactions with short-form videos. The real-time recsys, termed “Monolith”, is what drives TikTok’s virality, driving users to continuously engage with new, relevant content.

You can read more about TikTok’s real-time recommendation engine [here](https://gantry.io/blog/papers-to-know-20230110/).

### Twitter

Twitter recently open sourced its [algorithm](https://github.com/twitter/the-algorithm), and it is a model real-time recommendation system. Twitter’s rec sys analyzes your behavioral patterns on the platform and suggests posts that you’re most likely to engage in.

This is why you doom scroll. Like it or not, Twitter excels at keeping its users engaged through its real-time recommendation system. (Note: LinkedIn is no slouch either, and they’re quite sophisticated in [how they handle recruiter recommendations](https://www.kdnuggets.com/2020/10/linkedin-machine-learning-recruiter-recommendation-systems.html)).

You can read more about Twitter’s real-time recommendation algorithm [here](https://blog.twitter.com/engineering/en_us/topics/open-source/2023/twitter-recommendation-algorithm).

### Spotify

Spotify emerged victorious from the music streaming wars of the mid-2010s in part thanks to its advanced real-time recommendation system. Spotify analyzes your listening habits and suggests new music based on your tastes and the preferences of others like you. It does this through its Discover features and recommends the next song when you reach the end of your playlist.

You can read more about Spotify’s real-time recommendation system [here](https://www.music-tomorrow.com/blog/how-spotify-recommendation-system-works-a-complete-guide-2022).

### Amazon

Amazon wins e-commerce because of its obsessive focus on customer satisfaction, and its real-time recommendation system plays a huge role in its success.

Amazon provides customers with tailored product recommendations based on their browsing history, purchase behavior, and other contextual data. This personalized approach enhances the shopping experience and increases the likelihood of conversions.

For more information on Amazon’s real-time recommendation engine, read [this](https://jaydevs.com/how-amazon-uses-ai-in-ecommerce-and-retail/).

## The Key Components of a Real-Time Recommendation System

Before diving into the development process, it’s essential to understand the key components of a real-time recommendation system. These components can vary depending on the specific use cases but generally include the following:

### Data Collection

Data to power a real-time recsys must be acquired from various sources, such as user interactions, preferences, and content metadata. User-generated events are often ingested through streaming data platforms such as the open source Apache Kafka or [Confluent Cloud](https://www.tinybird.co/blog-posts/real-time-streaming-analytics-confluent-connector-tinybird), whereas content metadata may be stored in data lakes such as Databricks or Amazon S3, data warehouses like Snowflake or BigQuery, or databases such as Postgres, MySQL, or MongoDB. The same stream processing infrastructure also powers other real-time use cases like [fraud detection](/blog/how-to-build-a-real-time-fraud-detection-system/), where you're analyzing transaction streams instead of user behavior.

### Data Storage

Data must be stored efficiently, assuring it can be accessed and processed quickly. Redis is a common key-value store for recommender systems thanks to its exceptionally fast lookup. Still, [real-time databases](https://www.tinybird.co/blog-posts/real-time-databases-what-developers-need-to-know) like [Tinybird](https://www.tinybird.co) and ClickHouse have become popular for their ability to provide high ingest throughput and low-latency queries, with more advanced features than key-value stores.

### Data Preprocessing

Data often must be cleaned, transformed, or otherwise prepared for analysis. This can include normalization or feature computation within an [online feature store](https://www.tinybird.co/blog-posts/using-tinybird-as-a-serverless-online-feature-store).

One benefit of using a [real-time data platform](https://www.tinybird.co/blog-posts/real-time-data-platforms) like Tinybird is that it offers an ergonomic query engine to perform data preprocessing using SQL. Engineers can use Tinybird’s [materialized views](https://www.tinybird.co/blog-posts/what-are-materialized-views-and-why-do-they-matter-for-realtime) to incrementally calculate features during [real-time data ingestion](https://www.tinybird.co/blog-posts/real-time-data-ingestion) so that subsequent requests to the recommendation engine are much faster.

> [Real-time data platforms](https://www.tinybird.co/blog-posts/real-time-data-platforms) provide an online query engine to transform real-time data on the fly and incrementally compute features that can be used to determine the right recommendation very quickly.

One common approach to real-time data processing for a real-time recommendation engine is to use [vector embeddings](https://www.pinecone.io/learn/vector-embeddings/). Vector embeddings are effectively data features calculated over incoming real-time datasets. Stored in a dedicated vector database or using vector extensions for real-time databases (like ClickHouse), embeddings are used by machine learning algorithms to make decisions about user interaction data and offer a recommendation.

### Machine Learning Algorithms

While not every real-time recommendation engine will use them, machine learning algorithms can be used to predict user preferences based on the collected data. Common machine-learning models for recommendation algorithms include neural networks and k-means clustering (kNN).

Keep in mind that real-time recommendation algorithms aren’t required to use machine learning to achieve their purpose. Some real-time recommendation algorithms can be developed based on known heuristics using simple query languages like SQL.

Building a real-time recommendation system with SQL can be a smart approach if you want to build a high-quality rec sys very quickly, without the need for data science resources or long-running model training. If necessary, you can augment and extend the recommendation engine with machine learning in the future.

### Real-Time Data Processing and Access

Real-time recommendation systems must inject their analysis into a user-facing application within a session timeframe. They generally include APIs that these applications utilize to get recommendations and post feedback results.

> Real-time recommendation systems include an API layer by which the user-facing application can both post user activity and request real-time recommendations.

Tinybird, for example, allows engineers to publish SQL queries and materializations performed in the pre-processing step as [high-concurrency, low-latency APIs](https://www.tinybird.co/docs/concepts/apis.html). These APIs can be utilized by frontend applications to return recommendations immediately when a user visits a page or performs an action within a product.

![Image 12 1](/images/blog/what-it-takes-to-build-a-real-time-recommendation-system/image-12-1.webp)

Real-time recommendation systems utilize event streaming platforms, a real-time database, online machine learning or heuristic real-time analytics, and an API layer to both measure user data and make recommendations in real-time.

Each of these components plays a key role in the overall effectiveness and performance of a real-time recommendation engine. Careful consideration and integration of these elements are vital to ensure accurate recommendations and a smooth user experience.

## Developing a Real-Time Recommendation System from Scratch

Building a real-time recommendation system from scratch requires a solid understanding of real-time data processing, machine learning algorithms, and software engineering principles. It’s a complex and iterative process that demands collaboration between data science, data engineering, software engineering, and domain experts.

While the approaches to building and scaling a real-time recommendation engine will differ by use case and resource availability, the development process typically involves the following steps:

### Defining Objectives

Recommendation systems can solve different problems with different approaches. Understand the core business objectives, not just the technical possibilities. Are you trying to increase conversion rates? Boost average order value? Minimize churn? Increase net revenue retention?

As with any technical project, the business goal comes first.

### Data Collection and Storage

Data collection and storage is a tooling and infrastructure question. What data streaming platform will you use? If you’re self-hosting you’ll likely go with Apache Kafka. If you’re on AWS maybe you’ll use Kinesis.

Similarly, you’ll need to think about storage. Real-time recommendation engines fall squarely into “big data” territory. Are you going to use a real-time data warehouse or a data warehouse with a key-value cache like Redis, opt for a managed, [serverless real-time data platform](https://www.tinybird.co/product) like [Tinybird](https://www.tinybird.co), or host an open source [real-time database](https://www.tinybird.co/blog-posts/real-time-databases-what-developers-need-to-know) like ClickHouse, Pinot, or Druid? Or is your use case complex and significant enough to warrant a dedicated vector database?

> Real-time recommendation systems need efficient databases to store real-time and historical data.

Beyond tooling, you need to think about the metal. Will you self-host, use a cloud, or buy a managed service? As you turn the knobs of cost, time, and resources, you’ll have to make some decisions about infrastructure.

### Data Preprocessing

Every real-time recommendation system involves preprocessing before you pass it to the recommendation engine. This can be as simple as using stream processing techniques, or it may involve [online feature computation](https://www.tinybird.co/blog-posts/using-tinybird-as-a-serverless-online-feature-store) using a feature store. Real-time data processing can be accomplished in many ways.

You may choose to use a stream processing engine like Apache Flink to transform streaming data in motion, or a [real-time data analytics](https://www.tinybird.co/blog-posts/real-time-analytics-a-definitive-guide) platform like Tinybird to compute features on the fly using SQL. Or, you might need to engineer vector embeddings based on domain expertise. All of these are possible, even at once!

### Algorithm Selection and Development

You’ll have to choose an algorithm to make your recommendations. While deep learning algorithms like deep neural networks get all the attention, it’s possible to use very simple heuristics to build a real-time recommendation model. It all depends on your use case and what you’re trying to accomplish.

For example, suppose you had a table of product purchases containing two rows: `user_id` and `product_id`, where each row represents a purchase by that user of that product. Using a collaborative-filtering approach, you could recommend the top 10 products bought by users who also bought that product using this SQL query:

```sql
-- gets all the products bought by the target user.
WITH user_purchases AS (
    SELECT product_id
    FROM purchases
    WHERE user_id = {{UInt64(target_user_id)}}  -- the ID of the user we're making recommendations for
),
-- finds all users who have bought at least one of the same products as the target user.
similar_users AS (
    SELECT user_id
    FROM purchases
    WHERE product_id IN (SELECT product_id FROM user_purchases)
    AND user_id != {{UInt64(target_user_id)}}
),
-- identifies products bought by similar users but not by the target user, and counts how many times each product was bought.
recommendations AS (
    SELECT product_id, COUNT(*) AS count
    FROM purchases
    WHERE user_id IN (SELECT user_id FROM similar_users)
    AND product_id NOT IN (SELECT product_id FROM user_purchases)
    GROUP BY product_id
)
--orders the products by how often they were bought and returns the top 10 as the recommendations.
SELECT product_id
FROM recommendations
ORDER BY count DESC
LIMIT 10
```

### Model Training and Evaluation

Once you’ve chosen a model, you’ll need to train it on data you’ve already collected and evaluate its performance against predefined metrics.

### Real-Time Implementation

The last step is to integrate all prior steps into an actual, production implementation. You’ll have to build a real-time application that places instant recommendations in front of users based on real-time user interactions.

This is one of the last steps, but it’s often the most challenging because real-time recommendation systems must run in production and at scale. Scalability, durability, and security all must be considered.

### Optimization

Of course, as you collect real-world real-time data, your algorithm should be optimized based on your target metrics. This involves continual offline training on your algorithms or tweaking your heuristics to improve the real-time recommendation engine.

## Wrapping up

Building a real-time recommendation system requires a combination of technical expertise, careful planning, and a deep understanding of user preferences. By successfully implementing and optimizing these systems, businesses can not only enhance user experiences but also gain a competitive edge in the digital landscape.

> Real-time recommendation systems can be very complex or very simple. How you build it depends on the use case and its unique requirements.

As the world continues to generate vast amounts of data, the importance of real-time recommendation systems will only grow. As a part of an intentional [real-time data strategy](https://www.tinybird.co/blog-posts/16-questions-real-time-data-strategy), these systems revolutionize the way we discover and engage with digital content, making our online experiences more relevant and rewarding than ever before.

Ready to start building a real-time recommendation system? Try [Tinybird](https://www.tinybird.co), the [real-time data platform](https://www.tinybird.co/product) that makes it possible to build a real-time recommender with nothing but SQL.
