---
title: "Databases and DevOps: How to Use SingleStore With GitHub Actions"
date: 2022-06-22
slug: "databases-and-devops-how-to-usesinglestore-with-github-actions"
description: "Databases are frequently not included when transforming an application and engineering culture toward a DevOps, or continuous deployment engineering organization. And, you could be forgiven for this..."
categories: ["Blog"]
heroImage: "/images/blog/databases-and-devops-how-to-usesinglestore-with-github-actions/img_blog_post_featured_use-singlestore-with-github-actions.png"
---

Databases are frequently not included when transforming an application and engineering culture toward a DevOps, or continuous deployment engineering organization. And, you could be forgiven for this because setting up repeatable, fast, and up-to-date database environments for an application is really hard!

By not including the database in the pipeline, most of the work related to database changes ends up being manual, with the associated costs and risks. This also:

- This leads to a lack of traceability of database changes (changes history)

- Prevents applying Continuous Integration (CI) and Continuous Delivery (CD) good practices to a full extent

- Promotes fear of changes in the organization

This post is for developers who want to learn best practices for integrating databases into your DevOps organization. We will also walk through how to set up an example [SingleStore](https://www.singlestore.com/) database in your DevOps pipeline using [GitHub Actions](https://github.com/features/actions).

You can also check out a [live stream](https://www.youtube.com/watch?v=dSeMOp5lXos) I did recently with [Rizel Scarlett](https://x.com/blackgirlbytes) from GitHub.

## What Are Technical Best Practices for Databases and DevOps?

First of all, let’s cover best practices for databases and DevOps. I think it’s important to cover since, to begin with, databases were never part of the original DevOps vision. That means as a practice, there is a general lack of culture and well-established processes around building databases into your pipeline. Alright, let’s jump in.

### Test!

No brainer. You should be testing your databases every time you push. You need to make sure the components that house your data (aka gold), will not compromise or lose any data by not testing your builds thoroughly. I have seen databases neglected when it comes to testing — and often, it comes down to the job of a single developer who manually tests and deploys each build. It doesn’t need to be like that… Test!

### Developers need a way to easily create local databases

Right off the bat, it needs to be easy for everyone on the team to set up databases either locally, in a cloud sandbox environment or both! Here’s where containers come to the rescue. Containers are a good way to practice, they’re easy and cheap to set up, and most importantly, if something goes wrong you can throw everything out and start over again. Your team needs to easily develop in a non-shared environment to ensure everything is working correctly.

### The database schema — including all indexes — needs to be in source control

If developers need to create local builds of the database, that also means that all components that shape the database or control how it performs business logic need to be maintained using source control. Maintaining these changes can be simplified by making sure all changes are performed using migrations.

### Practice in a production-like environment

Everyone on the team should be able to develop and test out database code in a production-like database environment before pushing out changes. Trust me, you would rather have one of your developers topple over a staging environment than the production environment. This environment should also be simple to take down and set up again.

You need to test a change before applying it to a production environment. If the table data is huge — so huge that it would be costly to replicate it in a different environment from production — make sure you can at least simulate the change with a significant set of data. This will help ensure the change won’t take forever, and you won’t be blocking a table for a long period of time.

### Be sure to monitor database systems for performance and compliance

Did you know you can automate this? Like any good CI/CD pipeline, all the important business logic should be thoroughly tested and automated. This ensures that any changes you make to your database environment won’t break the build, your user’s trust or the law. Be sure that you are taking into account regional differences and regulatory requirements.

### Microservices are a good way to decouple the database

The only way other microservices interact with the data is by using the exposed methods from the service, rather than going directly to the database — even if it’s possible and “easier” to do it that way.

## Let’s get into the code

Now that we’ve discussed why you should be automating your database deployments, let’s dig into a practical example. In this guide, I’ll be showing you a workflow example that automates deployment of SingleStore using GitHub Actions every time you push up to GitHub. The workflow runs a script that connects to the SingleStore service, creates a table, and populates it with data. To test that the workflow creates and populates the SingleStore table, the script prints the data from the table to the console. This example only shows you how to get it set up, but I would encourage you to add tests based on this configuration that fit the unique needs of your team, requirements, and of course, your application.

Make sure you have git and a code editor that you are comfortable using. Personally, I would recommend that you check out [Visual Studio Code](https://code.visualstudio.com/) if you need one.

You can find all the [code](https://github.com/singlestore-labs/singlestore-and-github-actions-demo) needed for this demo, as well as [examples of how this works](https://github.com/singlestore-labs/singlestore-and-github-actions-demo/actions) on our GitHub repository.

### [SingleStore on GitHub Actions demo](https://github.com/singlestore-labs/singlestore-and-github-actions-demo/actions)

Before we can start writing code, we need to make sure that your environment is set up and ready to go. Make sure you clone this git repository to your machine

```
git clone https://github.com/singlestore-labs/singlestore-and-github-actions-demo.git
```

Next, you will need to [Sign up for a free SingleStore license](https://www.singlestore.com/cloud-trial/), and then copy it from the SingleStore [Customer Portal](https://portal.singlestore.com). This license allows you to run up to 4 nodes up to 32 gigs, each for free. Grab your license key from [the SingleStore portal](https://portal.singlestore.com/) and set it as an environment variable.

Note: You can totally set up automated deployments using SingleStoreDB Cloud if you would like. In fact, it’s good practice to run tests in a similar environment as your production environment. You will need to set up new clusters and you point your GitHub config file to these database instances, instead of the local container images.

Next, create an encrypted secret for your SINGLESTORE_LICENSE on your GitHub repository. In your [GitHub repository’s GitHub Actions secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets), be sure to add your license:

```
SINGLESTORE_LICENSE="paste your singlestore license here"
```

You can learn more about how to set up secrets for your [GitHub Actions in the GitHub Actions documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository).

Finally, run your GitHub actions by pushing your code to GitHub!

The [script](https://github.com/singlestore-labs/singlestoredb-dev-image#how-to-run-singlestoredb-in-github-actions) creates a new connection to the SingleStore service. The script creates a table and populates it with placeholder data. To test that the SingleStore database contains the data, the [script prints the contents of the table to the console log](https://github.com/singlestore-labs/singlestoredb-dev-image#how-to-run-singlestoredb-in-github-actions). When you run this workflow, you should see the following output in the “Connect to SingleStore” step, which confirms that you successfully created the SingleStore table and added data:

And that is it! Now you can relax and commit your code and migrations as the deployment process is carried out automatically, every time you push your code to your repository.

## Resources:

- Code for SingleStore and GitHub Actions Demo – Databases and DevOps [https://github.com/singlestore-labs/singlestore-and-github-actions-demo](https://github.com/singlestore-labs/singlestore-and-github-actions-demo)

- Quickstart for GitHub Actions [https://docs.github.com/en/actions/quickstart](https://docs.github.com/en/actions/quickstart)

- [Livestream] Databases and DevOps w/ Rizel Scarlett (GitHub): [https://www.youtube.com/watch?v=dSeMOp5lXos](https://www.youtube.com/watch?v=dSeMOp5lXos)

---

## Follow Joe Karlsson on Social

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
</path></svg>Twitter](https://twitter.com/JoeKarlsson1)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M19.7,3H4.3C3.582,3,3,3.582,3,4.3v15.4C3,20.418,3.582,21,4.3,21h15.4c0.718,0,1.3-0.582,1.3-1.3V4.3 C21,3.582,20.418,3,19.7,3z M8.339,18.338H5.667v-8.59h2.672V18.338z M7.004,8.574c-0.857,0-1.549-0.694-1.549-1.548 c0-0.855,0.691-1.548,1.549-1.548c0.854,0,1.547,0.694,1.547,1.548C8.551,7.881,7.858,8.574,7.004,8.574z M18.339,18.338h-2.669 v-4.177c0-0.996-0.017-2.278-1.387-2.278c-1.389,0-1.601,1.086-1.601,2.206v4.249h-2.667v-8.59h2.559v1.174h0.037 c0.356-0.675,1.227-1.387,2.526-1.387c2.703,0,3.203,1.779,3.203,4.092V18.338z"></path></svg>LinkedIn](https://www.linkedin.com/in/joekarlsson/)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12,2C6.477,2,2,6.477,2,12c0,4.419,2.865,8.166,6.839,9.489c0.5,0.09,0.682-0.218,0.682-0.484 c0-0.236-0.009-0.866-0.014-1.699c-2.782,0.602-3.369-1.34-3.369-1.34c-0.455-1.157-1.11-1.465-1.11-1.465 c-0.909-0.62,0.069-0.608,0.069-0.608c1.004,0.071,1.532,1.03,1.532,1.03c0.891,1.529,2.341,1.089,2.91,0.833 c0.091-0.647,0.349-1.086,0.635-1.337c-2.22-0.251-4.555-1.111-4.555-4.943c0-1.091,0.39-1.984,1.03-2.682 C6.546,8.54,6.202,7.524,6.746,6.148c0,0,0.84-0.269,2.75,1.025C10.295,6.95,11.15,6.84,12,6.836 c0.85,0.004,1.705,0.114,2.504,0.336c1.909-1.294,2.748-1.025,2.748-1.025c0.546,1.376,0.202,2.394,0.1,2.646 c0.64,0.699,1.026,1.591,1.026,2.682c0,3.841-2.337,4.687-4.565,4.935c0.359,0.307,0.679,0.917,0.679,1.852 c0,1.335-0.012,2.415-0.012,2.741c0,0.269,0.18,0.579,0.688,0.481C19.138,20.161,22,16.416,22,12C22,6.477,17.523,2,12,2z"></path></svg>GitHub](https://github.com/JoeKarlsson)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12,4.622c2.403,0,2.688,0.009,3.637,0.052c0.877,0.04,1.354,0.187,1.671,0.31c0.42,0.163,0.72,0.358,1.035,0.673 c0.315,0.315,0.51,0.615,0.673,1.035c0.123,0.317,0.27,0.794,0.31,1.671c0.043,0.949,0.052,1.234,0.052,3.637 s-0.009,2.688-0.052,3.637c-0.04,0.877-0.187,1.354-0.31,1.671c-0.163,0.42-0.358,0.72-0.673,1.035 c-0.315,0.315-0.615,0.51-1.035,0.673c-0.317,0.123-0.794,0.27-1.671,0.31c-0.949,0.043-1.233,0.052-3.637,0.052 s-2.688-0.009-3.637-0.052c-0.877-0.04-1.354-0.187-1.671-0.31c-0.42-0.163-0.72-0.358-1.035-0.673 c-0.315-0.315-0.51-0.615-0.673-1.035c-0.123-0.317-0.27-0.794-0.31-1.671C4.631,14.688,4.622,14.403,4.622,12 s0.009-2.688,0.052-3.637c0.04-0.877,0.187-1.354,0.31-1.671c0.163-0.42,0.358-0.72,0.673-1.035 c0.315-0.315,0.615-0.51,1.035-0.673c0.317-0.123,0.794-0.27,1.671-0.31C9.312,4.631,9.597,4.622,12,4.622 M12,3 C9.556,3,9.249,3.01,8.289,3.054C7.331,3.098,6.677,3.25,6.105,3.472C5.513,3.702,5.011,4.01,4.511,4.511 c-0.5,0.5-0.808,1.002-1.038,1.594C3.25,6.677,3.098,7.331,3.054,8.289C3.01,9.249,3,9.556,3,12c0,2.444,0.01,2.751,0.054,3.711 c0.044,0.958,0.196,1.612,0.418,2.185c0.23,0.592,0.538,1.094,1.038,1.594c0.5,0.5,1.002,0.808,1.594,1.038 c0.572,0.222,1.227,0.375,2.185,0.418C9.249,20.99,9.556,21,12,21s2.751-0.01,3.711-0.054c0.958-0.044,1.612-0.196,2.185-0.418 c0.592-0.23,1.094-0.538,1.594-1.038c0.5-0.5,0.808-1.002,1.038-1.594c0.222-0.572,0.375-1.227,0.418-2.185 C20.99,14.751,21,14.444,21,12s-0.01-2.751-0.054-3.711c-0.044-0.958-0.196-1.612-0.418-2.185c-0.23-0.592-0.538-1.094-1.038-1.594 c-0.5-0.5-1.002-0.808-1.594-1.038c-0.572-0.222-1.227-0.375-2.185-0.418C14.751,3.01,14.444,3,12,3L12,3z M12,7.378 c-2.552,0-4.622,2.069-4.622,4.622S9.448,16.622,12,16.622s4.622-2.069,4.622-4.622S14.552,7.378,12,7.378z M12,15 c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S13.657,15,12,15z M16.804,6.116c-0.596,0-1.08,0.484-1.08,1.08 s0.484,1.08,1.08,1.08c0.596,0,1.08-0.484,1.08-1.08S17.401,6.116,16.804,6.116z"></path></svg>Instagram](https://www.instagram.com/joekarlsson/)

- [<svg width="24" height="24" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M16.708 0.027c1.745-0.027 3.48-0.011 5.213-0.027 0.105 2.041 0.839 4.12 2.333 5.563 1.491 1.479 3.6 2.156 5.652 2.385v5.369c-1.923-0.063-3.855-0.463-5.6-1.291-0.76-0.344-1.468-0.787-2.161-1.24-0.009 3.896 0.016 7.787-0.025 11.667-0.104 1.864-0.719 3.719-1.803 5.255-1.744 2.557-4.771 4.224-7.88 4.276-1.907 0.109-3.812-0.411-5.437-1.369-2.693-1.588-4.588-4.495-4.864-7.615-0.032-0.667-0.043-1.333-0.016-1.984 0.24-2.537 1.495-4.964 3.443-6.615 2.208-1.923 5.301-2.839 8.197-2.297 0.027 1.975-0.052 3.948-0.052 5.923-1.323-0.428-2.869-0.308-4.025 0.495-0.844 0.547-1.485 1.385-1.819 2.333-0.276 0.676-0.197 1.427-0.181 2.145 0.317 2.188 2.421 4.027 4.667 3.828 1.489-0.016 2.916-0.88 3.692-2.145 0.251-0.443 0.532-0.896 0.547-1.417 0.131-2.385 0.079-4.76 0.095-7.145 0.011-5.375-0.016-10.735 0.025-16.093z" /></svg>TikTok](https://www.tiktok.com/@joekarlsson)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M21.8,8.001c0,0-0.195-1.378-0.795-1.985c-0.76-0.797-1.613-0.801-2.004-0.847c-2.799-0.202-6.997-0.202-6.997-0.202 h-0.009c0,0-4.198,0-6.997,0.202C4.608,5.216,3.756,5.22,2.995,6.016C2.395,6.623,2.2,8.001,2.2,8.001S2,9.62,2,11.238v1.517 c0,1.618,0.2,3.237,0.2,3.237s0.195,1.378,0.795,1.985c0.761,0.797,1.76,0.771,2.205,0.855c1.6,0.153,6.8,0.201,6.8,0.201 s4.203-0.006,7.001-0.209c0.391-0.047,1.243-0.051,2.004-0.847c0.6-0.607,0.795-1.985,0.795-1.985s0.2-1.618,0.2-3.237v-1.517 C22,9.62,21.8,8.001,21.8,8.001z M9.935,14.594l-0.001-5.62l5.404,2.82L9.935,14.594z"></path></svg>YouTube](https://www.youtube.com/c/JoeKarlsson)

## Want to Learn More About Joe Karlsson?

- [https://www.joekarlsson.com/about/](https://www.joekarlsson.com/about/)

- [https://www.joekarlsson.com/speaking/](https://www.joekarlsson.com/speaking/)

## 

<p>
