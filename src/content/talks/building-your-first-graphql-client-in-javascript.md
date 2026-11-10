---
title: 'Building Your First GraphQL Client in JavaScript'
date: 2020-09-15
slug: 'building-your-first-graphql-client-in-javascript'
description: 'My talk on GraphQL for JavaScript and React developers: what REST gets wrong, how GraphQL fixes it, and queries and mutations with Apollo. Every event and deck.'
categories: ['Web Dev']
contentNotice: false
tldr: 'REST has no standard way to change an API, so front-end teams wait on back-end teams and make round trip after round trip. GraphQL gives you one endpoint that returns exactly the data you ask for. I gave this talk 8 times from 2018 to 2020, first as a workshop and then with a MongoDB Atlas back end and Apollo on the front end.'
videos:
  - id: '87bPNnd6M7A'
    chapters:
      - { at: '0:00', name: 'Intro' }
      - { at: '2:02', name: 'Who this talk is for' }
      - { at: '4:19', name: 'What is GraphQL?' }
      - { at: '7:17', name: 'How GraphQL works' }
      - { at: '7:58', name: 'Why use GraphQL?' }
      - { at: '14:41', name: 'The catch: abstraction costs something' }
      - { at: '16:20', name: 'Apollo and the InstaPosts app' }
      - { at: '18:38', name: 'Setting up Apollo' }
      - { at: '19:44', name: 'Connecting Apollo to React' }
      - { at: '21:41', name: 'Making queries' }
      - { at: '24:47', name: 'A query in action' }
      - { at: '26:39', name: 'Handling errors' }
      - { at: '27:15', name: 'Mutating data' }
      - { at: '30:45', name: 'A mutation in action' }
      - { at: '31:36', name: 'Recap' }
      - { at: '35:28', name: 'How to learn GraphQL' }
  - id: 'XsD2ZKqMbgo'
  - id: '7HczsHW7JA0'
heroImage: '/images/blog/building-your-first-graphql-client-in-javascript/thumb-4f9d922e.webp'
heroAlt: 'A long row of order bins in the old Sears mail-order plant in Chicago'
---

Say you're building the front end of an online store and your API returns a user's recent orders as a list of SKUs. Then the product manager wants the order date, name, price and shipping date on the page too. Now you need a new endpoint, or a query parameter, or a header, and there's no standard way to pick. This talk is about how GraphQL fixes that, and how to build your first client for it in JavaScript and React.

