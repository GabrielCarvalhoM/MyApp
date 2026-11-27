// RepMile CoachingHost (front A), A handoff §7 test 3: the shared fixtures of ios/Packages/CoachingPresentation, reproduced through THIS
// package's app facade (facade/entry.mjs, the code the production bundle links) instead of the raw boundary. It ports the journeys of
// CoachingPresentation/Facade/capture-fixtures.mjs step by step (same athletes, clock, key and id sequence), but every boundary call is a
// facade call with JSON strings, exactly as the Swift host makes it:
//   - the api.mjs form helpers the capture used (logStrength, logRun, notFeeling100, declareReadiness, setPreferences, setCoach,
//     updateAvailability, reportBreak) become `submit` with the very review api.mjs builds (FND-ABC-03: the host never calls the helpers);
//   - raw `integration.*` answers (enroll, submit) are compared after removing only the keys the facade adds (the view, as api.mjs adds it,
//     and kept/notKept).
// Output: every saved answer compared byte for byte with the committed fixture, and the facade call script (every call and its exact answer)
// written to Tests/CoachingHostTests/Fixtures/facade-calls.json, which the Swift tests replay in JavaScriptCore (macOS and iPhone) and compare
// byte for byte again. Run: node ios/Packages/CoachingHost/facade/test/reproduce-fixtures.mjs [--check]  (--check: the script must not change)
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {athleteA,ELIG,addDays,U,notFeeling100WithSign,readiness,reportOf,liveSessions,at} from '../../../../../CoachingCore/test/v1int-helpers.mjs';
import {result} from '../../../../../CoachingCore/test/v1rc-helpers.mjs';
import {CONDITIONS} from '../../../../../CoachingCore/src/v1-f08.mjs';
import {keepsReport,PROJECTIONS_VERSION} from '../../../CoachingPresentation/Facade/app-projections.mjs';
import {api as F} from '../entry.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url)),PKG=path.resolve(HERE,'..','..');
const FIX=path.resolve(PKG,'..','CoachingPresentation','Tests','CoachingPresentationTests','Fixtures');
const OUT=path.join(PKG,'Tests','CoachingHostTests','Fixtures','facade-calls.json');
const KEY='v1int-synthetic-key',START='2026-11-14T12:00:00-03:00';

// ---- the host's side, in Node: a memory store with the native store's signature, the test mode, the call recorder ----
const docs=new Map(),tombs=new Map();
globalThis.__chstore={load:id=>docs.get(id)??null,raw:id=>docs.get(id)??null,
 commit:(id,v,none,text)=>{const cur=docs.has(id)?JSON.parse(docs.get(id)).version:null;const want=none?null:v;if(cur!==want)return JSON.stringify({ok:false,conflict:true,version:cur});docs.set(id,text);return '{"ok":true}';},
 remove:id=>{docs.delete(id);},tombstone:(s,t)=>{tombs.set(s,t);return null;},tombstoneOf:s=>tombs.get(s)??null,setRaw:(id,t)=>{docs.set(id,t);}};
globalThis.__chTestMode=true;globalThis.__chIdSeq=0;
const calls=[],compared=[];
const call=(fn,...a)=>{const s=F[fn](...a);if(typeof s!=='string')throw new Error(fn+' returned no string');calls.push({fn,a,out:s});return {i:calls.length-1,v:JSON.parse(s)};};

