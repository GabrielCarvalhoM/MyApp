// Core Safety & Lifecycle: the Node oracle of the focal revalidation. Builds the synthetic journeys with the CoachingCore test helpers, records
// the exact inputs of every step, runs core-driver.js over the native ESM modules, and writes the fixture the device test compares against.
//   node audits/v1-core-safety-lifecycle-2026-11-18/mac/core-oracle.mjs   -> audits/v1-aif-p0-jsc-2026-11-17/ios/Tests/P0HostTests/Fixtures/core.json
// Deterministic: running it again must leave `git diff` empty (the defaultLocale field is the machine's and is excluded from the digest).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import * as core from '../../../CoachingCore/src/v1-safety-index.mjs';
import * as contract from '../../../CoachingCore/src/r5-contract.mjs';
import * as value from '../../../CoachingCore/src/value.mjs';
import {client,athleteA,reportOf,liveSessions,at,ELIG,addDays,notFeeling100WithSign,readiness} from '../../../CoachingCore/test/v1core-helpers.mjs';
import {result} from '../../../CoachingCore/test/v1rc-helpers.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url)),REPO=path.resolve(HERE,'..','..','..');
const P0=path.join(REPO,'audits','v1-aif-p0-jsc-2026-11-17'),OUT=path.join(P0,'ios','Tests','P0HostTests','Fixtures','core.json');
/** A client that records every input it sends, as the driver will replay it. */
function recorder(){const c=client(core),steps=[];return {c,steps,
 onboard(i){steps.push({op:'onboard',intake:structuredClone(i)});return c.onboard(i);},
 review(kind,asOf,facts,eventId){steps.push({op:'review',kind,asOf,facts:structuredClone(facts),eventId});return c.review(kind,asOf,facts,eventId);},
 probe(kind,asOf,facts,eventId){steps.push({op:'probe',kind,asOf,facts:structuredClone(facts),eventId});return c.probe(kind,asOf,facts,eventId);},
 restart(i,asOf){steps.push({op:'restart',intake:structuredClone(i),asOf});return c.restart(i,asOf);},
 roundtrip(){steps.push({op:'roundtrip'});}};}
const journeys=[];
// 1. QRE-AIF-02: plan A, week 0, restart, a plain review, plan B's first report, a round trip, a second restart the same day.
{const r=recorder();r.onboard(athleteA({weeks:8,id:'core-mac-r'}));const p=r.c.env.program,d=addDays(p.startDate,6);
 r.review('WEEKLY_REVIEW',at(d),{eligibility:ELIG(d),observations:liveSessions(r.c.env,0).map(s=>reportOf(r.c.env,s))},'a-w0');
 const day=addDays(p.startDate,18),upd={...athleteA({weeks:8,id:'core-mac-r'}),asOf:day,startDate:addDays(day,3)};upd.athlete.eligibility=ELIG(day);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 r.restart(upd,at(day,'10:00'));const b0=r.c.env.program.startDate;r.review('WEEKLY_REVIEW',at(b0,'07:00'),{eligibility:ELIG(b0)},'b-plain');
 const s0=liveSessions(r.c.env,0)[0];r.review('WEEKLY_REVIEW',at(s0.date),{eligibility:ELIG(s0.date),observations:[reportOf(r.c.env,s0,{tag:'-b'})]},'b-first');
 r.roundtrip();const n=addDays(s0.date,1);r.review('WEEKLY_REVIEW',at(n),{eligibility:ELIG(n)},'b-next');
 const upd2={...upd,asOf:n,startDate:addDays(n,3)};upd2.athlete={...upd.athlete,eligibility:ELIG(n)};r.restart(upd2,at(n,'21:30'));
 journeys.push({name:'restart',steps:r.steps});}
// 2. QRE-AIF-01: one plan across the review-by date; signs before, on and after; a weekly review after; a standing hold and a readiness after.
{const r=recorder(),i=athleteA({weeks:8,id:'core-mac-x'});i.asOf='2027-04-17';i.startDate='2027-04-19';i.athlete.eligibility=ELIG('2027-04-17');i.athlete.goals.run.event.date=addDays('2027-04-19',8*7-1);r.onboard(i);
 for(const day of ['2027-04-29','2027-04-30','2027-05-01'])r.probe('NOT_FEELING_100',at(day,'08:00'),notFeeling100WithSign(day),'sign-'+day);
 r.probe('NOT_FEELING_100','2027-04-30T22:30:00-03:00',notFeeling100WithSign('2027-04-30'),'sign-late');
 r.probe('WEEKLY_REVIEW',at('2027-05-02','20:00'),{eligibility:ELIG('2027-05-02')},'weekly-after');
 r.review('NOT_FEELING_100',at('2027-04-28','08:00'),notFeeling100WithSign('2027-04-28'),'hold');
 r.probe('WEEKLY_REVIEW',at('2027-05-02','20:00'),{eligibility:ELIG('2027-05-02')},'standing');
 r.probe('READINESS_DECLARATION',at('2027-05-03','08:00'),readiness('2027-05-03'),'ready');
 journeys.push({name:'expiry',steps:r.steps});}
