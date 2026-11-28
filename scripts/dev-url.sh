#!/usr/bin/env bash
# Prints the URL of an Astro dev server that serves THIS checkout, starting one if none is running.
#
#   npm run dev:url            # http://localhost:4321 (or whichever port it got)
#   npm run dev:url -- 4400    # start on 4400 if it has to start one
#
# Several sessions (and worktrees) run dev servers at once, and a port near yours can belong to
# another checkout's server: on 2026-11-27 a session screenshotted a stale copy of the site twice
# before noticing. This refuses any server whose working folder isn't this checkout.
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd -P)
cd "$root"

running_url() { npx astro dev status 2>/dev/null | grep -o 'http://localhost:[0-9]*' | head -1 || true; }

url=$(running_url)
if [ -z "$url" ]; then
	npx astro dev --port "${1:-4321}" >/dev/null 2>&1 &
	for _ in $(seq 1 45); do
		sleep 1
		url=$(running_url)
		[ -n "$url" ] && break
	done
fi
[ -n "$url" ] || { echo "dev-url: the dev server didn't start in 45 s" >&2; exit 1; }

port=${url##*:}
pid=$(lsof -tiTCP:"$port" -sTCP:LISTEN | head -1)
[ -n "$pid" ] || { echo "dev-url: nothing is listening on $port" >&2; exit 1; }
cwd=$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p')
[ "$(cd "$cwd" && pwd -P)" = "$root" ] || { echo "dev-url: port $port is served from $cwd, not $root" >&2; exit 1; }
curl -fsS -o /dev/null --max-time 60 "$url/" || { echo "dev-url: $url doesn't answer" >&2; exit 1; }
echo "$url"
