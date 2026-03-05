---
title: 'How To Use The MongoDB Visual Studio Code Plugin'
date: 2020-11-03
slug: 'how-to-use-the-mongodb-visual-studio-code-plugin'
description: 'To make developers more productive when working with MongoDB, we built MongoDB for Visual Studio Code, an extension that allows you to quickly connect to MongoDB and MongoDB Atlas and work with your...'
categories: ['Databases', 'Dev Tools']
heroImage: '/images/blog/how-to-use-the-mongodb-visual-studio-code-plugin/og-vs-code-plugin.webp'
---

To make developers more productive when working with MongoDB, we built [MongoDB for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=mongodb.mongodb-vscode), an extension that allows you to quickly connect to MongoDB and [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and work with your data to build applications right inside your code editor. With the MongoDB Visual Studio Code Plugin, you can:

- Connect to a MongoDB or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster, navigate through your databases and collections, get a quick overview of your schema, and see the documents in your collections;

- Create MongoDB Playgrounds, the fastest way to prototype CRUD operations and MongoDB commands;

- Quickly access the MongoDB Shell, to launch the MongoDB Shell from the command palette and quickly connect to the active cluster.

## Getting Started with MongoDB Atlas

### Create an Atlas Account

First things first, we will need to set up a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account. And don’t worry, you can create an M0 MongoDB Atlas cluster for free. No credit card is required to get started! To get up and running with a free M0 cluster, follow the MongoDB Atlas Getting Started guide, or follow the steps below. First, you will need to start at the MongoDB Atlas registration page and fill in your account information.

[You can find more information about how to create a MongoDB Atlas account in our documentation](https://docs.atlas.mongodb.com/tutorial/create-atlas-account/).

### Deploy a Free Tier Cluster

Once you log in, Atlas prompts you to build your first cluster. You need to click “Build a Cluster.” You will then select the Starter Cluster. Starter clusters include the M0, M2, and M5 cluster tiers. These low-cost clusters are suitable for users who are learning MongoDB or developing small proof-of-concept applications.

![MongoDB Atlas cluster tier selection showing free, shared, and dedicated options](/images/blog/how-to-use-the-mongodb-visual-studio-code-plugin/14_atlas_tiers_4f3f126eb9-1024x727.webp)

Atlas supports M0 Free Tier clusters on [Amazon Web Services (AWS)](https://docs.atlas.mongodb.com/reference/amazon-aws/#amazon-aws), [Google Cloud Platform (GCP)](https://docs.atlas.mongodb.com/reference/google-gcp/#google-gcp), and [Microsoft Azure](https://docs.atlas.mongodb.com/reference/microsoft-azure/#microsoft-azure). Atlas displays only the regions that support M0 Free Tier and M2/M5 Shared tier clusters.

![MongoDB Atlas cloud provider and region selection for free tier cluster](/images/blog/how-to-use-the-mongodb-visual-studio-code-plugin/18_mongodb_free_teir_a05d7b15e8-1024x616.webp)

Once you deploy your cluster, it can take up to 10 minutes for your cluster to provision and become ready to use.

### Add Your Connection IP Address to Your IP Access List

[You must add your IP address to the IP access list](https://docs.atlas.mongodb.com/security/add-ip-address-to-list/) before you can connect to your cluster. To add your IP address to the IP access list. This is important, as it ensures that only you can access the cluster in the cloud from your IP address. You also have the option of allowing access from anywhere, though this means that anyone can have network access to your cluster. This is a potential security risk if your password and other credentials leak. From your Clusters view, click the Connect button for your cluster.

### Configure your IP access list entry

Click Add Your Current IP Address.

### Create a Database User for Your Cluster

For security purposes, you must [create a database user to access your cluster](https://docs.atlas.mongodb.com/tutorial/create-mongodb-user-for-cluster/). Enter the new username and password. You’ll then have the option of selecting user privileges, including admin, read/write access, or read-only access. From your Clusters view, click the Connect button for your cluster.

![Screenshot highlighting cluster connect button.](/images/blog/how-to-use-the-mongodb-visual-studio-code-plugin/11_mongodb_atlas_connect_button_cdaa462ac7-1024x582.webp)

In the **Create a MongoDB User** step of the dialog, enter a Username and a Password for your database user. You’ll use this username and password combination to access data on your cluster.

> For information on configuring additional database users on your cluster, see [Configure Database Users](https://docs.atlas.mongodb.com/security-add-mongodb-users/).

## Install MongoDB for Visual Studio Code

Next, we are going to connect to our new MongoDB Atlas database cluster using the [Visual Studio Code MongoDB Plugin](https://marketplace.visualstudio.com/items?itemName=mongodb.mongodb-vscode). To install MongoDB for Visual Studio Code, simply search for it in the Extensions list directly inside Visual Studio Code or head to the [“MongoDB for Visual Studio Code” homepage](https://marketplace.visualstudio.com/items?itemName=mongodb.mongodb-vscode) in the Visual Studio Code Marketplace.

## Connect Your MongoDB Data

MongoDB for Visual Studio Code can connect to MongoDB standalone instances or clusters on MongoDB Atlas or self-hosted. Once connected, you can **browse databases**, **collections**, and **read-only views** directly from the tree view.

For each collection, you will see a list of sample documents and a quick overview of the schema. This is very useful as a reference while writing queries and aggregations.

![Connect to MongoDB](/images/blog/how-to-use-the-mongodb-visual-studio-code-plugin/2_vscode_connect_to_mongodb_7f84fa244b.webp)_Connect to MongoDB_

Once installed there will be a new MongoDB tab that we can use to add our connections by clicking “Add Connection”. If you’ve used [MongoDB Compass](https://www.mongodb.com/products/compass) before, then the form should be familiar. You can enter your connection details in the form, or use a connection string. I went with the latter as my database is hosted on MongoDB Atlas.

To obtain your connection string, navigate to your “Clusters” page and select “Connect”.

Choose the “Connect using MongoDB Compass” option and copy the connection string. Make sure to add your username and password in their respective places before entering the string in Visual Studio Code.

Then paste this string into Visual Studio Code.

![VS Code input field prompting for MongoDB connection string](/images/blog/how-to-use-the-mongodb-visual-studio-code-plugin/15_vscode_enter_connection_string_b785102dae.webp)

Once you’ve connected successfully, you should see an alert. At this point, you can explore the data in your cluster, as well as your schemas.

![Connect successful 20d877da49](/images/blog/how-to-use-the-mongodb-visual-studio-code-plugin/13_connect_successful_20d877da49.webp)

## Navigate Your Data

Once you connect to your deployment using MongoDB for Visual Studio Code, use the left navigation to:

- Explore your databases, collections, read-only views, and documents.

- Create new databases and collections.

- Drop databases and collections.

![VS Code MongoDB sidebar showing connected cluster with databases listed](/images/blog/how-to-use-the-mongodb-visual-studio-code-plugin/6_vscode_connections_72837b6be9.webp)

## Databases and Collections

When you expand an active connection, MongoDB for Visual Studio Code shows the databases in that deployment. Click a database to view the collections it contains.

### View Collection Documents and Schema

When you expand a collection, MongoDB for Visual Studio Code displays that collection’s document count next to the Documents label in the navigation panel.

When you expand a collection’s documents, MongoDB for Visual Studio Code lists the `_id` of each document in the collection. Click an `_id` value to open that document in Visual Studio Code and view its contents.

![VS Code MongoDB sidebar showing document IDs in a collection](/images/blog/how-to-use-the-mongodb-visual-studio-code-plugin/21_mongodb_vscode_list_documents_93b4799ade.webp)

Alternatively, right-click a collection and click View Documents to view all the collection’s documents in an array.

![VS Code showing MongoDB linked list documents as JSON with context menu](/images/blog/how-to-use-the-mongodb-visual-studio-code-plugin/12_vscode_view_documents_869c85ac8e-1024x717.webp)

Opening collection documents provides a **read-only** view of your data. To modify your data using MongoDB for Visual Studio Code, use a [JavaScript Playground](https://docs.mongodb.com/mongodb-vscode/crud-ops#vsce-crud) or launch a shell by right-clicking your active deployment in the MongoDB view in the Activity Bar.

#### Schema

Your collection’s schema defines the fields and data types within the collection. Due to MongoDB’s flexible schema model, different documents in a collection may contain different fields, and data types may vary within a field. MongoDB can enforce [schema validation](https://docs.mongodb.com/manual/core/schema-validation/) to ensure your collection documents have the same shape.

When you expand a collection’s schema, MongoDB for Visual Studio Code lists the fields which appear in that collection’s documents. If a field exists in all documents and its type is consistent throughout the collection, MongoDB for Visual Studio Code displays an icon indicating that field’s data type.

![VS Code MongoDB sidebar displaying collection schema fields](/images/blog/how-to-use-the-mongodb-visual-studio-code-plugin/20_mongodb_vscode_list_schema_a9e524af5c.webp)

### Create a New Database

When you create a new database, then you must populate it with an initial collection. To create a new database:

- Hover over the connection for the deployment where you want your database to exist.

- Click the Plus icon that appears.

- In the prompt, enter a name for your new database.

- Press the enter key.

- Enter a name for the first collection in your new database.

- Press the enter key.

![VS Code View menu highlighting Command Palette option](/images/blog/how-to-use-the-mongodb-visual-studio-code-plugin/1_vscode_command_pallete_ee5840feb9-1024x281.webp)

### Create a New Collection

To create a new collection:

- Hover over the database where you want your collection to exist.

- Click the Plus icon that appears.

- In the prompt, enter a name for your new collection.

- Press the enter key to confirm your new collection.

![VS Code prompt to enter new MongoDB collection name](/images/blog/how-to-use-the-mongodb-visual-studio-code-plugin/17_vscode_add_monogdb_collection_e7a65bf4de-1024x258.webp)

## Explore Your Data with Playgrounds

MongoDB Playgrounds are the most convenient way to prototype and execute CRUD operations and other MongoDB commands directly inside Visual Studio Code. Use JavaScript environments to interact with your data. Prototype queries, run aggregations, and more.

- Prototype your queries, aggregations, and MongoDB commands with MongoDB syntax highlighting and intelligent autocomplete for MongoDB shell API, MongoDB operators, and for database, collection, and field names.

- Run your playgrounds and see the results instantly. Click the play button in the tab bar to see the output.

- Save your playgrounds in your workspace and use them to document how your application interacts with MongoDB

- Build aggregations quickly with helpful and well-commented stage snippets

### Open the Visual Studio Code Command Palette.

To open a playground and begin interacting with your data, open Visual Studio Code and press one of the following key combinations:

- Control + Shift + P on Windows or Linux.

- Command + Shift + P on macOS.

The Command Palette provides quick access to commands and keyboard shortcuts.

![VS Code prompt to enter new MongoDB database name](/images/blog/how-to-use-the-mongodb-visual-studio-code-plugin/23_vscode_command_palette_9c085765fe-1024x400.webp)

### Find and run the “Create MongoDB Playground” command.

Use the Command Palette search bar to search for commands. All commands related to MongoDB for Visual Studio Code are prefaced with MongoDB:.

When you run the MongoDB: Create MongoDB Playground command, MongoDB for Visual Studio Code opens a playground pre-configured with a few commands.

## Run a Playground

To run a playground, click the Play Button in Visual Studio Code’s top navigation bar.

You can use a MongoDB Playground to perform CRUD (create, read, update, and delete) operations on documents in a collection on a [connected deployment](https://docs.mongodb.com/mongodb-vscode/connect). Use the [MongoDB CRUD Operators](https://docs.mongodb.com/manual/crud) and [shell methods](https://docs.mongodb.com/manual/reference/method) to interact with your databases in MongoDB Playgrounds.

### Perform CRUD Operations

Let’s run through the default MongoDB Playground template that’s created when you initialize a new Playground. In the default template, it executes the following:

- `use('mongodbVSCodePlaygroundDB')` switches to the `mongodbVSCodePlaygroundDB` database.

- [db.sales.drop()](https://docs.mongodb.com/manual/reference/method/db.collection.drop/) drops the sales collection. So the playground will start from a clean slate.

- Inserts eight documents into the mongodbVSCodePlaygroundDB.sales collection.

- Since the collection was dropped, the insert operations will create the collection and insert the data.

- For a detailed description of this method’s parameters, see [insertOne()](https://docs.mongodb.com/manual/reference/method/db.collection.insertOne) in the MongoDB Manual.

- Runs a query to read all documents sold on April 4th, 2014.

- For a detailed description of this method’s parameters, see [find()](https://docs.mongodb.com/manual/reference/method/db.collection.find) in the MongoDB Manual.

```javascript
// MongoDB Playground
// To disable this template go to Settings \| MongoDB \| Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// Select the database to use.
use('mongodbVSCodePlaygroundDB');

// The drop() command destroys all data from a collection.
// Make sure you run it against proper database and collection.
db.sales.drop();

// Insert a few documents into the sales collection.
db.sales.insertMany([
	{ _id: 1, item: 'abc', price: 10, quantity: 2, date: new Date('2014-03-01T08:00:00Z') },
	{ _id: 2, item: 'jkl', price: 20, quantity: 1, date: new Date('2014-03-01T09:00:00Z') },
	{ _id: 3, item: 'xyz', price: 5, quantity: 10, date: new Date('2014-03-15T09:00:00Z') },
	{ _id: 4, item: 'xyz', price: 5, quantity: 20, date: new Date('2014-04-04T11:21:39.736Z') },
	{ _id: 5, item: 'abc', price: 10, quantity: 10, date: new Date('2014-04-04T21:23:13.331Z') },
	{ _id: 6, item: 'def', price: 7.5, quantity: 5, date: new Date('2015-06-04T05:08:13Z') },
	{ _id: 7, item: 'def', price: 7.5, quantity: 10, date: new Date('2015-09-10T08:43:00Z') },
	{ _id: 8, item: 'abc', price: 10, quantity: 5, date: new Date('2016-02-06T20:20:13Z') },
]);

// Run a find command to view items sold on April 4th, 2014.
db.sales.find({
	date: {
		$gte: new Date('2014-04-04'),
		$lt: new Date('2014-04-05'),
	},
});
```

When you press the Play Button, this operation outputs the following document to the Output view in Visual Studio Code:

```json
{
	"acknowleged": 1,
	"insertedIds": {
		"0": 2,
		"1": 3,
		"2": 4,
		"3": 5,
		"4": 6,
		"5": 7,
		"6": 8,
		"7": 9
	}
}
```

You can learn more about the basics of MQL and CRUD operations in the post, Getting Started with Atlas and the MongoDB Query Language (MQL). And if you need test data to play around with in your playground, check out my post on [how to seed a MongoDB database with fake data](/blog/how-to-seed-a-mongodb-database-with-fake-data/).

### Run Aggregation Pipelines

Let’s run through the last statement of the default MongoDB Playground template. You can run [aggregation pipelines](https://docs.mongodb.com/manual/aggregation) on your collections in MongoDB for Visual Studio Code. Aggregation pipelines consist of [stages](https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/) that process your data and return computed results.

Common uses for aggregation include:

- Grouping data by a given expression.

- Calculating results based on multiple fields and storing those results in a new field.

- Filtering data to return a subset that matches a given criteria.

- Sorting data.

When you run an aggregation, MongoDB for Visual Studio Code conveniently outputs the results directly within Visual Studio Code.

This pipeline performs an aggregation in two stages:

- The [$match](https://docs.mongodb.com/manual/reference/operator/aggregation/match/#pipe._S_match) stage filters the data such that only sales from the year 2014 are passed to the next stage.

- The [$group](https://docs.mongodb.com/manual/reference/operator/aggregation/group/#pipe._S_group) stage groups the data by item. The stage adds a new field to the output called totalSaleAmount, which is the culmination of the item’s price and quantity.

```javascript
// Run an aggregation to view total sales for each product in 2014.
const aggregation = [
	{
		$match: {
			date: {
				$gte: new Date('2014-01-01'),
				$lt: new Date('2015-01-01'),
			},
		},
	},
	{
		$group: {
			_id: '$item',
			totalSaleAmount: {
				$sum: { $multiply: ['$price', '$quantity'] },
			},
		},
	},
];

db.sales.aggregate(aggregation);
```

When you press the Play Button, this operation outputs the following documents to the Output view in Visual Studio Code:

```json
[
	{
		"_id": "abc",
		"totalSaleAmount": 120
	},
	{
		"_id": "jkl",
		"totalSaleAmount": 20
	},
	{
		"_id": "xyz",
		"totalSaleAmount": 150
	}
]
```

See [Run Aggregation Pipelines](https://docs.mongodb.com/mongodb-vscode/run-agg-pipelines#vsce-aggregation) for more information on running the aggregation pipeline from the MongoDB Playground.

## Terraform snippet for MongoDB Atlas

If you use Terraform to manage your infrastructure, MongoDB for Visual Studio Code helps you get started with the [MongoDB Atlas Provider](https://www.terraform.io/docs/providers/mongodbatlas/index.html). We aren’t going to cover this feature today, but if you want to learn more, be sure to check out [Create an Atlas Cluster from a Template using Terraform](https://docs.mongodb.com/mongodb-vscode/create-cluster-terraform), from the MongoDB manual.

## Summary

There you have it! MongoDB for Visual Studio Code Extension allows you to connect to your MongoDB instance and enables you to interact in a way that fits into your native workflow and development tools. You can navigate and browse your MongoDB databases and collections, and prototype queries and aggregations for use in your applications.

If you are a Visual Studio Code user, getting started with MongoDB for Visual Studio Code is easy:

- Install the [extension from the marketplace](https://marketplace.visualstudio.com/items?itemName=mongodb.mongodb-vscode);

- Get a [free Atlas cluster](https://www.mongodb.com/download-center) if you don’t have a MongoDB server already;

- Connect to it and start building a playground.

You can find more information about MongoDB for Visual Studio Code and all its features in [the documentation](http://dochub.mongodb.org/core/vsce-landing).

> If you have any questions on MongoDB for Visual Studio Code, you can join in the discussion at the [MongoDB Community Forums](https://developer.mongodb.com/community/forums/), and you can share feature requests using the MongoDB Feedback Engine.

> When you’re ready to try out the MongoDB Visual Studio Code plugin for yourself, check out [MongoDB Atlas](http://bit.ly/MDB_Atlas), MongoDB’s fully managed database-as-a-service. Atlas is the easiest way to get started with MongoDB and has a generous, forever-free tier.

## Related Links

Check out the following resources for more information:

- [Ready to install MongoDB for Visual Studio Code?](https://marketplace.visualstudio.com/items?itemName=mongodb.mongodb-vscode)

- [MongoDB for Visual Studio Code Documentation](https://docs.mongodb.com/mongodb-vscode/)

- Getting Started with Atlas and the MongoDB Query Language (MQL)

- [Want to learn more about MongoDB? Be sure to take a class on the MongoDB University](https://university.mongodb.com/)

- [Have a question, feedback on this post, or stuck on something be sure to check out and/or open a new post on the MongoDB Community Forums](https://developer.mongodb.com/community/forums/)

- Want to check out more cool articles about MongoDB? Be sure to check out more posts like this on the MongoDB Developer Hub

- [How to Pass A Coding Interview](/blog/how-to-pass-coding-interview/)

- [So, You Want To Learn How To Code? Here’s What You Need To Know.](/blog/my-top-resources-for-learning-how-to-code/)
