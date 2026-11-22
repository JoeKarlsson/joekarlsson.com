---
title: 'MongoDB Schema Design Best Practices'
date: 2020-04-02
slug: 'mongodb-schema-design-best-practices'
description: 'My talk and article on MongoDB schema design: embedding vs. referencing, how to model each kind of relationship, and my five rules of thumb.'
categories: ['Web Dev']
writtenFor: 'MongoDB'
heroImage: '/images/blog/mongodb-schema-design-best-practices/thumb-b1a8ce46.webp'
heroAlt: 'An old architectural blueprint'
contentNotice: 'I wrote this article for the MongoDB Developer Center in December 2020, after giving the talk. MongoDB has since taken that copy down, so the whole article lives here now, with its links pointed at the current MongoDB docs.'
tldr: 'MongoDB has no rules, no process and no algorithm for splitting up your data: you design around how your app uses it. Favor embedding unless there is a compelling reason not to, and never let an array grow without bound.'
updatedDate: 2026-11-22
corrections:
  - date: 2026-11-22
    note: 'The recap said to prefer embedding for one-to-many relationships. The one-to-many section above it uses an array of references, and so does the recap now.'
  - date: 2026-11-22
    note: 'The shell examples used `ObjectID` and short placeholder ids, which current mongosh rejects. They use `ObjectId` with valid ids now and run as written on MongoDB 8, and two queries show the one-to-many and log lookups. The atomicity and transactions lines now match the MongoDB docs: writes to one document are atomic, and multi-document transactions came to replica sets in 4.0 and sharded clusters in 4.2.'
videos:
  - id: 'leNCfU5SYR8'
  - id: 'tYNaXn2wJJo'
    chapters:
      - { at: '0:14', name: 'Why schema design matters' }
      - { at: '1:33', name: "What we're talking about today" }
      - { at: '2:11', name: 'Relational vs. MongoDB schema design' }
      - { at: '4:46', name: "MongoDB schema design: there's no rules" }
      - { at: '8:59', name: 'Embedding vs. referencing' }
      - { at: '14:53', name: 'Types of relationships: one-to-one' }
      - { at: '16:02', name: 'One-to-few' }
      - { at: '17:58', name: 'One-to-many' }
      - { at: '20:58', name: 'One-to-squillions' }
      - { at: '24:06', name: 'Many-to-many' }
      - { at: '26:23', name: 'Recap' }
      - { at: '33:11', name: "Questions and what's next" }
mastheadImage: '/images/blog/mongodb-schema-design-best-practices/masthead-205ab989.webp'
---

"How do I model a schema for my application?" It's one of the most common questions devs have about MongoDB. And the answer is, _it depends_. Document databases have a rich vocabulary that can express data relationships in more nuanced ways than SQL. There are many things to consider when picking a schema. Is your app read-heavy or write-heavy? What data is frequently accessed together? What are your performance considerations? How will your data set grow and scale?

In this post, I'll cover the basics of data modeling using real-world examples. You'll learn common methodologies and vocabulary you can use when designing the database schema for your application.

