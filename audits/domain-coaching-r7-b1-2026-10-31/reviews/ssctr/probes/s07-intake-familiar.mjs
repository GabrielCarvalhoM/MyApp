// SSCTR R7-B.1 review probe s07 (read-only): an exercise reported familiar at intake but never performed in this program is still new in the event
// weeks. Intake reports two familiar configurations of one pattern; the template uses one; a preference substitution of it in TAPER, RACE_WEEK and
// POST_EVENT selects the other (familiar first). Prints whether the selection appears on an event-phase day of the plan in force, the disclosure, and
// whether the selection ever stands in for anything.
// Usage: SSCTR_ROOT=<tree root> node s07-intake-familiar.mjs
import {pathToFileURL} from 'node:url';
const ROOT = pathToFileURL((process.env.SSCTR_ROOT ?? '').replace(/[\/]?$/, '/'));
const imp = rel => import(new URL(rel, ROOT).href);
const H = await imp('CoachingCore/r7/b/fixtures/helpers.mjs'), P = await imp('CoachingCore/src/r6-program.mjs'), AU = await imp('CoachingCore/src/r6-authority.mjs');
const {reviewed, weekly, review, evaluateProgram, opts, live, K} = H, auth = AU.r6Authority(opts), EVENT = ['TAPER', 'RACE_WEEK', 'POST_EVENT'];
const EV = {goals: {run: 'RACE', strength: 'GENERAL'}, event: {kind: '10K', date: '2027-01-24'}, weeks: 16, equipment: ['DUMBBELLS', 'BENCH', 'KETTLEBELL'], recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 70, strengthDaysPerWeek: 2}, schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 4]}, rotation: 'FIXED'};
const cases = [['squat', [K('goblet-squat', 3, 10, 16, 'SINGLE_IMPLEMENT'), K('kb-goblet-squat', 3, 10, 16, 'SINGLE_IMPLEMENT')]], ['hinge', [K('db-rdl', 3, 10, 14, 'PER_HAND'), K('single-leg-rdl-db', 3, 10, 10, 'PER_HAND')]]];
for (const [name, known] of cases) for (const phase of EVENT) {
  const t = reviewed({...EV, id: `s07-${name}-${phase}`, knownExercises: known}, 0), ph = t.p.phases.phases, wk = ph.indexOf(phase), pw = ph.indexOf('POST_EVENT');
  for (let w = 0; w < wk; w++) weekly(t, w);
  const inUse = new Set(t.p.weeks[wk].sessions.filter(s => live(s) && s.sport === 'STRENGTH').flatMap(s => s.prescription.exercises.map(e => e.id)));
  const used = known.map(k => k.id).find(id => inUse.has(id)), other = known.map(k => k.id).find(id => id !== used);
  const performed = new Set(t.ledger.filter(o => o.actual?.completed).flatMap(o => (o.actual.exercises ?? []).map(e => e.id)));
  if (!used) { console.log(`${name} ${phase}: neither familiar configuration is in use (${[...inUse].join(', ')})`); continue; }
  const r = evaluateProgram(t.p, {...review(t.p, wk, {day: 0, hour: '06:00:00', kind: 'EXERCISE_SUBSTITUTION', substitution: {exerciseId: used, reason: 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE', nonclinicalConfirmed: true}}), actualLedger: t.ledger}, opts);
  const sel = r.substitutions?.[0]?.selected, d = (r.disclosures ?? []).find(z => z.id === 'NO_NEW_EXERCISE_IN_EVENT_WEEKS');
  let onEventDays = 0, standsIn = 0;
  if (r.proposal) { const c = structuredClone(t); c.ledger = r.actualLedger ?? c.ledger; c.p = r.proposal;
    for (let w = wk; w <= pw; w++) { const sk = P.skeletonOf(c.p, auth); for (const s of c.p.weeks[w].sessions.filter(z => live(z) && z.sport === 'STRENGTH' && EVENT.includes(P.dayPhaseOf(sk.at(w) ?? sk, w, z.day)))) for (const e of s.prescription.exercises) { if (e.id === sel) onEventDays++; if (e.id === other && (e.instructions ?? []).some(i => /stands in for/.test(i))) standsIn++; } if (w < c.p.weeks.length - 1) weekly(c, w); } }
  console.log(`${name} ${phase}: in use ${used}; familiar at intake, never performed here: ${other} (performed here: ${performed.has(other)}) | decision ${r.status} -> ${sel} | ${sel} on event-phase days of the plan in force: ${onEventDays} | ${other} as a stand-in: ${standsIn} | disclosure: ${d ? d.detail : 'none'}`);
}
