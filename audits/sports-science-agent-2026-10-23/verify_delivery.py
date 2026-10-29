"""Local documentary checks; does not execute or validate the training engine."""
from __future__ import annotations

import hashlib
import copy
import importlib.util
import json
import re
import sys
import tomllib
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

AUDIT = Path(__file__).resolve().parent
ROOT = AUDIT.parent.parent
DEPS = Path.home() / "AppData/Local/Temp/vilumo-sports-review-validation-deps"
if DEPS.exists():
    sys.path.insert(0, str(DEPS))
import yaml
from jsonschema import Draft202012Validator

checks = []


def check(name, ok, detail=""):
    checks.append({"check": name, "passed": bool(ok), "detail": detail})


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def frontmatter(path):
    text = path.read_text(encoding="utf-8-sig")
    return yaml.safe_load(text.split("---", 2)[1])


def main():
    baseline = read_json(AUDIT / "BASELINE.json")
    for item in baseline["protected_files"]:
        path = ROOT / item["path"]
        check("protected:" + item["path"], path.is_file() and sha(path) == item["sha256"])

    before = AUDIT / "before"
    check("preexisting_editable_snapshot_exists", before.is_dir())
    if before.is_dir():
        for item in read_json(before / "MANIFEST.json"):
            check("before_snapshot_hash:" + item["path"], sha(before / item["path"]) == item["sha256"])
        for path in before.rglob("*"):
            if not path.is_file() or path.name.endswith(".json"):
                continue
            rel = path.relative_to(before)
            live = ROOT / rel
            check("preexisting_content_retained:" + rel.as_posix(),
                  live.is_file() and path.read_bytes() in live.read_bytes())

    codex = ROOT / ".codex/agents/sports-science-concurrent-training-reviewer.toml"
    claude = ROOT / ".claude/agents/sports-science-concurrent-training-reviewer.md"
    skill = ROOT / ".agents/skills/sports-science-review/SKILL.md"
    config = tomllib.loads(codex.read_text(encoding="utf-8-sig"))
    for field in ("name", "description", "developer_instructions"):
        check("codex_required:" + field, bool(config.get(field)))
    check("codex_inherits_model_permissions", not any(k in config for k in
          ("model", "model_reasoning_effort", "sandbox_mode", "approval_policy", "mcp_servers")))
    claude_meta = frontmatter(claude)
    check("same_native_role_name", claude_meta.get("name") == config["name"])
    check("claude_inherits_model", claude_meta.get("model") == "inherit")
    check("claude_no_specialist_delegation", "Agent" in claude_meta.get("disallowedTools", []))
    skill_meta = frontmatter(skill)
    check("skill_discoverable_name", skill_meta.get("name") == "sports-science-review")
    check("skill_has_trigger_description", bool(skill_meta.get("description")))
    tool_checks = read_json(AUDIT / "TOOL_CHECKS.json")
    check("skill_creator_current_validation", tool_checks["exit_code"] == 0 and tool_checks["skill_sha256"] == sha(skill))

    packet = ROOT / "reviews/human-domain-review/training-domain-foundation-0.2/CASE_INPUTS.json"
    pair = read_json(packet)["cases"]
    left, right = [dict(x["inputs"]) for x in pair]
    check("priority_pair_expected_modes", [left.pop("priority_mode"), right.pop("priority_mode")]
          == ["RUN_FIRST", "STRENGTH_FIRST"])
    check("priority_pair_all_other_inputs_identical", left == right)

    material = []
    for folder in ("governance/agents/sports-science-reviewer", ".agents/skills/sports-science-review",
                   ".codex/agents", ".claude/agents", "reviews/provisional-sports-science/2026-10-23"):
        material.extend(p for p in (ROOT / folder).rglob("*") if p.is_file())
    material += [ROOT / p for p in ("AGENTS.md", "CLAUDE.md", "CURRENT_MISSION.md",
                                  "canon/CANONICAL_INDEX.md", "product/PRODUCT_DECISION_REGISTER.md",
                                  "MISSION_LEDGER.md")]
    for path in material:
        if path.suffix == ".json":
            read_json(path)
            check("json_parses:" + path.relative_to(ROOT).as_posix(), True)
        if path.suffix != ".md":
            continue
        text = path.read_text(encoding="utf-8-sig")
        for target in re.findall(r"(?<!!)\[[^\]]*\]\(([^)]+)\)", text):
            target = target.strip().strip("<>").split("#", 1)[0]
            if not target or re.match(r"[a-zA-Z][a-zA-Z0-9+.-]*:", target):
                continue
            target = unquote(target)
            resolved = path.parent / target
            check("local_link:" + path.relative_to(ROOT).as_posix() + ":" + target,
                  resolved.exists())

    manifest_path = AUDIT / "REVIEW_MANIFEST.json"
    if "--freeze" in sys.argv:
        frozen = sorted(set(material + list(p for p in before.rglob("*") if p.is_file()) +
                            [AUDIT / "TASK_CONTRACT.md", AUDIT / "FOUNDER_REQUEST.md", AUDIT / "AUTHOR_HANDOFF.md",
                             AUDIT / "BASELINE.json", AUDIT / "TOOL_CHECKS.json", Path(__file__).resolve()]))
        manifest = {"revision": "SSCTR-REVIEW-r1", "frozen_at": datetime.now(timezone.utc).isoformat(),
                    "purpose": "Exact normative, scientific and verification inputs for independent review",
                    "files": [{"path": p.relative_to(ROOT).as_posix(), "sha256": sha(p)} for p in frozen]}
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if manifest_path.exists():
        for item in read_json(manifest_path)["files"]:
            check("review_input_current:" + item["path"], sha(ROOT / item["path"]) == item["sha256"])

    helper = ROOT / ".agents/skills/sports-science-review/scripts/validate_records.py"
    spec = importlib.util.spec_from_file_location("ssctr_records", helper)
    record_checks = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(record_checks)
    pilot = ROOT / "reviews/provisional-sports-science/2026-10-23"
    records = record_checks.records_from(read_json(pilot / "decisions.json"))
    schema = read_json(ROOT / "governance/agents/sports-science-reviewer/decision.schema.json")
    queue_path = pilot / "HUMAN_REVALIDATION_QUEUE.json"
    queue = read_json(queue_path)
    record_errors = record_checks.validate_records(records, schema)
    queue_errors = record_checks.validate_queue(records, queue, queue_path)
    check("pilot_schema_and_semantics", not record_errors, record_errors)
    check("every_prescriptive_approval_queued", not queue_errors, queue_errors)
    approved = next(r for r in records if r["disposition"] in record_checks.APPROVALS)
    ae_record = next(r for r in records if r["ae_review"]["applicable"])

    def reject_mutation(name, change, base=approved):
        mutated = copy.deepcopy(base)
        change(mutated)
        errors = record_checks.validate_records([mutated], schema)
        check("rejects:" + name, bool(errors), errors[:2])

    reject_mutation("human_credentials", lambda r: r["reviewer"].update(human_credentials_claimed=True))
    reject_mutation("human_actor_impersonation", lambda r: r["reviewer"].update(actor_type="HUMAN_PROFESSIONAL"))
    reject_mutation("clinical_clearance", lambda r: r["governance"].update(clinical_clearance=True))
    reject_mutation("human_validation", lambda r: r["governance"].update(human_validation=True))
    reject_mutation("empirical_validation", lambda r: r["governance"].update(empirical_product_validation=True))
    reject_mutation("insufficient_approval", lambda r: r.update(evidence_status="INSUFFICIENT_EVIDENCE"))
    reject_mutation("conflicting_approval", lambda r: r.update(evidence_status="CONFLICTING_EVIDENCE"))
    reject_mutation("clinical_approval", lambda r: r["population_context"].update(eligibility_status="CLINICAL_CONCERN"))
    reject_mutation("unknown_eligibility_approval", lambda r: r["population_context"].update(eligibility_status="ELIGIBILITY_UNASSESSED"))
    reject_mutation("source_free_approval", lambda r: r["literature_snapshot"].update(sources=[]))
    reject_mutation("stale_artifact", lambda r: r["target"].update(sha256="0" * 64))
    reject_mutation("whole_gate_autoclosure", lambda r: r["scope"].update(whole_gate_closure=True))
    reject_mutation("silent_publication", lambda r: r["governance"].update(publication_status="PRODUCT_TRUTH"))
    reject_mutation("invalid_review_date", lambda r: r.update(review_date="2026-02-31"))
    reject_mutation("missing_rationale", lambda r: r["decision"].pop("rationale"))
    reject_mutation("missing_claim_source", lambda r: next(c for c in r["claims"] if c["role"] == "DECISION_SUPPORT").update(source_ids=["DOES_NOT_EXIST"]))

    def unrelated_fulltext(r):
        source = copy.deepcopy(r["literature_snapshot"]["sources"][0])
        source.update(source_id="ABSTRACT_TRAP", access="ABSTRACT_ONLY", prescriptive_support_eligible=False)
        r["literature_snapshot"]["sources"].append(source)
        next(c for c in r["claims"] if c["role"] == "DECISION_SUPPORT")["source_ids"] = ["ABSTRACT_TRAP"]
    reject_mutation("unrelated_fulltext_cannot_launder_abstract_support", unrelated_fulltext)
    reject_mutation("duplicate_ae_answer", lambda r: r["ae_review"]["answers"][1].update(question_number=r["ae_review"]["answers"][0]["question_number"]), ae_record)

    bad_queue = copy.deepcopy(queue)
    bad_queue["items"].pop()
    check("rejects:missing_future_human_queue_item", bool(record_checks.validate_queue(records, bad_queue, queue_path)))
    funded_queue, funded_records = copy.deepcopy(queue), copy.deepcopy(records)
    funded_queue["funding_trigger"] = {"state": "DECLARED_TEST_ONLY", "declaration_ref": "SYNTHETIC_TEST_ONLY", "declared_at": "2026-10-23"}
    for item in funded_queue["items"]:
        item["state"] = "HUMAN_REVALIDATION_REQUIRED"
    for record in funded_records:
        if record["disposition"] in record_checks.APPROVALS and record["scope"]["prescriptive_impact"]:
            record["human_revalidation"]["state"] = "HUMAN_REVALIDATION_REQUIRED"
    check("funding_event_dry_run_requeues_all_approvals", not record_checks.validate_queue(funded_records, funded_queue, queue_path),
          "Synthetic in-memory transition only; no real revenue declaration or queue mutation")

    item_ids = {item for r in records for item in r["scope"]["item_ids"]}
    for item in [f"G01-{i:02}" for i in range(1, 14)] + [f"G01-E{i}" for i in range(1, 11)] + [f"PC-LT-{i:02}" for i in range(1, 6)]:
        check("pilot_disposition_present:" + item, item in item_ids)
    case_records = [r for r in records if any(x in {"G02-S01", "G02-S02"} for x in r["scope"]["item_ids"])]
    check("both_priority_cases_reviewed", len(case_records) == 2)
    check("case_action_controlled_comparison", len({r["proposed_action"] for r in case_records}) == 1,
          "No forced action difference from priority alone")
    check("material_files_present", len(material) >= 13, str(len(material)))
    report = {"checked_at": datetime.now(timezone.utc).isoformat(),
              "scope": "Documentary integration, record contracts and immutable inputs; not runtime/clinical efficacy",
              "passed": all(x["passed"] for x in checks),
              "counts": {"total": len(checks), "passed": sum(x["passed"] for x in checks)},
              "checks": checks}
    (AUDIT / "VERIFICATION.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: report[k] for k in ("passed", "counts")}, ensure_ascii=False))
    for item in checks:
        if not item["passed"]:
            print(json.dumps(item, ensure_ascii=False))
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
