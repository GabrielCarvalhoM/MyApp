import test from 'node:test';
import assert from 'node:assert/strict';
import { renderBootstrap, renderCorrection, bootstrapListedPaths } from '../lib/bootstrap.mjs';
import { initialState } from '../lib/mission.mjs';
import { ROUTE, GOAL, validCheckpoint } from './helpers.mjs';

const mission = {
  mission_id: 'DOMAIN_COACHING_R7-B.2',
  goal: null,
  request: { sha256: 'c'.repeat(64) },
  repo: { branch: 'claude/domain-coaching-r7-b2', base_commit: 'd'.repeat(40), worktree: 'W' },
  first_unit: { id: 'U1', executor: 'claude', goal: 'Intake and plan.', route: { ...ROUTE } },
};
const head = 'e'.repeat(40);

function render({ previous = null, state = initialState(mission), unit = state.next_unit } = {}) {
  return renderBootstrap({ mission, state, unit, previous, runSeq: state.run_seq + 1, head, worktree: 'W' });
}

test('the first session gets the request, the unit, the rules and the checkpoint procedure', () => {
  const text = render();
  for (const fragment of [
    'Supervised session 1 · mission DOMAIN_COACHING_R7-B.2',
    '`.agent-runtime/request.md`',
    'Record it in the repository per project practice',
    'none; this is the first session',
    '## Your unit: U1',
    'model `claude-opus-5-5`, effort `high`',
    'DO NOT READ EVERYTHING BY DEFAULT',
    'Never read CURRENT_MISSION.md or MISSION_LEDGER.md whole',
    'Never ask anyone to relay prompts',
    'Never merge into main, force-push',
    'FOUNDER_REQUIRED with founder_action_required',
    '`node tools/agent-runtime/runtime.mjs checkpoint validate` until it prints OK',
    'start nothing else',
  ]) {
    assert.ok(text.includes(fragment), `missing: ${fragment}`);
  }
  assert.ok(!text.includes('## Settled scope'), 'no checkpoint yet, so no settled scope');
});

test('a later session is pointed at the checkpoint and only the authorities it names', () => {
  const previous = validCheckpoint({
    checkpoint_seq: 3,
    authorities_required_next: ['CURRENT_MISSION.md#r7-b2', 'CoachingCore/r7/b1/R7B1_CLOSURE_HANDOFF.md'],
    required_next_context: ['CoachingCore/src/r6-program.mjs'],
    findings: { open: [{ id: 'QE-R7B1-04', severity: 'MAJOR', summary: 'late-evidence question precedes the clinical screen', owner: 'engineering', blocking: true }], closed: [] },
    do_not_reopen: ['R7-B.1 stays CLOSED NOT_READY'],
  });
  const state = { ...initialState(mission), run_seq: 5, last_checkpoint_seq: 3, next_unit: previous.next_unit };
  const text = render({ previous, state });
  for (const fragment of [
    'Supervised session 6',
    `Goal: ${GOAL}`,
    '#3, `.agent-runtime/checkpoints/0003.json`',
    '`CURRENT_MISSION.md#r7-b2`',
    '`CoachingCore/src/r6-program.mjs`',
    '- R7-B.1 stays CLOSED NOT_READY',
    'QE-R7B1-04 (MAJOR, blocking) late-evidence question precedes the clinical screen; owner engineering',
    'Next exact action recorded by the previous session: write the probe',
  ]) {
    assert.ok(text.includes(fragment), `missing: ${fragment}`);
  }
  assert.equal(bootstrapListedPaths(previous), 4);
});

test('the bootstrap stays small even with a long checkpoint', () => {
  const open = Array.from({ length: 60 }, (_, index) => ({ id: `F${index}`, severity: 'MINOR', summary: `finding ${index}`, owner: 'o', blocking: false }));
  const previous = validCheckpoint({ findings: { open, closed: [] }, do_not_reopen: Array.from({ length: 40 }, (_, index) => `settled item ${index}`) });
  const text = render({ previous, state: { ...initialState(mission), last_checkpoint_seq: 1, next_unit: previous.next_unit } });
  assert.ok(text.includes('… 35 more in the checkpoint'));
  assert.ok(text.includes('… 15 more in the checkpoint'));
  assert.ok(Buffer.byteLength(text) < 12 * 1024, `bootstrap is ${Buffer.byteLength(text)} bytes`);
});

test('a delegated job result is handed over as verified facts, and a failure carries the brief', () => {
  const done = {
    executor: 'codex', unit_id: 'U3', status: 'DONE', reasons: [], job_branch: 'codex/m-u3-r4', commit: 'f'.repeat(40),
    base_commit: head, job_worktree: 'J', changed_files: ['generated/probe.mjs'], acceptance_pending: ['node generated/probe.mjs'],
    job_dir: '.agent-runtime/jobs/4-u3',
  };
  const state = { ...initialState(mission), pending: { notices: ['HEAD is ahead of the last checkpoint commit'], job_result: done } };
  const text = render({ state });
  for (const fragment of ['## Delegated job U3 (codex)', 'Job branch: `codex/m-u3-r4`', 'The supervisor ran none of this code', 'Acceptance to run (with capture): `node generated/probe.mjs`', '- HEAD is ahead of the last checkpoint commit']) {
    assert.ok(text.includes(fragment), `missing: ${fragment}`);
  }
  const failed = { executor: 'codex', unit_id: 'U3', status: 'FALLBACK_TO_CLAUDE', reasons: ['codex unavailable: quota'], brief: 'write generated/probe.mjs' };
  const fallback = render({ state: { ...initialState(mission), pending: { notices: [], job_result: failed } } });
  assert.ok(fallback.includes('Do only the part of its brief that is still needed, yourself; if that part is deterministic, run the existing tool'));
  assert.ok(fallback.includes('- Brief: write generated/probe.mjs'));
});

test('a correction prompt lists the validator errors and asks for nothing new', () => {
  const text = renderCorrection({ errors: ['git.head_commit x is not HEAD y', 'next_exact_action: must be a non-empty string'], attempt: 1, max: 2 });
  assert.ok(text.includes('correction 1 of 2'));
  assert.ok(text.includes('- git.head_commit x is not HEAD y'));
  assert.ok(text.includes('Do not start new work.'));
});
