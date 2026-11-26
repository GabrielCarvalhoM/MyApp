// Small, explicit process helpers. Commands are run with an argument vector (never through a shell).
import { spawnSync } from 'node:child_process';

export function run(cmd, args, { cwd, allowFail = false, input } = {}) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', input, maxBuffer: 64 * 1024 * 1024 });
  if (r.error) {
    if (r.error.code === 'ENOENT') throw new MissingDependency(cmd);
    throw r.error;
  }
  if (r.status !== 0 && !allowFail) {
    const msg = (r.stderr || r.stdout || '').trim().split('\n').slice(-5).join('\n');
    throw new Error(`${cmd} ${args.join(' ')} → exit ${r.status}\n${msg}`);
  }
  return { code: r.status, out: (r.stdout ?? '').trim(), err: (r.stderr ?? '').trim() };
}

export class MissingDependency extends Error {
  constructor(cmd) {
    super(`dependência ausente: \`${cmd}\` não está instalado ou não está no PATH`);
    this.dependency = cmd;
  }
}

export const git = (args, opts) => run('git', args, opts);

export function repoRoot(cwd = process.cwd()) {
  return git(['rev-parse', '--show-toplevel'], { cwd }).out;
}

export function refExists(ref, cwd) {
  return git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { cwd, allowFail: true }).code === 0;
}

// The newest foundation/base tag (v1-abc-*) that is an ancestor of `head`.
export function baseTagFor(head, cwd, glob = 'v1-abc-*') {
  const r = git(['tag', '--list', glob, '--merged', head, '--sort=-creatordate'], { cwd, allowFail: true });
  return r.code === 0 ? r.out.split('\n').filter(Boolean)[0] ?? null : null;
}

export function ghJson(args, opts) {
  const r = run('gh', args, opts);
  return r.out ? JSON.parse(r.out) : null;
}
