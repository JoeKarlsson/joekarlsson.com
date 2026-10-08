---
title: 'The Best Home Assistant Automations of 2026 (10 Years In)'
date: 2026-09-29
updatedDate: 2026-10-08
slug: 'best-home-assistant-automations'
description: 'The best Home Assistant automations after 10 years and 128 running: basic to advanced, plus how I find broken ones and keep them working.'
categories: ['Smart Home']
tags: ['Home Assistant', 'Smart Home', 'Automation', 'Local AI']
heroImage: '/images/blog/best-home-assistant-automations/hero.webp'
heroAlt: 'A finger pressing a pink 3D house made of circuit board traces, representing Home Assistant smart home automations'
tldr: "As of September 2026 (Home Assistant 2026.9), after 10 years and 128 running automations, these are the best Home Assistant automations worth building. Basic: motion lighting with a manual override, arriving and leaving, and leak, smoke, and CO2 alerts. Intermediate: one combined laundry notification, Meeting Mode from my Mac camera, modes that turn themselves off, and a nightlight that doubles as a status light. Advanced: local AI package detection, and room presence from mmWave radar and Bayesian sensors so the lights stay on while someone's sitting still. The biggest lesson from 10 years: automations break as devices change, so I run health checks to catch problems ahead of time and use continue_on_error so one broken step doesn't take down a whole automation."
faq:
  - question: 'What are the best Home Assistant automations for beginners?'
    answer: 'The best Home Assistant automations for beginners are motion lighting with a manual override, arriving and leaving routines, and safety alerts for any leak, smoke, or CO2 sensor you own. They pay off every day, and they work for guests without needing the app.'
  - question: 'Should I use YAML or the visual editor for Home Assistant automations in 2026?'
    answer: 'Both, in that order. Draft in the visual editor, especially now that purpose-specific triggers are the default since Home Assistant 2026.7, then keep the resulting YAML in git so you can diff it, review it, and scan it for broken references.'
  - question: 'How do I find broken automations and dead entities in Home Assistant?'
    answer: "Use a health check, because the Repairs page misses most of them. In my experience it catches some problems but not references inside templates, dashboards, custom cards, and notify targets. Use the Watchman integration or a scheduled script that checks every entity, device, and service your automations reference against Home Assistant's registries."
  - question: 'How many automations is too many in Home Assistant?'
    answer: 'There is no hard limit. I run 128 on Home Assistant 2026.9. The practical limit is maintenance: past about 30 automations, add a health check such as Watchman or a scheduled script so broken references get caught before they bite.'
  - question: 'What are good Home Assistant automation ideas beyond lights?'
    answer: 'Laundry alerts from a door contact and a vibration sensor, Meeting Mode triggered by the camera_in_use sensor on your Mac, a color-coded nightlight that shows garage, leak, and rain status, and closet lights on a door sensor.'
  - question: 'Should I use continue_on_error on every action?'
    answer: 'No. Use it on steps that talk to something outside Home Assistant, like a device, a server, or an AI model. On its own it hides failures, so pair it with a health check that tells you what broke.'
  - question: 'What does continue_on_error do in Home Assistant?'
    answer: 'By default, if one action in an automation or script fails, Home Assistant stops the whole run at that step. Setting continue_on_error: true on an action lets the rest of the automation keep going, so one broken device or offline service fails quietly instead of taking everything after it down with it.'
  - question: 'Can Home Assistant run AI locally?'
    answer: 'Yes. The AI Task integration can call a local model through Ollama, and Frigate can do object detection and face recognition on a GPU. Local AI works best when it returns a structured answer like has_package true or false, not a free-text description.'
---

I've been running Home Assistant since 2016. Today I have 128 automations, and the best Home Assistant automations I've built share one trait: someone who has never been in my house can live with them without an app, instructions, or me saying "oh, don't touch that switch."

These are the automation ideas I actually run, basic to advanced, with the details that took me years to get right. The biggest thing 10 years taught me is that automations break all the time without telling you, and keeping them working is a job of its own.

