import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runSync } from './proc.mjs';

// Sessions can write this repository's config, attributes, hooks and even a worktree's `.git` file, so
// every Git command the supervisor runs:
// - reads no attributes (no filter drivers, no line-ending conversion: bytes exactly as written);
// - switches off fsmonitor, hooks (they point at an empty directory of this process), submodule
//   recursion and automatic gc/maintenance, and commits under the Founder's own signing policy;
// - addresses a repository through the git dir pinned when it was created (repository handles below);
// - reaches a remote only from that private directory, outside any repository (lsRemote).
const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
const BASE_ENV = { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' };
delete BASE_ENV.GIT_DIR;
delete BASE_ENV.GIT_WORK_TREE;

export const COMMIT_ID = /^[0-9a-f]{40}$/;
export const SAFE_BRANCH = /^(?!.*\.\.)(?!.*\/\/)(?!.*\.lock(?:\/|$))(?!.*@\{)[A-Za-z0-9][A-Za-z0-9._/-]*[A-Za-z0-9_]$/;

export class GitError extends Error {}

let ownDir = null;
// A fresh directory that only this process knows: never inside a checkout, removed at exit.
function privateDir() {
  if (!ownDir) {
    ownDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-runtime-'));
    process.once('exit', () => fs.rmSync(ownDir, { recursive: true, force: true }));
  }
  return ownDir;
}

const outsideAnyRepository = () => ({ cwd: privateDir(), env: { ...BASE_ENV, GIT_CEILING_DIRECTORIES: path.dirname(privateDir()) } });
// Where every supervisor Git command looks for hooks: a path inside the private directory, never created.
export const hooksDirectory = () => path.join(privateDir(), 'no-hooks');
const hooksFlag = () => ['-c', `core.hooksPath=${hooksDirectory().split(path.sep).join('/')}`];

const localHardening = () => [
  `--attr-source=${EMPTY_TREE}`,
  '-c', 'core.autocrlf=false',
  '-c', 'core.fsmonitor=false',
  ...hooksFlag(),
  '-c', 'protocol.ext.allow=never',
  '-c', 'submodule.recurse=false',
  '-c', 'gc.auto=0',
  '-c', 'maintenance.auto=false',
];

let signing = null;
// The supervisor's commits follow the Founder's own signing policy, read from the Founder's global config,
// whatever a session wrote into the repository's config: unsigned when the Founder does not sign; when the
// Founder signs, the format, every signing program, the key command and the key come from that config too.
// This enforces the Founder's policy against repository overrides; it never turns off a signing the
// Founder asked for.
function signingPolicy() {
  if (signing) return signing;
  const { cwd, env } = outsideAnyRepository();
  const globalValue = (key) => {
    const result = runSync(['git', 'config', '--global', '--get', key], { cwd, env, timeoutMs: 30_000 });
    return result.status === 0 ? result.stdout.trim() : null;
  };
  const signs = /^(true|yes|on|1)$/i.test(globalValue('commit.gpgsign') ?? '');
  signing = ['-c', `commit.gpgsign=${signs}`];
  if (signs) {
    const settings = [['gpg.format', 'openpgp'], ['gpg.program', 'gpg'], ['gpg.ssh.program', 'ssh-keygen'], ['gpg.x509.program', 'gpgsm'], ['gpg.ssh.defaultKeyCommand', ''], ['user.signingKey', '']];
    for (const [key, fallback] of settings) signing.push('-c', `${key}=${globalValue(key) ?? fallback}`);
  }
  return signing;
}

// A repository as the supervisor addresses it: a work tree, and its git dir once pinned.
export const repoAt = (worktree, gitDir = null) => ({ cwd: worktree, gitDir });

export function git(target, args, { allowFail = false, timeoutMs = 120_000, extra = [] } = {}) {
  const { cwd, gitDir } = typeof target === 'string' ? { cwd: target, gitDir: null } : target;
  const location = gitDir ? [`--git-dir=${gitDir}`, `--work-tree=${cwd}`] : [];
  const result = runSync(['git', ...localHardening(), ...extra, ...location, ...args], { cwd, env: BASE_ENV, timeoutMs });
  const ok = result.status === 0 && !result.error;
  if (!ok && !allowFail) {
    const detail = (result.stderr || result.stdout || result.error?.message || '').trim().slice(0, 500);
    throw new GitError(`git ${args.join(' ')} failed (${result.status ?? result.error?.code}): ${detail}`);
  }
  return { ok, status: result.status, stdout: result.stdout, stderr: result.stderr.trim() };
}

const text = (target, args) => git(target, args).stdout.trim();

export const head = (target) => text(target, ['rev-parse', 'HEAD']);
export const toplevel = (target) => text(target, ['rev-parse', '--show-toplevel']);
export const commonDir = (target) => path.resolve(text(target, ['rev-parse', '--path-format=absolute', '--git-common-dir']));
export const gitDirOf = (target) => path.resolve(text(target, ['rev-parse', '--path-format=absolute', '--git-dir']));
export const mainRootOf = (common) => (path.basename(common) === '.git' ? path.dirname(common) : common);
export const mainRoot = (target) => mainRootOf(commonDir(target));

export function branch(target) {
  const result = git(target, ['symbolic-ref', '--quiet', '--short', 'HEAD'], { allowFail: true });
  return result.ok ? result.stdout.trim() : null;
}

export function resolveCommit(target, rev) {
  const result = git(target, ['rev-parse', '--verify', '--quiet', '--end-of-options', `${rev}^{commit}`], { allowFail: true });
  return result.ok ? result.stdout.trim() : null;
}

export function isAncestor(target, ancestor, descendant) {
  const result = git(target, ['merge-base', '--is-ancestor', ancestor, descendant], { allowFail: true });
  if (result.status === 0) return true;
  if (result.status === 1) return false;
  throw new GitError(`cannot compare ${ancestor} and ${descendant}: ${result.stderr}`);
}

// Every path with an uncommitted change, untracked files included; ignored files are not changes.
export function dirtyPaths(target) {
  const raw = git(target, ['status', '--porcelain=v1', '-z', '--untracked-files=all']).stdout;
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
export function ignoredFiles(target) {
  return git(target, ['ls-files', '--others', '--ignored', '--exclude-standard', '-z']).stdout.split('\0').filter(Boolean);
}

export function changedFiles(target, from, to) {
  return git(target, ['diff', '--name-only', '-z', '--no-renames', '--no-ext-diff', '--no-textconv', from, to]).stdout.split('\0').filter(Boolean);
}

export function existsAt(target, rev, relPath) {
  const clean = relPath.replace(/\/+$/, '');
  return git(target, ['cat-file', '-e', `${rev}:${clean}`], { allowFail: true }).ok;
}

export const trackedAtHead = (target, relPath) => existsAt(target, 'HEAD', relPath);

export function isIgnored(target, relPath) {
  const result = git(target, ['check-ignore', '-q', '--no-index', '--', relPath], { allowFail: true });
  if (result.status === 0) return true;
  if (result.status === 1) return false;
  throw new GitError(`git check-ignore ${relPath} failed: ${result.stderr}`);
}

export function worktreeList(target) {
  const blocks = git(target, ['worktree', 'list', '--porcelain']).stdout.split(/\r?\n\r?\n/);
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

export function branchExists(target, name) {
  return git(target, ['show-ref', '--verify', '--quiet', `refs/heads/${name}`], { allowFail: true }).ok;
}

export function addWorktree(target, worktreePath, branchName, base) {
  if (!SAFE_BRANCH.test(branchName)) throw new GitError(`unsafe branch name ${JSON.stringify(branchName)}`);
  const args = base
    ? ['worktree', 'add', '-b', branchName, '--', worktreePath, base]
    : ['worktree', 'add', '--', worktreePath, branchName];
  git(target, args);
}

// Read once, when the Founder starts a mission and before any session exists; later checks use this URL.
export function remoteUrl(target, name) {
  const result = git(target, ['remote', 'get-url', '--', name], { allowFail: true });
  return result.ok ? result.stdout.trim() : null;
}

// The remote branch tip, read from this process's private directory with no repository around it:
// no repository-level setting (remotes, URL rewrites, upload-pack, SSH command, credential helper)
// a session might have written can take part.
export function lsRemote(url, branchName) {
  if (!SAFE_BRANCH.test(branchName)) return { ok: false, sha: null, error: `unsafe branch name ${JSON.stringify(branchName)}` };
  const { cwd, env } = outsideAnyRepository();
  const network = ['-c', 'protocol.ext.allow=never', ...hooksFlag()];
  const result = runSync(['git', ...network, 'ls-remote', '--end-of-options', url, `refs/heads/${branchName}`], { cwd, env, timeoutMs: 60_000 });
  if (result.status !== 0 || result.error) {
    return { ok: false, sha: null, error: (result.stderr || result.error?.message || `exit ${result.status}`).trim().slice(0, 300) };
  }
  const sha = result.stdout.trim().split(/\s+/)[0] || null;
  if (sha && !COMMIT_ID.test(sha)) return { ok: false, sha: null, error: 'unexpected ls-remote output' };
  return { ok: true, sha, error: null };
}

export function commitAll(target, message) {
  git(target, ['add', '-A']);
  git(target, ['commit', '--quiet', '-m', message], { extra: signingPolicy() });
  return head(target);
}

export const parentOf = (target, rev) => text(target, ['rev-parse', `${rev}^`]);
