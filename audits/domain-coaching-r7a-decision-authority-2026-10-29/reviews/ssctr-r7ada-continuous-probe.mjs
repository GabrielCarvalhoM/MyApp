// SSCTR R7ADA-SSCTR-r1 walk/jog -> continuous running boundary (own; prints only). My brief §12: "last factual tolerated = walk/jog step; next
// projected = continuous running; pause: the return cannot treat continuous running as already tolerated". Bounded: the top of the ladder only,
// two athletes (no beginner catalogue):
//  TOP5   WALK_JOG_FIVE_DAYS (fixtures) with a non-novice's current running below the minimum session (INTERMEDIATE, 3 days, 40 min a week,
//         longest run 12 min), so the ladder starts at step 5 (SSCTR D42); 12 weeks; the exit falls in a CONSOLIDATION week;
//  FULL   WALK_JOG_FIVE_DAYS as the fixture (runExperience NONE, step 0), 16 weeks (the intake maximum); the exit falls in a DEVELOPMENT
//         week, too late for its LONG pause, which is skipped (reported as such).
// Both have walk/jog on Mon, Wed and Fri and walks on Tue and Sat. X is the week the plan first prescribes continuous easy runs when every week is
// executed (the walk/jog exit: walkJogExit), found on a reference timeline; L = X-1 is the last ladder week (step 8, 1 x 20 min jog).
// Cells (the pause starts on Monday of week X unless said otherwise):
//  EXIT_EARNED_REVIEWED   weeks 0..L executed and reviewed: the evidence releases the exit, no continuous easy run executed yet;
//  EXIT_EARNED_UNREVIEWED weeks 0..L-1 reviewed, week L reported day by day and never reviewed (complete, so history may still credit it);
//  EXIT_HELD              week L with one walk/jog session missed, reviewed (HOLD at the last step);
//  EXIT_PROJECTED_ONLY    week L nothing executed, reviewed (the last step only released, the exit only projected);
//  EXIT_PROJECTED_OPEN    week L nothing reported and never reviewed (the plan still projects the exit for week X);
//  ONE_CONTINUOUS_RUN     as EXIT_EARNED_REVIEWED plus Monday of week X (the first continuous easy run) executed; the pause starts Tuesday (P7).
// Cross-week cells at the boundary: EXIT_COMPLETE_CROSSWEEK and EXIT_INCOMPLETE_CROSSWEEK (SHORT; see the code).
// Pauses: SHORT (to Friday, reported Saturday 07:00), MODERATE (14 days, reported two weeks later at 07:00 on the pause's start weekday), LONG
// (33 days). No pause (Founder §13, two unexecuted weeks; TOP5 only): weeks 0-1 reviewed, weeks 2-3 nothing reported, then an empty mid-week report
// in week 4 and the empty review of week 4.
// Readings: the session last run and the longest continuous jog executed (a walk/jog step's jog segment or a continuous run's duration), the
// largest executed week and the week the plan prescribed before the pause (running sessions, jogging minutes); HistoricalState at the pause; the return's entry; the runs from the return point to the
// end of the week after re-entry, with per-week running sessions and jogging minutes. Flags, two views:
//  ladderView   when the last session run was a walk/jog step: a continuous-mode session (EASY, LONG, RETURN or RESTART run) in that span, or a
//               walk/jog step above the recipe (SHORT the step last run, MODERATE one below, LONG the ladder start; the exit is the step after
//               the last step);
//  durationView a continuous session in that span longer than the longest continuous jog executed before the pause;
//  weeklyView   the re-entry week or the week after it with more running sessions, or more jogging minutes, than both the largest executed week
//               and the week the plan prescribed before the pause (the running sessions also against walkJogExit.maxRunsPerWeek).
// Read-only runtime use; synthetic data; DEV_TEST_ONLY authority.
import * as L from './ssctr-r7ada-lib.mjs';

