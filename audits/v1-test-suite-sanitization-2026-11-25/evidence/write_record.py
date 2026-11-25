# Writes audits/v1-test-suite-sanitization-2026-11-25/SANITIZATION_RECORD.json: the bytes of the historical layer (QRE_SAN_R1 QRE-SAN-04).
# The record binds the manifest, the three suite scripts, package.json and every test file that holds a successor or an alsoCoveredBy test, so
# that weakening a successor, or adding a manifest entry for a test that regressed, cannot pass npm test without a new, reviewed record version.
# test/v1san-record.test.mjs checks the record against the commit that wrote it, and the files against the record.
#   python3 -I audits/v1-test-suite-sanitization-2026-11-25/evidence/write_record.py
import hashlib, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
MISSION = os.path.dirname(HERE)
ROOT = os.path.abspath(os.path.join(MISSION, '..', '..'))
CORE = os.path.join(ROOT, 'CoachingCore')
m = json.load(open(os.path.join(CORE, 'test', 'HISTORICAL_TESTS.json')))
files = ['CoachingCore/test/HISTORICAL_TESTS.json', 'CoachingCore/package.json',
         'CoachingCore/scripts/suite-active.mjs', 'CoachingCore/scripts/suite-historical.mjs', 'CoachingCore/scripts/suite-manifest.mjs']
succ = sorted({'CoachingCore/test/' + x['file'] for e in m['entries'] for x in [e['successor'], *e['alsoCoveredBy']]})
sha = lambda f: hashlib.sha256(open(os.path.join(ROOT, f), 'rb').read()).hexdigest()
bound = {f: sha(f) for f in files + succ}
rec = {
    'revision': 'REPMILE-COACHINGCORE-V1-TEST-SUITE-SANITIZATION-1',
    'kind': 'TEST_INFRASTRUCTURE_RECORD (no runtime byte; the runtime is bound by REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2)',
    'policy': 'audits/v1-test-suite-sanitization-2026-11-25/HISTORICAL_TEST_POLICY.md',
    'base': '90452b8',
    'historicalEntries': len(m['entries']),
    'successorFiles': succ,
    'files': bound,
    'filesDigest': hashlib.sha256(json.dumps(bound, sort_keys=True).encode()).hexdigest(),
}
open(os.path.join(MISSION, 'SANITIZATION_RECORD.json'), 'w').write(json.dumps(rec, indent=1) + '\n')
print(f"{len(bound)} files bound ({len(succ)} successor files)")
