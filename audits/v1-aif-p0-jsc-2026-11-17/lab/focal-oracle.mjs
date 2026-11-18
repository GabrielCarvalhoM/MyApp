// Node oracle of the P0 focal coverage (QRE-P0-04 and the libm question of P0_REPORT.md §4.2). Writes ios/Tests/P0HostTests/Fixtures/focal.json:
//   - the exact input JSON of lab/focal-driver.js (frozen R5 holdout corpus, checked against its manifest; the dev authority, checked to
//     survive the JSON round trip without changing a single generateProgram digest; eventIds of the P16 fixture), the driver text itself,
//     the bundle module ids of the four namespaces, and the driver's result in Node with each default locale (LC_ALL en_US and pt_BR);
//   - every Math.exp/log/pow call of the P16 replay with V8's exact result bits, for the device to recompute.
// Deterministic: rerunning it must leave git diff empty.
// Run: node audits/v1-aif-p0-jsc-2026-11-17/lab/focal-oracle.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '..'), REPO = path.resolve(ROOT, '..', '..');
const CC = path.join(REPO, 'CoachingCore'), FIX = path.join(ROOT, 'ios', 'Tests', 'P0HostTests', 'Fixtures');
const sha = b => createHash('sha256').update(b).digest('hex');
const imp = f => import(pathToFileURL(path.join(CC, f)).href);
const DRIVER = fs.readFileSync(path.join(HERE, 'focal-driver.js'), 'utf8');

async function namespaces() {
  return { r6: await imp('src/r6-index.mjs'), sched: await imp('src/r5-schedule.mjs'), learn: await imp('src/r5-learning.mjs'), value: await imp('src/value.mjs') };
}
async function buildInput() {
  const bytes = fs.readFileSync(path.join(CC, 'r5', 'holdout', 'R5_INDEPENDENT_HOLDOUT.json'));
  const manifest = JSON.parse(fs.readFileSync(path.join(CC, 'r5', 'holdout', 'INDEPENDENCE_MANIFEST.json'), 'utf8'));
  if (sha(bytes) !== manifest.corpusSha256) throw new Error('R5 holdout corpus differs from its manifest');
  const corpus = JSON.parse(bytes), { devAuthority } = await imp('r6/fixtures/dev-authority.mjs'), authority = devAuthority();
  const { r6, value } = await namespaces(), roundTrip = JSON.parse(JSON.stringify(authority));
  for (const k of corpus.cases) {
    const a = value.hash(r6.generateProgram(structuredClone(k.programInput), { authority }));
    const b = value.hash(r6.generateProgram(structuredClone(k.programInput), { authority: roundTrip }));
    if (a !== b) throw new Error('the dev authority does not survive JSON: ' + k.caseId);
  }
  const p16 = JSON.parse(fs.readFileSync(path.join(FIX, 'p16.json'), 'utf8'));
  const eventIds = [...p16.steps.filter(s => s.eventId).slice(0, 6).map(s => s.eventId), 'EV_0', 'EV_1', 'EV_10', 'EV_9'];
  return JSON.stringify({ corpus: { cases: corpus.cases.map(k => ({ caseId: k.caseId, programInput: k.programInput })) }, authority, eventIds, locales: ['en-US', 'pt-BR'] });
}
async function runDriver(inputJSON) {
  (0, eval)(DRIVER);
  return JSON.parse(globalThis.__p0focal(await namespaces(), inputJSON));
}

if (process.argv[2] === '--child') { // one default locale per process (LC_ALL is read once by ICU)
  process.stdout.write(JSON.stringify(await runDriver(fs.readFileSync(process.argv[3], 'utf8'))));
  process.exit(0);
}