// 3. E-1: a run in two voices, then the device re-synchronization (ADVERSE and HEAT).
for(const kind of ['ADVERSE','HEAT']){const r=recorder();r.onboard(athleteA({weeks:8,id:'core-mac-e1-'+kind}));const s=liveSessions(r.c.env,0).find(x=>x.sport==='RUN'),b=reportOf(r.c.env,s),{response:_r,eventId:_e,...body}=b,m={...b.actual};delete m.rpe;
 const U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},dev={...body,eventId:'dev-1',actual:m,source:{provider:'HEALTHKIT',activityId:'HK-1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-1',response:U};
 const ath={sessionId:s.id,occurrenceDate:b.occurrenceDate,eventId:'ath-1',actual:{completed:true,rpe:8,...(kind==='HEAT'?{conditions:['HEAT']}:{})},response:{...U,recovery:kind==='ADVERSE'?'ADVERSE':'COMPATIBLE',effort:'HARDER'}};
 r.review('WEEKLY_REVIEW',at(s.date,'21:00'),{eligibility:ELIG(s.date),observations:[dev,ath]},'both');const d1=addDays(s.date,1);
 r.review('WEEKLY_REVIEW',at(d1,'20:00'),{eligibility:ELIG(d1),observations:[{...dev,eventId:'dev-1b',correctionOf:'dev-1',correctedAt:at(d1,'07:00'),actual:{...m,minutes:m.minutes+1}}]},'resync');
 journeys.push({name:'e1-'+kind,steps:r.steps});}
// 4. RFC-NUMERIC-1: six reported weeks with one and with two race results (the two-race branch runs only where the engine pairs them).
for(const [name,anchors] of [['forecast-one',[result('10K',3000,'2026-11-01')]],['forecast-two',[result('5K',1440,'2026-10-04'),result('10K',3000,'2026-11-01')]]]){
 const r=recorder(),i=athleteA({weeks:12,id:'core-mac-'+name});i.athlete.performanceAnchors=anchors;r.onboard(i);
 for(let w=0;w<6;w++){const day=addDays(r.c.env.program.startDate,w*7+6);r.review('WEEKLY_REVIEW',at(day),{eligibility:ELIG(day),observations:liveSessions(r.c.env,w).map(s=>reportOf(r.c.env,s,{tag:'-'+w}))},'w'+w);}
 journeys.push({name,steps:r.steps});}
// 5. Closure-2, SSCTR-CORE-B-01-R: plan A's symptom stop reported late after a restart, in a review with no eligibility (ASK); a round trip;
//    the next review; a late correction; a duplicate; a third plan; the screen answered after the stop.
{const id='core-mac-b01r',r=recorder();r.onboard(athleteA({weeks:8,id}));const p=r.c.env.program,d0=addDays(p.startDate,6);
 r.review('WEEKLY_REVIEW',at(d0),{eligibility:ELIG(d0),observations:liveSessions(r.c.env,0).map(s=>reportOf(r.c.env,s))},'a-w0');const a1=liveSessions(r.c.env,1).find(s=>s.sport==='RUN');
 const restart=(after,tag)=>{const day=addDays(r.c.env.program.startDate,after),u={...athleteA({weeks:8,id}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};r.restart(u,at(day,'10:00'));};
 restart(18);const base=reportOf({program:r.c.env.program,presentation:{runSessions:{}},actualLedger:[]},liveSessions(r.c.env,0).find(s=>s.sport==='RUN'));
 const stopped={...base,eventId:'late-stop',sessionId:a1.id,occurrenceDate:a1.date,actual:{completed:false,minutes:20,stop:{reason:'SYMPTOM'}}},d=addDays(r.c.env.program.startDate,1),d2=addDays(d,1);
 r.review('WEEKLY_REVIEW',at(d,'07:00'),{observations:[stopped]},'ask');r.roundtrip();
 r.review('WEEKLY_REVIEW',at(d2,'07:00'),{eligibility:ELIG(addDays(d2,-3))},'next');
 r.review('WEEKLY_REVIEW',at(d2,'09:00'),{observations:[{...stopped,eventId:'late-stop-2',correctionOf:'late-stop',correctedAt:at(d2,'06:00'),actual:{...stopped.actual,minutes:21}}]},'corr');
 r.review('WEEKLY_REVIEW',at(d2,'11:00'),{observations:[stopped]},'dup');
 restart(4);const d3=r.c.env.program.startDate;r.probe('WEEKLY_REVIEW',at(d3,'07:00'),{eligibility:ELIG(addDays(d3,-9))},'third');
 const d4=addDays(d3,1);r.review('WEEKLY_REVIEW',at(d4,'07:00'),{eligibility:ELIG(d4)},'screened');
 journeys.push({name:'alert-b01r',steps:r.steps});}
// 6. Closure-2, QRE-CORE-R2-01: across the review-by date, a sign with a symptom stop after the date (kept), a round trip, the next review.
{const r=recorder(),i=athleteA({weeks:8,id:'core-mac-x2'});i.asOf='2027-04-17';i.startDate='2027-04-19';i.athlete.eligibility=ELIG('2027-04-17');i.athlete.goals.run.event.date=addDays('2027-04-19',8*7-1);r.onboard(i);
 const day0='2027-04-25';r.review('WEEKLY_REVIEW',at(day0,'20:00'),{eligibility:ELIG(day0),observations:liveSessions(r.c.env,0).filter(s=>s.date<=day0).map(s=>reportOf(r.c.env,s))},'w0');
 const s=liveSessions(r.c.env,1).find(x=>x.sport==='RUN'&&x.date<='2027-05-02');
 r.review('NOT_FEELING_100',at('2027-05-02','08:00'),{...notFeeling100WithSign('2027-05-02'),observations:[{...reportOf(r.c.env,s),eventId:'exp-stop',actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}}}]},'sign-stop');
 r.roundtrip();r.probe('WEEKLY_REVIEW',at('2027-05-03','08:00'),{eligibility:ELIG('2027-05-01')},'next');
 journeys.push({name:'expiry-record',steps:r.steps});}
