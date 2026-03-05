---
title: "Self-Hosted Music Still Sucks in 2025"
date: 2025-06-18
slug: "self-hosted-music-still-sucks-in-2025"
description: "TL;DR: The *arr ecosystem perfected video automation but music remains stuck with album-centric workflows that don’t match how we actually consume music. Current tools like Lidarr force complete..."
categories: ["Blog"]
heroImage: "/images/blog/self-hosted-music-still-sucks-in-2025/image-1.png"
---

> 
TL;DR: The *arr ecosystem perfected video automation but music remains stuck with album-centric workflows that don’t match how we actually consume music. Current tools like Lidarr force complete album downloads when users want individual tracks, creating a fundamental UX mismatch. We need ‘Songarr’ a track-first automation system that bridges streaming discovery with self-hosted ownership.

Look, I need to get something off my chest. After fifteen years of meticulously curating seasonal playlists and being a power Spotify user since 2011 (recently migrated to Apple Music for reasons we won’t get into here), I’m having a technical existential crisis about self-hosted music solutions. And frankly, it’s driving me absolutely insane.

Here’s the thing that keeps me up at night: We’ve completely solved video and TV automation from a technical standpoint. The *arr ecosystem is an architectural masterpiece, Sonarr and Radarr orchestrate complex workflows, Overseerr provides RESTful request management, and the entire stack scales horizontally with Docker compose files that would make infrastructure engineers weep with joy.

But music? Music is where technical elegance goes to die a slow death.

## The *arr ecosystem

Let me paint you a picture of how beautifully the video automation ecosystem functions, because understanding this technical perfection makes the music situation so much more painful.

**Sonarr and Radarr succeed because they solve a fundamental data modeling problem**. The content structure maps perfectly to distribution methods and API endpoints. Episodes and movies are naturally atomic units that correspond directly to torrent files, release groups, and user requests. You want “Breaking Bad S01E05”? That’s exactly one file with standardized scene naming conventions (`Breaking.Bad.S01E05.Gray.Matter.1080p.WEB-DL.DD5.1.H.264-KiNGS`), predictable release schedules, and clean hierarchical metadata.

The technical architecture is elegant: **TVDb/TMDb APIs provide canonical metadata sources**, release profiles handle quality management through configurable scoring systems, and the download client integration abstracts away the underlying acquisition mechanisms. It’s RESTful, it’s scalable, and it just works.

