// Recomputes the R7-A.1 source digest and policy hash from the live CoachingCore tree (read-only).
import fs from 'node:fs'; import path from 'node:path'; import {createHash} from 'node:crypto';
import {fileURLToPath, pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const cc=path.resolve(here,'../../../CoachingCore');
const {hash}=await import(pathToFileURL(path.join(cc,'src/value.mjs')).href);
const src=fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).sort();
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const files=Object.fromEntries(src.map(f=>['src/'+f,sha(path.join(cc,'src',f))]));
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8'));
const freeze=JSON.parse(fs.readFileSync(path.join(cc,'r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A1.json'),'utf8'));
const sourceDigest=hash(files), policyHash=hash(policy);
const frozenFileMismatches=Object.entries(freeze.files).filter(([p,h])=>{try{return sha(path.join(cc,p))!==h}catch{return true}}).map(([p])=>p);
console.log(JSON.stringify({at:new Date().toISOString(),sourceDigest,policyHash,matchesFreeze:sourceDigest===freeze.sourceDigest&&policyHash===freeze.policyHash,frozenFileMismatches,srcCount:src.length}));