Quick context on the setup: Home Assistant 2026.9 runs as a VM on my [Proxmox cluster](/blog/homelab-two-years-later/), with 29 Zigbee devices on Zigbee2MQTT, [Frigate and local LLMs on GPUs](/blog/proxmox-gpu-passthrough-multi-service/), and [Ollama](https://ollama.com/) for the AI side. If you're brand new, start with my [Home Assistant getting-started guide](/blog/how-to-get-started-with-home-assistant-in-2026/) and come back. And if you want the actual hardware, every device is listed in the [smart home section of my uses page](/uses/#smart-home).

## The guest test

I live alone. I've lived with partners in this house before, and I have guests over all the time. So every automation in this house has to pass what I call **the guest test**:

**Could someone who has never been here, and doesn't have my app, live in this house without noticing the automations or having to work around them?**

![Soldier Protecting Sleeping Child meme: a soldier labeled "The physical light switch" shields a sleeping guest labeled "A guest at 2 AM" from flying weapons labeled "My motion automations"](/images/blog/best-home-assistant-automations/soldier-physical-switch-guest-test.webp)

That means a physical switch for everything. It means lights that turn on when you walk in and don't turn off while you're still sitting there. It means nobody has to learn a voice command to use the bathroom at night. If an automation fails the guest test, it's not done.

![My Home Assistant main dashboard with scene tiles, room tiles, infrastructure health, energy, and laundry status](/images/blog/best-home-assistant-automations/dashboard-overview.webp)

_My main dashboard (cameras and a few personal panels blurred). Look for the Laundry Done nightlight tile and the Washer: Running status; both come up later._

The whole list, at a glance:

| Automation                            | Difficulty   | Hardware                          |
| ------------------------------------- | ------------ | --------------------------------- |
| Motion lighting                       | Basic        | Motion sensors or Hue MotionAware |
| Closet lights on a door sensor        | Basic        | Door contact sensor, smart bulb   |
| Arriving and leaving                  | Basic        | Phone, smart garage opener        |
| Water leak, smoke, and CO2 alerts     | Basic        | Aqara leak, Heiman smoke, Aranet4 |
| Trash day reminder                    | Basic        | Phone, speaker (optional)         |
| Physical buttons and dimmers          | Intermediate | Hue dimmers, Zigbee buttons       |
| Laundry notifications                 | Intermediate | Door contact, vibration sensor    |
| Movie lighting that follows Plex      | Intermediate | Media player, lights with scenes  |
| Meeting Mode from your Mac camera     | Intermediate | Companion app on the Mac          |
| Party and guest modes                 | Intermediate | None (helpers only)               |
| Vacation mode and daily report        | Intermediate | Alarmo, Presence Simulation       |
| Nightlight status light               | Intermediate | Color Zigbee nightlight           |
| Pause music when someone's at door    | Intermediate | Frigate or a doorbell, speakers   |
| 3D printer alerts and auto power-off  | Intermediate | OctoPrint, smart plug             |
| Local AI package and person detection | Advanced     | Frigate, Ollama, AI Task          |
| Lights that know you're in the room   | Advanced     | mmWave presence sensors           |
| A sensor that knows when I'm asleep   | Advanced     | Phone, presence sensors           |

## Basic Home Assistant automations

Start here: motion lighting, arriving and leaving, and safety alerts. They're boring, and they're the ones my guests and I use every day.

### Motion lighting with a manual override

I have motion lighting in 10 rooms. My first attempts had a habit of turning the lights off on people who were sitting still, so everyone learned to wave their arms like they were landing a plane. These changes fixed it:

- **A manual override in every room.** Hit a physical switch or dimmer, and a timer starts; motion stops touching that room until it expires. If I started over, this is the first thing I'd build.
- **Dim instead of dark.** After 30 minutes of stillness, the kitchen drops to a 5% nightlight instead of going dark. Move, and the lights come back.
- **Time of day.** After 10 PM the kitchen comes on at 30% and a warm 2200K instead of full daylight at 2 AM.
- **Pause for the TV.** The Hue bridge turns the Great Room lights on from Hue MotionAware, and Home Assistant never turns them off while the TV or a Great Room speaker is playing. Nothing kills a movie like the lights snapping on because you reached for popcorn.

One gotcha took me way too long to find. If a `for: minutes: 30` timer is counting down and Home Assistant restarts, the timer is gone and the lights stay on until someone notices. My fix is a template trigger that asks "are the lights on, is nobody moving, and has nothing changed in 30 minutes?" That question has the same answer before and after a restart.

<details>
<summary>Show the YAML</summary>

```yaml
- alias: On and no motion for 30 min (re-arms after restart)
  trigger: template
  value_template: >
    {% set lights = ['light.kitchen'] %}
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

If you're starting today, Home Assistant 2026.7 made [purpose-specific triggers](https://www.home-assistant.io/blog/2026/07/01/release-20267/) the default in the visual editor, so "Motion detected in the kitchen" is a real trigger now, and it handles unavailable sensors for you. Use them for new automations. And my take on YAML vs the visual editor: draft in the editor, then keep the YAML in git so you can see what changed.

### Closet lights on a door sensor

This is the easiest automation in my house. A contact sensor on the bedroom and office closet doors turns the closet light on at 100% when the door opens and off when it closes. If the door gets left open, the light turns itself off after 10 minutes anyway.

It passes the guest test without anyone knowing it's there.

### Arriving and leaving

When the house goes from nobody home to someone home, an `im_home` script runs: the alarm disarms, both thermostats go back to their home presets, and the Roombas head back to their docks. When it goes back to nobody, `im_leaving` runs: the alarm arms (unless guest mode is on), and the Roombas start, because the best time to vacuum is when nobody is there to trip over them.

The garage door (a Meross opener) is the one to be careful with. An automation that opens a door to your house needs to be paranoid, so mine won't open just because my phone entered the home zone. It also needs evidence that I'm in a car: either I crossed a 1.5-mile "approaching" zone in the last 10 minutes, or my iPhone reports its activity as Automotive, so walking past the house doesn't open the garage. A midnight routine closes the garage every night, unless Party Mode is on.

### Water leak, smoke, and CO2 alerts

If you own a leak sensor and it isn't wired to an automation, you own an expensive coaster. Every safety sensor I have sends a loud alert:

- **Water:** 4 Aqara leak sensors send a critical push that breaks through Do Not Disturb, plus a spoken announcement on the speakers.
- **Smoke:** the kitchen smoke detector does the same.
- **Heat:** if the thermostat turns off between November and March, or when it's under 50°F outside, Home Assistant forces the heat back on at 62°F so the pipes don't freeze in a Minnesota winter because someone bumped the thermostat.
- **CO2:** above 1000 ppm, the office pushes me after 5 minutes and announces after 10. I keep an Aranet4 on my desk because I start getting foggy before I notice why.

These alerts only fire when a sensor changes state, and a dead sensor never changes state. I cover catching that in the section on keeping automations working.

### Trash day reminder

Every Tuesday at 6 PM, my phone tells me the bins go out tonight, with "Done" and "Remind in 1hr" buttons right on the notification. If I'm home, the kitchen speaker says it out loud too, at a volume that doesn't make me jump. It's also the "Garbage Day tomorrow" line at the top of my dashboard.

## Intermediate Home Assistant automations

These take more setup, usually a helper or two and some templating, and they're where Home Assistant stops being a fancy light switch.

### Physical buttons and dimmer switches

The guest test says there's a physical switch for everything, so buttons get as much automation work as anything else in my house.

Most of my lights are Philips Hue, and my advice to anyone with Hue bulbs is to **let the Hue bridge handle the basic switch-to-bulb stuff.** A Hue dimmer paired straight to the Hue bridge talks to the bulbs without Home Assistant or a Zigbee coordinator in the middle. When someone hits a switch, the light should respond instantly, every time, even if Home Assistant is restarting. The cost is that my switch logic now lives in two places, the Hue app and Home Assistant, and I have to remember which one owns what.

Then I layer custom actions on top in Home Assistant. One automation handles every Hue and Lutron Aurora dimmer in the house, so special behavior like long presses lives in one place. In the bedroom, a Zigbee button does different things depending on the time of day:

- **Single press:** good night in the evening, good morning in the morning.
- **Double press:** a red light before noon, nap mode in the afternoon, good night in the evening.
- **Long press:** turn off the whole bedroom.

That's six jobs on one button, and a guest who presses it once still gets something sensible.

### Laundry notifications

<img src="/images/blog/best-home-assistant-automations/dashboard-laundry.webp" alt="Home Assistant laundry tiles showing the washer running and the dryer idle" width="234" height="126" loading="lazy" />

Most laundry automations watch a smart plug's power draw and notify when it drops. I don't use plugs for either machine:

- **Washer:** a door contact sensor. The door closes, the cycle starts, and 70 minutes later it's done. So it's really a timer: 70 minutes fits my usual cycle, so a quick wash or an extra-long one gets the time wrong.
- **Dryer:** a vibration sensor. 5 minutes of continuous shaking means it started; 9 minutes of stillness means it's finished.

There are no power thresholds to tune, and the washer pausing mid-cycle can't trigger a false finish.

The part I'm proudest of is that if both finish within 15 minutes of each other, I get **one** notification instead of two. There's a 15-minute cooldown between announcements, a "Snooze 15 min" button on the push, and a progress bar on my phone's lock screen while each cycle runs. If a cycle finished while I was out, I get a reminder when I walk in the door.

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

### Movie lighting that follows Plex

When the Great Room TV (an onn 4K Pro running Plex) turns on, the lights fade into a movie scene over 10 seconds. When I press play in Plex, they step down to almost nothing over a few seconds. Pause or stop, and a lighter movie scene fades back in so you can find your drink. Turn the TV off, and the room goes back to a normal dimmed scene.

![Absolute Cinema meme: Martin Scorsese with his hands raised, captioned "Me when I press play in Plex and the lights fade to almost nothing" and "ABSOLUTE CINEMA"](/images/blog/best-home-assistant-automations/absolute-cinema-plex-lighting.webp)

I didn't get the fade times, the pause and stop behavior, or which scene lands when right on the first try. Once I did, I stopped thinking about the lights during movies.

The piece that makes it livable is a **Light Lock**. Flip it on and the automation stops touching the Great Room lights, for when you want the lights your way. It clears itself at 3 AM.

### Meeting Mode from your Mac camera

This is my favorite automation, and it has no button. When my work MacBook's camera turns on, Meeting Mode starts. When the camera turns off, Meeting Mode ends. Meeting Mode turns on the office lights and pauses the office speaker, so I'm never on a call in the dark with music playing behind me. A second automation turns on my Elgato Key Light when the camera goes live and turns it off 30 seconds after it stops.

The trigger is a `camera_in_use` binary sensor from the [Home Assistant companion app](https://companion.home-assistant.io/docs/core/sensors/) on the Mac. It's the most useful sensor I didn't know existed.

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

### Party and guest modes that turn themselves off

Party Mode turns on guest mode and disables 7 automations that would be annoying with a crowd, like doorbell announcements, package alerts, and the midnight shutdown. The motion lights skip their auto-off too, so the lights don't go off on anyone mid-conversation. Guest Mode disarms the alarm, puts the indoor camera in privacy mode, and stops Frigate recording.

Both expire on their own: Party Mode at 4 AM, Guest Mode after 24 hours. A mode you have to remember to turn off will eventually get left on, and then your motion lights stop working and you don't know why.

### Vacation mode and a daily report

When I turn on Vacation Mode, the [Presence Simulation](https://github.com/slashback100/presence_simulation) integration (from HACS, like Alarmo) replays realistic light patterns so the house looks lived in, and [Alarmo](https://github.com/nielsfaber/alarmo) arms in vacation mode. If the alarm fails to arm, I get a critical push, because otherwise I'd assume the house is armed when it isn't.

I use the daily report on every trip. At 9 AM every morning I'm away, one notification tells me the indoor temperature, the alarm state, any leaks, how many times the doorbell rang, packages detected, doors opened, when the pet sitter came by, and any National Weather Service alerts. I get one push and don't spend the trip wondering about the house.

### A nightlight that doubles as a status light

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

### Pause the music when someone's at the door

When the doorbell sees a person at the front door between 6 AM and 10 PM, all six [self-hosted music players](/blog/self-hosted-music-still-sucks-in-2026/) in the house pause, so you can hear the door and talk to whoever is there.

### 3D printer alerts and auto power-off

My Prusa runs through OctoPrint, and Home Assistant sends a push when a print starts, finishes, or fails. When a print finishes, the printer turns itself off once the bed cools below 95°F, and the notification has a "Keep On" button in case I'm about to start another one, so the printer doesn't idle overnight when I forget about it.

## Advanced Home Assistant automations

These need more hardware and more trust in your setup: a GPU and a local AI model, or presence sensors and some probability math. They still have to pass the guest test: a guest should never know any of it is involved, and when it fails, the house falls back to something sensible.

### Local AI package detection: only worth it for yes-or-no answers

After running local AI in my automations, I think **it's worth it when it answers a yes-or-no question**, and free-text descriptions are a novelty.

[Frigate 0.18](https://github.com/blakeblackshear/frigate/releases/tag/v0.18.0) runs object detection and face recognition on a Quadro RTX 4000. Ollama runs [`qwen3-vl:8b`](https://ollama.com/library/qwen3-vl) for vision on an RTX A4000. Home Assistant calls it through the [AI Task integration](https://www.home-assistant.io/integrations/ai_task/), which sends a camera snapshot to the model and gets structured data back. I wrote up the voice side of this stack in my post on a [fully local voice assistant on a GPU](/blog/local-voice-ai-home-assistant-gpu/), which I built after [replacing Alexa with Voice Preview Edition](/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/).

Two of them earn their keep:

- **Package detection.** When a person stands at the front door for 10 to 60 seconds without ringing, the AI returns `has_package: true` or `false`.
- **Person or pet.** When there's motion in the Great Room while I'm away, the AI returns `is_person` and `is_animal`. A person gets a real alert, a pet gets a quiet note, and if Frigate recognized my face in the last 60 seconds, it doesn't bother asking.

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

The novelty ones are the doorbell describing who's there ("A delivery driver in a brown uniform is holding a package") and being able to ask what's at the front door. Both work, and I'd barely notice if they disappeared.

When the model doesn't answer at all, mine assumes there's a package, because a false alert beats a missed delivery.

My AI automations talk to Ollama directly with no cloud fallback, so camera snapshots never leave my network.

### Lights that know you're still in the room

The fixes in the motion lighting section got me most of the way, but a motion sensor only sees movement. Sit still on the couch long enough and the lights still dim on you, and a cat walking through an empty room still counts as a person. In October 2026 I stopped asking one sensor whether a room is occupied and started having Home Assistant work out how likely it is from everything it knows about that room.

The first piece is a "sustained activity" sensor in six rooms. It turns on when the room shows a pattern a person makes and a cat doesn't: motion again at least 45 seconds after the lights came on, someone using the room's dimmer, voice satellite, or bedside button, or the lights getting turned back on within 2 minutes of the motion automation turning them off. A cat crossing the room is one burst of motion, so it leaves the sensor off. In the office, CO2 climbing faster than 2 ppm a minute also counts, using a [derivative sensor](https://www.home-assistant.io/integrations/derivative/).

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

The second piece is mmWave radar. I added Aqara FP300 presence sensors in the Great Room and the bedroom and an FP2 in the office. Radar picks up someone sitting still, so it holds the lights on while I'm home or guest mode is on, and nobody has to wave their arms anymore. With the radar online, I cut the timeout after everyone leaves those rooms to 10 minutes. The radar gets ignored while Good Night, Time For Bed, or Nap Time has switched that room's motion sensing off, the same as the Hue motion sensors.

### A sensor that knows when I'm asleep

Joe Asleep is the same idea applied to the whole house. It's a Bayesian sensor with eight observations: the time is between 10 PM and 10 AM, the bedroom reads occupied, the bedroom radar sees someone, no other room is occupied, nothing is playing outside the bedroom, the bedroom lights are off, my iPhone is charging, and a Focus is on. It needs 80% to turn on, so a daytime nap doesn't count, and I set it up that way on purpose.

Three automations use it. The morning routine turns on the kitchen lights and the Great Room sound system 5 minutes after Joe Asleep turns off. It used to run at a fixed 7 AM, which lit up the kitchen while I was still in bed. My homelab alerts only push outages to my phone while I'm asleep and hold everything else until I'm up. And the Great Room TV turns itself off when Joe Asleep turns on.

Tuning it took a few rounds. Before "no other room is occupied" was an observation, charging, Focus, and a dark bedroom added up to 82% while I was sitting in the Great Room, so now it's the strongest sign I'm awake. The cats sleep on the bed too, so the bedroom radar only counts as moderate evidence. And the window used to end at a hard 7 AM, which released the held alerts while I was still lying in bed.

## Keeping 128 Home Assistant automations working

**Automations break.** That's the one lesson 10 years of Home Assistant beat into me. Devices go offline. You replace a phone and every notification target changes. An integration update renames an entity. You delete a script and forget a dashboard button still calls it. Home Assistant keeps running, and nothing tells you the automation stopped doing its job.

A few from September 2026 alone:

- 60 automations were sending notifications to my old iPhone after I replaced it.
- My smoke detector read "off" for 45.7 hours because it had stopped reporting.
- An automation that translates server alerts into plain English had received nothing for eight months, and I hadn't noticed.

What works for me is catching problems ahead of time and making sure one broken step can't take down a whole automation.

### Find broken Home Assistant automations with health checks

Every 6 hours, a health check script pulls all my automations, scripts, and dashboards off the Home Assistant server and checks every entity, device, service, and notify target they reference. It also flags devices that are offline or unavailable, and automation runs that failed. Anything it finds shows up in a report and on my dashboard (that "Health checks 138/141" tile above), and that's how I caught the failed runs in September. A separate check flags safety sensors that haven't reported in too long, which is how the smoke detector got caught. It's the same approach I use across the rest of my homelab, where [86 health check scripts](/blog/opentofu-proxmox-immutable-homelab/) watch every container.

The first time I ran it, it found 12 dead references nothing else had flagged. Home Assistant's Repairs page didn't flag any of these for me. As far as I can tell, it doesn't look inside templates, dashboards, or notify targets, which is where most of the breakage hides. If you don't want to write your own script, the [Watchman](https://github.com/dummylabs/thewatchman) integration does a lighter version of the same job (it scans your config files for missing entities and actions), and it's a great place to start once you're past about 30 automations.

![Scooby Doo Mask Reveal meme: Fred, labeled "My health check," pulls the mask off a ghost labeled "Repairs page: no issues found" to reveal a villain labeled "12 dead references"](/images/blog/best-home-assistant-automations/scooby-doo-health-check-dead-references.webp)

### Use continue_on_error so one failure doesn't stop everything

By default, when one action in a Home Assistant automation fails, [the whole automation stops right there](https://www.home-assistant.io/docs/scripts/). So if a bedtime routine turns off the lights and then tries to pause a speaker that happens to be offline, that one offline speaker stops everything that was supposed to come after it.

![Domino Effect meme: a man tips over a tiny domino labeled "One offline speaker," starting a chain that ends at a giant domino labeled "My entire 1AM bedtime routine"](/images/blog/best-home-assistant-automations/domino-effect-continue-on-error.webp)

I'd much rather one step fail quietly than have my whole bedtime routine die at 1 AM. So any step that talks to something outside Home Assistant, like a device, a server, or an AI model, gets `continue_on_error: true`. My automations file has 148 of them.

```yaml
- action: ai_task.generate_data
  # ...snapshot attached, asks for has_package true/false...
  continue_on_error: true
```

On its own, `continue_on_error` just hides failures, so the health checks are what make it safe. The routine keeps running tonight, and the next health check report tells me what's broken so I can fix it tomorrow.

## Using Claude to write Home Assistant automations

I use Claude a lot for Home Assistant, mostly the way I'd use a friend who's good at YAML. I describe out loud how I want something to work ("when the dryer stops shaking for 9 minutes, it's done, and if the washer finished in the last 15 minutes, send one notification"), and Claude Code drafts it against my real entity names, using the Home Assistant rules in [my Claude Code skills repo](/blog/my-personal-claude-code-skills-repo-accidentally-became-internal-tooling/).

Then I read every line before it ships. My rule: if I can't explain what an automation does when it misfires at 2 AM, it doesn't go in. Claude is great at getting something off the ground and at tedious work like repointing 60 notification targets. It only sees my config, though, so deciding what the house should actually do is still my call.

While I was writing this post, Claude also audited my setup and found three real problems: the missing webhook behind the alert translator's eight months of silence, AI steps that would crash instead of carrying on when the model was offline, and a watchdog that only alerted inside Home Assistant. All three are fixed.

## Where I'd start with Home Assistant automations

1. **Motion lighting with a manual override.** A human should always win.
2. **One loud alert per safety sensor,** plus a check that the sensor is still reporting.
3. **Modes that turn themselves off.**
4. **Local AI only for yes-or-no answers.**
5. **Health checks and `continue_on_error` once you pass about 30 automations.**

## What's next: fewer custom components and fewer batteries

My 10 years with Home Assistant have been stops and starts. I'd go months without touching anything, then see someone's setup on Reddit and get inspired all over again. Or a new device or integration would show up and unlock an idea I'd been sitting on for years.

Lately I care more about reliability than about adding automations, so I use things out of the box whenever I can, and I'm a lot less likely to reach for third-party custom components or custom code than I used to be. Every custom piece is one more thing that can break on an update. The ones that survived, like Alarmo, Presence Simulation, and my health check script, stayed because nothing built in does their job, and the health checks are there to tell me when one of them breaks.

I'm also trying to make the house more sustainable, and part of that is avoiding batteries wherever I can. Keeping batteries fresh across a house full of sensors sucks, and the battery-powered devices are usually the finicky ones. Most of the sensors in this post still run on batteries, which is why my health checks watch for the ones that go quiet.

I'm staying on Zigbee. Matter has been pretty unstable so far, and I still have hope for it, but Zigbee is cheap and it works great for me. I'm not moving my devices over until Matter settles down.

Ten years in, Home Assistant is still the center of my house, and I'm planning to run it for another 10. What's still on the list: fewer battery sensors and getting that health checks tile from 138/141 to 141/141.
