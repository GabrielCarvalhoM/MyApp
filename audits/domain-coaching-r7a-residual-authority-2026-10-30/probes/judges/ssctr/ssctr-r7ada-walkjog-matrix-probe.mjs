// SSCTR R7ADA-SSCTR-r1 walk/jog matrix (own; prints only). F4 beyond my 12-cell R7ASC probe: does a walk/jog return ever start above the step the
// athlete last ran? Profile WALK_JOG_FIVE_DAYS (fixtures) run over 12 weeks (w0 ESTABLISHMENT, w1-3 DEVELOPMENT, w4 CONSOLIDATION, w5-7
// DEVELOPMENT, w8 CONSOLIDATION, w9-11 DEVELOPMENT); walk/jog on Mon, Wed and Fri, walks on Tue and Sat.
// Matrix A (pause -> held week -> second pause -> return, Founder §18/§20):
// Re-entry week: the report week when the return re-plans the sessions still ahead of it, else the next week. Its steps must be within the
// recipe; the week after it is projected conditionally on the re-entry week and may be one step above.
//  first pause  CROSS  SHORT, Tuesday of week F to Wednesday of F+1, reported Thursday 07:00 of F+1 (cross-week; my R7ASC probe's first break);
//               SAME   SHORT, Tuesday to Thursday of week F, reported Friday 07:00 of F (same-week);
//               MOD    MODERATE, 14 days from Tuesday of week F, reported Tuesday 07:00 of F+2;
//               the sessions from the report on are executed and the week reviewed;
//  held week    CONS (week 4, CONSOLIDATION: no step) or DEV (week 3, DEVELOPMENT), executed ALL (ADVANCE; in CONS the phase holds),
//               ONE_MISSED (one walk/jog session not done: HOLD) or NONE (no walk/jog session: HOLD), reviewed on Sunday;
//  second pause in the week after: SHORT (Tuesday-Saturday, reported Sunday 07:00), MODERATE (12 days from Tuesday, reported Sunday 07:00 of
//               the next week) or LONG (33 days from Tuesday);
//  third pause  (repeated pause) after a SHORT or MODERATE second return: the first week back executed and reviewed, then Monday run and a SHORT
//               pause Tuesday-Saturday reported Sunday 07:00.
// Matrix B (Founder §20's essential case, "step A tolerated, step B only projected, pause -> the return must not start at B"): weeks 0..k
// executed and reviewed (k = 2, DEVELOPMENT: history releases step A+1 = B), then week k+1:
//  B_HELD_EMPTY  nothing executed, reviewed on Sunday (HOLD);   B_OPEN  nothing reported and nothing reviewed;
//  B_RUN_ONCE    Monday's session at B executed and reported (control, P7: B is then run);
// then a pause from Monday of week k+2 (SHORT to Friday, reported Saturday 07:00; MODERATE 14 days; LONG 33 days).
// The recipe (R6-NONCLINICAL-RETURN: re-entry returns to the prior tolerated dose; historical maxima are a ceiling, not current proof; contract
// C' W2/P6): SHORT resumes at most the step last run, MODERATE at most one below it, LONG restarts the ladder (step 0). Flags: the entry above
// it; any walk/jog step from the return point to the end of the first week back above it; any continuous run in that span; and, one executed
// week later, a step more than one above the recipe (a step needs an executed week). Read-only runtime use; synthetic data; DEV_TEST_ONLY.
import * as L from './ssctr-r7ada-lib.mjs';

const {PROFILES, EDGE_PROFILES} = await L.loadProfiles();
const PROFILE = (() => { const p = structuredClone({...PROFILES, ...EDGE_PROFILES}.WALK_JOG_FIVE_DAYS); p.weeks = 12; return p; })();
const fresh = () => L.genFrom(structuredClone(PROFILE));
const stepsIn = (t, w, pred = () => true) => (t.p.weeks[w]?.sessions ?? []).filter(s => L.WJ(s) && pred(s)).map(s => s.progression?.value);
const contIn = (t, w, pred = () => true) => (t.p.weeks[w]?.sessions ?? []).filter(s => L.isRun(s) && ['EASY', 'LONG', 'QUALITY'].includes(s.role) && pred(s)).map(s => `${s.date.slice(5)} ${s.role}:${s.prescription.durationMinutes}`);
const lastRunBefore = (t, date) => { const r = L.walkStepsExecuted(t).filter(x => x.date < date); return r.length ? r.at(-1).val : null; };
const maxRunBefore = (t, date) => { const r = L.walkStepsExecuted(t).filter(x => x.date < date); return r.length ? Math.max(...r.map(x => x.val)) : null; };
const allowedFor = (cls, last) => last === null ? null : cls === 'SHORT' ? last : cls === 'MODERATE' ? Math.max(0, last - 1) : 0;
const totals = {returns: 0, entryAbove: 0, spanAbove: 0, continuousInSpan: 0, followingAboveRecipePlusOne: 0, secondWeekAboveRecipePlusOne: 0, asked: 0, refused: 0, examples: []};
const flag = (key, text) => { totals[key]++; if (totals.examples.length < 30) totals.examples.push(text); };

