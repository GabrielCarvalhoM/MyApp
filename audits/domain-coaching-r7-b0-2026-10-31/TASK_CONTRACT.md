# DOMAIN_COACHING_R7-B0 — task contract

Contract **R7B0-CONTRACT-r1** · 2026-10-31 America/Sao_Paulo · branch `claude/domain-coaching-r7-b0`, created from `baseline/r7-b0` at `373a2d682a18d4f02be57299d6ab4c1493aee36f` (HEAD = baseline at start). Founder authority: the direct [request](FOUNDER_REQUEST.md).

## 1. Objective and boundary

Close the **V1 Coaching Repertoire Foundation** for RUNNING, STRENGTH and HYBRID: turn the approved sports authorities into an explicit, versioned, machine-readable repertoire (families → configurations → dose → progression state), with eligibility, composition relations, trajectories, safety boundaries, evidence status and validation, so that a later Coaching Core selects and parameterizes inside reviewed envelopes instead of inventing plans.

B0 produces a **specification/catalog candidate**. Target state `SPECIFICATION_READY`; `RUNTIME_IMPLEMENTATION_READY = NO` and `V1_COACHING_AUTHORITY_READY = NO` by construction.

**Prohibited:** any byte change to the R7-A freeze (86 bound files, source/manifest digests), to `CoachingCore/r6/PROGRAM_POLICY_R6.json` (R6-POLICY-5, `18ec48f3…`), to any file under `CoachingCore/` that existed at the formal closure, to closure/baseline/readiness evidence or review branches; runtime code, tests, KMP, UI/Figma, HealthKit/WorkoutKit, backend, Growth behaviour, TestFlight work; reopening the closed items listed in the request §5; merging into `main` or any other branch; new clinical rules.

**Allowed:** new files under `CoachingCore/r7/b0/` and `audits/domain-coaching-r7-b0-2026-10-31/`; insert-only blocks in `CURRENT_MISSION.md` and `MISSION_LEDGER.md`; one navigation entry in `canon/CANONICAL_INDEX.md`; append-only additions to the human revalidation queue for SSCTR-approved prescriptive items, with a supersession record.

## 2. Routing and proportionality

Classification: impact **high** (it defines what the future Core may prescribe), irreversibility **low** (documentary, own branch, no runtime), uncertainty **medium–high** (new sports metadata and relations), dependencies **medium** (R7-B and later gates consume it). → **T3 / R1 / L3**: the current instance coordinates and authors; one mandatory independent scientific gate.

| Role | Owner | Basis |
|---|---|---|
| Author / coordinator | current instance (Chief role) | request; global agent system |
| Scientific judge of every prescriptive-impact item | project SSCTR (`sports-science-concurrent-training-reviewer`), independent of the author | CLAUDE.md mandatory routing; DR-98–102 |
| Structural validation | deterministic script, read-only | request §19 |
| Founder | only for genuinely strategic choices without existing authority | request §20 |

No engineering, security, UI or data judge is triggered: no runtime, contract boundary, trust boundary, interface or data store changes. R7-B implementation will need its own engineering and quality gates; B0 does not substitute for them. Research is the SSCTR's, only where project evidence is insufficient (request §18).

**Bounded review:** one SSCTR review of the frozen candidate; at most one narrow recheck, only for items returned REVISE that are new, narrow and fixable inside B0. Anything else closes as an explicit LATER_GATE or blocker (the Founder's loop bound, `audits/domain-coaching-r6-2026-10-26/FOUNDER_LOOP_BOUND.md`).

## 3. Authority rules for the content

1. Every family, configuration, relation and rule carries an authority status: materialization of an **approved envelope** (R6-POLICY-5 boundaries approved in `ssctr-policy-review.r12.json`), an **approved familiar path** (R2-P07/P08/P14), an **approved product decision** (DR-112–115, DR-134, DR-120–123), a **B0 candidate** requiring the SSCTR, or **LATER_GATE / UNSUPPORTED_V1** with a fallback.
2. Numbers are referenced from the policy by path, never copied silently; a validator proves the references resolve. B0 introduces no new dose number unless the SSCTR approves it.
3. Each rule is labelled EVIDENCE, PRODUCT_POLICY or IMPLEMENTATION_CHOICE (request §18).
4. No family is added without a consumer; anything uncovered is marked unsupported with its fallback, never filled by intuition.

## 4. Deliverables

`CoachingCore/r7/b0/`: README, repertoire specification, machine-readable catalog + JSON Schema, gap closure matrix, handoff. `audits/domain-coaching-r7-b0-2026-10-31/`: this contract, checkpoint, validator + validation report, integrity verification, SSCTR review records, queue integration (if any), final disposition.

## 5. Stop condition

The request §24, evaluated in the final disposition. Stop after the clean commit and push of this branch.
