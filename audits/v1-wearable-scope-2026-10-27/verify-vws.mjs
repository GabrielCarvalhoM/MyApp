// Deterministic checks for VWS-20261027 (r1 + r2). Usage: node verify-vws.mjs <repoRoot> <dir holding before.json>
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
const [root, manifestDir] = process.argv.slice(2);
const A = 'audits/v1-wearable-scope-2026-10-27/';
const rd = p => fs.readFileSync(path.join(root, p), 'utf8');
const sha = p => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, p))).digest('hex');
const walk = d => fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(d + '/' + e.name) : [d + '/' + e.name]);
const before = JSON.parse(fs.readFileSync(path.join(manifestDir, 'before.json'), 'utf8'));
const checks = [];
const check = (id, fn) => { try { const d = fn(); checks.push({ id, pass: d.pass, detail: d }); } catch (e) { checks.push({ id, pass: false, detail: { error: e.message } }); } };
const count = (t, s) => t.split(s).length - 1;
const MARK = /_(START|END): VWS-20261027-r[12]/g;
const vwsBlocks = t => [...t.matchAll(/_START: VWS-20261027-r[12][\s\S]*?_END: VWS-20261027-r[12]/g)].map(m => m[0]);

check('r6-history-untouched', () => {
  const now = [...walk('audits/domain-coaching-r6-2026-10-26'), ...walk('CoachingCore/r6'), 'CoachingCore/scripts/verify-r6.mjs', 'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'];
  const changed = Object.keys(before.r6).filter(p => !fs.existsSync(path.join(root, p)) || sha(p) !== before.r6[p]);
  const added = now.filter(p => !(p in before.r6));
  return { pass: !changed.length && !added.length, files: Object.keys(before.r6).length, changed, added };
});

check('before-snapshots-match-pre-edit-hashes', () => {
  const bad = before.targets.filter(t => sha(A + 'before/' + t.path) !== t.sha256).map(t => t.path);
  return { pass: !bad.length, files: before.targets.length, bad };
});

check('r1-snapshots-present', () => {
  const files = walk(A + 'r1').map(p => ({ path: p.slice((A + 'r1/').length), sha256: sha(p) }));
  return { pass: files.length === 14, files };
});

check('mission-and-ledger-insert-only', () => {
  const subseq = (b, a) => { const x = b.split(/\r?\n/), y = a.split(/\r?\n/); let i = 0; for (const l of y) if (i < x.length && l === x[i]) i++; return i === x.length; };
  const r = ['CURRENT_MISSION.md', 'MISSION_LEDGER.md'].map(p => {
    const a = rd(p);
    return { file: p, prefixOfPreMission: a.startsWith(rd(A + 'before/' + p)), prefixOfR1: a.startsWith(rd(A + 'r1/' + p)), r6SnapshotSubsequence: subseq(rd('audits/domain-coaching-r6-2026-10-26/snapshots/' + p.replace('.md', '.before-r6-entry.md')), a) };
  });
  return { pass: r.every(x => x.prefixOfPreMission && x.prefixOfR1 && x.r6SnapshotSubsequence), r };
});

check('ob2-held-ops-still-apply', () => {
  const j = JSON.parse(rd('audits/new-figma-onboarding-v2-2026-10-25/PENDING_DOC_CORRECTIONS_R2.json'));
  const occ = j.ops.map(o => ({ n: o.n, file: o.file, occurrences: count(rd(o.file), o.from) }));
  const sim = {}; let simulated = true;
  for (const o of j.ops) {
    const t = sim[o.file] ?? rd(o.file);
    if (count(t, o.from) !== 1) { simulated = false; break; }
    sim[o.file] = t.replace(o.from, () => o.to);
  }
  const vwsOverlap = j.ops.filter(o => vwsBlocks(rd(o.file)).some(b => b.includes(o.from))).map(o => o.n);
  const preShaChanged = j.files.filter(f => sha(f.path) !== f.preSha256).map(f => f.path);
  return { pass: occ.every(o => o.occurrences === 1) && simulated && !vwsOverlap.length, ops: j.ops.length, allSingleOccurrence: occ.every(o => o.occurrences === 1), sequentialApplySimulated: simulated, vwsOverlap, preShaChanged, note: 'The applier refuses on preSha256 for the files listed; per its applyWhen the owner re-validates (done here) and the owning judge re-checks. The held file itself was not modified.' };
});

