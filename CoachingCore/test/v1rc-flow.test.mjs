// V1 Run Calibration Extension (Founder request of 2026-11-11): directed tests of the flow onboarding → plan → session → logged execution → weekly
// review → calibration update, against SSCTR-V1RC-DECISION-r1 (Q5, Q8, Q9). Every timeline mirrors each review on the frozen V1 entry point: the
// plan, each decision and the record must be the same.
import test from 'node:test';
import assert from 'node:assert/strict';
import {X,V1,DEV,VALUES,timeline,runner,result,report,live,ELIG,hash} from './v1rc-helpers.mjs';
import {RUN_EVIDENCE_DECLARED} from '../src/v1-run-calibration.mjs';
import {EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';

const EASY=['EASY','LONG','RECOVERY_EASY','SHAKEOUT'];
/** Reports: easy runs at `easy` seconds per km, harder sessions with a work pace of `work`; efforts reported inside each cue. */
const paced=(easy,work,x={})=>s=>EASY.includes(s.prescription.family)?{pace:easy,rpe:3,...x.easy}:['WALK','WALK_JOG','RACE'].includes(s.prescription.family)?{rpe:3}:{pace:easy,workPace:typeof work==='function'?work(s):work,rpe:7,...x.hard};
const weeks=(t,from,to,how)=>{for(let w=from;w<=to;w++)t.week(w,how);};
const quality=(t,w)=>t.p.weeks[w]?.sessions.find(s=>s.role==='QUALITY'&&live(s))??null;
const firstQualityWeek=t=>t.p.weeks.findIndex(w=>w.sessions.some(s=>s.role==='QUALITY'&&live(s)));
const available=c=>Object.entries(c?.paceBands??{}).filter(([,b])=>b.status==='AVAILABLE').map(([k])=>k);
const TH='THRESHOLD_CONTROLLED',T=VALUES.recalibration.training;
/** A runner whose result stays current for the first eight weeks of the plan. */
const RECENT=(x={})=>runner({id:'rc-f-recent',anchors:[result('10K',3300,'2026-11-05')],...x});
const test5k=(t,s,x={})=>({id:'f-test-'+s.id,kind:'FIELD_TEST',protocol:t.cal.assessment.protocol.id,date:s.date,distanceKm:t.cal.assessment.protocol.distanceKm,seconds:Math.round(t.cal.assessment.protocol.distanceKm*285),rpe:8,measurement:'TRACK',tolerated:true,replacedSessionId:s.id,...x});

test('V1RC flow: a runner without a result is observed, not tested: the easy range is their own (median, never the fastest) and nothing harder comes from it',()=>{
 const t=timeline(runner({id:'rc-f-none'})),P=VALUES.assessment.P1,paces=[380,390,400,410,420];let i=0;
 assert.equal(t.cal.status,'EFFORT_ONLY');assert.equal(t.cal.assessment.status,'NOT_OFFERED');
 weeks(t,0,2,s=>s.prescription.family==='EASY'?{pace:paces[i++%paces.length],rpe:3}:EASY.includes(s.prescription.family)?{pace:430,rpe:3}:{});
 assert.equal(t.cal.assessment.progress.easyRuns.needed,P.qualifyingRunsMin);assert.ok(t.cal.assessment.progress.easyRuns.count>=P.qualifyingRunsMin);
 assert.equal(t.cal.status,'PARTIAL');assert.deepEqual(available(t.cal),['EASY']);
 const b=t.cal.paceBands.EASY;assert.equal(b.basis,'OBSERVED_AT_EFFORT');assert.equal(b.label,'OBSERVED_AT_EFFORT');assert.equal(b.estimated,false);assert.ok(b.notes.includes('THIS_DOMAIN_ONLY'));
 assert.ok(b.fastSecondsPerKm>=390&&b.fastSecondsPerKm<=400,'the fast edge is the median of the runs used ('+b.fastSecondsPerKm+'), not the fastest (380)');assert.ok(b.slowSecondsPerKm>=b.fastSecondsPerKm+P.slowEdgeAtLeastSecondsPerKmAboveFast);
 assert.equal(t.cal.paceBands.LONG.status,'UNAVAILABLE','the long run takes nothing from the easy observation');assert.equal(t.cal.capacity.status,'NONE');assert.ok(Object.values(t.cal.estimates).every(e=>e.status==='UNAVAILABLE'),'an easy pace estimates no race');
 assert.ok(Object.values(t.cal.sessions).filter(s=>s.family!=='EASY').every(s=>s.pace.status!=='AVAILABLE'),'and gives no other session a pace');
 assert.ok(t.same,'the plan and every decision are the frozen engine\'s: '+t.differences.join(','));
});
test('V1RC flow: an easy observation needs a reported effort of 4 or less, a measured distance, no walk breaks, no treadmill and no flagged conditions',()=>{
 const noisy=[{actual:{gpsQuality:'POOR'}},{actual:{conditions:['HEAT']}},{actual:{walkBreaks:true}},{actual:{measurement:'TREADMILL'}},{rpe:null},{rpe:5},{actual:{conditions:['WIND_STRONG']}}];let i=0;
 const t=timeline(runner({id:'rc-f-noise'}));weeks(t,0,3,s=>s.prescription.family==='EASY'?{pace:390,rpe:3,...noisy[i++%noisy.length]}:{});
 assert.equal(t.cal.assessment.progress.easyRuns.count,0,'none of them counts');assert.equal(available(t.cal).length,0);assert.ok(t.same,t.differences.join(','));
});
test('V1RC flow: the test is never the first hard effort: offered only after a harder session of the plan was executed, in the place of the next one; declining changes nothing',()=>{
 const t=timeline(runner({id:'rc-f-offer'})),q=firstQualityWeek(t);assert.ok(q>=2,'the engine activates harder work only after its established easy weeks');
 for(let w=0;w<q;w++){t.week(w,paced(390,300));assert.notEqual(t.cal.assessment.status,'OFFERED','no test before a harder session was executed (week '+w+')');}
 assert.ok(t.cal.assessment.reasons.includes('NO_HARDER_SESSION_EXECUTED_YET'));
 t.week(q,paced(390,300));
 const a=t.cal.assessment;assert.equal(a.status,'OFFERED');assert.equal(a.optional,true);assert.equal(a.neverRequired,true);assert.equal(a.decliningHasNoPenalty,true);assert.equal(a.replacesSessionId,quality(t,q+1).id);
 assert.ok(VALUES.assessment.P3.protocols[a.protocol.id]);for(const k of ['warmupEasyMinutes','course','effortCue','cooldownEasyMinutes','complete','stopOn','afterStopForSymptom','incomplete','replaces'])assert.ok(a.protocol[k],'the protocol states its '+k);
 assert.equal(a.interpretation.countsTowardProgression,false);assert.equal(a.report.replacedSession,'NOT_DONE');
 // Declined: the athlete just trains. Two harder sessions that agree give that domain its own observed range: the slower of the two, that domain only.
 t.week(q+1,paced(390,304));t.week(q+2,paced(390,300));
 assert.equal(t.cal.capacity.status,'NONE');assert.deepEqual(available(t.cal).sort(),['EASY',TH]);const b=t.cal.paceBands[TH];assert.equal(b.basis,'OBSERVED_AT_EFFORT');
 assert.equal(b.fastSecondsPerKm,305,'the fast edge is the slower of the two work paces, rounded slower');assert.equal(b.slowSecondsPerKm,b.fastSecondsPerKm+VALUES.assessment.P2.slowEdgeSecondsPerKmAboveFast);
 assert.ok(Object.values(t.cal.estimates).every(e=>e.status==='UNAVAILABLE'),'an observed band gives no estimate');assert.equal(t.cal.assessment.status,'OFFERED','the offer simply stays');
 assert.ok(t.same,t.differences.join(','));
});
test('V1RC flow: a novice is offered only the 3 km test; an athlete who is not running enough is offered none; unknown experience is not eligible',()=>{
 const upTo=(input)=>{const t=timeline(input),q=firstQualityWeek(t);if(q<0)return t;weeks(t,0,q,paced(420,330));return t;};
 const novice=upTo(runner({id:'rc-f-novice',runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:1}}));
 if(novice.cal.assessment.status==='OFFERED')assert.equal(novice.cal.assessment.protocol.id,'TIME_TRIAL_3K');else assert.ok(novice.cal.assessment.reasons.length>0);
 const months=upTo(runner({id:'rc-f-months',athlete:{runTrainingMonths:3},runExperience:'INTERMEDIATE'}));
 if(months.cal.assessment.status==='OFFERED'&&months.p.canonical.athlete.experienceBasis?.run?.months===3)assert.equal(months.cal.assessment.protocol.id,'TIME_TRIAL_3K');
 const full=upTo(runner({id:'rc-f-full'}));assert.equal(full.cal.assessment.status,'OFFERED');assert.equal(full.cal.assessment.protocol.id,'TIME_TRIAL_5K');
});
test('V1RC flow: a completed test replaces the harder session (never added, never moved) and is in force from the next week, not inside the week',()=>{
 const t=timeline(runner({id:'rc-f-test'})),q=firstQualityWeek(t);weeks(t,0,q,paced(390,300));
 const s=quality(t,q+1),before=hash(t.cal.nextWeek.paceBands);
 // Reported on the day: the session not done, the test declared in its place.
 const r=t.step(q+1,s.day,'MISSED_SESSION',{targetSessionId:s.id,observations:[report(t.p,s,{completed:false})],runEvidence:[test5k(t,s)],expectWithhold:true});
 assert.deepEqual(r.runEvidence,{added:['f-test-'+s.id],refused:[]});assert.notEqual(r.action,'MOVE','the replaced session is not moved to a later day');
 assert.equal(t.p.weeks[q+1].sessions.filter(x=>x.role==='QUALITY'&&live(x)&&x.date>s.date).length,0,'no second harder session appears this week');
 assert.equal(hash(t.cal.paceBands),before,'the week in force does not move');assert.equal(t.cal.capacity.status,'NONE');
 assert.equal(t.cal.nextWeek.capacity.status,'CALIBRATED');assert.equal(t.cal.nextWeek.change.reason,'FIRST_REFERENCE');
 t.week(q+1,x=>x.id===s.id?false:paced(390,300)(x));t.week(q+2,paced(390,300));
 assert.equal(t.cal.status,'CALIBRATED');assert.equal(t.cal.capacity.basis,'FIELD_TEST');assert.equal(t.cal.capacity.confidence,'HIGH');assert.ok(t.cal.capacity.confidenceCauses.includes('TEST_NOT_RACE'));assert.equal(t.cal.assessment.status,'NOT_NEEDED');
 assert.equal(t.ev.length,1);assert.equal(t.ev[0].fact,RUN_EVIDENCE_DECLARED);
 assert.ok(t.same,t.differences.join(','));
});
test('V1RC flow: an incomplete test is recorded, used for nothing and costs nothing; it may be repeated once after a week, and not again',()=>{
 const t=timeline(runner({id:'rc-f-stop'})),q=firstQualityWeek(t);weeks(t,0,q,paced(390,300));
 const stop=w=>{const s=quality(t,w);t.week(w,x=>x.id===s.id?false:paced(390,300)(x),{runEvidence:[test5k(t,s,{distanceKm:2.1,seconds:600,completed:false})],expectWithhold:true});};
 stop(q+1);t.week(q+2,paced(390,300));
 assert.equal(t.cal.capacity.status,'NONE');assert.ok(t.cal.evidence.find(e=>e.kind==='FIELD_TEST').reasons.includes('NOT_COMPLETED'));assert.ok(Object.values(t.cal.estimates).every(e=>e.status==='UNAVAILABLE'),'nothing is extrapolated from the part done');
 assert.equal(t.cal.assessment.status,'OFFERED','the one repeat');
 stop(q+3);t.week(q+4,paced(390,300));
 assert.equal(t.cal.assessment.status,'NOT_OFFERED');assert.ok(t.cal.assessment.reasons.includes('REPEAT_ALREADY_USED'));assert.ok(t.same,t.differences.join(','));
});
test('V1RC flow: evidence that arrives inside a week never moves that week; it is in force from the next one',()=>{
 // (The result on record is old enough to be outside the conflict window of the one declared below: a newer result then replaces it.)
 const t=timeline(RECENT({anchors:[result('10K',3300,'2026-10-05')]}));t.week(0,paced(400,345));
 // Sunday of week 0: what week 1 will be. From Monday that is the week in force.
 const inForce=hash(t.cal.nextWeek.paceBands),sessions=w=>hash(Object.values(t.cal.sessions).filter(s=>s.week===w).map(s=>s.pace));
 const week1=sessions(1);t.step(1,0,'WEEKLY_REVIEW',{});const estimates=hash(t.cal.estimates);assert.equal(hash(t.cal.paceBands),inForce);assert.equal(sessions(1),week1);
 // Wednesday of week 1: a much faster race is declared.
 t.step(1,2,'WEEKLY_REVIEW',{runEvidence:[{id:'f-mid',...result('10K',3000,t.day(1,1))}]});
 assert.equal(t.cal.week,1);assert.equal(hash(t.cal.paceBands),inForce);assert.equal(hash(t.cal.estimates),estimates);assert.equal(sessions(1),week1,'the sessions of the week keep their bands');
 assert.equal(t.cal.nextWeek.change.reason,'NEW_REFERENCE');assert.ok(t.cal.nextWeek.paceBands[TH].fastSecondsPerKm<t.cal.paceBands[TH].fastSecondsPerKm);
 assert.ok(Object.values(t.cal.sessions).filter(s=>s.week>1).every(s=>s.provisional===true));
 t.week(1,paced(400,345));t.week(2,paced(400,345));assert.equal(t.cal.capacity.reference.seconds,3000);
 // A report that arrives late (a week-2 session reported on Tuesday of week 3) does not move week 3 either.
 const u=timeline(RECENT({id:'rc-f-late'}));weeks(u,0,1,paced(400,345));
 const held=u.p.weeks[2].sessions.filter(live).find(s=>s.sport==='RUN'&&s.prescription.family==='EASY');
 u.step(2,6,'WEEKLY_REVIEW',{observations:u.p.weeks[2].sessions.filter(live).filter(s=>s.id!==held.id).map(s=>report(u.p,s,s.sport==='RUN'?paced(400,345)(s):{}))});
 const w3=hash(u.cal.nextWeek.paceBands);u.step(3,1,'WEEKLY_REVIEW',{observations:[report(u.p,held,{pace:400,rpe:3})]});
 assert.equal(hash(u.cal.paceBands),w3,'week 3 is what it was when it started');assert.ok(t.same&&u.same);
});
test('V1RC flow: easy runs never recalibrate performance, however fast they are; the easy ceiling never gets faster from them',()=>{
 const t=timeline(RECENT({id:'rc-f-easy'})),ten=t.cal.capacity.tenKEquivalent.centralSeconds,ceiling=t.cal.paceBands.EASY.fastSecondsPerKm,estimates=hash(t.cal.estimates);
 weeks(t,0,4,s=>EASY.includes(s.prescription.family)?{pace:330,rpe:4}:{pace:400,workPace:t.cal.paceBands[TH].fastSecondsPerKm+5,rpe:7});
 assert.equal(t.cal.capacity.tenKEquivalent.centralSeconds,ten);assert.deepEqual(t.cal.capacity.trainingFactors,{});assert.equal(hash(t.cal.estimates),estimates);
 assert.equal(t.cal.paceBands.EASY.fastSecondsPerKm,ceiling,'the easy ceiling does not get faster');assert.ok(t.cal.paceBands.EASY.notes.includes('EASY_RUNS_FASTER_THAN_CEILING'));assert.ok(t.same);
 // Slower own easy running is valid: the band follows it slower, never the other way.
 const u=timeline(RECENT({id:'rc-f-easy2'}));weeks(u,0,3,s=>EASY.includes(s.prescription.family)?{pace:ceiling+60,rpe:3}:{pace:400,workPace:u.cal.paceBands[TH].fastSecondsPerKm+5,rpe:7});
 assert.ok(u.cal.paceBands.EASY.fastSecondsPerKm>ceiling);assert.ok(!u.cal.paceBands.EASY.notes.includes('EASY_RUNS_FASTER_THAN_CEILING'));assert.equal(u.cal.paceBands.LONG.fastSecondsPerKm,u.g.runCalibration.paceBands.LONG.fastSecondsPerKm,'and only the easy band');
});
test('V1RC flow: one informative session changes nothing; two that agree move that domain\'s band one bounded step, and nothing else',()=>{
 const t=timeline(RECENT({id:'rc-f-recal'})),q=firstQualityWeek(t);weeks(t,0,q-1,paced(400,345));
 const fast=()=>Math.round(t.cal.paceBands[TH].fastSecondsPerKm*(1-T.triggerFraction-0.03)),others=c=>hash(Object.fromEntries(Object.entries(c.paceBands).filter(([k])=>k!==TH))),b0=t.cal.paceBands[TH].fastSecondsPerKm,o0=others(t.cal),e0=hash(t.cal.estimates);
 t.week(q,paced(400,fast));
 assert.equal(t.cal.nextWeek.change,null,'one fast session is not a trend');
 t.week(q+1,paced(400,fast));
 assert.equal(t.cal.nextWeek.change.reason,'TRAINING_FASTER_THAN_BAND');assert.equal(t.cal.nextWeek.change.domain,TH);assert.equal(t.cal.nextWeek.change.sessions.length,T.consecutiveSessionsRequired,'the two sessions are on the record of the change');
 t.week(q+2,paced(400,fast));
 const f=t.cal.capacity.trainingFactors[TH];assert.equal(f.fraction,T.up.stepFraction);assert.equal(t.cal.paceBands[TH].trainingFactor,T.up.stepFraction);assert.ok(t.cal.paceBands[TH].notes.includes('TRAINING_ADJUSTED_UP'));
 assert.ok(t.cal.paceBands[TH].fastSecondsPerKm<=b0&&t.cal.paceBands[TH].fastSecondsPerKm>=b0-10,'one small step: '+b0+' → '+t.cal.paceBands[TH].fastSecondsPerKm);
 assert.equal(others(t.cal),o0,'no other band moves');assert.equal(hash(t.cal.estimates),e0,'an upward step never changes an estimate');
 // More fast weeks: at most one step a week, and never past the total without a confirming race or test.
 let last=f.fraction;for(let w=q+3;w<=7;w++){if(!quality(t,w))continue;t.week(w,paced(400,fast));const now=t.cal.capacity.trainingFactors[TH]?.fraction??0;assert.ok(now-last<=T.up.stepFraction+1e-9);assert.ok(now<=T.up.totalMax+1e-9);last=now;}
 assert.ok(last>T.up.stepFraction,'a second step followed');assert.equal(hash(t.cal.estimates),e0);assert.ok(t.same,t.differences.join(','));
});
test('V1RC flow: sessions slower than the band, or harder than the cue inside it, lower that band one step at a time; past the limit the band is withdrawn until a race or test',()=>{
 const t=timeline(RECENT({id:'rc-f-down',weeks:16,anchors:[result('10K',3300,'2026-11-06')]})),q=firstQualityWeek(t);weeks(t,0,q-1,paced(400,345));
 const slow=()=>{const b=t.cal.paceBands[TH];return b.status==='AVAILABLE'?Math.round(b.slowSecondsPerKm*(1+T.triggerFraction+0.03)):420;},seen=[];
 t.week(q,paced(400,slow));assert.equal(t.cal.nextWeek.change,null,'a single slow session changes nothing');
 for(let w=q+1;w<t.p.weeks.length-1&&t.cal.paceBands[TH].status==='AVAILABLE';w++){if(!quality(t,w)){t.week(w,paced(400,345));continue;}t.week(w,paced(400,slow));seen.push(t.cal.capacity.trainingFactors?.[TH]?.fraction??0);}
 const steps=[...new Set(seen)];assert.deepEqual(steps.slice(0,4),[0,-0.02,-0.04,-0.06],'one step of 2% at a time, to 6% in all: '+steps);
 assert.equal(t.cal.paceBands[TH].status,'UNAVAILABLE');assert.equal(t.cal.paceBands[TH].reason,'BAND_WITHDRAWN_AFTER_TRAINING_MISMATCH');assert.equal(t.cal.capacity.trainingFactors[TH].withdrawn,true);
 assert.equal(t.cal.paceBands.EASY.status,'AVAILABLE','only that domain is withdrawn');assert.equal(t.cal.estimates['10K'].status,'AVAILABLE');
 assert.ok(Object.values(t.cal.sessions).filter(s=>s.family==='THRESHOLD').every(s=>s.pace.status==='UNAVAILABLE'&&s.effortCue==='THRESHOLD_CONTROLLED'),'the session stays, by effort');
 // Harder than the cue while inside the band counts as slower.
 const u=timeline(RECENT({id:'rc-f-hard'})),qu=firstQualityWeek(u);weeks(u,0,qu-1,paced(400,345));
 const inside=()=>u.cal.paceBands[TH].fastSecondsPerKm+5;weeks(u,qu,qu+1,paced(400,inside,{hard:{rpe:9}}));
 assert.equal(u.cal.nextWeek.change.reason,'TRAINING_SLOWER_THAN_BAND');u.week(qu+2,paced(400,inside));assert.equal(u.cal.capacity.trainingFactors[TH].fraction,-T.down.stepFraction);assert.ok(u.cal.paceBands[TH].notes.includes('TRAINING_ADJUSTED_DOWN'));
 assert.ok(t.same&&u.same,[...t.differences,...u.differences].join(','));
});
test('V1RC flow: sessions of short bouts never adjust a band: the 10 km specific sessions leave the 10 km band where the evidence put it',()=>{
 const base=EDGE_PROFILES.TEN_K_EIGHT_WEEKS,t=timeline({...base,athlete:{...base.athlete,performanceAnchors:[result('10K',3300,base.asOf)]}}),raceWeek=t.p.weeks.findIndex(w=>w.sessions.some(s=>s.role==='RACE'));
 assert.equal(t.cal.paceBands.TEN_K_EFFORT.status,'AVAILABLE');const b0=hash(t.cal.paceBands.TEN_K_EFFORT);let specific=0;
 for(let w=0;w<raceWeek;w++){specific+=t.p.weeks[w].sessions.filter(s=>live(s)&&s.prescription.family==='TEN_K_SPECIFIC').length;t.week(w,paced(400,s=>s.prescription.family==='TEN_K_SPECIFIC'?290:345));}
 assert.ok(!T.domains.includes('TEN_K_EFFORT')&&!T.domains.includes('FIVE_K_EFFORT'));
 if(specific>=2){assert.equal(t.cal.paceBands.TEN_K_EFFORT.trainingFactor,0);assert.equal(hash(t.cal.paceBands.TEN_K_EFFORT),b0);}
 assert.ok(t.same,t.differences.join(','));
});
test('V1RC flow: a new result inside the deadband changes nothing at all; a clearly different one replaces the reference and resets the training steps',()=>{
 const D=VALUES.recalibration.deadbandFraction,t=timeline(RECENT({id:'rc-f-race',weeks:16})),q=firstQualityWeek(t);weeks(t,0,q-1,paced(400,345));
 const fast=()=>Math.round(t.cal.paceBands[TH].fastSecondsPerKm*(1-T.triggerFraction-0.03));weeks(t,q,q+1,paced(400,fast));
 t.week(q+2,paced(400,345),{runEvidence:[{id:'f-same',...result('10K',Math.round(3300*(1+D/2)),t.day(q+2,6))}]});
 const bands=hash(t.cal.nextWeek.paceBands),ests=hash(t.cal.nextWeek.estimates);
 assert.equal(t.cal.nextWeek.change,null);assert.equal(t.cal.nextWeek.capacity.evidenceId,'intake-0');assert.deepEqual(t.cal.nextWeek.capacity.insideDeadbandOf,['f-same']);assert.equal(t.cal.nextWeek.capacity.trainingFactors[TH].fraction,T.up.stepFraction,'the training step stays');
 t.week(q+3,paced(400,345));assert.equal(hash(t.cal.paceBands),hash(t.cal.nextWeek.paceBands));assert.equal(bands,hash(t.cal.paceBands));assert.equal(ests,hash(t.cal.estimates));
 // Outside the conflict window of both, a clearly faster race.
 const w=q+8;weeks(t,q+4,w-1,paced(400,345));
 t.week(w,paced(400,345),{runEvidence:[{id:'f-new',...result('10K',3060,t.day(w,6))}]});t.week(w+1,paced(400,345));
 assert.equal(t.cal.capacity.reference.seconds,3060);assert.deepEqual(t.cal.capacity.trainingFactors,{},'a new reference resets the training steps');assert.equal(t.cal.paceBands[TH].trainingFactor,0);
 const ch=t.cal.projection.comparisons.findLast(c=>c.reason==='NEW_REFERENCE');assert.ok(ch&&ch.from.tenKEquivalentSeconds>ch.to.tenKEquivalentSeconds&&ch.to.evidenceId==='f-new'&&ch.from.date&&ch.to.date,'the change is on the record as an observed comparison, with its evidence and dates');assert.ok(t.same,t.differences.join(','));
});
test('V1RC flow: a race of the plan, logged with its distance, time, measurement and effort, is a race result of the record',()=>{
 const t=timeline({...EDGE_PROFILES.TEN_K_EIGHT_WEEKS}),raceWeek=t.p.weeks.findIndex(w=>w.sessions.some(s=>s.role==='RACE'));assert.ok(raceWeek>0&&raceWeek<t.p.weeks.length-1);
 for(let w=0;w<raceWeek;w++)t.week(w,paced(400,345));
 assert.equal(t.cal.capacity.status,'NONE','no result yet: the plan ran by effort');
 t.week(raceWeek,s=>s.role==='RACE'?{actual:{distanceKm:10,minutes:54.5,measurement:'OFFICIAL',rpe:9}}:paced(400,345)(s));
 const c=t.cal.nextWeek.capacity;assert.equal(c.status,'CALIBRATED');assert.equal(c.reference.kind,'RACE_RESULT');assert.equal(c.reference.seconds,3270);assert.ok(c.evidenceId.startsWith('plan-race:'));assert.equal(c.confidence,'HIGH');
 assert.ok(t.same,t.differences.join(','));
});
test('V1RC flow: a declared break of 14 days or more ends what earlier evidence says: effort only, no pace, estimate or zone, until evidence after the return',()=>{
 const W=VALUES.withdrawal,t=timeline(RECENT({id:'rc-f-break',anchors:[result('10K',3300,'2026-11-05',{heartRate:{maxBpm:186,sensor:'CHEST_STRAP'}})]}));weeks(t,0,1,paced(400,345));
 assert.equal(t.cal.status,'CALIBRATED');assert.equal(t.cal.heartRateZones.status,'AVAILABLE');
 const r=t.step(4,3,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(2,0),endDate:t.day(2,W.breakDaysWithdrawMin+1),days:W.breakDaysWithdrawMin+2,nonclinical:true,reasonCategory:'SCHEDULE'}});
 assert.notEqual(r.status,'CLINICAL_HUMAN_REQUIRED');
 assert.notEqual(t.cal.capacity.status,'CALIBRATED');assert.equal(available(t.cal).length,0);assert.ok(Object.values(t.cal.estimates).every(e=>e.status==='UNAVAILABLE'));assert.equal(t.cal.heartRateZones.status,'UNAVAILABLE');
 assert.ok(Object.values(t.cal.sessions).every(s=>s.pace.status!=='AVAILABLE'));assert.ok(t.cal.evidence.some(e=>e.reasons.includes('BEFORE_BREAK_HOLD_OR_RETURN')),'the earlier result is history');
 assert.ok(t.same,t.differences.join(','));
});
test('V1RC flow: during a clinical hold nothing is prescribed, so no pace, estimate, zone or test is shown; a result declared then is kept but not used',()=>{
 const t=timeline(RECENT({id:'rc-f-hold'})),d=t.day(0,2);
 const r=t.step(0,2,'WEEKLY_REVIEW',{eligibility:ELIG(d,{pain:true}),runEvidence:[{id:'f-held',...result('5K',1500,t.day(0,1))}]});
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(t.cal.status,'WITHHELD_HOLD');assert.equal(t.cal.capacity.status,'WITHHELD');assert.equal(t.cal.assessment.status,'WITHHELD');assert.equal(t.cal.nextWeek,null);
 assert.ok(Object.values(t.cal.paceBands).every(b=>b.reason==='HOLD_NO_PRESCRIPTION'));assert.ok(Object.values(t.cal.estimates).every(e=>e.reason==='HOLD_NO_PRESCRIPTION'));assert.equal(t.cal.heartRateZones.reason,'HOLD_NO_PRESCRIPTION');
 assert.ok(Object.values(t.cal.sessions).every(s=>s.pace.reason==='HOLD_NO_PRESCRIPTION'));assert.deepEqual(r.runEvidence.added,['f-held'],'the declared result is a fact of the record whatever the review decided');
 const again=t.step(0,4,'WEEKLY_REVIEW',{});assert.equal(again.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(t.cal.status,'WITHHELD_HOLD','the hold stands on the record');
 assert.ok(t.same,t.differences.join(','));
});
test('V1RC flow: the evidence record is append-only: a repeated id, a future date and a malformed entry are refused and named; an altered or foreign row is never read',()=>{
 const t=timeline(runner({id:'rc-f-rec'}));
 const r=t.week(0,paced(390,300),{runEvidence:[{id:'e1',...result('10K',3300,t.day(0,5))},{id:'e1',...result('10K',2400,t.day(0,5))},{id:'e2',...result('5K',1500,'2027-06-01')},{kind:'NOPE',distanceKm:5,seconds:1500,date:t.day(0,2)},'junk']});
 assert.deepEqual(r.runEvidence.added,['e1']);assert.deepEqual(r.runEvidence.refused.map(x=>x.errors[0]),['evidence.idAlreadyOnRecord','evidence.dateAfterThisReview','evidence.kind','evidence.object']);
 assert.equal(t.ev.length,1);assert.equal(t.ev[0].evidence.seconds,3300,'the first row recorded stands');
 t.week(1,paced(390,300));assert.equal(t.cal.capacity.reference.seconds,3300);
 // A row altered after it was recorded, and another athlete's row, are not evidence (fail closed: less calibration, never more).
 const tampered=structuredClone(t.ev);tampered[0].evidence.seconds=2400;const foreign=[{...structuredClone(t.ev[0]),athleteId:'someone-else'}];
 for(const record of [tampered,foreign]){const x=X.evaluateProgram(t.p,{...t.review(2,6,'WEEKLY_REVIEW',{}),runEvidenceRecord:record},DEV);assert.equal(x.runCalibration.capacity.status,'NONE');}
 // A correction is a new row that names the one it replaces.
 t.week(2,paced(390,300),{runEvidence:[{id:'e1-fixed',supersedes:'e1',...result('10K',3420,t.day(0,5))}]});t.week(3,paced(390,300));
 assert.equal(t.cal.capacity.reference.seconds,3420);assert.equal(t.ev.length,2);assert.ok(t.same,t.differences.join(','));
});
test('V1RC flow: without GPS or heart rate the plan runs by time and effort exactly as the frozen engine runs it',()=>{
 const t=timeline(runner({id:'rc-f-nodevice'}));weeks(t,0,5,()=>({rpe:3}));
 assert.equal(t.cal.status,'EFFORT_ONLY');assert.equal(available(t.cal).length,0);assert.equal(t.cal.heartRateZones.status,'UNAVAILABLE');assert.equal(t.cal.assessment.progress.easyRuns.count,0);
 assert.ok(t.p.weeks[6].sessions.some(s=>s.sport==='RUN'&&live(s)),'the plan goes on');assert.ok(Object.values(t.cal.sessions).every(s=>s.effortCue&&s.rpe));assert.ok(t.same,t.differences.join(','));
});
test('V1RC flow: the extension never fails the engine: a malformed review, record or declaration returns the engine\'s own answer',()=>{
 const t=timeline(RECENT({id:'rc-f-junk'})),good=t.review(0,6,'WEEKLY_REVIEW',{});
 for(const review of [null,undefined,42,'x',[],{},{...good,asOf:'yesterday'},{...good,runEvidenceRecord:'not a list'},{...good,runEvidenceRecord:[null,7,{fact:RUN_EVIDENCE_DECLARED}]},{...good,runEvidence:{not:'a list'}},{...good,runEvidence:[null,[[]],{id:{}}]},{...good,weekIndex:'two'},{...good,weekIndex:99},{...good,observations:[{eventId:'j1',sessionId:t.p.weeks[0].sessions.find(s=>s.sport==='RUN').id,occurrenceDate:t.day(0,1),actual:{completed:true,minutes:30,distanceKm:'far',work:'fast',rpe:{},heartRate:7,conditions:'hot'},response:null}]}]){
  let r;assert.doesNotThrow(()=>{r=X.evaluateProgram(t.p,review,DEV);});
  const plain=review&&typeof review==='object'&&!Array.isArray(review)?Object.fromEntries(Object.entries(review).filter(([k])=>!['runEvidence','runEvidenceRecord'].includes(k))):review;
  const {runCalibration,runEvidenceRecord,runEvidence,...rest}=r;assert.equal(hash(rest),hash(V1.evaluateProgram(t.p,plain)));assert.ok(typeof runCalibration.status==='string');assert.notEqual(runCalibration.reason,'CALIBRATION_ERROR');
 }
 for(const program of [null,{},{version:'R6-PROGRAM-1'},{...t.p,hash:'x'}])assert.doesNotThrow(()=>X.evaluateProgram(program,good,DEV));
 for(const input of [null,{},{version:'R6-INTAKE-1'},{...RECENT(),athlete:{...RECENT().athlete,performanceAnchors:'none'}}])assert.doesNotThrow(()=>X.generateProgram(input,DEV));
 for(const input of [null,{},{intake:RECENT(),record:'x',runEvidenceRecord:7}])assert.doesNotThrow(()=>X.restartProgram(input,DEV));
});
test('V1RC flow: a new plan from the record carries the evidence record; a pause before it withdraws the calibration',()=>{
 const t=timeline(RECENT({id:'rc-f-restart'}));weeks(t,0,1,paced(400,345),{});
 const today=t.day(8,0),again={...RECENT({id:'rc-f-restart',asOf:today,start:t.day(8,2)}),athlete:{...RECENT({id:'rc-f-restart',asOf:today}).athlete,pause:{nonclinical:true,reasonCategory:'SCHEDULE'}}};
 const r=X.restartProgram({intake:again,record:t.ledger,runEvidenceRecord:t.ev},DEV),base=V1.restartProgram({intake:again,record:t.ledger});
 assert.equal(r.status,base.status);assert.equal(hash(r.program??null),hash(base.program??null));
 if(r.program){assert.deepEqual(r.runEvidenceRecord,t.ev);const mode=r.program.stateTrace[0].run.mode;
  if(VALUES.paceRules.noBandModes.includes(mode)){assert.equal(r.runCalibration.status,'EFFORT_ONLY');assert.equal(available(r.runCalibration).length,0);}}
});
