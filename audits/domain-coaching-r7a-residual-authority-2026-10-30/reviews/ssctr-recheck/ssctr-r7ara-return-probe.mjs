// SSCTR R7ARA-SSCTR-r1 return probe (own; prints only). Narrow recheck of R7A-RESIDUAL-AUTHORITY-FREEZE-1, items F4-X (with the continuous
// probe), the EASY return factual ceiling, R7ARA-SELF-01 and the ruling points E1-a..E1-f. Loads the runtime that SSCTR_CC selects (required)
// through its public entry points only (generateProgram, evaluateProgram, historicalStateOf), via my R7ADA lib (unchanged). Synthetic data;
// DEV_TEST_ONLY authority; read-only runtime use.
//
// Part A, EASY single pause. Three easy runners: PERF (my lib intake: PERFORMANCE, run Tue/Thu/Sun, long run Sunday, 16 weeks), HM (fixture
// A_RUN_FIRST_HALF_MARATHON, 16 weeks) and HYB (fixture C_BALANCED_HYBRID, 12 weeks). Weeks 0..k-1 executed as prescribed and reviewed; then a
// pause from Monday of week k (d0 = 0) or from Thursday of week k with that week's sessions before Thursday executed and reported day by day,
// never reviewed (d0 = 3). SHORT 4, 6 and 10 days; MODERATE 14, 17, 21 and 28 days; reported the day after the pause ends at 06:00.
// Factual references, read from the record as I build it (not from the runtime): the runs executed completely before the pause with a tolerated
// response (no ADVERSE or CONFLICTING class), their prescribed minutes (the row's duration, not its progression value): the largest LONG, the
// largest EASY run on the EASY_MINUTES dimension (an eased quality slot keeps THRESHOLD_STEP/SPECIFIC_STEP and is reported apart), and the last
// LONG and last EASY. Property checked (item 8): SHORT: the entry's long and easy, and every LONG and EASY_MINUTES row of the re-entry week from the
// report on, never above the largest executed and tolerated; MODERATE: returnTo never above it, returnFrom never above the 15-minute entry, rows of
// the re-entry week never above returnFrom. E1-a cells: a SHORT entry long above the last long executed (the largest instead).
// Part B, adverse response: the last long run before the pause executed with recovery ADVERSE; the ceiling must fall back to the largest
// tolerated long. Part C, repeated pauses (bounded): C1 SHORT, re-entry week executed, SHORT again; C2 EASY 70 executed / 75 released, SHORT,
// re-entry executed, SHORT again; C3 (E1-b) MODERATE re-entry week executed at return step 0, then SHORT, and the P4 control (step 1 run once);
// C4 (E1-d, E1-f, R7ARA-SELF-01) return steps 0 and 1 executed, the completion released and never run, then SHORT / MODERATE / LONG; C5 (E1-d)
// the same with one easy-mode run executed before a SHORT pause; C6 (E1-e, E1-f) a restart run until the switch to easy is released, then SHORT /
// MODERATE; C7 a SHORT pause right after a SHORT return's first week was executed with an adverse long run.
import * as L from './ssctr-r7ada-lib.mjs';
if (!process.env.SSCTR_CC) throw Error('SSCTR_CC is required');

