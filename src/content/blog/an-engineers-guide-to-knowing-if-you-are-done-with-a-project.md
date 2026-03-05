---
title: 'An Engineers Guide to Knowing if You Are Done With a Project'
date: 2018-11-14
slug: 'an-engineers-guide-to-knowing-if-you-are-done-with-a-project'
description: 'Have you ever started a project and thought to yourself, “When can I call this done?” Then this listicle is for you! This guide is intended to be a general list of things your personal or...'
categories: ['Career']
heroImage: '/images/blog/an-engineers-guide-to-knowing-if-you-are-done-with-a-project/1_FShMf6oFa8kkaj6q_e9vWQ.webp'
heroAlt: 'Checklist for determining when an engineering project is complete'
contentNotice: false
tldr: 'A checklist I give my engineering team covering everything from test coverage to accessibility audits to help answer the question "when is this project actually done?"'
---

Have you ever started a project and thought to yourself, “When can I call this done?” Then this listicle is for you! This guide is intended to be a general list of things your personal or professional project should include in order for you to be “finished.” It’s something I distribute to my team of professional engineers to help them know when they are done. You or your team might have different standards of what it means to be complete, and that’s totally fine with me. One of the new engineers on my team actually asked me for this list and I started looking around online for something like this, and I found nothing, so here is my attempt to rectify that.

It might be helpful to describe the structure of the team we work with. If you do not have a dedicated person on your team, just substitute yourself in the do the work.

I intend for all of these items to be negotiated and communicated to the Product Owners at the onset of every project. When the business requests a new feature, I consider it my job to ensure that it works, is stable, and will provide a positive experience for its users. In order to accomplish this, all of these tasks need to be completed.
It should also be noted that these items are not on a firm list. The order in which they are finished and if they need to finish at all is up to the discretion of the tech lead. With that being said, here’s the full list.

- **Does the code work?** Duh - this is the most important thing. I would recommend trying to figure out what your minimum viable product (MVP) for your app looks like early. If it’s not clear to you try asking “How do I know I’m done?” this will usually help you clarify requirements early. If you can figure out what the smallest possible product is, you can deliver quickly and iterate. It’s easy to go crazy adding features and never actually go to production with your app, in our world, we must edit ourselves and the application to become something manageable. Once the product has been released, you can use user research and analytics to determine what your next features will be.

- **Does the code have test coverage greater than 85%?** All of our code must have a minimum code coverage of 85%, but we prefer to be in the 90% if possible. Code coverage is a tricky subject and it means different things to different people, however, I ask my team to produce quality tests that are modular and test the business features of our apps. I am not dogmatic about following TDD, but before you call your project complete, you must have met our minimum code quality standards.

- **Does your application include End to End tests?** In addition, to have unit and integration tests, all repositories must have end-to-end tests set up to run locally, and in production. This allows us to easily setup automated tests and make sure that the feature is being integrated into the site correctly.

- **Have you written a README.md for your repository?** A common problem is large organizations is having crummy documentation around running code. Each repo should include steps to get it running locally, who to contact if something breaks, and steps for deploying your application. A complete list of items can be found in your team's project checklist.

- **Have you integrated analytics tags/events?** Since we are a data-driven organization, all features we develop should have analytics events tied to it. This allows us to more easily track the adoption and use of our features.

- **Have you set up A|B tests for your application?** If you’re developing a brand new feature for the site, we always run A|B tests to determine how effective the new feature is. We are a data-driven organization and we use this data to help understand how effective the work we do actually is.

- **Have you had a UX Design Audit?** Before you release, meet with the UX designer who created the design for the page. The designer will be able to catch any of the elements that do not match the design specs. I also find that the designer is able to catch sloppy margin and sizing issues. This step can take a very long time, but it is worth it for you to produce a professional quality application. Even if you have the fanciest, most complicated algorithms in the world, a sloppy UI will leave your users with the impression that you have a low-quality application. This step is important.

- **Do you have automated regression (End to End) tests?** Running manual tests is expensive and time-consuming, we need to have automated tests setup to check that we haven’t inadvertently broken some other feature on our site. Using automated end to end tests also is 100% necessary to introducing a continuous development pipeline that we can be confident in.

- **Has QA run manual regression tests on your application?** Even if you have 100% test coverage and your application has fully automated end to end tests, YOU STILL NEED MANUAL REGRESSION TESTING. A common trap I see many sites falling into is fully automating their application, then terminating their QA staff. A manual QA regression test is no replacement for automation, you need both, and you need to complete this step (many times) before you are done with your project.

- **Have you had an accessibility audit?** I understand that many teams do not have a dedicated accessibility lead, but we do! It’s important to us to have a site that is easy for impaired and disabled individuals can still easily use. The old saying “We will all be disabled one day,” is true, and we have an opportunity to help make the web a better place for everybody by performing accessibility audits.

- **Have you run performance tests on your app?** Front end and back end performance tests are a must if you are including features that might not scale well or if you are nervous about scalability. We don’t need this step for every feature and every page, BUT we should run regular performance audits on our components. This is necessary to ensure that our applications can scale up and meet the demand of Power Week (the week leading up to and after Black Friday). We want to be sure that our applications are built well enough to not crash bestbuy.com during the intense surge of traffic we see during Power Week.

- **Is your feature accessible in STAGE or PROD yet?** Lastly, is your feature in production yet? If not, you are not done. Make sure that all of the previous steps are complete before getting here. But if you have run your feature through the wringer and it’s been battle tested, then you should be ready for production and you should be done. Congrats on finishing your brand new feature!

This list is most likely overkill for all personal projects and probably for most software projects, but we are working on a highly trafficked customer-facing site, and we want our users to have a great experience every time they come to use our platform. Did I miss anything? I'd love to hear how your team handles this.
