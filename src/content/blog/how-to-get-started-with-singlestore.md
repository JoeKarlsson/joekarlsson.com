---
title: 'How to Get Started with SingleStore'
date: 2021-11-04
slug: 'how-to-get-started-with-singlestore'
description: 'Are you looking for the fastest possible way to get a new SingleStore Cluster up and running while testing out sample datasets to experiment with and use?'
categories: ['Databases']
heroImage: '/images/blog/how-to-get-started-with-singlestore/img_blog_post_featured_how-to-get-started-with-singlestore.webp'
heroAlt: 'Getting started with SingleStore database tutorial'
tldr: 'A 5-minute quickstart for SingleStore: spin up a cluster, import 20 million rows of eCommerce data from S3 via a pipeline, and run analytics queries that return in seconds.'
---

Are you looking for the fastest possible way to get a new SingleStore Cluster up and running while testing out sample datasets to experiment with and use?

Well, today’s your lucky day, because in this post we are going to:

- Set up a new SingleStore cluster.
- Import over 20 million rows of sample data from an S3 Bucket.
- Run some sample queries on the imported dataset in SingleStore.

## Okay, first of all, if you’re new here, what exactly is SingleStore?

SingleStore is a distributed, scale-out, general-purpose SQL database designed to have the versatility to run both analytical and operational workloads with great performance.

SingleStore excels at running complex interactive queries over large datasets (100s of terabytes) while running high-throughput, low-latency read and write queries (single-digit milliseconds) with predictable response times (millions of rows per second).

This means, that SingleStore should be your database of choice if you are dealing with hundreds of terabytes or petabytes of data, and you need your queries to return in milliseconds instead of minutes, and your need to handle massively concurrent ingestion of data for your application.

Okay, now that we’ve discussed what SingleStore is, let’s get to the thing you’re probably here for, the Getting Started demo. Now, this is just my personal opinion, but I think the best way to get to know a new tech (like SingleStore) is to try it out. In this blog post, we will guide you through as we set up a sample application in SingleStore in under 5 mins. I would highly recommend that you try to follow along with me.

