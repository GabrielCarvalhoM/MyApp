#!/usr/bin/env bash
# Safe-pause check (docs/engineering/WORKFLOW.md §7 "Pausa segura e retomada"). Read-only: it changes nothing.
#
#   tools/orchestration/pause-check.sh
#
# Reports what would be lost or interrupted destructively if the Mac were switched off now:
#   1. running build / test / git / simulator-driving processes;
#   2. worktrees with uncommitted changes (tracked or untracked, excluding gitignored build state);
#   3. local commits not yet on origin.
# Exit 0 = safe to switch off · 1 = something is still running or unsaved (listed).
set -uo pipefail
ROOT="$(git rev-parse --show-toplevel)"
unsafe=0

echo "== processos ativos (build, teste, git, simulador)"
# Patterns are anchored to the tools this workflow runs; Xcode.app itself (an IDE left open) is not a writer.
procs="$(ps -axo pid=,etime=,command= | grep -E "xcodebuild|swift-(build|test|frontend)|/swift (build|test)|node --test|npm (test|ci)|sim\.sh|swift-packages\.sh|with-device\.sh|git (commit|merge|push|fetch|rebase|checkout|worktree)|simctl (install|launch|spawn|clone|create)|XCTRunner|xctest" | grep -v -E "grep -E|pause-check|shell-snapshots" || true)"
if [ -n "$procs" ]; then echo "$procs" | cut -c1-200; unsafe=1; else echo "nenhum"; fi

echo "== worktrees com alterações não commitadas"
dirty=0
while IFS= read -r wt; do
  [ -d "$wt" ] || continue
  st="$(git -C "$wt" status --porcelain 2>/dev/null | grep -v -E '\.DS_Store$' || true)"
  if [ -n "$st" ]; then
    echo "$wt ($(git -C "$wt" rev-parse --abbrev-ref HEAD 2>/dev/null)): $(echo "$st" | wc -l | tr -d ' ') arquivo(s)"
    echo "$st" | head -5 | sed 's/^/    /'
    dirty=1
  fi
done < <(git -C "$ROOT" worktree list --porcelain | awk '/^worktree /{print $2}')
[ $dirty = 0 ] && echo "nenhuma" || unsafe=1

echo "== commits locais não publicados"
ahead=0
while IFS= read -r line; do
  b="${line%% *}"
  # Commits on no remote branch at all (a commit already pushed in another branch is safe).
  n="$(git -C "$ROOT" rev-list --count "$b" --not --remotes 2>/dev/null || echo 0)"
  if [ "${n:-0}" -gt 0 ]; then echo "$b: $n commit(s) em nenhuma branch remota"; ahead=1; fi
done < <(git -C "$ROOT" for-each-ref --format='%(refname:short)' refs/heads/)
[ $ahead = 0 ] && echo "nenhum"
# Unpushed commits survive a shutdown (they are on disk); they are listed so the checkpoint records them, not as unsafe.

echo "== simuladores ligados (desligar é seguro; só informativo)"
xcrun simctl list devices booted 2>/dev/null | grep -E "\(Booted\)" | sed 's/^ *//' || true

if [ $unsafe = 0 ]; then echo "PAUSE_CHECK: SAFE"; exit 0; fi
echo "PAUSE_CHECK: NOT_SAFE (termine ou interrompa no ponto seguro, faça checkpoint e rode de novo)"; exit 1
