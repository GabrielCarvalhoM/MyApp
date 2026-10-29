// Extract the deciding flags of each target probe from the reviewer's own re-runs.
import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2];
const J = n => JSON.parse(fs.readFileSync(path.join(dir, n + '.out.json'), 'utf8'));
const out = {};
{ const q = J('qe-r7asm-Q2-correction'); out.Q2 = q.cases.map(c => ({form: c.form, status: c.decisionStatus, publicApiIgnoresCorrection: c.publicApiIgnoresCorrection, raw: c.historicalStateOf_onRecordAsReturned, live: c.historicalStateOf_onRecordWithoutSupersededRows, entry: c.internalReducer_viaWhatIfReturnEntry, conflicts: c.provenance?.conflicts})); }
{ const q = J('qe-r7asm-Q2b-correction-load'); out.Q2b = {raw: q.historicalStateOf_recordAsReturned, live: q.historicalStateOf_withoutSupersededRows, entry: q.internalReducer_returnEntry, publicApiReadsRetractedLoad: q.publicApiReadsRetractedLoad}; }
{ const q = J('qe-r7asm-Q3-known-row-setup'); out.Q3 = q.variants.map(v => ({variant: v.variant, sameRecordEarlyLate: v.sameRecordEarlyLate, prescribedKnownLoadBecameHistory: v.prescribedKnownLoadBecameHistory, sameRecordDifferentHistory: v.sameRecordDifferentHistory, LATE: {rows2: v.cells.LATE.week2SaturdayRows, hist: v.cells.LATE.historical, entry: v.cells.LATE.returnEntry, rows3: v.cells.LATE.week3SaturdayRows}, EARLY: {hist: v.cells.EARLY.historical, entry: v.cells.EARLY.returnEntry, rows3: v.cells.EARLY.week3SaturdayRows}, NOCORR: {hist: v.cells.NOCORR.historical}})); }
{ const q = J('qe-r7asm-Q3b-known-row-conflict'); out.Q3b = {sameRecord: q.sameRecord, prescribedKnownLoadBecameHistory: q.prescribedKnownLoadBecameHistory, historiesDiffer: q.historiesDiffer, LATE: q.cells.LATE.historical, LATEentry: q.cells.LATE.returnEntry, ORDERED: q.cells.ORDERED.historical, LATErows2: q.cells.LATE.week2SaturdayRows, ORDEREDrows2: q.cells.ORDERED.week2SaturdayRows}; }
{ const q = J('qe-r7asm-Q12-robustness'); out.Q12 = q; }
{ const q = J('qe-r7asm-Q4-restart-view'); out.Q4 = Object.fromEntries(Object.entries(q.variants).map(([k, v]) => [k, {identicalLedgers: v.identicalLedgers, planDiffersWithIdenticalLedgers: v.planDiffersWithIdenticalLedgers, historyEqual: v.historyEqual, U: {plan: v.U.planRunAtR2, hist: v.U.historyRunAtR2, rows: v.U.week_R2_runRows}, C: {plan: v.C.planRunAtR2, hist: v.C.historyRunAtR2, rows: v.C.week_R2_runRows}}])); }
{ const q = J('qe-r7asm-Q4b-restart-rows'); out.Q4b = {firstWeekRowsDiffer: q.firstWeekRowsDiffer, firstWeekPlanStateDiffers: q.firstWeekPlanStateDiffers, historyAlwaysEqual: q.historyAlwaysEqual, U: q.cells.U.weeks.map(w => `${w.week} ${w.phase} plan=${JSON.stringify(w.planRun)} hist=${JSON.stringify(w.historyRun)} rows=${w.rows}`), C: q.cells.C.weeks.map(w => `${w.week} ${w.phase} rows=${w.rows}`)}; }
{ const q = J('qe-r7asm-Q11c-reps-identical'); out.Q11c = {identicalLedgers: q.identicalLedgers, historyEqual: q.historyEqual, rowDiff: q.rowDiff}; }
{ const q = J('qe-r7asm-Q6-perturb-projection'); out.Q6 = {allInvariant: q.allInvariant, states: q.states.map(s => ({state: s.state, cuts: s.cutsChecked, diffs: s.historicalStateOfDiffs.length, ret: s.whatIfReturn.stateAtEqual && s.whatIfReturn.entryEqual}))}; }
console.log(JSON.stringify(out, null, 1));