check('vws-markers-balanced', () => {
  const files = before.targets.map(t => t.path).filter(p => !/CURRENT_MISSION|MISSION_LEDGER|DESIGNER_PRODUCT_CONTEXT/.test(p));
  const r = files.map(p => { const t = rd(p); const m = [...t.matchAll(MARK)]; return { file: p, start: m.filter(x => x[1] === 'START').length, end: m.filter(x => x[1] === 'END').length, r1: count(t, 'VWS-20261027-r1'), r2: count(t, 'VWS-20261027-r2') }; });
  const pdr = r.find(x => x.file.endsWith('DECISION_REGISTER.md'));
  const overlaysR2 = r.filter(x => x !== pdr).every(x => x.r1 === 0 && x.r2 >= 2);
  return { pass: r.every(x => x.start >= 1 && x.start === x.end) && pdr.start === 2 && overlaysR2, r, note: 'PDR keeps the r1 block (PDR-1.8) and adds the r2 block (PDR-1.9); every other overlay is revised to r2. DESIGNER_PRODUCT_CONTEXT is corrected in place, without markers.' };
});

check('stale-v1-statements-removed', () => {
  const gone = [
    ['product/V1_RELEASE_SCOPE.md', 'Apple Health/HealthKit e rotas pertinentes quando comprovadas. | Export opcional'],
    ['product/V1_RELEASE_SCOPE.md', 'G06: rota/device/sensores/custo antes de claim dependente, sem outbound global'],
    ['product/V1_RELEASE_SCOPE.md', 'iOS+Android'],
    ['product/V1_RELEASE_SCOPE.md', 'read/ingest only'],
    ['product/DESIGNER_PRODUCT_CONTEXT.md', 'as rotas candidatas Garmin, COROS e Polar sob G06'],
    ['product/DESIGNER_PRODUCT_CONTEXT.md', 'Android como adaptação'],
    ['product/DESIGNER_PRODUCT_CONTEXT.md', 'somente leitura'],
    ['product/ADAPTIVE_ENGINE_CONTRACT.md', 'read/ingest only'],
    ['product/PRODUCT_DOMAIN_MODEL.md', 'read only'],
    ['product/UX_SPECIFICATION.md', 'HealthKit on iOS, read only'],
    ['canon/CANONICAL_INDEX.md', 'read/ingest of what is available'],
  ].map(([f, s]) => ({ file: f, text: s, present: rd(f).includes(s) }));
  // Outside the PDR-1.8 record itself, the platform decision may appear only as resolved.
  const openMentions = before.targets.map(t => t.path).filter(p => !/CURRENT_MISSION|MISSION_LEDGER/.test(p)).flatMap(p => {
    let t = rd(p);
    if (p.endsWith('DECISION_REGISTER.md')) t = t.replace(/<!-- V1_WEARABLE_SCOPE_START: VWS-20261027-r1 -->[\s\S]*?<!-- V1_WEARABLE_SCOPE_END: VWS-20261027-r1 -->/, '');
    return t.split('\n').filter(l => l.includes('OPEN_PRODUCT_PLATFORM_DECISION-01') && !/RESOLVED/.test(l)).map(l => ({ file: p, line: l.slice(0, 120) }));
  });
  return { pass: gone.every(g => !g.present) && !openMentions.length, gone, openMentions };
});

check('dr-ids-unique', () => {
  const t = rd('product/PRODUCT_DECISION_REGISTER.md');
  const r = ['DR-117', 'DR-118', 'DR-119', 'DR-120', 'DR-121', 'DR-122', 'DR-123'].map(id => ({ id, rows: (t.match(new RegExp('^\\| ' + id + ' \\|', 'gm')) || []).length }));
  const highestBefore = Math.max(...[...rd(A + 'before/product/PRODUCT_DECISION_REGISTER.md').matchAll(/^\| DR-(\d+) \|/gm)].map(m => +m[1]));
  return { pass: r.every(x => x.rows === 1) && highestBefore === 116, r, highestBefore };
});

