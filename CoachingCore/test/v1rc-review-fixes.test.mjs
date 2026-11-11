// V1 Run Calibration Extension: the single fix cycle after the independent round on bc40218 (SSCTR-V1RC-REVIEW-r1). One directed test per finding
// of the sporting review; the reliability findings are in v1rc-review-fixes-qre.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {X,DEV,VALUES,timeline,runner,result,report,live,ELIG,hash} from './v1rc-helpers.mjs';
import {devRunCalibration,RUN_BOUNDARIES,STOP_REASONS} from '../src/v1-run-calibration.mjs';
import {READINESS_SIGNS} from '../src/v1-f08.mjs';

const EASY=['EASY','LONG','RECOVERY_EASY','SHAKEOUT'];
const paced=(easy,work,x={})=>s=>EASY.includes(s.prescription.family)?{pace:easy,rpe:3,...x.easy}:['WALK','WALK_JOG','RACE'].includes(s.prescription.family)?{rpe:3}:{pace:easy,workPace:typeof work==='function'?work(s):work,rpe:7,...x.hard};
const weeks=(t,from,to,how)=>{for(let w=from;w<=to;w++)t.week(w,how);};
const quality=(t,w)=>t.p.weeks[w]?.sessions.find(s=>s.role==='QUALITY'&&live(s))??null;
const firstQualityWeek=t=>t.p.weeks.findIndex(w=>w.sessions.some(s=>s.role==='QUALITY'&&live(s)));
const cal=(input,opts=DEV)=>{const g=X.generateProgram(input,opts);assert.equal(g.status,'PROPOSED',g.reason);return g.runCalibration;};
const AS_OF='2026-11-07',daysBefore=n=>new Date(Date.parse(AS_OF+'T00:00:00Z')-n*864e5).toISOString().slice(0,10);
const TH='THRESHOLD_CONTROLLED',T=VALUES.recalibration.training;
const MAR={weeks:16,runExperience:'EXPERIENCED',goal:{kind:'RACE',event:{kind:'MARATHON',date:'2027-02-28'}},recent:{runDaysPerWeek:5,runMinutesPerWeek:360,longestRunMinutes:150,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,4,6],strengthDays:[2],runMinutes:90,strengthMinutes:35,longRunDay:6,longRunMinutes:210}};
const RECENT=(x={})=>runner({id:'rc-x-recent',anchors:[result('10K',3300,'2026-11-05')],...x});
/** A runner at the point where the test is offered, and the declaration of that test with the session it replaces reported not done. */
const offered=id=>{const t=timeline(runner({id})),q=firstQualityWeek(t);weeks(t,0,q,paced(390,300));assert.equal(t.cal.assessment.status,'OFFERED');return {t,q};};
const declare=(t,w,x={})=>{const a=t.cal.assessment,s=quality(t,w);return t.week(w,q=>q.id===s.id?false:paced(390,300)(q),{runEvidence:[{id:'x-test-'+w,kind:'FIELD_TEST',protocol:a.protocol?.id??'TIME_TRIAL_5K',date:s.date,distanceKm:a.protocol?.distanceKm??5,seconds:1425,rpe:8,measurement:'TRACK',tolerated:true,replacedSessionId:s.id,...x}],expectWithhold:true});};

