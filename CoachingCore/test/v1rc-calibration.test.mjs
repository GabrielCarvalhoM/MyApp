// V1 Run Calibration Extension (Founder request of 2026-11-11): directed tests of the calibration a record supports at a point in time, against
// SSCTR-V1RC-DECISION-r1: evidence kinds, recency, conflicts, the model, the bands, the estimates, heart rate, the authority. The week-by-week flow
// is in v1rc-flow.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {X,V1,DEV,VALUES,runner,result,textsOf,mmss,hash} from './v1rc-helpers.mjs';
import {runCalibrationAuthority,devRunCalibration,runExtensionOf,readEvidence,powerLawTime,speedForDuration,paceEdge,RUN_BOUNDARIES,RUN_EXTENSION_SHA256,RUN_EXTENSION_FILE_SHA256,RUN_EXTENSION_URL} from '../src/v1-run-calibration.mjs';
import {FORBIDDEN_CLAIM} from '../src/r6-prescription.mjs';
import {PROFILES} from '../r6/fixtures/profiles.mjs';

const ROOT=path.resolve(import.meta.dirname,'../..');
const DECISION=JSON.parse(fs.readFileSync(path.join(ROOT,'audits/coachingcore-v1-run-calibration-2026-11-11/ssctr-decision/SSCTR_V1RC_DECISION.json'),'utf8')).values;
const cal=(input,opts=DEV)=>{const g=X.generateProgram(input,opts);assert.equal(g.status,'PROPOSED',g.reason);return g.runCalibration;};
const AS_OF='2026-11-07',daysBefore=n=>new Date(Date.parse(AS_OF+'T00:00:00Z')-n*864e5).toISOString().slice(0,10);
const available=c=>Object.entries(c.paceBands).filter(([,b])=>b.status==='AVAILABLE').map(([k])=>k);
const hmsOf=s=>{const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=Math.round(s%60);return h?`${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`:`${m}:${String(x).padStart(2,'0')}`;};
const bandText=b=>b.status==='AVAILABLE'?`${mmss(b.fastSecondsPerKm)}-${mmss(b.slowSecondsPerKm)}`:b.reason;
const LONG_RUNS={runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:80,strengthDaysPerWeek:1};
const MAR={weeks:16,runExperience:'EXPERIENCED',goal:{kind:'RACE',event:{kind:'MARATHON',date:'2027-02-28'}},recent:{runDaysPerWeek:5,runMinutesPerWeek:360,longestRunMinutes:150,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,4,6],strengthDays:[2],runMinutes:90,strengthMinutes:35,longRunDay:6,longRunMinutes:210}};
const BEGINNER=(x={})=>runner({id:'rc-t-beg',runExperience:'NONE',goal:'REGULAR',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,strengthDaysPerWeek:0},schedule:{runDays:[1,3,5],runMinutes:35,longRunDay:5,longRunMinutes:undefined},weeks:8,...x});
const recent10=(x={})=>result('10K',3300,daysBefore(14),x);

// ---------- authority: fail closed ----------
test('V1RC authority: off without an enabling record; the frozen plan is returned unchanged and the calibration says DISABLED',()=>{
 const none={runCalibration:runCalibrationAuthority({runCalibrationRecords:{records:[]}})},input=runner({anchors:[recent10()]});
 const g=X.generateProgram(input,none),base=V1.generateProgram(input);
 assert.equal(g.runCalibration.status,'DISABLED');assert.equal(g.runCalibration.reason,'EXTENSION_NOT_ENABLED');assert.deepEqual(g.runCalibration.sessions,{});
 assert.equal(hash(g.program),hash(base.program));
});
test('V1RC authority: a boundary is on only by an independent enabling record bound to the pinned bytes, with supported evidence and a source',()=>{
 const rec=(boundaryId,x={})=>({boundaryId,extensionSha256:RUN_EXTENSION_SHA256,independent:true,disposition:'APPROVE_WITH_CONDITIONS',evidenceStatus:'SUPPORTED_WITH_LIMITS',sourceIds:['S1'],...x});
 const on=records=>Object.keys(runCalibrationAuthority({runCalibrationRecords:{records}}).approved).sort();
 assert.equal(RUN_EXTENSION_FILE_SHA256,RUN_EXTENSION_SHA256,'the values file is the pinned bytes');
 assert.deepEqual(on(Object.values(RUN_BOUNDARIES).map(b=>rec(b))),Object.values(RUN_BOUNDARIES).sort());
 assert.deepEqual(on([rec(RUN_BOUNDARIES.CAPACITY,{extensionSha256:'0'.repeat(64)})]),[],'a record bound to other bytes enables nothing');
 assert.deepEqual(on([rec(RUN_BOUNDARIES.CAPACITY,{independent:false})]),[]);
 assert.deepEqual(on([rec(RUN_BOUNDARIES.CAPACITY,{evidenceStatus:'PLAUSIBLE_BUT_UNCERTAIN'})]),[]);
 assert.deepEqual(on([rec(RUN_BOUNDARIES.CAPACITY,{sourceIds:[]})]),[]);
 assert.deepEqual(on([rec(RUN_BOUNDARIES.CAPACITY),rec(RUN_BOUNDARIES.CAPACITY,{disposition:'REJECT'})]),[],'a record bound to these bytes that does not enable vetoes its boundary');
 const bytes=fs.readFileSync(RUN_EXTENSION_URL);assert.equal(runExtensionOf(Buffer.concat([bytes,Buffer.from(' ')])),null,'the values are read only as the pinned bytes');
 assert.equal(createHash('sha256').update(bytes).digest('hex'),RUN_EXTENSION_FILE_SHA256);
});
test('V1RC authority: pace, heart rate and estimates each need their own record and the capacity record',()=>{
 const input=runner({anchors:[recent10({heartRate:{maxBpm:186,sensor:'CHEST_STRAP'}})]});
 const only=b=>cal(input,{runCalibration:devRunCalibration(b.map(k=>RUN_BOUNDARIES[k]))});
 const c=only(['CAPACITY']);assert.equal(c.capacity.status,'CALIBRATED');assert.equal(available(c).length,0);assert.equal(c.paceBands.EASY.reason,'EXTENSION_NOT_ENABLED');
 assert.equal(c.estimates['10K'].reason,'EXTENSION_NOT_ENABLED');assert.equal(c.heartRateZones.reason,'EXTENSION_NOT_ENABLED');
 assert.ok(Object.values(c.sessions).every(s=>s.pace.status==='UNAVAILABLE'));
 assert.equal(only(['PACE','HR','ESTIMATE']).status,'DISABLED','without the capacity record nothing is on');
 const p=only(['CAPACITY','PACE']);assert.ok(available(p).length>0);assert.equal(p.estimates['10K'].status,'UNAVAILABLE');
});

