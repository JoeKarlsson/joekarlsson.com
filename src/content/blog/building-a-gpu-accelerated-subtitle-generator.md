---
title: 'Building a GPU-Accelerated Subtitle Generator for My Video Library'
date: 2026-02-05
slug: 'building-a-gpu-accelerated-subtitle-generator'
description: 'How I built a self-hosted subtitle generation pipeline using GPU-accelerated Whisper AI on my homelab — with parallel workers, VRAM-aware scheduling, automatic language detection, and a multi-layer hallucination filter. A practical faster-whisper guide for video libraries at scale.'
categories: ['Homelab', 'AI']
heroImage: '/images/blog/building-a-gpu-accelerated-subtitle-generator/hero.webp'
heroAlt: 'GPU-accelerated subtitle generation pipeline architecture'
tldr: 'I built a multi-worker subtitle generation system using faster-whisper on NVIDIA GPUs. It features parallel folder-level processing with atomic locking, VRAM-aware scheduling that gracefully yields to other GPU workloads, automatic language detection with English translation, and a multi-layer hallucination filter. The whole thing runs on my Proxmox homelab alongside Plex and other GPU-hungry services.'
---

I have a large video library. Thousands of files across dozens of languages, and most of them don't have subtitles. Buying subtitle files isn't really an option at this scale, and the cloud transcription services that exist are either expensive or painfully slow. So I did what any reasonable person with two NVIDIA GPUs in their homelab would do: I built my own.

What started as a simple "just run Whisper on some files" script turned into a full production pipeline with parallel workers, GPU resource management, hallucination detection, and time-of-day scheduling. Here's how it works.

## Prerequisites

If you want to build something similar, you'll need:

