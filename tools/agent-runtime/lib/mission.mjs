import fs from 'node:fs';
import path from 'node:path';
import * as git from './git.mjs';
import { EFFORTS, WORK_KINDS, MODEL_ID } from './checkpoint.mjs';
import { readJson, readJsonIfExists, writeJsonAtomic, appendJsonl, ensureDir, sha256File, nowIso } from './files.mjs';
import { protectedSnapshot } from './protected.mjs';

export const MISSION_SCHEMA = 'agent-runtime/mission@1';
export const STATE_SCHEMA = 'agent-runtime/state@1';
// Supervisor-owned control state lives in the Git common directory, outside every worktree a session
// works in; the session-visible workspace (request copy, checkpoint drafts, logs) is .agent-runtime/.
export const CONTROL_DIR = 'agent-runtime';
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
const MISSION_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
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

export function layout(worktree, control) {
  const dir = path.join(worktree, STATE_DIR);
  return {
    control,
    mission: path.join(control, 'mission.json'),
    state: path.join(control, 'state.json'),
    events: path.join(control, 'events.jsonl'),
    lock: path.join(control, 'lock.json'),
    checkpoints: path.join(control, 'checkpoints'),
    dir,
    request: path.join(dir, 'request.md'),
    checkpointOut: path.join(dir, 'checkpoint.next.json'),
    checkpointCopies: path.join(dir, 'checkpoints'),
    sessions: path.join(dir, 'sessions'),
    jobs: path.join(dir, 'jobs'),
    captures: path.join(dir, 'captures'),
  };
}

const pad = (seq) => String(seq).padStart(4, '0');
export const checkpointPath = (paths, seq) => path.join(paths.checkpoints, `${pad(seq)}.json`);
export const checkpointCopyPath = (paths, seq) => path.join(paths.checkpointCopies, `${pad(seq)}.json`);
export const controlRoot = (cwd) => path.join(git.commonDir(cwd), CONTROL_DIR);

export function samePath(a, b) {
  const [x, y] = [path.resolve(a), path.resolve(b)];
  return process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y;
}

export function isInside(child, parent) {
  const relative = path.relative(parent, child);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

const positive = (value) => Number.isFinite(value) && value > 0;

// The record is read again at every start: whatever happened to the file meanwhile, the supervisor
// never runs a mission whose settings fall outside what a mission may be created with.
export function validateMissionRecord(mission, control) {
  const problems = [];
  const repo = mission?.repo ?? {};
  const route = mission?.first_unit?.route ?? {};
  if (mission?.schema !== MISSION_SCHEMA) problems.push('schema');
  if (!MISSION_ID.test(mission?.mission_id ?? '')) problems.push('mission_id');
  if (!SLUG.test(mission?.slug ?? '') || mission.slug !== slugify(mission.mission_id ?? '') || path.basename(control) !== mission.slug) problems.push('slug');
  if (!git.SAFE_BRANCH.test(repo.branch ?? '')) problems.push('repo.branch');
  if (!git.COMMIT_ID.test(repo.base_commit ?? '')) problems.push('repo.base_commit');
  if (typeof repo.remote_url !== 'string' || repo.remote_url === '' || repo.remote_url.startsWith('-') || /[\0-\x1f]/.test(repo.remote_url)) problems.push('repo.remote_url');
  if (!path.isAbsolute(repo.worktree ?? '')) problems.push('repo.worktree');
  const common = path.dirname(path.dirname(control));
  if (!path.isAbsolute(repo.main_root ?? '') || !samePath(repo.main_root, git.mainRootOf(common))) problems.push('repo.main_root');
  if (!path.isAbsolute(repo.git_dir ?? '') || !(samePath(repo.git_dir, common) || isInside(repo.git_dir, path.join(common, 'worktrees')))) problems.push('repo.git_dir');
  if (!MODEL_ID.test(route.model ?? '') || !EFFORTS.includes(route.effort) || !WORK_KINDS.includes(route.work_kind)) problems.push('first_unit.route');
  if (!PERMISSION_MODES.includes(mission?.claude?.permission_mode)) problems.push('claude.permission_mode');
  const budget = mission?.claude?.max_budget_usd;
  if (budget !== null && !positive(budget)) problems.push('claude.max_budget_usd');
  const limits = mission?.limits ?? {};
  if (Object.keys(DEFAULT_LIMITS).some((name) => !Number.isInteger(limits[name]) || limits[name] < 1 || limits[name] > 1000)) problems.push('limits');
  if (problems.length) {
    throw new Error(`mission record ${path.join(control, 'mission.json')} is invalid or was altered (${problems.join(', ')}); the supervisor will not run it`);
  }
  return mission;
}

export function openMission(control) {
  const mission = validateMissionRecord(readJson(path.join(control, 'mission.json')), control);
  const { worktree, git_dir: gitDir } = mission.repo;
  return { mission, worktree, repo: git.repoAt(worktree, gitDir), paths: layout(worktree, control) };
}

export function listMissions(cwd) {
  const root = controlRoot(cwd);
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, entry.name, 'mission.json')))
    .map((entry) => openMission(path.join(root, entry.name)));
}

