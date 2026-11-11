// V1 Run Calibration Extension: the single fix cycle after the independent round on bc40218 (QRE-V1RC-REVIEW). One directed test per reliability
// finding, and one per rule a surviving mutant showed to be unpinned (M02, M03, M06, M11, M12, M15, M20, M23, M27, M29, M31, M32).
import test from 'node:test';
import assert from 'node:assert/strict';
import {X,V1,DEV,VALUES,timeline,runner,result,report,live,ELIG,hash} from './v1rc-helpers.mjs';
import {runCalibrationAuthority,devRunCalibration,RUN_BOUNDARIES,RUN_EVIDENCE_DECLARED} from '../src/v1-run-calibration.mjs';
import {READINESS_SIGNS} from '../src/v1-f08.mjs';

const EASY=['EASY','LONG','RECOVERY_EASY','SHAKEOUT'];
const paced=(easy,work,x={})=>s=>EASY.includes(s.prescription.family)?{pace:easy,rpe:3,...x.easy}:['WALK','WALK_JOG','RACE'].includes(s.prescription.family)?{rpe:3}:{pace:easy,workPace:typeof work==='function'?work(s):work,rpe:7,...x.hard};
const weeks=(t,from,to,how)=>{for(let w=from;w<=to;w++)t.week(w,how);};
const quality=(t,w)=>t.p.weeks[w]?.sessions.find(s=>s.role==='QUALITY'&&live(s))??null;
const firstQualityWeek=t=>t.p.weeks.findIndex(w=>w.sessions.some(s=>s.role==='QUALITY'&&live(s)));
const available=c=>Object.entries(c?.paceBands??{}).filter(([,b])=>b.status==='AVAILABLE').map(([k])=>k);
const START='2026-11-09',beforeStart=n=>new Date(Date.parse(START+'T00:00:00Z')-n*864e5).toISOString().slice(0,10);
const OFF={runCalibration:runCalibrationAuthority({runCalibrationRecords:{records:[]}})},TH='THRESHOLD_CONTROLLED',T=VALUES.recalibration.training;
const RECENT=(x={})=>runner({id:'rc-q-recent',anchors:[result('10K',3300,'2026-11-05')],...x});
const engineOnly=r=>{const {runCalibration,runEvidenceRecord,runEvidence,...rest}=r;return rest;};
const plain=rv=>{const {runEvidence,runEvidenceRecord,...rest}=rv;return rest;};

