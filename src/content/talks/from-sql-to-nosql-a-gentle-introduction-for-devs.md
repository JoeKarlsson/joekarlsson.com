---
title: 'From SQL to NoSQL: A Gentle Introduction For Devs'
seoTitle: 'From SQL to NoSQL: An Intro for Devs'
date: 2020-02-27
slug: 'from-sql-to-nosql-a-gentle-introduction-for-devs'
description: 'My talk on moving from SQL to NoSQL with MongoDB: how SQL terms map to documents, and three habits SQL developers need to unlearn.'
categories: ['Web Dev']
heroImage: '/images/blog/from-sql-to-nosql-a-gentle-introduction-for-devs/thumb-b05809df.webp'
heroAlt: 'A clerk in a room lined floor to ceiling with filing drawers'
contentNotice: false
tldr: 'Most SQL concepts have a MongoDB twin with a different name. Documents let you program faster, pivot easier, query faster and scale cheaper, but only once you stop splitting your data into tables out of habit.'
videos:
  - id: '12IppjSDVCQ'
  - id: 'Y9qSp8kd1u4'
    chapters:
      - { at: '0:14', name: 'The two bottlenecks of every web app' }
      - { at: '2:05', name: 'Agenda' }
      - { at: '2:46', name: 'MongoDB stores data in documents' }
      - { at: '4:24', name: 'The same data in SQL' }
      - { at: '5:44', name: 'Schemaless? No, flexible schema' }
      - { at: '6:29', name: 'SQL terms in MongoDB' }
      - { at: '7:56', name: 'Multi-document ACID transactions' }
      - { at: '8:32', name: 'Four reasons: program faster' }
      - { at: '12:15', name: 'Pivot easier' }
      - { at: '13:09', name: 'Query faster' }
      - { at: '14:01', name: 'Scale cheaper' }
      - { at: '15:30', name: "What's next for you" }
---

When you need to model data, is your first instinct to start breaking it down into rows and columns? Mine used to be too. This is my gentle introduction to NoSQL for developers who already know some SQL, using MongoDB as the example, recorded at ConFoo Montreal in February 2020.

[Watch From SQL to NoSQL at ConFoo 2020 on YouTube](https://www.youtube.com/watch?v=12IppjSDVCQ)

## What the talk covers

**Why the database matters.** A web app has two main bottlenecks: network speed and database execution speed. Nobody has broken the speed of light yet, so the database is the one you can do something about.

**SQL terms in MongoDB.** MongoDB stores data in documents. They're JSON-like (BSON), you read them by key, and they hold real data types: strings, integers, arrays, nested objects and geolocation data. The same user data in SQL gets normalized into a users table, a professions table linked by foreign keys, and another table for the nested data. Most of the concepts carry over with a different name:

- Row → document
- Column → field
- Table → collection
- Database → database
- Index → index, with the same B-tree structure
- JOIN → embedding, or `$lookup` when you need it
- Multi-record ACID transaction → multi-document ACID transaction

People often call MongoDB schemaless. I'd call it a flexible schema database: you can enforce schema validation at the database level, as strictly or as loosely as you want.

**Four advantages of a document database:**

1. **Program faster.** Documents map straight onto the objects and dictionaries your language already has. Rows and columns don't, so with SQL you map rows into objects and back again. In my Python example, querying and updating a user profile took 30 lines of code with MongoDB and 73 with MySQL.
2. **Pivot easier.** Adding a field doesn't mean altering tables and dealing with the old data. When I added a new sensor to my IoT litter box, I started saving its readings right away, and I didn't care about the old data anyway.
3. **Query faster.** Joins are expensive in time and in memory, and they get worse with lots of users hitting them at once. If everything you need is in one document, it's one query and no join.
4. **Scale cheaper.** An SQL database scales vertically: when you run out of space, you buy a bigger hard drive, which gets expensive fast, and you migrate with downtime. MongoDB scales horizontally with sharding. You add smaller, cheaper servers with no downtime, and you can shard by geolocation so your users' data sits close to them.

**Three habits to unlearn.** I started in PostgreSQL, and splitting data into tables was a hard habit to break.

- **Not every document in a collection needs the same fields.** With the polymorphic pattern, documents in one collection can take different shapes. My cat's user profile is tiny, because he doesn't have a job or a cell phone. The outlier pattern handles the few documents that break your design. A regular Twitter user can keep their followers in an array, but Justin Bieber can't, so his document gets flagged and the extra followers go into overflow documents.
- **Data that's accessed together should be stored together.** Hard drives used to be expensive. Now the biggest cost in development is developers. Repeating data costs some storage and makes your queries faster, so embed as much as you can. I go deeper on this in [MongoDB Schema Design Best Practices](/talks/mongodb-schema-design-best-practices/).
- **Don't reach for a transaction every time.** ACID transactions aren't bad, and if I were building a banking app I'd use them. I think a lot of us lean on them more than we need to.

**What to do next.** The best way I learn a new technology is to use it. Try a new database on your next side project, and if you want a guided start, MongoDB University's courses are free.

## Where I've given it

ConFoo Montreal (February 2020), the JavaMN meetup in Minneapolis (March 2020), JS VidCon and the Node.js Global Summit (May 2020), and Conf42 JavaScript (2020). Other recordings:

- [Conf42 JavaScript 2020](https://www.youtube.com/watch?v=Y9qSp8kd1u4), a shorter 17-minute version

## Slides and resources

- [Slides on Speaker Deck](https://speakerdeck.com/joekarlsson/from-sql-to-nosql-a-gentle-introduction-for-developers)
- [MongoDB University](https://learn.mongodb.com/)
- [Building with Patterns: A Summary](https://www.mongodb.com/company/blog/building-with-patterns-a-summary)
- [Schema validation in the MongoDB docs](https://www.mongodb.com/docs/manual/core/schema-validation/)
- [JSON Schema Validation: Locking Down Your Model the Smart Way](https://www.mongodb.com/company/blog/json-schema-validation--locking-down-your-model-the-smart-way)
- [JSON Schema Validation: Checking Your Arrays](https://www.mongodb.com/company/blog/json-schema-validation--checking-your-arrays)
- [Transactions in the MongoDB docs](https://www.mongodb.com/docs/manual/core/transactions/)
- [Sharding in the MongoDB docs](https://www.mongodb.com/docs/manual/sharding/)
- [MongoDB Community Forums](https://www.mongodb.com/community/forums/)
