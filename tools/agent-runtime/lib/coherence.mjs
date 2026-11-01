import fs from 'node:fs';
import path from 'node:path';
import * as git from './git.mjs';
import { sha256File } from './files.mjs';
import {
  validateStructure,
  isFinal,
  covers,
  stripAnchor,
  MAX_CHECKPOINT_BYTES,
  RUNTIME_REF_PREFIX,
} from './checkpoint.mjs';

const LIST_LIMIT = 10;
const listed = (items) =>
  `${items.slice(0, LIST_LIMIT).join(', ')}${items.length > LIST_LIMIT ? ` … +${items.length - LIST_LIMIT} more` : ''}`;
const verdict = (checkpoint, errors) => ({ ok: errors.length === 0, errors, checkpoint });

// Deterministic validation of a checkpoint file against the mission, the supervisor state, the
// repository and the previous valid checkpoint.
// ctx = { mission, state, previous, repo (pinned handle), worktree (for files), runSeq, stateDir }
export function validateCheckpointFile(file, ctx) {
  if (!fs.existsSync(file)) return verdict(null, [`checkpoint file not found: ${file}`]);
  const raw = fs.readFileSync(file);
  if (raw.length > MAX_CHECKPOINT_BYTES) {
    return verdict(null, [
      `checkpoint is ${raw.length} bytes; the limit is ${MAX_CHECKPOINT_BYTES}: reference artifacts instead of inlining them`,
    ]);
  }
  let cp;
  try {
    cp = JSON.parse(raw.toString('utf8'));
  } catch (error) {
    return verdict(null, [`checkpoint is not valid JSON: ${error.message}`]);
  }
  const structural = validateStructure(cp);
  if (structural.length) return verdict(cp, structural);
  return verdict(cp, [
    ...identityErrors(cp, ctx),
    ...repositoryErrors(cp, ctx),
    ...referenceErrors(cp, ctx),
    ...continuityErrors(cp, ctx.previous),
  ]);
}

function identityErrors(cp, { mission, state, previous, runSeq }) {
  const errors = [];
  const lastSeq = state.last_checkpoint_seq ?? null;
  if (state.status === 'COMPLETED') {
    errors.push(`mission is terminal (${state.terminal_state}); no further checkpoint is accepted`);
  }
  if (cp.mission_id !== mission.mission_id) errors.push(`mission_id: expected "${mission.mission_id}"`);
  if (cp.checkpoint_seq !== (lastSeq ?? 0) + 1) errors.push(`checkpoint_seq: expected ${(lastSeq ?? 0) + 1}`);
  if (cp.previous_checkpoint !== lastSeq) errors.push(`previous_checkpoint: expected ${lastSeq}`);
  if (cp.produced_by.run_seq !== runSeq) errors.push(`produced_by.run_seq: expected ${runSeq}, the current run`);
  if (cp.baseline.commit !== mission.repo.base_commit) {
    errors.push(`baseline.commit: expected the mission baseline ${mission.repo.base_commit}`);
  }
  if (cp.git.branch !== mission.repo.branch) errors.push(`git.branch: expected the mission branch ${mission.repo.branch}`);
  if (previous && cp.mission_goal !== previous.mission_goal) {
    errors.push('mission_goal changed: a change of scope is a Founder decision (use FOUNDER_REQUIRED)');
  }
  return errors;
}

function repositoryErrors(cp, { mission, state, repo }) {
  const errors = [];
  const actualBranch = git.branch(repo);
  if (actualBranch !== cp.git.branch) {
    errors.push(`git.branch is "${cp.git.branch}" but the worktree is on ${actualBranch ? `"${actualBranch}"` : 'a detached HEAD'}`);
  }
  const head = git.head(repo);
  if (cp.git.head_commit !== head) {
    errors.push(`git.head_commit ${cp.git.head_commit} is not HEAD ${head}: commit first, then run "checkpoint template" to refresh the Git facts`);
  }
  const dirty = git.dirtyPaths(repo);
  if (dirty.length) errors.push(`working tree is not clean (commit every change of this unit): ${listed(dirty)}`);
  if (!git.isAncestor(repo, mission.repo.base_commit, head)) errors.push('HEAD does not descend from the mission baseline');
  const since = state.last_checkpoint_head ?? mission.repo.base_commit;
  if (git.isAncestor(repo, since, head)) {
    errors.push(...coverageErrors(cp.files_changed, git.changedFiles(repo, since, head)));
  } else {
    errors.push(`HEAD does not descend from the last valid checkpoint commit ${since}: history must not be rewritten`);
  }
  errors.push(...pushErrors(cp, mission, head));
  return errors;
}

