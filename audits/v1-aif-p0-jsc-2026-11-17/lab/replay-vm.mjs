// Lab replay of the P0 bundle (NOT an iPhone, NOT JavaScriptCore): the bundle evaluated as a classic script in a bare V8 context (node:vm,
// ECMAScript built-ins only) whose single global is the same four-function host the iOS target installs. It shows, before the device:
//   equiv     the J5 and P16 fixture digests reproduced by the bundle (JIT and --jitless), the host fully used, nothing missing or refused;
//   restore   export -> new context -> restore -> continue gives the same digests as one uninterrupted run;
//   ulp       sensitivity: Math.exp/log/pow answers moved by one ULP (what a different libm can do on JavaScriptCore). Which fields move?
//   perf      timings of the bundle against the native ESM client on the same fixture, --jitless (polyfill and linker overhead, not iPhone).
// Run: node audits/v1-aif-p0-jsc-2026-11-17/lab/replay-vm.mjs   (writes results/lab-vm.json)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.join(HERE, '..'), SELF = fileURLToPath(import.meta.url);
const RES = path.join(ROOT, 'ios', 'Sources', 'P0Host', 'Resources'), FIX = path.join(ROOT, 'ios', 'Tests', 'P0HostTests', 'Fixtures');
const q = (xs, p) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)]; };
const stats = xs => ({ n: xs.length, median: r1(q(xs, 0.5)), p95: r1(q(xs, 0.95)), max: r1(Math.max(...xs)) });
const r1 = x => x === null ? null : Math.round(x * 10) / 10;
const fixture = name => JSON.parse(fs.readFileSync(path.join(FIX, name), 'utf8'));

function newContext({ perturb = false, main = false } = {}) {
  const manifest = JSON.parse(fs.readFileSync(path.join(RES, 'assets-manifest.json'), 'utf8'));
  const assets = new Map(manifest.map(a => { const bytes = fs.readFileSync(path.join(RES, 'assets', a.file)); if (createHash('sha256').update(bytes).digest('hex') !== a.sha256) throw new Error('asset hash ' + a.key); return [a.key, bytes.toString('utf8')]; }));
  const host = { readAsset: k => assets.get(k) ?? null, existsAsset: k => assets.has(k), sha256: t => createHash('sha256').update(t, 'utf8').digest('hex'), now: () => performance.now() };
  // main: the same bundle in the main V8 context (no vm global interceptor), to separate vm-context cost from bundle cost.
  if (main) { globalThis.__p0host = host; const t0 = performance.now(); vm.runInThisContext(fs.readFileSync(path.join(RES, 'coachingcore-p0.js'), 'utf8'), { filename: 'coachingcore-p0.js' }); return { api: globalThis.CoachingCoreP0, evalMs: performance.now() - t0 }; }
  const ctx = vm.createContext({ __p0host: host });
  const probe = vm.runInContext('["URL","structuredClone","Buffer","process","performance","console","require","fetch","TextEncoder"].filter(n => typeof globalThis[n] !== "undefined")', ctx);
  if (perturb) vm.runInContext(`(() => { const dv = new DataView(new ArrayBuffer(8));
    const up = x => { if (!Number.isFinite(x)) return x; if (x === 0) return Number.MIN_VALUE; dv.setFloat64(0, x); const b = dv.getBigUint64(0); dv.setBigUint64(0, x > 0 ? b + 1n : b - 1n); return dv.getFloat64(0); };
    globalThis.__ulp = { exp: 0, log: 0, pow: 0 };
    for (const f of ['exp', 'log', 'pow']) { const g = Math[f]; Math[f] = function (...a) { globalThis.__ulp[f]++; return up(g.apply(Math, a)); }; } })();`, ctx);
  const t0 = performance.now();
  vm.runInContext(fs.readFileSync(path.join(RES, 'coachingcore-p0.js'), 'utf8'), ctx, { filename: 'coachingcore-p0.js' });
  return { api: ctx.CoachingCoreP0, ctx, evalMs: performance.now() - t0, probe };
}