let current=null;
/** One synthetic athlete over the facade: the capture's `athlete()` with the same names, every boundary call a facade call. */
function athlete({id,weeks=8}){
 const t={id,clock:Date.parse(START),weeks};
 t.open=()=>{if(current!==t){call('open',JSON.stringify({athleteId:id,keyRef:KEY,store:'native',anchor:'none',ids:'shared'}));current=t;}};
 t.f=(fn,args)=>{t.open();return args===undefined?call(fn,t.clock):call(fn,JSON.stringify(args),t.clock);};
 t.version=()=>t.f('version').v.version;
 t.doc=()=>JSON.parse(docs.get(id));                       // the helpers read the program as the record holds it (test side only)
 t.env=()=>({program:t.doc().program,presentation:{runSessions:t.f('presentation').v.inForce??{}}});
 t.sessions=w=>liveSessions(t.env(),w);
 t.set=(day,time='20:00')=>{t.clock=Date.parse(at(day,time));};
 let n=0;t.rid=tag=>`${tag??'rq'}-${++n}`;
 const DEVICE_ONLY=['gpsQuality','measurement'],ATHLETE_ONLY=['conditions','walkBreaks','stop','rpe'];
 const drop=(o,keys)=>Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));
 t.form=(s,{actual={},response={}}={})=>{const r=reportOf(t.env(),s);return {sessionId:r.sessionId,occurrenceDate:r.occurrenceDate,actual:{...drop(r.actual,DEVICE_ONLY),...actual},response:{...r.response,...response}};};
 t.watch=(s,{activityId=`HK-${s.id}`,endTime='07:45',actual={}}={})=>{const r=reportOf(t.env(),s);return {activityId,activityType:'RUN',sessionId:s.id,observedAt:at(s.date,endTime),actual:{...drop(r.actual,ATHLETE_ONLY),...actual}};};
 // raw integration.enroll / integration.submit, through the facade
 // the capture enrolled with no request id (integration.enroll accepts that); the app always sends one
 t.enroll=(intake=athleteA({weeks,id}))=>t.f('onboard',{intake,consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true}});
 t.submit=(review,{rid=t.rid(),expectedVersion=t.version()}={})=>t.f('submit',{review,clientRequestId:rid,expectedVersion});
 t.weekly=(day,observations,extra={})=>t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(day),observations,...extra});
 t.screen=eligibility=>t.submit({kind:'WEEKLY_REVIEW',eligibility});
 t.import=(activities,{rid=t.rid('hk'),expectedVersion,eligibility}={})=>{if(eligibility){const s=t.screen(eligibility);if(!s.v.ok)return s;}
  return t.f('importActivities',{activities,clientRequestId:rid,expectedVersion:expectedVersion??t.version()});};
 t.live=sid=>t.f('loggedEntries').v.entries.filter(o=>o.sessionId===sid&&o.superseded!==true);
 // api.mjs form helpers -> the review api.mjs builds, sent by `submit` (api.mjs `observation` and `submit`, restated here for the test only)
 const obs=({sessionId,occurredOn,observedAt,completed,minutes,exercises,response})=>({sessionId,occurrenceDate:occurredOn,...(typeof observedAt==='string'?{observedAt}:{}),actual:{completed:completed===true,...(Number.isFinite(minutes)?{minutes}:{}),...(Array.isArray(exercises)?{exercises}:{})},response:response&&typeof response==='object'?response:{}});
 const form=(req,review)=>t.f('submit',{review:{...review,...(req.eligibility?{eligibility:req.eligibility}:{})},clientRequestId:req.clientRequestId,expectedVersion:req.expectedVersion});
 t.api={
  plan:()=>t.f('plan',{}),sessions:()=>t.f('sessions'),history:()=>t.f('history'),decision:({decisionId})=>t.f('decision',{decisionId}),
  logStrength:req=>form(req,{kind:req.completed===false?'MISSED_SESSION':'WEEKLY_REVIEW',observations:[obs(req)],...(req.completed===false&&typeof req.sessionId==='string'?{targetSessionId:req.sessionId}:{})}),
  logRun:req=>form(req,{kind:req.completed===false?'MISSED_SESSION':'WEEKLY_REVIEW',observations:[obs(req)],...(req.completed===false&&typeof req.sessionId==='string'?{targetSessionId:req.sessionId}:{})}),
  notFeeling100:req=>form(req,{kind:'NOT_FEELING_100',wellbeing:req.wellbeing,...(req.reports?{observations:req.reports.map(obs)}:{})}),
  declareReadiness:req=>form(req,{kind:'READINESS_DECLARATION',readiness:req.readiness,...(req.reports?{observations:req.reports.map(obs)}:{})}),
  reportBreak:req=>form(req,{kind:'RETURN_AFTER_PAUSE',interruption:req.interruption}),
  updateAvailability:req=>form(req,req.unavailableDates?{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:req.unavailableDates}}:{kind:'SCHEDULE_CHANGE',changes:req.changes}),
  setPreferences:req=>form(req,{kind:'PREFERENCE_CHANGE',changes:{coaching:{...(req.volume?{volume:req.volume}:{}),...(req.difficulty?{difficulty:req.difficulty}:{})}}}),
  setCoach:req=>form(req,{kind:'PREFERENCE_CHANGE',changes:{coaching:{profile:req.profile}}}),
  accept:({decisionId,expectedVersion})=>t.f('accept',{decisionId,expectedVersion}),decline:({decisionId,expectedVersion})=>t.f('decline',{decisionId,expectedVersion}),
  setHeartRateProfile:({clientRequestId,expectedVersion,heartRateProfile})=>t.f('setHeartRateProfile',{clientRequestId,expectedVersion,heartRateProfile}),
  eraseHeartRateProfile:({clientRequestId,expectedVersion})=>t.f('eraseHeartRateProfile',{clientRequestId,expectedVersion}),
  setConsent:({purpose,granted,expectedVersion})=>t.f('setConsent',{purpose,granted,expectedVersion}),
  eraseHealthFacts:({eventIds,expectedVersion})=>t.f('eraseHealthFacts',{eventIds,expectedVersion}),eraseAccount:()=>t.f('eraseAccount')};
 t.presentation=()=>t.f('presentation');
 return t;
}

