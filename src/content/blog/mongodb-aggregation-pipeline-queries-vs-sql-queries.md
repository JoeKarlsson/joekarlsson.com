---
title: 'MongoDB Aggregation Pipeline Queries vs SQL Queries'
date: 2021-05-28
slug: 'mongodb-aggregation-pipeline-queries-vs-sql-queries'
description: 'Let’s be honest: Many devs coming to MongoDB are joining the community with a strong background in SQL. I would personally include myself in this subset of MongoDB devs. I think it’s useful to map...'
categories: ['Databases']
heroImage: '/images/blog/mongodb-aggregation-pipeline-queries-vs-sql-queries/og-aggregation-framework.webp'
heroAlt: 'MongoDB aggregation pipeline queries compared to SQL queries'
contentNotice: false
tldr: 'A side-by-side cheat sheet translating common SQL queries (GROUP BY, SUM, JOIN, etc.) into MongoDB Aggregation Pipeline stages. If you know SQL and are learning MongoDB, this is the Rosetta Stone you need.'
---

Let’s be honest: Many devs coming to MongoDB are joining the community with a strong background in SQL. I would personally include myself in this subset of MongoDB devs. I think it’s useful to map terms and concepts you might be familiar with in SQL to help “[translate](https://docs.mongodb.com/manual/reference/sql-comparison/)” your work into MongoDB Query Language (MQL). More specifically, in this post, I will be walking through translating the MongoDB Aggregation Pipeline Queries vs SQL Queries.

## What is the Aggregation Framework?

The aggregation framework allows you to analyze your data in real-time. Using the framework, you can create an aggregation pipeline that consists of one or more stages. Each stage transforms the documents and passes the output to the next stage.

If you’re familiar with the Unix pipe, you can think of the aggregation pipeline as a very similar concept. Just as output from one command is passed as input to the next command when you use piping, output from one stage is passed as input to the next stage when you use the aggregation pipeline.

SQL is a declarative language. You have to declare what you want to see-that’s why SELECT comes first. You have to think in sets, which can be difficult, especially for functional programmers. With MongoDB’s aggregation pipeline, you can have stages that reflect how you think-for example, “First, let’s group by X. Then, we’ll get the top 5 from every group. Then, we’ll arrange by price.” This is a difficult query to do in SQL, but much easier using the aggregation pipeline framework.

The aggregation framework has a variety of [stages](https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/) available for you to use. Today, we’ll discuss the basics of how to use [$match](https://docs.mongodb.com/manual/reference/operator/aggregation/match/), [$group](https://docs.mongodb.com/manual/reference/operator/aggregation/group/), [$sort](https://docs.mongodb.com/manual/reference/operator/aggregation/sort/), and [$limit](https://docs.mongodb.com/manual/reference/operator/aggregation/limit/). Note that the aggregation framework has many other powerful stages, including [$count](https://docs.mongodb.com/manual/reference/operator/aggregation/count/), [$geoNear](https://docs.mongodb.com/manual/reference/operator/aggregation/geoNear/), [$graphLookup](https://docs.mongodb.com/manual/reference/operator/aggregation/graphLookup/), [$project](https://docs.mongodb.com/manual/reference/operator/aggregation/project/), [$unwind](https://docs.mongodb.com/manual/reference/operator/aggregation/unwind/), and others.

> If you want to check out another great introduction to the MongoDB Aggregation Pipeline, be sure to check out Introduction to the MongoDB Aggregation Framework.

## Terminology and Concepts

The following table provides an overview of common SQL aggregation terms, functions, and concepts and the corresponding MongoDB aggregation operators:

##### Terminology and Concepts

| SQL Terms, Functions, and Concepts | MongoDB Aggregation Operators                                                                                                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WHERE                              | [$match](https://docs.mongodb.com/manual/reference/operator/aggregation/match/#pipe._S_match)                                                                                                              |
| GROUP BY                           | [$group](https://docs.mongodb.com/manual/reference/operator/aggregation/group/#pipe._S_group)                                                                                                              |
| HAVING                             | [$match](https://docs.mongodb.com/manual/reference/operator/aggregation/match/#pipe._S_match)                                                                                                              |
| SELECT                             | [$project](https://docs.mongodb.com/manual/reference/operator/aggregation/project/#pipe._S_project)                                                                                                        |
| LIMIT                              | [$limit](https://docs.mongodb.com/manual/reference/operator/aggregation/limit/#pipe._S_limit)                                                                                                              |
| OFFSET                             | [$skip](https://docs.mongodb.com/manual/reference/operator/aggregation/skip/index.html)                                                                                                                    |
| ORDER BY                           | [$sort](https://docs.mongodb.com/manual/reference/operator/aggregation/sort/index.html)                                                                                                                    |
| SUM()                              | [$sum](https://docs.mongodb.com/manual/reference/operator/aggregation/sum/#grp._S_sum)                                                                                                                     |
| COUNT()                            | [$sum](https://docs.mongodb.com/manual/reference/operator/aggregation/sum/#grp._S_sum) and [$sortByCount](https://docs.mongodb.com/manual/reference/operator/aggregation/sortByCount/#pipe._S_sortByCount) |
| JOIN                               | [$lookup](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/#pipe._S_lookup)                                                                                                           |
| SELECT INTO NEW_TABLE              | [$out](https://docs.mongodb.com/manual/reference/operator/aggregation/out/#pipe._S_out)                                                                                                                    |
| MERGE INTO TABLE                   | [$merge](https://docs.mongodb.com/manual/reference/operator/aggregation/merge/#pipe._S_merge) (Available starting in MongoDB 4.2)                                                                          |
| UNION ALL                          | [$unionWith](https://docs.mongodb.com/manual/reference/operator/aggregation/unionWith/#pipe._S_unionWith) (Available starting in MongoDB 4.4)                                                              |

Alright, now that we’ve covered the basics of MongoDB Aggregations, let’s jump into some examples.

## SQL Setup

The SQL examples assume _two_ tables, _album_ and _songs_, that join by the _song.album_id_ and the _songs.id_ columns. Here’s what the tables look like:

##### Albums

| id  | name                              | band_name        | price | status |
| --- | --------------------------------- | ---------------- | ----- | ------ |
| 1   | lo-fi chill hop songs to study to | Silicon Infinite | 2.99  | A      |
| 2   | Moon Rocks                        | Silicon Infinite | 1.99  | B      |
| 3   | Flavour                           | Organical        | 4.99  | A      |

##### Songs

| id  | title                 | plays | album_id |
| --- | --------------------- | ----- | -------- |
| 1   | Snow Beats            | 133   | 1        |
| 2   | Rolling By            | 242   | 1        |
| 3   | Clouds                | 3191  | 1        |
| 4   | But First Coffee      | 562   | 3        |
| 5   | Autumn                | 901   | 3        |
| 6   | Milk Toast            | 118   | 2        |
| 7   | Purple Mic            | 719   | 2        |
| 8   | One Note Dinner Party | 1242  | 2        |

I used a site called SQL Fiddle, and used PostgreSQL 9.6 for all of my examples. However, feel free to run these sample SQL snippets wherever you feel most comfortable. Here's the code I used to set up and seed my tables with our sample data:

```sql
-- Creating the main albums table
CREATE TABLE IF NOT EXISTS albums (
    id BIGSERIAL NOT NULL UNIQUE PRIMARY KEY,
    name VARCHAR(40) NOT NULL UNIQUE,
    band_name VARCHAR(40) NOT NULL,
    price float8 NOT NULL,
    status VARCHAR(10) NOT NULL
);

-- Creating the songs table
CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY NOT NULL,
    title VARCHAR(40) NOT NULL,
    plays integer NOT NULL,
    album_id BIGINT NOT NULL REFERENCES albums ON DELETE RESTRICT
);

INSERT INTO albums (name, band_name, price, status)
VALUES
    ('lo-fi chill hop songs to study to', 'Silicon Infinite', 7.99, 'A'),
    ('Moon Rocks', 'Silicon Infinite', 1.99, 'B'),
    ('Flavour', 'Organical', 4.99, 'A');

INSERT INTO songs (title, plays, album_id)
VALUES
    ('Snow Beats', 133, (SELECT id from albums WHERE name='lo-fi chill hop songs to study to')),
    ('Rolling By', 242, (SELECT id from albums WHERE name='lo-fi chill hop songs to study to')),
    ('Clouds', 3191, (SELECT id from albums WHERE name='lo-fi chill hop songs to study to')),
    ('But First Coffee', 562, (SELECT id from albums WHERE name='Flavour')),
    ('Autumn', 901, (SELECT id from albums WHERE name='Flavour')),
    ('Milk Toast', 118, (SELECT id from albums WHERE name='Moon Rocks')),
    ('Purple Mic', 719, (SELECT id from albums WHERE name='Moon Rocks')),
    ('One Note Dinner Party', 1242, (SELECT id from albums WHERE name='Moon Rocks'));
```

## MongoDB Setup

The MongoDB examples assume _one_ collection `albums` that contains documents with the following schema:

```json
{
	"name": "lo-fi chill hop songs to study to",
	"band_name": "Silicon Infinite",
	"price": 7.99,
	"status": "A",
	"songs": [
		{ "title": "Snow beats", "plays": 133 },
		{ "title": "Rolling By", "plays": 242 },
		{ "title": "Sway", "plays": 3191 }
	]
}
```

For this post, I did all of my prototyping in a MongoDB Visual Studio Code plugin playground. For more information on how to use a MongoDB Playground in Visual Studio Code, be sure to check out this post: How To Use The MongoDB Visual Studio Code Plugin. Once you have your playground all set up, you can use this snippet to set up and seed your collection. You can also follow along with this demo by using the [MongoDB Web Shell](https://docs.mongodb.com/manual/tutorial/getting-started).

```javascript
// Select the database to use.
use('mongodbVSCodePlaygroundDB');

// The drop() command destroys all data from a collection.
// Make sure you run it against the correct database and collection.
db.albums.drop();

// Insert a few documents into the albums collection.
db.albums.insertMany([
	{
		name: 'lo-fi chill hop songs to study to',
		band_name: 'Silicon Infinite',
		price: 7.99,
		status: 'A',
		songs: [
			{ title: 'Snow beats', plays: 133 },
			{ title: 'Rolling By', plays: 242 },
			{ title: 'Clouds', plays: 3191 },
		],
	},
	{
		name: 'Moon Rocks',
		band_name: 'Silicon Infinite',
		price: 1.99,
		status: 'B',
		songs: [
			{ title: 'Milk Toast', plays: 118 },
			{ title: 'Purple Mic', plays: 719 },
			{ title: 'One Note Dinner Party', plays: 1242 },
		],
	},
	{
		name: 'Flavour',
		band_name: 'Organical',
		price: 4.99,
		status: 'A',
		songs: [
			{ title: 'But First Coffee', plays: 562 },
			{ title: 'Autumn', plays: 901 },
		],
	},
]);
```

## Quick Reference

### Count all records from albums

#### SQL

```sql
SELECT COUNT(*) AS count
FROM albums
```

#### MongoDB

```javascript
db.albums.aggregate([
	{
		$group: {
			_id: null, //  An _id value of null on the $group operator accumulates values for all the input documents as a whole.
			count: { $sum: 1 },
		},
	},
]);
```

### Sum the price field from albums

#### SQL

```sql
SELECT SUM(price) AS total
FROM albums
```

#### MongoDB

```javascript
db.albums.aggregate([
	{
		$group: {
			_id: null,
			total: { $sum: '$price' },
		},
	},
]);
```

### For each unique band_name, sum the price field

#### SQL

```sql
SELECT band_name,
SUM(price) AS total
FROM albums
GROUP BY band_name
```

MongoDB

```javascript
db.albums.aggregate([
	{
		$group: {
			_id: '$band_name',
			total: { $sum: '$price' },
		},
	},
]);
```

### For each unique band_name, sum the price field, results sorted by sum

#### SQL

```sql
SELECT band_name,
    SUM(price) AS total
FROM albums
GROUP BY band_name
ORDER BY total
```

MongoDB

```javascript
db.albums.aggregate([
	{
		$group: {
			_id: '$band_name',
			total: { $sum: '$price' },
		},
	},
	{ $sort: { total: 1 } },
]);
```

### For band_name with multiple albums, return the band_name and the corresponding album count

#### SQL

```sql
SELECT band_name,
    count(*)
FROM albums
GROUP BY band_name
HAVING count(*) > 1;
```

MongoDB

```javascript
db.albums.aggregate([
	{
		$group: {
			_id: '$band_name',
			count: { $sum: 1 },
		},
	},
	{ $match: { count: { $gt: 1 } } },
]);
```

### Sum the price of all albums with status A and group by unique band_name

#### SQL

```sql
SELECT band_name,
    SUM(price) as total
FROM albums
WHERE status = 'A'
GROUP BY band_name
```

MongoDB

```javascript
db.albums.aggregate([
	{ $match: { status: 'A' } },
	{
		$group: {
			_id: '$band_name',
			total: { $sum: '$price' },
		},
	},
]);
```

### For each unique band_name with status A, sum the price field and return only where the sum is greater than $5.00

#### SQL

```sql
SELECT band_name,
    SUM(price) as total
FROM albums
WHERE status = 'A'
GROUP BY band_name
HAVING SUM(price) > 5.00;
```

MongoDB

```javascript
db.albums.aggregate([
	{ $match: { status: 'A' } },
	{
		$group: {
			_id: '$band_name',
			total: { $sum: '$price' },
		},
	},
	{ $match: { total: { $gt: 5.0 } } },
]);
```

### For each unique band_name, sum the corresponding song plays field associated with the albums

#### SQL

```sql
SELECT band_name,
    SUM(songs.plays) as total_plays
FROM albums,
    songs
WHERE songs.album_id = albums.id
GROUP BY band_name;
```

MongoDB

```javascript
db.albums.aggregate([
	{ $unwind: '$songs' },
	{
		$group: {
			_id: '$band_name',
			qty: { $sum: '$songs.plays' },
		},
	},
]);
```

### For each unique album, get the song from album with the most plays

#### SQL

```sql
SELECT name, title, plays
    FROM songs s1 INNER JOIN albums ON (album_id = albums.id)
WHERE plays=(SELECT MAX(s2.plays)
    FROM songs s2
WHERE s1.album_id = s2.album_id)
ORDER BY name;
```

MongoDB

```javascript
db.albums.aggregate([
	{
		$project: {
			name: 1,
			plays: {
				$filter: {
					input: '$songs',
					as: 'item',
					cond: { $eq: ['$item.plays', { $max: '$songs.plays' }] },
				},
			},
		},
	},
]);
```

## Wrapping Up

This post is in no way a complete overview of all the ways that MongoDB can be used like a SQL-based database. This was only meant to help devs in SQL land start to make the transition over to the MongoDB Aggregation Pipeline Queries vs SQL Queries. If you're still early in your SQL-to-MongoDB journey, I'd also recommend checking out my [intro to moving from SQL to NoSQL](/blog/from-sql-to-nosql-a-gentle-introduction-for-devs/) for a broader overview of the differences. The aggregation framework has many other powerful stages, including [$count](https://docs.mongodb.com/manual/reference/operator/aggregation/count/), [$geoNear](https://docs.mongodb.com/manual/reference/operator/aggregation/geoNear/), [$graphLookup](https://docs.mongodb.com/manual/reference/operator/aggregation/graphLookup/), [$project](https://docs.mongodb.com/manual/reference/operator/aggregation/project/), [$unwind](https://docs.mongodb.com/manual/reference/operator/aggregation/unwind/), and others.

If you want to get better at using the MongoDB Aggregation Framework, be sure to check out [MongoDB University: M121 – The MongoDB Aggregation Framework](https://university.mongodb.com/courses/M121/about). Or, better yet, try to use some advanced MongoDB aggregation pipeline queries in your next project! If you have any questions, be sure to head over to the [MongoDB Community Forums](https://university.mongodb.com/courses/M121/about). It’s the best place to get your MongoDB questions answered.

## Resources:

- [MongoDB University: M121 - The MongoDB Aggregation Framework](https://university.mongodb.com/courses/M121/about)
- [Aggregation Pipeline Quick Reference](https://docs.mongodb.com/manual/meta/aggregation-quick-reference/)
- [SQL to Aggregation Mapping Chart](https://docs.mongodb.com/manual/reference/sql-aggregation-comparison/)
- [SQL to MongoDB Mapping Chart](https://docs.mongodb.com/manual/reference/sql-comparison/)
- [MongoDB Community Forums](https://developer.mongodb.com/community/forums/)

## Want to check out more of my technical posts?

- [Building a Claude Code Blog Skill: What I Learned Systematizing Content Creation](/blog/building-a-claude-code-blog-skill-what-i-learned-systematizing-content-creation/)
- [Self-Hosted Music Still Sucks in 2025](/blog/self-hosted-music-still-sucks-in-2025/)
- [I Replaced Alexa with a Dumber Voice Assistant (But at Least It’s Private)](/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/)
- [Why Clickhouse Should Be Your Next Database](/blog/why-clickhouse-should-be-your-next-database/)
- [Data Warehouses Are Terrible Application Backends](/blog/data-warehouses-are-terrible-application-backends/)
