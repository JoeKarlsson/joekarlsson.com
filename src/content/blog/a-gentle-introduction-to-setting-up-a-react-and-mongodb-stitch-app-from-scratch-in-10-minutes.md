---
title: 'How to Build a React and MongoDB App From Scratch In 10 Minutes'
date: 2019-04-02
slug: 'a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes'
description: 'Are you interested in learning how to build a React and MongoDB App? Like many of you, I have been interested in learning more about MongoDB’s cloud offerings and also not spending a dime. This guide...'
categories: ['Dev Tools', 'Databases']
tags: ['javascript', 'mongodb', 'react', 'reactJS', 'Stitch', 'tutorial']
heroImage: '/images/blog/a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes/A-Gentle-Introduction-To-Setting-Up-A-React-and-MongoDB-Stitch-App-From-Scratch-In-10-Minutes.webp'
---

Are you interested in learning how to build a React and MongoDB App? Like many of you, I have been interested in learning more about MongoDB’s cloud offerings and also not spending a dime. This guide is for the developer who only has 10 minutes to spare and who wants to learn a brand new tool from MongoDB.

![If this is your reaction, then this is the tutorial for you!](/images/blog/a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes/zIzh9CW5C3QCpRetsbKgxg.gif)_If this is your reaction, then this is the tutorial for you!_

## Okay, first of all, what is MongoDB Stitch? Well…

