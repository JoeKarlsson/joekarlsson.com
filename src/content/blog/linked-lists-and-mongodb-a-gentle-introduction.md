---
title: 'Linked Lists and MongoDB: A Gentle Introduction'
date: 2020-11-03
slug: 'linked-lists-and-mongodb-a-gentle-introduction'
description: 'Are you new to data structures and algorithms? In this post, you will learn about one of the most important data structures in Computer Science, the Linked List, implemented with a MongoDB twist....'
categories: ['Databases']
heroImage: '/images/blog/linked-lists-and-mongodb-a-gentle-introduction/ATF_Linked-Lists.webp'
---

Are you new to data structures and algorithms? In this post, you will learn about one of the most important data structures in Computer Science, the Linked List, implemented with a MongoDB twist. This post will cover the fundamentals of the linked list data structure. It will also answer questions like, “How do linked lists differ from arrays?” and “What are the pros and cons of using a linked list?”

## Intro to Linked Lists

Did you know that linked lists are one of the foundational data structures in Computer Science? If you are like many devs that are self-taught or you graduated from a developer boot camp, then you might need a little lesson in how this data structure works. Or, if you’re like me, you might need a refresher if it’s been a couple of years since your last Computer Science lecture on data structures and algorithms. In this post, I will be walking through how to implement a linked list from scratch using Node.js and MongoDB. This is also a great place to start for getting a handle on the basics of MongoDB CRUD operations and this legendary data structure. Let’s get started with the basics.

![Diagram of a singly linked list](/images/blog/linked-lists-and-mongodb-a-gentle-introduction/linked-list-diagram-1024x316.webp)_Diagram of a singly linked list_

A linked list is a data structure that contains a list of nodes that are connected using references or pointers. A node is an object in memory. It usually contains at most two pieces of information, a data value, and a pointer to next node in the linked list. Linked lists also have separate pointer references to the head and the tail of the linked list. The head is the first node in the list, while the tail is the last object in the list.

A node that does NOT link to another node

```
{
   "data": "Cat",
   "next": null
}
```

A node that DOES link to another node

```
{
   "data": "Cat",
   "next": {
      "data": "Dog",
      "next": {
         "data": "Bird",
         "next": null
      }
   } // these are really a reference to an object in memory
}
```

## Why Use a Linked List?

There are a lot of reasons why linked lists are used, as opposed to other data structures like arrays (more on that later). However, we use linked lists in situations where we don’t know the exact size of the data structure but anticipate that the list could potentially grow to large sizes. Often, linked lists are used when we think that the data structure might grow larger than the available memory of the computer we are working with. Linked lists are also useful if we still need to preserve order AND anticipate that order will change over time.

Linked lists are just objects in memory. One object holds a reference to another object, or one node holds a pointer to the next node. In memory, a linked list looks like this:

![Diagram that demonstrates how linked lists allocate use pointers to link data in memory](/images/blog/linked-lists-and-mongodb-a-gentle-introduction/linked-list-memory-space-1-1024x679.webp)_Diagram that demonstrates how linked lists allocate use pointers to link data in memory_

### Advantages of Linked Lists

- Linked lists are dynamic in nature, which allocates the memory when required.

- Insertion and deletion operations can be easily implemented.

- Stacks and queues can be easily executed using a linked list.

### Disadvantages of Linked Lists

- Memory is wasted as pointers require extra memory for storage.

- No element can be accessed randomly; it has to access each node sequentially starting from the head.

- Reverse traversing is difficult in a singly linked list.

## Comparison Between Arrays and Linked Lists

Now, you might be thinking that linked lists feel an awful lot like arrays, and you would be correct! They both keep track of a sequence of data, and they both can be iterated and looped over. Also, both data structures preserve sequence order. However, there are some key differences.

### Advantages of Arrays

- Arrays are simple and easy to use.

- They offer faster access to elements (O(1) or constant time).

- They can access elements by any index without needing to iterate through the entire data set from the beginning.

### Disadvantages of Arrays

- Did you know that arrays can waste memory? This is because typically, compilers will preallocate a sequential block of memory when a new array is created in order to make super speedy queries. Therefore, many of these preallocated memory blocks may be empty.

- Arrays have a fixed size. If the preallocated memory block is filled to capacity, the code compiler will allocate an even larger memory block, and it will need to copy the old array over to the new array memory block before new array operations can be performed. This can be expensive with both time and space.

