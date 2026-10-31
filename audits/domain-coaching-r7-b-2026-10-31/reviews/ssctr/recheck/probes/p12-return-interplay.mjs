// SSCTR R7-B recheck (FREEZE-2) copy of probe p12 (read-only): R7-A returns x B0-C01 graduation, compared with the R6 EASY_CURRENT path under the same timeline.
// After a LONG (> 28 days) nonclinical interruption the run restarts (RESTART -> EASY). R6-RUN-QUALITY C5: quality activates only after
// qualityRequiresEstablishedEasyWeeks executed established easy weeks; the restart's switch to EASY resets easyWeeksDone to 0.
import {reviewed, weekly, review, evaluateProgram, opts, runs, addDays} from '../../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';

const RUN_ONLY = {goals: {run: 'PERFORMANCE', strength: 'NONE'}, schedule: {strengthDays: []}};
const GRAD = {id: 'p12-grad', ...RUN_ONLY, runExperience: 'NOVICE', recent: {runDaysPerWeek: 3, runMinutesPerWeek: 80, longestRunMinutes: 35}, schedule: {strengthDays: [], runMinutes: 45}, weeks: 16};
const CURR = {id: 'p12-curr', ...RUN_ONLY, runExperience: 'INTERMEDIATE', recent: {runDaysPerWeek: 3, runMinutesPerWeek: 90, longestRunMinutes: 40}, schedule: {strengthDays: [], runMinutes: 45}, weeks: 16};
const line = (p, w) => `${p.weeks[w].phase}/${p.stateTrace[w]?.run?.mode}` + ' | ' + runs(p, w).map(s => `${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}${s.prescription.work ? '(' + s.prescription.work.repetitions + 'x' + s.prescription.work.workMinutes + ')' : ''}`).join(' ');

function scenario(base, label, days) {
  const t = reviewed(base, 0);
  for (let w = 0; w < 6; w++) weekly(t, w);
  const stopWeek = 6, start = t.p.weeks[stopWeek].startDate, end = addDays(start, days - 1);
  // Every elapsed week of the break is reviewed with its sessions missed (R18), then the return is reported after it.
  let w = stopWeek;
  while (addDays(t.p.weeks[w].startDate, 6) <= end && w < t.p.weeks.length - 1) { weekly(t, w, {keep: () => false}); w++; }
  const reviewDay = Math.max(0, Math.min(6, (Date.parse(addDays(end, 1)) - Date.parse(t.p.weeks[w].startDate)) / 864e5));
  const r = evaluateProgram(t.p, {...review(t.p, w, {day: reviewDay, kind: 'RETURN_AFTER_PAUSE', interruption: {startDate: start, endDate: end, reasonCategory: 'TRAVEL', nonclinical: true}}), actualLedger: t.ledger}, opts);
  console.log(`\n--- ${label}: ${days}-day break from ${start} to ${end}; return reviewed in week ${w} -> ${r.status} ${r.action} ${r.reason?.slice(0, 120)}`);
  if (!r.proposal) return;
  const P = r.proposal, st = P.stateTrace;
  for (let k = w; k < Math.min(P.weeks.length, w + 9); k++) console.log(`w${k} ${line(P, k)} | easyWeeksDone ${st[k]?.run?.easyWeeksDone} qualityNeeds ${st[k]?.run?.qualityNeeds} qualityStep ${st[k]?.run?.qualityStep}`);
  const asOfDay = addDays(t.p.weeks[w].startDate, reviewDay);
  const firstEasy = [...Array(P.weeks.length).keys()].find(k => k >= w && st[k]?.run?.mode === 'EASY');
  // Only sessions after the return review: sessions already in the past at the review are history.
  const firstQ = [...Array(P.weeks.length).keys()].find(k => k >= w && runs(P, k).some(s => s.role === 'QUALITY' && s.date > asOfDay));
  console.log(`first EASY-mode week ${firstEasy}; first quality week ${firstQ}; established easy weeks before quality: ${firstQ === undefined || firstEasy === undefined ? 'n/a' : firstQ - firstEasy}`);
  const q = firstQ !== undefined ? runs(P, firstQ).find(s => s.role === 'QUALITY') : null;
  if (q) console.log('first quality after the break:', JSON.stringify({work: q.prescription.work, step: q.progression?.value, firstExposure: q.prescription.calibration?.firstExposure}));
}
for (const [base, label] of [[GRAD, 'GRADUATED (EASY_LOW start)'], [CURR, 'EASY_CURRENT comparator']]) {
  scenario(base, label + " LONG", 30);
  scenario(base, label + ' MODERATE', 18);
}