// ---------- the decision is what runs ----------
test('V1RC values: the values file restates SSCTR-V1RC-DECISION-r1 number for number',()=>{
 const D=DECISION,V=VALUES,eq=(a,b,what)=>assert.deepEqual(a,b,what);
 eq(V.evidence.distanceKm,[D.evidence.qualifying.distanceKmMin,D.evidence.qualifying.distanceKmMax]);eq(V.evidence.durationMinutes,[D.evidence.qualifying.durationMinutesMin,D.evidence.qualifying.durationMinutesMax]);
 eq(V.evidence.excludedConditions,D.evidence.qualifying.excludedConditionFlags);const {UNKNOWN,...tiers}=D.evidence.measurementTierReductions;eq(V.evidence.measurementTierReductions,tiers);assert.equal(UNKNOWN,'not qualifying');
 eq([V.evidence.currentDays,V.evidence.agingDays],[D.evidence.recencyDays.currentMax,D.evidence.recencyDays.agingMax]);eq(V.evidence.agingRequiresNoBreakDaysAtLeast,D.evidence.aging.requiresNoDeclaredBreakDaysAtLeast);
 eq([V.evidence.lowerBoundRpeMax,V.evidence.lowerBoundTierReduction,V.evidence.unknownEffortTierReduction],[D.evidence.effort.lowerBoundRpeMax,D.evidence.effort.lowerBoundTierReduction,D.evidence.effort.unknownEffortTierReduction]);
 eq([V.conflict.windowDays,V.conflict.thresholdFraction,V.conflict.tierReduction],[D.conflict.windowDays,D.conflict.thresholdFraction,D.conflict.onConflict.tierReduction]);
 for(const k of ['kLow','kCentral','kHigh']){eq(V.model.standard[k],D.model.standard[k]);eq(V.model.marathon[k],D.model.marathon[k]);}
 eq([V.model.standard.maxDistanceRatio,V.model.marathon.maxDistanceRatio],[D.model.maxDistanceRatioStandard,D.model.marathon.maxDistanceRatio]);
 const P=D.model.population;eq(V.model.population,{tenKEquivalentCentralMinutes:[P.tenKEquivalentCentralMinutesMin,P.tenKEquivalentCentralMinutesMax],slowRunnerExtraMargin:P.slowRunnerExtraMargin,slowRunnerFromTenKEquivalentMinutes:P.slowRunnerFromTenKEquivalentMinutes,slowRunnerFromMarathonMinutesWhenMarathonEvidenceOnly:P.slowRunnerFromMarathonMinutesWhenMarathonEvidenceOnly});
 eq(V.confidence.margin,D.confidence.margin);assert.equal(D.confidence.fromTotalReductions['3+'],'UNAVAILABLE');eq(V.confidence.unavailableFromReductions,3);
 for(const [id,d] of Object.entries(D.domains).filter(([,d])=>typeof d==='object'&&!Array.isArray(d))){const v=V.domains[id];assert.ok(v,id);eq(v.method,d.method,id);eq(v.cue,d.cue,id);
  for(const k of ['fastEdgeDurationMinutes','slowEdgeDurationMinutes','fastFraction','slowFraction'])eq(v[k],d[k],id+'.'+k);if(d.distanceKm)eq(V.estimates.distancesKm[v.event],d.distanceKm,id);}
 eq(V.paceRules.minimumWidthSecondsPerKm,{HARDER:D.paceRules.minimumWidthSecondsPerKm.harder,EASY:D.paceRules.minimumWidthSecondsPerKm.EASY});eq(D.paceRules.minimumWidthSecondsPerKm.LONG,30);eq(D.paceRules.minimumWidthSecondsPerKm.RECOVERY,30);
 const A=D.assessment;eq([V.assessment.P1.qualifyingRunsMin,V.assessment.P1.windowDays,V.assessment.P1.useLatestRunsMax,V.assessment.P1.minDurationMinutes,V.assessment.P1.rpeReportedMax],[A.P1.qualifyingRunsMin,A.P1.windowDays,A.P1.useLatestRunsMax,A.P1.minDurationMinutes,A.P1.rpeReportedMax]);
 eq([V.assessment.P2.concordantSessionsMin,V.assessment.P2.windowDays,V.assessment.P2.concordanceFraction],[A.P2.concordantSessionsMin,A.P2.windowDays,A.P2.concordanceFraction]);
 const G=A.P3.eligibility,VG=V.assessment.P3.eligibility;eq([VG.harderSessionsExecutedCompatibleMin,VG.excludedPhases,VG.daysBeforeRaceMin,VG.daysAfterAdverseOrHarderThanTargetMin,VG.completedTestsPerDaysMax],[G.harderSessionsExecutedCompatibleMin,G.excludedPhases,G.daysBeforeRaceMin,G.daysAfterAdverseOrHarderThanTargetMin,G.completedTestsPerDaysMax]);
 const T3=V.assessment.P3.protocols.TIME_TRIAL_3K,T5=V.assessment.P3.protocols.TIME_TRIAL_5K;eq([T3.weeklyRunMinutesMin,T3.longestRunMinutesMin,T3.experience],[G.threeKm.weeklyRunMinutesMin,G.threeKm.longestRunMinutesWithin28DaysMin,G.threeKm.experience]);
 eq([T5.weeklyRunMinutesMin,T5.longestRunMinutesMin,T5.experience,T5.continuousMonthsMinWhenKnown],[G.fiveKm.weeklyRunMinutesMin,G.fiveKm.longestRunMinutesWithin28DaysMin,G.fiveKm.experience,G.fiveKm.continuousMonthsMinWhenKnown]);
 eq(V.assessment.P3.protocol.effortCue,A.P3.protocol.effortCue);eq(V.assessment.P3.protocol.stopOn,A.P3.protocol.stopOn);eq(V.assessment.P3.protocol.incomplete,A.P3.protocol.incomplete);
 const H=D.heartRate,O=V.heartRate.observedMaximum;eq([O.effortMinutesMin,O.rpeReportedMin,O.windowDays,O.plausibleBpm,O.sensors],[H.observedMaximum.effortMinutesMin,H.observedMaximum.rpeReportedMin,H.observedMaximum.windowDays,H.observedMaximum.plausibleBpm,['CHEST_STRAP']]);
 eq(O.zones.map(z=>z.toFraction??z.fromFraction),[H.observedMaximum.zones.low.belowFraction,H.observedMaximum.zones.moderate.toFraction,H.observedMaximum.zones.high.aboveFraction]);eq(V.heartRate.measured.recencyDaysMax,H.measured.recencyDaysMax);
 const E=D.estimates;eq([V.estimates.tenK.longestRunMinutesMin,V.estimates.halfMarathon.longestRunMinutesMin,V.estimates.halfMarathon.fromEvidenceShorterThan10KmLongestRunMinutesMin,V.estimates.marathon.evidenceKmMin],[E.tenK.longestRunMinutesWithin28DaysMin,E.halfMarathon.longestRunMinutesWithin28DaysMin,E.halfMarathon.fromEvidenceShorterThan10KmLongestRunMinutesMin,E.marathon.evidenceKmMin]);
 eq(V.estimates.requiredText.toLowerCase(),E.requiredText.toLowerCase());
 const R=D.recalibration,VT=V.recalibration.training;eq([V.recalibration.deadbandFraction,VT.domains,VT.everyWorkBoutMinutesMin,VT.totalWorkMinutesMin,VT.consecutiveSessionsRequired],[R.newRaceOrTest.deadbandFraction,R.training.domains,R.training.sessionRequires.everyWorkBoutMinutesMin,R.training.sessionRequires.totalWorkMinutesMin,R.training.consecutiveSessionsRequired]);
 eq([VT.up.stepFraction,VT.up.totalMax,VT.down.stepFraction,VT.down.totalMax],[R.training.up.stepFraction,R.training.up.totalMaxWithoutRaceOrTest,R.training.down.stepFraction,R.training.down.totalMax]);
 eq([V.withdrawal.breakDaysWithdrawMin,V.withdrawal.breakDaysTierDown],[D.withdrawal.breakDaysWithdrawMin,D.withdrawal.breakDaysTierDown]);
 assert.ok(fs.existsSync(path.join(ROOT,V.decisionRecord[0])));
});
test('V1RC values: the runtime reproduces every worked example of the decision record, to the second',()=>{
 const W=DECISION.workedExamples,ev=(d,s,m)=>result(d,s,daysBefore(14),{measurement:m});
 const cases={'10K_50min_HIGH':runner({anchors:[ev('10K',3000,'OFFICIAL')]}),'5K_30min_MODERATE':runner({recent:LONG_RUNS,anchors:[ev('5K',1800,'GPS')]}),'HALF_110min_HIGH':runner({...MAR,anchors:[ev('HALF_MARATHON',6600,'OFFICIAL')]}),
  '10K_70min_MODERATE':runner({recent:LONG_RUNS,anchors:[ev('10K',4200,'GPS')]}),'5K_20min_HIGH':runner({recent:LONG_RUNS,anchors:[ev('5K',1200,'OFFICIAL')]})};
 const B={THRESHOLD:'THRESHOLD_CONTROLLED',EASY:'EASY',LONG:'LONG',RECOVERY:'RECOVERY'},E={'5K':['5K','FIVE_K_EFFORT'],'10K':['10K','TEN_K_EFFORT'],HALF:['HALF_MARATHON','HALF_MARATHON_EFFORT'],MARATHON:['MARATHON','MARATHON_EFFORT']};
 let compared=0;
 for(const [name,input] of Object.entries(cases)){
  const c=cal(input),w=W[name];assert.equal(c.capacity.margin,w.m,name+' margin');
  for(const [k,id] of Object.entries(B)){assert.equal(bandText(c.paceBands[id]),w[k],name+' '+k);compared++;}
  for(const [k,[est,band]] of Object.entries(E)){const e=c.estimates[est],want=w[k];
   if(typeof want==='string'){assert.equal(e.status,'UNAVAILABLE',name+' '+k);if(want.includes(':'))assert.equal('UNAVAILABLE: '+e.reason,want,name+' '+k);compared++;continue;}
   assert.equal(`${hmsOf(e.lowSeconds)}-${hmsOf(e.highSeconds)}`,want.estimate,name+' '+k+' estimate');assert.equal(hmsOf(e.centralSeconds),want.central,name+' '+k+' central');assert.equal(bandText(c.paceBands[band]),want.band,name+' '+k+' band');compared+=3;}
 }
 assert.ok(compared>=70,'every stated value was compared ('+compared+')');
});