function run(api, fx, { from = 0, to = fx.steps.length, opts = { digest: true } } = {}) {
  const got = [];
  for (let i = from; i < to; i++) {
    const s = fx.steps[i], o = JSON.stringify(opts);
    got.push(JSON.parse(s.kind === 'ONBOARD' ? api.onboard(s.intakeJSON, o) : api.review(s.kind, s.asOf, s.factsJSON, s.eventId, o)));
  }
  return got;
}
const compare = (fx, got, from = 0) => got.map((g, k) => { const e = fx.expected[from + k]; return { step: from + k, answer: g.answerDigest === e.answer, envelope: g.envelopeDigest === e.envelope, status: g.status === e.status,
  sansForecast: g.answerSansForecast === e.answerSansForecast && g.envelopeSansForecast === e.envelopeSansForecast, forecastCoarse: g.forecastCoarse === e.forecastCoarse }; });
const allOk = cmp => cmp.every(c => c.answer && c.envelope && c.status);

// Leaf paths that differ between two JSON values (bounded).
function leafDiff(a, b, p = '', out = []) {
  if (out.length > 200) return out;
  if (a && b && typeof a === 'object' && typeof b === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) leafDiff(a[k], b[k], p + '/' + k, out); return out; }
  if (a !== b) out.push({ path: p, oracle: a, perturbed: b });
  return out;
}

function child(mode) {
  const J5 = fixture('j5.json'), P16 = fixture('p16.json');
  if (mode === 'equiv') {
    const { api, probe, evalMs } = newContext(); api.reset(); const j5 = compare(J5, run(api, J5));
    api.reset(); const p16 = compare(P16, run(api, P16));
    // restore continuity: J5 before the warning-sign step, P16 in the middle of the plan (step 16), each into a NEW context.
    const cont = (fx, k) => { const a = newContext().api; a.reset(); run(a, fx, { to: k }); const env = a.exportEnvelope(), b = newContext().api;
      const r = JSON.parse(b.restore(env)); return { at: k, envelopeChars: env.length, restored: r.ok, digests: compare(fx, run(b, fx, { from: k }), k) }; };
    const restores = [cont(J5, 4), cont(P16, 16)];
    return { probeGlobalsPresent: probe, bundleEvalMs: evalMs, j5: { ok: allOk(j5), steps: j5 }, p16: { ok: allOk(p16), steps: p16.length, failed: p16.filter(c => !(c.answer && c.envelope && c.status)) },
      restore: restores.map(r => ({ at: r.at, envelopeChars: r.envelopeChars, restored: r.restored, ok: allOk(r.digests) })), host: JSON.parse(api.hostCalls()) };
  }
  if (mode === 'ulp') {
    const { api, ctx } = newContext({ perturb: true }), full = fixture('j5-answers.json'); api.reset();
    const j5 = run(api, J5, { opts: { digest: true, answer: true, tree: true } }), counts1 = { ...ctx.__ulp };
    api.reset(); const p16 = run(api, P16, { opts: { digest: true, tree: true } });
    const keysMoved = (fx, got) => compare(fx, got).map((c, i) => ({ ...c, movedKeys: Object.keys(fx.expected[i].tree ?? {}).filter(k => fx.expected[i].tree[k] !== got[i].tree?.[k]) }));
    const j5Leaves = j5.map((g, i) => leafDiff(full[i], g.answer));
    return { perturbedCalls: { j5: counts1, total: { ...ctx.__ulp } }, j5: keysMoved(J5, j5), p16: keysMoved(P16, p16), j5LeafDiffs: j5Leaves.map(d => d.slice(0, 40)), j5LeafDiffCounts: j5Leaves.map(d => d.length) };
  }
  if (mode.startsWith('perf-')) return perf(mode);
}

