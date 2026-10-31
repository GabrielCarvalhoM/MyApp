import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runSync } from './proc.mjs';

// Sessions can write this repository's config and hooks. Every Git command the supervisor runs
// therefore switches off the config-driven ways to execute code on a local command (fsmonitor and
// hooks: the hooks path below never exists), and remote checks run outside any repository (lsRemote),
// where only the Founder's own system and global config take part.
const NO_HOOKS = fileURLToPath(new URL('../.no-hooks', import.meta.url)).split(path.sep).join('/');
const HARDENING = ['-c', 'core.fsmonitor=false', '-c', `core.hooksPath=${NO_HOOKS}`, '-c', 'protocol.ext.allow=never'];
// Never prompt for credentials (a prompt would hang a headless run) and never take the optional index
// lock, so a status check cannot collide with a session's own Git commands.
const GIT_ENV = { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' };
delete GIT_ENV.GIT_DIR;
delete GIT_ENV.GIT_WORK_TREE;

export const COMMIT_ID = /^[0-9a-f]{40}$/;
export const SAFE_BRANCH = /^(?!.*\.\.)(?!.*\/\/)(?!.*\.lock(?:\/|$))(?!.*@\{)[A-Za-z0-9][A-Za-z0-9._/-]*[A-Za-z0-9_]$/;

export class GitError extends Error {}

// `gitDir` pins the repository explicitly, so a worktree whose `.git` file was rewritten cannot redirect it.
export function git(cwd, args, { allowFail = false, timeoutMs = 120_000, gitDir = null } = {}) {
  const location = gitDir ? [`--git-dir=${gitDir}`, `--work-tree=${cwd}`] : [];
  const result = runSync(['git', ...HARDENING, ...location, ...args], { cwd, env: GIT_ENV, timeoutMs });
  const ok = result.status === 0 && !result.error;
  if (!ok && !allowFail) {
    const detail = (result.stderr || result.stdout || result.error?.message || '').trim().slice(0, 500);
    throw new GitError(`git ${args.join(' ')} failed (${result.status ?? result.error?.code}): ${detail}`);
  }
  return { ok, status: result.status, stdout: result.stdout, stderr: result.stderr.trim() };
}

const text = (cwd, args, options) => git(cwd, args, options).stdout.trim();

export const head = (cwd, options) => text(cwd, ['rev-parse', 'HEAD'], options);
export const toplevel = (cwd) => text(cwd, ['rev-parse', '--show-toplevel']);
export const commonDir = (cwd) => path.resolve(text(cwd, ['rev-parse', '--path-format=absolute', '--git-common-dir']));
export const gitDirOf = (cwd) => path.resolve(text(cwd, ['rev-parse', '--path-format=absolute', '--git-dir']));
export const mainRootOf = (common) => (path.basename(common) === '.git' ? path.dirname(common) : common);
export const mainRoot = (cwd) => mainRootOf(commonDir(cwd));

export function branch(cwd) {
  const result = git(cwd, ['symbolic-ref', '--quiet', '--short', 'HEAD'], { allowFail: true });
  return result.ok ? result.stdout.trim() : null;
}

export function resolveCommit(cwd, rev) {
  const result = git(cwd, ['rev-parse', '--verify', '--quiet', '--end-of-options', `${rev}^{commit}`], { allowFail: true });
  return result.ok ? result.stdout.trim() : null;
}

export function isAncestor(cwd, ancestor, descendant) {
  const result = git(cwd, ['merge-base', '--is-ancestor', ancestor, descendant], { allowFail: true });
  if (result.status === 0) return true;
  if (result.status === 1) return false;
  throw new GitError(`cannot compare ${ancestor} and ${descendant}: ${result.stderr}`);
}

// Every path with an uncommitted change, untracked files included; ignored files are not changes.
export function dirtyPaths(cwd, options) {
  const raw = git(cwd, ['status', '--porcelain=v1', '-z', '--untracked-files=all'], options).stdout;
  const entries = raw.split('\0');
  const paths = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (!entry) continue;
    paths.push(entry.slice(3));
    if (entry[0] === 'R' || entry[0] === 'C') index += 1; // skip the source path of a rename or copy
  }
  return paths;
}

// Untracked files that the ignore rules hide from `dirtyPaths` (dependencies, caches, runtime state).
export function ignoredFiles(cwd, options) {
  return git(cwd, ['ls-files', '--others', '--ignored', '--exclude-standard', '-z'], options).stdout.split('\0').filter(Boolean);
}

export function changedFiles(cwd, from, to) {
  return git(cwd, ['diff', '--name-only', '-z', '--no-renames', from, to]).stdout.split('\0').filter(Boolean);
}

export function existsAt(cwd, rev, relPath) {
  const clean = relPath.replace(/\/+$/, '');
  return git(cwd, ['cat-file', '-e', `${rev}:${clean}`], { allowFail: true }).ok;
}

export const trackedAtHead = (cwd, relPath) => existsAt(cwd, 'HEAD', relPath);

export function isIgnored(cwd, relPath) {
  const result = git(cwd, ['check-ignore', '-q', '--no-index', '--', relPath], { allowFail: true });
  if (result.status === 0) return true;
  if (result.status === 1) return false;
  throw new GitError(`git check-ignore ${relPath} failed: ${result.stderr}`);
}

export function worktreeList(cwd) {
  const blocks = git(cwd, ['worktree', 'list', '--porcelain']).stdout.split(/\r?\n\r?\n/);
  return blocks
    .map((block) => {
      const fields = Object.fromEntries(
        block.split(/\r?\n/).filter(Boolean).map((line) => {
          const space = line.indexOf(' ');
          return space === -1 ? [line, true] : [line.slice(0, space), line.slice(space + 1)];
        }),
      );
      if (!fields.worktree) return null;
      return {
        path: path.resolve(fields.worktree),
        head: fields.HEAD ?? null,
        branch: typeof fields.branch === 'string' ? fields.branch.replace(/^refs\/heads\//, '') : null,
      };
    })
    .filter(Boolean);
}

export function branchExists(cwd, name) {
  return git(cwd, ['show-ref', '--verify', '--quiet', `refs/heads/${name}`], { allowFail: true }).ok;
}

export function addWorktree(cwd, worktreePath, branchName, base) {
  if (!SAFE_BRANCH.test(branchName)) throw new GitError(`unsafe branch name ${JSON.stringify(branchName)}`);
  const args = base
    ? ['worktree', 'add', '-b', branchName, '--', worktreePath, base]
    : ['worktree', 'add', '--', worktreePath, branchName];
  git(cwd, args);
}

// Read once, when the Founder starts a mission and before any session exists; later checks use this URL.
export function remoteUrl(cwd, name) {
  const result = git(cwd, ['remote', 'get-url', '--', name], { allowFail: true });
  return result.ok ? result.stdout.trim() : null;
}

// The remote branch tip, read from a neutral directory: no repository-level config (remotes, URL
// rewrites, upload-pack, credential helpers a session might have added) can take part.
export function lsRemote(url, branchName) {
  if (!SAFE_BRANCH.test(branchName)) return { ok: false, sha: null, error: `unsafe branch name ${JSON.stringify(branchName)}` };
  const neutral = os.tmpdir();
  const env = { ...GIT_ENV, GIT_CEILING_DIRECTORIES: path.dirname(neutral) };
  const result = runSync(['git', ...HARDENING, 'ls-remote', '--end-of-options', url, `refs/heads/${branchName}`], { cwd: neutral, env, timeoutMs: 60_000 });
  if (result.status !== 0 || result.error) {
    return { ok: false, sha: null, error: (result.stderr || result.error?.message || `exit ${result.status}`).trim().slice(0, 300) };
  }
  const sha = result.stdout.trim().split(/\s+/)[0] || null;
  if (sha && !COMMIT_ID.test(sha)) return { ok: false, sha: null, error: 'unexpected ls-remote output' };
  return { ok: true, sha, error: null };
}

export function commitAll(cwd, message, options) {
  git(cwd, ['add', '-A'], options);
  git(cwd, ['commit', '--quiet', '-m', message], options);
  return head(cwd, options);
}

export const parentOf = (cwd, rev, options) => text(cwd, ['rev-parse', `${rev}^`], options);
