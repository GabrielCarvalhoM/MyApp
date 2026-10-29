// SSCTR R7ASC-SSCTR-r1 walk/jog trace (own; prints only): one cell of my walk/jog probe in full, CONS/NONE/SHORT (WALK_JOG_FIVE_DAYS; a SHORT
// break from Tuesday of week 2 reported Thursday of week 3; week 3 executed from the report on and reviewed; week 4, CONSOLIDATION, no walk/jog
// session done and reviewed; week 5 Monday executed; a SHORT break Tuesday-Saturday of week 5 reported Sunday 07:00). Per week: phase, each
// walk/jog session (date, ladder step) and whether a report of it is on the record; HistoricalState's walk/jog step at the week start; and the
// entry run state each return decision recorded, with the first walk/jog step prescribed after it. Read-only; synthetic; DEV_TEST_ONLY.
import * as L from './ssctr-r7asc-lib.mjs';

const {PROFILES, EDGE_PROFILES} = await L.loadProfiles();
const g = L.generateProgram(structuredClone({...PROFILES, ...EDGE_PROFILES}.WALK_JOG_FIVE_DAYS), L.opts), t = {p: g.program, ledger: []};
const WJ = s => s.sport === 'RUN' && s.role === 'WALK_JOG';
for (let w = 0; w < 2; w++) L.weekly(t, w);
const b1 = L.addDays(t.p.weeks[2].startDate, 1); L.weekly(t, 2, s => s.date < b1, {}, '06:30:00');
const rd = L.addDays(t.p.weeks[3].startDate, 3); const r1 = L.step(t, L.at(t.p, 3, 3, '07:00:00', L.brk(b1, L.addDays(rd, -1))));
const entry1 = r1.proposal?.decisions?.at(-1)?.interruption?.entry?.run ?? null;
L.weekly(t, 3, s => s.date >= rd);
L.weekly(t, 4, s => !WJ(s));
const b2 = L.addDays(t.p.weeks[5].startDate, 1); L.weekly(t, 5, s => s.date < b2, {}, '06:30:00');
const r2 = L.step(t, L.at(t.p, 5, 6, '07:00:00', L.brk(b2, L.addDays(t.p.weeks[5].startDate, 5))));
const entry2 = r2.proposal?.decisions?.at(-1)?.interruption?.entry?.run ?? null;
const reported = id => t.ledger.some(o => (o.sessionId ?? o.context?.sessionId) === id && !o.superseded);
const out = {trace: 'R7ASC-SSCTR-r1-WALKJOG-TRACE', runtime: L.TREE, firstReturn: `${r1.status}/${r1.action}`, firstEntryRun: entry1 && {mode: entry1.mode, walkStep: entry1.walkStep},
  secondReturn: `${r2.status}/${r2.action}`, secondEntryRun: entry2 && {mode: entry2.mode, walkStep: entry2.walkStep}, weeks: []};
for (let w = 0; w < t.p.weeks.length; w++) {
  let hs; try { const H = L.history(t, w, 0, '00:30:00'); hs = H ? H.state.run.walkStep : 'not exported'; } catch (e) { hs = 'reader error'; }
  out.weeks.push({week: w, phase: t.p.weeks[w].phase, historyWalkStepAtStart: hs, walkJog: t.p.weeks[w].sessions.filter(s => L.live(s) && WJ(s)).map(s => `${s.date} step ${s.progression?.value}${reported(s.id) ? ' RUN' : ''}`)});
}
console.log(JSON.stringify(out, null, 1));
