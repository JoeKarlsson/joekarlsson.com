---
title: "How to Build A Spotify Player with React in 15 Minutes"
date: 2019-04-02
slug: "how-to-build-a-spotify-player-with-react-in-15-minutes"
description: "Have you ever wanted to build a Spotify player for your app or website? Adding personalized music to any application is super easy with the Spotify Developer API. Personally, I have been playing..."
categories: ["Blog"]
heroImage: "/images/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/1_KGOTMV8KD120TApnijDauQ.png"
---

Have you ever wanted to build a Spotify player for your app or website? Adding personalized music to any application is super easy with the Spotify Developer API. Personally, I have been playing around with the Spotify API with an IoT project I have been building in my free time.

![](https://cdn-images-1.medium.com/max/1200/1*qIg_-BGURcZ3UkuXxfS6ig.jpeg)*My MagicMirror project with Spotify integration.*

The Spotify API is easy to use and can be added to any application.

In this post, I am going to walk through how to access the Spotify Developer API in the browser using React. The goal is to be a starting point for front-end devs who want to get set up with Spotify API as quickly as possible. Together, we will be creating a Spotify Web player that displays information about your currently played music from Spotify. We will also demonstrate how to:

- Register an application with Spotify- Authenticate a user and get authorization to access user data- Retrieve the data from a Web API endpoint

You can find all of the source code here:

[**JoeKarlsson/react-spotify-player**
*Realtime Spotify Player built with React. Contribute to JoeKarlsson/react-spotify-player development by creating an…*github.com](https://github.com/JoeKarlsson/react-spotify-player)

![](https://cdn-images-1.medium.com/max/1200/1*Hz5eVZX6IbrXvwb2qEUcRA.gif)*Our Spotify Web Player in Action*

Note: This article will not be a deep dive into React, and it will require knowledge of the basics of JavaScript and React.

![](https://cdn-images-1.medium.com/max/1200/1*m5UdqrCtEW7w83Bpfcv7xQ.gif)*Okay, now let’s jump in!*

### Set Up Your Account

To use the Web API, start by creating a Spotify user account (Premium or Free). To do that, simply sign up at [www.spotify.com](http://www.spotify.com/).

When you have a user account, go to the [Dashboard](https://developer.spotify.com/dashboard) page at the Spotify Developer website and, if necessary, log in. Accept the latest [Developer Terms of Service](https://developer.spotify.com/terms) to complete your account setup.

### Register Your Application

Any application can request data from Spotify Web API endpoints and many endpoints are open and will return data *without* requiring registration. However, if your application seeks access to a user’s personal data (profile, playlists, etc.) it must be registered.

You can [register your application](https://developer.spotify.com/documentation/web-api/quick-start/), even before you have created it.

Go to the [Dashboard](https://developer.spotify.com/dashboard) page at the Spotify Developer website, and click on ‘My New App.”

![](https://cdn-images-1.medium.com/max/1200/1*Q8TqczPy9qXktRPtwTsUZw.png)

Fill out the information for your new app using the form as a guide. Then click Next.

![](https://cdn-images-1.medium.com/max/1200/1*mYgEks-YVy9-n1N5AjiGUw.png)

Click on Edit Settings to continue your app registration.

![](https://cdn-images-1.medium.com/max/1200/1*vwwrjL8TM_Ityqs6M3sB8Q.png)

The most important thing is that you must put in a redirect URL. We are going to use the default URL of from the Create React App. Enter [http://localhost:3000](http://localhost:3000/) in this field. This is the URL you want to be redirected to after a user has authenticated through Spotify.

![](https://cdn-images-1.medium.com/max/1200/1*Tb4PLnsPM1MupL_dMgh1xA.png)

Click “Save” and be sure to write down the Client ID from your application. And congrats, you’ve just registered your application and now we are ready to jump into the code.

![](https://cdn-images-1.medium.com/max/1200/1*DcKWZ0I6VQhemLfg4KGxHg.gif)*You did it!*

### Setting Up The Code

We are going to get started quickly by running [Create React App](https://github.com/facebook/create-react-app). You can do this by running the following commands in your terminal.

```
npx create-react-app react-spotify-player
cd react-spotify-player
npm start
```

Open up the project in your favorite text editor and then let’s get our app authenticated to Spotify so we can get that juicy data. There are many ways to authenticate to Spotify, but we are going to use [Implicit authorization](https://developer.spotify.com/documentation/general/guides/authorization-guide/#implicit-grant-flow).

[Implicit grant flow](https://developer.spotify.com/documentation/general/guides/authorization-guide/#implicit-grant-flow) is for clients (Like ours) that are implemented entirely using JavaScript and running in the resource owner’s browser. Implicit Grant flow is carried out client-side and does not involve secret keys. The access tokens that are issued are short-lived and there are no refresh tokens to extend them when they expire.

![](https://cdn-images-1.medium.com/max/1200/1*oRSho09JSaDFuJ0bCOSj0g.png)*Source: [https://developer.spotify.com/documentation/general/guides/authorization-guide/#implicit-grant-flow](https://developer.spotify.com/documentation/general/guides/authorization-guide/#implicit-grant-flow)*

We need to write some code that performs a couple of actions:

- We will redirect the user to the `/authorize` endpoint of the Accounts service:

`GET [https://accounts.spotify.com/authorize](https://accounts.spotify.com/authorize)`

2. The user is asked to authorize access within the scopes. The Spotify Accounts service presents details of the [scopes](https://developer.spotify.com/documentation/general/guides/authorization-guide/#list-of-scopes) for which access is being sought.

- If the user is not logged in, they are prompted to do so using their Spotify username and password.- When the user is logged in, they are asked to authorize access to the data sets defined in the scopes.

3. The user is redirected back to your specified URI. After the user grants (or denies) access, the Spotify Accounts service redirects the user to the `redirect_uri`. In this example, the redirect address is: `[https://example.com/callback](https://example.com/callback)`

In App.js add the following code:

```
import React, { Component } from "react";
import hash from "./hash";
import logo from "./logo.svg";
import "./App.css";

export const authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = "YOUR_CLIENT_ID_GOES_HERE";
const redirectUri = "http://localhost:3000";
const scopes = [
  "user-read-currently-playing",
  "user-read-playback-state",
];

// Get the hash of the url
const hash = window.location.hash
  .substring(1)
  .split("&")
  .reduce(function(initial, item) {
    if (item) {
      var parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});

window.location.hash = "";

class App extends Component {
  componentDidMount() {
    // Set token
    let _token = hash.access_token;
    if (_token) {
      // Set token
      this.setState({
        token: _token
      });
    }
  }

render() {
  return (
    
      
      <img src={logo} className="App-logo" alt="logo" />
      {!this.state.token && (
        <a
          className="btn btn--loginApp-link"
          href={`${authEndpoint}client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`}
        >
          Login to Spotify
        </a>
      )}
      {this.state.token && (
        // Spotify Player Will Go Here In the Next Step
      )}
      
    
  );
  }
}

export default App;
```

This code snippet creates a “Login With Spotify” button that redirects the user to authenticate with Spotify, we can obtain an Auth token that we will then use to make a request to the Spotify API.

Now, let’s add a function that will call the Spotify API and return the data. You will need to add the additional info.

```
import * as $ from "jquery";
import Player from "./Player";

class App extends Component {
  constructor() {
    super();
    this.state = {
      token: null,
    item: {
      album: {
        images: [{ url: "" }]
      },
      name: "",
      artists: [{ name: "" }],
      duration_ms:0,
    },
    is_playing: "Paused",
    progress_ms: 0
  };

  this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
  }

  getCurrentlyPlaying(token) {
    // Make a call using the token
    $.ajax({
      url: "https://api.spotify.com/v1/me/player",
      type: "GET",
      beforeSend: (xhr) => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: (data) => {
        this.setState({
          item: data.item,
          is_playing: data.is_playing,
          progress_ms: data.progress_ms,
        });
      }
    });
  }

  ...

}
```

Then, of course, we need to make the actual player. We will first need to create a new Player component called `Player.js` .

```
import React from "react";
import "./Player.css";

const Player = props => {
  const backgroundStyles = {
    backgroundImage:`url(${props.item.album.images[0].url})`,
  };
  
  const progressBarStyles = {
    width: (props.progress_ms * 100 / props.item.duration_ms) + '%'
  };
  
  return (
    
      
        
          <img src={props.item.album.images[0].url} />
        
        
          {props.item.name}
          
            {props.item.artists[0].name}
          
          
            {props.is_playing ? "Playing" : "Paused"}
          
          
            
          
        
        {" "}
      
    
  );
}

export default Player;
```

Here’s the CSS for `Player.css` .

```
/** Now Playing **/
.now-playing__name {
  font-size: 1.5em;
  margin-bottom: 0.2em;
}

.now-playing__artist {
  margin-bottom: 1em;
}

.now-playing__status {
  margin-bottom: 1em;
}

.now-playing__img {
  float: left;
  margin-right: 10px;
  text-align: right;
  width: 45%;
}

.now-playing__img img {
  max-width: 80vmin;
  width: 100%;
}

.now-playing__side {
  margin-left: 5%;
  width: 45%;
}

/** Progress **/
.progress {
  border: 1px solid #eee;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
}

.progress__bar {
  background-color: #eee;
  height: 4px;
}
```

Then in your `App.js` you will need to pass in the data from Spotify to your Player component.

```
class App extends Component {

  ...

  render() {
    return (
  
   ...

      {this.state.token && (
        <Player
          item={this.state.item}
          is_playing={this.state.is_playing}
          progress_ms={this.progress_ms}
        />
      )}
     
   
  );
 }
}
```

And that’s all the code you’ll need. By this step, your app should look and work like this.

![](https://cdn-images-1.medium.com/max/1200/1*Hz5eVZX6IbrXvwb2qEUcRA.gif)

And that’s it!

![](https://cdn-images-1.medium.com/max/1200/1*OTlBtshwFr_J4WfPfp6B1w.gif)*You did it!*

If you have any questions or comments, feel free to reach out or [open an issue in the repo](https://github.com/JoeKarlsson/react-spotify-player/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc).

> 
You can find the source code for this tutorial here: [https://github.com/JoeKarlsson/react-spotify-player](https://github.com/JoeKarlsson/react-spotify-player)

## Follow Joe Karlsson on Social

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M22.23,5.924c-0.736,0.326-1.527,0.547-2.357,0.646c0.847-0.508,1.498-1.312,1.804-2.27 c-0.793,0.47-1.671,0.812-2.606,0.996C18.324,4.498,17.257,4,16.077,4c-2.266,0-4.103,1.837-4.103,4.103 c0,0.322,0.036,0.635,0.106,0.935C8.67,8.867,5.647,7.234,3.623,4.751C3.27,5.357,3.067,6.062,3.067,6.814 c0,1.424,0.724,2.679,1.825,3.415c-0.673-0.021-1.305-0.206-1.859-0.513c0,0.017,0,0.034,0,0.052c0,1.988,1.414,3.647,3.292,4.023 c-0.344,0.094-0.707,0.144-1.081,0.144c-0.264,0-0.521-0.026-0.772-0.074c0.522,1.63,2.038,2.816,3.833,2.85 c-1.404,1.1-3.174,1.756-5.096,1.756c-0.331,0-0.658-0.019-0.979-0.057c1.816,1.164,3.973,1.843,6.29,1.843 c7.547,0,11.675-6.252,11.675-11.675c0-0.178-0.004-0.355-0.012-0.531C20.985,7.47,21.68,6.747,22.23,5.924z"></path></svg>Twitter](https://twitter.com/JoeKarlsson1)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M19.7,3H4.3C3.582,3,3,3.582,3,4.3v15.4C3,20.418,3.582,21,4.3,21h15.4c0.718,0,1.3-0.582,1.3-1.3V4.3 C21,3.582,20.418,3,19.7,3z M8.339,18.338H5.667v-8.59h2.672V18.338z M7.004,8.574c-0.857,0-1.549-0.694-1.549-1.548 c0-0.855,0.691-1.548,1.549-1.548c0.854,0,1.547,0.694,1.547,1.548C8.551,7.881,7.858,8.574,7.004,8.574z M18.339,18.338h-2.669 v-4.177c0-0.996-0.017-2.278-1.387-2.278c-1.389,0-1.601,1.086-1.601,2.206v4.249h-2.667v-8.59h2.559v1.174h0.037 c0.356-0.675,1.227-1.387,2.526-1.387c2.703,0,3.203,1.779,3.203,4.092V18.338z"></path></svg>LinkedIn](https://www.linkedin.com/in/joekarlsson/)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12,2C6.477,2,2,6.477,2,12c0,4.419,2.865,8.166,6.839,9.489c0.5,0.09,0.682-0.218,0.682-0.484 c0-0.236-0.009-0.866-0.014-1.699c-2.782,0.602-3.369-1.34-3.369-1.34c-0.455-1.157-1.11-1.465-1.11-1.465 c-0.909-0.62,0.069-0.608,0.069-0.608c1.004,0.071,1.532,1.03,1.532,1.03c0.891,1.529,2.341,1.089,2.91,0.833 c0.091-0.647,0.349-1.086,0.635-1.337c-2.22-0.251-4.555-1.111-4.555-4.943c0-1.091,0.39-1.984,1.03-2.682 C6.546,8.54,6.202,7.524,6.746,6.148c0,0,0.84-0.269,2.75,1.025C10.295,6.95,11.15,6.84,12,6.836 c0.85,0.004,1.705,0.114,2.504,0.336c1.909-1.294,2.748-1.025,2.748-1.025c0.546,1.376,0.202,2.394,0.1,2.646 c0.64,0.699,1.026,1.591,1.026,2.682c0,3.841-2.337,4.687-4.565,4.935c0.359,0.307,0.679,0.917,0.679,1.852 c0,1.335-0.012,2.415-0.012,2.741c0,0.269,0.18,0.579,0.688,0.481C19.138,20.161,22,16.416,22,12C22,6.477,17.523,2,12,2z"></path></svg>GitHub](https://github.com/JoeKarlsson)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12,4.622c2.403,0,2.688,0.009,3.637,0.052c0.877,0.04,1.354,0.187,1.671,0.31c0.42,0.163,0.72,0.358,1.035,0.673 c0.315,0.315,0.51,0.615,0.673,1.035c0.123,0.317,0.27,0.794,0.31,1.671c0.043,0.949,0.052,1.234,0.052,3.637 s-0.009,2.688-0.052,3.637c-0.04,0.877-0.187,1.354-0.31,1.671c-0.163,0.42-0.358,0.72-0.673,1.035 c-0.315,0.315-0.615,0.51-1.035,0.673c-0.317,0.123-0.794,0.27-1.671,0.31c-0.949,0.043-1.233,0.052-3.637,0.052 s-2.688-0.009-3.637-0.052c-0.877-0.04-1.354-0.187-1.671-0.31c-0.42-0.163-0.72-0.358-1.035-0.673 c-0.315-0.315-0.51-0.615-0.673-1.035c-0.123-0.317-0.27-0.794-0.31-1.671C4.631,14.688,4.622,14.403,4.622,12 s0.009-2.688,0.052-3.637c0.04-0.877,0.187-1.354,0.31-1.671c0.163-0.42,0.358-0.72,0.673-1.035 c0.315-0.315,0.615-0.51,1.035-0.673c0.317-0.123,0.794-0.27,1.671-0.31C9.312,4.631,9.597,4.622,12,4.622 M12,3 C9.556,3,9.249,3.01,8.289,3.054C7.331,3.098,6.677,3.25,6.105,3.472C5.513,3.702,5.011,4.01,4.511,4.511 c-0.5,0.5-0.808,1.002-1.038,1.594C3.25,6.677,3.098,7.331,3.054,8.289C3.01,9.249,3,9.556,3,12c0,2.444,0.01,2.751,0.054,3.711 c0.044,0.958,0.196,1.612,0.418,2.185c0.23,0.592,0.538,1.094,1.038,1.594c0.5,0.5,1.002,0.808,1.594,1.038 c0.572,0.222,1.227,0.375,2.185,0.418C9.249,20.99,9.556,21,12,21s2.751-0.01,3.711-0.054c0.958-0.044,1.612-0.196,2.185-0.418 c0.592-0.23,1.094-0.538,1.594-1.038c0.5-0.5,0.808-1.002,1.038-1.594c0.222-0.572,0.375-1.227,0.418-2.185 C20.99,14.751,21,14.444,21,12s-0.01-2.751-0.054-3.711c-0.044-0.958-0.196-1.612-0.418-2.185c-0.23-0.592-0.538-1.094-1.038-1.594 c-0.5-0.5-1.002-0.808-1.594-1.038c-0.572-0.222-1.227-0.375-2.185-0.418C14.751,3.01,14.444,3,12,3L12,3z M12,7.378 c-2.552,0-4.622,2.069-4.622,4.622S9.448,16.622,12,16.622s4.622-2.069,4.622-4.622S14.552,7.378,12,7.378z M12,15 c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S13.657,15,12,15z M16.804,6.116c-0.596,0-1.08,0.484-1.08,1.08 s0.484,1.08,1.08,1.08c0.596,0,1.08-0.484,1.08-1.08S17.401,6.116,16.804,6.116z"></path></svg>Instagram](https://www.instagram.com/joekarlsson/)

- [<svg width="24" height="24" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M16.708 0.027c1.745-0.027 3.48-0.011 5.213-0.027 0.105 2.041 0.839 4.12 2.333 5.563 1.491 1.479 3.6 2.156 5.652 2.385v5.369c-1.923-0.063-3.855-0.463-5.6-1.291-0.76-0.344-1.468-0.787-2.161-1.24-0.009 3.896 0.016 7.787-0.025 11.667-0.104 1.864-0.719 3.719-1.803 5.255-1.744 2.557-4.771 4.224-7.88 4.276-1.907 0.109-3.812-0.411-5.437-1.369-2.693-1.588-4.588-4.495-4.864-7.615-0.032-0.667-0.043-1.333-0.016-1.984 0.24-2.537 1.495-4.964 3.443-6.615 2.208-1.923 5.301-2.839 8.197-2.297 0.027 1.975-0.052 3.948-0.052 5.923-1.323-0.428-2.869-0.308-4.025 0.495-0.844 0.547-1.485 1.385-1.819 2.333-0.276 0.676-0.197 1.427-0.181 2.145 0.317 2.188 2.421 4.027 4.667 3.828 1.489-0.016 2.916-0.88 3.692-2.145 0.251-0.443 0.532-0.896 0.547-1.417 0.131-2.385 0.079-4.76 0.095-7.145 0.011-5.375-0.016-10.735 0.025-16.093z" /></svg>TikTok](https://www.tiktok.com/@joekarlsson)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M21.8,8.001c0,0-0.195-1.378-0.795-1.985c-0.76-0.797-1.613-0.801-2.004-0.847c-2.799-0.202-6.997-0.202-6.997-0.202 h-0.009c0,0-4.198,0-6.997,0.202C4.608,5.216,3.756,5.22,2.995,6.016C2.395,6.623,2.2,8.001,2.2,8.001S2,9.62,2,11.238v1.517 c0,1.618,0.2,3.237,0.2,3.237s0.195,1.378,0.795,1.985c0.761,0.797,1.76,0.771,2.205,0.855c1.6,0.153,6.8,0.201,6.8,0.201 s4.203-0.006,7.001-0.209c0.391-0.047,1.243-0.051,2.004-0.847c0.6-0.607,0.795-1.985,0.795-1.985s0.2-1.618,0.2-3.237v-1.517 C22,9.62,21.8,8.001,21.8,8.001z M9.935,14.594l-0.001-5.62l5.404,2.82L9.935,14.594z"></path></svg>YouTube](https://www.youtube.com/c/JoeKarlsson)

## Want to Learn More About Joe Karlsson?

- [https://www.joekarlsson.com/about/](https://www.joekarlsson.com/about/)- [https://www.joekarlsson.com/speaking/](https://www.joekarlsson.com/speaking/)