Then there’s **Overseerr, the crown jewel of microservice request interfaces**. Under the hood, it’s a Node.js application that speaks directly to *arr APIs, manages user authentication through Plex/Jellyfin SSO, and provides real-time WebSocket updates on request status. The entire workflow, from request submission to final media server refresh, is choreographed through well-defined API contracts and event-driven architecture patterns [[Overseerr](https://overseerr.dev/)].

But here’s where everything breaks down: **Lidarr operates in the same technical universe but feels like it was designed by completely different engineering teams with fundamentally incompatible requirements**.

## My music workflow for the past 15 years

Since 2011, my music consumption has been relentlessly focused on **track-level granular curation**. I’m that man that loves carefully crafted seasonal playlists, “Winter 2024,” “Summer Road Trip Bangers”, all built from individual tracks.

This isn’t because I’m anti-album. I deeply miss the full album experience and the artistic cohesion of a complete work. But streaming services fundamentally rewired how I discover and consume music through.

Now I want to self-host this workflow, and I keep running into the same technical brick wall: **current solutions are architected around release-centric data models that completely ignore modern consumption patterns**.

## The dream workflow that doesn’t exist yet

Let me paint a picture of how this should actually work from a user experience perspective, because understanding the target workflow makes the current technical limitations even more frustrating.

**Picture this scenario**: I’m sitting in a coffee shop, some incredible track comes on that I’ve never heard before. I pull out my phone, Shazam identifies it as “Midnight City” by M83. Perfect. Now, in my ideal world, I open my self-hosted music app (or even just a simple PWA), search for “Midnight City,” and hit “Add to Library.” Maybe I even specify which playlist I want it in.

That’s it. That’s the entire user interaction.

Behind the scenes the request goes into a queue, my home server figures out the best way to acquire that track (maybe it downloads the entire “Hurry Up, We’re Dreaming” album, maybe it finds a high-quality single release, I don’t care), extracts the specific track I want, applies proper metadata tagging, adds it to both my general library and the specified playlist, and sends me a notification that it’s ready.

The next time I’m home and fire up my music app, “Midnight City” is just there, ready to play, properly tagged, with album art, integrated into my playlist. No manual intervention, no hunting through Lidarr’s interface, no complex import workflows. It just works like Spotify works, except it’s my server, my music, my control.

Compare this to the current reality: I hear a song, I have to remember it, go home, fire up Lidarr’s web interface, search for the artist (hope I remembered the name correctly), browse through their discography to find the right album, add the entire album to monitoring, wait for it to download, manually import it, then separately fire up Navidrome or whatever music server I’m using, find the specific track I wanted from the 12 tracks that got downloaded, and manually add it to a playlist.

It’s 2025. This workflow is absolutely barbaric for track-level music discovery and curation.

**The missing piece is seamless request flow**. Overseerr nailed this for video content, beautiful search interface, one-click requests, automatic processing, notifications when ready. Music needs exactly the same pattern, but every current solution treats requesting music like you’re filing paperwork with the Department of Motor Vehicles.

I don’t care if my server downloads entire albums behind the scenes. Storage is cheap, bandwidth is plentiful, and disk space optimization is a solved problem. What I care about is **user experience that matches how humans actually discover and consume music in 2025**.

## Lidarr’s album-first architecture

Lidarr, despite being part of the *arr family, approaches music with an album-first data model that’s fundamentally misaligned with how humans actually consume music in 2025. The entire system is built around MusicBrainz releases, complete albums that exist as indivisible units in the database schema.

**The technical problems are architectural**:

**Database Design Issues**: Lidarr’s core entities are Artist → Album → Track, which mirrors traditional music industry structures but creates impedance mismatches with modern usage patterns. The primary keys and foreign key relationships assume you want complete releases, making track-level operations expensive and complex [[Lidarr GitHub](https://github.com/Lidarr/Lidarr)].

**API Contract Limitations**: The REST endpoints are structured around album operations (`/api/v1/album/{id}`), with tracks existing only as nested resources. There’s no first-class track endpoint that supports independent lifecycle management—you can’t request, monitor, or manage individual tracks outside of their parent album context [[Servarr Wiki](https://wiki.servarr.com/)].

**Release Profile Complexity**: Music metadata is infinitely more complex than video. The same track can exist across dozens of MusicBrainz releases: original album, remaster, compilation, single, live version, acoustic version, etc. Lidarr’s release profile system works well for albums but becomes a configuration nightmare when you want specific track variants [[MusicBrainz](https://musicbrainz.org/doc/MusicBrainz_XML_Meta_Data)].

**Download Client Integration**: The underlying torrent/Usenet ecosystem distributes complete albums, creating a fundamental mismatch where the acquisition layer delivers units that don’t match user requirements. Unlike video, where one torrent equals one desired content unit, music torrents contain 10-15 tracks when users often want just one.

## Current solutions

I’ve been deep in the weeds investigating every possible solution, and the technical landscape reveals why we’re stuck.

**Navidrome represents excellent server architecture** but zero automation capability. It’s a Go-based application that implements the Subsonic API specification, provides a clean React frontend, and handles audio transcoding through FFmpeg integration. The technical execution is solid—Docker deployment, SQLite/PostgreSQL backend options, LDAP authentication support [[Navidrome](https://www.navidrome.org/docs/overview/)]. But it’s architecturally positioned as a pure media server, not an automation system. It’s basically saying “bring your own music collection and I’ll serve it with sub-millisecond response times,” which completely sidesteps the workflow integration problem.

**Music Assistant takes a different architectural approach**, designed as a Home Assistant add-on with focus on multi-room audio and streaming service integration. The technical innovation is in the provider system—it can connect simultaneously to Spotify, YouTube Music, local libraries, and physical audio equipment through a unified API abstraction layer [[Music Assistant](https://github.com/music-assistant)]. But again, it’s not solving the core problem of building local libraries—it’s assuming you’re either streaming everything or already have local files.

**Lyrion Music Server (formerly Logitech Media Server)** offers sophisticated playlist management and a plugin ecosystem, but it’s built on Perl architecture from 2001 that predates modern container orchestration and API design patterns [[Lyrion](https://lyrion.org/)]. While functionally capable, the technical debt makes integration with modern self-hosted stacks painful.

E**very established solution has excellent technical execution within its domain, but the domains don’t overlap to solve the acquisition + automation + serving pipeline**.

## Why music automation is fundamentally harder

Video automation succeeds because of clean data modeling. One episode maps to one file maps to one torrent maps to one user request. The TMDb API provides canonical identifiers, release dates are predictable, and metadata relationships are hierarchical and stable. When someone requests “The Office S02E15,” every component in the stack knows exactly what that means and how to find it.

**Music fails because of data model complexity explosion**:

- **Entity Relationship Complexity**: Artists have complex many-to-many relationships (bands, collaborations, featuring credits). Albums have multiple release types (studio, live, compilation, single). Tracks can appear on multiple albums with different metadata.

- **Metadata Source Fragmentation**: Unlike video’s clean TMDb/TVDb duopoly, music has MusicBrainz, Last.fm, Discogs, AllMusic, and dozens of other sources with conflicting information and different coverage areas.

- **Version/Release Multiplicity**: The same song might have 20+ different releases in MusicBrainz—original single, album version, remaster, radio edit, acoustic version, live recordings, etc. The database complexity for handling all these variants is exponentially higher than video content.

- **Distribution/Consumption Mismatch**: Video torrents contain exactly what users want (complete episodes). Music torrents contain what labels release (complete albums), creating a fundamental architectural tension where the acquisition layer doesn’t match the consumption layer.

## Technical barriers in the song-level automation dream

Building the dream scenario faces legitimate technical barriers that go beyond simple engineering challenges.

**API Limitations**: Streaming services provide discovery APIs but explicitly prohibit download functionality. Spotify’s Web API gives you track metadata and 30-second previews but no pathway to audio files. Apple Music’s API is even more restrictive. Building automation requires finding alternative content sources with entirely different API contracts and reliability characteristics.

**Content Matching Complexity**: Implementing automated track acquisition requires solving the “same song, different source” problem. Audio fingerprinting through libraries like Chromaprint can identify tracks, but matching algorithms need to handle:

- Different audio quality/bitrates

- Slight timing variations

- Different mastering/remastering

- Various metadata formats and encoding standards

**Metadata Normalization**: Aggregating track information from multiple sources requires complex ETL pipelines to handle inconsistent data formats, different character encodings, and conflicting metadata. The same artist might be “Metallica,” “METALLICA,” or “Металлика” depending on the source.

**Quality Consistency**: Maintaining library coherence when acquiring from multiple sources becomes an engineering nightmare. Different audio formats (FLAC, MP3, AAC), bitrates (128kbps to lossless), and encoding parameters create a matrix of compatibility issues that video content rarely faces.

## Potential technical solutions

Despite the challenges, several architectural approaches could theoretically solve this puzzle using established tools and patterns.

**Microservice Extension of arr Architecture*: The most promising path involves extending the proven *arr pattern with a new service focused on track-level operations. Let’s call it “Songarr” for discussion purposes.

The technical architecture would mirror existing *arr services:

- **Core API Service**: RESTful endpoints for track management (`/api/v1/track/{id}`, `/api/v1/playlist/{id}/tracks`)

- **Metadata Provider Integration**: Adapters for MusicBrainz, Last.fm, and other sources following the same provider pattern as Prowlarr

- **Download Client Abstraction**: Integration with existing qBittorrent/SABnzbd instances, but with post-processing logic to extract specific tracks from complete album downloads

- **Media Server Integration**: APIs to update Navidrome, Jellyfin, and Plex libraries after track acquisition

**Database Schema Design**: The key innovation would be **track-first data modeling**:

```
CREATE TABLE tracks (
    id UUID PRIMARY KEY,
    title VARCHAR NOT NULL,
    artists JSONB, -- Many-to-many handled as JSON array
    isrc VARCHAR, -- International Standard Recording Code
    duration_ms INTEGER,
    acoustid_fingerprint VARCHAR,
    created_at TIMESTAMP,
    status VARCHAR -- wanted/snatched/downloaded/imported
);

CREATE TABLE track_sources (
    track_id UUID REFERENCES tracks(id),
    source_type VARCHAR, -- 'album', 'single', 'compilation'
    source_id VARCHAR, -- MusicBrainz release ID
    track_position INTEGER,
    metadata JSONB
);
```

**Smart Acquisition Logic**: Instead of downloading complete albums, the system could:

- Monitor for track requests via API or import from streaming playlists

- Find source albums containing desired tracks

- Download complete albums (leveraging existing infrastructure)

- Extract and tag specific tracks using FFmpeg

- Clean up unwanted files

- Update media server libraries

**Integration Bridges**: Building connector services between existing tools:

**Streaming → Local Bridge**: A service that monitors Spotify/Apple Music playlists through their APIs and automatically adds liked/starred tracks to the local acquisition queue. Implementation would use webhook triggers or scheduled polling to detect playlist changes.

**Request Interface Extension**: Extending Overseerr or building a similar interface specifically for music, with search integration across multiple metadata sources and the ability to request individual tracks rather than complete albums.

**Mobile App Integration**: Creating companion apps that can identify currently playing tracks (through Shazam-like audio fingerprinting) and add them to acquisition queues with a single tap.

## Wrap up

Here’s what frustrates me most about this entire situation from a technical perspective: **we have all the architectural components needed to build amazing self-hosted music workflows, but we’re stuck with impedance mismatches between systems designed for different data models**.

The *arr ecosystem proves that excellent automation is possible when you have clean API contracts, well-defined data models, and consistent content distribution patterns. Music automation fails because we’re trying to force modern track-centric consumption patterns into album-centric infrastructure that assumes everyone still thinks in terms of complete releases.

From a systems design perspective, the solution isn’t technically complex, it’s mostly about building the right abstraction layers and integration points between existing, proven components. **We need track-first data modeling with album-aware acquisition logic**, not more fundamental architecture.

The dream of adding individual songs to a self-hosted collection shouldn’t require a computer science PhD in 2025. We just need someone to build the missing integration layer that bridges discovery, acquisition, and library management using the solid technical foundation we already have.

Until someone tackles this integration challenge, I’ll keep running my hybrid workflow—discovering on Apple Music, manually managing my self-hosted collection through Navidrome, and muttering about database schema design decisions made by people who clearly never used streaming services.

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
