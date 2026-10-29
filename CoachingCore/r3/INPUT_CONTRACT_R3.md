# Canonical coaching input R3

Version **3.0.0**. Status: synthetic Node reference transport and representation contract; not Product Truth, production authority, a sporting approval, or an efficacy claim. Owner: DOMAIN CLOSURE R3 engineering. The R2 independent corpus remains immutable.

## Boundary

`normalizeRepresentative(record)` maps only `record.scenarioFacts` into canonical facts and typed contexts. It does not import `independentExpectation`, targets, titles, gaps, dose oracles, prior runtime outputs, SSCTR approvals, or development witnesses. `caseId` is provenance metadata and must never select behavior. The source hash is SHA-256 of recursively sorted-key JSON; array order is preserved. The declared frozen hash is retained separately and a mismatch blocks the adapter.

The adapter cannot decide eligibility, current capacity, comparability, necessity, tolerance, sufficiency, population applicability, scientific approval, a recipe, dose, or whether an unknown requires a useful question. These belong to the domain/runtime with applicable review. Canonical-valid means representable and structurally coherent; it does not mean prescribable. A normal case with substantive missing facts can be consumed and receive ASK. Clinical cases can be consumed and receive a clinical boundary decision. Neither is a software failure.

## Executable interface

```js
import {
  normalizeRepresentative, validateCanonical, fact, factCell
} from '../src/r3-input.mjs';

const input = normalizeRepresentative(frozenCase);
const {valid, errors} = validateCanonical(input);
const kind = fact(input, '/currentDemand/kind');
const capacity = factCell(input, '/observations/currentCapacity');
```

`normalizeRepresentative` returns the canonical object directly. It accepts only JSON object facts; non-JSON values are rejected rather than coerced. `fact(input, pointer)` returns the exact supplied value, or `undefined` for absence. It reconstructs object and array parents, including `fact(input, '')` for the complete source object. `factCell` exposes status/provenance; an absent path returns a cell without a `value` property. Returned values are detached, preventing mutation of the frozen fixture or another normalized input.

Top-level fields are `schemaVersion`, `synthetic`, `purpose`, `source`, `facts`, `structure`, `structuredContexts`, and `adapter`. `purpose` is `SHADOW_REFERENCE`; `synthetic` must be true. The adapter additionally blocks explicit real-person facts. No applied effect or official plan mutation API exists here.

`source` contains `corpusId`, `version`, `caseId`, `factsHash`, and optional `declaredFactsHash`. The adapter's default source metadata is the explicitly targeted `REPRESENTATIVE-CORPUS-R2` / `R2-EVAL-1.0.0`; callers of other versioned corpora supply `corpusId` and `corpusVersion`. That metadata is not a domain input.

## Lossless facts and semantic states

`facts` maps JSON pointers to terminal cells. Empty arrays/objects remain terminal facts. `structure` records `OBJECT` versus `ARRAY` for containers, preserving the distinction between a numeric object key and an array index. JSON pointer escaping follows `~0` for `~` and `~1` for `/`. Every source leaf is retained; unrecognized source fields are not dropped or implicitly promoted to prescriptive inputs.

Each cell has `status`, `origin`, `sourcePath`, and—except for absence—`value`. Representational inference also includes a named `derivation`.

| State or origin | Meaning |
| --- | --- |
| `ABSENT` | Source property was not supplied; no `value`, origin `UNSPECIFIED`. |
| `UNKNOWN` | Explicit null or an explicitly unknown/not-supplied/not-established/not-tested/uncertain answer. Original null or prose remains recoverable. |
| `NOT_APPLICABLE` | Explicit `not applicable` / `n/a`; never inferred from missing data. |
| `KNOWN` | Source value is present. This states representational knowledge, not scientific truth or validated capacity. False and zero are known. |
| `EXPLICIT_SYNTHETIC` | The fixture explicitly supplies this synthetic premise. All frozen R2 leaves use this origin. It does not become an athlete measurement. |
| `MEASURED` | Contract supports an explicitly established measurement origin; the representative adapter does not invent it. |
| `SELF_REPORTED` | Contract supports explicitly established self-report origin; synthetic scenario statements remain synthetic premises. |
| `INFERRED` | A permitted, named representation transform, currently HH:mm → local minute. No sporting inference is authorized. |
| `HISTORICAL_LEARNED_PATTERN` | Contract can name an explicitly established learned pattern; repeated fixture observations alone are not promoted to this origin. |
| `UNSPECIFIED` | No origin was supplied or the field is absent/unrepresentable. |

