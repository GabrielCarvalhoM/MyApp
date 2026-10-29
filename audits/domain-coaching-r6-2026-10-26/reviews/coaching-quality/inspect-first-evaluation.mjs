// Read-only inspector for the R6 first evaluation (FIRST_EVALUATION.json).
// Written by the independent coaching-quality judge. It never imports or runs the runtime.
// Usage: node inspect-first-evaluation.mjs <caseId|ALL> [--steps] [--full]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const evalPath = path.join(root, 'CoachingCore/r6/holdout/FIRST_EVALUATION.json');
const ev = JSON.parse(fs.readFileSync(evalPath, 'utf8'));

const want = process.argv[2] || 'ALL';
const showSteps = process.argv.includes('--steps');
const full = process.argv.includes('--full');

function exStr(x) {
  const l = x.load || {};
  let load = l.mode === 'KNOWN' ? `${l.value}${l.convention === 'PER_HAND' ? 'ph' : ''}` : l.mode === 'ESTABLISH' ? 'EST' : l.mode === 'BODYWEIGHT' ? 'BW' : (l.mode || '?');
  return `${x.id}${x.role === 'ACCESSORY' ? '(a)' : ''} ${x.sets}x${x.reps}@${load} r${x.rir}`;
}
function sessStr(s) {
  const p = s.prescription || {};
  const opt = s.optional ? '?' : '';
  if (s.sport === 'RUN') {
    let w = '';
    if (p.work) w = ` [${p.work.repetitions}x${p.work.workMinutes}/${p.work.recoveryMinutes}]`;
    if (p.blocks) w += ` blocks:${JSON.stringify(p.blocks).slice(0, 80)}`;
    const conv = s.converted ? ` conv:${typeof s.converted === 'object' ? (s.converted.from || JSON.stringify(s.converted).slice(0, 40)) : s.converted}` : '';
    return `d${s.day}${s.turn ? s.turn[0] : ''} R:${s.role}${opt} ${p.durationMinutes ?? '-'}m${p.family && p.family !== s.role ? '(' + p.family + ')' : ''}${w}${conv}`;
  }
  if (s.sport === 'STRENGTH') {
    const exs = (p.exercises || []).map(exStr).join('; ');
    return `d${s.day}${s.turn ? s.turn[0] : ''} S:${s.role}${opt} ${p.durationMinutes ?? '-'}m {${exs}}`;
  }
  return `d${s.day} ${s.sport}:${s.role}`;
}
export function weekLine(w) {
  const runs = (w.sessions || []).filter(s => s.sport === 'RUN' && !s.optional);
  const runMin = runs.reduce((a, s) => a + (s.prescription?.durationMinutes || 0), 0);
  const optMin = (w.sessions || []).filter(s => s.sport === 'RUN' && s.optional).reduce((a, s) => a + (s.prescription?.durationMinutes || 0), 0);
  const str = (w.sessions || []).filter(s => s.sport === 'STRENGTH').length;
  return `  W${w.index} ${w.startDate} ${w.phase}${w.status && w.status !== 'CONDITIONAL' ? ' [' + w.status + ']' : ''} run=${runMin}m${optMin ? '+' + optMin + 'opt' : ''} str=${str}\n` +
    (w.sessions || []).map(s => '      ' + sessStr(s)).join('\n');
}
export function programDump(p) {
  if (!p) return '  (no program)';
  const out = [];
  out.push(`  program weeks=${p.weeksCount} start=${p.startDate} phases=${JSON.stringify(p.phases?.phases)} est=${p.phases?.establishmentWeeks} race=${p.phases?.raceWeek}/${p.phases?.raceDay}`);
  out.push(`  cap.run=${JSON.stringify(p.capability?.run && { basis: p.capability.run.basis, wk: p.capability.run.weeklyMinutes, days: p.capability.run.daysPerWeek, longest: p.capability.run.longestMinutes, cls: p.capability.run.class, exp: p.capability.run.experience })}`);
  out.push(`  cap.str=${JSON.stringify(p.capability?.strength && { cls: p.capability.strength.class, exp: p.capability.strength.experience })}`);
  out.push(`  gaps=${JSON.stringify(p.gaps)}`);
  out.push(`  negotiation=${JSON.stringify(p.negotiation)?.slice(0, full ? 99999 : 1500)}`);
  for (const w of p.weeks || []) out.push(weekLine(w));
  return out.join('\n');
}

for (const row of ev.rows) {
  if (want !== 'ALL' && row.caseId !== want) continue;
  const g = row.output?.generation || {};
  console.log(`===== ${row.caseId} gen.status=${g.status} reason=${g.reason} scopeSatisfied=${g.requestedScopeSatisfied} error=${JSON.stringify(row.error)}`);
  console.log(`  missingInputs=${JSON.stringify(g.missingInputs)?.slice(0, 1500)}`);
  console.log(`  uncertainty=${JSON.stringify(g.uncertainty)?.slice(0, full ? 99999 : 1500)}`);
  if (g.question) console.log(`  question=${JSON.stringify(g.question).slice(0, 1500)}`);
  console.log(`  genNegotiation=${JSON.stringify(g.negotiation)?.slice(0, 1500)}`);
  console.log(programDump(g.program));
  if (showSteps) {
    for (const [i, st] of (row.output?.steps || []).entries()) {
      const o = st.output || st.result || st;
      console.log(`  --- step ${i + 1}: keys=${Object.keys(st).join(',')}`);
    }
  }
}
