#!/usr/bin/env bash
# Founder's read-only viewing worktree: the latest validated `claude/v1-ios-integration`, to open in Xcode.
#
#   tools/orchestration/viewer.sh [<commit>]     # default: origin/claude/v1-ios-integration
#
# The worktree is detached (no branch of its own, never committed to, never used by agents). Moving it to a new commit is refused if
# it has local changes to tracked files (Xcode user state under xcuserdata/ and build folders are ignored by git and kept).
# Run it only after an increment is integrated AND validated (CI green + simulator suite on that content).
set -euo pipefail
VIEWER="${REPMILE_VIEWER:-$HOME/.codex/worktrees/myapp-v1-viewer/MyApp}"
ROOT="$(git rev-parse --show-toplevel)"
git -C "$ROOT" fetch -q origin --prune
TARGET="$(git -C "$ROOT" rev-parse --verify "${1:-origin/claude/v1-ios-integration}^{commit}")"
if [ ! -e "$VIEWER/.git" ]; then
  mkdir -p "$(dirname "$VIEWER")"
  git -C "$ROOT" worktree add -q --detach "$VIEWER" "$TARGET"
else
  if [ -n "$(git -C "$VIEWER" status --porcelain --untracked-files=no)" ]; then
    echo "viewer: $VIEWER has local changes to tracked files; not moved (inspect them, then run again)" >&2; exit 1
  fi
  git -C "$VIEWER" checkout -q --detach "$TARGET"
fi
echo "viewer: $(git -C "$VIEWER" log -1 --format='%h %ad %s' --date=format:'%Y-%m-%d %H:%M' | cut -c1-110)"
echo "open:   $VIEWER/ios/App/RepMile.xcodeproj"