export function findMission(cwd, missionId) {
  const control = path.join(controlRoot(cwd), slugify(missionId));
  if (!fs.existsSync(path.join(control, 'mission.json'))) return null;
  const found = openMission(control);
  if (found.mission.mission_id !== missionId) {
    throw new Error(`mission ${found.mission.mission_id} already uses the folder ${found.mission.slug}; choose a distinct id`);
  }
  return found;
}

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
  if (!MISSION_ID.test(missionId ?? '')) throw new Error(`invalid mission id "${missionId}" (letters, digits, ".", "_" and "-")`);
  if (!PERMISSION_MODES.includes(permissionMode)) {
    throw new Error(`permission mode "${permissionMode}" is not allowed (allowed: ${PERMISSION_MODES.join(', ')})`);
  }
  if (maxBudgetUsd !== null && !positive(maxBudgetUsd)) throw new Error('the session budget must be a positive number of USD');
  if (!requestFile || !fs.existsSync(requestFile) || !fs.statSync(requestFile).isFile()) throw new Error(`request file not found: ${requestFile}`);
  if (fs.statSync(requestFile).size === 0) throw new Error('the request file is empty');
  if (!MODEL_ID.test(route?.model ?? '')) throw new Error('the first unit needs a valid model id');
  if (!EFFORTS.includes(route.effort)) throw new Error(`effort must be one of ${EFFORTS.join(', ')}`);
  if (!WORK_KINDS.includes(route.work_kind)) throw new Error(`work kind must be one of ${WORK_KINDS.join(', ')}`);
  for (const [name, value] of Object.entries(limits)) {
    if (!(name in DEFAULT_LIMITS) || !Number.isInteger(value) || value < 1 || value > 1000) throw new Error(`limit ${name} must be a known limit, an integer from 1 to 1000`);
  }
  const slug = slugify(missionId);
  const branchName = branch ?? `claude/${slug}`;
  if (!git.SAFE_BRANCH.test(branchName)) throw new Error(`branch name ${JSON.stringify(branchName)} is not allowed`);
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
  const remoteUrl = git.remoteUrl(cwd, 'origin');
  if (!remoteUrl) throw new Error('the repository needs an "origin" remote: closures are verified against it');
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
      branch: branchName,
      base_commit: baseCommit,
      remote_url: remoteUrl,
    },
    first_unit: { id: 'U1', executor: 'claude', goal: FIRST_UNIT_GOAL, route: { ...route } },
    claude: { permission_mode: permissionMode, max_budget_usd: maxBudgetUsd },
    limits: { ...DEFAULT_LIMITS, ...limits },
  };
}

// Creates (or adopts) the mission worktree and branch, the control state and the session workspace.
export function createMission(options) {
  const mission = planMission(options);
  const { worktree: worktreePath, branch: branchName, base_commit: baseCommit } = mission.repo;
  const control = path.join(controlRoot(options.cwd), mission.slug);
  ensureWorktree(options.cwd, worktreePath, branchName, baseCommit);
  const paths = layout(worktreePath, control);
  if (!git.isIgnored(worktreePath, `${STATE_DIR}/state.json`)) {
    throw new Error(`${STATE_DIR}/ is not ignored in ${worktreePath}: the base needs "/${STATE_DIR}/" in .gitignore`);
  }
  if (fs.existsSync(paths.mission)) throw new Error(`${paths.mission} already exists`);
  // Pinned before any session exists: later commands never follow the worktree's own `.git` file.
  mission.repo.git_dir = git.gitDirOf(worktreePath);
  ensureDir(control);
  ensureDir(paths.dir);
  for (const target of [path.join(control, 'request.md'), paths.request]) {
    fs.copyFileSync(options.requestFile, target);
    if (sha256File(target) !== mission.request.sha256) throw new Error('the request file changed while it was being copied');
  }
  writeJsonAtomic(paths.mission, mission);
  const state = { ...initialState(mission), protected_snapshot: protectedSnapshot(worktreePath) };
  writeJsonAtomic(paths.state, state);
  appendEvent(paths, mission, {
    type: 'mission_created',
    base_commit: baseCommit,
    branch: branchName,
    worktree: worktreePath,
    remote_url: mission.repo.remote_url,
    request_sha256: mission.request.sha256,
  });
  return { worktree: worktreePath, repo: git.repoAt(worktreePath, mission.repo.git_dir), paths, mission, state };
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
    protected_snapshot: null,
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
// Two supervisors racing for the same stale lock is a known, documented limit (see the README).
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
