// Parses an xctrace time-profile export: per thread of one process, sample counts, with JavaScriptCore frames, and time span.
const fs = require('fs'), x = fs.readFileSync(process.argv[2], 'utf8'), PID = process.argv[3];
const ids = new Map();
const rows = x.split('<row>').slice(1);
const out = {}; let last = 0;
for (const r of rows) {
  const tm = r.match(/<sample-time (?:id="(\d+)" fmt="[^"]*">(\d+)|ref="(\d+)")/); let t;
  if (tm) { if (tm[1]) { ids.set(tm[1], +tm[2]); t = +tm[2]; } else t = ids.get(tm[3]); }
  // register every id'd element's fmt/name
  for (const m of r.matchAll(/<(thread|process|frame|backtrace) id="(\d+)"([^>]*)>/g)) { const fmt = (m[3].match(/(?:fmt|name)="([^"]*)"/) || [])[1]; ids.set(m[2], fmt ?? ''); }
  const th = r.match(/<thread (?:id="(\d+)" fmt="([^"]*)"|ref="(\d+)")/); const thread = th ? (th[2] ?? ids.get(th[3])) : '?';
  if (!thread.includes('pid: ' + PID)) continue;
  // frames: register every named frame of this row first, then resolve the row's tagged-backtrace (inline or by ref)
  for (const m of r.matchAll(/<frame id="(\d+)" name="([^"]*)"/g)) ids.set(m[1], m[2]);
  let frames = [];
  const tb = r.match(/<tagged-backtrace id="(\d+)"[^>]*>([\s\S]*?)<\/tagged-backtrace>/);
  if (tb) { frames = [...tb[2].matchAll(/<frame (?:id="(\d+)"|ref="(\d+)")/g)].map(f => ids.get(f[1] ?? f[2])); ids.set('tb' + tb[1], frames); }
  else { const tr = r.match(/<tagged-backtrace ref="(\d+)"/); frames = tr ? ids.get('tb' + tr[1]) || [] : []; }
  const name = thread.replace(/ \(0x[0-9a-f]+\).*/, '');
  const jsc = frames.some(f => /JSC::|llint|LLInt|JavaScriptCore|jsc_/i.test(f || ''));
  const o = out[name] ??= { samples: 0, jsc: 0, first: t, last: t, jscFirst: null, jscLast: null };
  if (name === 'Main Thread' && jsc) (globalThis.mainJ ??= []).push([t, frames.filter(f => /JSC::|llint|JavaScriptCore/i.test(f || '')).slice(0, 2).join(' < ').slice(0, 140), (frames.find(f => /P0|Swift|XCT|replaySteps|mainGap|Performance/i.test(f || '')) || '').slice(0, 90)]);
  o.samples++; o.last = t; if (jsc) { o.jsc++; o.jscFirst ??= t; o.jscLast = t; }
}
for (const [k, o] of Object.entries(out)) console.log(k.padEnd(48), 'samples', o.samples, 'withJSC', o.jsc, 'span', (o.first / 1e9).toFixed(2) + '-' + (o.last / 1e9).toFixed(2) + 's', o.jsc ? 'jsc ' + (o.jscFirst / 1e9).toFixed(2) + '-' + (o.jscLast / 1e9).toFixed(2) + 's' : '');

const W0 = 36.33e9, W1 = 36.64e9, mj = globalThis.mainJ || [];
const inside = mj.filter(([t]) => t >= W0 && t <= W1), outside = mj.filter(([t]) => t < W0 || t > W1);
console.log('main-thread JSC samples: inside control window', inside.length, 'outside', outside.length);
const agg = {}; for (const [t, f, g] of outside) { const k = f + ' || ' + g; agg[k] = (agg[k] || 0) + 1; }
for (const [k, v] of Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(v, k);
console.log('outside times (s):', outside.map(([t]) => (t / 1e9).toFixed(2)).join(' '));