These origin names describe the schema vocabulary, not six implemented ingestion paths. The only R3 producer and integrity validator in this mission are the synthetic representative adapter: source facts must keep `EXPLICIT_SYNTHETIC`; permitted time arithmetic uses `INFERRED` with its named derivation. `validateCanonical` rejects relabeling fixture premises as `MEASURED`, `SELF_REPORTED`, or `HISTORICAL_LEARNED_PATTERN`, even though those enum values are schema-representable. Generic measurement/self-report/learned-pattern ingestion needs a separate explicit producer, provenance contract, version and conformance tests; it is not implemented or made ready by this mission.

Text such as `none` is a known stated absence of exposure, not not-applicable. A narrative containing both known and unknown details is preserved whole; the adapter does not adjudicate its components. A null official plan remains explicitly unknown/null rather than being silently replaced with a synthetic empty plan.

## Typed contexts

The JSON Schema types normal V1 contexts through source-bound cells. Required context sections always exist; individual substantive fields may be absent or unknown. Numeric and boolean known values are typed; completed repetitions can be a set-wise numeric vector. No readiness, fatigue, interference, capacity or necessity score is introduced.

| Context | Explicit representation |
| --- | --- |
| `request` | Source demand kind and family. First week, establishment, review, adaptation, return, event and calibration kinds are retained. |
| `athlete` | Age band and independently supplied age years; priority, participation, data tier, history origin; separate Run and Strength experience and competence. Age band ADULT does not fabricate years or a bounded age eligibility check. |
| `eligibility` | Assessment status/source, clinical concern, pain, persistent pain, injury, illness, functional limitation, clearance claim. Missing restrictions never becomes normal or clinical by default. |
| `plan` | Explicit official plan / official run week source references. No plan or session ID is fabricated. |
| `goals` | Onboarding goals and explicitly supplied goal/phase. Event priority remains scoped to the event, without rewriting enduring priority. |
| `equipment` | Available equipment and stated movement knowledge/configuration, including unknown competence. Narrative remains narrative. |
| `schedule` | Local day, explicit minute capacity, or local HH:mm start/end; evaluation time, local date and timezone separately absent when unsupplied. |
| `sessions` | Source-bound Run, Walk, Strength or unspecified dose records; historical, planned, candidate and completed roles; family/exercise/recipe reference where supplied; explicit dose dimensions and units. These views are inventories of source records, not selected actions. |
| `recovery` | Explicit local/systemic observations, function, capacity, warm-up, clinical concern/pain, and all observation/check source references. No physiological diagnosis is inferred. |
| `event` | Distance, day, completion timestamp, priority/window, athlete confirmation, first-at-distance, goal and effort where supplied. No proximity is computed without an evaluation anchor. |
| `interruption` | Reason, duration days, explicit nonclinical premise, known exposure flag and actual exposure narrative. Duration does not establish capacity loss or a return dose. |
| `calibration` | Method, provenance source, construct, available/unavailable data and all calibration leaf references. Pace, race, LT2, critical speed and wearable estimates are never converted into each other. |
| `history` | All history/exposure/completed-prefix references; consent, explicitly stated observational status and causality status. Repeated IDs or observations are not converted into independent evidence or a learned prescription. |

Dose fields retain original named units: `minutes`, `durationMinutes`, warm-up/work/cooldown/recovery minutes, work minutes each, repetitions, seconds each, pace seconds/km, sets/sets each, reps (number or per-set vector), kg, kg per hand, target RIR, rest seconds, actual work minutes, planned/actual minutes, distance km, and time minutes. Missing values remain absent. There is no conversion from prose or kilograms between equipment configurations. Both conflicting numeric duration fields remain available and a conflict is emitted.

An availability capacity is not a training session. A race event is not silently inserted into planned training. A completed prefix of two repetitions with actual minutes `[5, 3]` stays `[5, 3]`, separately from a planned four-by-five-minute session. Candidate records describe supplied alternatives; their presence does not establish review or eligibility.

## Allowed normalization and trace

Every fact import and context binding has an `adapter.trace` entry with operation, source pointer(s), target pointer, and explanation. Current operations are `COPY`, `NULL_AS_UNKNOWN`, `UNKNOWN_TOKEN_PRESERVED`, `MARK_ABSENT`, `BIND_SOURCE`, `HHMM_TO_LOCAL_MINUTE`, and `OBJECT_KEY_TO_LOCAL_DAY`.

