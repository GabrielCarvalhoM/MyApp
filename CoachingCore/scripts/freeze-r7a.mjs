// DOMAIN_COACHING_R7-A candidate freeze: binds the runtime, tests and policy the judges review. A new revision name is required for any
// later freeze (node scripts/freeze-r7a.mjs R7A-FREEZE-2); an existing freeze file is never overwritten.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {hash} from '../src/value.mjs';
const cc=path.resolve(import.meta.dirname,'..'),revision=process.argv[2]??'R7A-FREEZE-1';
if(!/^R7A-FREEZE-\d+$/.test(revision))throw Error('Revision must be R7A-FREEZE-<n>');
const target=path.join(cc,'r7',`RUNTIME_FREEZE_${revision.replace('R7A-FREEZE-','R7A_')}.json`);
if(fs.existsSync(target))throw Error('Freeze already exists: '+path.relative(cc,target));
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(cc,p))).digest('hex');
const files=Object.fromEntries([...fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...fs.readdirSync(path.join(cc,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f),'r6/PROGRAM_POLICY_R6.json','r6/fixtures/dev-authority.mjs','r6/fixtures/profiles.mjs','r6/fixtures/trajectories.mjs','package.json'].sort().map(p=>[p,sha(p)]));
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));
const pre=JSON.parse(fs.readFileSync(path.join(cc,'../audits/domain-coaching-r7a-2026-10-27/pre-r7a-source/MANIFEST.json'),'utf8')).files;
const changed=Object.keys(files).filter(p=>pre['CoachingCore/'+p]!==undefined&&pre['CoachingCore/'+p]!==files[p]),added=Object.keys(files).filter(p=>pre['CoachingCore/'+p]===undefined);
const sourceDigest=hash(Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('src/'))));
const out={revision,frozenAt:new Date().toISOString(),node:process.version,policyRevision:policy.revision,policyHash:hash(policy),policyFileSha256:files['r6/PROGRAM_POLICY_R6.json'],sourceDigest,files,deltaFromR6Closure:{changed,added,baseline:'audits/domain-coaching-r7a-2026-10-27/pre-r7a-source/MANIFEST.json'},rule:'No runtime edit while the judges review this freeze; a fix after a review needs a new freeze revision and a narrow re-check of the changed files.'};
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,JSON.stringify(out,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({revision,sourceDigest,policyHash:out.policyHash,changed,added}));
