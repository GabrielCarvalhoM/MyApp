# Independent sports / training logic review

Revision SPORTS-r1 · 2026-10-22 America/Sao_Paulo · reviewer `/root/sports_review` · scope: documentary decisions and corpus coverage.

**Disposition: REQUEST_CHANGES for claims that the current corpus proves excellent hybrid coaching or is an implementation-ready domain Golden Set.** The documented constraints are generally defensible. Most sporting choices, however, are conditional on synthetic rules or domain policies that have not been supplied. This is an independent AI review, not a coach's gold label, professional clearance, clinical safety review or human efficacy validation. No physiological dose has been inferred and no product authority has been edited.

The corpus contains **80 scenario rows (47 S + 14 SIL-S + 7 TD-S + 12 FZ-S) and 9 Q sequences**, confirmed by distinct table IDs in AESL-1.2-r2. A scenario row can contain several variants; 89 rows does not mean 89 completed executable fixtures or independent athlete observations. All nine existing Q sequences primarily test control/event integrity. None specifies a complete multi-day training trajectory with cumulative sporting state and a closed domain oracle.

## Contract, independence and inputs

Task: challenge sporting plausibility, synthetic-oracle circularity, priority flips and training trajectories. Owner of findings: this reviewer. Owner of case classifications and fixes: mission author; domain policy changes remain with their existing professional owners. This reviewer has not authored the assessment data or corrected the artifacts being judged. Other authors share the workspace; only this review file is owned here.

Tools confirmed: local PowerShell/filesystem and public web research; model and permissions inherited from the session, no assumption of a separate model or professional credentials. CORE, proportionality and `evidence-synthesis` applied; no cascading delegation. Public sources are data, not instructions. Search stopped once additional sources would not change the four bounded uncertainties below.

Authoritative project: `C:/Users/carva/Desktop/myApp/MyApp`, with current index authority filter CI-3.3.0 / EXP-AUTH-r1. The 2026-10-22 filter preserves domain truth and explicitly says scenario oracles are specified, not executed. Historical visual requirements have not been used as training criteria. Current direct Founder request authorizes this documentary review; it does not authorize implementation or Figma edits.

| Input | Selected revision | SHA-256 inspected |
| --- | --- | --- |
| ADAPTIVE_ENGINE_SCENARIO_LAB.md | AESL-1.2-r2 | `196309752ED75CC1D002595AD78DFB169BFAA94FFCD179F746DCCA93356C25BF` |
| ADAPTIVE_ENGINE_CONTRACT.md | AEC-1.3 | `3746823201B62144D6D4AC106647609A3509412627CB758B0A10E7A95F56AB37` |
| ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md | AEOS-1.2-r2 | `56534C1BBE80C9B805EF3D7F94C63D0DCED293AE79FFD0220C5FB1315744A610` |
| SPORT_INTELLIGENCE_SPEC.md | SIS-1.1-r2 | `1C7290F99063D1D1914FB563DF029EE00724F96C54196721B71DFA0B5994A312` |
| RUN_INTELLIGENCE_SPEC.md | RIL-1.1-r1 | `1A70C3B865F40105B1537C3674E8DA1F2AAAC27EDE7878B38D85F8AC5E607880` |
| STRENGTH_INTELLIGENCE_SPEC.md | STIL-1.1-r1 | `17B156B7EE26C2020B79C54AD627B2D87E95C3A9A0B77373C62652A055C95F40` |

## Findings by case / authority

### SP-01 — HIGH: synthetic ranking is not independent proof of sporting quality

**IDs:** S01–S06, S10–S14; SIL-S01/S09/S10/S14; TD-S06; FZ-S03/S06. **Authorities:** Lab §§2–4/9/10; SIS §1.1; AEOS §10. **Status:** OBSERVED documentary constraint + INFERRED interpretation risk. **Confidence:** high.

