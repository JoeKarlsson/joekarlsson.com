---
title: 'How to Automate Continuous Data Copying from MongoDB to S3'
seoTitle: 'Copy MongoDB Data to S3 as Parquet'
date: 2021-05-03
slug: 'how-to-automate-continuous-data-copying-from-mongodb-to-s3'
description: 'Copy new MongoDB data into an AWS S3 bucket as Parquet every minute with Atlas Data Federation and scheduled Atlas Triggers, plus what to change for production.'
categories: ['Web Dev']
writtenFor: 'MongoDB'
contentNotice: 'I wrote this tutorial for the MongoDB Developer Center in May 2021, and MongoDB updated it for Atlas Data Federation in 2024. MongoDB shut the Developer Center down, so it lives here now. MongoDB keeps its own current version in the Atlas docs: [Copy Data to S3](https://www.mongodb.com/docs/atlas/atlas-ui/triggers/copy-data-to-s3-tutorial/).'
tldr: 'Two scheduled Atlas Triggers do the work: one writes a test document every minute, the other runs an aggregation through a federated database that ends in $out to S3, landing the newest documents in your bucket as Parquet.'
updatedDate: 2026-11-22
corrections:
  - date: 2026-11-22
    note: "The copy trigger was meant to take the last 60 seconds of documents, as the text says, but its `$match` used `60 * 60 * 1000` (an hour). It is `60 * 1000` now, which is what MongoDB's own version of this tutorial uses. The sample IAM policy lacked `s3:PutObject` and `s3:DeleteObject`, which read and write access needs, and named a role ARN where S3 needs the bucket's ARNs. The steps for creating Triggers now follow today's Atlas sidebar."
heroImage: '/images/blog/how-to-automate-continuous-data-copying-from-mongodb-to-s3/thumb-138b2233.webp'
heroAlt: 'Boxes moving along a conveyor line'
heroVideo: '/images/blog/how-to-automate-continuous-data-copying-from-mongodb-to-s3/archival-50a63a1a.mp4'
mastheadImage: '/images/blog/how-to-automate-continuous-data-copying-from-mongodb-to-s3/archival-50a63a1a.webp'
---