const inputJSON = await buildInput();
const tmp = path.join(ROOT, 'results', '.focal-input.tmp.json');
fs.writeFileSync(tmp, inputJSON);
const byLocale = {};
try {
  for (const lc of ['en_US.UTF-8', 'pt_BR.UTF-8'])
    byLocale[lc] = JSON.parse(execFileSync(process.execPath, [fileURLToPath(import.meta.url), '--child', tmp], { env: { ...process.env, LC_ALL: lc, LANG: lc }, maxBuffer: 1 << 26 }).toString());
} finally { fs.rmSync(tmp, { force: true }); }
const en = byLocale['en_US.UTF-8'], pt = byLocale['pt_BR.UTF-8'];

// libm: every Math.exp/log/pow call of the P16 replay (exact argument and result bits).
const bits = x => { const b = Buffer.alloc(8); b.writeDoubleBE(x); return b.toString('hex'); };
const rec = new Map(); let step = -1;
const orig = {};
for (const f of ['exp', 'log', 'pow']) { orig[f] = Math[f]; Math[f] = (...a) => { const r = orig[f](...a), k = f + ':' + a.map(bits).join(','); if (!rec.has(k)) rec.set(k, { f, args: a.map(bits), v8: bits(r), steps: [] }); const e = rec.get(k); if (!e.steps.includes(step)) e.steps.push(step); return r; }; }
const L = await import(pathToFileURL(path.join(REPO, 'audits', 'v1-app-integration-foundation-2026-11-16', 'harness', 'lib.mjs')).href);
const p16 = JSON.parse(fs.readFileSync(path.join(FIX, 'p16.json'), 'utf8')), c = L.createClient();
p16.steps.forEach((s, i) => { step = i; const r = s.kind === 'ONBOARD' ? c.onboard(JSON.parse(s.intakeJSON)) : c.review(s.kind, s.asOf, JSON.parse(s.factsJSON), { eventId: s.eventId }); if (L.digestOf(r) !== p16.expected[i].answer) throw new Error('P16 oracle drift at step ' + i); });
for (const f of Object.keys(orig)) Math[f] = orig[f];

const build = JSON.parse(fs.readFileSync(path.join(ROOT, 'ios', 'Sources', 'P0Host', 'Resources', 'build-manifest.json'), 'utf8'));
const id = f => { const m = build.modules.find(x => x.file === f); if (!m) throw new Error('not in the bundle: ' + f); return m.id; };
const fixture = {
  note: 'lab/focal-oracle.mjs: focal coverage of localeCompare/toSorted (QRE-P0-04) and the P16 libm calls. Synthetic and frozen inputs only.',
  bundleSha256: build.bundle.sha256, driverSha256: sha(DRIVER), driver: DRIVER,
  modules: { r6: id('CoachingCore/src/r6-index.mjs'), sched: id('CoachingCore/src/r5-schedule.mjs'), learn: id('CoachingCore/src/r5-learning.mjs'), value: id('CoachingCore/src/value.mjs') },
  inputJSON, expected: en,
  nodeByDefaultLocale: Object.fromEntries(Object.entries(byLocale).map(([k, v]) => [k, { defaultLocale: v.collation.defaultLocale, digest: v.digest, signs: v.collation.signs, differFromDefault: v.collation.differFromDefault }])),
  libm: [...rec.values()]
};
fs.writeFileSync(path.join(FIX, 'focal.json'), JSON.stringify(fixture, null, 1) + '\n');
console.log(`focal: ${en.generate.length} generate, ${en.schedule.length} schedule, learning ${en.learning.error ?? 'ok'}; calls ${JSON.stringify(en.counts)}`);
console.log(`collation: ${en.collation.pairs} distinct pairs; differ from default ${JSON.stringify(en.collation.differFromDefault)}; Node en_US vs pt_BR digest ${en.digest === pt.digest ? 'equal' : 'DIFFERENT'}; signs ${JSON.stringify(en.collation.signs) === JSON.stringify(pt.collation.signs) ? 'equal' : 'DIFFERENT'}`);
console.log(`libm: ${fixture.libm.length} distinct calls (${Object.entries(fixture.libm.reduce((m, x) => (m[x.f] = (m[x.f] || 0) + 1, m), {})).map(([k, v]) => k + ' ' + v).join(', ')})`);