![A diagram that demonstrates how arrays allocate contiguous blocks of memory space](/images/blog/linked-lists-and-mongodb-a-gentle-introduction/array-memory-space-1-1024x534.webp)_A diagram that demonstrates how arrays allocate contiguous blocks of memory space_

![A diagram that demonstrates how linked lists allocate memory for new linked list nodes](/images/blog/linked-lists-and-mongodb-a-gentle-introduction/linked-list-memory-space-2-1024x535.webp)_A diagram that demonstrates how linked lists allocate memory for new linked list nodes_

- To insert an element at a given position, operation is complex. We may need to shift the existing elements to create vacancy to insert the new element at desired position.

## Other Types of Linked Lists

### Doubly Linked List

A doubly linked list is the same as a singly linked list with the exception that each node also points to the previous node as well as the next node.

![Diagram of a doubly-linked list](/images/blog/linked-lists-and-mongodb-a-gentle-introduction/doubley-linked-list-diagram-1024x182.webp)_Diagram of a doubly-linked list_

### Circular Linked List

A circular linked list is the same as a singly linked list with the exception that there is no concept of a head or tail. All nodes point to the next node circularly. There is no true start to the circular linked list.

![Diagram of a circular linked list](/images/blog/linked-lists-and-mongodb-a-gentle-introduction/circular-linked-list-diagram-1024x247.webp)_Diagram of a circular linked list_

## Let’s Code A Linked List with MongoDB!

### First, Let’s Set Up Our Coding Environment

#### Creating A Cluster On Atlas

