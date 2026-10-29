// DOMAIN_COACHING_R7-A.1 candidate freeze: binds the runtime, tests and policy the judges review (node scripts/freeze-r7a1.mjs R7A1-FREEZE-A1,
// later R7A1-FREEZE-A2). An existing freeze file is never overwritten; the delta is stated against R7A-FREEZE-2 (the byte-exact snapshot).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {hash} from '../src/value.mjs';
const cc=path.resolve(import.meta.dirname,'..'),revision=process.argv[2]??'R7A1-FREEZE-A1';
if(!/^R7A1-FREEZE-A\d+$/.test(revision))throw Error('Revision must be R7A1-FREEZE-A<n>');
const target=path.join(cc,'r7/a1',`RUNTIME_FREEZE_${revision.replace(/-/g,'_')}.json`);
if(fs.existsSync(target))throw Error('Freeze already exists: '+path.relative(cc,target));
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(cc,p))).digest('hex');
const files=Object.fromEntries([...fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...fs.readdirSync(path.join(cc,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f),'r6/PROGRAM_POLICY_R6.json','r6/fixtures/dev-authority.mjs','r6/fixtures/profiles.mjs','r6/fixtures/trajectories.mjs','package.json'].sort().map(p=>[p,sha(p)]));
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));
const f2=JSON.parse(fs.readFileSync(path.join(cc,'../audits/domain-coaching-r7a1-2026-10-27/freeze2-source/MANIFEST.json'),'utf8'));
const prior=p=>f2.files['CoachingCore/'+p];
const changed=Object.keys(files).filter(p=>prior(p)!==undefined&&prior(p)!==files[p]),added=Object.keys(files).filter(p=>prior(p)===undefined),removed=Object.keys(f2.files).map(p=>p.replace(/^CoachingCore\//,'')).filter(p=>!files[p]);
const sourceDigest=hash(Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('src/'))));
const out={revision,frozenAt:new Date().toISOString(),node:process.version,policyRevision:policy.revision,policyHash:hash(policy),policyFileSha256:files['r6/PROGRAM_POLICY_R6.json'],sourceDigest,files,
 deltaFromR7AFreeze2:{changed,added,removed,baseline:'audits/domain-coaching-r7a1-2026-10-27/freeze2-source/MANIFEST.json',freeze2SourceDigest:f2.freeze.sourceDigest},
 rule:'No runtime edit while the judges review this freeze; a fix after the reviews needs a new freeze revision and a single narrow re-check (R7-A.1 cycle bound).'};
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,JSON.stringify(out,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({revision,sourceDigest,policyHash:out.policyHash,changed,added,removed}));