// ---------- beginners (Q10.a) ----------
test('V1RC beginner without history: time and effort only; a light first session, no test, no pace, no estimate, no threshold language',()=>{
 const g=X.generateProgram(BEGINNER(),DEV),c=g.runCalibration;assert.equal(g.status,'PROPOSED');
 assert.equal(g.program.capability.run.class,'WALK_JOG');assert.equal(c.status,'EFFORT_ONLY');assert.equal(c.capacity.status,'EFFORT_ONLY');
 assert.equal(c.assessment.status,'IN_USE');assert.equal(c.assessment.protocol.id,'P0_LIGHT_START');assert.equal(c.assessment.maximal,false);assert.ok(c.assessment.protocol.never.includes('extension or intensification'));
 assert.equal(available(c).length,0);assert.ok(Object.values(c.estimates).every(e=>e.status==='UNAVAILABLE'));assert.equal(c.heartRateZones.status,'UNAVAILABLE');
 const runs=Object.values(c.sessions);assert.ok(runs.length>0);assert.ok(runs.every(s=>s.pace.status==='UNAVAILABLE'&&s.effortGoverns===true));
 assert.ok(c.effortDomains.length>0&&c.effortDomains.every(d=>d.availableWithoutDevice===true),'effort domains need no device');
 assert.ok(!textsOf(c).some(t=>FORBIDDEN_CLAIM.test(t)));
});
test('V1RC beginner with some walk/jog history: the same light start; a declared result never opens a pace or an estimate in walk/jog mode',()=>{
 const c=cal(BEGINNER({id:'rc-t-beg2',runExperience:'NOVICE',recent:{runDaysPerWeek:2,runMinutesPerWeek:40,longestRunMinutes:15,strengthDaysPerWeek:0},anchors:[result('5K',1800,daysBefore(20))]}));
 assert.equal(c.status,'EFFORT_ONLY');assert.equal(c.assessment.protocol.id,'P0_LIGHT_START');assert.equal(available(c).length,0);
 assert.ok(Object.values(c.estimates).every(e=>e.status==='UNAVAILABLE'&&e.reason==='MODE_WALK_JOG_RESTART_RETURN'));
});

