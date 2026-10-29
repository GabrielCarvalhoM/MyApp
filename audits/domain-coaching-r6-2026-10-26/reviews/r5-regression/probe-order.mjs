// Read-only probe: is the R6 Balanced selection invariant to schedule-option input order? (QH-BALANCED-ORDER)
// Runs the frozen R6 runtime on in-memory copies of frozen R5 holdout inputs; writes nothing.
import {readFileSync} from 'node:fs';
import {generateProgram} from '../../../../CoachingCore/src/r6-index.mjs';
const root = 'C:/Users/carva/Desktop/myApp/MyApp/';
const corpus = JSON.parse(readFileSync(root + 'CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json', 'utf8'));
const out = [];
for (const id of ['R5-H03', 'R5-H11', 'R5-H20', 'R5-H21', 'R5-H18', 'R5-H19']) {
  const c = corpus.cases.find(x => x.caseId === id);
  const input = structuredClone(c.programInput);
  const ids = (input.scheduleOptions || []).map(o => o.id);
  const a = generateProgram(structuredClone(input));
  const rev = structuredClone(input); rev.scheduleOptions = [...rev.scheduleOptions].reverse();
  const b = generateProgram(rev);
  // Also: swap goal priority to STRENGTH_FIRST / RUN_FIRST to see that priority changes the choice where it should.
  const pri = {};
  for (const p of ['RUN_FIRST', 'STRENGTH_FIRST']) {
    const x = structuredClone(input); x.athlete.goal.priority = p;
    const r = generateProgram(x); pri[p] = r.status + ':' + (r.program?.selectedScheduleId ?? null);
  }
  out.push({caseId: id, optionOrder: ids, original: a.status + ':' + (a.program?.selectedScheduleId ?? null), reversed: b.status + ':' + (b.program?.selectedScheduleId ?? null), invariant: a.program?.selectedScheduleId === b.program?.selectedScheduleId, basis: a.ranking?.basis, priorityProbe: pri});
}
console.log(JSON.stringify(out, null, 1));
