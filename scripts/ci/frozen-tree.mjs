// Stronger mission-specific guard; never rewrites the frozen declaration or verifier.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const frozenCommit = '7d2da3603e224124696a2290766ec448080f3264';
const root = path.resolve(import.meta.dirname, '../..');

export function verifyFrozenTree(repo = root, commit = frozenCommit) {
  const git = (...args) => execFileSync('git', args, { cwd: repo, maxBuffer: 64 * 1024 * 1024 });
  // ls-tree includes the blob hash and file mode, so additions/deletions/mode changes fail too.
  const expected = git('ls-tree', '-r', commit, '--', 'CoachingCore/');
  if (!expected.length || !expected.equals(git('ls-tree', '-r', 'HEAD', '--', 'CoachingCore/'))) {
    throw new Error('CoachingCore committed tree differs from the authorized R7ARA freeze.');
  }
  if (git('diff', '--cached', '--name-only', '-z', commit, '--', 'CoachingCore/').length) {
    throw new Error('CoachingCore staged index differs from the authorized R7ARA freeze.');
  }
  // Check actual checkout bytes, including unstaged edits; Git clean filters cannot hide drift.
  const entries = git('ls-tree', '-r', '-z', commit, '--', 'CoachingCore/')
    .toString().split('\0').filter(Boolean);
  for (const entry of entries) {
    const [metadata, file] = entry.split('\t');
    const expectedBlob = metadata.split(' ')[2];
    if (!fs.existsSync(path.join(repo, file))
      || git('hash-object', '--no-filters', '--', file).toString().trim() !== expectedBlob) {
      throw new Error(`Frozen checkout bytes changed: ${file}`);
    }
  }
  if (git('ls-files', '--others', '--exclude-standard', '-z', '--', 'CoachingCore/').length) {
    throw new Error('Untracked non-ignored CoachingCore files are outside this frozen mission.');
  }
  return entries.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Frozen CoachingCore: ${verifyFrozenTree()} files byte-identical to ${frozenCommit}`);
}
