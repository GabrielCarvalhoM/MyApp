// SSCTR R7ADA-SSCTR-r1 progression authority (own; prints only). My brief §13: projected progression is not earned progression. Without adequate
// execution the threshold does not advance, QUALITY and strides are not released by the calendar or the plan, the long run does not jump and the
// walk/jog step does not rise (the walk/jog side is in my matrix and continuous-boundary probes); with partial execution the existing partial/
// missed/review policies apply, so executed dimensions still progress (no "perfect training only" rule). Bounded: two athletes.
//  EASY   the intermediate runner of my probes (EASY_CURRENT: 3 runs a week Tue/Thu/Sun, 150 min, longest 70; quality and strides after two
//         executed established easy weeks; strength GENERAL with no known loads, so week 0 is establishment), 16 weeks;
//  FAMQ   the same runner with a current familiar threshold task (4 x 5 min, QUALITY_FAMILIAR: quality from week 1 at the familiar step).
// Cells (the decision under test and the week it plans):
//  REF               every week executed and reviewed (the earned path, for comparison);
//  EMPTY_REVIEWED    week 0 executed and reviewed, weeks 1-2 reviewed with nothing executed: week 3 as the week-2 review plans it;
//  EMPTY_OPEN        week 0 executed and reviewed, weeks 1-2 never reported nor reviewed; an empty mid-week report in week 3 (no re-plan: the
//                    standing projection, R1, Founder-owned, recorded only), then the empty review of week 3: week 4 as it plans it;
//  LONG_MISSED       week 0 executed; week 1 easy (and quality) executed, long run missed, reviewed; week 2 all executed, reviewed;
//  QUALITY_MISSED    as REF but each quality session missed (easy and long executed) in weeks 1-2;
//  PARTIAL_EASY      as REF but one easy run missed in week 1 (quality, long and the other easy run executed).
// Per decision: the run of the week it plans (QUALITY and its step, strides, easy and long minutes) and HistoricalState's run at that week's start
// (easyWeeksDone, qualityStep, thresholdDone, stridesDone, long, easy). Flags: QUALITY or strides in a week whose history has fewer executed
// established easy weeks than the policy requires; a threshold step above history's; a long run more than one step above the longest executed
// long run; for the partial cells, whether the executed dimensions still progressed. Read-only runtime use; synthetic data; DEV_TEST_ONLY.
import * as L from './ssctr-r7ada-lib.mjs';

const R = L.OP.run, NEED_Q = R.qualityRequiresEstablishedEasyWeeks, NEED_S = R.strides.requiresEstablishedEasyWeeks;
const FAM = {prescription: {modality: 'RUN', family: 'THRESHOLD', durationMinutes: 46, warmupMinutes: 12, cooldownMinutes: 8, effortDomain: 'THRESHOLD_CONTROLLED', effort: 'Comfortably hard and controlled', equipment: [], work: {repetitions: 4, workMinutes: 5, recoveryMinutes: 2}}, current: true, familiar: true, tolerated: true, observedAt: '2026-10-28'};
const ATHLETES = {
  EASY: () => L.gen({id: 'ssctr-r7ada-prog-easy', goal: 'GENERAL', run: 'PERFORMANCE'}),
  FAMQ: () => L.gen({id: 'ssctr-r7ada-prog-famq', goal: 'GENERAL', run: 'PERFORMANCE', athlete: {knownRuns: [FAM]}}),
};
const ROLE = r => s => L.isRun(s) && s.role === r;
const plan = (t, w) => { const rs = (t.p.weeks[w]?.sessions ?? []).filter(L.isRun);
  return {week: w, phase: t.p.weeks[w]?.phase, quality: rs.filter(s => s.role === 'QUALITY').map(s => `${s.prescription.family} ${s.prescription.work ? s.prescription.work.repetitions + 'x' + s.prescription.work.workMinutes : ''} step ${s.progression?.value ?? '-'}`),
    qualityStep: Math.max(-1, ...rs.filter(s => s.role === 'QUALITY' && s.progression?.dimension === 'THRESHOLD_STEP').map(s => s.progression.value)),
    strides: Math.max(0, ...rs.map(s => s.prescription.strides?.repetitions ?? 0)), easy: rs.filter(s => s.role === 'EASY').map(s => s.prescription.durationMinutes), long: rs.filter(s => s.role === 'LONG').map(s => s.prescription.durationMinutes)}; };
