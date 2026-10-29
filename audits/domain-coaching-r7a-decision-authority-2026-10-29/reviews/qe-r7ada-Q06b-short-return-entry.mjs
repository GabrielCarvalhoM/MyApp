// Q06b (QE reviewer-owned; class E): the first prescriptions after a SHORT nonclinical return (6 days, reported the day after it ends), against
// (a) the last completed dose before the pause (the rows executed completely, no adverse response) and (b) the release-only control: what the
// evidence released but the athlete never executed. The approved rule recorded in the R6 decisions: "short nonclinical interruption: resume the
// last completed doses; no step until execution is observed". Walk/jog steps are capped by historicalRun (W2); this probe reads the EASY run and
// the walk/jog exit to continuous running, which W2 does not cover.
import * as L from './qe-r7ada-lib.mjs';
const out = {probe: 'qe-r7ada-Q06b-short-return-entry', tree: L.TREE, cases: []};
const runs = (t, w) => t.p.weeks[w].sessions.filter(s => L.live(s) && s.sport === 'RUN').map(s => ({date: s.date, role: s.role, minutes: s.prescription.durationMinutes, dim: s.progression?.dimension ?? null, value: s.progression?.value ?? null, jogSeconds: s.prescription.intervals ? null : null}));
const after = (t, day, n = 4) => t.p.weeks.flatMap(w => w.sessions.filter(s => L.live(s) && s.sport === 'RUN' && s.date >= day)).sort((a, b) => a.date < b.date ? -1 : 1).slice(0, n).map(s => ({date: s.date, role: s.role, minutes: s.prescription.durationMinutes, dim: s.progression?.dimension ?? null, value: s.progression?.value ?? null}));
function shortReturn(t, k, days = 6) {
  const start = t.p.weeks[k].startDate, end = L.addDays(start, days - 1), report = L.addDays(end, 1), W = t.p.weeks.findIndex(x => report >= x.startDate && report <= L.addDays(x.startDate, 6));
  const r = L.step(t, L.at(t.p, W, Math.round((Date.parse(report) - Date.parse(t.p.weeks[W].startDate)) / 864e5), '06:00:00', L.brk(start, end)), {allow: true});
  return {report, action: r.action, reason: (t.p.decisions.at(-1)?.reason ?? r.reason ?? '').slice(0, 200), cls: t.p.decisions.at(-1)?.interruption?.class, first: after(t, report)};
}
// EASY runner, pause from Monday of week k.
for (const k of [2, 3, 4, 5, 6, 8]) {
  L.resetIds(); const t = L.gen({id: 'qe-q06b-easy'}); for (let w = 0; w < k; w++) L.weekly(t, w);
  const lastExecuted = runs(t, k - 1), H = L.runOf(L.history(t, k, 0).state.run), plannedNoPause = runs(t, k);
  const r = shortReturn(t, k);
  const lastLong = lastExecuted.find(x => x.role === 'LONG')?.minutes ?? null, lastEasy = Math.max(...lastExecuted.filter(x => x.role === 'EASY').map(x => x.minutes)), lastQ = lastExecuted.find(x => x.role === 'QUALITY')?.value ?? null;
  const firstLong = r.first.find(x => x.role === 'LONG')?.minutes ?? null, firstEasy = Math.max(...r.first.filter(x => x.role === 'EASY').map(x => x.minutes)), firstQ = r.first.find(x => x.role === 'QUALITY')?.value ?? null;
  out.cases.push({shape: 'EASY_SHORT', k, phases: [t.p.phases.phases[k - 1], t.p.phases.phases[k]], lastExecuted, historyAtPause: {long: H.long, easy: H.easy, qualityStep: H.qualityStep}, plannedNoPause, return: r,
    aboveLastCompleted: {long: firstLong !== null && lastLong !== null && firstLong > lastLong, easy: Number.isFinite(firstEasy) && Number.isFinite(lastEasy) && firstEasy > lastEasy, quality: Number.isInteger(firstQ) && Number.isInteger(lastQ) && firstQ > lastQ}});
}
// Walk/jog: the week at step 8 (the ladder's last, a 20-minute continuous jog) executed completely and closed: the state graduates to EASY 25.
{
  L.resetIds(); const t = L.gen({id: 'qe-q06b-exit', ...L.WJ}); let w8 = -1;
  for (let w = 0; w < t.p.weeks.length - 3; w++) { if (t.p.weeks[w].sessions.some(s => L.live(s) && s.role === 'WALK_JOG' && s.progression?.value === 8)) { w8 = w; break; } L.weekly(t, w); }
  L.weekly(t, w8); const H = L.runOf(L.history(t, w8 + 1, 0).state.run), nextNoPause = runs(t, w8 + 1);
  for (const days of [3, 6, 10]) { const c = L.copy(t); const r = shortReturn(c, w8 + 1, days); out.cases.push({shape: 'WALKJOG_EXIT_SHORT', days, lastExecuted: runs(t, w8), historyAtPause: {mode: H.mode, easy: H.easy, walkStep: H.walkStep, longestContinuous: H.longestContinuous}, plannedNoPause: nextNoPause, return: r, aboveLastCompleted: {continuousMinutes: r.first[0]?.role === 'EASY' && r.first[0].minutes > 20}}); }
}
out.summary = out.cases.map(c => `${c.shape} k=${c.k ?? ''} days=${c.days ?? 6}: last ${JSON.stringify((c.lastExecuted ?? []).map(x => x.role + ':' + x.minutes + (x.value !== null ? '=' + x.value : '')))} first ${JSON.stringify(c.return.first.map(x => x.role + ':' + x.minutes + (x.value !== null ? '=' + x.value : '')))} above ${JSON.stringify(c.aboveLastCompleted)}`);
console.log(JSON.stringify(out, null, 1));
