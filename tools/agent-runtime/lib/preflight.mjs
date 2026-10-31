import * as git from './git.mjs';

const short = (sha) => (sha ? sha.slice(0, 12) : 'none');

export function unexpectedDirty(worktree, state) {
  const known = new Set(state.acknowledged_dirty);
  return git.dirtyPaths(worktree).filter((file) => !known.has(file));
}

// Reads the remote branch tip with the URL pinned at mission start, from outside the repository, so no
// remote, upstream or URL setting a session wrote is ever used. Nothing is fetched or changed.
function remoteDivergence(worktree, mission, head, onWarning) {
  const remote = git.lsRemote(mission.repo.remote_url, mission.repo.branch);
  if (!remote.ok) {
    onWarning(`the mission remote could not be read; remote divergence not checked: ${remote.error}`);
    return null;
  }
  if (!remote.sha) return null; // not pushed yet
  if (git.resolveCommit(worktree, remote.sha) && git.isAncestor(worktree, remote.sha, head)) return null;
  return `REMOTE_DIVERGED: the remote branch ${mission.repo.branch} (${short(remote.sha)}) has commits that HEAD lacks; nothing was changed. Reconcile, then run again with --resolve "<note>"`;
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
