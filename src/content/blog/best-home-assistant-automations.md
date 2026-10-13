---
title: 'The Best Home Assistant Automations of 2026 (10 Years In)'
date: 2026-09-29
updatedDate: 2026-10-12
slug: 'best-home-assistant-automations'
description: 'The best Home Assistant automations after 10 years and 134 running: start with the basics, layer on context, go advanced, and keep them working.'
categories: ['Smart Home']
tags: ['Home Assistant', 'Smart Home', 'Automation', 'Local AI']
heroImage: '/images/blog/best-home-assistant-automations/hero.webp'
heroAlt: 'A finger pressing a pink 3D house made of circuit board traces, representing Home Assistant smart home automations'
tldr: "As of October 2026 (Home Assistant 2026.10), after 10 years and 134 running automations, these are the Home Assistant automations worth building, in the order I'd build them. Start with basics that pass the guest test: motion lighting where a physical switch always wins, arriving and leaving, and leak, smoke, and CO2 alerts. Then add context to those basics: lights that know a movie is playing, one laundry notification instead of two, and modes that turn themselves off. Go advanced by rebuilding a basic from scratch, like replacing motion timers with Bayesian room presence and mmWave radar, or moving local AI from rewriting alerts to making yes-or-no calls. Automations break as devices change, so I run health checks to catch problems and use continue_on_error so one broken step doesn't stop the rest."
faq:
  - question: 'What are the best Home Assistant automations for beginners?'
    answer: 'Motion lighting where a physical switch always wins, arriving and leaving routines, and safety alerts for any leak, smoke, or CO2 sensor you own. They pay off every day, and they work for guests without needing the app.'
  - question: 'Should I use YAML or the visual editor for Home Assistant automations in 2026?'
    answer: 'Both, in that order. Draft in the visual editor, especially now that purpose-specific triggers are the default since Home Assistant 2026.7, then keep the resulting YAML in git so you can diff it, review it, and scan it for broken references.'
  - question: 'How do I find broken automations and dead entities in Home Assistant?'
    answer: "Use a health check. In my setup the Repairs page didn't flag any of the 12 dead references my health check found, because as far as I can tell it doesn't look inside templates, dashboards, or notify targets. Use the Watchman integration or a scheduled script that checks every entity, device, and service your automations reference against Home Assistant's registries."
  - question: 'How many automations is too many in Home Assistant?'
    answer: 'There is no hard limit. I run 134 on Home Assistant 2026.10. The practical limit is maintenance: my rule of thumb is that past about 30 automations, you add a health check such as Watchman or a scheduled script so broken references get caught before they bite.'
  - question: 'What are good Home Assistant automation ideas beyond lights?'
    answer: 'Four I would build again: laundry alerts from a door contact and a vibration sensor, Meeting Mode triggered by the camera_in_use sensor on your Mac, a color-coded nightlight that shows garage, leak, and rain status, and the doorbell camera popping up picture-in-picture on the TV.'
  - question: 'Should I use continue_on_error on every action?'
    answer: 'No. Use it on steps that talk to something outside Home Assistant, like a device, a server, or an AI model. On its own it hides failures, so pair it with a health check that tells you what broke.'
  - question: 'What does continue_on_error do in Home Assistant?'
    answer: "By default, if one action in an automation or script fails, Home Assistant stops the whole run at that step. Setting continue_on_error: true on an action lets the rest of the automation keep going when that step fails at runtime, like an offline device or service. It doesn't cover broken configuration, such as a bad template or an action that no longer exists."
  - question: 'Can Home Assistant run AI locally?'
    answer: 'Yes. The AI Task integration can call a local model through Ollama, and Frigate can do object detection and face recognition on a GPU. Local AI works best when it returns a structured answer like has_package true or false, not a free-text description.'
---

I've been running Home Assistant since 2016. Today I have 134 automations, and the best Home Assistant automations I've built share one trait: someone who has never been in my house can live with them without an app, instructions, or me saying "oh, don't touch that switch."

This post is the order I'd build them in if I started over. Basics first, the boring ones everybody in the house uses every day. Then you add context to those basics so they stop doing dumb things. Then, where it pays off, you rebuild one from scratch with better sensors and some probability math. I'll use lighting as the example of that whole climb, but the same pattern runs through every room. After 10 years, I also spend more of my time on automations that broke without telling me than on building new ones.

