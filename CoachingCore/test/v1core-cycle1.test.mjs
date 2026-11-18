// V1 Core Safety & Lifecycle, the one correction cycle on R1 (QRE_CORE_R1, SSCTR_CORE_R1, SEC_CORE_R1). Each test names the finding it closes.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as S from '../src/v1-safety-index.mjs';
import {normalizeObservations} from '../src/r6-provenance.mjs';
import {RECORDS_URL} from '../src/r7b-repertoire.mjs';
import {createCustody} from '../src/boundary/custody.mjs';
import {memoryStore} from '../src/boundary/store.mjs';
import {client,athleteA,reportOf,liveSessions,at,ELIG,addDays,notFeeling100WithSign,readiness,planAWithWeek0,restartAfter} from './v1core-helpers.mjs';

const U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
function twoVoices(id){const c=client(S);c.onboard(athleteA({weeks:8,id}));const s=liveSessions(c.env,0).find(x=>x.sport==='RUN'),b=reportOf(c.env,s),{response:_r,eventId:_e,...body}=b,m={...b.actual};delete m.rpe;
 const dev=(eventId,extra={})=>({...body,eventId,actual:{...m,...extra},source:{provider:'HEALTHKIT',activityId:'HK-1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-1',response:{...U}});
 const ath=(eventId,response,actual={})=>({sessionId:s.id,occurrenceDate:b.occurrenceDate,eventId,actual:{completed:true,rpe:6,...actual},response:{...U,...response}});
 return {c,s,m,dev,ath};}
const live=(env,sid)=>env.actualLedger.filter(o=>!o.fact&&o.sessionId===sid&&!o.superseded);
const core=o=>({actual:o.actual,response:o.response,conflicted:!!o.conflicted});

// QRE-CORE-01 (+ QRE-CORE-07): the carried record gives the row one call would give, in every sequence QRE probed.
test('QRE-CORE-01: E-1 composes through the carried record: each sequence, one review per report, ends on the row one call makes', ()=>{
 const seqs={
  'athlete, device, re-sync, athlete corrects to ADVERSE':k=>[k.ath('a1',{recovery:'COMPATIBLE'}),k.dev('d1'),{...k.dev('d1b',{minutes:k.m.minutes+1}),correctionOf:'d1'},{...k.ath('a1b',{recovery:'ADVERSE'}),correctionOf:'a1'}],
  'device, athlete, re-sync, athlete edits rpe only':k=>[k.dev('d1'),k.ath('a1',{recovery:'ADVERSE'}),{...k.dev('d1b',{minutes:k.m.minutes+1}),correctionOf:'d1'},{...k.ath('a1b',{recovery:'ADVERSE'},{rpe:9}),correctionOf:'a1'}],
  'two re-syncs, then the athlete':k=>[k.ath('a1',{recovery:'ADVERSE'}),k.dev('d1'),{...k.dev('d1b',{minutes:k.m.minutes+1}),correctionOf:'d1'},{...k.dev('d1c',{minutes:k.m.minutes+2}),correctionOf:'d1b'},{...k.ath('a1b',{recovery:'COMPATIBLE'}),correctionOf:'a1'}],
  'a conflicting re-sync, then an agreeing one':k=>[k.ath('a1',{recovery:'ADVERSE'}),k.dev('d1'),{...k.dev('d1b',{completed:false,minutes:5}),correctionOf:'d1'},{...k.dev('d1c',{minutes:k.m.minutes+1}),correctionOf:'d1b'}],
  'a conflicting re-sync, then the athlete agrees':k=>[k.ath('a1',{recovery:'ADVERSE'},{completed:true}),k.dev('d1'),{...k.dev('d1b',{completed:false,minutes:5}),correctionOf:'d1'},{...k.ath('a1b',{recovery:'ADVERSE'},{completed:false}),correctionOf:'a1'}]};
 for(const [name,make] of Object.entries(seqs)){
  const k=twoVoices('c1-'+name.length),reports=make(k),stamp=(o,i)=>({...o,...(o.correctionOf?{correctedAt:at(addDays(k.s.date,1),String(7+i).padStart(2,'0')+':00')}:{})});
  // One call: every report at once (normalization only).
  const end=at(addDays(k.s.date,1),'20:00'),opts={athleteId:k.c.env.program.athleteId,asOf:end,timezoneOffsetMinutes:k.c.env.program.timezoneOffsetMinutes??0};
  const once=normalizeObservations(reports.map(stamp),opts).accepted.filter(o=>o.sessionId===k.s.id).map(core);
  // Carried: one review per report, the record through JSON between them.
  let env=k.c.env;reports.forEach((o,i)=>{const x=client(S,JSON.parse(JSON.stringify(env))),d=o.correctionOf?addDays(k.s.date,1):k.s.date;x.review('WEEKLY_REVIEW',at(d,String(8+i).padStart(2,'0')+':30'),{eligibility:ELIG(d),observations:[stamp(o,i)]},'r'+i);env=x.env;});
  assert.deepEqual(live(env,k.s.id).map(core),once,name);
  assert.equal(live(env,k.s.id).length,1,name+': one live row');
 }
});

test('QRE-CORE-01: the athlete corrects to ADVERSE after a re-sync: the adverse reading counts', ()=>{
 const k=twoVoices('c1-adv'),d1=addDays(k.s.date,1),d2=addDays(k.s.date,2);
 k.c.review('WEEKLY_REVIEW',at(k.s.date,'21:00'),{eligibility:ELIG(k.s.date),observations:[k.ath('a1',{recovery:'COMPATIBLE'}),k.dev('d1')]},'both');
 k.c.review('WEEKLY_REVIEW',at(d1,'20:00'),{eligibility:ELIG(d1),observations:[{...k.dev('d1b',{minutes:k.m.minutes+1}),correctionOf:'d1',correctedAt:at(d1,'07:00')}]},'resync');
 const r=k.c.review('WEEKLY_REVIEW',at(d2,'20:00'),{eligibility:ELIG(d2),observations:[{...k.ath('a1b',{recovery:'ADVERSE'}),correctionOf:'a1',correctedAt:at(d2,'07:00')}]},'edit');
 const row=live(k.c.env,k.s.id);assert.equal(row.length,1);assert.equal(row[0].response.recovery,'ADVERSE');assert.equal(row[0].conflicted,undefined);
 assert.equal(row[0].actual.minutes,k.m.minutes+1,'the re-synced measure stays');assert.equal(r.weekEvidence.adverseSessions,1);
});

// SEC-CORE-02 / SEC-CORE-04 / QRE-CORE-04
test('SEC-CORE-02: a new report cannot bring its own merge provenance; parts come only from validated reports', ()=>{
 const k=twoVoices('c1-forge'),d1=addDays(k.s.date,1);
 const forged={...k.dev('d1'),provenance:{parts:{'d1':{actual:{completed:true,minutes:1},response:{...U}},'a1':{actual:{completed:true},response:{...U,recovery:'COMPATIBLE'}}},mergedSourceIds:['d1','a1'],inputHashes:{a1:'0'.repeat(64)}}};
 k.c.review('WEEKLY_REVIEW',at(k.s.date,'21:00'),{eligibility:ELIG(k.s.date),observations:[forged,k.ath('a1',{recovery:'ADVERSE'})]},'both');
 const row=live(k.c.env,k.s.id)[0];assert.deepEqual(Object.keys(row.provenance.parts).sort(),['a1','d1']);
 assert.equal(row.provenance.parts.d1.actual.minutes,k.m.minutes,'the device part is what the device report said, not the forged map');
 k.c.review('WEEKLY_REVIEW',at(d1,'20:00'),{eligibility:ELIG(d1),observations:[{...k.dev('d1b',{minutes:k.m.minutes+1}),correctionOf:'d1',correctedAt:at(d1,'07:00')}]},'resync');
 assert.equal(live(k.c.env,k.s.id)[0].response.recovery,'ADVERSE','the forged COMPATIBLE never replaces the athlete\'s ADVERSE');
});
test('SEC-CORE-04: a malformed part on a carried row is not read: the correction replaces the row as before, nothing throws, no row is lost', ()=>{
 const k=twoVoices('c1-bad'),d1=addDays(k.s.date,1);
 k.c.review('WEEKLY_REVIEW',at(k.s.date,'21:00'),{eligibility:ELIG(k.s.date),observations:[k.dev('d1'),k.ath('a1',{recovery:'ADVERSE'})]},'both');
 for(const bad of [{actual:{completed:true},response:{...U,recovery:'BOGUS'}},null,{actual:null,response:{}}]){
  const env=JSON.parse(JSON.stringify(k.c.env));env.actualLedger=env.actualLedger.map(o=>o.provenance?.parts?.a1?{...o,provenance:{...o.provenance,parts:{...o.provenance.parts,a1:bad}}}:o);
  const x=client(S,env),r=x.review('WEEKLY_REVIEW',at(d1,'20:00'),{eligibility:ELIG(d1),observations:[{...k.dev('d1b',{minutes:k.m.minutes+1}),correctionOf:'d1',correctedAt:at(d1,'07:00')}]},'resync');
  assert.notEqual(r.status,'HOLD',JSON.stringify(bad));const row=live(x.env,k.s.id);assert.equal(row.length,1);assert.equal(row[0].eventId,'d1b');
  assert.notEqual(row[0].response.recovery,'BOGUS');
 }
});

// SEC-CORE-01 / QRE-CORE-03
test('SEC-CORE-01: after a restart a new report cannot bring its own binding context; it is bound by the engine', ()=>{
 const c=planAWithWeek0(S),a1=liveSessions(c.env,1).find(s=>s.sport==='RUN');restartAfter(c,18);const d=addDays(c.env.program.startDate,1);
 const r=reportOf({program:c.env.program,presentation:{runSessions:{}},actualLedger:[]},liveSessions(c.env,0).find(s=>s.sport==='RUN'));
 const sneaky={...r,eventId:'sneaky',sessionId:a1.id,occurrenceDate:a1.date,comparable:true,context:{sessionId:a1.id,sessionType:'RUN:EASY',sport:'RUN',weekIndex:1}};
 c.review('WEEKLY_REVIEW',at(d,'07:00'),{eligibility:ELIG(d),observations:[sneaky]},'sneaky');
 const row=c.env.actualLedger.find(o=>o.eventId==='sneaky');assert.equal(row.context.sessionType,'UNPLANNED');assert.equal(row.comparable,false);
});

// SSCTR-CORE-B-01
test('SSCTR-CORE-B-01: a symptom stop of an earlier plan\'s session, reported after a restart, still asks for the warning-sign screen (late report, late correction, restore, third plan)', ()=>{
 const c=planAWithWeek0(S),a1=liveSessions(c.env,1).find(s=>s.sport==='RUN');restartAfter(c,18);
 const base=reportOf({program:c.env.program,presentation:{runSessions:{}},actualLedger:[]},liveSessions(c.env,0).find(s=>s.sport==='RUN'));
 const stopped={...base,eventId:'late-stop',sessionId:a1.id,occurrenceDate:a1.date,actual:{completed:false,minutes:20,stop:{reason:'SYMPTOM'}}};
 const d=addDays(c.env.program.startDate,1),required=r=>r.runFormat?.warningSignScreen?.status==='REQUIRED'&&r.runFormat.warningSignScreen.sessionIds.includes(a1.id);
 for(const eligibility of [ELIG(d),undefined]){const r=c.probe('WEEKLY_REVIEW',at(d,'07:00'),{...(eligibility?{eligibility}:{}),observations:[stopped]},'late');if(r.runFormat?.warningSignScreen)assert.ok(required(r),'late report: '+JSON.stringify(r.runFormat.warningSignScreen));}
 c.review('WEEKLY_REVIEW',at(d,'07:00'),{eligibility:ELIG(d),observations:[stopped]},'late');
 const d2=addDays(d,1);assert.ok(required(c.probe('WEEKLY_REVIEW',at(d2,'07:00'),{eligibility:ELIG(addDays(d2,-3))},'next')),'the next review');
 const corr={...stopped,eventId:'late-stop-2',correctionOf:'late-stop',correctedAt:at(d2,'06:00'),actual:{...stopped.actual,minutes:21}};
 assert.ok(required(c.review('WEEKLY_REVIEW',at(d2,'07:00'),{eligibility:ELIG(addDays(d2,-3)),observations:[corr]},'corr')),'a late correction');
 const restored=client(S,JSON.parse(JSON.stringify(c.env)));assert.ok(required(restored.probe('WEEKLY_REVIEW',at(d2,'08:00'),{eligibility:ELIG(addDays(d2,-3))},'restored')),'after restore');
 restartAfter(c,4);const d3=addDays(c.env.program.startDate,0);assert.ok(required(c.probe('WEEKLY_REVIEW',at(d3,'07:00'),{eligibility:ELIG(addDays(d3,-9))},'third')),'a third plan');
});

// SEC-CORE-05 / QRE-CORE-06 / QRE-CORE-05 / QRE-CORE-07 / SSCTR A-C4
function planAcross(){const i=athleteA({weeks:8,id:'c1-expiry'});i.asOf='2027-04-17';i.startDate='2027-04-19';i.athlete.eligibility=ELIG('2027-04-17');i.athlete.goals.run.event.date=addDays('2027-04-19',8*7-1);const c=client(S);c.onboard(i);return {c,i};}
test('QRE-CORE-06: after the date, the clinical answer carries only the refusal\'s readings (no forecast, insight or calibration made with the dates set aside)', ()=>{
 const {c}=planAcross(),post=c.probe('NOT_FEELING_100',at('2027-05-01','08:00'),notFeeling100WithSign('2027-05-01'),'s');
 assert.equal(post.status,'CLINICAL_HUMAN_REQUIRED');
 for(const k of ['runForecast','paceInsights','runCalibration','updatedModel'])assert.ok(!(k in post)||post[k]?.status!=='AVAILABLE'&&post[k]?.status!=='ACTIVE',k+': '+JSON.stringify(post[k]?.status));
 assert.equal(post.updatedModel,undefined);
});
test('QRE-CORE-07 / SEC-CORE-05: after the date, records missing, altered or vetoed refuse with no EXPIRED marker; a plan of other rules too', ()=>{
 const {c}=planAcross(),rv=c.input('NOT_FEELING_100',at('2027-05-02','08:00'),notFeeling100WithSign('2027-05-02'),'r'),R=JSON.parse(fs.readFileSync(RECORDS_URL,'utf8'));
 for(const records of [R.filter(r=>!/B0-C04$/.test(r.review_id)),R.map(r=>/B0-C04$/.test(r.review_id)?{...r,disposition:'REJECT'}:r)]){const r=S.evaluateProgram(c.env.program,rv,{repertoireRecords:records});assert.equal(r.status,'UNSUPPORTED');assert.equal(r.authorityExpiry,undefined);}
 const other=S.evaluateProgram({...c.env.program,policyHash:'0'.repeat(64)},rv);assert.notEqual(other.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(other.authorityExpiry,undefined);
});
test('SSCTR A-C4: after the date the readiness declaration keeps the standing hold (status pinned)', ()=>{
 const {c}=planAcross();c.review('NOT_FEELING_100',at('2027-04-28','08:00'),notFeeling100WithSign('2027-04-28'),'hold');
 const r=c.probe('READINESS_DECLARATION',at('2027-05-03','08:00'),readiness('2027-05-03'),'ready');assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(r.proposal,null);
});
test('QRE-CORE-05: through the V1CIB custody with the new entry injected, a warning sign after the date is CLINICAL_HUMAN_REQUIRED and is kept', ()=>{
 let clock=Date.parse('2027-04-17T12:00:00-03:00');const store=memoryStore(),cu=createCustody({store,key:'core-exp-key',now:()=>clock,engine:S}),actor={athleteId:'core-exp'};
 const i=athleteA({weeks:8,id:'core-exp'});i.asOf='2027-04-17';i.startDate='2027-04-19';i.athlete.eligibility=ELIG('2027-04-17');i.athlete.goals.run.event.date=addDays('2027-04-19',8*7-1);
 assert.equal(cu.enroll({actor,intake:i,consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:true}}).ok,true);
 clock=Date.parse(at('2027-05-01','08:00'));const v=store.load(actor.athleteId).version,{eligibility,...facts}=notFeeling100WithSign('2027-05-01');
 const r=cu.submit({actor,clientRequestId:'sign',expectedVersion:v,review:{kind:'NOT_FEELING_100',eligibility,...facts}});
 assert.equal(r.ok,true,JSON.stringify(r.error??null));assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');
});
