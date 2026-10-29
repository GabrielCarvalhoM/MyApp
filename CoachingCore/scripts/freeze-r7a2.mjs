// DOMAIN_COACHING_R7-A.2 single freeze (node scripts/freeze-r7a2.mjs): binds the runtime, tests and policy both re-checks review, on the same
// bytes. There is one freeze (Founder request §19): an existing freeze file is never overwritten and a second revision is refused. The delta is
// stated against R7A1-FREEZE-A2 (the byte-exact copy in audits/domain-coaching-r7a2-2026-10-28/freezeA2-source).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {hash} from '../src/value.mjs';
const cc=path.resolve(import.meta.dirname,'..'),revision='R7A2-FREEZE-1';
const dir=path.join(cc,'r7/a2'),target=path.join(dir,'RUNTIME_FREEZE_R7A2_FREEZE_1.json');
if(fs.existsSync(dir)&&fs.readdirSync(dir).some(f=>/^RUNTIME_FREEZE_R7A2_/.test(f)))throw Error('R7-A.2 has its single freeze already; no further freeze (Founder request §19)');
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(cc,p))).digest('hex');
const files=Object.fromEntries([...fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...fs.readdirSync(path.join(cc,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f),'r6/PROGRAM_POLICY_R6.json','r6/fixtures/dev-authority.mjs','r6/fixtures/profiles.mjs','r6/fixtures/trajectories.mjs','package.json'].sort().map(p=>[p,sha(p)]));
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));
const a2=JSON.parse(fs.readFileSync(path.join(cc,'../audits/domain-coaching-r7a2-2026-10-28/freezeA2-source/MANIFEST.json'),'utf8'));
const prior=p=>a2.files['CoachingCore/'+p];
const changed=Object.keys(files).filter(p=>prior(p)!==undefined&&prior(p)!==files[p]),added=Object.keys(files).filter(p=>prior(p)===undefined),removed=Object.keys(a2.files).map(p=>p.replace(/^CoachingCore\//,'')).filter(p=>!files[p]);
const sourceDigest=hash(Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('src/'))));
const out={revision,frozenAt:new Date().toISOString(),node:process.version,policyRevision:policy.revision,policyHash:hash(policy),policyFileSha256:files['r6/PROGRAM_POLICY_R6.json'],sourceDigest,files,
 deltaFromR7A1FreezeA2:{changed,added,removed,baseline:'audits/domain-coaching-r7a2-2026-10-28/freezeA2-source/MANIFEST.json',freezeA2SourceDigest:a2.freeze.sourceDigest},
 rule:'The runtime is frozen: both re-checks review these bytes, and no correction cycle follows (Founder request §19). A material blocker closes R7-A.2 NOT_READY and returns to the Founder.'};
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(target,JSON.stringify(out,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({revision,sourceDigest,policyHash:out.policyHash,changed,added,removed}));
