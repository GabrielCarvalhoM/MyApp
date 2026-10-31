# R7-A formal closure — read-only identity check (Founder closure request §3, §4).
# Proves that both narrow rechecks judged R7A-RESIDUAL-AUTHORITY-FREEZE-1 and that the closure branch changes no bound byte.
# Reads git objects and the working tree only; runs no runtime code, test, probe or author script, and writes nothing.
# The canonical serializer is re-implemented here (sorted keys, JSON primitives), not imported from the runtime.
# Usage, from the repository root: python3 -I audits/domain-coaching-r7a-residual-authority-2026-10-30/closure/identity-check.py
import hashlib, json, os, subprocess

FREEZE_COMMIT = '7d2da3603e224124696a2290766ec448080f3264'
HANDOFF_COMMIT = '4917489364bb1138f8d82b46c20dd65d1bf693c7'
REVIEWS = {
    'engineering': {'commit': '2dbafa3cebb3069b003b17506884f756b3d7e5f3', 'branch': 'review/r7ara-residual-authority-engineering',
                    'record': 'reviews/ENGINEERING_RECHECK.json', 'primary': 'reviews/ENGINEERING_RECHECK.md'},
    'ssctr': {'commit': 'b715dfd763da28b682428dbe38033d6a21ec45b8', 'branch': 'review/r7ara-residual-authority-ssctr',
              'record': 'reviews/ssctr-recheck/ssctr-r7ara-recheck.json', 'primary': 'reviews/SSCTR_RECHECK.md'},
}
AUDIT = 'audits/domain-coaching-r7a-residual-authority-2026-10-30/'
FREEZE_RECORD = 'CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json'
EXPECTED = {'revision': 'R7A-RESIDUAL-AUTHORITY-FREEZE-1',
            'sourceDigest': 'e7172eb2e65bfb1da4c102a7efa2bae64bf1c70b06562fd3ce9896defd6dc17d',
            'manifestDigest': '3d214fb53f62e45ca7d99f39f2c562d358719a2264c2de46098d39b318c85125',
            'policyHash': '18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c'}

root = subprocess.run(['git', 'rev-parse', '--show-toplevel'], capture_output=True, text=True, check=True).stdout.strip()
git = lambda *a: subprocess.run(['git', *a], cwd=root, capture_output=True, check=True).stdout
show = lambda commit, path: git('show', f'{commit}:{path}')
sha = lambda b: hashlib.sha256(b).hexdigest()

def canonical(v):
    if v is None or not isinstance(v, (dict, list)):
        return json.dumps(v, ensure_ascii=False, separators=(',', ':'))
    if isinstance(v, list):
        return '[' + ','.join(canonical(x) for x in v) + ']'
    return '{' + ','.join(json.dumps(k, ensure_ascii=False) + ':' + canonical(v[k]) for k in sorted(v)) + '}'

H = lambda v: hashlib.sha256(canonical(v).encode()).hexdigest()
record_bytes = show(FREEZE_COMMIT, FREEZE_RECORD)
record = json.loads(record_bytes)
files = record['files']

def bound(read, listing):
    live = {}
    for p in files:
        try:
            live[p] = sha(read('CoachingCore/' + p))
        except (subprocess.CalledProcessError, FileNotFoundError):
            live[p] = None
    drift = sorted(p for p, h in files.items() if live[p] != h)
    unbound = sorted(t for t in listing if t.endswith('.mjs') and t.count('/') == 2 and t.removeprefix('CoachingCore/') not in files)
    return {'boundMatch': f'{len(files) - len(drift)}/{len(files)}', 'drift': drift, 'unboundSrcTest': unbound,
            'sourceDigest': H({p: h for p, h in live.items() if p.startswith('src/')}), 'manifestDigest': H(live)}

def at_commit(c):
    listing = git('ls-tree', '-r', '--name-only', c, 'CoachingCore/src', 'CoachingCore/test').decode().split()
    r = bound(lambda p: show(c, p), listing)
    r['freezeRecordSha256'] = sha(show(c, FREEZE_RECORD))
    return r

def at_worktree():
    listing = [os.path.join('CoachingCore', d, f) for d in ('src', 'test') for f in os.listdir(os.path.join(root, 'CoachingCore', d))]
    r = bound(lambda p: open(os.path.join(root, p), 'rb').read(), listing)
    r['freezeRecordSha256'] = sha(open(os.path.join(root, FREEZE_RECORD), 'rb').read())
    return r

out = {'revision': 'R7A-CLOSURE-IDENTITY-CHECK-1', 'freezeCommit': FREEZE_COMMIT, 'handoffCommit': HANDOFF_COMMIT,
       'freezeRecord': {'path': FREEZE_RECORD, 'sha256': sha(record_bytes), 'revision': record['revision'],
                        'sourceDigest': record['sourceDigest'], 'manifestDigest': record['manifestDigest'],
                        'policyHash': record['policyHash'], 'boundFiles': len(files)}}
