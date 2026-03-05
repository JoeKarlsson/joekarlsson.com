---
title: 'Self-Hosted Music Still Sucks in 2025'
date: 2025-06-18
slug: 'self-hosted-music-still-sucks-in-2025'
description: 'TL;DR: The *arr ecosystem perfected video automation but music remains stuck with album-centric workflows that don’t match how we actually consume music. Current tools like Lidarr force complete...'
categories: ['Smart Home', 'Homelab']
heroImage: '/images/blog/self-hosted-music-still-sucks-in-2025/image-1.webp'
---

> TL;DR: The \*arr ecosystem perfected video automation but music remains stuck with album-centric workflows that don’t match how we actually consume music. Current tools like Lidarr force complete album downloads when users want individual tracks, creating a fundamental UX mismatch. We need ‘Songarr’ a track-first automation system that bridges streaming discovery with self-hosted ownership.

Look, I need to get something off my chest. After fifteen years of meticulously curating seasonal playlists and being a power Spotify user since 2011 (recently migrated to Apple Music for reasons we won’t get into here), I’m having a technical existential crisis about self-hosted music solutions. And frankly, it’s driving me absolutely insane.

Here’s the thing that keeps me up at night: We’ve completely solved video and TV automation from a technical standpoint. The \*arr ecosystem is an architectural masterpiece, Sonarr and Radarr orchestrate complex workflows, Overseerr provides RESTful request management, and the entire stack scales horizontally with Docker compose files that would make infrastructure engineers weep with joy.

But music? Music is where technical elegance goes to die a slow death.

## The \*arr ecosystem

Let me paint you a picture of how beautifully the video automation ecosystem functions, because understanding this technical perfection makes the music situation so much more painful.

**Sonarr and Radarr succeed because they solve a fundamental data modeling problem**. The content structure maps perfectly to distribution methods and API endpoints. Episodes and movies are naturally atomic units that correspond directly to torrent files, release groups, and user requests. You want “Breaking Bad S01E05”? That’s exactly one file with standardized scene naming conventions (`Breaking.Bad.S01E05.Gray.Matter.1080p.WEB-DL.DD5.1.H.264-KiNGS`), predictable release schedules, and clean hierarchical metadata.

The technical architecture is elegant: **TVDb/TMDb APIs provide canonical metadata sources**, release profiles handle quality management through configurable scoring systems, and the download client integration abstracts away the underlying acquisition mechanisms. It’s RESTful, it’s scalable, and it just works.