The first thing we will need to set up is a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account. And don’t worry, you can create an M0 MongoDB Atlas cluster for free. No credit card is required to get started! To get up and running with a free M0 cluster, follow the [MongoDB Atlas Getting Started guide](https://docs.atlas.mongodb.com/getting-started/).

After signing up for Atlas, we will then need to deploy a free MongoDB cluster. Note, you will need to add a rule to [allow the IP address of the computer we are connecting to MongoDB Atlas Custer](https://docs.atlas.mongodb.com/tutorial/whitelist-connection-ip-address/) too, and you will need to [create a database user](https://docs.atlas.mongodb.com/tutorial/create-mongodb-user-for-cluster/) before you are able to connect to your new cluster. These are security features that are put in place to make sure bad actors cannot access your database.

If you have any issues connecting or setting up your free MongoDB Atlas cluster, be sure to check out the [MongoDB Community Forums](https://developer.mongodb.com/community/forums/) to get help.

#### Connect to VS Code MongoDB Plugin

Next, we are going to connect to our new MongoDB Atlas database cluster using the [Visual Studio Code MongoDB Plugin](https://marketplace.visualstudio.com/items?itemName=mongodb.mongodb-vscode). The MongoDB extension allow us to:

- Connect to a MongoDB or Atlas cluster, navigate through your databases and collections, get a quick overview of your schema, and see the documents in your collections.

- Create MongoDB Playgrounds, the fastest way to prototype CRUD operations and MongoDB commands.

- Quickly access the MongoDB Shell, to launch the MongoDB Shell from the command palette and quickly connect to the active cluster.

To install MongoDB for VS Code, simply search for it in the Extensions list directly inside VS Code or head to the [“MongoDB for VS Code” homepage](https://marketplace.visualstudio.com/items?itemName=mongodb.mongodb-vscode) in the VS Code Marketplace.

#### Navigate Your MongoDB Data

MongoDB for VS Code can connect to MongoDB standalone instances or clusters on MongoDB Atlas or self-hosted. Once connected, you can **browse databases**, **collections**, and **read-only views** directly from the tree view.

For each collection, you will see a list of sample documents and a **quick overview of the schema**. This is very useful as a reference while writing queries and aggregations.

Once installed, there will be a new MongoDB tab that we can use to add our connections by clicking “Add Connection.” If you’ve used MongoDB Compass before, then the form should be familiar. You can enter your connection details in the form or use a connection string. I went with the latter, as my database is hosted on MongoDB Atlas.

To obtain your connection string, navigate to your “Clusters” page and select “Connect.”

Choose the “Connect using MongoDB Compass” option and copy the connection string. Make sure to add your username and password in their respective places before entering the string in VS Code.

Once you’ve connected successfully, you should see an alert. At this point, you can explore the data in your cluster, as well as your schemas.

#### Creating Functions to Initialize the App

Alright, now that we have been able to connect to our MongoDB Atlas database, let’s write some code to allow our linked list to connect to our database and to do some cleaning while we are developing our linked list.

The general strategy for building our linked lists with MongoDB will be as follows:

- Use a MongoDB document to keep track of meta information, like the head and tail location.

- Each node in the Linked List will also use a unique MongoDB document for each node in our linked list.

- We will be using the unique IDs that are automatically generated by MongoDB to simulate a pointer. So the _next_ value of each linked list node will store the ID of the next node in the linked list. That way, we will be able to iterate through our Linked List.

So, in order to accomplish this, the first thing that we are going to do is set up our linked list class.

```
const MongoClient = require("mongodb").MongoClient;

// Define a new Linked List class
class LinkedList {

   constructor() {}

   // Since the constructor cannot be an asynchronous function,
   // we are going to create an async `init` function that connects to our MongoDB
   // database.
   // Note: You will need to replace the URI here with the one
   // you get from your MongoDB Cluster. This is the same URI
   // that you used to connect the MongoDB VS Code plugin to our cluster.
   async init() {
      const uri = "PASTE YOUR ATLAS CLUSTER URL HERE";
      this.client = new MongoClient(uri, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
      });

      try {
         await this.client.connect();
         console.log("Connected correctly to server");
         this.col = this.client
            .db("YOUR DATABASE NAME HERE")
            .collection("YOUR COLLECTION NAME HERE");
      } catch (err) {
         console.log(err.stack);
      }
   }
}

// We are going to create an immediately invoked function expression (IFEE)
// in order for us to immediately test and run the linked list class defined above.
(async function () {
   try {
      const linkedList = new LinkedList();
      await linkedList.init();
      linkedList.resetMeta();
      linkedList.resetData();
   } catch (err) {
      // Good programmers always handle their errors
      console.log(err.stack);
   }
})();
```

Next, let’s create some helper functions to reset our DB every time we run the code so our data doesn’t become cluttered with old data.

```
// This function will be responsible for cleaning up our metadata
// function everytime we reinitialize our app.
async resetMeta() {
   await this.col.updateOne(
      { meta: true },
      { $set: { head: null, tail: null } },
      { upsert: true }
   );
}

// Function to clean up all our Linked List data
async resetData() {
   await this.col.deleteMany({ value: { $exists: true } });
}
```

Now, let’s write some helper functions to help us query and update our meta-document.

```
// This function will query our collection for our single
// meta data document. This document will be responsible
// for tracking the location of the head and tail documents
// in our Linked List.
async getMeta() {
   const meta = await this.col.find({ meta: true }).next();
   return meta;
}

// points to our head
async getHeadID() {
   const meta = await this.getMeta();
   return meta.head;
}

// Function allows us to update our head in the
// event that the head is changed
async setHead(id) {
   const result = await this.col.updateOne(
      { meta: true },
      { $set: { head: id } }
   );
   return result;
}

// points to our tail
async getTail(data) {
   const meta = await this.getMeta();
   return meta.tail;
}

// Function allows us to update our tail in the
// event that the tail is changed
async setTail(id) {
   const result = await this.col.updateOne(
      { meta: true },
      { $set: { tail: id } }
   );
   return result;
}

// Create a brand new linked list node
async newNode(value) {
   const newNode = await this.col.insertOne({ value, next: null });
   return newNode;
}
```

### Add A Node

The steps to add a new node to a linked list are:

- Add a new node to the current tail.

- Update the current tails next to the new node.

- Update your linked list to point tail to the new node.

```
// Takes a new node and adds it to our linked lis
async add(value) {
   const result = await this.newNode(value);
   const insertedId = result.insertedId;

   // If the linked list is empty, we need to initialize an empty linked list
   const head = await this.getHeadID();
   if (head === null) {
      this.setHead(insertedId);
   } else {
      // if it's not empty, update the current tail's next to the new node
      const tailID = await this.getTail();
      await this.col.updateOne({ _id: tailID }, { $set: { next: insertedId } });
   }
   // Update your linked list to point tail to the new node
   this.setTail(insertedId);
   return result;
}
```

### Find A Node

In order to traverse a linked list, we must start at the beginning of the linked list, also known as the head. Then, we follow each _next_ pointer reference until we come to the end of the linked list, or the node we are looking for. It can be implemented by using the following steps:

- Start at the head node of your linked list.

- Check if the value matches what you’re searching for. If found, return that node.

- If not found, move to the next node via the current node’s next property.

- Repeat until next is null (tail/end of list).

```
// Reads through our list and returns the node we are looking for
async get(index) {
   // If index is less than 0, return false
   if (index <= -1) {
      return false;
   }
   let headID = await this.getHeadID();
   let postion = 0;
   let currNode = await this.col.find({ _id: headID }).next();

   // Loop through the nodes starting from the head
   while (postion < index) {
      // Check if we hit the end of the linked list
      if (currNode.next === null) {
         return false;
      }

      // If another node exists go to next node
      currNode = await this.col.find({ _id: currNode.next }).next();
      postion++;
   }
   return currNode;
}
```

### Delete A Node

Now, let’s say we want to remove a node from our linked list. In order to do this, we must again keep track of the previous node so that we can update the previous node’s _next_ pointer reference to the node that is being deleted _next_ value is pointing to. Or to put it another way:

- Find the node you are searching for and keep track of the previous node.

- When found, update the previous nodes next to point to the next node referenced by the node to be deleted.

- Delete the found node from memory.

![A diagram that demonstrates how linked lists remove a node from a linked list by moving pointer references](/images/blog/linked-lists-and-mongodb-a-gentle-introduction/remove-node-1024x497.webp)_A diagram that demonstrates how linked lists remove a node from a linked list by moving pointer references_

```
// reads through our list and removes desired node in the linked list
async remove(index) {
   const currNode = await this.get(index);
   const prevNode = await this.get(index - 1);

   // If index not in linked list, return false
   if (currNode === false) {
      return false;
   }

   // If removing the head, reassign the head to the next node
   if (index === 0) {
      await this.setHead(currNode.next);

   // If removing the tail, reassign the tail to the prevNode
   } else if (currNode.next === null) {
      await this.setTail(prevNode._id);
      await this.col.updateOne(
         { _id: prevNode._id },
         { $set: { next: currNode.next } }
      );

   // update previous node's next to point to the next node referenced by node to be deleted
   } else {
      await this.col.updateOne(
         { _id: prevNode._id },
         { $set: { next: currNode.next } }
      );
   }

   // Delete found node from memory
   await this.col.deleteOne({
      _id: currNode._id,
   });

   return true;
}
```

### Insert A Node

The following code inserts a node after an existing node in a singly linked list. Inserting a new node before an existing one cannot be done directly; instead, one must keep track of the previous node and insert a new node after it. We can do that by following these steps:

- Find the position/node in your linked list where you want to insert your new node after.

- Update the next property of the new node to point to the node that the target node currently points to.

- Update the next property of the node you want to insert after to point to the new node.

![Diagram that demonstrates how a linked list inserts a new node by moving pointer references](/images/blog/linked-lists-and-mongodb-a-gentle-introduction/insert-a-new-node-1024x1024.webp)_Diagram that demonstrates how a linked list inserts a new node by moving pointer references_

```
// Inserts a new node at the deisred index in the linked list
async insert(value, index) {
   const currNode = await this.get(index);
   const prevNode = await this.get(index - 1);
   const result = await this.newNode(value);
   const node = result.ops[0];

   // If the index is not in the linked list, return false
   if (currNode === false) {
      return false;
   }

   // If inserting at the head, reassign the head to the new node
   if (index === 0) {
      await this.setHead(node._id);
      await this.col.updateOne(
         { _id: node._id },
         { $set: { next: currNode.next } }
      );
   } else {
      // If inserting at the tail, reassign the tail
      if (currNode.next === null) {
         await this.setTail(node._id);
      }

      // Update the next property of the new node
      // to point to the node that the target node currently points to
      await this.col.updateOne(
         { _id: prevNode._id },
         { $set: { next: node._id } }
      );

      // Update the next property of the node you
      // want to insert after to point to the new node
      await this.col.updateOne(
         { _id: node._id },
         { $set: { next: currNode.next } }
      );
   }
   return node;
}
```

## Summary

Many developers want to learn the fundamental Computer Science data structures and algorithms or get a refresher on them. In this author’s humble opinion, the best way to learn data structures is by implementing them on your own. This exercise is a great way to learn data structures as well as learn the fundamentals of MongoDB CRUD operations. If you want to learn more about how to structure your data in MongoDB beyond linked lists, check out my talk on [MongoDB schema design best practices](/blog/mongodb-schema-design-best-practices/).

> When you’re ready to implement your own linked list in MongoDB, check out [MongoDB Atlas](http://bit.ly/MDB_Atlas), MongoDB’s fully managed database-as-a-service. Atlas is the easiest way to get started with MongoDB and has a generous, forever-free tier.

If you want to learn more about linked lists and MongoDB, be sure to check out these resources.
