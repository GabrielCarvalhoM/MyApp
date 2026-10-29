import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {hash} from '../src/value.mjs';

/**
 * Freezes everything that decides R6 behaviour before the fresh holdout author starts: runtime source, every data file
 * the runtime reads (policies and the reviews that enable them), the holdout interface and the evaluator.
 * Writes once; a later run only confirms the digest.
 */
const root=path.resolve(import.meta.dirname,'../..'),folder=path.join(root,'CoachingCore/r6');
const files=new Set();
const walk=rel=>{for(const e of fs.readdirSync(path.join(root,rel),{withFileTypes:true})){const p=path.posix.join(rel,e.name);if(e.isDirectory())walk(p);else if(p.endsWith('.mjs'))files.add(p);}};
walk('CoachingCore/src');
for(const p of [...files]){
 const text=fs.readFileSync(path.join(root,p),'utf8');
 for(const m of text.matchAll(/new URL\('(\.\.\/[^']+\.json)',import\.meta\.url\)/g)){
  const target=path.posix.normalize(path.posix.join(path.posix.dirname(p),m[1]));
  assert.ok(fs.existsSync(path.join(root,target)),'Runtime data file missing: '+target);files.add(target);
 }
}
for(const p of ['CoachingCore/r6/holdout/INTERFACE_ONLY.md','CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/package.json'])files.add(p);
const entries=[...files].sort().map(p=>({path:p,sha256:createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')}));
const out=path.join(folder,'RUNTIME_FREEZE_R6.json'),sourceDigest=hash(entries);
if(fs.existsSync(out)){assert.equal(JSON.parse(fs.readFileSync(out,'utf8')).sourceDigest,sourceDigest,'Frozen source changed; first evidence must never be overwritten');console.log('Freeze unchanged '+sourceDigest);}
else{fs.writeFileSync(out,JSON.stringify({revision:'R6-FREEZE-1',frozenAt:new Date().toISOString(),node:process.version,sourceDigest,entries,holdoutAuthorStarted:false},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({frozen:sourceDigest,entries:entries.length}));}
