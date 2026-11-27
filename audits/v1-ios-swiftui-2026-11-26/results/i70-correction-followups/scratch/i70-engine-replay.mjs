// RepMile #70 engine replay (read-only; in-memory store; synthetic athlete; no personal data). Front C follow-ups of #59's reviews:
//  1 (minor a) a row already corrected: is a correction of the corrected report (`correctionOf` = the head ATHLETE voice) accepted?
//  2 (SSCTR P2-4) the copy's claim: what distance does the engine read for a corrected run (the measured one, the athlete's, the smaller)?
//  3 (minor b) a lone "sim" on the screen (five flags unanswered): does the engine route it as it routes "sim" + five "não", at every site?
//    QRE #96 P1: past the limit the screen is read after the limit, so a "sim" sent with the correction gets LIMIT_EXCEEDED and no route;
//    the screen alone (`observations: []`) is then what the app sends.
//  4 (minor c) a sheet opened before midnight: the plan's day at send time, and what the engine does with a screen dated the day before.
// Requests are shaped as the Swift view models encode them (HistoryCorrectionViewModel.observation/request, RunReportViewModel,
// StrengthLogViewModel, NotFeeling100ViewModel, ReadinessViewModel, UnavailableDayViewModel), sent through the real integration boundary
// (CoachingCore createIntegration → custody → engine). Usage: node i70-engine-replay.mjs <repo root>
import fs from 'node:fs';
const ROOT=process.argv[2];
const {athlete,ELIG}=await import(ROOT+'/CoachingCore/test/v1int-helpers.mjs');
const {loggedEntries,keepsReport,warningSignSet}=await import(ROOT+'/ios/Packages/CoachingPresentation/Facade/app-projections.mjs');
const {runHistory}=await import(ROOT+'/CoachingCore/src/v1-run-history.mjs');
const {LIMITS}=await import(ROOT+'/CoachingCore/src/boundary/admission.mjs');
const {admitted}=await import(ROOT+'/CoachingCore/src/v1-run-format-index.mjs');
const V=JSON.parse(fs.readFileSync(ROOT+'/CoachingCore/v1/RUN_FORMATS_V1.json','utf8'));
let seq=0;const newId=p=>`${p}_${String(++seq).padStart(6,'0')}`;
const addDay=(d,n=1)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
let failures=0;const check=(label,cond)=>{console.log(`  ${cond?'PASS':'FAIL'} ${label}`);if(!cond)failures++;};
const sorted=v=>Array.isArray(v)?v.map(sorted):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sorted(v[k])])):v;
const U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const g=r=>r.decision?.guidance?.level??r.guidance?.level??null;
const ans=r=>r.ok?`ok status=${r.status} guidance=${g(r)} recorded=${r.recorded?.length??0} missing=${JSON.stringify(r.decision?.missingInputs??[])}`:`refused ${r.error?.code}`;
const state=t=>t.api.status({actor:t.actor}).state;

// ---- The Swift builder after #70 (HistoryCorrectionViewModel): `contested == nil` no longer gates the offer. ----
const ENUMS={stop:['SYMPTOM','FATIGUE','PACING','CONDITIONS','TIME','CHOICE','OTHER'],performance:['COMPATIBLE','UNDER','OVER','UNKNOWN'],
 recovery:['COMPATIBLE','ADVERSE','UNKNOWN'],effort:['ON_TARGET','EASIER','HARDER','UNKNOWN'],nextDayFunction:['NORMAL','IMPAIRED','UNKNOWN']};
const athleteVoice=e=>{const m=e.voices.filter(v=>v.channel==='ATHLETE');return m.length===1?m[0]:null;};
function statement(v){const r=v.response??{},out={response:{}};
 if(v.stopReason!=null){if(!ENUMS.stop.includes(v.stopReason))return null;out.stop={reason:v.stopReason};}
 for(const k of ['performance','recovery','effort','nextDayFunction']){if(r[k]!=null&&!ENUMS[k].includes(r[k]))return null;out.response[k]=r[k]??'UNKNOWN';}
 return out;}
