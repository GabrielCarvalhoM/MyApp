# Writes audits/v1-test-suite-sanitization-2026-11-25/HISTORICAL_LAYER_RECORD.json (REPMILE-COACHINGCORE-V1-TEST-SUITE-SANITIZATION-2), the record
# of the historical layer after QRE_SAN_R2 (QRE-SAN-10/-11). It supersedes SANITIZATION_RECORD.json (-1, kept unchanged as history), which did not
# bind its own check nor the code the successors depend on. The record is committed ALONE, once, and never modified: suite-manifest.mjs's
# layerRecordErrors() proves that from git's history. A later change to the layer is a new record file, never an edit of this one.
#   python3 -I audits/v1-test-suite-sanitization-2026-11-25/evidence/write_layer_record.py
import hashlib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
MISSION = os.path.dirname(HERE)
ROOT = os.path.abspath(os.path.join(MISSION, '..', '..'))
OUT = os.path.join(MISSION, 'HISTORICAL_LAYER_RECORD.json')
if os.path.exists(OUT):
    sys.exit('the record exists; a change to the layer is a new record file (a new version), never a rewrite')
os.chdir(ROOT)
m = json.load(open('CoachingCore/test/HISTORICAL_TESTS.json'))
core = ['CoachingCore/test/HISTORICAL_TESTS.json', 'CoachingCore/package.json', 'CoachingCore/scripts/suite-active.mjs',
        'CoachingCore/scripts/suite-historical.mjs', 'CoachingCore/scripts/suite-manifest.mjs', 'CoachingCore/test/v1san-record.test.mjs']
succ = sorted({'CoachingCore/test/' + x['file'] for e in m['entries'] for x in [e['successor'], *e['alsoCoveredBy']]})
# Everything the successors (and the record test) import outside src/ (the runtime, bound by FIVE-ZONE-AMENDMENT-2 through
# v1san-runtime-integrity), transitively, and every CoachingCore verifier script they name.
seen, todo, scripts = set(), list(succ) + ['CoachingCore/test/v1san-record.test.mjs'], set()
while todo:
    f = todo.pop()
    if f in seen or not os.path.exists(f):
        continue
    seen.add(f)
    src = open(f, encoding='utf8').read()
    for spec in re.findall(r"""(?:from\s*|import\s*\(\s*)['"](\.{1,2}/[^'"]+)['"]""", src):
        t = os.path.normpath(os.path.join(os.path.dirname(f), spec))
        if not t.startswith('CoachingCore/src/'):
            todo.append(t)
    for s in re.findall(r"""['"]([\w-]+\.mjs)['"]""", src):
        p = 'CoachingCore/scripts/' + s
        if os.path.exists(p):
            scripts.add(p)
deps = sorted((seen | scripts) - set(succ) - set(core))
sha = lambda f: hashlib.sha256(open(f, 'rb').read()).hexdigest()
bound = {f: sha(f) for f in sorted(set(core + succ + deps))}
rec = {
    'revision': 'REPMILE-COACHINGCORE-V1-TEST-SUITE-SANITIZATION-2',
    'supersedes': 'REPMILE-COACHINGCORE-V1-TEST-SUITE-SANITIZATION-1 (SANITIZATION_RECORD.json, kept unchanged as history)',
    'kind': 'TEST_INFRASTRUCTURE_RECORD (no runtime byte; the runtime is bound by REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2)',
    'rule': 'written by exactly one commit and never modified; a change to the layer is a new record file',
    'policy': 'audits/v1-test-suite-sanitization-2026-11-25/HISTORICAL_TEST_POLICY.md',
    'base': '90452b8',
    'historicalEntries': len(m['entries']),
    'core': core, 'successorFiles': succ, 'dependencies': deps,
    'files': bound,
    'filesDigest': hashlib.sha256(json.dumps(bound, sort_keys=True, separators=(',', ':')).encode()).hexdigest(),
}
open(OUT, 'w').write(json.dumps(rec, indent=1) + '\n')
print(f'{len(bound)} files bound: {len(core)} core, {len(succ)} successor files, {len(deps)} dependencies')
