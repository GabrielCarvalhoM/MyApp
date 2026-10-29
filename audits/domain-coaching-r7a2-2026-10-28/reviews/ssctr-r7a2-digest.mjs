// SSCTR R7-A.2 digest probe (prints only). Recomputes the R7A2-FREEZE-1 source digest and policy hash from the live CoachingCore bytes,
// with the same method as the freeze (sha256 per file; canonical hash of the src/ map via src/value.mjs), and compares every frozen file.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../../..'),cc=path.join(root,'CoachingCore');
const {hash}=await import(pathToFileURL(path.join(cc,'src/value.mjs')).href);
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(cc,p))).digest('hex');
const freeze=JSON.parse(fs.readFileSync(path.join(cc,'r7/a2/RUNTIME_FREEZE_R7A2_FREEZE_1.json'),'utf8'));
const files=Object.fromEntries([...fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...fs.readdirSync(path.join(cc,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f),'r6/PROGRAM_POLICY_R6.json','r6/fixtures/dev-authority.mjs','r6/fixtures/profiles.mjs','r6/fixtures/trajectories.mjs','package.json'].sort().map(p=>[p,sha(p)]));
const sourceDigest=hash(Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('src/'))));
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));
const mismatched=[...new Set([...Object.keys(files),...Object.keys(freeze.files)])].filter(p=>files[p]!==freeze.files[p]);
console.log(JSON.stringify({at:new Date().toISOString(),node:process.version,sourceDigest,sourceDigestMatchesFreeze:sourceDigest===freeze.sourceDigest,policyRevision:policy.revision,policyHash:hash(policy),policyHashMatchesFreeze:hash(policy)===freeze.policyHash,filesCompared:Object.keys(files).length,mismatched},null,1));
