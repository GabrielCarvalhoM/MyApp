import * as git from './git.mjs';
import { protectedDrift } from './protected.mjs';

const short = (sha) => (sha ? sha.slice(0, 12) : 'none');

export function unexpectedDirty(repo, state) {
  const known = new Set(state.acknowledged_dirty);
  return git.dirtyPaths(repo).filter((file) => !known.has(file));
}

// Reads the remote branch tip with the URL pinned at mission start, from outside the repository, so no
// remote, upstream or URL setting a session wrote is ever used. Nothing is fetched or changed.
function remoteDivergence(repo, mission, head, onWarning) {
  const remote = git.lsRemote(mission.repo.remote_url, mission.repo.branch);
  if (!remote.ok) {
    onWarning(`the mission remote could not be read; remote divergence not checked: ${remote.error}`);
    return null;
  }
  if (!remote.sha) return null; // not pushed yet
  if (git.resolveCommit(repo, remote.sha) && git.isAncestor(repo, remote.sha, head)) return null;
  return `REMOTE_DIVERGED: the remote branch ${mission.repo.branch} (${short(remote.sha)}) has commits that HEAD lacks; nothing was changed. Reconcile, then run again with --resolve "<note>"`;
}

// Safety before every launch: the mission branch, no rewritten history, no change of unknown origin, no
// agent configuration the Founder has not seen, no remote commits the branch lacks. Changes nothing.
// Returns { block, dirty } or { founder } to stop, or { notices } to go on.
export function preflight({ repo, worktree, mission, state, onWarning = () => {} }) {
  const branch = git.branch(repo);
  if (branch !== mission.repo.branch) {
    return { block: `BRANCH_MISMATCH: the worktree is on ${branch ?? 'a detached HEAD'}, the mission branch is ${mission.repo.branch}` };
  }
  const head = git.head(repo);
  const last = state.last_checkpoint_head;
  if (!git.isAncestor(repo, last, head)) {
    return { block: `GIT_DIVERGENCE: HEAD ${short(head)} does not descend from the last checkpoint commit ${short(last)}; nothing was changed` };
  }
  const dirty = unexpectedDirty(repo, state);
  if (dirty.length) {
    return {
      block: `DIRTY_WORKTREE: uncommitted changes of unknown origin: ${dirty.slice(0, 10).join(', ')}. Nothing was deleted; inspect them, then run again with --resolve "<note>"`,
      dirty,
    };
  }
  const drift = protectedDrift(worktree, state.protected_snapshot);
  if (drift.length) {
    return { founder: `PROTECTED_CONFIG: agent configuration the next session would load changed (${drift.join(', ')}); review it, then run again with --resolve "<note>"` };
  }
  const diverged = remoteDivergence(repo, mission, head, onWarning);
  if (diverged) return { block: diverged };
  const notices = head === last
    ? []
    : [`HEAD ${short(head)} is ahead of the last checkpoint commit ${short(last)}: no validated checkpoint covers those commits; inspect them before relying on them.`];
  return { notices };
}
