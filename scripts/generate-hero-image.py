#!/usr/bin/env python3
"""
Generate brutalist, terminal-aesthetic hero images for joekarlsson.com blog posts.

Usage:
    python3 scripts/generate-hero-image.py "Post Title" output/path/hero.webp [category]

Categories: homelab, smart-home, databases, dev-tools, devrel, iot, career, personal, travel, film
If no category given, defaults to a generic terminal aesthetic.

Style: Dark background, monospace text, geometric grid elements, scanlines,
       terminal chrome. No photos, no illustrations, no title text. Pure vibe.
       Each category gets its own color palette and themed code fragments.

Colors pulled from tailwind.config.mjs.
"""

import hashlib
import os
import random
import sys

from PIL import Image, ImageDraw, ImageFont

# Site color palette
COLORS = {
    "bg": "#0a0a0a",
    "surface1": "#111111",
    "surface2": "#1a1a1a",
    "surface3": "#222222",
    "surface4": "#3a3a3a",
    "coral": "#fdae84",
    "teal": "#8bcbc8",
    "lavender": "#c4b5fd",
    "mint": "#6ee7b7",
    "pink": "#f9a8d4",
    "sky": "#7dd3fc",
    "green": "#4ade80",
    "blue": "#60a5fa",
    "purple": "#c084fc",
    "yellow": "#fbbf24",
    "red": "#f87171",
    "cyan": "#22d3ee",
}

WIDTH = 1280
HEIGHT = 720

