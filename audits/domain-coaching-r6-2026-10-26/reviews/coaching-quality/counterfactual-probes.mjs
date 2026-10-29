// Counterfactual probes on the FREEZE-1 reconstruction (freeze1-recon/), never on the current runtime.
// They test whether three holdout outcomes depend on the weeks the holdout left unreviewed (R18), and whether the
// H01 cold start depends on its thin wearable history. Nothing here replaces or regenerates the first evaluation:
// the controls only confirm that the reconstruction reproduces the recorded FREEZE-1 results.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../..');
const recon = path.join(here, 'freeze1-recon/CoachingCore');
const { generateProgram, evaluateProgram } = await import(pathToFileURL(path.join(recon, 'src/r6-index.mjs')).href);
const { resolveSession, nativeObservation, evaluateHoldoutCase } = await import(pathToFileURL(path.join(recon, 'scripts/evaluate-holdout-r6.mjs')).href);
const corpus = JSON.parse(fs.readFileSync(path.join(repo, 'CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json'), 'utf8'));
const first = JSON.parse(fs.readFileSync(path.join(repo, 'CoachingCore/r6/holdout/FIRST_EVALUATION.json'), 'utf8'));
const clone = x => JSON.parse(JSON.stringify(x));
const caseOf = id => clone(corpus.cases.find(c => c.caseId === id));
const recorded = id => first.rows.find(r => r.caseId === id).output;

const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);
const runWeek = w => (w.sessions || []).filter(s => s.sport === 'RUN' && !s.optional && s.status !== 'SKIPPED');
const weekLine = w => `W${w.index} ${w.phase} run=${runWeek(w).reduce((a, s) => a + s.prescription.durationMinutes, 0)} ` + runWeek(w).map(s => `${s.role[0]}${s.prescription.durationMinutes}`).join('/');

