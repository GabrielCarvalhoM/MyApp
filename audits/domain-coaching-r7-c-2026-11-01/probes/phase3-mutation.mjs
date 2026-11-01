// R7-C Phase 3, step 6: bounded mutation of the R7-C rules (R7C-G01, R7C-G02). Runs on an ISOLATED copy: HEAD's CoachingCore and the audit
// records its fixtures read are extracted with git archive into a temporary directory (node_modules copied from this worktree), each mutant edits
// exact fragments of that copy (each must occur once), runs the named test files there, and restores the bytes (checked by SHA-256). The
// repository is never edited. An unmutated baseline run of every test set must pass first. Not a general mutation score. Prints JSON.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {REPO} from './phase3-lib.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7c-mut-')),tar=path.join(tmp,'x.tar');
const head=spawnSync('git',['rev-parse','HEAD'],{cwd:REPO,encoding:'utf8'}).stdout.trim();
const ar=spawnSync('git',['archive','--format=tar','-o',tar,head,'CoachingCore','audits/domain-coaching-r7-b0-2026-10-31/reviews','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'],{cwd:REPO,encoding:'utf8',maxBuffer:1<<28});
if(ar.status!==0)throw Error('git archive: '+ar.stderr);
if(spawnSync('tar',['-xf','x.tar'],{cwd:tmp}).status!==0)throw Error('tar');fs.rmSync(tar);
fs.cpSync(path.join(REPO,'CoachingCore/node_modules'),path.join(tmp,'CoachingCore/node_modules'),{recursive:true});
const core=path.join(tmp,'CoachingCore'),AD='src/r6-adaptation.mjs',CO='src/r6-composition.mjs';
const R7C=['test/r7c-longitudinal.test.mjs'],CLIN=[...R7C,'test/r7b2-clinical-precedence.test.mjs'],RET=[...R7C,'test/r6-adaptation.test.mjs'];
const M=[
 // ---------- G01 ----------
 {id:'G01-M1',rule:'credit the unknown: an elapsed session with no report gates as executed',file:AD,edits:[["s.date<asOfLocal?'MISSED':s.date===asOfLocal?'NOT_REPORTED':'PENDING'","s.date<asOfLocal?'COMPLETED':s.date===asOfLocal?'NOT_REPORTED':'PENDING'"]],tests:R7C},
 {id:'G01-M2',rule:'remove the question: unknown is read as the entry (zero)',file:CO,edits:[["if(!startDate||!sports.includes('RUN')||first.state.run.mode!=='EASY')return null;","return null;"]],tests:RET},
 {id:'G01-M4',rule:'a proposal travels with the question',file:AD,edits:[["const askOf=x=>({action:'ASK',reason:x.ask,missingInputs:x.missingInputs,...(x.question?{question:x.question}:{})});","const askOf=x=>({action:'ASK',reason:x.ask,missingInputs:x.missingInputs,...(x.question?{question:x.question}:{}),proposal:x.weeks?{weeks:x.weeks}:{}});"]],tests:R7C},
 {id:'G01-M5',rule:'the question crosses a declared pause (its days count as unreported)',file:CO,edits:[["&&!reported.has(s.id)&&!pauses.some(p=>s.date>=p.start&&s.date<=p.end))","&&!reported.has(s.id))"]],tests:RET},
 {id:'G01-M6',rule:'clinical-first inverted (the precedence point removed)',file:AD,edits:[["const clinical=clinicalRoute(kind,review);","const clinical=null;"]],tests:CLIN},
 {id:'G01-M7',rule:'the weekly review re-plans from this week (late evidence rewrites the week it reports)',file:AD,edits:[["const projected=composeWeeks(ctx,program,{fromWeek:w+1,start:nextState,","const projected=composeWeeks(ctx,program,{fromWeek:w,start:nextState,"]],tests:R7C},
 {id:'G01-M8',rule:'C15: a re-based plan keeps the instantiation label',file:AD,edits:[["const runRebased=allAdvance&&!rebased&&changed>0&&runsChanged(program,projected,w+1);","const runRebased=false;"]],tests:R7C},
 {id:'G01-M9',rule:'R2-05: the novice cap does not start on the facts-only path',file:AD,edits:[["if(!hs&&strength.density===undefined&&noviceDensityApplies(skn)&&j<firstStrengthBoundary(skn))strength.density={capped:true};",""]],tests:R7C},
 {id:'G01-M10',rule:'a not-done report is a partial execution',file:AD,edits:[["const notDone=o=>o.actual?.completed===false&&","const notDone=o=>false&&o.actual?.completed===false&&"]],tests:R7C},
 {id:'G01-M11',rule:'a moved session keeps its own row (the slot it left holds the gate)',file:AD,edits:[["filter(s=>s.prescription&&!(s.status==='SKIPPED'&&s.movedTo&&","filter(s=>s.prescription&&!(false&&s.status==='SKIPPED'&&s.movedTo&&"]],tests:R7C},
 // ---------- G02 ----------
 {id:'G02-M1',rule:'consent and revocation ignored (the model is built and read without consent)',file:AD,edits:[["model=updateLearningModel(model,usableBound,{asOf,purposeAllowed:consent,timezoneOffsetMinutes:tz});","model=updateLearningModel({...model,purposeAllowed:true},usableBound,{asOf,purposeAllowed:true,timezoneOffsetMinutes:tz});"],["if(ctx.consent!==true||!model?.purposeAllowed||!allows(ctx.authority,'R6-PARTIAL-NOISY-LEARNING'))return null;","if(!allows(ctx.authority,'R6-PARTIAL-NOISY-LEARNING'))return null;"]],tests:R7C},
 {id:'G02-M2',rule:'one adverse event is enough',file:AD,edits:[["if(e.direction!=='ADVERSE'||!['EMERGING','STRONG'].includes(e.confidence))return null;","if(!(e.adverseCount>=1))return null;"]],tests:R7C},
 {id:'G02-M3',rule:'MIXED evidence is enough',file:AD,edits:[["if(e.direction!=='ADVERSE'||!['EMERGING','STRONG'].includes(e.confidence))return null;","if(!['ADVERSE','MIXED'].includes(e.direction)||!['EMERGING','STRONG'].includes(e.confidence))return null;"]],tests:R7C},
 {id:'G02-M4',rule:'expiry ignored (observations of any age count)',file:AD,edits:[["const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target,arrangementId},{asOf:ctx.asOf});","const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target,arrangementId},{asOf:ctx.asOf,windowDays:36500});"]],tests:R7C},
 {id:'G02-M5',rule:'a new dose (between the executed long run and the step)',file:AD,edits:[["return {runState:{...runState,long:now},reason,","return {runState:{...runState,long:now+(step-now)/2},reason,"]],tests:R7C},
 {id:'G02-M6',rule:'learning operates in taper, race week, post-event and return weeks',file:AD,edits:[["if(!['BUILD','DEVELOPMENT'].includes(phase)||phaseClassOf(ctx.authority.policy,phase,'EASY')!=='BUILD'||runState?.mode!=='EASY'||!Number.isFinite(runState.long))return null;","if(!Number.isFinite(runState?.long))return null;"]],tests:R7C},
 {id:'G02-M7',rule:'the association becomes automatic dose authority and a cause',file:AD,edits:[["causal:false,automaticDoseAuthority:false,basis:'R6-PARTIAL-NOISY-LEARNING'}};","causal:true,automaticDoseAuthority:true,basis:'R6-PARTIAL-NOISY-LEARNING'}};"]],tests:R7C},
 {id:'G02-M8',rule:'comparability: any arrangement pool counts',file:AD,edits:[["const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target,arrangementId},{asOf:ctx.asOf});","const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target},{asOf:ctx.asOf});"]],tests:R7C}
];
const runTests=files=>{const r=spawnSync(process.execPath,['--test',...files],{cwd:core,encoding:'utf8',timeout:1800000,maxBuffer:1<<26});const n=k=>Number((r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))??[])[1]??NaN);return {fail:n('fail'),pass:n('pass'),failing:(r.stdout.match(/^✖ .*$/gm)??[]).filter(l=>!/failing tests/.test(l)).slice(0,5)};};
const baseline={};for(const set of [R7C,CLIN,RET]){const k=set.join('+'),b=runTests(set);baseline[k]=b;if(!(b.fail===0&&b.pass>0))throw Error('baseline fails on the isolated copy: '+k+' '+JSON.stringify(b));}
const results=[];
for(const m of M){
 const file=path.join(core,m.file),original=fs.readFileSync(file),text=original.toString('utf8'),counts=m.edits.map(([f])=>text.split(f).length-1);
 if(counts.some(n=>n!==1)){results.push({id:m.id,rule:m.rule,result:'INVALID',reason:'fragment occurrences '+counts.join(',')});continue;}
 let mutated=text;for(const [f,r] of m.edits)mutated=mutated.replace(f,()=>r);
 let o;try{fs.writeFileSync(file,mutated);o=runTests(m.tests);}finally{fs.writeFileSync(file,original);}
 if(sha(fs.readFileSync(file))!==sha(original))throw Error('restore failed '+m.file);
 results.push({id:m.id,rule:m.rule,file:m.file,tests:m.tests,result:o.fail>0?'KILLED':Number.isFinite(o.fail)?'SURVIVED':'ERROR',failedTests:o.fail,passedTests:o.pass,failing:o.failing});
}
const repoUntouched=spawnSync('git',['diff','--quiet','--','CoachingCore/src','CoachingCore/test'],{cwd:REPO}).status===0;
fs.rmSync(tmp,{recursive:true,force:true});
console.log(JSON.stringify({check:'R7C-P3-MUTATION',head,isolatedCopy:true,repoUntouched,baseline,mutants:results.length,killed:results.filter(r=>r.result==='KILLED').length,survived:results.filter(r=>r.result==='SURVIVED').map(r=>r.id),invalid:results.filter(r=>['INVALID','ERROR'].includes(r.result)).map(r=>r.id),results},null,1));