# Category-specific themes: (accent color keys, code fragments)
CATEGORY_THEMES = {
    "homelab": {
        "accents": ["green", "teal", "cyan"],
        "code": [
            "$ ssh root@proxmox",
            "$ pct list",
            "$ docker ps --format 'table {{.Names}}'",
            "$ curl -sL localhost:8080/health",
            "CONTAINER   STATUS    PORTS",
            "plex        running   32400/tcp",
            "grafana     running   3000/tcp",
            "prometheus  running   9090/tcp",
            "frigate     running   5000/tcp",
            "immich      running   2283/tcp",
            "ollama      running   11434/tcp",
            "uptime: 47d 12h 33m",
            "load: 0.42 0.38 0.31",
            "mem: 118G/128G used",
            "containers: 62 running",
            "for ct in $(pct list | tail -n+2); do",
            "  echo \"checking $ct...\"",
            "done",
            ">> all services healthy",
            "alerts: 0 critical, 0 warning",
            "backup: last run 2h ago (98% dedup)",
            "network: 20Gbps LACP bond active",
            "$ zpool status",
            "pool: rpool  state: ONLINE",
        ],
    },
    "smart-home": {
        "accents": ["coral", "yellow", "pink"],
        "code": [
            "automation:",
            "  trigger:",
            "    platform: state",
            "    entity_id: binary_sensor.motion",
            "  action:",
            "    service: light.turn_on",
            "    target:",
            "      entity_id: light.living_room",
            "$ mosquitto_sub -t zigbee2mqtt/#",
            "zigbee2mqtt/0x00158d0001: {\"temperature\": 22.4}",
            "state: binary_sensor.front_door = on",
            "frigate: person detected (92% conf)",
            "# night mode: 17 containers stopped",
            "power_saved: ~175W continuous",
            "assistant: wake word detected",
            "tts: \"Welcome home\"",
            "scene.activate: movie_time",
            "climate.set_temperature: 21",
            "cover.close: all_blinds",
            "notify: \"Motion detected at front door\"",
        ],
    },
    "databases": {
        "accents": ["blue", "purple", "lavender"],
        "code": [
            "SELECT * FROM users",
            "  WHERE created_at > NOW() - INTERVAL '7d'",
            "  ORDER BY id DESC LIMIT 100;",
            "db.collection.aggregate([",
            "  { $match: { status: \"active\" } },",
            "  { $group: { _id: \"$region\", count: { $sum: 1 } } }",
            "]);",
            "EXPLAIN ANALYZE",
            "Seq Scan on events (cost=0.00..431.00)",
            "  Filter: (created_at > '2026-01-01')",
            "  Rows Removed by Filter: 12840",
            "Execution Time: 2.341 ms",
            "CREATE INDEX CONCURRENTLY idx_events_date",
            "  ON events (created_at DESC);",
            "\\d+ events",
            "Indexes:",
            "  idx_events_date btree (created_at DESC)",
            "VACUUM ANALYZE events;",
            "rows_affected: 1248000",
            "INSERT INTO metrics (ts, value)",
            "  VALUES (NOW(), 42.7);",
        ],
    },
    "dev-tools": {
        "accents": ["cyan", "green", "sky"],
        "code": [
            "$ git log --oneline -5",
            "a3f2c1d feat: add new API endpoint",
            "b7e4a09 fix: resolve race condition",
            "$ npm run build",
            "vite v6.2.0 building for production...",
            "dist/index.js    142.3 kB | gzip: 41.2 kB",
            "built in 1.24s",
            "$ cargo test",
            "running 47 tests",
            "test result: ok. 47 passed; 0 failed",
            "$ docker build -t app:latest .",
            "=> [3/5] COPY package*.json ./",
            "=> [4/5] RUN npm ci --production",
            "=> exporting to image  0.4s",
            "$ curl -X POST /api/v2/deploy",
            "{ \"status\": \"deployed\", \"sha\": \"a3f2c1d\" }",
            "pipeline: all checks passed",
            "coverage: 94.2% (+0.3%)",
            "$ htop",
            "PID  USER  %CPU  %MEM  COMMAND",
            "1842 node  12.3  4.1   node server.js",
        ],
    },
    "devrel": {
        "accents": ["coral", "lavender", "mint"],
        "code": [
            "$ gh pr list --state open",
            "#142  docs: update quickstart guide",
            "#139  feat: add Python SDK example",
            "$ wc -w blog-post.md",
            "2847 blog-post.md",
            "talks_given: 47",
            "conferences: 23 countries",
            "blog_posts: 68 published",
            "$ vale --config=.vale.ini post.md",
            "0 errors, 0 warnings, 2 suggestions",
            "youtube: 142K views (last 28d)",
            "github_stars: +340 this month",
            "community: 2.4K members",
            "$ hugo server --buildDrafts",
            "Web Server is available at localhost:1313",
            "docs_prs_reviewed: 12 this week",
            "demo_apps_built: 3 this quarter",
            "feedback: \"best talk of the conf\"",
            "next_talk: KubeCon EU (March 2026)",
        ],
    },
    "iot": {
        "accents": ["green", "yellow", "cyan"],
        "code": [
            "$ platformio run --target upload",
            "Compiling .pio/build/esp32/src/main.cpp.o",
            "Uploading .pio/build/esp32/firmware.bin",
            "Serial.begin(115200);",
            "WiFi.begin(ssid, password);",
            "mqtt.publish(\"sensor/temp\", \"22.4\");",
            "GPIO 4: HIGH (relay ON)",
            "ADC reading: 2847 (3.3V ref)",
            "I2C scan: found 0x48 (TMP102)",
            "deep_sleep(60e6); // 60 seconds",
            "OTA update: 100% complete",
            "heap_free: 142384 bytes",
            "rssi: -62 dBm",
            "uptime: 142d 7h",
            "$ minicom -D /dev/ttyUSB0 -b 115200",
            "sensor: humidity=47.2% temp=21.8C",
            "BLE scan: 4 devices found",
            "PWM: duty=512 freq=5000Hz",
        ],
    },
    "career": {
        "accents": ["lavender", "coral", "sky"],
        "code": [
            "$ cat career.log | tail -20",
            "2018: junior developer @ startup",
            "2019: mid-level engineer @ growth co",
            "2021: senior engineer @ BigCo",
            "2023: staff engineer @ startup",
            "interviews: 47 conducted",
            "mentees: 12 active",
            "1:1s_this_week: 6",
            "code_reviews: 23 this sprint",
            "$ git shortlog -sn --all | head -5",
            "  1247  joe",
            "   892  teammate-a",
            "   634  teammate-b",
            "sprint_velocity: 42 points",
            "on_call_incidents: 0 (this rotation)",
            "docs_written: 14 ADRs",
            "promoted: true",
            "team_size: 8 -> 14",
            "systems_owned: 3",
        ],
    },
    "travel": {
        "accents": ["coral", "sky", "mint"],
        "code": [
            "$ curl api.weather.com/forecast",
            "{ \"temp\": 28, \"condition\": \"sunny\" }",
            "flight: SFO -> NRT (11h 22m)",
            "lat: 35.6762, lon: 139.6503",
            "timezone: UTC+9",
            "$ ping -c 3 hotel-wifi.local",
            "64 bytes: time=142ms",
            "64 bytes: time=89ms",
            "64 bytes: time=204ms",
            "avg: 145ms (acceptable)",
            "photos_taken: 847",
            "steps: 24,891 today",
            "elevation: 2,847m",
            "coffee_shops: 4 visited",
            "$ df -h /sdcard/DCIM",
            "Used: 47G / 128G (37%)",
            "battery: 42% (power save on)",
            "next_train: 14:23 (platform 3)",
            "maps: offline cache 2.4GB",
        ],
    },
    "film": {
        "accents": ["pink", "purple", "yellow"],
        "code": [
            "$ ffprobe input.mkv",
            "Duration: 02:14:33.12",
            "Video: h265 (HEVC), 3840x2160, 23.976 fps",
            "Audio: eac3, 48000 Hz, 5.1, 640 kb/s",
            "$ tdarr: queue 47 files",
            "encoding: H.265 CRF 20 (GPU)",
            "progress: 67% | ETA 4m 22s",
            "size: 24.3GB -> 8.7GB (-64%)",
            "plex: 4 active streams",
            "transcode: 1080p HEVC -> 720p H.264",
            "subtitle: .srt extracted (English)",
            "radarr: Downloading (47.2%)",
            "sonarr: S03E07 grabbed",
            "quality: Bluray-2160p",
            "audio: TrueHD 7.1 Atmos",
            "HDR: Dolby Vision Profile 8",
            "$ mediainfo --Output=JSON movie.mkv",
            "bitrate: 42.7 Mbps (avg)",
            "bechdel_score: 3/3",
        ],
    },
    "personal": {
        "accents": ["coral", "teal", "lavender"],
        "code": [
            "$ neofetch",
            "OS: macOS 15.3 Sequoia",
            "Host: MacBook Pro M4 Max",
            "Shell: zsh 5.9",
            "Terminal: Ghostty",
            "Editor: nvim 0.10",
            "$ uptime",
            "11:42  up 14 days, 3:22",
            "load: 1.42 1.23 0.98",
            "$ brew list | wc -l",
            "147",
            "$ wc -l ~/.zshrc",
            "342 .zshrc",
            "dotfiles: 23 symlinks",
            "git_repos: 89 local",
            "todos: 14 (3 overdue)",
            "coffee: 3 cups today",
            "$ cal",
            "    March 2026",
            "Su Mo Tu We Th Fr Sa",
            " 1  2  3  4  5  6  7",
        ],
    },
}

