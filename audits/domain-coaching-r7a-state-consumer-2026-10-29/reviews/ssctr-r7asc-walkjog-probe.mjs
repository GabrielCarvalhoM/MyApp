// SSCTR R7ASC-SSCTR-r1 walk/jog probe (own; prints only). The run side of F1 on the walk/jog ladder, where the consumer closure moves a step from
// the step the week ran only when the gate advances (advanceRun: WALK_JOG takes min(state, prescribed) only for d > 0; RETURN and RESTART take it
// for every gate). Profile WALK_JOG_FIVE_DAYS (fixtures; 8 weeks: w0 ESTABLISHMENT, w1-3 DEVELOPMENT, w4 CONSOLIDATION, w5-7 DEVELOPMENT; walk/jog
// Mon, Tue, Wed, Fri, Sat). A first SHORT break from Tuesday, reported Thursday of the next week (9 days): the sessions from the report on are
// executed and the week reviewed, so history credits that week's step while the plan re-bases the next week (E7). The next week, the HELD week,
// is executed ALL (ADVANCE), ONE_MISSED (one walk/jog session not done) or NONE (no walk/jog session). Then a second break: SHORT (Tuesday to
// Saturday, reported Sunday 07:00) or MODERATE (12 days from Tuesday, reported the second Monday 07:00 after it). Timelines:
//  CONS  first break in week 2, held week 4 (CONSOLIDATION: the gate makes no step), second break in week 5;
//  DEV   first break in week 1, held week 3 (DEVELOPMENT: HOLD is the only no-step gate), second break in week 4.
// The approved return recipe (R6-NONCLINICAL-RETURN: re-entry "returns to the prior tolerated dose"; historical maxima are a ceiling, not current
// proof; my R7ASM "Return base": the last executed dose, not one never executed): after the second return, a SHORT break resumes at most the step
// last run and a MODERATE one at most one step below it. Flags any first walk/jog step after the second return above that.
// Read-only runtime use; synthetic data; DEV_TEST_ONLY authority.
import * as L from './ssctr-r7asc-lib.mjs';

const {PROFILES, EDGE_PROFILES} = await L.loadProfiles();
const profile = {...PROFILES, ...EDGE_PROFILES}.WALK_JOG_FIVE_DAYS;
const WJ = s => s.sport === 'RUN' && s.role === 'WALK_JOG';
const steps = (t, w) => [...new Set((t.p.weeks[w]?.sessions ?? []).filter(s => L.live(s) && WJ(s)).map(s => s.progression?.value))];
const histStep = (t, w) => { try { const H = L.history(t, w, 0, '00:30:00'); return H ? H.state.run.walkStep ?? null : 'not exported'; } catch (e) { return 'reader error'; } };
const executedSteps = t => t.p.weeks.flatMap(w => w.sessions.filter(s => L.live(s) && WJ(s) && t.ledger.some(o => (o.sessionId ?? o.context?.sessionId) === s.id && !o.superseded && o.actual?.completed !== false)).map(s => ({date: s.date, step: s.progression?.value}))).sort((a, b) => a.date < b.date ? -1 : 1);
const TIMELINES = {CONS: {first: 2, held: 4, second: 5}, DEV: {first: 1, held: 3, second: 4}};
const VARIANTS = {ALL: () => () => true, ONE_MISSED: (t, w) => { const id = t.p.weeks[w].sessions.filter(x => L.live(x) && WJ(x))[0]?.id; return s => s.id !== id; }, NONE: () => s => !WJ(s)};
const out = {probe: 'R7ASC-SSCTR-r1-WALKJOG', runtime: L.TREE, timelines: TIMELINES, cells: {}};
const totals = {cells: 0, aboveRecipeAfterSecondReturn: 0, examples: []};
for (const [tl, T] of Object.entries(TIMELINES)) {
  const g = L.generateProgram(structuredClone(profile), L.opts), base = {p: g.program, ledger: []};
  for (let w = 0; w < T.first; w++) L.weekly(base, w);
  const b1 = L.addDays(base.p.weeks[T.first].startDate, 1); L.weekly(base, T.first, s => s.date < b1, {}, '06:30:00');
  const rd = L.addDays(base.p.weeks[T.first + 1].startDate, 3); L.step(base, L.at(base.p, T.first + 1, 3, '07:00:00', L.brk(b1, L.addDays(rd, -1))));
  L.weekly(base, T.first + 1, s => s.date >= rd);
  for (let w = T.first + 2; w < T.held; w++) L.weekly(base, w);
  for (const [vName, mk] of Object.entries(VARIANTS)) for (const second of ['SHORT', 'MODERATE']) {
    const t = L.copy(base), cell = out.cells[`${tl}/${vName}/${second}`] = {heldWeek: T.held, heldPhase: t.p.weeks[T.held].phase, heldPrescribed: steps(t, T.held)};
    L.weekly(t, T.held, mk(t, T.held));
    cell.heldGate = L.gateOf(t.last, 'WALK_JOG');
    cell.planAfterHeldReview = steps(t, T.held + 1);
    cell.historyAfterHeld = histStep(t, T.held + 1);
    const W = T.second, b2 = L.addDays(t.p.weeks[W].startDate, 1);
    L.weekly(t, W, s => s.date < b2, {}, '06:30:00');
    let rw, rr;
    if (second === 'SHORT') { rw = W; rr = L.step(t, L.at(t.p, W, 6, '07:00:00', L.brk(b2, L.addDays(t.p.weeks[W].startDate, 5)))); }
    else { rw = W + 1; rr = L.step(t, L.at(t.p, W + 1, 6, '07:00:00', L.brk(b2, L.addDays(b2, 11)))); }
    cell.secondReturn = `${rr.status}/${rr.action}`;
    const firstBack = second === 'SHORT' ? W + 1 : W + 2;
    const ran = executedSteps(t), lastRun = ran.length ? ran.at(-1).step : null;
    cell.stepsRunBeforeSecondBreak = ran.map(x => `${x.date}:${x.step}`);
    cell.lastStepRun = lastRun;
    cell.firstWeekBack = firstBack < t.p.weeks.length ? {week: firstBack, steps: steps(t, firstBack)} : 'beyond the program';
    // A return that starts this week prescribes the rest of the week too.
    cell.restOfReturnWeek = steps(t, rw);
    const allowed = second === 'SHORT' ? lastRun : Math.max(0, lastRun - 1);
    const seen = [...(typeof cell.firstWeekBack === 'object' ? cell.firstWeekBack.steps : [])];
    cell.recipeAllows = allowed;
    cell.aboveRecipe = seen.some(x => x > allowed);
    totals.cells++; if (cell.aboveRecipe) { totals.aboveRecipeAfterSecondReturn++; if (totals.examples.length < 12) totals.examples.push(`${tl}/${vName}/${second}: held w${T.held} (${cell.heldPhase}) gate ${cell.heldGate}, plan ${cell.planAfterHeldReview} vs history ${cell.historyAfterHeld}; last step run ${lastRun}; first week back w${firstBack}: ${seen.join(',')} (recipe allows ${allowed})`); }
  }
}
out.totals = totals;
console.log(JSON.stringify(out, null, 1));
