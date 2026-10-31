// Re-derive, from s01's per-decision lines, which decision points lack the NO_NEW_EXERCISE_IN_EVENT_WEEKS disclosure (helper for the review, read-only).
import fs from 'node:fs';
const txt = fs.readFileSync(process.argv[2], 'utf8'), byPoint = {};
for (const m of txt.matchAll(/^(\S+) (\S+) (\S+) (SKILL_MISMATCH|NONCLINICAL_DISCOMFORT_OR_PREFERENCE): MODIFY -> (\S+) \((new|performed)\) \| standIns (\[[^\]]*\]) omitted (\d+)/gm)) {
  const [, athlete, point, , , , isNew, standIns, omitted] = m, k = point;
  byPoint[k] ??= {modify: 0, newSubstitute: 0, withEventHandling: 0};
  byPoint[k].modify++; if (isNew === 'new') byPoint[k].newSubstitute++; if (standIns !== '[]' || Number(omitted) > 0) byPoint[k].withEventHandling++;
}
console.log(JSON.stringify(byPoint, null, 1));
