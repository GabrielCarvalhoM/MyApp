// E03 (QE reviewer-owned, R7ARA engineering recheck): the boundary of "executed completely" that E1 reads (bindObservations: completed, and at
// least 90% of the row's minutes). EASY runner, weeks 0..k-1 executed; week k-1's long run reported at M minutes of its row (100%, 95%, 89%), then a
// SHORT pause (6 days) from week k. E1 credits a run complete by that rule with its row's minutes; a run below it is partial and not credited.
import * as L from './qe-r7ada-lib.mjs';
const out = {probe: 'qe-r7ara-E03-completion-boundary', tree: L.TREE, cells: []};
for (const k of [5, 6]) for (const share of [1, 0.95, 0.89]) {
  L.resetIds(); const t = L.gen({id: 'qe-e03'});
  for (let w = 0; w < k - 1; w++) L.weekly(t, w);
  const long = t.p.weeks[k - 1].sessions.find(s => L.live(s) && s.role === 'LONG'), reported = Math.floor(long.prescription.durationMinutes * share);
  L.weekly(t, k - 1, () => true, s => s === long ? {minutes: reported} : {});
  const earlierLongs = t.p.weeks.slice(0, k - 1).flatMap(w => w.sessions.filter(s => L.live(s) && s.role === 'LONG').map(s => s.prescription.durationMinutes));
  const start = t.p.weeks[k].startDate, end = L.addDays(start, 5), rep = L.addDays(end, 1), W = t.p.weeks.findIndex(x => rep >= x.startDate && rep <= L.addDays(x.startDate, 6));
  L.step(t, L.at(t.p, W, Math.round((Date.parse(rep) - Date.parse(t.p.weeks[W].startDate)) / 864e5), '06:00:00', L.brk(start, end)), {allow: true});
  const d = t.p.decisions.at(-1), first = t.p.weeks[d.fromWeek].sessions.find(s => L.live(s) && s.role === 'LONG' && s.date >= rep);
  out.cells.push({k, share, lastLongRow: long.prescription.durationMinutes, lastLongReported: reported, largestEarlierLongRow: Math.max(...earlierLongs), cls: d.interruption?.class, entryLong: d.interruption?.entry?.run?.long ?? null, firstLongAfterReturn: first?.prescription?.durationMinutes ?? null,
    entryAboveActuallyRun: (d.interruption?.entry?.run?.long ?? 0) > Math.max(reported, ...earlierLongs)});
}
console.log(JSON.stringify(out, null, 1));
