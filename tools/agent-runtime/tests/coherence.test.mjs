import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validateCheckpointFile, continuityErrors, coverageErrors } from '../lib/coherence.mjs';
import { buildTemplate, refreshTemplate } from '../lib/template.mjs';
import { writeJsonAtomic, sha256File } from '../lib/files.mjs';
import { makeRepo, cleanup, startMission, sh, write, ROUTE, validCheckpoint } from './helpers.mjs';

// A mission with session 1 in flight, as the validator sees it while that session runs.
function session(repo) {
  const found = startMission(repo);
  const state = { ...found.state, status: 'RUNNING', run_seq: 1, current: { run_seq: 1, executor: 'claude', unit: found.mission.first_unit } };
  return { found, ctx: { mission: found.mission, state, previous: null, repo: found.repo, worktree: found.worktree, runSeq: 1, stateDir: found.paths.dir } };
}

function commitFile(worktree, rel, content) {
  write(worktree, rel, content);
  sh(worktree, 'add', '-A');
  sh(worktree, 'commit', '--quiet', '-m', `add ${rel}`);
}

function filled(ctx, overrides = {}) {
  return {
    ...buildTemplate(ctx),
    current_phase: 'planning',
    boundary: 'planning_complete',
    next_exact_action: 'write the probe',
    implemented_since_previous: ['plan'],
    next_unit: { id: 'U2', executor: 'claude', goal: 'write the probe', route: { ...ROUTE } },
    ...overrides,
  };
}

function check(ctx, cp) {
  const file = path.join(ctx.stateDir, 'checkpoint.next.json');
  writeJsonAtomic(file, cp);
  return validateCheckpointFile(file, ctx);
}

const assertError = (verdict, fragment) => {
  assert.equal(verdict.ok, false, `expected a rejection containing "${fragment}"`);
  assert.ok(verdict.errors.some((error) => error.includes(fragment)), `expected "${fragment}" in:\n${verdict.errors.join('\n')}`);
};

test('a filled template validates against the real repository, digests included', (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const { found, ctx } = session(repo);
  commitFile(found.worktree, 'docs/plan.md', '# plan\n');
  const digest = sha256File(path.join(found.worktree, 'docs/plan.md'));
  const verdict = check(ctx, filled(ctx, {
    evidence: [{ kind: 'other', ref: 'docs/plan.md', result: 'WRITTEN', summary: 'the plan', sha256: digest }],
    authorities_required_next: ['docs/plan.md#units'],
  }));
  assert.deepEqual(verdict.errors, []);
  assert.deepEqual(verdict.checkpoint.files_changed, ['docs/plan.md']);
});

test('the Git block must be HEAD; refreshing the template after a new commit repairs it', (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const { found, ctx } = session(repo);
  commitFile(found.worktree, 'docs/plan.md', '# plan\n');
  const cp = filled(ctx);
  commitFile(found.worktree, 'docs/more.md', '# more\n');
  assertError(check(ctx, cp), 'is not HEAD');
  assert.deepEqual(check(ctx, refreshTemplate(cp, ctx)).errors, []);
});

test('an uncommitted change rejects the checkpoint and names the path', (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const { found, ctx } = session(repo);
  commitFile(found.worktree, 'docs/plan.md', '# plan\n');
  write(found.worktree, 'scratch.txt', 'not committed\n');
  assertError(check(ctx, filled(ctx)), 'working tree is not clean (commit every change of this unit): scratch.txt');
});

test('files_changed must cover the changes exactly, with "dir/" prefixes allowed', (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const { found, ctx } = session(repo);
  commitFile(found.worktree, 'docs/a.md', 'a\n');
  commitFile(found.worktree, 'src/x.mjs', 'x\n');
  assertError(check(ctx, filled(ctx, { files_changed: ['docs/'] })), 'misses changed paths (list them, or a covering "dir/" entry): src/x.mjs');
  assertError(check(ctx, filled(ctx, { files_changed: ['docs/', 'src/', 'ghost/'] })), 'match no change since the last checkpoint: ghost/');
  assert.deepEqual(check(ctx, filled(ctx, { files_changed: ['docs/', 'src/x.mjs'] })).errors, []);
  assert.deepEqual(coverageErrors(['a/'], ['a/b/c.md', 'a/d.md']), []);
});

test('references must be tracked at HEAD, runtime artifacts must exist, digests must match', (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const { found, ctx } = session(repo);
  commitFile(found.worktree, 'docs/plan.md', '# plan\n');
  const evidence = (item) => [{ kind: 'test', result: 'PASS', summary: 's', ...item }];
  assertError(check(ctx, filled(ctx, { evidence: evidence({ ref: 'docs/missing.md' }) })), '"docs/missing.md" is not tracked at HEAD');
  assertError(check(ctx, filled(ctx, { evidence: evidence({ ref: 'docs/plan.md', sha256: 'f'.repeat(64) }) })), 'does not match the file');
  assertError(check(ctx, filled(ctx, { evidence: evidence({ ref: 'runtime:jobs/2-u2/RESULT.json' }) })), 'runtime artifact');
  write(found.paths.dir, 'jobs/2-u2/RESULT.json', '{}\n');
  assert.deepEqual(check(ctx, filled(ctx, { evidence: evidence({ ref: 'runtime:jobs/2-u2/RESULT.json' }) })).errors, []);
  assertError(check(ctx, filled(ctx, { authorities_required_next: ['canon/NOT_THERE.md'] })), 'authorities_required_next[0]: "canon/NOT_THERE.md" is not tracked at HEAD');
});