// ---------- evidence kinds and recency (Q1) ----------
test('V1RC runner without any result: the plan is valid by effort; nothing is estimated and nothing is invented',()=>{
 const g=X.generateProgram(runner({id:'rc-t-none'}),DEV),c=g.runCalibration;
 assert.equal(g.status,'PROPOSED');assert.equal(c.status,'EFFORT_ONLY');assert.equal(c.capacity.status,'NONE');assert.equal(c.capacity.reason,'NO_QUALIFYING_EVIDENCE');
 assert.equal(available(c).length,0);assert.ok(Object.values(c.estimates).every(e=>e.status==='UNAVAILABLE'));
 assert.ok(Object.values(c.sessions).every(s=>typeof s.effortCue==='string'&&Array.isArray(s.rpe)),'every run session keeps its effort cue');
});
test('V1RC runner with a recent result: calibrated; every band states its unit, basis, evidence, recency, method, confidence, margin, effort cue and label',()=>{
 const c=cal(runner({id:'rc-t-recent',anchors:[recent10()]}));
 assert.equal(c.status,'CALIBRATED');assert.equal(c.capacity.basis,'RACE_RESULT');assert.equal(c.capacity.confidence,'HIGH');assert.equal(c.capacity.reference.seconds,3300);
 const got=available(c);assert.deepEqual(got.sort(),Object.keys(VALUES.domains).filter(d=>d!=='MARATHON_EFFORT').sort());
 for(const id of got){const b=c.paceBands[id],def=VALUES.domains[id];
  assert.equal(b.unit,'SECONDS_PER_KM');assert.equal(b.label,'ESTIMATED');assert.equal(b.estimated,true);assert.equal(b.effortGoverns,true);assert.equal(b.reference,c.capacity.evidenceId);assert.equal(b.referenceDate,daysBefore(14));assert.equal(b.recency,'CURRENT');
  assert.ok(typeof b.method==='string'&&b.confidence==='HIGH'&&b.margin===VALUES.confidence.margin.HIGH&&Array.isArray(b.confidenceCauses)&&b.validUntil);assert.equal(b.effortCue,def.cue);assert.deepEqual(b.rpe,VALUES.effortCues[def.cue].rpe);
  assert.equal(b.fastSecondsPerKm%5,0);assert.equal(b.slowSecondsPerKm%5,0);assert.ok(b.slowSecondsPerKm-b.fastSecondsPerKm>=VALUES.paceRules.minimumWidthSecondsPerKm[def.class],id+' is never narrower than its minimum width');}
 const B=c.paceBands;assert.ok(B.FIVE_K_EFFORT.fastSecondsPerKm<=B.TEN_K_EFFORT.fastSecondsPerKm&&B.TEN_K_EFFORT.fastSecondsPerKm<=B.HALF_MARATHON_EFFORT.fastSecondsPerKm,'a shorter race effort is not slower than a longer one');
 for(const id of ['EASY','LONG','RECOVERY']){assert.equal(B[id].ceilingOnly,true);assert.ok(B[id].fastSecondsPerKm>B.THRESHOLD_CONTROLLED.slowSecondsPerKm,id+' is slower than the threshold band');}
 assert.equal(B.MARATHON_EFFORT.status,'UNAVAILABLE');
});
test('V1RC rounding never makes a fast edge faster: an edge goes up to the next slower 5 seconds, and one already on a multiple stays',()=>{
 assert.equal(paceEdge(1/300,5),300);assert.equal(paceEdge(1/300.04,5),300);assert.equal(paceEdge(1/300.06,5),305);assert.equal(paceEdge(1/304.9,5),305);assert.equal(paceEdge(1/296,5),300);
});
test('V1RC an old personal best is history, never current capacity and never an estimate',()=>{
 const best={kind:'PERSONAL_BEST',distance:'10K',seconds:2520,date:'2019-05-12',measurement:'OFFICIAL',tolerated:true,rpe:10};
 const only=cal(runner({id:'rc-t-best',anchors:[best]}));
 assert.equal(only.capacity.status,'NONE');assert.equal(available(only).length,0);assert.equal(only.historicalBest.length,1);assert.equal(only.historicalBest[0].isCurrentCapacity,false);assert.equal(only.historicalBest[0].isEstimate,false);
 assert.equal(cal(runner({id:'rc-t-best-u',anchors:[{...best,date:undefined}]})).capacity.status,'NONE');
 const both=cal(runner({id:'rc-t-best2',anchors:[best,result('10K',3360,daysBefore(14))]}));
 assert.equal(both.capacity.reference.seconds,3360,'the current result is the reference, whatever the old best says');assert.equal(both.historicalBest[0].seconds,2520);assert.ok(both.estimates['10K'].lowSeconds>2520);
 // A dated best inside the current window is read as the result it is.
 assert.equal(cal(runner({id:'rc-t-best3',anchors:[{...best,date:daysBefore(10),seconds:3300}]})).capacity.status,'CALIBRATED');
});
test('V1RC recency: current to 56 days, presumed (lowest confidence, wider, never faster) to 112, then history',()=>{
 const at=n=>cal(runner({id:'rc-t-age'+n,anchors:[result('10K',3300,daysBefore(n))]}));
 const current=at(54),aging=at(60),lastAging=at(111),old=at(113);
 assert.equal(current.capacity.status,'CALIBRATED');assert.equal(current.capacity.recency,'CURRENT');
 for(const c of [aging,lastAging]){assert.equal(c.capacity.status,'PRESUMED');assert.equal(c.status,'PROVISIONAL');assert.equal(c.capacity.confidence,'LOW');assert.ok(c.capacity.confidenceCauses.includes('PRESUMED_FROM_AGED_EVIDENCE'));assert.equal(c.paceBands.THRESHOLD_CONTROLLED.recency,'AGING');}
 const w=b=>b.slowSecondsPerKm-b.fastSecondsPerKm;assert.ok(w(aging.paceBands.THRESHOLD_CONTROLLED)>w(current.paceBands.THRESHOLD_CONTROLLED));assert.ok(aging.paceBands.THRESHOLD_CONTROLLED.fastSecondsPerKm>=current.paceBands.THRESHOLD_CONTROLLED.fastSecondsPerKm);
 assert.equal(old.capacity.status,'NONE');assert.equal(old.historicalBest.length,1);
});
test('V1RC contradictory results: never the fastest; the slower of the two is the reference and the confidence drops',()=>{
 const fastOld=cal(runner({id:'rc-t-c1',anchors:[result('5K',1380,daysBefore(28)),result('10K',3360,daysBefore(14))]}));
 const fastNew=cal(runner({id:'rc-t-c2',anchors:[result('10K',3360,daysBefore(28)),result('5K',1380,daysBefore(14))]}));
 for(const c of [fastOld,fastNew]){
  assert.equal(c.capacity.reference.seconds,3360);assert.ok(c.capacity.confidenceCauses.includes('CONFLICTING_EVIDENCE'));assert.equal(c.capacity.confidence,'MODERATE');assert.equal(c.capacity.conflictsWith.length,1);
  assert.equal(c.evidence.filter(e=>e.use==='CAPACITY').length,2,'both stay on the record');}
 const agree=cal(runner({id:'rc-t-c3',anchors:[result('5K',Math.round(powerLawTime(10,3360,5,VALUES.model.standard.kCentral)*1.02),daysBefore(28)),result('10K',3360,daysBefore(14))]}));
 assert.ok(!agree.capacity.confidenceCauses.includes('CONFLICTING_EVIDENCE'));assert.equal(agree.capacity.confidence,'HIGH');assert.equal(agree.capacity.reference.seconds,3360,'within the threshold the most recent is the reference');
 const superseded=cal(runner({id:'rc-t-c4',anchors:[result('5K',1380,daysBefore(VALUES.conflict.windowDays+16)),result('10K',3360,daysBefore(14))]}));
 assert.ok(!superseded.capacity.confidenceCauses.includes('CONFLICTING_EVIDENCE'));assert.equal(superseded.capacity.reference.seconds,3360);
});
test('V1RC a result that does not qualify is kept as a result and used for nothing, with the reason',()=>{
 const bad=[{kind:'FIELD_TEST',protocol:'TIME_TRIAL_5K',distanceKm:3.2,seconds:900,date:daysBefore(5),completed:false,measurement:'TRACK',tolerated:true,rpe:8},recent10({conditions:['HEAT']}),result('5K',240,daysBefore(8),{distance:undefined,distanceKm:1}),recent10({tolerated:false}),
  recent10({tolerated:undefined}),recent10({measurement:undefined}),recent10({walkBreaks:true}),recent10({conditions:['TRAIL']})];
 const c=cal(runner({id:'rc-t-rej',anchors:bad}));assert.equal(c.capacity.status,'NONE');assert.equal(available(c).length,0);assert.ok(c.evidence.every(e=>e.use==='REJECTED'));
 const why=c.evidence.map(e=>e.reasons);
 for(const [i,r] of ['NOT_COMPLETED','CONDITIONS_NOT_COMPARABLE','DISTANCE_OUTSIDE_RANGE','NOT_TOLERATED','TOLERANCE_NOT_REPORTED','MEASUREMENT_UNKNOWN','WALK_BREAKS','CONDITIONS_NOT_COMPARABLE'].entries())assert.ok(why[i].includes(r),`${i}: ${r} in ${why[i]}`);
 assert.equal(c.actualResults.length,bad.length,'each stays on the record as the result it is');
});
test('V1RC confidence: HIGH less the summed reductions (measurement, effort, conflict, a short break); three make the capacity unavailable',()=>{
 const tier=x=>cal(runner({id:'rc-t-q',anchors:[recent10(x)]})).capacity;
 assert.equal(tier({}).confidence,'HIGH');assert.equal(tier({measurement:'TRACK'}).confidence,'HIGH');
 const gps=tier({measurement:'GPS'});assert.equal(gps.confidence,'MODERATE');assert.ok(gps.confidenceCauses.includes('MEASUREMENT_GPS'));
 assert.equal(tier({measurement:'MANUAL'}).confidence,'LOW');assert.equal(tier({measurement:'TREADMILL'}).confidence,'LOW');
 const unknown=tier({rpe:null});assert.equal(unknown.confidence,'MODERATE');assert.ok(unknown.confidenceCauses.includes('EFFORT_UNKNOWN'));
 const sub=tier({rpe:7});assert.equal(sub.confidence,'MODERATE');assert.ok(sub.confidenceCauses.includes('SUBMAXIMAL_LOWER_BOUND'),'a race run at 7 of 10 or less is a lower bound too');
 assert.equal(tier({measurement:'GPS',rpe:6}).confidence,'LOW');
 const three=tier({measurement:'MANUAL',rpe:null});assert.equal(three.status,'NONE');assert.equal(three.reason,'EVIDENCE_BELOW_LOWEST_CONFIDENCE');
 const high=cal(runner({id:'rc-t-q3',anchors:[recent10()]})),low=cal(runner({id:'rc-t-q4',anchors:[recent10({measurement:'MANUAL'})]}));
 for(const id of ['THRESHOLD_CONTROLLED','EASY','TEN_K_EFFORT'])assert.ok(low.paceBands[id].fastSecondsPerKm>=high.paceBands[id].fastSecondsPerKm&&low.paceBands[id].slowSecondsPerKm>high.paceBands[id].slowSecondsPerKm,id+': lower confidence is slower and wider, never faster');
 assert.ok(cal(runner({id:'rc-t-q5',anchors:[result('5K',1560,daysBefore(6),{kind:'FIELD_TEST',protocol:'TIME_TRIAL_5K',measurement:'TRACK',rpe:8})]})).capacity.confidenceCauses.includes('TEST_NOT_RACE'));
});
test('V1RC malformed evidence is refused and named, and never stops the plan or the calibration',()=>{
 const junk=[null,'x',42,[],{},{kind:'RACE_RESULT'},{kind:'RACE_RESULT',distance:'10K',date:'2026-10-25'},{kind:'RACE_RESULT',distanceKm:10,seconds:3300,date:'2026-13-40'},{kind:'NOT_A_KIND',distanceKm:10,seconds:3300,date:daysBefore(5)},{kind:'RACE_RESULT',distanceKm:-3,seconds:900,date:daysBefore(5)},{kind:'RACE_RESULT',distanceKm:10,seconds:Infinity,date:daysBefore(5)},{sport:'BIKE',distanceKm:40,seconds:3600,date:daysBefore(5)},{kind:'RACE_RESULT',distanceKm:10,seconds:3300,date:daysBefore(5),rpe:'hard'},{kind:'LAB_TEST',date:daysBefore(5)}];
 const g=X.generateProgram(runner({id:'rc-t-junk',anchors:[...junk,recent10()]}),DEV),c=g.runCalibration;
 assert.equal(g.status,'PROPOSED');assert.equal(c.status,'CALIBRATED');assert.equal(c.capacity.reference.seconds,3300);assert.equal(c.refusedEvidence.length,junk.length);
 for(const r of junk)assert.equal(readEvidence(r).evidence,null);
});