All of the code for this post can be found on [the SingleStore GitHub](https://github.com/singlestore-labs/getting-started-with-singlestore).

If you want to follow along with a video version of this blog post, you can check that out below.

[Watch the Getting Started with SingleStore video on YouTube](https://www.youtube.com/watch?v=bIFrJJkUftA)

## How to Setup a SingleStore Cluster

Sign up to [create a free SingleStore database](https://www.singlestore.com/managed-service-trial/). The SingleStore Managed Service is the easy way to try SingleStore. You can get a fully-managed database online in minutes.

Next, after you’ve signed in to the SingleStore Portal, you’ll need to start a new cluster. First, click “Create Managed Cluster” from the SingleStore Portal.

Next, you will be taken to the “Create a Database Cluster” page. You can leave all the default settings and click “next.”

On the “Secure this Database Cluster” page, you will need to set the password and IP Allow list for your application.

I would also recommend that you leave the IP Allow list to only allow access from your local IP address. It might be tempting to allow access from anywhere, but it’s bad practice since you are allowing anyone online access to your data.

Once you have set your password and configured your cluster’s IP access restrictions you can click “Create Cluster.”

It’ll take a couple of minutes for your cluster to be set up and deployed. So feel free to browse Twitter (or whatever) till it’s ready to go.

## How to Import Data From an AWS S3 Bucket

Okay, imagine with me if you will, that you are a developer working for a cosmetics company and you have been asked to build an application that analyzes historical data user-generated events from our eCommerce store so we can make valuable insights about our customers and their needs. What do you do? Well, the first thing you should do is take a look at the data we are importing into our SingleStore database. That way, we will know what kinds of columns we need to initialize in our database.

You can download one of the spreadsheets we are importing from our S3 bucket here:

[Download the December 2019 eCommerce CSV dataset](http://studiotutorials.s3.amazonaws.com/eCommerce/2019-Dec.csv)

**Note**: If you run into any issues or get stuck, make sure to connect with the [SingleStore community](https://www.singlestore.com/forum/) and get all of your questions answered, or check out more cool developer content on our [SingleStore Developer](https://developers.singlestore.com/) page. The community forums are the best place to get your SingleStore questions answered

## How To Create a New SingleStore Database and Table

From this spreadsheet, we have enough information to initialize our database and table in SingleStore. From the SQL Editor page, paste this code in, and click the “Run” button.

```sql
-- create a database
create database cosmeticshop;

-- create a table
use cosmeticshop;
create table cosmeticshopfunnel
(
    event_time TIMESTAMP,
    event_type CHAR(18),
    product_id CHAR(10),
    category_id CHAR(20),
    category_code TINYTEXT,
    brand TINYTEXT,
    price FLOAT,
    user_id TINYTEXT,
    user_session TINYTEXT
);
```

## How to Setup a New Data Pipeline from AWS S3 Into SingleStore

Now that we have a home for our data set up in SingleStore we will need to set up a [Data Pipeline](https://docs.singlestore.com/managed-service/en/load-data/about-loading-data-with-pipelines/pipeline-concepts/overview-of-pipelines.html). SingleStore Pipelines are a feature that natively ingests real-time data from external sources. As a built-in component of the database, Pipelines can extract, shape (modify), and load external data without the need for third-party tools or middleware.

In order to create the pipeline to the CSV data stored in the AWS S3 Bucket, and you will need to copy and run this command in the SingleStore Portal SQL Editor.

```sql
-- create a pipeline to ingest the data in AWS S3
CREATE or REPLACE PIPELINE cosmeticshoppipe
AS LOAD DATA S3 's3://studiotutorials/eCommerce/*'
CONFIG '{"region": "us-east-1"}'
INTO TABLE `cosmeticshopfunnel`
FIELDS TERMINATED BY ',' ENCLOSED BY '"';

-- start the pipeline
START PIPELINE cosmeticshoppipe;
```

Running this command will import all 20 million rows of data into your SingleStore Cluster. It might take a couple of seconds for all the data to be imported into our SingleStore database. You can check that it’s been imported by running this SQL command. You should see the number of imported events and you should be able to explore the first 100 rows of imported data in your database.

```sql
-- see how many events have been ingested
select count(*) from cosmeticshopfunnel;

-- see the data that has been ingested
select * from cosmeticshopfunnel limit 100;
```

## How to Query SingleStore Data

Perfect! All that data has been loaded into SingleStore, let’s actually run some queries and start making meaningful insights about all this data we’ve collected! We gotta show our value to the team somehow!

First, let’s find out what brands have been purchased the most from our Cosmetics shop. Try running this in the SQL Editor:

```sql
-- find out which brands have been purchased the most
select brand, count(brand) as c from cosmeticshopfunnel
where event_type = "purchase"
group by brand
order by c desc;
```

What about the flip side? What are the product categories that have been removed from users’ carts the most?

```sql
-- find out which product_id has been the most removed from cart
select product_id, count(product_id) as c from cosmeticshopfunnel
where event_type = "remove_from_cart" group by product_id order by c desc;
```

There are so many more things to explore, let’s try running one of these in your SQL Editor!

```sql
-- create a holiday reference table to store all holiday dates
-- create a holiday reference table to store all holiday dates
CREATE REFERENCE TABLE holidays
(
    holiday TINYTEXT,
    date_of_holiday DATE PRIMARY KEY
    );

-- insert holiday dates
INSERT INTO holidays VALUES
("New Year's Day", "2020-1-1"),
("Martin Luther King Jr. Day", "2020-02-20"),
("Memorial Day", "2020-05-25"),
("Independence Day", "2020-07-04"),
("Labor Day", "2020-09-07"),
("Veterans Day", "2019-11-11"),
("Thanksgiving", "2019-11-28"),
("Christmas Day", "2019-12-25");

select * from holidays;

-- find out which holiday has the most activity
select holiday, count(holiday) from cosmeticshopfunnel
    join (select holiday, DATE_SUB(date_of_holiday, INTERVAL 3 DAY) as beforedate, DATE_ADD(date_of_holiday, INTERVAL 3 DAY) as afterdate from holidays)
    on event_time > beforedate and event_time < afterdate
    group by holiday
    order by count(holiday) desc;

-- find out which is the top brand purchased during each of the holidays
select holiday, brand, count(brand) from cosmeticshopfunnel
    join (select holiday, DATE_SUB(date_of_holiday, INTERVAL 3 DAY) as beforedate, DATE_ADD(date_of_holiday, INTERVAL 3 DAY) as afterdate from holidays)
    on event_time > beforedate and event_time < afterdate
    where event_type = "purchase" and brand != ""
    group by holiday
    order by count(holiday) desc;

-- find out if customers are sensitive to the average price of the brands
select brand, avg(price), count(event_type) from cosmeticshopfunnel
where brand != ""
group by brand
order by count(event_type) desc;

-- find out which categories have been purchased the most
select distinct category_code, count(category_code) as c from cosmeticshopfunnel
where event_type = "purchase" group by category_code order by c desc;

-- find out which brands have been purchased the most
select brand, count(brand) as c from cosmeticshopfunnel
where event_type = "purchase" group by brand order by c desc;

-- find out which product_id has been the most removed from cart
select product_id, count(product_id) as c from cosmeticshopfunnel
where event_type = "remove_from_cart" group by product_id order by c desc;
```

When you are all done with exploring this demo dataset, and now you can run this command to clean up all your databases and pipelines:

```sql
DELETE FROM cosmeticshopfunnel;
ALTER PIPELINE cosmeticshoppipe SET OFFSETS EARLIEST;
START PIPELINE cosmeticshoppipe;
STOP PIPELINE cosmeticshoppipe;
DROP PIPELINE cosmeticshoppipe;
DROP TABLE holidays;
DROP TABLE cosmeticshopfunnel;
```

## Summary

And that’s all! You’ve successfully set up a brand new SingleStore cluster, imported over 20 million rows of sample eCommerce data from an AWS S3 Bucket, and then run some queries on the imported dataset. I want you to take note of how quickly SingleStore was able to upload and process this massive dataset. I bet it only took you a matter of seconds to run these queries, right?

So, now that you’ve set up a project in SingleStore, now what’s next? Personally, I would recommend that you check out the [SingleStore Developers site](https://developers.singlestore.com). There are tons of great developer projects and demos for many languages, frameworks, and integrations.

The [SingleStore Training](https://www.singlestore.com/training/) page includes more self-paced courses like Schema Design, Data Ingestion, Optimizing Queries, and more.

If you want to check out the complete code used in this post you can do so here:

[Getting Started with SingleStore on GitHub](https://github.com/singlestore-labs/getting-started-with-singlestore).

## Resources:

- [Getting Started with SingleStore (GitHub)](https://github.com/singlestore-labs/getting-started-with-singlestore)
- [SingleStore Developer Website](https://developers.singlestore.com)
- [SingleStore Training](https://www.singlestore.com/training)
- [SingleStore on X](https://x.com/SingleStoreDevs)
- [SingleStore GitHub](https://github.com/singlestore-labs)
- [SingleStore Community Forums](https://www.singlestore.com/forum)