test('identity: the next sequence number, the current run, the mission baseline and branch', (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const { found, ctx } = session(repo);
  commitFile(found.worktree, 'docs/plan.md', '# plan\n');
  assertError(check(ctx, filled(ctx, { checkpoint_seq: 2 })), 'checkpoint_seq: expected 1');
  assertError(check(ctx, filled(ctx, { produced_by: { run_seq: 7, executor: 'claude' } })), 'produced_by.run_seq: expected 1');
  assertError(check(ctx, filled(ctx, { baseline: { commit: 'b'.repeat(40) } })), 'baseline.commit: expected the mission baseline');
  assertError(check(ctx, filled(ctx, { mission_id: 'OTHER' })), 'mission_id: expected "TEST_MISSION"');
});

test('history rewritten since the last checkpoint is rejected', (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const { found, ctx } = session(repo);
  commitFile(repo.main, 'elsewhere.md', 'a commit the mission branch does not contain\n');
  const foreign = sh(repo.main, 'rev-parse', 'HEAD');
  commitFile(found.worktree, 'docs/plan.md', '# plan\n');
  const verdict = check({ ...ctx, state: { ...ctx.state, last_checkpoint_head: foreign } }, filled(ctx));
  assertError(verdict, 'does not descend from the last valid checkpoint commit');
});

test('a final state needs the branch pushed and the remote HEAD verified', (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const { found, ctx } = session(repo);
  commitFile(found.worktree, 'docs/plan.md', '# plan\n');
  const closing = (pushed) => filled(ctx, { mission_state: 'COMPLETE', boundary: 'mission_closure', next_unit: null, git: { ...buildTemplate(ctx).git, pushed } });
  assertError(check(ctx, closing(false)), 'git.pushed must be true for COMPLETE');
  assertError(check(ctx, closing(true)), `the remote branch ${found.mission.repo.branch} is absent`);
  sh(found.worktree, 'push', '--quiet', '-u', 'origin', 'HEAD');
  assert.deepEqual(check(ctx, closing(true)).errors, []);
});

test('a terminal mission accepts no further checkpoint', (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const { found, ctx } = session(repo);
  commitFile(found.worktree, 'docs/plan.md', '# plan\n');
  const terminal = { ...ctx, state: { ...ctx.state, status: 'COMPLETED', terminal_state: 'CLOSED_NOT_READY' } };
  assertError(check(terminal, filled(ctx)), 'mission is terminal (CLOSED_NOT_READY)');
});

test('oversized or malformed checkpoint files are rejected before any other check', (t) => {
  const repo = makeRepo();
  t.after(() => cleanup(repo));
  const { ctx } = session(repo);
  const file = path.join(ctx.stateDir, 'checkpoint.next.json');
  fs.writeFileSync(file, JSON.stringify({ padding: 'x'.repeat(70 * 1024) }));
  assert.match(validateCheckpointFile(file, ctx).errors[0], /the limit is 65536/);
  fs.writeFileSync(file, '{"schema":');
  assert.match(validateCheckpointFile(file, ctx).errors[0], /not valid JSON/);
});

test('continuity: settled scope, invariants, freezes, findings and blockers cannot be lost', () => {
  const blocker = { id: 'QE-1', severity: 'MAJOR', summary: 'blocker', owner: 'engineering', blocking: true };
  const previous = validCheckpoint({
    do_not_reopen: ['R7-B.1 stays closed'],
    canonical_invariants: ['INV-1'],
    freeze: { id: 'FREEZE-2', digest: 'abc', record: 'r7/FREEZE.json' },
    findings: { open: [blocker, { id: 'F2', severity: 'MINOR', summary: 's', owner: 'o', blocking: false }], closed: [{ id: 'F0', resolution: 'fixed' }] },
  });
  const next = (overrides) => ({ ...structuredClone(previous), ...overrides });
  const fragments = (cp) => continuityErrors(cp, previous).join('\n');
  assert.match(fragments(next({ do_not_reopen: [] })), /do_not_reopen items cannot be dropped: R7-B.1 stays closed/);
  assert.match(fragments(next({ canonical_invariants: [] })), /canonical_invariants cannot be dropped/);
  assert.match(fragments(next({ freeze: null })), /freeze cannot be dropped/);
  assert.match(fragments(next({ findings: { open: [blocker], closed: [{ id: 'F0', resolution: 'fixed' }] } })), /open finding F2 disappeared/);
  assert.match(fragments(next({ findings: { open: [{ ...blocker, blocking: false }, previous.findings.open[1]], closed: previous.findings.closed } })), /QE-1 is still open and was blocking/);
  assert.match(fragments(next({ findings: { open: previous.findings.open, closed: [] } })), /closed finding F0 cannot disappear or reopen silently/);
  const closedWithoutEvidence = { open: [previous.findings.open[1]], closed: [{ id: 'F0', resolution: 'fixed' }, { id: 'QE-1', resolution: 'looks fine now' }] };
  assert.match(fragments(next({ findings: closedWithoutEvidence })), /blocking finding QE-1 is closed without an evidence_ref/);
  const legitimate = next({
    do_not_reopen: ['R7-B.1 stays closed', 'R7-C not started'],
    findings: { open: [blocker], closed: [{ id: 'F0', resolution: 'fixed' }, { id: 'F2', resolution: 'fixed with a test', evidence_ref: 'test/f2.test.mjs' }] },
  });
  assert.deepEqual(continuityErrors(legitimate, previous), []);
});
