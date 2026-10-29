"""Emit independent review records only after substantive judge review of frozen targets."""
import copy
import hashlib
import importlib.util
import json
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path.home() / "AppData/Local/Temp/vilumo-sports-review-validation-deps"))
import jsonschema

ROOT = Path(__file__).resolve().parents[4]
BASE = ROOT / "reviews/sports-domain-closure/2026-10-23"
OUT = BASE / "reviews"
MANIFEST = ROOT / "audits/sports-domain-closure-2026-10-23/REVIEW_MANIFEST.json"
EXPECTED_MANIFEST = "39bc280225288fb6bf631c2e1de91e0c3541459faf3bef74ac689c7d6d69b5fe"

def read(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

assert digest(MANIFEST) == EXPECTED_MANIFEST
manifest = read(MANIFEST)
for item in manifest["files"]:
    assert digest(ROOT / item["path"]) == item["sha256"], item["path"]
precheck = read(BASE / "PRE_REVIEW_VERIFICATION.json")
assert precheck["total"] == precheck["passed"] == 1105 and precheck["failed"] == 0

g01 = read(BASE / "scientific/G01_COVERAGE_MATRIX.json")
g02 = read(BASE / "scientific/G02_POLICY_REGISTRY.json")
case = read(BASE / "scientific/CASE_REVIEWS_S01_S29.json")
extra = read(BASE / "scientific/C1_C6_REVIEWS.json")
variants = {v["variant_id"]: v for c in case["cases"] + extra["cases"] for v in c["variants"]}
variants.update({v["variant_id"]: v for v in case["supplemental_variants"]})
targets = {p["profile_id"]: p for p in g01["profiles"]} | variants
assert len(targets) == 48

# Each entry is an independent sporting/control judgment, not a rule inferred by this script.
reasons = {
    "G01-RUN_ONLY": "Accept the familiar easy-running continuity subset. The explicit three-session ledger, current mode-specific state and R-E30 configuration supply a concrete coverage witness; this does not promise race improvement or cover entry running.",
    "G01-STRENGTH_ONLY": "Accept only configured familiar S-GDB general-strength intent. The corrected six-session exact-configuration ledger, separate dumbbell competence, equipment and own response repair the prior generic witness; no running experience or equipment equivalence supplies that proof.",
    "G01-BALANCED_HYBRID": "Accept familiar dual-domain session intents with co-priorities, configured lower/upper/easy/cruise recipes and explicit tolerance premises. Neither broad concurrent compatibility nor the mode name establishes a complete performance catalog or physiological utility function.",
    "G01-RUN_FIRST": "Accept the same competent familiar dual-domain subset, with declared running priority used only after a warranted trade-off exists. It does not compel moving strength or justify an unsupported running recipe.",
    "G01-STRENGTH_FIRST": "Accept the same competent familiar dual-domain subset, with declared strength priority and preserved sufficient secondary intent. Strength experience does not establish novice running competence, calibration or a right to discard running.",
    "S01-A0": "KEEP is defensible under explicit current eligibility, calibrated familiar task exposure, repeated comparable completion, accepted essential intents and feasible horizon. Twelve hours is a clock fact, not the reason this branch is adequate; theoretical extra spacing alone creates no need.",
    "S02-A0": "The priority-only counterpart correctly retains KEEP because no supplied fact defeats either task intent. Strength priority changes protection in a real conflict but does not manufacture that conflict or require reversing the run.",
    "S01-B3": "Repeated comparable quality loss warrants review, and both supplied moved configurations preserve task intents. Their individual physiological sufficiency remains a simulated premise; retain a limited reversible ASK between options rather than an unqualified move rule or Run-first default.",
    "S02-B3": "The same conflict facts do not establish a unique Strength-first winner when both candidate moves preserve both accepted intents. Retain limited reversible options, preference and recheck; no universal spacing or priority-only prescription is approved.",
    "S01-U": "Missing current restriction/symptom information is decisive for this prescription. ASK and hold the dependent choice, including an implied KEEP clearance; no disease or automatic clinical referral follows from missingness.",
    "S02-U": "Changing primary modality cannot repair the same missing current eligibility answer. Abstention and scoped ASK/HOLD are the competent result, without prescribing a smaller dose as a substitute.",
    "S05-I0": "An isolated shortened night does not itself defeat otherwise supplied current task-adequacy evidence. Accept learn-only/KEEP with context-specific recheck, without claiming sleep cannot matter or validating a fatigue threshold.",
    "S05-C2": "Fresh task-specific difficulty and contextual reports establish a material concern, not a diagnosis. Evidence does not establish that omitting exactly the third squat set is the smallest physiologically sufficient solution; retain the bounded trial and its open exact-dose gate.",
    "S05-X": "The proposed performance contrast is not comparable under its changed context. Reconcile the missing context before treating it as convergent evidence or prescribing from pace difference.",
    "S12-A0": "One extra set is a concrete additional performed dimension, not an automatic need for reduction or progression. Supplied comparable subsequent task response supports retaining the future plan while preserving planned versus actual history and withholding extra merit.",
    "S12-C2": "Current task difficulty, rather than the ABOVE label, defeats the original cruise intent. The exact 12-minute/easy alternative's sufficiency remains uncertain, so preserve limited reversible choice, explicit loss and recheck rather than strong approval.",
    "S12-D": "A confirmed re-delivery of the same extra-set activity is one exposure and no new physiological fact. Accept no second adaptation; identity/revision reconciliation precedes any future sporting interpretation.",
    "S13-N": "High goal linkage alone leaves the adequate feasible week unchanged. Accept KEEP; criticality does not create a material training need.",
    "S14-N": "The same feasible adequate facts with lower criticality also justify KEEP. Lower importance permits a later trade-off but is not a reason to trim work without need.",
    "S13-T": "The fixed 29-minute slot cannot fit the 37-minute task, while the shared goal linkage makes all 18 minutes essential. The feasible full-dose Wednesday move is the smallest supplied candidate preserving that task; recheck Thursday context and obtain current scoped acceptance.",
    "S14-T": "With identical athlete and schedule facts, the accepted supplemental intent permits 12 minutes. The 29-minute recipe avoids meaningful recommitment while disclosing lost work; this is not a claim that 12 minutes universally preserves performance adaptation.",
    "S28-14D": "The repaired ledger ends before the explicitly nonclinical interruption and current capacity remains uncertain. General detraining/retraining evidence does not validate the exact combined restart doses or next-week progression; retain a limited reversible candidate and held dependent dose gate.",
    "S28-3D": "The short travel label supplies no loss of planned exposure or relevant current-context change. Accept KEEP only on the independently supplied eligibility, familiarity and adequacy, never a three-day safety rule.",
    "S28-U": "Unknown pause reason and current eligibility prevent classifying this as a covered nonclinical return. Ask the minimum decision-changing facts; no old or reduced default dose repairs the uncertainty.",
    "S28-C": "Clinical injury/illness-related return and clearance are outside this software review authority. Confirm clinical human routing without restart dose, simulated clearance or waiting for the funded-human milestone.",
    "S29-R2": "Rack loss after two completed familiar squat sets is a new concrete constraint. Omitting only the unperformed third set preserves the accepted dispensable-set intent and feasible familiar hinge/split remainder; protect prefix/revision and require remainder-specific agency.",
    "S29-N": "Session start and replay of an old report are not a new material fact or acceptance of a stale whole-session proposal. Accept preservation of the executing revision and no repeated mutation, conditional on the retained valid execution context.",
    "S29-C": "A new pain/functional-limitation clinical dependency after start requires human clinical judgment on the dependent remainder. Preserve performed history; neither an alternative exercise nor consent provides clearance.",
    "S06-HRV": "The optional isolated HRV observation does not override independent adequate task/context evidence. Accept learn-only without a new readiness score, mandatory wearable or claim that HRV can never be relevant.",
    "S09-MISS": "Confirmed missed low-criticality easy work is historical nonperformance, not debt. The unaffected adequate upper task and next horizon need no compensatory double or automatic progression reward.",
    "SIL-S09-SUB": "The corrected accepted intent explicitly includes bilateral squat-pattern practice; retained split squats do contribute knee-extension but do not supply that bilateral task. A familiar goblet substitute can preserve that bounded task with disclosed barbell-specificity loss, without equivalent load/fatigue claims.",
    "C1-TRAJ": "The corrected timeline exercises isolated signal, convergent concern, accepted changes, chronological recheck, no missed-work debt and no replay tremor. Those controls are acceptable, but exact fatigue-dose and return sufficiency remain limited; the sequence does not validate a recovery algorithm.",
    "C2-RUN_FIRST": "Accept the familiar explicitly preferred run-morning/lower-evening double under supplied comparable dual-task response and following horizon. Priority does not require changing an adequate double; the 10h23 clock gap is not a universal minimum.",
    "C2-STRENGTH_FIRST": "The same adequate familiar double remains defensible when priority changes. Strength-first does not require strength first in clock order when no protected task is shown compromised and the athlete prefers the existing configuration.",
    "C2-BALANCED_HYBRID": "Accept the same explicitly familiar double under co-priorities and current task/context facts. Neither modality is assigned hidden precedence and neither group-average compatibility nor preference alone establishes adequacy.",
    "C2-ONE-SLOT": "A new unfamiliar compressed double lacks sufficient comparable response/configuration support. Abstain and ASK; an explicit wish for a double does not approve an untested combined dose or spacing.",
    "C3-PARETO": "With Tuesday lost and the equally preferred compatible Wednesday configuration available, moving the full run preserves both accepted task intents while cancellation loses one without a compensating burden advantage. Accept this bounded Pareto comparison, not a scalar physiology optimizer.",
    "C3-ASK": "The exact 107-minute original does not fit the 105-minute window. Both supplied reduced candidates lose a different accepted co-priority intent, so ASK is the correct approved control; it approves neither sacrifice nor hidden runner-first weights.",
    "C4-L1": "The corrected current target is fixed at two minutes; a newly reconciled comparable contrast supports proposing three minutes and a feasible 39-minute session as a bounded microparameter change. If the range were already accepted it would instead be execution at Level0; no universal recovery interval is inferred.",
    "C4-L4": "The corrected bilateral-task goal and familiar substitute make level4 a bounded admissible choice after lost rack, infeasible move and inadequate omission of the separately accepted bilateral task. Split work is not erased, and goblet16kg is not declared equivalent to barbell60kg.",
    "C4-L5": "Two independent lost slots plus connected easy-session relocation require a joint week successor; one move, one dose change or one substitute leaves an unresolved constraint. Accept the concrete familiar shifted configuration with next-key recheck and whole-change agency, not a mandatory replan merely because several sessions moved.",
    "C4-L6": "The authorized four-week goal and capacity reset conflicts with recurring old phase/recipes, and every available window is30minutes. A one-week patch leaves the next three weeks incompatible, so a bounded significant rebase is justified. The repaired essential map preserves the new easy/general goals, not an old cruise obligation.",
    "C5-TAPER": "The concrete trained-adult event and changed phase justify examining taper direction, but the meta-analysis population and individual combined dose transfer are limited. Retain the exact run-strength taper as a reversible candidate, not an approved optimal or universal taper.",
    "C5-CANCEL": "Cancellation removes the event premise and accepted new goal is unknown. Invalidate the dependent proposal and ASK; neither retaining taper nor automatically restoring former development volume is established.",
    "C6-IN": "Choice inside the previously accepted repetitions/effort envelope is execution of that prescription, not a new adaptive mutation. Accept stability that preserves this agency; the numeric envelope remains this fixture's programming premise rather than a research cutoff.",
    "C6-OUT": "An observed extra fourth set is outside the accepted three-set envelope and must stay actual history. Accept learning/review without retrospectively widening the target or automatically rewarding/punishing the excess; reassess future adequacy under current facts.",
    "C6-EARNED": "Comparable repeated task response supports examining next-cycle progression, while exact62.5kg sufficiency is not established. Retain a limited reversible next-horizon candidate with adoption/recheck, leaving an adequate current week stable and avoiding permanent plateau.",
    "C6-U": "A new task and unanchored/noncomparable RIR cannot establish earned progression. Abstain and ask/familiarize an accepted route; apparent repetitions or a new week do not repair measurement applicability."
}
assert set(reasons) == set(targets), (set(targets) - set(reasons), set(reasons) - set(targets))

searches = [
    ("site.pmc.ncbi.nlm.nih.gov concurrent training running strength meta analysis acute 2022 de Carvalho Silva runners", "Verify acute runner evidence and countercheck chronic-to-acute transfer"),
    ("site.pmc.ncbi.nlm.nih.gov taper endurance meta-analysis training reduction performance 2023", "Inspect trained-athlete population and reject universal taper-dose transfer"),
    ("site.pmc.ncbi.nlm.nih.gov autoregulation resistance training systematic review repetitions in reserve 2021", "Countercheck autoregulation superiority and exact-envelope inference"),
    ("site.pubmed.ncbi.nlm.nih.gov concurrent training sequence order meta analysis strength first endurance first 2025 2026", "Current counterevidence and order/spacing applicability"),
    ('"40791980" "10.1016/j.jesf.2025.07.006"', "Verify newer autoregulation record; retain abstract-only auxiliary status"),
    ('"10.1111/sms.14739" "39364857"', "Verify nonclinical detraining trial identity and reject direct14day hybrid dose transfer"),
    ('"10.1007/s40279-014-0253-z" "25200666"', "Verify narrative monitoring source and its auxiliary status")
]

author_records = read(BASE / "scientific/DECISIONS.json")["records"]
records = []
for author in author_records:
    row = copy.deepcopy(author)
    item = row["scope"]["item_ids"][0]
    proposed = targets[item]["proposed_disposition"]
    assert item in reasons
    assert digest(ROOT / row["target"]["artifact"]) == row["target"]["sha256"]
    old_id = row["review_id"]
    row["review_id"] = old_id + "-J1"
    row["review_revision"] = "SDC-FIDELITY-J1"
    row["reviewer"] = {"actor_type": "AI_AGENT", "instance_id": "/root/source_fidelity_judge", "human_credentials_claimed": False, "independent_of_target_author": True}
    row["question"] = "Independent bounded judgment for " + item + "; derived from author record " + old_id
    row["disposition"] = proposed
    row["decision"]["rationale"] = reasons[item] + " Independently reviewed against frozen target; author record " + old_id + " is provenance, not approval."
    row["decision"]["conditions"] = list(dict.fromkeys(row["decision"]["conditions"] + [
        "This accepts only the explicit synthetic coverage/control/policy branch and familiar configured task premises; it is not an empirical efficacy, safety, optimal-dose or real-athlete clearance claim.",
        "Actual use requires current applicable eligibility, approved recipe/method and all competent governance/runtime/legal gates. A missing decisive premise routes ASK/HOLD; clinical dependencies remain human-required.",
        "Every exact-dose effect still labeled PLAUSIBLE/INSUFFICIENT remains open and is not decisive support for a strong prescriptive generalization.",
        "Chief must link this record to the final governance disposition and append every approved prescriptive-impact record to the existing unique funded-human queue before mission closure."
    ]))
    row["limitations"] = [x for x in row["limitations"] if not x.startswith("Author submission;")]
    row["limitations"].append("Independent internal provisional review of synthetic premises; not human, clinical, product-empirical or runtime validation. No unreviewed recipe/population or efficacy claim is approved.")
    row["literature_snapshot"]["searches"] = [{"query": q, "site": "Independent web discovery followed by actual primary publisher/PMC/PubMed access", "searched_on": "2026-10-23", "purpose": p, "result_notes": "Actual access and limits recorded in reviews/fidelity-precheck.md and fidelity-draft-findings.md. Source access labels independently checked; snippets are not full-text proof."} for q, p in searches]
    row["literature_snapshot"]["counterevidence_search"] = "Independent current order/sequence and modality/status countersearch; fulltext population/outcome/limitations checks for L01/L02/L03/L04/L07/L08/L09. L05/L10/L11 remain abstract-only auxiliary; L06 is narrative auxiliary. No universal dose, zero-risk or acute-readiness conclusion follows. Own exact queries/access limits are preserved in the fidelity logs."
    row["governance"]["next_owner"] = "Chief with independent governance consistency judge; future qualified-human reviewer when funded"
    row["governance"]["next_action"] = "Consolidate exact frozen review and independent disposition; append approved prescriptive-impact items to the unique existing queue; keep all retained gaps and real-use/runtime gates visible."
    row["dependent_items"] = list(dict.fromkeys(row.get("dependent_items", []) + [old_id] + [p["policy_id"] for p in g02["policies"] if item in p["witnesses"]]))
    if proposed in {"APPROVE", "APPROVE_WITH_CONDITIONS"} and row["scope"]["prescriptive_impact"]:
        row["human_revalidation"] = {"state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION", "queue_ref": "reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json#HRQ-" + row["review_id"], "human_review": None}
    else:
        row["human_revalidation"] = {"state": "NOT_APPROVED_PRESCRIPTIVE_DECISION", "queue_ref": None, "human_review": None}
    schema = read(ROOT / "governance/agents/sports-science-reviewer/decision.schema.json")
    jsonschema.Draft202012Validator(schema, format_checker=jsonschema.FormatChecker()).validate(row)
    records.append(row)

assert len(records) == 48
container = {"review_id": "SDC-INDEPENDENT-DECISIONS-J1", "review_revision": "SDC-FIDELITY-J1", "review_date": "2026-10-23", "reviewer_instance": "/root/source_fidelity_judge", "authority": "PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY", "record_type": "INDEPENDENT_SSCTR_ITEM_DECISIONS", "manifest_ref": str(MANIFEST.relative_to(ROOT)).replace("\\", "/"), "manifest_sha256": EXPECTED_MANIFEST, "records": records, "counts": dict(Counter(r["disposition"] for r in records)), "queue_append_owner": "Chief; required before final closure", "human_validation": False, "empirical_product_validation": False, "clinical_clearance": False, "runtime_execution": False}
path = OUT / "INDEPENDENT_DECISIONS.json"
path.write_text(json.dumps(container, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
verification = {"review_id": "SDC-FIDELITY-CHECK-J1", "manifest_sha256": EXPECTED_MANIFEST, "frozen_targets_match": len(manifest["files"]), "manifest_mismatches": [], "prior_deterministic_checks": {"passed": precheck["passed"], "total": precheck["total"], "failed": 0}, "records_schema_validated": len(records), "validator": "jsonschema Draft202012 + FormatChecker", "counts": container["counts"], "independent_records_sha256": digest(path), "queue_correspondence": "PENDING_CHIEF_APPEND_AND_INSTALLED_VALIDATOR", "scientific_truth_proved_by_script": False}
validator_path = ROOT / ".agents/skills/sports-science-review/scripts/validate_records.py"
spec = importlib.util.spec_from_file_location("ssctr_installed_fidelity_validator", validator_path)
installed = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installed)
pilot_records = installed.records_from(read(ROOT / "reviews/provisional-sports-science/2026-10-23/decisions.json"))
queue_path = ROOT / "reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json"
all_records = pilot_records + records
installed_errors = installed.validate_records(all_records, read(installed.SCHEMA)) + installed.validate_queue(all_records, read(queue_path), queue_path)
assert not installed_errors, installed_errors
verification["queue_correspondence"] = {"passed": True, "installed_validator_sha256": digest(validator_path), "records_validated_including_pilot": len(all_records), "approved_scientific_items_matched": sum(r["disposition"] in {"APPROVE", "APPROVE_WITH_CONDITIONS"} and r["scope"]["prescriptive_impact"] for r in all_records), "new_scientific_items": 31, "queue_sha256": digest(queue_path), "errors": []}
(OUT / "fidelity-checks.json").write_text(json.dumps(verification, indent=2) + "\n", encoding="utf-8")

policy_reviews = []
for policy in g02["policies"]:
    limited = policy["policy_id"] in {"P-CONVERGENCE", "P-RETURN", "P-TAPER"}
    policy_reviews.append({
        "policy_id": policy["policy_id"],
        "disposition": "LIMITED_REVERSIBLE_RECOMMENDATION" if limited else "APPROVE_WITH_CONDITIONS",
        "scope": "Exact fatigue/re-entry/taper effect remains open; control/routing parts can still be accepted" if limited else "Bounded framework and reviewed synthetic witness branches only; not an unrestricted dose policy",
        "witness_independent_record_ids": ["SDC-" + v + "-J1" for v in policy["witnesses"]],
        "queue_rule": "Only approved prescriptive-impact witness decisions are queue approvals; LIMITED/ABSTAIN/REVISE/clinical records do not become approved doses"
    })

case_closure = [
    {"id": "C1", "status": "PARTIAL", "accepted": "Chronological control, no debt/double counting, recheck and replay stability", "open": "Exact convergent-fatigue reduction and return-dose efficacy", "decision_ids": ["SDC-C1-TRAJ-J1"]},
    {"id": "C2", "status": "BOUNDED_SUBSET_ACCEPTED", "accepted": "All three priorities preserve the explicitly familiar adequate double; unfamiliar compressed double abstains", "open": "Novel double configurations and universal spacing/order rules", "decision_ids": ["SDC-C2-" + x + "-J1" for x in ["RUN_FIRST", "STRENGTH_FIRST", "BALANCED_HYBRID", "ONE-SLOT"]]},
    {"id": "C3", "status": "BOUNDED_SUBSET_ACCEPTED", "accepted": "Concrete Pareto option and genuine co-priority incomparability requiring ASK", "open": "No general scalar physiology/utility optimizer established", "decision_ids": ["SDC-C3-PARETO-J1", "SDC-C3-ASK-J1"]},
    {"id": "C4", "status": "BOUNDED_LEVEL0_TO6_WITNESSES_ACCEPTED", "accepted": "Corrected fixed-target microchange, remainder omission, move, bilateral-task substitute, coupled week and durable block rebase; relevant smaller choices explicitly insufficient", "open": "No general individual dose-effect or optimality gold", "decision_ids": ["SDC-" + x + "-J1" for x in ["S01-A0", "C4-L1", "S29-R2", "S13-T", "C4-L4", "C4-L5", "C4-L6"]]},
    {"id": "C5", "status": "PARTIAL_EXACT_TAPER_OPEN", "accepted": "Concrete event/phase review and cancellation-dependent invalidation", "open": "Exact combined taper prescription/strength-run dose transfer", "decision_ids": ["SDC-C5-TAPER-J1", "SDC-C5-CANCEL-J1"]},
    {"id": "C6", "status": "PARTIAL_ENVELOPE_CONTROL_ACCEPTED", "accepted": "Preauthorized execution versus observed outside-envelope work; current-week stability and earned-opportunity distinction", "open": "Exact next-cycle62.5kg step efficacy and new-task/RIR comparability", "decision_ids": ["SDC-C6-" + x + "-J1" for x in ["IN", "OUT", "EARNED", "U"]]}
]

golden_reviews = []
for p in sorted((BASE / "GOLDEN_DOMAIN_FIXTURES").glob("*.json")):
    data = read(p)
    if "variants" not in data:
        continue
    ids = [v["variant_id"] for v in data["variants"]]
    golden_reviews.append({"file": p.name, "sha256": digest(p), "kind": "SUPPLEMENTAL_SEPARATE_DENOMINATOR" if "supplemental" in p.name else "ORIGINAL_DOMAIN_OPEN_MAPPING_TO_NEW_SYNTHETIC_SUCCESSORS", "disposition": "ACCEPT_BOUNDED_MAPPING_AND_CONDITIONS", "variant_ids": ids, "independent_record_ids": ["SDC-" + v + "-J1" for v in ids], "physiological_gold_created": False, "original_positive_oracle_promoted": False})

review = {
    "review_id": "SDC-SCIENCE-FIDELITY-J1", "review_revision": "SDC-FIDELITY-J1", "review_date": "2026-10-23", "timezone": "America/Sao_Paulo",
    "reviewer": {"instance_id": "/root/source_fidelity_judge", "actor_type": "AI_AGENT", "native_role_availability": "EXPLICIT_DEFAULT_INSTANCE_CONSTITUTION_FALLBACK", "agent_version": "SSCTR-1.0.0", "protocol_revision": "SSCTR-EP-1.0.0", "independent_of_authors": True, "authored_policy_or_synthesis": False, "human_credentials_claimed": False},
    "verdict": "PASS", "gate_scope": "Independent sporting/source-fidelity acceptance of exact bounded documentary subset and retained abstentions; not overall sports/runtime readiness",
    "manifest_ref": str(MANIFEST.relative_to(ROOT)).replace("\\", "/"), "manifest_sha256": EXPECTED_MANIFEST, "reviewed_targets": manifest["files"],
    "deterministic_checks": verification, "source_audit": {"corpus_sources": 11, "fulltext_sources_checked": ["L01", "L02", "L03", "L04", "L06", "L07", "L08", "L09"], "eligible_fulltext_support": ["L01", "L02", "L03", "L04", "L07", "L08", "L09"], "auxiliary_only": ["L05", "L06", "L10", "L11"], "own_access_logs": ["fidelity-precheck.md", "fidelity-draft-findings.md"], "assessment": "DOI/PMID/title/access/type/population/outcome and claim boundaries checked. No invented reference, fulltext access, effect estimate, universal threshold or clinical approval found in the accepted subset. Review overlap, group-to-individual and chronic-to-acute limits remain explicit.", "limits": "Focused adversarial audit, not an exhaustive systematic review, full reanalysis, formal GRADE/AMSTAR score or exhaustive retraction audit. No notice observed on accessed admitted pages. L05/L10/L11 abstract-only records and L06 narrative review never provide sole decisive prescription support."},
    "g01": {"status": "BOUNDED_FIVE_MODE_SUBSET_ACCEPTED", "accepted_profile_ids": [p["profile_id"] for p in g01["profiles"]], "recipe_count": len(g02["recipes"]), "remaining_gaps": [g["gap_id"] for g in g01["numbered_gaps"]], "limits": "Regular task-competent configured adults, explicit positive/negative witnesses and maintained session intents; novice/specialized/missing-configuration coverage, legal service model and complete product catalog not inferred."},
    "g02_policies": policy_reviews,
    "item_decisions": [{"item_id": r["scope"]["item_ids"][0], "review_id": r["review_id"], "disposition": r["disposition"], "evidence_status": r["evidence_status"], "action": r["proposed_action"], "mec": r["decision"]["mec_change_level"], "reason": reasons[r["scope"]["item_ids"][0]]} for r in records],
    "c1_c6": case_closure,
    "g03": {"status": "EXACT_DIMENSIONAL_SEMANTIC_SUBSET_ACCEPTED", "witnesses": ["G03-W" + str(i).zfill(2) for i in range(1, 20)], "partial_review_ref": "fidelity-semantics-review.json", "open": "Sporting intent/tolerance/freshness OPEN_BY_RECIPE; executable/provider/legal proof separate; no physiological adherence percent or extra merit."},
    "g04_nonclinical": {"status": "BOUNDED_ROUTING_BOUNDARY_SUBSET_ACCEPTED", "witnesses": ["G04-W" + str(i).zfill(2) for i in range(1, 11)], "partial_review_ref": "fidelity-semantics-review.json", "open": "Re-entry dose and clinical assessment/copy/urgency/clearance not closed. Missing eligibility routes ASK, clinical concern routes CLINICAL_HUMAN_REQUIRED; no dose workaround."},
    "golden": {"mapped_original_domain_open_files": 10, "additional_supplemental_files": 4, "reviews": golden_reviews, "limits": "Fixtures bind explicit state, week/configured recipe refs, preserve/modify, MEC/must-not, agency, source and independent dispositions. Empty modify is legitimate for KEEP. No wording/fixture becomes physiological efficacy gold and original20 denominator is preserved."},
    "ae_rerun": {"status": "ACCEPT_DOCUMENTARY_REASSESSMENT_AND_DENOMINATOR_SEPARATION", "original_cases": 89, "original_rubric_cells": 890, "original_counts": {"PASS":62, "ACCEPTABLE":19, "QUESTIONABLE":8, "WRONG":0, "DANGEROUS":0}, "original_questionable_closed": 0, "families_with_bounded_positive_mutation_successor": ["S13", "S14", "S29"], "successors": ["S13-T", "S14-T", "S29-R2"], "supplemental_variants":43, "supplemental_rubric_cells":430, "supplemental_counts": {"PASS":2, "ACCEPTABLE":33, "QUESTIONABLE":8, "WRONG":0, "DANGEROUS":0}, "regressions_found": [], "limits": "Clinical PASS judges correct route only; ACCEPTABLE judges conditional control/branch consistency; LIMITED exact-dose candidates remain QUESTIONABLE. N/E is not PASS. No runtime or safety-rate estimate."},
    "resolved_findings": [{"id": "FID-D" + str(i).zfill(2), "status": "CORRECTED_AND_RECHECKED_AT_FROZEN_TARGET", "detail": detail} for i,detail in enumerate([
        "Limited recipe dispositions propagated without strong-approval contradiction.",
        "Retained split-squat knee extension acknowledged; substitution rests only on separately accepted bilateral task.",
        "Microchange uses new fixed-target revision; preauthorized range would be execution/Level0.",
        "Significant rebase essential stimuli match current authorized easy/general goals.",
        "Preinterruption ledger no longer places training during confirmed Oct12-25 pause.",
        "Criticality-only pair shares identical prior exposure facts and differs only in accepted linkage.",
        "Second short night is retrospective disclosure, not an impossible new same-day night.",
        "Strength-only and run-only positive witnesses now contain mode-specific actual synthetic ledgers/configuration/competence rather than a generic inputs-present assertion.",
        "Illustrative running totals were reconciled with the actual complete synthetic week; original supplied source preserved.",
        "Taper20min candidate does not inherit re-entry-only authority; dose limits remain open."
    ], start=1)],
    "blocking_findings": [], "unclosed_domain_dependencies": ["Exact lower-cruise acute response/dose/MEC under conflict", "Exact convergent-fatigue and performed-above-target adaptation doses", "Nonclinical14day combined re-entry dose/progression", "Exact combined10km taper", "Exact earned next-cycle load step", "Uncovered novice/specialized/configuration scope and recipe-specific physiological intent/comparability", "Clinical human dependencies and real-use/runtime/legal gates"],
    "readiness_recommendation": {"SPORTS_DOMAIN_READINESS": "NOT_READY", "AE_RUNTIME_IMPLEMENTATION_READINESS": "NO_GO", "reason": "Necessary bounded branches and controls are now concrete; material adaptive-dose/coverage/intent dependencies still prevent an unrestricted prescriptive AE runtime. This review accepts honest retained gaps and does not require a human merely for administrative eligibility."},
    "queue": {"required_new_prescriptive_approvals":31, "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION", "append_owner":"Chief", "required_before_final_mission_closure":"Unique existing queue append and installed validator correspondence; separate governance acceptance current", "funding_trigger_declared": False},
    "expiry": "Any material change to frozen target/source, population/goal/recipe/method/authority or adverse/runtime inconsistency invalidates affected acceptance; funded qualified human may maintain/modify/revoke without software veto.",
    "human_validation": False, "empirical_product_validation": False, "clinical_clearance": False, "runtime_execution": False, "foundation_promoted": False
}
(OUT / "SCIENCE_FIDELITY_REVIEW.json").write_text(json.dumps(review, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

md = """# Independent SSCTR sporting and source-fidelity gate

**SDC-FIDELITY-J1 · 23/10/2026 · PASS for the bounded documentary subset.** This does not mean overall sports readiness or runtime approval. The independent reviewer recommends **SPORTS_DOMAIN_READINESS=NOT_READY** and **AE_RUNTIME_IMPLEMENTATION_READINESS=NO_GO** for an unrestricted prescriptive engine because the material open doses/coverage/intent dependencies remain.

Reviewer `/root/source_fidelity_judge` explicitly loaded SSCTR-1.0.0, constitution/protocol/skill and active authority filter in a disclosed fresh-default fallback. This instance authored none of the policy, synthesis, semantic or Golden targets. It supplied ten concrete early findings/refinements; their author corrections were re-read and verified against the final frozen targets. No human degree, validation, clinical clearance, runtime execution or Foundation promotion is claimed.

## Exact review and current proof

The [40-target freeze](../../../../audits/sports-domain-closure-2026-10-23/REVIEW_MANIFEST.json) SHA256 is `39bc280225288fb6bf631c2e1de91e0c3541459faf3bef74ac689c7d6d69b5fe`. All40 hashes matched independently. Chief's current deterministic precheck is1105/1105 PASS; it precedes this gate and proves consistency, not scientific truth. The reviewer separately emitted and validated48 installed-schema item decisions in [INDEPENDENT_DECISIONS.json](INDEPENDENT_DECISIONS.json): **31 APPROVE_WITH_CONDITIONS,8 LIMITED_REVERSIBLE_RECOMMENDATION,5 ABSTAIN,2 REVISE,2 OUT_OF_SCOPE**. The source author records remain submissions, not prior approvals. [fidelity-checks.json](fidelity-checks.json) records the current checks and record hash.

Every decision has a separate independent rationale, exact target hash, evidence/limits, action, agency, re-review trigger and queue disposition. This gate accepts a synthetic branch conditional on its explicit task/context facts. It does not turn an uncertain individual effect into a scientifically proven dose. Chief appended the31 accepted prescriptive-impact items to the unique funded-human queue; the reviewer ran the installed validator across the pilot plus new records and confirmed44 linked scientific approvals with zero errors. Current independent governance and consolidation remain separate.

## Scientific audit

The11-source corpus was checked against actual primary publisher/PMC/PubMed records. Eight full texts were accessible, with seven eligible as bounded scientific support; the narrative monitoring review remains auxiliary. The earlier PMC challenges and later successful ACSM full-text access are distinguished in the [own access log](fidelity-precheck.md) and [follow-up/source notes](fidelity-draft-findings.md). No fabricated reference, claimed inaccessible full-text reading, universal threshold or commercial/blog policy evidence was found in the accepted subset. This is a focused adversarial audit, not exhaustive literature coverage, a new meta-analysis, formal GRADE/AMSTAR assessment or exhaustive retraction search. No correction/retraction notice was observed on the accessed admitted pages.

Chronic compatibility evidence and its counterevidence are retained rather than averaged into a universal no-interference claim: [Schumann2022](https://link.springer.com/article/10.1007/s40279-021-01587-7), [Huiberts2024](https://link.springer.com/article/10.1007/s40279-023-01943-9). Acute runner evidence does not establish a universal recovery window or the fatigue saved by one omitted set: [de Carvalho e Silva2022](https://link.springer.com/article/10.1186/s40798-022-00497-w). General RT evidence constrains configured adult programming without validating this product's exact hybrid recipes: [Currier/ACSM2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/).

Autoregulation methods do not validate an invented envelope or individual increment: [Hickmott2022](https://link.springer.com/article/10.1186/s40798-021-00404-9). The interruption trial's untrained population and10-week design do not prescribe the14-day hybrid restart: [Halonen2024](https://onlinelibrary.wiley.com/doi/full/10.1111/sms.14739). Trained-endurance taper findings do not supply a universal recreational hybrid taper: [Wang2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10171681/). Group means, overlapping reviews, acute/chronic endpoints, eligibility and synthetic individual-response premises remain distinct. L05/L10/L11 abstract-only and L06 narrative content are auxiliary; none is sole decisive dose support.

## Item and policy dispositions

All five G01 modes are accepted **only for the explicit regular, task-competent configured subset and reviewed session intents**. The corrected Run-only and Strength-only witnesses include their own exposure frequency, exact configuration, competence and response. No novice, elite/peak/power/hypertrophy specialty, missing-equipment equivalent, full runtime catalog or legal-service coverage is inferred. All nine numbered scope/dose/legal gaps remain visible.

Seven G02 frameworks receive conditional acceptance: P-ADEQUACY, P-ABOVE, P-CRITICALITY, P-REMAINDER, P-PRIORITY-PARETO, P-MEC and P-ENVELOPE. Their authority is tied to the independent witness decisions and exact frozen registry. P-CONVERGENCE, P-RETURN and P-TAPER retain limited reversible status for their exact effects/doses. A correct routing or comparison framework does not approve every candidate it can describe.

The full48-item judgment table is in [SCIENCE_FIDELITY_REVIEW.json](SCIENCE_FIDELITY_REVIEW.json), with the schema records linked above. For the eight original QUESTIONABLE families: the unchanged source cases still lack decisive inputs, so **0/8 original positive oracles close**. S13-T, S14-T and S29-R2 are three separately bounded positive mutation successors; this is **3/8 families gaining a positive successor**, not closure of those original cases or every branch. S01/S02 correctly gain identical KEEP witnesses; neither priority manufactures necessity. S05/S12 positive fatigue adaptations and S28 exact restart remain limited; unknown and clinical branches retain ASK/HOLD or clinical-human routing.

## C1–C6

| Case | Accepted scope | Still open |
|---|---|---|
| C1 | Chronological signals/recheck, no debt/double counting, replay stability; retrospective second-night disclosure is coherent | Exact fatigue adaptation and return-dose effect |
| C2 | Familiar explicitly preferred adequate double in all3 priorities; unfamiliar compressed double abstains | Novel configurations and universal order/spacing |
| C3 | Concrete Pareto preservation; genuine incomparable sacrifices require ASK | No scalar physiological utility function or hidden runner-first |
| C4 | Bounded positive conceptual witnesses0–6, with smaller alternatives concretely assessed | General dose efficacy/optimality; witness existence is not empirical validation |
| C5 | Concrete event/phase review and cancellation invalidation | Exact combined taper prescription |
| C6 | Preauthorized execution versus new mutation; outside-envelope facts; next-cycle opportunity | Exact earned62.5kg step and noncomparable-task progression |

C4-L1 now changes a fixed target rather than pretending an already accepted range is a new mutation. C4-L4 acknowledges the retained split squat's actual knee-extensor contribution and rests on a separately accepted bilateral task; no16kg/60kg equivalence is claimed. C4-L5 cannot solve two independent lost slots with one move, and its connected horizon is explicit. C4-L6 requires the durable authorized goal/block reset, with current essential stimuli repaired; a one-week patch leaves three incompatible weeks. These conditions support the conceptual level5/6 examples without inventing physiological optimality.

## G03, G04, Golden and AE rerun

The unchanged exact hashes of [G03/G04 and all29 witnesses](fidelity-semantics-review.json) pass the independent sporting-boundary review. G03 closes only reconciled-fact/exact-dimensional semantics: executed-target lineage, known partial versus unknown, duplicates, corrections, stale context and one exposure. It does not equate reported effort with physiological threshold, semantic completion with sufficient stimulus, or excess with merit. Physiological intent/tolerance/freshness stay OPEN_BY_RECIPE where not individually reviewed.

G04 accepts nonclinical routing/boundaries. Unknown eligibility is ASK/HOLD; a known agenda/travel pause may enter a recipe review but gives no return dose. Persistent pain, injury, illness, pathology, rehab or clearance dependency remains CLINICAL_HUMAN_REQUIRED, without a reduced-dose workaround or funding delay. Clinical copy/urgency and clearance are not supplied by this gate.

All10 original Golden/domain-open mappings and4 separately denominated supplemental files are traceable to reviewed states, configured recipe references, preserve/modify, MEC bounds, must-not, agency and dispositions. LIMITED and unknown branches remain open. The original20 inventory and89-case AE denominator are preserved; no wording becomes physiological gold. The strict rerun retains62 PASS/19 ACCEPTABLE/8 QUESTIONABLE and890 cells. The43-variant supplement has2 PASS/33 ACCEPTABLE/8 QUESTIONABLE and430 separate cells. Clinical PASS judges the route only; ACCEPTABLE judges conditional branch/control consistency, not safety or efficacy. N/E stays outside evaluable denominators. No regression or new strong prescription was hidden by changing the denominator.

## Remaining conditions and readiness

There are no unresolved blocking source-fidelity findings on this frozen documentary submission. Exact acute lower/cruise adaptations, fatigue/overshoot doses, re-entry progression, combined taper, earned load increment and uncovered recipe/intent/coverage remain material domain dependencies. Their owners and missing proofs must stay in the final report. This is why the sports verdict remains NOT_READY and the unrestricted prescriptive AE runtime remains NO_GO despite a PASS for this honest closure round's bounded subset.

Chief must finish current governance consistency review and final consolidation. Future qualified-human review may maintain, change or revoke every approval without software veto; clinical needs never wait for revenue. Material source/goal/population/configuration/recipe/authority changes or adverse/runtime inconsistency invalidate affected acceptance. Human, clinical, empirical and runtime validation flags remain false.
"""
(OUT / "SCIENCE_FIDELITY_REVIEW.md").write_text(md, encoding="utf-8")
print(json.dumps(verification, ensure_ascii=False))