// ---------- the model (Q3) ----------
test('V1RC model: every estimate is a range from the three exponents with the margin, rounded outward; the same distance is the result itself',()=>{
 const S=VALUES.model.standard,c=cal(runner({id:'rc-t-model',recent:LONG_RUNS,anchors:[recent10()]})),m=VALUES.confidence.margin.HIGH,ks=[S.kLow,S.kCentral,S.kHigh];
 assert.equal(c.capacity.tenKEquivalent.centralSeconds,3300);
 const ten=c.estimates['10K'];assert.equal(ten.basis,'SAME_DISTANCE_RESULT');assert.equal(ten.centralSeconds,3300);assert.equal(ten.lowSeconds,Math.floor(3300*(1-m)/15)*15);assert.equal(ten.highSeconds,Math.ceil(3300*(1+m)/15)*15);
 for(const [name,km,unit] of [['5K',5,15],['HALF_MARATHON',21.0975,60]]){const e=c.estimates[name],t=ks.map(k=>powerLawTime(10,3300,km,k));
  assert.equal(e.lowSeconds,Math.floor(Math.min(...t)*(1-m)/unit)*unit,name);assert.equal(e.highSeconds,Math.ceil(Math.max(...t)*(1+m)/unit)*unit,name);assert.equal(e.centralSeconds,Math.round(powerLawTime(10,3300,km,S.kCentral)/unit)*unit,name);assert.equal(e.model,'STANDARD');}
 for(const e of Object.values(c.estimates).filter(x=>x.status==='AVAILABLE')){assert.ok(e.lowSeconds<e.centralSeconds&&e.centralSeconds<e.highSeconds,'a range, never a point');assert.equal(e.estimated,true);assert.equal(e.promise,false);assert.equal(e.kind,'CURRENT_ESTIMATE');assert.equal(e.statement,VALUES.estimates.requiredText);assert.equal(e.display,'RANGE_FIRST_CENTRAL_NEVER_ALONE');assert.equal(e.unrounded,undefined);}
 const half=c.estimates.HALF_MARATHON;assert.ok((half.highSeconds-half.lowSeconds)/half.centralSeconds>(ten.highSeconds-ten.lowSeconds)/ten.centralSeconds,'a farther target is a wider range');
 // The curve: v(T; k) = (D1 / T1) x (T / T1)^(1/k - 1).
 assert.ok(Math.abs(speedForDuration(10,3000,3000,1.07)-10/3000)<1e-12);assert.ok(speedForDuration(10,3000,3600,1.07)<10/3000);
});
test('V1RC model limits: outside the population nothing is modelled; a slower runner gets a wider margin; a distance too far is not converted',()=>{
 const P=VALUES.model.population,outside=cal(runner({id:'rc-t-pop',anchors:[result('5K',2700,daysBefore(14))]}));
 assert.equal(outside.capacity.status,'OUTSIDE_MODEL_POPULATION');assert.equal(outside.status,'EFFORT_ONLY');assert.equal(available(outside).length,0);
 for(const k of ['5K','10K','HALF_MARATHON'])assert.equal(outside.estimates[k].reason,'OUTSIDE_MODEL_POPULATION');
 assert.equal(cal(runner({id:'rc-t-pop2',anchors:[result('5K',720,daysBefore(14))]})).capacity.status,'OUTSIDE_MODEL_POPULATION','and faster than the population');
 const slow=cal(runner({id:'rc-t-slow',anchors:[result('10K',3660,daysBefore(14))]})),quick=cal(runner({id:'rc-t-quick',anchors:[result('10K',3540,daysBefore(14))]}));
 assert.equal(slow.capacity.margin,VALUES.confidence.margin.HIGH+P.slowRunnerExtraMargin);assert.ok(slow.capacity.confidenceCauses.includes('SLOW_RUNNER_MARGIN'));assert.equal(quick.capacity.margin,VALUES.confidence.margin.HIGH);
 const three=cal(runner({id:'rc-t-ratio',recent:LONG_RUNS,anchors:[result('5K',900,daysBefore(14),{distance:undefined,distanceKm:3})]}));
 assert.equal(three.estimates.HALF_MARATHON.reason,'DISTANCE_RATIO_EXCEEDED');assert.equal(three.paceBands.HALF_MARATHON_EFFORT.reason,'DISTANCE_RATIO_EXCEEDED');assert.equal(three.estimates['10K'].status,'AVAILABLE');
});
test('V1RC a slower runner\'s race-specific band is their own race pace, never faster than it (the reason the bands follow the estimate)',()=>{
 const c=cal(runner({id:'rc-t-slow5k',recent:LONG_RUNS,anchors:[result('10K',4200,daysBefore(14),{measurement:'GPS'})]}));
 for(const [band,est] of [['FIVE_K_EFFORT','5K'],['TEN_K_EFFORT','10K'],['HALF_MARATHON_EFFORT','HALF_MARATHON']]){const b=c.paceBands[band],e=c.estimates[est];
  assert.equal(b.method,'CURRENT_RACE_PACE_ESTIMATE');assert.equal(b.event,est);assert.ok(b.fastSecondsPerKm>=e.centralSeconds/e.distanceKm-3,band+' fast edge is not faster than the central race pace');assert.ok(b.slowSecondsPerKm>=e.highSeconds/e.distanceKm-3,band+' reaches the slow end of the estimate');}
});

