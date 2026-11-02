// R7-C Phase 5: the Phase 3 mutation set (the same 18 mutants and fragments), the G02-M4 equivalence witness and the 8 Phase 4 rule mutants, run
// with the Phase 4 and Phase 5 directed tests in the R7-C set (P4-M6's fragment is lengthened to stay unique: gapAnsweredBy now opens with the
// same guard); plus, reported apart, the Phase 5 mutants of SSCTR-SD-01/02/03, every one of which must be killed. Isolated copy:
// HEAD's CoachingCore and the audit records its fixtures read are extracted with git archive into a temporary directory (node_modules copied from
// this worktree); each mutant edits exact fragments of that copy (each must occur once), runs the named test files there and restores the bytes
// (checked by SHA-256). The repository is never edited. An unmutated baseline run of every test set must pass first. Prints JSON.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {REPO} from './phase3-lib.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7c-mut5-')),tar=path.join(tmp,'x.tar');
const head=spawnSync('git',['rev-parse','HEAD'],{cwd:REPO,encoding:'utf8'}).stdout.trim();
const ar=spawnSync('git',['archive','--format=tar','-o',tar,head,'CoachingCore','audits/domain-coaching-r7-b0-2026-10-31/reviews','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'],{cwd:REPO,encoding:'utf8',maxBuffer:1<<28});
if(ar.status!==0)throw Error('git archive: '+ar.stderr);
if(spawnSync('tar',['-xf','x.tar'],{cwd:tmp}).status!==0)throw Error('tar');fs.rmSync(tar);
fs.cpSync(path.join(REPO,'CoachingCore/node_modules'),path.join(tmp,'CoachingCore/node_modules'),{recursive:true});
const core=path.join(tmp,'CoachingCore'),AD='src/r6-adaptation.mjs',CO='src/r6-composition.mjs',LE='src/r6-learning.mjs';
const R7C=['test/r7c-longitudinal.test.mjs','test/r7c-phase4.test.mjs','test/r7c-phase5.test.mjs'],CLIN=[...R7C,'test/r7b2-clinical-precedence.test.mjs'],RET=[...R7C,'test/r6-adaptation.test.mjs'];
const M=[
 // ---------- G01 (Phase 3 set) ----------
 {id:'G01-M1',rule:'credit the unknown: an elapsed session with no report gates as executed',edits:[[AD,"s.date<asOfLocal?'MISSED':s.date===asOfLocal?'NOT_REPORTED':'PENDING'","s.date<asOfLocal?'COMPLETED':s.date===asOfLocal?'NOT_REPORTED':'PENDING'"]],tests:R7C},
 {id:'G01-M2',rule:'remove the question: unknown is read as the entry (zero)',edits:[[CO,"if(!startDate||!sports.includes('RUN')||first.state.run.mode!=='EASY')return null;","return null;"]],tests:RET},
 {id:'G01-M4',rule:'a proposal travels with the question',edits:[[AD,"const askOf=x=>({action:'ASK',reason:x.ask,missingInputs:x.missingInputs,...(x.question?{question:x.question}:{})});","const askOf=x=>({action:'ASK',reason:x.ask,missingInputs:x.missingInputs,...(x.question?{question:x.question}:{}),proposal:x.weeks?{weeks:x.weeks}:{}});"]],tests:R7C},
 {id:'G01-M5',rule:'the question crosses a declared pause (its days count as unreported)',edits:[[CO,"&&!reported.has(s.id)&&!pauses.some(p=>s.date>=p.start&&s.date<=p.end))","&&!reported.has(s.id))"]],tests:RET},
 {id:'G01-M6',rule:'clinical-first inverted (the precedence point removed)',edits:[[AD,"const clinical=clinicalRoute(kind,review);","const clinical=null;"]],tests:CLIN},
 {id:'G01-M7',rule:'the weekly review re-plans from this week (late evidence rewrites the week it reports)',edits:[[AD,"const projected=composeWeeks(ctx,program,{fromWeek:w+1,start:nextState,","const projected=composeWeeks(ctx,program,{fromWeek:w,start:nextState,"]],tests:R7C},
 {id:'G01-M8',rule:'C15: a re-based plan keeps the instantiation label',edits:[[AD,"const runRebased=allAdvance&&!rebased&&changed>0&&runsChanged(program,projected,w+1);","const runRebased=false;"]],tests:R7C},
 {id:'G01-M9',rule:'R2-05: the novice cap does not start on the facts-only path',edits:[[AD,"if(!hs&&strength.density===undefined&&noviceDensityApplies(skn)&&j<firstStrengthBoundary(skn))strength.density={capped:true};",""]],tests:R7C},
 {id:'G01-M10',rule:'a not-done report is a partial execution',edits:[[AD,"const notDone=o=>o.actual?.completed===false&&","const notDone=o=>false&&o.actual?.completed===false&&"]],tests:R7C},
 {id:'G01-M11',rule:'a moved session keeps its own row (the slot it left holds the gate)',edits:[[AD,"filter(s=>s.prescription&&!(s.status==='SKIPPED'&&s.movedTo&&","filter(s=>s.prescription&&!(false&&s.status==='SKIPPED'&&s.movedTo&&"]],tests:R7C},
 // ---------- G02 (Phase 3 set) ----------
 {id:'G02-M1',rule:'consent and revocation ignored (the model is built and read without consent)',edits:[[AD,"model=updateLearningModel(model,usableBound,{asOf,purposeAllowed:consent,timezoneOffsetMinutes:tz});","model=updateLearningModel({...model,purposeAllowed:true},usableBound,{asOf,purposeAllowed:true,timezoneOffsetMinutes:tz});"],[AD,"if(ctx.consent!==true||!model?.purposeAllowed||!allows(ctx.authority,'R6-PARTIAL-NOISY-LEARNING'))return null;","if(!allows(ctx.authority,'R6-PARTIAL-NOISY-LEARNING'))return null;"]],tests:R7C},
 {id:'G02-M2',rule:'one adverse event is enough',edits:[[AD,"if(e.direction!=='ADVERSE'||!['EMERGING','STRONG'].includes(e.confidence))return null;","if(!(e.adverseCount>=1))return null;"]],tests:R7C},
 {id:'G02-M3',rule:'MIXED evidence is enough',edits:[[AD,"if(e.direction!=='ADVERSE'||!['EMERGING','STRONG'].includes(e.confidence))return null;","if(!['ADVERSE','MIXED'].includes(e.direction)||!['EMERGING','STRONG'].includes(e.confidence))return null;"]],tests:R7C},
 {id:'G02-M4',rule:'expiry ignored (observations of any age count)',edits:[[AD,"const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target,arrangementId},{asOf:ctx.asOf});","const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target,arrangementId},{asOf:ctx.asOf,windowDays:36500});"]],tests:R7C},
 {id:'G02-M5',rule:'a new dose (between the executed long run and the step)',edits:[[AD,"return {runState:{...runState,long:now},reason,","return {runState:{...runState,long:now+(step-now)/2},reason,"]],tests:R7C},
 {id:'G02-M6',rule:'learning operates in taper, race week, post-event and return weeks',edits:[[AD,"if(!['BUILD','DEVELOPMENT'].includes(phase)||phaseClassOf(ctx.authority.policy,phase,'EASY')!=='BUILD'||runState?.mode!=='EASY'||!Number.isFinite(runState.long))return null;","if(!Number.isFinite(runState?.long))return null;"]],tests:R7C},
 {id:'G02-M7',rule:'the association becomes automatic dose authority and a cause',edits:[[AD,"causal:false,automaticDoseAuthority:false,basis:'R6-PARTIAL-NOISY-LEARNING'}};","causal:true,automaticDoseAuthority:true,basis:'R6-PARTIAL-NOISY-LEARNING'}};"]],tests:R7C},
 {id:'G02-M8',rule:'comparability: any arrangement pool counts',edits:[[AD,"const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target,arrangementId},{asOf:ctx.asOf});","const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target},{asOf:ctx.asOf});"]],tests:R7C}
];
// G02-M4 equivalence witness (not in the 18): expiry removed both from the model's update (normalizeObservations prunes by maximumAgeDays at the
// decision clock) and from the learned query. If the directed expiry test kills this and not G02-M4, the query window alone is redundant.
const WITNESS=[{id:'G02-M4b',rule:'expiry removed from the model update and from the learned query (witness for G02-M4)',edits:[[AD,"const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target,arrangementId},{asOf:ctx.asOf});","const e=evidenceFor(model,{sessionType:'RUN:LONG',phaseClass:'BUILD',plannedHash:target,arrangementId},{asOf:ctx.asOf,windowDays:36500});"],[LE,"maximumAgeDays:model.policy.maximumAgeDays,timezoneOffsetMinutes});","maximumAgeDays:36500,timezoneOffsetMinutes});"]],tests:R7C}];
// The Phase 4 rules (reported apart; not part of the 18/18 criterion).
const P4=[
 {id:'P4-M1',rule:'P3-02: the gap guard removed',edits:[[AD,"gap=clinical?null:runGapInForce(facts)","gap=null"]],tests:R7C},
 {id:'P4-M2',rule:'P3-02: every proposal counts as planning no run dose',edits:[[AD,"return now.length===was.length&&now.every(","return true||now.length===was.length&&now.every("]],tests:R7C},
 {id:'P4-M3',rule:'P3-02: a KEEP keeps the plan with the question beside it instead of asking',edits:[[AD,"if(!unreported&&d.proposal&&plansNoRunDose(ctx,d.proposal))","if(!unreported&&(!d.proposal||plansNoRunDose(ctx,d.proposal)))"]],tests:R7C},
 {id:'P4-M4',rule:'P3-02: the question carried by an independent change is not pending',edits:[[AD,"const carried=!pendingStatus&&!!result.question;","const carried=false;"]],tests:R7C},
 {id:'P4-M5',rule:'P3-02: a handler\'s own later-week question replaces this week\'s',edits:[[AD,"unreported=d.question?.kind==='UNREPORTED_TRAINING';","unreported=false;"]],tests:R7C},
 {id:'P4-M6',rule:'P3-02: a return report is held by the guard (its declared days ignored)',edits:[[AD,"if(ctx.kind==='RETURN_AFTER_PAUSE'||['CLINICAL_HUMAN_REQUIRED','ASK','HOLD','UNSUPPORTED'].includes(status)","if(['CLINICAL_HUMAN_REQUIRED','ASK','HOLD','UNSUPPORTED'].includes(status)"]],tests:RET},
 {id:'P4-M7',rule:'P3-01: the peaks dependency removed (taper and race week read an empty peak as zero)',edits:[[CO,"&&!peaksDecide(ctx,next,fromWeek,{free,start,sports,completedRuns,unknown,startDate}))return null;",")return null;"]],tests:R7C},
 {id:'P4-M8',rule:'P3-03: the re-base reason states the Phase 3 cause whatever the facts',edits:[[AD,"const why=extraReason??(runRebased?rebaseReason(ctx,projected):","const why=extraReason??(runRebased?'Executed as planned this week; next week’s runs start from what has been executed, which differs from what the plan had assumed for weeks with no executed evidence (they earn nothing), so the plan is re-based, not kept':"]],tests:R7C}
];
// The Phase 5 mutants of SSCTR-SD-01/02/03 (reported apart; each must be killed).
const P5=[
 {id:'SD-M1',rule:'SD-01: the answer clears the pending question without re-planning (the stored doses stay in force)',edits:[[AD,"const moved=viewMovedBy(ctx),answered=!moved&&gapAnsweredBy(ctx);","const moved=viewMovedBy(ctx),answered=false;"]],tests:R7C},
 {id:'SD-M2',rule:'SD-01/02: the answer re-plans the following weeks but not the answer week',edits:[[AD,"const replan=composeWeeks(ctx,ctx.program,{fromWeek:ctx.w});\n if(replan.ask)return {ask:askOf(replan)};\n const changed=changedSessions(ctx.program,replan);if(!changed)return null;","const replan=composeWeeks(ctx,ctx.program,{fromWeek:answered?ctx.w+1:ctx.w});\n if(replan.ask)return {ask:askOf(replan)};\n const changed=changedSessions(ctx.program,replan);if(!changed)return null;"]],tests:R7C},
 {id:'SD-M3a',rule:'SD-03: a signal the question held is not re-evaluated with the answer',edits:[[AD,"const held=kind==='WEEKLY_REVIEW'&&!gap&&!factual?.ask?heldSignal(review.referenceState,w):null;","const held=null;"]],tests:R7C},
 {id:'SD-M3b',rule:'SD-03: the answer event\'s own signal is dropped (it is decided as a plain review)',edits:[[AD,"||(held&&replayHeld(c,held))||(HANDLERS[kind]??weeklyReview)(c);","||(held&&replayHeld(c,held))||(factual?.reason?weeklyReview:HANDLERS[kind]??weeklyReview)(c);"]],tests:R7C},
 {id:'SD-M3c',rule:'SD-03: the held signal does not travel with the pending question',edits:[[AD,"if(signal)pending.signal=signal;","if(false)pending.signal=signal;"]],tests:R7C},
 {id:'SD-M4',rule:'SD-01: after a known miss the answer re-plans strength only (the stale projected run doses stay)',edits:[[AD,"const replan=composeWeeks(ctx,ctx.program,{fromWeek:ctx.w});\n if(replan.ask)return {ask:askOf(replan)};\n const changed=changedSessions(ctx.program,replan);if(!changed)return null;","const replan=composeWeeks(ctx,ctx.program,{fromWeek:ctx.w,...(answered?{sports:['STRENGTH']}:{})});\n if(replan.ask)return {ask:askOf(replan)};\n const changed=changedSessions(ctx.program,replan);if(!changed)return null;"]],tests:R7C}
];
const runTests=files=>{const r=spawnSync(process.execPath,['--test',...files],{cwd:core,encoding:'utf8',timeout:1800000,maxBuffer:1<<26});const n=k=>Number((r.stdout.match(new RegExp('ℹ '+k+' (\\d+)'))??[])[1]??NaN);return {fail:n('fail'),pass:n('pass'),failing:(r.stdout.match(/^✖ .*$/gm)??[]).filter(l=>!/failing tests/.test(l)).slice(0,5)};};
const baseline={};for(const set of [R7C,CLIN,RET]){const k=set.join('+'),b=runTests(set);baseline[k]=b;if(!(b.fail===0&&b.pass>0))throw Error('baseline fails on the isolated copy: '+k+' '+JSON.stringify(b));}
function mutate(m){
 const files=[...new Set(m.edits.map(([f])=>f))],originals=Object.fromEntries(files.map(f=>[f,fs.readFileSync(path.join(core,f))]));
 const texts=Object.fromEntries(files.map(f=>[f,originals[f].toString('utf8')]));
 const counts=m.edits.map(([f,a])=>texts[f].split(a).length-1);
 if(counts.some(n=>n!==1))return {id:m.id,rule:m.rule,result:'INVALID',reason:'fragment occurrences '+counts.join(',')};
 for(const [f,a,b] of m.edits)texts[f]=texts[f].replace(a,()=>b);
 let o;try{for(const f of files)fs.writeFileSync(path.join(core,f),texts[f]);o=runTests(m.tests);}finally{for(const f of files)fs.writeFileSync(path.join(core,f),originals[f]);}
 for(const f of files)if(sha(fs.readFileSync(path.join(core,f)))!==sha(originals[f]))throw Error('restore failed '+f);
 return {id:m.id,rule:m.rule,files,tests:m.tests,result:o.fail>0?'KILLED':Number.isFinite(o.fail)?'SURVIVED':'ERROR',failedTests:o.fail,passedTests:o.pass,failing:o.failing};
}
const results=M.map(mutate),witness=WITNESS.map(mutate),phase4=P4.map(mutate),phase5=P5.map(mutate);
const repoUntouched=spawnSync('git',['diff','--quiet','--','CoachingCore/src','CoachingCore/test'],{cwd:REPO}).status===0;
fs.rmSync(tmp,{recursive:true,force:true});
const sum=list=>({mutants:list.length,killed:list.filter(r=>r.result==='KILLED').length,survived:list.filter(r=>r.result==='SURVIVED').map(r=>r.id),invalid:list.filter(r=>['INVALID','ERROR'].includes(r.result)).map(r=>r.id)});
console.log(JSON.stringify({check:'R7C-P5-MUTATION',head,isolatedCopy:true,repoUntouched,baseline,phase3Set:sum(results),equivalenceWitness:sum(witness),phase4Rules:sum(phase4),phase5SD:sum(phase5),results,witness,phase4,phase5},null,1));
