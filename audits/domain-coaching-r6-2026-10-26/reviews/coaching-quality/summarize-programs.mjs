// Read-only compact summary of each generated program in the R6 first evaluation.
// Written by the independent coaching-quality judge. It never imports or runs the runtime.
// Usage: node summarize-programs.mjs [caseId ...] [--json out.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const ev = JSON.parse(fs.readFileSync(path.join(root, 'CoachingCore/r6/holdout/FIRST_EVALUATION.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json'), 'utf8'));
const args = process.argv.slice(2);
const jIdx = args.indexOf('--json');
const jsonOut = jIdx >= 0 ? args[jIdx + 1] : null;
const want = args.filter((a, i) => !a.startsWith('--') && (jIdx < 0 || i !== jIdx + 1));

const live = s => s.status !== 'SKIPPED';
function summarize(p) {
  const weeks = p.weeks.map(w => {
    const runs = w.sessions.filter(s => s.sport === 'RUN' && live(s));
    const req = runs.filter(s => !s.optional);
    const long = req.filter(s => s.role === 'LONG').map(s => s.prescription.durationMinutes);
    const q = req.filter(s => s.role === 'QUALITY').map(s => { const k = s.prescription.work; return `${s.prescription.family}:${k ? k.repetitions + 'x' + k.workMinutes : '?'}`; });
    const str = w.sessions.filter(s => s.sport === 'STRENGTH' && live(s) && !/REST/.test(s.role));
    const strSets = str.reduce((a, s) => a + (s.prescription.exercises || []).reduce((b, x) => b + x.sets, 0), 0);
    const lowerMain = str.flatMap(s => (s.prescription.exercises || []).filter(x => x.region === 'LOWER' && x.role === 'MAIN').map(x => `d${s.day}:${x.id}`));
    return { i: w.index, ph: w.phase, run: req.reduce((a, s) => a + (s.prescription.durationMinutes || 0), 0), runs: req.length, long: long.join('/') || '-', q: q.join(',') || '-', race: req.filter(s => s.role === 'RACE').map(s => `d${s.day}:${s.prescription.durationMinutes}`).join('') || '', str: str.length, strSets, lowerMain: [...new Set(lowerMain)].join(' ') };
  });
  return weeks;
}

const out = {};
for (const row of ev.rows) {
  if (want.length && !want.includes(row.caseId)) continue;
  const p = row.output?.generation?.program;
  if (!p) continue;
  const c = corpus.cases.find(x => x.caseId === row.caseId);
  const ws = summarize(p);
  out[row.caseId] = ws;
  const sch = c.intake.schedule;
  console.log(`== ${row.caseId} ${c.family} runDays=${JSON.stringify(sch.runDays)} strDays=${JSON.stringify(sch.strengthDays)} long=${sch.longRunDay ?? '-'} goals=${JSON.stringify(c.intake.athlete.goals)} event=${JSON.stringify(c.intake.athlete.event || null)}`);
  console.log('   ' + ws.map(w => `W${w.i}${w.ph[0]}${w.ph[1]} ${w.run}/${w.runs}r L${w.long} Q[${w.q}]${w.race ? ' RACE' + w.race : ''} S${w.str}:${w.strSets}`).join('\n   '));
}
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(out, null, 2) + '\n');
