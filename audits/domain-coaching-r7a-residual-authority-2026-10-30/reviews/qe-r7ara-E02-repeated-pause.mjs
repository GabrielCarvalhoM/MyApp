// E02 (QE reviewer-owned, R7ARA engineering recheck; root cause B, QE-R7ADA-02; property E; recheck request §10 "repeated pause", §11 R7ARA-SELF-01).
// A bounded repeated-pause path: a first return, some of its doses executed, then a second pause before the next released state or dose runs.
// The factual record is the probe's own (every run it reported executed completely, ordinary response), split at the latest entry (the first
// return's report: contract E1.2 reads the runs since the state's latest entry). Paths:
//   P1  EASY runner, first break MODERATE (14 days, weeks 3-4, reported Monday 06:00 of week 5: re-entry at return step 0). Stages before the
//       second break: S0 only the re-entry week's first run executed (pause from that week's Wednesday); S1 the re-entry week executed and closed
//       (step 1 released, never run); S2 return steps 0 and 1 executed (the return's completion released, never run: R7ARA-SELF-01's cell when the
//       second break is MODERATE); S3 the completed state's first week executed too (execution promotes).
//   P2  EASY runner, first break LONG (33 days from week 2): restart weeks executed until the evidence releases the switch to easy running
//       (never run), then the second break.
//   P3  Walk/jog novice, first break SHORT (6 days) after the week that ran step 3; the return week executed and closed (step 4 released, never
//       run), then the second break.
// Second break: SHORT 4 days, MODERATE 14 days, LONG 33 days, from the Monday after the stage (S0: the Wednesday).
// Checks (on the second return's entry state and the re-entry week's rows):
//   SHORT     the state last run: a return step, restart minutes or walk/jog step never above the last one run; an easy-mode long/easy dose never
//             above the largest executed since the latest entry; the mode never one no run has used since the entry (completion, switch, exit).
//   MODERATE  re-entry at return step 0 from the 15-minute entry (or a current demonstration), rows never above the entry; the target (returnTo)
//             never a dose no run executed (a target above the doses executed since the latest entry is recorded apart); walk/jog: one step
//             below the step last run.
//   LONG      a runner restarts (RESTART), a walk/jog athlete at step 0.
import * as L from './qe-r7ada-lib.mjs';
const out = {probe: 'qe-r7ara-E02-repeated-pause', tree: L.TREE, cases: []};
const ENTRY = L.opts.authority.policy.operational.return.entryRunMinutes;
const SECOND = {SHORT: 4, MODERATE: 14, LONG: 33};
function close(t, w, rec, from = null) {
  const ss = t.p.weeks[w].sessions.filter(s => L.live(s) && (!from || s.date >= from));
  if (!ss.length) return;
  L.step(t, L.at(t.p, w, 6, '21:00:00', {observations: ss.map(s => L.obs(t.p, s))}), {allow: true});
  for (const s of ss) if (s.sport === 'RUN') rec.push({date: s.date, role: s.role, dim: s.progression?.dimension ?? null, value: s.progression?.value ?? null, minutes: s.prescription.durationMinutes});
}
function pause(t, startDate, days) {
  const end = L.addDays(startDate, days - 1), rep = L.addDays(end, 1), W = t.p.weeks.findIndex(x => rep >= x.startDate && rep <= L.addDays(x.startDate, 6));
  if (W < 0 || W + 2 >= t.p.weeks.length) return null;
  const r = L.step(t, L.at(t.p, W, Math.round((Date.parse(rep) - Date.parse(t.p.weeks[W].startDate)) / 864e5), '06:00:00', L.brk(startDate, end)), {allow: true}), d = t.p.decisions.at(-1);
  if (!d?.interruption) return {status: r.status, action: r.action, reason: r.reason, report: rep};
  const e = d.interruption.entry.run;
  const rows = t.p.weeks[d.fromWeek].sessions.filter(s => L.live(s) && s.sport === 'RUN' && s.date >= rep).map(s => ({date: s.date, role: s.role, minutes: s.prescription.durationMinutes, dim: s.progression?.dimension ?? null, value: s.progression?.value ?? null}));
  return {status: r.status, action: r.action, cls: d.interruption.class, report: rep, fromWeek: d.fromWeek, entry: {mode: e.mode, returnStep: e.returnStep ?? null, walkStep: e.walkStep ?? null, restart: e.restart ?? null, easy: e.easy ?? null, long: e.long ?? null, returnFrom: e.returnFrom ? {easy: e.returnFrom.easy ?? null, long: e.returnFrom.long ?? null} : null, returnTo: e.returnTo ? {mode: e.returnTo.mode ?? null, easy: e.returnTo.easy ?? null, long: e.returnTo.long ?? null, walkStep: e.returnTo.walkStep ?? null} : null}, rows};
}
function judge(c, rec, since, second) {
  const ran = rec.filter(x => x.date >= since), v = [], last = dim => ran.filter(x => x.dim === dim).at(-1)?.value ?? null, max = pred => { const m = ran.filter(pred).map(x => x.minutes); return m.length ? Math.max(...m) : null; };
  const lastDim = ran.filter(x => x.dim).at(-1)?.dim ?? null, maxLong = max(x => x.role === 'LONG'), maxEasy = max(x => x.role === 'EASY' && !['THRESHOLD_STEP', 'SPECIFIC_STEP'].includes(x.dim)), maxAny = max(() => true);
  const ever = pred => { const m = rec.filter(pred).map(x => x.minutes); return m.length ? Math.max(...m) : null; };
  const f = {lastDim, lastReturnStep: last('RETURN_STEP'), lastRestart: last('RESTART_MINUTES'), lastWalkStep: last('WALK_JOG_STEP'), maxLong, maxEasy, maxAny, runsSinceEntry: ran.length,
    everLong: ever(x => x.role === 'LONG'), everEasy: ever(x => x.role === 'EASY' && !['THRESHOLD_STEP', 'SPECIFIC_STEP'].includes(x.dim))};
  if (!c) { f.outsideHorizon = true; return {v, f}; }
  if (!c.entry) { v.push('no return decision: ' + c.status + ' ' + c.reason); return {v, f}; }
  const E = c.entry, modeOfLast = {RETURN_STEP: 'RETURN', RESTART_MINUTES: 'RESTART', WALK_JOG_STEP: 'WALK_JOG', LONG_MINUTES: 'EASY', EASY_MINUTES: 'EASY', THRESHOLD_STEP: 'EASY', SPECIFIC_STEP: 'EASY'}[lastDim] ?? null;
  if (second === 'SHORT') {
    if (modeOfLast && E.mode !== modeOfLast) v.push(`SHORT: mode ${E.mode}, the mode last run is ${modeOfLast}`);
    if (E.mode === 'RETURN' && f.lastReturnStep !== null && E.returnStep > f.lastReturnStep) v.push(`SHORT: return step ${E.returnStep} > ${f.lastReturnStep} last run`);
    if (E.mode === 'RESTART' && f.lastRestart !== null && E.restart > f.lastRestart) v.push(`SHORT: restart ${E.restart} > ${f.lastRestart} last run`);
    if (E.mode === 'WALK_JOG' && f.lastWalkStep !== null && E.walkStep > f.lastWalkStep) v.push(`SHORT: walk/jog step ${E.walkStep} > ${f.lastWalkStep}`);
    if (E.mode === 'EASY') { if (maxLong !== null && E.long > maxLong) v.push(`SHORT: long ${E.long} > ${maxLong}`); if (maxEasy !== null && E.easy > maxEasy) v.push(`SHORT: easy ${E.easy} > ${maxEasy}`); }
    // Rows: a ladder row never above the step last run (E1.4); an easy-mode row never above the largest executed since the entry; a dimension with
    // no run since the entry stands (E1.5: the entry's own dose).
    for (const x of c.rows) {
      if (x.dim === 'RETURN_STEP' && f.lastReturnStep !== null && x.value > f.lastReturnStep) v.push(`SHORT: row return step ${x.value} > ${f.lastReturnStep}`);
      if (x.dim === 'RESTART_MINUTES' && f.lastRestart !== null && x.value > f.lastRestart) v.push(`SHORT: row restart ${x.value} > ${f.lastRestart}`);
      if (x.dim === 'WALK_JOG_STEP' && f.lastWalkStep !== null && x.value > f.lastWalkStep) v.push(`SHORT: row walk/jog step ${x.value} > ${f.lastWalkStep}`);
      if (x.dim === 'LONG_MINUTES' && maxLong !== null && x.minutes > maxLong) v.push(`SHORT: row LONG ${x.minutes} > ${maxLong}`);
      if (x.dim === 'EASY_MINUTES' && maxEasy !== null && x.minutes > maxEasy) v.push(`SHORT: row EASY ${x.minutes} > ${maxEasy}`);
    }
  } else if (second === 'MODERATE') {
    if (lastDim === 'WALK_JOG_STEP') { if (E.mode !== 'WALK_JOG' || E.walkStep > Math.max(0, f.lastWalkStep - 1)) v.push(`MODERATE walk/jog: ${E.mode} step ${E.walkStep}, recipe ${Math.max(0, f.lastWalkStep - 1)}`); }
    else {
      if (E.mode !== 'RETURN' || E.returnStep !== 0) v.push(`MODERATE: entry ${E.mode} step ${E.returnStep}, not the re-entry at return step 0`);
      if (E.returnFrom && E.returnFrom.easy > ENTRY) v.push(`MODERATE: returnFrom.easy ${E.returnFrom.easy} above the ${ENTRY}-minute entry`);
      const cap = Math.max(E.returnFrom?.easy ?? 0, E.returnFrom?.long ?? 0); for (const x of c.rows) if (cap && x.minutes > cap) v.push(`MODERATE: row ${x.role}:${x.minutes} above the entry ${cap}`);
      // The target: never a dose no run ever executed (violation); above the doses executed since the latest entry is recorded (the window E1.2
      // reads for an easy state; a RETURN state keeps its own target, E1.3), not counted.
      if (E.returnTo) { if (f.everLong !== null && E.returnTo.long > f.everLong) v.push(`MODERATE: returnTo.long ${E.returnTo.long} > ${f.everLong}, never executed`); if (f.everEasy !== null && E.returnTo.easy > f.everEasy) v.push(`MODERATE: returnTo.easy ${E.returnTo.easy} > ${f.everEasy}, never executed`);
        f.targetAboveSinceEntry = (maxLong !== null && E.returnTo.long > maxLong) || (maxEasy !== null && E.returnTo.easy > maxEasy); }
    }
  } else {
    if (lastDim === 'WALK_JOG_STEP') { if (E.mode !== 'WALK_JOG' || E.walkStep !== 0) v.push(`LONG walk/jog: ${E.mode} step ${E.walkStep}`); }
    else if (E.mode !== 'RESTART') v.push(`LONG: entry ${E.mode}, not a restart`);
  }
  return {v, f};
}
const stage = {
  P1: (t, rec, s) => {
    for (let w = 0; w < 3; w++) close(t, w, rec);
    const first = pause(t, t.p.weeks[3].startDate, 14); if (!first?.entry) throw Error('P1 first return ' + JSON.stringify(first));
    const W = first.fromWeek;
    if (s === 'S0') { const r0 = t.p.weeks[W].sessions.filter(x => L.live(x) && x.sport === 'RUN' && x.date >= first.report).sort((a, b) => a.date < b.date ? -1 : 1)[0];
      L.step(t, L.at(t.p, W, r0.day, '21:00:00', {observations: [L.obs(t.p, r0)]}), {allow: true}); rec.push({date: r0.date, role: r0.role, dim: r0.progression?.dimension ?? null, value: r0.progression?.value ?? null, minutes: r0.prescription.durationMinutes});
      return {first, next: L.addDays(r0.date, 1)}; }
    // S1: the re-entry week (return step 0); S2: and the next (step 1): the evidence completes the return; S3: and the completed state's first week.
    const n = {S1: 1, S2: 2, S3: 3}[s]; let w = W;
    for (let i = 0; i < n; i++, w++) close(t, w, rec, i === 0 ? first.report : null);
    const H = L.history(t, w).state.run;
    return {first, next: t.p.weeks[w].startDate, modeAtNext: H.mode, stepAtNext: H.returnStep ?? null};
  },
  P2: (t, rec) => {
    for (let w = 0; w < 2; w++) close(t, w, rec);
    const first = pause(t, t.p.weeks[2].startDate, 33); if (first?.entry?.mode !== 'RESTART') throw Error('P2 first return ' + JSON.stringify(first?.entry));
    let w = first.fromWeek; close(t, w, rec, first.report); w++;
    for (; w < t.p.weeks.length - 4 && L.history(t, w).state.run.mode === 'RESTART'; w++) close(t, w, rec);
    return {first, next: t.p.weeks[w].startDate, modeAtNext: L.history(t, w).state.run.mode};
  },
  P3: (t, rec) => {
    let w = 0; for (; w < t.p.weeks.length - 4; w++) { const st = t.p.weeks[w].sessions.find(x => L.live(x) && x.role === 'WALK_JOG')?.progression?.value; close(t, w, rec); if (st === 3 && (t.p.weeks[w + 1].sessions.find(x => L.live(x) && x.role === 'WALK_JOG')?.progression?.value ?? 99) !== 3) break; }
    const first = pause(t, t.p.weeks[w + 1].startDate, 6); if (!first?.entry) throw Error('P3 first return');
    close(t, first.fromWeek, rec, first.report);
    return {first, next: t.p.weeks[first.fromWeek + 1].startDate, modeAtNext: L.history(t, first.fromWeek + 1).state.run.mode, stepAtNext: L.history(t, first.fromWeek + 1).state.run.walkStep};
  },
};
const PATHS = [['P1', 'S0'], ['P1', 'S1'], ['P1', 'S2'], ['P1', 'S3'], ['P2', null], ['P3', null]];
for (const [path, s] of PATHS) for (const [second, days] of Object.entries(SECOND)) {
  L.resetIds(); const t = L.gen(path === 'P3' ? {id: 'qe-e02-wj', ...L.WJ} : {id: 'qe-e02-easy'}), rec = [];
  try {
    const st = stage[path](t, rec, s), c = pause(t, st.next, days), j = judge(c, rec, st.first.report, second);
    out.cases.push({path, stage: s, second, first: {cls: st.first.cls, report: st.first.report, entry: st.first.entry}, stateAtSecond: {mode: st.modeAtNext ?? null, walkStep: st.stepAtNext ?? null}, second_: c && {cls: c.cls, action: c.action, report: c.report, entry: c.entry, rows: c.rows}, facts: j.f, violations: j.v});
  } catch (e) { out.cases.push({path, stage: s, second, error: String(e.stack).slice(0, 400)}); }
}
const ok = out.cases.filter(c => !c.error);
out.summary = {cases: out.cases.length, errors: out.cases.filter(c => c.error).map(c => `${c.path} ${c.stage ?? ''} ${c.second}: ${c.error.slice(0, 200)}`),
  classMismatch: ok.filter(c => c.second_?.cls && c.second_.cls !== c.second).map(c => `${c.path} ${c.stage ?? ''} ${c.second}->${c.second_.cls}`),
  outsideHorizon: ok.filter(c => c.facts.outsideHorizon).map(c => `${c.path} ${c.stage ?? ''} ${c.second}`), targetAboveSinceEntry: ok.filter(c => c.facts.targetAboveSinceEntry).map(c => `${c.path} ${c.stage ?? ''} ${c.second}: returnTo ${JSON.stringify(c.second_?.entry?.returnTo)} since-entry ${c.facts.maxEasy}/${c.facts.maxLong} ever ${c.facts.everEasy}/${c.facts.everLong}`),
  violations: ok.filter(c => c.violations.length).map(c => `${c.path} ${c.stage ?? ''} ${c.second}: ${c.violations.join('; ')}`),
  selfR7ARA01: ok.filter(c => c.path === 'P1' && c.stage === 'S2' && c.second === 'MODERATE').map(c => ({entry: c.second_?.entry, rows: (c.second_?.rows ?? []).map(x => `${x.role}:${x.minutes}${x.dim ? ':' + x.dim + '=' + x.value : ''}`), executedSinceEntry: {maxEasy: c.facts.maxEasy, maxLong: c.facts.maxLong, lastReturnStep: c.facts.lastReturnStep}}))[0] ?? null};
console.log(JSON.stringify(out, null, 1));
