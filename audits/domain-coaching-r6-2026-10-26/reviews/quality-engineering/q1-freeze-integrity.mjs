// QRE independent probe Q1a: freeze integrity. Read-only. Recomputes every listed SHA-256, the source digest with the
// runtime's own canonical hash, and re-derives the file set the freeze script would select (to detect unlisted runtime data).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {hash} from '../../../../CoachingCore/src/value.mjs';

const root=path.resolve(import.meta.dirname,'../../../..');
const freeze=JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r6/RUNTIME_FREEZE_R6.json'),'utf8'));
const EXPECTED='507f35fc66f4d1e105e19ce513dc067f9fee5fdc35c039ad52a8c825e46bf857';
const rows=freeze.entries.map(e=>{const p=path.join(root,e.path);const exists=fs.existsSync(p);const actual=exists?createHash('sha256').update(fs.readFileSync(p)).digest('hex'):null;return {path:e.path,expected:e.sha256,actual,match:actual===e.sha256};});
const recomputedDigest=hash(freeze.entries.map(e=>({path:e.path,sha256:e.sha256})));
const actualDigest=hash(rows.map(r=>({path:r.path,sha256:r.actual})));
// Re-derive the file set like freeze-r6.mjs does, without writing anything.
const files=new Set();
const walk=rel=>{for(const e of fs.readdirSync(path.join(root,rel),{withFileTypes:true})){const p=path.posix.join(rel,e.name);if(e.isDirectory())walk(p);else if(p.endsWith('.mjs'))files.add(p);}};
walk('CoachingCore/src');
for(const p of [...files]){const text=fs.readFileSync(path.join(root,p),'utf8');for(const m of text.matchAll(/new URL\('(\.\.\/[^']+\.json)',import\.meta\.url\)/g)){files.add(path.posix.normalize(path.posix.join(path.posix.dirname(p),m[1])));}}
for(const p of ['CoachingCore/r6/holdout/INTERFACE_ONLY.md','CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/package.json'])files.add(p);
const listed=new Set(freeze.entries.map(e=>e.path));
const unlisted=[...files].filter(p=>!listed.has(p)).sort(),listedButNotDerived=[...listed].filter(p=>!files.has(p)).sort();
// Any other runtime-read data (fs reads with non-URL paths) the regex would miss.
const otherReads=[];
for(const p of [...files].filter(p=>p.endsWith('.mjs')&&p.includes('/src/'))){const t=fs.readFileSync(path.join(root,p),'utf8');for(const m of t.matchAll(/(readFileSync|existsSync|import\s*\()[^\n]{0,120}/g))otherReads.push({file:p,snippet:m[0].slice(0,140)});}
const out={probe:'Q1a-freeze-integrity',node:process.version,frozenAt:freeze.frozenAt,manifestDigest:freeze.sourceDigest,expectedDigest:EXPECTED,recomputedDigestFromManifest:recomputedDigest,digestFromCurrentFiles:actualDigest,entries:rows.length,mismatches:rows.filter(r=>!r.match),unlistedRuntimeFiles:unlisted,listedButNotDerived,otherReads,pass:freeze.sourceDigest===EXPECTED&&recomputedDigest===EXPECTED&&actualDigest===EXPECTED&&rows.every(r=>r.match)&&unlisted.length===0};
fs.writeFileSync(path.join(import.meta.dirname,'q1-freeze-integrity.out.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({pass:out.pass,entries:out.entries,mismatches:out.mismatches.length,unlisted:out.unlistedRuntimeFiles,listedButNotDerived,actualDigest,otherReads:otherReads.length},null,1));
