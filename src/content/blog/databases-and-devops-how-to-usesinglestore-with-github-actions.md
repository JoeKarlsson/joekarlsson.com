---
title: 'Databases and DevOps: How to Use SingleStore With GitHub Actions'
date: 2022-06-22
slug: 'databases-and-devops-how-to-usesinglestore-with-github-actions'
description: 'Databases are frequently not included when transforming an application and engineering culture toward a DevOps, or continuous deployment engineering organization. And, you could be forgiven for this...'
categories: ['Databases', 'Dev Tools']
heroImage: '/images/blog/databases-and-devops-how-to-usesinglestore-with-github-actions/img_blog_post_featured_use-singlestore-with-github-actions.webp'
heroAlt: 'Using SingleStore with GitHub Actions for database CI/CD'
tldr: 'Most teams skip the database in their CI/CD pipeline, and that is a mistake. I walk through best practices for database DevOps and show you how to set up SingleStore with GitHub Actions so your database deployments are automated on every push.'
---

Databases are frequently not included when transforming an application and engineering culture toward a DevOps, or continuous deployment engineering organization. And, you could be forgiven for this because setting up repeatable, fast, and up-to-date database environments for an application is really hard!

By not including the database in the pipeline, most of the work related to database changes ends up being manual, with the associated costs and risks. This also:

- This leads to a lack of traceability of database changes (changes history)

- Prevents applying Continuous Integration (CI) and Continuous Delivery (CD) good practices to a full extent

- Promotes fear of changes in the organization

This post is for developers who want to learn best practices for integrating databases into your DevOps organization. I'll also walk through how to set up an example [SingleStore](https://www.singlestore.com/) database in your DevOps pipeline using [GitHub Actions](https://github.com/features/actions).

You can also check out a [live stream](https://www.youtube.com/watch?v=dSeMOp5lXos) I did recently with [Rizel Scarlett](https://x.com/blackgirlbytes) from GitHub.

## What Are Technical Best Practices for Databases and DevOps?

First of all, let’s cover best practices for databases and DevOps. I think it’s important to cover since, to begin with, databases were never part of the original DevOps vision. That means as a practice, there is a general lack of culture and well-established processes around building databases into your pipeline. Here’s how it works.

### Test!

No brainer. You should be testing your databases every time you push. You need to make sure the components that house your data (aka gold), will not compromise or lose any data by not testing your builds thoroughly. I have seen databases neglected during testing - and often, it comes down to the job of a single developer who manually tests and deploys each build. It doesn’t need to be like that… Test!

### Developers need a way to easily create local databases

Right off the bat, it needs to be easy for everyone on the team to set up databases either locally, in a cloud sandbox environment or both! Here’s where containers come to the rescue. Containers are a good way to practice, they’re easy and cheap to set up, and most importantly, if something goes wrong you can throw everything out and start over again. Your team needs to easily develop in a non-shared environment to ensure everything is working correctly.

### The database schema - including all indexes - needs to be in source control

If developers need to create local builds of the database, that also means that all components that shape the database or control how it performs business logic need to be maintained using source control. Maintaining these changes can be simplified by making sure all changes are performed using migrations.

### Practice in a production-like environment

Everyone on the team should be able to develop and test out database code in a production-like database environment before pushing out changes. Trust me, you would rather have one of your developers topple over a staging environment than the production environment. This environment should also be simple to take down and set up again.

You need to test a change before applying it to a production environment. If the table data is huge - so huge that it would be costly to replicate it in a different environment from production - make sure you can at least simulate the change with a significant set of data. This will help ensure the change won’t take forever, and you won’t be blocking a table for a long period of time.

### Be sure to monitor database systems for performance and compliance

Did you know you can automate this? Like any good CI/CD pipeline, all the important business logic should be thoroughly tested and automated. This ensures that any changes you make to your database environment won’t break the build, your user’s trust or the law. Be sure that you are taking into account regional differences and regulatory requirements.

### Microservices are a good way to decouple the database

The only way other microservices interact with the data is by using the exposed methods from the service, rather than going directly to the database - even if it’s possible and “easier” to do it that way.

## Let’s get into the code

Now that we’ve discussed why you should be automating your database deployments, here’s a closer look at a practical example. In this guide, I’ll be showing you a workflow example that automates deployment of SingleStore using GitHub Actions every time you push up to GitHub. The workflow runs a script that connects to the SingleStore service, creates a table, and populates it with data. To test that the workflow creates and populates the SingleStore table, the script prints the data from the table to the console. This example only shows you how to get it set up, but I would encourage you to add tests based on this configuration that fit the unique needs of your team, requirements, and of course, your application.

Make sure you have git and a code editor that you are comfortable using. Personally, I would recommend that you check out [Visual Studio Code](https://code.visualstudio.com/) if you need one.

You can find all the [code](https://github.com/singlestore-labs/singlestore-and-github-actions-demo) needed for this demo, as well as [examples of how this works](https://github.com/singlestore-labs/singlestore-and-github-actions-demo/actions) on the GitHub repository.

### [SingleStore on GitHub Actions demo](https://github.com/singlestore-labs/singlestore-and-github-actions-demo/actions)

Before we can start writing code, we need to make sure that your environment is set up and ready to go. Make sure you clone this git repository to your machine

```bash
git clone https://github.com/singlestore-labs/singlestore-and-github-actions-demo.git
```

Next, you will need to [Sign up for a free SingleStore license](https://www.singlestore.com/cloud-trial/), and then copy it from the SingleStore [Customer Portal](https://portal.singlestore.com). This license allows you to run up to 4 nodes up to 32 gigs, each for free. Grab your license key from [the SingleStore portal](https://portal.singlestore.com/) and set it as an environment variable.

Note: You can totally set up automated deployments using SingleStoreDB Cloud if you would like. It’s good practice to run tests in a similar environment as your production environment. You will need to set up new clusters and you point your GitHub config file to these database instances, instead of the local container images.

Next, create an encrypted secret for your SINGLESTORE_LICENSE on your GitHub repository. In your [GitHub repository’s GitHub Actions secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets), be sure to add your license:

```bash
SINGLESTORE_LICENSE="paste your singlestore license here"
```

You can learn more about how to set up secrets for your [GitHub Actions in the GitHub Actions documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository).

Finally, run your GitHub actions by pushing your code to GitHub!

The [script](https://github.com/singlestore-labs/singlestoredb-dev-image#how-to-run-singlestoredb-in-github-actions) creates a new connection to the SingleStore service. The script creates a table and populates it with placeholder data. To test that the SingleStore database contains the data, the [script prints the contents of the table to the console log](https://github.com/singlestore-labs/singlestoredb-dev-image#how-to-run-singlestoredb-in-github-actions). When you run this workflow, you should see the following output in the “Connect to SingleStore” step, which confirms that you successfully created the SingleStore table and added data:

And that is it! Now you can relax and commit your code and migrations as the deployment process is carried out automatically, every time you push your code to your repository.

## Resources

- [Code for SingleStore and GitHub Actions Demo](https://github.com/singlestore-labs/singlestore-and-github-actions-demo)

- [Quickstart for GitHub Actions](https://docs.github.com/en/actions/quickstart)

- [Livestream: Databases and DevOps w/ Rizel Scarlett (GitHub)](https://www.youtube.com/watch?v=dSeMOp5lXos)
