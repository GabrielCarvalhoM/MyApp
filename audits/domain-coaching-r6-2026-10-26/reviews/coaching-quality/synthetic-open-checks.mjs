// Synthetic, non-holdout probes run read-only on BOTH the FREEZE-1 reconstruction and the current (unfrozen) runtime.
// Purpose: say whether a defect seen on the holdout still reproduces on the current runtime with an unrelated synthetic
// athlete. This is not a holdout rerun, not a verification of any later change on the holdout, and not frozen evidence.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../..');
const runtimes = {
  FREEZE1_RECON: path.join(here, 'freeze1-recon/CoachingCore'),
  CURRENT_UNFROZEN: path.join(repo, 'CoachingCore'),
};
const elig = d => ({ status: 'NONCLINICAL_CONFIRMED', assessedAt: d, pain: false, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false });
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);

function baseIntake(over = {}) {
  return {
    version: 'R6-INTAKE-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: '2030-03-01', startDate: '2030-03-04', weeks: 12, timezoneOffsetMinutes: 0,
    athlete: {
      id: 'synthetic-probe', ageEligible: true, eligibility: elig('2030-03-01'),
      goals: { run: 'RACE', strength: 'RUNNING_SUPPORT' }, event: { kind: 'HALF_MARATHON', date: '2030-05-26' },
      runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE',
      recent: { runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 80, strengthDaysPerWeek: 2 },
      knownExercises: [{ id: 'goblet-squat', sets: 3, reps: 10, load: { value: 20, unit: 'KG', convention: 'TOTAL' }, rir: 3, current: true, familiar: true, tolerated: true, observedAt: '2030-02-27' }],
      equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BENCH'],
      ...over.athlete,
    },
    schedule: { runDays: [1, 3, 5, 6], strengthDays: [0, 3], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 60, strengthMinutes: 45, longRunDay: 6, longRunMinutes: 150, ...over.schedule },
    ...(over.history ? { history: over.history } : {}),
    ...(over.top || {}),
  };
}
const weekReview = (program, wi, extra = {}) => {
  const w = program.weeks[wi], date = addDays(w.startDate, 6);
  const observations = w.sessions.filter(s => s.prescription && s.status !== 'SKIPPED' && !s.optional && !/REST/.test(s.role)).map(s => {
    const p = s.prescription, actual = { completed: true, minutes: p.durationMinutes };
    if (p.modality === 'STRENGTH') actual.exercises = p.exercises.map(e => ({ id: e.id, sets: Array.from({ length: e.sets }, () => ({ reps: e.reps, ...(e.load.mode === 'BODYWEIGHT' ? { load: { value: 0, unit: 'BODYWEIGHT', convention: 'BODYWEIGHT' } } : e.load.mode === 'KNOWN' ? { load: { value: e.load.value, unit: 'KG', convention: e.load.convention } } : { load: { value: 10, unit: 'KG', convention: e.load.convention } }), rir: e.rir })) }));
    if (extra.raceMinutes && s.role === 'RACE') actual.minutes = extra.raceMinutes;
    return { eventId: `probe-${s.id}`, athleteId: program.athleteId, sessionId: s.id, occurrenceDate: s.date, actual, response: { performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'NORMAL' } };
  });
  return { version: 'R6-REVIEW-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: `${date}T20:00:00Z`, weekIndex: wi, event: { id: `probe-wr${wi}`, kind: 'WEEKLY_REVIEW' }, eligibility: elig(date), observations };
};
const bwReps = (p, wi) => p.weeks[wi].sessions.filter(s => s.sport === 'STRENGTH').flatMap(s => (s.prescription.exercises || []).filter(x => x.load?.mode === 'BODYWEIGHT').map(x => `${s.id}:${x.id} ${x.sets}x${x.reps}`));

const out = {};
for (const [name, dir] of Object.entries(runtimes)) {
  const { generateProgram, evaluateProgram } = await import(pathToFileURL(path.join(dir, 'src/r6-index.mjs')).href);
  const r = {};
  // 1. Bodyweight repetitions after an executed, compatible weekly review.
  { const g = generateProgram(baseIntake()); const p = g.program; let cur = p; const rows = [];
    for (let wi = 0; wi < 2; wi++) { const res = evaluateProgram(cur, weekReview(cur, wi)); rows.push({ week: wi, status: res.status, action: res.action, plannedNextWeekBodyweight: bwReps(cur, wi + 1), proposedNextWeekBodyweight: res.proposal ? bwReps(res.proposal, wi + 1) : 'no proposal' }); if (res.proposal) cur = res.proposal; }
    r.bodyweightRepsAfterReview = { status: g.status, rows }; }
  // 2. FULL wearable with 8 declared weeks but entries only in the last 10 days, matching the self-report.
  { const hist = []; let k = 0; for (const [d, m] of [['2030-02-19', 45], ['2030-02-21', 45], ['2030-02-23', 40], ['2030-02-24', 80], ['2030-02-26', 45], ['2030-02-28', 45]]) hist.push({ activityId: 'p-' + (k++), provider: 'garmin', sport: 'RUN', startedAt: d + 'T07:00:00Z', durationMinutes: m, completeness: 'FULL' });
    const g = generateProgram(baseIntake({ athlete: { wearableCapabilities: { provider: 'garmin', activityAvailable: true, heartRateAvailable: true, exerciseIdentityAvailable: false, setsRepsLoadAvailable: false, subjectiveEffortAvailable: false, completeness: 'FULL', historyWeeks: 8 } }, history: hist }));
    const p = g.program; r.thinFullHistory = { status: g.status, capability: p && { basis: p.capability.run.basis, weeklyMinutes: p.capability.run.weeklyMinutes, longest: p.capability.run.longestMinutes, class: p.capability.run.class }, week0Run: p && p.weeks[0].sessions.filter(s => s.sport === 'RUN').map(s => `${s.role}${s.prescription.durationMinutes}`), peakLong: p && Math.max(...p.weeks.flatMap(w => w.sessions.filter(s => s.role === 'LONG').map(s => s.prescription.durationMinutes))), gaps: p?.gaps, negotiation: p?.negotiation?.map(n => n.id) }; }
  // 3. Kettlebell and bodyweight only: is any PULL exercise programmed (the library has prone-row-practice)?
  { const g = generateProgram(baseIntake({ athlete: { equipment: ['BODYWEIGHT', 'KETTLEBELL'], knownExercises: [], strengthExperience: 'NOVICE' } }));
    const p = g.program; r.pullWithKettlebellBodyweight = { status: g.status, pullExercises: p ? [...new Set(p.weeks.flatMap(w => w.sessions.flatMap(s => (s.prescription?.exercises || []).filter(x => x.pattern === 'PULL').map(x => x.id))))] : null, negotiation: p?.negotiation?.filter(n => n.id === 'MOVEMENT_PATTERN_UNAVAILABLE').map(n => n.patterns) }; }
  // 4. Goblet squat reported as 20 kg TOTAL, with a PARTIAL wearable strength row of 20 kg (no convention).
  { const hist = [{ activityId: 's-1', provider: 'polar', sport: 'STRENGTH', startedAt: '2030-02-26T18:00:00Z', durationMinutes: 40, completeness: 'FULL', exercises: [{ id: 'goblet-squat', sets: 3, reps: 10, loadKg: 20 }] }];
    const g = generateProgram(baseIntake({ athlete: { wearableCapabilities: { provider: 'polar', activityAvailable: true, heartRateAvailable: true, exerciseIdentityAvailable: true, setsRepsLoadAvailable: true, subjectiveEffortAvailable: false, completeness: 'PARTIAL', historyWeeks: 4 } }, history: hist }));
    const p = g.program; const gs = p?.weeks[0].sessions.flatMap(s => (s.prescription?.exercises || []).filter(x => x.id === 'goblet-squat'))[0]; r.gobletConvention = { status: g.status, week0GobletLoad: gs?.load ?? null }; }
  // 5. A 10K raced faster than the planned race duration: how is the race row recorded?
  { const g = generateProgram(baseIntake({ athlete: { event: { kind: '10K', date: '2030-03-31' }, goals: { run: 'RACE', strength: 'MAINTAIN' } }, top: { weeks: 4 } }));
    let cur = g.program, rows = null;
    for (let wi = 0; wi < 4 && cur; wi++) { const res = evaluateProgram(cur, weekReview(cur, wi, { raceMinutes: 48 })); if (wi === 3) rows = (res.weekEvidence?.rows || []).filter(x => x.role === 'RACE').map(x => ({ sessionId: x.sessionId, status: x.status, kind: x.kind })); if (res.proposal) cur = res.proposal; }
    r.raceRecordedAs = { status: g.status, plannedRaceMinutes: g.program?.weeks[3].sessions.find(s => s.role === 'RACE')?.prescription.durationMinutes, reportedMinutes: 48, rows }; }
  out[name] = r;
}
fs.writeFileSync(path.join(here, 'synthetic-open-checks.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 1));