// ---- the comparison (byte for byte against the committed fixture) ----
const FACADE_KEYS={raw:['view','viewError','state','kept','notKept'],api:['kept','notKept'],none:[]};
const strip=(v,keys)=>keys.length?Object.fromEntries(Object.entries(v).filter(([k])=>!keys.includes(k))):v;
const bytesOf=x=>JSON.stringify(x,null,1)+'\n';
/** `kind` says which keys the facade added to what the capture saved: raw (integration.*), api (api.mjs), none (same call). */
function save(name,r,kind='none'){
 const want=fs.readFileSync(path.join(FIX,name+'.json'),'utf8'),got=bytesOf(strip(r.v,FACADE_KEYS[kind]));
 // A name saved twice (hr5r-declared-presentation: the loop's, then the declared branch's) is the later file, as the capture overwrote it.
 const k=compared.findIndex(c=>c.file===name+'.json');if(k>=0)compared.splice(k,1);
 compared.push({file:name+'.json',call:r.i,strip:FACADE_KEYS[kind],equal:got===want});return r.v;
}
/** A fixture the capture built around facade answers (a wrapper object): `parts` are the calls whose answers it holds. */
function saveBuilt(name,x,parts){const want=fs.readFileSync(path.join(FIX,name+'.json'),'utf8');compared.push({file:name+'.json',calls:parts,built:true,equal:bytesOf(x)===want});return x;}
const notReproduced=[];
const proj=(t,name)=>{const r=t.f('loggedEntries');save(name,r);return r.v.entries;};
const NO={feverOrChills:false,chestPainPressureOrTightness:false,breathlessAtRest:false,palpitationsAtRest:false,faintingOrDizziness:false,painThatChangesMovement:false,swelling:false,injuryFromFallOrImpact:false,gettingWorse:false,bodyWideAches:false,exhaustionAtRest:false,vomitingDiarrhoeaNauseaOrAbdominalPain:false,moderateOrSevereCough:false,severeHeadache:false,severeNoseOrThroat:false};

// ---- 1. The main journey ----
{const t=athlete({id:'ui-probe',weeks:12});
 save('01-onboard',t.enroll(),'raw');
 save('02-plan-w0',t.api.plan());
 save('03-sessions',t.api.sessions());
 save('04-presentation-after-onboard',t.presentation());
 save('05-status',t.f('status'));
 save('P-week-plan',t.f('weekPlan'));
 const w0=t.sessions(0),run1=w0.find(s=>s.sport==='RUN'),str1=w0.find(s=>s.sport==='STRENGTH');
 t.set(run1.date,'08:00');save('06-import-device-run',t.import([t.watch(run1)],{eligibility:ELIG(run1.date)}));
 t.set(run1.date,'20:00');save('07-athlete-run-form',t.weekly(run1.date,[t.form(run1)]),'raw');
 save('08-presentation-after-run',t.presentation());
 proj(t,'P-logged-two-voices');
 t.set(str1.date,'19:00');const f=t.form(str1);
 save('09-logStrength',t.api.logStrength({clientRequestId:t.rid('str'),expectedVersion:t.version(),eligibility:ELIG(str1.date),sessionId:f.sessionId,occurredOn:f.occurrenceDate,completed:true,minutes:f.actual.minutes,exercises:f.actual.exercises,response:f.response}),'api');
 const missed=w0.filter(s=>s.date>str1.date).find(s=>s.sport==='RUN');
 if(missed){t.set(missed.date,'21:00');save('10-logRun-missed',t.api.logRun({clientRequestId:t.rid('miss'),expectedVersion:t.version(),eligibility:ELIG(missed.date),sessionId:missed.id,occurredOn:missed.date,completed:false,response:U}),'api');}
 const sun=addDays(t.doc().program.startDate,6);t.set(sun,'20:00');
 const remaining=t.sessions(0).filter(s=>t.live(s.id).length===0&&s.id!==missed?.id);
 save('11-weekly-review-w0',t.weekly(sun,remaining.map(s=>t.form(s))),'raw');
 save('12-presentation-after-w0',t.presentation());
 save('13-plan-w1',t.api.plan());
 proj(t,'P-logged-after-w0');
 const pref=save('14-setPreferences',t.api.setPreferences({clientRequestId:t.rid('pref'),expectedVersion:t.version(),volume:{RUN:'LOWER'}}),'api');
 if(pref.ok&&pref.view?.pending)save('15-decline',t.api.decline({decisionId:pref.view.pending.decisionId,expectedVersion:t.version()}));
 const d1=addDays(sun,2);t.set(d1,'09:00');
 save('16-notFeeling100-sign',t.api.notFeeling100({clientRequestId:t.rid('nf'),expectedVersion:t.version(),...notFeeling100WithSign(d1)}),'api');
 save('17-plan-blocked',t.api.plan());
 save('17b-presentation-blocked',t.presentation());
 save('17c-sessions-blocked',t.api.sessions());
 const d2=addDays(d1,3);t.set(d2,'09:00');
 save('18-declareReadiness',t.api.declareReadiness({clientRequestId:t.rid('rd'),expectedVersion:t.version(),...readiness(d2)}),'api');
 save('19-plan-after-readiness',t.api.plan());
 const h=save('20-history',t.api.history());
 const dec=h.history?.decisions?.at(-1);if(dec)save('21-decision',t.api.decision({decisionId:dec.decisionId}));
 save('22-error-stale-version',t.api.setCoach({clientRequestId:t.rid('stale'),expectedVersion:0,profile:'BALANCED'}),'api');
 {const nobody=athlete({id:'ui-nobody'});save('23-error-not-enrolled',nobody.api.plan());}
 t.set(addDays(d2,1),'07:30');
 save('24-import-unlinked',t.import([{activityId:'HK-UNLINKED-1',activityType:'RUN',observedAt:addDays(d2,1)+'T07:20:00-03:00',actual:{completed:true,minutes:31,distanceKm:5.2,measurement:'GPS',gpsQuality:'OK'}}],{eligibility:ELIG(addDays(d2,1))}));
 save('25-import-before-start',t.import([{activityId:'HK-OLD-1',activityType:'RUN',observedAt:'2026-01-10T07:20:00-03:00',actual:{completed:true,minutes:40,distanceKm:7}}]));
 save('26-history-final',t.api.history());
 proj(t,'P-logged-final');}

