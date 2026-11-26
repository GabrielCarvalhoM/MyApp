// RepMile CoachingHost production linker (front A, 2026-11-26): a COPY of audits/v1-aif-p0-jsc-2026-11-17/build/link.mjs with a minimal diff
// (entry, output folder, bundle file name, global name; nothing else). The original header follows.
// P0 linker: resolves the ESM graph of build/entry.mjs at build time into ONE classic script for JSContext.evaluateScript (no module loader
// at runtime), and copies the assets the engine names by URL, with a SHA-256 manifest.
//
// Why a linker of our own: the session could not install a standard bundler (esbuild install was refused), so this is the smallest correct
// tool for THIS graph. It accepts only the statement forms found in the graph and fails on anything else:
//   import x from 'node:*'; import {a, b as c} from './m.mjs'; import * as N from './m.mjs';
//   export function f / export function* f / export const ...; export {a, b as c}; export {a} from './m.mjs'; export * from './m.mjs';
// Source text is changed in exactly two ways, both counted in the build manifest: those statements are replaced (in place, line count kept)
// and `import.meta.url` becomes the module's virtual URL `file:///p0/<repo path>`. Export names come from Node's own module namespace, so
// every module's exports are checked against the real ESM semantics. Cycles are refused. A production build should use a pinned standard bundler;
// the equivalence checks (lab/replay-vm.mjs, the iOS tests) are what prove this output, not this comment.
// Run: node audits/v1-aif-p0-jsc-2026-11-17/build/link.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '..'), REPO = path.resolve(ROOT, '..', '..', '..');
const OUT = path.join(ROOT, 'Sources', 'CoachingHost', 'Resources');
const ENTRY = path.join(ROOT, 'facade', 'entry.mjs');
const sha = b => createHash('sha256').update(b).digest('hex');
const rel = f => path.relative(REPO, f).replaceAll('\\', '/');
const fail = m => { console.error('link: ' + m); process.exit(1); };

const mods = new Map(); // abs path -> {id, file, src, reqs:[{spec,abs|ext}], ...}
const order = [];
const IMPORT = /^import\s+(.+?)\s+from\s*'([^']+)';?[ \t]*$/;
const REEXPORT = /^export\s*(\{[^}]*\}|\*)\s*from\s*'([^']+)';?[ \t]*$/;
const EXPORT_LIST = /^export\s*\{([^}]*)\};?[ \t]*$/;
const EXPORT_DECL = /^export\s+(function\*?\s+([\w$]+)|const\s)/;

function load(abs) {
  if (mods.has(abs)) return mods.get(abs);
  const src = fs.readFileSync(abs, 'utf8');
  const m = { id: mods.size, abs, file: rel(abs), src, srcSha256: sha(src), deps: [] };
  mods.set(abs, m);
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\r$/, '');
    if (/^(import|export)\b/.test(line) === false) {
      if (/(^|[;}\s])(import|export)\s*[{*'"\w]/.test(line) && !/^\s*(\/\/|\*|\/\*)/.test(line) && /;\s*(import|export)\s/.test(line)) fail(`${m.file}:${i + 1}: import/export not at line start`);
      continue;
    }
    let x;
    if ((x = line.match(IMPORT)) || (x = line.match(REEXPORT))) {
      const spec = x[2];
      if (spec.startsWith('.')) { const dep = path.resolve(path.dirname(abs), spec); m.deps.push(dep); }
      else if (!spec.startsWith('node:')) fail(`${m.file}: package import ${spec} (none expected)`);
    } else if (!line.match(EXPORT_LIST) && !line.match(EXPORT_DECL)) fail(`${m.file}:${i + 1}: unsupported statement: ${line.slice(0, 80)}`);
  }
  for (const d of m.deps) load(d);
  order.push(m);
  return m;
}
load(ENTRY);

// Cycle check (the linker binds named imports by value at import time, which is exact only without cycles).
{ const state = new Map();
  const visit = m => { if (state.get(m.abs) === 2) return; if (state.get(m.abs) === 1) fail('cycle at ' + m.file); state.set(m.abs, 1); for (const d of m.deps) visit(mods.get(d)); state.set(m.abs, 2); };
  visit(mods.get(ENTRY)); }

// Real export names, from Node's own module namespaces.
for (const m of mods.values()) { m.ns = await import(pathToFileURL(m.abs).href); m.names = Object.keys(m.ns); }