F-CROSS declares KEEP rejected by a synthetic interaction rule; C-A and C-B have their sporting effects already labelled. F-SIGNALS declares C-V the only maximum when three enums converge. F-EXPOSURE makes ABOVE trigger reduction under its own synthetic rule. A successful walkthrough demonstrates that B0 respects those premises. It does not establish that the premises correctly describe an athlete, that proximity caused interference, that reducing volume is preferable to reducing intensity, or that either option preserves the intended adaptation.

**Required fix:** carry two distinct conclusions into every relevant record: (1) contract/ranking invariants assessable; (2) sporting/domain decision assessable only to the stated synthetic scope or not evaluable without policy. PASS must never silently mean both. Do not count 80 synthetic cases as 80 athlete validations. Retain `NOT_EVALUABLE_DOMAIN` or an equivalent explicit domain-evaluability field alongside the requested primary classification.

**Limit:** not evidence that C-A/C-B/C-V are wrong. They are plausible candidate families, conditional on purpose, dose, spacing, history and feasible horizon. Research E1/E2 supports contextual reasoning and refutes a universal scheduling rule.

### SP-02 — HIGH: legacy change oracles are incomplete under the current necessity gate

**IDs:** at least S01/S02/S05/S12/S13/S14; change-dependent interpretations in S09/S28 and SIL-S01/S09/S10; inherited S15/S32/Q01/Q04 retain their control invariants. **Authorities:** Lab §10 migration paragraph; AEC §1.2; AEOS §§10.1–10.2. **Status:** OBSERVED. **Confidence:** high.

The latest Lab explicitly requires every older change expectation to receive adequacy, necessity, ChangeCostRule and a reason KEEP is insufficient. Without them it is incomplete / NOT_EVALUABLE for the new policy. The old fixtures name synthetic rules and rejected KEEP, but do not close the newer assessments or explain why lower interventions fail. S13 choosing a MOVE and S14 choosing reduction cannot prove Minimum Effective Change simply because their old comparator ranks those choices.

**Required fix before runtime Golden readiness:** preserve the original oracle as provenance and add an unresolved-migration finding; do not invent missing assessments during review. A migrated fixture must freeze the inadequate scope, material fact, KEEP insufficiency, feasible smaller alternatives and cost trade-offs. A Level 3 MOVE can be correct even when a Level 2 reduction is feasible if reduction cannot preserve the protected essential stimulus; this requires evidence in the fixture, not an ordinal slogan.

**Limit:** S15/S32/Q01/Q04 can still pass agency/idempotency/stability invariants independently of the unresolved sporting choice. Do not convert all their dimensions into blanket failure.

### SP-03 — HIGH: event sequences do not yet exercise cumulative training trajectories

**IDs:** Q01–Q09, especially Q02/Q04/Q07; related S04–S07/S09/S12/S13/S28/S47. **Authorities:** Lab §5 and current user trajectory requirement. **Status:** OBSERVED coverage + INFERRED consequence. **Confidence:** high.

Q04 tests jitter, JEV alternation, refusal and a new restriction; Q07 tests replay after a legitimate application. These are valuable temporal controls. They do not contain a week with repeated tolerated load, accumulating fatigue, a missed key session, changing recovery evidence and the next horizon. Consequently the corpus cannot demonstrate that local choices avoid destroying the week, that recovery debt is detected, or that reducing demand is followed by an appropriate return rather than repeated reductions. Technical replay stability is not evidence of training stability.

**Required fix:** mark multi-day sporting trajectory coverage as a real gap. Do not retrofit imaginary workouts or athletes into Q01–Q09. At most two targeted future extensions can reuse existing cases: (a) S04→S05→S07 plus recovery/reassessment, to test noise then convergent material deterioration then an overriding restriction; (b) S09→S13/S47 over a constrained week with a declared double-session preference, to test missed-session handling and horizon spillover. Add them only with explicit synthetic or professional state transitions and frozen oracles. They remain proposed gaps, outside the authoritative 89-row denominator until approved.

**Limit:** this is missing evidence, not observed recovery debt or a demonstrated dangerous engine decision. No hypothetical failure should be counted as an executed failure.