// ---------- estimates, goals, the marathon (Q7) ----------
test('V1RC endurance gates: a longer estimate from a short result needs a recent long run, and says so when it is missing',()=>{
 const E=VALUES.estimates,five=result('5K',1500,daysBefore(14)),withLongest=(n,anchor)=>cal(runner({id:'rc-t-end'+n,recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:n,strengthDaysPerWeek:1},anchors:[anchor]}));
 const short=withLongest(E.tenK.longestRunMinutesMin-5,five);assert.equal(short.estimates['10K'].reason,'ENDURANCE_NOT_DEMONSTRATED');assert.equal(short.paceBands.TEN_K_EFFORT.reason,'ENDURANCE_NOT_DEMONSTRATED');assert.equal(short.estimates['5K'].status,'AVAILABLE');assert.equal(short.paceBands.THRESHOLD_CONTROLLED.status,'AVAILABLE');
 const mid=withLongest(E.halfMarathon.longestRunMinutesMin+5,five);assert.equal(mid.estimates['10K'].status,'AVAILABLE');assert.equal(mid.estimates.HALF_MARATHON.reason,'ENDURANCE_NOT_DEMONSTRATED','from a result shorter than 10 km the half needs 75 minutes');
 assert.equal(withLongest(E.halfMarathon.fromEvidenceShorterThan10KmLongestRunMinutesMin,five).estimates.HALF_MARATHON.status,'AVAILABLE');
 const ten=result('10K',3300,daysBefore(40));assert.equal(withLongest(E.halfMarathon.longestRunMinutesMin-5,ten).estimates.HALF_MARATHON.reason,'ENDURANCE_NOT_DEMONSTRATED');assert.equal(withLongest(E.halfMarathon.longestRunMinutesMin,ten).estimates.HALF_MARATHON.status,'AVAILABLE');
 assert.equal(withLongest(20,ten).estimates['10K'].status,'AVAILABLE','the same distance needs no gate');
});
test('V1RC the goal is the goal: compared with the range, never a prediction, never a pace source',()=>{
 const input=min=>runner({id:'rc-t-goal',weeks:12,goal:{kind:'RACE',event:{kind:'10K',date:'2027-01-24',timeGoalMinutes:min}},anchors:[recent10()]});
 const fast=cal(input(45)),inside=cal(input(55)),slow=cal(input(70));
 assert.equal(fast.goal.relation,'FASTER_THAN_RANGE');assert.equal(inside.goal.relation,'INSIDE_RANGE');assert.equal(slow.goal.relation,'SLOWER_THAN_RANGE');
 for(const c of [fast,inside,slow]){assert.equal(c.goal.isPrediction,false);assert.equal(c.goal.usedForPace,false);assert.equal(c.goal.kind,'ATHLETE_GOAL');assert.ok(!/achiev/i.test(JSON.stringify(c.goal)));}
 assert.equal(hash(fast.paceBands),hash(slow.paceBands),'the goal time changes no band');assert.equal(hash(fast.estimates),hash(slow.estimates),'and no estimate');
 assert.equal(hash(Object.values(fast.sessions).map(s=>s.pace)),hash(Object.values(slow.sessions).map(s=>s.pace)));
 const noEvidence=cal(runner({id:'rc-t-goal2',weeks:12,goal:{kind:'RACE',event:{kind:'10K',date:'2027-01-24',timeGoalMinutes:45}}}));
 assert.equal(noEvidence.goal.relation,'NO_CURRENT_ESTIMATE');assert.equal(available(noEvidence).length,0,'a goal alone gives no pace');assert.ok(Object.values(noEvidence.estimates).every(e=>e.status==='UNAVAILABLE'));
});
test('V1RC no future projection is produced: the state is typed and only observed comparisons are listed; each kind of number stays apart',()=>{
 const c=cal(runner({id:'rc-t-proj',anchors:[{kind:'PERSONAL_BEST',distance:'10K',seconds:2700,date:'2020-03-01',measurement:'OFFICIAL',tolerated:true,rpe:10},recent10()]}));
 assert.equal(c.projection.status,'UNAVAILABLE');assert.equal(c.projection.reason,'NO_VALIDATED_PROJECTION_MODEL');assert.ok(Array.isArray(c.projection.comparisons));
 assert.equal(c.historicalBest.length,1);assert.equal(c.actualResults.length,1);assert.ok(c.actualResults.every(r=>r.isEstimate===false));assert.equal(c.estimates['10K'].kind,'CURRENT_ESTIMATE');
});
test('V1RC 5 km, 10 km and half-marathon goals: the event sessions carry the band of the athlete\'s own current race pace; race day is a reference that promises nothing',()=>{
 for(const [kind,family,band] of [['5K','FIVE_K_SPECIFIC','FIVE_K_EFFORT'],['10K','TEN_K_SPECIFIC','TEN_K_EFFORT'],['HALF_MARATHON','HALF_MARATHON_SPECIFIC','HALF_MARATHON_EFFORT']]){
  const c=cal(runner({id:'rc-t-ev-'+kind,weeks:16,goal:{kind:'RACE',event:{kind,date:'2027-02-21',timeGoalMinutes:kind==='5K'?24:kind==='10K'?50:110}},anchors:[result('10K',3180,daysBefore(14))]}));
  const specific=Object.values(c.sessions).filter(s=>s.family===family);assert.ok(specific.length>0,kind+' has specific sessions');
  for(const s of specific){assert.equal(s.pace.status,'AVAILABLE');assert.equal(s.pace.domain,band);assert.equal(s.pace.fastSecondsPerKm,c.paceBands[band].fastSecondsPerKm);assert.equal(s.pace.method,'CURRENT_RACE_PACE_ESTIMATE');assert.equal(s.racePaceReference,undefined);}
  const touch=Object.values(c.sessions).find(s=>s.family==='RACE_TOUCH');if(touch)assert.equal(touch.pace.domain,band,'the race-week touch runs at its event\'s effort');
  const day=Object.values(c.sessions).find(s=>s.family==='RACE');assert.equal(day.pace.status,'REFERENCE_ONLY');assert.equal(day.pace.promise,false);assert.equal(day.pace.text,VALUES.estimates.raceDayText);
  assert.equal(!!day.pace.pacingCaution,kind==='HALF_MARATHON','the pacing caution is for the half and the marathon');if(day.pace.pacingCaution)assert.equal(day.pace.startAtOrSlowerThanSecondsPerKm,day.pace.slowSecondsPerKm);
  for(const s of Object.values(c.sessions).filter(x=>x.strides))assert.equal(s.strides.pace.status,'UNAVAILABLE');
 }
});
test('V1RC marathon: an estimate only inside the marathon block and from a current half marathon or longer, as a wide range; never from 5 or 10 km; no criterion changes',()=>{
 const half=result('HALF_MARATHON',6300,daysBefore(20)),g=X.generateProgram(runner({id:'rc-t-mar',...MAR,anchors:[half]}),DEV),c=g.runCalibration,K=VALUES.model.marathon,mrg=VALUES.confidence.margin.HIGH;
 assert.equal(g.program.goal.run.event?.kind,'MARATHON','the eligible athlete is planned for the marathon as an event');
 const m=c.estimates.MARATHON,h=c.estimates.HALF_MARATHON;assert.equal(m.status,'AVAILABLE');assert.equal(m.model,'MARATHON');assert.ok(m.flags.includes('MARATHON_WIDE_RANGE'));
 assert.equal(m.lowSeconds,Math.floor(6300*2**K.kLow*(1-mrg)/60)*60);assert.equal(m.highSeconds,Math.ceil(6300*2**K.kHigh*(1+mrg)/60)*60);
 assert.ok((m.highSeconds-m.lowSeconds)/m.centralSeconds>(h.highSeconds-h.lowSeconds)/h.centralSeconds);
 assert.ok(Object.values(c.sessions).some(s=>s.family==='MARATHON_SPECIFIC'&&s.pace.status==='AVAILABLE'&&s.pace.domain==='MARATHON_EFFORT'));
 const day=Object.values(c.sessions).find(s=>s.family==='RACE');assert.ok(day.pace.pacingCaution);
 for(const short of [result('5K',1320,daysBefore(20)),result('10K',2880,daysBefore(20))]){const x=cal(runner({id:'rc-t-mar-s',...MAR,anchors:[short]}));assert.equal(x.estimates.MARATHON.reason,'MARATHON_NEEDS_HALF_OR_LONGER_RESULT');assert.equal(x.paceBands.MARATHON_EFFORT.reason,'MARATHON_NEEDS_HALF_OR_LONGER_RESULT');assert.ok(x.estimates.MARATHON.statement);}
 assert.equal(cal(runner({id:'rc-t-mar-aged',...MAR,anchors:[result('HALF_MARATHON',6300,daysBefore(70))]})).estimates.MARATHON.status,'UNAVAILABLE','a presumed (aged) result gives no marathon estimate');
 // Not eligible for the block (the preparatory plan): no marathon estimate; the plan is the frozen engine's own.
 const prep=runner({id:'rc-t-mar-prep',weeks:16,goal:{kind:'RACE',event:{kind:'MARATHON',date:'2027-02-28'}},recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:1},anchors:[half]});
 const gp=X.generateProgram(prep,DEV);assert.equal(gp.status,'PROPOSED');assert.notEqual(gp.program.goal.run.event?.kind,'MARATHON');
 assert.equal(gp.runCalibration.estimates.MARATHON.reason,'NOT_ELIGIBLE_FOR_MARATHON_BLOCK');assert.equal(gp.runCalibration.paceBands.MARATHON_EFFORT.status,'UNAVAILABLE');
 assert.equal(hash(gp.program),hash(V1.generateProgram(prep).program),'eligibility is the frozen engine\'s, unchanged');
 assert.equal(cal(runner({id:'rc-t-mar-none',recent:LONG_RUNS,anchors:[half]})).estimates.MARATHON.reason,'NOT_ELIGIBLE_FOR_MARATHON_BLOCK','a half-marathon runner outside a marathon plan gets no marathon number');
});
test('V1RC a marathon result is never converted downward: it gives no curve, no shorter estimate and no band; it estimates the marathon only',()=>{
 const mar=result('MARATHON',14400,daysBefore(30)),plain=cal(runner({id:'rc-t-monly',anchors:[mar]}));
 assert.equal(plain.capacity.status,'NONE');assert.equal(plain.capacity.reason,'MARATHON_EVIDENCE_NOT_CONVERTED_DOWNWARD');assert.equal(available(plain).length,0);
 for(const k of ['5K','10K','HALF_MARATHON'])assert.equal(plain.estimates[k].reason,'MARATHON_EVIDENCE_NOT_CONVERTED_DOWNWARD');
 const block=cal(runner({id:'rc-t-monly2',...MAR,anchors:[mar]})),m=block.estimates.MARATHON;
 assert.equal(m.status,'AVAILABLE');assert.equal(m.basis,'SAME_DISTANCE_RESULT');assert.equal(m.centralSeconds,14400);assert.deepEqual(available(block),['MARATHON_EFFORT']);assert.equal(block.status,'PARTIAL');
});

