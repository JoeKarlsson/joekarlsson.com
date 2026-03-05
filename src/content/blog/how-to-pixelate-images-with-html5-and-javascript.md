---
title: 'How to pixelate images with HTML5 and JavaScript'
date: 2015-05-16
slug: 'how-to-pixelate-images-with-html5-and-javascript'
description: 'A couple of months ago, I was interested in learning some new HTML5 elements. The more visual flourishes of the canvas class especially caught my eye. The ability to dynamically adjust elements in an...'
categories: ['Dev Tools']
heroImage: '/images/blog/how-to-pixelate-images-with-html5-and-javascript/pixelate-demo.webp'
heroAlt: 'Demo of pixelating an image using HTML5 canvas and JavaScript'
contentNotice: 'This post uses outdated JavaScript patterns (var, window.onload, browser-prefixed APIs). The pixelation technique still works, but refer to modern JavaScript documentation for current best practices.'
tldr: 'I walk through how I built Pixelate.js, a small web app that turns images into dynamic pixel art using HTML5 canvas and a clever trick with image smoothing.'
---

> **Note:** This post was written in 2015. The code uses patterns like `var`, `window.onload`, and browser-prefixed APIs (`mozImageSmoothingEnabled`) that are outdated. The pixelation technique still works, but modern JavaScript would use `let`/`const` and `imageSmoothingEnabled` is now standard without prefixes.

A couple of months ago, I was interested in learning some new HTML5 elements. The more visual flourishes of the canvas class especially caught my eye. The ability to dynamically adjust elements in an HTML container seemed an interesting project. I am going to walk you through how to pixelate images with HTML5 and JavaScript.

I started building out an application that builds a photo mosaic based on color hashtags from Instagram, and I spun off a chunk of that code to build out a smaller (but still cool) web application that takes an image hosted on the web and converts the image into a dynamic pixelated image. I'll write about my Instamosaic project at a later time.

This blog post will break down step by step how I wrote my code for Pixelate.js.

From a high level, the Pixelate.js function works because we turn off browser image smoothing, which typically helps upscaled images look less terrible, then shrink an image, and blow up the shrunken image to its the original size.

You can check out [the source code on GitHub](https://github.com/JoeKarlsson1/Pixelate). Pixelate is one of several side projects I've built over the years - you can see the rest on my [work page](/work/).

Okay, now let's break how I built Pixelate.js.

**PIXELATE.JS**

```js
// First I grab the canvas and drawing context from the HTML page.
// 'document.getElementById' retrieves an element from the page based on its ID.

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// Create an image element. HTML canvas requires that we initiated the new image element
var img = new Image();

// When the page first loads, call the first draw function listed below. This function draws the
// initial demo image that you see when you first boot up the page.
window.onload = firstDraw();

// Loads the initial image URL and calls the draw function
function firstDraw() {
	// preload the demo image
	var initialImageURL = 'https://i.imgur.com/3vfZPKL.jpg';
	draw(initialImageURL);
}

// The draw function is responsible for sticking our pixelated image on the page and for ensuring
// that the image is sized correctly for the window. It takes an image URL and creates an
// unpixelated image 1/4 of the original size of the image.
function draw(imgURL) {
	img.crossOrigin = 'anonymous';
	img.src = imgURL;
	img.onload = function () {
		canvas.height = img.height / 4;
		canvas.width = img.width / 4;
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		pixelate();
	};
}

// This is the pixelate function that performs the most interesting aspects of this function.
// First I dynamically adjust canvas size to the size of the uploaded image.
function pixelate() {
	canvas.height = img.height;
	canvas.width = img.width;

	// Sets the pixel size to the value that is found on the slider. Changes in the slider are
	// reflected in real time because of the event receiver I have set up below.
	var size = blocks.value * 0.01,
		// Here I cache the scaled width and height - I need to know the original height
		// and the reduced height.
		w = canvas.width * size,
		h = canvas.height * size;

	// Then I draw the original image to the scaled size onto the canvas.
	ctx.drawImage(img, 0, 0, w, h);

	// Then draw that scaled image thumb back to fill the canvas, since smoothing is set to false
	// the result will be pixelated
	ctx.mozImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
}

// Event listeners for slider
blocks.addEventListener('change', pixelate, false);

// poly-fill for requestAnimationFrame with fallback for older browsers that do not support RAF.
window.requestAnimationFrame = (function () {
	return (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000 / 60);
		}
	);
})();
```
