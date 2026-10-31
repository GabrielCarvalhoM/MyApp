import path from 'node:path';
import { runSync } from './proc.mjs';

// Never prompt for credentials (a prompt would hang a headless run) and never take the optional
// index lock, so a status check cannot collide with a session's own Git commands.
const GIT_ENV = { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' };

export class GitError extends Error {}

export function git(cwd, args, { allowFail = false, timeoutMs = 120_000 } = {}) {
  const result = runSync(['git', ...args], { cwd, env: GIT_ENV, timeoutMs });
  const ok = result.status === 0 && !result.error;
  if (!ok && !allowFail) {
    const detail = (result.stderr || result.stdout || result.error?.message || '').trim().slice(0, 500);
    throw new GitError(`git ${args.join(' ')} failed (${result.status ?? result.error?.code}): ${detail}`);
  }
  return { ok, status: result.status, stdout: result.stdout, stderr: result.stderr.trim() };
}

const text = (cwd, args) => git(cwd, args).stdout.trim();

export const head = (cwd) => text(cwd, ['rev-parse', 'HEAD']);

export function branch(cwd) {
  const result = git(cwd, ['symbolic-ref', '--quiet', '--short', 'HEAD'], { allowFail: true });
  return result.ok ? result.stdout.trim() : null;
}

export function mainRoot(cwd) {
  const common = text(cwd, ['rev-parse', '--path-format=absolute', '--git-common-dir']);
  return path.basename(common) === '.git' ? path.dirname(common) : text(cwd, ['rev-parse', '--show-toplevel']);
}

export const toplevel = (cwd) => text(cwd, ['rev-parse', '--show-toplevel']);

export function resolveCommit(cwd, rev) {
  const result = git(cwd, ['rev-parse', '--verify', '--quiet', `${rev}^{commit}`], { allowFail: true });
  return result.ok ? result.stdout.trim() : null;
}

export function isAncestor(cwd, ancestor, descendant) {
  const result = git(cwd, ['merge-base', '--is-ancestor', ancestor, descendant], { allowFail: true });
  if (result.status === 0) return true;
  if (result.status === 1) return false;
  throw new GitError(`cannot compare ${ancestor} and ${descendant}: ${result.stderr}`);
}

// Every path with an uncommitted change, untracked files included; ignored files are not changes.
export function dirtyPaths(cwd) {
  const raw = git(cwd, ['status', '--porcelain=v1', '-z', '--untracked-files=all']).stdout;
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

export function changedFiles(cwd, from, to) {
  return git(cwd, ['diff', '--name-only', '-z', '--no-renames', from, to]).stdout.split('\0').filter(Boolean);
}

export function existsAt(cwd, rev, relPath) {
  const clean = relPath.replace(/\/+$/, '');
  return git(cwd, ['cat-file', '-e', `${rev}:${clean}`], { allowFail: true }).ok;
}

export const trackedAtHead = (cwd, relPath) => existsAt(cwd, 'HEAD', relPath);

export function isIgnored(cwd, relPath) {
  const result = git(cwd, ['check-ignore', '-q', '--no-index', relPath], { allowFail: true });
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
  const args = base
    ? ['worktree', 'add', '-b', branchName, worktreePath, base]
    : ['worktree', 'add', worktreePath, branchName];
  git(cwd, args);
}

export function upstream(cwd, branchName) {
  const remote = git(cwd, ['config', '--get', `branch.${branchName}.remote`], { allowFail: true });
  const merge = git(cwd, ['config', '--get', `branch.${branchName}.merge`], { allowFail: true });
  if (!remote.ok || !merge.ok) return null;
  return { remote: remote.stdout.trim(), ref: merge.stdout.trim() };
}

export function fetchRef(cwd, remote, ref) {
  return git(cwd, ['fetch', '--quiet', remote, ref], { allowFail: true, timeoutMs: 60_000 });
}

export function remoteTrackingSha(cwd, remote, ref) {
  return resolveCommit(cwd, `refs/remotes/${remote}/${ref.replace(/^refs\/heads\//, '')}`);
}

export function lsRemote(cwd, remote, branchName) {
  const result = git(cwd, ['ls-remote', remote, `refs/heads/${branchName}`], { allowFail: true, timeoutMs: 60_000 });
  if (!result.ok) return { ok: false, sha: null, error: result.stderr || `exit ${result.status}` };
  return { ok: true, sha: result.stdout.trim().split(/\s+/)[0] || null, error: null };
}

export function commitAll(cwd, message) {
  git(cwd, ['add', '-A']);
  git(cwd, ['commit', '--quiet', '-m', message]);
  return head(cwd);
}

export const parentOf = (cwd, rev) => text(cwd, ['rev-parse', `${rev}^`]);
