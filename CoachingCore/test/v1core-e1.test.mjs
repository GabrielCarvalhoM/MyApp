// V1 Core Safety & Lifecycle, E-1 (SSCTR L5; IOS_RUN_REPORT_INTEGRATION_CONTRACT §6): a re-synchronization never erases what the athlete said.
// One execution reported in two voices (contract §2) is one merged row that keeps each report's own part; a correction replaces only its
// author's part, and the row it makes is the corrected report merged again with the reports still in force: the same row as if the corrected
// report had come in its corrected form from the start.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../src/v1-safety-index.mjs';
import {normalizeObservations} from '../src/r6-provenance.mjs';
import {client,athleteA,reportOf,liveSessions,at,ELIG,addDays} from './v1core-helpers.mjs';

const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
/** The two voices of one run of plan `c`: the device's measurement and the athlete's declaration (contract §2), for one of the four cases. */
function voices(c,kind){
 const s=liveSessions(c.env,0).find(x=>x.sport==='RUN'),base=reportOf(c.env,s),{response:_r,eventId:_e,...body}=base,measured={...base.actual};delete measured.rpe;
 const stopped=kind==='SYMPTOM';
 const device={...body,eventId:'dev-1',actual:{...measured,...(stopped?{completed:false,minutes:20}:{})},source:{provider:'HEALTHKIT',activityId:'HK-1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-1',response:{...UNKNOWN}};
 const said={ADVERSE:{actual:{completed:true,rpe:8},response:{performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'UNKNOWN'}},
  FATIGUE:{actual:{completed:true,rpe:9},response:{performance:'UNDER',recovery:'COMPATIBLE',effort:'HARDER',nextDayFunction:'IMPAIRED'}},
  HEAT:{actual:{completed:true,rpe:7,conditions:['HEAT']},response:{performance:'UNDER',recovery:'COMPATIBLE',effort:'HARDER',nextDayFunction:'NORMAL'}},
  SYMPTOM:{actual:{completed:false,minutes:20,stop:{reason:'SYMPTOM'}},response:{performance:'UNDER',recovery:'ADVERSE',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'}}}[kind];
 const athlete={sessionId:s.id,occurrenceDate:base.occurrenceDate,eventId:'ath-1',...said};
 const resync={...device,eventId:'dev-1b',correctionOf:'dev-1',correctedAt:at(addDays(s.date,1),'07:00'),actual:{...device.actual,minutes:device.actual.minutes+1}};
 return {s,device,athlete,resync};
}
const live=(env,sid)=>env.actualLedger.filter(o=>!o.fact&&o.sessionId===sid&&!o.superseded);
const said=o=>({response:o.response,rpe:o.actual?.rpe??null,conditions:o.actual?.conditions??null,stop:o.actual?.stop??null});

for(const kind of ['ADVERSE','FATIGUE','HEAT','SYMPTOM'])for(const order of ['device first','athlete first','both at once']){
 test(`E-1 ${kind}, ${order}: the device re-synchronization keeps every fact and response the athlete declared`,()=>{
  const c=client(S);c.onboard(athleteA({weeks:8,id:'e1-'+kind}));const {s,device,athlete,resync}=voices(c,kind),d0=s.date,d1=addDays(s.date,1);
  if(order==='both at once')c.review('WEEKLY_REVIEW',at(d0,'21:00'),{eligibility:ELIG(d0),observations:[device,athlete]},'both');
  else{const [x,y]=order==='device first'?[device,athlete]:[athlete,device];c.review('WEEKLY_REVIEW',at(d0,'21:00'),{eligibility:ELIG(d0),observations:[x]},'one');c.review('WEEKLY_REVIEW',at(d0,'22:00'),{eligibility:ELIG(d0),observations:[y]},'two');}
  const merged=live(c.env,s.id);assert.equal(merged.length,1);const before=said(merged[0]),adverseBefore=c.probe('WEEKLY_REVIEW',at(d1,'06:00'),{eligibility:ELIG(d1)},'pre').weekEvidence?.adverseSessions;
  const r=c.review('WEEKLY_REVIEW',at(d1,'20:00'),{eligibility:ELIG(d1),observations:[resync]},'resync');
  const after=live(c.env,s.id);assert.equal(after.length,1,'one live row');assert.equal(after[0].conflicted,undefined);
  assert.deepEqual(said(after[0]),before,'what the athlete said is in force after the re-synchronization');
  assert.equal(after[0].actual.minutes,resync.actual.minutes,'what the device measured is the corrected measurement');
  assert.equal(r.weekEvidence?.adverseSessions,adverseBefore,'the adverse reading is unchanged');
  const old=c.env.actualLedger.find(o=>o.superseded&&o.supersededBy==='dev-1b');assert.ok(old,'the replaced row stays on record, annotated');
 });
}

test('E-1: the corrected row is the row the corrected reports would have made from the start (order-independent)',()=>{
 const c=client(S);c.onboard(athleteA({weeks:8,id:'e1-asif'}));const {s,device,athlete,resync}=voices(c,'ADVERSE');
 const opts={athleteId:c.env.program.athleteId,asOf:at(addDays(s.date,1),'20:00'),timezoneOffsetMinutes:c.env.program.timezoneOffsetMinutes??0};
 const viaCorrection=normalizeObservations([device,athlete,resync],opts).accepted,direct=normalizeObservations([{...resync,eventId:'dev-1b',correctionOf:undefined,correctedAt:undefined},athlete],opts).accepted;
 const core=o=>({sessionId:o.sessionId,actual:o.actual,response:o.response,conflicted:!!o.conflicted});
 assert.deepEqual(viaCorrection.map(core),direct.map(core));
});

test('E-1: the athlete edits only the athlete part; the device measurement stays',()=>{
 const c=client(S);c.onboard(athleteA({weeks:8,id:'e1-edit'}));const {s,device,athlete}=voices(c,'ADVERSE'),d1=addDays(s.date,1);
 c.review('WEEKLY_REVIEW',at(s.date,'21:00'),{eligibility:ELIG(s.date),observations:[device,athlete]},'both');
 const edit={...athlete,eventId:'ath-1b',correctionOf:'ath-1',correctedAt:at(d1,'07:00'),actual:{completed:true,rpe:6},response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}};
 c.review('WEEKLY_REVIEW',at(d1,'20:00'),{eligibility:ELIG(d1),observations:[edit]},'edit');
 const row=live(c.env,s.id);assert.equal(row.length,1);assert.equal(row[0].response.recovery,'COMPATIBLE');assert.equal(row[0].actual.rpe,6);
 assert.equal(row[0].actual.minutes,device.actual.minutes,'the measured minutes stay');
 assert.ok(row[0].provenance.parts['dev-1'],'the device part is in force');
});

test('E-1: a re-synchronization that disagrees with the athlete on what happened is a conflict, never resolved by arrival order',()=>{
 const c=client(S);c.onboard(athleteA({weeks:8,id:'e1-conflict'}));const {s,device,athlete,resync}=voices(c,'ADVERSE'),d1=addDays(s.date,1);
 c.review('WEEKLY_REVIEW',at(s.date,'21:00'),{eligibility:ELIG(s.date),observations:[device,athlete]},'both');
 c.review('WEEKLY_REVIEW',at(d1,'20:00'),{eligibility:ELIG(d1),observations:[{...resync,actual:{...resync.actual,completed:false,minutes:5}}]},'disagree');
 const row=live(c.env,s.id);assert.equal(row.length,1);assert.equal(row[0].conflicted,true);
});

test('E-1: an exact replay of the re-synchronization and a persist-restore round trip change nothing',()=>{
 const c=client(S);c.onboard(athleteA({weeks:8,id:'e1-replay'}));const {s,device,athlete,resync}=voices(c,'HEAT'),d1=addDays(s.date,1),d2=addDays(s.date,2);
 c.review('WEEKLY_REVIEW',at(s.date,'21:00'),{eligibility:ELIG(s.date),observations:[device,athlete]},'both');
 c.review('WEEKLY_REVIEW',at(d1,'20:00'),{eligibility:ELIG(d1),observations:[resync]},'resync');
 const once=JSON.stringify(live(c.env,s.id));
 c.review('WEEKLY_REVIEW',at(d2,'20:00'),{eligibility:ELIG(d2),observations:[resync]},'replay');
 assert.equal(JSON.stringify(live(c.env,s.id)),once);
 const r=client(S,JSON.parse(JSON.stringify(c.env)));
 assert.equal(JSON.stringify(r.probe('WEEKLY_REVIEW',at(d2,'21:00'),{eligibility:ELIG(d2)},'n')),JSON.stringify(c.probe('WEEKLY_REVIEW',at(d2,'21:00'),{eligibility:ELIG(d2)},'n')));
});

test('E-1: a merged row recorded without parts (before this change) is corrected as before',()=>{
 const c=client(S);c.onboard(athleteA({weeks:8,id:'e1-legacy'}));const {s,device,athlete,resync}=voices(c,'ADVERSE'),d1=addDays(s.date,1);
 c.review('WEEKLY_REVIEW',at(s.date,'21:00'),{eligibility:ELIG(s.date),observations:[device,athlete]},'both');
 const legacy=client(S,{...JSON.parse(JSON.stringify(c.env)),actualLedger:JSON.parse(JSON.stringify(c.env.actualLedger)).map(o=>{if(o.provenance?.parts)delete o.provenance.parts;return o;})});
 assert.ok(!legacy.env.actualLedger.some(o=>o.provenance?.parts));
 legacy.review('WEEKLY_REVIEW',at(d1,'20:00'),{eligibility:ELIG(d1),observations:[resync]},'resync');
 assert.equal(live(legacy.env,s.id)[0].response.recovery,'UNKNOWN','legacy: the documented limitation');
 c.review('WEEKLY_REVIEW',at(d1,'20:00'),{eligibility:ELIG(d1),observations:[resync]},'resync');
 assert.equal(live(c.env,s.id)[0].response.recovery,'ADVERSE','control: the same record with its parts keeps the athlete response');
});
