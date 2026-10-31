import fs from 'node:fs';
import path from 'node:path';
import * as git from './git.mjs';
import { EFFORTS, WORK_KINDS } from './checkpoint.mjs';
import { readJsonIfExists, writeJsonAtomic, appendJsonl, ensureDir, sha256File, nowIso } from './files.mjs';

export const MISSION_SCHEMA = 'agent-runtime/mission@1';
export const STATE_SCHEMA = 'agent-runtime/state@1';
export const STATE_DIR = '.agent-runtime';
export const DEFAULT_LIMITS = Object.freeze({ max_runs: 40, max_consecutive_failures: 2, max_checkpoint_corrections: 2 });
export const DEFAULT_FIRST_ROUTE = Object.freeze({
  model: 'claude-opus-5-5',
  effort: 'xhigh',
  work_kind: 'material_other',
  reason: 'Mission intake and planning: grounding, scope, gates and unit design are high-judgment work',
});
// bypassPermissions is deliberately absent: supervised sessions never skip permission checks.
export const PERMISSION_MODES = Object.freeze(['auto', 'acceptEdits', 'plan', 'manual']);
const FIRST_UNIT_GOAL =
  'Intake and plan. Record the Founder request in the repository per project practice, ground only what the plan needs, define the units, gates and stop conditions, then checkpoint at the planning_complete boundary.';
const RUNTIME_ENTRY = 'tools/agent-runtime/runtime.mjs';

// "DOMAIN_COACHING_R7-B.2" -> "domain-coaching-r7-b2", the repository's branch and folder naming.
export function slugify(missionId) {
  return missionId
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\./g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function layout(worktree) {
  const dir = path.join(worktree, STATE_DIR);
  return {
    dir,
    mission: path.join(dir, 'mission.json'),
    state: path.join(dir, 'state.json'),
    events: path.join(dir, 'events.jsonl'),
    lock: path.join(dir, 'lock.json'),
    request: path.join(dir, 'request.md'),
    checkpointOut: path.join(dir, 'checkpoint.next.json'),
    checkpoints: path.join(dir, 'checkpoints'),
    sessions: path.join(dir, 'sessions'),
    jobs: path.join(dir, 'jobs'),
    captures: path.join(dir, 'captures'),
  };
}

export const checkpointPath = (paths, seq) => path.join(paths.checkpoints, `${String(seq).padStart(4, '0')}.json`);

function samePath(a, b) {
  const [x, y] = [path.resolve(a), path.resolve(b)];
  return process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y;
}

export function listMissions(cwd) {
  return git.worktreeList(cwd).flatMap((worktree) => {
    const paths = layout(worktree.path);
    const mission = readJsonIfExists(paths.mission);
    return mission ? [{ worktree: worktree.path, paths, mission }] : [];
  });
}

export const findMission = (cwd, missionId) =>
  listMissions(cwd).find((entry) => entry.mission.mission_id === missionId) ?? null;

function ensureWorktree(cwd, worktreePath, branchName, baseCommit) {
  const existing = git.worktreeList(cwd).find((worktree) => samePath(worktree.path, worktreePath));
  if (existing) {
    if (existing.branch !== branchName) {
      throw new Error(`worktree ${worktreePath} is on ${existing.branch ?? 'a detached HEAD'}, not ${branchName}`);
    }
    if (!git.isAncestor(worktreePath, baseCommit, git.head(worktreePath))) {
      throw new Error(`worktree ${worktreePath} does not descend from the base ${baseCommit}`);
    }
    return;
  }
  if (fs.existsSync(worktreePath)) throw new Error(`${worktreePath} exists but is not a worktree of this repository`);
  if (git.branchExists(cwd, branchName)) {
    if (!git.isAncestor(cwd, baseCommit, git.resolveCommit(cwd, branchName))) {
      throw new Error(`branch ${branchName} exists and does not descend from the base ${baseCommit}`);
    }
    git.addWorktree(cwd, worktreePath, branchName, null);
  } else {
    git.addWorktree(cwd, worktreePath, branchName, baseCommit);
  }
}

function checkRoute(route) {
  if (typeof route?.model !== 'string' || route.model.trim() === '') throw new Error('the first unit needs a model');
  if (!EFFORTS.includes(route.effort)) throw new Error(`effort must be one of ${EFFORTS.join(', ')}`);
  if (!WORK_KINDS.includes(route.work_kind)) throw new Error(`work kind must be one of ${WORK_KINDS.join(', ')}`);
}

function checkLimits(limits) {
  for (const [name, value] of Object.entries(limits)) {
    if (!(name in DEFAULT_LIMITS)) throw new Error(`unknown limit ${name}`);
    if (!Number.isInteger(value) || value < 1) throw new Error(`limit ${name} must be an integer >= 1`);
  }
}

// Validates the start options and computes the mission record without changing anything.
export function planMission({
  cwd,
  missionId,
  requestFile,
  base = 'HEAD',
  branch = null,
  worktree = null,
  route = DEFAULT_FIRST_ROUTE,
  permissionMode = 'auto',
  maxBudgetUsd = null,
  goal = null,
  limits = {},
}) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(missionId ?? '')) {
    throw new Error(`invalid mission id "${missionId}" (letters, digits, ".", "_" and "-")`);
  }
  if (!PERMISSION_MODES.includes(permissionMode)) {
    throw new Error(`permission mode "${permissionMode}" is not allowed (allowed: ${PERMISSION_MODES.join(', ')})`);
  }
  if (maxBudgetUsd !== null && !(Number.isFinite(maxBudgetUsd) && maxBudgetUsd > 0)) {
    throw new Error('the session budget must be a positive number of USD');
  }
  if (!requestFile || !fs.existsSync(requestFile) || !fs.statSync(requestFile).isFile()) {
    throw new Error(`request file not found: ${requestFile}`);
  }
  if (fs.statSync(requestFile).size === 0) throw new Error('the request file is empty');
  checkRoute(route);
  checkLimits(limits);
  const baseCommit = git.resolveCommit(cwd, base);
  if (!baseCommit) throw new Error(`base "${base}" is not a commit`);
  if (!git.existsAt(cwd, baseCommit, RUNTIME_ENTRY)) {
    throw new Error(`base ${baseCommit.slice(0, 12)} does not contain ${RUNTIME_ENTRY}: its sessions could not write or validate checkpoints`);
  }
  if (findMission(cwd, missionId)) throw new Error(`mission ${missionId} already exists`);
  // When the base is the current checkout, its ignore rules are checked before anything is created.
  const top = path.resolve(git.toplevel(cwd));
  if (git.head(top) === baseCommit && !git.isIgnored(top, `${STATE_DIR}/state.json`)) {
    throw new Error(`${STATE_DIR}/ is not ignored at the base ${baseCommit.slice(0, 12)}: it needs "/${STATE_DIR}/" in .gitignore`);
  }
  const slug = slugify(missionId);
  const root = git.mainRoot(cwd);
  return {
    schema: MISSION_SCHEMA,
    mission_id: missionId,
    slug,
    created_at: nowIso(),
    goal,
    request: { file: 'request.md', source: path.resolve(requestFile), sha256: sha256File(requestFile) },
    repo: {
      main_root: root,
      worktree: path.resolve(worktree ?? path.join(root, '.claude', 'worktrees', slug)),
      branch: branch ?? `claude/${slug}`,
      base_commit: baseCommit,
      remote: 'origin',
    },
    first_unit: { id: 'U1', executor: 'claude', goal: FIRST_UNIT_GOAL, route: { ...route } },
    claude: { permission_mode: permissionMode, max_budget_usd: maxBudgetUsd },
    limits: { ...DEFAULT_LIMITS, ...limits },
  };
}

