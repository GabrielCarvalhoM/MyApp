// QRE probe Q1b: real authority vs SSCTR records, policy-hash binding, and fail-closed behaviour per boundary.
// Uses the REAL loader r6Authority() for the baseline; per-boundary disabling injects a modified copy via options.authority.
import fs from 'node:fs';
import path from 'node:path';
import {R6,r6Authority,allows,loadR6Policy,hash,simulateProgram,baseIntake,review,obsFor,sessionsOf,write,safe,elig,addDays} from './qlib.mjs';

const root=path.resolve(import.meta.dirname,'../../../..');
const rev=JSON.parse(fs.readFileSync(path.join(root,'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json'),'utf8'));
const policy=loadR6Policy(),policyHash=hash(policy);
const real=r6Authority();
const checks=[];const ok=(id,pass,detail)=>checks.push({id,pass:!!pass,detail});

// 1. Independent recomputation of what the records approve.
const ENABLING={APPROVE:'APPROVED',APPROVE_WITH_CONDITIONS:'APPROVED',LIMITED_REVERSIBLE_RECOMMENDATION:'LIMITED'};
const expected={};
for(const id of policy.scientificBoundaryIds){const r=rev.records.filter(x=>x.boundaryId===id);const good=r.find(x=>x.policyHash===policyHash&&x.independent===true&&['APPROVE','APPROVE_WITH_CONDITIONS'].includes(x.disposition)&&['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS'].includes(x.evidenceStatus)&&x.sourceIds?.length);if(good)expected[id]='APPROVED';}
ok('policyHashMatchesReview',policyHash===rev.policyHash&&policyHash.startsWith('af2779fe'),{policyHash,reviewPolicyHash:rev.policyHash});
ok('realAuthorityValid',real.valid===true&&real.policyHash===policyHash,{valid:real.valid,policyHash:real.policyHash,source:real.source});
ok('approvedEqualsRecords',hash(real.approved)===hash(expected)&&Object.keys(expected).length===10,{approved:real.approved,expected});
ok('everyRecordBoundToPolicyHash',rev.records.every(r=>r.policyHash===policyHash),rev.records.map(r=>[r.boundaryId,r.policyHash.slice(0,12),r.disposition,r.evidenceStatus,r.independent]));
ok('conditionsTravelWithRecords',real.records.every(r=>r.conditions.length>0),real.records.map(r=>[r.boundaryId,r.conditions.length]));
// 2. Binding: any policy change or a review record bound to another hash disables.
const pol2=structuredClone(policy);pol2.operational.run.easyStepMinutes=6;
const a2=r6Authority({policy:pol2});
ok('policyByteChangeDisablesAll',Object.keys(a2.approved).length===0&&a2.valid===false,{approved:a2.approved,valid:a2.valid});
const rev3=structuredClone(rev);rev3.records.find(r=>r.boundaryId==='R6-RUN-QUALITY').policyHash='0'.repeat(64);
const a3=r6Authority({review:rev3});
ok('recordWithOtherHashDisablesOnlyThatBoundary',!a3.approved['R6-RUN-QUALITY']&&Object.keys(a3.approved).length===9,a3.approved);
const rev4=structuredClone(rev);rev4.records.find(r=>r.boundaryId==='R6-ROTATION').independent=false;
ok('nonIndependentRecordDisables',!r6Authority({review:rev4}).approved['R6-ROTATION'],null);
const rev5=structuredClone(rev);rev5.records.find(r=>r.boundaryId==='R6-SUBSTITUTION').disposition='REJECT';
ok('rejectDispositionDisables',!r6Authority({review:rev5}).approved['R6-SUBSTITUTION'],null);
ok('missingReviewDisablesAll',Object.keys(r6Authority({review:{records:[]}}).approved).length===0,null);

