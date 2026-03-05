---
title: "I Replaced Alexa with a Dumber Voice Assistant (But at Least It’s Private)"
date: 2025-06-18
slug: "i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private"
description: "After five years of building automations in Home Assistant, I finally pulled the trigger on something I’d been contemplating for months: completely replacing my Amazon Alexa ecosystem with Home..."
categories: ["Blog"]
heroImage: "/images/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/I-Replaced-My-Smart-Home-with-a-Dumber-Home-But-at-Least-Its-Private.png"
---

After five years of building automations in [Home Assistant](https://www.home-assistant.io/), I finally pulled the trigger on something I’d been contemplating for months: completely replacing my Amazon Alexa ecosystem with Home Assistant’s Voice Preview Edition. Recent privacy changes from Amazon were the final straw, but what I discovered during this migration was both more challenging and more technically satisfying than I anticipated.

**Bottom line up front**: Home Assistant Voice Preview Edition delivers on its privacy promises and offers unprecedented customization, but the migration requires significant technical investment and realistic expectations about current limitations.

## The motivation: Privacy

Amazon’s recent privacy policy changes around voice data collection finally pushed me over the edge. The idea of having always-on recording devices throughout my home, feeding data to advertising algorithms, became increasingly uncomfortable. Home Assistant’s Voice Preview Edition promised local processing, open-source transparency, and complete data ownership, exactly what I was looking for. [[Home Assistant](https://www.home-assistant.io/voice-pe/)]

![](/images/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/IMG_2349-1024x576.png)

<p>The $59 device features professional-grade hardware with dual microphones, XMOS audio processing, and an ESP32-S3 chip that can handle local wake word detection. [[The Pi Hut](https://thepihut.com/products/home-assistant-voice-preview-edition)] More importantly, it includes a physical mute switch that actually cuts power to the microphones.

## Hardware setup: Surprisingly smooth initial experience

The physical setup proved surprisingly straightforward. The Voice Preview Edition connected to my existing Home Assistant instance within minutes, and the initial device registration worked flawlessly. The build quality impressed me, the audio processing hardware rivals devices costing significantly more, and the LED feedback ring provides clear visual status indicators. [[Home Assistant](https://www.home-assistant.io/voice_control/)]

<p>However, I quickly discovered that “working” and “working well” are very different things when it comes to voice assistants. The default wake word detection had maybe a 50% success rate from across the room, and voice recognition accuracy felt inconsistent at best. Alexa was really good at picking up my voice when the TV was on, or if I was listening to a Podcast. Home Assistant Voice struggles in this department.

## “Okay Nabu” proves problematic

Here’s where we hit our first major adoption hurdle. My partner has been struggling terribly with remembering the wake word “Okay Nabu.” Honestly, I don’t blame her, it’s not exactly intuitive. We’d been using “OK Computer” for years with our previous setup, and breaking that muscle memory has proven nearly impossible.

“I keep saying ‘OK Computer’ and nothing happens,” she told me last week, clearly frustrated. “Why can’t we just use something normal?”

The system supports three wake words: “Okay Nabu,” “Hey Jarvis,” and “Hey Mycroft,” but none feel natural after years of established patterns. [[Home Assistant Community](https://community.home-assistant.io/t/home-assistant-voice-pe-wake-word/814502)] I know custom wake words are on the roadmap, but I wish they were available now. This seemingly small issue has become one of the biggest barriers to family adoption.

The effective detection range compounds the problem. Unlike our old setup that worked reliably from across large rooms, the Voice Preview Edition often requires being within 1-2 meters and speaking clearly. [[Geeky Gadgets](https://www.geeky-gadgets.com/home-assistant-voice/)] My partner finds herself walking closer to the device and raising her voice, which feels unnatural compared to casual voice interactions we’d grown accustomed to.

## Rebuilding every automation from scratch

This is where my expectations collided with reality. I naively assumed that migrating from Alexa would involve some configuration tweaking and maybe updating a few device names. especially since I already used Home Assistant scripts for all of my Alexa automation. Instead, I found myself rebuilding every single voice command as a custom Home Assistant automation.

![](/images/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/image-840x1024.png)

“Can’t you just copy the settings from Alexa?” my partner asked during week two of my automation development marathon. The answer, unfortunately, was no. Alexa’s natural language processing had spoiled us both. Commands like “turn on the living room lights” or “play some jazz music” worked reliably with minimal setup. Home Assistant’s voice system, by contrast, requires explicit automation creation for every interaction pattern you want to support.

Here’s an example of what I had to build for basic light control. This automation handles dozens of different voice commands for a single room:

```
alias: Assist - Lights - Comprehensive Room Aware Control
description: >
  Controls lights in the room with voice commands for turning on/off, dimming,
  brightening, and activating reading, nightlight, vaporwave, and red alert scenes.
triggers:
  - command:
      - turn off the lights
      - lights off
      - kill the lights
      - shut off the lights
      - power down the lights
      - cut the lights
      - lights out
      - switch off the lights
      - darken the room
      - go dark
      # ... continues for 40+ variations
    trigger: conversation
actions:
  - variables:
      device_area: "{{ area_id(trigger.device_id) }}"
      lights_in_area: |
        {{ expand(area_entities(device_area))
           | selectattr('domain','equalto','light')
           | map(attribute='entity_id')
           | reject('equalto', 'light.elgato_key_light')
           | reject('equalto', 'light.elgato_ring_light')
           | list }}
```

What started as a weekend project turned into weeks of automation development. Every room needed its own variation, every device type required custom logic, and every family member’s preferred phrasing had to be anticipated and programmed.

“Are you still working on that voice thing?” became a running joke in our household. The answer was always yes.

The intensive automation development process forced me to architect better systems than I’d ever built with Alexa. Instead of relying on Amazon’s black-box natural language processing, I created variable-driven templates that scale across multiple rooms and device types. [[Home Assistant](https://www.home-assistant.io/voice_control/best_practices/)]

<p>The automation above dynamically detects which room the voice command originated from and targets only the lights in that area. This level of context awareness was impossible to achieve reliably with Alexa’s more limited automation capabilities. I developed similar patterns for music control, calendar queries, and climate control. Each automation became a reusable template that could be applied to new rooms or device types with minimal modification.

The Home Assistant community has developed sophisticated blueprints for common voice automation patterns that provide excellent starting points. [[Home Assistant Community](https://community.home-assistant.io/t/blueprints-for-voice-commands-weather-calendar-music-assistant/838071)] These blueprints saved me probably 20+ hours of development time once I discovered them.

## ChatGPT integration: Easier than expected

One of the most pleasant surprises was how straightforward the ChatGPT integration proved to be. Home Assistant’s OpenAI Conversation integration requires only an API key and basic configuration. [[Home Assistant](https://www.home-assistant.io/integrations/openai_conversation/)] The setup took maybe 15 minutes, and suddenly my voice assistant could handle general knowledge questions, creative tasks, and complex reasoning that the default local processing couldn’t manage.

“Wait, it can actually answer questions now?” my partner asked when I demonstrated asking about the weather forecast and getting a detailed response. The difference was night and day compared to the limited local processing capabilities.

I also experimented with connecting my local Ollama LLM server, which worked well for privacy-sensitive queries but introduced noticeable latency. [[Peyanski](https://peyanski.com/home-assistant-chatgpt-integration/)] The hybrid approach, using local processing for home automation and ChatGPT for everything else, proved most practical.

The streaming response capability impressed me most. Unlike Alexa’s sometimes clunky responses, ChatGPT integration provides natural, conversational answers that feel genuinely intelligent. The cost remains reasonable for typical household usage. Expect around $2-5 monthly for moderate use with GPT-3.5-turbo.

## Audio quality reality check: Down the rabbit hole of self-hosted music

Here’s where my technical enthusiasm hit another wall. The Voice Preview Edition’s audio output quality was, frankly, terrible. The built-in speaker works fine for system notifications, but any serious audio playback, music, podcast responses, or extended ChatGPT answers, sounded tinny and unclear.

“Why does it sound like it’s coming from a tin can?” my partner asked during one of our first music tests. She wasn’t wrong.

This forced me down an unexpected rabbit hole that’s become its own multi-month project. Initially, I connected external speakers via the 3.5 mm output, but that created configuration challenges around audio routing and volume control. [[Smart Home Junkie](https://www.smarthomejunkie.net/enhancing-voice-assistant-integrate-an-external-speaker-using-esphome/)]

<p>That led me into the world of self-hosted music solutions. I’m currently experimenting with [Music Assistant](https://www.music-assistant.io/installation/) as the audio coordinator, [Navidrome](https://www.navidrome.org/) for my personal music library, and a [Lyrion Squeezebox server](https://lyrion.org/) for multi-room audio. I’ve been testing WiiM smart speakers as potential endpoints, but honestly, I haven’t landed on anything definitive yet.

“So now you’re rebuilding our entire music system too?” my partner asked when she saw me researching yet another audio protocol. The answer, unfortunately, was yes.

Each solution solves different problems but creates new ones. Music Assistant provides excellent Home Assistant integration but requires learning another interface. Navidrome handles my personal music collection beautifully but doesn’t integrate seamlessly with streaming services. The WiiM speakers sound great but add another layer of complexity to an already complex system.

Some users successfully connect Echo devices as external speakers by using the 3.5 mm input, creating an interesting hybrid where Amazon hardware plays audio from a privacy-focused system. The irony wasn’t lost on me, but I’m trying to avoid falling back on Amazon hardware after going through all this effort to escape their ecosystem.

## Performance reality: Significant gaps versus commercial alternatives

Community testing shows average response times of 3.89 seconds for local processing compared to near-instantaneous responses from commercial assistants. [[Geeky Gadgets](https://www.geeky-gadgets.com/home-assistant-voice/)] Voice recognition accuracy rates of 37% locally and 58% with cloud processing create frustrating experiences requiring exact command syntax.

“Why do I have to say ‘turn on the lights’ exactly that way?” my partner asked after several failed attempts with natural variations. The system’s rigid command structure feels primitive compared to Alexa’s more forgiving interpretation.

Wake word detection proves particularly inconsistent. The system supports three options (“Okay Nabu,” “Hey Jarvis,” “Hey Mycroft”), but effective range remains limited to 1-2 meters for reliable activation. [[Home Assistant Community](https://community.home-assistant.io/t/home-assistant-voice-pe-wake-word/814502)] Commercial assistants work reliably from across large rooms, while the Voice Preview Edition often requires moving closer or raising your voice.

Language support varies dramatically. Local processing works best with American English and Spanish, while other languages show 40%+ word error rates. [[Home Assistant](https://www.home-assistant.io/voice_control/voice_remote_local_assistant/)] Regional accents significantly impact recognition accuracy, with non-American English dialects reporting particular difficulties.

## Family acceptance: The ultimate test

The technical challenges were manageable, but family acceptance proved the real measurement of success. My partner’s tolerance for technological experimentation has limits, and voice assistants that require multiple attempts or specific phrasing quickly become frustrating.

“I just want to turn on the lights without thinking about it,” she explained after a particularly frustrating evening of failed commands.

Interestingly, we developed different usage patterns than we had with Alexa. Instead of casual queries throughout the day, voice commands became more intentional and focused on home automation rather than general assistance. The system works best for users who treat it as a smart home interface rather than a general-purpose assistant. That being said the ChatGPT interface makes this more forgiving.

Training family members on effective phrasing became essential. Commands like “turn on the living room lights” work reliably, while natural variations like “brighten up the living room” require specific automation creation. [[Home Assistant Community](https://community.home-assistant.io/t/one-week-of-home-assistant-voice-a-pretty-good-start/826175)] The learning curve is steep, but the payoff is much more predictable behavior than Alexa’s sometimes mysterious interpretation failures.

## Advanced automation patterns: Where the system shines

Once past the initial setup challenges, the advanced automation capabilities began justifying the migration effort. Context-aware automations that respond based on time of day, room occupancy, or current home state enable sophisticated interactions impossible with commercial assistants. [[Home Assistant](https://www.home-assistant.io/docs/automation/trigger/)]

<p>For example, my calendar integration automation dynamically handles queries about “today,” “tomorrow,” or specific days of the week:

```
- variables:
    delta: >-
      {{ 1 if next_day and part_day else daily_mapping | selectattr('phrases',
      'contains', phrase) | map(attribute='delta') | list | first | default(0) }}
    start_time: >-
      {{ (daily_mapping + day_part_mapping) | selectattr('phrases',
      'contains', phrase) | map(attribute='start') | list | first }}
```

This level of dynamic template processing enables natural language interactions that adapt to context while remaining completely local and private.

“OK, that’s actually pretty cool,” my partner admitted when I demonstrated asking “what’s on my calendar tomorrow morning” and getting a contextually relevant response. These moments of technical elegance help justify the migration complexity.

## Current limitations justify preview designation

The “Preview” designation proves accurate when examining current limitations. GitHub issues reveal ongoing challenges with wake word detection failures, audio playback problems, TLS certificate issues, and response interruptions. [[GitHub](https://github.com/home-assistant/core/issues/144629)] Community reports indicate 10-90% failure rates for voice announcements depending on configuration.

Setup complexity remains prohibitive for mainstream users. Installation requires existing Home Assistant knowledge, complex networking configuration, and extensive troubleshooting. [[Swyx](https://www.swyx.io/home-assistant-struggles)] The system cannot answer general knowledge questions without AI integration, lacks robust music streaming support, and provides no equivalent to Alexa’s vast skill ecosystem.

Feature gaps prevent direct commercial assistant replacement for most users. Basic functions like weather reporting require manual automation creation, music control needs exact phrasing, and third-party service integration requires custom development.

## The verdict: Technical success, mainstream challenges

After several months of daily use, the migration succeeded for my specific use case but wouldn’t work for most households. The system excels as a privacy-focused smart home control interface for users willing to invest significant setup time and accept current limitations.

“It’s gotten better,” my partner acknowledged recently, “but I still miss just being able to ask questions about random stuff.” That captures the trade-off perfectly—we gained privacy and customization but lost the casual, conversational assistant experience that made voice control feel magical.

**What works excellently**: Privacy implementation is comprehensive with local processing options and open-source transparency. [[Michael Leen](https://www.michaelsleen.com/voice-pe-sat1-echo/)] Customization possibilities far exceed commercial alternatives. Home automation control rivals or exceeds Alexa’s capabilities once properly configured.

**What needs improvement**: Voice recognition accuracy requires substantial development. Setup complexity prevents mainstream adoption. Missing features like general knowledge queries and robust music integration limit practical utility.

**Who should consider this migration**: Technical users who prioritize privacy over convenience, existing Home Assistant power users comfortable with YAML automation development, and households willing to accept reduced functionality for complete data ownership. [[Smart Home Solver](https://smarthomesolver.com/reviews/home-assistant-voice-preview-edition-review/)]

<p>**Who should wait**: Families expecting plug-and-play Alexa replacement, users without existing Home Assistant experience, or anyone requiring reliable voice assistant functionality for daily tasks.

The Home Assistant Voice Preview Edition delivers on its promise as an open-source, privacy-focused voice assistant foundation. However, the “Preview” designation accurately reflects its current state—promising technology that needs substantial development before reaching consumer readiness. For the right user with appropriate expectations, it provides compelling benefits unavailable elsewhere in the voice assistant market.

---

## Follow Joe Karlsson on Social

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
</path></svg>Twitter](https://twitter.com/JoeKarlsson1)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M19.7,3H4.3C3.582,3,3,3.582,3,4.3v15.4C3,20.418,3.582,21,4.3,21h15.4c0.718,0,1.3-0.582,1.3-1.3V4.3 C21,3.582,20.418,3,19.7,3z M8.339,18.338H5.667v-8.59h2.672V18.338z M7.004,8.574c-0.857,0-1.549-0.694-1.549-1.548 c0-0.855,0.691-1.548,1.549-1.548c0.854,0,1.547,0.694,1.547,1.548C8.551,7.881,7.858,8.574,7.004,8.574z M18.339,18.338h-2.669 v-4.177c0-0.996-0.017-2.278-1.387-2.278c-1.389,0-1.601,1.086-1.601,2.206v4.249h-2.667v-8.59h2.559v1.174h0.037 c0.356-0.675,1.227-1.387,2.526-1.387c2.703,0,3.203,1.779,3.203,4.092V18.338z"></path></svg>LinkedIn](https://www.linkedin.com/in/joekarlsson/)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12,2C6.477,2,2,6.477,2,12c0,4.419,2.865,8.166,6.839,9.489c0.5,0.09,0.682-0.218,0.682-0.484 c0-0.236-0.009-0.866-0.014-1.699c-2.782,0.602-3.369-1.34-3.369-1.34c-0.455-1.157-1.11-1.465-1.11-1.465 c-0.909-0.62,0.069-0.608,0.069-0.608c1.004,0.071,1.532,1.03,1.532,1.03c0.891,1.529,2.341,1.089,2.91,0.833 c0.091-0.647,0.349-1.086,0.635-1.337c-2.22-0.251-4.555-1.111-4.555-4.943c0-1.091,0.39-1.984,1.03-2.682 C6.546,8.54,6.202,7.524,6.746,6.148c0,0,0.84-0.269,2.75,1.025C10.295,6.95,11.15,6.84,12,6.836 c0.85,0.004,1.705,0.114,2.504,0.336c1.909-1.294,2.748-1.025,2.748-1.025c0.546,1.376,0.202,2.394,0.1,2.646 c0.64,0.699,1.026,1.591,1.026,2.682c0,3.841-2.337,4.687-4.565,4.935c0.359,0.307,0.679,0.917,0.679,1.852 c0,1.335-0.012,2.415-0.012,2.741c0,0.269,0.18,0.579,0.688,0.481C19.138,20.161,22,16.416,22,12C22,6.477,17.523,2,12,2z"></path></svg>GitHub](https://github.com/JoeKarlsson)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12,4.622c2.403,0,2.688,0.009,3.637,0.052c0.877,0.04,1.354,0.187,1.671,0.31c0.42,0.163,0.72,0.358,1.035,0.673 c0.315,0.315,0.51,0.615,0.673,1.035c0.123,0.317,0.27,0.794,0.31,1.671c0.043,0.949,0.052,1.234,0.052,3.637 s-0.009,2.688-0.052,3.637c-0.04,0.877-0.187,1.354-0.31,1.671c-0.163,0.42-0.358,0.72-0.673,1.035 c-0.315,0.315-0.615,0.51-1.035,0.673c-0.317,0.123-0.794,0.27-1.671,0.31c-0.949,0.043-1.233,0.052-3.637,0.052 s-2.688-0.009-3.637-0.052c-0.877-0.04-1.354-0.187-1.671-0.31c-0.42-0.163-0.72-0.358-1.035-0.673 c-0.315-0.315-0.51-0.615-0.673-1.035c-0.123-0.317-0.27-0.794-0.31-1.671C4.631,14.688,4.622,14.403,4.622,12 s0.009-2.688,0.052-3.637c0.04-0.877,0.187-1.354,0.31-1.671c0.163-0.42,0.358-0.72,0.673-1.035 c0.315-0.315,0.615-0.51,1.035-0.673c0.317-0.123,0.794-0.27,1.671-0.31C9.312,4.631,9.597,4.622,12,4.622 M12,3 C9.556,3,9.249,3.01,8.289,3.054C7.331,3.098,6.677,3.25,6.105,3.472C5.513,3.702,5.011,4.01,4.511,4.511 c-0.5,0.5-0.808,1.002-1.038,1.594C3.25,6.677,3.098,7.331,3.054,8.289C3.01,9.249,3,9.556,3,12c0,2.444,0.01,2.751,0.054,3.711 c0.044,0.958,0.196,1.612,0.418,2.185c0.23,0.592,0.538,1.094,1.038,1.594c0.5,0.5,1.002,0.808,1.594,1.038 c0.572,0.222,1.227,0.375,2.185,0.418C9.249,20.99,9.556,21,12,21s2.751-0.01,3.711-0.054c0.958-0.044,1.612-0.196,2.185-0.418 c0.592-0.23,1.094-0.538,1.594-1.038c0.5-0.5,0.808-1.002,1.038-1.594c0.222-0.572,0.375-1.227,0.418-2.185 C20.99,14.751,21,14.444,21,12s-0.01-2.751-0.054-3.711c-0.044-0.958-0.196-1.612-0.418-2.185c-0.23-0.592-0.538-1.094-1.038-1.594 c-0.5-0.5-1.002-0.808-1.594-1.038c-0.572-0.222-1.227-0.375-2.185-0.418C14.751,3.01,14.444,3,12,3L12,3z M12,7.378 c-2.552,0-4.622,2.069-4.622,4.622S9.448,16.622,12,16.622s4.622-2.069,4.622-4.622S14.552,7.378,12,7.378z M12,15 c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S13.657,15,12,15z M16.804,6.116c-0.596,0-1.08,0.484-1.08,1.08 s0.484,1.08,1.08,1.08c0.596,0,1.08-0.484,1.08-1.08S17.401,6.116,16.804,6.116z"></path></svg>Instagram](https://www.instagram.com/joekarlsson/)

- [<svg width="24" height="24" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M16.708 0.027c1.745-0.027 3.48-0.011 5.213-0.027 0.105 2.041 0.839 4.12 2.333 5.563 1.491 1.479 3.6 2.156 5.652 2.385v5.369c-1.923-0.063-3.855-0.463-5.6-1.291-0.76-0.344-1.468-0.787-2.161-1.24-0.009 3.896 0.016 7.787-0.025 11.667-0.104 1.864-0.719 3.719-1.803 5.255-1.744 2.557-4.771 4.224-7.88 4.276-1.907 0.109-3.812-0.411-5.437-1.369-2.693-1.588-4.588-4.495-4.864-7.615-0.032-0.667-0.043-1.333-0.016-1.984 0.24-2.537 1.495-4.964 3.443-6.615 2.208-1.923 5.301-2.839 8.197-2.297 0.027 1.975-0.052 3.948-0.052 5.923-1.323-0.428-2.869-0.308-4.025 0.495-0.844 0.547-1.485 1.385-1.819 2.333-0.276 0.676-0.197 1.427-0.181 2.145 0.317 2.188 2.421 4.027 4.667 3.828 1.489-0.016 2.916-0.88 3.692-2.145 0.251-0.443 0.532-0.896 0.547-1.417 0.131-2.385 0.079-4.76 0.095-7.145 0.011-5.375-0.016-10.735 0.025-16.093z" /></svg>TikTok](https://www.tiktok.com/@joekarlsson)

- [<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M21.8,8.001c0,0-0.195-1.378-0.795-1.985c-0.76-0.797-1.613-0.801-2.004-0.847c-2.799-0.202-6.997-0.202-6.997-0.202 h-0.009c0,0-4.198,0-6.997,0.202C4.608,5.216,3.756,5.22,2.995,6.016C2.395,6.623,2.2,8.001,2.2,8.001S2,9.62,2,11.238v1.517 c0,1.618,0.2,3.237,0.2,3.237s0.195,1.378,0.795,1.985c0.761,0.797,1.76,0.771,2.205,0.855c1.6,0.153,6.8,0.201,6.8,0.201 s4.203-0.006,7.001-0.209c0.391-0.047,1.243-0.051,2.004-0.847c0.6-0.607,0.795-1.985,0.795-1.985s0.2-1.618,0.2-3.237v-1.517 C22,9.62,21.8,8.001,21.8,8.001z M9.935,14.594l-0.001-5.62l5.404,2.82L9.935,14.594z"></path></svg>YouTube](https://www.youtube.com/c/JoeKarlsson)

## Want to Learn More About Joe Karlsson?

- [https://www.joekarlsson.com/about/](https://www.joekarlsson.com/about/)

- [https://www.joekarlsson.com/speaking/](https://www.joekarlsson.com/speaking/)

## Latest Posts

## 

<p>