// ---- 2. Plan-changing actions and safety paths ----
const mk=id=>{const t=athlete({id,weeks:12});t.enroll();return t;};
{const t=mk('ui-sub');const s=t.sessions(0).find(x=>x.sport==='STRENGTH'),ex=s.prescription.exercises[0];t.set(addDays(s.date,-1),'10:00');
 save('actions-A1-substitution-preference',t.submit({kind:'EXERCISE_SUBSTITUTION',eligibility:ELIG(addDays(s.date,-1)),substitution:{exerciseId:ex.id,reason:'PREFERENCE'}}),'raw');
 save('actions-A2-substitution-valid-reason',t.submit({kind:'EXERCISE_SUBSTITUTION',eligibility:ELIG(addDays(s.date,-1)),substitution:{exerciseId:ex.id,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),'raw');
 save('actions-A2b-plan-after-substitution',t.api.plan());
 const pend=t.api.plan().v.view?.pending;if(pend)save('actions-A2c-accept-substitution',t.api.accept({decisionId:pend.decisionId,expectedVersion:t.version()}));
 save('actions-A3-substitution-pain',t.submit({kind:'EXERCISE_SUBSTITUTION',eligibility:ELIG(addDays(s.date,-1)),substitution:{exerciseId:ex.id,reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',pain:true}}),'raw');}
{const t=mk('ui-avail');const s=t.sessions(0).find(x=>x.sport==='RUN'&&x.role!=='EASY')??t.sessions(0)[2];t.set(addDays(t.doc().program.startDate,0),'08:00');
 const r=save('actions-B1-unavailable-day',t.api.updateAvailability({clientRequestId:t.rid('ua'),expectedVersion:t.version(),eligibility:ELIG(addDays(t.doc().program.startDate,0)),unavailableDates:[s.date]}),'api');
 if(r.ok&&r.view?.pending){save('actions-B1b-presentation-pending',t.presentation());
  // CHG-UI-2 2.3 (front A): the proposal's strength rows too, in the view's week format (not a shared fixture: CCP-A-01).
  t.f('pendingWeek',{});
  save('actions-B2-accept-unavailable',t.api.accept({decisionId:r.view.pending.decisionId,expectedVersion:t.version()}));}
 save('actions-B3-preferences-with-screen',t.api.setPreferences({clientRequestId:t.rid('pf'),expectedVersion:t.version(),eligibility:ELIG(addDays(t.doc().program.startDate,0)),difficulty:{RUN:'LOWER'}}),'api');}
{const t=mk('ui-stop');const s=t.sessions(0).find(x=>x.sport==='RUN');t.set(s.date,'19:00');
 const f=t.form(s);save('actions-C1-run-stop-symptom',t.weekly(s.date,[{...f,actual:{...f.actual,completed:false,minutes:12,stop:{reason:'SYMPTOM'}}}]),'raw');
 save('actions-C2-plan-after-symptom-stop',t.api.plan());}
{const t=mk('ui-partial');const s=t.sessions(0).find(x=>x.sport==='RUN');t.set(s.date,'19:00');
 const f=t.form(s);save('actions-C3-run-partial-time',t.weekly(s.date,[{...f,actual:{completed:true,minutes:Math.round((f.actual.minutes??40)/2),rpe:4}}]),'raw');
 save('actions-C4-presentation-after-partial',t.presentation());}
{const t=mk('ui-nf');const d=addDays(t.doc().program.startDate,1);t.set(d,'08:00');
 save('actions-D1-notFeeling100-no-sign',t.api.notFeeling100({clientRequestId:t.rid('nf'),expectedVersion:t.version(),eligibility:ELIG(d),wellbeing:{condition:'UNUSUAL_FATIGUE',warningSigns:{...NO},intent:'REDUCE_LIGHT',days:2}}),'api');
 save('actions-D2-plan-after-nf',t.api.plan());
 save('actions-D3-notFeeling100-no-screen',t.api.notFeeling100({clientRequestId:t.rid('nf2'),expectedVersion:t.version(),eligibility:ELIG(d),wellbeing:{condition:'UNUSUAL_FATIGUE',intent:'REDUCE_LIGHT',days:2}}),'api');}
{const t=mk('ui-break');const d=addDays(t.doc().program.startDate,2);t.set(d,'08:00');
 save('actions-E1-break-nonclinical',t.api.reportBreak({clientRequestId:t.rid('br'),expectedVersion:t.version(),eligibility:ELIG(d),interruption:{reasonCategory:'TRAVEL',nonclinical:true,startDate:d,endDate:addDays(d,6)}}),'api');
 save('actions-E2-break-clinical',t.api.reportBreak({clientRequestId:t.rid('br2'),expectedVersion:t.version(),eligibility:ELIG(d),interruption:{reasonCategory:'ILLNESS',nonclinical:false,startDate:d,endDate:addDays(d,6)}}),'api');}
{const t=mk('ui-erase');const d=addDays(t.doc().program.startDate,1);t.set(d,'08:00');
 save('actions-F1-notFeeling100-sign',t.api.notFeeling100({clientRequestId:t.rid('nf'),expectedVersion:t.version(),eligibility:ELIG(d),wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO,feverOrChills:true},intent:'REST',days:3}}),'api');
 const ids=t.api.history().v.history.facts.map(f=>f.eventId);
 save('actions-F2-eraseHealthFacts',t.api.eraseHealthFacts({eventIds:ids,expectedVersion:t.version()}));
 save('actions-F3-plan-after-erase',t.api.plan());
 save('actions-F4-eraseAccount',t.api.eraseAccount());
 save('actions-F5-plan-after-account-erase',t.api.plan());}

// ---- 3. Unplanned reports and a contested distance ----
{const t=athlete({id:'ui-avulsa',weeks:12});t.enroll();
 const s=t.sessions(0).find(x=>x.sport==='RUN');t.set(s.date,'08:00');
 save('unplanned-4-device-run',t.import([t.watch(s,{actual:{distanceKm:12.5}})],{eligibility:ELIG(s.date)}));
 t.set(s.date,'20:00');
 save('unplanned-5-athlete-contests-distance',t.weekly(s.date,[{...t.form(s),actual:{...t.form(s).actual,declared:{distanceKm:7,reason:'SIGNAL_LOSS'}}}]),'raw');
 const d=addDays(t.doc().program.startDate,5);t.set(d,'19:00');
 const a1=save('unplanned-1-run-no-observedAt',t.weekly(d,[{occurrenceDate:d,actual:{completed:true,minutes:30,sport:'RUN',rpe:3},response:U}]),'raw');
 const a2=save('unplanned-2-strength-no-observedAt',t.weekly(d,[{occurrenceDate:d,actual:{completed:true,minutes:35,sport:'STRENGTH',exercises:[{id:'goblet-squat',sets:[{reps:8,load:{value:16,unit:'KG',convention:'SINGLE_IMPLEMENT'},rir:3}]}]},response:U}]),'raw');
 const d2=addDays(d,1);t.set(d2,'21:00');
 const a3=save('unplanned-3-run-observedAt',t.weekly(d2,[{occurrenceDate:d2,observedAt:d2+'T18:10:00-03:00',actual:{completed:true,minutes:30,sport:'RUN',rpe:3},response:U}]),'raw');
 const a4=save('unplanned-6-strength-observedAt',t.weekly(d2,[{occurrenceDate:d2,observedAt:d2+'T20:40:00-03:00',actual:{completed:true,minutes:35,sport:'STRENGTH',exercises:[{id:'goblet-squat',sets:[{reps:8,load:{value:16,unit:'KG',convention:'SINGLE_IMPLEMENT'},rir:3}]}]},response:U}]),'raw');
 {const c=athlete({id:'ui-conflict',weeks:12});c.enroll();const cs=c.sessions(0).find(x=>x.sport==='RUN');c.set(cs.date,'08:00');
  c.import([c.watch(cs)],{eligibility:ELIG(cs.date)});c.set(cs.date,'20:00');const cf=c.form(cs);
  save('conflict-1-athlete-stop-against-device',c.weekly(cs.date,[{...cf,actual:{completed:false,minutes:5,rpe:9,stop:{reason:'SYMPTOM'}},response:{...cf.response,recovery:'ADVERSE'}}]),'raw');
  proj(c,'P-logged-conflict');}
 save('unplanned-7-history',t.api.history());
 save('unplanned-8-presentation',t.presentation());
 const e=proj(t,'P-logged-unplanned');
 saveBuilt('P-kept-check',{ok:true,projections:PROJECTIONS_VERSION,checks:[['unplanned-1',a1],['unplanned-2',a2],['unplanned-3',a3],['unplanned-6',a4]].map(([n,r])=>({answer:n,recorded:r.recorded,kept:r.recorded.map(id=>keepsReport(e,id))}))},[]);
 // The facade's own kept/notKept (computed right after each write, same queue) agrees with the final record for these four answers.
 for(const r of [a1,a2,a3,a4])if(JSON.stringify(r.kept)!==JSON.stringify(r.recorded.filter(id=>keepsReport(e,id))))throw new Error('facade kept differs from the record');}

// ---- 4. Five zones and the heart-rate profile operations ----
const STRAP=bpm=>({heartRate:{maxBpm:bpm,sensor:'CHEST_STRAP'}});
const R10=(x={})=>({id:'race-10k',...result('10K',3000,'2026-11-01',x)});
const LAB=bpm=>({id:'lab-1',kind:'LAB_TEST',date:'2026-10-20',rpe:9,tolerated:true,lab:{protocol:'Incremental treadmill test',source:'Laboratory report',modality:'TREADMILL_RUN',values:[{name:'First measured anchor',value:150,unit:'bpm'}]},heartRate:{maxBpm:bpm,sensor:'ECG'}});
const cases=[['hr5r-age30',[R10()],30],['hr5r-strap-above',[R10(STRAP(186))],40],['hr5r-strap-below',[R10(STRAP(186))],30],['hr5r-lab',[R10(),LAB(190)],25],
 ['hr5r-conflict',[R10(STRAP(192)),LAB(180)],40],['hr5r-noage',[R10()],null],['hr5r-optical',[R10({heartRate:{maxBpm:176,sensor:'OPTICAL'}})],30],['hr5r-declared',[R10()],30]];
for(const [name,anchors,age] of cases){
 const t=athlete({id:name,weeks:8}),i=athleteA({weeks:8,id:name});i.athlete.performanceAnchors=anchors;if(age===null){delete i.athlete.ageYears;i.athlete.ageEligible=true;}else i.athlete.ageYears=age;
 const e=t.enroll(i);if(!e.v.ok)throw new Error(name+' '+e.v.error.code);
 save(name+'-presentation',t.presentation());
 if(name==='hr5r-age30'){
  const series={sensor:'CHEST_STRAP',source:'SYNTHETIC',samples:Array.from({length:61},(_,k)=>({t:k*30,bpm:k<20?120:k<40?150:175}))};
  const g=t.f('timeInZones',{series,durationSeconds:1800});saveBuilt('hr5r-time-in-zone-gated',{ok:true,projections:PROJECTIONS_VERSION,timeInZones:g.v},[g.i]);
  const n0=t.f('timeInZones',{series:null});saveBuilt('hr5r-time-in-zone-no-series',{ok:true,projections:PROJECTIONS_VERSION,timeInZones:n0.v},[n0.i]);
  const day=addDays(t.doc().program.startDate,2);t.set(day);
  const r=t.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(day,{pain:true}),observations:[]});if(r.v.status!=='CLINICAL_HUMAN_REQUIRED')throw new Error('hold '+r.v.status);
  save('hr5r-hold-presentation',t.presentation());
  const hz=t.f('timeInZones',{series,durationSeconds:1800});saveBuilt('hr5r-time-in-zone-hold',{ok:true,projections:PROJECTIONS_VERSION,timeInZones:hz.v},[hz.i]);}
 if(name==='hr5r-declared'){
  const v=()=>t.version();
  let r=t.api.setHeartRateProfile({clientRequestId:'hr-1',expectedVersion:v(),heartRateProfile:{maxHeartRateBpm:195}});if(!r.v.ok)throw new Error('declared');save('hr5r-declared-answer',r);
  save('hr5r-declared-replay',t.api.setHeartRateProfile({clientRequestId:'hr-1',expectedVersion:v(),heartRateProfile:{maxHeartRateBpm:195}}));
  save('hr5r-declared-presentation',t.presentation());
  r=t.api.setHeartRateProfile({clientRequestId:'hr-2',expectedVersion:v(),heartRateProfile:{zoneUpperBpm:[130,150,165,180]}});if(!r.v.ok)throw new Error('custom');
  save('hr5r-custom-presentation',t.presentation());
  save('hr5r-invalid-answer',t.api.setHeartRateProfile({clientRequestId:'hr-3',expectedVersion:v(),heartRateProfile:{zoneUpperBpm:[150,140,165,180]}}));
  save('hr5r-stale-answer',t.api.setHeartRateProfile({clientRequestId:'hr-4',expectedVersion:v()-1,heartRateProfile:{maxHeartRateBpm:190}}));
  save('hr5r-reuse-answer',t.api.setHeartRateProfile({clientRequestId:'hr-1',expectedVersion:v(),heartRateProfile:{maxHeartRateBpm:191}}));
  notReproduced.push({file:'hr5r-carried.json',why:'integration.carried (the raw carried records) is not part of the app facade: the app never reads the sealed carried store'});
  save('hr5r-consent-revoked',t.api.setConsent({purpose:'COACHING',granted:false,expectedVersion:v()}));
  save('hr5r-set-without-consent',t.api.setHeartRateProfile({clientRequestId:'hr-6',expectedVersion:v(),heartRateProfile:{maxHeartRateBpm:190}}));
  save('hr5r-erase-without-consent',t.api.eraseHeartRateProfile({clientRequestId:'hr-7',expectedVersion:v()}));
  save('hr5r-after-erase-presentation',t.presentation());
  save('hr5r-consent-granted',t.api.setConsent({purpose:'COACHING',granted:true,expectedVersion:v()}));
  if(!t.api.setHeartRateProfile({clientRequestId:'hr-8',expectedVersion:v(),heartRateProfile:{maxHeartRateBpm:192}}).v.ok)throw new Error('re-set');
  save('hr5r-erase-answer',t.api.eraseHeartRateProfile({clientRequestId:'hr-9',expectedVersion:v()}));}
}

// ---- 5. Special population at onboarding ----
for(const [name,sp] of [['special-pregnancy',['PREGNANCY']],['special-postpartum',['POSTPARTUM']],['special-none',[]]]){
 const t=athlete({id:name,weeks:8}),i=athleteA({weeks:8,id:name});i.athlete.specialPopulation=sp;
 save(name+'-onboard',t.enroll(i),'raw');
 save(name+'-plan',t.api.plan());
 if(name==='special-pregnancy')save(name+'-sessions',t.api.sessions());}

// ---- 6. The warning-sign sets ----
{const parts=[...CONDITIONS,'READINESS'].map(c=>call('warningSignSet',JSON.stringify({condition:c})));
 saveBuilt('P-warning-sign-sets',{ok:true,projections:PROJECTIONS_VERSION,sets:parts.map(p=>p.v)},parts.map(p=>p.i));}

// ---- 7. CCP-ONB-1 (#109): the onboarding fields and the plan-ready readings ----
{const onb=(name,mut,reads)=>{const t=athlete({id:name,weeks:8}),i=athleteA({weeks:8,id:name});mut(i);
  save(name+'-onboard',t.enroll(i),'raw');
  if(reads.includes('weekPlan'))save(name+'-week-plan',t.f('weekPlan'));
  if(reads.includes('presentation'))save(name+'-presentation',t.presentation());
  if(reads.includes('plan'))save(name+'-plan',t.api.plan());};
 const marathon=i=>{i.weeks=16;i.athlete.goals.run={kind:'RACE',event:{kind:'MARATHON',date:'2027-02-28'}};};
 onb('onb-marathon-preparatory',marathon,['weekPlan']);
 onb('onb-marathon-block',i=>{marathon(i);i.athlete.recent={strengthDaysPerWeek:2,runDaysPerWeek:5,runMinutesPerWeek:300,longestRunMinutes:120};i.schedule.runDays=[0,1,3,5,6];i.schedule.longRunMinutes=180;},['weekPlan']);
 onb('onb-time-goal',i=>{i.athlete.goals.run.event.timeGoalMinutes=44.5;},['presentation']);
 onb('onb-every-field',i=>{i.athlete.knownExercises=[{id:'back-squat',sets:4,reps:5,rir:3,load:{value:90,unit:'KG',convention:'TOTAL'}}];i.athlete.coaching={profile:'CONSERVATIVE'};
  i.schedule.temporaryPreference='RUN';delete i.schedule.runTurn;delete i.schedule.strengthTurn;i.schedule.sameTurnConfirmed=true;i.athlete.performanceAnchors[0].conditions=[];},['plan']);
 onb('onb-only-strength',i=>{i.athlete.goals={run:{kind:'NONE'},strength:'STRENGTH'};delete i.athlete.runTrainingMonths;i.athlete.recent={strengthDaysPerWeek:2};i.athlete.performanceAnchors=[];
  i.schedule={strengthDays:[1,3,5],strengthMinutes:45,runDays:[],strengthTurn:'PM'};delete i.weeks;},['plan']);}

// ---- result ----
const shared=fs.readdirSync(FIX).filter(f=>f.endsWith('.json')&&f!=='INDEX.json').sort();
const covered=new Set([...compared.map(c=>c.file),...notReproduced.map(n=>n.file)]);
const missing=shared.filter(f=>!covered.has(f)),unequal=compared.filter(c=>!c.equal).map(c=>c.file);
// Every answer by its sha256 (UTF-8 of the exact string), every compared fixture by the sha256 of its committed bytes: the replay in
// JavaScriptCore must give the same string for every call, and, after removing the same facade keys, the same fixture bytes.
const sha=t=>createHash('sha256').update(t,'utf8').digest('hex');
// The equivalence rule (handoff §10, RFC-NUMERIC-1): only the Race Forecast's unrounded numbers may differ between V8 and JavaScriptCore. The
// classifier below (the same source runs in Node here and in JavaScriptCore in the Swift replay) gives, for one answer, the answer without any
// runForecast block, and the runForecast blocks without their own hashes and with every non-integer number at 9 significant digits.
const CLASSIFIER=`(function(){const H=new Set(['hash','inputDigest']);
const strip=v=>Array.isArray(v)?v.map(strip):(v&&typeof v==='object')?Object.fromEntries(Object.entries(v).filter(([k])=>k!=='runForecast').map(([k,x])=>[k,strip(x)])):v;
const coarse=v=>Array.isArray(v)?v.map(coarse):(v&&typeof v==='object')?Object.fromEntries(Object.entries(v).filter(([k])=>!H.has(k)).map(([k,x])=>[k,coarse(x)])):(typeof v==='number'&&Number.isFinite(v)&&!Number.isInteger(v))?Number(v.toPrecision(9)):v;
const forecasts=(v,out=[])=>{if(Array.isArray(v))v.forEach(x=>forecasts(x,out));else if(v&&typeof v==='object')for(const [k,x] of Object.entries(v))k==='runForecast'?out.push(coarse(x)):forecasts(x,out);return out;};
return s=>{const v=JSON.parse(s);return JSON.stringify({sans:JSON.stringify(strip(v)),coarse:JSON.stringify(forecasts(v))});};})()`;
const classify=(0,eval)(CLASSIFIER);
const script={generator:'ios/Packages/CoachingHost/facade/test/reproduce-fixtures.mjs',projections:PROJECTIONS_VERSION,key:KEY,
 classifier:CLASSIFIER,
 calls:calls.map(({fn,a,out})=>{const c=JSON.parse(classify(out));return {fn,a,sha256:sha(out),bytes:Buffer.byteLength(out),sansForecastSha256:sha(c.sans),forecastCoarseSha256:sha(c.coarse)};}),
 fixtures:compared.map(c=>({...c,sha256:sha(fs.readFileSync(path.join(FIX,c.file),'utf8'))})),notReproduced};
const text=JSON.stringify(script)+'\n';
const summary={sharedFixtures:shared.length,compared:compared.length,equal:compared.filter(c=>c.equal).length,unequal,notReproduced:notReproduced.map(n=>n.file),missing,calls:calls.length};
if(process.argv.includes('--check')){const old=fs.existsSync(OUT)?fs.readFileSync(OUT,'utf8'):null;summary.scriptUnchanged=old===text;}
else fs.writeFileSync(OUT,text);
console.log(JSON.stringify(summary));
if(unequal.length||missing.length||summary.scriptUnchanged===false)process.exit(1);
