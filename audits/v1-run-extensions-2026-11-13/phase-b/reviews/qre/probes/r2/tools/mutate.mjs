// QRE mutation runner. node mutate.mjs <copyDir> <outJson> <from> <to>
// Runs a green control first (the v1rfc tests), then each mutant of MUTANTS[from..to), restoring the original bytes (sha256-checked).
// A mutant is killed only by a test that passes on the control.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { MUTANTS } from './mutants.mjs';
const [copy, outFile, from = '0', to = String(MUTANTS.length)] = process.argv.slice(2);
const CC = path.join(copy, 'CoachingCore');
const sha = b => createHash('sha256').update(b).digest('hex');
const tests = fs.readdirSync(path.join(CC, 'test')).filter(f => /^v1rfc-.*\.test\.mjs$/.test(f)).map(f => 'test/' + f);
function run() {
  const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...tests], { cwd: CC, encoding: 'utf8', maxBuffer: 1 << 28, timeout: 600000 });
  const out = String(r.stdout ?? '');
  const failed = [...out.matchAll(/^not ok \d+ - (.*)$/gm)].map(m => m[1].replace(/\s+#.*$/, '').trim());
  const passed = [...out.matchAll(/^ok \d+ - (.*)$/gm)].map(m => m[1].replace(/\s+#.*$/, '').trim());
  return { failed, passed, total: failed.length + passed.length };
}
const control = run();
const result = { control: { total: control.total, failed: control.failed }, mutants: [] };
for (const [id, file, oldS, newS, what] of MUTANTS.slice(Number(from), Number(to))) {
  const f = path.join(CC, file), orig = fs.readFileSync(f), text = orig.toString('utf8'), count = text.split(oldS).length - 1;
  if (count !== 1) { result.mutants.push({ id, what, error: 'old string occurs ' + count + ' times' }); continue; }
  fs.writeFileSync(f, text.replace(oldS, () => newS));
  let r; try { r = run(); } finally { fs.writeFileSync(f, orig); }
  if (sha(fs.readFileSync(f)) !== sha(orig)) throw new Error('restore failed ' + file);
  const killers = r.failed.filter(n => !control.failed.includes(n));
  result.mutants.push({ id, file, what, killed: killers.length > 0, killers: killers.length, firstKillers: killers.slice(0, 3), total: r.total });
  fs.writeFileSync(outFile, JSON.stringify(result, null, 1));
}
fs.writeFileSync(outFile, JSON.stringify(result, null, 1));
console.log(JSON.stringify({ control: result.control, killed: result.mutants.filter(m => m.killed).length, of: result.mutants.length, survivors: result.mutants.filter(m => !m.killed).map(m => m.id + ' ' + (m.error ?? m.what)) }, null, 1));
