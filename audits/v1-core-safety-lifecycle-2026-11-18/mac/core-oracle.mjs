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
console.log(summary+'\nanchors equal across locales: '+(new Set(Object.values(expected.anchors)).size===1)+'; localeCompare calls: '+expected.localeCompareCalls+'\ndigest '+expected.digest);