# Generic fallback
GENERIC_THEME = {
    "accents": ["coral", "teal", "lavender"],
    "code": [
        "$ echo 'hello world'",
        "hello world",
        "$ ls -la",
        "total 42",
        "drwxr-xr-x  12 user staff  384 Mar  5 11:42 .",
        "-rw-r--r--   1 user staff 2847 Mar  5 11:40 README.md",
        "$ cat /proc/uptime",
        "4084247.42 7891234.12",
        "$ whoami",
        "joe",
        "$ date -u",
        "Thu Mar  5 17:42:00 UTC 2026",
        "status: operational",
        "requests: 1.2M/day",
        "latency_p99: 42ms",
        "errors: 0.02%",
    ],
}


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def with_alpha(rgb, a):
    return rgb + (min(255, max(0, a)),)


def seed_from_title(title):
    """Deterministic seed from title so the same title always produces the same image."""
    return int(hashlib.md5(title.encode()).hexdigest()[:8], 16)


def get_theme(category):
    """Get the theme for a category, normalizing the input."""
    if not category:
        return GENERIC_THEME
    key = category.lower().strip().replace(" ", "-")
    # Map full category names to keys
    aliases = {
        "smart home": "smart-home",
        "dev tools": "dev-tools",
    }
    key = aliases.get(category.lower().strip(), key)
    return CATEGORY_THEMES.get(key, GENERIC_THEME)


def get_accents_from_theme(theme):
    return [hex_to_rgb(COLORS[k]) for k in theme["accents"]]


def draw_grid(draw, rng, accent):
    """Draw a visible background grid."""
    grid_color = with_alpha(hex_to_rgb(COLORS["surface4"]), 100)
    spacing = rng.choice([32, 48, 64])

    for x in range(0, WIDTH, spacing):
        draw.line([(x, 0), (x, HEIGHT)], fill=grid_color, width=1)
    for y in range(0, HEIGHT, spacing):
        draw.line([(0, y), (WIDTH, y)], fill=grid_color, width=1)

    # Accent grid lines (sparse but visible)
    accent_line_color = with_alpha(accent, 60)
    big_spacing = spacing * 4
    for x in range(0, WIDTH, big_spacing):
        draw.line([(x, 0), (x, HEIGHT)], fill=accent_line_color, width=2)
    for y in range(0, HEIGHT, big_spacing):
        draw.line([(0, y), (WIDTH, y)], fill=accent_line_color, width=2)


