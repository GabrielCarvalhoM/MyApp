// Field-level diff of a device J5 reply (the "j5-step<N>-reply.json" attachment of EquivalenceTests, written only when a step is not IDENTICAL)
// against the oracle's full answer. Lists every differing leaf, marks those inside a runForecast block, and the relative size of numeric changes.
// Run: node audits/v1-aif-p0-jsc-2026-11-17/lab/diff-answer.mjs <step> <path to j5-step<step>-reply.json>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const FIX = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'ios', 'Tests', 'P0HostTests', 'Fixtures');
const [step, file] = process.argv.slice(2);
const oracle = JSON.parse(fs.readFileSync(path.join(FIX, 'j5-answers.json'), 'utf8'))[Number(step)];
const device = JSON.parse(fs.readFileSync(file, 'utf8')).answer;
const out = [];
(function d(a, b, p) {
  if (a && b && typeof a === 'object' && typeof b === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) d(a[k], b[k], p + '/' + k); return; }
  if (a !== b) out.push({ path: p, inForecast: p.includes('/runForecast/'), oracle: a, device: b, relative: typeof a === 'number' && typeof b === 'number' && a !== 0 ? Math.abs(b - a) / Math.abs(a) : null });
})(oracle, device, '');
console.log(JSON.stringify({ step: Number(step), differingLeaves: out.length, outsideForecast: out.filter(x => !x.inForecast).length, leaves: out }, null, 1));
process.exit(out.some(x => !x.inForecast) ? 1 : 0);
