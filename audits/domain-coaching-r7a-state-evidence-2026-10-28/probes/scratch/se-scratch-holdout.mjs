// Scratch (author, pre-freeze): runs each R6 holdout case on the live runtime and the boundary-freeze copy, reporting the cases that throw and,
// for one case id (argv), each step's status and week-start authorities on both. DEV_TEST_ONLY; prints only.
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../../../..'),snap=path.join(root,'audits/domain-coaching-r7a-state-evidence-2026-10-28/boundary-freeze-source');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'se-h-'));const man=JSON.parse(fs.readFileSync(path.join(snap,'MANIFEST.json'),'utf8'));
for(const rel of Object.keys(man.files)){fs.mkdirSync(path.dirname(path.join(tmp,rel)),{recursive:true});fs.copyFileSync(path.join(snap,rel),path.join(tmp,rel));}
for(const p of ['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/scripts/simulate-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'])if(!man.files[p]){fs.mkdirSync(path.dirname(path.join(tmp,p)),{recursive:true});fs.copyFileSync(path.join(root,p),path.join(tmp,p));}
const load=async base=>({ev:await import(pathToFileURL(path.join(base,'CoachingCore/scripts/evaluate-holdout-r6.mjs')).href),dev:await import(pathToFileURL(path.join(base,'CoachingCore/r6/fixtures/dev-authority.mjs')).href)});
const rt={live:await load(root),boundary:await load(tmp)},cases=JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json'),'utf8')).cases;
const out={throws:{}};
for(const [n,r] of Object.entries(rt))for(const c of cases){try{r.ev.evaluateHoldoutCase(structuredClone(c),{authority:r.dev.devAuthority()});}catch(e){(out.throws[n]??=[]).push(c.caseId+': '+e.message.slice(0,160));}}
const id=process.argv[2];
if(id){const c=cases.find(x=>x.caseId===id);out.case={caseId:id,operation:c.operation,steps:c.steps?.length??null,keys:Object.keys(c)};}
fs.rmSync(tmp,{recursive:true,force:true});console.log(JSON.stringify(out,null,1));