def draw_scanlines(draw, rng):
    """Subtle CRT scanline effect."""
    opacity = rng.randint(8, 20)
    for y in range(0, HEIGHT, 3):
        draw.line([(0, y), (WIDTH, y)], fill=(0, 0, 0, opacity), width=1)


def draw_geometric_blocks(draw, rng, accents):
    """Draw brutalist geometric rectangles and lines."""
    num_blocks = rng.randint(12, 25)
    for _ in range(num_blocks):
        accent = rng.choice(accents)
        opacity = rng.randint(30, 90)
        block_type = rng.choice(["rect", "rect", "line", "dot_cluster"])

        if block_type == "rect":
            w = rng.randint(40, 350)
            h = rng.randint(20, 180)
            x = rng.randint(-50, WIDTH - 20)
            y = rng.randint(-50, HEIGHT - 20)
            draw.rectangle([x, y, x + w, y + h], fill=with_alpha(accent, opacity))
            if rng.random() > 0.3:
                draw.rectangle(
                    [x, y, x + w, y + h],
                    outline=with_alpha(accent, opacity + 60),
                    width=rng.choice([1, 2, 3]),
                )

        elif block_type == "line":
            x1 = rng.randint(0, WIDTH)
            y1 = rng.randint(0, HEIGHT)
            if rng.random() > 0.3:
                x2 = rng.randint(0, WIDTH)
                y2 = y1
            else:
                x2 = x1
                y2 = rng.randint(0, HEIGHT)
            draw.line(
                [(x1, y1), (x2, y2)],
                fill=with_alpha(accent, opacity + 40),
                width=rng.choice([2, 3, 4]),
            )

        elif block_type == "dot_cluster":
            cx = rng.randint(50, WIDTH - 50)
            cy = rng.randint(50, HEIGHT - 50)
            dot_count = rng.randint(5, 30)
            dot_size = rng.choice([2, 3, 4])
            spread = rng.randint(20, 100)
            for _ in range(dot_count):
                dx = cx + rng.randint(-spread, spread)
                dy = cy + rng.randint(-spread, spread)
                draw.ellipse(
                    [dx, dy, dx + dot_size, dy + dot_size],
                    fill=with_alpha(accent, opacity + 50),
                )


