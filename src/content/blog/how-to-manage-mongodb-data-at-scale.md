---
title: 'How to Manage MongoDB Data at Scale'
date: 2021-06-30
slug: 'how-to-manage-mongodb-data-at-scale'
description: 'Let’s face it: Your data can get stale and old quickly. But just because the data isn’t being used as often as it once was doesn’t mean that it’s not still valuable or that it won’t be valuable again...'
categories: ['Databases']
heroImage: '/images/blog/how-to-manage-mongodb-data-at-scale/og-pink-pattern.webp'
---

Let’s face it: Your data can get stale and old quickly. But just because the data isn’t being used as often as it once was doesn’t mean that it’s not still valuable or that it won’t be valuable again in the future. I think this is especially true for data sets like internet of things (IoT) data or user-generated content like comments or posts. (When was the last time you looked at your tweets from 10 years ago?). In this post, we will cover how to manage your data at scale with MongoDB Atlas Online Archive.

![Gif of Matt Damon from Saving Private Ryan aging into an old man.](/images/blog/how-to-manage-mongodb-data-at-scale/ad091ed6404c7a0a0c8954b19c262ac9cee25251.gif)

This is a real-time view of my IoT time-series data aging.

When managing systems that have massive amounts of data, or systems that are growing, you may find that paying to save this data becomes increasingly more costly every single day. (If you're curious about other scaling strategies like sharding and partitioning, I covered the [differences between database sharding and partitioning](/blog/database-sharding-vs-partitioning-whats-the-difference/) in a separate post.) Wouldn’t it be nice if there was a way to manage this data in a way that still allows it to be useable by being easy to query, as well as saving you money and time? Well, today is your lucky day because, with [MongoDB Atlas Online Archive](https://web.archive.org/web/20220116194200/https://docs.atlas.mongodb.com/online-archive/manage-online-archive/), you can do all this and more!

With the Online Archive feature in [MongoDB Atlas](https://docs.atlas.mongodb.com/), you can create a rule to automatically move infrequently accessed data from your live Atlas cluster to MongoDB-managed, read-only cloud object storage. Once your data is archived, you will have a unified view of your Atlas cluster and your Online Archive using a single endpoint..

> Note: You can’t write to the Online Archive as it is read-only.

For this demonstration, we will be setting up an Online Archive to automatically archive comments from the `sample_mflix.comments` sample data set that are older than 10 years. We will then connect to our dataset using a single endpoint and run a query to be sure that we can still access all of our data, whether it’s archived or not.

## Prerequisites

- The Online Archive feature is available on [M10](https://docs.atlas.mongodb.com/cluster-tier/) and greater clusters that run MongoDB 3.6 or later. So, for this demo, you will need to create a [M10 cluster](https://docs.atlas.mongodb.com/cluster-tier/) in MongoDB Atlas. [Click here for information on setting up a new MongoDB Atlas cluster](https://docs.atlas.mongodb.com/getting-started/).

- Ensure that each database has been seeded by [loading sample data into our Atlas cluster](https://docs.atlas.mongodb.com/sample-data/). I will be using the `sample_mflix.comments` dataset for this demo.

> If you haven’t yet set up your free cluster on [MongoDB Atlas](http://bit.ly/mongodbatlas), now is a great time to do so. You have all the instructions in this blog post.

## Configure Online Archive

Atlas archives data based on the criteria you specify in an archiving rule. The criteria can be one of the following:

- **A combination of a date and number of days.** Atlas archives data when the current date exceeds the date plus the number of days specified in the archiving rule.

- **A custom query.** Atlas runs the query specified in the archiving rule to select the documents to archive.

In order to configure our Online Archive, first navigate to the Cluster page for your project, click on the name of the cluster you want to configure Online Archive for, and click on the **Online Archive** tab.

![Screenshot from Atlas with a red rectangle highlighting the Online Archive tab.](/images/blog/how-to-manage-mongodb-data-at-scale/f7202d15c30f78dd6bdc7a989c2b80fba4ee46e8-1024x352.webp)

Next, click the Configure Online Archive button the first time and the Add Archive button subsequently to start configuring Online Archive for your collection. Then, you will need to create an Archiving Rule by specifying the collection namespace, which will be `sample_mflix.comments` for this demo. You will also need to specify the criteria for archiving documents. You can either use a custom query or a date match. For our demo, we will be using a date match and auto-archiving comments that are older than 10 years (365 days \* 10 years = 3650 days) old. It should look like this when you are done.

![Screenshot from Atlas Online Archive configuration page showing the fields as filled in for this demo.](/images/blog/how-to-manage-mongodb-data-at-scale/37ad3e780c51a49993efac3a3a626d6034798c77-762x1024.webp)

Optionally, you can enter up to two most commonly queried fields from the collection in the Second most commonly queried field and Third most commonly queried field respectively. These will create an index of your archived data so that the performance of your online archive queries is improved. For this demo, we will leave this as is, but if you are using production data, be sure to analyze which queries you will be performing most often on your Online Archive.

Before enabling the Online Archive, it’s a good idea to run a test to ensure that you are archiving the data that you intended to archive. Atlas provides a query for you to test on the confirmation screen. I am going to connect to my cluster using [MongoDB Compass](https://docs.mongodb.com/compass/master/connect/) to test this query out, but feel free to connect and run the query using any method you are most comfortable with. The query we are testing here is this.

```javascript
db.comments.find({
   date: { $lte: new Date(ISODate().getTime() - 1000 \* 3600 \* 24 \* 3650)}
})
.sort({ date: 1 })
```

When we run this query against the `sample_mflix.comments` collection, we find that there is a total of 50.3k documents in this collection, and after running our query to find all of the comments that are older than 10 years old, we find that 43,451 documents would be archived using this rule. It’s a good idea to scan through the documents to check that these comments are in fact older than 10 years old.

![Screenshot from MongoDB Compass with a red rectangle around the total documents in the collection, 50.3k, and a red rectangle around the number of documents that would be archived by this query, 43,451. There is also a purple rectangle highlighting the query used to test our Online Archive rule.](/images/blog/how-to-manage-mongodb-data-at-scale/58809939fedbd8a1ff5528b3b12b697df086b846-1024x633.webp)

So, now that we have confirmed that this is in fact correct and that we do want to enable this Online Archive rule, head back to the _Configure an Online Archive_ page and click **Begin Archiving**.

![Screenshot from Atlas Online Archive configuration page with a red rectangle highlighting the Begin Archiving button.](/images/blog/how-to-manage-mongodb-data-at-scale/270a4a82e5d9df2890f3c1f1ab626fa69786c2ae-900x1024.webp)

Lastly, verify and confirm your archiving rule, and then your collection should begin archiving your data!

![Animated celebration GIF of people dancing](/images/blog/how-to-manage-mongodb-data-at-scale/54043a0d68774605663ff8db091510960f96e958.gif)

> Note: Once your document is queued for archiving, you can no longer edit the document.

## How to Access Your Archived Data

Okay, now that your data has been archived, we still want to be able to use this data, right? So, let’s connect to our Online Archive and test that our data is still there and that we are still able to query our archived data, as well as our active data.

First, navigate to the _Clusters_ page for your project on Atlas, and click the **Connect** button for the cluster you have Online Archive configured for. Choose your connection method. I will be using [Compass](https://www.mongodb.com/try/download/compass) for this example. Select **Connect to Cluster and Online Archive** to get the connection string that allows you to federate queries across your cluster and Online Archive.

![MongoDB Atlas connection dialog showing Cluster and Online Archive option](/images/blog/how-to-manage-mongodb-data-at-scale/6a1c97dc94090ecb676e65a669c83075c90006b2-1024x965.webp)

After navigating to the `sample_mflix.comments` collection, we can see that we have access to all 50.3k documents in this collection, even after archiving our old data! This means that from a development point of view, there are no changes to how we query our data, since we can access archived data and active data all from one single endpoint! How cool is that?

![MongoDB Compass showing sample_mflix.comments collection with 50303 documents](/images/blog/how-to-manage-mongodb-data-at-scale/49c82ef8426d2c44a93bcd26bf71c5be6a16dbe9.webp)

## Wrap-Up

There you have it! In this post, we explored how to manage your MongoDB data at scale using MongoDB Atlas Online Archive. We set up an Online Archive so that Atlas automatically archived comments from the `sample_mflix.comments` dataset that were older than 10 years. We then connected to our dataset and made a query in order to be sure that we were still able to access and query all of our data from a unified endpoint, regardless of whether it was archived or not. This technique of archiving stale data can be a powerful feature for dealing with datasets that are massive and/or growing quickly in order to save you time, money, and development costs as your data demands grow.

> If you have questions, please head to our [developer community website](https://community.mongodb.com/) where the MongoDB engineers and the MongoDB community will help you build your next big idea with MongoDB.

## Additional resources:

- Archive Cluster Data

## Want to check out more of my technical posts?

- [How to use MongoDB Client-Side Field Level Encryption (CSFLE) with Node.js](/blog/how-to-use-mongodb-client-side-field-level-encryption-csfle-with-node-js/)

- [MongoDB Aggregation Pipeline Queries vs SQL Queries](/blog/mongodb-aggregation-pipeline-queries-vs-sql-queries/)

- [An Introduction to IoT (Internet of Toilets)](/blog/an-introduction-to-iot-internet-of-toilets/)

- [How To Use The MongoDB Visual Studio Code Plugin](/blog/how-to-use-the-mongodb-visual-studio-code-plugin/)

- [Linked Lists and MongoDB: A Gentle Introduction](/blog/linked-lists-and-mongodb-a-gentle-introduction/)
