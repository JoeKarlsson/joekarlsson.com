#!/bin/bash
# Waits for the GitHub "CI" run on a pushed commit and exits non-zero unless it passes.
# deploy.sh calls this so a red CI stops the deploy: e2e, Pa11y and Lighthouse run only
# in CI, and on 2026-11-10 a renamed montage video failed e2e on a dozen pushes in a row
# because nothing looked at CI after pushing.
# Usage: scripts/wait-for-ci.sh <commit-sha>
set -euo pipefail

COMMIT_SHA="${1:?usage: wait-for-ci.sh <commit-sha>}"
SHORT_SHA="${COMMIT_SHA:0:8}"

# A run can take a few seconds to show up after a push
RUN_ID=""
for attempt in $(seq 1 24); do
    RUN_ID=$(gh run list --workflow CI --commit "$COMMIT_SHA" --limit 1 --json databaseId --jq '.[0].databaseId // empty')
    [[ -n "$RUN_ID" ]] && break
    sleep 5
done
if [[ -z "$RUN_ID" ]]; then
    echo "ERROR: no CI run found for $SHORT_SHA after 2 minutes. Check GitHub Actions." >&2
    exit 1
fi

echo "Waiting for CI run $RUN_ID on $SHORT_SHA..."
if ! gh run watch "$RUN_ID" --exit-status --interval 20 >/dev/null; then
    echo "ERROR: CI failed on $SHORT_SHA, so the deploy stopped. Fix CI, push, and deploy again." >&2
    gh run view "$RUN_ID" --json jobs --jq '.jobs[] | select(.conclusion == "failure") | "  failed: \(.name)"' >&2
    echo "  details: gh run view $RUN_ID --log-failed" >&2
    exit 1
fi
echo "CI passed on $SHORT_SHA"
