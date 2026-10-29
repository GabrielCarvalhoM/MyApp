<!-- R2_CURRENT: BSR-R2-0.2.0 -->
# Current reference runtime — R2

[Current final report](r2/FINAL_REPORT.md) · [verification](r2/VERIFICATION.json) · [full R2 index](r2/README.md) · [contract overlay](BOUNDED_SHADOW_RUNTIME_CONTRACT.md#current-r2-extension--bsr-r2-020).

Run on Node24: npm ci; npm test; npm run simulate; npm run verify. The same evaluateShadow API dispatches BSR-INPUT-1 and BSR-INPUT-R2. Twelve new finite conditional programs are executable; normal V1coverage remains NOT_READY. Node is the scientific reference/oracle for later production conformance, probably KMP in a separate mission. No application or real-athlete effect exists.

The original BSR-0.1.0 README below and artifacts/ reports are preserved historical baseline. Their former current-result links refer to that revision; r2/ contains the integrated current evidence.

---

# Vilumo bounded shadow coaching core

Offline synthetic domain module. Read [the contract](BOUNDED_SHADOW_RUNTIME_CONTRACT.md) for exact supported scope and limits; [final report](artifacts/FINAL_REPORT.md) and [verification](artifacts/VERIFICATION.json) carry the current result.

Run on Node24:

```sh
npm ci
npm test
npm run simulate
npm run verify
```

```js
import { evaluateShadow, ShadowJournal } from './src/index.mjs';
import { scenarioInput } from './src/fixtures.mjs';
const result = evaluateShadow(scenarioInput('E2E-05'));
// MODIFY / SUGGEST_AND_CONFIRM: exact easy35 next-horizon proposal.
// result.appliedState equals the unchanged official plan.
```

`src/runtime.mjs` owns guards, decisions and the in-memory trace journal. `src/semantics.mjs` owns source/exposure/comparison and nonclinical/clinical boundaries. `src/fixtures.mjs` is the synthetic adapter. `scripts/` owns filesystem IO, authority compilation, simulations and verification. Expected test oracles are isolated from the evaluator. No UI, network or plan application is present.