// Creates (or adopts) the mission worktree and branch, then the local state beside it.
export function createMission(options) {
  const mission = planMission(options);
  const { worktree: worktreePath, branch: branchName, base_commit: baseCommit } = mission.repo;
  ensureWorktree(options.cwd, worktreePath, branchName, baseCommit);
  const paths = layout(worktreePath);
  if (!git.isIgnored(worktreePath, `${STATE_DIR}/state.json`)) {
    throw new Error(`${STATE_DIR}/ is not ignored in ${worktreePath}: the base needs "/${STATE_DIR}/" in .gitignore`);
  }
  if (fs.existsSync(paths.mission)) throw new Error(`${paths.mission} already exists`);
  ensureDir(paths.dir);
  fs.copyFileSync(options.requestFile, paths.request);
  if (sha256File(paths.request) !== mission.request.sha256) throw new Error('the request file changed while it was being copied');
  writeJsonAtomic(paths.mission, mission);
  const state = initialState(mission);
  writeJsonAtomic(paths.state, state);
  appendEvent(paths, mission, {
    type: 'mission_created',
    base_commit: baseCommit,
    branch: branchName,
    worktree: worktreePath,
    request_sha256: mission.request.sha256,
  });
  return { worktree: worktreePath, paths, mission, state };
}

export function initialState(mission) {
  return {
    schema: STATE_SCHEMA,
    mission_id: mission.mission_id,
    status: 'CREATED',
    terminal_state: null,
    reason: null,
    run_seq: 0,
    run_window_start: 0,
    last_checkpoint_seq: null,
    last_checkpoint_head: mission.repo.base_commit,
    last_checkpoint_sha256: null,
    next_unit: mission.first_unit,
    pending: { notices: [], job_result: null },
    current: null,
    consecutive_failures: 0,
    blocked_dirty: [],
    acknowledged_dirty: [],
    updated_at: nowIso(),
  };
}

export function saveState(paths, state) {
  state.updated_at = nowIso();
  writeJsonAtomic(paths.state, state);
}

export function appendEvent(paths, mission, event) {
  appendJsonl(paths.events, { ts: nowIso(), mission_id: mission.mission_id, ...event });
}

export function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

// One supervisor per mission. A lock left by a supervisor that died (its pid is gone) is taken over.
export function acquireLock(paths) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const fd = fs.openSync(paths.lock, 'wx');
      fs.writeSync(fd, JSON.stringify({ pid: process.pid, started_at: nowIso() }));
      fs.closeSync(fd);
      return () => {
        const held = readLock(paths);
        if (held?.pid === process.pid) fs.rmSync(paths.lock, { force: true });
      };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const held = readLock(paths);
      if (held && pidAlive(held.pid)) {
        throw new Error(`another supervisor (pid ${held.pid}, since ${held.started_at}) is running this mission`);
      }
      fs.rmSync(paths.lock, { force: true });
    }
  }
  throw new Error('could not acquire the mission lock');
}

function readLock(paths) {
  try {
    return readJsonIfExists(paths.lock);
  } catch {
    return null; // a lock cut short by a crash during its write is stale by definition
  }
}