HH:mm accepts exactly 00:00–23:59 and becomes `hour * 60 + minute`. A literal availability object key such as THU becomes that local day. No date, offset, timezone, evaluation time, overnight rollover, duration tolerance or sporting spacing threshold is invented. A reversed same-day window raises `UNANCHORED_WINDOW_ORDER` for either object-day windows or array entries with explicit start/end fields. An array entry declaring more available minutes than fit between its same-day start/end raises `CAPACITY_EXCEEDS_LOCAL_WINDOW`; the supplied capacity and times are retained. A smaller declared capacity can fit within a larger window. Malformed times/windows block representation. Arrays retain their order and contents.

Numeric prose such as `3 x 5 min familiar` is retained and marked `NARRATIVE_NUMERIC_CONTENT_RETAINED`. It is not automatically parsed into a complete dose, comparable exposure or sufficient capacity. A future legitimate parser would need a versioned grammar and its own tests; it still could not adjudicate necessity or scientific applicability.

## Adapter diagnostics versus domain gaps

`adapter.blocked` is reserved for representation/integrity problems: source hash mismatch, non-synthetic source, malformed local times/windows. Schema-invalid typed data separately fails `validateCanonical`. Substantive unknowns are not adapter blockers and must be handled by the domain. `warnings` and `conflicts` are explicit arrays; conflicts include `requiresResolution: true` and neither conflicting source is discarded.

Important corpus diagnostics:

- Case 17 retains `NO_WEARABLE` and the explicit HRV/sleep device as `DATA_TIER_DEVICE_CONFLICT`. The adapter does not resolve it or manufacture device reliability. Runtime disposition must account for the conflict in context.
- Case 29 retains the absolute event completion timestamp and relative DAY_AFTER_EVENT demand while evaluation time remains absent. `EVENT_TIME_WITHOUT_EVALUATION_ANCHOR` prevents an inferred chronology from being hidden in normalization.
- Duplicate event/fact/observation IDs are retained with `DUPLICATED_EVENT_ID_PRESERVED`; no deduplication or independent observation count is performed.
- Explicit stale flags are retained and warned. An old date/age alone does not trigger an invented scientific recency threshold.

These diagnostics do not count as raw transport ASK or useful ASK by themselves. The runtime evaluation supplies semantic dispositions and separates software, domain, science, substantive missing facts and clinical boundaries.

## Validation, versioning and future equivalence

`validateCanonical(input)` returns `{valid, errors}`. It applies the delivered Draft 2020-12 schema, reconstructs and checks the source hash, checks fact pointer/status/synthetic-provenance consistency and container shape, and checks the complete deterministic structured projection and adapter diagnostics. Blocking, conflicts, warnings, and every transformation trace entry must match a fresh projection of the source. Removing a duplicate/stale/hash warning, altering a trace explanation or changing a typed view while retaining source facts invalidates the input. Extra canonical root fields and unsupported schema versions are rejected. Unknown fixture leaves are preserved under `facts`, not silently assigned new typed semantics. This integrity validator is scoped to synthetic representative ingestion; schema expressibility alone does not establish generic ingestion readiness.

R2 → R3 is an explicit pure source-to-canonical migration. There is no coercive migration of an arbitrary R2 runtime input or automatic acceptance of future 3.1.0/4.0.0 inputs. Future contract changes need an explicit version, migration and conformance tests. The source frozen facts/expectations and their hashes remain separate from normalized output and runtime results.

Node 24 remains the executable oracle. A future KMP implementation can replay the same JSON Schema, terminal cells, container map, context bindings, trace operations, frozen source hashes and conformance witnesses. Equivalence must include absent/null distinctions, units, array order, numeric precision, conflict diagnostics, local-time arithmetic and semantic outcomes—not only superficially similar JSON. No Swift/Kotlin production business logic is introduced here.

## Current objective evidence

`node --test test/r3-input.test.mjs` exercises all 42 frozen cases with source-hash equality and exact reconstruction, plus missing/unknown/N/A, escaped pointers, numeric object keys, no fabricated age/date/timezone, local schedules and malformed times, partial completed work, strength per-hand units, unparsed narrative, no/rich wearable data, explicit conflicts, duplicate/stale events, event chronology, interruption capacity, clinical boundary preservation, observation/causality separation, unknown source fields, schema version rejection, and tamper resistance. Full regression, true coverage, policy approval and runtime readiness are reported by the parent R3 mission artifacts.
