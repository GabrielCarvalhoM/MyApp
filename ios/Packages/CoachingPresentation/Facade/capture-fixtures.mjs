// RepMile V1 shared fixtures (ABC foundation consolidation, 2026-11-26): what the CURRENT runtime (CoachingCore pinned to
// REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2, bundle d087ad51) really answers for synthetic athletes, through `createIntegration` + `api.mjs`
// as the app calls them, plus the shared app-facade projections over those records. Front C codes against these files; front A's decoding
// tests use them; CoachingPresentationTests decode every one. Nothing here is invented: each file is an answer or a projection of a real record.
//
// The journeys are the UI reconciliation's (capture-views/-actions/-unplanned, 2026-11-24) and V1HR5R's (capture-hr5r), re-run on the current
// engine, plus the consolidation's own: special population at onboarding, unplanned reports with and without `observedAt`, the heart-rate
// profile erasure, the warning-sign sets, and the time-in-zone gate.
//
// Run (from anywhere): node ios/Packages/CoachingPresentation/Facade/capture-fixtures.mjs [outDir]
// Default outDir: ios/Packages/CoachingPresentation/Tests/CoachingPresentationTests/Fixtures. Deterministic: ids from a counter, a fixed clock and
// key; FixtureFreshnessTests re-runs this into a temporary directory and requires the same bytes.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {athlete,athleteA,ELIG,addDays,U,notFeeling100WithSign,readiness} from '../../../../CoachingCore/test/v1int-helpers.mjs';
import {result} from '../../../../CoachingCore/test/v1rc-helpers.mjs';
import {fiveZoneAuthority} from '../../../../CoachingCore/src/v1-heart-rate-zones.mjs';
import {loggedEntries,weekPlan,warningSignSets,timeInZones,keepsReport,PROJECTIONS_VERSION} from './app-projections.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const OUT=path.resolve(process.argv[2]??path.join(HERE,'../Tests/CoachingPresentationTests/Fixtures'));fs.mkdirSync(OUT,{recursive:true});
if(!fiveZoneAuthority().approved)throw new Error('capture-fixtures: the five zones are not enabled by the independent record');
let idSeq=0;const newId=p=>`${p}_${String(++idSeq).padStart(6,'0')}`;
const code=r=>r?.ok?'OK':r?.error?.code??'-';
const index=[];
const save=(name,x,what)=>{fs.writeFileSync(path.join(OUT,name+'.json'),JSON.stringify(x,null,1)+'\n');index.push({file:name+'.json',what,result:code(x),state:x?.view?.state??x?.state??null});return x;};
const proj=(t,name,what)=>{const e=loggedEntries(t.rows());save(name,{ok:true,projections:PROJECTIONS_VERSION,entries:e},what);return e;};
const NO={feverOrChills:false,chestPainPressureOrTightness:false,breathlessAtRest:false,palpitationsAtRest:false,faintingOrDizziness:false,painThatChangesMovement:false,swelling:false,injuryFromFallOrImpact:false,gettingWorse:false,bodyWideAches:false,exhaustionAtRest:false,vomitingDiarrhoeaNauseaOrAbdominalPain:false,moderateOrSevereCough:false,severeHeadache:false,severeNoseOrThroat:false};