test('V1RC QRE-01: the move of a missed session is withheld only for an accepted field test of this athlete naming that harder session, with the extension on',()=>{
 const t=timeline(runner({id:'rc-q-01'})),q=firstQualityWeek(t);weeks(t,0,q,paced(390,300));
 const w=q+1,s=quality(t,w),easy=t.p.weeks[w].sessions.find(x=>live(x)&&x.sport==='RUN'&&x.role!=='QUALITY'&&x.date>s.date),missed=x=>t.review(w,x.day,'MISSED_SESSION',{targetSessionId:x.id,observations:[report(t.p,x,{completed:false})]});
 const frozen=V1.evaluateProgram(t.p,plain(missed(s)));assert.equal(frozen.action,'MOVE','the frozen engine moves the missed harder session');
 const fieldTest={id:'q-test',kind:'FIELD_TEST',protocol:'TIME_TRIAL_5K',date:s.date,distanceKm:5,seconds:1425,rpe:8,measurement:'TRACK',tolerated:true,replacedSessionId:s.id};
 const same=(label,review,opts=DEV)=>{const r=X.evaluateProgram(t.p,review,opts);assert.equal(hash(engineOnly(r)),hash(V1.evaluateProgram(t.p,plain(review))),label+': the engine\'s decision is its own');return r;};
 // Off: nothing is withheld and nothing is recorded.
 const off=same('extension off',{...missed(s),runEvidence:[fieldTest]},OFF);assert.equal(off.runCalibration.status,'DISABLED');assert.deepEqual(off.runEvidenceRecord,[]);assert.deepEqual(off.runEvidence.refused,[{id:'q-test',errors:['evidence.extensionNotEnabled']}]);
 // A result that is not a field test, a declaration the extension refuses, a row of another athlete, an altered row: none withholds.
 same('a race result naming the session',{...missed(s),runEvidence:[{id:'q-race',...result('5K',1500,t.day(w-1,5)),replacedSessionId:s.id}]});
 same('a test dated after the review',{...missed(s),runEvidence:[{...fieldTest,date:'2027-06-01'}]});
 const row={fact:RUN_EVIDENCE_DECLARED,eventId:'q-test',athleteId:'someone-else',declaredAt:missed(s).asOf,evidence:{...X.readEvidence(fieldTest).evidence},inputHash:hash(X.readEvidence(fieldTest).evidence),provenance:{}};
 same('a row of another athlete',{...missed(s),runEvidenceRecord:[row]});
 same('an altered row',{...missed(s),runEvidenceRecord:[{...row,athleteId:t.p.athleteId,evidence:{...row.evidence,seconds:1000}}]});
 same('a test dated in another week',{...missed(s),runEvidence:[{...fieldTest,date:t.day(w-1,3)}]});
 // A test naming a session that is not a harder session: the engine decides the missed easy run as it would.
 if(easy)same('a test naming an easy run',{...missed(easy),runEvidence:[{...fieldTest,replacedSessionId:easy.id}]});
 // A missed session with no declaration at all (mutant M31: withhold on every review).
 same('no declaration',missed(s));
 // The one case: an accepted field test of this athlete naming the harder session of its week.
 const rv=missed(s),withheld=X.evaluateProgram(t.p,{...rv,runEvidence:[fieldTest]},DEV);assert.notEqual(withheld.action,'MOVE');assert.deepEqual(withheld.runEvidence.added,['q-test']);
 assert.equal(hash(engineOnly(withheld)),hash(V1.evaluateProgram(t.p,plain(rv),{withhold:['MOVE']})),'and it is exactly the engine\'s own decision without the move');
});
test('V1RC QRE-02: a review the engine refuses, or one earlier than the record, records nothing; a result recorded mid-week is in force from the next week',()=>{
 const t=timeline(runner({id:'rc-q-02',anchors:[result('10K',3300,'2026-10-11')]}));weeks(t,0,1,paced(400,345));t.step(2,0,'WEEKLY_REVIEW',{});
 const monday=hash(t.cal.paceBands),fast={id:'bd1',...result('10K',3000,t.day(1,2))};
 // A well-formed review dated Thursday of week 1 (before the record), declaring a faster race.
 const back=X.evaluateProgram(t.p,{...t.review(1,3,'WEEKLY_REVIEW',{}),runEvidence:[fast]},DEV);
 assert.deepEqual(back.runEvidence.added,[]);assert.equal(back.runEvidence.refused.length,1);assert.ok(['evidence.reviewNotAccepted','evidence.reviewBeforeTheRecord'].includes(back.runEvidence.refused[0].errors[0]));assert.equal(back.runEvidenceRecord.length,0);
 // The same without the reference state and the ledger the client holds: still nothing is recorded under an instant the engine refused.
 const bare={...t.review(1,3,'WEEKLY_REVIEW',{}),runEvidence:[fast]};delete bare.referenceState;const bareResult=X.evaluateProgram(t.p,bare,DEV);
 if(bareResult.runEvidence.added.length)assert.notEqual(bareResult.status,'HOLD');
 // A review the engine refuses on its contract records nothing either.
 const bad=X.evaluateProgram(t.p,{...t.review(2,1,'WEEKLY_REVIEW',{}),weekIndex:7,runEvidence:[fast]},DEV);assert.equal(bad.status,'HOLD');assert.deepEqual(bad.runEvidence.added,[]);assert.deepEqual(bad.runEvidence.refused[0].errors,['evidence.reviewNotAccepted']);
 t.step(2,3,'WEEKLY_REVIEW',{});assert.equal(hash(t.cal.paceBands),monday,'the week in force is what it was on Monday');
 // Mutant M03: a result dated last week but recorded on Thursday is not in force this week; it is from the next.
 t.step(2,3,'WEEKLY_REVIEW',{runEvidence:[fast]});
 assert.equal(hash(t.cal.paceBands),monday);const e=t.cal.evidence.find(x=>x.id==='bd1');assert.equal(e.use,'NOT_YET_IN_FORCE');assert.deepEqual(e.reasons,['RECORDED_IN_OR_AFTER_THIS_WEEK']);
 t.week(2,paced(400,345));t.week(3,paced(400,345));assert.equal(t.cal.capacity.reference.seconds,3000);assert.ok(t.same,t.differences.join(','));
});
test('V1RC QRE-03: a correction declared inside a week takes effect the next week; until then the corrected row stands (and an older result never takes over)',()=>{
 const t=timeline(runner({id:'rc-q-03',anchors:[{id:'old-fast',...result('10K',3150,'2026-09-20')},{id:'recent',...result('10K',3300,'2026-10-31')}]}));
 t.week(0,paced(400,345));t.step(1,0,'WEEKLY_REVIEW',{});assert.equal(t.cal.capacity.evidenceId,'recent');const monday=hash([t.cal.paceBands,t.cal.estimates,t.cal.capacity]);
 t.step(1,2,'WEEKLY_REVIEW',{runEvidence:[{id:'recent-fixed',supersedes:'recent',...result('10K',3310,'2026-10-31')}]});
 assert.equal(hash([t.cal.paceBands,t.cal.estimates,t.cal.capacity]),monday,'nothing moves inside the week');assert.equal(t.cal.capacity.evidenceId,'recent');
 // Mutant M23: from the next week the correcting row is the reference and the corrected one is not evidence.
 t.week(1,paced(400,345));t.week(2,paced(400,345));
 assert.equal(t.cal.capacity.evidenceId,'recent-fixed');assert.equal(t.cal.capacity.reference.seconds,3310);assert.equal(t.cal.evidence.find(e=>e.id==='recent').use,'SUPERSEDED');assert.ok(!t.cal.actualResults.some(r=>r.id==='recent'));assert.ok(t.same);
});
test('V1RC QRE-04: the longest recent run reads only what was on the record before the week: a result or a run reported late opens nothing inside the week',()=>{
 const input=()=>runner({id:'rc-q-04',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:1},anchors:[result('10K',3300,'2026-11-01')]});
 const t=timeline(input());assert.equal(t.cal.estimates.HALF_MARATHON.reason,'ENDURANCE_NOT_DEMONSTRATED');
 t.week(0,paced(400,345));t.step(1,0,'WEEKLY_REVIEW',{});assert.equal(t.cal.estimates.HALF_MARATHON.status,'UNAVAILABLE');
 t.step(1,2,'WEEKLY_REVIEW',{runEvidence:[{id:'long15',...result('10K',5400,t.day(0,5)),distance:undefined,distanceKm:15}]});
 assert.equal(t.cal.estimates.HALF_MARATHON.reason,'ENDURANCE_NOT_DEMONSTRATED','declared on Wednesday: not this week');assert.equal(t.cal.paceBands.HALF_MARATHON_EFFORT.status,'UNAVAILABLE');
 // Mutant M32: the same for a logged run reported late.
 const u=timeline(input()),long=u.p.weeks[0].sessions.find(s=>live(s)&&s.role==='LONG');
 u.step(0,6,'WEEKLY_REVIEW',{observations:u.p.weeks[0].sessions.filter(live).filter(s=>s.id!==long.id).map(s=>report(u.p,s,s.sport==='RUN'?paced(400,345)(s):{}))});
 u.step(1,1,'WEEKLY_REVIEW',{observations:[report(u.p,long,{pace:420,rpe:3,actual:{minutes:80}})]});
 assert.equal(u.cal.estimates.HALF_MARATHON.reason,'ENDURANCE_NOT_DEMONSTRATED','an 80-minute run of last week, reported on Tuesday: not this week');
 u.week(1,paced(400,345));u.week(2,paced(400,345));assert.equal(u.cal.estimates.HALF_MARATHON.status,'AVAILABLE','from the next week it counts');assert.ok(t.same&&u.same);
});
test('V1RC QRE-05: week 0 reads what was on record before its first day, and recency is counted from the first day of the week (boundaries 56 and 112 days)',()=>{
 const t=timeline(runner({id:'rc-q-05',asOf:START,start:START}));assert.equal(t.cal.status,'EFFORT_ONLY');
 const r=t.step(0,0,'WEEKLY_REVIEW',{runEvidence:[{id:'day0',...result('10K',3300,beforeStart(1))}]},'21:00');assert.deepEqual(r.runEvidence.added,['day0']);
 assert.equal(available(t.cal).length,0,'declared on day 0: not in week 0');assert.equal(t.cal.nextWeek.capacity.status,'CALIBRATED');
 t.step(0,3,'WEEKLY_REVIEW',{});assert.equal(available(t.cal).length,0);assert.ok(Object.values(t.cal.sessions).filter(s=>s.week===0).every(s=>s.pace.status!=='AVAILABLE'));
 // Mutant M27: 56 days before the week's first day is current, 57 is aged; 112 is aged, 113 is history.
 const at=n=>X.generateProgram(runner({id:'rc-q-05b',anchors:[result('10K',3300,beforeStart(n))]}),DEV).runCalibration.capacity,E=VALUES.evidence;
 const c56=at(E.currentDays),c57=at(E.currentDays+1),c112=at(E.agingDays),c113=at(E.agingDays+1);
 assert.equal(c56.status,'CALIBRATED');assert.equal(c56.recency,'CURRENT');assert.ok(c56.validUntil>=START,'still valid on the week\'s first day');
 assert.equal(c57.status,'PRESUMED');assert.equal(c57.recency,'AGING');assert.equal(c112.status,'PRESUMED');assert.equal(c113.status,'NONE');
});
test('V1RC QRE-06 and the withdrawal floors: after a break of 14 days or a hold, nothing dated before it speaks: no capacity, no zone from an old maximum, no supplied value',()=>{
 // The plan stays in EASY mode here, so only the floors decide (mutants M06, M15 and M20, masked in the reachable flows by the engine's return weeks).
 const lab={id:'lab',kind:'LAB_TEST',date:beforeStart(20),lab:{protocol:'Incremental test',source:'Laboratory report',values:[{name:'First measured anchor',value:148,unit:'bpm'}]}};
 const input=runner({id:'rc-q-06',anchors:[{id:'old-max',...result('10K',3300,beforeStart(150),{heartRate:{maxBpm:186,sensor:'CHEST_STRAP'}})},{id:'recent',...result('10K',3300,beforeStart(8),{heartRate:{maxBpm:182,sensor:'CHEST_STRAP'}})}]});
 const g=X.generateProgram(input,DEV),p=g.program,asOf=`${p.weeks[5].startDate}T20:00:00-03:00`,call=(ledger,x={})=>X.runCalibrationOf({program:p,ledger,evidenceRecord:[],asOf,weekIndex:5,engineStatus:'KEEP',eligibility:ELIG(p.weeks[5].startDate),...x},DEV);
 const clean=call([]);assert.equal(clean.heartRateZones.status,'AVAILABLE');assert.equal(clean.heartRateZones.observedMaximumBpm,186,'without a withdrawal the older maximum is readable for a year');
 const brk=days=>[{fact:'INTERRUPTION_DECLARED',eventId:'b1',athleteId:p.athleteId,declaredAt:`${p.weeks[4].startDate}T12:00:00Z`,interruption:{startDate:p.weeks[1].startDate,endDate:new Date(Date.parse(p.weeks[1].startDate+'T00:00:00Z')+(days-1)*864e5).toISOString().slice(0,10),days}}];
 const afterBreak=call(brk(VALUES.withdrawal.breakDaysWithdrawMin));
 assert.equal(afterBreak.capacity.status,'NONE');assert.equal(afterBreak.capacity.reason,'WITHDRAWN_AFTER_BREAK');assert.equal(available(afterBreak).length,0);assert.ok(Object.values(afterBreak.estimates).every(e=>e.status==='UNAVAILABLE'));
 assert.equal(afterBreak.heartRateZones.status,'UNAVAILABLE','the 150-day-old maximum from before the break is not read');
 const shortBreak=call(brk(VALUES.withdrawal.breakDaysWithdrawMin-1));assert.notEqual(shortBreak.capacity.status,'NONE','13 days is not a withdrawal');assert.ok(shortBreak.capacity.confidenceCauses.includes('SHORT_BREAK_SINCE_EVIDENCE'));assert.equal(shortBreak.heartRateZones.status,'AVAILABLE');
 // A hold opened and released: the engine's own facts, taken from a real record.
 const t=timeline(runner({id:'rc-q-06',anchors:[...input.athlete.performanceAnchors,lab]})),d=t.day(0,2);assert.equal(t.cal.heartRateZones.basis,'MEASURED_AS_SUPPLIED');
 assert.equal(t.step(0,2,'WEEKLY_REVIEW',{eligibility:ELIG(d,{pain:true})}).status,'CLINICAL_HUMAN_REQUIRED');
 t.step(0,4,'READINESS_DECLARATION',{readiness:{declaredRecovered:true,warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false])),sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}}});
 const facts=t.ledger.filter(o=>o.fact),held=X.runCalibrationOf({program:t.g.program,ledger:facts,evidenceRecord:[],asOf,weekIndex:5,engineStatus:'KEEP',eligibility:ELIG(p.weeks[5].startDate)},DEV);
 assert.ok(facts.some(o=>o.fact==='CLINICAL_HOLD')&&facts.some(o=>o.fact==='READINESS_DECLARED'));assert.notEqual(held.status,'WITHHELD_HOLD','the hold was released');
 assert.equal(held.capacity.status,'NONE');assert.equal(held.heartRateZones.status,'UNAVAILABLE','neither the old maximum nor the supplied values from before the hold');assert.equal(available(held).length,0);
});
test('V1RC QRE-07, QRE-12 (rows of another athlete): a glitched easy run is no observation; a row that is not this athlete\'s is never read',()=>{
 const t=timeline(runner({id:'rc-q-07'}));let i=0;
 weeks(t,0,2,s=>s.prescription.family==='EASY'?(i++===2?{rpe:3,actual:{distanceKm:0.6,measurement:'GPS'}}:{pace:390,rpe:3}):{});
 const b=t.cal.paceBands.EASY;assert.equal(b.status,'AVAILABLE');assert.ok(b.slowSecondsPerKm<=450,'no absurd slow edge: '+b.slowSecondsPerKm);assert.ok(!b.sessions.some(s=>t.ledger.find(o=>o.eventId===s.eventId)?.actual.distanceKm===0.6));
 // Mutant M12: the same rows under another athlete's id calibrate nothing.
 const foreign=t.ledger.map(o=>({...o,athleteId:'someone-else'})),c=X.runCalibrationOf({program:t.p,ledger:foreign,evidenceRecord:[],asOf:t.review(2,6,'WEEKLY_REVIEW',{}).asOf,weekIndex:2,engineStatus:'KEEP',eligibility:ELIG(t.day(2,6))},DEV);
 assert.equal(c.assessment.progress.easyRuns.count,0);assert.equal(available(c).length,0);
});
test('V1RC QRE-08: with the estimate boundary off, nothing shows an estimate: no 10 km equivalent in the capacity or in the record of changes',()=>{
 const input=RECENT({id:'rc-q-08'}),only=b=>X.generateProgram(input,{runCalibration:devRunCalibration(b.map(k=>RUN_BOUNDARIES[k]))}).runCalibration;
 for(const c of [only(['CAPACITY']),only(['CAPACITY','PACE']),only(['CAPACITY','HR'])]){assert.equal(c.capacity.status,'CALIBRATED');assert.equal(c.capacity.tenKEquivalent,undefined);assert.ok(!JSON.stringify([c.capacity,c.projection,c.nextWeek?.change??null]).includes('tenKEquivalent'));assert.ok(Object.values(c.estimates).every(e=>e.reason==='EXTENSION_NOT_ENABLED'));}
 assert.equal(only(['CAPACITY','ESTIMATE']).capacity.tenKEquivalent.centralSeconds,3300);
});
test('V1RC QRE-10 to QRE-13 and QRE-15: off records nothing; a future-dated anchor and a reserved id are refused; carried rows are returned as received; a very large list does not fail',()=>{
 const t=timeline(runner({id:'rc-q-10'})),review=x=>({...t.review(0,6,'WEEKLY_REVIEW',{}),...x}),decl={id:'d1',...result('10K',3300,t.day(0,5))};
 const off=X.evaluateProgram(t.p,review({runEvidence:[decl],runEvidenceRecord:[]}),OFF);assert.deepEqual(off.runEvidenceRecord,[]);assert.deepEqual(off.runEvidence,{added:[],refused:[{id:'d1',errors:['evidence.extensionNotEnabled']}]});
 const future=X.generateProgram(runner({id:'rc-q-11',anchors:[result('10K',2900,'2026-11-20')]}),DEV).runCalibration;assert.deepEqual(future.refusedEvidence.map(r=>r.errors[0]),['evidence.dateAfterTheIntake']);assert.equal(future.evidence.length,0);
 const withAnchor=timeline(runner({id:'rc-q-12',anchors:[result('10K',3300,'2026-11-05'),{id:'mine',...result('5K',1560,'2026-11-01')}]}));
 const taken=X.evaluateProgram(withAnchor.p,{...withAnchor.review(0,6,'WEEKLY_REVIEW',{}),runEvidence:[{...decl,id:'intake-0',seconds:3000},{...decl,id:'mine',seconds:3000},{...decl,id:'plan-race:x',seconds:3000},{...decl,id:'free'}]},DEV);
 assert.deepEqual(taken.runEvidence.added,['free']);assert.deepEqual(taken.runEvidence.refused.map(r=>r.errors[0]),['evidence.idReserved','evidence.idReserved','evidence.idReserved']);
 const junk=[null,7,'x',{fact:'OTHER'}],kept=X.evaluateProgram(t.p,review({runEvidence:[decl],runEvidenceRecord:junk}),DEV);
 assert.equal(kept.runEvidenceRecord.length,5);assert.deepEqual(kept.runEvidenceRecord.slice(0,4),junk,'every carried row is returned as received');assert.equal(kept.runEvidenceRecord[4].eventId,'d1');
 const many=Array.from({length:150000},(_,i)=>result('10K',3300+i%7,'2026-11-0'+(1+i%5))),big=X.generateProgram(runner({id:'rc-q-15',anchors:many}),DEV).runCalibration;
 assert.notEqual(big.reason,'CALIBRATION_ERROR');assert.equal(big.status,'CALIBRATED');
});
test('V1RC survivors M02 and M11: a harder session reported late does not count this week; the upward steps stop at their total',()=>{
 // M02: two threshold sessions give that domain its observed range; when the second is reported on Tuesday of the next week, that week has none yet.
 const t=timeline(runner({id:'rc-q-m02'})),q=firstQualityWeek(t);weeks(t,0,q,paced(390,300));const s=quality(t,q+1);
 t.step(q+1,6,'WEEKLY_REVIEW',{observations:t.p.weeks[q+1].sessions.filter(live).filter(x=>x.id!==s.id).map(x=>report(t.p,x,x.sport==='RUN'?paced(390,300)(x):{}))});
 t.step(q+2,1,'WEEKLY_REVIEW',{observations:[report(t.p,s,{pace:390,workPace:300,rpe:7})]});
 assert.equal(t.cal.paceBands[TH].status,'UNAVAILABLE','reported on Tuesday: not this week');assert.equal(t.cal.nextWeek.paceBands[TH].status,'AVAILABLE');
 // M11: fast threshold sessions week after week never take the band more than the total allowed without a confirming race or test.
 const u=timeline(RECENT({id:'rc-q-m11',weeks:16})),qu=firstQualityWeek(u);weeks(u,0,qu-1,paced(400,345));const seen=new Set();
 for(let w=qu;w<=qu+10&&w<u.p.weeks.length-1;w++){const b=u.cal.paceBands[TH];u.week(w,paced(400,()=>b.status==='AVAILABLE'?Math.round(b.fastSecondsPerKm*0.93):300));seen.add(u.cal.capacity.trainingFactors?.[TH]?.fraction??0);}
 assert.deepEqual([...seen].sort(),[0,0.015,0.03,0.045],'steps of 1.5% up to 4.5% and no further: '+[...seen]);assert.ok(t.same&&u.same,[...t.differences,...u.differences].join(','));
});
test('V1RC survivor M29: a downward step on the half-marathon sessions also slows the half-marathon estimate, once, and no other',()=>{
 const t=timeline(runner({id:'rc-q-m29',weeks:16,goal:{kind:'RACE',event:{kind:'HALF_MARATHON',date:'2027-02-21'}},anchors:[result('10K',3300,'2026-11-05')]})),HM='HALF_MARATHON_EFFORT';
 const specific=w=>t.p.weeks[w]?.sessions.find(s=>live(s)&&s.prescription.family==='HALF_MARATHON_SPECIFIC'),first=t.p.weeks.findIndex((_,w)=>specific(w));assert.ok(first>0,'the plan has half-marathon specific sessions');
 weeks(t,0,first-1,paced(400,s=>t.cal.paceBands[TH].status==='AVAILABLE'?t.cal.paceBands[TH].fastSecondsPerKm+5:345));
 const before=structuredClone(t.cal.nextWeek.estimates),slow=()=>{const b=t.cal.paceBands[HM];return b.status==='AVAILABLE'?Math.round(b.slowSecondsPerKm*(1+T.triggerFraction+0.03)):420;};
 assert.equal(before.HALF_MARATHON.status,'AVAILABLE');
 let w=first;for(;w<t.p.weeks.length-1&&!(t.cal.capacity.trainingFactors?.[HM]?.fraction<0);w++){if(!specific(w))break;t.week(w,paced(400,slow));}
 assert.equal(t.cal.capacity.trainingFactors[HM].fraction,-T.down.stepFraction,'two slow half-marathon sessions lower that band');
 const now=t.cal.estimates;assert.ok(now.HALF_MARATHON.centralSeconds>before.HALF_MARATHON.centralSeconds&&now.HALF_MARATHON.highSeconds>before.HALF_MARATHON.highSeconds,'and its estimate');assert.ok(now.HALF_MARATHON.flags.includes('TRAINING_ADJUSTED_DOWN'));
 assert.ok(Math.abs(now.HALF_MARATHON.centralSeconds/before.HALF_MARATHON.centralSeconds-1/(1-T.down.stepFraction))<0.006,'by the step, once');
 for(const k of ['5K','10K'])assert.equal(now[k].centralSeconds,before[k].centralSeconds,k+' is not touched');assert.ok(t.same,t.differences.join(','));
});