- **Python 3.8+** with [faster-whisper](https://github.com/SYSTRAN/faster-whisper) (`pip install faster-whisper`)
- **NVIDIA GPU** with at least 5GB VRAM and [CUDA toolkit](https://developer.nvidia.com/cuda-toolkit) installed
- **ffmpeg** for audio extraction
- A video library that needs subtitles

## The Problem

The core challenge isn't just transcription — it's doing it **at scale** without destroying everything else running on the same hardware. My [homelab](/blog/how-to-get-started-building-a-homelab-server-in-2024/) GPUs (an RTX A4000 and a Quadro RTX 4000) are shared across Plex transcoding, Tdarr video health checks, and [Wyoming Whisper for Home Assistant voice control](/blog/i-replaced-my-smart-home-with-a-dumber-home-but-at-least-its-private/). I needed a system that could chew through thousands of videos without stepping on other services.

The requirements:

- **Automatic language detection** and translation to English
- **Parallel processing** — one worker is too slow for thousands of files
- **GPU-aware** — wait gracefully when VRAM is scarce instead of crashing
- **Incremental** — process new files without re-scanning everything
- **Reliable** — handle crashes, stale locks, and failures without human intervention

## Architecture Overview

The system has four layers:

```
┌─────────────────────────────────────────┐
│         Cron / Manual Trigger           │
├─────────────────────────────────────────┤
│    Scheduler (subtitle-scheduler.sh)    │
│    - Starts/stops workers               │
│    - Cleans stale locks                 │
│    - Manages worker lifecycle           │
├─────────────────────────────────────────┤
│  Parallel Workers (parallel-worker.sh)  │
│  - Folder-level claiming via mkdir      │
│  - GPU availability wait loop           │
│  - Progress tracking                    │
├─────────────────────────────────────────┤
│  Whisper Engine (generate-subtitles.py) │
│  - faster-whisper with CUDA             │
│  - Hallucination filtering              │
│  - SRT file generation                  │
└─────────────────────────────────────────┘
```

## The Whisper Engine

At the core is a Python script using [faster-whisper](https://github.com/SYSTRAN/faster-whisper), a CTranslate2-based reimplementation of [OpenAI's Whisper](https://github.com/openai/whisper) that runs significantly faster on [NVIDIA CUDA](https://developer.nvidia.com/cuda-toolkit)-enabled GPUs.

```python
MODEL_SIZE = "large-v3"
DEVICE = "cuda"
COMPUTE_TYPE = "float16"
MIN_VRAM_GB = 5
```

Each Whisper process needs about 5GB of VRAM. On the RTX A4000 (16GB), that means a theoretical maximum of 3 concurrent processes — but in practice I run 1-2 to leave headroom for Plex.

Before processing any video, the script checks GPU availability:

```python
def check_gpu() -> tuple[bool, str]:
    """Check if enough VRAM is available for Whisper."""
    result = subprocess.run(
        ["nvidia-smi", "--query-gpu=memory.free", "--format=csv,noheader,nounits"],
        capture_output=True, text=True
    )
    free_mb = int(result.stdout.strip().split("\n")[0])
    free_gb = free_mb / 1024
    if free_gb < MIN_VRAM_GB:
        return False, f"Insufficient VRAM: {free_gb:.1f}GB free, need {MIN_VRAM_GB}GB"
    return True, f"GPU ready: {free_gb:.1f}GB free"
```

The transcription itself uses some carefully tuned parameters:

```python
transcribe_params = {
    "task": "translate",                 # Auto-translates to English
    "beam_size": 5,
    "condition_on_previous_text": False, # Prevents hallucination loops
    "no_speech_threshold": 0.6,
    "word_timestamps": True,             # Word-level precision
    "vad_filter": True,                  # Voice Activity Detection
}
```

Setting `condition_on_previous_text` to `False` is critical. Without it, Whisper has a nasty habit of getting stuck in loops, repeating the same phrase over and over. With word-level timestamps and VAD filtering, the output is significantly cleaner.

## The Hallucination Problem

Anyone who's used Whisper at scale knows about hallucinations. Feed it a silent video or one with only background music, and it'll cheerfully generate subtitles like "Thank you for watching!" or "Please subscribe and hit the notification bell."

I built a multi-layer hallucination filter:

**1. Pattern matching** — Over 200 hardcoded patterns catch common Whisper artifacts:

- YouTube-isms: "thank you for watching", "please subscribe"
- Audio descriptions: "[music]", "[applause]"
- Foreign subtitle artifacts: "sous-titres", "untertitel"

**2. Repetition detection** — If the same text appears twice in the last 5 segments, or has 80%+ word overlap with a recent segment, it gets filtered.

**3. Duration check** — Any segment longer than 10 seconds is almost certainly broken and gets rejected.

**4. No-speech markers** — Videos with no detected speech get a `.nospeech` marker file so they're never reprocessed. This alone saves enormous amounts of GPU time on re-runs.

## Parallel Workers and Atomic Locking

The parallel worker system is where things get interesting. I needed multiple workers processing different folders simultaneously without stepping on each other, and I wanted to do it without a database or message queue.

The solution: **directory-based atomic locks using `mkdir`**.

```bash
claim_folder() {
    if mkdir "$CLAIMS_DIR/${folder}.lock" 2>/dev/null; then
        echo "$WORKER_ID:$$" > "$CLAIMS_DIR/${folder}.lock/owner"
        return 0  # Claimed successfully
    fi
    return 1  # Already claimed
}
```

`mkdir` is atomic on all POSIX systems — it either succeeds or fails, with no race condition window. Each lock directory stores the claiming worker's ID and PID, which the scheduler uses for stale lock cleanup:

```bash
clear_stale_locks() {
    for lockdir in "$CLAIMS_DIR"/*.lock; do
        local owner_pid="${owner_info#*:}"
        if ! kill -0 "$owner_pid" 2>/dev/null; then
            rm -rf "$lockdir"
            log "Cleared stale lock (PID $owner_pid dead)"
        fi
    done
}
```

If a worker crashes, its locks get cleaned up automatically on the next scheduler run. No zombie locks, no stuck folders.

Each worker also uses `flock` for instance-level locking to prevent duplicate workers:

```bash
exec 100>"$INSTANCE_LOCK"
if ! flock -n 100; then
    echo "Worker $WORKER_ID already running, exiting"
    exit 0
fi
```

## GPU-Aware Scheduling

The workers don't just blindly fire up Whisper. Each one implements an exponential backoff wait loop:

```bash
wait_for_gpu() {
    while ! /var/scripts/generate-subtitles --check-gpu; do
        if [ $waited -ge $GPU_MAX_WAIT ]; then
            return 1
        fi
        if [ $((waited % 300)) -eq 0 ]; then
            log "Waiting for GPU... (${waited}s elapsed)"
        fi
        sleep 60
        waited=$((waited + 60))
    done
}
```

If Plex is transcoding a 4K stream or Tdarr is running health checks, the subtitle workers simply wait. They check every 60 seconds, log every 5 minutes so you know they're alive, and give up after an hour. No CUDA out-of-memory crashes, no fighting for resources.

## Two Processing Strategies

The system supports two complementary approaches:

**Parallel workers** process entire folders sequentially, tracking completed folders in a progress file. Great for initial bulk processing of an existing library.

**Incremental workers** scan all folders looking for individual videos missing subtitle files. They ignore the folder-level progress tracking and instead check each video for a `.en.srt` or `.en.nospeech` file. Perfect for catching newly added content.

Both can run simultaneously — they use the same locking mechanism but different claiming strategies.

## Time-of-Day Scaling

The scheduler supports dynamic worker scaling:

```bash
./subtitle-scheduler.sh start-two   # 2 workers (overnight)
./subtitle-scheduler.sh drop-one    # 1 worker (peak hours)
./subtitle-scheduler.sh cleanup     # Stop everything
```

Via cron, I run 2 workers from midnight to 4 PM when nobody's streaming, then drop to 1 worker in the evening to free up GPU headroom for Plex. On weekends when there's heavy streaming, sometimes I just run cleanup and let the GPU breathe.

## Subtitle Quality

The output quality is surprisingly good. Word-level timestamps mean subtitles are tightly synced to speech. The VAD filter catches dialogue even through background music (I use an ultra-low threshold of 0.1). And the hallucination filter catches the vast majority of Whisper's creative additions.

The system generates standard `.en.srt` files that any media player can pick up automatically. Plex, Jellyfin, VLC — they all just find the subtitle file and offer it to the user.

## What I Learned

**Shell-native coordination works.** No Redis, no RabbitMQ, no database. Directory locks and `flock` are sufficient for coordinating a handful of workers on a single machine. Sometimes the simplest tool is the right one.

**GPU resource sharing is a real engineering problem.** The naive approach of "just run everything" leads to CUDA OOM crashes that can corrupt in-progress work. The wait-and-retry pattern costs some throughput but gives you reliability.

**Whisper hallucinations are predictable.** Once you've seen the patterns, they're easy to filter. The 200+ pattern list sounds excessive, but each one was added because it appeared in real output.

**Incremental processing is essential.** Any system that processes thousands of files needs a way to pick up where it left off. The combination of progress files and `.nospeech` markers means I can restart the system at any time without redoing work.

The whole system has been running for months now, churning through my video library a few folders at a time. It's not glamorous infrastructure, but it's the kind of thing that makes a homelab feel like a real production environment — and it's been one of the most satisfying things I've built.
