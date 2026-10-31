import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStructure } from '../lib/checkpoint.mjs';
import { ROUTE, validCheckpoint } from './helpers.mjs';

const errorsOf = (overrides) => validateStructure(validCheckpoint(overrides));
const assertError = (errors, fragment) =>
  assert.ok(errors.some((error) => error.includes(fragment)), `expected an error containing "${fragment}", got:\n${errors.join('\n')}`);

const codexUnit = (job = {}, extra = {}) => ({
  id: 'U3',
  executor: 'codex',
  goal: 'generate the probe',
  job: { brief: 'write generated/probe.mjs', allowed_paths: ['generated/'], acceptance: [['node', 'generated/probe.mjs']], ...job },
  then: { id: 'U4', executor: 'claude', goal: 'judge the probe', route: { ...ROUTE } },
  ...extra,
});

test('a complete checkpoint has no structural error', () => {
  assert.deepEqual(errorsOf({}), []);
});

test('required fields are enforced, including empty strings', () => {
  const cp = validCheckpoint();
  delete cp.mission_goal;
  cp.next_exact_action = '  ';
  const errors = validateStructure(cp);
  assertError(errors, 'mission_goal: must be a non-empty string');
  assertError(errors, 'next_exact_action: must be a non-empty string');
});

test('schema, commit ids, enums and timestamps are checked', () => {
  const errors = errorsOf({
    schema: 'other@1',
    git: { branch: 'b', head_commit: 'abc', pushed: 'yes' },
    mission_state: 'DONE',
    boundary: 'whenever',
    created_at: 'yesterday',
  });
  for (const fragment of ['schema:', 'git.head_commit: must be a full 40-character commit id', 'git.pushed', 'mission_state: must be one of', 'boundary: must be one of', 'created_at: must be an ISO-8601']) {
    assertError(errors, fragment);
  }
});

test('a running mission needs a next unit; a final state forbids it and must close at mission_closure', () => {
  assertError(errorsOf({ next_unit: null }), 'next_unit: is required when mission_state is RUNNING');
  const final = errorsOf({ mission_state: 'COMPLETE' });
  assertError(final, 'next_unit: must be null when mission_state is COMPLETE');
  assertError(final, 'boundary: must be mission_closure');
});

test('CLOSED_NOT_READY must name a blocker, and READY states cannot keep one open', () => {
  const closure = { next_unit: null, boundary: 'mission_closure' };
  assertError(errorsOf({ ...closure, mission_state: 'CLOSED_NOT_READY' }), 'CLOSED_NOT_READY must name at least one blocking open finding');
  const blocker = { open: [{ id: 'QE-1', severity: 'MAJOR', summary: 'blocker', owner: 'engineering', blocking: true }], closed: [] };
  assert.deepEqual(errorsOf({ ...closure, mission_state: 'CLOSED_NOT_READY', findings: blocker }), []);
  assertError(errorsOf({ ...closure, mission_state: 'CLOSED_READY', findings: blocker }), 'not allowed while blocking findings are open: QE-1');
  assertError(errorsOf({ ...closure, mission_state: 'COMPLETE', findings: blocker }), 'QE-1');
});

test('Founder escalation is explicit and only where it belongs', () => {
  assertError(errorsOf({ mission_state: 'FOUNDER_REQUIRED' }), 'founder_action_required: is required');
  const founder = { reason: 'product decision', decision_needed: 'choose A or B', options: ['A', 'B'] };
  assert.deepEqual(errorsOf({ mission_state: 'FOUNDER_REQUIRED', founder_action_required: founder }), []);
  assertError(errorsOf({ founder_action_required: founder }), 'must be null when mission_state is RUNNING');
  assertError(errorsOf({ mission_state: 'BLOCKED' }), 'BLOCKED needs a blocking open finding or founder_action_required');
});

test('finding ids are unique across open and closed', () => {
  const findings = {
    open: [{ id: 'F1', severity: 'MINOR', summary: 's', owner: 'o', blocking: false }],
    closed: [{ id: 'F1', resolution: 'fixed' }],
  };
  assertError(errorsOf({ findings }), 'ids must be unique across open and closed: F1');
});

