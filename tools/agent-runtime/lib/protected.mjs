import fs from 'node:fs';
import path from 'node:path';
import { sha256File } from './files.mjs';

// Project configuration the next headless sessions would load: permissions, hooks, MCP servers. It is
// read from disk, committed or not, ignored or not, because that is what the next session loads.
export const PROTECTED_CONFIG = Object.freeze(['.claude/settings.json', '.claude/settings.local.json', '.mcp.json', '.codex/config.toml']);

function digest(file) {
  if (!fs.existsSync(file)) return null;
  return fs.statSync(file).isFile() ? sha256File(file) : 'not-a-file';
}

export function protectedSnapshot(worktree) {
  return Object.fromEntries(PROTECTED_CONFIG.map((rel) => [rel, digest(path.join(worktree, rel))]));
}

// Protected files whose bytes differ from the snapshot the Founder last accepted (at mission start or
// in a resolution). Without a snapshot, every protected file that exists counts as changed.
export function protectedDrift(worktree, snapshot) {
  const now = protectedSnapshot(worktree);
  return PROTECTED_CONFIG.filter((rel) => (snapshot?.[rel] ?? null) !== now[rel]);
}