Then there’s **Overseerr, the crown jewel of microservice request interfaces**. Under the hood, it’s a Node.js application that speaks directly to \*arr APIs, manages user authentication through Plex/Jellyfin SSO, and provides real-time WebSocket updates on request status. The entire workflow, from request submission to final media server refresh, is choreographed through well-defined API contracts and event-driven architecture patterns [[Overseerr](https://overseerr.dev/)].

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

Lidarr, despite being part of the \*arr family, approaches music with an album-first data model that’s fundamentally misaligned with how humans actually consume music in 2025. The entire system is built around MusicBrainz releases, complete albums that exist as indivisible units in the database schema.

**The technical problems are architectural**:

**Database Design Issues**: Lidarr’s core entities are Artist → Album → Track, which mirrors traditional music industry structures but creates impedance mismatches with modern usage patterns. The primary keys and foreign key relationships assume you want complete releases, making track-level operations expensive and complex [[Lidarr GitHub](https://github.com/Lidarr/Lidarr)].

**API Contract Limitations**: The REST endpoints are structured around album operations (`/api/v1/album/{id}`), with tracks existing only as nested resources. There’s no first-class track endpoint that supports independent lifecycle management-you can’t request, monitor, or manage individual tracks outside of their parent album context [[Servarr Wiki](https://wiki.servarr.com/)].

**Release Profile Complexity**: Music metadata is infinitely more complex than video. The same track can exist across dozens of MusicBrainz releases: original album, remaster, compilation, single, live version, acoustic version, etc. Lidarr’s release profile system works well for albums but becomes a configuration nightmare when you want specific track variants [[MusicBrainz](https://musicbrainz.org/doc/MusicBrainz_XML_Meta_Data)].

**Download Client Integration**: The underlying torrent/Usenet ecosystem distributes complete albums, creating a fundamental mismatch where the acquisition layer delivers units that don’t match user requirements. Unlike video, where one torrent equals one desired content unit, music torrents contain 10-15 tracks when users often want just one.

## Current solutions

I’ve been deep in the weeds investigating every possible solution, and the technical landscape reveals why we’re stuck.

**Navidrome represents excellent server architecture** but zero automation capability. It’s a Go-based application that implements the Subsonic API specification, provides a clean React frontend, and handles audio transcoding through FFmpeg integration. The technical execution is solid-Docker deployment, SQLite/PostgreSQL backend options, LDAP authentication support [[Navidrome](https://www.navidrome.org/docs/overview/)]. But it’s architecturally positioned as a pure media server, not an automation system. It’s basically saying “bring your own music collection and I’ll serve it with sub-millisecond response times,” which completely sidesteps the workflow integration problem.

**Music Assistant takes a different architectural approach**, designed as a Home Assistant add-on with focus on multi-room audio and streaming service integration. The technical innovation is in the provider system-it can connect simultaneously to Spotify, YouTube Music, local libraries, and physical audio equipment through a unified API abstraction layer [[Music Assistant](https://github.com/music-assistant)]. But again, it’s not solving the core problem of building local libraries-it’s assuming you’re either streaming everything or already have local files.

**Lyrion Music Server (formerly Logitech Media Server)** offers sophisticated playlist management and a plugin ecosystem, but it’s built on Perl architecture from 2001 that predates modern container orchestration and API design patterns [[Lyrion](https://lyrion.org/)]. While functionally capable, the technical debt makes integration with modern self-hosted stacks painful.

E**very established solution has excellent technical execution within its domain, but the domains don’t overlap to solve the acquisition + automation + serving pipeline**.

## Why music automation is fundamentally harder

Video automation succeeds because of clean data modeling. One episode maps to one file maps to one torrent maps to one user request. The TMDb API provides canonical identifiers, release dates are predictable, and metadata relationships are hierarchical and stable. When someone requests “The Office S02E15,” every component in the stack knows exactly what that means and how to find it.

**Music fails because of data model complexity explosion**:

- **Entity Relationship Complexity**: Artists have complex many-to-many relationships (bands, collaborations, featuring credits). Albums have multiple release types (studio, live, compilation, single). Tracks can appear on multiple albums with different metadata.

- **Metadata Source Fragmentation**: Unlike video’s clean TMDb/TVDb duopoly, music has MusicBrainz, Last.fm, Discogs, AllMusic, and dozens of other sources with conflicting information and different coverage areas.

- **Version/Release Multiplicity**: The same song might have 20+ different releases in MusicBrainz-original single, album version, remaster, radio edit, acoustic version, live recordings, etc. The database complexity for handling all these variants is exponentially higher than video content.

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

\*_Microservice Extension of arr Architecture_: The most promising path involves extending the proven \*arr pattern with a new service focused on track-level operations. Let’s call it “Songarr” for discussion purposes.

The technical architecture would mirror existing \*arr services:

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

The \*arr ecosystem proves that excellent automation is possible when you have clean API contracts, well-defined data models, and consistent content distribution patterns. Music automation fails because we’re trying to force modern track-centric consumption patterns into album-centric infrastructure that assumes everyone still thinks in terms of complete releases.

From a systems design perspective, the solution isn’t technically complex, it’s mostly about building the right abstraction layers and integration points between existing, proven components. **We need track-first data modeling with album-aware acquisition logic**, not more fundamental architecture.

The dream of adding individual songs to a self-hosted collection shouldn’t require a computer science PhD in 2025. We just need someone to build the missing integration layer that bridges discovery, acquisition, and library management using the solid technical foundation we already have.

Until someone tackles this integration challenge, I’ll keep running my hybrid workflow-discovering on Apple Music, manually managing my self-hosted collection through Navidrome, and muttering about database schema design decisions made by people who clearly never used streaming services. If you’re curious about self-hosting in general, I wrote about [how to get started building a homelab server](/blog/how-to-get-started-building-a-homelab-server-in-2024/) where I run all of these services.
