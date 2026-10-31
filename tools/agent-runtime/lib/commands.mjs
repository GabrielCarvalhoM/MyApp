import path from 'node:path';

// Commands that the supervisor itself runs (local jobs, Codex acceptance checks, fallback commands)
// execute outside Claude Code's per-command permission checks. They are therefore limited to running
// repository scripts and tests through node or npm, as argv without a shell. This bounds mistakes in a
// declared job; it is not a sandbox (a repository script can still do anything its author wrote).
const ALLOWED_PROGRAMS = ['node', 'npm'];
const NPM_SUBCOMMANDS = ['test', 't', 'run', 'run-script', 'ci'];
const NODE_INLINE_CODE = ['-e', '--eval', '-p', '--print'];

const pointsOutside = (arg) =>
  path.isAbsolute(arg) || /^[a-zA-Z]:/.test(arg) || arg.split(/[\\/=]/).includes('..');
const loadsRemoteOrInlineCode = (arg) => /(^|=)(data|https?|file):/i.test(arg) || /^--(eval|print)=/.test(arg);

export function commandPolicyError(argv) {
  if (!Array.isArray(argv) || argv.length === 0 || argv.some((part) => typeof part !== 'string' || part === '')) {
    return 'must be a non-empty array of non-empty strings (argv form, no shell)';
  }
  const [program, ...args] = argv;
  if (!ALLOWED_PROGRAMS.includes(program)) {
    return `program "${program}" is not allowed (allowed: ${ALLOWED_PROGRAMS.join(', ')}); supervised commands run repository scripts and tests only`;
  }
  if (program === 'node' && args.some((arg) => NODE_INLINE_CODE.includes(arg) || loadsRemoteOrInlineCode(arg))) {
    return 'inline or remote code is not allowed; run a repository script';
  }
  if (program === 'npm' && !NPM_SUBCOMMANDS.includes(args[0])) {
    return `npm subcommand "${args[0] ?? ''}" is not allowed (allowed: ${NPM_SUBCOMMANDS.join(', ')})`;
  }
  const outside = args.find(pointsOutside);
  if (outside !== undefined) return `argument "${outside}" points outside the repository`;
  return null;
}
