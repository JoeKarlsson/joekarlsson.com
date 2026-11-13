---
title: 'How to Build A Spotify Player with React in 15 Minutes'
seoTitle: 'Build a Spotify Player with React'
date: 2019-04-02
slug: 'how-to-build-a-spotify-player-with-react-in-15-minutes'
description: "Build a Spotify player in React in 15 minutes. Register an app, authenticate a user, and show the track they're playing with the Spotify Web API."
categories: ['Web Dev']
heroImage: '/images/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/thumb-8daa80c0.webp'
heroAlt: 'My MagicMirror showing the song playing on Spotify'
contentNotice: 'I updated this tutorial in November 2026. Spotify removed the implicit grant flow it first used, so the login now uses Authorization Code with PKCE, and the setup uses Vite instead of Create React App.'
tldr: 'Step-by-step tutorial for building a "now playing" Spotify web player in React using the Spotify API and the Authorization Code with PKCE flow.'
howToSteps:
  - name: 'Create a Spotify Developer Account'
    text: 'Sign up at spotify.com and log in to the Spotify Developer Dashboard to accept the Developer Terms of Service.'
  - name: 'Register Your Application'
    text: 'Create a new app in the Developer Dashboard, fill out the app form, and set the redirect URI to http://127.0.0.1:5173.'
  - name: 'Save Your Client ID'
    text: 'Note your Client ID from the app details - you will need this to authenticate users via the Spotify API.'
  - name: 'Initialize a React App'
    text: 'Scaffold a React app with Vite (npm create vite@latest react-spotify-player -- --template react), install jquery, and start the dev server with npm run dev -- --host 127.0.0.1.'
  - name: 'Implement Spotify Authentication'
    text: 'Add code to App.jsx that sends users to the Spotify authorize endpoint with a PKCE code challenge, then trades the code Spotify sends back for an access token.'
  - name: 'Create the API Function'
    text: 'Build a getCurrentlyPlaying() function that calls the Spotify /me/player endpoint with your access token to fetch track data.'
  - name: 'Build the Player Component'
    text: 'Create a Player.jsx component that displays album art, track name, artist, playback status, and a progress bar.'
---

Have you ever wanted to build a Spotify player for your app or website? Adding personalized music to any application is super easy with the Spotify Developer API. Personally, I have been playing around with the Spotify API with an IoT project I have been building in my free time.

![My MagicMirror project with Spotify integration.](/images/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/magic-mirror-spotify.webp)_My MagicMirror project with Spotify integration._

The Spotify API is easy to use and can be added to any application.

In this post, I am going to walk through how to access the Spotify Developer API in the browser using React. The goal is to be a starting point for front-end devs who want to get set up with Spotify API as quickly as possible. Together, we will be creating a Spotify Web player that displays information about your currently played music from Spotify. We will also demonstrate how to:

- Register an application with Spotify
- Authenticate a user and get authorization to access user data
- Retrieve the data from a Web API endpoint

You can find all of the source code here:

