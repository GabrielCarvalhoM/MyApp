// R7A2-QE-r1 binding check (print only): recompute the R7A2-FREEZE-1 source digest and the 79 bound files.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const cc=path.resolve(import.meta.dirname,'../../../CoachingCore');
const {pathToFileURL}=await import('node:url');const {hash}=await import(pathToFileURL(path.join(cc,'src/value.mjs')).href);
const freeze=JSON.parse(fs.readFileSync(path.join(cc,'r7/a2/RUNTIME_FREEZE_R7A2_FREEZE_1.json'),'utf8'));
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(cc,p))).digest('hex');
const now=Object.fromEntries([...fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f)].sort().map(p=>[p,sha(p)]));
const digest=hash(now);
const bound=Object.keys(freeze.files);
const drift=bound.filter(p=>!fs.existsSync(path.join(cc,p))||sha(p)!==freeze.files[p]);
const srcNow=Object.keys(now), srcBound=bound.filter(p=>p.startsWith('src/'));
const extraSrc=srcNow.filter(p=>!srcBound.includes(p)), missingSrc=srcBound.filter(p=>!srcNow.includes(p));
const testNow=fs.readdirSync(path.join(cc,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f);
const extraTest=testNow.filter(p=>!bound.includes(p));
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));
console.log(JSON.stringify({at:new Date().toISOString(),node:process.version,revision:freeze.revision,sourceDigest:digest,expected:freeze.sourceDigest,match:digest===freeze.sourceDigest,boundFiles:bound.length,drift,extraSrc,missingSrc,extraTest,policyRevision:policy.revision,policyHash:hash(policy),policyMatch:hash(policy)===freeze.policyHash,freezeFileSha256:sha('r7/a2/RUNTIME_FREEZE_R7A2_FREEZE_1.json')},null,1));