const {PROFILES} = await L.loadProfiles();
const ATHLETES = {
  PERF: () => L.intake({id: 'ssctr-r7ara-perf'}),
  HM: () => { const p = structuredClone(PROFILES.A_RUN_FIRST_HALF_MARATHON); p.athlete.id = 'ssctr-r7ara-hm'; return p; },
  HYB: () => { const p = structuredClone(PROFILES.C_BALANCED_HYBRID); p.athlete.id = 'ssctr-r7ara-hyb'; return p; },
};
const ENTRY = L.OP.return?.entryRunMinutes ?? 15;
const QUALITY_DIMS = ['THRESHOLD_STEP', 'SPECIFIC_STEP'];
// The response class, as the approved R6 learning rule defines it (re-implemented here, only the two classes that exclude tolerance).
const intolerant = r => {
  r = r ?? {};
  if (r.performance === 'OVER' && (r.recovery === 'ADVERSE' || r.effort === 'HARDER') || r.performance === 'UNDER' && r.recovery === 'COMPATIBLE' && r.effort === 'EASIER') return true;
  return r.recovery === 'ADVERSE' || r.nextDayFunction === 'IMPAIRED' || r.performance === 'UNDER' && r.effort !== 'EASIER' || r.effort === 'HARDER' && r.performance !== 'OVER';
};
const sessionById = t => new Map(t.p.weeks.flatMap(w => w.sessions.map(s => [s.id, {s, w: w.index}])));
/** Runs executed completely before `cutIso` and after `sinceIso` (exclusive), from the ledger as I built it: completed, >= 90% of the minutes. */
function executedRuns(t, cutIso, sinceIso = null) {
  const by = sessionById(t), out = [];
  for (const o of t.ledger) {
    if (o.superseded || o.partial || o.conflicted) continue;
    const x = by.get(o.sessionId ?? o.context?.sessionId); if (!x || x.s.sport !== 'RUN' || !x.s.prescription) continue;
    if (!(Date.parse(o.observedAt) < Date.parse(cutIso)) || (sinceIso && !(Date.parse(o.observedAt) > Date.parse(sinceIso)))) continue;
    const a = o.actual ?? {}; if (a.completed !== true || (Number.isFinite(a.minutes) && a.minutes < 0.9 * x.s.prescription.durationMinutes)) continue;
    out.push({date: x.s.date, at: o.observedAt, week: x.w, role: x.s.role, dim: x.s.progression?.dimension ?? null, value: x.s.progression?.value ?? null, minutes: x.s.prescription.durationMinutes, tolerated: !intolerant(o.response)});
  }
  return out.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}
const refs = ran => {
  const tol = ran.filter(x => x.tolerated), longs = tol.filter(x => x.role === 'LONG'), easys = tol.filter(x => x.role === 'EASY' && x.dim === 'EASY_MINUTES');
  const lastLong = ran.filter(x => x.role === 'LONG').at(-1), lastEasy = ran.filter(x => x.role === 'EASY' && x.dim === 'EASY_MINUTES').at(-1);
  return {maxLong: longs.length ? Math.max(...longs.map(x => x.minutes)) : null, maxEasy: easys.length ? Math.max(...easys.map(x => x.minutes)) : null,
    lastLong: lastLong?.minutes ?? null, lastEasy: lastEasy?.minutes ?? null, lastRun: ran.at(-1) ? `${ran.at(-1).role}:${ran.at(-1).minutes}${ran.at(-1).dim ? ' ' + ran.at(-1).dim + '=' + ran.at(-1).value : ''}` : null};
};
const H = (t, iso) => { try { const x = L.historicalStateOf(t.p, {asOf: iso, actualLedger: t.ledger}, L.opts)?.state?.run; return x && {mode: x.mode, easy: x.easy ?? null, easyExtra: x.easyExtra ?? null, long: x.long ?? null, returnStep: x.returnStep ?? null, restart: x.restart ?? null, walkStep: x.walkStep ?? null}; } catch (e) { return {error: String(e.message ?? e).slice(0, 120)}; } };
const pick = e => e && {mode: e.mode, easy: e.easy ?? null, easyExtra: e.easyExtra ?? null, long: e.long ?? null, returnStep: e.returnStep ?? null, restart: e.restart ?? null, walkStep: e.walkStep ?? null,
  returnFrom: e.returnFrom ? {easy: e.returnFrom.easy ?? null, long: e.returnFrom.long ?? null} : null, returnTo: e.returnTo ? {easy: e.returnTo.easy ?? null, long: e.returnTo.long ?? null} : null};