> [_MongoDB Stitch_](https://docs.mongodb.com/stitch/)_ is a cross-platform application on top of MongoDB. Stitch removes the need for tedious boilerplate when setting up a new app and automatically manages your app’s backend so you can focus on building what matters._

![Stitch sounds awesome, right?](/images/blog/a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes/ttg9ZoWbDPCV74ESDvmOHw.gif)_Stitch sounds awesome, right?_

## Setup MongoDB Atlas

Now that we have got that out of the way, let’s see if we can set up a new app in record time. For this tutorial, we will be setting up a to-do app.

> *Not*e: This tutorial does not touch all of the features of Stitch, it is intended to be a quickest possible way to explore the platform.

> You can find the source code for this tutorial here: https://github.com/JoeKarlsson/mongodb-stitch-todo-tutorial

- First things first, you will need to set up a [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas?jmp=docs).

> For additional information on setting up an Atlas account, check out the [MongoDB Atlas Creating an Atlas User Account guide](https://docs.atlas.mongodb.com/getting-started/#a-create-an-service-user-account).

- You will also need to set up a MongoDB cluster hosted on Atlas.

> You can create an M0 Atlas cluster for free. No credit card is required to get started.
> To get up and running with a **free** M0 cluster, follow the [MongoDB Atlas Getting Started guide](http://docs.atlas.mongodb.com/getting-started).

- Once you have initialized your new Atlas account and set up your free Atlas cluster, you will have to create a new Stitch Application.- First of all, make sure you are [logged into MongoDb Atlas](https://www.mongodb.com/cloud/atlas).- Click **Stitch Apps** in the left-hand navigation of the MongoDB Atlas console.

![MongoDB Atlas left navigation showing Stitch Apps option](/images/blog/a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes/eiuS-UB08oHnOgB3TWbzPg.webp)

- Click **Create New Application**.

![MongoDB Stitch Create New Application button](/images/blog/a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes/k74T_D89AdAMvi1pvGdQvA.webp)

- Give the application a name (e.g. **TodoTutorial**) and click **Create**.

![Naming a new Stitch application TodoTutorial](/images/blog/a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes/QZJMPVW-p9VfYKI52vdx5g.webp)

## Authentication

Wait for your application to initialize. Upon creation of your app, you will be redirected to the Stitch UI.

Once, your app has been initialized, you will need to turn on Anonymous Authentication.

> Note: MongoDB and Atlas come secure by default, this is why we need to do this step.

![MFW I authenticate to our todo app.](/images/blog/a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes/ydE3aIhH9ZRJdtJ7UGtgTw.gif)_MFW I authenticate to our todo app._

- From the **Getting Started** page of the Stitch UI, enable **Anonymous Authentication** under the **Turn On Authentication** heading.

![Turn on Anonymous Authentication](/images/blog/a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes/sAZhA2gZguBHloJQG5x7aA.webp)_Turn on Anonymous Authentication_

- Next, we will need to configure rules for the `todo` collection before Stitch will allow users to query it. To configure the collection:

- Click **Rules** under **MongoDB Atlas** in the left-hand navigation of the Stitch UI.

![Stitch UI left navigation showing Rules under MongoDB Atlas](/images/blog/a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes/JZ6jXYhaTsxkyO2oQfeaVw.webp)

Click **Add Collection**.

Enter `todos` for the **Database Name**. Enter `item` for the **Collection Name**and Select **No Template.** Then click **Add Collection**.

![Add Collection dialog with todos database and item collection](/images/blog/a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes/vgZ-OI69Q7IqPRLS4yB5Gg.webp)

You should now see the **Permissions** tab of the rules for the *`item`collection*, and the default role doesn’t allow any user to read or write to the collection.

To enable reading and writing to the `comments` collection:

- Click the **Read** and **Write** check boxes for the **default** role.- Click **Save**.

![Enabling Read and Write permissions for the default role](/images/blog/a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes/HvsC4xkKircXYDgQHUmrOQ.webp)

## Code

Okay! Now that we are done with setting up Atlas, and now we can get to the really fun part… building our app! In your terminal run:

```
$ npx create-react-app mongodb-stitch-tutorial
$ cd mongodb-stitch-tutorial
$ npm install mongodb-stitch-browser-sd
$ npm start
```

In `src/App.js` replace the App component with this code snippet and save. Be sure to replace the YOUR_APP_ID with your client app id.

```
import React, { Component } from "react";
import {
  Stitch,
  AnonymousCredential,
  RemoteMongoClient
} from "mongodb-stitch-browser-sdk";
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      todos: [],
      value: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.displayTodos = this.displayTodos.bind(this);
    this.addTodo = this.addTodo.bind(this);
  }

  componentDidMount() {
    // Initialize the App Client
    this.client = Stitch.initializeDefaultAppClient("YOUR_APP_ID");

    // Get a MongoDB Service Client
    // This is used for logging in and communicating with Stitch
    const mongodb = this.client.getServiceClient(
      RemoteMongoClient.factory,
      "mongodb-atlas"
    );

    // Get a reference to the todo database
    this.db = mongodb.db("todos");
    this.displayTodosOnLoad();
  }

  displayTodos() {
    // query the remote DB and update the component state
    this.db
      .collection("item")
      .find({}, { limit: 1000 })
      .asArray()
      .then(todos => {
        this.setState({todos});
      });
   }

  displayTodosOnLoad() {
    // Anonymously log in and display comments on load
    this.client.auth
      .loginWithCredential(new AnonymousCredential())
      .then(this.displayTodos)
      .catch(console.error);
  }

  addTodo(event) {
    event.preventDefault();
    const { value } = this.state;
    // insert the todo into the remote Stitch DB
    // then re-query the DB and display the new todos

    this.db
      .collection("item")
      .insertOne({
        owner_id: this.client.auth.user.id,
        item: value
      })
      .then(this.displayTodos)
      .catch(console.error);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

render() {
    return (

        <h3>This is a todo app</h3>

---


Add a Todo Item:

        <form onSubmit={this.addTodo}>
          <label>
            <input
              type="text"
              value={this.state.value}
              onChange={this.handleChange}
            />
          </label>
          <input type="submit" value="Submit" />
        </form>


          {/* Map over the todos from our remote DB */}
          {this.state.todos.map(todo => {
            return - {todo.item};
          })}



    );
  }
}

export default App;
```

## And that’s it!

![Completed React and MongoDB Stitch todo app demo](/images/blog/a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes/CKCcQ7cu4nfiv3tzrY2MQg.gif)

By the end, your app should look and work like this.

![By the end, your todo app should look like this](/images/blog/a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes/qHriJwRfw2mQXfpAPZ2VMQ.gif)_By the end, your todo app should look like this_

If you have any questions or comments, feel free to reach out or open an issue in the repo.

> You can find the source code for this tutorial here: https://github.com/JoeKarlsson/mongodb-stitch-todo-tutorial