// ---------- heart rate (Q6) ----------
test('V1RC heart rate: zones only from a chest-strap maximum observed in a hard effort, or measured values as supplied; never from age; a reference scale only',()=>{
 const withHr=(hr,x={})=>cal(runner({id:'rc-t-hr',athlete:{ageYears:40},anchors:[recent10({heartRate:hr,...x})]})).heartRateZones;
 const strap=withHr({maxBpm:186,sensor:'CHEST_STRAP'});
 assert.equal(strap.status,'AVAILABLE');assert.equal(strap.basis,'ESTIMATED_FROM_OBSERVED_MAXIMUM');assert.equal(strap.estimated,true);assert.equal(strap.observedMaximumBpm,186);
 assert.deepEqual(strap.zones,[{name:'LOW',lowBpm:null,highBpm:149},{name:'MODERATE',lowBpm:149,highBpm:162},{name:'HIGH',lowBpm:162,highBpm:null}]);
 assert.equal(strap.sessionTarget,false);assert.equal(strap.gatesProgression,false);assert.equal(strap.namedThresholds,false);assert.equal(strap.convertedToPaceOrEffort,false);assert.ok(strap.notes.includes('NOT_THRESHOLDS'));assert.ok(/never a cue to speed up/.test(strap.conservativeCueOnly));
 for(const [hr,x] of [[{maxBpm:186,sensor:'OPTICAL'},{}],[{maxBpm:186,sensor:'CHEST_STRAP'},{rpe:7}],[{maxBpm:186,sensor:'CHEST_STRAP'},{rpe:null}],[{maxBpm:130,sensor:'CHEST_STRAP'},{}],[{maxBpm:230,sensor:'CHEST_STRAP'},{}]]){const z=withHr(hr,x);assert.equal(z.status,'UNAVAILABLE',JSON.stringify([hr,x]));assert.equal(z.ageFormula,'AGE_FORMULA_NOT_INDIVIDUAL');}
 const age=cal(runner({id:'rc-t-hr-age',athlete:{ageYears:40},anchors:[recent10()]})).heartRateZones;assert.equal(age.status,'UNAVAILABLE');assert.equal(age.reason,'NO_MEASURED_HEART_RATE');
 const labOf=lab=>cal(runner({id:'rc-t-hr-lab',anchors:[recent10({heartRate:{maxBpm:186,sensor:'CHEST_STRAP'}}),{kind:'LAB_TEST',date:daysBefore(30),lab}]})).heartRateZones;
 const lab=labOf({protocol:'Incremental test',source:'Laboratory report',values:[{name:'First measured anchor',value:148,unit:'bpm'},{name:'Second measured anchor',value:168,unit:'bpm'}]});
 assert.equal(lab.basis,'MEASURED_AS_SUPPLIED');assert.equal(lab.estimated,false);assert.equal(lab.checkedByTheApp,false);assert.equal(lab.engineNamesThresholds,false);assert.deepEqual(lab.values.map(v=>v.value),[148,168]);assert.equal(lab.zones,undefined,'measured values are shown as supplied, never mixed with the estimated zones');
 for(const bad of [{source:'x',values:[{name:'a',value:150,unit:'bpm'}]},{protocol:'p',values:[{name:'a',value:150,unit:'bpm'}]},{protocol:'p',source:'s',values:[{name:'a',value:150}]},{protocol:'p',source:'s',values:[]}])assert.equal(labOf(bad).basis,'ESTIMATED_FROM_OBSERVED_MAXIMUM','supplied values without protocol, source or units are not shown');
 const a=cal(runner({id:'rc-t-hr2',anchors:[recent10({heartRate:{maxBpm:186,sensor:'CHEST_STRAP'}})]})),b=cal(runner({id:'rc-t-hr2',anchors:[recent10()]}));
 assert.equal(hash(a.paceBands),hash(b.paceBands),'heart rate changes no pace');assert.equal(hash(a.estimates),hash(b.estimates));assert.equal(hash(a.sessions),hash(b.sessions),'and no session guidance');assert.equal(a.representations.interchangeable,false);
});

