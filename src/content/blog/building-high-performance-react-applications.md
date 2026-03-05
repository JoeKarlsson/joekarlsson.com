---
title: 'Building High Performance React Applications'
date: 2018-11-14
slug: 'building-high-performance-react-applications'
description: 'Okay, we all know that React was built with performance in mind, but when is React slow? I want to break down for you, dear reader, common bottlenecks in React and when you might be making your...'
categories: ['Dev Tools']
heroImage: '/images/blog/building-high-performance-react-applications/1_4Lrdmxs5FVMlqK3b8cwcTA.webp'
---

> **Note:** This post was written in 2018 for React 16 class components. Modern React uses function components with hooks (`React.memo`, `useMemo`, `useCallback`) for performance optimization. The concepts here are still useful background, but check the [current React docs](https://react.dev/reference/react/memo) for up-to-date guidance.

Okay, we all know that React was built with performance in mind, but when is React slow? I want to break down for you, dear reader, common bottlenecks in React and when you might be making your program work harder than it should. In this post, I will show you how you can start building high performance React Applications.

First of all, we need to set a baseline. How the heck do we measure performance in a React Application? Well, I am glad you asked! As of React 16, [React has a performance monitoring tool baked into the vanilla development mode of React](https://react.dev/reference/react/memo)!

Okay, let’s check it out. When you are in a **development** build, you can now perform a performance audit and see how your React components are spending their time. This feature can be used to fine-tune your app and find expensive components and methods. This is also the tool we will be using to measure the performance of our app.

![Chrome DevTools React performance profiling tab](/images/blog/building-high-performance-react-applications/0-OVVNvjti__wCFwDx.webp)

I’m not going to go into great detail about how this tool works, but if you want a more detailed walk-through, check out [this article by Ben Schwarz](https://building.calibreapp.com/debugging-react-performance-with-react-16-and-chrome-devtools-c90698a522ad).

For example, let’s try it out. I have [built the least performant React application possible](https://github.com/JoeKarlsson/high-performance-react-demo), you can check out the code here on my [GitHub](https://github.com/JoeKarlsson/high-performance-react-demo).

Let’s go through and see how these tips boost the performance of our crummy ‘lil app.

![The initial performance audit of our slow React app](/images/blog/building-high-performance-react-applications/PX6E9HQ3uJorvXAzv0rEvg.gif)_The initial performance audit of our slow React app_

As we update items on this list, we can see through the performance audit that every time I add a new item to the list through the form, _every single item_ in the list has to be re-rendered to the DOM. This process takes approximately _34 ms_ for every single re-render.

Now that we know how to measure performance on a React application and we have a performance baseline, let’s get to the thing that you came to this blog post to learn about. How exactly do you make a high-performance React app? _Well, the short answer is only rendered to the DOM when you really need to._ The long answer is a little more involved… 😉

Using our example app, and our initial analysis, we see that there is a LOT of re-rendering happening when new items are added. We want to tell React to only re-render the parts of the app that we care about. Let’s dig into specific ways to accomplish this.

---

### Use 🔑Key🔑 Correctly

So, who has had this happen to them before? You are writing a react app and you start looping over a list of data and you are dynamically creating React nodes. All is fine and your app is rendering to the DOM just fine, but you see this little warning pop up for you in the console.

![Console warning you should see if you do not supply a key](/images/blog/building-high-performance-react-applications/-w6avZfftP7Uckvy7_a0zw.webp)_Console warning you should see if you do not supply a key_

I don’t know about you, but the first thing I did was put in `Math.Random()` in the key field, and BOOM, the warning magically disappeared! Problem solved! Well, not so fast, it turns out that even though React is no longer complaining, you are actually messing with how React keeps track of those nodes in the virtual DOM.

![Sonic says “Do not abuse the key!”](/images/blog/building-high-performance-react-applications/Kj5C5bwv7XC0DLpllhX9zg.gif)_Sonic says “Do not abuse the key!”_

The key attribute is actually used by React to keep track of and identify unique nodes. This element allows React to easily keep track of how your application changes and helps it decide if it needs to re-render to the DOM or not. And by using `Math.Random()` or the index in an array to track the unique key, every single time the list re-renders or the data changes, React loses track of your element and has to start over from scratch. You can learn more about how the key is used [here](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key). **Do not forget to supply an appropriate key!**

So how does using the _key_ attribute correctly affect our performance? Let’s check it out!

![Performance comparison showing render time drop from 34ms to 16ms with keys](/images/blog/building-high-performance-react-applications/KU08TdKUInB7duKPVnM4ow.gif)

We went from _34 ms to 16 ms_. We just cut the render time in **half** by using keys correctly!

---

### Manage `shouldComponentUpdate()`

[`shouldComponentUpdate()`](https://react.dev/reference/react/Component#shouldcomponentupdate)is a React life cycle method used to improve the performance of React applications by defining exactly when you want your component to re-render. By default, React will re-render your component each and every time the state or props change. However, there might be instances when you do not want your component even if your state has changed.

In this example, we are passing in the _nextProps_ and _nextState_ and we are returning a boolean that reports the state/prop changes that we actually care about and that we actually want to re-render on. React is able to ignore all other changes. Here’s the code of how the use `shouldComponentUpdate()`.

```jsx
class Item extends Component {
	shouldComponentUpdate(nextProps, nextState) {
		if (this.props.title !== nextProps.title) {
			return true;
		}
		return false;
	}
	render() {
		return <h3>{this.props.title}</h3>;
	}
}
```

When we take control and tell React about the state changes that we care about, how does that affect our re-render time?

![Performance audit after implementing shouldComponentUpdate()](/images/blog/building-high-performance-react-applications/hvGQEyr8Smp6EoriPhzRTg.gif)_Performance audit after implementing shouldComponentUpdate()_

We’ve cut the re-render time from approximately _16 ms to 9 ms_. We’ve nearly cut the render time in **half** again!

![GOTTA GO FAST!](/images/blog/building-high-performance-react-applications/G5d24wwTOh6gOx6Ax8UJMQ.gif)_GOTTA GO FAST!_

---

### Extend ✨ PureComponent ✨

`shouldComponentUpdate()` is wonderful and it does great things for helping improve the performance of our React applications, but you should consider using the built-in PureComponent instead of writing `shouldComponentUpdate()` by hand. A PureComponent performs a shallow comparison of props and state and reduces the chance that you’ll skip a necessary update.

When React is performing a shallow comparison, it treats scalar values differently from objects. When it is comparing scalar values (numbers, strings) it compares their values. When comparing objects, it does not compare their’s attributes - only their references are compared (e.g. “do they point to the same object?). This gif shows how JavaScript performs a deep or shallow comparison

![Shallow vs deep comparison of JavaScript objects](/images/blog/building-high-performance-react-applications/uL63s4lQc9Yfv-Lx-Twc1g.gif)

A shallow comparison is an efficient way to detect changes. It should be noted that shallow comparisons, expect that you don’t mutate data (which we will address when we talk about in the immutable data section below).

So, what does a PureComponent look like in code? For those who want a real code snippet, here it is:

```jsx
class Item extends PureComponent {
	render() {
		return <h3>{this.props.title}</h3>;
	}
}
```

For those who want to see the dramatic reduction and increased clarity PureComponents brings overusing `shouldComponentUpdate()`, check out this incredible gif I made!

![Look at the dramatic reduction and increased clarity PureComponents brings overusing `shouldComponentUpdate()`](/images/blog/building-high-performance-react-applications/QAuPqdDxw_qFL-I-g2SFlw.gif)_Look at the dramatic reduction and increased clarity PureComponents brings overusing `shouldComponentUpdate()`_

Isn’t it so much shorter and easier to read than before? This gif perfectly sums up how I feel after I refactor a codebase to use PureComponents.

![Doesn’t it feel good to not have to write all that code?](/images/blog/building-high-performance-react-applications/9GZke3-EUsFiLkfpAEjCQw.gif)_Doesn’t it feel good to not have to write all that code?_

Okay, so it looks pretty, but do PureComponents actually make our application perform faster? If it is truly a replacement for `shouldComponentUpdate()`, then we should expect that the performance boost should be equivalent.

![PureComponents give you the same performance boost as shouldComponentUpdate()](/images/blog/building-high-performance-react-applications/FkL-tpXLhGanzkElPuYM1w.gif)_PureComponents give you the same performance boost as shouldComponentUpdate()_

We can see that we see exactly the same performance gains as when we use `shouldComponentUpdate()`. Yahoo!

---

### Use 🔒Immutable🔒 Data

Immutable is one of those fancy programming words you’ve probably heard tossed around, but you might not know what it means. _Immutable_ is a fancy word that means instead of changing data you are instead _making new copies of objects/arrays_. Using immutable data in your React app allows the React diffing algorithm to make tracking the changes to your app cheap. Below is an example of how differences are tracked with Mutable and Immutable data. In the first mutable example, JavaScript needs to check each key in the object to check for differences, but in the Immutable example, JavaScript is able to check if the object pointer is in a different memory location. This is SO MUCH FASTER!

![Shallow vs deep comparison of JavaScript objects](/images/blog/building-high-performance-react-applications/uL63s4lQc9Yfv-Lx-Twc1g.gif)

For more information on how immutable data helps improve the performance of your React application, check out this info straight from the source.

[https://react.dev/reference/react/memo#using-immutable-data-structures](https://react.dev/reference/react/memo#using-immutable-data-structures)

---

### Use Stateless Components

Okay, to be honest, I’m not exactly sure why using stateless components is faster than using React components with state, but Dan Abramov reports that in version 16+ of React, stateless components give a small performance boost. I haven’t actually seen any information or explanation about why is this, but if Dan says it’s true, so I believe it. If anyone has any info on why this is, please let me know in the comments below.

![Tweet from Dan explaining that Stateless Components are faster in React 16+](/images/blog/building-high-performance-react-applications/NmmaaQ3rskKL-RqdA3sOnA.webp)_Tweet from Dan explaining that Stateless Components are faster in React 16+_

---

### Go Universal

Universal (or Isomorphic) React won’t make your whole application faster, but it will make your component _initial render_ go much faster. And sometimes, performance is all about making your user think you are fast 😉

Universal rendering works by performing the initial render of your React component on the server. The server then sends a pre-rendered HTML string of your initial render, CSS, and JS. This can be easily cached on your servers to further reduce and reuse your initial render. Using Universal React allows the users of your application to see and interact with your site while React is still firing up behind the scenes.

![The flow of how Isomorphic React component render on the client](/images/blog/building-high-performance-react-applications/Nwq2l68Z9OfFwPc-Lf0yxg.gif)_The flow of how Isomorphic React component render on the client_

Universal React works great if you have a humongous app that takes a long time to do the initial render. You can find out more information about isomorphic React here:

[https://www.smashingmagazine.com/2015/04/react-to-the-future-with-isomorphic-apps/](https://www.smashingmagazine.com/2015/04/react-to-the-future-with-isomorphic-apps/)

---

### ⚡️ Build React for Production ⚡️

When you are building your React component on your development machine, it is expected that you build it using **development** mode. This is because this mode includes a bunch of helpful tools to help you debug your application. Development mode includes the performance audit tool that has been used to benchmark our app. However, when you run your app in **production** mode, React automatically strips out all of the development tools and builds a minified version that runs faster in the browser. The **production** build can even make your app run _two to eight times_ faster! Let’s check it out.

![Running our app in “Production” mode](/images/blog/building-high-performance-react-applications/Sg1QXgg0aQXVT-74ColsBw.gif)_Running our app in “Production” mode_

When running the **production** build, the performance auditing tool has been removed. Since this is missing, we will now look at how quickly the component can repaint the DOM after an update using the default performance tools in Chrome. With the production build of our app, we can see that we now re-paint in _6 ms. Woohoo!_

More information about building your React app in production mode can be found here.

[https://react.dev/reference/react/memo#use-the-production-build](https://react.dev/reference/react/memo#use-the-production-build)

---

### Analyze Your Webpack Bundle 🔬

This tip isn’t exactly React specific, but most of us use Webpack as their bundler with React, and I have found that this is actually one of the _most beneficial_ things we have implemented to make our React apps faster.

We have started to add a Webpack analysis into our development workflow. Using Webpack Bundle Analyzer, we check to make sure that nothing unexpected has made its way into our final bundle. We also use this step to ensure that there are no unexpectedly large packages have slipped in.

Analyzing your bundle and reducing bundle size is important to improve application performance because the more data you are sending across the internet tubes, the slower it takes to get to the end-user and the longer it takes to parse and load the bundle.

Our team has included Webpack Bundle Analyzer in our build process to help keep the package size under control. It’s easy for us to pull in a new npm package in order to provide a quick fix for our app, but oftentimes, it’s not clear how that actually impacts our final bundle size.

[https://github.com/webpack-contrib/webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)

---

### Make It Work, Then Make It Fast 🏃💨

I personally believe that this is the most important point of all. When building any application, you should focus on getting your app working first, and only focus on making it fast once you have it released and you see that you have performance issues (note: this is generally true, however, I am aware that there are situations where you need to focus on speed from the very beginning).

Oftentimes, I see engineers too focused on making a “perfect” app that they fail to ever finish it and release it. Releasing an app (even if it’s not perfect) is even more important when working on a professional software project.

---

Alright, let’s recap everything learned. If you want to make your React applications fast you should do the following:

- Use 🔑key🔑 correctly
- Manage `shouldComponentUpdate()`
- Extend ✨ PureComponent ✨
- Use 🔒immutable🔒 data
- Use stateless components
- Go universal
- ⚡️ Build React for production ⚡️
- Analyze your Webpack bundle 🔬
- Make it work, then make it fast 🏃💨

There you have it, I hope these are some practical and easy-to-implement things you can do to start making your React apps faster. If you want to see these ideas in action, check out my tutorial on [how to build a Spotify player with React in 15 minutes](/blog/how-to-build-a-spotify-player-with-react-in-15-minutes/). If I missed anything, please feel free to let me know in the comments below.

![Thanks for reading!](/images/blog/building-high-performance-react-applications/H1l9k2ruGjHDxqmoHgaD1Q.gif)_Thanks for reading!_
