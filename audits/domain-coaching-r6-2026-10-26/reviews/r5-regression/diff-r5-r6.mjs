// Read-only: compare R5 first-raw program weeks with R6 replay program weeks per case (generation + proposals).
import {readFileSync} from 'node:fs';
const root = 'C:/Users/carva/Desktop/myApp/MyApp/';
const r5 = JSON.parse(readFileSync(root + 'CoachingCore/r5/holdout/FIRST_EVALUATION.json', 'utf8'));
const r6 = JSON.parse(readFileSync(root + 'CoachingCore/r6/R5_HOLDOUT_REPLAY_R6.json', 'utf8'));
const key = s => {
  const p = s.prescription || {};
  const ex = (p.exercises || []).map(e => `${e.id}${e.sets}x${e.reps}@${e.load?.value ?? '-'}r${e.rir}`).join(',');
  return `d${s.day}:${s.anchorId || s.role}:${p.family}:${p.durationMinutes}${p.work ? ':' + p.work.repetitions + 'x' + p.work.workMinutes : ''}${ex ? ':' + ex : ''}${s.optional ? ':OPT' : ''}`;
};
const weeks = p => (p?.weeks || []).map(w => `${w.phase}|` + w.sessions.map(key).join(' '));
for (const row of r6.rows) {
  const old = r5.rows.find(r => r.caseId === row.caseId);
  const a = weeks(old.output?.generation?.program), b = weeks(row.r6Output?.generation?.program);
  const diffs = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) diffs.push(i);
  console.log(row.caseId, 'R5gen', old.output?.generation?.status, 'R6gen', row.r6Output?.generation?.status, 'weeks', a.length, b.length, 'diffWeeks', JSON.stringify(diffs.slice(0, 20)));
  if (process.argv.includes('-v')) for (const i of diffs.slice(0, 3)) console.log('   R5', a[i], '\n   R6', b[i]);
  const so = old.output?.steps || [], sn = row.r6Output?.steps || [];
  for (let i = 0; i < Math.max(so.length, sn.length); i++) console.log('   step', i, 'R5', so[i]?.result?.status, so[i]?.result?.action, '| R6', sn[i]?.result?.status, sn[i]?.result?.action);
}
