---
title: 'A Gentle Introduction to Building Serverless Apps'
date: 2020-04-18
slug: 'a-gentle-introduction-to-building-serverless-apps'
description: 'Thanks for coming to my talk, A Gentle Introduction to Building Serverless Apps. Here you will find all the resources discussed during the talk. About Do you want to crank out features the business...'
categories: ['Dev Tools']
heroImage: '/images/blog/a-gentle-introduction-to-building-serverless-apps/A-Gentle-Introduction-to-Building-Serverless-Apps-with-MongoDB-Stitch-_-Serverless-MN.webp'
heroAlt: 'Title slide for A Gentle Introduction to Building Serverless Apps with MongoDB Stitch'
contentNotice: 'MongoDB Stitch was rebranded to Realm and fully discontinued in September 2024. This tutorial will not work with current MongoDB services.'
tldr: 'A beginner-friendly intro to serverless computing using MongoDB Stitch. The platform is now discontinued, but the serverless concepts still hold up.'
---

> **Note:** This talk was about MongoDB Stitch, which was later rebranded to MongoDB Realm and has since been fully discontinued (September 2024). The content is preserved here as a historical reference, but the platform and its features are no longer available.

Thanks for coming to my talk, A Gentle Introduction to Building Serverless Apps. Here you will find all the resources discussed during the talk.

## About

Do you want to crank out features the business wants, or spend a lot of time writing code and capacity planning for authentication, authorization, and complicated data access? Of course we all know the answer.

In this session will begin a beginner-friendly introduction to Serverless computing. We will then do a quick overview of the MongoDB ecosystem in the 3 major cloud providers for rapid application building. Then we will walk through a guided tutorial of how to use the MongoDB Stitch serverless platform to build your elastically scalable microservices based app within minutes, complete with end-user authentication and access rules, on a fully managed MongoDB cluster in your favorite cloud platform.

## Video

[Watch the talk on YouTube](https://www.youtube.com/watch?v=GZPQdzzj4n8)

## Slides

[View the slides on SpeakerDeck](https://speakerdeck.com/joekarlsson1/a-gentle-introduction-to-building-serverless-apps)

_20 Min Version_

## Outline

Introduction to Serverless

- What is serverless?
  - Devs don’t manage anything, except for their application code
  - Runs only when needed
  - Scales automagically
  - Pay per function execution-only
- Why it’s popular
  - No managing of infrastructure whatsoever.
  - No provisioning.
  - No patching.
  - No capacity planning.
  - No scaling.
- Sounds great - what’s the catch?
  - No control over infra can be bad - need to be warmed up servers
  - State is external
  - DevOps is still a thing
- When should you go Serverless?
  - Occasional Server needs on a static site
  - Variable traffic levels
  - Additional compute without extending the current system
  - Any web app that you want to be cheaper!
- Introduce Stitch
  - What is it?
    - A serverless platform that makes it easy to build modern, cross-platform apps with MongoDB
    - QueryAnywhere
    - Functions
    - Triggers
    - Mobile Sync
  - How does it compare to other providers?
    - Stitch actually can be used on any cloud platform! Flexibility to be co-located with a cloud provider of your choice means that there is no added network latency, and the boxes are tuned nicely to make sure MongoDB is humming along just fine.
    - MongoDB Stitch is designed to work with a broad set of applications. It is especially suitable if you plan on implementing most of your application’s logic in the frontend - with the backend focussed on accessing the database and other public or internal services.
    - If you have an existing MongoDB database, then Stitch can be used to safely and selectively expose your existing data to new applications.
- Guided Serverless Tutorial
  - Introduce Project
    - Tech stack
    - Architecture
  - Connecting
  - How to Query a DB
  - Serverless Function
  - Serverless triggers
- The future of serverless
  - The continued rise of abstraction
  - Cheaper, easy and performance bugs will be fixed
  - More services will have a Serverless option
  - MongoDB acquired Realm
- FAQ
  - Can I use this for free?
    - Yes! Stitch provides a free tier:
    - The first 25 GB of data transfer per month is free.
    - The minimum of 1,000,000 requests and 100,000 GB-seconds compute per month are free.
  - Do I have to use the GUI?
    - No, There is a CLI available
    - [Atlas Serverless Instances docs](https://docs.atlas.mongodb.com/tutorial/create-new-serverless-instance/)
  - Do I have to use JS to write serverless functions?
    - Yes
- Recap/Questions

## Related Links

- [MongoDB University](https://joekarlsson.dev/MongoDBUniversity)
- MongoDB Developer Hub (now discontinued)
- [MongoDB Community Forums](https://joekarlsson.dev/MongoDBCommunity)
- Realm Docs (now discontinued - the Realm/Stitch documentation is no longer available)
- My blog covering the app being built during this talk can be found here: [A Gentle Introduction to Setting Up a React and MongoDB Stitch App From Scratch in 10 Minutes](/blog/a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes/)