const assets = new Map(); // key (repo path) -> abs
let metaReplacements = 0, statementsReplaced = 0;
const parseList = s => s.split(',').map(x => x.trim()).filter(Boolean).map(x => { const [a, b] = x.split(/\s+as\s+/); return { local: a.trim(), name: (b ?? a).trim() }; });

function transform(m) {
  const vurl = 'file:///p0/' + m.file;
  const head = [], getters = new Map(), stars = [];
  const out = m.src.split('\n').map(raw => {
    const cr = raw.endsWith('\r') ? '\r' : '', line = raw.replace(/\r$/, '');
    let x;
    const req = spec => spec.startsWith('node:') ? `__ext(${JSON.stringify(spec)})` : `__req(${mods.get(path.resolve(path.dirname(m.abs), spec)).id})`;
    if ((x = line.match(IMPORT))) {
      statementsReplaced++;
      const [, clause, spec] = x;
      if (clause.startsWith('* as ')) head.push(`const ${clause.slice(5).trim()} = ${req(spec)};`);
      else if (clause.startsWith('{')) head.push(`const {${parseList(clause.slice(1, -1)).map(p => p.local === p.name ? p.local : `${p.local}: ${p.name}`).join(', ')}} = ${req(spec)};`);
      else if (/^[\w$]+$/.test(clause) && spec.startsWith('node:')) head.push(`const ${clause} = ${req(spec)}.default;`);
      else fail(`${m.file}: unsupported import clause ${clause}`);
      return cr;
    }
    if ((x = line.match(REEXPORT))) {
      statementsReplaced++;
      const v = `__r${head.length}`; head.push(`const ${v} = ${req(x[2])};`);
      if (x[1] === '*') stars.push({ v, mod: mods.get(path.resolve(path.dirname(m.abs), x[2])) });
      else for (const p of parseList(x[1].slice(1, -1))) getters.set(p.name, `${v}[${JSON.stringify(p.local)}]`);
      return cr;
    }
    if ((x = line.match(EXPORT_LIST))) { statementsReplaced++; for (const p of parseList(x[1])) getters.set(p.name, p.local); return cr; }
    if ((x = line.match(EXPORT_DECL))) { statementsReplaced++; return line.replace(/^export\s+/, '') + cr; }
    return raw;
  }).join('\n').replace(/import\.meta\.url/g, () => (metaReplacements++, JSON.stringify(vurl)));
  // Assets the module names by URL (as the AIF portable preload found them).
  for (const a of m.src.matchAll(/new URL\('([^']+\.json)',import\.meta\.url\)/g)) {
    const abs = path.resolve(path.dirname(m.abs), a[1]), key = rel(abs);
    if (!/^[A-Za-z0-9_\-./]+$/.test(key)) fail('asset path needs encoding: ' + key);
    if (fs.existsSync(abs)) assets.set(key, abs);
  }
  // Every export name: an explicit re-export, a star re-export, or a local export of the same name (or renamed by an export list).
  // QRE-P0-01: which one is decided by Node's own namespaces, never by searching the text: a name comes through `export *` from the star
  // source whose binding is the very same value Node exposes for this module; otherwise it is this module's own export (ESM: a local export
  // shadows a star name; a non-exported local of the same name never does). The export gate below then checks every binding.
  const fromStar = n => stars.find(s => Object.prototype.hasOwnProperty.call(s.mod.ns, n) && s.mod.ns[n] === m.ns[n]);
  const defs = [];
  for (const n of m.names) {
    let g = getters.get(n);
    const s = g ? null : fromStar(n);
    if (s) g = `${s.v}[${JSON.stringify(n)}]`;
    if (!g) g = n;
    defs.push(`  ${JSON.stringify(n)}: { enumerable: true, get: () => ${g} }`);
  }
  for (const n of getters.keys()) if (!m.names.includes(n)) fail(`${m.file}: export ${n} not in Node's namespace`);
  return `// ${m.file}\n__def(${m.id}, function (__exports) {\n'use strict';\n${head.join('\n')}\nObject.defineProperties(__exports, {\n${defs.join(',\n')}\n});\n${out}\n});\n`;
}

