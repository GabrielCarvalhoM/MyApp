"""SSCTR R7ADA-SSCTR-r1 record builder (own). Writes, into this folder only:
  ssctr-r7ada-regression.json              the ruling of this regression review and its decision records (decision.schema.json 1.0.0);
  ssctr-r7ada-regression-queue-items.json  a proposal of funded-human queue items, one per prescriptive approval (the queue file is not edited).
Sources are copied verbatim from the R6 SSCTR records (audits/domain-coaching-r6-2026-10-26/reviews/ssctr-records.r12.json), whose read depth is
recorded there; no literature was searched in this review. Usage: python3 ssctr-r7ada-build.py
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
REV = "R7ADA-SSCTR-r1"
DATE = "2026-10-29"
QUEUE_FILE = "audits/domain-coaching-r7a-decision-authority-2026-10-29/reviews/ssctr-r7ada-regression-queue-items.json"
FREEZE = "CoachingCore/r7/decision-authority/RUNTIME_FREEZE_R7A_DECISION_AUTHORITY.json"


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


F = json.loads((ROOT / FREEZE).read_text(encoding="utf-8"))
FREEZE_SHA = sha(ROOT / FREEZE)
R6 = json.loads((ROOT / "audits/domain-coaching-r6-2026-10-26/reviews/ssctr-records.r12.json").read_text(encoding="utf-8"))
R6_RECORDS = R6 if isinstance(R6, list) else (R6.get("records") or R6.get("decisions"))
SOURCES = {}
for r in R6_RECORDS:
    for s in r["literature_snapshot"]["sources"]:
        SOURCES.setdefault(s["source_id"], s)


def src(*ids):
    return [json.loads(json.dumps(SOURCES[i])) for i in ids]


REVIEWER = {
    "actor_type": "AI_AGENT",
    "instance_id": ("ssctr-r7ada-regression-2026-10-29 (a fresh default Claude Code session started directly by the Founder for the single SSCTR "
                    "regression review of R7A-DECISION-AUTHORITY-FREEZE-1, acting in the project role by loading governance/agents/"
                    "sports-science-reviewer/CONSTITUTION.md (SSCTR-CONST-1.0.0), .agents/skills/sports-science-review/SKILL.md 1.0.0, registry.json "
                    "SSCTR-REG-1.0.0, decision.schema.json and .claude/agents/sports-science-concurrent-training-reviewer.md. The project agent type is "
                    "listed in this session but was not dispatched: the review was run by this session itself, labelled as the registry allows; no "
                    "delegation. It did not author the policy, the runtime, the decision authority contract or the tests)"),
    "human_credentials_claimed": False,
    "independent_of_target_author": True,
}
BINDING = (f"Binding: this record binds runtime R7A-DECISION-AUTHORITY-FREEZE-1 ({FREEZE}, sha256 {FREEZE_SHA}; source digest {F['sourceDigest']}; "
           f"manifest {F['manifestDigest']}; src/r6-adaptation.mjs {F['files']['src/r6-adaptation.mjs']}, src/r6-program.mjs "
           f"{F['files']['src/r6-program.mjs']}; runtime commit d4631cd03fb27bbc1857532500748476ab764987) at the unchanged policy R6-POLICY-5 "
           f"(canonical hash {F['policyHash']}). Any change to a bound file or to the policy hash expires it.")
SCOPE_COND = ("Scope: offline synthetic Node24 reference only, for the adult (18+) recreational nonclinical V1 population stated in "
              "PROGRAM_POLICY_R6.population. Missing current eligibility is ASK; pain, injury, illness, functional limitation or a clinical interruption "
              "reason is CLINICAL_HUMAN_REQUIRED with no substitute dose.")
POPULATION = ("Explicitly nonclinical eligible adult (18+) recreational novice-to-experienced hybrid runners/strength trainees in V1; offline synthetic "
              "Node24 reference only. No elite, adolescent, pregnancy/postpartum, frailty, rehabilitation or clinical-clearance extrapolation.")
COMMON_FACTS = [
    ("Integrity: R7A-DECISION-AUTHORITY-FREEZE-1 recomputed by my own instruments (canonical hash re-implemented in Python at the start and in Node "
     "at the end, ssctr-r7ada-digest.mjs): 85 of 85 bound files match at commits d4631cd and 5434b32 and in the worktree; 0 unbound src/test files; "
     "source digest 3a7166b2..., manifest a500cdd9..., policy file a75be1aa... (canonical 18ec48f3...). Commit 5434b32 changes only "
     "CURRENT_MISSION.md, MISSION_LEDGER.md and REVIEW_HANDOFF.md. verify-r7ada.mjs --tests read-only: 14/14, suite 663/663 (Node v24.19.0). "
     "Predecessor STATE-MODEL-CONSUMER-FREEZE-1 rebuilt from r7/decision-authority-closure-base (ffc1136) matches its MANIFEST (84/84, adab3716..., "
     "4f11f4b4...); the accepted STATE-EVIDENCE-FREEZE-1 copy checked (692483ce...). The live source digest stayed 3a7166b2... before and after every "
     "one of my 81 jobs (ssctr-r7ada-runs/RUNS.json)."),
    ("Kit: my 43 earlier instruments re-run unchanged on the frozen bytes reproduce the author's probes/kit-final 43/43 (labels and clocks aside); "
     "11/11 predecessor controls reproduce my R7ASC outputs; 38 are identical to the predecessor and 5 differ (changes, holdout-detail, "
     "r12-instrument, regression, x-trace-sd), the 5 the author named."),
]
LIT = {
    "as_of": DATE,
    "searches": [{
        "query": "none (literature not reopened)", "site": "not applicable", "searched_on": DATE,
        "purpose": ("R7ADA-SSCTR-r1 is regression only (Founder instruction for this review: do not reopen general sports research; brief §42). "
                    "Web search tools exist in this session but were deliberately not used."),
        "result_notes": ("No search run. Sources are copied verbatim from the R6 SSCTR records (r12), with the read depth recorded there; I did not "
                         "re-read them. The rulings are conformance to approved recipes, checked with my own probes."),
    }],
    "sources": [],
    "counterevidence_search": ("Counterevidence was sought by re-running my unchanged kit and R7ASC probes on the frozen runtime with predecessor "
                               "controls, by reproducing the author's kit run, and by new bounded probes (a 99-return walk/jog matrix, the walk/jog-to-"
                               "continuous boundary on two athletes, progression authority on two runners, a RETURN-mode control, an R6-H25 trace), each "
                               "run on this freeze, on STATE-MODEL-CONSUMER-FREEZE-1 and on STATE-EVIDENCE-FREEZE-1."),
}
GOV = lambda owner, action: {"gate_status": "NOT_CLOSED_BY_THIS_RECORD", "publication_status": "NOT_PUBLISHED", "human_validation": False,
                             "empirical_product_validation": False, "clinical_clearance": False, "next_owner": owner, "next_action": action}
EXPIRY = {
    "owner": "Chief / SSCTR",
    "review_by": "2027-04-29",
    "event_based_expiry": "Expires immediately on any policy hash change, any change to a file bound by R7A-DECISION-AUTHORITY-FREEZE-1, or a failed re-run of the probes this record cites.",
    "triggers": [
        "Any change to PROGRAM_POLICY_R6.json (new canonical hash).",
        "Any change to a file listed in RUNTIME_FREEZE_R7A_DECISION_AUTHORITY.json (new freeze revision).",
        "A correction of F4-X (the walk/jog exit return): a new freeze needs this regression check again on ssctr-r7ada-continuous-probe.mjs, the walk/jog matrix, my 12-cell R7ASC walk/jog probe and the kit grids.",
        "A Founder decision on R1 (the standing projection between re-plans).",
        "A new systematic review or meta-analysis on detraining, retraining or return after a break.",
    ],
}


def ae(*answers):
    return {"applicable": True, "answers": [{"question_number": i + 1, "answer": a} for i, a in enumerate(answers)], "not_applicable_reason": None}


def record(review_id, question, items, rule_ids, facts, unknowns, sources, claims, status, applicability, disposition, action, decision, confidence,
           limitations, answers, owner, next_action, approved):
    lit = json.loads(json.dumps(LIT))
    lit["sources"] = sources
    return {
        "schema_version": "1.0.0", "review_id": review_id, "review_revision": REV, "review_date": DATE,
        "agent_version": "SSCTR-1.0.0", "constitution_revision": "SSCTR-CONST-1.0.0", "protocol_revision": "SSCTR-EP-1.0.0",
        "reviewer": REVIEWER,
        "target": {"project": "MyApp / Vilumo Fit", "artifact": FREEZE, "artifact_revision": "R7A-DECISION-AUTHORITY-FREEZE-1", "sha256": FREEZE_SHA, "rule_ids": rule_ids},
        "question": question,
        "population_context": {"population": POPULATION, "eligibility_status": "SCOPE_DEFINITION_ONLY", "facts": COMMON_FACTS + facts, "unknowns": unknowns},
        "scope": {"gate": "G02", "item_ids": items, "prescriptive_impact": True, "whole_gate_closure": False},
        "literature_snapshot": lit, "claims": claims, "evidence_status": status, "applicability": applicability,
        "disposition": disposition, "proposed_action": action, "decision": decision, "confidence": confidence, "limitations": limitations,
        "ae_review": ae(*answers), "governance": GOV(owner, next_action), "expiry": EXPIRY,
        "human_revalidation": {"state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION", "queue_ref": f"{QUEUE_FILE}#HQ-{review_id}", "human_review": None} if approved
        else {"state": "NOT_APPROVED_PRESCRIPTIVE_DECISION", "queue_ref": None, "human_review": None},
        "supersedes": None, "dependent_items": [],
    }


def claim(cid, statement, basis, role, status, source_ids, applicability, limitations, counterevidence):
    return {"claim_id": cid, "statement": statement, "basis": basis, "role": role, "evidence_status": status, "source_ids": source_ids,
            "applicability": applicability, "limitations": limitations, "counterevidence": counterevidence}


SYN = ["Synthetic timelines only; no real athlete, product data, human or empirical validation."]
RECORDS = []

# ---------------- F4-X: the walk/jog exit return ----------------
RECORDS.append(record(
    "R7ADA-SSCTR-WALKJOG-EXIT-RETURN",
    ("Brief item 12, inside F4: with the last factual tolerated session a walk/jog step and continuous running next on the ladder, does a return "
     "after a pause treat continuous running as already tolerated? (Founder §19-§20 and contract C' W2/P6: return entry <= factual tolerated walk/jog "
     "step; a step the evidence released but the athlete never ran is not tolerated yet.)"),
    ["F4", "F4-X (walk/jog exit boundary)", "contract C' W2/P6", "R6-NONCLINICAL-RETURN SHORT and MODERATE conditions"],
    ["advanceRun WALK_JOG exit (walkStep >= ladder length -> mode EASY at walkJogExit.easyMinutes)",
     "historicalRun / stateAtBreak (caps the walk/jog step at the step last run only while the state's mode is WALK_JOG)",
     "returnAfterPause (SHORT resumes the state at the break; MODERATE turns an EASY state into RETURN; LONG turns it into RESTART)",
     "R6-NONCLINICAL-RETURN (SHORT: resume the last executed doses, the next step waits for executed sessions; MODERATE: conditional steps to the prior executed dose)",
     "DECISION_AUTHORITY_CONTRACT R7ADA-CONTRACT-1 C' (W1, W2, P6, P7)"],
    [("Boundary probe (ssctr-r7ada-continuous-probe.mjs; two athletes: TOP5, a non-novice starting the ladder at step 5, exit in a CONSOLIDATION "
      "week; FULL, the fixture novice from step 0, exit in a DEVELOPMENT week; walk/jog Mon/Wed/Fri). Exit earned (the step-8 week, 1 x 20 min jog, "
      "executed and reviewed, or complete and unreviewed), pause from Monday of the exit week before any continuous run: SHORT resumes three "
      "25-minute continuous easy runs a week (EASY 25 x 3 + 2 walks; longest continuous run executed 20 min; jogging 75 against 60 min a week); "
      "MODERATE enters RETURN with continuous runs on all five chosen days (5 x 15 then 5 x 20 min: 75 then 100 min a week against the largest "
      "executed week, 3 sessions / 60 min); LONG enters RESTART at 15-minute continuous runs (the walk/jog LONG recipe restarts the ladder at step 0). "
      "Identical on STATE-MODEL-CONSUMER-FREEZE-1 and on STATE-EVIDENCE-FREEZE-1: not introduced by this freeze."),
     ("Same boundary when the exit is only projected (the step-8 week not executed): this freeze returns at the step last run (SHORT 7, MODERATE 6, "
      "LONG 0) on both athletes; the predecessor and STATE-EVIDENCE-FREEZE-1 return one step above (8 and 7). A pause that begins inside the last "
      "ladder week (Saturday, after the third step-8 session) returns at step 8 on all trees; one day later (Monday of the exit week) it returns at "
      "the exit dose: a one-day cliff, the signature of an uncovered boundary, not of a policy choice. A continuous run executed before the pause "
      "(P7) correctly makes the exit dose the return base.")],
    ["How often athletes pause in the exit week before their first continuous run.", "No real athlete or product data."],
    src("R6-S02"),
    [claim("WX-1", "On this freeze a return whose pause begins in the walk/jog exit week, before any continuous run, resumes continuous running at the exit dose (SHORT) or as RETURN/RESTART continuous runs (MODERATE, LONG) while the last session run was the step-8 walk/jog session.",
           "OBSERVED", "CONTEXT", "SUPPORTED_WITH_LIMITS", [], "Walk/jog athletes completing the ladder (zero, unknown or low running exposure at intake).", SYN,
           ["A pause beginning inside the last ladder week, or after one continuous run, returns correctly."]),
     claim("WX-2", "The approved recipe says a SHORT return resumes the last executed doses and the next step waits for executed sessions, a MODERATE return steps conditionally to the prior executed dose, and this contract's W2 says a step the evidence released but the athlete never ran is not tolerated yet; the exit is the ladder's next step after step 8.",
           "DECIDED", "CONTEXT", "SUPPORTED_WITH_LIMITS", [], "Policy conformance (R6-SSCTR-NONCLINICAL-RETURN r12 conditions; R7ADA-CONTRACT-1 C').",
           ["A governance reading of approved rules, not new evidence."],
           ["The single-run ceiling (operational.run.singleRunCeiling) explicitly bounds WALK_JOG->EASY transitions and return steps at the 30-day longest run plus one step, and 25 = 20 + 5 meets it; it is a ceiling, not an exception to the return recipe."]),
     claim("WX-3", "A first-week-back prescription of three 25-minute continuous runs when the longest run in the preceding 30 days is the 20-minute step-8 jog is a single-session increase of about 25% over the 30-day longest run, the band (>10-30%) a 5,200-runner cohort associated with higher overuse-injury rates (R6-S02); the policy itself only allows such a step response-gated and disclosed, which a return after a break is not.",
           "INFERRED", "DECISION_SUPPORT", "SUPPORTED_WITH_LIMITS", ["R6-S02"], "Recreational adult runners; applied here to runners just off the walk/jog ladder.",
           ["Observational, distance-based cohort of experienced recreational runners, not novices; association, not causation."],
           ["Weekly progression metrics showed no association with injury in the same cohort."]),
     claim("WX-4", "Whether the MODERATE path's frequency increase (continuous runs on five days where the athlete ran three) harms novices is not established by any source I hold.",
           "INFERRED", "OPEN_QUESTION", "PLAUSIBLE_BUT_UNCERTAIN", ["R6-S02"], "MODERATE returns of walk/jog athletes at the exit.",
           ["Single-session durations stay at or below the longest continuous run executed (15 and 20 min against 20)."],
           ["R6-S02 found no association for week-to-week ratios."])],
    "SUPPORTED_WITH_LIMITS",
    "Walk/jog athletes whose pause begins in the exit week before their first continuous run; SHORT carries the material part, MODERATE and LONG the recipe part.",
    "REVISE", "MODIFY_CANDIDATE",
    {"rationale": ("F4 is closed inside the ladder (my 12-cell probe 0/12, predecessor 10/12; my 99-return matrix 0/99, predecessor 29/99, "
                   "STATE-EVIDENCE-FREEZE-1 4/99; the essential case 'step A tolerated, step B only projected' closed). At the ladder's last transition "
                   "it is not: W2 caps the walk/jog step only while the state's mode is WALK_JOG, so a released but never-run exit (mode EASY) passes "
                   "through and the return treats continuous running as already tolerated. Pre-existing (identical on the predecessor and on "
                   "STATE-EVIDENCE-FREEZE-1), not introduced by this freeze, and inside the F4 scope the Founder set (§20 matrix 'transition to "
                   "continuous running'; brief item 12)."),
     "preserve": ["W1 and W2 for every ladder step, the projected-only boundary fix and P7 (a continuous run executed makes the exit the return base).",
                  "The walk/jog SHORT, MODERATE and LONG recipes and the single-run ceiling."],
     "modify": [("Recommendation R46 (not implemented here): extend W2 to the ladder exit. When the run state left WALK_JOG through walkJogExit and no "
                 "continuous run of that state has been executed (P7), the state a return reads is the walk/jog state at the step of the last walk/jog "
                 "session executed; SHORT then resumes step 8, MODERATE step 7 and LONG step 0. Re-run ssctr-r7ada-continuous-probe.mjs (expect "
                 "ladderView 0 in every EXIT_EARNED cell, ONE_CONTINUOUS_RUN and the cross-week cells unchanged), the walk/jog matrix (0/99), my "
                 "12-cell walk/jog probe (0/12) and the kit grids.")],
     "mec_change_level": "One condition in the state a return reads (historicalRun in stateAtBreak); no new policy, no state-model change.",
     "trade_off": "A walk/jog athlete pausing in the exit week repeats the last ladder step for one executed week before the exit, the cost of the approved 'next step waits for executed sessions'.",
     "must_not": ["Must not return a walk/jog athlete above the step last run, the exit included, unless a continuous run of the exit was executed.",
                  "Must not withdraw walk/jog from V1 or weaken W1/W2 to close this."],
     "conditions": [SCOPE_COND, BINDING]},
    {"level": "MODERATE", "rationale": "The rule departure is certain and reproduced on two athletes and three trees; the physiological size is inferred from one observational cohort and the policy's own ceiling semantics."},
    ["One probe family on synthetic athletes; the MODERATE frequency harm is uncertain."],
    ["The exit dose is adequate only after the exit is run; before that the last walk/jog step is the tolerated dose.",
     "Yes: the ledger shows the last session run (step 8) and no continuous run; the return reads the released exit.",
     "KEEP of the current behavior is not defensible against the approved SHORT recipe.",
     "A change is necessary relative to the approved recipe and to W2's own wording.",
     "One condition in the return's state reading (R46).",
     "Smaller options (documenting the boundary, relying on the single-run ceiling) leave a return above the step last run.",
     "It protects the walk/jog progression: the exit follows one executed week after the return.",
     "Supported with limits (R6-S02) for the SHORT single-session increase; the MODERATE frequency harm is uncertain.",
     "The size of harm for novices; the frequency of the case.",
     "No ASK or clinical route: nonclinical pause, eligibility confirmed in the probes."],
    "Founder / Chief, then the runtime author with the engineering judge",
    "Record F4-X as the reason F4 is not fully closed; a correction needs a new freeze and this regression check again.",
    False))

# ---------------- NF-R7ADA-2: RETURN-mode walk days ----------------
RECORDS.append(record(
    "R7ADA-SSCTR-RETURN-WALK-DAYS",
    "Does a MODERATE return (RETURN mode) keep the prior executed weekly structure when the athlete's plan holds walk days?",
    ["NF-R7ADA-2", "R6-NONCLINICAL-RETURN MODERATE condition", "return/restoration (weekly structure)"],
    ["r6-program.mjs distributeRun (RETURN: every chosen run day becomes an easy or long run; row.walks is not applied)",
     "r6-program.mjs runRow (RETURN row carries walks from returnTo)",
     "R6-NONCLINICAL-RETURN (MODERATE: conditional steps to the prior executed dose)"],
    [("Control (ssctr-r7ada-returnwalks-probe.mjs): a NOVICE EASY_LOW runner, 50 min a week on 2 days, five chosen run days, so the plan holds 3 runs "
      "and 2 walks (50 min a week executed in weeks 0-2). After a 14-day break the two RETURN weeks prescribe 5 runs / 80 min each, then 3 runs and "
      "2 walks / 55 min. Identical on this freeze, its predecessor and STATE-EVIDENCE-FREEZE-1. At the walk/jog exit the same mechanism gives "
      "5 x 15 then 5 x 20 min (see R7ADA-SSCTR-WALKJOG-EXIT-RETURN).")],
    ["Whether any athlete without walk days is affected (no: the mechanism needs walks > 0)."],
    src("R6-S02"),
    [claim("RW-1", "RETURN weeks turn the plan's walk days into runs: the running sessions and weekly running minutes of the return steps exceed the largest executed week and the week planned before the break.",
           "OBSERVED", "CONTEXT", "SUPPORTED_WITH_LIMITS", [], "Athletes whose easy-run plan holds walk days (low weekly minutes for the chosen days).", SYN,
           ["Each session stays at or below the prior session dose (15-minute entry)."]),
     claim("RW-2", "Whether a frequency increase at short session durations raises injury risk is uncertain: the cohort I hold associates single-session spikes, not weekly ratios, with injury.",
           "INFERRED", "OPEN_QUESTION", "PLAUSIBLE_BUT_UNCERTAIN", ["R6-S02"], "Recreational runners.",
           ["Observational; distance-based."], ["Weekly progression metrics showed no association with injury."])],
    "PLAUSIBLE_BUT_UNCERTAIN",
    "Moderate returns of runners whose plan holds walk days.",
    "REVISE", "MODIFY_CANDIDATE",
    {"rationale": ("A recipe-conformance gap in return/restoration ('conditional steps to the prior executed dose'), pre-existing and outside this "
                   "freeze's delta and outside F4 except at the exit. Non-blocking under the finite gate (not a regression); sporting harm uncertain."),
     "preserve": ["The RETURN entry and step durations (each within the prior session dose and the single-run ceiling)."],
     "modify": ["Recommendation R47 (backlog, policy owner + SSCTR): RETURN weeks keep the prior executed weekly structure (walk days stay walks; running sessions never above the prior executed count)."],
     "mec_change_level": "One condition in distributeRun's RETURN branch, after a policy statement; no state change.",
     "trade_off": "Fewer return sessions; the return's weekly dose then never exceeds the dose it returns to.",
     "must_not": ["Must not be closed by lowering session durations below the approved entry."],
     "conditions": [SCOPE_COND, BINDING, "Non-blocking for R7A-DECISION-AUTHORITY-FREEZE-1 (pre-existing, unchanged by this freeze)."]},
    {"level": "MODERATE", "rationale": "The mechanism is reproduced on three trees; the harm is uncertain."},
    ["One control athlete; no frequency-specific evidence."],
    ["The return steps are adequate per session; the weekly structure is not the prior one.", "Yes: the executed weeks show 3 runs and 2 walks.",
     "KEEP is defensible short term (no single-session spike); conformance argues for the change.", "Relative to the recipe, yes; relative to harm, uncertain.",
     "Keep walks in RETURN weeks (R47).", "Lowering durations would undercut the approved entry.", "Protects the return's conditional steps.",
     "Plausible but uncertain.", "Harm size; how many athletes hold walk days.", "No ASK or clinical route."],
    "Policy owner / SSCTR (backlog)",
    "Backlog item; not blocking this freeze.",
    False))

# ---------------- R2: a mid-week return holds its first week ----------------
RECORDS.append(record(
    "R7ADA-SSCTR-R2-MIDWEEK-RETURN",
    ("R2: under E7 resolved most-restrictive-first (C3), a moderate return reported mid-week whose remaining sessions were all executed repeats RETURN "
     "step 0 the next week (the rows planned inside the declared pause hold the EASY gate). Legitimate application of E7 and of the prior-tolerated-"
     "dose principle, or material under-dosing?"),
    ["R2", "SSCTR E7", "contract C3", "R6-NONCLINICAL-RETURN MODERATE condition"],
    ["r6-adaptation.mjs weeklyGates (setGate: the most restrictive verdict per key, GATE_ORDER)",
     "r6-adaptation.mjs evidenceState PLAN reading (E7 for a return's own week)", "r6-program.mjs advanceRun RETURN"],
    [("My R7ASC temporal probe on this freeze: a 15-day break reported Thursday 07:00 of week 6; Thursday's easy 15 and Sunday's long 20 executed. "
      "Week 7 repeats step 0 (easy 15, 15, long 20); week 8 step 1 (easy 30, 30, long 45); history credits step 1 from Sunday 22:00 (C5). The "
      "prior executed doses were easy 45 and long 70.")],
    ["Whether athletes perceive the extra entry week as under-dosing."],
    src("R6-S21", "R6-S19"),
    [claim("R2-1", "Return steps are conditional on executed comparable work (R6-S21; R6 PP-7) and fitness declines with cessation (R6-S19): holding the entry dose for one complete week when the return's own week had only two of its sessions after the return is a bounded, conservative application of the approved conditional steps; the next step follows one executed week later and nothing earned is lost.",
           "INFERRED", "DECISION_SUPPORT", "SUPPORTED_WITH_LIMITS", ["R6-S21", "R6-S19"], "Moderate (11-28 day) nonclinical returns reported mid-week.",
           ["Neither source sizes return steps; the step size (entry -> step 1 doubles easy minutes) is the policy's own."],
           ["Predefined progression was also effective in R6-S21; a one-week delay has negligible fitness cost either way."]),
     claim("R2-2", "Without the hold, step 1 would follow two short entry sessions (15 and 20 minutes) with easy runs doubling to 30 and the long run to 45 minutes.",
           "OBSERVED", "CONTEXT", "SUPPORTED_WITH_LIMITS", [], "This probe and P05's control cell as the author describes it.", SYN,
           ["The single-run ceiling would still bound each run."])],
    "SUPPORTED_WITH_LIMITS",
    "Mid-week moderate returns whose return week contains rows planned inside the declared pause.",
    "APPROVE_WITH_CONDITIONS", "KEEP",
    {"rationale": "ACCEPT_WITH_REASON: a legitimate E7 + C3 (fail closed) consequence; not material under-dosing: one extra week at the entry dose, after a partial entry week, with history crediting what was executed.",
     "preserve": ["E7 for the planner's review of a return's own week; C3 most-restrictive-first; C5 for HistoricalState."],
     "modify": [],
     "mec_change_level": "None: a reading of approved rules.",
     "trade_off": "One more entry week in exchange for a complete executed entry week before the dose doubles.",
     "must_not": ["Must not hold the entry dose for more than one additional week on this ground.", "Must not drop the executed sessions from history."],
     "conditions": [SCOPE_COND, BINDING,
                    "Applies only when the return's own week holds rows planned inside the declared pause; the entry repeats at most one additional week; history keeps crediting the executed sessions (C5).",
                    "An exception for rows inside the declared pause would be new policy (a one-condition change in weeklyGates) and needs a policy decision; it is not required for safety."]},
    {"level": "MODERATE", "rationale": "The behavior is bounded and conservative; the step size it guards is the policy's own."},
    ["Two probes; synthetic."],
    ["Yes: the entry dose is adequate for a first full week back.", "Yes: two executed entry sessions after an 11-28 day break.",
     "KEEP (one more entry week) is defensible.", "No larger change is needed.", "None beyond the approved gate.",
     "Stepping to step 1 after a partial week doubles the session doses on two exposures.", "It protects the conditional return.",
     "Supported with limits (R6-S21, R6-S19).", "Perceived under-dosing.", "No ASK or clinical route."],
    "Chief", "Record with this review; queue proposal only.", True))

# ---------------- R3: plan and history after a return week ----------------
RECORDS.append(record(
    "R7ADA-SSCTR-R3-PLAN-HISTORY",
    ("R3: after a return week the planner (E7) and HistoricalState (C5) may differ (kit 'changes', A_E6, SHORT: the bench released at 20 kg one week "
     "earlier than on the predecessor; regain caps held a week longer). Does the divergence produce a materially wrong prescription?"),
    ["R3", "SSCTR E7", "C5", "D56"],
    ["r6-adaptation.mjs evidenceState PLAN reading (E7) and HISTORY reading (C5)", "r6-program.mjs advanceStrength (load tick), regain caps (D56)"],
    [("My kit 'changes' run (A_E6, every reduction variant, SHORT second break): after the return the bench stays at 18 kg (3 x 6) through the "
      "rest of the return week, a regain-capped week (2 x 6) and a full week (3 x 6), then 20 kg (week 9; predecessor week 10). In the reduced "
      "variants the regain caps hold one week longer (2 x 6 where the predecessor gave 3 x 6) and the back squat 2 -> 3 sets (predecessor 4). No row "
      "exceeds the last executed set count or a dose the athlete has not executed at the full count.")],
    ["None material for the ruling."],
    src("R6-S01", "R6-S11"),
    [claim("R3-1", "Load progression proceeds from the load lifted at target and reserve after executed exposures (R6-S01, R6-S11; R6 PP-8): a 2 kg step after a full executed week at 18 kg, preceded by two earlier executed exposures at that load after the return, is earned progression.",
           "INFERRED", "DECISION_SUPPORT", "SUPPORTED_WITH_LIMITS", ["R6-S01", "R6-S11"], "Known-load exercises after a short return.",
           ["Neither source sets a tick count; the count is the policy's own."], ["The predecessor's extra week is also defensible; neither is wrong."]),
     claim("R3-2", "The regain caps hold one week longer, which is the conservative side of D56 (a cap rises only after a whole week).",
           "OBSERVED", "CONTEXT", "SUPPORTED_WITH_LIMITS", [], "Reduced return weeks (systemic fatigue, unavailable day, equipment window).", SYN,
           ["One more capped week for those athletes."])],
    "SUPPORTED_WITH_LIMITS",
    "Short returns after a week inside a return; strength rows.",
    "APPROVE_WITH_CONDITIONS", "KEEP",
    {"rationale": "The divergence is approved by design (E7 for the planner, C5 for history) and produces coherent prescriptions: no dose above the executed one, the release earned by a full executed week, caps and ceilings respected (more conservative on regain caps).",
     "preserve": ["E7 and C5 as approved; D56; the return ceiling (the last executed dose)."],
     "modify": [],
     "mec_change_level": "None: a reading of approved rules.",
     "trade_off": "One week earlier load release (earned) and one week longer regain caps (conservative).",
     "must_not": ["Must not release a load before a full executed week at the prior load after the return.", "Must not let a regain cap rise after a non-whole week."],
     "conditions": [SCOPE_COND, BINDING]},
    {"level": "HIGH", "rationale": "Every differing row was inspected; both directions are within the approved rules."},
    ["Synthetic; one kit family."],
    ["Yes.", "Yes: executed exposures at 18 kg.", "KEEP is defensible.", "No change needed.", "None.", "Not applicable: no change proposed.",
     "Yes: progression and restoration both follow executed work.", "Supported with limits (R6-S01, R6-S11).", "None material.", "No."],
    "Chief", "Record with this review; queue proposal only.", True))

# ---------------- R6-H35: quality without evidence ----------------
RECORDS.append(record(
    "R7ADA-SSCTR-H35-QUALITY-EVIDENCE",
    "R6-H35: weeks 0-3 are never reported, so QUALITY is not unlocked and the corpus's week-5 quality fact matches no session (a runner error). Without evidence of execution, is it correct not to release QUALITY?",
    ["R6-H35", "QE-R7ASC-02", "Founder decision 1.2", "R6-SSCTR-RUN-QUALITY RQ-5"],
    ["r6-adaptation.mjs planningBase (the run from the PLAN reading in every mode; E10 withdrawn)", "r6-program.mjs runRow (qualityActive on executed established easy weeks)"],
    [("My holdout-detail control: with the case exactly as the corpus states it (weeks 0-3 unreported) this freeze withholds QUALITY and the corpus "
      "fact fails to resolve; with the same intake and steps but weeks 0-3 executed and reviewed (full record) the case runs without error and its "
      "6 programs are identical to STATE-EVIDENCE-FREEZE-1's and to the predecessor's. My progression probe: no QUALITY, strides or threshold step "
      "without executed established easy weeks on this freeze (0 of 30 decisions; predecessor 4 flags).")],
    ["None material for the ruling."],
    src("R6-S21", "R6-S22"),
    [claim("H35-1", "Quality and strides unlock on executed established easy weeks (R6-S21, R6-S22; R6 RQ-5); four unreported weeks carry no evidence, so not releasing QUALITY is the approved rule, and Founder decision 1.2 forbids releasing it without sufficient execution.",
           "INFERRED", "DECISION_SUPPORT", "SUPPORTED_WITH_LIMITS", ["R6-S21", "R6-S22"], "Recreational runners without a current familiar quality task.",
           ["The sources support adding quality to an executed aerobic base; the two-week count is the policy's own."],
           ["The athlete may in fact have trained; the system cannot know."])],
    "SUPPORTED_WITH_LIMITS",
    "Holdout and real use alike: unreported weeks earn nothing.",
    "APPROVE_WITH_CONDITIONS", "KEEP",
    {"rationale": "EXPECTED_CORRECTION: the predecessor credited unreported weeks from the projection; this freeze applies the approved unlock rule. The runner error is the corpus's expectation, not a runtime defect.",
     "preserve": ["Quality and strides unlock on executed established easy weeks; the case recorded, never dropped."],
     "modify": ["Backlog: re-express R6-H35 with its early weeks reported (or read it with the full-record control) so it keeps exercising athlete learning."],
     "mec_change_level": "None in the runtime.",
     "trade_off": "Quality starts after evidence; a trained-but-silent athlete waits up to two weeks.",
     "must_not": ["Must not restore the predecessor behavior to keep the corpus identical."],
     "conditions": [SCOPE_COND, BINDING]},
    {"level": "HIGH", "rationale": "Binding Founder decision, approved rule, and a full-record control that restores the case exactly."},
    ["One corpus case plus two controls."],
    ["Yes: the plan stays adequate without quality until evidence exists.", "No: four unreported weeks.", "KEEP is defensible.",
     "No change needed.", "None.", "Releasing quality by calendar breaks decision 1.2.", "Yes: progression follows execution.",
     "Supported with limits.", "Whether the athlete trained.", "No."],
    "Chief", "Record with this review; queue proposal only.", True))

# ---------------- The review as a whole ----------------
RECORDS.append(record(
    "R7ADA-SSCTR-DECISION-AUTHORITY",
    "Does R7A-DECISION-AUTHORITY-FREEZE-1 close F4 and keep F1, F2, F3, D53, D56, D57, D58, D59, HOLD, MAINTAIN, return/restoration and evidence-based progression within the approved policies (Founder §42; my brief items 1-20)?",
    ["F1", "F2", "F3", "F4", "D53", "D56", "D57", "D58", "D59", "HOLD", "MAINTAIN", "return/restoration", "evidence-based progression"],
    ["DECISION_AUTHORITY_CONTRACT R7ADA-CONTRACT-1 (A, B, C, C')", "r6-adaptation.mjs and r6-program.mjs as frozen"],
    [("Preserved: F1 (restoration grid B = C = 0 of 864 timelines, U = 237 unchanged; caps B = 0, 0 covered jumps, 0 unexplained; trace-b and "
      "trace-b2 identical; the temporal probe now credits a return's run step only after its runs are executed); F2/HOLD (240 HOLD cases, 0 "
      "raises, identical; Founder example 82.5 x 3 on the line 82.5 x 5 -> 82.5 x 5, tick unchanged); F3/MAINTAIN (393 rows, 0 outside 8-8, "
      "Founder example 70 x 10 / projection 70 x 12 -> 70 x 8; trace-h25 identical); D53 (grid; r12-instrument V_D47reviews now equals its "
      "approved record), D56 (0 cap rises or ends after a non-whole week of 4,181), D57 (caps grids), D58 (0/315), D59 (E = O = B = 0); "
      "progression authority (0 of 30 decisions with quality, strides, threshold or long run unearned; predecessor 4)."),
     ("F4: closed inside the ladder (12-cell probe 0/12, predecessor 10/12; 99-return matrix 0/99, predecessor 29/99; the author's F4/P6/P7 tests "
      "fail on the predecessor runtime and pass here); not closed at the walk/jog exit (R7ADA-SSCTR-WALKJOG-EXIT-RETURN, F4-X).")],
    ["No real athlete or product data."],
    src("R6-S21"),
    [claim("DA-1", "Every preserved item reproduces on my instruments, and F4 is closed except at the walk/jog exit boundary (F4-X).",
           "OBSERVED", "CONTEXT", "SUPPORTED_WITH_LIMITS", [], "This freeze and its two controls.", SYN, ["F4-X is pre-existing, not introduced."]),
     claim("DA-2", "Steps follow executed comparable work in every run dimension on this freeze (R6-S21; R6 PP-7); the walk/jog exit after a pause is the one return path where a released, never-run step is still treated as tolerated.",
           "INFERRED", "CONTEXT", "SUPPORTED_WITH_LIMITS", ["R6-S21"], "Run progression and returns.", ["Synthetic."], ["None beyond F4-X."])],
    "SUPPORTED_WITH_LIMITS",
    "The finite gate of this regression review.",
    "REVISE", "MODIFY_CANDIDATE",
    {"rationale": "NOT_READY: the READY conditions require F4 closed; F4-X shows the F4 property failing at the walk/jog exit, a boundary the Founder placed inside F4. Every other condition of the gate is met.",
     "preserve": ["Contracts A, B, C and C' as frozen; F1-F3, D53, D56-D59, HOLD, MAINTAIN, progression authority."],
     "modify": ["R46 (F4-X) only; R47 (RETURN walk days) is backlog."],
     "mec_change_level": "One condition (R46).",
     "trade_off": "One more freeze cycle for one boundary condition.",
     "must_not": ["Must not reopen HOLD, MAINTAIN, O-1, R41 or the general literature to close F4-X."],
     "conditions": [SCOPE_COND, BINDING]},
    {"level": "MODERATE", "rationale": "Instruments reproduce independently; the materiality of F4-X rests on the approved recipe and one observational cohort."},
    ["Regression only; synthetic."],
    ["Yes, except the walk/jog exit return.", "Yes.", "Not for F4-X.", "Yes, R46.", "One condition.", "None smaller closes F4-X.",
     "Yes.", "Supported with limits.", "F4-X harm size.", "No."],
    "Chief / Founder", "Record NOT_READY with the engineering review; decide the F4-X correction.", False))

QUEUE_ITEMS = [{
    "queue_id": f"HQ-{r['review_id']}", "decision_id": r["review_id"], "decision_revision": REV,
    "target": {k: r["target"][k] for k in ("project", "artifact", "artifact_revision", "sha256", "rule_ids")},
    "approved_scope": r["applicability"], "conditions": r["decision"]["conditions"], "approval_date": DATE,
    "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION", "owner": "Future qualified human reviewer (funding NOT_DECLARED)", "human_review": None,
    "re_review_triggers": r["expiry"]["triggers"],
} for r in RECORDS if r["disposition"] in ("APPROVE", "APPROVE_WITH_CONDITIONS")]
QUEUE = {"revision": "R7ADA-SSCTR-QUEUE-PROPOSAL-r1", "reviewRevision": REV, "destination": "reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json",
         "note": ("Proposal only: one item per prescriptive approval of R7ADA-SSCTR-r1, each bound to R7A-DECISION-AUTHORITY-FREEZE-1, a freeze this "
                  "review finds NOT_READY (F4-X). The queue file was not edited; the Chief decides whether to integrate them append-only. Funding NOT_DECLARED."),
         "funding_trigger": {"state": "NOT_DECLARED", "declaration_ref": None, "declared_at": None}, "preserveAllHistoricalEntries": True, "items": QUEUE_ITEMS}

RULING = {
    "revision": REV, "reviewer": "sports-science-concurrent-training-reviewer (project role, fresh default session; see records[*].reviewer)",
    "gate": "R7A_DECISION_AUTHORITY_SCIENTIFIC_REGRESSION", "reviewDate": DATE,
    "freezeReviewed": {"revision": "R7A-DECISION-AUTHORITY-FREEZE-1", "file": FREEZE, "fileSha256": FREEZE_SHA, "sourceDigest": F["sourceDigest"],
                       "manifestDigest": F["manifestDigest"], "policyHash": F["policyHash"], "runtimeCommit": "d4631cd03fb27bbc1857532500748476ab764987",
                       "handoffCommit": "5434b3265f5634d1e7c796426cd9d8415b3b1af2", "reviewBranch": "review/r7ada-decision-authority-ssctr"},
    "kind": "regression only; no new sporting research", "authority": "PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY",
    "humanValidation": False, "empiricalProductValidation": False, "clinicalClearance": False, "runtimeSovereignty": False, "productTruthPublication": False,
    "reviewInvalid": "NO",
    "verdictLines": {"founder": "R7A_DECISION_AUTHORITY_SCIENTIFIC_REGRESSION = NOT_READY", "brief": "R7A_DECISION_AUTHORITY_SSCTR_REGRESSION_REVIEW = NOT_READY"},
    "rulings": {
        "F1": "CLOSED (preserved)", "F2": "CLOSED (preserved)", "F3": "CLOSED (preserved)",
        "F4": "NOT FULLY CLOSED: closed inside the ladder; open at the walk/jog exit (F4-X)",
        "D53": "VALID", "D56": "VALID", "D57": "VALID", "D58": "VALID", "D59": "VALID",
        "HOLD": "COHERENT", "MAINTAIN": "COHERENT",
        "R2": "ACCEPT_WITH_REASON", "R3": "ACCEPT_WITH_REASON (no materially wrong prescription)", "R6-H35": "EXPECTED_CORRECTION",
        "progressionAuthority": "CONFIRMED (projected != earned; partial execution follows the existing per-dimension gates)",
        "approvedWithReasonDifferences": "PRESERVED (accessories 7 -> 6 in returns; return base reps)",
        "O-1": "OUTSIDE THE GATE (maxSets not a hard constraint on that path: 3 sets on both trees)", "R41": "NON-BLOCKING, not expanded",
        "R1": "Founder-owned; recorded where observed, not ruled",
    },
    "findings": {
        "F4-X": {"blocking": True, "introducedByThisFreeze": False, "presentOn": ["STATE-MODEL-CONSUMER-FREEZE-1", "STATE-EVIDENCE-FREEZE-1"], "record": "R7ADA-SSCTR-WALKJOG-EXIT-RETURN", "recommendation": "R46"},
        "NF-R7ADA-2": {"blocking": False, "introducedByThisFreeze": False, "presentOn": ["STATE-MODEL-CONSUMER-FREEZE-1", "STATE-EVIDENCE-FREEZE-1"], "record": "R7ADA-SSCTR-RETURN-WALK-DAYS", "recommendation": "R47 (backlog)"},
    },
    "queueItemsFile": QUEUE_FILE, "records": RECORDS,
}

(HERE / "ssctr-r7ada-regression.json").write_text(json.dumps(RULING, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(HERE / "ssctr-r7ada-regression-queue-items.json").write_text(json.dumps(QUEUE, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(json.dumps({"records": len(RECORDS), "queueItems": len(QUEUE_ITEMS), "freezeSha256": FREEZE_SHA}))