const canContest=(e,sessionDate)=>e.sessionId!=null&&e.measuredKm!=null&&e.sport==='RUN'&&!!athleteVoice(e)&&!!statement(athleteVoice(e))&&sessionDate===e.date;
function observation(e,km,reason){const mine=athleteVoice(e);if(e.sessionId==null||!mine)return null;const said=statement(mine);if(!said)return null;
 const actual={completed:mine.completed,...(mine.minutes!=null?{minutes:mine.minutes}:{}),...(mine.declaredKm!=null?{distanceKm:mine.declaredKm}:{}),...(mine.rpe!=null?{rpe:mine.rpe}:{}),...(said.stop?{stop:said.stop}:{}),declared:{distanceKm:km,reason}};
 return {sessionId:e.sessionId,occurrenceDate:e.date,actual,response:said.response,correctionOf:mine.eventId};}
const NONE=day=>ELIG(day);
/** A lone "sim" as EligibilityForm leaves it: that flag true, the five others unanswered (omitted, never false), no confirmation. */
const LONE=(day,k)=>({assessedAt:day,[k]:true});
/** "sim" plus five "não" (the only shape the app sent before #70). */
const FLAG=(day,k)=>({...ELIG(day),status:undefined,[k]:true});
const request=(obs,screen)=>({kind:'WEEKLY_REVIEW',observations:[obs],eligibility:screen});