policy = json.loads(show(FREEZE_COMMIT, 'CoachingCore/r6/PROGRAM_POLICY_R6.json'))
out['policyCanonicalHashRecomputed'] = H(policy)
trees = {'freeze': FREEZE_COMMIT, 'handoff': HANDOFF_COMMIT, **{k + 'Review': v['commit'] for k, v in REVIEWS.items()}}
out['trees'] = {k: at_commit(c) for k, c in trees.items()}
out['trees']['closureWorktree'] = at_worktree()
handoff_delta = git('diff', '--name-status', FREEZE_COMMIT, HANDOFF_COMMIT).decode().splitlines()
out['handoffDeltaFromFreeze'] = handoff_delta
out['freezeIsAncestorOfHandoff'] = subprocess.run(['git', 'merge-base', '--is-ancestor', FREEZE_COMMIT, HANDOFF_COMMIT], cwd=root).returncode == 0

out['reviews'] = {}
for k, v in REVIEWS.items():
    delta = git('diff', '--name-status', HANDOFF_COMMIT, v['commit']).decode().splitlines()
    statuses = sorted({line.split('\t')[0] for line in delta})
    outside = [line for line in delta if not line.split('\t')[1].startswith(AUDIT + 'reviews/')]
    rec = json.loads(show(v['commit'], AUDIT + v['record']))
    entry = {'branch': v['branch'], 'commit': v['commit'],
             'parentIsHandoff': git('rev-parse', v['commit'] + '^').decode().strip() == HANDOFF_COMMIT,
             'filesAdded': len(delta), 'statuses': statuses, 'outsideReviews': outside,
             'primaryArtifact': {'path': AUDIT + v['primary'], 'sha256': sha(show(v['commit'], AUDIT + v['primary']))},
             'record': {'path': AUDIT + v['record'], 'sha256': sha(show(v['commit'], AUDIT + v['record']))}}
    if k == 'engineering':
        f = rec['freeze']
        entry.update({'verdict': rec['verdict'], 'recheckInvalid': rec['recheckInvalid'], 'judged': {
            'revision': f['revision'], 'runtimeCommit': f['freezeCommit'], 'sourceDigest': f['sourceDigest'], 'manifestDigest': f['manifestDigest'], 'policyHash': f['policy']['hash']}})
    else:
        f = rec['freezeReviewed']
        entry.update({'verdict': rec['verdictLines']['founder'], 'briefVerdict': rec['verdictLines']['brief'], 'recheckInvalid': rec['recheckInvalid'], 'judged': {
            'revision': f['revision'], 'runtimeCommit': f['runtimeCommit'], 'sourceDigest': f['sourceDigest'], 'manifestDigest': f['manifestDigest'], 'policyHash': f['policyHash'], 'freezeRecordSha256': f['fileSha256']}})
    entry['judgedEqualsFreeze'] = (entry['judged']['revision'] == EXPECTED['revision'] and entry['judged']['runtimeCommit'] == FREEZE_COMMIT
                                   and all(entry['judged'][x] == EXPECTED[x] for x in ('sourceDigest', 'manifestDigest', 'policyHash')))
    out['reviews'][k] = entry

# After the closure: the residual authority baseline binds closed history; only the files this closure appends to may move.
# The two mission files are append-only (as in verify-r7ara.mjs): the handoff commit's bytes must be a prefix of the live file.
MISSION_FILES = ('CURRENT_MISSION.md', 'MISSION_LEDGER.md')
baseline = json.loads(open(os.path.join(root, AUDIT, 'BASELINE.json')).read())
own = ('CoachingCore/src/', 'CoachingCore/test/', 'CoachingCore/scripts/', 'CoachingCore/r7/residual-authority/', AUDIT)
moved = []
for e in baseline['entries']:
    if e['path'].startswith(own) or e['path'] in MISSION_FILES:
        continue
    p = os.path.join(root, e['path'])
    if not os.path.exists(p) or sha(open(p, 'rb').read()) != e['sha256']:
        moved.append(e['path'])
out['baselineClosedHistoryMovedInWorktree'] = moved
out['missionFilesAppendOnlySinceHandoff'] = {f: open(os.path.join(root, f), 'rb').read().startswith(show(HANDOFF_COMMIT, f)) for f in MISSION_FILES}

ok = (all(t['drift'] == [] and t['unboundSrcTest'] == [] and t['sourceDigest'] == EXPECTED['sourceDigest'] and t['manifestDigest'] == EXPECTED['manifestDigest']
          and t['freezeRecordSha256'] == out['freezeRecord']['sha256'] for t in out['trees'].values())
      and out['policyCanonicalHashRecomputed'] == EXPECTED['policyHash'] and out['freezeIsAncestorOfHandoff']
      and all(out['missionFilesAppendOnlySinceHandoff'].values())
      and all(r['judgedEqualsFreeze'] and r['recheckInvalid'] == 'NO' and r['parentIsHandoff'] and r['statuses'] == ['A'] and not r['outsideReviews'] for r in out['reviews'].values()))
out['sameFreezeJudgedByBoth'] = ok
out['R7A_FORMAL_CLOSURE_IDENTITY'] = 'VALID' if ok else 'INVALID'
print(json.dumps(out, indent=1, ensure_ascii=False))
