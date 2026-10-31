// R7-B0 integrity verification. Read-only by default; --write records only
// audits/domain-coaching-r7-b0-2026-10-31/VERIFICATION.json. It runs no test, no npm script and no
// verify-r* script; the historical baseline verifier is executed read-only (it writes only with --write).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync, spawnSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
process.chdir(root);
const A = 'audits/domain-coaching-r7-b0-2026-10-31/';
const BASE = '373a2d682a18d4f02be57299d6ab4c1493aee36f', CLOSURE = '2263d1a1a5034eea20e0bd0fa7a8db049f4a2671', FZ = '7d2da3603e224124696a2290766ec448080f3264';
const FR = 'CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json';
const Q = 'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json';
const git = (...a) => execFileSync('git', a, {maxBuffer: 256 * 1024 * 1024});
const txt = (...a) => git(...a).toString('utf8').trim();
const show = (r, p) => git('show', r + ':' + p);
const read = p => fs.readFileSync(p);
const json = p => JSON.parse(read(p).toString('utf8'));
const sha = b => createHash('sha256').update(b).digest('hex');
const canonical = v => v === null || typeof v !== 'object' ? JSON.stringify(v) : Array.isArray(v) ? '[' + v.map(canonical).join(',') + ']' : '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
const hash = v => sha(canonical(v));
const lines = b => b.toString('utf8').split('\n').map(s => s.trim()).filter(Boolean);
const checks = [];
const check = (id, ok, detail) => checks.push({id, pass: !!ok, detail});

// Batch-compare every blob of a tree with the working file.
const tree = (ref, p) => lines(git('ls-tree', '-r', '-l', ref, '--', p)).map(l => { const m = l.match(/^\d+ blob ([0-9a-f]+)\s+(\d+)\t(.+)$/); if (!m) throw Error('Unexpected tree record ' + l); return {oid: m[1], size: Number(m[2]), path: m[3]}; });
function blobsEqual(entries) {
  const out = []; let next = 0;
  while (next < entries.length) {
    const group = []; let total = 0;
    do { const e = entries[next++]; group.push(e); total += e.size; } while (next < entries.length && total + entries[next].size < 96 * 1024 * 1024);
    const raw = execFileSync('git', ['cat-file', '--batch'], {input: group.map(e => e.oid + '\n').join(''), maxBuffer: 256 * 1024 * 1024}); let at = 0;
    for (const e of group) { const end = raw.indexOf(10, at), size = Number(raw.subarray(at, end).toString().split(' ')[2]); at = end + 1; const bytes = raw.subarray(at, at + size); at += size + 1; out.push({...e, equal: fs.existsSync(e.path) && read(e.path).equals(bytes)}); }
  }
  return out;
}

// I01 freeze record, 86 bound files and digests
const f = json(FR), live = Object.fromEntries(Object.keys(f.files).map(p => [p, sha(read('CoachingCore/' + p))]));
const drift = Object.entries(f.files).filter(([p, h]) => live[p] !== h).map(([p]) => p);
const digests = {source: hash(Object.fromEntries(Object.entries(live).filter(([p]) => p.startsWith('src/')))), manifest: hash(live), policy: hash(json('CoachingCore/r6/PROGRAM_POLICY_R6.json'))};
check('I01-freeze-86-files-and-digests', read(FR).equals(show(FZ, FR)) && Object.keys(live).length === 86 && !drift.length && digests.source === f.sourceDigest && digests.manifest === f.manifestDigest && digests.policy === f.policyHash && digests.policy === '18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c', {freeze: f.revision, boundFiles: Object.keys(live).length, drift, digests});

// I02 every CoachingCore file of the freeze commit and of the formal closure is byte-identical
const frozenCore = blobsEqual(tree(FZ, 'CoachingCore')), closureCore = blobsEqual(tree(CLOSURE, 'CoachingCore'));
const frozenDrift = frozenCore.filter(e => !e.equal).map(e => e.path), closureDrift = closureCore.filter(e => !e.equal).map(e => e.path);
check('I02-frozen-and-closed-core-unchanged', !frozenDrift.length && !closureDrift.length, {frozenCoreFiles: frozenCore.length, closureCoreFiles: closureCore.length, frozenDrift, closureDrift});

// I03 bounded diff scope against the baseline (committed, staged, unstaged and new files of this mission)
const preexistingUntracked = ['.agents/skills/ig-', '.claude/skills/', '.instagram/', 'docs/', 'tools/', 'vendor/'];
const changed = [...new Set([...lines(git('diff', '--name-only', BASE, 'HEAD')), ...lines(git('diff', '--name-only', 'HEAD')), ...lines(git('diff', '--name-only', '--cached')), ...lines(git('ls-files', '--others', '--exclude-standard')).filter(p => !preexistingUntracked.some(x => p.startsWith(x)))])].sort();
const allowedPrefixes = ['CoachingCore/r7/b0/', A], allowedFiles = ['CURRENT_MISSION.md', 'MISSION_LEDGER.md', 'canon/CANONICAL_INDEX.md', Q];
const outside = changed.filter(p => !allowedPrefixes.some(x => p.startsWith(x)) && !allowedFiles.includes(p));
const modifiedExisting = lines(git('diff', '--name-status', BASE)).filter(l => l.startsWith('M') || l.startsWith('D') || l.startsWith('R')).map(l => l.split('\t').pop());
check('I03-bounded-diff-scope', !outside.length && modifiedExisting.every(p => allowedFiles.includes(p)), {changed, outside, modifiedExisting, ignoredPreexistingUntracked: preexistingUntracked});

