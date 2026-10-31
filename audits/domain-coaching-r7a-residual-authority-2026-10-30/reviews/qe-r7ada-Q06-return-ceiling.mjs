// Q06 (QE reviewer-owned; class E: return entry <= the applicable factual tolerated dose/step; walk/jog F4 structure). For each shape the
// athlete's last tolerated dose (executed completely, no adverse response) is recorded beside the first prescription after the return.
//  W-RELEASED  : walk/jog step A executed (week closed, step B released), pause starts the next Monday before any session at B.
//  W-ADVERSE   : as W-RELEASED, but one session at B executed completely with an ADVERSE response (HOLD), then the pause.
//  W-HOLD      : week at B with one of three sessions missed (HOLD), then the pause.
//  W-REPEAT    : MODERATE pause, the return week executed at its step, its evidence releases the next step, a second pause before running it.
//  W-EXIT      : step 8 (the ladder's last, 20-min continuous jog) executed completely: the state graduates to EASY 25; pause before any EASY run.
//  E-RELEASED  : EASY runner, a long run of L executed and the week closed (the long-run target steps), pause before running the new target.
// Pauses: SHORT (6 days) and MODERATE (17 days); reported the day after the pause ends, which falls in the same week as its end or the next.
import * as L from './qe-r7ada-lib.mjs';
const out = {probe: 'qe-r7ada-Q06-return-ceiling', tree: L.TREE, cases: []};
const ADVERSE = {performance: 'UNDER', recovery: 'ADVERSE', effort: 'HARDER', nextDayFunction: 'IMPAIRED'};
const ladder = L.opts.authority.policy.operational.establishment.walkJogLadder;
const stepLoad = v => { const s = ladder[v]; return s ? s.repetitions * s.jogSeconds : null; }; // total jog seconds at a step
const firstRows = (t, w) => L.runRows(t, w);
const rowsAfter = (t, fromDay) => t.p.weeks.flatMap(w => w.sessions.filter(s => L.live(s) && s.sport === 'RUN' && s.date >= fromDay).map(s => ({date: s.date, role: s.role, minutes: s.prescription.durationMinutes, dim: s.progression?.dimension ?? null, value: s.progression?.value ?? null}))).sort((a, b) => a.date < b.date ? -1 : 1).slice(0, 3);
function pauseAndReturn(t, startDay, days) {
  const end = L.addDays(startDay, days - 1), report = L.addDays(end, 1), W = t.p.weeks.findIndex(x => report >= x.startDate && report <= L.addDays(x.startDate, 6));
  const r = L.step(t, L.at(t.p, W, Math.round((Date.parse(report) - Date.parse(t.p.weeks[W].startDate)) / 864e5), '06:00:00', L.brk(startDay, end)), {allow: true});
  const d = t.p.decisions.at(-1);
  return {status: r.status, action: r.action, class: d?.interruption?.class ?? null, entryRun: L.runOf(d?.interruption?.entry?.run), firstRows: rowsAfter(t, report)};
}
function walkjogTo(t, step) { // trains week by week (closing reviews) until the stored rows of the next week prescribe `step`; returns the week index
  for (let w = 0; w < t.p.weeks.length - 3; w++) { const v = t.p.weeks[w].sessions.find(L.live)?.progression?.value; if (t.p.weeks[w].sessions.some(s => L.live(s) && s.role === 'WALK_JOG' && s.progression?.value === step)) return w; L.weekly(t, w); }
  return -1;
}
for (const days of [6, 17]) {
  // W-RELEASED / W-ADVERSE / W-HOLD at several A
  for (const A of [2, 4, 6]) for (const shape of ['W-RELEASED', 'W-ADVERSE', 'W-HOLD']) {
    L.resetIds(); const t = L.gen({id: 'qe-q06-wj', ...L.WJ});
    const wA = walkjogTo(t, A); if (wA < 0) { out.cases.push({shape, A, days, error: 'step not reached'}); continue; }
    L.weekly(t, wA); // week at A executed and closed: releases B when it advances (not in consolidation)
    const B = t.p.weeks[wA + 1].sessions.find(s => L.live(s) && s.role === 'WALK_JOG')?.progression?.value;
    let lastTolerated = A, startDay = t.p.weeks[wA + 1].startDate;
    if (shape === 'W-ADVERSE') { const s = t.p.weeks[wA + 1].sessions.find(x => L.live(x) && x.role === 'WALK_JOG'); L.step(t, L.at(t.p, wA + 1, s.day, '21:00:00', {observations: [L.obs(t.p, s, {response: ADVERSE})]})); startDay = L.addDays(s.date, 1); }
    if (shape === 'W-HOLD') { const ss = t.p.weeks[wA + 1].sessions.filter(x => L.live(x) && x.role === 'WALK_JOG'); L.step(t, L.at(t.p, wA + 1, 6, '21:00:00', {observations: ss.slice(0, 2).map(s => L.obs(t.p, s))})); lastTolerated = B; startDay = t.p.weeks[wA + 2].startDate; }
    const r = pauseAndReturn(t, startDay, days), entryStep = r.entryRun?.walkStep ?? null, first = r.firstRows[0];
    const firstStep = first?.dim === 'WALK_JOG_STEP' ? first.value : first ? 'CONTINUOUS:' + first.minutes : null;
    out.cases.push({shape, A, B, days, lastTolerated, entryStep, first: r.firstRows, violation: Number.isInteger(entryStep) && entryStep > lastTolerated || (Number.isInteger(firstStep) && firstStep > lastTolerated) || (typeof firstStep === 'string'), r});
  }
  // W-REPEAT
  for (const A of [3, 5]) {
    L.resetIds(); const t = L.gen({id: 'qe-q06-rep', ...L.WJ}); const wA = walkjogTo(t, A); L.weekly(t, wA);
    const p1 = pauseAndReturn(t, t.p.weeks[wA + 1].startDate, 17), W = t.p.weeks.findIndex(x => x.sessions.some(s => s.date === p1.firstRows[0]?.date));
    const runStep = p1.firstRows[0]?.value; L.weekly(t, W); // return week executed and closed: releases the next step
    const released = t.p.weeks[W + 1].sessions.find(s => L.live(s) && s.role === 'WALK_JOG')?.progression?.value;
    const p2 = pauseAndReturn(t, t.p.weeks[W + 1].startDate, 6), entry2 = p2.entryRun?.walkStep ?? null;
    out.cases.push({shape: 'W-REPEAT', A, firstReturnStep: runStep, released, secondReturnEntry: entry2, secondFirst: p2.firstRows, violation: Number.isInteger(entry2) && entry2 > runStep, p1, p2});
  }
  // W-EXIT
  { L.resetIds(); const t = L.gen({id: 'qe-q06-exit', ...L.WJ}); const w8 = walkjogTo(t, 8);
    if (w8 >= 0) { L.weekly(t, w8); const graduated = L.runOf(L.history(t, w8 + 1, 0).state.run);
      const r = pauseAndReturn(t, t.p.weeks[w8 + 1].startDate, days), first = r.firstRows[0];
      out.cases.push({shape: 'W-EXIT', days, lastTolerated: '8 (1x20 min continuous jog)', graduatedTo: graduated?.mode + ' ' + graduated?.easy, entryRun: r.entryRun, first: r.firstRows, continuousFirstMinutes: first && first.dim !== 'WALK_JOG_STEP' ? first.minutes : null, violation: !!first && first.dim !== 'WALK_JOG_STEP' && first.minutes > 20, r}); }
    else out.cases.push({shape: 'W-EXIT', days, error: 'step 8 not reached'}); }
  // E-RELEASED: EASY runner
  for (const k of [3, 5]) {
    L.resetIds(); const t = L.gen({id: 'qe-q06-easy'}); for (let w = 0; w < k; w++) L.weekly(t, w);
    const lastLong = t.p.weeks[k - 1].sessions.filter(s => L.live(s) && s.role === 'LONG').map(s => s.prescription.durationMinutes)[0];
    const lastQuality = t.p.weeks[k - 1].sessions.filter(s => L.live(s) && s.role === 'QUALITY').map(s => s.progression?.value)[0] ?? null;
    const state = L.runOf(L.history(t, k, 0).state.run);
    const r = pauseAndReturn(t, t.p.weeks[k].startDate, days), longs = t.p.weeks.flatMap(w => w.sessions.filter(s => L.live(s) && s.role === 'LONG' && s.date > t.p.weeks[k].startDate).map(s => ({date: s.date, minutes: s.prescription.durationMinutes}))).slice(0, 2);
    const qual = t.p.weeks.flatMap(w => w.sessions.filter(s => L.live(s) && s.role === 'QUALITY' && s.date > t.p.weeks[k].startDate).map(s => ({date: s.date, step: s.progression?.value, family: s.prescription.family}))).slice(0, 2);
    out.cases.push({shape: 'E-RELEASED', k, days, lastLongExecuted: lastLong, lastQualityStepExecuted: lastQuality, historyAtPause: {long: state.long, easy: state.easy, qualityStep: state.qualityStep}, entryRun: r.entryRun, firstLongs: longs, firstQuality: qual, violation: (longs[0]?.minutes ?? 0) > lastLong, r});
  }
}
out.summary = {cases: out.cases.length, errors: out.cases.filter(c => c.error).map(c => `${c.shape} ${c.A ?? ''} ${c.days}: ${c.error}`), violations: out.cases.filter(c => c.violation).map(c => `${c.shape} A=${c.A ?? c.k ?? ''} days=${c.days ?? 'x'}: tolerated ${c.lastTolerated ?? c.lastLongExecuted ?? c.firstReturnStep} entry ${JSON.stringify(c.entryStep ?? c.secondReturnEntry ?? c.entryRun?.mode)} first ${JSON.stringify((c.first ?? c.secondFirst ?? c.firstLongs ?? [])[0])}`)};
console.log(JSON.stringify(out, null, 1));