async function perfNative() { // the same P16 fixture through the native ESM client (Node fs/crypto, native structuredClone)
  const L = await import('../../v1-app-integration-foundation-2026-11-16/harness/lib.mjs');
  return { api: { reset() { this.c = L.createClient(); }, onboard(i) { const t0 = performance.now(), r = this.c.onboard(JSON.parse(i)); return JSON.stringify({ status: r.status, engineMs: performance.now() - t0 }); },
    review(k, a, f, e) { const t0 = performance.now(), r = this.c.review(k, a, JSON.parse(f), { eventId: e }); return JSON.stringify({ status: r.status, engineMs: performance.now() - t0, ledgerRows: this.c.envelope.actualLedger.length }); } } };
}
async function perf(mode) {
  const P16 = fixture('p16.json'), t0 = performance.now();
  const { api } = mode === 'perf-native' ? await perfNative() : newContext({ main: mode === 'perf-bundle-main' });
  const loadMs = performance.now() - t0, series = [];
  api.reset();
  for (const s of P16.steps) { const r = JSON.parse(s.kind === 'ONBOARD' ? api.onboard(s.intakeJSON, '{}') : api.review(s.kind, s.asOf, s.factsJSON, s.eventId, '{}')); series.push({ kind: s.kind, rows: r.ledgerRows ?? 0, ms: r.engineMs }); }
  const ev = series.filter(s => s.kind !== 'ONBOARD');
  return { loadMs: r1(loadMs), generateMs: r1(series[0].ms), evaluate: { all: stats(ev.map(s => s.ms)), rows0to60: stats(ev.filter(s => s.rows < 60).map(s => s.ms)), rows60up: stats(ev.filter(s => s.rows >= 60).map(s => s.ms)) }, rssMB: r1(process.memoryUsage().rss / 2 ** 20) };
}

if (process.argv[2] === '--child') { console.log(JSON.stringify(await child(process.argv[3]))); process.exit(0); }
const spawn = (flags, mode) => JSON.parse(execFileSync(process.execPath, [...flags, SELF, '--child', mode], { encoding: 'utf8', maxBuffer: 256 * 2 ** 20 }).trim().split('\n').at(-1));
const build = JSON.parse(fs.readFileSync(path.join(RES, 'build-manifest.json'), 'utf8'));
const out = {
  note: 'Lab on Node/V8 (node:vm bare context). Not JavaScriptCore and not an iPhone. Proves the bundle and its host contract; device numbers come only from the iOS target.',
  machine: { node: process.version, platform: `${os.platform()} ${os.release()}`, cpu: os.cpus()[0]?.model, cores: os.cpus().length },
  bundle: build.bundle, equiv: { jit: spawn([], 'equiv'), jitless: spawn(['--jitless'], 'equiv') }, ulp: spawn([], 'ulp'),
  perfJitless: { bundleVmContext: spawn(['--jitless'], 'perf-bundle'), bundleMainContext: spawn(['--jitless'], 'perf-bundle-main'), native: spawn(['--jitless'], 'perf-native') }
};
fs.mkdirSync(path.join(ROOT, 'results'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'results', 'lab-vm.json'), JSON.stringify(out, null, 1) + '\n');
const e = out.equiv;
console.log(`probe globals present: ${JSON.stringify(e.jit.probeGlobalsPresent)}`);
for (const [k, v] of Object.entries(e)) console.log(`${k}: J5 ${v.j5.ok}, P16 ${v.p16.ok} (${v.p16.failed.length} failed), restore ${v.restore.map(r => `${r.at}:${r.ok}`).join(' ')}, host ${JSON.stringify(v.host.calls)} misses ${v.host.misses.length} unsupported ${v.host.unsupported.length}`);
console.log('ulp perturbed calls', JSON.stringify(out.ulp.perturbedCalls), 'J5 answers moved', out.ulp.j5.filter(s => !s.answer).length, 'P16 answers moved', out.ulp.p16.filter(s => !s.answer).length, 'statuses moved', [...out.ulp.j5, ...out.ulp.p16].filter(s => !s.status).length,
  '| sansForecast all equal', [...out.ulp.j5, ...out.ulp.p16].every(s => s.sansForecast), '| forecastCoarse all equal', [...out.ulp.j5, ...out.ulp.p16].every(s => s.forecastCoarse));
console.log('ulp keys moved (union)', JSON.stringify([...new Set([...out.ulp.j5, ...out.ulp.p16].flatMap(s => s.movedKeys))]), 'J5 leaf diffs', JSON.stringify(out.ulp.j5LeafDiffCounts));
for (const [k, v] of Object.entries(out.perfJitless)) console.log('perf --jitless', k, JSON.stringify(v));
