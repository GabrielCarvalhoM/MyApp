# REPMILE V1 test-suite sanitization: builds CoachingCore/test/HISTORICAL_TESTS.json and evidence/inventory.json from
#   evidence/failures-90452b8.json   the 51 failures reproduced on 90452b8 (junit, read with ElementTree)
#   evidence/provenance.json         last green / first red of each, over the 73 first-parent commits touching CoachingCore
#   evidence/classification.json     the curated classification (category, kind, contract, successor prefixes)
#   evidence/titles-*.json           every test title and status (90452b8, and the tests this mission adds)
# A successor prefix must resolve to exactly one test, and that test must pass; otherwise this script stops.
#   python3 -I audits/v1-test-suite-sanitization-2026-11-25/evidence/build_manifest.py
import hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
BASE = '90452b8'
load = lambda n: json.load(open(os.path.join(HERE, n)))
fails, prov, cls = load('failures-90452b8.json'), load('provenance.json'), load('classification.json')
titles = load('titles-head.json')
head_fail = {(t['file'], t['name']): t['failLine'] for t in titles if t['status'] == 'failed'}
by_file = {}
for t in titles:
    by_file.setdefault(t['file'], []).append(t)

def resolve(pair):
    if isinstance(pair, str):
        pair = cls['T'][pair]
    f, prefix = pair
    hits = [t for t in by_file.get(f, []) if t['name'].startswith(prefix)]
    if len(hits) != 1:
        sys.exit(f'successor prefix resolves to {len(hits)} tests: {f}: {prefix}')
    if not hits[0]['ok']:
        sys.exit(f'successor is not passing: {f}: {hits[0]["name"]}')
    return {'file': f, 'title': hits[0]['name']}

def sha_at(commit, rel):
    return hashlib.sha256(subprocess.run(['git', '-C', ROOT, 'show', f'{commit}:CoachingCore/test/{rel}'], capture_output=True, check=True).stdout).hexdigest()

def first_line(stack):
    m = re.search(r'test/([\w.-]+\.mjs):(\d+):\d+', stack or '')
    return int(m.group(2)) if m else None

def title_line(rel, title):
    src = open(os.path.join(ROOT, 'CoachingCore', 'test', rel), encoding='utf8').read().split('\n')
    head = re.escape(title[:40].replace('"', '"'))
    for i, l in enumerate(src, 1):
        if re.search(r"test\(\s*['`]" + head, l.replace("\\'", "'")):
            return i
    return None

entries, inventory = [], []
for k in sorted(cls['items'], key=int):
    c, n = cls['items'][k], int(k)
    if c.get('new'):
        f = {'file': c['file'], 'name': c['title'], 'msg': '', 'text': ''}
        p = {'lastGreen': BASE, 'firstRed': '2c527f7'}
    else:
        f, p = fails[n - 1], prov[n - 1]
        assert p['file'] == f['file'] and p['title'] == f['name'].replace('&quot;', '"'), k
    title = f['name'].replace('&quot;', '"')
    belongs = p['lastGreen']
    if not belongs:
        sys.exit(f'{k}: no green commit found for {f["file"]}: {title[:80]}')
    red = p['firstRed'] or BASE
    sup_commit = red[:7]
    sup = cls['audits'].get(sup_commit)
    if not sup:
        sys.exit(f'{k}: no audit reference for {sup_commit}')
    succ = resolve(c['succ'])
    also = [resolve(a) for a in c.get('also', [])]
    fails_at = head_fail.get((f['file'], title))
    if not fails_at:
        sys.exit(f'{k}: does not fail on the current tree: {title[:80]}')
    if not c.get('new'):
        m = re.search(r'/test/' + re.escape(f['file']) + r':(\d+):\d+', f.get('text') or '')
        if not m or int(m.group(1)) != fails_at:
            sys.exit(f'{k}: fails at :{fails_at} on the current tree but at :{m and m.group(1)} on {BASE}')
    e = {
        'id': f'H{n:02d}', 'file': f['file'], 'title': title, 'line': title_line(f['file'], title) or first_line(f.get('text')),
        'category': c['cat'], 'kind': c['kind'], 'contract': c['contract'],
        'reason': ('Verifies the record of its own line: every later versioned amendment changes files it binds, so it fails on every later '
                   'line by design. The record stays byte-identical and is executed green at its own commit.') if c['kind'] == 'FREEZE_RECORD_OF_ITS_LINE' else
                  ('Pins a defect that was open on its line; a later versioned amendment closed it, so the pinned (unsafe or compensating) '
                   'expectation no longer holds. The successor asserts the closed behaviour.') if c['kind'] == 'PINNED_DEFECT_CLOSED_LATER' else
                  ('Asserts a contract that a later reviewed, versioned change replaced; the successor asserts the contract in force.'),
        'fileSha256': sha_at(BASE, f['file']),
        'belongsTo': {'commit': belongs[:7], 'meaning': 'the last commit (first parent, touching CoachingCore) where it passes, in its own tree'},
        'firstFailedAt': {'commit': red[:7], 'relation': 'AT'},
        'failsAt': {'line': fails_at, 'meaning': 'the assertion it fails at on the current tree (the same line as on 90452b8 for the 51)'},
        'supersededBy': f'{sup_commit}: {sup[0]} ({sup[1]})',
        'successor': succ, 'alsoCoveredBy': also,
    }
    if c.get('safety'):
        e['safetyPoint'] = c['safety']
    entries.append(e)
    inventory.append({**e, 'failure': {'message': re.sub(r'\s+', ' ', (f.get('msg') or '').replace('&quot;', '"'))[:900],
                                       'failingLine': first_line(f.get('text')), 'stackHead': '\n'.join((f.get('text') or '').split('\n')[:14])},
                      'provenance': p if not c.get('new') else {'note': 'fails from the first commit after 90452b8 (this mission adds test infrastructure)'}})

manifest = {
    'schema': 'REPMILE-V1-HISTORICAL-TESTS-1',
    'policy': 'audits/v1-test-suite-sanitization-2026-11-25/HISTORICAL_TEST_POLICY.md',
    'base': BASE,
    'note': ('Tests of earlier lines. npm test runs every discovered test unfiltered and requires each listed test to fail at failsAt.line '
             '(and every other test to pass); npm run test:historical runs each at belongsTo.commit, where it must pass. None is edited or deleted: '
             'fileSha256 pins its bytes. H52 and H53 are made historical by this mission (it adds test infrastructure).'),
    'entries': entries,
}
open(os.path.join(ROOT, 'CoachingCore', 'test', 'HISTORICAL_TESTS.json'), 'w').write(json.dumps(manifest, indent=1, ensure_ascii=False) + '\n')
open(os.path.join(HERE, 'inventory.json'), 'w').write(json.dumps({'base': BASE, 'reproduced': len(fails), 'entries': inventory}, indent=1, ensure_ascii=False) + '\n')
print(f'{len(entries)} entries; {sum(1 for e in entries if e["category"]=="A")} A, {sum(1 for e in entries if e["category"]=="B")} B')
