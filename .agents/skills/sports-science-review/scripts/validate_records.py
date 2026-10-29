"""Validate offline scientific review records, never training efficacy or clearance.

Requires Python 3.11+ and jsonschema. Run explicitly; no runtime hook is installed.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[4]
SCHEMA = ROOT / "governance/agents/sports-science-reviewer/decision.schema.json"
APPROVALS = {"APPROVE", "APPROVE_WITH_CONDITIONS"}
STRONG = {"WELL_SUPPORTED", "SUPPORTED_WITH_LIMITS"}


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def records_from(data):
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in ("decisions", "records"):
            if isinstance(data.get(key), list):
                return data[key]
    raise ValueError("Expected decision array or object with decisions/records array")


def validate_records(records, schema, root=ROOT):
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    errors = []
    seen = set()
    identities = {}
    for index, record in enumerate(records):
        label = record.get("review_id", f"record[{index}]")
        for error in validator.iter_errors(record):
            location = "/".join(map(str, error.absolute_path)) or "record"
            errors.append(f"{label}/{location}: {error.message}")
        if label in seen:
            errors.append(f"{label}: duplicate review ID")
        seen.add(label)
        sources = record.get("literature_snapshot", {}).get("sources", [])
        source_map = {s.get("source_id"): s for s in sources}
        if len(source_map) != len(sources):
            errors.append(f"{label}: duplicate source ID")
        for source in sources:
            key = source.get("source_id")
            identity = tuple(source.get(k) for k in ("title", "doi", "pmid", "year"))
            if key in identities and identities[key] != identity:
                errors.append(f"{label}/{key}: source identity differs between records")
            identities[key] = identity
        claim_ids = set()
        for claim in record.get("claims", []):
            cid = claim.get("claim_id")
            if cid in claim_ids:
                errors.append(f"{label}/{cid}: duplicate claim ID")
            claim_ids.add(cid)
            refs = claim.get("source_ids", [])
            missing = set(refs) - set(source_map)
            if missing:
                errors.append(f"{label}/{cid}: unresolved source IDs {sorted(missing)}")
            if claim.get("role") == "DECISION_SUPPORT":
                eligible = [source_map[x] for x in refs if x in source_map
                            and source_map[x].get("verified") is True
                            and source_map[x].get("access") == "FULL_TEXT"
                            and source_map[x].get("prescriptive_support_eligible") is True]
                if not eligible:
                    errors.append(f"{label}/{cid}: decisive claim lacks linked verified eligible full text")
                if claim.get("evidence_status") not in STRONG:
                    errors.append(f"{label}/{cid}: weak claim cannot be decision support")
        ae = record.get("ae_review", {})
        if ae.get("applicable") and {x.get("question_number") for x in ae.get("answers", [])} != set(range(1, 11)):
            errors.append(f"{label}: AE answers must cover each of questions 1..10 exactly once")
        target = record.get("target", {})
        target_path = (root / target.get("artifact", "")).resolve()
        if not target_path.is_relative_to(root.resolve()) or not target_path.is_file():
            errors.append(f"{label}: target is not an existing project file")
        elif target.get("sha256"):
            actual = hashlib.sha256(target_path.read_bytes()).hexdigest()
            if actual != target["sha256"].lower():
                errors.append(f"{label}: target hash is stale")
        else:
            errors.append(f"{label}: material target hash is required by record protocol")
    return errors


def validate_queue(records, queue, queue_path):
    errors = []
    entries = queue.get("items", [])
    by_id = {x.get("queue_id"): x for x in entries}
    if len(by_id) != len(entries):
        errors.append("queue: duplicate queue ID")
    approvals = {r["review_id"]: r for r in records
                 if r.get("disposition") in APPROVALS and r.get("scope", {}).get("prescriptive_impact")}
    funding = queue.get("funding_trigger", {})
    funded = funding.get("state") != "NOT_DECLARED"
    if funded and not (funding.get("declaration_ref") and funding.get("declared_at")):
        errors.append("queue: funded trigger lacks Founder declaration provenance")
    expected_state = "HUMAN_REVALIDATION_REQUIRED" if funded else "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION"
    matched = []
    for record_id, record in approvals.items():
        ref = record["human_revalidation"].get("queue_ref") or ""
        path_text, _, queue_id = ref.partition("#")
        resolved = (ROOT / path_text).resolve()
        if resolved != queue_path.resolve() or queue_id not in by_id:
            errors.append(f"{record_id}: missing or unresolved funded-human queue reference")
            continue
        entry = by_id[queue_id]
        matched.append(queue_id)
        if entry.get("decision_id") != record_id or entry.get("decision_revision") != record["review_revision"]:
            errors.append(f"{record_id}: queue references wrong decision/revision")
        for field in ("artifact", "artifact_revision", "sha256", "rule_ids"):
            if entry.get("target", {}).get(field) != record["target"].get(field):
                errors.append(f"{record_id}: queue target mismatch for {field}")
        if entry.get("conditions") != record["decision"].get("conditions"):
            errors.append(f"{record_id}: queue conditions differ from approval")
        if entry.get("state") != expected_state or record["human_revalidation"].get("state") != expected_state:
            errors.append(f"{record_id}: revalidation state inconsistent with funding declaration")
        if entry.get("human_review") is not None:
            errors.append(f"{record_id}: this provisional AI-record validator cannot certify a human review")
    if set(matched) != set(by_id):
        errors.append("queue: missing approval or extra entry not linked to a prescriptive approval")
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("records", type=Path)
    parser.add_argument("--queue", type=Path)
    args = parser.parse_args()
    records = records_from(load(args.records))
    errors = validate_records(records, load(SCHEMA))
    if args.queue:
        errors += validate_queue(records, load(args.queue), args.queue)
    elif any(r.get("disposition") in APPROVALS and r.get("scope", {}).get("prescriptive_impact") for r in records):
        errors.append("--queue is required for prescriptive-impact approvals")
    result = {"passed": not errors, "records": len(records), "errors": errors,
              "limits": "Record consistency only; source truth, applicability and clinical safety require competent review."}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