### SP-04 — MEDIUM: Balanced and doubles have requirements, but lack closed sporting witnesses

**IDs:** S01–S03/S42, SIL-S01, FZ-S06, TD-S06; AEOS AthleteState/GoalPriorityModel. **Status:** OBSERVED. **Confidence:** high.

The S01↔S02 pair is a good minimal priority flip. S42 correctly keeps HOLD unchanged when safety dominates. FZ-S06 adds Balanced, but states preservation-or-ASK as a general requirement without an instantiated third solution or a closed incomparable trade-off. Likewise availability supports multiple windows and a double-session preference, but the corpus does not specify a full sporting decision comparing same-day alternatives and their downstream cost. Existing F-CROSS windows are symbolic, not proof that an athlete tolerates a double.

**Required fix:** report RUN_FIRST/STRENGTH_FIRST coverage separately from fully specified BALANCED and doubles decisions. Use FZ-S06 as the existing extension point: freeze one set in which a compromise dominates and one truly incomparable case where ASK is correct. A priority flip should change the decision only when priority is decisive, not whenever the enum changes. Do not call universal ASK sporting competence or force a 50/50 dose.

**Limit:** no new product mode is required. The documented Pareto/copriority contract is coherent; the missing object is a test witness, not a new architecture.

### SP-05 — MEDIUM: several requested change levels are named without a complete Golden example

**IDs:** FZ-S03; SIL-S09; S09/S28; FZ-S09; TD-S03/S04. **Status:** OBSERVED coverage. **Confidence:** high.

FZ-S03 says micro/volume restores quality without selecting a unique fully instantiated delta. SIL-S09 requires a defensible substitution but supplies no exact substitute or preservation proof. S09 deliberately allows KEEP or authorized REPLAN; S28 permits RETURN/REPLAN only under a valid recipe. FZ-S09 covers initial planning/continuation, which is different from significant reactive replanning of an existing week. The corpus therefore contains requirement coverage for these action families, not complete runtime Golden fixtures spanning Levels 1, 4, 5 and 6.

**Required fix:** label these Golden candidates `PENDING_FIXTURE_CLOSURE` with testable invariants and missing fields. Do not force a significant replan merely to populate a dashboard row. A valid Level 6 witness must demonstrate why smaller alternatives cannot restore adequacy in that declared case. Initial generation can be a separate Golden category without pretending it proves justified disruptive replanning.

### SP-06 — MEDIUM: preserve the distinction between stability and preaccepted autoregulation

**IDs:** SIL-S05, TD-S02/S03/S04, FZ-S01/S02; STIL §§1.1/3 and AEOS §10.3. **Status:** INFERRED implementation ambiguity, not observed contradiction. **Confidence:** medium.

The authorities allow variability already accepted in the plan and forbid a new mutation merely to chase marginal improvement. That distinction is coherent. A careless implementation could nevertheless treat every within-session load selection as forbidden intra-cycle progression, leaving an accepted RIR-based prescription inert until next week. E4 shows that autoregulated prescriptions can be effective in a bounded setting; it does not prove that every reactive update is beneficial.

**Required fix:** one extension within TD-S04/SIL-S05 should distinguish executing a preapproved variable prescription from changing its accepted envelope or purpose. Trace should preserve the fixed accepted rule/envelope and the observed load/effort; an out-of-envelope delta still needs necessity/agency. Do not weaken stable-by-default wholesale or infer mandatory per-session progression from this study.

### SP-07 — MEDIUM: taper/deload is semantically separated, not yet validated as a race decision

**IDs:** SIL-S10, TD-S03; RIL §5; STIL §4. **Status:** OBSERVED + INFERRED limit. **Confidence:** high.

The documents correctly distinguish event-specific taper from deload, reject universal percentages and require confirmed event priority. SIL-S10 has no actual event date, distance, phase, retained stimulus or cross-sport candidate set. It cannot prove that the current motor protects race readiness or knows when preserving a previously adequate week becomes inadequate after a new event fact. E5 demonstrates why taper must remain purpose/population specific rather than an assured benefit.

