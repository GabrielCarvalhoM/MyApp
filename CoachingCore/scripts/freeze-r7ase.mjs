// COACHING CORE — STATE EVIDENCE MODEL single freeze (node scripts/freeze-r7ase.mjs): binds the runtime, tests and policy both reviews read, on
// the same bytes. There is one freeze, STATE-EVIDENCE-FREEZE-1 (Founder request §26, §27): an existing freeze file is never overwritten and a
// second one is refused. The delta is stated against R7A-BOUNDARY-FINAL-FREEZE (the byte-exact copy in
// audits/domain-coaching-r7a-state-evidence-2026-10-28/boundary-freeze-source).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {hash} from '../src/value.mjs';
const cc=path.resolve(import.meta.dirname,'..'),revision='STATE-EVIDENCE-FREEZE-1';
const dir=path.join(cc,'r7/state-evidence'),target=path.join(dir,'RUNTIME_FREEZE_STATE_EVIDENCE.json');
if(fs.existsSync(dir)&&fs.readdirSync(dir).some(f=>/^RUNTIME_FREEZE_/.test(f)))throw Error('The state evidence mission has its single freeze already; no further freeze (Founder request §26, §27)');
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(cc,p))).digest('hex');
const files=Object.fromEntries([...fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...fs.readdirSync(path.join(cc,'test')).filter(f=>f.endsWith('.mjs')).map(f=>'test/'+f),'r6/PROGRAM_POLICY_R6.json','r6/fixtures/dev-authority.mjs','r6/fixtures/profiles.mjs','r6/fixtures/trajectories.mjs','package.json'].sort().map(p=>[p,sha(p)]));
const policy=JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,''));
const bf=JSON.parse(fs.readFileSync(path.join(cc,'../audits/domain-coaching-r7a-state-evidence-2026-10-28/boundary-freeze-source/MANIFEST.json'),'utf8'));
const prior=p=>bf.files['CoachingCore/'+p];
const changed=Object.keys(files).filter(p=>prior(p)!==undefined&&prior(p)!==files[p]),added=Object.keys(files).filter(p=>prior(p)===undefined),removed=Object.keys(bf.files).map(p=>p.replace(/^CoachingCore\//,'')).filter(p=>!files[p]);
const sourceDigest=hash(Object.fromEntries(Object.entries(files).filter(([p])=>p.startsWith('src/'))));
const out={revision,frozenAt:new Date().toISOString(),node:process.version,policyRevision:policy.revision,policyHash:hash(policy),policyFileSha256:files['r6/PROGRAM_POLICY_R6.json'],sourceDigest,files,
 deltaFromR7ABoundaryFreeze:{changed,added,removed,baseline:'audits/domain-coaching-r7a-state-evidence-2026-10-28/boundary-freeze-source/MANIFEST.json',boundaryFreezeSourceDigest:bf.freeze.sourceDigest},
 rule:'The runtime is frozen: both reviews read these bytes, and no correction cycle follows (Founder request §26, §27). A material blocker closes the mission STATE_EVIDENCE_MODEL = NOT_READY and returns to the Founder.'};
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(target,JSON.stringify(out,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({revision,sourceDigest,policyHash:out.policyHash,changed,added,removed}));
