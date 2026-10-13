#!/usr/bin/env bash
# Voice lint (Vale, errors only) for blog posts changed relative to origin/main,
# plus uncommitted ones. Same scope as the CI "voice" job, so a post that would
# fail CI fails here first. Older posts aren't linted until they're edited.
set -euo pipefail
cd "$(dirname "$0")/.."
if ! command -v vale >/dev/null; then
  echo "vale not installed (brew install vale); skipping voice lint" >&2
  exit 0
fi
[ -d .vale/styles/JoeKarlsson ] || vale sync >/dev/null
BASE=$(git merge-base HEAD origin/main 2>/dev/null || git rev-parse HEAD)
CHANGED=$( { git diff --name-only "$BASE" -- 'src/content/blog/*.md'; git ls-files --others --exclude-standard -- 'src/content/blog/*.md'; } | sort -u | while read -r f; do [ -f "$f" ] && echo "$f"; done)
if [ -z "$CHANGED" ]; then
  echo "No changed blog posts; skipping voice lint"
  exit 0
fi
echo "Voice lint on:"; echo "$CHANGED" | sed 's/^/  /'
# shellcheck disable=SC2086
vale --minAlertLevel error $CHANGED