const bodies = order.map(transform);
const prelude = fs.readFileSync(path.join(HERE, 'prelude.js'), 'utf8');
const bundle = `/* RepMile CoachingHost production bundle for JavaScriptCore. Generated by build/link.mjs; do not edit. Entry: ${rel(ENTRY)} */
(function () {
'use strict';
${prelude}
const __defs = new Map(), __cache = new Map(), __state = new Map();
const __def = (id, f) => __defs.set(id, f);
const __ext = spec => { const e = __externals[spec]; if (!e) throw new Error('P0: external ' + spec + ' is not provided'); return e; };
function __req(id) {
  if (__cache.has(id)) { if (__state.get(id) !== 2) throw new Error('P0: module cycle at ' + id); return __cache.get(id); }
  const ns = Object.create(null); Object.defineProperty(ns, Symbol.toStringTag, { value: 'Module' });
  __cache.set(id, ns); __state.set(id, 1); __defs.get(id)(ns); Object.preventExtensions(ns); __state.set(id, 2); return ns;
}
${bodies.join('\n')}
const __api = __req(${mods.get(ENTRY).id}).api;
Object.defineProperty(globalThis, 'RepMileCoachingHost', { value: __api, enumerable: false, writable: false, configurable: false });
})();
`;
// Export gate (QRE-P0-01): the module bodies above, evaluated in a bare context with the module table exposed (only the last two lines of the
// shipped bundle differ), must give every module the namespace Node gives it: same keys in the same order, every binding readable, same type,
// functions with the same name and arity, other values with the same JSON (URLs compared by their path inside the repository). Else no build.
let gateChecked = 0;
{
  const TAIL = `const __api = __req(${mods.get(ENTRY).id}).api;`;
  const gateSrc = bundle.replace(/const __api = [\s\S]*$/, `${TAIL}\nglobalThis.__gateReq = __req;\n})();\n`);
  const texts = new Map([...assets].map(([k, abs]) => [k, fs.readFileSync(abs, 'utf8')]));
  const ctx = vm.createContext({ __p0host: { readAsset: k => texts.get(k) ?? null, existsAsset: k => texts.has(k), sha256: t => sha(Buffer.from(t, 'utf8')), now: () => performance.now() } });
  vm.runInContext(gateSrc, ctx, { filename: 'gate.js' });
  const view = v => {
    if (typeof v === 'function') return `function ${v.name}/${v.length}`;
    if (v instanceof URL) return 'url:' + rel(fileURLToPath(v));
    if (v && typeof v === 'object' && v.constructor?.name === 'URL' && typeof v.pathname === 'string' && v.href?.startsWith('file:///p0/')) return 'url:' + v.pathname.slice(4);
    try { return typeof v + ':' + JSON.stringify(v); } catch (e) { return typeof v + ':unserializable'; }
  };
  const bad = [];
  for (const m of mods.values()) {
    const ns = ctx.__gateReq(m.id), keys = Object.keys(ns);
    if (keys.join() !== m.names.join()) { bad.push(`${m.file}: keys differ`); continue; }
    for (const n of m.names) {
      let b; try { b = view(ns[n]); } catch (e) { bad.push(`${m.file}: ${n} throws ${e.constructor.name}: ${e.message}`); continue; }
      const a = view(m.ns[n]);
      if (a !== b) bad.push(`${m.file}: ${n} differs (${a.slice(0, 60)} vs ${b.slice(0, 60)})`);
      gateChecked++;
    }
  }
  if (bad.length) fail('export gate:\n  ' + bad.join('\n  '));
}
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'coachinghost.js'), bundle);
const manifest = [...assets].sort(([a], [b]) => (a < b ? -1 : 1)).map(([key, abs]) => {
  const bytes = fs.readFileSync(abs), file = key.replaceAll('/', '__');
  fs.writeFileSync(path.join(OUT, 'assets', file), bytes);
  return { key, file, bytes: bytes.length, sha256: sha(bytes) };
});
fs.writeFileSync(path.join(OUT, 'assets-manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
const build = {
  entry: rel(ENTRY), modules: order.map(m => ({ id: m.id, file: m.file, sha256: m.srcSha256, exports: m.names.length })),
  transforms: { statementsReplaced, importMetaUrlReplaced: metaReplacements }, exportGate: { bindingsChecked: gateChecked, mismatches: 0 },
  bundle: { file: 'coachinghost.js', bytes: Buffer.byteLength(bundle), sha256: sha(bundle) },
  assets: { count: manifest.length, bytes: manifest.reduce((a, x) => a + x.bytes, 0) }
};
fs.writeFileSync(path.join(OUT, 'build-manifest.json'), JSON.stringify(build, null, 1) + '\n');
console.log(`linked ${order.length} modules, ${statementsReplaced} statements, ${metaReplacements} import.meta.url; bundle ${build.bundle.bytes} B sha256 ${build.bundle.sha256.slice(0, 16)}; assets ${manifest.length} (${build.assets.bytes} B)`);
