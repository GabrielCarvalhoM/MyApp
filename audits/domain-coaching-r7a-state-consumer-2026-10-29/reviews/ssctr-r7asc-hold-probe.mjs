// SSCTR R7ASC-SSCTR-r1 HOLD probe (own; prints only). F2, Founder §9 and P4 ("HOLD repeats the pertinent dose and grants no unearned progression";
// "HOLD + no new evidence: the resolved dose does not progress") and R42 (EarnedProgress vs ProjectedProgress), on the runtime SSCTR_CC selects.
// Per goal (STRENGTH, HYPERTROPHY, GENERAL, RUNNING_SUPPORT) the back squat's Wednesday exposure of the held week H (4 or 5, DEVELOPMENT weeks)
// is the held exposure. Ways to reach it:
//  NORMAL       weeks 0..H-1 executed as prescribed and reviewed: the row is history's own dose;
//  R42_LOAD     weeks 0..H-2 reviewed; week H-1 lifted one increment light at the back squat, never reviewed (reported day by day): history keeps
//               the lighter load while the projection steps (the F2 path of my R7ASM probe);
//  R42_REPS     weeks 0..H-2 reviewed; week H-1 reported day by day with Saturday's strength session missed (facts only): the projection steps;
//  DOUBLE_REPS  weeks 0..H-3 reviewed; weeks H-2 and H-1 reported day by day with Saturday missed;
//  DOUBLE_LOAD  weeks 0..H-3 reviewed; weeks H-2 and H-1 lifted one increment light, never reviewed: two projected steps ahead of history.
// Variants of the held exposure (every set): missedBy2 (target-2 at the prescribed reserve; under STRENGTH 3 of 5, the Founder's example),
// missedBy1, metExactly, aboveLowReserve (target+3 at RIR 0), aboveWithReserve (target+2 at prescribed RIR+2). Everything else as prescribed.
// Arms: R reviews week H on Sunday, then (next) the week-H+1 row the review plans, (noEvidence) week H+1 reviewed with no report at all and the
// week-H+2 row, (continued) weeks H+1..H+3 executed as prescribed and reviewed; U leaves week H unreviewed (the stored row, for comparison).
// heldTargetOnlyProjected: the held row's load or repetitions are not the dose the athlete last executed and the week before was never gated
// (every path but NORMAL), so the target exists only in the projection. For a HOLD it flags: load, repetitions or sets above the held row;
// repetitions outside the goal range; a load tick gained; a progression with no new evidence; and, separately, whether the HOLD repeated a target
// only the projection had (Founder §9's case) or went back to the executed dose.
// Read-only runtime use; synthetic data; DEV_TEST_ONLY authority.
import * as L from './ssctr-r7asc-lib.mjs';

