#!/bin/bash
# Waits for the GitHub "CI" run on a pushed commit and exits non-zero unless it passes.
# deploy.sh calls this so a red CI stops the deploy: e2e and Pa11y run only
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

# Every job but Lighthouse decides the deploy. Lighthouse audits 10 pages 3 times (about
# 6 minutes, the last job to finish) and still turns the run red if a score drops, but
# the deploy doesn't wait for it (2026-11-14). The failure notifier only runs on a failure.
NOT_BLOCKING=$'^(Lighthouse CI|Failure Notification)\t'
echo "Waiting for CI run $RUN_ID on $SHORT_SHA (not for Lighthouse)..."
for _ in $(seq 1 135); do
    JOBS=$(gh run view "$RUN_ID" --json jobs --jq '.jobs[] | "\(.name)\t\(.status)\t\(.conclusion)"')
    BLOCKING=$(grep -vE "$NOT_BLOCKING" <<< "$JOBS" || true)
    FAILED=$(awk -F'\t' '$2 == "completed" && $3 != "success" && $3 != "skipped" {print "  failed: " $1 " (" $3 ")"}' <<< "$BLOCKING")
    if [[ -n "$FAILED" ]]; then
        echo "ERROR: CI failed on $SHORT_SHA, so the deploy stopped. Fix CI, push, and deploy again." >&2
        echo "$FAILED" >&2
        echo "  details: gh run view $RUN_ID --log-failed" >&2
        exit 1
    fi
    if [[ -n "$BLOCKING" ]] && ! awk -F'\t' '$2 != "completed"' <<< "$BLOCKING" | grep -q .; then
        echo "CI passed on $SHORT_SHA (Lighthouse may still be running: gh run view $RUN_ID)"
        exit 0
    fi
    sleep 20
done
echo "ERROR: CI on $SHORT_SHA still hadn't finished after 45 minutes. Check GitHub Actions." >&2
exit 1