// 7. CORE-C2-F01 (restart sizing fix): weeks 0 to 2 reported, each run corrected the same evening (the record keeps the replaced rows), a round
//    trip, then a restart. The control journey reports the same weeks with no correction. In Node the two restarts prescribe the same run doses
//    (checked below); on the device each step must equal Node's, so the device prescribes the control's doses too.
const F01={};
for(const corrected of [true,false]){const id='core-mac-f01',r=recorder();r.onboard(athleteA({weeks:8,id}));const p=r.c.env.program;
 for(const w of [0,1,2]){const d=addDays(p.startDate,w*7+6);r.review('WEEKLY_REVIEW',at(d),{eligibility:ELIG(d),observations:liveSessions(r.c.env,w).map(s=>reportOf(r.c.env,s,{tag:'-'+w}))},'w'+w);
  if(corrected){const runs=r.c.env.actualLedger.filter(o=>!o.fact&&!o.superseded&&o.context?.sport==='RUN'&&o.localDate>=addDays(p.startDate,w*7));
   r.review('WEEKLY_REVIEW',at(d,'22:00'),{eligibility:ELIG(d),observations:runs.map(o=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,occurrenceDate:o.localDate,actual:{...o.actual},response:o.response,correctionOf:o.eventId,correctedAt:at(d,'21:00')}))},'fix'+w);}}
 r.roundtrip();const day=addDays(p.startDate,24),u={...athleteA({weeks:8,id}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 const g=r.restart(u,at(day,'10:00'));F01[corrected?'corrected':'control']={status:g.status,superseded:r.c.env.actualLedger.filter(o=>o.superseded===true).length,bounded:g.restart?.boundedByRecord??null,runs:(g.program??g.proposal)?.weeks.map(x=>x.sessions.filter(s=>s.sport==='RUN').map(s=>s.prescription?.durationMinutes??null))??null};
 journeys.push({name:corrected?'restart-f01':'restart-f01-control',steps:r.steps});}
if(JSON.stringify([F01.corrected.status,F01.corrected.bounded,F01.corrected.runs])!==JSON.stringify([F01.control.status,F01.control.bounded,F01.control.runs])||!F01.corrected.superseded)throw new Error('CORE-C2-F01: the restart from the corrected record does not prescribe the control\'s doses: '+JSON.stringify(F01));
// 8. C-F01-1 r2 (restart evidence): (a) week 0's runs reported, each corrected to "not done" the same evening (no execution in force), a round
//    trip, then a restart: the record covers the window, so the stated exposure is bounded and the plan starts at RESTART, never above the
//    control that reports the same runs done; (b) a hold, the readiness declaration, then a run in two voices (app + watch) and the athlete's
//    correction against the watch (a disputed amount), a round trip, a restart with no stated reason (ASK: the SB-1 question), then with one.
const R2={},U2={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'},cls2=g=>JSON.stringify(g.program??g.proposal??{}).match(/"class":"([A-Z_]+)"/)?.[1]??null;
const upd2=(id,day,pause)=>{const u={...athleteA({weeks:8,id}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);if(pause)u.athlete.pause=pause;else delete u.athlete.pause;return u;};
for(const fix of [true,false]){const id='core-mac-r2n',r=recorder();r.onboard(athleteA({weeks:8,id}));const p=r.c.env.program,d=addDays(p.startDate,6);
 r.review('WEEKLY_REVIEW',at(d),{eligibility:ELIG(d),observations:liveSessions(r.c.env,0).filter(s=>s.sport==='RUN').map(s=>reportOf(r.c.env,s))},'w0');
 if(fix){const live=r.c.env.actualLedger.filter(o=>!o.fact&&!o.superseded&&o.context?.sport==='RUN');r.review('WEEKLY_REVIEW',at(d,'22:00'),{eligibility:ELIG(d),observations:live.map(o=>({eventId:o.eventId+'-nd',athleteId:o.athleteId,sessionId:o.sessionId,occurrenceDate:o.localDate,actual:{completed:false,minutes:0},response:U2,correctionOf:o.eventId,correctedAt:at(d,'21:00')}))},'nd0');}
 r.roundtrip();const day=addDays(p.startDate,10),g=r.restart(upd2(id,day,{reasonCategory:'SCHEDULE',nonclinical:true,weeks:0}),at(day,'10:00'));
 R2[fix?'notDone':'control']={status:g.status,bounded:g.restart?.boundedByRecord??null,cls:cls2(g),runs:(g.program??g.proposal)?.weeks.map(x=>x.sessions.filter(s=>s.sport==='RUN').map(s=>s.prescription?.durationMinutes??0))??null};
 journeys.push({name:fix?'restart-r2-notdone':'restart-r2-notdone-control',steps:r.steps});}
{const id='core-mac-r2d',r=recorder();r.onboard(athleteA({weeks:8,id}));const p=r.c.env.program,d0=addDays(p.startDate,6);
 r.review('WEEKLY_REVIEW',at(d0),{eligibility:ELIG(d0),observations:liveSessions(r.c.env,0).map(s=>reportOf(r.c.env,s))},'w0');
 const h=addDays(p.startDate,8),rd=addDays(h,4);r.review('NOT_FEELING_100',at(h,'08:00'),notFeeling100WithSign(h),'hold');r.review('READINESS_DECLARATION',at(rd,'08:00'),readiness(rd),'ready');
 const s=liveSessions(r.c.env,2).find(x=>x.sport==='RUN'&&x.date>rd),b=reportOf(r.c.env,s,{tag:'-d'}),{response:_r,eventId:_e,...body}=b,m={...b.actual};delete m.rpe;
 r.review('WEEKLY_REVIEW',at(s.date,'21:00'),{eligibility:ELIG(s.date),observations:[{...b,eventId:'app-r2'},{...body,eventId:'dev-r2',actual:m,source:{provider:'HEALTHKIT',activityId:'HK-r2',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-r2',response:U2}]},'both');
 r.review('WEEKLY_REVIEW',at(s.date,'22:30'),{eligibility:ELIG(s.date),observations:[{...b,eventId:'app-r2b',correctionOf:'app-r2',correctedAt:at(s.date,'22:00'),actual:{...b.actual,minutes:Math.max(1,Math.round((m.minutes??40)*0.4))}}]},'fix');
 const row=r.c.env.actualLedger.find(o=>!o.fact&&!o.superseded&&o.sessionId===s.id);r.roundtrip();const day=addDays(s.date,3);
 const ask=r.restart(upd2(id,day,null),at(day,'10:00')),ok=r.restart(upd2(id,day,{reasonCategory:'SCHEDULE',nonclinical:true,weeks:0}),at(day,'10:00'));
 R2.disputed={conflict:row?.provenance?.conflict??null,ask:ask.status,missing:ask.missingInputs,ok:ok.status};
 journeys.push({name:'restart-r2-disputed',steps:r.steps});}
// The start (week 0) only: later weeks follow each class's own progression (SSCTR_R2_R1 O-1, B0-F05: the classes are not monotonic in minutes).
const le=(a,b)=>a[0].every((x,j)=>x<=(b[0]?.[j]??Infinity));
if(R2.notDone.status!=='PROPOSED'||R2.notDone.cls!=='RESTART'||JSON.stringify(R2.notDone.bounded)!=='["recent.runMinutesPerWeek","recent.runDaysPerWeek"]'||!le(R2.notDone.runs,R2.control.runs))throw new Error('C-F01-1 r2 (i): the "not done" record is not bounded to RESTART at or below its control: '+JSON.stringify(R2));
if(R2.disputed.conflict!=='CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE'||R2.disputed.ask!=='ASK'||!R2.disputed.missing?.some(k=>k.startsWith('athlete.pause.'))||R2.disputed.ok!=='PROPOSED')throw new Error('C-F01-1 r2 (ii) / SB-1: the disputed session after the declaration does not ask the new stop: '+JSON.stringify(R2.disputed));
// 9. SEC-R2-03 + SEC-R2-04 (correction integrity): (a) week 0 reported, then a refused correction of run d3 reusing run d1's event id;
//    (b) run d1 reported by the watch only (activity HK-S1), then a refused correction of run d3 carrying HK-S1; each with a round trip, the
//    next review and a restart. Neither original may be marked replaced, and each journey must equal the same report sent with no correctionOf
//    (checked here, in Node). (c) A hold, the readiness declaration, a run after it, a refused correction of that run reusing an earlier
//    run's id, a round trip, then a restart with no stated reason: ASK (the SB-1 question), then with one: PROPOSED.
const SR2={},U3={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const sr2=(kind,plain)=>{const id='core-mac-sr2'+kind,r=recorder(),rec=plain?{c:client(core),steps:[]}:r,c=plain?rec.c:r.c;
 const go=(f,...a)=>plain?(f==='review'?c.review(...a):f==='restart'?c.restart(...a):f==='onboard'?c.onboard(...a):null):r[f](...a);
 go('onboard',athleteA({weeks:8,id}));const p=c.env.program,d=addDays(p.startDate,6),obs=liveSessions(c.env,0).map(s=>reportOf(c.env,s));
 if(kind==='b'){const i=obs.findIndex(o=>o.sessionId==='w0-run-d1'),o=obs[i],m={...o.actual};delete m.rpe;obs[i]={...o,eventId:'dev-s1',actual:m,response:U3,source:{provider:'HEALTHKIT',activityId:'HK-S1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-S1'};}
 go('review','WEEKLY_REVIEW',at(d),{eligibility:ELIG(d),observations:obs},'w0');
 const x=c.env.actualLedger.find(o=>o.eventId==='aif-w0-run-d3'&&!o.superseded),d8=addDays(d,2);
 const bad={sessionId:x.sessionId,occurrenceDate:x.localDate,eventId:kind==='a'?'aif-w0-run-d1':'aif-w0-run-d3-c',correctionOf:'aif-w0-run-d3',correctedAt:at(d8,'07:00'),reportedAt:at(d8,'07:00'),actual:{...x.actual,minutes:x.actual.minutes-5},response:x.response,...(kind==='b'?{source:{provider:'HEALTHKIT',activityId:'HK-S1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-S1'}:{})};
 if(plain){delete bad.correctionOf;delete bad.correctedAt;}
 go('review','WEEKLY_REVIEW',at(d8,'20:00'),{eligibility:ELIG(d8),observations:[bad]},'bad');if(!plain)r.roundtrip();else c.env.actualLedger=JSON.parse(JSON.stringify(c.env.actualLedger));
 const d9=addDays(d8,1),next=go('review','WEEKLY_REVIEW',at(d9,'07:00'),{eligibility:ELIG(d9)},'next');
 const day=addDays(p.startDate,10),u={...athleteA({weeks:8,id}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 const g=go('restart',u,at(day,'10:00'));
 const out={replaced:c.env.actualLedger.filter(o=>o.superseded===true).map(o=>o.eventId),d3:c.env.actualLedger.some(o=>o.eventId==='aif-w0-run-d3'&&!o.superseded),next:[next.status,next.action],restart:g.status,runs:(g.program??g.proposal)?.weeks.map(w=>w.sessions.filter(s=>s.sport==='RUN').map(s=>s.prescription?.durationMinutes??0))??null};
 if(!plain)journeys.push({name:'sec-r2-refused-'+(kind==='a'?'eventid':'activity'),steps:r.steps});return out;};
for(const k of ['a','b']){SR2[k]=sr2(k,false);SR2[k+'Plain']=sr2(k,true);}
{const id='core-mac-sr2c',r=recorder();r.onboard(athleteA({weeks:8,id}));const p=r.c.env.program,d0=addDays(p.startDate,6);
 r.review('WEEKLY_REVIEW',at(d0),{eligibility:ELIG(d0),observations:liveSessions(r.c.env,0).map(s=>reportOf(r.c.env,s))},'w0');
 const h=addDays(p.startDate,8),rd=addDays(h,4);r.review('NOT_FEELING_100',at(h,'08:00'),notFeeling100WithSign(h),'hold');r.review('READINESS_DECLARATION',at(rd,'08:00'),readiness(rd),'ready');
 const s=liveSessions(r.c.env,2).find(x=>x.sport==='RUN'&&x.date>rd),b=reportOf(r.c.env,s,{tag:'-c'});
 r.review('WEEKLY_REVIEW',at(s.date,'21:00'),{eligibility:ELIG(s.date),observations:[b]},'after');
 r.review('WEEKLY_REVIEW',at(s.date,'22:30'),{eligibility:ELIG(s.date),observations:[{...b,eventId:'aif-w0-run-d1',correctionOf:b.eventId,correctedAt:at(s.date,'22:00'),actual:{...b.actual,minutes:Math.max(1,(b.actual.minutes??40)-10)}}]},'refused');
 r.roundtrip();const day=addDays(s.date,3),ask=r.restart(upd2(id,day,null),at(day,'10:00')),ok=r.restart(upd2(id,day,{reasonCategory:'SCHEDULE',nonclinical:true,weeks:0}),at(day,'10:00'));
 SR2.c={inForce:r.c.env.actualLedger.some(o=>o.eventId===b.eventId&&!o.superseded),replaced:r.c.env.actualLedger.filter(o=>o.superseded===true).length,ask:ask.status,missing:ask.missingInputs,ok:ok.status};
 journeys.push({name:'sec-r2-readiness',steps:r.steps});}
for(const k of ['a','b'])if(SR2[k].replaced.length||!SR2[k].d3||JSON.stringify(SR2[k])!==JSON.stringify(SR2[k+'Plain']))throw new Error('SEC-R2-03 ('+k+'): a refused correction changed the record or differs from the plain report: '+JSON.stringify(SR2));
if(!SR2.c.inForce||SR2.c.replaced||SR2.c.ask!=='ASK'||!SR2.c.missing?.some(k=>k.startsWith('athlete.pause.'))||SR2.c.ok!=='PROPOSED')throw new Error('SEC-R2-03/SB-1: the run after the declaration is not kept or the new stop is not asked: '+JSON.stringify(SR2.c));
// 10. Normalization Consistency (F1, F2, F3; Founder mission of 2026-11-19): week 0 with run d1 reported by the athlete and the watch (merged).
//   ncc-late-report (F1, cycle C1): a correction of run d3 (a symptom stop), then a watch report of d3 made before it and delivered after it: the
//     correction stays in force, conflicted, the late report is refused; the athlete corrects their d1 part, then a re-sync of the d1 watch report
//     made before that correction is delivered after it: in force, its measurement leads; a round trip; a review with nothing new; a restart.
//   ncc-merged-activity (F2): a correction of d3 carrying d1's merged watch activity, then a plain report of another session carrying it: both
//     refused, d1 flagged; a round trip; a review with nothing new; a restart.
//   ncc-quarantine (F3): the athlete disputes their d1 part against the watch voice: CONFLICTED; a round trip; a review with nothing new: still
//     CONFLICTED; a valid correction agreeing with the watch resolves it; a restart.
const NCC={};
const nccWeek=(id,act)=>{const r=recorder();r.onboard(athleteA({weeks:8,id}));const p=r.c.env.program,d=addDays(p.startDate,6),obs=liveSessions(r.c.env,0).map(s=>reportOf(r.c.env,s)),d1=obs.find(o=>o.sessionId==='w0-run-d1');
 obs.push({...d1,eventId:'dev-d1',actual:{...d1.actual},response:U3,source:{provider:'HEALTHKIT',activityId:act,quality:'WEARABLE_FULL'},canonicalActivityId:act});
 r.review('WEEKLY_REVIEW',at(d),{eligibility:ELIG(d),observations:obs},'w0');return {r,p,d,row:id=>r.c.env.actualLedger.find(o=>o.eventId===id&&!o.superseded),live:sid=>r.c.env.actualLedger.filter(o=>o.sessionId===sid&&!o.superseded&&!o.fact)};};
const nccRestart=(w,id)=>{const day=addDays(w.p.startDate,10),u={...athleteA({weeks:8,id}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};return w.r.restart(u,at(day,'10:00'));};
{const id='core-mac-ncc1',w=nccWeek(id,'HK-N1'),{r,d}=w,x=w.row('aif-w0-run-d3'),dn=addDays(d,1);
 const d1=w.live('w0-run-d1')[0],part=Object.keys(d1.provenance.parts).find(k=>k!=='dev-d1'),dev=d1.provenance.parts['dev-d1'];
 r.review('WEEKLY_REVIEW',at(d,'21:00'),{eligibility:ELIG(d),observations:[{sessionId:'w0-run-d1',occurrenceDate:d1.localDate,eventId:'d1-fix',correctionOf:part,correctedAt:at(d,'20:30'),reportedAt:at(d,'20:30'),actual:{...d1.actual},response:{...U3,effort:'ON_TARGET'}}]},'d1-fix');
 const rs=r.review('WEEKLY_REVIEW',at(d,'23:00'),{eligibility:ELIG(d),observations:[{sessionId:'w0-run-d1',occurrenceDate:d1.localDate,eventId:'dev-d1-v2',correctionOf:'dev-d1',correctedAt:at(d,'20:00'),reportedAt:at(d,'20:00'),actual:{...dev.actual,minutes:dev.actual.minutes+3},response:U3,source:{provider:'HEALTHKIT',activityId:'HK-N1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-N1'}]},'resync');
 r.review('WEEKLY_REVIEW',at(dn,'08:00'),{eligibility:ELIG(dn),observations:[{sessionId:x.sessionId,occurrenceDate:x.localDate,eventId:'d3-fix',correctionOf:x.eventId,correctedAt:at(dn,'07:00'),reportedAt:at(dn,'07:00'),actual:{completed:false,minutes:20,stop:{reason:'SYMPTOM'}},response:{...U3,recovery:'ADVERSE'}}]},'d3-fix');
 const late=r.review('WEEKLY_REVIEW',at(dn,'20:00'),{eligibility:ELIG(dn),observations:[{sessionId:x.sessionId,occurrenceDate:x.localDate,eventId:'d3-watch',reportedAt:at(d,'21:00'),actual:{...x.actual,minutes:x.actual.minutes+15},response:U3,source:{provider:'HEALTHKIT',activityId:'HK-N3',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-N3'}]},'late');
 r.roundtrip();w.r.c.env.actualLedger=JSON.parse(JSON.stringify(w.r.c.env.actualLedger));const d2=addDays(dn,1);r.review('WEEKLY_REVIEW',at(d2,'07:00'),{eligibility:ELIG(d2)},'next');const g=nccRestart(w,id);
 NCC.late={resync:rs.provenance?.excluded?.length??null,d1:w.live('w0-run-d1').map(o=>o.actual.minutes),d3:w.live('w0-run-d3').map(o=>o.eventId+(o.conflicted?'!':'')),refused:late.provenance?.excluded?.map(e=>e.reason),restart:g.status};
 journeys.push({name:'ncc-late-report',steps:r.steps});}
{const id='core-mac-ncc2',w=nccWeek(id,'HK-N2'),{r,d}=w,x=w.row('aif-w0-run-d3'),d8=addDays(d,2),z=w.row('aif-w0-run-d5');
 const a=r.review('WEEKLY_REVIEW',at(d8,'20:00'),{eligibility:ELIG(d8),observations:[{sessionId:x.sessionId,occurrenceDate:x.localDate,eventId:'d3-borrow',correctionOf:x.eventId,correctedAt:at(d8,'07:00'),reportedAt:at(d8,'07:00'),actual:{...x.actual,minutes:x.actual.minutes-5},response:x.response,source:{provider:'HEALTHKIT',activityId:'HK-N2',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-N2'}]},'borrow');
 r.roundtrip();w.r.c.env.actualLedger=JSON.parse(JSON.stringify(w.r.c.env.actualLedger));
 const b=r.review('WEEKLY_REVIEW',at(d8,'22:00'),{eligibility:ELIG(d8),observations:[{sessionId:z.sessionId,occurrenceDate:z.localDate,eventId:'d5-hk',reportedAt:at(d8,'21:00'),actual:{...z.actual},response:U3,source:{provider:'HEALTHKIT',activityId:'HK-N2',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-N2'}]},'reuse');
 const d9=addDays(d8,1);r.review('WEEKLY_REVIEW',at(d9,'07:00'),{eligibility:ELIG(d9)},'next');const g=nccRestart(w,id);
 const holders=w.r.c.env.actualLedger.filter(o=>!o.superseded&&!o.fact&&(o.canonicalActivityId==='HK-N2'||Object.values(o.provenance?.parts??{}).some(p=>p?.activityId==='HK-N2'))).map(o=>o.sessionId);
 NCC.merged={refused:[...(a.provenance?.excluded??[]),...(b.provenance?.excluded??[])].map(e=>e.reason),holders,d1:w.live('w0-run-d1').map(o=>o.conflicted===true),restart:g.status};
 journeys.push({name:'ncc-merged-activity',steps:r.steps});}
{const id='core-mac-ncc3',w=nccWeek(id,'HK-N4'),{r,d}=w,d1=w.live('w0-run-d1')[0],part=Object.keys(d1.provenance.parts).find(k=>k!=='dev-d1'),st=p=>p.weekEvidence?.rows?.find(x=>x.sessionId==='w0-run-d1')?.status;
 const a=r.review('WEEKLY_REVIEW',at(d,'21:00'),{eligibility:ELIG(d),observations:[{sessionId:'w0-run-d1',occurrenceDate:d1.localDate,eventId:'d1-dispute',correctionOf:part,correctedAt:at(d,'20:30'),reportedAt:at(d,'20:30'),actual:{...d1.actual,minutes:Math.round(d1.actual.minutes/2)},response:{...U3,recovery:'ADVERSE'}}]},'dispute');
 r.roundtrip();w.r.c.env.actualLedger=JSON.parse(JSON.stringify(w.r.c.env.actualLedger));const b=r.probe('WEEKLY_REVIEW',at(d,'22:00'),{eligibility:ELIG(d)},'again');
 const c=r.review('WEEKLY_REVIEW',at(d,'23:30'),{eligibility:ELIG(d),observations:[{sessionId:'w0-run-d1',occurrenceDate:d1.localDate,eventId:'d1-settle',correctionOf:'d1-dispute',correctedAt:at(d,'23:00'),reportedAt:at(d,'23:00'),actual:{...d1.actual},response:U3}]},'settle');
 const g=nccRestart(w,id);NCC.quarantine={dispute:st(a),again:st(b),settled:st(c),d1:w.live('w0-run-d1').map(o=>o.conflicted===true),restart:g.status};
 journeys.push({name:'ncc-quarantine',steps:r.steps});}
if(NCC.late.resync!==0||NCC.late.d3.join()!=='d3-fix!'||JSON.stringify(NCC.late.refused)!=='["DUPLICATE_CONFLICT_QUARANTINED"]'||NCC.late.restart!=='PROPOSED')throw new Error('NCC F1/C1: '+JSON.stringify(NCC.late));
if(JSON.stringify(NCC.merged.refused)!=='["ACTIVITY_BOUND_TO_TWO_SESSIONS","ACTIVITY_BOUND_TO_TWO_SESSIONS"]'||NCC.merged.holders.join()!=='w0-run-d1'||NCC.merged.restart!=='PROPOSED')throw new Error('NCC F2: '+JSON.stringify(NCC.merged));
if(NCC.quarantine.dispute!=='CONFLICTED'||NCC.quarantine.again!=='CONFLICTED'||NCC.quarantine.settled==='CONFLICTED'||NCC.quarantine.d1.join()!=='false'||NCC.quarantine.restart!=='PROPOSED')throw new Error('NCC F3: '+JSON.stringify(NCC.quarantine));
// 11. O-1 Conflict Evidence (SSCTR-NCC-01, SEC-NCC-02; Founder mission of 2026-11-19). Week 0 reported, then run d3 in two voices that conflict.
//   o1-stop-resync (SSCTR-NCC-01, scenario 21): the watch reports d3 done; the athlete's symptom stop for d3 is refused head-on and kept as a
//     voice; the watch re-syncs its own report: still CONFLICTED (FREEZE-5: COMPLETED); a round trip; a review with nothing new: CONFLICTED;
//     the watch re-syncs to the stop the athlete reported (they agree): settled; a restart.
//   o1-readiness (SEC-NCC-02): a hold, the readiness declaration, a run after it reported "not done", then the athlete's late symptom stop of
//     that run (refused head-on, kept); a round trip; a restart with no stated reason: ASK (the SB-1 question; FREEZE-5: PROPOSED); then with one.
const O1={};
{const id='core-mac-o1a',r=recorder();r.onboard(athleteA({weeks:8,id}));const p=r.c.env.program,d=addDays(p.startDate,6);
 const obs=liveSessions(r.c.env,0).map(s=>reportOf(r.c.env,s)),i=obs.findIndex(o=>o.sessionId==='w0-run-d3'),x=obs[i],m={...x.actual};delete m.rpe;
 obs[i]={...x,eventId:'dev-d3',actual:m,response:U3,source:{provider:'HEALTHKIT',activityId:'HK-O1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-O1'};
 r.review('WEEKLY_REVIEW',at(d),{eligibility:ELIG(d),observations:obs},'w0');
 const dev=obs[i],st=g=>g.weekEvidence?.rows?.find(z=>z.sessionId==='w0-run-d3')?.status;
 const a=r.review('WEEKLY_REVIEW',at(d,'21:00'),{eligibility:ELIG(d),observations:[{sessionId:dev.sessionId,occurrenceDate:dev.occurrenceDate,eventId:'app-stop',reportedAt:at(d,'20:30'),actual:{completed:false,minutes:20,stop:{reason:'SYMPTOM'}},response:{...U3,recovery:'ADVERSE'}}]},'stop');
 const b=r.review('WEEKLY_REVIEW',at(d,'23:00'),{eligibility:ELIG(d),observations:[{...dev,eventId:'dev-d3-v2',correctionOf:'dev-d3',correctedAt:at(d,'22:30'),reportedAt:at(d,'22:30')}]},'resync');
 r.roundtrip();r.c.env.actualLedger=JSON.parse(JSON.stringify(r.c.env.actualLedger));const c=r.probe('WEEKLY_REVIEW',at(d,'23:20'),{eligibility:ELIG(d)},'again');
 const e=r.review('WEEKLY_REVIEW',at(d,'23:50'),{eligibility:ELIG(d),observations:[{...dev,eventId:'dev-d3-v3',correctionOf:'dev-d3-v2',correctedAt:at(d,'23:40'),reportedAt:at(d,'23:40'),actual:{completed:false,minutes:20}}]},'agree');
 const day=addDays(p.startDate,10),u={...athleteA({weeks:8,id}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);u.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 const g=r.restart(u,at(day,'10:00')),row=r.c.env.actualLedger.find(o=>o.sessionId==='w0-run-d3'&&!o.superseded&&!o.fact);
 O1.stop={refused:a.provenance?.excluded?.map(z=>z.reason),stop:st(a),resync:st(b),again:st(c),settled:st(e),voices:Object.keys(row?.provenance?.parts??{}).sort(),conflicted:row?.conflicted===true,restart:g.status};
 journeys.push({name:'o1-stop-resync',steps:r.steps});}
{const id='core-mac-o1b',r=recorder();r.onboard(athleteA({weeks:8,id}));const p=r.c.env.program,d0=addDays(p.startDate,6);
 r.review('WEEKLY_REVIEW',at(d0),{eligibility:ELIG(d0),observations:liveSessions(r.c.env,0).map(s=>reportOf(r.c.env,s))},'w0');
 const h=addDays(p.startDate,8),rd=addDays(h,4);r.review('NOT_FEELING_100',at(h,'08:00'),notFeeling100WithSign(h),'hold');r.review('READINESS_DECLARATION',at(rd,'08:00'),readiness(rd),'ready');
 const s=liveSessions(r.c.env,2).find(x=>x.sport==='RUN'&&x.date>rd),b=reportOf(r.c.env,s,{tag:'-o1'});
 r.review('WEEKLY_REVIEW',at(s.date,'21:00'),{eligibility:ELIG(s.date),observations:[{...b,eventId:'nd-o1',actual:{completed:false,minutes:0},response:U3}]},'notdone');
 const late=r.review('WEEKLY_REVIEW',at(s.date,'23:00'),{eligibility:ELIG(s.date),observations:[{...b,eventId:'stop-o1',reportedAt:at(s.date,'22:30'),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:{...U3,recovery:'ADVERSE'}}]},'late-stop');
 r.roundtrip();const day=addDays(s.date,3),ask=r.restart(upd2(id,day,null),at(day,'10:00')),ok=r.restart(upd2(id,day,{reasonCategory:'SCHEDULE',nonclinical:true,weeks:0}),at(day,'10:00'));
 O1.ready={refused:late.provenance?.excluded?.map(z=>z.reason),ask:ask.status,missing:ask.missingInputs,ok:ok.status};
 journeys.push({name:'o1-readiness',steps:r.steps});}
if(JSON.stringify(O1.stop.refused)!=='["DUPLICATE_CONFLICT_QUARANTINED"]'||O1.stop.resync!=='CONFLICTED'||O1.stop.again!=='CONFLICTED'||O1.stop.settled!=='PARTIAL'||O1.stop.conflicted||O1.stop.voices.join()!=='app-stop,dev-d3-v3'||O1.stop.restart!=='PROPOSED')throw new Error('O-1 SSCTR-NCC-01: '+JSON.stringify(O1.stop));
if(JSON.stringify(O1.ready.refused)!=='["DUPLICATE_CONFLICT_QUARANTINED"]'||O1.ready.ask!=='ASK'||!O1.ready.missing?.some(k=>k.startsWith('athlete.pause.'))||O1.ready.ok!=='PROPOSED')throw new Error('O-1 SEC-NCC-02: '+JSON.stringify(O1.ready));
const input={journeys,anchors:['b','aa','h','ch','Z','_x','a-1','a_1'].map(id=>({id,prescription:{modality:'RUN',family:'EASY',durationMinutes:30}})),locales:['pt-BR','en-US','da-DK','nb-NO','cs-CZ']};
vm.runInThisContext(fs.readFileSync(path.join(HERE,'core-driver.js'),'utf8'));
const expected=JSON.parse(globalThis.__corefocal({core,contract,value},JSON.stringify(input)));
// The bundle's module ids, so the device test reaches the same three modules (written by build/link.mjs into the build manifest).
const manifest=JSON.parse(fs.readFileSync(path.join(P0,'ios','Sources','P0Host','Resources','build-manifest.json'),'utf8')),idOf=f=>manifest.modules.find(m=>m.file==='CoachingCore/src/'+f)?.id??null;
const modules={core:idOf('v1-safety-index.mjs'),contract:idOf('r5-contract.mjs'),value:idOf('value.mjs')};
if(Object.values(modules).some(x=>x===null))throw new Error('the bundle does not carry the modules; run build/link.mjs on this line first: '+JSON.stringify(modules));
const {defaultLocale:_d,...stableExpected}=expected;
fs.writeFileSync(OUT,JSON.stringify({driver:fs.readFileSync(path.join(HERE,'core-driver.js'),'utf8'),modules,inputJSON:JSON.stringify(input),expected:stableExpected},null,1)+'\n');
const summary=expected.journeys.map(j=>j.name+': '+j.steps.map(s=>s.status??s.op).join(' ')).join('\n');
console.log('CORE-C2-F01 restart doses (corrected = control): '+JSON.stringify(F01.corrected.runs.slice(0,2))+'; superseded rows in the corrected record: '+F01.corrected.superseded);
console.log('C-F01-1 r2: not done '+R2.notDone.cls+' '+JSON.stringify(R2.notDone.runs.slice(0,2))+' (control '+R2.control.cls+' '+JSON.stringify(R2.control.runs.slice(0,2))+'); disputed after readiness: '+R2.disputed.ask+' '+JSON.stringify(R2.disputed.missing)+' then '+R2.disputed.ok);
console.log('SEC-R2-03/-04: refused event id '+JSON.stringify(SR2.a.runs?.slice(0,1))+' = plain; refused activity '+JSON.stringify(SR2.b.runs?.slice(0,1))+' = plain; nothing replaced; readiness then refused correction: '+SR2.c.ask+' '+JSON.stringify(SR2.c.missing)+' then '+SR2.c.ok);
console.log('NCC F1/F2/F3: late report '+JSON.stringify(NCC.late.refused)+', the correction '+NCC.late.d3.join()+' in force; late re-sync in force (d1 '+JSON.stringify(NCC.late.d1)+'); merged activity reused '+JSON.stringify(NCC.merged.refused)+', held by '+NCC.merged.holders.join()+'; dispute '+NCC.quarantine.dispute+', again '+NCC.quarantine.again+', settled '+NCC.quarantine.settled+'; restarts '+[NCC.late.restart,NCC.merged.restart,NCC.quarantine.restart].join(' '));
console.log('O-1: stop refused '+JSON.stringify(O1.stop.refused)+' and kept ('+O1.stop.voices.join()+'); after the re-sync '+O1.stop.resync+', again '+O1.stop.again+', agreed '+O1.stop.settled+'; late stop after readiness '+JSON.stringify(O1.ready.refused)+': restart '+O1.ready.ask+' '+JSON.stringify(O1.ready.missing)+' then '+O1.ready.ok);
console.log(summary+'\nanchors equal across locales: '+(new Set(Object.values(expected.anchors)).size===1)+'; localeCompare calls: '+expected.localeCompareCalls+'\ndigest '+expected.digest);