const rowTxt = s => `${s.date.slice(5)} ${s.role}:${s.prescription.durationMinutes}${s.progression?.dimension ? ' ' + s.progression.dimension + '=' + s.progression.value : ''}`;
const sessAt = s => `${s.date}T${s.turn === 'PM' ? '19:00:00' : '08:00:00'}Z`;
/** A pause of `days` from day d0 of week k, reported the day after it ends at 06:00 (or at `reportHour`): the decision and the re-entry rows. */
function pause(t, k, days, d0 = 0, reportHour = '06:00:00') {
  const start = L.addDays(t.p.weeks[k].startDate, d0), end = L.addDays(start, days - 1), report = L.addDays(end, 1);
  const W = t.p.weeks.findIndex(x => report >= x.startDate && report <= L.addDays(x.startDate, 6));
  if (W < 0 || W + 2 >= t.p.weeks.length) return null;
  const cut = `${start}T00:00:00Z`, hist = H(t, `${start}T00:30:00Z`), before = t.p.decisions.length;
  const r = L.step(t, L.at(t.p, W, Math.round((Date.parse(report) - Date.parse(t.p.weeks[W].startDate)) / 864e5), reportHour, L.brk(start, end)));
  // The return's own decision: a new decision carrying this interruption (a refused or asked return adds none).
  const d = t.p.decisions.slice(before).filter(x => x.interruption?.startDate === start || x.interruption?.start === start || x.interruption).at(-1) ?? null, ok = !!d?.interruption;
  const reportAt = `${report}T${reportHour}Z`;
  const fromWeek = d?.fromWeek ?? W;
  const reentry = (t.p.weeks[fromWeek]?.sessions ?? []).filter(s => L.isRun(s) && sessAt(s) > reportAt);
  const reentryWeek = reentry.length ? fromWeek : fromWeek + 1, rows = reentry.length ? reentry : (t.p.weeks[fromWeek + 1]?.sessions ?? []).filter(L.isRun);
  const next = (t.p.weeks[reentryWeek + 1]?.sessions ?? []).filter(L.isRun);
  return {start, end, report: reportAt, cut, hist, status: `${r.status}/${r.action}`, cls: ok ? d.interruption.class : null, entry: ok ? pick(d.interruption.entry?.run) : null, fromWeek, reentryWeek, rows, next};
}
const totals = {cells: 0, shortCells: 0, moderateCells: 0, violations: 0, e1aCells: 0, releasedAboveExecuted: 0, easedQualityAboveLargestEasy: 0, examples: [], e1a: [], easedQuality: []};
const flag = (label, text) => { totals.violations++; if (totals.examples.length < 60) totals.examples.push(`${label}: ${text}`); };
/** The checks of item 8 on one return. */
function check(label, P, R) {
  const out = [];
  if (!P || !P.entry) { totals.noDecision = (totals.noDecision ?? 0) + 1; if (totals.examples.length < 60) totals.examples.push(`${label}: no return decision (${P?.status})`); return []; }
  const longRows = P.rows.filter(s => s.role === 'LONG'), easyRows = P.rows.filter(s => s.role === 'EASY' && s.progression?.dimension === 'EASY_MINUTES');
  const eased = P.rows.filter(s => s.role === 'EASY' && QUALITY_DIMS.includes(s.progression?.dimension));
  if (P.cls === 'SHORT') {
    if (P.entry.mode === 'EASY') {
      if (R.maxLong !== null && P.entry.long > R.maxLong) out.push(`entry long ${P.entry.long} > largest executed ${R.maxLong}`);
      const entryEasy = P.entry.easy + ((P.entry.easyExtra ?? 0) > 0 ? L.OP.run.easyStepMinutes : 0);
      if (R.maxEasy !== null && entryEasy > R.maxEasy) out.push(`entry easy ${P.entry.easy}+extra ${P.entry.easyExtra} > largest executed ${R.maxEasy}`);
    }
    for (const s of longRows) if (R.maxLong !== null && s.prescription.durationMinutes > R.maxLong) out.push(`row ${rowTxt(s)} > largest long ${R.maxLong}`);
    for (const s of easyRows) if (R.maxEasy !== null && s.prescription.durationMinutes > R.maxEasy) out.push(`row ${rowTxt(s)} > largest easy ${R.maxEasy}`);
    if (P.entry.mode === 'EASY' && R.lastLong !== null && P.entry.long > R.lastLong) { totals.e1aCells++; if (totals.e1a.length < 40) totals.e1a.push(`${label}: entry long ${P.entry.long}, last long ${R.lastLong}, largest ${R.maxLong}`); }
    for (const s of eased) if (R.maxEasy !== null && s.prescription.durationMinutes > R.maxEasy) { totals.easedQualityAboveLargestEasy++; if (totals.easedQuality.length < 40) totals.easedQuality.push(`${label}: ${rowTxt(s)} (largest easy ${R.maxEasy}, largest long ${R.maxLong})`); }
  } else if (P.cls === 'MODERATE') {
    if (P.entry.mode === 'RETURN') {
      if (R.maxLong !== null && P.entry.returnTo?.long > R.maxLong) out.push(`returnTo long ${P.entry.returnTo.long} > largest executed ${R.maxLong}`);
      if (R.maxEasy !== null && P.entry.returnTo?.easy > R.maxEasy) out.push(`returnTo easy ${P.entry.returnTo.easy} > largest executed ${R.maxEasy}`);
      if (P.entry.returnFrom?.easy > ENTRY) out.push(`returnFrom easy ${P.entry.returnFrom.easy} > entry ${ENTRY}`);
      for (const s of P.rows) if (s.role !== 'WALK' && s.prescription.durationMinutes > (s.role === 'LONG' ? P.entry.returnFrom.long : P.entry.returnFrom.easy)) out.push(`re-entry row ${rowTxt(s)} above returnFrom`);
    } else out.push(`moderate entry mode ${P.entry.mode}`);
  }
  return out;
}
const out = {probe: 'R7ARA-SSCTR-r1-RETURN', runtime: process.env.SSCTR_CC, entryRunMinutes: ENTRY, partA: {}, partB: {}, partC: {}};
const fresh = name => L.genFrom(ATHLETES[name]());
const prefix = (name, k, d0) => { const t = fresh(name); for (let w = 0; w < k; w++) L.weekly(t, w);
  if (d0 > 0) for (const s of t.p.weeks[k].sessions.filter(s => L.live(s) && s.day < d0)) L.step(t, L.at(t.p, k, s.day, '21:00:00', {observations: [L.obs(t.p, s)]}));
  return t; };
