// The fictitious mission of the request (§20): phase 1 → checkpoint → fresh session boundary →
// phase 2 through a Codex handoff → phase 3 → COMPLETE. Fake executors only: no model is called.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { readJsonl } from '../lib/files.mjs';
import { metrics } from '../lib/report.mjs';
import { makeRepo, cleanup, startMission, script, fakeEnv, supervise, calls, events, state, sh, ROUTE, closing } from './helpers.mjs';

const PHASE_1_FINAL = 'PHASE-1-FINAL-MESSAGE: this text must never reach a later session';
const probeJob = { brief: 'Create generated/probe.mjs exporting probe = 1.', allowed_paths: ['generated/'], acceptance: [['node', 'generated/probe.mjs']] };

const phase1 = {
  result: PHASE_1_FINAL,
  actions: [
    { write: { path: 'docs/plan.md', content: '# plan\nU2: the probe, delegated to Codex\n' } },
    { commit: 'phase 1: plan' },
    {
      checkpoint: {
        current_phase: 'planning',
        boundary: 'planning_complete',
        next_exact_action: 'delegate the probe to Codex',
        decisions_made: [{ id: 'D1', decision: 'the probe is bounded engineering: delegate it', rationale: 'running it verifies it' }],
        implemented_since_previous: ['plan'],
        evidence: [{ kind: 'other', ref: 'docs/plan.md', result: 'WRITTEN', summary: 'the plan' }],
        findings: { open: [{ id: 'F1', severity: 'MINOR', summary: 'no probe yet', owner: 'engineering', blocking: false }], closed: [] },
        do_not_reopen: ['the plan is settled'],
        canonical_invariants: ['INV-1: nothing changes outside docs/ and generated/'],
        authorities_required_next: ['docs/plan.md'],
        next_unit: { id: 'U2', executor: 'codex', goal: 'generate the probe', job: probeJob, then: { id: 'U3', executor: 'claude', goal: 'judge and integrate the probe', route: { ...ROUTE } } },
      },
    },
  ],
};

const integrate = (evidence, handoffs = [], before = []) => ({
  actions: [
    ...before,
    {
      checkpoint: {
        current_phase: 'integration',
        boundary: 'implementation_unit_complete',
        next_exact_action: 'close the mission',
        implemented_since_previous: ['the probe, judged and integrated'],
        evidence,
        handoffs,
        findings: { open: [], closed: [{ id: 'F1', resolution: 'probe in place and verified', evidence_ref: 'generated/probe.mjs' }] },
        next_unit: { id: 'U4', executor: 'claude', goal: 'close the mission', route: { ...ROUTE } },
      },
    },
  ],
});

const probeEvidence = { kind: 'probe', ref: 'generated/probe.mjs', result: 'PASS', summary: 'node generated/probe.mjs exits 0', command: 'node generated/probe.mjs' };
const closeStep = { actions: [{ push: true }, { checkpoint: closing('COMPLETE') }] };
// When Codex does not deliver, the Claude unit that follows does the remaining work itself.
const doItYourself = integrate([probeEvidence], [], [{ write: { path: 'generated/probe.mjs', content: 'export const probe = 1;\n' } }, { commit: 'the probe, written by the Claude unit' }]);

function mission(t, steps, codexMode) {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const found = startMission(repo);
  const claude = script(repo, steps);
  const codexLog = path.join(repo.root, 'codex-calls.jsonl');
  return { repo, found, claude, codexLog, env: fakeEnv({ claudeScript: claude, codexMode, codexLog }) };
}

const codexCalls = (file) => (fs.existsSync(file) ? readJsonl(file) : []);

