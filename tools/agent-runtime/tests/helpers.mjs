import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createMission } from '../lib/mission.mjs';
import { Supervisor } from '../lib/supervisor.mjs';
import { readJson, readJsonl } from '../lib/files.mjs';
import { CHECKPOINT_SCHEMA } from '../lib/checkpoint.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const RUNTIME = path.resolve(HERE, '..', 'runtime.mjs');
export const FAKE_CLAUDE = path.join(HERE, 'fakes', 'fake-claude.mjs');
export const FAKE_CODEX = path.join(HERE, 'fakes', 'fake-codex.mjs');
export const ROUTE = Object.freeze({ model: 'claude-opus-5-5', effort: 'high', work_kind: 'material_other', reason: 'test route' });
export const GOAL = 'Prove the runtime on a toy mission';

export function sh(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } }).trim();
}

export function write(dir, rel, content = `${rel}\n`) {
  const file = path.join(dir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

// A throwaway repository with a bare local "origin", shaped like the real one: the runtime entry
// point is tracked and the runtime state directory is ignored.
export function makeRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aer-'));
  const origin = path.join(root, 'origin.git');
  const main = path.join(root, 'main');
  sh(root, 'init', '--quiet', '--bare', origin);
  sh(root, 'init', '--quiet', '-b', 'main', main);
  for (const [key, value] of [['user.name', 'Runtime Test'], ['user.email', 'runtime-test@example.invalid'], ['core.autocrlf', 'false'], ['commit.gpgsign', 'false']]) {
    sh(main, 'config', key, value);
  }
  write(main, '.gitignore', '/.agent-runtime/\n.claude/worktrees/\nnode_modules/\n');
  write(main, 'README.md', '# test repository\n');
  write(main, 'tools/agent-runtime/runtime.mjs', '// placeholder: the tests run the runtime from the source tree\n');
  sh(main, 'add', '-A');
  sh(main, 'commit', '--quiet', '-m', 'base');
  sh(main, 'remote', 'add', 'origin', origin);
  sh(main, 'push', '--quiet', '-u', 'origin', 'main');
  return { root, main, origin, base: sh(main, 'rev-parse', 'HEAD') };
}

export function cleanup(repo) {
  fs.rmSync(repo.root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}

export function startMission(repo, { id = 'TEST_MISSION', limits = {} } = {}) {
  const request = write(repo.root, `request-${id}.md`, '# Test request\nDo the toy mission.\n');
  return createMission({ cwd: repo.main, missionId: id, requestFile: request, route: { ...ROUTE }, goal: GOAL, limits });
}

export function script(repo, steps) {
  const file = path.join(repo.root, `claude-script-${Math.random().toString(16).slice(2)}.json`);
  fs.writeFileSync(file, JSON.stringify(steps));
  return file;
}

export function fakeEnv({ claudeScript = '', codexMode = 'ok', codexLog = '', extra = {} } = {}) {
  return {
    ...process.env,
    AGENT_RUNTIME_CLAUDE_CMD: JSON.stringify([process.execPath, FAKE_CLAUDE]),
    AGENT_RUNTIME_CODEX_CMD: JSON.stringify([process.execPath, FAKE_CODEX]),
    FAKE_CLAUDE_SCRIPT: claudeScript,
    FAKE_RUNTIME: RUNTIME,
    FAKE_CODEX_MODE: codexMode,
    FAKE_CODEX_LOG: codexLog,
    ...extra,
  };
}

export async function supervise(found, env, options = {}) {
  const lines = [];
  const supervisor = new Supervisor({ worktree: found.worktree, env, log: (line) => lines.push(line) });
  const summary = await supervisor.run(options);
  return { summary, supervisor, lines };
}

export function calls(claudeScript) {
  const file = `${claudeScript}.calls.jsonl`;
  return fs.existsSync(file) ? readJsonl(file) : [];
}

export const events = (found) => readJsonl(found.paths.events);
export const state = (found) => readJson(found.paths.state);
export const checkpoint = (found, seq) => readJson(path.join(found.paths.checkpoints, `${String(seq).padStart(4, '0')}.json`));

// Checkpoint patches applied by the fake session on top of the runtime's own template.
export const running = (overrides = {}) => ({
  current_phase: 'work',
  boundary: 'implementation_unit_complete',
  next_exact_action: 'continue with the next unit',
  implemented_since_previous: ['a unit of work'],
  next_unit: { id: 'U2', executor: 'claude', goal: 'the next unit', route: { ...ROUTE } },
  ...overrides,
});

export const closing = (missionState = 'COMPLETE', overrides = {}) => ({
  current_phase: 'closure',
  boundary: 'mission_closure',
  mission_state: missionState,
  next_exact_action: 'none: the mission is closed',
  next_unit: null,
  git: { pushed: true },
  ...overrides,
});

// A structurally valid checkpoint for the pure validation tests (no repository behind it).
export function validCheckpoint(overrides = {}) {
  const sha = 'a'.repeat(40);
  return {
    schema: CHECKPOINT_SCHEMA,
    mission_id: 'TEST_MISSION',
    checkpoint_seq: 1,
    previous_checkpoint: null,
    created_at: '2026-10-31T12:00:00.000Z',
    produced_by: { run_seq: 1, executor: 'claude' },
    mission_goal: GOAL,
    mission_state: 'RUNNING',
    current_phase: 'planning',
    boundary: 'planning_complete',
    baseline: { commit: sha },
    git: { branch: 'claude/test-mission', head_commit: sha, pushed: false },
    freeze: null,
    canonical_invariants: ['INV-1'],
    authorities_used: ['CLAUDE.md'],
    decisions_made: [{ id: 'D1', decision: 'use the runtime', rationale: 'test' }],
    implemented_since_previous: ['plan'],
    files_changed: ['docs/'],
    evidence: [{ kind: 'test', ref: 'docs/plan.md', result: 'PASS', summary: 'plan written' }],
    findings: { open: [{ id: 'F1', severity: 'MINOR', summary: 'probe missing', owner: 'engineering', blocking: false }], closed: [] },
    do_not_reopen: ['scope fixed by the request'],
    next_exact_action: 'write the probe',
    next_unit: { id: 'U2', executor: 'claude', goal: 'write the probe', route: { ...ROUTE } },
    required_next_context: ['docs/plan.md'],
    authorities_required_next: ['CLAUDE.md#read-first'],
    handoffs: [],
    founder_action_required: null,
    ...overrides,
  };
}
