export const CLI = 'node tools/agent-runtime/runtime.mjs';
const MAX_LISTED = 25;
const short = (sha) => (sha ? sha.slice(0, 12) : 'none');
const pad = (seq) => String(seq).padStart(4, '0');
const code = (value) => `\`${value}\``;

function bullets(items, render = (item) => item) {
  if (!items?.length) return ['- none'];
  const shown = items.slice(0, MAX_LISTED).map((item) => `- ${render(item)}`);
  if (items.length > MAX_LISTED) shown.push(`- … ${items.length - MAX_LISTED} more in the checkpoint`);
  return shown;
}

// What the bootstrap points the session at, for the context metrics.
export const bootstrapListedPaths = (previous) =>
  previous ? 1 + previous.authorities_required_next.length + previous.required_next_context.length : 1;

// The whole hand-over between sessions: the mission, the validated checkpoint, the authorities it
// names and the rules. Never the transcript, earlier outputs or the full history.
export function renderBootstrap({ mission, state, unit, previous, runSeq, head, worktree }) {
  const route = unit.route;
  return [
    `# Supervised session ${runSeq} · mission ${mission.mission_id}`,
    '',
    'You run headless under the project agent runtime (`tools/agent-runtime/README.md`). The supervisor owns the session lifecycle: it started this fresh session, it validates your checkpoint after you end your turn, and it starts the next session itself. Never ask anyone to relay prompts, context or results, and never wait for interactive input.',
    '',
    '## Mission',
    `- Goal: ${previous?.mission_goal ?? mission.goal ?? 'not recorded yet; state it in one sentence from the request (checkpoint field mission_goal)'}`,
    previous
      ? `- Founder request: recorded in the repository by this mission (see the authorities); local copy ${code('.agent-runtime/request.md')}.`
      : `- Founder request (the authority): ${code('.agent-runtime/request.md')}, a local copy (sha256 ${short(mission.request.sha256)}). Record it in the repository per project practice: later sessions can only be pointed at tracked files.`,
    `- Last valid checkpoint: ${previous ? `#${previous.checkpoint_seq}, ${code(`.agent-runtime/checkpoints/${pad(previous.checkpoint_seq)}.json`)} (${previous.mission_state}, phase "${previous.current_phase}", boundary ${previous.boundary})` : 'none; this is the first session'}`,
    '',
    `## Your unit: ${unit.id}`,
    unit.goal,
    `Route: model ${code(route.model)}, effort ${code(route.effort)} (${route.work_kind}: ${route.reason}).`,
    ...(previous ? [`Next exact action recorded by the previous session: ${previous.next_exact_action}`] : []),
    'Do this unit only and stop at its semantic boundary (planning complete, implementation unit complete, freeze created, review complete, correction cycle complete, mission closure). Never stop inside an atomic operation.',
    '',
    '## Verified by the supervisor before this launch',
    `- Worktree ${code(worktree)}, branch ${code(mission.repo.branch)}, HEAD ${code(head)}, working tree clean${state.acknowledged_dirty.length ? ' apart from the acknowledged paths below' : ''}.`,
    ...state.pending.notices.map((notice) => `- ${notice}`),
    '',
    ...jobLines(state.pending.job_result),
    '## Context to load (DO NOT READ EVERYTHING BY DEFAULT)',
    previous
      ? '- The checkpoint above: its findings, do_not_reopen and next_exact_action bind you.'
      : "- The Founder request, and the repository's read-first instructions (CLAUDE.md), section by section as the plan needs them.",
    '- Authorities required now:',
    ...bullets(previous?.authorities_required_next, code).map((line) => `  ${line}`),
    '- Context required now:',
    ...bullets(previous?.required_next_context, code).map((line) => `  ${line}`),
    `- The current state: ${code('git status')} and ${code(`git log --oneline ${short(mission.repo.base_commit)}..HEAD`)}.`,
    'Fetch anything else only when a concrete question needs it, by targeted search or by reading the relevant section. Never read CURRENT_MISSION.md or MISSION_LEDGER.md whole (both exceed 100 KB). Re-verify every claim your work depends on against the repository (bytes, tests), not against memory.',
    '',
    ...(previous ? scopeLines(previous) : []),
    ...RULES(mission.repo.branch),
  ].join('\n');
}

function scopeLines(previous) {
  return [
    '## Settled scope (do not reopen)',
    ...bullets(previous.do_not_reopen),
    '',
    '## Open findings',
    ...bullets(previous.findings.open, (f) => `${f.id} (${f.severity}${f.blocking ? ', blocking' : ''}) ${f.summary}; owner ${f.owner}`),
    '',
  ];
}

