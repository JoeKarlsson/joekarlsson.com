---
title: 'Complete Guide To Node Client-Server Communication'
date: 2016-07-23
slug: 'complete-guide-node-client-server-communication'
description: 'After reading High-Performance Browser Networking by Ilya Grigorik, I was inspired to implement all of the client-server communication techniques outlined in his book in Node and JavaScript. This...'
categories: ['Dev Tools']
heroImage: '/images/blog/complete-guide-node-client-server-communication/Mom.webp'
heroAlt: 'Diagram of client-server communication architecture'
---

> **Note:** This post was written in 2016. The core concepts of client-server communication (WebSockets, SSE, XHR) are still relevant, but the code examples use outdated patterns (CommonJS `require()`, `var`, deprecated `util.puts()`). For modern Node.js, use ES modules and the Fetch API.

After reading [High-Performance Browser Networking](http://chimera.labs.oreilly.com/books/1230000000545/index.html) by Ilya Grigorik, I was inspired to implement all of the client-server communication techniques outlined in his book in Node and JavaScript. This post covers the following forms of client-server connection:

- XMLHttpRequest
- Server-Sent Events
- WebSocket
- HTTP/2
- Server to server

You can check out the complete source code for each implementation [here](https://github.com/JoeKarlsson1/Complete_Guide_To_Client_Server_Communication).

Before we begin, I should note that there is no one best protocol or API for client/server communication. Every non-trivial application will require a mix of different transports based on a variety of requirements: interaction with the browser cache, protocol overhead, message latency, reliability, type of data transfer, and more. Some protocols may offer low-latency delivery (e.g., Server-Sent Events, WebSocket), but may not meet other important criteria, such as the ability to use the browser cache or support efficient binary transfers in all cases. Here is a visualization to help illustrate how XHR, SSE, and WebSockets differ in their implementations.

![Comparison table of browser networking protocols](/images/blog/complete-guide-node-client-server-communication/712e5fe2-437f-11e6-88db-671c60753a9f.webp)

- **XHR** is optimized for "transactional" request-response communication: the client sends the full, well-formed HTTP request to the server, and the server responds with a full response. There is no support for request streaming, and until the Streams API is available, no reliable cross-browser response streaming API.
- **SSE** enables efficient, low-latency server-to-client streaming of text-based data: the client initiates the SSE connection, and the server uses the event source protocol to stream updates to the client. The client can't send any data to the server after the initial handshake.
- **WebSocket** is the only transport that allows bidirectional communication over the same TCP connection (Figure 17-2): the client and server can exchange messages at will. As a result, WebSocket provides low latency delivery of text and binary application data in both directions.

| Feature | XMLHttpRequest | Server-Sent Events | WebSocket |
| --- | --- | --- | --- |
| Request streaming | no | no | yes |
| Response streaming | limited | yes | yes |
| Framing mechanism | HTTP | event stream | binary Framing |
| Binary data transfers | yes | no (Base64) | limited |
| Compression | yes | yes | limited |
| Application transport protocol | HTTP | HTTP | WebSocket |
| Network transport protocol | TCP | TCP | TCP |

---

## [WebSocket Client-Server Demo](https://github.com/JoeKarlsson1/Complete_Guide_To_Client_Server_Communication/tree/master/client-server-sockets)

WebSockets is a technology, based on the _ws_ protocol, that makes it possible to establish a continuous full-duplex connection stream between a client and a server. A typical WebSocket client would be a user’s browser, but the protocol is platform-independent. It is the closest API to a raw network socket in the browser. Except a WebSocket connection is also much more than a network socket, as the browser abstracts all the complexity behind a simple API and provides a number of additional services:

- Connection negotiation and same-origin policy enforcement
- Interoperability with existing HTTP infrastructure
- Message-oriented communication and efficient message framing
- Subprotocol negotiation and extensibility

This is a demo showing a demo of a client connecting to a WebSocket server and sharing data. Here is the server.js of a WebSocket.

```javascript
'use strict';

const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ port: 8081 });

wss.on('connection', (ws) => {
	ws.on('message', (message) => {
		console.log(`received: ${message}`);
	});

	ws.on('end', () => {
		console.log('Connection ended...');
	});

	ws.send('Hello Client');
});
```

Here is the client.js of a WebSocket.

```javascript
console.log('open: ');
var ws = new WebSocket("ws://127.0.0.1:8081");

ws.onopen = function (event) {
  console.log('Connection is open ...');
  ws.send("Hello Server");
};

ws.onerror = function (err) {
  console.log('err: ', err);
}

ws.onmessage = function (event) {
  console.log(event.data);
  document.body.innerHTML += event.data + '
';
};

ws.onclose = function() {
  console.log("Connection is closed...");
}
```

---

## [Stream Updates with Server-Sent Events (SSE)](https://github.com/JoeKarlsson1/Complete_Guide_To_Client_Server_Communication/tree/master/server-side-events)

SSEs are sent over traditional HTTP. That means they do not require a special protocol or server implementation to get working. WebSockets on the other hand, require full-duplex connections and new Web Socket servers to handle the protocol. In addition, Server-Sent Events have a variety of features that WebSockets lack by design such as automatic reconnection, event IDs, and the ability to send arbitrary events.

## Server-Sent Events vs. WebSockets

Why would you choose Server-Sent Events over WebSockets? Good question. One reason SSEs have been kept in the shadow is that later APIs like WebSockets provide a richer protocol to perform bi-directional, full-duplex communication. Having a two-way channel is more attractive for things like games, messaging apps, and for cases where you need near real-time updates in both directions. However, in some scenarios data doesn’t need to be sent from the client. You simply need updates from some server action. A few examples would be friends’ status updates, stock tickers, news feeds, or other automated data push mechanisms (e.g. updating a client-side Web SQL Database or IndexedDB object store). If you’ll need to send data to a server, XMLHttpRequest is always a friend.

Here is the server.js of our Server-Sent Event, we will be sending out data to the client every 5 seconds with an updated timestamp via SSE.

```javascript
'use strict';

const http = require('http');
const util = require('util');
const fs = require('fs');

http
	.createServer((req, res) => {
		debugHeaders(req);

		if (req.headers.accept && req.headers.accept == 'text/event-stream') {
			if (req.url == '/events') {
				sendSSE(req, res);
			} else {
				res.writeHead(404);
				res.end();
			}
		} else {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write(fs.readFileSync(__dirname + '/index.html'));
			res.end();
		}
	})
	.listen(8000);

const sendSSE = (req, res) => {
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		Connection: 'keep-alive',
	});

	const id = new Date().toLocaleTimeString();

	setInterval(() => {
		constructSSE(res, id, new Date().toLocaleTimeString());
	}, 5000);

	constructSSE(res, id, new Date().toLocaleTimeString());
	//res.end();
};

const constructSSE = (res, id, data) => {
	res.write('id: ' + id + '\n');
	res.write('data: ' + data + '\n\n');
};

const debugHeaders = (req) => {
	util.puts('URL: ' + req.url);
	for (let key in req.headers) {
		util.puts(key + ': ' + req.headers[key]);
	}
	util.puts('\n\n');
};
```

And here is the client.js which is referenced by the index.html on the client-side. Notice how the client never sends out a formal request for data with SSE’s. Once the initial connection has been made with the server then the plain text data can be sent to the client as needed!

```javascript
var source = new EventSource('/events');

source.onmessage = function (e) {
	document.body.innerHTML += e.data + '';
};
```

---

## [XMLHttpRequest (XHR)](https://github.com/JoeKarlsson1/Complete_Guide_To_Client_Server_Communication/tree/master/xhr)

XMLHttpRequest (XHR) is a browser-level API that enables the client to script data transfers via JavaScript. XHR made its first debut in Internet Explorer 5, became one of the key technologies behind the Asynchronous JavaScript and XML (AJAX) revolution, and is now a fundamental building block of nearly every modern web application.

> XMLHTTP changed everything. It put the “D” in DHTML. It allowed us to asynchronously get data from the server and preserve document state on the client… The Outlook Web Access (OWA) team’s desire to build a rich Win32 like application in a browser pushed the technology into IE that allowed AJAX to become a reality. - Jim Van Eaton Outlook Web Access: A catalyst for web evolution

![client-server model](/images/blog/complete-guide-node-client-server-communication/687474703a2f2f6f726d2d6368696d6572612d70726f642e73332e616d617a6f6e6177732e636f6d2f313233303030303030303534352f696d616765732f6870626e5f313530312e706e67-1-1024x559.webp)_client-server model_

Here I am running a simple Express server with a simple route to send requested data to the Client.

```javascript
'use strict';

var express = require('express');
var app = express();

app.use(express.static(`${__dirname}/public`));

app.get('/api', function (req, res) {
	res.send(new Date().toLocaleTimeString());
});

app.listen(3000);
```

Here is the javascript file linked to my index.html on the client-side. I am using the baked-in XHR methods as opposed to jQuery since I love to use vanilla JavaScript whenever possible.

```javascript
'use strict'

function reqListener (data) {
  document.body.innerHTML += this.responseText + '
';
}

setInterval(function () {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener);
  oReq.open("GET", "/api");
  oReq.send();
}, 3000);
```

---

In my Github repo, I cover two more use cases not referenced here, server to server communications and HTTP/2.  If you are curious about those forms of communication check it out. One word about HTTP/2 before wrapping up. HTTP/2 is the future of Client-Server communication, but it is a protocol built on top of HTTP/1.1 which means that all of these forms of communicating will be still be relevant in the future, just the means that they are transmitted will be updated.

As you can see there are a ton of different ways you can send data between a client and a server. Once you have your data flowing, you will probably want to make sure your front-end is fast too. I wrote a post on [building high performance React applications](/blog/building-high-performance-react-applications/) that covers the rendering side of things. Before working on this project, I had no idea how many different ways were available in vanilla JavaScript for moving data around. If you have any questions, feel free to reach out.