/** A pause of class cls starting at `start` (a date), reported at `report` ({w, day, hour}); returns the return's record and checks it. */
function pauseAndCheck(t, label, cls, start, end, report) {
  const last = lastRunBefore(t, start), maxRun = maxRunBefore(t, start), allowed = allowedFor(cls, last);
  const r = L.step(t, L.at(t.p, report.w, report.day, report.hour, L.brk(start, end)));
  const rec = {class: cls, pause: `${start}..${end}`, reportedAt: `w${report.w} d${report.day} ${report.hour}`, result: `${r.status}/${r.action}`, lastStepRun: last, highestStepRun: maxRun, recipeAllows: allowed, entry: L.entryRun(r)};
  totals.returns++;
  if (r.action === 'ASK') { totals.asked++; rec.ask = r.reason ?? r.decision?.reason ?? null; return {rec, firstBack: null}; }
  if (!r.proposal) { totals.refused++; rec.refused = true; return {rec, firstBack: null}; }
  const reportDate = L.addDays(t.p.weeks[report.w].startDate, report.day), reportAt = Date.parse(`${reportDate}T${report.hour}Z`);
  const ahead = s => Date.parse(`${s.date}T${s.turn === 'PM' ? '19:00:00' : '08:00:00'}Z`) > reportAt;
  // The re-entry week: this week when the return re-plans sessions still ahead of the report (the runtime starts re-entry here when two or more
  // remain), else the next week. Its steps must be within the recipe; the week after it is a conditional projection and may be one step above.
  const restThis = stepsIn(t, report.w, ahead), contThis = contIn(t, report.w, ahead), reentry = restThis.length ? report.w : report.w + 1;
  const firstBack = reentry < t.p.weeks.length ? reentry : null, next = reentry + 1 < t.p.weeks.length ? reentry + 1 : null;
  const reentrySteps = reentry === report.w ? restThis : firstBack === null ? [] : stepsIn(t, firstBack), reentryCont = reentry === report.w ? contThis : firstBack === null ? [] : contIn(t, firstBack);
  rec.reentryWeek = firstBack === null ? 'beyond the program' : {week: reentry, phase: t.p.weeks[reentry].phase, steps: reentrySteps, continuous: reentryCont};
  rec.followingWeek = next === null ? 'beyond the program' : {week: next, steps: stepsIn(t, next), continuous: contIn(t, next), conditionalOnTheReentryWeek: true};
  if (allowed !== null) {
    if (rec.entry?.mode === 'WALK_JOG' && rec.entry.walkStep > allowed) { rec.entryAbove = true; flag('entryAbove', `${label}: entry step ${rec.entry.walkStep} > recipe ${allowed} (last run ${last}, ${cls})`); }
    const above = reentrySteps.filter(x => x > allowed);
    if (above.length) { rec.spanAbove = above; flag('spanAbove', `${label}: re-entry week steps ${above.join(',')} > recipe ${allowed} (last run ${last}, ${cls})`); }
    if (reentryCont.length || (next !== null && rec.followingWeek.continuous.length)) { rec.continuousInSpan = [...reentryCont, ...(next !== null ? rec.followingWeek.continuous : [])]; flag('continuousInSpan', `${label}: continuous runs ${rec.continuousInSpan.join(', ')} after a walk/jog step ${last}`); }
    const nextAbove = next === null ? [] : rec.followingWeek.steps.filter(x => x > allowed + 1);
    if (nextAbove.length) { rec.followingAbove = nextAbove; flag('followingAboveRecipePlusOne', `${label}: following week steps ${nextAbove.join(',')} > recipe+1 ${allowed + 1}`); }
  }
  rec.reentryAfter = reentry === report.w ? reportAt : null;
  return {rec, firstBack};
}
/** One executed week later: the first week back executed and reviewed, then the next week's steps (a step needs an executed week). */
function weekAfter(t, label, rec, firstBack) {
  if (firstBack === null || firstBack + 1 >= t.p.weeks.length || rec.recipeAllows === null) return;
  // The re-entry week executed and reviewed (when re-entry started in the report week, only its sessions after the report), then the next week's
  // steps.
  const after = rec.reentryAfter === null ? () => true : s => Date.parse(`${s.date}T${s.turn === 'PM' ? '19:00:00' : '08:00:00'}Z`) > rec.reentryAfter;
  L.weekly(t, firstBack, after);
  const next = stepsIn(t, firstBack + 1);
  rec.afterOneExecutedWeek = {week: firstBack + 1, steps: next, gate: L.gateOf(t.last, 'WALK_JOG')};
  const ranFirstBack = stepsIn(t, firstBack, after);
  const ceiling = Math.max(rec.recipeAllows, ...ranFirstBack) + 1;
  if (next.some(x => x > ceiling)) flag('secondWeekAboveRecipePlusOne', `${label}: week ${firstBack + 1} steps ${next.join(',')} > ${ceiling}`);
}

