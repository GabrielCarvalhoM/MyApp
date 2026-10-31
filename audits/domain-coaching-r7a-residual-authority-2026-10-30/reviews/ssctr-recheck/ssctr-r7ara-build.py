"""SSCTR R7ARA-SSCTR-r1 record builder (own). Reads my run outputs in runs/ and writes the structured ruling, the decision records and the
queue proposal of the narrow recheck of R7A-RESIDUAL-AUTHORITY-FREEZE-1. Numbers are computed from the outputs, not transcribed. Literature is not
reopened (Founder request for this recheck, items 19-20); the sources are copied verbatim from my R7ADA records, themselves verbatim from the R6
SSCTR records (r12). Usage: python ssctr-r7ara-build.py  (then validate with .agents/skills/sports-science-review/scripts/validate_records.py)
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
RUNS = HERE / "runs"
REV = "R7ARA-SSCTR-r1"
DATE = "2026-10-31"
FREEZE_FILE = "CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json"
QUEUE_FILE = "audits/domain-coaching-r7a-residual-authority-2026-10-30/reviews/ssctr-recheck/ssctr-r7ara-queue-items.json"
sha = lambda p: hashlib.sha256((ROOT / p).read_bytes()).hexdigest()
J = lambda name: json.loads((RUNS / name).read_text(encoding="utf-8"))
FREEZE_SHA = sha(FREEZE_FILE)
FREEZE = json.loads((ROOT / FREEZE_FILE).read_text(encoding="utf-8"))
assert FREEZE["sourceDigest"] == "e7172eb2e65bfb1da4c102a7efa2bae64bf1c70b06562fd3ce9896defd6dc17d"
assert FREEZE["manifestDigest"] == "3d214fb53f62e45ca7d99f39f2c562d358719a2264c2de46098d39b318c85125"
ADAPT, PROGRAM = sha("CoachingCore/src/r6-adaptation.mjs"), sha("CoachingCore/src/r6-program.mjs")

# ---------- facts from the outputs ----------
cont = {t: J(f"continuous.{t}.out.json")["totals"] for t in ("cand", "pred")}
matrix = {t: J(f"walkjog-matrix.{t}.out.json")["totals"] for t in ("cand", "pred")}
exitv = {t: J(f"exitvariants.{t}.out.json")["totals"] for t in ("cand", "pred")}
ret = {t: J(f"return.{t}.out.json") for t in ("cand", "pred")}
rt = {t: ret[t]["totals"] for t in ret}
cross = {t: J(f"crossentry.{t}.out.json")["cells"] for t in ("cand", "pred")}
asc = {n: {t: J(f"asc/{n}.{t}.out.json") for t in ("cand", "pred")} for n in ("hold", "maintain", "temporal", "walkjog", "walkjog-trace", "easyreturn")}
kit = J("kit-compare.out.json")
digest_mid = J("digest.mid.out.json")
race_only = [x for x in rt["cand"]["examples"] if "RACE:" in x]
assert rt["cand"]["violations"] == len(race_only), "a candidate violation other than the race row"
C = ret["cand"]["partC"]
c3 = {a: C[f"C3/{a}"] for a in ("PERF", "HM")}
c4 = {k: v for k, v in C.items() if k.startswith("C4/")}
c6 = {k: v for k, v in C.items() if k.startswith("C6/")}
kg = {t: kit["gates"][t] for t in ("candidate", "predecessor")}
grid, caps = kg["candidate"]["D53_D56_restorationGrid"], kg["candidate"]["D57_capsGrid"]
short, fw, xfw = kg["candidate"]["D58_shortGrid"], kg["candidate"]["D59_firstWeek"], kg["candidate"]["D59_extendedFirstWeek"]
ks = kit["summary"]
hold, maint = asc["hold"]["cand"]["totals"], asc["maintain"]["cand"]["totals"]
er = {t: asc["easyreturn"][t]["cellsAboveLongestExecuted"] for t in ("cand", "pred")}

SCOPE = ("Scope: offline synthetic Node24 reference only, for the adult (18+) recreational nonclinical V1 population stated in "
         "PROGRAM_POLICY_R6.population. Missing current eligibility is ASK; pain, injury, illness, functional limitation or a clinical interruption "
         "reason is CLINICAL_HUMAN_REQUIRED with no substitute dose.")
BINDING = (f"Binding: this record binds runtime R7A-RESIDUAL-AUTHORITY-FREEZE-1 ({FREEZE_FILE}, sha256 {FREEZE_SHA}; source digest "
           f"{FREEZE['sourceDigest']}; manifest {FREEZE['manifestDigest']}; src/r6-adaptation.mjs {ADAPT}, src/r6-program.mjs {PROGRAM}; runtime commit "
           "7d2da3603e224124696a2290766ec448080f3264) at the unchanged policy R6-POLICY-5 (canonical hash "
           f"{FREEZE['policyHash']}). Any change to a bound file or to the policy hash expires it.")
INTEGRITY = (f"Integrity: R7A-RESIDUAL-AUTHORITY-FREEZE-1 recomputed by my own canonical hash (Python at the start, Node ssctr-r7ara-digest.mjs mid and "
             f"end): 86 of 86 bound files match in the worktree and in a git archive of 7d2da36; 0 unbound src/test files; source digest "
             f"{FREEZE['sourceDigest'][:8]}..., manifest {FREEZE['manifestDigest'][:8]}..., policy file a75be1aa... (canonical 18ec48f3...). Commit "
             "4917489 changes only CURRENT_MISSION.md, MISSION_LEDGER.md and REVIEW_HANDOFF.md. verify-r7ara.mjs --tests read-only on Node v24.19.0: "
             "13/13, suite 673/673. Predecessor R7A-DECISION-AUTHORITY-FREEZE-1 rebuilt from git commit d4631cd matches its record (85/85, 3a7166b2..., "
             "a500cdd9...) and the in-repo copy (85/85 equal to git).")
INSTANCE = ("ssctr-r7ara-recheck-2026-10-31 (a new Claude Code cloud session started by the Founder for the narrow SSCTR regression recheck of "
            "R7A-RESIDUAL-AUTHORITY-FREEZE-1, acting in the project role by loading governance/agents/sports-science-reviewer/CONSTITUTION.md "
            "(SSCTR-CONST-1.0.0), .agents/skills/sports-science-review/SKILL.md 1.0.0, registry.json SSCTR-REG-1.0.0, decision.schema.json and "
            ".claude/agents/sports-science-concurrent-training-reviewer.md. The project agent type is listed in this session but was not dispatched: "
            "this session ran the recheck itself, labelled as the registry allows; no delegation. It did not author the policy, the runtime, the "
            "residual authority contract or the tests. The R46 recommendation this freeze implements came from the earlier SSCTR session "
            "(R7ADA-SSCTR-r1), not from this instance)")
POP = ("Explicitly nonclinical eligible adult (18+) recreational novice-to-experienced hybrid runners/strength trainees in V1; offline synthetic "
       "Node24 reference only. No elite, adolescent, pregnancy/postpartum, frailty, rehabilitation or clinical-clearance extrapolation.")
prev_sources = json.loads((HERE / "ssctr-r7ara-sources.json").read_text(encoding="utf-8"))
SRC = lambda *ids: [prev_sources[i] for i in ids]
NO_SEARCH = [{"query": "none (literature not reopened)", "site": "not applicable", "searched_on": DATE,
              "purpose": "R7ARA-SSCTR-r1 is a narrow regression recheck (Founder request for this recheck: no new science expansion, no new research). Web search tools exist in this session but were deliberately not used.",
              "result_notes": "No search run. Sources are copied verbatim from my R7ADA records (themselves verbatim from the R6 SSCTR records, r12), with the read depth recorded there; I did not re-read them. The rulings are conformance to approved recipes, checked with my own probes."}]
COUNTER = ("Counterevidence was sought by re-running my unchanged R7ADA and R7ASC probes and my 43-job kit on the frozen runtime with predecessor "
           "controls, by reproducing the author's runs, and by new bounded probes on both trees (ssctr-r7ara-return-probe.mjs: 416 single-pause "
           "returns on three easy runners, adverse-response and repeated-pause cells; ssctr-r7ara-exitvariants-probe.mjs; ssctr-r7ara-crossentry-probe.mjs), "
           "looking for any return above the executed/tolerated dose, any under-dose below min(state, executed), and any changed quality or strength row.")
AE_NA = None


def ae(answers):
    assert len(answers) == 10
    return {"applicable": True, "answers": [{"question_number": i + 1, "answer": a} for i, a in enumerate(answers)], "not_applicable_reason": AE_NA}


def gov(action):
    return {"gate_status": "NOT_CLOSED_BY_THIS_RECORD", "publication_status": "NOT_PUBLISHED", "human_validation": False, "empirical_product_validation": False,
            "clinical_clearance": False, "next_owner": "Chief", "next_action": action}


TRIGGERS = ["Any change to PROGRAM_POLICY_R6.json (new canonical hash).",
            "Any change to a file listed in RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json (new freeze revision): rerun ssctr-r7ara-return-probe.mjs, ssctr-r7ara-exitvariants-probe.mjs, ssctr-r7ada-continuous-probe.mjs, the walk/jog matrix and the kit.",
            "A policy-owner decision on NF-R7ARA-1 (the cross-entry reading of the easy-running cap).",
            "A Founder decision on R1 or on R7-B0 scope that changes return semantics.",
            "A new systematic review or meta-analysis on detraining, retraining or return after a break."]


def expiry():
    return {"owner": "Chief / SSCTR", "review_by": "2027-04-30",
            "event_based_expiry": "Expires immediately on any policy hash change, any change to a file bound by R7A-RESIDUAL-AUTHORITY-FREEZE-1, or a failed re-run of the probes this record cites.",
            "triggers": TRIGGERS}


def record(rid, question, rules, items, facts, unknowns, sources, claims, status, applicability, disposition, action, decision, conf, limits, answers, next_action, queued):
    rec = {"schema_version": "1.0.0", "review_id": rid, "review_revision": REV, "review_date": DATE, "agent_version": "SSCTR-1.0.0",
           "constitution_revision": "SSCTR-CONST-1.0.0", "protocol_revision": "SSCTR-EP-1.0.0",
           "reviewer": {"actor_type": "AI_AGENT", "instance_id": INSTANCE, "human_credentials_claimed": False, "independent_of_target_author": True},
           "target": {"project": "MyApp / Vilumo Fit", "artifact": FREEZE_FILE, "artifact_revision": "R7A-RESIDUAL-AUTHORITY-FREEZE-1", "sha256": FREEZE_SHA, "rule_ids": rules},
           "question": question,
           "population_context": {"population": POP, "eligibility_status": "SCOPE_DEFINITION_ONLY", "facts": [INTEGRITY, *facts], "unknowns": unknowns},
           "scope": {"gate": "G02", "item_ids": items, "prescriptive_impact": True, "whole_gate_closure": False},
           "literature_snapshot": {"as_of": DATE, "searches": NO_SEARCH, "sources": SRC(*sources), "counterevidence_search": COUNTER},
           "claims": claims, "evidence_status": status, "applicability": applicability, "disposition": disposition, "proposed_action": action,
           "decision": decision, "confidence": conf, "limitations": limits, "ae_review": ae(answers), "governance": gov(next_action), "expiry": expiry(),
           "human_revalidation": {"state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION", "queue_ref": f"{QUEUE_FILE}#HQ-{rid}", "human_review": None} if queued else
                                 {"state": "NOT_APPROVED_PRESCRIPTIVE_DECISION", "queue_ref": None, "human_review": None}}
    return rec


claim = lambda cid, text, basis, role, status, sources, appl, lim, counter: {"claim_id": cid, "statement": text, "basis": basis, "role": role, "evidence_status": status,
                                                                             "source_ids": sources, "applicability": appl, "limitations": lim, "counterevidence": counter}
RULES_E1 = ["r6-program.mjs historicalRun (E1.3 mode undo, E1.4 dose caps)", "r6-adaptation.mjs stateAtBreak (runs since the latest entry; undo by break class)"]

records = []
# 1. F4-X
records.append(record(
    "R7ARA-SSCTR-F4X-EXIT-RETURN",
    "F4-X: walk/jog step 8 executed, the exit to continuous running released but never run, then a pause. Does the return now follow the walk/jog recipe (SHORT step 8, MODERATE step 7, LONG step 0) with no continuous run in the re-entry week, without regressing the walk/jog ladder (F4)? Supersedes R7ADA-SSCTR-WALKJOG-EXIT-RETURN (REVISE).",
    RULES_E1 + ["contract E1.3 (a released walk/jog exit is undone for every break class; SSCTR R46)"],
    ["F4-X", "F4", "SSCTR R46", "R6-NONCLINICAL-RETURN SHORT/MODERATE/LONG"],
    [f"My continuous probe (34 cells, two athletes): ladder view {cont['cand']['ladderViewAbove']}, duration view {cont['cand']['durationViewAbove']} (predecessor {cont['pred']['ladderViewAbove']} and {cont['pred']['durationViewAbove']}); the weekly view flags {cont['cand']['weeklyAboveExecutedAndPrior']} cells (predecessor {cont['pred']['weeklyAboveExecutedAndPrior']}), byte-identical to the predecessor's cells ruled correct in R7ADA item 18. Only the EXIT_EARNED cells differ from the predecessor: SHORT step 8, MODERATE step 7, LONG step 0, no continuous run in the re-entry week.",
     f"Exit variants (Monday's first continuous run missed, or reported at 20 of 25 minutes; SHORT/MODERATE/LONG): {exitv['cand']['continuousInReentry']} of {exitv['cand']['cells']} cells with a continuous run in the re-entry week, {exitv['cand']['stepAboveRecipe']} above the recipe (predecessor {exitv['pred']['continuousInReentry']} of {exitv['pred']['cells']}).",
     f"Walk/jog matrix: {matrix['cand']['entryAbove'] + matrix['cand']['spanAbove'] + matrix['cand']['continuousInSpan'] + matrix['cand']['followingAboveRecipePlusOne']} of {matrix['cand']['returns']} returns above the recipe, identical to the predecessor; my 12-cell R7ASC walk/jog probe {asc['walkjog']['cand']['totals']['aboveRecipeAfterSecondReturn']} of 12. My outputs equal the author's runs of the same probes."],
    ["Real-world adherence to the extra walk/jog week."],
    ["R6-S02", "R6-S19"],
    [claim("F4X-1", "Returning at the last executed walk/jog step avoids a single-session increase above the 30-day longest run (20-minute jog to 25-minute continuous runs, about +25%, the >10-30% band R6-S02 associates with higher overuse-injury rates) after a break that lowers fitness (R6-S19); the exit waits for an executed step, as R6-NONCLINICAL-RETURN SHORT requires ('the next step waits for executed sessions').",
           "INFERRED", "DECISION_SUPPORT", "SUPPORTED_WITH_LIMITS", ["R6-S02", "R6-S19"], "Walk/jog athletes at the ladder's exit after a nonclinical break.",
           ["R6-S02 is observational and distance-based; neither source sizes walk/jog steps."], ["R6-S02 found no association for week-to-week ratios; the frequency effect of the MODERATE bypass was uncertain."]),
     claim("F4X-2", "The freeze implements R46 exactly: a released exit that no continuous run used is undone; once a continuous run is executed (P7) the exit stands.", "OBSERVED", "CONTEXT",
           "SUPPORTED_WITH_LIMITS", [], "My continuous and exit-variant probes on both trees.", ["Synthetic timelines; two athletes."], ["None observed in the gate."])],
    "SUPPORTED_WITH_LIMITS", "Walk/jog athletes whose last executed run was a ladder step, after a nonclinical SHORT, MODERATE or LONG break.",
    "APPROVE_WITH_CONDITIONS", "KEEP",
    {"rationale": "F4-X closed: the return reads the walk/jog state at the step last run for every break class; no continuous run the athlete never ran; the ladder (F4) unchanged.",
     "preserve": ["W2 and E1.3 for the walk/jog exit; P7 (an executed continuous run promotes)."], "modify": [],
     "mec_change_level": "None: R46 as recommended, inside the approved recipe.", "trade_off": "One more ladder week at most before the exit, in exchange for no untested continuous running after a break.",
     "must_not": ["Must not treat a released exit as tolerated before a complete continuous run.", "Must not raise the walk/jog recipe above the step last run."],
     "conditions": [SCOPE, BINDING, "The week after the re-entry week is a conditional projection that needs the re-entry week executed; RETURN walk days (NF-R7ADA-2) stay in the backlog."]},
    {"level": "HIGH", "rationale": "Reproduced on my own probe, on variants and against the predecessor; mechanism read in the diff."},
    ["Synthetic; two athletes; projections after the re-entry week are conditional."],
    ["Yes: the walk/jog recipe is adequate after a break.", "Yes: the step last run, from the executed record.", "KEEP of the freeze's behavior is defensible.",
     "No further change is needed in the gate.", "None.", "Returning to continuous runs would repeat F4-X.", "It protects the ladder and the exit gate.",
     "Supported with limits (R6-S02, R6-S19).", "Adherence to one more ladder week.", "No ASK or clinical route."],
    "Record with this recheck; queue proposal only.", True))
# 2. EASY return factual ceiling (E1-a, E1-c, item 11)
records.append(record(
    "R7ARA-SSCTR-EASY-RETURN-CEILING",
    "EASY return factual ceiling: does a return in easy running never start above the long and easy doses executed and tolerated (a released or projected dose is not executed), with the MODERATE target at the executed dose, and is reading the largest tolerated dose since the entry (not a consolidation-reduced row, not a released step) sports-coherent (E1-a, E1-c, consolidation long run)?",
    RULES_E1 + ["contract E1.4 (easy: the largest long and easy runs executed and tolerated since the entry)", "R6-NONCLINICAL-RETURN SHORT and MODERATE"],
    ["EASY return factual ceiling", "E1-a", "E1-c", "consolidation long run", "P3", "P4"],
    [f"My return probe on three easy runners (PERF, HM, HYB), weeks 0..k-1 executed and reviewed, a pause from Monday or from Thursday after that week's earlier sessions, SHORT 4/6/10 days and MODERATE 14/17/21/28: {rt['cand']['cells']} cells ({rt['cand']['shortCells']} SHORT, {rt['cand']['moderateCells']} MODERATE), 0 returns above the executed and tolerated dose; the single flag is the half-marathon race row inside a MODERATE re-entry week (an event the single-run ceiling excludes by policy), identical on the predecessor. Predecessor: {rt['pred']['violations']} violations. In {rt['cand']['releasedAboveExecuted']} cells HistoricalState held a released long run above the executed one.",
     "No return below min(HistoricalState, largest executed and tolerated) and no re-entry week with more minutes than the predecessor (110 lower, 278 the same).",
     f"E1-a: {rt['cand']['e1aCells']} SHORT cells resume a long run above the last one executed, every one right after a CONSOLIDATION week, at the largest executed since the entry (PERF k5: 65 executed in weeks 0-3, 60 in consolidation, 70 released: 65; the predecessor 70). Item 11 framing (HYB k4): 60 executed in the build week, 55 in consolidation, 65 released: the return is 60, never the released 65 (the predecessor 65); the next week projects 65, conditional on execution.",
     "Adverse long run (8 cells): an adverse run is no tolerated dose; the cap falls back to the largest tolerated (PERF k6: 70 adverse, 65 tolerated: 65). Repeated pauses (C1, C2, C7): 0 returns above the executed dose.",
     f"MODERATE: returnTo is the largest executed and tolerated dose since the entry (PERF k6: 70, the predecessor's released 75; PERF k5: 65, not the consolidation's 60). My R7ASC easy-return probe: {er['cand']} of 4 cells above the longest executed (predecessor {er['pred']}). The eased first quality slot after a SHORT break (D58) is identical on both trees in all 388 single-pause cells."],
    ["Whether athletes perceive the post-consolidation return as too high or too low."],
    ["R6-S19", "R6-S21", "R6-S02"],
    [claim("EC-1", "A break lowers fitness (R6-S19) and a single-session jump above the recent longest run carries more overuse risk (R6-S02): a return that never exceeds the doses executed and tolerated, and never uses a released or projected step, is the conservative reading of 'resume the last executed doses' and 'conditional steps to the prior executed dose'.",
           "INFERRED", "DECISION_SUPPORT", "SUPPORTED_WITH_LIMITS", ["R6-S19", "R6-S02"], "Nonclinical SHORT and MODERATE returns of easy runners.",
           ["R6-S19 measures VO2max only; R6-S02 is observational and distance-based."], ["Short breaks cause small losses; a one-step under-dose costs little either way."]),
     claim("EC-2", "A planned recovery week is part of a predefined progression (R6-S21's program alternated progressive weeks with a -25% recovery week), not evidence of lower tolerance: the dose reached by execution is the largest tolerated one, as the approved strength rule D49 excludes a phase reduction from the set ceiling. The 30-day single-run ceiling still bounds any reuse of an older largest run.",
           "INFERRED", "DECISION_SUPPORT", "SUPPORTED_WITH_LIMITS", ["R6-S21"], "Returns right after a consolidation week.",
           ["R6-S21 does not test returns; the analogy to D49 is the policy's own logic."], ["Across a return boundary the window restarts (NF-R7ARA-1), so a phase-reduced row can become the cap there."]),
     claim("EC-3", "Released is not executed in every reading I probed: SHORT, MODERATE, mid-week, adverse and repeated pauses.", "OBSERVED", "CONTEXT", "SUPPORTED_WITH_LIMITS", [],
           "My return probe on both trees.", ["Synthetic; three runners."], ["None above the ceiling."])],
    "SUPPORTED_WITH_LIMITS", "Easy runners after a nonclinical SHORT or MODERATE break.",
    "APPROVE_WITH_CONDITIONS", "KEEP",
    {"rationale": "The EASY return factual ceiling holds: return dose <= the largest executed and tolerated dose since the entry, capped by HistoricalState; E1-a and E1-c ACCEPT_WITH_REASON; item 11: returning to the executed 60 (not the released 65) is coherent with the factual tolerated dose and violates no consolidation rule.",
     "preserve": ["min(HistoricalState, largest executed and tolerated since the entry) for long and easy runs; the rotating extra step waits; the eased quality slot is no easy-run dose; the 30-day single-run ceiling."],
     "modify": [], "mec_change_level": "None: a reading of approved recipes.",
     "trade_off": "Up to one 5-minute step lower than the released plan for one week after a break, in exchange for never starting above what was executed.",
     "must_not": ["Must not use a released or projected dose as the return baseline.", "Must not treat a planned consolidation reduction as the athlete's tolerance within an entry window."],
     "conditions": [SCOPE, BINDING, "The return week's own phase applies its reduction again; the quality ladder after a SHORT break stays governed by D58 (E1-B1).", "NF-R7ARA-1 (cross-entry cap after a phase-reduced re-entry week) is non-blocking and owned by the policy owner."]},
    {"level": "MODERATE", "rationale": "Broad probe coverage on both trees; the sources support the direction, not the exact step sizes, which are the policy's own."},
    ["Synthetic; three easy runners; projections after the re-entry week are conditional."],
    ["Yes: resuming the executed dose is adequate after a short break.", "Yes: executed and tolerated runs from the record.", "KEEP is defensible.", "No change needed.",
     "None.", "Resuming a released step would exceed the executed dose.", "It protects progression by keeping the earned step for after re-entry.", "Supported with limits (R6-S19, R6-S21, R6-S02).",
     "Perceived under-dosing by one step.", "No ASK or clinical route."],
    "Record with this recheck; queue proposal only.", True))
# 3. E1-b and earned/eligible vs executed/tolerated
c3p = c3["PERF"]
records.append(record(
    "R7ARA-SSCTR-E1B-SHORT-AFTER-REENTRY",
    "E1-b and the earned/eligible vs executed/tolerated ruling: a MODERATE re-entry week executed at return step 0, then a short trip before any step-1 session. The return resumes step 0 while history credits step 1. Coherent with the factual tolerated dose, material under-dosing, or a contradiction of the recipe or policy?",
    RULES_E1 + ["test/r7ab-week-start-authority.test.mjs I5/P3, section 13 premise and I6 (re-expressed in place)"],
    ["E1-b", "earned vs executed", "P3", "P4", "R6-NONCLINICAL-RETURN SHORT and MODERATE"],
    [f"My C3 cells (PERF, HM): the re-entry week 15/15/20 executed; history at the next week credits return step {c3p['historyWeek6']['returnStep']}; a 4-day trip then returns at step {c3p['second']['entry']['returnStep']} (predecessor step 1): the trip week's remaining Sunday long run of 20 minutes, then step 1 (30/30/45) the next week. Control (P4): step 1 run once before the trip: the return resumes step 1 on both trees."],
    ["Perceived under-dosing of one more entry-level exposure."],
    ["R6-S21", "R6-S19"],
    [claim("E1B-1", "Progression is conditional on executed comparable work (R6-S21) and a break removes current proof (R6-S19): an earned step is eligible in normal planning but not yet a tolerated return baseline; resuming the step last run and stepping after the next executed exposures is a bounded, conservative application of 'SHORT: resume the last executed doses; the next step waits for executed sessions'.",
           "INFERRED", "DECISION_SUPPORT", "SUPPORTED_WITH_LIMITS", ["R6-S21", "R6-S19"], "Short breaks inside a moderate return.",
           ["Neither source sizes return steps."], ["Predefined progression was also effective in R6-S21; a one-week delay costs little."]),
     claim("E1B-2", "The delay is at most one week at entry-level doses (15-45 minutes) and nothing executed is lost from history (P4 holds).", "OBSERVED", "CONTEXT", "SUPPORTED_WITH_LIMITS", [],
           "My C3 cells and controls on both trees.", ["Two runners."], ["None."])],
    "SUPPORTED_WITH_LIMITS", "A short break after an executed moderate re-entry week, before the next step is run.",
    "APPROVE_WITH_CONDITIONS", "KEEP",
    {"rationale": "ACCEPT_WITH_REASON: eligible to progress in normal planning is not proven as a tolerated return baseline; the separation is sports-coherent, conservative, and contradicts neither the moderate recipe (its two conditional steps are delivered one week later) nor SHORT.",
     "preserve": ["History credits what was executed (C5, P4); the return reads the step last run (E1.4)."], "modify": [],
     "mec_change_level": "None: a reading of approved recipes.", "trade_off": "At most one more week at the step last run, in exchange for not stepping on a step never executed after a break.",
     "must_not": ["Must not hold the step last run for more than the next executed exposures on this ground.", "Must not drop the executed re-entry week from history."],
     "conditions": [SCOPE, BINDING, "Once the next step is executed, a later break resumes it (P4)."]},
    {"level": "MODERATE", "rationale": "Bounded behavior, reproduced; the step sizes are the policy's own."},
    ["Two runners; synthetic."],
    ["Yes: the step last run is adequate after a short trip.", "Yes: the executed re-entry week.", "KEEP is defensible.", "No change needed.", "None.",
     "Stepping to a step never run would exceed the executed dose after a break.", "It protects the conditional return.", "Supported with limits (R6-S21, R6-S19).",
     "Perceived under-dosing.", "No ASK or clinical route."],
    "Record with this recheck; queue proposal only.", True))
# 4. Released modes: E1-d, E1-e, E1-f, R7ARA-SELF-01
m14 = c4["C4/PERF/MODERATE14"]["second"]["entry"]
records.append(record(
    "R7ARA-SSCTR-RELEASED-MODES-RETURN",
    "E1-d, E1-e, E1-f and R7ARA-SELF-01: a return completion or a restart switch released and never run, then a pause. SHORT resumes the step or minutes last run; MODERATE re-enters from the 15-minute entry towards the doses executed since the latest entry; LONG restarts. Is R7ARA-SELF-01 closed and are these targets sports-coherent?",
    RULES_E1 + ["contract E1.3 (a MODERATE or LONG break undoes only the walk/jog exit)"],
    ["E1-d", "E1-e", "E1-f", "R7ARA-SELF-01"],
    [f"My C4 cells (PERF, HM; steps 0 and 1 executed, the completion released): SHORT returns at step 1 with Sunday's 45-minute long run (predecessor: easy running, a 60-65 minute long run); MODERATE 14 and 21 days re-enter at step 0 from {m14['returnFrom']['easy']}/{m14['returnFrom']['long']} towards {m14['returnTo']['easy']}/{m14['returnTo']['long']} (predecessor towards 40/70, released and never run since); LONG restarts at 15. R7ARA-SELF-01 (a moderate break resuming step 1 at 30/30/45) is absent.",
     "C5: one easy-mode run executed after the completion, then SHORT: easy running with long and easy capped at the return step's 45 and 30 (predecessor 70 and 40-45).",
     "C6 (restart run to the switch, 25 minutes last run): SHORT returns in restart at 25 (predecessor easy 30, long 40); MODERATE re-enters from 15/20 towards easy 25 and long 40, the switch's offset (E1-B3), as on the predecessor."],
    ["The rebuild time after two moderate breaks in close succession."],
    ["R6-S19", "R6-S21"],
    [claim("RM-1", "After breaks in close succession fitness has declined (R6-S19); the most recent executed dose is the current proof and historical maxima are a ceiling (R6-NONCLINICAL-RETURN); conditional steps after executed work (R6-S21). Re-entering from the 15-minute entry after an 11-28 day break and targeting the doses executed since the latest entry applies the moderate recipe as approved.",
           "INFERRED", "DECISION_SUPPORT", "SUPPORTED_WITH_LIMITS", ["R6-S19", "R6-S21"], "Pauses right after a return's completion or a restart's switch.",
           ["Neither source sizes the recipe."], ["The lower target lengthens the rebuild towards the pre-first-break doses."]),
     claim("RM-2", "The released mode is undone only where the recipe reads the state last run: SHORT for every release; MODERATE and LONG for the walk/jog exit only.", "OBSERVED", "CONTEXT", "SUPPORTED_WITH_LIMITS", [],
           "My C4-C6 cells on both trees.", ["Two runners; synthetic."], ["None."])],
    "SUPPORTED_WITH_LIMITS", "Nonclinical pauses after a released return completion or restart switch.",
    "APPROVE_WITH_CONDITIONS", "KEEP",
    {"rationale": "E1-d, E1-e ACCEPT; E1-f ACCEPT_WITH_REASON; R7ARA-SELF-01 closed: the moderate return keeps its entry and steps to doses executed since the latest entry.",
     "preserve": ["The class rule of E1.3; the moderate recipe's entry; restart for LONG."], "modify": [],
     "mec_change_level": "None.", "trade_off": "A slower rebuild towards earlier doses after repeated breaks, in exchange for re-entry from current proof.",
     "must_not": ["Must not resume a return step or restart minutes after an 11-28 day break without the entry.", "Must not target a released dose never run since the latest entry."],
     "conditions": [SCOPE, BINDING, "The restart switch's long-run target (offset, E1-B3) is outside this gate, identical to the predecessor, and bounded in rows by the single-run ceiling; restoration towards pre-first-break doses follows the normal executed cadence."]},
    {"level": "MODERATE", "rationale": "Reproduced on two runners and both trees; behavior matches the brief's statements."},
    ["Two runners; synthetic; restart offset untested under a pause (E1-B3)."],
    ["Yes: entry-level re-entry after 11-28 days.", "Yes: the doses executed since the latest entry.", "KEEP is defensible.", "No change needed.", "None.",
     "Resuming step 1 or restart minutes without the entry would skip the recipe.", "It protects the moderate recipe.", "Supported with limits (R6-S19, R6-S21).",
     "Rebuild time after repeated breaks.", "No ASK or clinical route."],
    "Record with this recheck; queue proposal only.", True))
# 5. NF-R7ARA-1, non-blocking
cc = cross["cand"]
records.append(record(
    "R7ARA-SSCTR-CROSS-ENTRY-CAP",
    "NF-R7ARA-1 (non-blocking): after a SHORT return whose re-entry week is a CONSOLIDATION week, a second SHORT pause reads only the runs executed since the first return's report (E1.2). Is the result coherent with E1.4's own rationale and with the adverse path?",
    RULES_E1, ["NF-R7ARA-1", "E1.2", "E1.4", "E1.5"],
    [f"My cross-entry probe (PERF, HM; k=7; the re-entry week 8 is CONSOLIDATION, long run 65): with the long run COMPATIBLE the second SHORT return resumes {cc['PERF/COMPATIBLE']['second']['entry']['long']} (PERF) and {cc['HM/COMPATIBLE']['second']['entry']['long']} (HM); with it ADVERSE the entry's state stands, {cc['PERF/ADVERSE']['second']['entry']['long']} and {cc['HM/ADVERSE']['second']['entry']['long']} (rows 70 and 75), equal to the no-break control and to the predecessor. The predecessor gives 75 and 80 in the COMPATIBLE cells (80 above the executed 75).",
     "Both readings stay at or below the largest executed and tolerated dose (75, executed in week 6 before the first break)."],
    ["Whether the policy owner wants the entry's dose or the post-entry run to set the cap when the post-entry run was phase-reduced."],
    ["R6-S21", "R6-S19"],
    [claim("NF1-1", "Within one entry window the contract treats a planned reduction as no lower tolerance (E1.4); across a return boundary the window restarts, so a tolerated consolidation row (65) caps the next SHORT return, while an adverse one leaves the entry's state (75) standing: the tolerated athlete resumes below the adverse one. Both are at or below the factual tolerated dose; the tolerated path is 5-10 minutes below the no-break plan for one week, conservative after two short breaks in three weeks.",
           "OBSERVED", "CONTEXT", "SUPPORTED_WITH_LIMITS", [], "Repeated SHORT pauses around a consolidation re-entry week.", ["Two runners; synthetic."], ["The adverse path equals the approved HOLD reading and the predecessor."]),
     claim("NF1-2", "Not material: one week, at most two 5-minute steps, rebuilt as executed sessions accrue; after two breaks within three weeks the lower dose is defensible (R6-S19).", "INFERRED", "DECISION_SUPPORT", "SUPPORTED_WITH_LIMITS",
           ["R6-S19", "R6-S21"], "Same.", ["Neither source sizes the effect of one shorter long run."], ["A runner preparing for a race loses one week of long-run build."])],
    "SUPPORTED_WITH_LIMITS", "Repeated SHORT pauses whose first re-entry week was phase-reduced.",
    "REVISE", "MODIFY_CANDIDATE",
    {"rationale": "Non-blocking coherence finding introduced by E1 (the cap's window restarts at a return): the policy owner should choose one reading for a phase-reduced post-entry run so that a tolerated response never resumes below an adverse one. No recipe is proposed here; no runtime change in this recheck.",
     "preserve": ["Every reading at or below the factual tolerated dose (P3)."], "modify": ["Later gate, policy owner with the runtime author: align the cross-entry reading of E1.4/E1.5 (NF-R7ARA-1, backlog R48)."],
     "mec_change_level": "Backlog; not in this gate.", "trade_off": "None now; the current behavior is conservative.",
     "must_not": ["Must not be fixed by raising any return above the executed and tolerated dose."],
     "conditions": [SCOPE, BINDING, "Non-blocking: does not reopen phase A (Founder request, items 19 and 21)."]},
    {"level": "MODERATE", "rationale": "Reproduced on two runners and both trees; small, bounded effect."},
    ["Two runners; synthetic."],
    ["Yes for both readings, as doses.", "Yes: the executed record.", "KEEP for now is defensible.", "Only coherence, not safety, asks for a change.", "A one-reading decision by the policy owner.",
     "None now: the behavior is conservative.", "It protects factual ceilings.", "Supported with limits for the materiality ruling (R6-S19, R6-S21).", "How athletes read the inversion.", "No ASK or clinical route."],
    "Backlog item R48 for the policy owner; not blocking.", False))
# 6. The recheck
records.append(record(
    "R7ARA-SSCTR-RESIDUAL-AUTHORITY-RECHECK",
    "Narrow SSCTR regression recheck of R7A-RESIDUAL-AUTHORITY-FREEZE-1: F4-X, the EASY return factual ceiling, R7ARA-SELF-01, E1-a..E1-f, F1-F4, D53, D56-D59, HOLD and MAINTAIN. Is there a material sporting regression directly caused by this freeze inside the gate?",
    RULES_E1 + ["r6-adaptation.mjs factualReplan/withFactualReplan (A5, engineering scope; read only for sporting side effects)"],
    ["F1", "F2", "F3", "F4", "F4-X", "D53", "D56", "D57", "D58", "D59", "HOLD", "MAINTAIN", "E1-a..E1-f", "R7ARA-SELF-01"],
    [f"Kit (43 jobs, the decision authority closure's job list) on these bytes: {ks['reproducesAuthor']} of {ks['jobs']} reproduce the author's run; {ks['identicalToPredecessor']} identical to the predecessor; differing: {', '.join(ks['differentFromPredecessor'])}. Exit non-zero: {', '.join(ks['exitNonZero']) or 'none'} (R6-H35 runner error, EXPECTED_CORRECTION).",
     f"D53/D56: restoration grid B={grid['B']}, C={grid['C']} of {grid['timelines']} timelines; A rise or end after a non-whole week {grid['A_riseOrEnd']}; A2 held {grid['A2_held']}. D57: caps B={caps['B']}, covered jumps {caps['coveredJumps']}, unexplained {caps['unexplained']}; extension {caps['extB']}/{caps['extCovered']}/{caps['extUnexplained']}. D58: short grid {short['afterReturnDefects']} defects after the return and {short['afterReviewDefects']} after the review of {short['cases']} cases. D59: first-week E/O/B all 0 ({sum(v['cases'] for v in fw.values())} cases); extended first week {xfw['cases']} cases.",
     f"HOLD: {hold['holdCases']} cases, load/reps/sets/tick up {hold['holdLoadUp']}/{hold['holdRepsUp']}/{hold['holdSetsUp']}/{hold['holdTickGained']}, out of range {hold['holdOutOfRange']}, progress without evidence {hold['holdProgressNoEvidence']}; identical to the predecessor. MAINTAIN: {maint['knownRowsAfterChange']} known rows, above range {maint['knownAboveRange']}, below {maint['knownBelowRange']}, RIR below target {maint['rirBelowTarget']}, above the last executed load {maint['loadAboveLastExecuted']}; identical. F1 temporal: history as each cut saw it identical; return step credited from Sunday 22:00 after the week's runs; strength rows identical in every cell; the only difference is a week-9 long run's progression value (65 against the predecessor's released 70) at the same 50 minutes."],
    ["Fresh unseen cases and real athletes (outside this recheck)."],
    ["R6-S19", "R6-S21", "R6-S02"],
    [claim("RC-1", "The freeze lowers or keeps every return dose in the gate and never uses a released or projected run state as the baseline; strength, HOLD, MAINTAIN, restoration, caps and the first week are unchanged. This conforms to the approved return recipe (R6-S19, R6-S21) and to the single-session caution that motivated F4-X (R6-S02).",
           "INFERRED", "DECISION_SUPPORT", "SUPPORTED_WITH_LIMITS", ["R6-S19", "R6-S21", "R6-S02"], "The gate's items on these bytes.",
           ["Synthetic probes; regression evidence, not generalization."], ["NF-R7ARA-1 (non-blocking) is the one coherence gap found."])],
    "SUPPORTED_WITH_LIMITS", "The finite gate of this recheck on R7A-RESIDUAL-AUTHORITY-FREEZE-1.",
    "APPROVE_WITH_CONDITIONS", "KEEP",
    {"rationale": "R7A_RESIDUAL_AUTHORITY_SCIENTIFIC_RECHECK = READY: F4-X closed; the EASY return factual ceiling holds; R7ARA-SELF-01 closed; E1-a..E1-f acceptable; F1-F4, D53, D56-D59, HOLD and MAINTAIN valid; no material sporting regression caused by this freeze inside the gate. NF-R7ARA-1 is non-blocking backlog.",
     "preserve": ["Everything in the gate as frozen."], "modify": [], "mec_change_level": "None.", "trade_off": "None in the gate.",
     "must_not": ["Must not be read as R7A_EXIT_READINESS, engineering readiness, R7-B0 start or Product Truth publication."],
     "conditions": [SCOPE, BINDING, "The engineering recheck decides its own scope; R7A_EXIT_READINESS is the Chief's and the Founder's after both rechecks."]},
    {"level": "MODERATE", "rationale": "Independent reproduction and new bounded probes; synthetic evidence only."},
    ["Synthetic; the kit is regression evidence."],
    ["Yes: the frozen prescriptions in the gate are adequate.", "Yes: probes on both trees.", "KEEP is defensible.", "No change needed in the gate.", "None.", "Not applicable: no change proposed.",
     "It protects factual ceilings and every preserved item.", "Supported with limits.", "Fresh cases.", "No ASK or clinical route."],
    "Record READY with the engineering recheck; queue proposal only.", True))

queue = {"revision": "R7ARA-SSCTR-QUEUE-PROPOSAL-r1", "reviewRevision": REV, "destination": "reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json",
         "note": "Proposal only: one item per prescriptive approval of R7ARA-SSCTR-r1, each bound to R7A-RESIDUAL-AUTHORITY-FREEZE-1. The queue file was not edited; the Chief decides whether to integrate them append-only. Funding NOT_DECLARED.",
         "funding_trigger": {"state": "NOT_DECLARED", "declaration_ref": None, "declared_at": None}, "preserveAllHistoricalEntries": True,
         "items": [{"queue_id": f"HQ-{r['review_id']}", "decision_id": r["review_id"], "decision_revision": REV, "target": r["target"], "approved_scope": r["applicability"],
                    "conditions": r["decision"]["conditions"], "approval_date": DATE, "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
                    "owner": "Future qualified human reviewer (funding NOT_DECLARED)", "human_review": None, "re_review_triggers": TRIGGERS}
                   for r in records if r["disposition"] in ("APPROVE", "APPROVE_WITH_CONDITIONS")]}
ruling = {"revision": REV, "reviewer": "sports-science-concurrent-training-reviewer (project role, new session; see records[*].reviewer)",
          "gate": "R7A_RESIDUAL_AUTHORITY_SCIENTIFIC_RECHECK", "reviewDate": DATE,
          "freezeReviewed": {"revision": "R7A-RESIDUAL-AUTHORITY-FREEZE-1", "file": FREEZE_FILE, "fileSha256": FREEZE_SHA, "sourceDigest": FREEZE["sourceDigest"],
                             "manifestDigest": FREEZE["manifestDigest"], "policyHash": FREEZE["policyHash"], "runtimeCommit": "7d2da3603e224124696a2290766ec448080f3264",
                             "handoffCommit": "4917489364bb1138f8d82b46c20dd65d1bf693c7", "reviewBranch": "review/r7ara-residual-authority-ssctr"},
          "kind": "narrow regression recheck; no new sporting research", "authority": "PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY", "humanValidation": False,
          "empiricalProductValidation": False, "clinicalClearance": False, "runtimeSovereignty": False, "productTruthPublication": False, "recheckInvalid": "NO",
          "verdictLines": {"founder": "R7A_RESIDUAL_AUTHORITY_SCIENTIFIC_RECHECK = READY", "brief": "R7A_RESIDUAL_AUTHORITY_SSCTR_RECHECK = ACCEPT"},
          "rulings": {"F1": "VALID", "F2/HOLD": "VALID", "F3/MAINTAIN": "VALID", "F4": "VALID", "F4-X": "CLOSED", "EASY return factual ceiling": "HOLDS", "R7ARA-SELF-01": "CLOSED",
                      "E1-a": "ACCEPT_WITH_REASON", "E1-b": "ACCEPT_WITH_REASON", "E1-c": "ACCEPT_WITH_REASON", "E1-d": "ACCEPT", "E1-e": "ACCEPT", "E1-f": "ACCEPT_WITH_REASON",
                      "earned/eligible vs executed/tolerated": "ACCEPT_WITH_REASON", "short return after executed moderate re-entry week": "ACCEPT_WITH_REASON",
                      "consolidation long run (return to the executed 60)": "ACCEPT", "D53": "VALID", "D56": "VALID", "D57": "VALID", "D58": "VALID", "D59": "VALID",
                      "HOLD": "VALID", "MAINTAIN": "VALID"},
          "findings": [{"id": "NF-R7ARA-1", "blocking": False, "introducedByThisFreeze": True, "record": "R7ARA-SSCTR-CROSS-ENTRY-CAP", "backlog": "R48"}],
          "queueItemsFile": QUEUE_FILE, "records": records}
(HERE / "ssctr-r7ara-recheck.json").write_text(json.dumps(ruling, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(HERE / "ssctr-r7ara-queue-items.json").write_text(json.dumps(queue, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(json.dumps({"records": len(records), "queueItems": len(queue["items"]), "freezeSha256": FREEZE_SHA}))
