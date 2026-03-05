---
title: "Complete Guide To Node Client-Server Communication"
date: 2016-07-23
slug: "complete-guide-node-client-server-communication"
description: "After reading High-Performance Browser Networking by Ilya Grigorik, I was inspired to implement all of the client-server communication techniques outlined in his book in Node and JavaScript. This..."
categories: ["Blog"]
heroImage: "/images/blog/complete-guide-node-client-server-communication/Mom.png"
---

After reading [High-Performance Browser Networking](http://chimera.labs.oreilly.com/books/1230000000545/index.html) by Ilya Grigorik, I was inspired to implement all of the client-server communication techniques outlined in his book in Node and JavaScript. This post covers the following forms of client-server connection:

- XMLHttpRequest- Server-Sent Events- WebSocket- HTTP/2- Server to server

You can check out the complete source code for each implementation [here](https://github.com/JoeKarlsson1/Complete_Guide_To_Client_Server_Communication).

Before we begin, I should note that there is no one best protocol or API for client/server communication. Every non-trivial application will require a mix of different transports based on a variety of requirements: interaction with the browser cache, protocol overhead, message latency, reliability, type of data transfer, and more. Some protocols may offer low-latency delivery (e.g., Server-Sent Events, WebSocket), but may not meet other critical criteria, such as the ability to leverage the browser cache or support efficient binary transfers in all cases. Here is a visualization to help illustrate how XHR, SSE, and WebSockets differ in their implementations.

[![hpbn_1702](https://cloud.githubusercontent.com/assets/4650739/16638018/712e5fe2-437f-11e6-88db-671c60753a9f.png)](https://cloud.githubusercontent.com/assets/4650739/16638018/712e5fe2-437f-11e6-88db-671c60753a9f.png)

- **XHR** is optimized for “transactional” request-response communication: the client sends the full, well-formed HTTP request to the server, and the server responds with a full response. There is no support for request streaming, and until the Streams API is available, no reliable cross-browser response streaming API.-  **SSE** enables efficient, low-latency server-to-client streaming of text-based data: the client initiates the SSE connection, and the server uses the event source protocol to stream updates to the client. The client can’t send any data to the server after the initial handshake.-  **WebSocket** is the only transport that allows bidirectional communication over the same TCP connection (Figure 17-2): the client and server can exchange messages at will. As a result, WebSocket provides low latency delivery of text and binary application data in both directions.

 XMLHttpRequestServer-Sent EventsWebSocketRequest streamingnonoyesResponse streaminglimitedyesyesFraming mechanismHTTPevent streambinary FramingBinary data transfersyesno(Base64)limitedCompressionyesyeslimitedApplication transport protocolHTTPHTTPWebSocketNetwork transport protocolTCPTCPTCP

---

## [WebSocket Client-Server Demo](https://github.com/JoeKarlsson1/Complete_Guide_To_Client_Server_Communication/tree/master/client-server-sockets)

WebSockets is a technology, based on the *ws* protocol, that makes it possible to establish a continuous full-duplex connection stream between a client and a server. A typical WebSocket client would be a user’s browser, but the protocol is platform-independent. It is the closest API to a raw network socket in the browser. Except a WebSocket connection is also much more than a network socket, as the browser abstracts all the complexity behind a simple API and provides a number of additional services:

- Connection negotiation and same-origin policy enforcement- Interoperability with existing HTTP infrastructure- Message-oriented communication and efficient message framing- Subprotocol negotiation and extensibility

This is a demo showing a demo of a client connecting to a WebSocket server and sharing data. Here is the server.js of a WebSocket.

```
'use strict';

const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ port: 8081 });

wss.on('connection', ((ws) => {
  ws.on('message', (message) => {
    console.log(`received: ${message}`);
  });

  ws.on('end', () => {
    console.log('Connection ended...');
  });

  ws.send('Hello Client');
}));
```

Here is the client.js of a WebSocket.

```
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

## [](https://github.com/JoeKarlsson1/Complete_Guide_To_Client_Server_Communication/tree/master/server-side-events#server-sent-events-vs-websockets)Server-Sent Events vs. WebSockets

Why would you choose Server-Sent Events over WebSockets? Good question. One reason SSEs have been kept in the shadow is that later APIs like WebSockets provide a richer protocol to perform bi-directional, full-duplex communication. Having a two-way channel is more attractive for things like games, messaging apps, and for cases where you need near real-time updates in both directions. However, in some scenarios data doesn’t need to be sent from the client. You simply need updates from some server action. A few examples would be friends’ status updates, stock tickers, news feeds, or other automated data push mechanisms (e.g. updating a client-side Web SQL Database or IndexedDB object store). If you’ll need to send data to a server, XMLHttpRequest is always a friend.

Here is the server.js of our Server-Sent Event, we will be sending out data to the client every 5 seconds with an updated timestamp via SSE.

```
'use strict';

const http = require('http');
const util = require('util');
const fs = require('fs');

http.createServer((req, res) => {
  debugHeaders(req);

  if (req.headers.accept && req.headers.accept == 'text/event-stream') {
    if (req.url == '/events') {
      sendSSE(req, res);
    } else {
      res.writeHead(404);
      res.end();
    }
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(fs.readFileSync(__dirname + '/index.html'));
    res.end();
  }
}).listen(8000);

const sendSSE = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const id = (new Date()).toLocaleTimeString();

  setInterval(() => {
    constructSSE(res, id, (new Date()).toLocaleTimeString());
  }, 5000);

  constructSSE(res, id, (new Date()).toLocaleTimeString());
  //res.end();
}

const constructSSE = (res, id, data) => {
  res.write('id: ' + id + '\n');
  res.write("data: " + data + '\n\n');
}

const debugHeaders = (req) => {
  util.puts('URL: ' + req.url);
  for (let key in req.headers) {
    util.puts(key + ': ' + req.headers[key]);
  }
  util.puts('\n\n');
}
```

And here is the client.js which is referenced by the index.html on the client-side. Notice how the client never sends out a formal request for data with SSE’s. Once the initial connection has been made with the server then the plain text data can be sent to the client as needed!

```
var source = new EventSource('/events');

source.onmessage = function(e) {
    document.body.innerHTML += e.data + '';
};
```

---

## [XMLHttpRequest (XHR)](https://github.com/JoeKarlsson1/Complete_Guide_To_Client_Server_Communication/tree/master/xhr)

XMLHttpRequest (XHR) is a browser-level API that enables the client to script data transfers via JavaScript. XHR made its first debut in Internet Explorer 5, became one of the key technologies behind the Asynchronous JavaScript and XML (AJAX) revolution, and is now a fundamental building block of nearly every modern web application.

> 
XMLHTTP changed everything. It put the “D” in DHTML. It allowed us to asynchronously get data from the server and preserve document state on the client… The Outlook Web Access (OWA) team’s desire to build a rich Win32 like application in a browser pushed the technology into IE that allowed AJAX to become a reality. — Jim Van Eaton Outlook Web Access: A catalyst for web evolution

![client-server model](/images/blog/complete-guide-node-client-server-communication/687474703a2f2f6f726d2d6368696d6572612d70726f642e73332e616d617a6f6e6177732e636f6d2f313233303030303030303534352f696d616765732f6870626e5f313530312e706e67-1-1024x559.png)*client-server model*

Here I am running a simple Express server with a simple route to send requested data to the Client.

```
'use strict';

var express = require('express');
var app = express();

app.use(express.static(`${__dirname}/public`));

app.get('/api', function(req, res){
  res.send((new Date()).toLocaleTimeString());
});

app.listen(3000);
```

Here is the javascript file linked to my index.html on the client-side. I am using the baked-in XHR methods as opposed to jQuery since I love to use vanilla JavaScript whenever possible.

```
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

As you can see there are a ton of different ways you can send data between a client and a server. Before working on this project, I had no idea how many different ways were available in vanilla JavaScript for moving data around. Did I miss anything or do you see something that needs to be fixed? Let me know in the comments below.

## Follow Joe Karlsson on Social

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M22.23,5.924c-0.736,0.326-1.527,0.547-2.357,0.646c0.847-0.508,1.498-1.312,1.804-2.27 c-0.793,0.47-1.671,0.812-2.606,0.996C18.324,4.498,17.257,4,16.077,4c-2.266,0-4.103,1.837-4.103,4.103 c0,0.322,0.036,0.635,0.106,0.935C8.67,8.867,5.647,7.234,3.623,4.751C3.27,5.357,3.067,6.062,3.067,6.814 c0,1.424,0.724,2.679,1.825,3.415c-0.673-0.021-1.305-0.206-1.859-0.513c0,0.017,0,0.034,0,0.052c0,1.988,1.414,3.647,3.292,4.023 c-0.344,0.094-0.707,0.144-1.081,0.144c-0.264,0-0.521-0.026-0.772-0.074c0.522,1.63,2.038,2.816,3.833,2.85 c-1.404,1.1-3.174,1.756-5.096,1.756c-0.331,0-0.658-0.019-0.979-0.057c1.816,1.164,3.973,1.843,6.29,1.843 c7.547,0,11.675-6.252,11.675-11.675c0-0.178-0.004-0.355-0.012-0.531C20.985,7.47,21.68,6.747,22.23,5.924z"></path></svg>Twitter](https://twitter.com/JoeKarlsson1)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M19.7,3H4.3C3.582,3,3,3.582,3,4.3v15.4C3,20.418,3.582,21,4.3,21h15.4c0.718,0,1.3-0.582,1.3-1.3V4.3 C21,3.582,20.418,3,19.7,3z M8.339,18.338H5.667v-8.59h2.672V18.338z M7.004,8.574c-0.857,0-1.549-0.694-1.549-1.548 c0-0.855,0.691-1.548,1.549-1.548c0.854,0,1.547,0.694,1.547,1.548C8.551,7.881,7.858,8.574,7.004,8.574z M18.339,18.338h-2.669 v-4.177c0-0.996-0.017-2.278-1.387-2.278c-1.389,0-1.601,1.086-1.601,2.206v4.249h-2.667v-8.59h2.559v1.174h0.037 c0.356-0.675,1.227-1.387,2.526-1.387c2.703,0,3.203,1.779,3.203,4.092V18.338z"></path></svg>LinkedIn](https://www.linkedin.com/in/joekarlsson/)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12,2C6.477,2,2,6.477,2,12c0,4.419,2.865,8.166,6.839,9.489c0.5,0.09,0.682-0.218,0.682-0.484 c0-0.236-0.009-0.866-0.014-1.699c-2.782,0.602-3.369-1.34-3.369-1.34c-0.455-1.157-1.11-1.465-1.11-1.465 c-0.909-0.62,0.069-0.608,0.069-0.608c1.004,0.071,1.532,1.03,1.532,1.03c0.891,1.529,2.341,1.089,2.91,0.833 c0.091-0.647,0.349-1.086,0.635-1.337c-2.22-0.251-4.555-1.111-4.555-4.943c0-1.091,0.39-1.984,1.03-2.682 C6.546,8.54,6.202,7.524,6.746,6.148c0,0,0.84-0.269,2.75,1.025C10.295,6.95,11.15,6.84,12,6.836 c0.85,0.004,1.705,0.114,2.504,0.336c1.909-1.294,2.748-1.025,2.748-1.025c0.546,1.376,0.202,2.394,0.1,2.646 c0.64,0.699,1.026,1.591,1.026,2.682c0,3.841-2.337,4.687-4.565,4.935c0.359,0.307,0.679,0.917,0.679,1.852 c0,1.335-0.012,2.415-0.012,2.741c0,0.269,0.18,0.579,0.688,0.481C19.138,20.161,22,16.416,22,12C22,6.477,17.523,2,12,2z"></path></svg>GitHub](https://github.com/JoeKarlsson)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12,4.622c2.403,0,2.688,0.009,3.637,0.052c0.877,0.04,1.354,0.187,1.671,0.31c0.42,0.163,0.72,0.358,1.035,0.673 c0.315,0.315,0.51,0.615,0.673,1.035c0.123,0.317,0.27,0.794,0.31,1.671c0.043,0.949,0.052,1.234,0.052,3.637 s-0.009,2.688-0.052,3.637c-0.04,0.877-0.187,1.354-0.31,1.671c-0.163,0.42-0.358,0.72-0.673,1.035 c-0.315,0.315-0.615,0.51-1.035,0.673c-0.317,0.123-0.794,0.27-1.671,0.31c-0.949,0.043-1.233,0.052-3.637,0.052 s-2.688-0.009-3.637-0.052c-0.877-0.04-1.354-0.187-1.671-0.31c-0.42-0.163-0.72-0.358-1.035-0.673 c-0.315-0.315-0.51-0.615-0.673-1.035c-0.123-0.317-0.27-0.794-0.31-1.671C4.631,14.688,4.622,14.403,4.622,12 s0.009-2.688,0.052-3.637c0.04-0.877,0.187-1.354,0.31-1.671c0.163-0.42,0.358-0.72,0.673-1.035 c0.315-0.315,0.615-0.51,1.035-0.673c0.317-0.123,0.794-0.27,1.671-0.31C9.312,4.631,9.597,4.622,12,4.622 M12,3 C9.556,3,9.249,3.01,8.289,3.054C7.331,3.098,6.677,3.25,6.105,3.472C5.513,3.702,5.011,4.01,4.511,4.511 c-0.5,0.5-0.808,1.002-1.038,1.594C3.25,6.677,3.098,7.331,3.054,8.289C3.01,9.249,3,9.556,3,12c0,2.444,0.01,2.751,0.054,3.711 c0.044,0.958,0.196,1.612,0.418,2.185c0.23,0.592,0.538,1.094,1.038,1.594c0.5,0.5,1.002,0.808,1.594,1.038 c0.572,0.222,1.227,0.375,2.185,0.418C9.249,20.99,9.556,21,12,21s2.751-0.01,3.711-0.054c0.958-0.044,1.612-0.196,2.185-0.418 c0.592-0.23,1.094-0.538,1.594-1.038c0.5-0.5,0.808-1.002,1.038-1.594c0.222-0.572,0.375-1.227,0.418-2.185 C20.99,14.751,21,14.444,21,12s-0.01-2.751-0.054-3.711c-0.044-0.958-0.196-1.612-0.418-2.185c-0.23-0.592-0.538-1.094-1.038-1.594 c-0.5-0.5-1.002-0.808-1.594-1.038c-0.572-0.222-1.227-0.375-2.185-0.418C14.751,3.01,14.444,3,12,3L12,3z M12,7.378 c-2.552,0-4.622,2.069-4.622,4.622S9.448,16.622,12,16.622s4.622-2.069,4.622-4.622S14.552,7.378,12,7.378z M12,15 c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S13.657,15,12,15z M16.804,6.116c-0.596,0-1.08,0.484-1.08,1.08 s0.484,1.08,1.08,1.08c0.596,0,1.08-0.484,1.08-1.08S17.401,6.116,16.804,6.116z"></path></svg>Instagram](https://www.instagram.com/joekarlsson/)

- [<svg width="24" height="24" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M16.708 0.027c1.745-0.027 3.48-0.011 5.213-0.027 0.105 2.041 0.839 4.12 2.333 5.563 1.491 1.479 3.6 2.156 5.652 2.385v5.369c-1.923-0.063-3.855-0.463-5.6-1.291-0.76-0.344-1.468-0.787-2.161-1.24-0.009 3.896 0.016 7.787-0.025 11.667-0.104 1.864-0.719 3.719-1.803 5.255-1.744 2.557-4.771 4.224-7.88 4.276-1.907 0.109-3.812-0.411-5.437-1.369-2.693-1.588-4.588-4.495-4.864-7.615-0.032-0.667-0.043-1.333-0.016-1.984 0.24-2.537 1.495-4.964 3.443-6.615 2.208-1.923 5.301-2.839 8.197-2.297 0.027 1.975-0.052 3.948-0.052 5.923-1.323-0.428-2.869-0.308-4.025 0.495-0.844 0.547-1.485 1.385-1.819 2.333-0.276 0.676-0.197 1.427-0.181 2.145 0.317 2.188 2.421 4.027 4.667 3.828 1.489-0.016 2.916-0.88 3.692-2.145 0.251-0.443 0.532-0.896 0.547-1.417 0.131-2.385 0.079-4.76 0.095-7.145 0.011-5.375-0.016-10.735 0.025-16.093z" /></svg>TikTok](https://www.tiktok.com/@joekarlsson)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M21.8,8.001c0,0-0.195-1.378-0.795-1.985c-0.76-0.797-1.613-0.801-2.004-0.847c-2.799-0.202-6.997-0.202-6.997-0.202 h-0.009c0,0-4.198,0-6.997,0.202C4.608,5.216,3.756,5.22,2.995,6.016C2.395,6.623,2.2,8.001,2.2,8.001S2,9.62,2,11.238v1.517 c0,1.618,0.2,3.237,0.2,3.237s0.195,1.378,0.795,1.985c0.761,0.797,1.76,0.771,2.205,0.855c1.6,0.153,6.8,0.201,6.8,0.201 s4.203-0.006,7.001-0.209c0.391-0.047,1.243-0.051,2.004-0.847c0.6-0.607,0.795-1.985,0.795-1.985s0.2-1.618,0.2-3.237v-1.517 C22,9.62,21.8,8.001,21.8,8.001z M9.935,14.594l-0.001-5.62l5.404,2.82L9.935,14.594z"></path></svg>YouTube](https://www.youtube.com/c/JoeKarlsson)

## Want to Learn More About Joe Karlsson?

- [https://www.joekarlsson.com/about/](https://www.joekarlsson.com/about/)- [https://www.joekarlsson.com/speaking/](https://www.joekarlsson.com/speaking/)
