// SSCTR R7-B.1 review probe s06 (read-only): the text and options of the questions the delta can ask instead of applying a substitution
// (QE-R7B-R2-04: every candidate already in a session with the replaced exercise; QE-R7B-R2-03: no lower option after equipment loss).
// Usage: SSCTR_ROOT=<tree root> node s06-r204-ask-text.mjs
import {pathToFileURL} from 'node:url';
const ROOT = pathToFileURL((process.env.SSCTR_ROOT ?? '').replace(/[\/]?$/, '/'));
const H = await import(new URL('CoachingCore/r7/b/fixtures/helpers.mjs', ROOT).href);
const {reviewed, weekly, review, evaluateProgram, opts, FULL} = H;
const sub = (t, w, id, reason) => evaluateProgram(t.p, {...review(t.p, w, {day: 1, hour: '06:00:00', kind: 'EXERCISE_SUBSTITUTION', substitution: {exerciseId: id, reason, ...(reason === 'SKILL_MISMATCH' ? {} : {nonclinicalConfirmed: true})}}), actualLedger: t.ledger}, opts);
const show = (label, r) => console.log(`${label}: ${r.status}\n  reason: ${r.reason}\n  missing: ${JSON.stringify(r.missingInputs ?? null)}\n  disclosures: ${JSON.stringify((r.disclosures ?? []).map(d => ({id: d.id, options: d.options})))}`);
for (const [id, o] of [['front-plank', {id: 's06-novice', equipment: FULL, goals: {run: 'PERFORMANCE', strength: 'STRENGTH'}, rotation: 'FIXED', weeks: 12, schedule: {strengthDays: [0, 2, 4]}, strengthExperience: 'NOVICE'}], ['front-plank', {id: 's06-none', equipment: ['DUMBBELLS', 'BENCH'], goals: {run: 'PERFORMANCE', strength: 'GENERAL'}, rotation: 'FIXED', weeks: 12, schedule: {strengthDays: [0, 2, 4]}, strengthExperience: 'NONE', recent: {runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 60, strengthDaysPerWeek: 0}}]]) {
  const t = reviewed(o, 3);
  show(`${o.id} ${id} SKILL_MISMATCH`, sub(t, 3, id, 'SKILL_MISMATCH'));
}
// R2-03 question after equipment loss (db-row -> band-row, then bands lost)
const t = reviewed({id: 's06-full', equipment: FULL, goals: {run: 'PERFORMANCE', strength: 'GENERAL'}, rotation: 'FIXED', weeks: 12, schedule: {strengthDays: [0, 4]}}, 3);
const s = sub(t, 3, 'db-row', 'SKILL_MISMATCH'); console.log(`db-row SKILL_MISMATCH -> ${s.substitutions?.[0]?.selected}`);
t.ledger = s.actualLedger ?? t.ledger; t.p = s.proposal; weekly(t, 3);
const r = evaluateProgram(t.p, {...review(t.p, 4, {day: 0, hour: '06:00:00', kind: 'EQUIPMENT_CHANGE', changes: {equipment: FULL.filter(q => q !== 'BANDS')}}), actualLedger: t.ledger}, opts);
show('equipment loss of BANDS after db-row -> band-row', r);
console.log(`  program unchanged while asked: sessions ahead still prescribe band-row: ${t.p.weeks[4].sessions.some(z => z.prescription?.exercises?.some(e => e.id === 'band-row'))}; proposal: ${!!r.proposal}`);