const {PROFILES, EDGE_PROFILES} = await L.loadProfiles();
const BASE = {...PROFILES, ...EDGE_PROFILES}.WALK_JOG_FIVE_DAYS;
const ATHLETES = {
  TOP5: (() => { const p = structuredClone(BASE); p.weeks = 12; p.athlete.id = 'ssctr-r7ada-wj-top5'; p.athlete.runExperience = 'INTERMEDIATE';
    p.athlete.recent = {...p.athlete.recent, runDaysPerWeek: 3, runMinutesPerWeek: 40, longestRunMinutes: 12}; return p; })(),
  FULL: (() => { const p = structuredClone(BASE); p.weeks = 16; p.athlete.id = 'ssctr-r7ada-wj-full'; return p; })(),
};
const CONT = ['EASY', 'LONG', 'QUALITY'];
const atOf = s => Date.parse(`${s.date}T${s.turn === 'PM' ? '19:00:00' : '08:00:00'}Z`);
const span = (t, fromW, fromAt) => {
  const rows = [];
  for (let w = fromW; w <= fromW + 2 && w < t.p.weeks.length; w++) for (const s of t.p.weeks[w].sessions.filter(L.isRun)) {
    if (w === fromW && atOf(s) <= fromAt) continue;
    rows.push({week: w, date: s.date, role: s.role, min: s.prescription.durationMinutes, step: s.role === 'WALK_JOG' ? s.progression?.value : null, cont: L.continuousMinutes(s), dim: s.progression?.dimension ?? null, val: s.progression?.value ?? null});
  }
  return rows;
};
/** Running sessions and jogging minutes a set of prescribed rows asks for (walks excluded; a walk/jog step counts its jog segments). */
const sumRows = rows => { const r = rows.filter(x => x.role !== 'WALK'); return {runningSessions: r.length, jogMinutes: r.reduce((a, x) => a + (x.role === 'WALK_JOG' ? L.LADDER[x.step].repetitions * L.LADDER[x.step].jogSeconds / 60 : x.min), 0), walks: rows.length - r.length}; };
/** The executed week containing `date`: running sessions and jogging minutes executed. */
const weekTotals = (t, date) => { const w = t.p.weeks.findIndex(x => date >= x.startDate && date <= L.addDays(x.startDate, 6)); const ss = t.p.weeks[w].sessions.filter(s => L.isRun(s) && s.role !== 'WALK' && L.reported(t, s.id));
  return {week: w, runningSessions: ss.length, jogMinutes: ss.reduce((a, s) => a + L.jogMinutes(s), 0)}; };
