import {pathToFileURL as __toUrl} from 'node:url';
const __ROOT = __toUrl((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
// SSCTR R7-B recheck probe r06 (read-only, FREEZE-2): QE-R7B-OBS-04. A reason-based substitution (DR-134) requested in a TAPER, RACE_WEEK or
// POST_EVENT week: does the plan introduce a configuration never performed in the program before the race (R6-EVENT-TRANSITION C7, B0-C05 c1:
// no new exercise in TAPER, RACE_WEEK, POST_EVENT)? Both reasons, every exercise in use; plus the inherited comparator: a permanent equipment
// change in the taper week.
const {reviewed, weekly, review, evaluateProgram, opts, live} = await import(new URL('CoachingCore/r7/b/fixtures/helpers.mjs', __ROOT).href);
const o = {id: 'r06', goals: {run: 'RACE', strength: 'GENERAL'}, event: {kind: '10K', date: '2027-01-24'}, weeks: 16, equipment: ['DUMBBELLS', 'BENCH', 'KETTLEBELL'], recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 70, strengthDaysPerWeek: 2}, schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 4]}, rotation: 'FIXED'};
const base = reviewed(o, 0);
const ph = base.p.phases.phases, tw = ph.indexOf('TAPER'), rw = ph.indexOf('RACE_WEEK'), pw = ph.indexOf('POST_EVENT');
console.log('phases', ph.join(','), '| taper', tw, 'race week', rw, 'post event', pw);
const performedBefore = (p, w) => new Set(p.weeks.slice(0, w).flatMap(x => x.sessions.filter(live).flatMap(s => s.prescription.exercises ?? []).map(e => e.id)));
let cases = 0, newInEvent = [];
for (const [label, wk] of [['TAPER', tw], ['RACE_WEEK', rw]]) {
  const t = reviewed({...o, id: 'r06-' + label}, 0);
  for (let w = 0; w < wk; w++) weekly(t, w);
  const ids = [...new Set(t.p.weeks[wk].sessions.filter(s => live(s) && s.sport === 'STRENGTH').flatMap(s => s.prescription.exercises.filter(e => e.role !== 'PRACTICE').map(e => e.id)))];
  const before = performedBefore(t.p, wk);
  for (const id of ids) for (const reason of ['SKILL_MISMATCH', 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE']) {
    const r = evaluateProgram(t.p, {...review(t.p, wk, {day: 0, hour: '06:00:00', kind: 'EXERCISE_SUBSTITUTION', substitution: {exerciseId: id, reason, ...(reason === 'SKILL_MISMATCH' ? {} : {nonclinicalConfirmed: true})}}), actualLedger: t.ledger}, opts);
    cases++;
    if (r.status !== 'MODIFY') { console.log(`${label} ${id} ${reason}: ${r.status} ${(r.reason ?? '').slice(0, 110)}`); continue; }
    const sel = r.substitutions?.[0]?.selected;
    const rows = r.proposal.weeks.slice(wk, pw + 1).flatMap(x => x.sessions.filter(s => live(s) && s.sport === 'STRENGTH').flatMap(s => s.prescription.exercises.filter(e => e.id === sel).map(e => `w${x.index}/${x.phase} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}`)));
    const isNew = !before.has(sel);
    console.log(`${label} ${id} ${reason}: MODIFY -> ${sel} (${isNew ? 'NEVER PERFORMED before' : 'performed before'}) | event-phase rows: ${rows.join('; ') || 'none'}`);
    if (isNew && rows.length) newInEvent.push(`${label}:${id}->${sel}`);
  }
}
console.log(`\nsubstitution cases ${cases}; never-performed configuration prescribed in TAPER/RACE_WEEK/POST_EVENT: ${newInEvent.length} (${newInEvent.join(', ')})`);
// Inherited comparator: a permanent equipment change (kettlebell only) reported at the start of the taper week.
const e = reviewed({...o, id: 'r06-eq'}, 0);
for (let w = 0; w < tw; w++) weekly(e, w);
const before = performedBefore(e.p, tw);
const re = evaluateProgram(e.p, {...review(e.p, tw, {day: 0, hour: '06:00:00', kind: 'EQUIPMENT_CHANGE', equipment: ['KETTLEBELL'], equipmentChange: {equipment: ['KETTLEBELL']}}), actualLedger: e.ledger}, opts);
const fresh = re.proposal ? re.proposal.weeks.slice(tw, pw + 1).flatMap(x => x.sessions.filter(s => live(s) && s.sport === 'STRENGTH').flatMap(s => s.prescription.exercises.filter(x2 => !before.has(x2.id)).map(x2 => `w${x.index}/${x.phase} ${x2.id} ${x2.sets}@${x2.rir} ${x2.load.mode}`))) : [];
console.log(`\ninherited comparator, equipment change to kettlebell only at the taper week: ${re.status} ${re.action}; never-performed rows in event phases: ${fresh.join('; ') || 'none'}`);
