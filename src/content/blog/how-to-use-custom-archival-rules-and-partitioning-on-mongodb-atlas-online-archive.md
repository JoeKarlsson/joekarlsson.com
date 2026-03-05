---
title: 'How to Use Custom Archival Rules and Partitioning on MongoDB Atlas Online Archive'
date: 2021-06-30
slug: 'how-to-use-custom-archival-rules-and-partitioning-on-mongodb-atlas-online-archive'
description: 'Okay, so you’ve set up a simple MongoDB Atlas Online Archive, and now you might be wondering, “What’s next?” In this post, we will cover some more advanced Online Archive use cases, including setting...'
categories: ['Databases']
heroImage: '/images/blog/how-to-use-custom-archival-rules-and-partitioning-on-mongodb-atlas-online-archive/og-sql-to-mdb.webp'
heroAlt: 'MongoDB Atlas Online Archive custom archival rules and partitioning'
contentNotice: false
tldr: 'Goes beyond basic date-based archiving to show how to set up custom query-based archival rules in MongoDB Atlas Online Archive (like archiving inactive users) and how to partition your archived data for faster queries.'
---

Okay, so you’ve set up a simple MongoDB Atlas Online Archive, and now you might be wondering, “What’s next?” In this post, we will cover some more advanced Online Archive use cases, including setting up custom archival rules for MongoDB and how to improve query performance through partitioning.

## Prerequisites

