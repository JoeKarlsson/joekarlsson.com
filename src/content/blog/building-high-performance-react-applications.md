---
title: "Building High Performance React Applications"
date: 2018-11-14
slug: "building-high-performance-react-applications"
description: "Okay, we all know that React was built with performance in mind, but when is React slow? I want to break down for you, dear reader, common bottlenecks in React and when you might be making your..."
categories: ["Blog"]
heroImage: "/images/blog/building-high-performance-react-applications/1_4Lrdmxs5FVMlqK3b8cwcTA.png"
---

Okay, we all know that React was built with performance in mind, but when is React slow? I want to break down for you, dear reader, common bottlenecks in React and when you might be making your program work harder than it should. In this post, I will show you how you can start building high performance React Applications.

First of all, we need to set a baseline. How the heck do we measure performance in a React Application? Well, I am glad you asked! As of React 16, [React has a performance monitoring tool baked into the vanilla development mode of React](https://reactjs.org/docs/optimizing-performance.html#profiling-components-with-the-chrome-performance-tab)!

Okay, let’s check it out. When you are in a **development** build, you can now perform a performance audit and see how your React components are spending their time. This feature can be used to fine-tune your app and find expensive components and methods. This is also the tool we will be using to measure the performance of our app.

![](https://i0.wp.com/cdn-images-1.medium.com/max/1600/0*OVVNvjti__wCFwDx.png?w=846&ssl=1)

I’m not going to go into great detail about how this tool works, but if you want a more detailed walk-through, check out [this article by Ben Schwarz](https://building.calibreapp.com/debugging-react-performance-with-react-16-and-chrome-devtools-c90698a522ad).

For example, let’s try it out. I have [built the least performant React application possible](https://github.com/JoeKarlsson/high-performance-react-demo), you can check out the code here on my [GitHub](https://github.com/JoeKarlsson/high-performance-react-demo).

Let’s go through and see how these tips boost the performance of our crummy ‘lil app.

![](https://i0.wp.com/cdn-images-1.medium.com/max/2000/1*PX6E9HQ3uJorvXAzv0rEvg.gif?w=846&ssl=1)*The initial performance audit of our slow React app*

As we update items on this list, we can see through the performance audit that every time I add a new item to the list through the form, *every single item* in the list has to be re-rendered to the DOM. This process takes approximately* 34 ms* for every single re-render.

Now that we know how to measure performance on a React application and we have a performance baseline, let’s get to the thing that you came to this blog post to learn about. How exactly do you make a high-performance React app? *Well, the short answer is only rendered to the DOM when you really need to. *The long answer is a little more involved… 😉

Using our example app, and our initial analysis, we see that there is a LOT of re-rendering happening when new items are added. We want to tell React to only re-render the parts of the app that we care about. Let’s dig into specific ways to accomplish this.

---

### Use 🔑Key🔑 Correctly

So, who has had this happen to them before? You are writing a react app and you start looping over a list of data and you are dynamically creating React nodes. All is fine and your app is rendering to the DOM just fine, but you see this little warning pop up for you in the console.

![](https://i2.wp.com/cdn-images-1.medium.com/max/1600/1*-w6avZfftP7Uckvy7_a0zw.png?w=846&ssl=1)*Console warning you should see if you do not supply a key*

I don’t know about you, but the first thing I did was put in `Math.Random()` in the key field, and BOOM, the warning magically disappeared! Problem solved! Well, not so fast, it turns out that even though React is no longer complaining, you are actually messing with how React keeps track of those nodes in the virtual DOM.

![](https://i0.wp.com/cdn-images-1.medium.com/max/1600/1*Kj5C5bwv7XC0DLpllhX9zg.gif?w=846&ssl=1)*Sonic says “Do not abuse the key!”*

The key attribute is actually used by React to keep track of and identify unique nodes. This element allows React to easily keep track of how your application changes and helps it decide if it needs to re-render to the DOM or not. And by using `Math.Random()` or the index in an array to track the unique key, every single time the list re-renders or the data changes, React loses track of your element and has to start over from scratch. You can learn more about how the key is used [here](https://reactjs.org/docs/lists-and-keys.html). **Do not forget to supply an appropriate key!**

So how does using the *key* attribute correctly affect our performance? Let’s check it out!

![](https://i0.wp.com/cdn-images-1.medium.com/max/2000/1*KU08TdKUInB7duKPVnM4ow.gif?w=846&ssl=1)

We went from* 34 ms to 16 ms*. We just cut the render time in **half** by using keys correctly!

---

### Manage `shouldComponentUpdate()`

`[shouldComponentUpdate](https://reactjs.org/docs/react-component.html#shouldcomponentupdate)()`is a React life cycle method used to improve the performance of React applications by defining exactly when you want your component to re-render. By default, React will re-render your component each and every time the state or props change. However, there might be instances when you do not want your component even if your state has changed.

In this example, we are passing in the *nextProps* and *nextState* and we are returning a boolean that reports the state/prop changes that we actually care about and that we actually want to re-render on. React is able to ignore all other changes. Here’s the code of how the use `shouldComponentUpdate()`.

```
class Item extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.title !== nextProps.title) {
      return true;
    }
    return false;
  }
  render() {
    return <h3>{ this.props.title }</h3>
  }
};
```

When we take control and tell React about the state changes that we care about, how does that affect our re-render time?

![](https://i0.wp.com/cdn-images-1.medium.com/max/2000/1*hvGQEyr8Smp6EoriPhzRTg.gif?w=846&ssl=1)*Performance audit after implementing shouldComponentUpdate()*

We’ve cut the re-render time from approximately *16 ms to 9 ms*. We’ve nearly cut the render time in **half** again!

![](https://i0.wp.com/cdn-images-1.medium.com/max/1600/1*G5d24wwTOh6gOx6Ax8UJMQ.gif?w=846&ssl=1)*GOTTA GO FAST!*

---

### Extend ✨ PureComponent ✨

`shouldComponentUpdate()` is wonderful and it does great things for helping improve the performance of our React applications, but you should consider using the built-in PureComponent instead of writing `shouldComponentUpdate()` by hand. A PureComponent performs a shallow comparison of props and state and reduces the chance that you’ll skip a necessary update.

When React is performing a shallow comparison, it treats scalar values differently from objects. When it is comparing scalar values (numbers, strings) it compares their values. When comparing objects, it does not compare their’s attributes — only their references are compared (e.g. “do they point to the same object?). This gif shows how JavaScript performs a deep or shallow comparison

![](https://i0.wp.com/cdn-images-1.medium.com/max/1600/1*uL63s4lQc9Yfv-Lx-Twc1g.gif?w=846&ssl=1)

A shallow comparison is an efficient way to detect changes. It should be noted that shallow comparisons, expect that you don’t mutate data (which we will address when we talk about in the immutable data section below).

So, what does a PureComponent look like in code? For those who want a real code snippet, here it is:

```
class Item extends **PureComponent** {
render() {
    return <h3>{ this.props.title }</h3>
  }
};
```

For those who want to see the dramatic reduction and increased clarity PureComponents brings overusing `shouldComponentUpdate()`, check out this incredible gif I made!

![](https://i2.wp.com/cdn-images-1.medium.com/max/1600/1*QAuPqdDxw_qFL-I-g2SFlw.gif?w=846&ssl=1)*Look at the dramatic reduction and increased clarity PureComponents brings overusing `shouldComponentUpdate()`*

Isn’t it so much shorter and easier to read than before? This gif perfectly sums up how I feel after I refactor a codebase to use PureComponents.

![](https://i0.wp.com/cdn-images-1.medium.com/max/1600/1*9GZke3-EUsFiLkfpAEjCQw.gif?w=846&ssl=1)*Doesn’t it feel good to not have to write all that code?*

Okay, so it looks pretty, but do PureComponents actually make our application perform faster? If it is truly a replacement for `shouldComponentUpdate()`, then we should expect that the performance boost should be equivalent.

![](https://i0.wp.com/cdn-images-1.medium.com/max/2000/1*FkL-tpXLhGanzkElPuYM1w.gif?w=846&ssl=1)*PureComponents give you the same performance boost as shouldComponentUpdate()*

We can see that we see exactly the same performance gains as when we use `shouldComponentUpdate()`. Yahoo!

---

### Use 🔒Immutable🔒 Data

Immutable is one of those fancy programming words you’ve probably heard tossed around, but you might not know what it means. *Immutable* is a fancy word that means instead of changing data you are instead *making new copies of objects/arrays*. Using immutable data in your React app allows the React diffing algorithm to make tracking the changes to your app cheap. Below is an example of how differences are tracked with Mutable and Immutable data. In the first mutable example, JavaScript needs to check each key in the object to check for differences, but in the Immutable example, JavaScript is able to check if the object pointer is in a different memory location. This is SO MUCH FASTER!

![](https://i0.wp.com/cdn-images-1.medium.com/max/1600/1*uL63s4lQc9Yfv-Lx-Twc1g.gif?w=846&ssl=1)

For more information on how immutable data helps improve the performance of your React application, check out this info straight from the source.

[https://reactjs.org/docs/optimizing-performance.html#using-immutable-data-structures](https://reactjs.org/docs/optimizing-performance.html#using-immutable-data-structures)

---

### Use Stateless Components

Okay, to be honest, I’m not exactly sure why using stateless components is faster than using React components with state, but Dan Abramov reports that in version 16+ of React, stateless components give a small performance boost. I haven’t actually seen any information or explanation about why is this, but if Dan says it’s true, so I believe it. If anyone has any info on why this is, please let me know in the comments below.

![](https://i1.wp.com/cdn-images-1.medium.com/max/1600/1*NmmaaQ3rskKL-RqdA3sOnA.png?w=846&ssl=1)*Tweet from Dan explaining that Stateless Components are faster in React 16+*

---

### Go Universal

Universal (or Isomorphic) React won’t make your whole application faster, but it will make your component *initial render* go much faster. And sometimes, performance is all about making your user think you are fast 😉

Universal rendering works by performing the initial render of your React component on the server. The server then sends a pre-rendered HTML string of your initial render, CSS, and JS. This can be easily cached on your servers to further reduce and reuse your initial render. Using Universal React allows the users of your application to see and interact with your site while React is still firing up behind the scenes.

![](https://i1.wp.com/cdn-images-1.medium.com/max/1600/1*Nwq2l68Z9OfFwPc-Lf0yxg.gif?w=846&ssl=1)*The flow of how Isomorphic React component render on the client*

Universal React works great if you have a humongous app that takes a long time to do the initial render. You can find out more information about isomorphic React here:

[https://www.smashingmagazine.com/2015/04/react-to-the-future-with-isomorphic-apps/](https://www.smashingmagazine.com/2015/04/react-to-the-future-with-isomorphic-apps/)

---

### ⚡️ Build React for Production ⚡️

When you are building your React component on your development machine, it is expected that you build it using **development** mode. This is because this mode includes a bunch of helpful tools to help you debug your application. Development mode includes the performance audit tool that has been used to benchmark our app. However, when you run your app in **production** mode, React automatically strips out all of the development tools and builds a minified version that runs faster in the browser. In fact, the **production** build can even make your app run *two to eight times* faster! Let’s check it out.

![](https://i0.wp.com/cdn-images-1.medium.com/max/2000/1*Sg1QXgg0aQXVT-74ColsBw.gif?w=846&ssl=1)*Running our app in “Production” mode*

When running the **production** build, the performance auditing tool has been removed. Since this is missing, we will now look at how quickly the component can repaint the DOM after an update using the default performance tools in Chrome. With the production build of our app, we can see that we now re-paint in *6 ms. Woohoo!*

More information about building your React app in production mode can be found here.

[https://reactjs.org/docs/optimizing-performance.html#use-the-production-build](https://reactjs.org/docs/optimizing-performance.html#use-the-production-build)

---

### Analyze Your Webpack Bundle 🔬

This tip isn’t exactly React specific, but most of us use Webpack as their bundler with React, and I have found that this is actually one of the *most beneficial *things we have implemented to make our React apps faster.

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

- Use 🔑key🔑 correctly- Manage `shouldComponentUpdate()`- Extend ✨ PureComponent ✨- Use 🔒immutable🔒 data- Use stateless components- Go universal- ⚡️ Build React for production ⚡️- Analyze your Webpack bundle 🔬- Make it work, then make it fast 🏃💨

There you have it, I hope these are some practical and easy-to-implement things you can do to start making your React apps faster. If I missed anything, please feel free to let me know in the comments below.

![](https://i0.wp.com/cdn-images-1.medium.com/max/1600/1*H1l9k2ruGjHDxqmoHgaD1Q.gif?w=846&ssl=1)*Thanks for reading!*

## Follow Joe Karlsson on Social

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M22.23,5.924c-0.736,0.326-1.527,0.547-2.357,0.646c0.847-0.508,1.498-1.312,1.804-2.27 c-0.793,0.47-1.671,0.812-2.606,0.996C18.324,4.498,17.257,4,16.077,4c-2.266,0-4.103,1.837-4.103,4.103 c0,0.322,0.036,0.635,0.106,0.935C8.67,8.867,5.647,7.234,3.623,4.751C3.27,5.357,3.067,6.062,3.067,6.814 c0,1.424,0.724,2.679,1.825,3.415c-0.673-0.021-1.305-0.206-1.859-0.513c0,0.017,0,0.034,0,0.052c0,1.988,1.414,3.647,3.292,4.023 c-0.344,0.094-0.707,0.144-1.081,0.144c-0.264,0-0.521-0.026-0.772-0.074c0.522,1.63,2.038,2.816,3.833,2.85 c-1.404,1.1-3.174,1.756-5.096,1.756c-0.331,0-0.658-0.019-0.979-0.057c1.816,1.164,3.973,1.843,6.29,1.843 c7.547,0,11.675-6.252,11.675-11.675c0-0.178-0.004-0.355-0.012-0.531C20.985,7.47,21.68,6.747,22.23,5.924z"></path></svg>Twitter](https://twitter.com/JoeKarlsson1)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M19.7,3H4.3C3.582,3,3,3.582,3,4.3v15.4C3,20.418,3.582,21,4.3,21h15.4c0.718,0,1.3-0.582,1.3-1.3V4.3 C21,3.582,20.418,3,19.7,3z M8.339,18.338H5.667v-8.59h2.672V18.338z M7.004,8.574c-0.857,0-1.549-0.694-1.549-1.548 c0-0.855,0.691-1.548,1.549-1.548c0.854,0,1.547,0.694,1.547,1.548C8.551,7.881,7.858,8.574,7.004,8.574z M18.339,18.338h-2.669 v-4.177c0-0.996-0.017-2.278-1.387-2.278c-1.389,0-1.601,1.086-1.601,2.206v4.249h-2.667v-8.59h2.559v1.174h0.037 c0.356-0.675,1.227-1.387,2.526-1.387c2.703,0,3.203,1.779,3.203,4.092V18.338z"></path></svg>LinkedIn](https://www.linkedin.com/in/joekarlsson/)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12,2C6.477,2,2,6.477,2,12c0,4.419,2.865,8.166,6.839,9.489c0.5,0.09,0.682-0.218,0.682-0.484 c0-0.236-0.009-0.866-0.014-1.699c-2.782,0.602-3.369-1.34-3.369-1.34c-0.455-1.157-1.11-1.465-1.11-1.465 c-0.909-0.62,0.069-0.608,0.069-0.608c1.004,0.071,1.532,1.03,1.532,1.03c0.891,1.529,2.341,1.089,2.91,0.833 c0.091-0.647,0.349-1.086,0.635-1.337c-2.22-0.251-4.555-1.111-4.555-4.943c0-1.091,0.39-1.984,1.03-2.682 C6.546,8.54,6.202,7.524,6.746,6.148c0,0,0.84-0.269,2.75,1.025C10.295,6.95,11.15,6.84,12,6.836 c0.85,0.004,1.705,0.114,2.504,0.336c1.909-1.294,2.748-1.025,2.748-1.025c0.546,1.376,0.202,2.394,0.1,2.646 c0.64,0.699,1.026,1.591,1.026,2.682c0,3.841-2.337,4.687-4.565,4.935c0.359,0.307,0.679,0.917,0.679,1.852 c0,1.335-0.012,2.415-0.012,2.741c0,0.269,0.18,0.579,0.688,0.481C19.138,20.161,22,16.416,22,12C22,6.477,17.523,2,12,2z"></path></svg>GitHub](https://github.com/JoeKarlsson)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12,4.622c2.403,0,2.688,0.009,3.637,0.052c0.877,0.04,1.354,0.187,1.671,0.31c0.42,0.163,0.72,0.358,1.035,0.673 c0.315,0.315,0.51,0.615,0.673,1.035c0.123,0.317,0.27,0.794,0.31,1.671c0.043,0.949,0.052,1.234,0.052,3.637 s-0.009,2.688-0.052,3.637c-0.04,0.877-0.187,1.354-0.31,1.671c-0.163,0.42-0.358,0.72-0.673,1.035 c-0.315,0.315-0.615,0.51-1.035,0.673c-0.317,0.123-0.794,0.27-1.671,0.31c-0.949,0.043-1.233,0.052-3.637,0.052 s-2.688-0.009-3.637-0.052c-0.877-0.04-1.354-0.187-1.671-0.31c-0.42-0.163-0.72-0.358-1.035-0.673 c-0.315-0.315-0.51-0.615-0.673-1.035c-0.123-0.317-0.27-0.794-0.31-1.671C4.631,14.688,4.622,14.403,4.622,12 s0.009-2.688,0.052-3.637c0.04-0.877,0.187-1.354,0.31-1.671c0.163-0.42,0.358-0.72,0.673-1.035 c0.315-0.315,0.615-0.51,1.035-0.673c0.317-0.123,0.794-0.27,1.671-0.31C9.312,4.631,9.597,4.622,12,4.622 M12,3 C9.556,3,9.249,3.01,8.289,3.054C7.331,3.098,6.677,3.25,6.105,3.472C5.513,3.702,5.011,4.01,4.511,4.511 c-0.5,0.5-0.808,1.002-1.038,1.594C3.25,6.677,3.098,7.331,3.054,8.289C3.01,9.249,3,9.556,3,12c0,2.444,0.01,2.751,0.054,3.711 c0.044,0.958,0.196,1.612,0.418,2.185c0.23,0.592,0.538,1.094,1.038,1.594c0.5,0.5,1.002,0.808,1.594,1.038 c0.572,0.222,1.227,0.375,2.185,0.418C9.249,20.99,9.556,21,12,21s2.751-0.01,3.711-0.054c0.958-0.044,1.612-0.196,2.185-0.418 c0.592-0.23,1.094-0.538,1.594-1.038c0.5-0.5,0.808-1.002,1.038-1.594c0.222-0.572,0.375-1.227,0.418-2.185 C20.99,14.751,21,14.444,21,12s-0.01-2.751-0.054-3.711c-0.044-0.958-0.196-1.612-0.418-2.185c-0.23-0.592-0.538-1.094-1.038-1.594 c-0.5-0.5-1.002-0.808-1.594-1.038c-0.572-0.222-1.227-0.375-2.185-0.418C14.751,3.01,14.444,3,12,3L12,3z M12,7.378 c-2.552,0-4.622,2.069-4.622,4.622S9.448,16.622,12,16.622s4.622-2.069,4.622-4.622S14.552,7.378,12,7.378z M12,15 c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S13.657,15,12,15z M16.804,6.116c-0.596,0-1.08,0.484-1.08,1.08 s0.484,1.08,1.08,1.08c0.596,0,1.08-0.484,1.08-1.08S17.401,6.116,16.804,6.116z"></path></svg>Instagram](https://www.instagram.com/joekarlsson/)

- [<svg width="24" height="24" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M16.708 0.027c1.745-0.027 3.48-0.011 5.213-0.027 0.105 2.041 0.839 4.12 2.333 5.563 1.491 1.479 3.6 2.156 5.652 2.385v5.369c-1.923-0.063-3.855-0.463-5.6-1.291-0.76-0.344-1.468-0.787-2.161-1.24-0.009 3.896 0.016 7.787-0.025 11.667-0.104 1.864-0.719 3.719-1.803 5.255-1.744 2.557-4.771 4.224-7.88 4.276-1.907 0.109-3.812-0.411-5.437-1.369-2.693-1.588-4.588-4.495-4.864-7.615-0.032-0.667-0.043-1.333-0.016-1.984 0.24-2.537 1.495-4.964 3.443-6.615 2.208-1.923 5.301-2.839 8.197-2.297 0.027 1.975-0.052 3.948-0.052 5.923-1.323-0.428-2.869-0.308-4.025 0.495-0.844 0.547-1.485 1.385-1.819 2.333-0.276 0.676-0.197 1.427-0.181 2.145 0.317 2.188 2.421 4.027 4.667 3.828 1.489-0.016 2.916-0.88 3.692-2.145 0.251-0.443 0.532-0.896 0.547-1.417 0.131-2.385 0.079-4.76 0.095-7.145 0.011-5.375-0.016-10.735 0.025-16.093z" /></svg>TikTok](https://www.tiktok.com/@joekarlsson)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M21.8,8.001c0,0-0.195-1.378-0.795-1.985c-0.76-0.797-1.613-0.801-2.004-0.847c-2.799-0.202-6.997-0.202-6.997-0.202 h-0.009c0,0-4.198,0-6.997,0.202C4.608,5.216,3.756,5.22,2.995,6.016C2.395,6.623,2.2,8.001,2.2,8.001S2,9.62,2,11.238v1.517 c0,1.618,0.2,3.237,0.2,3.237s0.195,1.378,0.795,1.985c0.761,0.797,1.76,0.771,2.205,0.855c1.6,0.153,6.8,0.201,6.8,0.201 s4.203-0.006,7.001-0.209c0.391-0.047,1.243-0.051,2.004-0.847c0.6-0.607,0.795-1.985,0.795-1.985s0.2-1.618,0.2-3.237v-1.517 C22,9.62,21.8,8.001,21.8,8.001z M9.935,14.594l-0.001-5.62l5.404,2.82L9.935,14.594z"></path></svg>YouTube](https://www.youtube.com/c/JoeKarlsson)

## Want to Learn More About Joe Karlsson?

- [https://www.joekarlsson.com/about/](https://www.joekarlsson.com/about/)- [https://www.joekarlsson.com/speaking/](https://www.joekarlsson.com/speaking/)
