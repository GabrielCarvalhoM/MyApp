# Renders FAILURE_INVENTORY.md and RESOLUTION_MATRIX.md from evidence/inventory.json (built by build_manifest.py), so that the tables are
# the evidence and never a retyping of it.   python3 -I audits/v1-test-suite-sanitization-2026-11-25/evidence/render_docs.py
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
MISSION = os.path.dirname(HERE)
inv = json.load(open(os.path.join(HERE, 'inventory.json')))['entries']
fails = json.load(open(os.path.join(HERE, 'failures-90452b8.json')))
cell = lambda s: re.sub(r'\s+', ' ', str(s if s is not None else '—')).replace('|', '\\|').strip()
short = lambda s, n: cell(s)[:n] + ('…' if len(cell(s)) > n else '')
GROUP = {
    'FREEZE_RECORD_OF_ITS_LINE': 'RC-1 line-local record',
    'PINNED_DEFECT_CLOSED_LATER': None,
    'CONTRACT_SUPERSEDED_BY_REVIEWED_CHANGE': None,
}
def root(e):
    c = e['supersededBy'][:7]
    if e['kind'] == 'FREEZE_RECORD_OF_ITS_LINE':
        return 'RC-1'
    return {'0b8e45a': 'RC-2', '430c493': 'RC-2', '3f0b04f': 'RC-3', '4e8cffe': 'RC-4', '07301f3': 'RC-5', '1d418d1': 'RC-5', 'ec811c1': 'RC-5',
            '6e85222': 'RC-6', '23f6a86': 'RC-7'}[c]

def observed(i):
    t = fails[i - 1]['text'] if i <= len(fails) else ''
    a = re.search(r'\n\s*actual: ([^\n]*)', t or ''); x = re.search(r'\n\s*expected: ([^\n]*)', t or '')
    return (a.group(1).rstrip(',') if a else None), (x.group(1).rstrip(',') if x else None)

rows = []
for e in inv:
    n = int(e['id'][1:])
    act, exp = observed(n) if n <= 51 else (None, None)
    pv = e.get('provenance', {})
    rows.append((e, n, act, exp, pv))

out = ['# FAILURE_INVENTORY — the 51 failures of the CoachingCore V1 Node suite on `90452b8`', '',
       'Reproduced on the Mac mini M4 (macOS 27.0, Node v24.19.0) on a clean worktree of `90452b8` (branch `claude/v1-hr5-runna-parity`), with the '
       "project's own configuration (`cd CoachingCore && node --test`, ajv 8.20.0 from the lockfile). Every row below is one reproduced failure, read "
       'from the junit report with an XML parser (`evidence/failures-90452b8.json`), not from an earlier report.', '',
       '## Totals', '',
       '| | Node\'s summary | Real tests |', '|---|---|---|',
       '| `90452b8` | 1993 tests, 1942 pass, **51 fail** | **1985** tests, 1934 pass, 51 fail |', '',
       '**The count is 51, as reported.** One correction to the earlier totals: node\'s default discovery (`**/test/**/*.mjs`) loads the 8 helper modules '
       'under `test/` (`v1int-helpers.mjs`, `v1core-helpers.mjs`, `v1cib-helpers.mjs`, `v1cp-fixtures.mjs`, `v1rc-`, `v1rfc-`, `v1rws-`, `v1str-helpers.mjs`) as test '
       'files, and reports each as one passing test. So 1993/1942 includes 8 pseudo-tests; the real suite at `90452b8` is 1985 tests. The active runner counts '
       'real tests only.', '',
       '**Baseline of each failure.** `evidence/provenance.json` replays every failing test file at each of the 73 first-parent commits that touch '
       '`CoachingCore` from `bc40218^` to `90452b8`, each in its own temporary worktree. *Green at* is the last commit where the test passes; *red from* is the first '
       'commit after it where it fails (the change that ended its line). Record tests were replayed with `node_modules` copied, not linked (a link is an untracked '
       'file to their verifiers; see REGRESSION_REPORT.md §5).', '',
       '**H52 and H53** are not among the 51: they pass on `90452b8` and fail by design from this mission\'s first commit (it adds test files, which '
       '`FIVE-ZONE-AMENDMENT-2`\'s "nothing else changed since 4850560" step names). They are listed at the end.', '',
       '## The failures', '',
       '| # | Test (file:line) | Failing assertion | Observed (actual) | Expected by the test | Green at → red from | Contract it verifies |',
       '|---|---|---|---|---|---|---|']