// ---------- the standing rules ----------
test('V1RC texts: no physiological threshold claim anywhere in the values or in an output; the effort domains restate the cues in force',()=>{
 assert.ok(!textsOf(VALUES).some(t=>FORBIDDEN_CLAIM.test(t)),'values file');
 for(const input of [runner({id:'rc-t-txt',anchors:[recent10({heartRate:{maxBpm:186,sensor:'CHEST_STRAP'}})]}),BEGINNER(),runner({id:'rc-t-txt2'}),runner({id:'rc-t-txt3',...MAR,anchors:[result('HALF_MARATHON',6300,daysBefore(20))]})])assert.ok(!textsOf(cal(input)).some(t=>FORBIDDEN_CLAIM.test(t)));
 // The RPE range of each cue is the one its text states (R6 policy and V1X-EVENTS), so the two can never drift apart.
 const policy=JSON.parse(fs.readFileSync(new URL('../r6/PROGRAM_POLICY_R6.json',import.meta.url),'utf8')).operational.run.effortCues,events=JSON.parse(fs.readFileSync(new URL('../v1/EVENT_EXTENSION_V1.json',import.meta.url),'utf8'));
 const cues={...policy,FIVE_K_EFFORT:events.fiveK.effortCue,MARATHON_EFFORT:events.marathon.effortCue};
 for(const [id,d] of Object.entries(VALUES.effortCues)){const m=cues[id].match(/about (\d+)(?:-(\d+))? of 10/);assert.ok(m,id);assert.deepEqual(d.rpe,[Number(m[1]),Number(m[2]??m[1])],id);}
 assert.match(VALUES.assessment.P3.protocol.effortCue,/about 8 of 10/);assert.match(VALUES.assessment.P3.protocol.effortCue,/never all-out/);
});
test('V1RC strength-only athlete: running is not programmed, so there is no run calibration, and the plan is the frozen engine\'s',()=>{
 const base0=runner({id:'rc-t-strength'}),input={...base0,athlete:{...base0.athlete,goals:{strength:'HYPERTROPHY'}},schedule:{strengthDays:[0,2,4],strengthMinutes:50}};
 const g=X.generateProgram(input,DEV),base=V1.generateProgram(input);assert.equal(g.status,base.status);assert.equal(g.status,'PROPOSED');
 assert.equal(hash(g.program),hash(base.program));assert.equal(g.runCalibration.status,'NOT_APPLICABLE');assert.equal(g.runCalibration.reason,'RUNNING_NOT_PROGRAMMED');
});
test('V1RC the plan is the frozen engine\'s for every reference profile, with the extension on or off',()=>{
 for(const [name,input] of Object.entries(PROFILES)){
  const base=V1.generateProgram(input),on=X.generateProgram(input,DEV),off=X.generateProgram(input,{runCalibration:runCalibrationAuthority({runCalibrationRecords:{records:[]}})});
  assert.equal(on.status,base.status,name);assert.equal(hash(on.program??null),hash(base.program??null),name);assert.equal(hash(off.program??null),hash(base.program??null),name);
  const {runCalibration,runEvidenceRecord,...rest}=on;assert.equal(hash(rest),hash(base),name+': every key of the frozen result is returned as it is');
 }
});
test('V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here',()=>{
 const rec=JSON.parse(fs.readFileSync(path.join(ROOT,'CoachingCore/v1/RUNTIME_FREEZE_V1_1.json'),'utf8'));
 const changed=Object.entries(rec.files).filter(([f,h])=>!fs.existsSync(path.join(ROOT,f))||createHash('sha256').update(fs.readFileSync(path.join(ROOT,f))).digest('hex')!==h).map(([f])=>f);
 assert.deepEqual(changed,[]);assert.equal(Object.keys(rec.files).length,rec.fileCount);
});