// ---- 1. The main journey (reconciliation capture-views) ----
{const t=athlete({newId,id:'ui-probe',weeks:12});
 save('01-onboard',t.enroll(),'enroll: first plan');
 save('02-plan-w0',t.api.plan({actor:t.actor}),'plan view, week 0, VALID_PLAN');
 save('03-sessions',t.api.sessions({actor:t.actor}),'every week (12)');
 save('04-presentation-after-onboard',t.it.presentation({actor:t.actor}),'run sessions as prescribed + readings');
 save('05-status',t.api.status({actor:t.actor}),'status');
 save('P-week-plan',{ok:true,projections:PROJECTIONS_VERSION,...weekPlan(t.doc(),{today:t.api.plan({actor:t.actor}).view.today})},'projection weekPlan (GAP-07)');
 const w0=t.sessions(0),run1=w0.find(s=>s.sport==='RUN'),str1=w0.find(s=>s.sport==='STRENGTH');
 t.set(run1.date,'08:00');save('06-import-device-run',t.import([t.watch(run1)],{eligibility:ELIG(run1.date)}),'importActivities linked');
 t.set(run1.date,'20:00');save('07-athlete-run-form',t.weekly(run1.date,[t.form(run1)]),'athlete form for the same session');
 save('08-presentation-after-run',t.it.presentation({actor:t.actor}),'execution of the run');
 proj(t,'P-logged-two-voices','projection loggedEntries: one row, device + athlete voices');
 t.set(str1.date,'19:00');const f=t.form(str1);
 save('09-logStrength',t.api.logStrength({actor:t.actor,clientRequestId:t.rid('str'),expectedVersion:t.version(),eligibility:ELIG(str1.date),sessionId:f.sessionId,occurredOn:f.occurrenceDate,completed:true,minutes:f.actual.minutes,exercises:f.actual.exercises,response:f.response}),'logStrength');
 const missed=w0.filter(s=>s.date>str1.date).find(s=>s.sport==='RUN');
 if(missed){t.set(missed.date,'21:00');save('10-logRun-missed',t.api.logRun({actor:t.actor,clientRequestId:t.rid('miss'),expectedVersion:t.version(),eligibility:ELIG(missed.date),sessionId:missed.id,occurredOn:missed.date,completed:false,response:U}),'missed session');}
 const sun=addDays(t.doc().program.startDate,6);t.set(sun,'20:00');
 const remaining=t.sessions(0).filter(s=>t.live(s.id).length===0&&s.id!==missed?.id);
 save('11-weekly-review-w0',t.weekly(sun,remaining.map(s=>t.form(s))),'weekly review');
 save('12-presentation-after-w0',t.it.presentation({actor:t.actor}),'readings after week 0');
 save('13-plan-w1',t.api.plan({actor:t.actor}),'plan week 1');
 proj(t,'P-logged-after-w0','projection loggedEntries after week 0 (run + strength sets and loads)');
 const pref=save('14-setPreferences',t.api.setPreferences({actor:t.actor,clientRequestId:t.rid('pref'),expectedVersion:t.version(),volume:{RUN:'LOWER'}}),'preferences without a current screen: NEEDS_INPUT');
 if(pref.ok&&pref.view?.pending)save('15-decline',t.api.decline({actor:t.actor,decisionId:pref.view.pending.decisionId,expectedVersion:t.version()}),'decline');
 const d1=addDays(sun,2);t.set(d1,'09:00');
 save('16-notFeeling100-sign',t.api.notFeeling100({actor:t.actor,clientRequestId:t.rid('nf'),expectedVersion:t.version(),...notFeeling100WithSign(d1)}),'not 100% with a warning sign: hold');
 save('17-plan-blocked',t.api.plan({actor:t.actor}),'plan BLOCKED: no prescription');
 save('17b-presentation-blocked',t.it.presentation({actor:t.actor}),'presentation under a hold (descriptive readings, FND-HR5-03)');
 save('17c-sessions-blocked',t.api.sessions({actor:t.actor}),'every week under a hold');
 const d2=addDays(d1,3);t.set(d2,'09:00');
 save('18-declareReadiness',t.api.declareReadiness({actor:t.actor,clientRequestId:t.rid('rd'),expectedVersion:t.version(),...readiness(d2)}),'readiness declaration');
 save('19-plan-after-readiness',t.api.plan({actor:t.actor}),'RETURNING');
 const h=save('20-history',t.api.history({actor:t.actor}),'historyView');
 const dec=h.history?.decisions?.at(-1);if(dec)save('21-decision',t.api.decision({actor:t.actor,decisionId:dec.decisionId}),'decision detail');
 save('22-error-stale-version',t.api.setCoach({actor:t.actor,clientRequestId:t.rid('stale'),expectedVersion:0,profile:'BALANCED'}),'CONFLICT_STALE_VERSION');
 save('23-error-not-enrolled',athlete({newId,id:'ui-nobody'}).api.plan({actor:{athleteId:'ui-nobody'}}),'NOT_ENROLLED: NO_DATA');
 t.set(addDays(d2,1),'07:30');
 save('24-import-unlinked',t.import([{activityId:'HK-UNLINKED-1',activityType:'RUN',observedAt:addDays(d2,1)+'T07:20:00-03:00',actual:{completed:true,minutes:31,distanceKm:5.2,measurement:'GPS',gpsQuality:'OK'}}],{eligibility:ELIG(addDays(d2,1))}),'device run with no session');
 save('25-import-before-start',t.import([{activityId:'HK-OLD-1',activityType:'RUN',observedAt:'2026-01-10T07:20:00-03:00',actual:{completed:true,minutes:40,distanceKm:7}}]),'BEFORE_RECORD_START');
 save('26-history-final',t.api.history({actor:t.actor}),'historyView (the unlinked run is not in it)');
 proj(t,'P-logged-final','projection loggedEntries: the unlinked device run is an entry');}

