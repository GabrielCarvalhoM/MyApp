// QRE BC R1: what the app consumes, by the static import graph of the two entry points (engine v1-safety-index.mjs, boundary api.mjs +
// integration.mjs), against what scripts/v1-rc-1.mjs `consumed()` binds (every src/*.mjs plus `new URL('..',import.meta.url)` data).
// Read-only. Usage: node p-rc-graph.mjs <CoachingCore dir>
import fs from 'node:fs';
import path from 'node:path';
const CC=path.resolve(process.argv[2]),ROOT=path.dirname(CC),rel=f=>path.relative(ROOT,f).split(path.sep).join('/');
const entries=['src/v1-safety-index.mjs','src/boundary/api.mjs','src/boundary/integration.mjs'].map(f=>path.join(CC,f));
const seen=new Set(),json=new Set(),bare=new Set(),urlData=new Set(),fsRead=new Set();
function visit(f){if(seen.has(f))return;seen.add(f);const s=fs.readFileSync(f,'utf8');
 for(const m of s.matchAll(/(?:import|export)\s[^'";]*?from\s*['"]([^'"]+)['"]([^;\n]*)/g)){const spec=m[1];
  if(!spec.startsWith('.')){if(!spec.startsWith('node:'))bare.add(spec);continue;}
  const t=path.resolve(path.dirname(f),spec);if(t.endsWith('.json'))json.add(rel(t));else if(fs.existsSync(t))visit(t);}
 for(const m of s.matchAll(/import\(\s*['"](\.[^'"]+)['"]/g)){const t=path.resolve(path.dirname(f),m[1]);if(fs.existsSync(t)&&t.endsWith('.mjs'))visit(t);}
 for(const m of s.matchAll(/new URL\(\s*['"`]([^'"`]+)['"`]\s*,\s*import\.meta\.url\s*\)/g))urlData.add(rel(path.resolve(path.dirname(f),m[1])));
 if(/readFileSync/.test(s))fsRead.add(rel(f));}
for(const e of entries)visit(e);
// What v1-rc-1.mjs binds.
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const src=walk(path.join(CC,'src')).filter(f=>f.endsWith('.mjs')).map(rel),bound=new Set(src);
for(const f of src)for(const m of fs.readFileSync(path.join(ROOT,f),'utf8').matchAll(/new URL\('([^']+)',import\.meta\.url\)/g))bound.add(path.posix.normalize(path.posix.join(path.posix.dirname(f),m[1])));
const graphMjs=[...seen].map(rel).sort();
console.log('modules in the entry graph:',graphMjs.length,'| src .mjs bound:',src.length);
console.log('graph modules NOT bound:',graphMjs.filter(f=>!bound.has(f)));
console.log('JSON imported with import attributes in the graph:',[...json].sort());
console.log('  of which NOT bound by v1-rc-1 consumed():',[...json].filter(f=>!bound.has(f)).sort());
console.log('URL data in the graph NOT bound:',[...urlData].filter(f=>!bound.has(f)));
console.log('bare package imports in the graph (not bound):',[...bare].sort());
console.log('graph modules reading files with fs:',[...fsRead].sort());