const txt = r => `w${r.week} ${r.date.slice(5)} ${r.role}:${r.min}${r.step !== null ? ' step ' + r.step : r.dim ? ' ' + r.dim + '=' + r.val : ''}`;
const totals = {cells: 0, ladderViewAbove: 0, durationViewAbove: 0, weeklyAboveExecutedAndPrior: 0, byCell: {}, examples: []};
const out = {probe: 'R7ADA-SSCTR-r1-CONTINUOUS-BOUNDARY', runtime: L.TREE, walkJogExit: L.OP.run.walkJogExit, singleRunCeiling: L.OP.run.singleRunCeiling, ladderTop: L.LADDER.at(-1), athletes: {}};
for (const [aName, profile] of Object.entries(ATHLETES)) {
  const fresh = () => L.genFrom(structuredClone(profile));
  // The reference: every week executed and reviewed; X is the first week whose plan prescribes continuous easy runs.
  const ref = fresh(); let X = null;
  for (let w = 0; w < ref.p.weeks.length - 1 && X === null; w++) { L.weekly(ref, w); if (L.runOf(ref, w + 1).some(x => CONT.includes(x.role))) X = w + 1; }
  const A = out.athletes[aName] = {weeks: profile.weeks, exitWeek: X, exitPhase: X !== null ? ref.p.weeks[X].phase : null, referenceLadder: X === null ? null : [X - 2, X - 1, X, X + 1].filter(w => w >= 0 && w < ref.p.weeks.length).map(w => `w${w} ${ref.p.weeks[w].phase}: ${L.runOf(ref, w).map(L.runText).join(' | ')}`), cells: {}};
  if (X === null || X + 3 >= profile.weeks) { A.error = 'exit not reached early enough for the pauses'; continue; }
  const Lw = X - 1;
  const SETUPS = {
    EXIT_EARNED_REVIEWED: t => { for (let w = 0; w <= Lw; w++) L.weekly(t, w); return 0; },
    EXIT_EARNED_UNREVIEWED: t => { for (let w = 0; w < Lw; w++) L.weekly(t, w); L.perDay(t, Lw); return 0; },
    EXIT_HELD: t => { for (let w = 0; w < Lw; w++) L.weekly(t, w); const id = t.p.weeks[Lw].sessions.filter(L.WJ)[0].id; L.weekly(t, Lw, s => s.id !== id); return 0; },
    EXIT_PROJECTED_ONLY: t => { for (let w = 0; w < Lw; w++) L.weekly(t, w); L.weekly(t, Lw, () => false); return 0; },
    EXIT_PROJECTED_OPEN: t => { for (let w = 0; w < Lw; w++) L.weekly(t, w); return 0; },
    ONE_CONTINUOUS_RUN: t => { for (let w = 0; w <= Lw; w++) L.weekly(t, w); const s = t.p.weeks[X].sessions.filter(L.isRun).find(x => x.day === 0);
      L.step(t, L.at(t.p, X, 0, '21:00:00', {observations: [L.obs(t.p, s)]})); return 1; },
  };
  const PAUSES = {
    SHORT: (t, d0) => ({start: L.addDays(t.p.weeks[X].startDate, d0), end: L.addDays(t.p.weeks[X].startDate, 4), report: {w: X, day: 5, hour: '07:00:00'}}),
    MODERATE: (t, d0) => ({start: L.addDays(t.p.weeks[X].startDate, d0), end: L.addDays(t.p.weeks[X].startDate, d0 + 13), report: {w: X + 2, day: d0, hour: '07:00:00'}}),
    LONG: (t, d0) => ({start: L.addDays(t.p.weeks[X].startDate, d0), end: L.addDays(t.p.weeks[X].startDate, d0 + 32), report: {w: X + 4, day: Math.min(6, d0 + 5), hour: '07:00:00'}}),
  };
  for (const [name, setup] of Object.entries(SETUPS)) for (const [pName, pause] of Object.entries(PAUSES)) {
    const t = fresh(), d0 = setup(t), P = pause(t, d0), label = `${aName}/${name}/${pName}`;
    if (P.report.w + 1 >= t.p.weeks.length) { A.cells[`${name}/${pName}`] = 'skipped: the pause ends beyond the program'; continue; }
    const ran = L.runsExecuted(t).filter(x => x.date < P.start && x.role !== 'WALK'), last = ran.at(-1) ?? null, longestCont = Math.max(0, ...ran.map(x => x.cont ?? 0));
    const lastWeek = ran.length ? weekTotals(t, ran.at(-1).date) : null;
    const executedWeeks = [...new Set(ran.map(x => t.p.weeks.findIndex(w => x.date >= w.startDate && x.date <= L.addDays(w.startDate, 6))))].map(w => weekTotals(t, t.p.weeks[w].startDate));
    const maxWeek = {runningSessions: Math.max(0, ...executedWeeks.map(x => x.runningSessions)), jogMinutes: Math.max(0, ...executedWeeks.map(x => x.jogMinutes))};
    const priorPlanned = sumRows(t.p.weeks[X].sessions.filter(L.isRun).map(s => ({role: s.role, min: s.prescription.durationMinutes, step: s.role === 'WALK_JOG' ? s.progression?.value : null})));
    const cell = A.cells[`${name}/${pName}`] = {pause: `${P.start}..${P.end}`, lastSessionRun: last && `${last.date} ${last.role}${last.role === 'WALK_JOG' ? ' step ' + last.val : ':' + last.min}`, longestContinuousExecuted: longestCont,
      lastExecutedWeek: lastWeek, historyAtPause: L.histRun(t, X, d0, '00:30:00'), planWeekXBeforePause: L.runOf(t, X).map(L.runText)};
    const r = L.step(t, L.at(t.p, P.report.w, P.report.day, P.report.hour, L.brk(P.start, P.end)));
    cell.return = `${r.status}/${r.action}`; cell.entry = L.entryRun(r);
    const reportAt = Date.parse(`${L.addDays(t.p.weeks[P.report.w].startDate, P.report.day)}T${P.report.hour}Z`);
    const rows = span(t, P.report.w, reportAt);
    cell.returnSpan = rows.map(txt);
    cell.returnWeeks = [...new Set(rows.map(x => x.week))].map(w => ({week: w, ...sumRows(rows.filter(x => x.week === w))}));
    const lastWasWalkJog = last?.role === 'WALK_JOG', allowed = !last ? null : pName === 'SHORT' ? last.val : pName === 'MODERATE' ? Math.max(0, (last.val ?? 0) - 1) : 0;
    // The recipe applies to the re-entry week; the next week is a conditional projection.
    const reentry = rows.length ? rows[0].week : null, inReentry = rows.filter(x => x.week === reentry), contRows = inReentry.filter(x => CONT.includes(x.role));
    cell.ladderView = lastWasWalkJog ? {lastStep: last.val, recipeAllows: allowed, reentryWeek: reentry, continuousSessions: contRows.map(txt), walkJogAbove: inReentry.filter(x => x.step !== null && x.step > allowed).map(txt)} : 'last session run was continuous';
    cell.durationView = {longestContinuousExecuted: longestCont, longer: contRows.filter(x => x.min > longestCont).map(txt)};
    const reentryTotals = sumRows(inReentry);
    // Weekly view: the re-entry week against the largest week executed before the pause and the week the plan prescribed before it (the prior dose
    // a return returns to): more running sessions than both (and than walkJogExit.maxRunsPerWeek), or more jogging minutes than both.
    const maxRuns = Math.max(L.OP.run.walkJogExit.maxRunsPerWeek, maxWeek.runningSessions, priorPlanned.runningSessions), maxJog = Math.max(maxWeek.jogMinutes, priorPlanned.jogMinutes);
    const nextWeek = rows.filter(x => x.week === reentry + 1), nextTotals = sumRows(nextWeek);
    cell.weeklyView = {largestExecutedWeek: maxWeek, plannedWeekBeforePause: priorPlanned, reentryWeek: reentryTotals, followingWeek: nextTotals,
      above: reentryTotals.runningSessions > maxRuns || reentryTotals.jogMinutes > maxJog || nextTotals.runningSessions > maxRuns || nextTotals.jogMinutes > maxJog};
    totals.cells++;
    const flags = [];
    if (lastWasWalkJog && (contRows.length || cell.ladderView.walkJogAbove.length)) { totals.ladderViewAbove++; flags.push('ladder'); if (totals.examples.length < 30) totals.examples.push(`${label} ladder: last run step ${last.val}, recipe ${allowed}: ${[...cell.ladderView.continuousSessions, ...cell.ladderView.walkJogAbove].slice(0, 3).join('; ')}`); }
    if (cell.durationView.longer.length) { totals.durationViewAbove++; flags.push('duration'); if (totals.examples.length < 30) totals.examples.push(`${label} duration: longest continuous executed ${longestCont} min: ${cell.durationView.longer.slice(0, 3).join('; ')}`); }
    if (cell.weeklyView.above) { totals.weeklyAboveExecutedAndPrior++; flags.push('weekly'); if (totals.examples.length < 30) totals.examples.push(`${label} weekly: re-entry week ${reentryTotals.runningSessions} runs / ${reentryTotals.jogMinutes} min, next ${nextTotals.runningSessions} / ${nextTotals.jogMinutes}, against the largest executed week ${maxWeek.runningSessions} / ${maxWeek.jogMinutes} and the planned prior week ${priorPlanned.runningSessions} / ${priorPlanned.jogMinutes}`); }
    totals.byCell[label] = flags;
    cell.log = t.log;
  }
  // Cross-week pauses at the boundary (same check): week L's Monday, Wednesday and Friday sessions reported each evening, never reviewed, then
  //  EXIT_COMPLETE_CROSSWEEK  a SHORT pause from Saturday of week L to Wednesday of week X, reported Thursday 07:00 of week X (week L complete);
  //  EXIT_INCOMPLETE_CROSSWEEK Monday and Wednesday only, a SHORT pause from Thursday of week L to Monday of week X, reported Tuesday 07:00 (week L
  //                           incomplete: the exit is not released).
  for (const [name, keepDays, startDay, endDay, report] of [['EXIT_COMPLETE_CROSSWEEK', [0, 2, 4], 5, 2, {w: X, day: 3}], ['EXIT_INCOMPLETE_CROSSWEEK', [0, 2], 3, 0, {w: X, day: 1}]]) {
    const t = fresh(), label = `${aName}/${name}/SHORT`;
    for (let w = 0; w < Lw; w++) L.weekly(t, w);
    for (const s of t.p.weeks[Lw].sessions.filter(s => L.WJ(s) && keepDays.includes(s.day))) L.step(t, L.at(t.p, Lw, s.day, '21:00:00', {observations: [L.obs(t.p, s)]}));
    const start = L.addDays(t.p.weeks[Lw].startDate, startDay), end = L.addDays(t.p.weeks[X].startDate, endDay);
    const ran = L.runsExecuted(t).filter(x => x.date < start && x.role !== 'WALK'), last = ran.at(-1) ?? null, longestCont = Math.max(0, ...ran.map(x => x.cont ?? 0));
    const cell = A.cells[`${name}/SHORT`] = {pause: `${start}..${end}`, lastSessionRun: last && `${last.date} ${last.role}${last.role === 'WALK_JOG' ? ' step ' + last.val : ':' + last.min}`, longestContinuousExecuted: longestCont, historyAtPause: L.histRun(t, X, 0, '00:30:00')};
    const r = L.step(t, L.at(t.p, report.w, report.day, '07:00:00', L.brk(start, end)));
    cell.return = `${r.status}/${r.action}`; cell.entry = L.entryRun(r);
    const reportAt = Date.parse(`${L.addDays(t.p.weeks[report.w].startDate, report.day)}T07:00:00Z`), rows = span(t, report.w, reportAt);
    cell.returnSpan = rows.map(txt);
    const reentry = rows.length ? rows[0].week : null, inReentry = rows.filter(x => x.week === reentry), contRows = inReentry.filter(x => CONT.includes(x.role)), allowed = last?.role === 'WALK_JOG' ? last.val : null;
    cell.ladderView = {lastStep: last?.val ?? null, recipeAllows: allowed, reentryWeek: reentry, continuousSessions: contRows.map(txt), walkJogAbove: allowed === null ? [] : inReentry.filter(x => x.step !== null && x.step > allowed).map(txt)};
    cell.durationView = {longestContinuousExecuted: longestCont, longer: contRows.filter(x => x.min > longestCont).map(txt)};
    totals.cells++;
    const flags = [];
    if (allowed !== null && (contRows.length || cell.ladderView.walkJogAbove.length)) { totals.ladderViewAbove++; flags.push('ladder'); if (totals.examples.length < 30) totals.examples.push(`${label} ladder: last run step ${allowed}: ${[...cell.ladderView.continuousSessions, ...cell.ladderView.walkJogAbove].slice(0, 3).join('; ')}`); }
    if (cell.durationView.longer.length) { totals.durationViewAbove++; flags.push('duration'); }
    totals.byCell[label] = flags;
    cell.log = t.log;
  }
}
{
  // Two unexecuted weeks, no pause (TOP5): weeks 0-1 reviewed (step 6 run, 7 released), weeks 2-3 nothing reported, then an empty mid-week report
  // in week 4 and the empty review of week 4.
  const t = L.genFrom(structuredClone(ATHLETES.TOP5)); for (let w = 0; w <= 1; w++) L.weekly(t, w);
  const before = {week2: L.runOf(t, 2).map(L.runText), week4: L.runOf(t, 4).map(L.runText)};
  const mid = L.step(t, L.at(t.p, 4, 2, '12:00:00', {observations: []}));
  const afterMid = {decision: `${mid.status}/${mid.action}`, week4: L.runOf(t, 4).map(L.runText), week5: L.runOf(t, 5).map(L.runText)};
  L.weekly(t, 4, () => false);
  const cell = out.noPauseTwoEmptyWeeks = {lastStepRun: L.walkStepsExecuted(t).at(-1)?.val ?? null, planBefore: before, afterEmptyMidWeekReport: afterMid,
    afterEmptyWeek4Review: {decision: `${t.last.status}/${t.last.action}`, week5: L.runOf(t, 5).map(L.runText), week6: L.runOf(t, 6).map(L.runText)}, historyWeek5: L.histRun(t, 5)};
  cell.week5Continuous = L.runOf(t, 5).filter(x => CONT.includes(x.role)).map(L.runText);
  cell.week5StepsAboveReleased = L.runOf(t, 5).filter(x => x.role === 'WALK_JOG' && x.val > 7).map(L.runText);
  cell.log = t.log;
}
out.totals = totals;
console.log(JSON.stringify(out, null, 1));
