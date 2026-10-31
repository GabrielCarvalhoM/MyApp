// SSCTR R7-B.1 recheck probe s08 (read-only): the clinical screen comes before any block-choice question (C1; B0-C06 condition 8; SSCTR D08).
// Athletes and reviews independent of the author's test: an event athlete at the end of a development block (a block-boundary week) and mid-block,
// and a graduation runner at a block boundary. Clinical reports: pain with an exercise, a clinical text with a substitution, an illness interruption.
// Each with every kind of block choice (ladder step, main change, graduation accept/decline, unrecognised), with and without a correction of last week.
// Expected: CLINICAL_HUMAN_REQUIRED, no proposal, the clinical dependency carried. Controls: the same nonclinical review with the choice.
// Usage: SSCTR_ROOT=<tree root> node s08-clinical-before-choice.mjs
import {pathToFileURL} from 'node:url';
const ROOT = pathToFileURL((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
const H = await import(new URL('CoachingCore/r7/b/fixtures/helpers.mjs', ROOT).href);
const {reviewed, review, evaluateProgram, opts, live} = H;
const BAD = {performance: 'UNDER', recovery: 'ADVERSE', effort: 'HARDER', nextDayFunction: 'IMPAIRED'};
const EV = {id: 's08-event', goals: {run: 'RACE', strength: 'GENERAL'}, event: {kind: 'HALF_MARATHON', date: '2027-01-31'}, weeks: 16, equipment: ['DUMBBELLS', 'BENCH', 'KETTLEBELL', 'BANDS'], recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 75, strengthDaysPerWeek: 2}, schedule: {runDays: [1, 2, 4, 6], strengthDays: [0, 3], longRunMinutes: 120}, rotation: 'COACH_DECIDES'};
const GR = {id: 's08-grad', goals: {run: 'PERFORMANCE', strength: 'NONE'}, runExperience: 'NOVICE', recent: {runDaysPerWeek: 3, runMinutesPerWeek: 80, longestRunMinutes: 35}, schedule: {strengthDays: [], runMinutes: 45}, weeks: 16};
const CHOICES = {ladder: [{type: 'LADDER_STEP', from: 'goblet-squat', to: 'kb-goblet-squat'}], main: [{type: 'MAIN_CHANGE', from: 'goblet-squat', to: 'kb-goblet-squat', reason: 'ATHLETE_PREFERENCE'}], gradAccept: [{offer: 'RUN_QUALITY_GRADUATION', decision: 'ACCEPT'}], gradDecline: [{offer: 'RUN_QUALITY_GRADUATION', decision: 'DECLINE'}], unrecognised: [{type: 'SOMETHING_ELSE'}]};
const tally = {cases: 0, clinical: 0, notClinical: [], proposals: [], pendingMissing: [], controls: []};
for (const [aname, o, weeksReviewed] of [['event-boundary', EV, 4], ['event-midblock', EV, 6], ['grad-boundary', GR, 4]]) {
  const t = reviewed(o, weeksReviewed), w = weeksReviewed, day = t.p.weeks[w].startDate;
  const fixes = t.ledger.filter(x => !x.superseded && !x.correctionOf && t.p.weeks[w - 1].sessions.some(s => s.id === x.sessionId)).slice(0, 2).map(x => ({eventId: x.eventId + '-fix', athleteId: x.athleteId, sessionId: x.sessionId, observedAt: x.observedAt, correctionOf: x.eventId, correctedAt: `${day}T05:00:00Z`, actual: structuredClone(x.actual), response: {...x.response, ...BAD}}));
  const X = t.p.weeks[w].sessions.filter(s => live(s) && s.sport === 'STRENGTH' && s.date > day).flatMap(s => s.prescription.exercises.filter(e => e.role !== 'PRACTICE').map(e => e.id))[0] ?? null;
  const clinical = [
    ...(X ? [['pain', {kind: 'EXERCISE_SUBSTITUTION', substitution: {exerciseId: X, reason: 'NONCLINICAL_DISCOMFORT_OR_PREFERENCE', nonclinicalConfirmed: true, pain: true}}], ['clinical-text', {kind: 'EXERCISE_SUBSTITUTION', substitution: {exerciseId: X, reason: 'SKILL_MISMATCH', text: 'sharp pain in my knee since the last session'}}]] : []),
    ['illness', {kind: 'RETURN_AFTER_PAUSE', interruption: {days: 3, reason: 'Flu illness with fever', nonclinical: true}}]
  ];
  for (const [cname, kind] of clinical) for (const [chname, choices] of Object.entries(CHOICES)) for (const fix of [false, true]) {
    tally.cases++;
    const r = evaluateProgram(t.p, {...review(t.p, w, {day: 0, hour: '06:00:00', ...kind, observations: fix ? fixes : [], choices}), actualLedger: t.ledger}, opts), tag = `${aname} ${cname} ${chname}${fix ? ' +correction' : ''}`;
    if (r.status === 'CLINICAL_HUMAN_REQUIRED') tally.clinical++; else tally.notClinical.push(`${tag}: ${r.status} ${String(r.reason).slice(0, 90)}`);
    if (r.proposal) tally.proposals.push(tag);
    if (r.status === 'CLINICAL_HUMAN_REQUIRED' && r.referenceState?.pending?.status !== 'CLINICAL_HUMAN_REQUIRED') tally.pendingMissing.push(tag);
  }
  // Controls: nonclinical substitution with a choice (off the boundary it is asked; nothing proposed), and the same clinical reports without a choice.
  if (X) { const c = evaluateProgram(t.p, {...review(t.p, w, {day: 0, hour: '06:00:00', kind: 'EXERCISE_SUBSTITUTION', substitution: {exerciseId: X, reason: 'SKILL_MISMATCH'}, choices: CHOICES.ladder}), actualLedger: t.ledger}, opts); tally.controls.push(`${aname} nonclinical substitution + ladder choice: ${c.status} proposal=${!!c.proposal} missing=${JSON.stringify(c.missingInputs)}`); }
  for (const [cname, kind] of clinical) { const c = evaluateProgram(t.p, {...review(t.p, w, {day: 0, hour: '06:00:00', ...kind}), actualLedger: t.ledger}, opts); tally.controls.push(`${aname} ${cname} without a choice: ${c.status} proposal=${!!c.proposal}`); }
}
console.log(JSON.stringify(tally, null, 1));