console.log('=== 0 replica == Swift golden (HistoryCorrectionViewModelTests, unchanged by #70)');
{const golden=fs.readFileSync(ROOT+'/ios/Packages/RepMileUI/Tests/RepMileUIUnitTests/HistoryCorrectionViewModelTests.swift','utf8');
 const gd=[...golden.matchAll(/#"(.*?)"#/g)].map(m=>m[1]).join('').match(/\{"eligibility".*?"sessionId":"w0-run-d1"\}\]\}/)[0];
 const fx=JSON.parse(fs.readFileSync(ROOT+'/ios/Packages/CoachingPresentation/Tests/CoachingPresentationTests/Fixtures/P-logged-two-voices.json','utf8'));
 const e=fx.entries.find(x=>x.sessionId==='w0-run-d1');
 check('the JS replica encodes exactly the Swift golden request',JSON.stringify(sorted(request(observation(e,7.4,'OBSTRUCTED_SKY'),NONE('2026-11-18'))))===gd);}

/** Device import + the athlete's report with its screen (as the app sends them since #68): a row with one ATHLETE and one DEVICE voice. */
function reported(name){
 const t=athlete({newId,id:'i70-'+name,weeks:12});t.enroll();
 const s=t.sessions(0).find(x=>x.sport==='RUN');const planDate=new Map(t.doc().program.weeks.flatMap(w=>w.sessions).map(x=>[x.id,x.date]));
 t.set(s.date,'08:00');const imp=t.import([t.watch(s)]);if(!imp.ok)throw new Error('import '+imp.error?.code);
 t.set(s.date,'20:00');const end=new Date(t.clock-15*60000).toISOString();
 const f={sessionId:s.id,occurrenceDate:s.date,observedAt:end,actual:{completed:true,minutes:40,rpe:4},response:{...U,effort:'ON_TARGET'}};
 const r=t.submit({kind:'WEEKLY_REVIEW',observations:[f],eligibility:NONE(s.date)});if(!(r.ok&&r.recorded?.length===1))throw new Error('report '+ans(r));
 const row=()=>loggedEntries(t.rows()).find(x=>x.sessionId===s.id&&!x.superseded);
 return {t,s,row,sessionDate:planDate.get(s.id)};
}
const dev=e=>e.voices.find(v=>v.channel==='DEVICE');
const kept=(t,r)=>{const rows=loggedEntries(t.rows());return r.ok&&(r.recorded??[]).some(id=>keepsReport(rows,id));};

console.log('=== 1 (a) a row already corrected is corrected again');
{const {t,s,row,sessionDate}=reported('chain');const today=addDay(s.date);t.set(today,'09:00');
 const r0=row();console.log(`  row: measuredKm=${r0.measuredKm} contested=${JSON.stringify(r0.contested)} athlete=${athleteVoice(r0).eventId}`);
 const first=t.submit(request(observation(r0,6,'SIGNAL_LOSS'),NONE(today)));console.log('  1st correction (6 km, naming the report) →',ans(first));
 const r1=row();check('1st: kept, contested 6 km',kept(t,first)&&r1.contested?.distanceKm===6);
 check('the head ATHLETE voice is now the 1st correction',athleteVoice(r1)?.eventId===first.recorded[0]);
 check('the corrected row is offered again (one re-sendable ATHLETE voice, on the plan\'s day)',canContest(r1,sessionDate));
 const second=t.submit(request(observation(r1,5.5,'OBSTRUCTED_SKY'),NONE(today)));console.log('  2nd correction (5.5 km, naming the 1st) →',ans(second));
 const r2=row();check('2nd: accepted and kept',kept(t,second));
 check('contested is now 5.5 km OBSTRUCTED_SKY',r2.contested?.distanceKm===5.5&&r2.contested?.reason==='OBSTRUCTED_SKY');
 check('DEVICE voice intact (same event, measured km)',JSON.stringify(dev(r2))===JSON.stringify(dev(r0)));
 check('completed, minutes and RPE of the athlete unchanged',athleteVoice(r2).completed===true&&athleteVoice(r2).minutes===40&&athleteVoice(r2).rpe===4);
 const stale={...observation(r1,5,'SIGNAL_LOSS')};
 const refused=t.submit(request(stale,NONE(today)));console.log('  a correction naming the replaced 1st (a stale row) →',ans(refused));
 check('refused CORRECTION_OF_REPLACED (the app names the head of the row it read)',!refused.ok&&refused.error?.code==='CORRECTION_OF_REPLACED');
 // The chain is bounded: depth 1..correctionsPerReport admitted; past it, only a report that states a safety signal (SEC-INT-07).
 let last=second,depth=2,cur=r2;
 while(depth<LIMITS.correctionsPerReport){const r=t.submit(request(observation(cur,5+depth/100,'SIGNAL_LOSS'),NONE(today)));if(!kept(t,r)){last=r;break;}depth++;cur=row();last=r;}
 check(`corrections 1..${LIMITS.correctionsPerReport} accepted (reached depth ${depth})`,depth===LIMITS.correctionsPerReport&&kept(t,last));
 const over=t.submit(request(observation(cur,4.9,'SIGNAL_LOSS'),NONE(today)));console.log(`  correction ${depth+1} (no safety signal) →`,ans(over));
 check('past the limit: refused LIMIT_EXCEEDED correctionsPerReport, nothing changed',!over.ok&&over.error?.code==='LIMIT_EXCEEDED'&&over.error?.limit==='correctionsPerReport'&&over.error?.index===0&&row().contested?.distanceKm===cur.contested?.distanceKm);
 console.log(`  refusal as the app decodes it: ${JSON.stringify(over.error)}`);
 console.log(`  LIMITS: correctionsPerReport=${LIMITS.correctionsPerReport} safetyExcess=${LIMITS.safetyExcess}`);
 // QRE #96 P1: a "sim" sent with a correction past the limit. The limit is read at admission, before the screen (integration.mjs admit), and
 // its safety exception reads the observation only (admission.mjs statesSafetySignal): no clinical route.
 const overSim=t.submit(request(observation(cur,4.8,'SIGNAL_LOSS'),LONE(today,'pain')));console.log('  past the limit, with a lone "sim" →',ans(overSim),'view',state(t));
 check('QRE P1: past the limit a "sim" is refused LIMIT_EXCEEDED too, and nothing routes it (plan not BLOCKED)',!overSim.ok&&overSim.error?.code==='LIMIT_EXCEEDED'&&overSim.error?.limit==='correctionsPerReport'&&state(t)!=='BLOCKED');
 // The screen alone, as the app then sends it (ReviewRequest(.sessionReports([]), eligibility:) encodes observations: []).
 const screenOnly=t.submit({kind:'WEEKLY_REVIEW',observations:[],eligibility:LONE(today,'pain')});console.log('  then the screen alone (observations []) →',ans(screenOnly),'view',state(t));
 check('the screen alone is admitted and routes to a human: CLINICAL_HUMAN_REQUIRED, PROFESSIONAL_ASSESSMENT, plan BLOCKED, nothing recorded',
  screenOnly.ok&&screenOnly.status==='CLINICAL_HUMAN_REQUIRED'&&g(screenOnly)==='PROFESSIONAL_ASSESSMENT'&&state(t)==='BLOCKED'&&(screenOnly.recorded??[]).length===0);
 check('the row is unchanged (the correction in force stays)',row().contested?.distanceKm===cur.contested?.distanceKm&&athleteVoice(row()).eventId===athleteVoice(cur).eventId);}

console.log('=== 2 (P2-4) the distance the engine reads for a corrected run');
const history=t=>runHistory({ledger:t.rows(),record:[],athleteId:t.id,tz:t.doc().program.timezoneOffsetMinutes??0},V).runs;
for(const [label,delta] of [['larger than measured',+3],['smaller than measured',-2]]){
 const {t,s,row}=reported('copy'+delta);const today=addDay(s.date);t.set(today,'09:00');
 const r0=row(),m=r0.measuredKm,before=history(t).find(x=>x.sessionId===s.id),admBefore=admitted(t.rows(),{athleteId:t.id},V);
 console.log(`  measured ${m} km; history before: referenceKm=${before?.referenceKm} measuredKm=${before?.measuredKm} paceWithheld=${before?.paceWithheld}`);
 const km=Math.round((m+delta)*100)/100;
 const r=t.submit(request(observation(r0,km,'SIGNAL_LOSS'),NONE(today)));
 const after=history(t).find(x=>x.sessionId===s.id),r1=row();
 console.log(`  corrected to ${km} km (${label}) → ${ans(r)}; history after: referenceKm=${after?.referenceKm} measuredKm=${after?.measuredKm} declaredKm=${after?.declaredKm} quality=${after?.quality} paceWithheld=${after?.paceWithheld}`);
 check(`${label}: the measured value stays on record (history measuredKm and the DEVICE voice)`,after?.measuredKm===m&&dev(r1)?.measuredKm===m);
 check(`${label}: the history counts the smaller of the two (${Math.min(m,km)} km)`,after?.referenceKm===Math.min(m,km));
 check(`${label}: the correction never raises what the run counts for`,after.referenceKm<=before.referenceKm);
 check(`${label}: the run's pace is no longer a reference (CORRECTED_MEASUREMENT)`,after?.paceWithheld==='CORRECTED_MEASUREMENT');
 // SSCTR #96 C1: what the calibration of paces reads is the record as admitted (v1-run-format-index.mjs admitted): the corrected run is withheld.
 const adm=admitted(t.rows(),{athleteId:t.id},V),w=adm.withheld.find(x=>x.sessionId===s.id);console.log(`  admitted().withheld: ${JSON.stringify(adm.withheld)}`);
 check(`${label}: before the correction the run was not withheld`,!admBefore.withheld.some(x=>x.sessionId===s.id));
 check(`${label}: the corrected run is withheld from the pace calibration (admitted().withheld, CORRECTED_MEASUREMENT)`,w?.reason==='CORRECTED_MEASUREMENT');}
for(const reason of ['SIGNAL_LOSS','OBSTRUCTED_SKY','AUTO_PAUSE','DEVICE_RESTART']){const {t,s,row}=reported('reason-'+reason);t.set(addDay(s.date),'09:00');
 const r=t.submit(request(observation(row(),6.5,reason),NONE(addDay(s.date))));const after=history(t).find(x=>x.sessionId===s.id);
 check(`every reason the form offers (${reason}) withholds the pace and counts the smaller`,kept(t,r)&&after?.paceWithheld==='CORRECTED_MEASUREMENT'&&after?.referenceKm===Math.min(6.5,after.measuredKm));}

console.log('=== 3 (b) a lone "sim" is routed as "sim" + five "não", at every site');
function fresh(name){const t=athlete({newId,id:'i70-'+name,weeks:12});const e=t.enroll();if(!e.ok)throw new Error('enroll '+e.error?.code);
 return {t,run:t.sessions(0).find(x=>x.sport==='RUN'),str:t.sessions(0).find(x=>x.sport==='STRENGTH')};}
const endOf=t=>new Date(t.clock-15*60000).toISOString();
const NO_SIGNS=c=>Object.fromEntries(warningSignSet(c).warningSigns.map(k=>[k,false]));
const URGENT={notFeeling100:'chestPainPressureOrTightness',readiness:'breathlessAtRest'};
const nfReq=(screen,day,urgent)=>({kind:'NOT_FEELING_100',wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO_SIGNS('MILD_ILLNESS'),...(urgent?{[URGENT.notFeeling100]:true}:{})},intent:'REST'},eligibility:screen(day)});
function heldAthlete(name){const {t,run}=fresh(name);t.set(run.date,'20:00');
 const h=t.submit({kind:'WEEKLY_REVIEW',observations:[{sessionId:run.id,occurrenceDate:run.date,observedAt:endOf(t),actual:{completed:true,minutes:40,rpe:4},response:U}],eligibility:FLAG(run.date,'pain')});
 if(h.status!=='CLINICAL_HUMAN_REQUIRED')throw new Error('hold '+ans(h));const day=addDay(run.date,3);t.set(day,'09:00');return {t,day};}
