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
# CI passes the commit to diff against in VALE_BASE; locally it is the merge base with origin/main.
BASE=${VALE_BASE:-$(git merge-base HEAD origin/main 2>/dev/null || git rev-parse HEAD)}
git cat-file -e "${BASE}^{commit}" 2>/dev/null || { echo "Base commit $BASE not available; skipping voice lint"; exit 0; }
# A post whose only change is its date/updatedDate line (a publish time or a freshness bump)
# isn't an edit of the writing, so it isn't linted.
prose_changed() {
  git diff -U0 "$BASE" -- "$1" | grep -E '^[+-]' | grep -vE '^(\+\+\+|---) ' | grep -qvE '^[+-](date|updatedDate):'
}
CHANGED=$( { git diff --name-only "$BASE" -- 'src/content/blog/*.md' | while read -r f; do [ -f "$f" ] && prose_changed "$f" && echo "$f"; done; git ls-files --others --exclude-standard -- 'src/content/blog/*.md'; } | sort -u)
if [ -z "$CHANGED" ]; then
  echo "No changed blog posts; skipping voice lint"
  exit 0
fi
echo "Voice lint on:"; echo "$CHANGED" | sed 's/^/  /'
# shellcheck disable=SC2086
vale --minAlertLevel error $CHANGED