const out = {probe: 'R7ADA-SSCTR-r1-WALKJOG-MATRIX', runtime: L.TREE, ladderLength: L.LADDER.length, matrixA: {}, matrixB: {}};
// ---------- Matrix A ----------
const HELD = {CONS: 4, DEV: 3};
const FIRST = {
  CROSS: (t, held) => { const F = held - 2; for (let w = 0; w < F; w++) L.weekly(t, w); const b1 = L.addDays(t.p.weeks[F].startDate, 1); L.weekly(t, F, s => s.date < b1, {}, '06:30:00');
    const rd = L.addDays(t.p.weeks[F + 1].startDate, 3); const r = L.step(t, L.at(t.p, F + 1, 3, '07:00:00', L.brk(b1, L.addDays(rd, -1)))); L.weekly(t, F + 1, s => s.date >= rd); return r; },
  SAME: (t, held) => { const F = held - 1; for (let w = 0; w < F; w++) L.weekly(t, w); const b1 = L.addDays(t.p.weeks[F].startDate, 1), e1 = L.addDays(b1, 2), rd = L.addDays(e1, 1);
    for (const s of t.p.weeks[F].sessions.filter(s => L.live(s) && s.date < b1)) L.step(t, L.at(t.p, F, s.day, '21:00:00', {observations: [L.obs(t.p, s)]}));
    const r = L.step(t, L.at(t.p, F, 4, '07:00:00', L.brk(b1, e1))); L.weekly(t, F, s => s.date >= rd); return r; },
  MOD: (t, held) => { const F = held - 3; for (let w = 0; w < F; w++) L.weekly(t, w); const b1 = L.addDays(t.p.weeks[F].startDate, 1), e1 = L.addDays(b1, 13), rd = L.addDays(e1, 1);
    for (const s of t.p.weeks[F].sessions.filter(s => L.live(s) && s.date < b1)) L.step(t, L.at(t.p, F, s.day, '21:00:00', {observations: [L.obs(t.p, s)]}));
    const r = L.step(t, L.at(t.p, F + 2, 1, '07:00:00', L.brk(b1, e1))); L.weekly(t, F + 2, s => s.date >= rd); return r; },
};
const HELD_VARIANTS = {ALL: () => () => true, ONE_MISSED: (t, w) => { const id = t.p.weeks[w].sessions.filter(L.WJ)[0]?.id; return s => s.id !== id; }, NONE: () => s => !L.WJ(s)};
const SECOND = {
  SHORT: (t, W) => ({start: L.addDays(t.p.weeks[W].startDate, 1), end: L.addDays(t.p.weeks[W].startDate, 5), report: {w: W, day: 6, hour: '07:00:00'}}),
  MODERATE: (t, W) => ({start: L.addDays(t.p.weeks[W].startDate, 1), end: L.addDays(t.p.weeks[W].startDate, 12), report: {w: W + 1, day: 6, hour: '07:00:00'}}),
  LONG: (t, W) => ({start: L.addDays(t.p.weeks[W].startDate, 1), end: L.addDays(t.p.weeks[W].startDate, 33), report: {w: W + 4, day: 6, hour: '07:00:00'}}),
};
for (const [fName, first] of Object.entries(FIRST)) for (const [tl, held] of Object.entries(HELD)) {
  const base = fresh(), r1 = first(base, held);
  for (const [vName, mk] of Object.entries(HELD_VARIANTS)) for (const [sName, second] of Object.entries(SECOND)) {
    const t = L.copy(base), label = `${fName}/${tl}/${vName}/${sName}`, cell = out.matrixA[label] = {firstReturn: `${r1.status}/${r1.action}`, firstEntry: L.entryRun(r1), heldWeek: held, heldPhase: t.p.weeks[held].phase, heldPrescribed: stepsIn(t, held)};
    L.weekly(t, held, mk(t, held));
    cell.heldGate = L.gateOf(t.last, 'WALK_JOG');
    cell.planAfterHeld = stepsIn(t, held + 1);
    cell.historyAfterHeld = L.histRun(t, held + 1);
    const W = held + 1, P = second(t, W);
    L.weekly(t, W, s => s.date < P.start, {}, '06:30:00');
    const {rec, firstBack} = pauseAndCheck(t, label, sName, P.start, P.end, P.report);
    cell.second = rec;
    if (sName !== 'LONG' && firstBack !== null && firstBack + 2 < t.p.weeks.length) {
      // Repeated pause: the first week back executed and reviewed, then a third (SHORT) pause the week after.
      const u = L.copy(t);
      weekAfter(t, label, rec, firstBack);
      L.weekly(u, firstBack, rec.reentryAfter === null ? () => true : s => Date.parse(`${s.date}T${s.turn === 'PM' ? '19:00:00' : '08:00:00'}Z`) > rec.reentryAfter);
      const W3 = firstBack + 1, P3 = SECOND.SHORT(u, W3);
      L.weekly(u, W3, s => s.date < P3.start, {}, '06:30:00');
      cell.third = pauseAndCheck(u, label + '/THIRD', 'SHORT', P3.start, P3.end, P3.report).rec;
    } else weekAfter(t, label, rec, firstBack);
    cell.log = t.log.slice(base.log?.length ?? 0);
  }
}
// ---------- Matrix B ----------
const K = 2;
const B_VARIANTS = {
  B_HELD_EMPTY: t => { L.weekly(t, K + 1, () => false); },
  B_OPEN: () => {},
  B_RUN_ONCE: t => { const s = t.p.weeks[K + 1].sessions.filter(L.WJ)[0]; L.step(t, L.at(t.p, K + 1, s.day, '21:00:00', {observations: [L.obs(t.p, s)]})); },
};
const B_PAUSES = {
  SHORT: t => ({start: t.p.weeks[K + 2].startDate, end: L.addDays(t.p.weeks[K + 2].startDate, 4), report: {w: K + 2, day: 5, hour: '07:00:00'}}),
  MODERATE: t => ({start: t.p.weeks[K + 2].startDate, end: L.addDays(t.p.weeks[K + 2].startDate, 13), report: {w: K + 4, day: 0, hour: '07:00:00'}}),
  LONG: t => ({start: t.p.weeks[K + 2].startDate, end: L.addDays(t.p.weeks[K + 2].startDate, 32), report: {w: K + 6, day: 5, hour: '07:00:00'}}),
};
{
  const base = fresh();
  for (let w = 0; w <= K; w++) L.weekly(base, w);
  for (const [vName, setup] of Object.entries(B_VARIANTS)) for (const [pName, pause] of Object.entries(B_PAUSES)) {
    const t = L.copy(base), label = `${vName}/${pName}`, cell = out.matrixB[label] = {stepRunInWeekK: stepsIn(t, K), weekK1Prescribed: stepsIn(t, K + 1)};
    setup(t);
    cell.historyAtPause = L.histRun(t, K + 2);
    cell.planWeekK2 = stepsIn(t, K + 2);
    const P = pause(t);
    const {rec, firstBack} = pauseAndCheck(t, label, pName, P.start, P.end, P.report);
    cell.return = rec;
    weekAfter(t, label, rec, firstBack);
    cell.log = t.log.slice(base.log?.length ?? 0);
  }
}
out.totals = totals;
console.log(JSON.stringify(out, null, 1));