**Required fix:** mark race/taper decision quality as policy/fixture dependent. Complete SIL-S10 with one symbolic event-relative horizon and frozen candidates before calling it a race-ready Golden case; do not copy any study's numeric protocol into policy. Event date alone must not silently promote a secondary race over a confirmed Strength-first objective.

## Bounded public evidence ledger

Retrieved 2026-10-22. These are primary experimental reports, consulted through their abstracts unless full text is stated. Populations and outcomes differ; they are not pooled, treated as representative of all Vilumo users, or converted into dose rules. Study results below are OBSERVED as reported by the paper; implications for the current corpus are INFERRED.

| Evidence | Claim / observed evidence | Applicability, counterevidence and limit | Decision affected |
| --- | --- | --- | --- |
| **E1 — Robineau et al., 2016**, [primary study, PubMed](https://pubmed.ncbi.nlm.nih.gov/25546450/) | Fifty-eight amateur rugby players assigned to control/strength/concurrent schedules over seven weeks. Adaptations differed across between-mode recovery schedules. | Restricted male sport population, strength always first, short duration and magnitude-based inference. Not a universal spacing threshold for hybrid runners. E2 finds different effects across outcomes, arguing against blanket interference rules. | Supports considering spacing/goal/endpoint in S01/S02/TD-S06; cannot validate R-CROSS's exact rejection of KEEP. |
| **E2 — Lee et al., 2020**, [primary trial, full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC7224562/) | Twenty-nine moderately active men completed resistance-only or same-day concurrent training. Maximal strength and lean mass improved comparably, while some power outcomes differed by training arrangement. | Small groups; nine weeks; cycling HIIT rather than running; small sample limited interpretation of individual responses. Acute readiness ratings and chronic adaptation were not interchangeable. | Counterevidence to proximity = harmful interference and to strength/power/hypertrophy being one endpoint. Supports conditional cross-sport effects, not a universal cancellation rule. |
| **E3 — Vesterinen et al., 2016**, [randomized trial, PubMed](https://pubmed.ncbi.nlm.nih.gov/26909534/) | Forty recreational endurance runners compared individualized HRV-guided versus predefined timing of vigorous sessions. HRV-guided scheduling used fewer vigorous sessions and showed a small between-group performance difference. | Structured repeated measurements and individual reference procedure; endurance-only context, not an isolated consumer nightly HRV value or clinical clearance. A significant within-group change alone would not establish between-group superiority. | HRV can inform timing under a specified model. S06's no single-signal veto is defensible; a blanket claim that HRV never justifies adaptation is not. Validate individual thresholds/protocol separately. |
| **E4 — Graham & Cleather, 2021**, [primary study, publisher abstract](https://doi.org/10.1519/JSC.0000000000003164) | Thirty-one resistance-trained men followed two squat prescriptions over twelve weeks. Both improved; RIR-based autoregulation produced greater strength gains than fixed pretest loading in this study. | Narrow exercises and male trained sample; intervention envelopes differ from an app rewriting a week. Does not demonstrate general superiority or authorize loading from unknown RIR. | Preserve execution of accepted autoregulation in TD-S04/SIL-S05. Do not equate content stability with fixed absolute loads. |
| **E5 — Mujika et al., 2000**, [primary randomized comparison, PubMed](https://pubmed.ncbi.nlm.nih.gov/10694140/) | Eight trained male middle-distance runners underwent two taper protocols; neither produced a statistically significant performance improvement in that small experiment. | Very small groups, short taper, 800-m context. Failure to reach significance is not proof that taper has no benefit; no extrapolation to half-marathon or strength events. | Counterevidence to guaranteed taper improvement and universal race protocol. SIL-S10's semantic coverage does not close its domain oracle. |

**Rejected source:** PMID 33337690 appeared during search but its PubMed record identifies it as a retracted publication. It is excluded from all substantive claims; no RIR accuracy inference has been drawn from it. Search result freshness dates are not treated as publication dates.

## Positive findings and calibrated gate

No explicit DANGEROUS sporting recommendation was found in the inspected normative outputs. This means that the specified routes avoid obvious unsupported dose/clearance assertions; it does not establish physiological safety. Particularly defensible safeguards are: local restriction overrides favorable HRV (S07/S42); no missed-session inference from sync lag (S08/S09); no automatic repayment of missed volume (S09/S10/S28); no progression credit for a deliberately removed target (SIL-S04/S05); no equivalent exercise by muscle-name alone (SIL-S09); no extra fatigue from counting the same exposure in multiple layers (SIL-S07/S08); and revalidation of the complete horizon (S47).

**Evidence gate: EVIDENCE_PARTIAL_PROCEED_AS_EXPERIMENT for bounded documentary/control-fixture work.** The material domain gaps remain explicit; synthetic stubs must retain their scope. This gate does not authorize real prescriptions or claims of expert equivalence.

**Readiness advice to mission owner:** a GO verdict for an athlete-facing decision runtime is not supported by these inputs. A control skeleton/harness can be engineered under isolated synthetic fixtures while missing policies and oracle migration are resolved; whether that restricted work is called GO WITH FIXES must be stated separately from the domain runtime. G01–G04 and applicable G09/G11 remain their existing activation gates, not new research bureaucracy.

**Stop condition met for this baseline review:** sources sufficient to expose the material interpretation and coverage limits; no further general sports research would close missing fixtures or professional policies. A later review of the author's dashboard/data is required to confirm that the findings were represented faithfully. This file does not approve artifacts not yet supplied.

## Draft assessment review — AE-DOC-20261022-r1

Reviewed artifact: `outputs/validation-data.json`, SHA-256 **`2E47BAC5A2EDE1ADD4F3BFB12D3A95AFA3F10D8D079B3B9BA26C63A7A8742724`**. Read the 89 record decisions, classifications, source-oracle references, rubric applicability and all Q trajectories; inspected case detail for the sporting decisions and dimension judgments challenged below. Did not edit the JSON. The root artifact contains 89 cases, ten rubric entries each, and the declared distribution reconciles to **61 PASS / 19 ACCEPTABLE / 9 QUESTIONABLE / 0 WRONG / 0 DANGEROUS**. These counts describe documentary judgments; they are not observed runtime pass rates.

**Disposition for this exact draft: REQUEST_CHANGES on representation, not a new finding of unsafe training output.** The core conclusion is appropriately bounded: NO-GO for a prescriptive/adaptive runtime as training authority; neutral infrastructure may proceed with fixes under a future authorized mission. Domain-evaluability is present, with 44 rows labelled NOT_EVALUABLE_DOMAIN and 45 labelled NOT_TESTED_DOMAIN. Missing domain rules, legacy migration, Balanced and positive action witnesses are not concealed. Source rows and new derivations remain distinguishable. The sporting classes are defensible as documentary classifications; there is no basis to manufacture WRONG/DANGEROUS counts to make the distribution look adversarial.

### SP-D01 — HIGH / required: `must_not` contains positive requirements

**Affected:** all records generated by copying the complete source oracle into `must_not`; explicit examples S01/S02/S07 and Q01–Q09. S01's field begins with the affirmative requirement to recommend C-A and confirm. S07's field begins with the required scoped HOLD. A reader or a future Golden exporter using the field name literally would invert intended behavior.

**Acceptance:** retain the original source oracle in its existing provenance field; `must_not` must contain only prohibited outcomes, or be renamed so its contents are no longer presented as prohibitions. Prefer extracting the actual forbidden actions per case. This is not a request to modify the authority or to change a primary classification. It is a required data/report correction before handoff.

### SP-D02 — MEDIUM / required for property charts: technical prerequisites overstate sporting coverage

**Examples:**

| IDs / field | Current draft | Why it is not proof of that sporting dimension | Acceptance |
| --- | --- | --- | --- |
| S22 `goal` and `progression` | PASS because correction/deduplication preserves history | Correct lineage is a prerequisite; no concrete goal or progression decision is exercised. | N/E for the unevaluated sporting dimension, unless a separate explicitly labelled contract-safeguard criterion is reported. |
| SIL-S02 `progression` | PASS because repeats and recovery representation remain faithful | Workout-shape fidelity does not test medium-term progression. | N/E for progression; preserve PASS for the representation invariant elsewhere. |
| S42 `interference` | PASS with a safety HOLD in both priority variants | HOLD correctly preempts arbitration; the test demonstrates safety precedence and priority invariance, not interference reasoning. | N/E for interference; keep the correct safety/priority judgments. |
| S05/S12 `progression` | PASS while the proposed reduction is not evaluable under the new necessity gate | No accepted future dose, horizon or training response supports preservation of medium-term progression. | PARTIAL if judging the explicit protective reasoning, otherwise N/E. Do not imply the adaptation's progression effect is proved. |
| S29 `progression`, FZ-S09 `progression` | PASS from preserving executed history or establishing a legitimate initial base | These are authority/history or initial-generation semantics, with no closed progression outcome. | N/E for unexercised progression, while retaining the control/agency result. |

The same applicability rule should be applied proportionately to analogous rows; no automatic wholesale downgrade is requested. Property denominators must reflect what the case actually exercises. This changes property coverage or PARTIAL counts, not necessarily the primary 61/19/9 distribution. Labeling all percentages documentary is necessary but does not by itself turn a prerequisite into a test of the property.

### SP-D03 — MEDIUM / required for priority summary: inheritance and exercise need separate fields

**IDs:** S15/S32/Q01 explicitly reuse S01 and therefore inherit its Run-first fixture context, yet `priority_modes` is empty and `priority` says unspecified. A priority distribution based on this field will undercount known Run-first context. This does not mean those cases test Run-first sporting arbitration; their purpose remains agency/replay/concurrency.

**Acceptance:** record inherited priority with provenance (S01/F-CROSS), separately from whether priority reasoning was exercised. Keep genuinely unspecified cases unknown; do not assign a priority from the reviewer. S43 is a family-level counterfactual over goldens and should retain its parameterized nature rather than receive an invented single priority.

### SP-D04 — LOW / interpretive condition: NE_DOMAIN is not automatically a missing physiological policy

SIL-S02/S03/S06–S08 primarily test representation, protocol lineage or exposure accounting. Their NOT_EVALUABLE_DOMAIN label is conservatively true regarding physiological claims, but they do not ask a physiological prescription question in the first place. Do not turn the count of 44 NE_DOMAIN rows into “44 domain-policy defects” or “44 failed athlete decisions.” Either distinguish these as NOT_TESTED_DOMAIN or explain the taxonomy clearly. This condition matters for dashboard narrative; it does not dispute the broad lack of physiological validation.

### Review limits and follow-up

The existing nine sequences are represented honestly as documentary event trajectories, including explicit notices that recovery debt is not modelled. Q01/Q07 correctly retain their initial sporting-application precondition; Q04's jitter requires a rule rather than intuitive noise filtering. S01/S02/S05/S12/S13/S14 and S28/S29 correctly surface their necessity/fixture gaps. The draft does not invent athlete biography, numeric physiology or specialist approval. TD-S04 explicitly preserves already accepted programmed variation, consistent with SP-06; a positive variable-prescription witness remains a coverage improvement rather than grounds to reject that semantic rule.

Approval can be granted for **faithful documentary representation within this sports-review scope** after SP-D01–03 are resolved and the forthcoming coverage/Golden/report artifacts preserve the baseline gaps. No approval of those absent artifacts is inferred from this review. Material changes to decisions, property applicability or readiness require a new artifact hash and focused recheck; editorial layout alone does not invalidate the underlying sports assessment.
