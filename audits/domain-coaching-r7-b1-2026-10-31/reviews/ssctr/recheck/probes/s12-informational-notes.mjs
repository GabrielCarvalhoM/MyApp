// SSCTR R7-B.1 recheck probe s12 (read-only): which s01 decisions carry the informational NO_NEW_EXERCISE_IN_EVENT_WEEKS note (C5; slots, no options)
// besides or instead of the substitution's own disclosure. Same athletes and decision points as s01, decisions only (no weekly walk).
// Usage: SSCTR_ROOT=<tree root> node s12-informational-notes.mjs
import {pathToFileURL} from 'node:url';
const ROOT = pathToFileURL((process.env.SSCTR_ROOT ?? '').replace(/[\/]?$/, '/'));
const H = await import(new URL('CoachingCore/r7/b/fixtures/helpers.mjs', ROOT).href);
const {reviewed, weekly, review, evaluateProgram, opts, live, FULL, K} = H;
const EV = {goals: {run: 'RACE', strength: 'GENERAL'}, event: {kind: '10K', date: '2027-01-24'}, weeks: 16, recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 70, strengthDaysPerWeek: 2}};
const athletes = [
  ['A-10K-general-dbkb-fixed', {...EV, equipment: ['DUMBBELLS', 'BENCH', 'KETTLEBELL'], schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 4]}, rotation: 'FIXED'}],
  ['B-10K-strength-full-coach-3d', {...EV, goals: {run: 'RACE', strength: 'STRENGTH'}, equipment: FULL, schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 2, 4]}, rotation: 'COACH_DECIDES'}],
  ['C-half-hypertrophy-bands-2w', {...EV, event: {kind: 'HALF_MARATHON', date: '2027-01-31'}, goals: {run: 'RACE', strength: 'HYPERTROPHY'}, equipment: ['DUMBBELLS', 'BENCH', 'BANDS', 'PULL_UP_BAR'], schedule: {runDays: [1, 2, 4, 6], strengthDays: [0, 3], longRunMinutes: 120}, rotation: 'EVERY_2_WEEKS'}],
  ['D-10K-runsupport-bodyweight', {...EV, goals: {run: 'RACE', strength: 'RUNNING_SUPPORT'}, equipment: [], schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 4]}, rotation: 'FIXED'}],
  ['E-10K-novice-none-3d', {...EV, strengthExperience: 'NONE', recent: {...EV.recent, strengthDaysPerWeek: 0}, equipment: ['DUMBBELLS', 'BENCH'], schedule: {runDays: [1, 3, 5, 6], strengthDays: [0, 2, 4]}, rotation: 'FIXED'}],
  ['F-half-general-machines-intakefamiliar', {...EV, event: {kind: 'HALF_MARATHON', date: '2027-01-31'}, equipment: ['MACHINES', 'DUMBBELLS', 'BANDS', 'KETTLEBELL'], schedule: {runDays: [1, 3, 4, 6], strengthDays: [0, 4], longRunMinutes: 120}, rotation: 'FIXED', knownExercises: [K('kb-goblet-squat', 3, 10, 16), K('kb-row', 3, 10, 16), K('single-leg-rdl-db', 3, 10, 10, 'PER_HAND')]}],
];
for (const [name, o0] of athletes) {
  const o = {...o0, id: 's01-' + name}, ph = reviewed(o, 0).p.phases.phases, tw = ph.indexOf('TAPER'), rw = ph.indexOf('RACE_WEEK'), pw = ph.indexOf('POST_EVENT');
  for (const [pt, wk, day] of [['TAPER-d0', tw, 0], ['TAPER-d3', tw, 3], ['RACE_WEEK-d0', rw, 0], ['POST_EVENT-d0', pw, 0], ['LAST_SPECIFIC-d0', tw - 1, 0]]) {
    const t = reviewed(o, 0); for (let w = 0; w < wk; w++) weekly(t, w);
    const ids = [...new Set(t.p.weeks[wk].sessions.filter(s => live(s) && s.sport === 'STRENGTH').flatMap(s => s.prescription.exercises.filter(e => e.role !== 'PRACTICE').map(e => e.id)))];
    for (const id of ids) for (const reason of ['SKILL_MISMATCH', 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE']) {
      const r = evaluateProgram(t.p, {...review(t.p, wk, {day, hour: '06:00:00', kind: 'EXERCISE_SUBSTITUTION', substitution: {exerciseId: id, reason, ...(reason === 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE' ? {nonclinicalConfirmed: true} : {})}}), actualLedger: t.ledger}, opts);
      const notes = (r.disclosures ?? []).filter(d => d.id === 'NO_NEW_EXERCISE_IN_EVENT_WEEKS' && d.informational);
      if (notes.length) console.log(`${name} ${pt} ${id} ${reason} -> ${r.substitutions?.[0]?.selected}: ${notes.map(d => d.detail).join(' / ')}`);
    }
  }
}