test('V1RC R-01: a test stopped for a symptom, or with no stated reason, ends test offers for the plan and names the warning-sign screen, at once',()=>{
 for(const stop of [{stoppedFor:'SYMPTOM'},{},{stoppedFor:'not a reason'}]){
  const {t,q}=offered('rc-x-r01');declare(t,q+1,{distanceKm:1.6,seconds:480,completed:false,tolerated:false,...stop});
  // In the same review, not at the week boundary: it is a safety fact.
  assert.equal(t.cal.assessment.status,'NOT_OFFERED');assert.deepEqual(t.cal.assessment.reasons,['SYMPTOM_OR_NOT_TOLERATED_REPORTED']);assert.deepEqual(t.cal.assessment.evidenceIds,['x-test-'+(q+1)]);
  assert.equal(t.cal.warningSignScreen.status,'REQUIRED');assert.deepEqual(t.cal.warningSignScreen.evidenceIds,['x-test-'+(q+1)]);assert.equal(t.cal.warningSignScreen.decidedByThisExtension,false);
  for(let w=q+2;w<=q+9&&w<t.p.weeks.length-1;w++){t.week(w,paced(390,300));assert.equal(t.cal.assessment.status,'NOT_OFFERED','never offered again in this plan (week '+w+')');assert.equal(t.cal.warningSignScreen.status,'REQUIRED');}
  assert.equal(t.cal.capacity.status,'NONE');assert.ok(t.same,t.differences.join(','));
 }
 assert.deepEqual([...STOP_REASONS],VALUES.assessment.P3.stops.reasons);assert.equal(VALUES.assessment.P3.stops.missingReasonReadAs,'SYMPTOM');
});
test('V1RC R-01: a completed test reported as not tolerated is not evidence and ends the offers too; a stop for pacing keeps the one repeat',()=>{
 const a=offered('rc-x-r01b');declare(a.t,a.q+1,{tolerated:false});
 for(let w=a.q+2;w<a.t.p.weeks.length-1;w++){a.t.week(w,paced(390,300));assert.equal(a.t.cal.assessment.status,'NOT_OFFERED');assert.deepEqual(a.t.cal.assessment.reasons,['SYMPTOM_OR_NOT_TOLERATED_REPORTED']);}
 assert.equal(a.t.cal.capacity.status,'NONE');assert.ok(a.t.cal.evidence.find(e=>e.kind==='FIELD_TEST').reasons.includes('NOT_TOLERATED'));
 const b=offered('rc-x-r01c');declare(b.t,b.q+1,{distanceKm:2.1,seconds:600,completed:false,stoppedFor:'PACING'});b.t.week(b.q+2,paced(390,300));
 assert.equal(b.t.cal.assessment.status,'OFFERED','a stop that was not for a symptom keeps the one repeat');assert.equal(b.t.cal.warningSignScreen.status,'NOT_RAISED_BY_THIS_EXTENSION');
 // Any declared result of the plan's time reported as not tolerated counts, whatever its kind.
 const c=offered('rc-x-r01d');c.t.week(c.q+1,paced(390,300),{runEvidence:[{id:'x-race',...result('5K',1500,c.t.day(c.q+1,5),{tolerated:false})}]});
 assert.deepEqual(c.t.cal.assessment.reasons,['SYMPTOM_OR_NOT_TOLERATED_REPORTED']);assert.deepEqual(c.t.cal.warningSignScreen.evidenceIds,['x-race']);
 // A result from before the plan does not raise it.
 assert.equal(cal(runner({id:'rc-x-r01e',anchors:[result('10K',3300,daysBefore(30),{tolerated:false})]})).warningSignScreen.status,'NOT_RAISED_BY_THIS_EXTENSION');
});
test('V1RC R-02: a test is offered only on a prescribing answer of the engine with every warning-sign item answered no',()=>{
 const {t,q}=offered('rc-x-r02'),w=q+1,ss=t.p.weeks[w].sessions.filter(live),e=ELIG(t.day(w,6));delete e.pain;delete e.clinicalConcern;
 const r=t.step(w,6,'WEEKLY_REVIEW',{eligibility:e,observations:ss.map(s=>report(t.p,s,s.sport==='RUN'?paced(390,300)(s):{}))});
 assert.equal(r.status,'ASK','the engine asks for the unanswered items');assert.equal(t.cal.assessment.status,'NOT_OFFERED');assert.deepEqual(t.cal.assessment.reasons,['ELIGIBILITY_NOT_CURRENT']);
 // Answered (the reports sent again, since the engine recorded nothing while it asked): the offer is back, as it was.
 t.step(w,6,'WEEKLY_REVIEW',{observations:ss.map(s=>report(t.p,s,s.sport==='RUN'?paced(390,300)(s):{}))});assert.equal(t.cal.assessment.status,'OFFERED');
 // The calibration itself never offers on a status that prescribes nothing, whatever eligibility it is handed.
 for(const engineStatus of ['ASK','HOLD','CLINICAL_HUMAN_REQUIRED','UNSUPPORTED','INVALID_INPUT',null]){
  const c=X.runCalibrationOf({program:t.p,ledger:t.ledger,evidenceRecord:t.ev,asOf:t.review(w,6,'WEEKLY_REVIEW',{}).asOf,weekIndex:w,engineStatus,eligibility:ELIG(t.day(w,6))},DEV);assert.notEqual(c.assessment.status,'OFFERED',String(engineStatus));}
 for(const eligibility of [null,{},{...ELIG(t.day(w,6)),status:'UNASSESSED'},{...ELIG(t.day(w,6)),pain:true},{...ELIG(t.day(w,6)),injury:null}]){
  const c=X.runCalibrationOf({program:t.p,ledger:t.ledger,evidenceRecord:t.ev,asOf:t.review(w,6,'WEEKLY_REVIEW',{}).asOf,weekIndex:w,engineStatus:'KEEP',eligibility},DEV);assert.deepEqual(c.assessment.reasons,['ELIGIBILITY_NOT_CURRENT'],JSON.stringify(eligibility));}
 assert.ok(t.same,t.differences.join(','));
});
test('V1RC R-03: a runner outside the model population gets no marathon estimate and no marathon band either',()=>{
 const g=X.generateProgram(runner({id:'rc-x-r03',...MAR,anchors:[result('HALF_MARATHON',10500,daysBefore(20))]}),DEV),c=g.runCalibration;
 assert.equal(g.program.goal.run.event?.kind,'MARATHON','the athlete is in the marathon block (eligibility is about preparation, not speed)');assert.equal(c.capacity.status,'OUTSIDE_MODEL_POPULATION');
 assert.equal(c.estimates.MARATHON.status,'UNAVAILABLE');assert.equal(c.estimates.MARATHON.reason,'OUTSIDE_MODEL_POPULATION');assert.equal(c.paceBands.MARATHON_EFFORT.reason,'OUTSIDE_MODEL_POPULATION');
 assert.ok(Object.values(c.paceBands).every(b=>b.status==='UNAVAILABLE'));assert.ok(Object.values(c.estimates).every(e=>e.status==='UNAVAILABLE'));
 assert.ok(Object.values(c.sessions).every(s=>s.pace.status==='UNAVAILABLE'),'every session stays by effort');
});
test('V1RC R-04: a ceiling is never faster than the easier one above it, and the threshold fast edge never faster than the 10 km one; it only ever slows',()=>{
 // The athlete's own easy running is slower than the derived ceiling: the long and recovery ceilings follow it slower.
 const t=timeline(RECENT({id:'rc-x-r04'})),derived=structuredClone(t.cal.paceBands),slow=derived.EASY.fastSecondsPerKm+60;
 weeks(t,0,3,s=>EASY.includes(s.prescription.family)?{pace:slow,rpe:3}:{pace:slow,workPace:derived[TH].fastSecondsPerKm+5,rpe:7});
 const B=t.cal.paceBands;assert.ok(B.EASY.fastSecondsPerKm>derived.EASY.fastSecondsPerKm);assert.ok(B.LONG.fastSecondsPerKm>=B.EASY.fastSecondsPerKm,'long '+B.LONG.fastSecondsPerKm+' vs easy '+B.EASY.fastSecondsPerKm);assert.ok(B.RECOVERY.fastSecondsPerKm>=B.LONG.fastSecondsPerKm);
 assert.ok(B.LONG.notes.includes('NOT_FASTER_THAN_EASY'));assert.ok(B.LONG.slowSecondsPerKm-B.LONG.fastSecondsPerKm>=VALUES.paceRules.minimumWidthSecondsPerKm.EASY);
 for(const id of ['FIVE_K_EFFORT','TEN_K_EFFORT','HALF_MARATHON_EFFORT',TH])assert.equal(hash(B[id]),hash(derived[id]),id+' takes nothing from easy running');
 // Across the population: the orderings hold for every 10 km time, official or GPS.
 for(const measurement of ['OFFICIAL','GPS'])for(let s=27.5*60;s<=75*60;s+=75){const b=cal(runner({id:'rc-x-r04s',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:80,strengthDaysPerWeek:1},anchors:[result('10K',s,daysBefore(14),{measurement})]})).paceBands,at=' at '+s+' '+measurement;
  assert.ok(b[TH].fastSecondsPerKm>=b.TEN_K_EFFORT.fastSecondsPerKm,'threshold vs 10 km'+at);assert.ok(b.TEN_K_EFFORT.fastSecondsPerKm>=b.FIVE_K_EFFORT.fastSecondsPerKm,'10 km vs 5 km'+at);assert.ok(b.HALF_MARATHON_EFFORT.fastSecondsPerKm>=b.TEN_K_EFFORT.fastSecondsPerKm,'half vs 10 km'+at);
  assert.ok(b.EASY.fastSecondsPerKm>b[TH].slowSecondsPerKm&&b.LONG.fastSecondsPerKm>=b.EASY.fastSecondsPerKm&&b.RECOVERY.fastSecondsPerKm>=b.LONG.fastSecondsPerKm,'easy order'+at);
  for(const x of Object.values(b))if(x.status==='AVAILABLE')assert.ok(x.slowSecondsPerKm>x.fastSecondsPerKm);}
});
test('V1RC R-05: sessions jogged below their cue lower nothing; a session not completed between two others breaks the pair',()=>{
 const t=timeline(RECENT({id:'rc-x-r05'})),q=firstQualityWeek(t);weeks(t,0,q-1,paced(400,345));
 const slow=()=>Math.round(t.cal.paceBands[TH].slowSecondsPerKm*(1+T.triggerFraction+0.03));
 weeks(t,q,q+2,paced(400,slow,{hard:{rpe:4}}));
 assert.deepEqual(t.cal.capacity.trainingFactors,{},'slower at 4 of 10 on a 6 to 7 cue is not information about the band');assert.equal(t.cal.paceBands[TH].trainingFactor,0);
 const u=timeline(RECENT({id:'rc-x-r05b'})),qu=firstQualityWeek(u);weeks(u,0,qu-1,paced(400,345));
 const fast=()=>Math.round(u.cal.paceBands[TH].fastSecondsPerKm*(1-T.triggerFraction-0.03));
 u.week(qu,paced(400,fast));u.week(qu+1,s=>s.role==='QUALITY'?false:paced(400,fast)(s));u.week(qu+2,paced(400,fast));
 assert.equal(u.cal.nextWeek.change,null,'fast, not done, fast: no two consecutive executions');
 u.week(qu+3,paced(400,fast));assert.equal(u.cal.nextWeek.change.reason,'TRAINING_FASTER_THAN_BAND','two in a row after it do count');
 assert.ok(t.same&&u.same,[...t.differences,...u.differences].join(','));
});
test('V1RC R-06 and the label of an adjusted band: a race-pace band needs the estimate boundary; a band moved by training no longer says it is the estimate',()=>{
 const input=RECENT({id:'rc-x-r06'}),noEstimate=X.generateProgram(input,{runCalibration:devRunCalibration([RUN_BOUNDARIES.CAPACITY,RUN_BOUNDARIES.PACE])}).runCalibration;
 for(const id of ['FIVE_K_EFFORT','TEN_K_EFFORT','HALF_MARATHON_EFFORT','MARATHON_EFFORT']){assert.equal(noEstimate.paceBands[id].status,'UNAVAILABLE');assert.equal(noEstimate.paceBands[id].reason,'EXTENSION_NOT_ENABLED');}
 for(const id of [TH,'EASY','LONG','RECOVERY'])assert.equal(noEstimate.paceBands[id].status,'AVAILABLE',id+' rests on the curve, not on an estimate');
 assert.ok(Object.values(noEstimate.estimates).every(e=>e.reason==='EXTENSION_NOT_ENABLED'));
 const t=timeline(RECENT({id:'rc-x-label'})),q=firstQualityWeek(t);weeks(t,0,q-1,paced(400,345));assert.equal(t.cal.paceBands[TH].label,'ESTIMATED');
 const fast=()=>Math.round(t.cal.paceBands[TH].fastSecondsPerKm*(1-T.triggerFraction-0.03));weeks(t,q,q+2,paced(400,fast));
 const b=t.cal.paceBands[TH];assert.equal(b.trainingFactor,T.up.stepFraction);assert.equal(b.label,'ESTIMATED_TRAINING_ADJUSTED');assert.match(b.method,/_TRAINING_ADJUSTED$/);
});
test('V1RC R-07: the marathon estimate, its band and its race day carry the caution and the assumption as fields',()=>{
 const c=cal(runner({id:'rc-x-r07',...MAR,anchors:[result('HALF_MARATHON',6300,daysBefore(20))]})),M=VALUES.estimates.marathon;
 const day=Object.values(c.sessions).find(s=>s.family==='RACE'),specific=Object.values(c.sessions).find(s=>s.family==='MARATHON_SPECIFIC');
 for(const x of [c.estimates.MARATHON,c.paceBands.MARATHON_EFFORT,day.pace,specific.pace]){assert.deepEqual(x.cautions,M.cautions);assert.deepEqual(x.assumes,M.assumes);}
 assert.equal(M.cautions[0].id,'MANY_RUNNERS_RACE_THE_MARATHON_SLOWER_THAN_SUCH_ESTIMATES');assert.equal(M.assumes[0].id,'BLOCK_LONG_RUNS_COMPLETED');assert.equal(c.estimates.HALF_MARATHON.cautions,undefined);
});
test('V1RC R-08: an observed band says which sessions it rests on, with their dates, its window, when it stops holding and why it is uncertain',()=>{
 const t=timeline(runner({id:'rc-x-r08'})),q=firstQualityWeek(t);weeks(t,0,q+2,paced(390,300));
 for(const [id,window] of [['EASY',VALUES.assessment.P1.windowDays],[TH,VALUES.assessment.P2.windowDays]]){const b=t.cal.paceBands[id];
  assert.equal(b.basis,'OBSERVED_AT_EFFORT');assert.ok(b.sessions.length>=2&&b.sessions.every(s=>s.eventId&&/^\d{4}-\d{2}-\d{2}$/.test(s.date)));assert.equal(b.windowDays,window);
  assert.ok(b.validUntil>b.sessions[0].date);assert.deepEqual(b.uncertaintyCauses,['OBSERVED_AT_EFFORT','GPS_DISTANCE_ERROR']);assert.equal(b.confidence,null);}
});
test('V1RC R-09: supplied laboratory values dated before a hold are not shown after it, as the observed maximum is not',()=>{
 const lab={kind:'LAB_TEST',date:daysBefore(10),lab:{protocol:'Incremental test',source:'Laboratory report',values:[{name:'First measured anchor',value:148,unit:'bpm'}]}};
 const t=timeline(RECENT({id:'rc-x-r09',anchors:[result('10K',3300,'2026-11-05'),lab]}));assert.equal(t.cal.heartRateZones.basis,'MEASURED_AS_SUPPLIED');
 const d=t.day(0,2);assert.equal(t.step(0,2,'WEEKLY_REVIEW',{eligibility:ELIG(d,{pain:true})}).status,'CLINICAL_HUMAN_REQUIRED');assert.equal(t.cal.heartRateZones.reason,'HOLD_NO_PRESCRIPTION');
 // After the athlete's own readiness declaration the plan prescribes again; nothing from before the hold speaks for now.
 const r=t.step(0,4,'READINESS_DECLARATION',{readiness:{declaredRecovered:true,warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false])),sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}}});
 assert.notEqual(r.status,'CLINICAL_HUMAN_REQUIRED',r.reason);
 for(let w=1;w<t.p.weeks.length-1;w++){const x=t.week(w,paced(420,360));if(x.status==='CLINICAL_HUMAN_REQUIRED')break;
  assert.notEqual(t.cal.heartRateZones.status,'AVAILABLE','week '+w+': '+t.cal.heartRateZones.basis);assert.notEqual(t.cal.capacity.status,'CALIBRATED');}
 assert.ok(t.same,t.differences.join(','));
});
test('V1RC R-10: aged evidence counts as one reduction: with two more reasons it is no capacity; the cap for aged evidence stays LOW',()=>{
 const aged=x=>cal(runner({id:'rc-x-r10',anchors:[result('10K',3300,daysBefore(80),x)]})).capacity;
 const clean=aged({});assert.equal(clean.status,'PRESUMED');assert.equal(clean.confidence,'LOW');
 assert.equal(aged({measurement:'GPS'}).status,'PRESUMED','aged and one more reason is still presumed, at LOW');assert.equal(aged({measurement:'GPS'}).confidence,'LOW');
 for(const x of [{measurement:'MANUAL'},{measurement:'GPS',rpe:null},{measurement:'GPS',rpe:6}]){const c=aged(x);assert.equal(c.status,'NONE',JSON.stringify(x));assert.equal(c.reason,'EVIDENCE_BELOW_LOWEST_CONFIDENCE');}
 assert.equal(VALUES.confidence.agingCountsAsReductions,1);
});
test('V1RC R-12: a harder session still standing later in the week of a test is by effort only and says why',()=>{
 const {t,q}=offered('rc-x-r12'),w=q+1,s=quality(t,w),a=t.cal.assessment;
 // The session is reported missed first, without the declaration: the engine may move it to a later day.
 const moved=t.step(w,s.day,'MISSED_SESSION',{targetSessionId:s.id,observations:[report(t.p,s,{completed:false})]});
 const later=t.p.weeks[w].sessions.filter(x=>x.role==='QUALITY'&&live(x)&&x.date>s.date);
 // Then the test is declared for that day.
 t.step(w,s.day+1,'WEEKLY_REVIEW',{runEvidence:[{id:'x-late-test',kind:'FIELD_TEST',protocol:a.protocol.id,date:s.date,distanceKm:a.protocol.distanceKm,seconds:1425,rpe:8,measurement:'TRACK',tolerated:true,replacedSessionId:s.id}]});
 for(const x of later){assert.equal(t.cal.sessions[x.id].pace.status,'UNAVAILABLE');assert.equal(t.cal.sessions[x.id].pace.reason,'TEST_ALREADY_DONE_THIS_WEEK');}
 if(moved.action==='MOVE')assert.ok(later.length>0,'the engine moved the session, and the moved session is marked');
 assert.ok(Object.values(t.cal.sessions).filter(x=>x.week===w+1).every(x=>x.pace.reason!=='TEST_ALREADY_DONE_THIS_WEEK'),'next week is not marked');
 assert.equal(t.cal.assessment.report?.inTheSameReviewAsTheDeclaration??true,true);assert.ok(t.same,t.differences.join(','));
});