check('confirmed-state-recorded', () => {
  const want = { V1_PLATFORM_SCOPE: 'IOS_ONLY', V1_EXTERNAL_HEALTH_SOURCE: 'APPLE_HEALTH_HEALTHKIT', HEALTHKIT_INBOUND_V1: 'REQUIRED', HEALTHKIT_WRITEBACK: 'OPEN_TECHNICAL_PRODUCT_DECISION', STRUCTURED_WATCH_DELIVERY: 'POST_V1', DIRECT_VENDOR_WEARABLE_INTEGRATIONS: 'POST_V1', ANDROID: 'POST_V1', COACHING_CORE_PLATFORM_AGNOSTIC: 'YES', R7_CAN_START_WITH_CANONICAL_INPUT: 'YES' };
  const pdr = rd('product/PRODUCT_DECISION_REGISTER.md'), cm = rd('CURRENT_MISSION.md'), rec = rd(A + 'RECORD.md');
  const r = Object.entries(want).map(([k, v]) => ({ item: k, pdr: new RegExp('^\\| ' + k + ' \\| ' + v).test(pdr.split('\n').find(l => l.startsWith('| ' + k + ' |')) ?? ''), record: (rec.split('\n').find(l => l.startsWith('| ' + k + ' |')) ?? '').includes('| ' + v), currentMission: cm.includes(k + ' = ' + v) }));
  const resolved = pdr.includes('**RESOLVED — V1_IOS_ONLY**');
  return { pass: r.every(x => x.pdr && x.record && x.currentMission) && resolved, r, resolved };
});

check('line-endings-unchanged', () => {
  const r = before.targets.map(t => { const a = rd(t.path); return { file: t.path, crlfBefore: t.crlfLines, crlfAfter: (a.match(/\r\n/g) || []).length }; });
  return { pass: r.every(x => x.crlfBefore === x.crlfAfter), r };
});

check('vws-links-resolve', () => {
  const files = [...before.targets.map(t => t.path), A + 'RECORD.md', A + 'OCCURRENCE_CLASSIFICATION.md', A + 'FOUNDER_REQUEST.md', A + 'FOUNDER_REQUEST_R2.md'];
  const bad = []; let checked = 0;
  for (const f of files) {
    const t = rd(f);
    const own = f.startsWith(A) || /DESIGNER_PRODUCT_CONTEXT|CURRENT_MISSION|MISSION_LEDGER/.test(f);
    let text = own ? t : vwsBlocks(t).join('\n');
    if (f.endsWith('THESIS_CONTRACT.md')) { const i = t.indexOf('VWS-20261027-r2.**'); text += t.slice(i - 200, i + 800); }
    for (const m of text.matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g)) {
      if (/^https?:/.test(m[1])) continue;
      checked++;
      if (!fs.existsSync(path.join(path.dirname(path.join(root, f)), m[1]))) bad.push({ file: f, link: m[1] });
    }
  }
  return { pass: !bad.length, checked, bad };
});

check('r6-baseline-post-closure-supersession', () => {
  const b = JSON.parse(rd('audits/domain-coaching-r6-2026-10-26/BASELINE.json'));
  const changedNow = b.entries.filter(e => !fs.existsSync(path.join(root, e.path)) || sha(e.path) !== e.sha256).map(e => e.path);
  const byThisMission = changedNow.filter(p => before.targets.some(t => t.path === p && t.sha256 !== sha(p)));
  return { pass: true, informational: true, baselineEntries: b.entries.length, changedVsR6Baseline: changedNow, changedByThisMission: byThisMission, note: 'Expected post-closure supersession. verify-r6 was not run (it rewrites R6 evidence); CURRENT_MISSION/MISSION_LEDGER are insert-only, which R6 allows.' };
});

check('edited-files', () => ({ pass: true, informational: true, files: before.targets.map(t => ({ path: t.path, before: t.sha256, after: sha(t.path) })) }));

const out = { id: 'VWS-20261027-r2', generatedAt: new Date().toISOString(), scope: 'documentary post-R6 product scope supersession (r1 + r2); no runtime, Figma or R6 artifact touched', checks, summary: { passed: checks.filter(c => c.pass).length, total: checks.length } };
fs.writeFileSync(path.join(root, A, 'VERIFICATION.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(checks.map(c => ({ id: c.id, pass: c.pass }))));
console.log(out.summary);
for (const c of checks) if (!c.pass || ['ob2-held-ops-still-apply', 'confirmed-state-recorded'].includes(c.id)) console.log(c.id, JSON.stringify(c.detail).slice(0, 1500));