[Watch Building Your First GraphQL Client in JavaScript on YouTube](https://www.youtube.com/watch?v=87bPNnd6M7A)

## What the talk covers

**What REST gets wrong.** With REST, the front end makes a lot of separate calls to separate services. Sometimes I have to wait for the list of SKUs to come back, then hydrate them, then go get the images, three or four round trips before I can show the user anything. And every time the front end needs different data, someone has to change the back end.

**How GraphQL works.** You hit one endpoint, and GraphQL goes and gets the data from all the services behind it. You send an object shaped like the data you want back, and you get exactly that, in one round trip. GraphQL is a specification, not a library, and there are implementations in pretty much every major language.

**Why I like it:**

- **It's declarative.** Like SQL, you say what you want, not how to get it.
- **It's validated and structured.** You control the types that come in on a request and go out on a response.
- **It unifies your endpoints.** At a big company with tons of services managed by a bunch of different teams, everyone asks for data the same way.
- **No more API versioning.** Versioning is an anti-pattern in GraphQL. You leave the old fields there and add new ones.
- **The docs write themselves.** GraphiQL (it's "graphical," not "graph-Q-L") lets you try queries in the browser and has a documentation explorer that's always up to date. It doesn't replace talking to your back-end team, though.
- **It's faster.** You stop over-fetching data you never use, and you stop making round trips.

**The catch.** Abstraction always costs something. GraphQL is more code your server runs, more startup cost and more to maintain. I think it's worth it, but you should count that cost before you add it.

**Apollo.** Apollo is a client that wraps your front-end components, whatever framework they're in, and handles sending queries, caching and updating state. It came out of the team behind Meteor. I tried building the demo without it, and it made the talk much harder to give. If you're new to GraphQL and use React, start with Apollo.

**The demo app.** InstaPosts is a little Instagram clone: images with a description, stored in MongoDB Atlas, with a GraphQL endpoint Atlas generated from the data, and a static React front end. I set up an Apollo client pointed at that one endpoint, wrap the React app in `ApolloProvider` so every component can use Apollo's hooks, then:

- **Query** with `useQuery` and a query written with `graphql-tag`. A query names the collection and the fields you want back, here the ID, description and image URL. Apollo polls every 500 milliseconds and hands you one of three states: loading, error or data.
- **Mutate** with `useMutation`. A mutation has an operation name, like a function name, and typed arguments, where a `!` marks an argument you have to pass. It also says which fields to send back as a receipt once the insert goes through.

In the Q&A people asked about errors and security. For errors, use React error boundaries and show the user a friendly message, or fall back to cached data. For security, you can set permissions so only certain users can run certain queries or mutations, or only update their own data.

**How to learn it.** Clone a project that works, get it running and start changing it for what you need. That's how I learn any new piece of tech.

## How the talk changed

The first version was a workshop. At MXNow in April 2018, people built a GraphQL server and a React client with Mongoose and Docker, step by step from a [workshop repo](https://github.com/JoeKarlsson/graphql-workshop). That summer I built a [React and Apollo demo on a Graphcool back end](https://github.com/JoeKarlsson/graphql-apollo-demo) for the talk.

After I joined MongoDB, the back end became a MongoDB Atlas cluster that generated the whole GraphQL schema with one button, with all the queries and mutations made for you. That's the version at MongoDB.local San Francisco, MongoDB World and the 2020 recording above. MongoDB deprecated the Atlas GraphQL API in March 2024 and scheduled it to shut down in March 2025, so you can't run that back end anymore. The Apollo and React half of the talk still works the same way with any GraphQL server.

## Where I've given it

- **MXNow**, April 2018, as a workshop: [slides](https://slides.com/joekarlsson/graphql)
- **MidwestJS 2018**, Minneapolis, August 2018, as a workshop: [slides](https://slides.com/joekarlsson/graphql)
- **Prairie Dev Con Regina 2018**, October 2018, as a workshop: [slides](https://speakerdeck.com/joekarlsson/building-a-graphql-client-in-javascript-praire-dev-con)
- **Kansas City Developer Conference**, July 2019: [slides](https://speakerdeck.com/joekarlsson/building-a-graphql-client-in-javascript)
- **Midwest JS 2019**, Minneapolis, August 2019: [slides](https://speakerdeck.com/joekarlsson/building-a-graphql-client-in-javascript)
- **MongoDB.local San Francisco 2020**, January 2020: [recording](https://www.youtube.com/watch?v=XsD2ZKqMbgo), [slides](https://speakerdeck.com/joekarlsson/getting-started-with-graphql-and-atlas-mongodb-local-sf-2020)
- **MongoDB World 2020**, online, June 2020: [recording](https://www.youtube.com/watch?v=7HczsHW7JA0)
- **A virtual React conference**, September 2020: [my recording with chapters](https://www.youtube.com/watch?v=87bPNnd6M7A)

At ConFoo Montreal in February 2020 I gave a related talk, Getting Started with GraphQL and Atlas. I also built GraphQL apps live on [Twitch in December 2018](https://www.youtube.com/watch?v=Z6vz07R2m0Y) and [January 2020](https://www.youtube.com/watch?v=xjd8NPs-yKI), and talked [MongoDB and GraphQL on React Wednesdays](https://www.youtube.com/watch?v=4jaS_7vCi9g) in December 2020.

## Slides and resources

- [Slides on Speaker Deck](https://speakerdeck.com/joekarlsson/building-a-graphql-client-in-javascript)
- [The MongoDB version's slides](https://speakerdeck.com/joekarlsson/getting-started-with-graphql-and-atlas-mongodb-local-sf-2020), from MongoDB.local San Francisco 2020
- [The InstaPosts demo on GitHub](https://github.com/JoeKarlsson/mongodb-graphql-demo), with Apollo and React
- [The Graphcool and Apollo demo on GitHub](https://github.com/JoeKarlsson/graphql-apollo-demo), from 2018
- [The 2018 workshop on GitHub](https://github.com/JoeKarlsson/graphql-workshop), with GraphQL, Mongoose and React
- [GraphQL's docs](https://graphql.org/learn/)
- [Apollo Client's docs](https://www.apollographql.com/docs/react/)
