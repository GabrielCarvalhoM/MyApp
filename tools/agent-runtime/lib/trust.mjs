import fs from 'node:fs';
import path from 'node:path';
import { readJson } from './files.mjs';
import { samePath, isInside } from './mission.mjs';

// Where the supervisor may run from: never from code a session of any supervised mission can change.
// Real paths, so that a junction or link into a worktree is seen for what it is. A path that does not
// exist (a job worktree not created yet) is compared as written.
function realPath(file) {
  try {
    return fs.realpathSync.native(file);
  } catch {
    return path.resolve(file);
  }
}

// The supervisor must not run code a session can change: not from a mission worktree, not from a Codex
// job worktree. Run it from the main checkout or another checkout no session works in.
export function untrustedRuntimeReason(runtimeRoot, mission) {
  const runtime = realPath(runtimeRoot);
  const worktree = realPath(mission.repo.worktree);
  if (samePath(runtime, worktree) || isInside(runtime, worktree)) {
    return `this copy of the runtime (${runtimeRoot}) is inside the worktree of mission ${mission.mission_id}, where sessions could change the code that supervises them; run it from the main checkout`;
  }
  const jobs = realPath(path.join(mission.repo.main_root, '.claude', 'worktrees'));
  const first = isInside(runtime, jobs) ? path.relative(jobs, runtime).split(path.sep)[0] : '';
  if (first.startsWith(`${mission.slug}--codex-`)) {
    return `this copy of the runtime (${runtimeRoot}) is inside a Codex job worktree of mission ${mission.mission_id}; run it from the main checkout`;
  }
  return null;
}

// Against every supervised mission of the repository: a session of mission B must not be able to
// change the code that supervises mission A either.
export function untrustedRuntimeForAnyMission(runtimeRoot, controlRootDir) {
  if (!fs.existsSync(controlRootDir)) return null;
  for (const entry of fs.readdirSync(controlRootDir, { withFileTypes: true })) {
    const record = path.join(controlRootDir, entry.name, 'mission.json');
    if (!entry.isDirectory() || !fs.existsSync(record)) continue;
    const reason = untrustedRuntimeReason(runtimeRoot, readJson(record));
    if (reason) return reason;
  }
  return null;
}