// ---- 2. Plan-changing actions and safety paths (reconciliation capture-actions) ----
const mk=id=>{const t=athlete({newId,id,weeks:12});t.enroll();return t;};
{const t=mk('ui-sub');const s=t.sessions(0).find(x=>x.sport==='STRENGTH'),ex=s.prescription.exercises[0];t.set(addDays(s.date,-1),'10:00');
 save('actions-A1-substitution-preference',t.submit({kind:'EXERCISE_SUBSTITUTION',eligibility:ELIG(addDays(s.date,-1)),substitution:{exerciseId:ex.id,reason:'PREFERENCE'}}),'substitution, reason not one the engine reads');
 save('actions-A2-substitution-valid-reason',t.submit({kind:'EXERCISE_SUBSTITUTION',eligibility:ELIG(addDays(s.date,-1)),substitution:{exerciseId:ex.id,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),'substitution proposed');
 save('actions-A2b-plan-after-substitution',t.api.plan({actor:t.actor}),'PENDING_CONFIRMATION');
 const pend=t.api.plan({actor:t.actor}).view?.pending;if(pend)save('actions-A2c-accept-substitution',t.api.accept({actor:t.actor,decisionId:pend.decisionId,expectedVersion:t.version()}),'accept');
 save('actions-A3-substitution-pain',t.submit({kind:'EXERCISE_SUBSTITUTION',eligibility:ELIG(addDays(s.date,-1)),substitution:{exerciseId:ex.id,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',pain:true}}),'substitution with pain: human');}
{const t=mk('ui-avail');const s=t.sessions(0).find(x=>x.sport==='RUN'&&x.role!=='EASY')??t.sessions(0)[2];t.set(addDays(t.doc().program.startDate,0),'08:00');
 const r=save('actions-B1-unavailable-day',t.api.updateAvailability({actor:t.actor,clientRequestId:t.rid('ua'),expectedVersion:t.version(),eligibility:ELIG(addDays(t.doc().program.startDate,0)),unavailableDates:[s.date]}),'unavailable day: proposal');
 if(r.ok&&r.view?.pending){save('actions-B1b-presentation-pending',t.it.presentation({actor:t.actor}),'presentation with the pending proposal (its run sessions)');
  save('actions-B2-accept-unavailable',t.api.accept({actor:t.actor,decisionId:r.view.pending.decisionId,expectedVersion:t.version()}),'accept');}
 save('actions-B3-preferences-with-screen',t.api.setPreferences({actor:t.actor,clientRequestId:t.rid('pf'),expectedVersion:t.version(),eligibility:ELIG(addDays(t.doc().program.startDate,0)),difficulty:{RUN:'LOWER'}}),'preferences with a screen');}
{const t=mk('ui-stop');const s=t.sessions(0).find(x=>x.sport==='RUN');t.set(s.date,'19:00');
 const f=t.form(s);save('actions-C1-run-stop-symptom',t.weekly(s.date,[{...f,actual:{...f.actual,completed:false,minutes:12,stop:{reason:'SYMPTOM'}}}]),'planned run stopped for a symptom: screen REQUIRED');
 save('actions-C2-plan-after-symptom-stop',t.api.plan({actor:t.actor}),'plan after the stop (VALID_PLAN; startability must hold)');}
{const t=mk('ui-partial');const s=t.sessions(0).find(x=>x.sport==='RUN');t.set(s.date,'19:00');
 const f=t.form(s);save('actions-C3-run-partial-time',t.weekly(s.date,[{...f,actual:{completed:true,minutes:Math.round((f.actual.minutes??40)/2),rpe:4}}]),'partial run, time only');
 save('actions-C4-presentation-after-partial',t.it.presentation({actor:t.actor}),'no distance invented');}
{const t=mk('ui-nf');const d=addDays(t.doc().program.startDate,1);t.set(d,'08:00');
 save('actions-D1-notFeeling100-no-sign',t.api.notFeeling100({actor:t.actor,clientRequestId:t.rid('nf'),expectedVersion:t.version(),eligibility:ELIG(d),wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:{...NO},intent:'REDUCE_LIGHT',days:2}}),'not 100%, every sign answered no');
 save('actions-D2-plan-after-nf',t.api.plan({actor:t.actor}),'plan after');
 save('actions-D3-notFeeling100-no-screen',t.api.notFeeling100({actor:t.actor,clientRequestId:t.rid('nf2'),expectedVersion:t.version(),eligibility:ELIG(d),wellbeing:{condition:'UNUSUAL_FATIGUE',intent:'REDUCE_LIGHT',days:2}}),'not 100% without the signs: ASK');}
{const t=mk('ui-break');const d=addDays(t.doc().program.startDate,2);t.set(d,'08:00');
 save('actions-E1-break-nonclinical',t.api.reportBreak({actor:t.actor,clientRequestId:t.rid('br'),expectedVersion:t.version(),eligibility:ELIG(d),interruption:{reasonCategory:'TRAVEL',nonclinical:true,startDate:d,endDate:addDays(d,6)}}),'break, nonclinical');
 save('actions-E2-break-clinical',t.api.reportBreak({actor:t.actor,clientRequestId:t.rid('br2'),expectedVersion:t.version(),eligibility:ELIG(d),interruption:{reasonCategory:'ILLNESS',nonclinical:false,startDate:d,endDate:addDays(d,6)}}),'break, clinical: human');}
{const t=mk('ui-erase');const d=addDays(t.doc().program.startDate,1);t.set(d,'08:00');
 save('actions-F1-notFeeling100-sign',t.api.notFeeling100({actor:t.actor,clientRequestId:t.rid('nf'),expectedVersion:t.version(),eligibility:ELIG(d),wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO,feverOrChills:true},intent:'REST',days:3}}),'not 100% with fever: hold');
 const ids=t.api.history({actor:t.actor}).history.facts.map(f=>f.eventId);
 save('actions-F2-eraseHealthFacts',t.api.eraseHealthFacts({actor:t.actor,eventIds:ids,expectedVersion:t.version()}),'erase health facts');
 save('actions-F3-plan-after-erase',t.api.plan({actor:t.actor}),'an erasure is never readiness: still BLOCKED');
 save('actions-F4-eraseAccount',t.api.eraseAccount({actor:t.actor}),'erase account');
 save('actions-F5-plan-after-account-erase',t.api.plan({actor:t.actor}),'GONE: NO_DATA');}

// ---- 3. Unplanned reports and a contested distance (reconciliation capture-unplanned, GAP-12 rule) ----
{const t=athlete({newId,id:'ui-avulsa',weeks:12});t.enroll();
 const s=t.sessions(0).find(x=>x.sport==='RUN');t.set(s.date,'08:00');
 save('unplanned-4-device-run',t.import([t.watch(s,{actual:{distanceKm:12.5}})],{eligibility:ELIG(s.date)}),'device run 12.5 km');
 t.set(s.date,'20:00');
 save('unplanned-5-athlete-contests-distance',t.weekly(s.date,[{...t.form(s),actual:{...t.form(s).actual,declared:{distanceKm:7,reason:'SIGNAL_LOSS'}}}]),'athlete contests the measured distance');
 const d=addDays(t.doc().program.startDate,5);t.set(d,'19:00');
 // Without observedAt: same local day and same operation second -> the engine keeps only the first (GAP-12). The answers still list both.
 const a1=save('unplanned-1-run-no-observedAt',t.weekly(d,[{occurrenceDate:d,actual:{completed:true,minutes:30,sport:'RUN',rpe:3},response:U}]),'unplanned run, no observedAt');
 const a2=save('unplanned-2-strength-no-observedAt',t.weekly(d,[{occurrenceDate:d,actual:{completed:true,minutes:35,sport:'STRENGTH',exercises:[{id:'goblet-squat',sets:[{reps:8,load:{value:16,unit:'KG',convention:'SINGLE_IMPLEMENT'},rir:3}]}]},response:U}]),'unplanned strength right after, no observedAt: answered recorded, NOT kept');
 // With observedAt (the contract's rule for every unplanned report): both kept.
 const d2=addDays(d,1);t.set(d2,'21:00');
 const a3=save('unplanned-3-run-observedAt',t.weekly(d2,[{occurrenceDate:d2,observedAt:d2+'T18:10:00-03:00',actual:{completed:true,minutes:30,sport:'RUN',rpe:3},response:U}]),'unplanned run with observedAt');
 const a4=save('unplanned-6-strength-observedAt',t.weekly(d2,[{occurrenceDate:d2,observedAt:d2+'T20:40:00-03:00',actual:{completed:true,minutes:35,sport:'STRENGTH',exercises:[{id:'goblet-squat',sets:[{reps:8,load:{value:16,unit:'KG',convention:'SINGLE_IMPLEMENT'},rir:3}]}]},response:U}]),'unplanned strength with observedAt: kept');
 // QRE-ABC-01: the device recorded a completed run; the athlete reports a stop for a symptom on the same session.
 {const c=athlete({newId,id:'ui-conflict',weeks:12});c.enroll();const cs=c.sessions(0).find(x=>x.sport==='RUN');c.set(cs.date,'08:00');
  c.import([c.watch(cs)],{eligibility:ELIG(cs.date)});c.set(cs.date,'20:00');const cf=c.form(cs);
  save('conflict-1-athlete-stop-against-device',c.weekly(cs.date,[{...cf,actual:{completed:false,minutes:5,rpe:9,stop:{reason:'SYMPTOM'}},response:{...cf.response,recovery:'ADVERSE'}}]),'athlete stop for a symptom against a completed device run: screen REQUIRED');
  proj(c,'P-logged-conflict','projection: both voices, the athlete stop visible');}
 save('unplanned-7-history',t.api.history({actor:t.actor}),'historyView');
 save('unplanned-8-presentation',t.it.presentation({actor:t.actor}),'presentation');
 const e=proj(t,'P-logged-unplanned','projection loggedEntries: unplanned run and strength, a contested distance');
 save('P-kept-check',{ok:true,projections:PROJECTIONS_VERSION,checks:[['unplanned-1',a1],['unplanned-2',a2],['unplanned-3',a3],['unplanned-6',a4]].map(([n,r])=>({answer:n,recorded:r.recorded,kept:r.recorded.map(id=>keepsReport(e,id))}))},'GAP-12: recorded versus kept, per answer');}

// ---- 4. Five zones (V1HR5R capture-hr5r) and the heart-rate profile operations ----
const STRAP=bpm=>({heartRate:{maxBpm:bpm,sensor:'CHEST_STRAP'}});
const R10=(x={})=>({id:'race-10k',...result('10K',3000,'2026-11-01',x)});
const LAB=bpm=>({id:'lab-1',kind:'LAB_TEST',date:'2026-10-20',rpe:9,tolerated:true,lab:{protocol:'Incremental treadmill test',source:'Laboratory report',modality:'TREADMILL_RUN',values:[{name:'First measured anchor',value:150,unit:'bpm'}]},heartRate:{maxBpm:bpm,sensor:'ECG'}});
const cases=[['hr5r-age30',[R10()],30],['hr5r-strap-above',[R10(STRAP(186))],40],['hr5r-strap-below',[R10(STRAP(186))],30],['hr5r-lab',[R10(),LAB(190)],25],
 ['hr5r-conflict',[R10(STRAP(192)),LAB(180)],40],['hr5r-noage',[R10()],null],['hr5r-optical',[R10({heartRate:{maxBpm:176,sensor:'OPTICAL'}})],30],['hr5r-declared',[R10()],30]];
for(const [name,anchors,age] of cases){
 const t=athlete({newId,id:name,weeks:8}),i=athleteA({weeks:8,id:name});i.athlete.performanceAnchors=anchors;if(age===null){delete i.athlete.ageYears;i.athlete.ageEligible=true;}else i.athlete.ageYears=age;
 const e=t.it.enroll({actor:t.actor,intake:i,consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true}});if(!e.ok)throw new Error(name+' '+e.error.code);
 const pres=save(name+'-presentation',t.it.presentation({actor:t.actor}),'five-zone reading: '+name);
 if(name==='hr5r-age30'){
  // Time in zone: the engine's classifier over a synthetic strap series, under the gate (SSCTR C10 not reviewed), and with no series.
  const series={sensor:'CHEST_STRAP',source:'SYNTHETIC',samples:Array.from({length:61},(_,k)=>({t:k*30,bpm:k<20?120:k<40?150:175}))};
  save('hr5r-time-in-zone-gated',{ok:true,projections:PROJECTIONS_VERSION,timeInZones:timeInZones(pres.readings,series,{durationSeconds:1800})},'time in zone: gated until the series channel is reviewed');
  save('hr5r-time-in-zone-no-series',{ok:true,projections:PROJECTIONS_VERSION,timeInZones:timeInZones(pres.readings,null,{})},'time in zone without a series');
  const day=addDays(t.doc().program.startDate,2);t.set(day);
  const r=t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(day,{pain:true}),observations:[]});if(r.status!=='CLINICAL_HUMAN_REQUIRED')throw new Error('hold '+r.status);
  const hold=save('hr5r-hold-presentation',t.it.presentation({actor:t.actor}),'five zones withheld under a hold');
  save('hr5r-time-in-zone-hold',{ok:true,projections:PROJECTIONS_VERSION,timeInZones:timeInZones(hold.readings,series,{durationSeconds:1800})},'time in zone under a hold');}
 if(name==='hr5r-declared'){
  const v=()=>t.it.read({actor:t.actor}).doc.version;
  let r=t.api.setHeartRateProfile({actor:t.actor,clientRequestId:'hr-1',expectedVersion:v(),heartRateProfile:{maxHeartRateBpm:195}});if(!r.ok)throw new Error('declared '+r.error.code);save('hr5r-declared-answer',r,'setHeartRateProfile (api.mjs): declared 195');
  save('hr5r-declared-replay',t.api.setHeartRateProfile({actor:t.actor,clientRequestId:'hr-1',expectedVersion:v(),heartRateProfile:{maxHeartRateBpm:195}}),'the same request id again: replayed');
  save('hr5r-declared-presentation',t.it.presentation({actor:t.actor}),'zones from the declared maximum');
  r=t.api.setHeartRateProfile({actor:t.actor,clientRequestId:'hr-2',expectedVersion:v(),heartRateProfile:{zoneUpperBpm:[130,150,165,180]}});if(!r.ok)throw new Error('custom '+r.error.code);
  save('hr5r-custom-presentation',t.it.presentation({actor:t.actor}),'custom limits');
  save('hr5r-invalid-answer',t.api.setHeartRateProfile({actor:t.actor,clientRequestId:'hr-3',expectedVersion:v(),heartRateProfile:{zoneUpperBpm:[150,140,165,180]}}),'limits out of order: INVALID_REQUEST with fields');
  save('hr5r-stale-answer',t.api.setHeartRateProfile({actor:t.actor,clientRequestId:'hr-4',expectedVersion:v()-1,heartRateProfile:{maxHeartRateBpm:190}}),'stale version: CONFLICT_STALE_VERSION');
  save('hr5r-reuse-answer',t.api.setHeartRateProfile({actor:t.actor,clientRequestId:'hr-1',expectedVersion:v(),heartRateProfile:{maxHeartRateBpm:191}}),'request id reused for another profile: CONFLICT_IDEMPOTENCY_KEY');
  save('hr5r-carried',t.it.carried({actor:t.actor}),'carried records (heartRateProfileRecord)');
  // QRE-ABC-07: set, revoke, then erase: the erasure is never held back by consent (and erases real rows).
  save('hr5r-consent-revoked',t.api.setConsent({actor:t.actor,purpose:'COACHING',granted:false,expectedVersion:v()}),'coaching consent revoked');
  save('hr5r-set-without-consent',t.api.setHeartRateProfile({actor:t.actor,clientRequestId:'hr-6',expectedVersion:v(),heartRateProfile:{maxHeartRateBpm:190}}),'set without coaching consent: CONSENT_REQUIRED');
  save('hr5r-erase-without-consent',t.api.eraseHeartRateProfile({actor:t.actor,clientRequestId:'hr-7',expectedVersion:v()}),'erase without consent: the declared maximum and the limits are erased');
  save('hr5r-after-erase-presentation',t.it.presentation({actor:t.actor}),'after the erasure: back to the age estimate');
  save('hr5r-consent-granted',t.api.setConsent({actor:t.actor,purpose:'COACHING',granted:true,expectedVersion:v()}),'coaching consent granted again');
  if(!t.api.setHeartRateProfile({actor:t.actor,clientRequestId:'hr-8',expectedVersion:v(),heartRateProfile:{maxHeartRateBpm:192}}).ok)throw new Error('re-set');
  save('hr5r-erase-answer',t.api.eraseHeartRateProfile({actor:t.actor,clientRequestId:'hr-9',expectedVersion:v()}),'eraseHeartRateProfile with consent');}
}

// ---- 5. Special population at onboarding (CHG-UI-2 2.7, GAP-02) ----
for(const [name,sp] of [['special-pregnancy',['PREGNANCY']],['special-postpartum',['POSTPARTUM']],['special-none',[]]]){
 const t=athlete({newId,id:name,weeks:8}),i=athleteA({weeks:8,id:name});i.athlete.specialPopulation=sp;
 const e=save(name+'-onboard',t.it.enroll({actor:t.actor,intake:i,consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true}}),'enroll with specialPopulation '+JSON.stringify(sp));
 save(name+'-plan',t.api.plan({actor:t.actor}),'plan after that enrolment');
 if(name==='special-pregnancy')save(name+'-sessions',t.api.sessions({actor:t.actor}),'every week after that enrolment');}

