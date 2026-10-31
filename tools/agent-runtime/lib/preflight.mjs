import * as git from './git.mjs';

const short = (sha) => (sha ? sha.slice(0, 12) : 'none');

export function unexpectedDirty(worktree, state) {
  const known = new Set(state.acknowledged_dirty);
  return git.dirtyPaths(worktree).filter((file) => !known.has(file));
}

function remoteDivergence(worktree, mission, head, onWarning) {
  const upstream = git.upstream(worktree, mission.repo.branch);
  if (!upstream) return null;
  const fetched = git.fetchRef(worktree, upstream.remote, upstream.ref);
  if (!fetched.ok) {
    onWarning(`fetch from ${upstream.remote} failed; comparing with the last known remote state: ${fetched.stderr.slice(0, 200)}`);
  }
  const remoteSha = git.remoteTrackingSha(worktree, upstream.remote, upstream.ref);
  if (!remoteSha || git.isAncestor(worktree, remoteSha, head)) return null;
  return `REMOTE_DIVERGED: ${upstream.remote}/${mission.repo.branch} (${short(remoteSha)}) has commits that HEAD lacks; nothing was changed. Reconcile, then run again with --resolve "<note>"`;
}

// Git safety before every launch: the mission branch, no rewritten history, no change of unknown
// origin, no remote commits the branch lacks. Nothing here modifies the repository.
// Returns { block, dirty } to stop, or { block: null, notices } to go on.
export function preflight({ worktree, mission, state, onWarning = () => {} }) {
  const branch = git.branch(worktree);
  if (branch !== mission.repo.branch) {
    return { block: `BRANCH_MISMATCH: the worktree is on ${branch ?? 'a detached HEAD'}, the mission branch is ${mission.repo.branch}` };
  }
  const head = git.head(worktree);
  const last = state.last_checkpoint_head;
  if (!git.isAncestor(worktree, last, head)) {
    return { block: `GIT_DIVERGENCE: HEAD ${short(head)} does not descend from the last checkpoint commit ${short(last)}; nothing was changed` };
  }
  const dirty = unexpectedDirty(worktree, state);
  if (dirty.length) {
    return {
      block: `DIRTY_WORKTREE: uncommitted changes of unknown origin: ${dirty.slice(0, 10).join(', ')}. Nothing was deleted; inspect them, then run again with --resolve "<note>"`,
      dirty,
    };
  }
  const diverged = remoteDivergence(worktree, mission, head, onWarning);
  if (diverged) return { block: diverged };
  const notices = head === last
    ? []
    : [`HEAD ${short(head)} is ahead of the last checkpoint commit ${short(last)}: no validated checkpoint covers those commits; inspect them before relying on them.`];
  return { block: null, notices };
}