function jobLines(job) {
  if (!job) return [];
  const lines = [
    `## Delegated job ${job.unit_id} (${job.executor}), as verified by the supervisor`,
    `- Status: ${job.status}${job.reasons?.length ? ` (${job.reasons.join('; ')})` : ''}`,
  ];
  if (job.fallback_from) {
    lines.push(`- Fallback from ${job.fallback_from.executor}: ${job.fallback_from.status} (${job.fallback_from.reasons.join('; ')})`);
  }
  if (job.job_branch) {
    lines.push(`- Job branch: ${code(job.job_branch)} at ${code(job.commit ?? 'no commit')}, based on mission HEAD ${code(short(job.base_commit))}; worktree ${code(job.job_worktree)}.`);
  }
  if (job.changed_files) {
    lines.push(`- Changed files (${job.changed_files.length}): ${job.changed_files.slice(0, 15).join(', ') || 'none'}`);
  }
  for (const check of job.acceptance ?? []) lines.push(`- Acceptance ${code(check.command)} → exit ${check.exit_code}`);
  if (job.command) lines.push(`- Command ${code(job.command)} → exit ${job.exit_code}; flagged lines: ${job.flagged?.length ?? 0}`);
  if (job.job_dir) lines.push(`- Artifacts: ${code(`${job.job_dir}/`)} (RESULT.json and the full logs; read them only as needed).`);
  if (job.status === 'DONE' && job.executor === 'codex') {
    lines.push('- Codex claims are in CODEX_HANDOFF.md; judge the work yourself before integrating it (for example `git merge --ff-only <job branch>` once reviewed).');
  }
  if (job.status !== 'DONE') {
    lines.push('- The job did not complete. Do only the part of its brief that is still needed, yourself.');
    if (job.brief) lines.push(`- Brief: ${job.brief}`);
  }
  lines.push('');
  return lines;
}

const RULES = (branch) => [
  '## Execution rules',
  `- Deterministic work first: run the repository's scripts and tests yourself; wrap long output as ${code(`${CLI} capture -- <command>`)} (the full log is saved, you get a compact summary).`,
  '- Bounded, verifiable engineering can go to Codex: make it the next unit with executor `codex` (job: brief, allowed_paths, acceptance, optional copy_ignored and fallback_command; then: the Claude unit that judges the result) and end the session. The supervisor runs it in an isolated worktree and falls back automatically when Codex is unavailable or fails. A deterministic command longer than ten minutes: executor `local`.',
  "- Judgment (semantics, safety, sports science, architecture, readiness) stays with Claude. Choose each next unit's model and effort per the global model routing policy. The mission's gates, judges and authorities apply unchanged: this runtime changes how sessions run, never the quality required.",
  `- Git: commit on ${code(branch)} before checkpointing; a closing state needs the branch pushed (the validator checks the remote). Never merge into main, force-push, reset --hard, rewrite history, delete branches or tags, or touch credentials.`,
  '- The Founder only for reserved decisions (product, scope change, unresolvable authority conflict, destructive Git, credentials): set mission_state FOUNDER_REQUIRED with founder_action_required instead of asking.',
  '- End your turn with no background agent or background command still running.',
  '',
  '## Before you end your turn: the checkpoint',
  `1. Commit all work; the tree must be clean.`,
  `2. ${code(`${CLI} checkpoint template`)} writes ${code('.agent-runtime/checkpoint.next.json')}, pre-filled with the Git facts and the carried-over findings, invariants and do_not_reopen (run it again after a new commit to refresh the Git facts).`,
  '3. Fill every field (`tools/agent-runtime/README.md`, "Checkpoint fields"). next_unit is the next unit, or null once the mission is final.',
  `4. ${code(`${CLI} checkpoint validate`)} until it prints OK.`,
  '5. End your turn with a three-line summary. After a terminal state (COMPLETE, CLOSED_READY, CLOSED_NOT_READY, CANCELLED, BLOCKED, FOUNDER_REQUIRED) start nothing else.',
];

export function renderCorrection({ errors, attempt, max }) {
  return [
    `AGENT RUNTIME: the supervisor's validator rejected your checkpoint (correction ${attempt} of ${max}).`,
    '',
    'Errors:',
    ...errors.slice(0, 40).map((error) => `- ${error}`),
    '',
    `Fix ${code('.agent-runtime/checkpoint.next.json')} (if the Git state is the problem, commit first and run ${code(`${CLI} checkpoint template`)} to refresh the Git facts), run ${code(`${CLI} checkpoint validate`)} until it prints OK, then end your turn. Do not start new work.`,
  ].join('\n');
}