test('a three-phase mission runs to COMPLETE across fresh sessions and a verified Codex handoff', async (t) => {
  const handoff = integrate(
    [probeEvidence, { kind: 'verification', ref: 'runtime:jobs/2-u2/RESULT.json', result: 'DONE', summary: 'the supervisor-verified job result' }],
    [{ from: 'codex', to: 'claude', ref: 'runtime:jobs/2-u2/CODEX_HANDOFF.md' }],
    [{ mergeJobBranch: true }],
  );
  const { found, claude, codexLog, env } = mission(t, [phase1, handoff, closeStep], 'ok');
  const { summary } = await supervise(found, env);
  assert.deepEqual([summary.status, summary.terminal_state, summary.last_checkpoint], ['COMPLETED', 'COMPLETE', 3]);

  const sessions = calls(claude);
  assert.equal(sessions.length, 3);
  assert.equal(new Set(sessions.map((call) => call.session_id)).size, 3, 'every phase ran in a fresh session');
  assert.ok(sessions.every((call) => !call.resume));
  const [, second, third] = sessions.map((call) => call.prompt);
  for (const fragment of ['## Delegated job U2 (codex)', 'Status: DONE', 'Job branch: `codex/test-mission-u2-r2`', 'The supervisor ran none of this code', 'Acceptance to run (with capture): `node generated/probe.mjs`', '.agent-runtime/checkpoints/0001.json', '- the plan is settled', 'F1 (MINOR) no probe yet']) {
    assert.ok(second.includes(fragment), `session 2 bootstrap misses: ${fragment}`);
  }
  const copy = path.join(found.worktree, '.agent-runtime', 'checkpoints', '0001.json');
  assert.equal(fs.readFileSync(copy, 'utf8'), fs.readFileSync(path.join(found.paths.checkpoints, '0001.json'), 'utf8'), 'the session reads a copy of the accepted checkpoint');
  assert.ok(!fs.existsSync(path.join(found.worktree, '.agent-runtime', 'mission.json')), 'the control state is outside the session worktree');
  for (const prompt of [second, third]) {
    assert.ok(!prompt.includes('PHASE-1-FINAL-MESSAGE'), 'no transcript or earlier output is carried over');
    assert.ok(!prompt.includes('none; this is the first session'));
  }
  assert.ok(third.includes('.agent-runtime/checkpoints/0002.json') && !third.includes('## Delegated job'), 'the job result is handed over once');

  const [exec] = codexCalls(codexLog).filter((args) => args[0] === 'exec');
  assert.equal(exec[exec.indexOf('-s') + 1], 'workspace-write');
  assert.ok(exec.includes('--output-schema'));
  assert.notEqual(path.resolve(exec[exec.indexOf('-C') + 1]), path.resolve(found.worktree), 'Codex never works in the mission worktree');
  const job = JSON.parse(fs.readFileSync(path.join(found.paths.jobs, '2-u2', 'RESULT.json'), 'utf8'));
  assert.deepEqual([job.status, job.changed_files, job.acceptance_pending], ['DONE', ['generated/probe.mjs'], ['node generated/probe.mjs']]);
  assert.equal(sh(found.worktree, 'rev-parse', `${job.commit}^`), job.base_commit, 'the job commit sits on the mission HEAD');
  assert.ok(sh(found.worktree, 'log', '--format=%s').includes('agent-runtime: codex job U2'), 'the session integrated the judged job commit');

  const counted = metrics(events(found));
  assert.deepEqual(
    [counted.sessions_started, counted.checkpoints_accepted, counted.checkpoints_rejected, counted.codex_jobs, counted.codex_jobs_failed, counted.fallbacks],
    [3, 3, 0, 1, 0, 0],
  );
  assert.deepEqual([counted.claude_reported.runs_reporting, counted.claude_reported.input_tokens], [3, 3000]);

  const before = [calls(claude).length, codexCalls(codexLog).length];
  assert.equal((await supervise(found, env)).summary.status, 'COMPLETED');
  assert.deepEqual([calls(claude).length, codexCalls(codexLog).length], before, 'a completed mission starts nothing');
});

test('Codex unavailable: the mission continues and the next Claude unit does the work', async (t) => {
  const { found, claude, codexLog, env } = mission(t, [phase1, doItYourself, closeStep], 'logged-out');
  const { summary } = await supervise(found, env);
  assert.equal(summary.status, 'COMPLETED');
  assert.equal(codexCalls(codexLog).filter((args) => args[0] === 'exec').length, 0);
  const second = calls(claude)[1].prompt;
  assert.match(second, /Status: FALLBACK_TO_CLAUDE \(codex unavailable: codex is not authenticated/);
  assert.match(second, /- Brief: Create generated\/probe\.mjs/);
  assert.equal(metrics(events(found)).fallbacks, 1);
});

test('a Codex failure such as an exhausted quota falls back without blocking the mission', async (t) => {
  const { found, claude, env } = mission(t, [phase1, doItYourself, closeStep], 'quota');
  const { summary } = await supervise(found, env);
  assert.equal(summary.status, 'COMPLETED');
  assert.match(calls(claude)[1].prompt, /FALLBACK_TO_CLAUDE \(codex exited with 1\)/);
  assert.match(fs.readFileSync(path.join(found.paths.jobs, '2-u2', 'codex.log'), 'utf8'), /usage limit reached/);
  const counted = metrics(events(found));
  assert.deepEqual([counted.codex_jobs, counted.codex_jobs_failed, counted.fallbacks], [1, 1, 1]);
});

test('Codex changes outside its allowed paths are never committed and stay where they are', async (t) => {
  const { found, claude, env } = mission(t, [phase1, doItYourself, closeStep], 'outside');
  const { summary } = await supervise(found, env);
  assert.equal(summary.status, 'COMPLETED');
  const job = JSON.parse(fs.readFileSync(path.join(found.paths.jobs, '2-u2', 'RESULT.json'), 'utf8'));
  assert.equal(job.status, 'FAILED');
  assert.equal(job.commit, null);
  assert.match(job.reasons.join(' '), /changes outside allowed_paths or on reserved paths, left uncommitted in the job worktree: outside\/notes\.txt/);
  assert.ok(fs.existsSync(path.join(job.job_worktree, 'outside', 'notes.txt')), 'nothing is deleted');
  assert.ok(!fs.existsSync(path.join(found.worktree, 'outside')), 'the mission worktree is untouched');
  assert.match(calls(claude)[1].prompt, /FALLBACK_TO_CLAUDE/);
  assert.equal(state(found).terminal_state, 'COMPLETE');
});
