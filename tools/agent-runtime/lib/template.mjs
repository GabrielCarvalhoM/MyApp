import * as git from './git.mjs';
import { nowIso } from './files.mjs';
import { CHECKPOINT_SCHEMA } from './checkpoint.mjs';

const COMPACT_THRESHOLD = 40;

// Long change lists become "top/second/" prefixes so that the checkpoint stays small.
export function compactPaths(paths) {
  if (paths.length <= COMPACT_THRESHOLD) return [...paths];
  const entries = new Set(
    paths.map((file) => {
      const parts = file.split('/');
      return parts.length > 2 ? `${parts.slice(0, 2).join('/')}/` : file;
    }),
  );
  return [...entries].sort();
}

function gitFacts({ mission, state, worktree }) {
  const head = git.head(worktree);
  const since = state.last_checkpoint_head ?? mission.repo.base_commit;
  const changed = git.isAncestor(worktree, since, head) ? git.changedFiles(worktree, since, head) : [];
  return { git: { branch: git.branch(worktree), head_commit: head, pushed: false }, files_changed: compactPaths(changed) };
}

// A pre-filled checkpoint: Git facts computed, continuity fields carried over from the previous
// checkpoint, judgment fields left empty so that validation fails until the session fills them.
export function buildTemplate({ mission, state, previous, worktree, runSeq }) {
  const facts = gitFacts({ mission, state, worktree });
  const route = state.current?.unit?.route ?? mission.first_unit.route;
  return {
    schema: CHECKPOINT_SCHEMA,
    mission_id: mission.mission_id,
    checkpoint_seq: (state.last_checkpoint_seq ?? 0) + 1,
    previous_checkpoint: state.last_checkpoint_seq ?? null,
    created_at: nowIso(),
    produced_by: { run_seq: runSeq, executor: 'claude' },
    mission_goal: previous?.mission_goal ?? mission.goal ?? '',
    mission_state: 'RUNNING',
    current_phase: '',
    boundary: 'other',
    baseline: { commit: mission.repo.base_commit },
    git: facts.git,
    freeze: previous?.freeze ?? null,
    canonical_invariants: [...(previous?.canonical_invariants ?? [])],
    authorities_used: [...(previous?.authorities_required_next ?? [])],
    decisions_made: [],
    implemented_since_previous: [],
    files_changed: facts.files_changed,
    evidence: [],
    findings: structuredClone(previous?.findings ?? { open: [], closed: [] }),
    do_not_reopen: [...(previous?.do_not_reopen ?? [])],
    next_exact_action: '',
    next_unit: { id: '', executor: 'claude', goal: '', route: { ...route } },
    required_next_context: [],
    authorities_required_next: [...(previous?.authorities_required_next ?? [])],
    handoffs: [],
    founder_action_required: null,
  };
}

// After a new commit: recompute the Git facts and the change list, keep everything the session wrote.
export function refreshTemplate(existing, context) {
  const facts = gitFacts(context);
  return {
    ...existing,
    created_at: nowIso(),
    git: { ...facts.git, pushed: existing.git?.pushed === true },
    files_changed: facts.files_changed,
  };
}
