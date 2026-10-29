// DOMAIN_COACHING_R7-A boundary single freeze (node scripts/freeze-r7ab.mjs): binds the runtime, tests and policy both re-checks review, on the
// same bytes. There is one freeze, R7A-BOUNDARY-FINAL-FREEZE (Founder request §19, §22): an existing freeze file is never overwritten and a
// second one is refused. The delta is stated against R7A-FINAL-FREEZE (the byte-exact copy in
// audits/domain-coaching-r7a-boundary-2026-10-28/final-freeze-source).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {hash} from '../src/value.mjs';
const cc=path.resolve(import.meta.dirname,'..'),revision='R7A-BOUNDARY-FINAL-FREEZE';
const dir=path.join(cc,'r7/boundary'),target=path.join(dir,'RUNTIME_FREEZE_R7A_BOUNDARY.json');
if(fs.existsSync(dir)&&fs.readdirSync(dir).some(f=>/^RUNTIME_FREEZE_/.test(f)))throw Error('The R7-A boundary closure has its single freeze already; no further freeze (Founder request §22)');
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(cc,p))).digest('hex');
const files=Object.fromEntries([...fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...fs.readdirSync(path.join(cc,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f),'r6/PROGRAM_POLICY_R6.json','r6/fixtures/dev-authority.mjs','r6/fixtures/profiles.mjs','r6/fixtures/trajectories.mjs','package.json'].sort().map(p=>[p,sha(p)]));
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));
const ff=JSON.parse(fs.readFileSync(path.join(cc,'../audits/domain-coaching-r7a-boundary-2026-10-28/final-freeze-source/MANIFEST.json'),'utf8'));
const prior=p=>ff.files['CoachingCore/'+p];
const changed=Object.keys(files).filter(p=>prior(p)!==undefined&&prior(p)!==files[p]),added=Object.keys(files).filter(p=>prior(p)===undefined),removed=Object.keys(ff.files).map(p=>p.replace(/^CoachingCore\//,'')).filter(p=>!files[p]);
const sourceDigest=hash(Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('src/'))));
const out={revision,frozenAt:new Date().toISOString(),node:process.version,policyRevision:policy.revision,policyHash:hash(policy),policyFileSha256:files['r6/PROGRAM_POLICY_R6.json'],sourceDigest,files,
 deltaFromR7AFinalFreeze:{changed,added,removed,baseline:'audits/domain-coaching-r7a-boundary-2026-10-28/final-freeze-source/MANIFEST.json',finalFreezeSourceDigest:ff.freeze.sourceDigest},
 rule:'The runtime is frozen: both re-checks review these bytes, and no correction cycle follows (Founder request §22). A material blocker closes R7-A NOT_READY and returns to the Founder.'};
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(target,JSON.stringify(out,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({revision,sourceDigest,policyHash:out.policyHash,changed,added,removed}));