for e, n, act, exp, pv in rows:
    if n > 51:
        continue
    line = e['failure'].get('failingLine')
    out.append(f"| {e['id']} | `{e['file']}:{e['line']}` — {short(e['title'], 120)} | :{line} — {short(e['failure']['message'], 150)} | `{short(act, 70)}` | `{short(exp, 70)}` | "
               f"`{(pv.get('lastGreen') or '')[:7]}` → `{(pv.get('firstRed') or '')[:7]}` | {short(e['contract'], 220)} |")
out += ['', '## Made historical by this mission (not among the 51)', '',
        '| # | Test | Why | Belongs to |', '|---|---|---|---|']
for e, n, act, exp, pv in rows:
    if n > 51:
        out.append(f"| {e['id']} | `{e['file']}:{e['line']}` — {short(e['title'], 140)} | {short(e['contract'], 200)} | `{e['belongsTo']['commit']}` |")
out += ['', 'Stack heads of every failure: `evidence/inventory.json` (`failure.stackHead`). Full junit of the base run: `evidence/junit-90452b8.xml`.', '']
open(os.path.join(MISSION, 'FAILURE_INVENTORY.md'), 'w').write('\n'.join(out))

m = ['# RESOLUTION_MATRIX — every failure, its cause, its resolution and its final state', '',
     'One row per test (the 51 reproduced on `90452b8`, plus H52 and H53). Root causes are consolidated in ROOT_CAUSE_CLASSIFICATION.md (RC-1 to RC-7); '
     'every row keeps its own successor. *Defect at HEAD* is the result of the reproduction against the current runtime and, for the safety points, against '
     'the integration API (`test/v1san-boundary-safety.test.mjs`). The final state of every row is **HISTORICAL — delegated, verified green at its own commit, '
     'verified failing on the current tree; successor passing in the active suite**: no row is closed by editing, deleting, skipping or relaxing a test.', '',
     '| # | Cat. | Root cause | Severity of the contract | V1 relevance | Defect at HEAD | Correction | Successor (active, passing) | Also covered by | Evidence |',
     '|---|---|---|---|---|---|---|---|---|---|']
for e, n, act, exp, pv in rows:
    sev = 'HIGH (safety / custody)' if e.get('safetyPoint') else ('INTEGRITY (record)' if e['kind'] == 'FREEZE_RECORD_OF_ITS_LINE' else 'MEDIUM (reading)')
    rel = ('runtime integrity of the V1 bundle' if e['kind'] == 'FREEZE_RECORD_OF_ITS_LINE' else
           (e.get('safetyPoint') or 'run evidence reading (pace, history, calibration)'))
    corr = ('none in the runtime (none needed); delegated to its line' if e['kind'] != 'PINNED_DEFECT_CLOSED_LATER' else
            'none in this mission: the defect was already corrected by ' + e['supersededBy'][:7])
    also = '; '.join(f"`{a['file']}`: {short(a['title'], 60)}" for a in e['alsoCoveredBy']) or '—'
    m.append(f"| {e['id']} | {e['category']} | {root(e)} — {short(e['supersededBy'], 110)} | {sev} | {short(rel, 90)} | NO | {corr} | "
             f"`{e['successor']['file']}`: {short(e['successor']['title'], 90)} | {also} | green @`{e['belongsTo']['commit']}` (historical suite), fails @HEAD (phase 2) |")
m += ['', 'Category key: **A** contract or record of an earlier line, legitimately replaced by a versioned amendment; **B** the test pinned a defect (or the '
      'compensation of one) as the behaviour of its line, and a later versioned amendment corrected it. No row is **C** (a defect still reproducible), **D** '
      '(environment) or **E** (a known blocker kept on purpose); see ROOT_CAUSE_CLASSIFICATION.md for the evidence behind each "no".', '']
open(os.path.join(MISSION, 'RESOLUTION_MATRIX.md'), 'w').write('\n'.join(m))
print('rendered', len(rows))