const ID = 'back-squat', HELD = [4, 5], GOALS = {STRENGTH: 5, HYPERTROPHY: 8, GENERAL: 8, RUNNING_SUPPORT: 6};
// Each variant gives the logged repetitions and reserve from the row's, and a load change in kilograms (0: the row's load).
const VARIANTS = {
  missedBy2: e => ({reps: Math.max(1, e.reps - 2), rir: e.rir, kg: 0}),
  missedBy1: e => ({reps: Math.max(1, e.reps - 1), rir: e.rir, kg: 0}),
  missedBy3: e => ({reps: Math.max(1, e.reps - 3), rir: e.rir, kg: 0}),
  missedBy4: e => ({reps: Math.max(1, e.reps - 4), rir: e.rir, kg: 0}),
  metExactly: e => ({reps: e.reps, rir: e.rir, kg: 0}),
  aboveLowReserve: e => ({reps: e.reps + 3, rir: 0, kg: 0}),
  aboveWithReserve: e => ({reps: e.reps + 2, rir: e.rir + 2, kg: 0}),
  // DOSE-READING S4: a lighter load the athlete chose, at the target and two short of it.
  lighterAtTarget: e => ({reps: e.reps, rir: e.rir, kg: -2.5}),
  lighterMissed: e => ({reps: Math.max(1, e.reps - 2), rir: e.rir, kg: -2.5}),
};
const lighter = s => L.WED(s) ? {kg: (id, e) => id === ID ? e.load.value - 2.5 : e.load.mode === 'KNOWN' ? e.load.value : e.load.ceiling?.value ?? 20} : {};
const reviewed = (t, n) => { for (let w = 0; w < n; w++) L.weekly(t, w); };
const PATHS = {
  NORMAL: (t, H) => reviewed(t, H),
  R42_LOAD: (t, H) => { reviewed(t, H - 1); L.perDay(t, H - 1, () => true, lighter); },
  R42_REPS: (t, H) => { reviewed(t, H - 1); L.perDay(t, H - 1, s => !L.SAT(s)); },
  DOUBLE_REPS: (t, H) => { reviewed(t, H - 2); L.perDay(t, H - 2, s => !L.SAT(s)); L.perDay(t, H - 1, s => !L.SAT(s)); },
  DOUBLE_LOAD: (t, H) => { reviewed(t, H - 2); L.perDay(t, H - 2, () => true, lighter); L.perDay(t, H - 1, () => true, lighter); },
};
const one = rows => rows.find(r => r.id === ID) ?? null;
const out = {probe: 'R7ASC-SSCTR-r1-HOLD', runtime: L.TREE, heldWeeks: HELD, exercise: ID, goals: {}};
const totals = {holdCases: 0, holdLoadUp: 0, holdRepsUp: 0, holdSetsUp: 0, holdOutOfRange: 0, holdTickGained: 0, holdProgressNoEvidence: 0, anyKnownRowOutOfRange: 0, examples: []};
for (const [goal, reps0] of Object.entries(GOALS)) {
  const [lo, hi] = L.DOSES[goal].repRange, G = out.goals[goal] = {repRange: [lo, hi], mode: L.DOSES[goal].mode, cells: {}};
  for (const H of HELD) for (const [pathName, setup] of Object.entries(PATHS)) {
    const base = L.gen({id: `ssctr-r7asc-hold-${goal}-${pathName}-${H}`, goal, known: [L.K(ID, 3, reps0, 80), L.K('db-bench-press', 3, 8, 18, 'PER_HAND')]});
    setup(base, H);
    const held = one(L.rowsOf(base, H, [ID], L.WED)), hist = L.histEx(base, H, ID), proj = L.projEx(base, H, ID);
    const P = G.cells[`${pathName}@w${H}`] = {heldRow: held ? L.rowText(held) : null, historyAtHeldWeek: hist, projectionAtHeldWeek: proj,
      storedNextRow: (r => r ? L.rowText(r) : null)(one(L.rowsOf(base, H + 1, [ID]))), variants: {}};
    if (!held) { P.error = 'no held row'; continue; }
    const lastLoad = typeof hist === 'object' ? hist?.lastExecutedLoad : null, lastReps = typeof hist === 'object' ? hist?.lastExecutedReps : null;
    // What only the projection holds at the held row: a load above the one last executed, and a repetition step above what the policy gives
    // without an unearned step (the executed repetitions at the same load; at a new load the goal's reset: its reps in LOAD mode, else the range
    // bottom). NORMAL is gated every week, so nothing there is projection-only.
    const newLoad = lastLoad !== null && Number.isFinite(held.value) && held.value > lastLoad + 1e-9, resetReps = L.DOSES[goal].mode === 'LOAD' ? L.DOSES[goal].reps : lo;
    P.heldProjected = pathName === 'NORMAL' || lastLoad === null ? {load: false, repStep: false} : {load: newLoad, repStep: newLoad ? held.reps > resetReps : held.reps > lastReps};
    P.earnedTargetAtHeldLoad = lastLoad === null ? null : newLoad ? resetReps : lastReps;
    for (const [name, v] of Object.entries(VARIANTS)) {
      const mk = s => L.WED(s) ? {set: (id, x, e) => { if (id !== ID) return x; const y = v(e); return {...x, reps: y.reps, rir: y.rir, load: {...x.load, value: x.load.value + y.kg}}; }} : {};
      const R = L.copy(base), U = L.copy(base);
      L.weekly(R, H, () => true, mk);
      const gate = L.gateOf(R.last, ID), next = one(L.rowsOf(R, H + 1, [ID])), cell = P.variants[name] = {logged: v(held), gate, review: `${R.last.status}/${R.last.action}`,
        historyAfterReview: L.histEx(R, H + 1, ID), projectionAfterReview: L.projEx(R, H + 1, ID), nextRow: next ? L.rowText(next) : null};
      const NE = L.copy(R); L.weekly(NE, H + 1, () => false);
      const afterNoEv = one(L.rowsOf(NE, H + 2, [ID]));
      cell.noEvidence = {gate: L.gateOf(NE.last, ID), review: `${NE.last.status}/${NE.last.action}`, row: afterNoEv ? L.rowText(afterNoEv) : null};
      const C = L.copy(R); for (let w = H + 1; w < H + 4; w++) L.weekly(C, w);
      cell.continued = Array.from({length: 4}, (_, i) => one(L.rowsOf(C, H + 1 + i, [ID]))).filter(Boolean).map(L.rowText);
      L.perDay(U, H, () => true, mk);
      cell.U_nextRow = (r => r ? L.rowText(r) : null)(one(L.rowsOf(U, H + 1, [ID])));
      if ([next, afterNoEv].some(r => r && r.mode === 'KNOWN' && (r.reps < lo || r.reps > hi))) totals.anyKnownRowOutOfRange++;
      if (gate !== 'HOLD') continue;
      totals.holdCases++;
      const f = cell.holdFlags = {};
      if (next && Number.isFinite(next.value) && Number.isFinite(held.value) && next.value > held.value + 1e-9) { f.loadUp = true; totals.holdLoadUp++; }
      if (next && next.reps > held.reps) { f.repsUp = true; totals.holdRepsUp++; }
      if (next && next.sets > held.sets) { f.setsUp = true; totals.holdSetsUp++; }
      if (next && next.mode === 'KNOWN' && (next.reps < lo || next.reps > hi)) { f.outOfRange = true; totals.holdOutOfRange++; }
      const ta = cell.historyAfterReview;
      if (typeof hist === 'object' && typeof ta === 'object' && hist && ta && ta.load === hist.load && (ta.loadTick ?? 0) > (hist.loadTick ?? 0)) { f.tickGained = true; totals.holdTickGained++; }
      if (afterNoEv && ((Number.isFinite(afterNoEv.value) && afterNoEv.value > held.value + 1e-9) || afterNoEv.reps > held.reps)) { f.progressNoEvidence = true; totals.holdProgressNoEvidence++; }
      if (next && v(held).kg === 0 && (P.heldProjected.load || P.heldProjected.repStep)) {
        // The Founder §9 case is a repetition step only the projection had; a projected load the athlete then lifted, with the goal's own
        // target, is the approved F2 path (HOLD repeats the row at the load now executed).
        const kind = P.heldProjected.repStep ? 'projectedRepStep' : 'projectedLoadLifted';
        const repeated = Math.abs((next.value ?? 0) - (held.value ?? 0)) < 1e-9 && next.reps === held.reps;
        const earned = next.reps <= P.earnedTargetAtHeldLoad && !(Number.isFinite(next.value) && next.value > held.value + 1e-9);
        f.onProjected = `${kind}:${repeated ? 'REPEATED_ROW' : earned ? 'EARNED_TARGET' : 'OTHER'}`;
        totals[`hold_${kind}`] = (totals[`hold_${kind}`] ?? 0) + 1;
        totals[`hold_${f.onProjected}`] = (totals[`hold_${f.onProjected}`] ?? 0) + 1;
        if (totals.examples.length < 40) totals.examples.push(`${goal} ${pathName}@w${H} ${name}: held ${P.heldRow} | executed before ${lastLoad} x ${lastReps} | logged ${held.value + v(held).kg} x ${v(held).reps}@${v(held).rir} | next ${cell.nextRow} | ${f.onProjected}`);
      }
    }
  }
}
out.totals = totals;
console.log(JSON.stringify(out, null, 1));
