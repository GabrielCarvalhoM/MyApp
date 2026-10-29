"""Run the actual project helper against R3 records and an in-memory R3 queue projection."""
from pathlib import Path
import importlib.util
import json
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(HERE / 'ssctr-python-dependencies'))
HELPER = ROOT / '.agents/skills/sports-science-review/scripts/validate_records.py'
spec = importlib.util.spec_from_file_location('project_ssctr_validator', HELPER)
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)
records = helper.records_from(helper.load(HERE / 'ssctr-records.json'))
queue_path = ROOT / 'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'
queue = helper.load(queue_path)
ids = {r['review_id'] for r in records}
projected = dict(queue, items=[x for x in queue['items'] if x.get('decision_id') in ids])
errors = helper.validate_records(records, helper.load(helper.SCHEMA))
errors += helper.validate_queue(records, projected, queue_path)
output = {
    'bindingRecheckedOn': '2026-10-25',
    'passed': not errors,
    'records': len(records),
    'errors': errors,
    'helper': str(HELPER.relative_to(ROOT)).replace('\\', '/'),
    'dependencies': 'jsonschema4.26.0 and dependencies installed only under reviews/ssctr-python-dependencies; no global environment change',
    'queueValidation': {
        'scope': 'R3_ONLY_IN_MEMORY_PROJECTION_OF_SINGLE_AUTHORITATIVE_QUEUE',
        'totalAuthoritativeQueueEntries': len(queue['items']),
        'newApprovedEntries': len(projected['items']),
        'newQueueCreated': False,
    },
    'limits': 'Record/target/claim/queue consistency only; not global historical queue certification, source truth, product efficacy or clinical safety.',
}
(HERE / 'ssctr-schema-validation.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(output, ensure_ascii=False, indent=2))
raise SystemExit(0 if not errors else 1)