Quick context on the setup: Home Assistant 2026.10 runs as a VM on my [Proxmox cluster](/blog/homelab-two-years-later/), with 29 Zigbee devices on Zigbee2MQTT, [Frigate and local LLMs on GPUs](/blog/proxmox-gpu-passthrough-multi-service/), and [Ollama](https://ollama.com/) for the AI side. If you're brand new, start with my [Home Assistant getting-started guide](/blog/how-to-get-started-with-home-assistant-in-2026/) and come back. Every device I mention is listed in the [smart home section of my uses page](/uses/#smart-home).

## The guest test

I live alone. I've lived with partners in this house before, and I have guests over all the time. So every automation in this house has to pass what I call **the guest test**:

**Could someone who has never been here, and doesn't have my app, live in this house without noticing the automations or having to work around them?**

![Soldier Protecting Sleeping Child meme: a soldier labeled "The physical light switch" shields a sleeping guest labeled "A guest at 2 AM" from flying weapons labeled "My motion automations"](/images/blog/best-home-assistant-automations/soldier-physical-switch-guest-test.webp)

That means a physical switch for everything, lights that turn on when you walk in and don't turn off while you're still sitting there, and no voice command to learn just to use the bathroom at night.

## The whole list

![My Home Assistant main dashboard with scene tiles, room tiles, infrastructure health, energy, and laundry status](/images/blog/best-home-assistant-automations/dashboard-overview.webp)

_My main dashboard (cameras and a few personal panels blurred). The Laundry Done nightlight tile and the Washer: Running status both come up later._

| Automation                            | Level        | Hardware                           |
| ------------------------------------- | ------------ | ---------------------------------- |
| Motion lighting, switch always wins   | Basic        | Motion sensors or Hue MotionAware  |
| Closet lights on a door sensor        | Basic        | Door contact sensor, smart bulb    |
| Arriving and leaving                  | Basic        | Phone, smart garage opener         |
| Water leak, smoke, and CO2 alerts     | Basic        | Aqara leak, Heiman smoke, Aranet4  |
| Plain-English alerts from local AI    | Basic        | Ollama, Alertmanager               |
| Lights that know a movie is playing   | Intermediate | Media player, lights with scenes   |
| A bedroom button that changes by time | Intermediate | Zigbee button                      |
| Laundry and 3D printer notifications  | Intermediate | Door contact, vibration, OctoPrint |
| Nightlight and TV alerts              | Intermediate | Color Zigbee nightlight, LG TV     |
| Party, guest, and vacation modes      | Intermediate | Alarmo, Presence Simulation        |
| Meeting Mode from your Mac camera     | Intermediate | Companion app on the Mac           |
| Room presence (person vs. cat)        | Advanced     | Bayesian helpers, mmWave radar     |
| A Bayesian sleep sensor               | Advanced     | Phone, presence sensors            |
| Local AI that makes yes-or-no calls   | Advanced     | Frigate, Ollama, AI Task           |
| Cat TV while I'm away                 | New category | Android TV box, SmartTube          |
| Cameras that pop up on the TV         | New category | Frigate, QuickBars                 |

## Basic Home Assistant automations

These are boring, and they're the ones my guests and I use every day. Most of what comes later in this post starts as one of these.

### Motion lighting where a switch always wins

I have motion lighting in 10 rooms. My first attempts had a habit of turning the lights off on people who were sitting still, so everyone learned to wave their arms like they were landing a plane.

**Let the Hue bridge own the switches.** Most of my lights are Philips Hue, and a Hue dimmer paired straight to the Hue bridge talks to the bulbs without Home Assistant or a Zigbee coordinator in the middle. When someone hits a switch, the light responds instantly, every time, even if Home Assistant is restarting. The cost is that my switch logic lives in two places, the Hue app and Home Assistant, and I have to remember which one owns what. One automation in Home Assistant handles extra behavior like long presses for every Hue and Lutron Aurora dimmer in the house.

**A human always beats the sensor.** When someone turns the lights off, motion waits 3 minutes before it's allowed to turn them back on (30 minutes in the bedroom overnight). And motion only picks a scene when the lights are off, so if you dim the kitchen by hand, it stays dimmed. Before a room turns off on its own, the lights drop to 40% for 45 seconds as a warning, and any movement brings them back.

If you're starting today, Home Assistant 2026.7 made [purpose-specific triggers](https://www.home-assistant.io/blog/2026/07/01/release-20267/) the default in the visual editor, so you can pick an area-based motion trigger instead of a specific sensor, and it handles unavailable sensors for you. Use them for new automations. I draft in the visual editor, then keep the YAML in git so I can see what changed.

If you run long off-timers, one gotcha took me way too long to find. If a `for: minutes: 30` timer is counting down and Home Assistant restarts, the timer is gone and the lights stay on until someone notices. My fix is a template trigger that asks "are the lights on, is nobody moving, and has nothing changed in 30 minutes?" That question has the same answer before and after a restart.

<details>
<summary>Show the YAML</summary>

```yaml
triggers:
  - alias: On and no motion for 30 min (re-arms after restart)
    trigger: template
    value_template: >
      {% set lights = ['light.kitchen_lights'] %}
      {% set sensors = ['binary_sensor.kitchen_motion_sensor_motion',
                        'binary_sensor.kitchen_motionaware_area'] %}
      {% set ns = namespace(last=0) %}
      {% for e in lights + sensors %}{% if states[e] is not none %}
        {% set ns.last = [ns.last, as_timestamp(states[e].last_changed)] | max %}
      {% endif %}{% endfor %}
      {{ lights | select('is_state', 'on') | list | count > 0
         and sensors | select('is_state', 'on') | list | count == 0
         and as_timestamp(now()) - ns.last > 1800 }}
  - trigger: event
    event_type: automation_reloaded
```

</details>

### Closet lights on a door sensor

This is the easiest automation in my house. A contact sensor on the bedroom and office closet doors turns the closet light on with Hue's Natural light scene when the door opens and off when it closes. If the door gets left open, the light turns itself off after 10 minutes anyway.

### Arriving and leaving

When the house goes from nobody home to someone home, an `im_home` script runs: the alarm disarms, both thermostats go back to their home presets, and the Roombas head back to their docks. When it goes back to nobody, `im_leaving` runs: the alarm arms (unless guest mode is on), and the Roombas start, because the best time to vacuum is when nobody is there to trip over them.

### Water leak, smoke, and CO2 alerts

If you own a leak sensor and it isn't wired to an automation, you own an expensive coaster. Every safety sensor I have sends a loud alert:

- **Water:** 4 Aqara leak sensors send a critical push that breaks through Do Not Disturb, plus a spoken announcement on the speakers.
- **Smoke:** the kitchen smoke detector does the same.
- **Heat:** if the thermostat turns off between November and March, or when it's under 50°F outside, Home Assistant forces the heat back on at 62°F so the pipes don't freeze in a Minnesota winter because someone bumped the thermostat.
- **CO2:** above 1000 ppm, the office pushes me after 5 minutes and announces after 10. I keep an Aranet4 on my desk because I start getting foggy before I notice why.

The trash reminder uses the same plumbing with lower stakes. Every Tuesday at 6 PM my phone tells me the bins go out tonight, and the "Done" and "Remind in 1hr" buttons are on the notification itself. Without the snooze button I'd swipe it away and forget.

These alerts only fire when a sensor changes state, so a sensor that stops reporting never sends one. My [health checks](#find-broken-home-assistant-automations-with-health-checks) catch that.

### Plain-English alerts from local AI

Local AI starts out useful in a boring way: rewriting text. My homelab's Alertmanager alerts are full of label names and metric values. A webhook sends each critical one to Home Assistant, the local model rewrites it into one plain-English push per outage, and the full details stay in a Home Assistant notification that clears itself when the outage resolves.

The doorbell announcement works the same way. The model describes who's at the door ("A delivery driver in a brown uniform is holding a package"), and when Ollama is off or the model errors, the speakers fall back to a plain "someone is at the front door." Nothing here depends on what the model says, so a bad answer costs me nothing.

## Intermediate Home Assistant automations

Each of these adds context, usually to one of the basics: what's playing, what time it is, what mode the house is in. They usually need a helper or two and some templating.

### Lights that know a movie is playing

Plain motion lighting is bad at movies. The Great Room has two layers on top of the basic version:

- **Home Assistant never turns the Great Room lights off while the TV or a Great Room speaker is playing.** You can sit perfectly still through a three-hour movie.
- **Kitchen motion is ignored while a movie is playing in the Great Room.** Paused doesn't count. Nothing kills a movie like the kitchen lighting up because you went for popcorn.

Then Plex drives the scenes. When the Great Room TV (an LG OLED with an onn 4K Pro running Plex) turns on, the lights fade into a movie scene over 10 seconds. When I press play, they step down to almost nothing over a few seconds. Pause or stop, and a lighter movie scene fades back in so you can find your drink. Turn the TV off, and the room goes back to its normal scene.

![Absolute Cinema meme: Martin Scorsese with his hands raised, captioned "Me when I press play in Plex and the lights fade to almost nothing" and "ABSOLUTE CINEMA"](/images/blog/best-home-assistant-automations/absolute-cinema-plex-lighting.webp)

I didn't get the fade times, the pause and stop behavior, or which scene lands when right on the first try. Once I did, I stopped thinking about the lights during movies.

There's also a **Light Lock**. Flip it on and the automation stops touching the Great Room lights, for when you want the lights your way. It clears itself at 3 AM.

### A bedroom button that changes by time of day

A Zigbee button next to my bed does different things depending on the time:

- **Single press:** good night in the evening, good morning in the morning.
- **Double press:** a red light before noon, nap mode in the afternoon, good night in the evening.
- **Long press:** turn off the whole bedroom.

That's six jobs on one button, and a guest who presses it once still gets something sensible.

### Laundry and 3D printer notifications

<img src="/images/blog/best-home-assistant-automations/dashboard-laundry.webp" alt="Home Assistant laundry tiles showing the washer running and the dryer idle" width="234" height="126" loading="lazy" />

Most laundry automations watch a smart plug's power draw and notify when it drops. I don't use plugs for either machine:

- **Washer:** a door contact sensor. The door closes, the cycle starts, and 70 minutes later it's done. That makes it a timer: 70 minutes fits my usual cycle, so a quick wash or an extra-long one gets the time wrong.
- **Dryer:** a vibration sensor. 5 minutes of continuous shaking means it started; 9 minutes of stillness means it's finished.

There are no power thresholds to tune, and the washer pausing mid-cycle can't trigger a false finish.

If both finish within 15 minutes of each other, I get **one** notification instead of two. There's a 15-minute cooldown between announcements, a "Snooze 15 min" button on the push, and a progress bar on my phone's lock screen while each cycle runs. If a cycle finished while I was out, I get a reminder when I walk in the door.

Each machine saves its finish time in an `input_datetime` helper. Once the timestamps live somewhere, "did the other one just finish?" is a one-line template.

<details>
<summary>Show the YAML</summary>

```yaml
triggers:
  - trigger: state
    entity_id: binary_sensor.basement_washing_machine_contact
    to: 'off'
    for: { minutes: 70 }
    id: washer_done
  - trigger: state
    entity_id: binary_sensor.basement_dryer_vibration_sensor_vibration
    from: 'on'
    to: 'off'
    for: { minutes: 9 }
    id: dryer_done
actions:
  # ...washer_done branch:
  - variables:
      dryer_recent: >
        {% set ts = state_attr('input_datetime.dryer_cycle_complete', 'timestamp') | float(0) %}
        {{ ts > 0 and (as_timestamp(now()) - ts) < 900 }}
      cooldown_passed: >
        {% set ts = state_attr('input_datetime.laundry_last_announced', 'timestamp') | float(0) %}
        {{ ts == 0 or (as_timestamp(now()) - ts) / 60 >= 15 }}
```

</details>

My Prusa gets the same treatment through OctoPrint: a push when a print starts, finishes, or fails. When a print finishes, the printer turns itself off once the bed cools below 95°F, and the notification has a "Keep On" button in case I'm about to start another one.

### Nightlight and TV alerts

A guest never sees my push notifications, so the nightlight and the TV put the important stuff where anyone in the room can see it.

There's a small Third Reality Zigbee nightlight in my Great Room. It glows when you walk by in the dark, and its color tells me what's going on:

```text
Great Room nightlight, decoded:

  RED ............ garage open more than 1 hour
                   a door left open late
                   water leak or smoke
                   my homelab is down
  ORANGE ......... washer finished
  BLUE (breathing) it just started raining
  (normal) ....... everything is fine, go to bed
```

I look at it more than any dashboard. A guest walking to the kitchen at midnight just sees a nightlight, and I can see the garage is still open without unlocking my phone. I keep it to three colors so I never have to look up what one means.

The Great Room TV does the same job while it's on: the doorbell, the washer and dryer finishing, and a heads-up 10 minutes before anything on my calendar show up as a pop-up on the screen.

### Party, guest, and vacation modes that turn themselves off

Party Mode turns on guest mode and disables the automations that would be annoying with a crowd, like doorbell announcements, package alerts, and the midnight shutdown. The motion lights skip their auto-off too. Guest Mode disarms the alarm, puts the indoor camera in privacy mode, and stops Frigate recording.

Both expire on their own: Party Mode at 4 AM, Guest Mode after 24 hours. I made them expire because I'd forget to turn them off, and Party Mode left on means the motion lights never turn off.

When I turn on Vacation Mode, the [Presence Simulation](https://github.com/slashback100/presence_simulation) integration (from HACS, like Alarmo) replays realistic light patterns so the house looks lived in, and [Alarmo](https://github.com/nielsfaber/alarmo) arms in vacation mode. If the alarm fails to arm, I get a critical push, because otherwise I'd assume the house is armed when it isn't.

Vacation Mode also sends a daily report, and I use it on every trip. At 9 AM every morning I'm away, one notification tells me the indoor temperature, the alarm state, any leaks, how many times the doorbell rang, packages detected, doors opened, when the pet sitter came by, and any National Weather Service alerts.

### Meeting Mode from your Mac camera

This is my favorite automation, and it has no button. When my work MacBook's camera turns on, Meeting Mode starts, and it ends when the camera turns off. It turns on the office lights and pauses the office speaker. A second automation turns on my Elgato Key Light when the camera goes live and turns it off 30 seconds after it stops.

The trigger is a `camera_in_use` binary sensor from the [Home Assistant companion app](https://companion.home-assistant.io/docs/core/sensors/) on the Mac. If you have a Mac, install the companion app for this sensor alone.

The same Meeting Mode also puts a red ON AIR sign on [PixelPane, the 32x32 pixel art display next to my desk](/blog/pixelpane-pixel-art-home-assistant/), which flashes for the doorbell and my homelab alerts too.

<details>
<summary>Show the YAML</summary>

```yaml
triggers:
  - trigger: state
    entity_id: binary_sensor.macbook_pro_2_camera_in_use
    to: 'on'
    id: camera_on
  - trigger: state
    entity_id: binary_sensor.macbook_pro_2_camera_in_use
    to: 'off'
    id: camera_off
```

</details>

<img src="/images/blog/best-home-assistant-automations/dashboard-work-infrastructure.webp" alt="Home Assistant dashboard Work panel with Work Mode, Meeting, Recording, Couch, Office and Nook lights, Key Lights, On Air, and Office CO2 at 680 ppm, above an Infrastructure panel showing UPS, Proxmox, NAS, CPU and GPU temperatures, and health checks at 138 of 141" width="238" height="548" loading="lazy" />

_The Work panel: every mode is a tile, and Meeting turns on by itself when the Mac camera does. Below it, the health checks tile, which comes up in the maintenance section._

## Advanced Home Assistant automations

Advanced, for me, means going back to one of the basics and rebuilding it with better information. Lighting is the clearest example, and local AI is the other. Even with every fix above, a motion sensor only sees movement. Sit still on the couch long enough and the lights still dim on you, and a cat walking through an empty room still counts as a person. So in early October 2026 I stopped asking one sensor whether a room is occupied and started having Home Assistant work out how likely it is from everything it knows about that room.

These need more hardware and more trust in your setup. They still have to pass the guest test: a guest should never know any of it is involved, and when a radar drops offline, the room falls back to the basic version.

### Telling a person from a cat

The first piece is a "sustained activity" sensor in six rooms. It turns on when the room shows a pattern a person makes and a cat doesn't: motion again at least 45 seconds after the lights came on, someone using the room's dimmer, voice satellite, or bedside button, or the lights getting turned back on within 2 minutes of the motion automation turning them off. A cat crossing the room is one burst of motion, so it leaves the sensor off. In the office, CO2 climbing faster than 2 ppm a minute also counts, using a [derivative sensor](https://www.home-assistant.io/integrations/derivative/).

### Bayesian room presence

Each room then gets a [Bayesian sensor](https://www.home-assistant.io/integrations/bayesian/). You give it a starting probability and a list of observations, and for each observation you say how often it's true when someone's in the room and how often it's true when nobody is. Home Assistant combines them into one probability, and my rooms read as occupied above 50%. The bedroom uses sustained activity, any motion, a TV or speaker playing, the bedroom Light Lock, and whether I'm home or guest mode is on.

<details>
<summary>Show the YAML</summary>

```yaml
- platform: bayesian
  name: Bedroom Presence
  device_class: occupancy
  prior: 0.3
  probability_threshold: 0.5
  observations:
    - platform: state
      entity_id: binary_sensor.bedroom_sustained_activity
      to_state: 'on'
      prob_given_true: 0.85
      prob_given_false: 0.05
    # Both motion sensors see the same room, so they're one observation
    - platform: template
      value_template: >
        {{ is_state('binary_sensor.bedroom_motion', 'on')
           or is_state('binary_sensor.hue_motion_sensor_2_motion', 'on') }}
      prob_given_true: 0.3
      prob_given_false: 0.05
    - platform: template
      value_template: >
        {{ is_state('person.joekarlsson', 'home')
           or is_state('input_boolean.guest_mode', 'on') }}
      prob_given_true: 0.99
      prob_given_false: 0.6
```

</details>

The Bayesian sensor treats every observation as independent evidence, and that bit me right away. I'd listed the bedroom's two motion sensors separately, so one cat walking past tripped both and the room read 65% occupied. If two sensors are watching the same thing, combine them into one observation.

The motion automations use that probability to pick a timeout. When a room reads as occupied, they wait a long time before turning the lights off (2 hours in the Great Room, 30 minutes in the kitchen). When it doesn't, like after a cat walks through, the lights go off after 5 minutes.

### mmWave radar on top

The last piece is mmWave radar. I added Aqara FP300 presence sensors in the Great Room and the bedroom and an FP2 in the office. Radar picks up someone sitting still, so it holds the lights on. The radar can't tell a cat from a person either, so it only counts while I'm home or guest mode is on. With the radar online, I cut the timeout after everyone leaves those rooms to 10 minutes. If a radar drops offline, that room goes back to the 2-hour timeout instead of guessing. The radar also gets ignored while Good Night, Time For Bed, or Nap Time has switched that room's motion sensing off, the same as the Hue motion sensors.

Before the radar and the Bayesian sensors, I sometimes ran 8 to 10 hour timers just so the lights wouldn't shut off while I was in the room. Now the lights turn off 10 minutes after I leave, and they almost never turn off on me. I've only run it since early October, so I'm still tuning the numbers.

### A Bayesian sleep sensor

Joe Asleep is the same idea applied to the whole house. It's a Bayesian sensor with eight observations: the time is between 10 PM and 10 AM, the bedroom reads occupied, the bedroom radar sees someone, no other room is occupied, nothing is playing outside the bedroom, the bedroom lights are off, my iPhone is charging, and a Focus is on. It needs 80% to turn on, so a daytime nap doesn't count. A guest watching a movie in the Great Room keeps it off too, because anything playing outside the bedroom counts against it.

Three automations use it. The morning routine turns on the kitchen lights and the Great Room sound system 5 minutes after Joe Asleep turns off. It used to run at a fixed 7 AM, which lit up the kitchen while I was still in bed. The Great Room TV turns itself off when Joe Asleep turns on. And the plain-English homelab alerts from earlier only push real outages while I'm asleep. Everything else waits until I'm up.

Tuning it took a few rounds. Before "no other room is occupied" was an observation, charging, Focus, and a dark bedroom added up to 82% while I was sitting in the Great Room, so now another room being occupied is the strongest sign I'm awake. The cats sleep on the bed too, so the bedroom radar only counts as moderate evidence. And the window used to end at a hard 7 AM, which released the held alerts before I was up.

### Local AI that makes yes-or-no calls

The basic version of local AI writes text that nothing depends on. The advanced version lets the answer change what the house does, and I think **that's where local AI is worth it: when it answers a yes-or-no question**.

[Frigate 0.18](https://github.com/blakeblackshear/frigate/releases/tag/v0.18.0) runs object detection and face recognition on a Quadro RTX 4000. Ollama runs [`qwen3-vl:8b`](https://ollama.com/library/qwen3-vl) for vision on an RTX A4000. Home Assistant calls it through the [AI Task integration](https://www.home-assistant.io/integrations/ai_task/), which sends a camera snapshot to the model and gets structured data back. The AI automations talk to Ollama directly with no cloud fallback, so camera snapshots never leave my network. I wrote up the voice side of this stack in my post on a [fully local voice assistant on a GPU](/blog/local-voice-ai-home-assistant-gpu/), which I built after [replacing Alexa with Voice Preview Edition](/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/).

These two earn their keep:

- **Package detection.** When a person stands at the front door for 10 to 60 seconds without ringing, the AI returns `has_package: true` or `false`.
- **Person or pet.** When there's motion in the Great Room while I'm away, the AI returns `is_person` and `is_animal`. A person gets a real alert, a pet gets a quiet note, and if Frigate recognized my face in the last 60 seconds, it doesn't bother asking.

Package detection is rarely wrong. Frigate's person detection is spottier, especially at night, when it regularly sees people who aren't there.

Both change what happens next based on the answer. Here's the package flow:

```text
person at the front door 10-60 s, no ring   (doorbell person detection)
        |
        v
snapshot -> ai_task.generate_data            (qwen3-vl:8b)
        |      ...AI errors? keep going, assume there's a package
        v
package, or nobody home?  --yes-->  push with the snapshot
        | no
        v
   stay quiet
```

When the model doesn't answer at all, the package check assumes there's a package, because I'd rather get a false alert than miss a delivery. The person check goes the other way: with no AI verdict, a Great Room detection stays a quiet note, because an unverified Frigate detection is wrong too often to wake me up.

## Cat TV and camera pop-ups

These two don't build on any basic. They're new kinds of automation I didn't think of until I'd lived with Home Assistant for years, and both run on the Great Room TV.

### Cat TV while I'm away

My cats love Cat TV. They're addicted, which I knew going in, and it's why I built it. Once I've been gone for 2 hours, between 7 AM and 11 PM, the Great Room TV starts this season's Cat TV playlist in SmartTube. If a video stops for 2 minutes, the next one starts. It stops at 11 PM, when I get home, or when guest mode turns on, and it only stops what it started, so it never turns off something someone else put on.

Because the TV is an OLED, Cat TV runs at most 6 hours a day and switches to a different video every 90 minutes, which keeps any one scene from sitting on the screen for hours. The movie lighting from earlier also skips its scene changes unless I'm home or guest mode is on. Otherwise the cats would get a dimmed theater every time a video starts.

The first version played from my main YouTube account, and my recommendations filled up with cat videos. Cat TV now has its own YouTube account, and getting the onn to play from it took some ADB work.

### Cameras that pop up on the TV

When the doorbell rings while the Great Room TV is on, the front door camera pops up picture-in-picture for 60 seconds through the QuickBars app on the onn, and whatever's playing pauses until it goes away. When Frigate sees a person or a car pull into the driveway while I'm home, the driveway camera pops up for 45 seconds, at most once every 5 minutes.

QuickBars _toggles_ picture-in-picture, so ringing the doorbell twice closes the camera you were trying to watch. Running the automation in single mode with a 60-second hold drops repeat rings while the camera is up.

The doorbell also pauses all six [self-hosted music players](/blog/self-hosted-music-still-sucks-in-2026/) in the house when it sees a person between 6 AM and 10 PM.

## Keeping 134 Home Assistant automations working

Most of my time on Home Assistant over 10 years has gone into automations that stopped working without telling me. A device goes offline, I replace my phone and every notification target changes, an integration update renames an entity, or I delete a script that a dashboard button still calls. Home Assistant keeps running and doesn't flag any of it.

A few from September 2026 alone:

- 60 automations were sending notifications to my old iPhone after I replaced it.
- My smoke detector read "off" for almost two days because it had stopped reporting.
- The automation that translates homelab alerts into plain English had received nothing for eight months, and I hadn't noticed.

### Find broken Home Assistant automations with health checks

Every 6 hours, a health check script pulls all my automations, scripts, and dashboards off the Home Assistant server and checks every entity, device, service, and notify target they reference. It also flags devices that are offline or unavailable, and automation runs that failed. Anything it finds shows up in a report and on my dashboard (that "Health checks 138/141" tile above), and that's how I caught the failed runs in September. A separate check flags safety sensors that haven't reported in too long, which is how the smoke detector got caught. It's the same approach I use across the rest of my homelab, where [86 health check scripts](/blog/opentofu-proxmox-immutable-homelab/) watch every container. The script is specific to my setup and isn't public.

The first time I ran it, it found 12 dead references, and Home Assistant's Repairs page hadn't flagged any of them. As far as I can tell, Repairs doesn't look inside templates, dashboards, or notify targets, which is where most of the breakage hides. If you don't want to write your own script, the [Watchman](https://github.com/dummylabs/thewatchman) integration does a lighter version of the same job (it scans your config files for missing entities and actions), and it's a great place to start once you're past about 30 automations.

![Scooby Doo Mask Reveal meme: Fred, labeled "My health check," pulls the mask off a ghost labeled "Repairs page: no issues found" to reveal a villain labeled "12 dead references"](/images/blog/best-home-assistant-automations/scooby-doo-health-check-dead-references.webp)

### Use continue_on_error so one failure doesn't stop everything

By default, when one action in a Home Assistant automation fails, [the whole automation stops right there](https://www.home-assistant.io/docs/scripts/). So if a bedtime routine turns off the lights and then tries to pause a speaker that happens to be offline, that one offline speaker stops everything that was supposed to come after it.

![Domino Effect meme: a man tips over a tiny domino labeled "One offline speaker," starting a chain that ends at a giant domino labeled "My entire 1AM bedtime routine"](/images/blog/best-home-assistant-automations/domino-effect-continue-on-error.webp)

I'd rather one step fail quietly than have my whole bedtime routine die at 1 AM. So any step that talks to something outside Home Assistant, like a device, a server, or an AI model, gets `continue_on_error: true`. My automations file has 148 of them.

```yaml
- action: ai_task.generate_data
  # ...snapshot attached, asks for has_package true/false...
  continue_on_error: true
```

It only covers runtime failures, like a device that doesn't answer. It won't save you from broken config, like a bad template or an action you deleted, and that's the kind of breakage the health checks are there to find. On its own, `continue_on_error` hides failures, so the two go together: the routine keeps running tonight, and the next health check report tells me what's broken.

### Using Claude to write and audit automations

I use Claude a lot for Home Assistant, mostly the way I'd use a friend who's good at YAML. I describe how I want something to work ("when the dryer stops shaking for 9 minutes, it's done, and if the washer finished in the last 15 minutes, send one notification"), and Claude Code drafts it against my real entity names, using the Home Assistant rules in [my Claude Code skills repo](/blog/my-personal-claude-code-skills-repo-accidentally-became-internal-tooling/).

Then I read every line. I don't ship an automation I can't explain well enough to debug when it misfires. Claude is great at getting something off the ground and at tedious work like repointing 60 notification targets. It only sees my config, though, so I still decide what the house should do.

It's also a decent auditor. Claude went through my setup and found three problems, which I've since fixed: the missing webhook behind the alert translator's eight months of silence, AI steps that would crash instead of carrying on when the model was offline, and a watchdog that only alerted inside Home Assistant.

## What's next: fewer custom components and fewer batteries

Lately I care more about reliability than about adding automations, so I use things out of the box whenever I can, and I'm a lot less likely to reach for third-party custom components or custom code than I used to be. Every custom piece is one more thing that can break on an update. The ones that survived, like Alarmo, Presence Simulation, and my health check script, stayed because nothing built in does their job, and the health checks tell me when one of them breaks.

I'm also trying to make the house more sustainable, and part of that is avoiding batteries wherever I can. Keeping batteries fresh across a house full of sensors sucks, and the battery-powered devices are usually the finicky ones. Most of the sensors in this post still run on batteries, which is why my health checks watch for the ones that go quiet.

I'm staying on Zigbee. Matter has been unstable for me so far, and I still have hope for it, but Zigbee is cheap and works great. I'm not moving my devices over until Matter settles down.

## The best Home Assistant automations to build first

1. **Motion lighting where a physical switch always wins.**
2. **One loud alert per safety sensor,** plus a check that the sensor is still reporting.
3. **Context on the basics you already have:** what's playing, what time it is, who's home.
4. **Modes that turn themselves off.**
5. **Rebuild one basic with better sensors,** like Bayesian presence, once the simple version annoys you.
6. **Local AI for rewriting text first, and for yes-or-no calls once you trust it.**
7. **Health checks and `continue_on_error` once you pass about 30 automations.**
