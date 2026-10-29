"""SSCTR R6: schema/record consistency and queue-proposal check with the project helper. Not scientific or runtime certification."""
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'audits/domain-closure-r3-2026-10-24/reviews/ssctr-python-dependencies'))
spec = importlib.util.spec_from_file_location('ssctr_record_helper', ROOT / '.agents/skills/sports-science-review/scripts/validate_records.py')
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)
records = helper.records_from(helper.load(BASE / 'ssctr-records.json'))
schema = helper.load(ROOT / 'governance/agents/sports-science-reviewer/decision.schema.json')
proposal = helper.load(BASE / 'ssctr-proposed-queue-items.json')
destination = ROOT / proposal['destination']
actual = helper.load(destination)
errors = helper.validate_records(records, schema, ROOT)
proposal_errors = helper.validate_queue(records, dict(proposal, funding_trigger=actual['funding_trigger']), destination)
policy_review = helper.load(BASE / 'ssctr-policy-review.json')
cross = []
by_id = {r['review_id']: r for r in records}
for rec in policy_review['records']:
    r = by_id.get(rec['reviewId'])
    if not r:
        cross.append(f"{rec['boundaryId']}: no schema record")
        continue
    if rec['disposition'] != r['disposition'] or rec['evidenceStatus'] != r['evidence_status'] or rec['conditions'] != r['decision']['conditions']:
        cross.append(f"{rec['boundaryId']}: policy review and schema record differ")
    if rec['policyHash'] != policy_review['policyHash']:
        cross.append(f"{rec['boundaryId']}: policyHash mismatch")
result = {'revision': 'R6-SSCTR-SCHEMA-1', 'validator': '.agents/skills/sports-science-review/scripts/validate_records.py (jsonschema 4.26.0, Python ' + sys.version.split()[0] + ')',
          'passed': not errors and not proposal_errors and not cross, 'records': len(records), 'recordErrors': errors,
          'queueProposalConsistent': not proposal_errors, 'queueProposalErrors': proposal_errors,
          'policyReviewCrossCheckErrors': cross,
          'actualQueueMergeObserved': False, 'authoritativeQueueEntries': len(actual['items']),
          'limits': 'Schema, target-hash, source-link and proposal consistency only. The authoritative queue was not edited; merge is a separate owner action. No scientific truth, runtime enforcement or clinical safety is certified.'}
(BASE / 'ssctr-schema-validation.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result, indent=2))
raise SystemExit(0 if result['passed'] else 1)
