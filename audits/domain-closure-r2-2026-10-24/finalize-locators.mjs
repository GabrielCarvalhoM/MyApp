import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
function append(file,marker,body){const p=path.join(root,file),raw=fs.readFileSync(p,'utf8');if(!raw.includes(marker))fs.appendFileSync(p,'\n\n'+marker+'\n'+body+'\n');}
append('CURRENT_MISSION.md','<!-- DOMAIN_CLOSURE_R2: DCR2-20261024-r1 -->',`## Current authorized follow-up — DOMAIN CLOSURE R2 / 2026-10-24

The current direct Founder request authorizes positive prescription/domain expansion only inside the offline synthetic Node24 Bounded Shadow Runtime. IMPLEMENTATION_AUTHORIZED=SHADOW_REFERENCE_ONLY; UI/FIGMA/KMP/PRODUCTION/REAL_ATHLETE_EFFECTS=NO. Historical implementation prohibitions are superseded only within this scope. No Product Truth, clinical scope or autonomous operational authority is promoted.

Current deliverable: [R2 final report](CoachingCore/r2/FINAL_REPORT.md), [current verification](CoachingCore/r2/VERIFICATION.json), [coverage](CoachingCore/r2/COVERAGE_BASELINE_R2.json), [owned gaps](CoachingCore/r2/OPEN_GAPS_R2.md); [contract, preserved baseline and independent reviews](audits/domain-closure-r2-2026-10-24/TASK_CONTRACT.md). Twelve conditional internal scientific approvals enable finite selectors; three joint hybrid-taper policies remain ABSTAIN/HOLD. The single future funded-human queue preserves88 entries and adds12 actual approvals (100 total, funding NOT_DECLARED). Gaps and all requested full-V1 readiness verdicts remain NOT_READY; next step DOMAIN_CLOSURE_R3. Node remains the executable oracle for a later shared production core, probably KMP, under a separate mission.`);
append('MISSION_LEDGER.md','<!-- DOMAIN_CLOSURE_R2_LEDGER: DCR2-20261024-r1 -->',`## 2026-10-24 — DOMAIN CLOSURE R2 positive prescription expansion

Direct Founder request authorizes bounded offline Node reference expansion of ACF-G01–G05, without UI/Figma/KMP/production/real-athlete effects or Truth promotion. Root authors/integrates; separate scientific synthesis, representative corpus, adversarial SSCTR, runtime Quality and governance instances provide independent evidence. Fifteen policy requests yield12 exact conditional approvals and3 taper abstentions; all approved prescriptions have runtime bindings, development fixtures/tests/traces and new entries in the single future-human queue (88preserved+12=100). Independent corpus42 remains separate from development:1 positive,6 substantiveASK,33 unsupported,2 clinical; transport failures do not become usefulASK. Full V1readiness remains NOT_READY; next engineering step DOMAIN_CLOSURE_R3. See [current report](CoachingCore/r2/FINAL_REPORT.md) and [verification](CoachingCore/r2/VERIFICATION.json). This locator records the bounded mission, not real-person efficacy or runtime activation.`);
append('CoachingCore/BOUNDED_SHADOW_RUNTIME_CONTRACT.md','<!-- R2_CONTRACT_OVERLAY: BSR-R2-0.2.0 -->',`## Current R2 extension — BSR-R2-0.2.0

The BSR-0.1.0 text above is preserved baseline scope. The current Founder mission adds the strict BSR-INPUT-R2 envelope and finite reviewed selectors through the same evaluateShadow/ShadowJournal API. BSR-INPUT-1 retains its exact behavior and authority bundle. [R2 input contract](r2/INPUT_CONTRACT.md), [registry](r2/POSITIVE_PRESCRIPTION_REGISTRY.json), [independent authority projection](r2/SSCTR_RUNTIME_AUTHORITY.json) and [current verification](r2/VERIFICATION.json) govern this extension. The historical98-test/88-queue/unsupported-return and calibration statements above are baseline claims, not restrictions negating this specifically reviewed R2 subset.

R2 enables twelve conditional finite policy programs under exact current synthetic premises; P11–P13 joint hybrid taper stays HOLD. No general planner, automatic raw-data necessity/sufficiency inference, novel dose formula or clinical service is added. Concrete parameters must match each recipe; current adequacy precedes theoretical progression; calibration binds matching intent-only labels without replacing concrete adequate work. Completed work and unrelated sessions remain preserved in candidates. Return scope is explicitly partial and never restores prior fitness by elapsed days. Scripted compatible establishment actuals can support week2 retention only after exact identity/revision/parameter/coverage checks; absent completion stays ASK. Every appliedState equals its supplied officialPlanState.

Scientific approvals add12 actual items to the single funded-human queue, preserving all88 prior entries. The independent42-case corpus is not a runtime oracle; transport/contract failures are separate from substantive missing-input ASK. Current results do not establish representative V1coverage, human efficacy/safety or production reliability. Full autonomous runtime remains NO_GO. Run npm test, npm run simulate and npm run verify for the integrated current reference. Historical BSR reports remain in artifacts/; current R2reports are in r2/. Node is an oracle/conformance reference for a later shared production implementation, probably KMP; this mission does not choose Node as the mobile core.`);
const readme=path.join(root,'CoachingCore/README.md'),raw=fs.readFileSync(readme,'utf8');if(!raw.includes('<!-- R2_CURRENT: BSR-R2-0.2.0 -->'))fs.writeFileSync(readme,`<!-- R2_CURRENT: BSR-R2-0.2.0 -->
# Current reference runtime — R2

[Current final report](r2/FINAL_REPORT.md) · [verification](r2/VERIFICATION.json) · [full R2 index](r2/README.md) · [contract overlay](BOUNDED_SHADOW_RUNTIME_CONTRACT.md#current-r2-extension--bsr-r2-020).

Run on Node24: npm ci; npm test; npm run simulate; npm run verify. The same evaluateShadow API dispatches BSR-INPUT-1 and BSR-INPUT-R2. Twelve new finite conditional programs are executable; normal V1coverage remains NOT_READY. Node is the scientific reference/oracle for later production conformance, probably KMP in a separate mission. No application or real-athlete effect exists.

The original BSR-0.1.0 README below and artifacts/ reports are preserved historical baseline. Their former current-result links refer to that revision; r2/ contains the integrated current evidence.

---

`+raw);
const pkgPath=path.join(root,'CoachingCore/package.json'),pkg=JSON.parse(fs.readFileSync(pkgPath));pkg.scripts.simulate='node scripts/simulate-r2.mjs';pkg.scripts.verify='node scripts/verify-r2.mjs';pkg.scripts['compile:r2-authority']='node scripts/compile-r2-authority.mjs';fs.writeFileSync(pkgPath,JSON.stringify(pkg,null,2)+'\n');
console.log('Added bounded R2 locators and current reproduce commands; prior content retained');