// 3. Fail-closed with one boundary disabled (injected authority object; no file edited).
const without=id=>({...real,approved:Object.fromEntries(Object.entries(real.approved).filter(([k])=>k!==id))});
const HM=baseIntake({id:'q-hm',weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'HALF_MARATHON',date:'2027-02-14'}},strength:'RUNNING_SUPPORT'}}});
const UNKNOWN_LOAD=baseIntake({id:'q-unk',athlete:{knownExercises:[],strengthExperience:'NOVICE'}});
const RESTART=baseIntake({id:'q-restart',athlete:{recent:{runDaysPerWeek:0,runMinutesPerWeek:0},pause:{nonclinical:true,weeks:6,reasonCategory:'WORK'}}});
const BASE=baseIntake({id:'q-base',weeks:12});
const g=(input,a)=>R6.generateProgram(input,a?{authority:a}:{});
const res={};
res.coldStart=g(BASE,without('R6-COLD-START')).status;
res.plannedProgressionGenerate=g(BASE,without('R6-PLANNED-PROGRESSION')).status;
res.loadEstablishmentUnknown=g(UNKNOWN_LOAD,without('R6-LOAD-ESTABLISHMENT')).status;
const knownOnly=g(BASE,without('R6-LOAD-ESTABLISHMENT'));
res.loadEstablishmentKnownStatus=knownOnly.status;
res.loadEstablishmentKnownEstablishRows=knownOnly.program?sessionsOf(knownOnly.program).filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises).filter(e=>e.load.mode==='ESTABLISH'||e.role==='PRACTICE').length:null;
res.eventTransition=g(HM,without('R6-EVENT-TRANSITION')).status;
res.nonclinicalReturnRestart=g(RESTART,without('R6-NONCLINICAL-RETURN')).status;
const base=g(BASE).program;
// Evaluate-time fail-closed.
const ev=(prog,rv,a)=>R6.evaluateProgram(prog,rv,a?{authority:a}:{});
res.plannedProgressionEvaluate=ev(base,review(base,0),without('R6-PLANNED-PROGRESSION')).status;
res.substitution=ev(base,review(base,0,{kind:'EQUIPMENT_CHANGE',day:2,changes:{equipment:['BODYWEIGHT']}}),without('R6-SUBSTITUTION')).status;
res.returnAfterPause=ev(base,review(base,2,{kind:'RETURN_AFTER_PAUSE',day:0,interruption:{days:14,reasonCategory:'WORK'}}),without('R6-NONCLINICAL-RETURN')).status;
res.goalChangeToEvent=ev(base,review(base,0,{kind:'GOAL_CHANGE',day:1,changes:{event:{kind:'10K',date:addDays(base.startDate,70)}}}),without('R6-EVENT-TRANSITION')).status;
// Policy hash mismatch between program and authority.
const otherPolicy=structuredClone(policy);otherPolicy.revisionNote=(otherPolicy.revisionNote??'')+' x';
res.programPolicyMismatch=ev(base,review(base,0),{...real,policy:otherPolicy,policyHash:hash(otherPolicy)}).status;
// R6-RUN-QUALITY disabled: simulate a full 16-week HM with perfect adherence; no quality/strides/race touch anywhere.
const noQ=without('R6-RUN-QUALITY');
const simNoQ=simulateProgram(HM,{default:{}},{authority:noQ});
const allNoQ=[...sessionsOf(simNoQ.initial.program),...sessionsOf(simNoQ.finalProgram)];
res.runQualityDisabled={generated:simNoQ.initial.status,quality:allNoQ.filter(s=>['QUALITY','RACE_TOUCH'].includes(s.role)).length,strides:allNoQ.filter(s=>s.prescription?.strides).length,decisions:simNoQ.summary.decisions};
const simQ=simulateProgram(HM,{default:{}},{});
const allQ=sessionsOf(simQ.finalProgram);
res.runQualityEnabledControl={quality:allQ.filter(s=>s.role==='QUALITY').length,raceTouch:allQ.filter(s=>s.role==='RACE_TOUCH').length,strides:allQ.filter(s=>s.prescription?.strides).length,decisions:simQ.summary.decisions};
// R6-ROTATION disabled: accessory ids per template never change across development weeks.
const rotOff=g(baseIntake({id:'q-rot',weeks:16,athlete:{strengthPreferences:{rotation:'EVERY_2_WEEKS'}}}),without('R6-ROTATION')).program;
const rotOn=g(baseIntake({id:'q-rot',weeks:16,athlete:{strengthPreferences:{rotation:'EVERY_2_WEEKS'}}})).program;
const idsByTemplate=p=>{const m={};for(const s of sessionsOf(p).filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.templateType))(m[s.templateType]??=new Set()).add(s.prescription.exercises.map(e=>e.id).sort().join(','));return Object.fromEntries(Object.entries(m).map(([k,v])=>[k,v.size]));};
res.rotationDisabledDistinctSets=idsByTemplate(rotOff);res.rotationEnabledDistinctSets=idsByTemplate(rotOn);
// R6-HYBRID-ARRANGEMENT disabled: a genuine arrangement comparison is asked, never decided.
res.hybridDisabled=g(BASE,without('R6-HYBRID-ARRANGEMENT')).status;
// R6-PARTIAL-NOISY-LEARNING disabled: the model is not updated with observations.
const s0=sessionsOf(base).filter(s=>s.weekIndex===0&&s.prescription);
const rvL=review(base,0,{observations:s0.map(s=>obsFor(base,s))});
const withL=ev(base,rvL),withoutL=ev(base,rvL,without('R6-PARTIAL-NOISY-LEARNING'));
res.learningDisabled={modelObsEnabled:withL.updatedModel.observations.length,modelObsDisabled:withoutL.updatedModel.observations.length,ledgerDisabled:withoutL.actualLedger.length,status:withoutL.status};
ok('failClosed.coldStart',res.coldStart==='UNSUPPORTED',res.coldStart);
ok('failClosed.plannedProgression',res.plannedProgressionGenerate==='UNSUPPORTED'&&res.plannedProgressionEvaluate==='UNSUPPORTED',[res.plannedProgressionGenerate,res.plannedProgressionEvaluate]);
ok('failClosed.loadEstablishment',res.loadEstablishmentUnknown==='UNSUPPORTED'&&(res.loadEstablishmentKnownEstablishRows===0||res.loadEstablishmentKnownStatus!=='PROPOSED'),[res.loadEstablishmentUnknown,res.loadEstablishmentKnownStatus,res.loadEstablishmentKnownEstablishRows]);
ok('failClosed.eventTransition',res.eventTransition==='UNSUPPORTED'&&res.goalChangeToEvent==='UNSUPPORTED',[res.eventTransition,res.goalChangeToEvent]);
ok('failClosed.nonclinicalReturn',res.nonclinicalReturnRestart==='UNSUPPORTED'&&res.returnAfterPause==='UNSUPPORTED',[res.nonclinicalReturnRestart,res.returnAfterPause]);
ok('failClosed.substitution',res.substitution==='UNSUPPORTED',res.substitution);
ok('failClosed.policyMismatch',res.programPolicyMismatch==='UNSUPPORTED',res.programPolicyMismatch);
ok('failClosed.runQuality',res.runQualityDisabled.quality===0&&res.runQualityDisabled.strides===0&&res.runQualityEnabledControl.quality>0,{off:res.runQualityDisabled,on:res.runQualityEnabledControl});
ok('failClosed.rotation',Object.values(res.rotationDisabledDistinctSets).every(n=>n<=2),{off:res.rotationDisabledDistinctSets,on:res.rotationEnabledDistinctSets});
ok('failClosed.hybridArrangement',['ASK','PROPOSED'].includes(res.hybridDisabled),res.hybridDisabled);
ok('failClosed.learning',res.learningDisabled.modelObsDisabled===0&&res.learningDisabled.ledgerDisabled>0,res.learningDisabled);
const out={probe:'Q1b-authority',authorityUsed:'REAL r6Authority() baseline; per-boundary disabling by injected copy of the real authority (options.authority)',policyHash,approvedBoundaries:Object.keys(real.approved),checks,results:res,pass:checks.every(c=>c.pass)};
write('q1-authority.out.json',out);
console.log(JSON.stringify({pass:out.pass,failed:checks.filter(c=>!c.pass).map(c=>[c.id,c.detail])},null,1));
console.log(JSON.stringify(res,null,0));
