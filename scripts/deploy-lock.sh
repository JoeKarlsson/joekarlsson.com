# shellcheck shell=bash
# Sourced by deploy.sh. take_deploy_lock <lock-dir>: one deploy at a time. Two at once
# collided on the build's Vite cache (2026-11-12) and could collide on tofu apply. The
# lock sits in the shared .git folder, so the main checkout and every worktree see the
# same one. A deploy that finds it taken waits its turn (it usually then finds its commit
# already live) instead of failing; a lock left by a deploy that died is taken over.
# The lock goes when the shell exits. DEPLOY_LOCK_TRIES and DEPLOY_LOCK_WAIT (seconds)
# default to 30 minutes of 15-second waits; the tests shorten them.
take_deploy_lock() {
    local lock_dir=$1 tries=${DEPLOY_LOCK_TRIES:-120} wait=${DEPLOY_LOCK_WAIT:-15} attempt lock_pid
    for ((attempt = 1; ; attempt++)); do
        if mkdir "$lock_dir" 2>/dev/null; then
            break
        fi
        lock_pid=$(cat "$lock_dir/pid" 2>/dev/null || true)
        if [[ -n "$lock_pid" ]] && ! kill -0 "$lock_pid" 2>/dev/null; then
            echo "Taking over a stale deploy lock (pid $lock_pid is gone)"
            rm -rf "$lock_dir"
            continue
        fi
        if [[ "$attempt" -eq 1 ]]; then
            echo "Another deploy is running (pid ${lock_pid:-starting}, from $(cat "$lock_dir/where" 2>/dev/null || echo 'unknown')): waiting for it..."
        fi
        if [[ "$attempt" -ge "$tries" ]]; then
            echo "ERROR: still waiting for another deploy after $((tries * wait)) seconds. If it's truly gone, rm -rf $lock_dir" >&2
            return 1
        fi
        sleep "$wait"
    done
    echo $$ >"$lock_dir/pid"
    pwd >"$lock_dir/where"
    # shellcheck disable=SC2064 # expand now: the lock path is fixed for this deploy
    trap "rm -rf '$lock_dir'" EXIT
}
