// Q04 (QE reviewer-owned; classes C and D: gate resolution order, temporal credit). Beyond P05/P05b (RETURN mode):
//  T1 EASY mode, T2 WALK_JOG mode, T3 strength: week k executed except a session that is not yet due; HistoricalState read at each instant
//     before it is due (Thu 22:00, Sat 22:00, Sun 07:00) must not credit the week (no transition, basis not COMPLETED_SESSIONS); then the same
//     session MISSED vs EXEC at the closing review. Time zones 0 and -180.
//  T4 order independence: the same facts of week k delivered (a) day by day, (b) all at the closing review in reverse array order, (c) in two
//     reviews whose arrays interleave sessions out of order. Program, gates, HistoricalState and the next rows must be identical.
//  T5 strength gate collision: db-bench-press is used on Wednesday and Saturday; one exposure holds (RIR below target), the other advances.
//     Wednesday-holds vs Saturday-holds: the gate must be HOLD in both (most restrictive); history must not step.
//  T6 RETURN mode, mixed verdicts on the shared EASY key: Thursday EASY adverse (HOLD), Sunday LONG fine; and Thursday fine, Sunday adverse.
import * as L from './qe-r7ada-lib.mjs';
const out = {probe: 'qe-r7ada-Q04-temporal-and-order', tree: L.TREE, T1T2T3: [], T4: [], T5: [], T6: []};
const runCore = st => st && (({planned, longByWeek, modeHistory, achieved, ...r}) => r)(st);
const gateOf = r => r.gates ? Object.fromEntries(Object.entries(r.gates).sort()) : null;
// T1-T3
for (const tz of [0, -180]) for (const [name, prof, pendingPred] of [['T1_EASY_LONG_PENDING', {}, s => s.sport === 'RUN' && s.day === 6], ['T2_WALKJOG_SUNDAY_PENDING', L.WJ, s => s.sport === 'RUN' && s.day === 6], ['T3_STRENGTH_SAT_PENDING', {}, s => s.sport === 'STRENGTH' && s.day === 5]]) for (const k of [1, 3, 5]) {
  const res = {};
  for (const fate of ['EXEC', 'MISSED']) {
    L.resetIds(); const t = L.gen({id: 'qe-q04-' + name, ...prof, ...(tz ? {} : {})}); if (tz) { t.p = structuredClone(t.p); }
    // timezone: regenerate with an intake offset when tz != 0
    if (tz) { const g = L.R.generateProgram({...L.intake({id: 'qe-q04-' + name, ...prof}), timezoneOffsetMinutes: tz}, L.opts); t.p = g.program; t.ledger = []; }
    for (let w = 0; w < k; w++) L.weekly(t, w);
    const before = L.history(t, k, 0, '12:00:00'), strOf = H => Object.fromEntries(Object.entries(H.state.strength.exercises).map(([id, e]) => [id, `${e.mode}${e.load ?? ''}x${e.reps}t${e.loadTick ?? 0}`]));
    const sessions = t.p.weeks[k].sessions.filter(L.live), pend = sessions.filter(pendingPred), done = sessions.filter(s => !pendingPred(s));
    for (const d of [0, 1, 2, 3, 4, 5]) { const o = done.filter(s => s.day === d).map(s => L.obs(t.p, s)); if (o.length) L.step(t, L.at(t.p, k, d, '21:30:00', {observations: o})); }
    const cuts = {};
    for (const [label, day, hour] of [['thu2200', 3, '22:00:00'], ['sat2200', 5, '22:00:00'], ['sun0700', 6, '07:00:00']]) {
      // A cut is a local instant; with tz -180 the UTC clock is 3 hours later.
      const asOf = new Date(Date.parse(`${L.addDays(t.p.weeks[k].startDate, day)}T${hour}Z`) - tz * 60000).toISOString();
      const H = L.historyAt(t, asOf); cuts[label] = {basis: H.basis, run: runCore(H.state.run), strength: Object.fromEntries(Object.entries(H.state.strength.exercises).map(([id, e]) => [id, `${e.mode}${e.load ?? ''}x${e.reps}t${e.loadTick ?? 0}`]))};
    }
    const close = L.step(t, L.at(t.p, k, 6, '21:30:00', {observations: fate === 'EXEC' ? pend.map(s => L.obs(t.p, s)) : []}));
    res[fate] = {cuts, before: {basis: before.basis, run: runCore(before.state.run), strength: strOf(before)}, closeGates: gateOf(close), after: {basis: L.history(t, k + 1, 0, '06:00:00').basis, run: runCore(L.history(t, k + 1, 0, '06:00:00').state.run)}, nextRun: L.runRows(t, k + 1), nextStr: L.rowsOf(t, k + 1, () => true).filter(r => /bench|squat|rdl/.test(r))};
  }
  const E = res.EXEC, M = res.MISSED, beforeRun = E.before.run;
  // Violation: a cut before the pending session is due credits the week (run state moved, or strength state moved, or basis COMPLETED_SESSIONS);
  // or the cuts differ between EXEC and MISSED (a future session decided the past); or MISSED steps the dimension the pending session gates.
  // (The reported basis carries the transition in force, which can be an earlier week's COMPLETED_SESSIONS; the state is what is compared.)
  const satIds = new Set(['db-rdl', 'db-split-squat']);
  const credited = Object.entries(E.cuts).filter(([, c]) => name.startsWith('T3') ? Object.keys(c.strength).filter(id => satIds.has(id)).some(id => c.strength[id] !== E.before.strength[id]) : !L.eq(c.run, E.before.run)).map(([l]) => l);
  const cutsDiffer = !L.eq(E.cuts, M.cuts);
  out.T1T2T3.push({name, tz, k, creditedBeforeDue: credited, cutsDifferExecVsMissed: cutsDiffer, violation: credited.length > 0 || cutsDiffer, EXEC: E, MISSED: M});
}
// T4: order independence of the same facts.
for (const k of [1, 4]) {
  const ref = (() => { L.resetIds(); const t = L.gen({id: 'qe-q04-t4'}); for (let w = 0; w < k; w++) L.weekly(t, w); return t.p.weeks[k].sessions.filter(L.live).map((s, i) => ({...L.obs(t.p, s, s.sport === 'STRENGTH' ? {set: (id, x) => ({...x, rir: x.rir + (i % 2)})} : {}), eventId: `t4-${k}-${i}`})); })();
  const cells = {};
  for (const shape of ['DAY_BY_DAY', 'ALL_AT_CLOSE_REVERSED', 'TWO_REVIEWS_INTERLEAVED']) {
    L.resetIds(); const t = L.gen({id: 'qe-q04-t4'}); for (let w = 0; w < k; w++) L.weekly(t, w);
    const dayOf = o => t.p.weeks[k].sessions.find(s => s.id === o.sessionId).day;
    if (shape === 'DAY_BY_DAY') { for (const d of [0, 1, 2, 3, 4, 5]) { const o = ref.filter(x => dayOf(x) === d); if (o.length) L.step(t, L.at(t.p, k, d, '21:30:00', {observations: structuredClone(o)})); } L.step(t, L.at(t.p, k, 6, '21:30:00', {observations: structuredClone(ref.filter(x => dayOf(x) === 6))})); }
    if (shape === 'ALL_AT_CLOSE_REVERSED') L.step(t, L.at(t.p, k, 6, '21:30:00', {observations: structuredClone([...ref].reverse())}));
    if (shape === 'TWO_REVIEWS_INTERLEAVED') { const early = ref.filter(x => dayOf(x) <= 3), late = ref.filter(x => dayOf(x) > 3); L.step(t, L.at(t.p, k, 4, '07:00:00', {observations: structuredClone([...early].reverse())})); L.step(t, L.at(t.p, k, 6, '21:30:00', {observations: structuredClone([...late].reverse())})); }
    const H = L.history(t, k + 1, 0, '06:00:00');
    cells[shape] = {facts: L.facts(t), gates: gateOf(t.last), run: runCore(H.state.run), strength: H.state.strength.exercises, nextRun: L.runRows(t, k + 1), nextStr: L.rowsOf(t, k + 1)};
  }
  const base = cells.DAY_BY_DAY;
  out.T4.push({k, sameFacts: Object.values(cells).every(c => c.facts === base.facts), sameGates: Object.values(cells).every(c => L.eq(c.gates, base.gates)), sameHistory: Object.values(cells).every(c => L.eq(c.run, base.run) && L.eq(c.strength, base.strength)), sameNextRows: Object.values(cells).every(c => L.eq(c.nextRun, base.nextRun) && L.eq(c.nextStr, base.nextStr)), gates: Object.fromEntries(Object.entries(cells).map(([k2, c]) => [k2, c.gates]))});
}
// T5: strength gate collision (db-bench-press Wednesday and Saturday).
for (const k of [1, 2, 4]) {
  const cells = {};
  for (const holds of ['WED_HOLDS', 'SAT_HOLDS', 'BOTH_ADVANCE']) {
    L.resetIds(); const t = L.gen({id: 'qe-q04-t5'}); for (let w = 0; w < k; w++) L.weekly(t, w);
    const H0 = L.hState(L.history(t, k, 0, '12:00:00'), 'db-bench-press');
    const low = s => holds === 'WED_HOLDS' ? L.WED(s) : holds === 'SAT_HOLDS' ? L.SAT(s) : false;
    const obs = t.p.weeks[k].sessions.filter(L.live).map(s => L.obs(t.p, s, s.sport === 'STRENGTH' && low(s) ? {set: (id, x) => id === 'db-bench-press' ? {...x, rir: Math.max(0, x.rir - 2)} : x} : {}));
    const executed = t.p.weeks[k].sessions.filter(s => L.live(s) && s.sport === 'STRENGTH').flatMap(s => s.prescription.exercises.filter(e => e.id === 'db-bench-press').map(e => e.load.value)).reduce((a, b) => Math.max(a, b), 0);
    const r = L.step(t, L.at(t.p, k, 6, '21:30:00', {observations: obs}));
    cells[holds] = {executed, before: H0, gate: r.gates?.['db-bench-press'] ?? null, after: L.hState(L.history(t, k + 1, 0, '06:00:00'), 'db-bench-press'), next: L.rowsOf(t, k + 1, () => true, ['db-bench-press'])};
  }
  // Property: the most restrictive verdict stands whichever exposure held (both HOLD), the two HOLD cells resolve the same dose, and the next
  // rows under HOLD never exceed the load executed this week (the rows' load: executed as prescribed).
  out.T5.push({k, gates: Object.fromEntries(Object.entries(cells).map(([h, c]) => [h, c.gate])), violation: cells.WED_HOLDS.gate !== 'HOLD' || cells.SAT_HOLDS.gate !== 'HOLD' || !L.eq(cells.WED_HOLDS.after, cells.SAT_HOLDS.after) || !L.eq(cells.WED_HOLDS.next, cells.SAT_HOLDS.next) || cells.WED_HOLDS.next.some(r => +(r.match(/KNOWN([\d.]+)/)?.[1] ?? 0) > +(cells.WED_HOLDS.executed ?? Infinity)), cells});
}
// T6: RETURN mode, mixed verdicts on the shared EASY key (MODERATE 17-day break reported Thursday 06:00).
for (const shape of ['THU_ADVERSE', 'SUN_ADVERSE', 'BOTH_FINE']) {
  L.resetIds(); const t = L.gen({id: 'qe-q04-t6'}); L.weekly(t, 0); L.weekly(t, 1);
  const start = t.p.weeks[2].startDate, end = L.addDays(start, 16), report = L.addDays(end, 1), W = t.p.weeks.findIndex(x => report >= x.startDate && report <= L.addDays(x.startDate, 6));
  L.step(t, L.at(t.p, W, 3, '06:00:00', L.brk(start, end)));
  const adverse = {performance: 'UNDER', recovery: 'ADVERSE', effort: 'HARDER', nextDayFunction: 'IMPAIRED'};
  const thu = t.p.weeks[W].sessions.filter(s => L.live(s) && s.sport === 'RUN' && s.day === 3), sun = t.p.weeks[W].sessions.filter(s => L.live(s) && s.sport === 'RUN' && s.day === 6), sat = t.p.weeks[W].sessions.filter(s => L.live(s) && s.sport === 'STRENGTH' && s.day === 5);
  L.step(t, L.at(t.p, W, 3, '21:00:00', {observations: thu.map(s => L.obs(t.p, s, shape === 'THU_ADVERSE' ? {response: adverse} : {}))}));
  L.step(t, L.at(t.p, W, 5, '21:00:00', {observations: sat.map(s => L.obs(t.p, s))}));
  const r = L.step(t, L.at(t.p, W, 6, '21:00:00', {observations: sun.map(s => L.obs(t.p, s, shape === 'SUN_ADVERSE' ? {response: adverse} : {}))}));
  out.T6.push({shape, closeGate: r.gates?.EASY ?? null, reasons: (t.p.decisions.at(-1).reasons ?? []).filter(x => x.key === 'EASY').map(x => x.gate + ': ' + x.why), historyNextMonday: runCore(L.history(t, W + 1, 0).state.run), nextRows: L.runRows(t, W + 1)});
}
out.summary = {T1T2T3: {cases: out.T1T2T3.length, violations: out.T1T2T3.filter(c => c.violation).map(c => `${c.name} tz${c.tz} k${c.k}: credited ${c.creditedBeforeDue} cutsDiffer ${c.cutsDifferExecVsMissed}`)}, T4: out.T4.map(c => ({k: c.k, sameFacts: c.sameFacts, sameGates: c.sameGates, sameHistory: c.sameHistory, sameNextRows: c.sameNextRows})), T5: out.T5.map(c => ({k: c.k, gates: c.gates, violation: c.violation})), T6: out.T6.map(c => ({shape: c.shape, gate: c.closeGate, next: c.nextRows}))};
console.log(JSON.stringify(out, null, 1));