test('UI/UX work keeps the Founder model floor', () => {
  const uiUnit = (route) => ({ id: 'U2', executor: 'claude', goal: 'design', route: { ...ROUTE, work_kind: 'material_ui_ux', ...route } });
  assertError(errorsOf({ next_unit: uiUnit({ effort: 'high' }) }), 'requires model claude-opus-5-5 with effort max');
  assert.deepEqual(errorsOf({ next_unit: uiUnit({ model: 'claude-opus-5-5', effort: 'max' }) }), []);
  assertError(errorsOf({ next_unit: { id: 'U2', executor: 'claude', goal: 'g' } }), 'next_unit.route: must be an object');
});

test('a codex unit must be bounded, verifiable and followed by a Claude unit', () => {
  assert.deepEqual(errorsOf({ next_unit: codexUnit() }), []);
  assertError(errorsOf({ next_unit: codexUnit({}, { then: null }) }), 'next_unit.then: a claude unit must follow a codex job');
  assertError(errorsOf({ next_unit: codexUnit({ acceptance: [] }) }), 'delegated work must be verifiable');
  assertError(errorsOf({ next_unit: codexUnit({ allowed_paths: [] }) }), 'must name at least one path');
  for (const reserved of ['.git/', '.agent-runtime', '.claude/', '.codex/settings', '.mcp.json', '.github/workflows/']) {
    assertError(errorsOf({ next_unit: codexUnit({ allowed_paths: [reserved] }) }), 'must not include reserved paths');
  }
  assertError(errorsOf({ next_unit: codexUnit({ copy_ignored: ['.agent-runtime/'] }) }), 'next_unit.job.copy_ignored: must not include reserved paths');
  assert.deepEqual(errorsOf({ next_unit: codexUnit({ copy_ignored: ['CoachingCore/node_modules'] }) }), []);
  const nested = codexUnit({}, { then: codexUnit() });
  assertError(errorsOf({ next_unit: nested }), 'next_unit.then.executor: must be one of claude');
});

test('a job carries acceptance commands for the judging unit, never a command for the supervisor', () => {
  const then = { id: 'U3', executor: 'claude', goal: 'read it', route: { ...ROUTE } };
  assertError(errorsOf({ next_unit: { id: 'U2', executor: 'local', goal: 'run', job: { command: ['npm', 'test'] }, then } }), 'next_unit.executor: must be one of claude, codex');
  assertError(errorsOf({ next_unit: codexUnit({ fallback_command: ['npm', 'test'] }) }), 'fallback_command: is not supported: the supervisor runs no command an agent selects');
  assertError(errorsOf({ next_unit: codexUnit({ acceptance: ['npm test'] }) }), 'argv form, no shell');
  assert.deepEqual(errorsOf({ next_unit: codexUnit({ acceptance: [['npm', 'test', '--prefix', 'CoachingCore']] }) }), []);
});

test('model ids are aliases or exact ids, never text that reads as an option', () => {
  const route = (model) => ({ next_unit: { id: 'U2', executor: 'claude', goal: 'g', route: { ...ROUTE, model } } });
  assertError(errorsOf(route('--dangerously-skip-permissions')), 'next_unit.route.model: must be a model alias or exact id');
  assertError(errorsOf(route('opus 5')), 'next_unit.route.model');
  assert.deepEqual(errorsOf(route('claude-opus-5-5[1m]')), []);
  assertError(errorsOf({ next_unit: codexUnit({ model: '-c' }) }), 'next_unit.job.model: must be a model alias or exact id');
});

test('paths are normalized and repository-relative', () => {
  for (const bad of ['C:/Users/x.md', '/etc/passwd', '../x.md', 'a\\b.md', './a.md']) {
    assertError(errorsOf({ required_next_context: [bad] }), 'required_next_context[0]: must be a normalized repository-relative path');
  }
  assert.deepEqual(errorsOf({ authorities_required_next: ['CURRENT_MISSION.md#r7-b1-closure'] }), []);
});

test('evidence may point at runtime artifacts and pin a well-formed digest', () => {
  const evidence = (item) => [{ kind: 'verification', ref: 'runtime:jobs/2-u2/RESULT.json', result: 'PASS', summary: 's', ...item }];
  assert.deepEqual(errorsOf({ evidence: evidence({}) }), []);
  assertError(errorsOf({ evidence: evidence({ sha256: 'xyz' }) }), 'evidence[0].sha256: must be a 64-character lowercase hex digest');
  assertError(errorsOf({ evidence: evidence({ kind: 'vibes' }) }), 'evidence[0].kind: must be one of');
});
