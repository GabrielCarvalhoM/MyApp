// Q06d (QE reviewer-owned; class E). R6-NONCLINICAL-RETURN condition 8: "MODERATE: run entry from a current demonstration or the reviewed
// 15-minute entry; at most moderateStepsToPrior conditional steps to the prior executed dose". The return's target (returnTo) against the prior
// executed dose: an EASY runner (17-day pause from the Monday of week k) and the walk/jog graduate (step 8 executed, exit released, 17-day pause).
// After the report every return week is executed as prescribed and closed, until the run leaves RETURN mode; the first week after the return
// is compared with the largest long/easy run executed before the pause.
import * as L from './qe-r7ada-lib.mjs';
const out = {probe: 'qe-r7ada-Q06d-moderate-return-target', tree: L.TREE, cases: []};
const live = (t, pred) => t.p.weeks.flatMap(w => w.sessions.filter(s => L.live(s) && s.sport === 'RUN' && pred(s)));
function run(t, k, label, prior) {
  const start = t.p.weeks[k].startDate, end = L.addDays(start, 16), report = L.addDays(end, 1), W = t.p.weeks.findIndex(x => report >= x.startDate && report <= L.addDays(x.startDate, 6));
  L.step(t, L.at(t.p, W, Math.round((Date.parse(report) - Date.parse(t.p.weeks[W].startDate)) / 864e5), '06:00:00', L.brk(start, end)), {allow: true});
  const d = t.p.decisions.at(-1), trace = [];
  for (let w = d.fromWeek; w < Math.min(t.p.weeks.length - 1, d.fromWeek + 5); w++) {
    const st = t.p.stateTrace[w].run; trace.push({w, mode: st.mode, returnStep: st.returnStep ?? null, rows: L.runRows(t, w).map(r => r.split(' ')[1])});
    if (w > d.fromWeek && st.mode !== 'RETURN') break;
    L.step(t, L.at(t.p, w, 6, '21:00:00', {observations: t.p.weeks[w].sessions.filter(s => L.live(s) && s.date >= report).map(s => L.obs(t.p, s))}));
  }
  const firstAfter = trace.find(x => x.w > d.fromWeek && x.mode !== 'RETURN');
  const mins = role => (firstAfter?.rows ?? []).filter(r => r.startsWith(role + ':')).map(r => +r.split(':')[1]);
  out.cases.push({label, k, entry: L.runOf(d.interruption.entry.run), returnTo: d.interruption.entry.run.returnTo ?? null, priorExecuted: prior, trace, firstAfterReturn: firstAfter ?? null,
    violation: !!firstAfter && (mins('LONG').some(m => m > prior.long) || mins('EASY').some(m => m > prior.easy))});
}
for (const k of [3, 5, 8]) {
  L.resetIds(); const t = L.gen({id: 'qe-q06d-easy'}); for (let w = 0; w < k; w++) L.weekly(t, w);
  const ex = live(t, s => s.weekIndex < k); run(t, k, 'EASY_MODERATE', {long: Math.max(...ex.filter(s => s.role === 'LONG').map(s => s.prescription.durationMinutes)), easy: Math.max(...ex.filter(s => s.role === 'EASY').map(s => s.prescription.durationMinutes))});
}
{ L.resetIds(); const t = L.gen({id: 'qe-q06d-exit', ...L.WJ}); let w8 = -1;
  for (let w = 0; w < t.p.weeks.length - 3; w++) { if (t.p.weeks[w].sessions.some(s => L.live(s) && s.role === 'WALK_JOG' && s.progression?.value === 8)) { w8 = w; break; } L.weekly(t, w); }
  L.weekly(t, w8); run(t, w8 + 1, 'WALKJOG_EXIT_MODERATE', {long: 0, easy: 20}); }
out.summary = out.cases.map(c => `${c.label} k=${c.k}: prior executed ${JSON.stringify(c.priorExecuted)} returnTo ${JSON.stringify(c.returnTo && {easy: c.returnTo.easy, long: c.returnTo.long, mode: c.returnTo.mode})} first after return ${JSON.stringify(c.firstAfterReturn?.rows)} violation ${c.violation}`);
console.log(JSON.stringify(out, null, 1));
