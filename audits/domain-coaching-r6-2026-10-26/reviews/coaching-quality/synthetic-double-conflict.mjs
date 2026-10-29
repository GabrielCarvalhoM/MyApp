// Synthetic, non-holdout DOUBLE_CONFLICT probe on the FREEZE-1 reconstruction and on the current (unfrozen) runtime.
// A one-day turn conflict (from = to = one Tuesday) with sameTurnConfirmed:false, after four fully reviewed weeks.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../..');
const runtimes = { FREEZE1_RECON: path.join(here, 'freeze1-recon/CoachingCore'), CURRENT_UNFROZEN: path.join(repo, 'CoachingCore') };
const elig = d => ({ status: 'NONCLINICAL_CONFIRMED', assessedAt: d, pain: false, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false });
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);
const intake = {
  version: 'R6-INTAKE-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: '2031-01-03', startDate: '2031-01-06', weeks: 12, timezoneOffsetMinutes: 0,
  athlete: { id: 'synthetic-dc', ageEligible: true, eligibility: elig('2031-01-03'), goals: { run: 'RACE', strength: 'RUNNING_SUPPORT' }, event: { kind: '10K', date: '2031-03-29' }, runExperience: 'INTERMEDIATE', strengthExperience: 'INTERMEDIATE', recent: { runDaysPerWeek: 3, runMinutesPerWeek: 150, longestRunMinutes: 65, strengthDaysPerWeek: 2 }, knownExercises: [{ id: 'goblet-squat', sets: 3, reps: 10, load: { value: 20, unit: 'KG', convention: 'TOTAL' }, rir: 3, current: true, familiar: true, tolerated: true, observedAt: '2031-01-02' }], equipment: ['BODYWEIGHT', 'DUMBBELLS', 'BENCH'] },
  schedule: { runDays: [1, 3, 5], strengthDays: [1, 4], runTurn: 'AM', strengthTurn: 'PM', runMinutes: 55, strengthMinutes: 40, longRunDay: 5, longRunMinutes: 90 },
};
const weekReview = (program, wi) => {
  const w = program.weeks[wi], date = addDays(w.startDate, 6);
  const observations = w.sessions.filter(s => s.prescription && s.status !== 'SKIPPED' && !s.optional && !/REST/.test(s.role)).map(s => {
    const p = s.prescription, actual = { completed: true, minutes: p.durationMinutes };
    if (p.modality === 'STRENGTH') actual.exercises = p.exercises.map(e => ({ id: e.id, sets: Array.from({ length: e.sets }, () => ({ reps: e.reps, load: e.load.mode === 'BODYWEIGHT' ? { value: 0, unit: 'BODYWEIGHT', convention: 'BODYWEIGHT' } : { value: e.load.value ?? 10, unit: 'KG', convention: e.load.convention }, rir: e.rir })) }));
    return { eventId: `dc-${s.id}`, athleteId: program.athleteId, sessionId: s.id, occurrenceDate: s.date, actual, response: { performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'NORMAL' } };
  });
  return { version: 'R6-REVIEW-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: `${date}T20:00:00Z`, weekIndex: wi, event: { id: `dc-wr${wi}`, kind: 'WEEKLY_REVIEW' }, eligibility: elig(date), observations };
};
const tue = (p, wi) => p.weeks[wi].sessions.filter(s => s.day === 1).map(s => `${s.sport}:${s.role}:${s.turn}:${s.status}`);
const runLine = (p, wi) => p.weeks[wi].sessions.filter(s => s.sport === 'RUN' && !s.optional && s.status !== 'SKIPPED').map(s => `${s.role}${s.prescription.durationMinutes}`).join('/');
const out = {};
for (const [name, dir] of Object.entries(runtimes)) {
  const { generateProgram, evaluateProgram } = await import(pathToFileURL(path.join(dir, 'src/r6-index.mjs')).href);
  let cur = generateProgram(intake).program, ledger = [], model = null, ref = null;
  for (let wi = 0; wi < 4; wi++) { const rv = weekReview(cur, wi); if (ledger.length) rv.actualLedger = ledger; if (model) rv.athleteModel = model; if (ref) rv.referenceState = ref; const r = evaluateProgram(cur, rv); ledger = r.actualLedger ?? ledger; model = r.updatedModel ?? model; ref = r.referenceState ?? ref; if (r.proposal) cur = r.proposal; }
  const day = cur.weeks[4].sessions.find(s => s.day === 1).date;
  const rv = { version: 'R6-REVIEW-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: `${cur.weeks[4].startDate}T07:00:00Z`, weekIndex: 4, event: { id: 'dc-conflict', kind: 'DOUBLE_CONFLICT' }, eligibility: elig(cur.weeks[4].startDate), observations: [], targetSessionId: cur.weeks[4].sessions.find(s => s.day === 1 && s.sport === 'STRENGTH').id, changes: { strengthTurn: 'AM', sameTurnConfirmed: false, from: day, to: day }, actualLedger: ledger, athleteModel: model, referenceState: ref };
  const r = evaluateProgram(cur, rv);
  out[name] = { status: r.status, action: r.action, reason: r.reason, question: r.question ?? null, conflictDayBefore: tue(cur, 4), conflictDayAfter: r.proposal ? tue(r.proposal, 4) : null, nextTuesdayAfter: r.proposal ? tue(r.proposal, 5) : null, week6TuesdayAfter: r.proposal ? tue(r.proposal, 6) : null, runsW5Before: runLine(cur, 5), runsW5After: r.proposal ? runLine(r.proposal, 5) : null };
}
fs.writeFileSync(path.join(here, 'synthetic-double-conflict.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 1));