[JoeKarlsson/react-spotify-player on GitHub](https://github.com/JoeKarlsson/react-spotify-player)

![Our Spotify Web Player in Action](/images/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/spotify-web-player-demo.gif)_Our Spotify Web Player in Action_

Note: This article won't go deep into React, and it will require knowledge of the basics of JavaScript and React. If you want to learn more about making your React apps faster once you have them working, check out my post on [building high performance React applications](/talks/building-high-performance-react-applications/).

![Okay, now let’s jump in!](/images/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/lets-jump-in.gif)_Okay, now let’s jump in!_

### Set Up Your Account

To use the Web API, start by creating a Spotify user account (Premium or Free). To do that, simply sign up at [www.spotify.com](http://www.spotify.com/).

When you have a user account, go to the [Dashboard](https://developer.spotify.com/dashboard) page at the Spotify Developer website and, if necessary, log in. Accept the latest [Developer Terms of Service](https://developer.spotify.com/terms) to complete your account setup.

### Register Your Application

Any application can request data from Spotify Web API endpoints and many endpoints are open and will return data _without_ requiring registration. However, if your application seeks access to a user’s personal data (profile, playlists, etc.) it must be registered.

You can [register your application](https://developer.spotify.com/documentation/web-api/quick-start/), even before you have created it.

Go to the [Dashboard](https://developer.spotify.com/dashboard) page at the Spotify Developer website, and click on ‘My New App.”

![Spotify Developer Dashboard showing My New App button](/images/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/spotify-dashboard-setup.webp)

Fill out the information for your new app using the form as a guide. Then click Next.

![Spotify app registration form](/images/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/spotify-redirect-uri.webp)

Click on Edit Settings to continue your app registration.

![Spotify app Edit Settings button](/images/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/spotify-client-id.webp)

The most important thing is that you must put in a redirect URL. We are going to use the default URL of the Vite dev server. Enter `http://127.0.0.1:5173` in this field (Spotify no longer accepts `localhost` redirect URIs). This is the URL you want to be redirected to after a user has authenticated through Spotify.

![Setting the redirect URL in the Spotify app settings](/images/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/spotify-app-settings.webp)

Click “Save” and be sure to write down the Client ID from your application. And congrats, you’ve just registered your application and now we are ready to jump into the code.

![You did it!](/images/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/spotify-you-did-it.gif)_You did it!_

### Setting Up The Code

We are going to get started quickly by running [Vite](https://vite.dev/guide/) with its React template. You can do this by running the following commands in your terminal.

```bash
npm create vite@latest react-spotify-player -- --template react
cd react-spotify-player
npm install
npm install jquery
npm run dev -- --host 127.0.0.1
```

Open up the project in your favorite text editor and then let’s get our app authenticated to Spotify so we can get that juicy data. There are many ways to authenticate to Spotify, but we are going to use [Authorization Code with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow).

[PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow) is the flow Spotify recommends for apps like this one that run entirely in the browser and can't keep a client secret. Instead of a secret, the app makes a random code verifier, sends a SHA-256 hash of it (the code challenge) with the login request, and then sends the verifier itself when it trades the authorization code for an access token. I first wrote this post with the implicit grant flow, which Spotify removed in November 2025. The access tokens are short-lived (one hour).

We need to write some code that performs a couple of actions:

- We will redirect the user to the `/authorize` endpoint of the Accounts service, with `response_type=code` and the code challenge:

`GET [https://accounts.spotify.com/authorize](https://accounts.spotify.com/authorize)`

2. The user is asked to authorize access within the scopes. The Spotify Accounts service presents details of the [scopes](https://developer.spotify.com/documentation/web-api/concepts/scopes) for which access is being sought.

- If the user is not logged in, they are prompted to do so using their Spotify username and password.
- When the user is logged in, they are asked to authorize access to the data sets defined in the scopes.

3. The user is redirected back to your specified URI. After the user grants (or denies) access, the Spotify Accounts service redirects the user to the `redirect_uri` with an authorization `code` in the query string. In this example, the redirect address is: `http://127.0.0.1:5173`

4. The app sends that code, plus the code verifier it saved before the redirect, to `https://accounts.spotify.com/api/token` and gets back an access token.

In `src/App.jsx` add the following code:

```jsx
import React, { Component } from 'react';
import logo from './assets/react.svg';
import './App.css';

export const authEndpoint = 'https://accounts.spotify.com/authorize';
const tokenEndpoint = 'https://accounts.spotify.com/api/token';

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = 'YOUR_CLIENT_ID_GOES_HERE';
const redirectUri = 'http://127.0.0.1:5173';
const scopes = ['user-read-currently-playing', 'user-read-playback-state'];

// PKCE: base64url-encode bytes for the code verifier and code challenge
const base64url = (bytes) =>
	btoa(String.fromCharCode(...new Uint8Array(bytes)))
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');

// Make a code verifier, save it, and send its SHA-256 hash to Spotify
async function login() {
	const verifier = base64url(crypto.getRandomValues(new Uint8Array(64)));
	const challenge = base64url(
		await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)),
	);
	localStorage.setItem('code_verifier', verifier);

	const params = new URLSearchParams({
		client_id: clientId,
		response_type: 'code',
		redirect_uri: redirectUri,
		scope: scopes.join(' '),
		code_challenge_method: 'S256',
		code_challenge: challenge,
	});
	window.location.href = `${authEndpoint}?${params}`;
}

// Trade the code Spotify sent back (plus the saved verifier) for an access token
async function getToken(code) {
	const response = await fetch(tokenEndpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: clientId,
			grant_type: 'authorization_code',
			code,
			redirect_uri: redirectUri,
			code_verifier: localStorage.getItem('code_verifier'),
		}),
	});
	if (!response.ok) throw new Error(`Token request failed: ${response.status}`);
	const data = await response.json();
	return data.access_token;
}

class App extends Component {
	state = { token: null };

	async componentDidMount() {
		const code = new URLSearchParams(window.location.search).get('code');
		if (code) {
			// Clear ?code= from the address bar so it isn't used twice
			window.history.replaceState({}, '', '/');
			const _token = await getToken(code);
			// Set token
			this.setState({
				token: _token,
			});
		}
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					{!this.state.token && (
						<button className="btn btn--loginApp-link" onClick={login}>
							Login to Spotify
						</button>
					)}
					{this.state.token &&
						// Spotify Player Will Go Here In the Next Step
						null}
				</header>
			</div>
		);
	}
}

export default App;
```

This code snippet creates a “Login With Spotify” button that redirects the user to authenticate with Spotify. When Spotify sends the user back with a code, the app trades it for an access token that we will then use to make a request to the Spotify API.

Now, let’s add a function that will call the Spotify API and return the data. You will need to add the additional info.

```jsx
import $ from "jquery";
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
    is_playing: false,
    progress_ms: 0
  };

  this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
  }

  async componentDidMount() {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      // Clear ?code= from the address bar so it isn't used twice
      window.history.replaceState({}, "", "/");
      const _token = await getToken(code);
      // Set token
      this.setState({
        token: _token
      });
      this.getCurrentlyPlaying(_token);
    }
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
        // Spotify answers 204 with no body when nothing is playing
        if (!data) return;
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

Then, of course, we need to make the actual player. We will first need to create a new Player component called `Player.jsx` .

```jsx
import React from 'react';
import './Player.css';

const Player = (props) => {
	const backgroundStyles = {
		backgroundImage: `url(${props.item.album.images[0].url})`,
	};

	const progressBarStyles = {
		width: (props.progress_ms * 100) / props.item.duration_ms + '%',
	};

	return (
		<div className="App">
			<div className="main-wrapper">
				<div className="now-playing__img">
					<img src={props.item.album.images[0].url} />
				</div>
				<div className="now-playing__side">
					<div className="now-playing__name">{props.item.name}</div>
					<div className="now-playing__artist">{props.item.artists[0].name}</div>
					<div className="now-playing__status">{props.is_playing ? 'Playing' : 'Paused'}</div>
					<div className="progress">
						<div className="progress__bar" style={progressBarStyles} />
					</div>
				</div>
				<div className="background" style={backgroundStyles} />{' '}
			</div>
		</div>
	);
};

export default Player;
```

Here’s the CSS for `Player.css` .

```css
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

Then in your `App.jsx` you will need to pass in the data from Spotify to your Player component.

```jsx
class App extends Component {

  ...

  render() {
    return (
      <div className="App">
        <header className="App-header">
   ...

      {this.state.token && (
        <Player
          item={this.state.item}
          is_playing={this.state.is_playing}
          progress_ms={this.state.progress_ms}
        />
      )}
        </header>
      </div>
  );
 }
}
```

And that’s all the code you’ll need. By this step, your app should look and work like this.

![Finished React Spotify player app demo](/images/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/spotify-web-player-demo.gif)

And that’s it!

![You did it!](/images/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/spotify-final-result.gif)_You did it!_

For questions or comments, [open an issue in the repo](https://github.com/JoeKarlsson/react-spotify-player/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc).

> You can find the source code for this tutorial here: [JoeKarlsson/react-spotify-player on GitHub](https://github.com/JoeKarlsson/react-spotify-player)
