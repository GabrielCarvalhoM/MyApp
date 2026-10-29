import fs from 'node:fs';
const a=JSON.parse(fs.readFileSync(new URL('./quality-assessment.json',import.meta.url)));
const q=['COACHING_BEST_SUPPORTED','COACHING_ACCEPTABLE_ALTERNATIVE','COACHING_SUBOPTIMAL','INSUFFICIENT_INFORMATION','UNSUPPORTED'];
const rows=q.map(k=>`| ${k} | ${a.counts.frozen40[k]??0} | ${a.counts.holdout[k]??0} |`).join('\n');
const text=`# Independent coaching quality review R4

**${a.verdict}**, limited to ${a.scope} Broad readiness: **${a.broadReadiness}**.

Reviewer: /root/holdout_quality, Quality & Reliability Engineer1.3.0, independent of engine/envelope implementation. The holdout was independently authored and sealed before R4 source inspection. This judge did not edit runtime code, scientific approvals or corpus facts/expectations. Current exact reviewed hashes are in quality-assessment.json.

The reviewer independently executed all64 normal cases, ${a.invariants.adverseProbesTotal} adverse probes and the full${a.invariants.testsTotal}-test suite under ${a.node}. All current adverse assertions and deterministic/source/completed/shadow invariants passed. Initial failed evidence remains in quality-initial-*; correction history is explicit in the final findings.

| Independent decision quality | Frozen40 | Holdout24 |
| --- | ---: | ---: |
${rows}

Twenty-six actual positive outputs remain separate from quality: seven are BEST_SUPPORTED and nineteen ACCEPTABLE_ALTERNATIVE. Correct ASK, KEEP and HOLD can be best-supported for their narrow decision while contributing zero positive prescription coverage. Runtime self labels were ignored.

Many frozen positive cases omit a meaningful goal, phase or future horizon. They establish defensible narrow interventions, not best-supported whole-program coaching. The holdout exposes retained input-shape, request-alias, complete-week, missed-essential, threshold-progression, double-ordering and race-week gaps. In particular, return aliases labelled HOLD by the runtime are independently marked unsupported where known current capacity is unused; the missing-capacity return remains insufficient information. The repaired generic intermediate week now fails closed rather than inflating running and dropping strength, but it is still not a completed competent balanced week.

The final corrected holdout is **challenge-set reuse**, not an unseen generalization result: the first outputs informed subsequent fixes. No case facts or semantic expectations were changed after the sealed1.0.1 corpus. New out-of-sample claims require a new independently sealed challenge.

Conditions and owners are in quality-assessment.json. Before broader V1/autonomous/production claims, the domain owner must resolve the retained capabilities and prove their current scientific/runtime/quality bindings. Material changes invalidate the affected hash-bound evidence. Current independent scientific binding is a separate required gate; this review does not grant human sports credentials, clinical clearance, empirical efficacy, Product Truth promotion, KMP activation or real-user effects.

Evidence: quality-runtime-snapshot.json; quality-probes.raw.json; quality-final-tests.tap; quality-assessment.json; quality-criteria.md. Next domain step: DOMAIN_COACHING_R5.
`;
fs.writeFileSync(new URL('./quality-review.md',import.meta.url),text);
