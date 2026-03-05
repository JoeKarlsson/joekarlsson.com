---
title: 'How to Seed a MongoDB Database with Fake Data'
date: 2021-06-30
slug: 'how-to-seed-a-mongodb-database-with-fake-data'
description: 'Have you ever worked on a MongoDB project and needed to seed your database with fake data in order to provide initial values for lookups, demo purposes, proof of concepts, etc.? I’m biased, but I’ve...'
categories: ['Databases']
heroImage: '/images/blog/how-to-seed-a-mongodb-database-with-fake-data/twitter-mongoimport.webp'
heroAlt: 'How to seed a MongoDB database with fake data using mongoimport'
tldr: 'A quick Node.js script using faker.js to generate thousands of fake documents and insert them into a MongoDB Atlas database. Copy it, tweak the document shape, and you have seed data in seconds.'
---

Have you ever worked on a MongoDB project and needed to seed your database with fake data in order to provide initial values for lookups, demo purposes, proof of concepts, etc.? I’m biased, but I’ve had to seed a MongoDB database countless times.

First of all, what is database seeding? Database seeding is the initial seeding of a database with data. Seeding a database is a process in which an initial set of data is provided to a database when it is being installed.

In this post, you will learn how to get a working seed script setup for MongoDB databases using [Node.js](https://nodejs.org/en/) and [faker.js](https://github.com/faker-js/faker).

## How to Seed MongoDB

This example code uses a single collection of fake IoT data (that I used to model for my IoT Kitty Litter Box project). However, you can change the shape of your template document to fit the needs of your application. I am using [faker.js](https://github.com/faker-js/faker) to create the fake data. Please refer to the [documentation](https://zetcode.com/javascript/fakerjs/) if you want to make any changes. You can also adapt this script to seed data into multiple collections or databases, if needed.

I am saving my data into a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database. It’s the easiest way to get a MongoDB database up and running. You’ll need to get your [MongoDB connection URI](https://docs.atlas.mongodb.com/driver-connection/) before you can run this script. For information on how to connect your application to MongoDB, check out the [docs](https://docs.atlas.mongodb.com/driver-connection/).

Alright, now that we have got the setup out of the way, let’s jump into the code!

```javascript
/* mySeedScript.js */

// require the necessary libraries
const faker = require('faker');
const MongoClient = require('mongodb').MongoClient;

function randomIntFromInterval(min, max) {
	// min and max included
	return Math.floor(Math.random() * (max - min + 1) + min);
}

async function seedDB() {
	// Connection URL
	const uri = 'YOUR MONGODB ATLAS URI';

	const client = new MongoClient(uri, {
		useNewUrlParser: true,
		// useUnifiedTopology: true,
	});

	try {
		await client.connect();
		console.log('Connected correctly to server');

		const collection = client.db('iot').collection('kitty-litter-time-series');

		// The drop() command destroys all data from a collection.
		// Make sure you run it against proper database and collection.
		collection.drop();

		// make a bunch of time series data
		let timeSeriesData = [];

		for (let i = 0; i < 5000; i++) {
			const firstName = faker.name.firstName();
			const lastName = faker.name.lastName();
			let newDay = {
				timestamp_day: faker.date.past(),
				cat: faker.random.word(),
				owner: {
					email: faker.internet.email(firstName, lastName),
					firstName,
					lastName,
				},
				events: [],
			};

			for (let j = 0; j < randomIntFromInterval(1, 6); j++) {
				let newEvent = {
					timestamp_event: faker.date.past(),
					weight: randomIntFromInterval(14, 16),
				};
				newDay.events.push(newEvent);
			}
			timeSeriesData.push(newDay);
		}
		collection.insertMany(timeSeriesData);

		console.log('Database seeded! :)');
		client.close();
	} catch (err) {
		console.log(err.stack);
	}
}

seedDB();
```

After running the script above, be sure to check out your database to ensure that your data has been properly seeded. This is what my database looks like after running the script above.

![Screenshot showing the seeded data in a MongoDB Atlas cluster.](/images/blog/how-to-seed-a-mongodb-database-with-fake-data/seed-database-1024x705.webp)_Screenshot showing the seeded data in a MongoDB Atlas cluster._

Once your fake seed data is in the MongoDB database, you’re done! Congratulations! If you want a nice way to browse and verify your seeded data, I’d recommend the [MongoDB Visual Studio Code plugin](/blog/how-to-use-the-mongodb-visual-studio-code-plugin/) for exploring your collections right from your editor.

## More Technical Posts

- [How to use MongoDB Client-Side Field Level Encryption (CSFLE) with Node.js](/blog/how-to-use-mongodb-client-side-field-level-encryption-csfle-with-node-js/)
- [MongoDB Aggregation Pipeline Queries vs SQL Queries](/blog/mongodb-aggregation-pipeline-queries-vs-sql-queries/)
- [An Introduction to IoT (Internet of Toilets)](/blog/an-introduction-to-iot-internet-of-toilets/)
- [How To Use The MongoDB Visual Studio Code Plugin](/blog/how-to-use-the-mongodb-visual-studio-code-plugin/)
- [Linked Lists and MongoDB: A Gentle Introduction](/blog/linked-lists-and-mongodb-a-gentle-introduction/)
