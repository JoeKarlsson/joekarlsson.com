---
title: 'An Introduction To IoT (Internet of Toilets 🚽)'
date: 2019-11-20
slug: 'iot-and-js-a-gentle-introduction-to-the-internet-of-things'
description: 'Thanks for coming to my talk, An Introduction To IoT (Internet of Toilets 🚽); Or How I Built an IoT Kitty Litter Box Using JavaScript, and here you will find all the resources discussed during the...'
categories: ['IoT']
heroImage: '/images/blog/iot-and-js-a-gentle-introduction-to-the-internet-of-things/socialimg.webp'
heroAlt: 'IoT and JavaScript - a gentle introduction to the Internet of Things'
tldr: "Talk resources and outline for my IoT Kitty Litter Box project, where I used a Raspberry Pi and JavaScript to track my cat's weight and bathroom habits."
---

Thanks for coming to my talk, An Introduction To IoT (Internet of Toilets 🚽); Or How I Built an IoT Kitty Litter Box Using JavaScript, and here you will find all the resources discussed during the talk.

## About the Internet of Toilets

My favorite things in life are cats 🐈, computers 🖥 and crappy ideas 💩, and so I decided to combine all three and make an IoT (Internet of Things) litter box using a Raspberry Pi and JavaScript! If you have ever wanted to get build your own IoT project, but didn’t know how to start, then this is the project for you. Turns out that IoT and JS are awesome!

This project will help track your feline friend’s health by measuring its weight every time it sets foot on the litter tray and monitors its urination patterns. The equipment can be connected to a companion smartphone app that displays the relevant data in an easy-to-understand graph format, so that cat parents can quickly spot symptoms of unusual weight loss.

Together, we will go through how I set up my IoT Litter Box from start to finish. Including how to set up Node.js on a Raspberry Pi and how to connect sensors to a Raspberry Pi and how to read the sensor inputs with Node.js.

## Video

[Watch the talk on YouTube](https://www.youtube.com/watch?v=711Sb55fzdg)

## Internet of Toilets Slides

[View slides on SpeakerDeck](https://speakerdeck.com/joekarlsson/iot-and-javascript)

## Schematics

![iot-kitty-litter-box_bb](/images/blog/iot-and-js-a-gentle-introduction-to-the-internet-of-things/64828756-68fd9680-d58f-11e9-94e2-605d0d2efa70.webp)

## IoT Kitty Litter Box Source Code

[https://github.com/JoeKarlsson/iot-kitty-litter-box](https://github.com/JoeKarlsson/iot-kitty-litter-box)

## Talk Outline:

- Introduction/What the heck is IoT?
- IoT and JS – Why/How does that work?
  - Easy to update over a network
  - The internet already speaks JS
  - Tons of existing libraries/plugins/APIs
    - Cylon.js & Johnny-Five
  - JS is great at handling event-driven apps
- Project Demo: Internet of Toilets 🚽: IoT Kitty Litter Box
  - Review required materials and why we need them
    - Raspberry Pi
    - Breadboard
    - etc…
  - We will cover the motivation and insights from the project
  - We will focus on the most simple component, the switch
    - What is the GPIO and how do we interact with it?
    - How do we save/analyze/act on this data?
      - Demo saving the data to MongoDB database
- Future of IoT
  - Smaller and more powerful devices
  - JS with a smaller footprint
  - Better hardware support
  - Batteries will soon be the bottleneck for IoT work
- Recap
- Questions
- End!

You can view a complete list of my past and upcoming talks with video on my website [/talk-archive/](/talk-archive/).

## Related Links

- [Blog] [An Introduction to IoT (Internet of Toilets)](/blog/an-introduction-to-iot-internet-of-toilets/) - more detail on into the code, hardware, and data behind the IoT Kitty Litter Box
- Want to learn more? Check out [MongoDB University](https://joekarlsson.dev/MongoDBUniversity)
- Stuck? Be sure to ask your questions on the [MongoDB Community Forums](https://joekarlsson.dev/MongoDBCommunity)
- [IoT Cat Litter Box (with ESP32, Arduino IDE, Thingspeak and 3D Printing)(Major inspiration)](https://www.instructables.com/id/IoT-Cat-Litter-Box-with-ESP32-Arduino-IDE-Thingspe/)
- [IoT Reference Architecture](https://www.mongodb.com/collateral/iot-reference-architecture)
- [Time Series Data and MongoDB: Best Practices Guide](https://www.mongodb.com/collateral/time-series-best-practices)