Modern always-on applications rely on automatic failover and real-time data access. [MongoDB Atlas already supports automatic backups](https://www.mongodb.com/docs/atlas/backup-restore-cluster/) out of the box, but you might still want to copy your data into another location to run advanced analytics on it or to isolate your operational workload. That's why it can be useful to set up automatic, continuous replication of your data.

In this post, we're going to set up a way to continuously copy data from a MongoDB database into an [AWS S3](https://aws.amazon.com/s3/) bucket in the [Parquet](https://parquet.apache.org/) data format by using [MongoDB Atlas Triggers](https://www.mongodb.com/docs/atlas/atlas-ui/triggers/). First, we'll set up a federated database instance using [MongoDB Atlas Data Federation](https://www.mongodb.com/docs/atlas/data-federation/overview/) to bring a MongoDB database and our S3 bucket together. Next, we'll set up a Trigger that adds a new document to a collection every minute, and another Trigger that copies our data to the S3 bucket. Then we'll check that the data is being copied into S3 from MongoDB. Finally, we'll cover what you'll want to consider when building something like this for your own application.

![The pipeline: inside MongoDB Atlas, scheduled Trigger 1 runs every minute and inserts a new document into the Atlas cluster with insertOne. Scheduled Trigger 2 also runs every minute and sends an aggregate to the federated database instance, which reads the last 60 seconds of documents from the cluster. Its $out stage writes them as Parquet to events.parquet in an Amazon S3 bucket, replacing the file on every run.](/images/blog/how-to-automate-continuous-data-copying-from-mongodb-to-s3/pipeline.svg)

Every file from this post is in [a repo](https://github.com/JoeKarlsson/mongodb-s3-parquet-triggers), ready to paste.

Note: The values we use for some parameters in this post are for demonstration and testing. If you plan to use this, read the "Production considerations" section and adjust them to your needs.

Both trigger functions, the IAM policy and the DuckDB check are in [a companion repo](https://github.com/JoeKarlsson/mongodb-s3-parquet-triggers), with tests.

## What is Parquet?

For those of you not familiar with [Parquet](https://parquet.apache.org/), it's an amazing file format that does a lot of the heavy lifting to make queries on data stored in files fast. It's a popular format in the data warehouse and data lake space, and for a variety of machine learning tasks.

One thing we often see users struggle with is getting NoSQL data into Parquet, since it's a [columnar format](https://en.wikipedia.org/wiki/Column-oriented_DBMS). Historically, you'd have to write custom code to get the data out of the database, transform it into the right structure, and then probably use a third-party library to write it to Parquet. With Atlas Data Federation's `$out` to S3, you can convert MongoDB data into Parquet with little effort.

## Prerequisites

To follow along with this tutorial, you'll need to:

1. Create a [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database) account, if you don't have one already, with a cluster that has some data in it. Creating a federated database instance and Triggers needs the Project Owner role.
2. Create [an AWS account with privileges to create IAM roles and S3 buckets](https://www.mongodb.com/docs/atlas/data-federation/deployment/deploy-adf/) (so Data Federation can write data to your S3 bucket).
3. [Install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
4. [Configure the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html).
5. _Optional_: [Set up unified AWS access](https://www.mongodb.com/docs/atlas/security/set-up-unified-aws-access/).

## Create a federated database instance and connect to S3

We need a federated database instance to copy our MongoDB data and use Atlas Data Federation's `$out` to S3, which converts the data into Parquet and lands it in an S3 bucket.

First, go to "Data Federation" on the left-hand side of your Atlas dashboard, then click "Manual setup" in the "Create New Federated Database" dropdown in the top right corner.

![The Atlas Data Federation page with the Create new federated database menu open and Set up manually highlighted](/images/blog/how-to-automate-continuous-data-copying-from-mongodb-to-s3/create-federated-database.webp)

Then connect your S3 bucket to your federated database instance. This is where we'll write the Parquet files. The setup wizard guides you through it quickly, but you'll need your AWS credentials.

Note: For more information, see the documentation on [deploying a federated database instance for an S3 data store](https://www.mongodb.com/docs/atlas/data-federation/deployment/deploy-adf/). Be sure to give Atlas Data Federation "Read and Write" access to the bucket, so it can write the Parquet files there.

![The Add Data Source dialog, offering AWS S3, Atlas Cluster and HTTP(S) as the data store](/images/blog/how-to-automate-continuous-data-copying-from-mongodb-to-s3/add-data-source.webp)

Select an AWS IAM role for Atlas.

- If you created a role that Atlas is already authorized to read and write to your S3 bucket, select it.
- If you're authorizing Atlas for an existing role or creating a new one, [follow the documentation](https://www.mongodb.com/docs/atlas/data-federation/deployment/deploy-adf/) for how to do it.

Enter the S3 bucket information.

- Enter the name of your S3 bucket. I named mine `mongodb-data-lake-demo`.
- Choose Read and write, so you can write documents to your S3 bucket.

Assign an access policy to your AWS IAM role.

- Follow the steps in the Atlas user interface to assign an access policy to your AWS IAM role.
- Your read and write role policy should look similar to this. The Atlas wizard generates the exact one for your bucket; S3 permissions apply to the bucket's ARNs, not the role's:

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [
				"s3:ListBucket",
				"s3:GetObject",
				"s3:GetObjectVersion",
				"s3:GetBucketLocation",
				"s3:PutObject",
				"s3:DeleteObject"
			],
			"Resource": ["arn:aws:s3:::<your-bucket>", "arn:aws:s3:::<your-bucket>/*"]
		}
	]
}
```

- Define the path structure for your files in the S3 bucket and click Next.
- Once you've connected your S3 bucket, create a simple data source to query the data in S3, so you can check at the end of this tutorial that the data was written there.

## Connect your MongoDB database to your federated database instance

Now we're going to connect our Atlas cluster, so we can write data from it into the Parquet files on S3. Pick the cluster from the list of clusters in your Atlas project, then select the databases and collections you'd like to create data sources from and drag them into your federated database instance.

![The Add Data Source dialog with an Atlas cluster chosen and the listingsAndReviews collection from sample_airbnb checked](/images/blog/how-to-automate-continuous-data-copying-from-mongodb-to-s3/select-collections.webp)

![The federated database configuration screen, mapping collections from the Atlas cluster into a virtual database](/images/blog/how-to-automate-continuous-data-copying-from-mongodb-to-s3/configure-federated-database.webp)

## Create a MongoDB Atlas Trigger to create a new document every minute

With all of our data sources set up in our new federated database instance, we can set up a [MongoDB Atlas Trigger](https://www.mongodb.com/docs/atlas/atlas-ui/triggers/) to generate new documents every minute for our continuous replication demo. **Triggers** run server-side logic in response to database events or on a schedule. Atlas has two kinds: **Database** and **Scheduled** triggers. We'll use a [Scheduled trigger](https://www.mongodb.com/docs/atlas/atlas-ui/triggers/scheduled-triggers/) to make sure these documents get archived in our S3 bucket automatically.

1. In the Atlas sidebar, under **Streaming Data**, click **Triggers**.
2. Click **Add Trigger** and choose **Scheduled** as the trigger type.
3. Name it `Create_Event_Every_Min_Trigger`, set it to repeat every minute, and link your cluster as its data source.
4. Choose **Function** as the event type. The screenshots here are from 2022, so today's Atlas looks a little different, but the settings are the same:

![The Atlas trigger configuration page for the new trigger. Trigger type: Scheduled. Name: Create_Event_Every_Min_Trigger. Enabled: On. Schedule type: Basic. Linked data sources: Cluster 1 and atlas_data_lake. Event type: Function.](/images/blog/how-to-automate-continuous-data-copying-from-mongodb-to-s3/create-event-trigger.webp)

And the Trigger function looks like this:

`context.services.get` takes the name of the linked data source: your cluster here, which Atlas names `mongodb-atlas` by default.

```js
exports = async function () {
	const mongodb = context.services.get('mongodb-atlas');
	const db = mongodb.db('NAME_OF_YOUR_DATABASE');
	const events = db.collection('NAME_OF_YOUR_COLLECTION');

	const result = await events.insertOne({
		time: new Date(),
		aNumber: Math.random() * 100,
		type: 'event',
	});

	return JSON.stringify(result);
};
```

Lastly, click Run and check that your database gets a new document every 60 seconds.

![The documents the Create_Event_Every_Min_Trigger generated in Atlas, with a red box around the new data](/images/blog/how-to-automate-continuous-data-copying-from-mongodb-to-s3/new-documents.webp)

## Create a MongoDB Atlas Trigger to copy new MongoDB data into S3 every minute

Alright, now the fun part. We're going to create a new Trigger that copies our MongoDB data every 60 seconds using Atlas Data Federation's `$out` to S3 aggregation stage. Create another Scheduled trigger, name it `Copy_Events_To_S3_Trigger`, set it to repeat every minute, and link your federated database instance this time.

![The Add Trigger page for a Scheduled trigger that repeats every minute, linked to the federated database](/images/blog/how-to-automate-continuous-data-copying-from-mongodb-to-s3/copy-to-s3-trigger.webp)

Your Trigger function will look something like this. There's a lot going on, so let's break it down.

- First, we connect to our new federated database instance. This is different from the previous Trigger, which connected to our cluster. Atlas names the federated instance's data source `mongodb-datafederation` by default; use yours in `context.services.get`. You must [connect](https://www.mongodb.com/docs/atlas/data-federation/tutorial/connect/) to your federated database instance to use [`$out`](https://www.mongodb.com/docs/atlas/data-federation/supported-unsupported/pipeline/out/) to S3.
- Next, we build an aggregation pipeline that first matches the MongoDB documents written in the last 60 seconds.
- Then the `$out` stage copies the documents from the previous stage into S3.
- In the format, we specify _parquet_ and set a maxFileSize and maxRowGroupSize.
  - _maxFileSize_ sets the maximum size of each output file, measured as uncompressed BSON before the conversion to Parquet. A document bigger than that gets a file of its own. _maxRowGroupSize_ sets how records are grouped inside the Parquet file in "[row groups](https://parquet.apache.org/docs/concepts/)", which affects query performance on your Parquet files much like file size does.
- Lastly, we set the S3 path to match the value of the data.

```js
exports = function () {
	const service = context.services.get('mongodb-datafederation');
	const db = service.db('NAME_OF_YOUR_VIRTUAL_DATABASE');
	const events = db.collection('NAME_OF_YOUR_VIRTUAL_COLLECTION');

	const pipeline = [
		{
			$match: {
				time: {
					$gt: new Date(Date.now() - 60 * 1000),
					$lt: new Date(Date.now()),
				},
			},
		},
		{
			$out: {
				s3: {
					bucket: 'mongodb-data-lake-demo', // your bucket
					region: 'us-east-1', // your bucket's region
					filename: 'events',
					format: {
						name: 'parquet',
						maxFileSize: '10GB',
						maxRowGroupSize: '100MB',
					},
				},
			},
		},
	];

	return events.aggregate(pipeline);
};
```

If all is good, you'll see a new Parquet file starting with `events` in your S3 bucket. `$out` overwrites a file with the same name, so it's replaced each run. I've turned on versions in the AWS console so you can see it being updated every 60 seconds.

![The AWS S3 console listing versions of the events.parquet file that the $out trigger function writes, one a minute](/images/blog/how-to-automate-continuous-data-copying-from-mongodb-to-s3/parquet-in-s3.webp)

To check the data itself, query the Parquet straight from S3 with [DuckDB](https://duckdb.org/). The `credential_chain` provider uses the AWS credentials you set up with the AWS CLI:

```sql
INSTALL httpfs;
LOAD httpfs;
CREATE SECRET (TYPE s3, PROVIDER credential_chain);
SELECT count(*) AS documents, min(time) AS first, max(time) AS last
FROM 's3://mongodb-data-lake-demo/events*.parquet';
```

Expect a count of about one: the file holds the last minute of documents, and the first trigger writes one a minute.

## Production considerations

Some of the settings above were chosen to make this easy to set up and test. If you're going to use it in production, you'll want to adjust them.

First, this post uses a "deltas" approach: it only copies the new documents from the collection into Parquet files. Another approach is a full snapshot, copying the whole collection into Parquet each time. Which one you pick should depend on how much data is in your collection and what the downstream consumer needs.

Second, however much data you're copying, you ideally want larger Parquet files, partitioned by how you're going to query them. [Apache recommends](https://parquet.apache.org/docs/file-format/configurations/) row group sizes of 512 MB to 1 GB. You can go smaller depending on your needs, but larger files are better. And if you plan to query this data as Parquet, partition it to match your query pattern. If you'll query on a date field, for instance, you might want each file to hold a single day's worth of data.

Third, `$out` skips a document it can't write and carries on by default (`errorMode: 'continue'`), so a bad document never stops the copy, but it never reaches S3 either. If you'd rather the copy fail loudly, set `errorMode: 'stop'` in the `$out` stage.

Lastly, depending on your needs, it may make sense to schedule this with something other than Triggers, like [Temporal](https://docs.temporal.io/) or [Apache Airflow](https://airflow.apache.org/docs/apache-airflow/stable/index.html).

## Wrap up

In this post, we set up automated, continuous replication from a MongoDB database into an [AWS S3](https://aws.amazon.com/s3/) bucket in the [Parquet](https://parquet.apache.org/) format, using [Atlas Data Federation](https://www.mongodb.com/docs/atlas/data-federation/overview/) and [Atlas Triggers](https://www.mongodb.com/docs/atlas/atlas-ui/triggers/). First, we set up a federated database instance to bring a MongoDB database and our S3 bucket together. Then we set up a Trigger that adds a new document to a collection every minute, and another Trigger that copies those new documents into our S3 bucket.

We also covered why Parquet is a great format for your MongoDB data when you need columnar tools like Tableau for visualizations, or machine learning frameworks that use data frames. Parquet converts quickly and easily into Pandas data frames in Python.

If you have questions, head to the [MongoDB Community Hub](https://www.mongodb.com/community/forums/), where MongoDB engineers and the community help each other build with MongoDB.

Additional resources:

- [The trigger functions, IAM policy and DuckDB check](https://github.com/JoeKarlsson/mongodb-s3-parquet-triggers), archived on Zenodo as [doi:10.5281/zenodo.24451386](https://doi.org/10.5281/zenodo.24451386)
- [Atlas Data Federation: Get Started](https://www.mongodb.com/docs/atlas/data-federation/tutorial/getting-started/)
- [The `$out` stage in Atlas Data Federation](https://www.mongodb.com/docs/atlas/data-federation/supported-unsupported/pipeline/out/)
- [The trigger functions, IAM policy and DuckDB check as files](https://github.com/JoeKarlsson/mongodb-s3-parquet-triggers), with tests of the functions' logic
- [MongoDB's current version of this tutorial](https://www.mongodb.com/docs/atlas/atlas-ui/triggers/copy-data-to-s3-tutorial/)
