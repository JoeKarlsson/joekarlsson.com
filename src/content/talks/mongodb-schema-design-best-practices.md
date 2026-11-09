---
title: 'MongoDB Schema Design Best Practices'
date: 2020-04-02
slug: 'mongodb-schema-design-best-practices'
description: 'My talk on MongoDB schema design: embedding vs. referencing, how to model each kind of relationship, and my four rules of thumb.'
categories: ['Web Dev']
writtenFor: 'MongoDB'
heroImage: '/images/blog/mongodb-schema-design-best-practices/thumb-b1a8ce46.webp'
heroAlt: 'An old architectural blueprint'
contentNotice: false
tldr: 'MongoDB has no rules, no process and no algorithm for splitting up your data: you design around how your app uses it. Favor embedding unless there is a compelling reason not to, and never let an array grow without bound.'
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
---

"How do I model my schema for my application?" It's one of the most common questions developers ask about MongoDB, and the answer is: it depends. This talk is how I think about that answer, with real examples, for anyone coming to document databases from SQL.

[Watch MongoDB Schema Design Best Practices on YouTube](https://www.youtube.com/watch?v=leNCfU5SYR8)

## What the talk covers

**Relational vs. MongoDB schema design.** In SQL, you model your data independently of your queries. You normalize to third normal form, split everything into tables, and join it back together with foreign keys. MongoDB has no rules, no process and no algorithm for that. You design around how your app actually reads and writes the data: what the app reads together, whether the app is read-heavy or write-heavy, and how the data set will grow.

**Embedding vs. referencing.** Those are the two tools you have. Embedding puts related data right in the document, so you get everything back in a single query and update it in one atomic operation, as long as the document stays under the 16 MB limit. Referencing keeps documents small and avoids duplicating data, but you pay for it with a second query or a `$lookup`.

**Every kind of relationship, with an example:**

- **One-to-one:** embed it. Key-value pairs right in the document.
- **One-to-few:** embed it in a small array that isn't going to grow much.
- **One-to-many:** a product made of thousands of parts. Reference the parts by ID from the product.
- **One-to-squillions:** the logs from a burning server farm. Too many for any array, so it's a reverse reference: each log message keeps track of its host's ID.
- **Many-to-many:** a shared to-do list, where users have many tasks and tasks have many owners. Keep an array of references on each side.

## My rules of thumb

1. **Favor embedding** unless there is a compelling reason not to. It's your default.
2. **Needing to access an object on its own is a compelling reason not to embed it.**
3. **Avoid joins and `$lookup` if you can,** but they're not an anti-pattern. Most people coming from SQL split their data up by default, out of habit. Use a join when you have a real reason to.
4. **Arrays shouldn't grow without bound.** An unbounded array anywhere in your data set is a huge code smell.

Above everything else, how you model your data depends entirely on the needs of your application.

## Where I've given it

MidwestPHP (Minneapolis, April 2020), Data Architecture Day (May 2020) and Conf42 JavaScript (2020). Other recordings:

- [Conf42 JavaScript 2020](https://www.youtube.com/watch?v=tYNaXn2wJJo)
- [Data Architecture Day](https://www.youtube.com/watch?v=ay31FKx4maM)
- [A 10-minute version for MongoDB](https://www.youtube.com/watch?v=QAqK-R9HUhc)

If you're coming from SQL, my talk [From SQL to NoSQL](/talks/from-sql-to-nosql-a-gentle-introduction-for-devs/) covers how to shift your thinking first.

## Slides and resources

- [Slides on Speaker Deck](https://speakerdeck.com/joekarlsson/mongodb-schema-design-best-practices)
- [6 Rules of Thumb for MongoDB Schema Design](https://www.mongodb.com/company/blog/mongodb/6-rules-of-thumb-for-mongodb-schema-design)
- [Building with Patterns: A Summary](https://www.mongodb.com/company/blog/building-with-patterns-a-summary)
- [Data modeling in the MongoDB docs](https://www.mongodb.com/docs/manual/data-modeling/)
- [MongoDB University: Introduction to Data Modeling](https://learn.mongodb.com/courses/introduction-to-data-modeling)
- [MongoDB Community Forums](https://www.mongodb.com/community/forums/)
