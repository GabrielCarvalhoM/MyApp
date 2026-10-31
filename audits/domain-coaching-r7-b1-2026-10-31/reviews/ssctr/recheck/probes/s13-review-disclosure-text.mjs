// SSCTR R7-B.1 recheck probe s13 (read-only): the text of the disclosure a weekly review returns when it keeps an event-week slot out (C5, review
// half of F12). The s04 cases: a substitution at the start of the last SPECIFIC week, its substitute missed there; FIXED and two-week rotation.
// Usage: SSCTR_ROOT=<tree root> node s13-review-disclosure-text.mjs
import {pathToFileURL} from 'node:url';
const ROOT = pathToFileURL((process.env.SSCTR_ROOT ?? '').replace(/[\/]?$/, '/'));
const H = await import(new URL('CoachingCore/r7/b/fixtures/helpers.mjs', ROOT).href);
const {reviewed, weekly, review, evaluateProgram, opts} = H;
const EV = {goals: {run: 'RACE', strength: 'GENERAL'}, event: {kind: '10K', date: '2027-01-24'}, weeks: 16, equipment: ['DUMBBELLS', 'BENCH', 'KETTLEBELL'], recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 70, strengthDaysPerWeek: 2}, schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 4]}};
for (const [name, rotation] of [['fixed', 'FIXED'], ['rot2w', 'EVERY_2_WEEKS']]) {
  const t0 = reviewed({...EV, id: 's13-' + name, rotation}, 0), sw = t0.p.phases.phases.indexOf('TAPER') - 1;
  const t = reviewed({...EV, id: 's13-' + name, rotation}, 0); for (let w = 0; w < sw; w++) weekly(t, w);
  for (const [id, reason] of [['db-split-squat', 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE'], ['goblet-squat', 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE']]) {
    const c = structuredClone(t), r = evaluateProgram(c.p, {...review(c.p, sw, {day: 0, hour: '06:00:00', kind: 'EXERCISE_SUBSTITUTION', substitution: {exerciseId: id, reason, nonclinicalConfirmed: true}}), actualLedger: c.ledger}, opts);
    if (r.status !== 'MODIFY') { console.log(name, id, r.status); continue; }
    const sel = r.substitutions[0].selected; c.ledger = r.actualLedger ?? c.ledger; c.p = r.proposal;
    const rv = weekly(c, sw, {keep: s => !(s.prescription?.exercises ?? []).some(e => e.id === sel)});
    const d = (rv.disclosures ?? []).find(x => x.id === 'NO_NEW_EXERCISE_IN_EVENT_WEEKS');
    console.log(`${name} ${id} -> ${sel}, missed in the last SPECIFIC week: ${d ? JSON.stringify({informational: d.informational, sessions: d.sessions, slots: d.slots, detail: d.detail}) : 'no disclosure'}`);
  }
}
