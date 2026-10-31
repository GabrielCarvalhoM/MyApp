// E01 (QE reviewer-owned, R7ARA engineering recheck; root cause B, QE-R7ADA-02; property E). Return factual ceiling, single pause: a return's
// baseline never exceeds the running state or dose the athlete executed and tolerated. Released, eligible or projected progression is not executed.
// The factual record is the probe's own: every run it reported executed completely with an ordinary response (no adverse response, no partial),
// read from what it sent, not from the runtime's reducer. Classes (recheck request §10):
//   EASY      intermediate runner (the intake of Q06c): pause from week k (2..9: development, consolidation and event-phase weeks), on Monday or on
//             Thursday after the week's Tuesday run; the week before the pause fully executed, or its long run missed, adverse or partial.
//   WJ        walk/jog novice (L.WJ): pause right after the week whose sessions ran ladder step s (1..8; 8 = the exit to continuous running,
//             released and never run), on Monday, or after the next step's (or the first continuous) session ran on Monday (execution promotes).
// Breaks: SHORT 6 days, MODERATE 17 days, LONG 35 days (shortMaxDays 10, moderateMaxDays 28). Reported 06:00 the day after the pause ends.
// Checks on the return (its entry state and its first run rows, before any new execution):
//   mode      a walk/jog athlete with no continuous run executed since the entry gets no continuous run (F4-X), whatever the break;
//   step      walk/jog step <= the step last run; recipe: SHORT <= last, MODERATE <= last - 1, LONG = 0;
//   long/easy EASY-mode long runs and easy runs <= the largest executed and tolerated since the entry (SHORT rows and entry; MODERATE returnTo);
//             without one on the record since the entry the dimension stands (E1.5) and is not checked.
import * as L from './qe-r7ada-lib.mjs';
const out = {probe: 'qe-r7ara-E01-return-factual-ceiling', tree: L.TREE, cases: []};
const BREAKS = {SHORT: 6, MODERATE: 17, LONG: 35};
const CONT = ['EASY', 'LONG', 'QUALITY'];
const ADVERSE = {performance: 'WORSE', recovery: 'POOR', effort: 'HARDER_THAN_TARGET', nextDayFunction: 'REDUCED'};
/** Reports sessions and records the runs executed completely with an ordinary response (the probe's own factual record). */
function report(t, w, day, sessions, rec, how = () => ({})) {
  const obs = sessions.map(s => { const h = how(s), o = L.obs(t.p, s, h.minutes ? {minutes: h.minutes} : {}); if (h.adverse) o.response = {...ADVERSE}; return {o, s, h}; });
  if (!obs.length) return;
  L.step(t, L.at(t.p, w, day, '21:00:00', {observations: obs.map(x => x.o)}), {allow: true});
  for (const {s, h} of obs) if (s.sport === 'RUN') rec.push({date: s.date, week: w, role: s.role, dim: s.progression?.dimension ?? null, value: s.progression?.value ?? null, minutes: s.prescription.durationMinutes, tolerated: !h.adverse, complete: !h.minutes || h.minutes >= 0.9 * s.prescription.durationMinutes});
}
const week = (t, w, rec, how) => { const ss = t.p.weeks[w].sessions.filter(L.live); report(t, w, 6, ss, rec, how); };
function pauseAt(t, startDate, days) {
  const end = L.addDays(startDate, days - 1), rep = L.addDays(end, 1), W = t.p.weeks.findIndex(x => rep >= x.startDate && rep <= L.addDays(x.startDate, 6));
  if (W < 0 || W + 1 >= t.p.weeks.length) return null;
  const r = L.step(t, L.at(t.p, W, Math.round((Date.parse(rep) - Date.parse(t.p.weeks[W].startDate)) / 864e5), '06:00:00', L.brk(startDate, end)), {allow: true});
  const d = t.p.decisions.at(-1);
  if (!d?.interruption) return {status: r.status, action: r.action, reason: r.reason};
  // The re-entry week only (the return's own week from the report on): the weeks after it are the conditional projection, which steps on only
  // when the re-entry week is executed (a projection, not a baseline).
  const rows = t.p.weeks[d.fromWeek].sessions.filter(s => L.live(s) && s.sport === 'RUN' && s.date >= rep)
    .map(s => ({date: s.date, role: s.role, minutes: s.prescription.durationMinutes, dim: s.progression?.dimension ?? null, value: s.progression?.value ?? null}));
  return {status: r.status, action: r.action, cls: d.interruption.class, entry: L.runOf(d.interruption.entry.run), returnFrom: d.interruption.entry.run.returnFrom ?? null, returnTo: d.interruption.entry.run.returnTo ?? null, rows, report: rep};
}
function judge(c, rec, sinceDate, cls) {
  const ran = rec.filter(x => x.date >= sinceDate && x.complete), tol = ran.filter(x => x.tolerated), v = [];
  const wj = ran.filter(x => x.dim === 'WALK_JOG_STEP'), lastStep = wj.at(-1)?.value ?? null, contRan = ran.some(x => CONT.includes(x.role) && x.dim !== 'WALK_JOG_STEP');
  const max = pred => { const m = tol.filter(pred).map(x => x.minutes); return m.length ? Math.max(...m) : null; };
  const maxLong = max(x => x.role === 'LONG'), maxEasy = max(x => x.role === 'EASY' && !['THRESHOLD_STEP', 'SPECIFIC_STEP'].includes(x.dim));
  const lastMode = ran.filter(x => x.dim).at(-1)?.dim === 'WALK_JOG_STEP' ? 'WALK_JOG' : null;
  if (!c.entry) { v.push('no return decision: ' + c.status + ' ' + c.reason); return {v, facts: {lastStep, maxLong, maxEasy, lastMode, contRan}}; }
  if (lastMode === 'WALK_JOG' && !contRan) {
    if (c.entry.mode !== 'WALK_JOG') v.push(`mode ${c.entry.mode} for a walk/jog athlete who never ran continuously`);
    const cont = c.rows.filter(x => CONT.includes(x.role) && x.dim !== 'WALK_JOG_STEP'); if (cont.length) v.push('continuous rows ' + cont.map(x => x.role + ':' + x.minutes).join(','));
    const allowed = cls === 'SHORT' ? lastStep : cls === 'MODERATE' ? Math.max(0, lastStep - 1) : 0;
    if (Number.isInteger(c.entry.walkStep) && c.entry.walkStep > lastStep) v.push(`entry step ${c.entry.walkStep} above the step last run ${lastStep}`);
    const steps = c.rows.filter(x => x.dim === 'WALK_JOG_STEP').map(x => x.value); if (steps.some(s => s > allowed)) v.push(`steps ${steps} above the ${cls} recipe ${allowed}`);
  }
  if (c.entry.mode === 'EASY' || (cls === 'SHORT' && !lastMode)) {
    if (maxLong !== null && Number.isFinite(c.entry.long) && c.entry.long > maxLong) v.push(`entry long ${c.entry.long} > executed ${maxLong}`);
    if (maxEasy !== null && Number.isFinite(c.entry.easy) && c.entry.easy > maxEasy) v.push(`entry easy ${c.entry.easy} > executed ${maxEasy}`);
    for (const x of c.rows) { if (x.role === 'LONG' && maxLong !== null && x.minutes > maxLong) v.push(`row LONG ${x.minutes} > ${maxLong}`); if (x.role === 'EASY' && x.dim === 'EASY_MINUTES' && maxEasy !== null && x.minutes > maxEasy) v.push(`row EASY ${x.minutes} > ${maxEasy}`); }
  }
  if (c.returnTo) { if (maxLong !== null && Number.isFinite(c.returnTo.long) && c.returnTo.long > maxLong) v.push(`returnTo long ${c.returnTo.long} > ${maxLong}`); if (maxEasy !== null && Number.isFinite(c.returnTo.easy) && c.returnTo.easy > maxEasy) v.push(`returnTo easy ${c.returnTo.easy} > ${maxEasy}`); }
  if (cls === 'LONG' && lastMode === 'WALK_JOG' && !contRan && c.entry.walkStep !== 0) v.push(`LONG break walk/jog step ${c.entry.walkStep} != 0`);
  return {v, facts: {lastStep, maxLong, maxEasy, lastMode, contRan}};
}
// ---------- EASY ----------
for (const k of [2, 3, 4, 5, 6, 7, 8, 9]) for (const variant of ['ALL', 'LONG_MISSED', 'LONG_ADVERSE', 'LONG_PARTIAL']) for (const start of ['MON', 'THU']) for (const [cls, days] of Object.entries(BREAKS)) {
  L.resetIds(); const t = L.gen({id: 'qe-e01-easy'}), rec = [];
  try {
    for (let w = 0; w < k - 1; w++) week(t, w, rec);
    const lw = k - 1, long = t.p.weeks[lw].sessions.find(s => L.live(s) && s.role === 'LONG');
    if (variant === 'LONG_MISSED') report(t, lw, 6, t.p.weeks[lw].sessions.filter(s => L.live(s) && s !== long), rec);
    else week(t, lw, rec, s => s === long ? (variant === 'LONG_ADVERSE' ? {adverse: true} : variant === 'LONG_PARTIAL' ? {minutes: Math.round(s.prescription.durationMinutes * 0.5)} : {}) : {});
    let pauseStart = t.p.weeks[k].startDate;
    if (start === 'THU') { const ss = t.p.weeks[k].sessions.filter(s => L.live(s) && s.day < 3); for (const d of [0, 1, 2]) report(t, k, d, ss.filter(s => s.day === d), rec); pauseStart = L.addDays(t.p.weeks[k].startDate, 3); }
    const H = L.history(t, k, start === 'THU' ? 3 : 0).state.run;
    const c = pauseAt(t, pauseStart, days); if (!c) continue;
    const j = judge(c, rec, t.p.startDate, cls);
    out.cases.push({profile: 'EASY', k, variant, start, break: cls, cls: c.cls, history: {mode: H.mode, long: H.long, easy: H.easy}, entry: c.entry && {mode: c.entry.mode, long: c.entry.long, easy: c.entry.easy, restart: c.entry.restart, returnStep: c.entry.returnStep}, returnTo: c.returnTo && {long: c.returnTo.long, easy: c.returnTo.easy}, rows: c.rows, facts: j.facts, violations: j.v,
      releasedAboveExecuted: (j.facts.maxLong !== null && H.long > j.facts.maxLong) || (j.facts.maxEasy !== null && H.easy > j.facts.maxEasy)});
  } catch (e) { out.cases.push({profile: 'EASY', k, variant, start, break: cls, error: String(e.message).slice(0, 300)}); }
}
// ---------- WALK/JOG ladder and its exit ----------
const ref = (() => { L.resetIds(); const t = L.gen({id: 'qe-e01-wj', ...L.WJ}), weekOf = {}; for (let w = 0; w < t.p.weeks.length - 2; w++) { const st = t.p.weeks[w].sessions.find(s => L.live(s) && s.role === 'WALK_JOG')?.progression?.value; if (Number.isInteger(st)) weekOf[st] ??= w; if (st === 8) break; L.weekly(t, w); } return weekOf; })();
for (const s of [1, 2, 3, 4, 5, 6, 7, 8]) for (const variant of ['ALL', 'NEXT_RUN_MONDAY', 'LAST_ADVERSE']) for (const [cls, days] of Object.entries(BREAKS)) {
  // The last week whose rows ran step s; the evidence then releases s + 1 (or, after 8, continuous running).
  L.resetIds(); const t = L.gen({id: 'qe-e01-wj', ...L.WJ}), rec = [];
  try {
    let lw = -1; for (let w = 0; w < t.p.weeks.length - 3; w++) { const st = t.p.weeks[w].sessions.find(x => L.live(x) && x.role === 'WALK_JOG')?.progression?.value; const nx = t.p.weeks[w + 1].sessions.find(x => L.live(x) && x.role === 'WALK_JOG')?.progression?.value;
      const lastOfStep = st === s && nx !== s; const wjs = t.p.weeks[w].sessions.filter(x => L.live(x) && x.role === 'WALK_JOG');
      week(t, w, rec, x => variant === 'LAST_ADVERSE' && lastOfStep && x === wjs.at(-1) ? {adverse: true} : {});
      const next = t.p.weeks[w + 1].sessions.find(x => L.live(x) && x.sport === 'RUN' && x.prescription)?.progression?.value;
      if (st === s && (t.p.weeks[w + 1].sessions.find(x => L.live(x) && x.role === 'WALK_JOG')?.progression?.value ?? 99) !== s) { lw = w; break; } }
    if (lw < 0) { out.cases.push({profile: 'WJ', s, variant, break: cls, skipped: 'step not reached'}); continue; }
    const k = lw + 1; let pauseStart = t.p.weeks[k].startDate;
    if (variant === 'NEXT_RUN_MONDAY') { const first = t.p.weeks[k].sessions.filter(x => L.live(x) && x.sport === 'RUN').sort((a, b) => a.date < b.date ? -1 : 1)[0]; report(t, k, first.day, [first], rec); pauseStart = L.addDays(first.date, 1); }
    const H = L.historyAt(t, `${pauseStart}T00:00:00Z`).state.run;
    const c = pauseAt(t, pauseStart, days); if (!c) continue;
    const j = judge(c, rec, t.p.startDate, cls);
    out.cases.push({profile: 'WJ', s, variant, break: cls, cls: c.cls, history: {mode: H.mode, walkStep: H.walkStep, easy: H.easy}, entry: c.entry && {mode: c.entry.mode, walkStep: c.entry.walkStep, easy: c.entry.easy, long: c.entry.long, restart: c.entry.restart}, rows: c.rows, facts: j.facts, violations: j.v,
      releasedAboveExecuted: H.mode !== 'WALK_JOG' && !j.facts.contRan || (H.mode === 'WALK_JOG' && H.walkStep > j.facts.lastStep)});
  } catch (e) { out.cases.push({profile: 'WJ', s, variant, break: cls, error: String(e.message).slice(0, 300)}); }
}
const ok = out.cases.filter(c => !c.error && !c.skipped);
out.summary = {cases: out.cases.length, judged: ok.length, errors: out.cases.filter(c => c.error).map(c => `${c.profile} ${c.k ?? c.s} ${c.variant} ${c.start ?? ''} ${c.break}: ${c.error}`), skipped: out.cases.filter(c => c.skipped).length,
  releasedAboveExecuted: ok.filter(c => c.releasedAboveExecuted).length, classMismatch: ok.filter(c => c.cls && c.cls !== c.break).map(c => `${c.profile} ${c.k ?? c.s} ${c.variant} ${c.break}->${c.cls}`),
  violations: ok.filter(c => c.violations.length).map(c => `${c.profile} ${c.profile === 'EASY' ? 'k=' + c.k : 's=' + c.s} ${c.variant} ${c.start ?? ''} ${c.break}: ${c.violations.join('; ')}`)};
console.log(JSON.stringify(out, null, 1));