function pushErrors(cp, mission, head) {
  if (!cp.git.pushed && !isFinal(cp.mission_state)) return [];
  if (!cp.git.pushed) return [`git.pushed must be true for ${cp.mission_state}: push the branch, then validate again`];
  const remote = git.lsRemote(mission.repo.remote_url, cp.git.branch);
  if (!remote.ok) return [`cannot verify the push on the mission remote: ${remote.error}`];
  if (remote.sha !== head) return [`the remote branch ${cp.git.branch} is ${remote.sha ?? 'absent'}, not HEAD ${head}`];
  return [];
}

export function coverageErrors(declared, actual) {
  const errors = [];
  const phantom = declared.filter((entry) => !actual.some((file) => covers(entry, file)));
  const missing = actual.filter((file) => !declared.some((entry) => covers(entry, file)));
  if (phantom.length) errors.push(`files_changed lists entries that match no change since the last checkpoint: ${listed(phantom)}`);
  if (missing.length) errors.push(`files_changed misses changed paths (list them, or a covering "dir/" entry): ${listed(missing)}`);
  return errors;
}

function referenceErrors(cp, { repo, worktree, stateDir }) {
  const errors = [];
  const requireTracked = (ref, where) => {
    const rel = stripAnchor(ref);
    if (git.trackedAtHead(repo, rel)) return true;
    errors.push(`${where}: "${rel}" is not tracked at HEAD`);
    return false;
  };
  // Evidence may point at a tracked file or at a runtime artifact ("runtime:jobs/…"), and may pin its digest.
  const checkRef = (ref, where, digest = null) => {
    let file;
    if (ref.startsWith(RUNTIME_REF_PREFIX)) {
      file = path.join(stateDir, stripAnchor(ref.slice(RUNTIME_REF_PREFIX.length)));
      if (!fs.existsSync(file)) {
        errors.push(`${where}: runtime artifact "${ref}" does not exist`);
        return;
      }
    } else {
      if (!requireTracked(ref, where)) return;
      file = path.join(worktree, stripAnchor(ref));
    }
    if (!digest) return;
    if (!fs.statSync(file).isFile()) {
      errors.push(`${where}: a sha256 needs a file, not a directory`);
      return;
    }
    const actual = sha256File(file);
    if (actual !== digest) errors.push(`${where}: sha256 ${digest} does not match the file (${actual})`);
  };
  cp.authorities_used.forEach((ref, index) => requireTracked(ref, `authorities_used[${index}]`));
  cp.authorities_required_next.forEach((ref, index) => requireTracked(ref, `authorities_required_next[${index}]`));
  cp.required_next_context.forEach((ref, index) => requireTracked(ref, `required_next_context[${index}]`));
  if (cp.freeze) requireTracked(cp.freeze.record, 'freeze.record');
  cp.handoffs.forEach((handoff, index) => checkRef(handoff.ref, `handoffs[${index}].ref`));
  cp.findings.closed.forEach((finding, index) => {
    if (finding.evidence_ref) checkRef(finding.evidence_ref, `findings.closed[${index}].evidence_ref`);
  });
  cp.evidence.forEach((item, index) => checkRef(item.ref, `evidence[${index}].ref`, item.sha256 ?? null));
  return errors;
}

// What a fresh session must not lose: settled scope, invariants, findings and blockers.
export function continuityErrors(cp, previous) {
  if (!previous) return [];
  const errors = [];
  const dropped = (before, after) => before.filter((item) => !after.includes(item));
  const droppedScope = dropped(previous.do_not_reopen, cp.do_not_reopen);
  if (droppedScope.length) errors.push(`do_not_reopen items cannot be dropped: ${listed(droppedScope)}`);
  const droppedInvariants = dropped(previous.canonical_invariants, cp.canonical_invariants);
  if (droppedInvariants.length) errors.push(`canonical_invariants cannot be dropped: ${listed(droppedInvariants)}`);
  if (previous.freeze && !cp.freeze) errors.push('freeze cannot be dropped: a new freeze replaces it');
  const openNow = new Map(cp.findings.open.map((finding) => [finding.id, finding]));
  const closedNow = new Map(cp.findings.closed.map((finding) => [finding.id, finding]));
  for (const finding of previous.findings.open) {
    const current = openNow.get(finding.id);
    const closed = closedNow.get(finding.id);
    if (!current && !closed) {
      errors.push(`open finding ${finding.id} disappeared: keep it open or close it with a resolution`);
    } else if (current && finding.blocking && !current.blocking) {
      errors.push(`finding ${finding.id} is still open and was blocking: a blocker is not downgraded silently (close it with evidence, or keep it blocking)`);
    } else if (closed && finding.blocking && !closed.evidence_ref) {
      errors.push(`blocking finding ${finding.id} is closed without an evidence_ref: a blocker closes only on evidence`);
    }
  }
  for (const finding of previous.findings.closed) {
    if (!closedNow.has(finding.id)) {
      errors.push(`closed finding ${finding.id} cannot disappear or reopen silently: keep it closed and open a new finding that references it`);
    }
  }
  return errors;
}