[Watch the talk version on YouTube](https://www.youtube.com/watch?v=leNCfU5SYR8)

Okay, first off, did you know that proper MongoDB schema design is one of the most critical parts of deploying a scalable, fast and affordable database? It's true, and schema design is often one of the most overlooked facets of MongoDB administration. Why is MongoDB schema design so important? Well, there are a couple of good reasons. In my experience, most people coming to MongoDB tend to think of MongoDB schema design as the same as legacy relational schema design, which doesn't let you take full advantage of all that MongoDB has to offer. First, let's look at how legacy relational database design compares to MongoDB schema design.

## Schema design approaches: relational vs. MongoDB

This is what most developers picture when they compare a relational schema with a MongoDB schema.

![The Office meme where Pam is asked to find the differences between a page reading "Relational schema design" and one reading "MongoDB schema design" and says, "They're the same picture."](/images/blog/mongodb-schema-design-best-practices/same-picture.webp)

I have to admit that I understand the impulse to design your MongoDB schema the same way you have always designed your SQL schema. It's completely normal to want to split up your data into neat little tables as you've always done before. I was guilty of doing this when I first started learning MongoDB. However, as we'll soon see, you lose out on many of the awesome features of MongoDB when you design your schema like an SQL schema.

And this is how that makes me feel.

![Michael Scott from The Office yelling "Noooooooooooo!"](/images/blog/mongodb-schema-design-best-practices/nooooo.gif)

However, I think it's best to compare MongoDB schema design to relational schema design, since that's where many devs coming to MongoDB are coming from. So, let's see how these two design patterns differ.

### Relational schema design

When designing a relational schema, devs typically model their schema independent of queries. They ask themselves, "What data do I have?" Then, using prescribed approaches, they [normalize](https://en.wikipedia.org/wiki/Database_normalization) it (typically to [third normal form](https://en.wikipedia.org/wiki/Third_normal_form)). The tl;dr of normalization is to split up your data into tables, so you don't duplicate data. Let's look at how you would model some user data in a relational database.

**Users**

| ID  | first_name | surname | cell         | city   | location_x | location_y |
| --- | ---------- | ------- | ------------ | ------ | ---------- | ---------- |
| 1   | Paul       | Miller  | 447557505611 | London | 45.123     | 47.232     |

**Professions**

| ID  | user_id | profession |
| --- | ------- | ---------- |
| 10  | 1       | banking    |
| 11  | 1       | finance    |
| 12  | 1       | trader     |

**Cars**

| ID  | user_id | model       | year |
| --- | ------- | ----------- | ---- |
| 20  | 1       | Bentley     | 1973 |
| 21  | 1       | Rolls Royce | 1965 |

In this example, you can see that the user data is split into separate tables, and it can be JOINed back together using the foreign key in the `user_id` column of the Professions and Cars tables. Now, let's look at how we might model this same data in MongoDB.

### MongoDB schema design

MongoDB schema design works a lot differently than relational schema design. With MongoDB schema design, there is:

- No formal process
- No algorithms
- No rules

![Eric André holding up a sign that says "Rules" and tearing it apart, captioned "No rules"](/images/blog/mongodb-schema-design-best-practices/no-rules.gif)

When you're designing your MongoDB schema, the only thing that matters is that you design a schema that will work well for _**your**_ application. Two different apps that use the exact same data might have very different schemas if the applications are used differently. When designing a schema, you want to take these into consideration:

- Store the data
- Provide good query performance
- Require a reasonable amount of hardware

Let's look at how we might model the relational User model in MongoDB.

```json
{
	"first_name": "Paul",
	"surname": "Miller",
	"cell": "447557505611",
	"city": "London",
	"location": [45.123, 47.232],
	"profession": ["banking", "finance", "trader"],
	"cars": [
		{
			"model": "Bentley",
			"year": 1973
		},
		{
			"model": "Rolls Royce",
			"year": 1965
		}
	]
}
```

You can see that instead of splitting our data up into separate collections or documents, we take advantage of MongoDB's document-based design to embed data into arrays and objects within the User object. Now we can make one simple query to pull all that data together for our application.

## Embedding vs. referencing

MongoDB schema design actually comes down to only two choices for every piece of data. You can either embed that data directly or reference another piece of data using the [$lookup](https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/) operator (similar to a JOIN). Let's look at the pros and cons of each option.

### Embedding

**Advantages:**

- You can retrieve all relevant information in a single query.
- You avoid implementing joins in application code or using [$lookup](https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/).
- You update related information as a single atomic operation. [Writes to a single document are atomic](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/), even when they change several fields at once.
- If you need a transaction across multiple operations, you can use [multi-document transactions](https://www.mongodb.com/docs/manual/core/transactions/).
- [Multi-document transactions have been available on replica sets since 4.0 and on sharded clusters since 4.2](https://www.mongodb.com/docs/manual/core/transactions/), but I should add that it's an anti-pattern to rely on them too much in your application.

**Limitations:**

- Large documents mean more overhead if most fields aren't relevant. You can increase query performance by limiting the size of the documents you send over the wire for each query.
- There is a [16 MB document size limit in MongoDB](https://www.mongodb.com/docs/manual/reference/limits/). If you embed too much data inside a single document, you could hit this limit.

### Referencing

The other option for designing your schema is referencing another document using a document's [unique object ID](https://www.mongodb.com/docs/manual/reference/method/ObjectId/) and connecting them together with the [$lookup](https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/) operator. Referencing does the job a JOIN does in an SQL query. It lets us split up data to make more efficient and scalable queries, yet keep the relationships between data.

**Advantages:**

- By splitting up data, you get smaller documents.
- You're less likely to reach the [16 MB per document limit](https://www.mongodb.com/docs/manual/reference/limits/).
- Infrequently accessed information isn't needed on every query.
- You reduce the amount of duplicated data. But don't avoid duplication at any cost: if repeating some data gives you a better schema, repeat it.

**Limitations:**

- To retrieve all the data in the referenced documents, you need a minimum of two queries or a [$lookup](https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/).

## Types of relationships

Now that we have explored the two ways to split up data when designing schemas in MongoDB, let's look at common relationships you're probably familiar with modeling if you come from an SQL background. I'll start with the simpler relationships and work up to some interesting patterns, and show how to model each with a real-world example. Note that we're only going to scratch the surface of modeling relationships in MongoDB here.

It's also important to note that even if your application has the exact same data as the examples below, you might end up with a completely different schema than the one I outline here. That's because the most important consideration for your schema is how your system is going to use your data. In each example, I'll outline the requirements for the application and why a given schema was used. If you want to discuss the specifics of your schema, open a conversation on the [MongoDB Community Hub](https://www.mongodb.com/community/forums/), and we can all discuss what will work best for your unique application.

### One-to-one

Let's look at our User document. This example has some great one-to-one data in it. For example, in our system, one user can only have one name. So, this is an example of a one-to-one relationship. We can model all one-to-one data as key-value pairs in our database.

```js
{
	_id: ObjectId("64b7e1f0a1b2c3d4e5f60001"),
	name: "Joe Karlsson",
	company: "MongoDB",
	x: "@JoeKarlsson1",
	twitch: "joe_karlsson",
	tiktok: "joekarlsson",
	website: "joekarlsson.com"
}
```

DJ Khaled would approve.

![DJ Khaled pointing at the camera saying "Another one" as copies of him multiply across the screen](/images/blog/mongodb-schema-design-best-practices/another-one.gif)

One-to-one tl;dr:

- Prefer key-value pairs embedded in the document.
- For example, an employee can work in one and only one department.

### One-to-few

Now let's say we're dealing with a small sequence of data that's associated with our users. For example, we might need to store several addresses for a given user. It's unlikely that a user of our application would have more than a couple of different addresses. We call a relationship like this a _one-to-few relationship._

```js
{
	_id: ObjectId("64b7e1f0a1b2c3d4e5f60001"),
	name: "Joe Karlsson",
	company: "MongoDB",
	x: "@JoeKarlsson1",
	twitch: "joe_karlsson",
	tiktok: "joekarlsson",
	website: "joekarlsson.com",
	addresses: [
		{ street: "123 Sesame St", city: "Anytown", cc: "USA" },
		{ street: "123 Avenue Q", city: "New York", cc: "USA" }
	]
}
```

Remember when I told you there are no rules to MongoDB schema design? Well, I lied. I've made up a couple of handy rules to help you design the schema for your application.

**Rule 1:** Favor embedding unless there is a compelling reason not to.

Generally speaking, my default action is to embed data within a document. I pull it out and reference it only if I need to access it on its own, it's too big, I rarely need it, or for some other reason.

One-to-few tl;dr:

- Prefer embedding for one-to-few relationships.

### One-to-many

Let's say you're building a product page for an e-commerce website, and you have to design a schema that can show product information. In our system, we save information about all the parts that make up each product, for repair services. How would you design a schema to save all this data and still keep your product page fast? You might want to consider a _one-to-many_ schema, since your one product is made up of many parts.

![An exploded drawing of a bicycle whose loose parts fly together into the finished bike](/images/blog/mongodb-schema-design-best-practices/bike-parts.gif)

With a schema that could be saving thousands of sub-parts, we probably don't need all of the data for the parts on every single request, but it's still important to keep this relationship in our schema. So, we might have a Products collection with data about each product in our e-commerce store, and to keep the part data linked, we keep an array of ObjectIds that point to documents with information about each part. These parts can be saved in the same collection or in a separate one, if needed. Let's look at how this would work.

Products:

```js
{
	name: "left-handed smoke shifter",
	manufacturer: "Acme Corp",
	catalog_number: "1234",
	parts: [
		ObjectId("64b7e1f0a1b2c3d4e5f60101"),
		ObjectId("64b7e1f0a1b2c3d4e5f60102"),
		ObjectId("64b7e1f0a1b2c3d4e5f60103")
	]
}
```

Parts:

```js
{
	_id: ObjectId("64b7e1f0a1b2c3d4e5f60101"),
	partno: "123-aff-456",
	name: "#4 grommet",
	qty: 94,
	cost: 0.94,
	price: 3.99
}
```

When the product page needs the parts too, one `$lookup` pulls them in:

```js
db.products.aggregate([
	{ $match: { catalog_number: '1234' } },
	{ $lookup: { from: 'parts', localField: 'parts', foreignField: '_id', as: 'parts' } },
]);
```

**Rule 2:** Needing to access an object on its own is a compelling reason not to embed it.

**Rule 3:** Avoid joins/lookups if possible, but don't be afraid if they can provide a better schema design.

### One-to-squillions

What if we have a schema where there could be millions of subdocuments, or more? That's when we get to the one-to-squillions schema. And I know what you're thinking: _Is squillions a real word?_ [And the answer is yes, it is a real word](https://www.dictionary.com/browse/squillion).

Let's imagine that you've been asked to build a server logging application. Each server could save a massive amount of data, depending on how verbose your logging is and how long you keep the logs.

![Moss from The IT Crowd typing calmly while a fire burns right next to his desk](/images/blog/mongodb-schema-design-best-practices/server-fire.gif)

With MongoDB, tracking data in an unbounded array is dangerous, since we could hit that 16 MB per document limit. Any given host could generate enough messages to overflow the 16 MB document size, even if we store only ObjectIds in the array. So, we need to rethink how we track this relationship without running into any hard limits.

Instead of tracking the relationship between the host and the log message in the host document, let's have each log message store the host it's associated with. By storing the data in the log, we no longer need to worry about an unbounded array messing with our application! Let's look at how this might work.

Hosts:

```js
{
	_id: ObjectId("64b7e1f0a1b2c3d4e5f60201"),
	name: "goofy.example.com",
	ipaddr: "127.66.66.66"
}
```

Log Message:

```js
{
	time: ISODate("2014-03-28T09:42:41.382Z"),
	message: "cpu is on fire!",
	host: ObjectId("64b7e1f0a1b2c3d4e5f60201")
}
```

To read a host's latest messages, query the logs by host, with an index on `host` and `time` so it stays fast as the logs pile up:

```js
db.logmsg.createIndex({ host: 1, time: -1 });
db.logmsg
	.find({ host: ObjectId('64b7e1f0a1b2c3d4e5f60201') })
	.sort({ time: -1 })
	.limit(100);
```

**Rule 4:** Arrays should not grow without bound. If there are more than a couple of hundred documents on the "many" side, don't embed them; if there are more than a few thousand documents on the "many" side, don't use an array of ObjectId references. High-cardinality arrays are a compelling reason not to embed.

### Many-to-many

The last schema design pattern I'm going to cover in this post is the _many-to-many_ relationship. It's another very common pattern that shows up all the time in relational and MongoDB schema designs. For this pattern, let's imagine we're building a to-do application. In our app, a user may have _many_ tasks, and a task may have _many_ users assigned to it.

![SpongeBob happily reading his to-do list, a scroll so long it unrolls across the floor past Gary](/images/blog/mongodb-schema-design-best-practices/todo-list.gif)

To preserve these relationships between users and tasks, there need to be references from the _one_ user to the _many_ tasks, and references from the _one_ task to the _many_ users. Let's look at how this could work for a to-do list application.

Users:

```js
{
	_id: ObjectId("64b7e1f0a1b2c3d4e5f60301"),
	name: "Kate Monster",
	tasks: [
		ObjectId("64b7e1f0a1b2c3d4e5f60401"),
		ObjectId("64b7e1f0a1b2c3d4e5f60402"),
		ObjectId("64b7e1f0a1b2c3d4e5f60403")
	]
}
```

Tasks:

```js
{
	_id: ObjectId("64b7e1f0a1b2c3d4e5f60401"),
	description: "Write blog post about MongoDB schema design",
	due_date: ISODate("2014-04-01"),
	owners: [ObjectId("64b7e1f0a1b2c3d4e5f60301"), ObjectId("64b7e1f0a1b2c3d4e5f60302")]
}
```

From this example, you can see that each user has a sub-array of linked tasks, and each task has a sub-array of owners for each item in our to-do app.

## Summary

As you can see, there are a ton of different ways to express your schema design once you go beyond normalizing your data like you might be used to doing in SQL. By embedding data within a document or referencing documents with the $lookup operator, you can make some truly powerful, scalable and efficient database queries that are completely unique to your application. In fact, we've barely scratched the surface of all the ways you could model your data in MongoDB.

I want to wrap up this post with the most important rule of MongoDB schema design yet.

**Rule 5:** As always, with MongoDB, how you model your data depends **entirely** on your particular application's data access patterns. You want to structure your data to match the ways that your application queries and updates it.

Remember, every application has unique needs and requirements, so the schema design should reflect the needs of that particular application. Take the examples in this post as a starting point for your application. Reflect on what you need to do, and how your schema can help you get there.

Recap:

- **One-to-one:** prefer key-value pairs within the document
- **One-to-few:** prefer embedding
- **One-to-many:** prefer an array of references
- **One-to-squillions:** prefer referencing
- **Many-to-many:** prefer referencing

General rules for MongoDB schema design:

- **Rule 1:** Favor embedding unless there is a compelling reason not to.
- **Rule 2:** Needing to access an object on its own is a compelling reason not to embed it.
- **Rule 3:** Avoid joins and lookups if possible, but don't be afraid if they can provide a better schema design.
- **Rule 4:** Arrays should not grow without bound. If there are more than a couple of hundred documents on the _many_ side, don't embed them; if there are more than a few thousand documents on the _many_ side, don't use an array of ObjectId references. High-cardinality arrays are a compelling reason not to embed.
- **Rule 5:** As always, with MongoDB, how you model your data depends **entirely** on your particular application's data access patterns. You want to structure your data to match the ways that your application queries and updates it.

We've only scratched the surface of design patterns in MongoDB. We haven't even started on patterns that aren't remotely possible in a legacy relational model. If you want to learn more about them, check out the resources below.

## Where I've given the talk

MidwestPHP (Minneapolis, April 2020), Data Architecture Day (May 2020) and Conf42 JavaScript (2020). Other recordings:

- [Conf42 JavaScript 2020](https://www.youtube.com/watch?v=tYNaXn2wJJo)
- [Data Architecture Day](https://www.youtube.com/watch?v=ay31FKx4maM)
- [A 10-minute version for MongoDB](https://www.youtube.com/watch?v=QAqK-R9HUhc)

If you're coming from SQL, my talk [From SQL to NoSQL](/talks/from-sql-to-nosql-a-gentle-introduction-for-devs/) covers how to shift your thinking first.

## Slides and resources

- [Slides on Speaker Deck](https://speakerdeck.com/joekarlsson/mongodb-schema-design-best-practices)
- Now that you know how to design a fast, scalable MongoDB schema, learn what _not_ to do: [schema design anti-patterns in the MongoDB docs](https://www.mongodb.com/docs/manual/data-modeling/design-antipatterns/), or [the video series on YouTube](https://www.youtube.com/watch?v=8CZs-0it9r4) if video is more your thing.
- [6 Rules of Thumb for MongoDB Schema Design](https://www.mongodb.com/company/blog/mongodb/6-rules-of-thumb-for-mongodb-schema-design)
- [Building with Patterns: A Summary](https://www.mongodb.com/company/blog/building-with-patterns-a-summary)
- [Data modeling in the MongoDB docs](https://www.mongodb.com/docs/manual/data-modeling/)
- [The MongoDB data modeling learning path](https://learn.mongodb.com/learn/learning-path/data-modeling-for-mongodb)
- [MongoDB Community Hub](https://www.mongodb.com/community/forums/)