// I04 mission, ledger and index are insert-only; baseline navigation and closure artifacts untouched
const prefixOk = ['CURRENT_MISSION.md', 'MISSION_LEDGER.md'].every(p => read(p).subarray(0, show(BASE, p).length).equals(show(BASE, p)));
const indexOk = read('canon/CANONICAL_INDEX.md').includes(show(BASE, 'canon/CANONICAL_INDEX.md'));
const protectedDirs = ['audits/r7-b0-baseline-2026-10-31', 'audits/domain-coaching-r7-b0-readiness-2026-10-30', 'audits/two-week-rotation-policy-2026-10-30', 'audits/domain-coaching-r7a-residual-authority-2026-10-30', 'product', 'governance'];
const protectedDrift = protectedDirs.flatMap(d => blobsEqual(tree(BASE, d)).filter(e => !e.equal).map(e => e.path));
check('I04-insert-only-and-protected-authorities', prefixOk && indexOk && !protectedDrift.length, {missionAndLedgerPrefix: prefixOk, canonicalIndexContainsBaseline: indexOk, protectedDirs, protectedDrift});

// I05 human revalidation queue is append-only
const qBase = JSON.parse(show(BASE, Q).toString('utf8')), qNow = json(Q);
const itemsPrefix = qBase.items.every((it, i) => canonical(it) === canonical(qNow.items[i]));
const keysKept = Object.keys(qBase).filter(k => k !== 'items').every(k => canonical(qBase[k]) === canonical(qNow[k]));
const added = qNow.items.slice(qBase.items.length);
check('I05-queue-append-only', itemsPrefix && keysKept && added.every(it => /^HQ-R7B0-/.test(it.queue_id)), {before: qBase.items.length, after: qNow.items.length, added: added.map(i => i.queue_id), newTopLevelKeys: Object.keys(qNow).filter(k => !(k in qBase))});

// I06 the mission's own validation is current and complete
const val = spawnSync(process.execPath, [A + 'validate-b0.mjs'], {encoding: 'utf8'});
let valOut = null; try { valOut = JSON.parse(val.stdout); } catch { valOut = null; }
const recorded = fs.existsSync(A + 'VALIDATION_B0.json') ? json(A + 'VALIDATION_B0.json') : null;
const catalogSha = sha(read('CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json'));
check('I06-validation-current', val.status === 0 && valOut && valOut.passed === valOut.total && recorded && recorded.passed === recorded.total && recorded.catalog.sha256 === catalogSha, {exit: val.status, live: valOut && {passed: valOut.passed, total: valOut.total}, recorded: recorded && {passed: recorded.passed, total: recorded.total, catalogSha256: recorded.catalog.sha256}, catalogSha256: catalogSha});

// I07 historical baseline verifier, read-only: only by-design differences may fail
const hb = spawnSync(process.execPath, ['audits/r7-b0-baseline-2026-10-31/verify-baseline.mjs'], {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
let hbOut = null; try { hbOut = JSON.parse(hb.stdout.trim().split('\n').pop()); } catch { hbOut = null; }
const byDesign = ['exact-bounded-diff-scope', 'current-source-hashes-and-selectors', 'recorded-evidence-inputs-current'];
const failedIds = hbOut ? hbOut.failed.map(x => x.id) : null;
const mustPass = ['all-frozen-core-raw-bytes', 'entire-closed-core-unchanged', 'freeze-record-and-86-file-manifest', 'source-manifest-policy-digests', 'formal-closure-artifacts-byte-preserved'];
check('I07-historical-baseline-verifier', !!hbOut && failedIds.every(id => byDesign.includes(id)) && mustPass.every(id => !failedIds.includes(id)), {exit: hb.status, passed: hbOut?.passed, total: hbOut?.total, failed: failedIds, failedByDesign: 'B0 appends to CURRENT_MISSION/MISSION_LEDGER/CANONICAL_INDEX and adds files: the baseline scope, its indexed source hashes and its recorded input digest describe the baseline only.', mustPass});

const out = {revision: 'R7B0-VERIFICATION-1', checkedAt: new Date().toISOString(), branch: txt('rev-parse', '--abbrev-ref', 'HEAD'), head: txt('rev-parse', 'HEAD'), baseline: BASE, method: 'Node standard library + Git objects; read-only; no runtime test, npm script or verify-r* executed.', passed: checks.filter(c => c.pass).length, total: checks.length, checks};
if (process.argv.includes('--write')) fs.writeFileSync(A + 'VERIFICATION.json', JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({head: out.head, passed: out.passed, total: out.total, failed: checks.filter(c => !c.pass).map(c => ({id: c.id, detail: c.detail}))}, null, 1).slice(0, 5000));
process.exitCode = checks.every(c => c.pass) ? 0 : 1;