def draw_terminal_chrome(draw, rng, accent):
    """Draw terminal window decorations."""
    bar_height = rng.choice([32, 40, 48])
    bar_y = rng.randint(40, 150)
    bar_color = with_alpha(hex_to_rgb(COLORS["surface3"]), 220)
    draw.rectangle([0, bar_y, WIDTH, bar_y + bar_height], fill=bar_color)

    # Three dots (macOS window controls)
    dot_y = bar_y + bar_height // 2
    dot_colors = [
        hex_to_rgb(COLORS["red"]),
        hex_to_rgb(COLORS["yellow"]),
        hex_to_rgb(COLORS["green"]),
    ]
    dot_r = max(4, bar_height // 8)
    for i, dc in enumerate(dot_colors):
        cx = 20 + i * (dot_r * 3)
        draw.ellipse(
            [cx - dot_r, dot_y - dot_r, cx + dot_r, dot_y + dot_r],
            fill=with_alpha(dc, 200),
        )

    return bar_y, bar_height


def draw_fake_code(draw, rng, accents, bar_y, bar_height, code_fragments):
    """Draw themed code/terminal lines below the chrome bar."""
    mono_font = get_mono_font(14)
    y = bar_y + bar_height + 14
    indent = 24
    num_lines = rng.randint(6, 14)

    shuffled = list(code_fragments)
    rng.shuffle(shuffled)
    for i in range(min(num_lines, len(shuffled))):
        line = shuffled[i]
        accent = rng.choice(accents)
        opacity = rng.randint(80, 170)
        line_indent = indent + (rng.choice([0, 0, 0, 16, 32]) if not line.startswith("$") else 0)
        draw.text(
            (line_indent, y),
            line,
            fill=with_alpha(accent, opacity),
            font=mono_font,
        )
        y += rng.randint(20, 28)
        if y > HEIGHT - 80:
            break


def draw_corner_accents(draw, rng, accents):
    """Draw accent marks in corners - brackets."""
    accent = rng.choice(accents)
    opacity = rng.randint(120, 200)
    color = with_alpha(accent, opacity)
    weight = rng.choice([2, 3, 4])
    length = rng.randint(40, 80)

    # Top-left bracket
    draw.line([(10, 10), (10 + length, 10)], fill=color, width=weight)
    draw.line([(10, 10), (10, 10 + length)], fill=color, width=weight)

    # Top-right bracket
    if rng.random() > 0.4:
        accent2 = rng.choice(accents)
        color2 = with_alpha(accent2, opacity - 20)
        draw.line([(WIDTH - 10, 10), (WIDTH - 10 - length, 10)], fill=color2, width=weight)
        draw.line([(WIDTH - 10, 10), (WIDTH - 10, 10 + length)], fill=color2, width=weight)

    # Bottom-left bracket
    if rng.random() > 0.4:
        accent3 = rng.choice(accents)
        color3 = with_alpha(accent3, opacity - 20)
        draw.line([(10, HEIGHT - 10), (10 + length, HEIGHT - 10)], fill=color3, width=weight)
        draw.line([(10, HEIGHT - 10), (10, HEIGHT - 10 - length)], fill=color3, width=weight)


def draw_watermark(draw, accents):
    """Draw joekarlsson.com watermark in bottom-right corner."""
    font = get_mono_font(14)
    text = "joekarlsson.com"

    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    x = WIDTH - text_w - 20
    y = HEIGHT - text_h - 16

    # Dark backing pill for readability
    pad_x = 10
    pad_y = 6
    draw.rectangle(
        [x - pad_x, y - pad_y, x + text_w + pad_x, y + text_h + pad_y],
        fill=(10, 10, 10, 200),
    )

    # Accent-colored text
    accent = accents[0]
    draw.text((x, y), text, fill=with_alpha(accent, 180), font=font)


def draw_noise(img, rng, amount=0.03):
    """Add subtle noise/grain."""
    pixels = img.load()
    noise_count = int(WIDTH * HEIGHT * amount)
    for _ in range(noise_count):
        x = rng.randint(0, WIDTH - 1)
        y = rng.randint(0, HEIGHT - 1)
        r, g, b, a = pixels[x, y]
        delta = rng.randint(-15, 15)
        pixels[x, y] = (
            max(0, min(255, r + delta)),
            max(0, min(255, g + delta)),
            max(0, min(255, b + delta)),
            a,
        )


def get_mono_font(size):
    """Try to load a monospace font, fall back to default."""
    mono_paths = [
        "/System/Library/Fonts/SFMono-Regular.otf",
        "/System/Library/Fonts/Menlo.ttc",
        "/System/Library/Fonts/Monaco.ttf",
        "/Library/Fonts/JetBrainsMono-Regular.ttf",
        "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/TTF/JetBrainsMono-Regular.ttf",
    ]
    for path in mono_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except (OSError, IOError):
                continue
    return ImageFont.load_default()


def generate(title, output_path, category=None):
    rng = random.Random(seed_from_title(title))
    theme = get_theme(category)
    accents = get_accents_from_theme(theme)

    # Create RGBA image
    img = Image.new("RGBA", (WIDTH, HEIGHT), hex_to_rgb(COLORS["bg"]) + (255,))
    draw = ImageDraw.Draw(img, "RGBA")

    # Layer 1: Grid
    draw_grid(draw, rng, accents[0])

    # Layer 2: Geometric blocks
    draw_geometric_blocks(draw, rng, accents)

    # Layer 3: Terminal chrome + themed code
    bar_y, bar_height = draw_terminal_chrome(draw, rng, accents[0])
    draw_fake_code(draw, rng, accents, bar_y, bar_height, theme["code"])

    # Layer 4: Corner accents
    draw_corner_accents(draw, rng, accents)

    # Layer 5: Scanlines
    draw_scanlines(draw, rng)

    # Layer 6: Watermark
    draw_watermark(draw, accents)

    # Layer 7: Noise
    draw_noise(img, rng)

    # Flatten to RGB for WebP
    rgb_img = Image.new("RGB", (WIDTH, HEIGHT), hex_to_rgb(COLORS["bg"]))
    rgb_img.paste(img, mask=img.split()[3])

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Save as WebP
    rgb_img.save(output_path, "WEBP", quality=85)
    print(f"Generated: {output_path} ({WIDTH}x{HEIGHT}, category={category or 'generic'})")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print('Usage: python3 generate-hero-image.py "Post Title" output/path/hero.webp [category]')
        print("Categories: homelab, smart-home, databases, dev-tools, devrel, iot, career, personal, travel, film")
        sys.exit(1)

    title = sys.argv[1]
    output = sys.argv[2]
    category = sys.argv[3] if len(sys.argv) > 3 else None
    generate(title, output, category)
