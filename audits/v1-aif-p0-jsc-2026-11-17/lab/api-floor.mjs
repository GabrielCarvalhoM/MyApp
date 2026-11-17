// Static scan of the P0 bundle for ECMAScript features whose JavaScriptCore support arrived with a known iOS (Safari) version, to give the
// unmodified engine's minimum iOS (an input to the Founder's D3). Pattern-based: a hit can be a false positive (a user method named `at`,
// `with`...), never a proof of use on a path; a miss of a feature not in this table is possible. The device run is the proof for the tested iOS.
// Run: node audits/v1-aif-p0-jsc-2026-11-17/lab/api-floor.mjs   (writes results/api-floor.json)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'ios', 'Sources', 'P0Host', 'Resources', 'coachingcore-p0.js'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1'); // comments out (approximate)
const FEATURES = [
  ['Array.prototype.toSorted/toReversed/toSpliced', /\.(toSorted|toReversed|toSpliced)\(/g, '16.0'],
  ['Array.prototype.with', /\]\.with\(|\)\.with\(/g, '16.0'],
  ['Array.prototype.findLast/findLastIndex', /\.findLast(Index)?\(/g, '15.4'],
  ['Array/String.prototype.at', /\.at\(/g, '15.4'],
  ['Object.hasOwn', /Object\.hasOwn\(/g, '15.4'],
  ['Error cause', /new Error\([^)]*\{\s*cause/g, '15.0'],
  ['Class private methods / #fields', /(^|[^\w$'"])#[a-zA-Z_]\w*\s*(\(|=|;)/gm, '15.0'],
  ['Logical assignment ??= ||= &&=', /(\?\?=|\|\|=|&&=)/g, '14.0'],
  ['BigInt literal', /\b\d+n\b/g, '14.0'],
  ['Optional chaining / nullish coalescing', /\?\.|\?\?/g, '13.4'],
  ['String.prototype.replaceAll', /\.replaceAll\(/g, '13.4'],
  ['Object.groupBy / Map.groupBy', /(Object|Map)\.groupBy\(/g, '17.4'],
  ['Promise.withResolvers', /Promise\.withResolvers/g, '17.4'],
  ['Set methods (union, intersection...)', /\.(union|intersection|difference|symmetricDifference|isSubsetOf|isSupersetOf|isDisjointFrom)\(/g, '17.0'],
  ['RegExp v flag', /\/[^/\n]+\/[dgimsuy]*v[dgimsuy]*[,;)\s.]/g, '17.0'],
  ['Array.fromAsync', /Array\.fromAsync/g, '16.4'],
  ['String isWellFormed/toWellFormed', /\.(isWellFormed|toWellFormed)\(/g, '16.4'],
  ['RegExp lookbehind', /\(\?<[=!]/g, '16.4'],
  ['Intl.Segmenter', /Intl\.Segmenter/g, '14.5'],
  ['structuredClone (not in JSContext at any version: provided by the P0 prelude)', /structuredClone\(/g, 'prelude'],
  ['URL (not in JSContext: provided by the P0 prelude)', /new URL\(/g, 'prelude']
];
const ver = v => v.split('.').map(Number);
const cmp = (a, b) => { const [x, y] = [ver(a), ver(b)]; return x[0] - y[0] || (x[1] ?? 0) - (y[1] ?? 0); };
const hits = FEATURES.map(([name, re, ios]) => ({ feature: name, minIOS: ios, hits: (src.match(re) ?? []).length })).filter(h => h.hits);
const floor = hits.filter(h => h.minIOS !== 'prelude').reduce((a, h) => (cmp(h.minIOS, a) > 0 ? h.minIOS : a), '12.0');
const out = { note: 'Pattern scan of the bundle; minimum iOS per feature from Safari/JavaScriptCore release notes. A floor, not a proof.', floor, hits };
fs.writeFileSync(path.join(ROOT, 'results', 'api-floor.json'), JSON.stringify(out, null, 1) + '\n');
console.log('iOS floor of the unmodified bundle:', floor); for (const h of hits) console.log(`  ${h.minIOS.padEnd(8)} ${String(h.hits).padStart(4)}  ${h.feature}`);