const hist = (t, w) => { const H = L.history(t, w, 0, '00:30:00'); if (!H) return null; const r = H.state.run; return {mode: r.mode, easyWeeksDone: r.easyWeeksDone ?? null, qualityStep: r.qualityStep ?? null, thresholdDone: r.thresholdDone ?? null, stridesDone: r.stridesDone ?? null, qualityNeeds: r.qualityNeeds ?? null, easy: r.easy ?? null, long: r.long ?? null}; };
const longestLongRun = t => Math.max(0, ...L.runsExecuted(t).filter(x => x.role === 'LONG').map(x => x.min));
const totals = {decisions: 0, qualityWithoutEarnedWeeks: 0, stridesWithoutEarnedWeeks: 0, thresholdAboveHistory: 0, longAboveExecutedPlusStep: 0, examples: []};
const flag = (k, s) => { totals[k]++; if (totals.examples.length < 30) totals.examples.push(s); };
function check(t, label, w) {
  const P = plan(t, w), H = hist(t, w), cell = {plan: P, history: H, longestExecutedLong: longestLongRun(t)};
  totals.decisions++;
  if (H) {
    const needQ = H.qualityNeeds ?? NEED_Q;
    if (P.quality.length && (H.easyWeeksDone ?? 0) < needQ) flag('qualityWithoutEarnedWeeks', `${label} w${w}: QUALITY ${P.quality.join(', ')} with ${H.easyWeeksDone} executed established easy weeks (needs ${needQ})`);
    if (P.strides > 0 && (H.easyWeeksDone ?? 0) < NEED_S) flag('stridesWithoutEarnedWeeks', `${label} w${w}: strides ${P.strides} with ${H.easyWeeksDone} executed established easy weeks (needs ${NEED_S})`);
    if (P.qualityStep >= 0 && Number.isInteger(H.qualityStep) && P.qualityStep > H.qualityStep) flag('thresholdAboveHistory', `${label} w${w}: threshold step ${P.qualityStep} above history's ${H.qualityStep}`);
  }
  const lmax = cell.longestExecutedLong;
  if (lmax > 0 && P.long.some(x => x > lmax + R.longRunStepMinutes)) flag('longAboveExecutedPlusStep', `${label} w${w}: long ${P.long.join(',')} > longest executed long ${lmax} + ${R.longRunStepMinutes}`);
  return cell;
}
const out = {probe: 'R7ADA-SSCTR-r1-PROGRESSION-AUTHORITY', runtime: L.TREE, policy: {qualityRequiresEstablishedEasyWeeks: NEED_Q, stridesRequiresEstablishedEasyWeeks: NEED_S, longRunStepMinutes: R.longRunStepMinutes}, athletes: {}};
for (const [aName, mk] of Object.entries(ATHLETES)) {
  const A = out.athletes[aName] = {};
  { const t = mk(); const cells = A.REF = {phases: t.p.weeks.slice(0, 7).map(w => w.phase), weeks: []};
    for (let w = 0; w <= 5; w++) { L.weekly(t, w); cells.weeks.push(check(t, `${aName}/REF`, w + 1)); } }
  { const t = mk(); L.weekly(t, 0); L.weekly(t, 1, () => false); L.weekly(t, 2, () => false); A.EMPTY_REVIEWED = {week3: check(t, `${aName}/EMPTY_REVIEWED`, 3), log: t.log}; }
  { const t = mk(); L.weekly(t, 0);
    const mid = L.step(t, L.at(t.p, 3, 2, '12:00:00', {observations: []}));
    const standing = {decision: `${mid.status}/${mid.action}`, week3AsStored: plan(t, 3), note: 'R1 standing projection (Founder-owned): recorded, not judged'};
    L.weekly(t, 3, () => false);
    A.EMPTY_OPEN = {standingProjectionAfterEmptyMidWeekReport: standing, week4: check(t, `${aName}/EMPTY_OPEN`, 4), log: t.log}; }
  { const t = mk(); L.weekly(t, 0); L.weekly(t, 1, s => !ROLE('LONG')(s)); const w2 = check(t, `${aName}/LONG_MISSED`, 2); L.weekly(t, 2); const w3 = check(t, `${aName}/LONG_MISSED`, 3);
    A.LONG_MISSED = {week2: w2, week3: w3, longPlannedWeek1: plan(mk(), 1).long}; }
  { const t = mk(); L.weekly(t, 0); const ws = []; for (let w = 1; w <= 2; w++) { L.weekly(t, w, s => !ROLE('QUALITY')(s)); ws.push(check(t, `${aName}/QUALITY_MISSED`, w + 1)); } L.weekly(t, 3); ws.push(check(t, `${aName}/QUALITY_MISSED`, 4)); A.QUALITY_MISSED = {weeks: ws}; }
  { const t = mk(); L.weekly(t, 0); const easy1 = t.p.weeks[1].sessions.filter(ROLE('EASY'))[0]?.id; L.weekly(t, 1, s => s.id !== easy1); const w2 = check(t, `${aName}/PARTIAL_EASY`, 2); L.weekly(t, 2); const w3 = check(t, `${aName}/PARTIAL_EASY`, 3);
    A.PARTIAL_EASY = {week2: w2, week3: w3}; }
}
// Partial execution still progresses what was executed (no "perfect training only" rule): compare with REF.
const progressed = {};
for (const [aName, A] of Object.entries(out.athletes)) {
  const ref = w => A.REF.weeks.find(x => x.plan.week === w)?.plan;
  progressed[aName] = {
    LONG_MISSED: {week2LongHeld: JSON.stringify(A.LONG_MISSED.week2.plan.long) === JSON.stringify(A.LONG_MISSED.longPlannedWeek1), week2EasyAsRef: JSON.stringify(A.LONG_MISSED.week2.plan.easy) === JSON.stringify(ref(2)?.easy), week3Quality: A.LONG_MISSED.week3.plan.quality, refWeek3Quality: ref(3)?.quality},
    QUALITY_MISSED: {qualitySteps: A.QUALITY_MISSED.weeks.map(x => x.plan.qualityStep), refQualitySteps: [2, 3, 4].map(w => ref(w)?.qualityStep), easy: A.QUALITY_MISSED.weeks.map(x => x.plan.easy), refEasy: [2, 3, 4].map(w => ref(w)?.easy), long: A.QUALITY_MISSED.weeks.map(x => x.plan.long), refLong: [2, 3, 4].map(w => ref(w)?.long)},
    PARTIAL_EASY: {week2: A.PARTIAL_EASY.week2.plan, refWeek2: ref(2), week3: A.PARTIAL_EASY.week3.plan, refWeek3: ref(3)},
  };
}
out.partialExecution = progressed;
out.totals = totals;
console.log(JSON.stringify(out, null, 1));
