---
title: 'How to Use SingleStore as a Key-Value Store'
date: 2022-06-22
slug: 'how-to-use-singlestore-as-a-key-value-store'
description: 'Key-value stores are perhaps one of the most popular databases on the market today - and with good reason! They are fast, scalable and super easy to use. But did you know you can get all the...'
categories: ['Databases']
heroImage: '/images/blog/how-to-use-singlestore-as-a-key-value-store/img_blog_post_featured_bp-jk-how-to-use-singlestore-as-a-key-value-store.webp'
heroAlt: 'How to use SingleStore as a key-value store'
tldr: 'You can skip spinning up a separate key-value database by using SingleStore as one instead. I show you how to create a rowstore table with a hash index and wire it up with Node.js for fast key-value reads and writes using plain SQL.'
---

Key-value stores are perhaps one of the most popular databases on the market today - and with good reason! They are fast, scalable and super easy to use. But did you know you can get all the advantages of a key-value store, without needing to spin up a separate database dedicated to just that singular purpose? In this post, I will show you how you can create a key-value store in SingleStore, using just SQL.

If you want to check out any of the code used in this demo, feel free to take a look at it on our [GitHub repo](https://github.com/singlestore-labs/key-value-store-demo)

## What is a key-value store?

A key-value store (also known as a key-value database) can be defined as a non-relational database and simple database that utilizes a hashtable or dictionary as its underlying data model. These can comprise anything from a number or string to more complicated objects that use a key to keep track of the object. In its simplest form, a key-value store uses a simple key-value method to store data. Take a look at the example below:

| Key | Value |
| --- | --- |
| Joe_Karlsson | @JoeKarlsson1 |
| SingleStore | @SingleStoreDB |
| SingleStore_Devs | @SingleStoreDevs |

### Use cases

There are so many databases out there, and it’s often hard to know when it’s appropriate to use a key-value store over other data storage paradigms. Due to key-value stores being incredibly fast and scalable, the following use cases are well suited for this datastore:

- Web applications to store user session details and preferences

- Real-time product recommendations and advertisement

- Data caching to increase application performance

- Data caching for the data that is not regularly updated

- Material for big data research

## Why you should use a relational database for a key-value Store

So the big question remains, why not just use a database that was designed to be a key-value store, instead of using a SQL database? Here are a couple of reasons why you should consider using SingleStore as a key-value store on your application:

- 💰Save money: SingleStore is one-third the cost of legacy databases and offers better cost predictability. Consolidating databases allows you to only pay for one database, instead of two.

- 🧑‍🎓Use existing skills: Since SingleStore is MySQL wire-compatible, you don’t need to learn a new language to query your database.

- 😌 Simplify your architecture: Eliminates the need for multiple purpose-built data engines.

- 🔥Increase your speed: Take advantage of ultra-fast data ingestion and sub-second latencies.

### How to use SingleStore as a key-value store

I know it can be weird using a SQL database as a key-value store at first, but I promise it’s pretty straightforward once we dig in. It helps that the structure of a key-value store is incredibly simple. The first thing you are going to need to do is to [create a free SingleStore database](https://www.singlestore.com/cloud-trial/). SingleStoreDB Cloud is the easiest way to try SingleStore, giving you a fully-managed database online in minutes. You can learn more about setting up SingleStore [here](https://docs.singlestore.com/managed-service/en/getting-started-with-managed-service/about-managed-service.html).

### Selecting the right kind of table

SingleStore supports several different table types depending on the type of work you need to perform with the data stored in it. SingleStore by default uses a [column store table](https://docs.singlestore.com/managed-service/en/create-a-database/physical-database-schema-design/concepts-of-physical-database-schema-design/choosing-a-table-storage-type.html) - but for a key-value store, we need to make sure we are selecting the in-memory row store. The following table enumerates the strengths and intended uses of the rowstore and columnstore:

| In-Memory Rowstore | Flash, SSD, or Disk-based Columnstore |
| --- | --- |
| Operational/transactional Workloads | Analytical Workloads |
| Fast inserts and updates over a small or large number of rows | Fast inserts over a small or large number of rows |
| Random seek performance | Fast aggregations and table scans |
| Updates/deletes are frequent | Updates/deletes are rare |
| | Compression |

The in-memory rowstore is better suited for the key-value store since it offers super-fast inserts and random read performance, which is a common use case for this kind of data storage.

### The database schema for a key-value store

The schema for a key-value store is pretty simple since we only need to store a key, and an associated value for that key. We will also use a [hash index](https://docs.singlestore.com/managed-service/en/create-a-database/physical-database-schema-design/concepts-of-physical-database-schema-design/other-schema-concepts.html#hash-table-indexes) on the primary key. Hash indexes provide fast, exact-match access to unique values, which is exactly what we want! Let’s look at how we can [initialize our key-value store table](https://github.com/singlestore-labs/key-value-store-demo/blob/main/init.sql):

```sql
DROP DATABASE IF EXISTS app;
CREATE DATABASE app;
USE app;

CREATE ROWSTORE TABLE  IF NOT EXISTS data (
    id VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    PRIMARY KEY (id) USING HASH
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
```

Now that we have created the table, let’s go ahead and start adding data, and querying it. The first thing we need to do is connect to our database.

### Connect to your cluster

I am going to be connecting to our cluster with Node.js, but feel free to use any programming language or tool you want to connect to SingleStore. The awesome thing about SingleStore is that it’s MySQL wire compatible, so you can use any MySQL driver to [connect to your cluster](https://docs.singlestore.com/managed-service/en/connect-to-your-cluster.html).

For this project, we will be using [node-mysql2](https://github.com/sidorares/node-mysql2). The MySQL2 project is a continuation of [MySQL-Native](https://github.com/sidorares/nodejs-mysql-native). We’re using it because it makes working with MySQL-compatible databases and queries easy. If you want a complete tutorial on how to connect ​​to your application​​ using Node.js, be sure to check out my post on h[ow to use SingleStore and Node.js](https://www.singlestore.com/blog/how-to-use-singlestore-and-node-js/).

To install mysql2, run the following in your terminal:

```bash
npm install --save mysql2
```

Now, let’s edit our [main file](https://github.com/singlestore-labs/key-value-store-demo/blob/main/index.js).

```javascript
//app.js
import mysql from "mysql2/promise";

// TODO: adjust these connection details to match your SingleStore deployment:
const HOST = 'PASTE YOUR SINGLESTORE ADMIN ENDPOINT HERE';
const USER = 'admin';
const PASSWORD = 'PASTE YOUR PASSWORD HERE';
const DATABASE = "app";

async function singleStoreKeyValueStore(numberOfRequests) {
   let conn;

   // Use a pool to improve performance and concurrency
   conn = await mysql.createPool({
     host: HOST,
     user: USER,
     password: PASSWORD,
     database: DATABASE,
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0,
   });

   // code will be added here.
   singleStoreInsertData({conn, numberOfRequests });
   singleStoreReadData({conn, numberOfRequests });
 } catch (err) {
   console.err(err);
 } finally {
   if (conn) {
     await conn.end();
   }
 }
}
```

### Insert data into our key-value store

The following [code snippets](https://github.com/singlestore-labs/key-value-store-demo/blob/main/index.js) allow us to run a simple performance test on your SingleStore key-value store. It shows you how to insert any number of keys into your database:

```javascript
async function create({ conn, data }) {
	try {
		const [results] = await conn.query('INSERT INTO data VALUES ( ?, ? )', [data.id, data.value]);
		return results.insertId;
	} catch (err) {}
}

async function singleStoreInsertData({ conn, numberOfRequests }) {
	try {
		const start = Date.now();
		for (let i = 0; i < numberOfRequests; i++) {
			const key = intToString(i);
			await create({
				conn,
				data: { id: key, value: `Value: ${key}` },
			});
		}
		const end = Date.now();
		console.log(`SingleStore took ${end - start}ms to insert ${numberOfRequests} rows.`);
		return end - start;
	} catch (err) {
		console.err(err);
	}
}
```

### Read data from our key-value store

Now that we’ve inserted data into our key-value store, let’s go and read the data out of our database. This snippet can also be used for testing how long it takes to read any number of random data from our key-value store. This read strategy is a common access pattern for apps that typically use a key-value store, so it’s useful for running a performance test on your data.

```javascript
function randomNumberBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function singleStoreReadData({ conn, numberOfRequests }) {
	try {
		const start = Date.now();
		for (let i = 0; i < numberOfRequests; i++) {
			const randKey = intToString(randomNumberBetween(0, numberOfRequests));
			const result = await readOne({
				conn,
				id: randKey,
			});
		}
		const end = Date.now();
		console.log(`SingleStore took ${end - start}ms to read ${numberOfRequests} rows.`);
		return end - start;
	} catch (err) {
		console.err(err);
	}
}
```

## Summary

Let’s recap what we’ve learned today. In its simplest form, a key-value store uses a simple key-value method to store data, like a hashtable or dictionary. They are often used for their simplicity, scalability, and performance. By using SingleStore as a key-value store on your application, you can save money by only using a single database, without learning new skills since SingleStore speaks SQL. You can simplify your application’s architecture and most importantly, you can use SingleStore as a key-value store with incredible performance that is in the same league as competitors - including super-fast data ingest and sub-second latencies.

Now that we’ve discussed using SingleStore as a key-value store, what’s next? If you want to play around with SingleStore in the cloud, the best way is to spin up a database cluster on SingleStore and try it out for yourself! You can sign up for free SingleStoreDB Clouds [here](https://www.singlestore.com/cloud-trial/).

Personally, I would also recommend that you check out the [SingleStore Developers site](https://developers.singlestore.com). There are a ton of great developer projects and demos for many languages, frameworks, and integrations.
