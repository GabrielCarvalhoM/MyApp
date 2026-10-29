"""Current record consistency and queue-proposal check; not clinical/scientific efficacy."""
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT / 'audits/domain-closure-r4-2026-10-25'
sys.path.insert(0, str(ROOT / 'audits/domain-closure-r3-2026-10-24/reviews/ssctr-python-dependencies'))
helper_path = ROOT / '.agents/skills/sports-science-review/scripts/validate_records.py'
spec = importlib.util.spec_from_file_location('ssctr_record_helper', helper_path)
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)
records = helper.records_from(helper.load(BASE / 'reviews/ssctr-records.json'))
schema = helper.load(ROOT / 'governance/agents/sports-science-reviewer/decision.schema.json')
proposal = helper.load(BASE / 'reviews/ssctr-proposed-queue-items.json')
destination = ROOT / proposal['destination']
queue = helper.load(destination)
errors = helper.validate_records(records, schema, ROOT)
errors += helper.validate_queue(records, dict(proposal, funding_trigger=queue['funding_trigger']), destination)
ids = {row['queue_id'] for row in queue['items']}
merged = all(row['queue_id'] in ids for row in proposal['items'])
decision_ids = {row['review_id'] for row in records}
projected = dict(queue, items=[row for row in queue['items'] if row.get('decision_id') in decision_ids])
actual_errors = helper.validate_queue(records, projected, destination)
errors += actual_errors
result = {'passed': not errors, 'records': len(records), 'errors': errors,
          'queueProposalConsistent': not errors, 'actualGlobalQueueMergeObserved': merged,
          'queueValidation': {'scope': 'R4_ONLY_IN_MEMORY_PROJECTION_OF_SINGLE_AUTHORITATIVE_QUEUE',
                              'totalAuthoritativeQueueEntries': len(queue['items']),
                              'newApprovedEntries': len(projected['items']),
                              'fundingState': queue['funding_trigger']['state'],
                              'actualQueueConditionsAndRevisionsMatch': not actual_errors},
          'limits': 'Schema, references, exact registry bytes and current R4 queue correspondence only; not historical queue certification, source truth or runtime enforcement.'}
(BASE / 'reviews/ssctr-schema-validation.json').write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8')
print(json.dumps(result, indent=2))
raise SystemExit(0 if not errors else 1)