const rdReq=(screen,day,urgent)=>({kind:'READINESS_DECLARATION',readiness:{declaredRecovered:true,warningSigns:{...NO_SIGNS('READINESS'),...(urgent?{[URGENT.readiness]:true}:{})},sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}},eligibility:screen(day)});
const sites={
 correction:(name,screen)=>{const {t,s,row}=reported(name);const day=addDay(s.date);t.set(day,'09:00');const r0=row();const r=t.submit(request(observation(r0,6,'SIGNAL_LOSS'),screen(day)));
  return {t,r,extra:`contested=${JSON.stringify(row().contested)} headUnchanged=${athleteVoice(row()).eventId===athleteVoice(r0).eventId}`};},
 runReport:(name,screen)=>{const {t,run}=fresh(name);t.set(run.date,'20:00');
  return {t,r:t.submit({kind:'WEEKLY_REVIEW',observations:[{sessionId:run.id,occurrenceDate:run.date,observedAt:endOf(t),actual:{completed:true,minutes:40,rpe:4},response:{...U,effort:'ON_TARGET'}}],eligibility:screen(run.date)})};},
 strengthLog:(name,screen)=>{const {t,str}=fresh(name);t.set(str.date,'20:00');
  const obs={sessionId:str.id,occurrenceDate:str.date,observedAt:endOf(t),actual:{completed:true,minutes:45,exercises:str.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps??8}))}))},response:U};
  return {t,r:t.submit({kind:'WEEKLY_REVIEW',observations:[obs],eligibility:screen(str.date)})};},
 notFeeling100:(name,screen)=>{const {t,run}=fresh(name);t.set(run.date,'08:00');return {t,r:t.submit(nfReq(screen,run.date,false))};},
 'notFeeling100+urgentSign':(name,screen)=>{const {t,run}=fresh(name);t.set(run.date,'08:00');return {t,r:t.submit(nfReq(screen,run.date,true))};},
 readiness:(name,screen)=>{const {t,day}=heldAthlete(name);return {t,r:t.submit(rdReq(screen,day,false))};},
 'readiness+urgentSign':(name,screen)=>{const {t,day}=heldAthlete(name);return {t,r:t.submit(rdReq(screen,day,true))};},
 unavailableDay:(name,screen)=>{const {t}=fresh(name);const day=t.doc().program.weeks[0].startDate;t.set(day,'08:00');const target=t.sessions(0).find(x=>x.date>day);
  return {t,r:t.submit({kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[target.date]},eligibility:screen(day)})};},
};
const shape=({t,r})=>({ok:r.ok,status:r.status,guidance:g(r),recorded:r.recorded?.length??0,state:state(t),pending:!!t.api.status({actor:t.actor}).pending?.decisionId});
const FLAGS=['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'];
for(const [site,run] of Object.entries(sites))for(const flag of FLAGS){
 const lone=run(`${site}-lone-${flag}`,d=>LONE(d,flag)),full=run(`${site}-full-${flag}`,d=>FLAG(d,flag));
 const a=shape(lone),b=shape(full);
 if(flag==='pain')console.log(`  ${site}: lone "${flag}" → ${ans(lone.r)} view=${a.state}${lone.extra?' '+lone.extra:''} | with five "não" → ${ans(full.r)} view=${b.state}`);
 check(`${site} ${flag}: lone "sim" is CLINICAL_HUMAN_REQUIRED`,a.ok&&a.status==='CLINICAL_HUMAN_REQUIRED');
 check(`${site} ${flag}: same answer as "sim" + five "não" (status, guidance, recorded, plan state, pending)`,JSON.stringify(a)===JSON.stringify(b));}

