// SSCTR R7ADA-SSCTR-r1 R6-H25 full-record run trace (own; prints only). My holdout-detail control (R7ASM) shows that, with a complete record (every
// week before the case's first step executed as prescribed and reviewed on its last day, 20:00 local), R6-H25's run rows change on this freeze
// and not on the predecessor. This trace prints, per step, the decision and the run sessions of every week from the step's week to the end, and
// the run state the stored start of each of those weeks holds, on the runtime SSCTR_CC selects, so the two trees can be read side by side.
// Harness: the corpus case from CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json and the tree's own scripts/evaluate-holdout-r6.mjs
// (resolveSession, nativeObservation), as my holdout-detail instrument uses them. Read-only runtime use; synthetic data; DEV_TEST_ONLY authority.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import * as L from './ssctr-r7ada-lib.mjs';

const CASE = process.env.CASE ?? 'R6-H25';
const ev = await import(pathToFileURL(path.join(L.CC, 'scripts/evaluate-holdout-r6.mjs')).href);
const corpus = JSON.parse(fs.readFileSync(path.join(L.CC, 'r6/holdout/R6_INDEPENDENT_HOLDOUT.json'), 'utf8')).cases;
const item = corpus.find(c => c.caseId === CASE);
const live = s => s && s.prescription && s.status !== 'SKIPPED';
const offset = m => { const s = m < 0 ? '-' : '+', a = Math.abs(m); return s + String(Math.floor(a / 60)).padStart(2, '0') + ':' + String(a % 60).padStart(2, '0'); };
const OK = {performance: 'COMPATIBLE', recovery: 'COMPATIBLE', effort: 'ON_TARGET', nextDayFunction: 'NORMAL'};
const runText = s => `${s.date} ${s.role} ${s.prescription.family ?? ''} ${s.prescription.durationMinutes}${s.prescription.work ? ` (${s.prescription.work.repetitions}x${s.prescription.work.workMinutes})` : ''}${s.prescription.strides ? ' +strides' + s.prescription.strides.repetitions : ''}`;
const runState = x => x ? Object.fromEntries(Object.entries(x).filter(([k]) => ['mode', 'long', 'easy', 'easyExtra', 'qualityStep', 'specificStep', 'thresholdDone', 'qualityDone', 'stridesDone', 'easyWeeksDone', 'devCount', 'achieved'].includes(k))) : null;
const gen = L.generateProgram(structuredClone(item.intake), L.opts);
let program = gen.program, model = null, actualLedger = [], referenceState = null;
const carry = (result) => { model = result.updatedModel ?? model; actualLedger = result.actualLedger ?? actualLedger; referenceState = result.referenceState ?? referenceState; };
const prep = review => { if (model) review.athleteModel = model; if (actualLedger.length) review.actualLedger = actualLedger; if (referenceState) review.referenceState = referenceState; return review; };
const known = Object.fromEntries((item.intake.athlete.knownExercises ?? []).map(k => [k.id, k.load?.value]));
const firstWeek = Math.min(...item.steps.map(s => s.review.weekIndex)), elig = item.steps[0].review.eligibility;
const out = {probe: 'R7ADA-SSCTR-r1-H25-RUN', runtime: L.TREE, case: CASE, scenario: item.scenario, firstStepWeek: firstWeek, steps: []};
for (let w = 0; w < firstWeek; w++) {
  const week = program.weeks[w], last = L.addDays(week.startDate, 6), tz = program.timezoneOffsetMinutes ?? 0;
  const observations = week.sessions.filter(live).map(s => ev.nativeObservation(program, s, {completed: true, actualStimulus: 'AS_PRESCRIBED', response: {...OK}, loadsByExercise: s.prescription.modality === 'STRENGTH' ? Object.fromEntries(s.prescription.exercises.filter(e => e.load.mode !== 'KNOWN' && e.load.mode !== 'BODYWEIGHT').map(e => [e.id, e.load.ceiling?.value ?? known[e.id] ?? 20])) : undefined}, item.caseId + '-rec'));
  const review = prep({version: 'R6-REVIEW-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: `${last}T20:00:00${offset(tz)}`, weekIndex: w, event: {id: `${item.caseId}-rec-${w}`, kind: 'WEEKLY_REVIEW'}, eligibility: {...structuredClone(elig), assessedAt: last}, observations});
  const result = L.evaluateProgram(program, review, L.opts); carry(result); if (result.proposal) program = result.proposal;
}
out.recordWeeks = program.weeks.slice(0, firstWeek).map(w => ({week: w.index, phase: w.phase, run: w.sessions.filter(s => live(s) && s.sport === 'RUN').map(runText)}));
for (const [i, step] of item.steps.entries()) {
  const review = structuredClone(step.review), observations = [...(review.observations ?? [])];
  for (const f of step.observationFacts ?? []) { const {session} = ev.resolveSession(program, f, 'Observation fact'); observations.push(ev.nativeObservation(program, session, f, item.caseId)); }
  if (step.targetRef) { const {session} = ev.resolveSession(program, step.targetRef, 'Target'); review.targetSessionId = session.id; }
  review.observations = observations; prep(review);
  const result = L.evaluateProgram(program, review, L.opts); carry(result);
  const p = result.proposal ?? program, wk = review.weekIndex ?? 0;
  out.steps.push({step: i, week: wk, kind: review.event?.kind, change: review.changes ?? null, result: `${result.status}/${result.action}`, adopted: !!(result.proposal && step.adoptProposal === true),
    facts: (step.observationFacts ?? []).map(f => `w${f.weekIndex} ${f.sport}${f.role ? '/' + f.role : ''}${f.day !== undefined ? ' d' + f.day : ''} ${f.completed ? 'done' : 'missed'} ${f.response?.performance ?? ''}`),
    weeks: p.weeks.slice(wk).map(w => ({week: w.index, phase: w.phase, start: runState(p.stateTrace[w.index]?.run), run: w.sessions.filter(s => live(s) && s.sport === 'RUN').map(runText)}))});
  if (result.proposal && step.adoptProposal === true) program = result.proposal;
}
console.log(JSON.stringify(out, null, 1));
