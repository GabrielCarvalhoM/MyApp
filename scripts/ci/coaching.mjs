// Delivery adapter only. The existing mission verifier owns freeze semantics.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
export const freezeRecord = 'CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json';
export const freezeVerifier = 'CoachingCore/scripts/verify-r7ara.mjs';
const hasBase = base => !!base && !/^0+$/.test(base);
const git = (repo, ...args) => execFileSync('git', args, { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
const paths = bytes => bytes.toString('utf8').split('\0').filter(Boolean);

export function requiresCoaching(files) {
  return files.some(file => /^(CoachingCore\/|canon\/|product\/|reviews\/(provisional-sports-science|sports-domain-closure)\/|governance\/agents\/sports-science-reviewer\/|audits\/(domain-coaching-|domain-closure-|sports-domain-closure|sports-science-agent)|scripts\/ci\/|\.github\/workflows\/)/.test(file)
    || ['CURRENT_MISSION.md', 'MISSION_LEDGER.md', 'AGENTS.md', 'CLAUDE.md', '.gitattributes', '.gitignore', '.npmrc', 'package.json', 'package-lock.json', '.nvmrc', '.node-version'].includes(file));
}

export function requiresQuality(files) {
  return files.some(file => /\.(?:[cm]?js|json)$/.test(file) && !/^(audits\/|reviews\/|governance\/snapshots\/)/.test(file)
    || /^(\.github\/workflows\/|\.github\/dependabot\.yml$|\.gitleaks|\.npmrc$)/.test(file));
}

export function changedPaths(base, head, repo = root) {
  // Disable rename detection so moving a Core file out of its directory still triggers CI.
  // A new branch has no before SHA: inspect its complete tree conservatively.
  return hasBase(base)
    ? paths(git(repo, 'diff', '--no-renames', '--name-only', '-z', `${base}...${head}`, '--'))
    : paths(git(repo, 'ls-tree', '-r', '--name-only', '-z', head));
}

export function checkFreeze(base, repo = root) {
  // Preserve this candidate's declaration and verifier byte-for-byte when already in the base.
  // A successor mission must retain old records and explicitly update this adapter with evidence.
  for (const file of [freezeRecord, freezeVerifier]) {
    if (!hasBase(base)) continue;
    const existed = git(repo, 'ls-tree', '--name-only', base, '--', file).length > 0;
    if (existed && (!fs.existsSync(path.join(repo, file))
      || !git(repo, 'show', `${base}:${file}`).equals(fs.readFileSync(path.join(repo, file))))) {
      throw new Error(`Frozen candidate record/verifier changed: ${file}. Preserve it; a successor needs explicit mission evidence and CI review.`);
    }
  }
  if (!fs.existsSync(path.join(repo, freezeRecord))) {
    console.log('R7ARA freeze not present in this baseline; R7ARA verification is not applicable.');
    return;
  }
  execFileSync(process.execPath, [freezeVerifier], { cwd: repo, stdio: 'inherit' });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, base, head] = process.argv.slice(2);
  if (command === 'changes' && head) {
    const files = changedPaths(base, head);
    const outputs = `coaching=${requiresCoaching(files)}\nquality=${requiresQuality(files)}\n`;
    console.log(outputs.trim());
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, outputs);
  } else if (command === 'freeze') {
    checkFreeze(base);
  } else {
    throw new Error('Usage: node scripts/ci/coaching.mjs changes <base-or-empty> <head> | freeze <base-or-empty>');
  }
}