// ---------- Part A ----------
for (const name of Object.keys(ATHLETES)) {
  const weeks = ATHLETES[name]().weeks, A = out.partA[name] = {weeks, reference: [], cells: {}};
  { const t = fresh(name); for (let w = 0; w < Math.min(weeks, 11); w++) { A.reference.push(`w${w} ${t.p.weeks[w].phase}: ${t.p.weeks[w].sessions.filter(L.isRun).map(rowTxt).join(' | ')}`); L.weekly(t, w); } }
  for (let k = 1; k <= weeks - 5; k++) for (const d0 of [0, 3]) for (const days of [4, 6, 10, 14, 17, 21, 28]) {
    const t = prefix(name, k, d0), label = `${name}/k${k}/d${d0}/${days}d`;
    const startIso = `${L.addDays(t.p.weeks[k].startDate, d0)}T00:00:00Z`, R = refs(executedRuns(t, startIso));
    const P = pause(t, k, days, d0); if (!P) continue;
    const v = check(label, P, R); totals.cells++; if (P.cls === 'SHORT') totals.shortCells++; if (P.cls === 'MODERATE') totals.moderateCells++;
    if (P.hist?.long !== null && R.maxLong !== null && P.hist?.long > R.maxLong) totals.releasedAboveExecuted++;
    for (const x of v) flag(label, x);
    A.cells[label.slice(name.length + 1)] = {cls: P.cls, status: P.status, refs: R, historyAtPause: P.hist, entry: P.entry, reentryWeek: P.reentryWeek, reentry: P.rows.map(rowTxt), nextWeek: P.next.map(rowTxt), violations: v};
  }
}
// ---------- Part B: adverse long run ----------
for (const [name, k] of [['PERF', 6], ['PERF', 7], ['HM', 6], ['HM', 9]]) for (const days of [6, 17]) {
  const t = fresh(name); for (let w = 0; w < k - 1; w++) L.weekly(t, w);
  L.weekly(t, k - 1, () => true, s => s.role === 'LONG' ? {extra: {response: {...L.OK, recovery: 'ADVERSE'}}} : {});
  const label = `B/${name}/k${k}/${days}d`, startIso = `${t.p.weeks[k].startDate}T00:00:00Z`, ran = executedRuns(t, startIso), R = refs(ran);
  const P = pause(t, k, days); if (!P) continue;
  const v = check(label, P, R); totals.cells++; for (const x of v) flag(label, x);
  out.partB[label] = {cls: P.cls, status: P.status, refs: R, lastLongTolerated: ran.filter(x => x.role === 'LONG').at(-1)?.tolerated, historyAtPause: P.hist, entry: P.entry, reentry: P.rows.map(rowTxt), violations: v};
}
// ---------- Part C: repeated pauses ----------
const C = out.partC;
const firstWeekAfter = (t, P) => { const w = P.reentryWeek; L.weekly(t, w, s => sessAt(s) > P.report); return w; };
{ // C1: SHORT, re-entry week executed, SHORT again (PERF k=5 and k=9; HM k=7).
  for (const [name, k] of [['PERF', 5], ['PERF', 9], ['HM', 7]]) {
    const t = prefix(name, k, 0), P1 = pause(t, k, 6); if (!P1) continue;
    const w = firstWeekAfter(t, P1), startIso = `${t.p.weeks[w + 1].startDate}T00:00:00Z`;
    const R = refs(executedRuns(t, startIso)), P2 = pause(t, w + 1, 6); if (!P2) continue;
    const label = `C1/${name}/k${k}`, v = check(label, P2, R); totals.cells++; for (const x of v) flag(label, x);
    C[label] = {first: {cls: P1.cls, entry: P1.entry, reentry: P1.rows.map(rowTxt)}, second: {cls: P2.cls, refs: R, historyAtPause: P2.hist, entry: P2.entry, reentry: P2.rows.map(rowTxt)}, violations: v};
  }
}
{ // C2: PERF, long 70 executed in week 5 and 75 released; SHORT from Monday of week 6; the re-entry week executed; SHORT again; then MODERATE.
  for (const second of [6, 17]) {
    const t = prefix('PERF', 6, 0), R1 = refs(executedRuns(t, `${t.p.weeks[6].startDate}T00:00:00Z`)), P1 = pause(t, 6, 6);
    const w = firstWeekAfter(t, P1), startIso = `${t.p.weeks[w + 1].startDate}T00:00:00Z`, R2 = refs(executedRuns(t, startIso)), P2 = pause(t, w + 1, second);
    const label = `C2/PERF/${second}d`, v = [...check(label + '/first', P1, R1), ...check(label, P2, R2)]; totals.cells += 2; for (const x of v) flag(label, x);
    C[label] = {first: {cls: P1.cls, refs: R1, historyAtPause: P1.hist, entry: P1.entry, reentry: P1.rows.map(rowTxt)}, second: {cls: P2?.cls, refs: R2, historyAtPause: P2?.hist, entry: P2?.entry, reentry: P2?.rows.map(rowTxt)}, violations: v};
  }
}
/** A MODERATE break of 14 days (weeks 3-4) after three executed weeks, reported Monday 06:00 of week 5. */
const moderateFirst = name => { const t = fresh(name); for (let w = 0; w < 3; w++) L.weekly(t, w); const P = pause(t, 3, 14); return {t, P}; };
{ // C3 (E1-b): the re-entry week executed at return step 0, then a short trip (Monday-Thursday of week 6), and the P4 control.
  for (const name of ['PERF', 'HM']) {
    const {t, P} = moderateFirst(name); L.weekly(t, P.reentryWeek);
    const histW6 = H(t, `${t.p.weeks[6].startDate}T00:30:00Z`), ctl = L.copy(t);
    const R = refs(executedRuns(t, `${t.p.weeks[6].startDate}T00:00:00Z`)), P2 = pause(t, 6, 4);
    C[`C3/${name}`] = {first: {cls: P.cls, entry: P.entry, reentryWeek: P.reentryWeek, reentry: P.rows.map(rowTxt)}, historyWeek6: histW6, refs: R, second: {cls: P2.cls, entry: P2.entry, reentry: P2.rows.map(rowTxt), next: P2.next.map(rowTxt)}};
    // Control (P4): week 6's first run (return step 1) executed, the trip from the next day.
    const s1 = ctl.p.weeks[6].sessions.find(s => L.isRun(s)); L.step(ctl, L.at(ctl.p, 6, s1.day, '21:00:00', {observations: [L.obs(ctl.p, s1)]}));
    const P3 = pause(ctl, 6, 3, s1.day + 1);
    C[`C3/${name}`].controlStepOneRun = {ran: rowTxt(s1), cls: P3.cls, entry: P3.entry, reentry: P3.rows.map(rowTxt)};
  }
}
{ // C4 (E1-d, E1-f, R7ARA-SELF-01): return steps 0 and 1 executed (weeks 5 and 6), the completion released, then a pause before any run of it.
  for (const name of ['PERF', 'HM']) for (const [pName, days] of [['SHORT', 4], ['MODERATE', 14], ['MODERATE', 21], ['LONG', 33]]) {
    const {t, P} = moderateFirst(name); L.weekly(t, 5); L.weekly(t, 6);
    const hist7 = H(t, `${t.p.weeks[7].startDate}T00:30:00Z`), sinceEntry = executedRuns(t, `${t.p.weeks[7].startDate}T00:00:00Z`, P.report);
    const largest = {long: Math.max(0, ...sinceEntry.filter(x => x.role === 'LONG').map(x => x.minutes)), easy: Math.max(0, ...sinceEntry.filter(x => x.role === 'EASY' && !QUALITY_DIMS.includes(x.dim)).map(x => x.minutes))};
    const P2 = pause(t, 7, days); const label = `C4/${name}/${pName}${days}`;
    const v = [];
    if (P2?.cls === 'MODERATE') { if (P2.entry.mode !== 'RETURN' || P2.entry.returnStep !== 0) v.push(`moderate entry ${P2.entry.mode} step ${P2.entry.returnStep}`); if (P2.entry.returnFrom?.easy > ENTRY) v.push(`returnFrom ${P2.entry.returnFrom.easy}`);
      if (P2.entry.returnTo?.long > largest.long) v.push(`returnTo long ${P2.entry.returnTo.long} > ${largest.long}`); if (P2.entry.returnTo?.easy > largest.easy) v.push(`returnTo easy ${P2.entry.returnTo.easy} > ${largest.easy}`); }
    if (P2?.cls === 'SHORT' && !(P2.entry.mode === 'RETURN' && P2.entry.returnStep <= 1)) v.push(`short entry ${P2.entry.mode} step ${P2.entry.returnStep}`);
    if (P2?.cls === 'LONG' && P2.entry.mode !== 'RESTART') v.push(`long entry ${P2.entry.mode}`);
    totals.cells++; for (const x of v) flag(label, x);
    C[label] = {first: {entry: P.entry}, historyWeek7: hist7, executedSinceFirstEntry: sinceEntry.map(x => `${x.role}:${x.minutes} ${x.dim}=${x.value}`), largestSinceEntry: largest, second: P2 && {cls: P2.cls, status: P2.status, entry: P2.entry, reentry: P2.rows.map(rowTxt), next: P2.next.map(rowTxt)}, violations: v};
  }
}
{ // C5 (E1-d): the completion released, the first easy-mode run of week 7 executed, then a SHORT pause from the next day.
  for (const name of ['PERF', 'HM']) {
    const {t} = moderateFirst(name); L.weekly(t, 5); L.weekly(t, 6);
    const s = t.p.weeks[7].sessions.find(x => L.isRun(x)); L.step(t, L.at(t.p, 7, s.day, '21:00:00', {observations: [L.obs(t.p, s)]}));
    const ran = executedRuns(t, `${L.addDays(t.p.weeks[7].startDate, s.day + 1)}T00:00:00Z`), lastLong = ran.filter(x => x.role === 'LONG').at(-1)?.minutes ?? null;
    const P2 = pause(t, 7, 4, s.day + 1), v = [];
    if (P2.entry.mode === 'EASY' && lastLong !== null && P2.entry.long > lastLong) v.push(`entry long ${P2.entry.long} > last long ${lastLong}`);
    totals.cells++; for (const x of v) flag(`C5/${name}`, x);
    C[`C5/${name}`] = {ranFirstEasyModeRun: rowTxt(s), lastLong, cls: P2.cls, entry: P2.entry, reentry: P2.rows.map(rowTxt), violations: v};
  }
}
{ // C6 (E1-e, E1-f): a LONG break, restart weeks executed until history switches to easy, then SHORT / MODERATE before any easy-mode run.
  for (const [pName, days] of [['SHORT', 4], ['MODERATE', 14]]) {
    const t = fresh('PERF'); for (let w = 0; w < 2; w++) L.weekly(t, w); const P = pause(t, 2, 33);
    L.weekly(t, P.reentryWeek, s => sessAt(s) > P.report); let w = P.reentryWeek + 1;
    for (; w < t.p.weeks.length - 4 && H(t, `${t.p.weeks[w].startDate}T00:30:00Z`)?.mode === 'RESTART'; w++) L.weekly(t, w);
    const hist = H(t, `${t.p.weeks[w].startDate}T00:30:00Z`), ran = executedRuns(t, `${t.p.weeks[w].startDate}T00:00:00Z`, P.report);
    const P2 = pause(t, w, days), lastRestart = ran.filter(x => x.dim === 'RESTART_MINUTES').at(-1)?.value ?? null, v = [];
    if (P2.cls === 'SHORT' && !(P2.entry.mode === 'RESTART' && P2.entry.restart <= lastRestart)) v.push(`short entry ${P2.entry.mode} restart ${P2.entry.restart} (last run ${lastRestart})`);
    if (P2.cls === 'MODERATE' && !(P2.entry.mode === 'RETURN' && P2.entry.returnFrom?.easy <= ENTRY && P2.entry.returnTo?.easy <= Math.max(...ran.map(x => x.minutes)))) v.push(`moderate entry ${JSON.stringify(P2.entry)}`);
    totals.cells++; for (const x of v) flag(`C6/${pName}`, x);
    C[`C6/${pName}${days}`] = {first: {cls: P.cls, entry: P.entry}, switchWeek: w, historyAtSwitch: hist, ranSinceRestart: ran.map(x => `${x.role}:${x.minutes} ${x.dim}=${x.value}`), second: {cls: P2.cls, entry: P2.entry, reentry: P2.rows.map(rowTxt), next: P2.next.map(rowTxt)}, violations: v};
  }
}
{ // C7: SHORT return (PERF k=7), its first week executed with the long run ADVERSE, then a SHORT pause again.
  const t = prefix('PERF', 7, 0), P1 = pause(t, 7, 6), w = P1.reentryWeek;
  L.weekly(t, w, s => sessAt(s) > P1.report, s => s.role === 'LONG' ? {extra: {response: {...L.OK, recovery: 'ADVERSE'}}} : {});
  const R = refs(executedRuns(t, `${t.p.weeks[w + 1].startDate}T00:00:00Z`)), P2 = pause(t, w + 1, 6), v = check('C7', P2, R);
  totals.cells++; for (const x of v) flag('C7', x);
  C['C7/PERF'] = {first: {cls: P1.cls, entry: P1.entry, reentry: P1.rows.map(rowTxt)}, second: {cls: P2.cls, refs: R, historyAtPause: P2.hist, entry: P2.entry, reentry: P2.rows.map(rowTxt)}, violations: v};
}
out.totals = totals;
console.log(JSON.stringify(out, null, 1));
