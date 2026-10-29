// Read-only probe for the R5-H24 root-cause claim ("duplicates merge, conflicts quarantine").
// In the frozen replay the 2025 source is excluded as STALE before duplicate/conflict logic runs, so the claim is
// untested there. This probe moves ONLY the historical date to a recent day (an in-memory counterfactual, not a
// corpus edit) to see whether duplicate replay and contradictory identity are detected. Writes nothing.
import {readFileSync} from 'node:fs';
import {evaluateHoldoutCase} from '../../../../CoachingCore/scripts/evaluate-holdout-r6.mjs';
const corpus = JSON.parse(readFileSync('C:/Users/carva/Desktop/myApp/MyApp/CoachingCore/r5/holdout/R5_INDEPENDENT_HOLDOUT.json', 'utf8'));
const item = structuredClone(corpus.cases.find(c => c.caseId === 'R5-H24'));
for (const s of item.steps) for (const f of s.historicalFacts ?? []) f.date = '2026-10-26';
const out = evaluateHoldoutCase(item);
console.log(JSON.stringify(out.steps.map((s, i) => ({
  step: i, status: s.result.status, action: s.result.action, reason: s.result.reason,
  provenance: s.result.provenance, excluded: s.result.excludedObservations,
  modelObs: s.result.updatedModel?.observations?.map(o => o.eventId), modelExcluded: s.result.updatedModel?.excluded?.map(o => [o.eventId, o.reason]),
  ledger: s.result.actualLedger?.map(o => [o.eventId, o.actual?.minutes, o.actual?.sets, o.response?.recovery])
})), null, 1));