console.log('=== 4 (c) the sheet opened before midnight, sent after it');
{const {t,s,row}=reported('midnight');const D=addDay(s.date);t.set(D,'23:58');
 const opened=t.api.plan({actor:t.actor}).view.today;const r0=row();
 t.set(addDay(D),'00:05');const atSend=t.api.plan({actor:t.actor}).view.today;
 console.log(`  plan today when the sheet opened: ${opened}; read again at send time: ${atSend}`);
 check('the plan\'s day moves at the plan\'s midnight (a fresh read at send time gives the new day)',opened===D&&atSend===addDay(D));
 const stale=t.submit(request(observation(r0,6,'SIGNAL_LOSS'),NONE(opened)));console.log(`  screen dated ${opened} (the day the sheet opened) →`,ans(stale));
 check('a screen dated the day before is still read as current (0–14 days): the old date is recorded as the day the athlete answered',kept(t,stale));
 const {t:t2,s:s2,row:row2}=reported('midnight2');const D2=addDay(s2.date);t2.set(addDay(D2),'00:05');const today2=t2.api.plan({actor:t2.actor}).view.today;
 const fresh2=t2.submit(request(observation(row2(),6,'SIGNAL_LOSS'),NONE(today2)));console.log(`  screen dated ${today2} (the plan's day read at send time) →`,ans(fresh2));
 check('re-dated to the plan\'s day at send time: accepted and kept',kept(t2,fresh2));
 const {t:t3,s:s3,row:row3}=reported('midnight3');t3.set(addDay(s3.date),'09:00');const today3=t3.api.plan({actor:t3.actor}).view.today;
 const ahead=t3.submit(request(observation(row3(),6,'SIGNAL_LOSS'),NONE(addDay(today3))));console.log(`  screen dated ${addDay(today3)} (a day ahead of the plan's, e.g. the device's) →`,ans(ahead));
 check('a day ahead of the plan\'s day: ASK eligibility.currentAssessment, nothing recorded (never the device\'s day)',ahead.ok&&ahead.status==='ASK'&&(ahead.recorded??[]).length===0);}

console.log(failures?`RESULT: ${failures} FAILED`:'RESULT: ALL PASS');process.exitCode=failures?1:0;
