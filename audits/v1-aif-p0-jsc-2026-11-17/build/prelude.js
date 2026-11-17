// P0 prelude: what the bundle needs that a bare JavaScriptCore context does not have, defined in the bundle's own scope (never on the global).
// The host (Swift on iOS, the lab runner here) installs exactly one global before evaluating the bundle:
//   __p0host = { readAsset(key) -> string|null, existsAsset(key) -> bool, sha256(text) -> hex, now() -> ms }
// Nothing here decides anything about training. Each shim is the smallest stand-in for the Node API the frozen sources call.
const __host = globalThis.__p0host;
if (!__host || typeof __host.readAsset !== 'function' || typeof __host.existsAsset !== 'function' || typeof __host.sha256 !== 'function' || typeof __host.now !== 'function')
  throw new Error('P0: __p0host with readAsset, existsAsset, sha256 and now is required');
const __p0 = { measureBytes: false, calls: { readAsset: 0, existsAsset: 0, sha256: 0, sha256Chars: 0 }, misses: [], unsupported: [] };

// URL: only `new URL(relative, 'file:///p0/<repo path>')`, the one form the engine uses to name its assets.
class URL {
  constructor(input, base) {
    input = String(input);
    let href;
    if (/^[a-z][a-z0-9+.-]*:/i.test(input)) href = input;
    else {
      if (base === undefined) throw new TypeError('Invalid URL: ' + input);
      const m = String(base instanceof URL ? base.href : base).match(/^file:\/\/(\/.*)$/);
      if (!m) throw new TypeError('P0 URL: only file: bases');
      const dir = m[1].slice(0, m[1].lastIndexOf('/') + 1), out = [];
      for (const s of (input.startsWith('/') ? input : dir + input).split('/')) { if (s === '..') { if (out.length > 1) out.pop(); } else if (s !== '.') out.push(s); }
      href = 'file://' + out.join('/');
    }
    const m2 = href.match(/^([a-z][a-z0-9+.-]*:)\/\/[^/]*(\/[^?#]*)/i);
    if (!m2) throw new TypeError('P0 URL: unsupported ' + href);
    this.href = href; this.protocol = m2[1]; this.pathname = m2[2];
  }
  toString() { return this.href; }
  toJSON() { return this.href; }
}

// structuredClone: the data the engine clones is JSON-shaped records. Supported: primitives, arrays (holes and extra keys kept), plain and
// null-prototype objects, Date, Map, Set. Anything else is refused loudly, so an equivalence pass proves nothing else was cloned.
function structuredClone(value) {
  const seen = new Map();
  const put = (o, k, v) => { if (k === '__proto__') Object.defineProperty(o, k, { value: v, enumerable: true, writable: true, configurable: true }); else o[k] = v; };
  const c = v => {
    const t = typeof v;
    if (t === 'function' || t === 'symbol') throw new Error('DataCloneError: ' + t);
    if (v === null || t !== 'object') return v;
    if (seen.has(v)) return seen.get(v);
    let out;
    if (Array.isArray(v)) { out = new Array(v.length); seen.set(v, out); for (const k of Object.keys(v)) put(out, k, c(v[k])); return out; }
    if (v instanceof Date) { out = new Date(v.getTime()); seen.set(v, out); return out; }
    if (v instanceof Map) { out = new Map(); seen.set(v, out); for (const [k, x] of v) out.set(c(k), c(x)); return out; }
    if (v instanceof Set) { out = new Set(); seen.set(v, out); for (const x of v) out.add(c(x)); return out; }
    const proto = Object.getPrototypeOf(v);
    if (proto !== Object.prototype && proto !== null) { __p0.unsupported.push('structuredClone:' + (proto?.constructor?.name ?? '?')); throw new Error('P0 structuredClone: unsupported type'); }
    out = {}; seen.set(v, out); for (const k of Object.keys(v)) put(out, k, c(v[k])); return out;
  };
  return c(value);
}

const performance = { now: () => __host.now() };

// Buffer: the AIF reference client only measures sizes with Buffer.byteLength. Off by default (-1) so timing runs do not pay a JS UTF-8 scan.
const Buffer = {
  byteLength(s) {
    if (!__p0.measureBytes) return -1;
    s = String(s); let n = 0;
    for (let i = 0; i < s.length; i++) { const u = s.charCodeAt(i); if (u < 0x80) n += 1; else if (u < 0x800) n += 2; else if (u >= 0xd800 && u <= 0xdbff && i + 1 < s.length) { const l = s.charCodeAt(i + 1); if (l >= 0xdc00 && l <= 0xdfff) { n += 4; i++; } else n += 3; } else n += 3; }
    return n;
  }
};

// node:fs, node:crypto, node:path as the host provides them (same contract as the AIF portable proof, harness/portable/host-*.mjs).
const __keyOf = url => { const p = decodeURIComponent((url instanceof URL ? url : new URL(String(url))).pathname); if (!p.startsWith('/p0/')) throw new Error('P0 fs: outside the bundle: ' + p); return p.slice(4); };
const __unsupported = name => () => { __p0.unsupported.push(name); throw new Error('P0 host: ' + name + ' is not provided'); };
const __hostFs = (() => {
  function readFileSync(url, encoding) {
    const k = __keyOf(url); __p0.calls.readAsset++;
    const text = __host.readAsset(k);
    if (text === null || text === undefined) { __p0.misses.push(k); const e = new Error('ENOENT (not bundled): ' + k); e.code = 'ENOENT'; throw e; }
    if (encoding === 'utf8' || encoding?.encoding === 'utf8') return text;
    return { __hostBytes: true, text, toString: enc => { if (enc !== 'utf8' && enc !== undefined) throw new Error('host bytes: only utf8'); return text; } };
  }
  function existsSync(url) { __p0.calls.existsAsset++; return __host.existsAsset(__keyOf(url)) === true; }
  const fs = { readFileSync, existsSync, writeFileSync: __unsupported('writeFileSync'), renameSync: __unsupported('renameSync'), statSync: __unsupported('statSync'), readdirSync: __unsupported('readdirSync'), mkdirSync: __unsupported('mkdirSync') };
  return { ...fs, default: fs };
})();
const __hostCrypto = (() => {
  function createHash(alg) {
    if (alg !== 'sha256') { __p0.unsupported.push('createHash:' + alg); throw new Error('host crypto: only sha256'); }
    const parts = [];
    const h = {
      update(d) { if (typeof d === 'string') parts.push(d); else if (d && d.__hostBytes) parts.push(d.text); else { __p0.unsupported.push('update:' + typeof d); throw new Error('host crypto: text or host bytes only'); } return h; },
      digest(enc) { if (enc !== 'hex') { __p0.unsupported.push('digest:' + enc); throw new Error('host crypto: hex only'); } const text = parts.join(''); __p0.calls.sha256++; __p0.calls.sha256Chars += text.length; return __host.sha256(text); }
    };
    return h;
  }
  const c = { createHash, createHmac: __unsupported('createHmac'), timingSafeEqual: __unsupported('timingSafeEqual'), randomUUID: __unsupported('randomUUID') };
  return { ...c, default: c };
})();
const __hostPath = (() => { const p = { dirname: __unsupported('path.dirname'), join: __unsupported('path.join'), resolve: __unsupported('path.resolve') }; return { ...p, default: p }; })();
const __externals = { 'node:fs': __hostFs, 'node:crypto': __hostCrypto, 'node:path': __hostPath };
