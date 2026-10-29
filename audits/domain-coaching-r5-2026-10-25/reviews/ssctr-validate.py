"""Schema and exact queue-proposal check; current queue merge separately observed."""
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT/'audits/domain-closure-r3-2026-10-24/reviews/ssctr-python-dependencies'))
spec = importlib.util.spec_from_file_location('ssctr_record_helper', ROOT/'.agents/skills/sports-science-review/scripts/validate_records.py')
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)
records = helper.records_from(helper.load(BASE/'ssctr-records.json'))
schema = helper.load(ROOT/'governance/agents/sports-science-reviewer/decision.schema.json')
proposal = helper.load(BASE/'ssctr-proposed-queue-items.json')
destination = ROOT/proposal['destination']
actual = helper.load(destination)
errors = helper.validate_records(records, schema, ROOT)
proposal_errors = helper.validate_queue(records, dict(proposal, funding_trigger=actual['funding_trigger']), destination)
errors += proposal_errors
review_ids = {r['review_id'] for r in records}
projected = dict(actual, items=[e for e in actual['items'] if e.get('decision_id') in review_ids])
actual_errors = helper.validate_queue(records, projected, destination)
result = {'revision':'R5-SSCTR-SCHEMA-1','passed':not errors,'records':len(records),'errors':errors,
          'queueProposalConsistent':not proposal_errors,'actualGlobalQueueMergeObserved':not actual_errors,
          'actualQueueErrors':actual_errors,'totalAuthoritativeQueueEntries':len(actual['items']),
          'limits':'passed certifies schema/current target/proposal consistency only. Actual merge must also be true for activation; no scientific truth or runtime-enforcement certification.'}
(BASE/'ssctr-schema-validation.json').write_text(json.dumps(result, indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,indent=2))
raise SystemExit(0 if not errors else 1)
