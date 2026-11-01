// R7-C Phase 1 read-only probe. Engineering instrument with the development authority of the R7-B test helpers;
// never gate, quality or generalization evidence. Question: on a given CoachingCore (here R7B2-FREEZE-1), does a week
// with no gating review count toward strength or running progression (SSCTR R18 / probe AF shape)?
// Three timelines from one program: weeks 0-1 reviewed and executed; weeks 2-6 either reviewed and executed (EXEC),
// reviewed with nothing reported (EMPTY) or never reviewed (NONE); then a week-7 weekly review with nothing reported.
// Prints JSON to stdout only; writes nothing.
// Usage: node r18-running-strength-probe.mjs <absolute path to CoachingCore>
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const core = process.argv[2];
if (!core) throw Error('CoachingCore path missing');
const H = await import(pathToFileURL(path.join(core, 'r7/b/fixtures/helpers.mjs')).href);
const { opts, K, FULL, program, weekly, review, evaluateProgram, live } = H;

const base = { id: 'r7c-r18', weeks: 12, goals: { run: 'PERFORMANCE', strength: 'GENERAL' }, equipment: FULL,
  knownExercises: [K('back-squat', 3, 5, 82.5)] };
const squatRows = (p, w) => p.weeks[w].sessions.filter(live).flatMap(s => (s.prescription.exercises ?? [])
  .filter(e => e.id === 'back-squat').map(e => `${s.date} ${e.sets}x${e.reps} ${e.load.mode}:${e.load.value ?? '-'}`));
const runRows = (p, w) => p.weeks[w].sessions.filter(s => live(s) && s.sport === 'RUN').map(s => `${s.role}:${s.prescription.durationMinutes}`);
const lastExecuted = ledger => ledger.flatMap(o => (o.actual?.exercises ?? []).filter(e => e.id === 'back-squat')
  .map(e => ({ date: o.observedAt.slice(0, 10), kg: Math.max(...e.sets.map(x => x.load?.value ?? 0)) }))).sort((a, b) => a.date < b.date ? -1 : 1).at(-1) ?? null;

function timeline(mode) {
  const t = { p: program(base), ledger: [] };
  for (let w = 0; w < 2; w++) weekly(t, w);
  for (let w = 2; w < 7; w++) {
    if (mode === 'EXEC') weekly(t, w);
    else if (mode === 'EMPTY') { const r = evaluateProgram(t.p, { ...review(t.p, w), actualLedger: t.ledger }, opts); t.ledger = r.actualLedger ?? t.ledger; if (r.proposal) t.p = r.proposal; }
  }
  const r7 = evaluateProgram(t.p, { ...review(t.p, 7), actualLedger: t.ledger }, opts);
  const P = r7.proposal ?? t.p;
  return { mode, week7Review: `${r7.status}/${r7.action ?? '-'}`, lastExecutedSquat: lastExecuted(r7.actualLedger ?? t.ledger),
    squatWeek1: squatRows(t.p, 1), squatWeek8: squatRows(P, 8), squatWeek9: squatRows(P, 9),
    runsWeek1: runRows(t.p, 1), runsWeek8: runRows(P, 8), runsWeek9: runRows(P, 9),
    runState8: P.stateTrace?.[8]?.run ? { long: P.stateTrace[8].run.long, easy: P.stateTrace[8].run.easy } : null };
}
const out = {};
for (const m of ['EXEC', 'EMPTY', 'NONE']) { try { out[m] = timeline(m); } catch (e) { out[m] = { error: String(e?.message ?? e).slice(0, 600) }; } }
console.log(JSON.stringify(out, null, 1));