// A weekly review that reports every planned session of week wi as executed as prescribed with a compatible response.
function fullWeeklyReview(program, item, wi, overrides = {}) {
  const w = program.weeks[wi];
  const facts = w.sessions.filter(s => s.prescription && s.status !== 'SKIPPED' && !/REST/.test(s.role) && !s.optional && !(overrides.skip || []).includes(s.id))
    .map(s => ({ weekIndex: wi, sport: s.sport, day: s.day, role: s.role, completed: true, actualStimulus: 'AS_PRESCRIBED', response: { performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'NORMAL' }, eventId: `${item.caseId}-CF-${s.id}` }));
  const off = item.intake.timezoneOffsetMinutes ?? -180, sign = off < 0 ? '-' : '+', hh = String(Math.floor(Math.abs(off) / 60)).padStart(2, '0'), mm = String(Math.abs(off) % 60).padStart(2, '0');
  const date = addDays(w.startDate, 6);
  return { review: { version: 'R6-REVIEW-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: `${date}T20:00:00${sign}${hh}:${mm}`, weekIndex: wi, event: { id: `${item.caseId}-CF-WR${wi}`, kind: 'WEEKLY_REVIEW' }, eligibility: { ...item.intake.athlete.eligibility, assessedAt: date } }, observationFacts: [...facts, ...(overrides.extraFacts || [])], adoptProposal: true };
}

// Same loop as the FREEZE-1 runner, but steps may be functions of the current program.
function runSequence(item, steps) {
  const generation = generateProgram(item.intake);
  let program = generation.program, model = null, actualLedger = [], referenceState = null;
  const out = [];
  for (const raw of steps) {
    const step = typeof raw === 'function' ? raw(program) : raw;
    const review = clone(step.review), observations = [...(review.observations ?? [])];
    for (const f of step.observationFacts ?? []) { const { session } = resolveSession(program, f, 'fact'); observations.push(nativeObservation(program, session, f, item.caseId)); }
    if (step.targetRef) review.targetSessionId = resolveSession(program, step.targetRef, 'target').session.id;
    review.observations = observations;
    if (model) review.athleteModel = model;
    if (actualLedger.length) review.actualLedger = actualLedger;
    if (referenceState) review.referenceState = referenceState;
    const result = evaluateProgram(program, review);
    out.push({ kind: review.event.kind, week: review.weekIndex, status: result.status, action: result.action, reason: result.reason, gates: result.gates ?? null, proposal: result.proposal ?? null });
    model = result.updatedModel ?? model; actualLedger = result.actualLedger ?? actualLedger; referenceState = result.referenceState ?? referenceState;
    if (result.proposal && step.adoptProposal === true) program = result.proposal;
  }
  return { generation, steps: out, program };
}

const report = { runtime: 'FREEZE-1 reconstruction (freeze1-recon/), see freeze1-recon-manifest.json', controls: {}, probes: {} };

// Controls: the reconstruction reproduces the recorded first-evaluation results for the cases the probes start from.
for (const id of ['R6-H01', 'R6-H19', 'R6-H23', 'R6-H25']) {
  const item = caseOf(id), rec = recorded(id), now = evaluateHoldoutCase(item);
  report.controls[id] = {
    generationProgramHashEqual: now.generation.program?.hash === rec.generation.program?.hash,
    stepsEqual: now.steps.map(s => [s.result.status, s.result.action, s.result.proposal?.hash ?? null]).every((x, i) => JSON.stringify(x) === JSON.stringify([rec.steps[i].result.status, rec.steps[i].result.action, rec.steps[i].result.proposal?.hash ?? null])),
  };
}

// Probe A, H25: weekly reviews for weeks 0-5 before the EVENT_DATE_CHANGE (the holdout reviewed none of them).
{
  const item = caseOf('R6-H25'), [s1, s2] = item.steps;
  const steps = [p => fullWeeklyReview(p, item, 0), p => fullWeeklyReview(p, item, 1), s1, p => fullWeeklyReview(p, item, 2), p => fullWeeklyReview(p, item, 3), p => fullWeeklyReview(p, item, 4), p => fullWeeklyReview(p, item, 5), s2];
  const r = runSequence(item, steps), last = r.steps.at(-1);
  report.probes.H25_eventDateChange_withWeeklyReviews = { lastStep: { status: last.status, action: last.action }, weeks7to11: last.proposal ? last.proposal.weeks.slice(7, 12).map(weekLine) : null, recordedWeeks7to11: recorded('R6-H25').steps[1].result.proposal.weeks.slice(7, 12).map(weekLine) };
}

// Probe B, H23: weekly reviews for weeks 0-3 before the DOUBLE_CONFLICT.
{
  const item = caseOf('R6-H23'), [s1] = item.steps;
  const r = runSequence(item, [p => fullWeeklyReview(p, item, 0), p => fullWeeklyReview(p, item, 1), p => fullWeeklyReview(p, item, 2), p => fullWeeklyReview(p, item, 3), s1]);
  const last = r.steps.at(-1), pr = last.proposal;
  report.probes.H23_doubleConflict_withWeeklyReviews = {
    lastStep: { status: last.status, action: last.action },
    week4TuesdaySessions: pr ? pr.weeks[4].sessions.filter(s => s.day === 1).map(s => `${s.sport}:${s.role} ${s.turn} ${s.status}`) : null,
    week5TuesdaySessions: pr ? pr.weeks[5].sessions.filter(s => s.day === 1).map(s => `${s.sport}:${s.role} ${s.turn}`) : null,
    weeks5to9: pr ? pr.weeks.slice(5, 10).map(weekLine) : null,
    recordedWeeks5to9: recorded('R6-H23').steps[0].result.proposal.weeks.slice(5, 10).map(weekLine),
  };
}

// Probe C, H19: the week-5 weekly review the holdout skipped, inserted between S3 and S4 (the long run of week 5 reported there).
{
  const item = caseOf('R6-H19'), [s1, s2, s3, s4] = item.steps;
  const longFact = s4.observationFacts.find(f => f.weekIndex === 5);
  const s4b = clone(s4); s4b.observationFacts = s4b.observationFacts.filter(f => f.weekIndex !== 5);
  const wr5 = p => { const st = fullWeeklyReview(p, item, 5); const reported = new Set(['QUALITY', 'LONG']); st.observationFacts = st.observationFacts.filter(f => !(f.sport === 'RUN' && reported.has(f.role)) && !(f.sport === 'STRENGTH' && f.day === 0)); st.observationFacts.push(longFact); return st; };
  const r = runSequence(item, [s1, s2, s3, wr5, s4b]);
  const wr = r.steps[3], last = r.steps[4];
  report.probes.H19_withWeek5WeeklyReview = { week5Review: { status: wr.status, action: wr.action, gates: wr.gates, week6: wr.proposal ? weekLine(wr.proposal.weeks[6]) : null }, s4: { status: last.status, action: last.action, reason: last.reason } };
}

// Probe D, H01: the same athlete with eight weeks of wearable history that repeats her logged weekly pattern.
{
  const item = caseOf('R6-H01');
  const base = item.intake.history.filter(h => h.startedAt < '2027-02-22');
  const hist = [];
  for (let k = 0; k < 8; k++) for (const h of base) { const d = addDays(h.startedAt.slice(0, 10), -7 * k); if (d < '2027-01-01') continue; hist.push({ ...h, activityId: `${h.activityId}-w${k}`, startedAt: d + h.startedAt.slice(10) }); }
  const later = item.intake.history.filter(h => h.startedAt >= '2027-02-22');
  item.intake.history = [...hist, ...later].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const g = generateProgram(item.intake), p = g.program;
  report.probes.H01_withEightWeeksOfConsistentHistory = { status: g.status, capabilityRun: p && { basis: p.capability.run.basis, weeklyMinutes: p.capability.run.weeklyMinutes, days: p.capability.run.daysPerWeek, longest: p.capability.run.longestMinutes, class: p.capability.run.class }, gaps: p?.gaps, weeks: p ? p.weeks.map(weekLine) : null };
}

fs.writeFileSync(path.join(here, 'counterfactual-probes.out.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 1));