- The Online Archive feature is available on [M10](https://docs.atlas.mongodb.com/cluster-tier/) and greater Atlas clusters that run MongoDB 3.6 or later. So for this demo, you will need to create a [M10 cluster](https://docs.atlas.mongodb.com/cluster-tier/) in MongoDB Atlas. [Click here for information on setting up a new MongoDB Atlas cluster](https://docs.atlas.mongodb.com/getting-started/) or check out How to Manage Data at Scale With MongoDB Atlas Online Archive.

- Seed each database with data. See how to [load sample data into a Atlas cluster](https://docs.atlas.mongodb.com/sample-data/). I will be using the `sample_analytics.customers` dataset for this demo.

## Why Create an Online Archive?

Creating an Online Archive rule based on the date makes sense for a lot of archiving situations, such as automatically archiving documents that are over X years old, or that were last updated Y months ago. But what if you want to have more control over what gets archived? Some examples of data that might be eligible to be archived are:

- Data that has been flagged for archival by an administrator.

- Discontinued products on your eCommerce site.

- User data from users that have closed their accounts on your platform (unless they are European citizens).

- Employee data from employees that no longer work at your company.

There are lots of reasons why you might want to set up custom rules for archiving your cold data. Let’s dig into how you can achieve this using custom archive rules with MongoDB Atlas Online Archive. For this demo, we will be setting up an automatic archive of all users in the `sample_analytics.customers` collection that have the ‘active’ field set to `false`.

## How to Create Custom Archival Rules for MongoDB

In order to configure our Online Archive, first navigate to the Cluster page for your project, click on the name of the cluster you want to configure Online Archive for, and click on the **Online Archive** tab.

Next, click the Configure Online Archive button the first time and the **Add Archive** button subsequently to start configuring Online Archive for your collection. Then, you will need to create an Archiving Rule by specifying the collection namespace, which will be `sample_analytics.customers`.

You will also need to specify your custom criteria for archiving documents. You can specify the documents you would like to filter for archival with a MongoDB query, in JSON, the same way as you would write filters in MongoDB Atlas.

To retrieve the documents staged for archival, we will use the following find command. This will retrieve all documents that have the `active` field set to `false` or do not have an `active` key at all.

```json
{ "$or": [{ "active": false }, { "active": null }] }
```

You will need to continue setting up your archive, and then you should be done!

> **Note**: It’s always a good idea to run your custom queries in the [mongo shell](https://docs.mongodb.com/mongodb-shell/install/) first to ensure that you are archiving the correct documents.

> **Note**: MongoDB documents, once they are initiated for an archive and is queued for archiving, are no longer editable.

## Why Partitioning?

One of the reasons we archive data is to access and query it in the future if for some reason we still need to use it. You might even be accessing this data frequently! That’s why it’s useful to be able to partition your archived data and speed up query times. With Atlas Online Archive, you can specify the two most frequently queried fields in your collection to create partitions in your online archive.

## Partitioning Best Practices

Fields with a moderate to high cardinality (or the number of elements in a set or grouping) are good choices to be used as a partition. Queries that don’t contain these fields will require a full collection scan of all archived documents, which will take longer and increase your costs. However, it’s a bit of a balancing act.

For example, fields with low cardinality won’t partition the data well and therefore won’t improve performance greatly. However, this may be OK for range queries or collection scans but will result in fast archival performance.

Fields with mid to high cardinality will partition the data better leading to better general query performance, but maybe slightly slower archival performance.

Fields with extremely high cardinality like `_id` will lead to poor query performance for everything but “point queries” that query on \_id, and will lead to terrible archival performance due to writing many partitions.

> Note: Online Archive is powered by MongoDB Atlas Data Lake. To learn more about how partitions improve your query performance in Data Lake, see [Data Structure in S3](https://docs.mongodb.com/datalake/admin/optimize-query-performance#data-structure-in-s3).

The specified fields are used to partition your archived data for optimal query performance. Partitions are similar to folders. You can move whichever field to the first position of the partition if you frequently query by that field.

### Compound Indexes

The order of fields listed in the path is important in the same way as it is in [Compound Indexes](https://docs.mongodb.com/manual/core/index-compound/). Data in the specified path is partitioned first by the value of the first field, and then by the value of the next field, and so on. Atlas supports queries on the specified fields using the partitions.

You can specify the two most frequently queried fields in your collection and order them from the most frequently queried in the first position to the least queried field in the second position. For example, suppose you are configuring the online archive for your `customers` collection in the `sample_analytics` database. If your archived field is set to the custom archival rule in our example above, your first queried field is `username`, and your second queried field is `email`, your partition will look like the following:

```text
/username/email
```

Atlas creates partitions first for the `username` field, followed by the `email`. Atlas uses the partitions for queries on the following fields:

- the `username` field

- the `username` field and the `email` field

> **Note**: The value of a partition field can be up to a maximum of 700 characters. Documents with values exceeding 700 characters are not archived.

![Figure showing how Atlas Online Archive partitions data and how it uses it to query documents quickly.](/images/blog/how-to-use-custom-archival-rules-and-partitioning-on-mongodb-atlas-online-archive/Online_Archive_Partition_3466b335d6.webp)

For more information on how to partition data in your Online Archive, please [refer to the documentation](https://docs.atlas.mongodb.com/online-archive/configure-online-archive/).

## Summary

In this post, we covered some advanced use cases for Online Archive. This should help you take advantage of this MongoDB Atlas feature. We then initialized a demo to show you how to set up custom archival rules for MongoDB with Atlas Online Archive. And finally, we covered how to improve query performance through partitioning your archived data.

If you have questions about custom archival rules for MongoDB, please head to our [developer community website](https://community.mongodb.com/). That is where the MongoDB engineers and the MongoDB community will help you build your next big idea with MongoDB.

## More Technical Posts

- [How to use MongoDB Client-Side Field Level Encryption (CSFLE) with Node.js](/blog/how-to-use-mongodb-client-side-field-level-encryption-csfle-with-node-js/)
- [MongoDB Aggregation Pipeline Queries vs SQL Queries](/blog/mongodb-aggregation-pipeline-queries-vs-sql-queries/)
- [An Introduction to IoT (Internet of Toilets)](/blog/an-introduction-to-iot-internet-of-toilets/)
- [How To Use The MongoDB Visual Studio Code Plugin](/blog/how-to-use-the-mongodb-visual-studio-code-plugin/)
- [Linked Lists and MongoDB: A Gentle Introduction](/blog/linked-lists-and-mongodb-a-gentle-introduction/)