// ---- 6. The warning-sign sets (CHG-UI-2 2.4, GAP-03) ----
save('P-warning-sign-sets',{ok:true,projections:PROJECTIONS_VERSION,sets:warningSignSets()},'the signs the engine asks, per condition (9/13/15) and for readiness (15)');

// ---- 7. CCP-ONB-1 (#109): the onboarding fields the engine reads, and the readings of the plan-ready screen (Figma 31) ----
// The intakes are athlete A's (the shape the Swift contract encodes) with the new optional fields; nothing else changes.
{const onb=(name,mut,what,reads)=>{const t=athlete({newId,id:name,weeks:8}),i=athleteA({weeks:8,id:name});mut(i);
  save(name+'-onboard',t.it.enroll({actor:t.actor,intake:i,consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true}}),'enroll: '+what);
  if(reads.includes('weekPlan'))save(name+'-week-plan',{ok:true,projections:PROJECTIONS_VERSION,...weekPlan(t.doc(),{today:t.api.plan({actor:t.actor}).view.today})},'projection weekPlan: '+what);
  if(reads.includes('presentation'))save(name+'-presentation',t.it.presentation({actor:t.actor}),'presentation: '+what);
  if(reads.includes('plan'))save(name+'-plan',t.api.plan({actor:t.actor}),'plan view: '+what);};
 const marathon=i=>{i.weeks=16;i.athlete.goals.run={kind:'RACE',event:{kind:'MARATHON',date:'2027-02-28'}};};
 onb('onb-marathon-preparatory',marathon,'marathon goal, criteria not met (preparatory plan)',['weekPlan']);
 onb('onb-marathon-block',i=>{marathon(i);i.athlete.recent={strengthDaysPerWeek:2,runDaysPerWeek:5,runMinutesPerWeek:300,longestRunMinutes:120};i.schedule.runDays=[0,1,3,5,6];i.schedule.longRunMinutes=180;},'marathon goal, every criterion met (block)',['weekPlan']);
 onb('onb-time-goal',i=>{i.athlete.goals.run.event.timeGoalMinutes=44.5;},'10K with a 44:30 time goal (readings.runCalibration.goal)',['presentation']);
 onb('onb-every-field',i=>{i.athlete.knownExercises=[{id:'back-squat',sets:4,reps:5,rir:3,load:{value:90,unit:'KG',convention:'TOTAL'}}];i.athlete.coaching={profile:'CONSERVATIVE'};
  i.schedule.temporaryPreference='RUN';delete i.schedule.runTurn;delete i.schedule.strengthTurn;i.schedule.sameTurnConfirmed=true;i.athlete.performanceAnchors[0].conditions=[];},
  'known load, coach, priority, shifts not answered with the shared day confirmed, normal conditions',['plan']);
 onb('onb-only-strength',i=>{i.athlete.goals={run:{kind:'NONE'},strength:'STRENGTH'};delete i.athlete.runTrainingMonths;i.athlete.recent={strengthDaysPerWeek:2};i.athlete.performanceAnchors=[];
  i.schedule={strengthDays:[1,3,5],strengthMinutes:45,runDays:[],strengthTurn:'PM'};delete i.weeks;},'"Só força": no run field, no plan length',['plan']);}

fs.writeFileSync(path.join(OUT,'INDEX.json'),JSON.stringify({generator:'ios/Packages/CoachingPresentation/Facade/capture-fixtures.mjs',projections:PROJECTIONS_VERSION,files:index},null,1)+'\n');
console.log(JSON.stringify({out:OUT,files:index.length}));
