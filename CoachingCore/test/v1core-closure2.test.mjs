// V1 Core Safety & Lifecycle closure-2 (Founder mission of 2026-11-18): SSCTR-CORE-B-01-R and QRE-CORE-R2-01. Result tests only: every
// decision asserted is the engine's answer; no training rule is written here.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../src/v1-safety-index.mjs';
import {RUN_FORMAT_EMITTED,RUN_REPORT_RECEIVED} from '../src/v1-run-format-index.mjs';
import {client,athleteA,reportOf,liveSessions,at,ELIG,addDays,notFeeling100WithSign,planAWithWeek0,restartAfter} from './v1core-helpers.mjs';

const screenOf=r=>r.runFormat?.warningSignScreen??null;
const asks=(r,sid)=>screenOf(r)?.status==='REQUIRED'&&screenOf(r).sessionIds.includes(sid);
const stopFacts=(env,reportId)=>env.runFormatRecord.filter(x=>x.fact===RUN_REPORT_RECEIVED&&x.report?.stop?.reason==='SYMPTOM'&&(reportId===undefined||x.report.reportId===reportId));
/** No native run session is executable in an answer (nothing prescribed by the answer that holds for the screen). */
const noExecutable=r=>Object.values(r.runSessions??{}).every(s=>s?.executable!==true);

/** Plan A with week 0 reported; a plan-A week-1 run session the athlete stopped for a symptom; a restart into plan B 18 days in. */
function lateStopSetup(id='c2-b01r'){
 const c=planAWithWeek0(S,{id}),a1=liveSessions(c.env,1).find(s=>s.sport==='RUN'),planAIds=new Set(c.env.program.weeks.flatMap(w=>w.sessions.map(s=>s.id)));
 assert.equal(restartAfter(c,18,{id}).status,'PROPOSED');
 assert.ok(!c.env.program.weeks.some(w=>w.sessions.some(s=>s.id===a1.id)),'plan B does not hold the plan-A session');
 const base=reportOf({program:c.env.program,presentation:{runSessions:{}},actualLedger:[]},liveSessions(c.env,0).find(s=>s.sport==='RUN'));
 const stopped={...base,eventId:'late-stop',sessionId:a1.id,occurrenceDate:a1.date,actual:{completed:false,minutes:20,stop:{reason:'SYMPTOM'}}};
 return {c,a1,stopped,planAIds,id};
}

// SSCTR-CORE-B-01-R: the stop arrives in a review the engine does not accept (no eligibility: ASK). Steps 1 to 10 of the closure-2 mission.
test('SSCTR-CORE-B-01-R: a late earlier-plan symptom stop sent in an ASK review is kept as a stop fact and asks the screen until a later screen answers it', ()=>{
 const {c,a1,stopped,id}=lateStopSetup(),d=addDays(c.env.program.startDate,1);
 // 3–4. The late report arrives in a review with no eligibility: the engine asks (ASK); the screen is asked now, and the stop is recorded.
 const r1=c.review('WEEKLY_REVIEW',at(d,'07:00'),{observations:[stopped]},'ask');
 assert.equal(r1.status,'ASK');assert.equal(r1.proposal??null,null);assert.ok(asks(r1,a1.id),'the ASK answer names the screen');assert.ok(noExecutable(r1));
 assert.equal(stopFacts(c.env,'late-stop').length,1,'one stop fact for the late report');
 const fact=stopFacts(c.env,'late-stop')[0];assert.equal(fact.report.standing,false,'a stop only: no report in force, no distance, no credit');assert.equal(fact.report.distanceKm,null);
 assert.equal(c.env.actualLedger.filter(o=>!o.fact&&o.sessionId===a1.id).length,0,'no execution row is made of it');
 // 5. The next review, without the report, with a screen dated before the stop: still asked.
 const d2=addDays(d,1),r2=c.review('WEEKLY_REVIEW',at(d2,'07:00'),{eligibility:ELIG(addDays(d2,-3))},'next');
 assert.ok(asks(r2,a1.id),'the next review: '+JSON.stringify(screenOf(r2)));
 // 6. Persisted and restored between reviews.
 const restored=client(S,JSON.parse(JSON.stringify(c.env)));
 assert.ok(asks(restored.probe('WEEKLY_REVIEW',at(d2,'08:00'),{eligibility:ELIG(addDays(d2,-3))},'restored'),a1.id),'after restore');
 // 7. A late correction of the report (the athlete edits its minutes): the stop is not removed by a correction.
 const corr={...stopped,eventId:'late-stop-2',correctionOf:'late-stop',correctedAt:at(d2,'06:00'),actual:{...stopped.actual,minutes:21}};
 assert.ok(asks(c.review('WEEKLY_REVIEW',at(d2,'09:00'),{observations:[corr]},'corr'),a1.id),'a late correction, itself in an ASK review');
 const corrNoStop={...stopped,eventId:'late-stop-3',correctionOf:'late-stop',correctedAt:at(d2,'09:30'),actual:{completed:false,minutes:20}};
 assert.ok(asks(c.review('WEEKLY_REVIEW',at(d2,'10:00'),{observations:[corrNoStop]},'corr2'),a1.id),'a correction that drops the stop does not remove it');
 // 8. The same report sent again (in an ASK review and in an accepted one) adds no fact.
 const before=stopFacts(c.env,'late-stop').length;
 c.review('WEEKLY_REVIEW',at(d2,'11:00'),{observations:[stopped]},'dup-ask');
 c.review('WEEKLY_REVIEW',at(d2,'12:00'),{eligibility:ELIG(addDays(d2,-3)),observations:[stopped]},'dup-accepted');
 assert.equal(stopFacts(c.env,'late-stop').length,before,'a duplicate adds nothing');
 assert.ok(c.env.actualLedger.filter(o=>!o.fact&&o.sessionId===a1.id&&!o.superseded).length<=1,'at most one live row for the session');
 // 9. A third plan: still asked.
 assert.equal(restartAfter(c,4,{id}).status,'PROPOSED');
 const d3=c.env.program.startDate;assert.ok(asks(c.probe('WEEKLY_REVIEW',at(d3,'07:00'),{eligibility:ELIG(addDays(d3,-9))},'third'),a1.id),'a third plan');
 // 10. The existing screen, answered after the stop (no sign), clears it: no permanent block.
 const d4=addDays(d3,1),cleared=c.review('WEEKLY_REVIEW',at(d4,'07:00'),{eligibility:ELIG(d4)},'screened');
 assert.ok(!asks(cleared,a1.id),'a screen answered after the stop answers it: '+JSON.stringify(screenOf(cleared)));
 assert.ok(!asks(c.probe('WEEKLY_REVIEW',at(addDays(d4,1),'07:00'),{eligibility:ELIG(d4)},'after'),a1.id),'and stays answered');
});

test('SSCTR-CORE-B-01-R: parity with a planned session; a screen dated before the stop or on another athlete answers nothing', ()=>{
 const {c,a1,stopped}=lateStopSetup('c2-b01r-parity'),d=addDays(c.env.program.startDate,1);
 const b1=liveSessions(c.env,0).find(s=>s.sport==='RUN'),planned={...reportOf(c.env,b1),eventId:'planned-stop',actual:{completed:false,minutes:15,stop:{reason:'SYMPTOM'}}};
 const r=c.review('WEEKLY_REVIEW',at(d,'07:00'),{observations:[stopped,planned]},'ask');
 assert.equal(r.status,'ASK');assert.equal(stopFacts(c.env,'late-stop').length,1);assert.equal(stopFacts(c.env,'planned-stop').length,1);
 const next=c.probe('WEEKLY_REVIEW',at(addDays(d,1),'07:00'),{eligibility:ELIG(addDays(d,-1))},'next');
 assert.ok(asks(next,a1.id)&&asks(next,b1.id),'both sessions asked: '+JSON.stringify(screenOf(next)));
 // A report naming another athlete leaves nothing.
 const {c:c2,stopped:s2}=lateStopSetup('c2-b01r-other'),d2=addDays(c2.env.program.startDate,1);
 c2.review('WEEKLY_REVIEW',at(d2,'07:00'),{observations:[{...s2,eventId:'someone',athleteId:'someone-else'}]},'ask');
 assert.equal(stopFacts(c2.env).length,0,'another athlete\'s report leaves no fact');
 // A session id no plan could have made (longer than a report id may be) is named in the answer and not recorded.
 const long='x'.repeat(129),rl=c2.review('WEEKLY_REVIEW',at(d2,'07:30'),{observations:[{...s2,eventId:'long',sessionId:long}]},'ask-long');
 assert.ok(asks(rl,long),'named in the answer');assert.equal(stopFacts(c2.env,'long').length,0,'not recorded');
 // A stop for another reason than a symptom, for a session the plan does not hold, is not a screen request and leaves nothing.
 c2.review('WEEKLY_REVIEW',at(d2,'08:00'),{observations:[{...s2,eventId:'tired',actual:{completed:false,minutes:20,stop:{reason:'FATIGUE'}}}]},'ask2');
 assert.equal(c2.env.runFormatRecord.filter(x=>x.fact===RUN_REPORT_RECEIVED&&x.report?.reportId==='tired').length,0);
});

test('SSCTR-CORE-B-01-R: a review whose instant the engine refuses records nothing for any session (unchanged integrity rule); the answer still names the screen', ()=>{
 const {c,a1,stopped}=lateStopSetup('c2-b01r-refused'),d=addDays(c.env.program.startDate,1),held=JSON.stringify(c.env.runFormatRecord);
 // A refusal of the review's instant (it cannot be read): nothing is kept for any session; the answer names the screen when it reads one.
 const rv=c.input('WEEKLY_REVIEW',at(d,'07:00'),{observations:[stopped]},'refused');
 for(const [name,review] of [['no instant',{...rv,asOf:'not-an-instant'}]]){
  const r=S.evaluateProgram(c.env.program,review);
  assert.ok(['HOLD','UNSUPPORTED','INVALID_INPUT'].includes(r.status),name+': '+r.status);
  const kept=Array.isArray(r.runFormatRecord)?r.runFormatRecord:review.runFormatRecord;
  assert.equal(kept.filter(x=>x.fact===RUN_REPORT_RECEIVED&&x.report?.reportId==='late-stop').length,0,name+': nothing recorded under a refused instant');
  assert.equal(JSON.stringify(kept),JSON.stringify(review.runFormatRecord),name+': the record is the one sent');
  if(screenOf(r))assert.ok(asks(r,a1.id),name+': the answer names the screen: '+JSON.stringify(screenOf(r)));
 }
 assert.equal(JSON.stringify(c.env.runFormatRecord),held);
});

// QRE-CORE-R2-01: after the review-by date, the clinical answer records no format it did not deliver.
function planAcross(id){const i=athleteA({weeks:8,id});i.asOf='2027-04-17';i.startDate='2027-04-19';i.athlete.eligibility=ELIG('2027-04-17');i.athlete.goals.run.event.date=addDays('2027-04-19',8*7-1);const c=client(S);c.onboard(i);return c;}
const emitted=rec=>rec.filter(x=>x.fact===RUN_FORMAT_EMITTED).map(x=>x.eventId).sort();
const reportsOf=rec=>rec.filter(x=>x.fact===RUN_REPORT_RECEIVED).map(x=>x.eventId).sort();
/** Every format the record says was emitted was delivered: emitted earlier (carried), or a session this answer delivers. */
function deliveredOnly(r,carried){
 const was=new Set(emitted(carried)),delivered=new Set(Object.keys(r.runSessions??{}));
 for(const x of r.runFormatRecord.filter(x=>x.fact===RUN_FORMAT_EMITTED&&!was.has(x.eventId)))assert.ok(delivered.has(x.sessionId),'emitted but not delivered: '+x.sessionId);
}
test('QRE-CORE-R2-01: before, on and after the review-by date, the format record holds only formats an answer delivered', ()=>{
 for(const day of ['2027-04-28','2027-04-30','2027-05-01','2027-05-02']){
  const c=planAcross('c2-r201-'+day),carried=structuredClone(c.env.runFormatRecord),r=c.probe('NOT_FEELING_100',at(day,'08:00'),notFeeling100WithSign(day),'s');
  assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',day);assert.equal(r.proposal,null);
  deliveredOnly(r,carried);
  if(day>'2027-04-30'){assert.equal(r.authorityExpiry?.status,'EXPIRED');assert.deepEqual(emitted(r.runFormatRecord),emitted(carried),'after the date: no format emitted');}
 }
});
test('QRE-CORE-R2-01: after the date the clinical route still records what the review\'s reports stated (a symptom stop) and keeps every earlier fact', ()=>{
 const c=planAcross('c2-r201-stop'),day0='2027-04-25';
 c.review('WEEKLY_REVIEW',at(day0,'20:00'),{eligibility:ELIG(day0),observations:liveSessions(c.env,0).filter(s=>s.date<=day0).map(s=>reportOf(c.env,s))},'w0');
 const carried=structuredClone(c.env.runFormatRecord),day='2027-05-02',s=liveSessions(c.env,1).find(x=>x.sport==='RUN'&&x.date<=day);
 const stop={...reportOf(c.env,s),eventId:'exp-stop',actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}}};
 const r=c.review('NOT_FEELING_100',at(day,'08:00'),{...notFeeling100WithSign(day),observations:[stop]},'sign');
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(r.authorityExpiry?.status,'EXPIRED');
 assert.deepEqual(emitted(r.runFormatRecord),emitted(carried),'no format emitted after the date');
 for(const id of reportsOf(carried))assert.ok(reportsOf(r.runFormatRecord).includes(id),'an earlier report fact is kept');
 assert.equal(stopFacts(c.env,'exp-stop').length,1,'the stop of the review is kept');
 assert.ok(asks(r,s.id),'the screen is asked');
 // Restored after the date, the next review (no new sign): the standing hold is the engine's own clinical answer, which precedes the authority
 // (unchanged by this line). Nothing in it is executable, and every format its record adds is a session it delivers.
 const restored=client(S,JSON.parse(JSON.stringify(c.env))),next=restored.probe('WEEKLY_REVIEW',at('2027-05-03','08:00'),{eligibility:ELIG('2027-05-01')},'next');
 assert.equal(next.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(next.proposal??null,null);assert.ok(noExecutable(next));
 assert.ok(asks(next,s.id),'the stop is still asked');deliveredOnly(next,restored.env.runFormatRecord);
});
test('QRE-CORE-R2-01: after the date an invalid review or one with no sign stays the refusal, its record unchanged', ()=>{
 const c=planAcross('c2-r201-inv'),held=JSON.stringify(c.env.runFormatRecord);
 const none=c.probe('WEEKLY_REVIEW',at('2027-05-02','08:00'),{eligibility:ELIG('2027-05-02')},'none');
 assert.equal(none.status,'UNSUPPORTED');assert.equal(JSON.stringify(none.runFormatRecord),held);
 const bad=S.evaluateProgram(c.env.program,{...c.input('NOT_FEELING_100',at('2027-05-02','08:00'),notFeeling100WithSign('2027-05-02'),'bad'),weekIndex:'x'});
 assert.notEqual(bad.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(JSON.stringify(bad.runFormatRecord??JSON.parse(held)),held);
});

// SEC-CORE-14: a malformed part of a merged row no longer discards the other voices' valid parts at a correction.
const U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
function twoVoices(id){const c=client(S);c.onboard(athleteA({weeks:8,id}));const s=liveSessions(c.env,0).find(x=>x.sport==='RUN'),b=reportOf(c.env,s),{response:_r,eventId:_e,...body}=b,m={...b.actual};delete m.rpe;
 const dev=(eventId,extra={})=>({...body,eventId,actual:{...m,...extra},source:{provider:'HEALTHKIT',activityId:'HK-1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-1',response:{...U}});
 const ath=(eventId,response,actual={})=>({sessionId:s.id,occurrenceDate:b.occurrenceDate,eventId,actual:{completed:true,rpe:6,...actual},response:{...U,...response}});
 return {c,s,m,dev,ath};}
const liveRows=(env,sid)=>env.actualLedger.filter(o=>!o.fact&&o.sessionId===sid&&!o.superseded);
test('SEC-CORE-14: a malformed extra part is not read; the athlete\'s valid part is still carried through a device re-sync', ()=>{
 const k=twoVoices('c2-sec14'),d1=addDays(k.s.date,1);
 k.c.review('WEEKLY_REVIEW',at(k.s.date,'21:00'),{eligibility:ELIG(k.s.date),observations:[k.dev('d1'),k.ath('a1',{recovery:'ADVERSE'})]},'both');
 for(const bad of [{actual:{completed:true},response:{...U,recovery:'BOGUS'}},null,'x',{actual:[1],response:{}},{actual:{completed:true,minutes:-5},response:{...U}}]){
  const env=JSON.parse(JSON.stringify(k.c.env));env.actualLedger=env.actualLedger.map(o=>o.provenance?.parts?.a1?{...o,provenance:{...o.provenance,parts:{...o.provenance.parts,g1:bad}}}:o);
  const x=client(S,env),r=x.review('WEEKLY_REVIEW',at(d1,'20:00'),{eligibility:ELIG(d1),observations:[{...k.dev('d1b',{minutes:k.m.minutes+1}),correctionOf:'d1',correctedAt:at(d1,'07:00')}]},'resync');
  const tag=JSON.stringify(bad);assert.notEqual(r.status,'HOLD',tag);
  const rows=liveRows(x.env,k.s.id);assert.equal(rows.length,1,tag);
  assert.equal(rows[0].response.recovery,'ADVERSE','the athlete\'s answer is kept: '+tag);
  assert.deepEqual(Object.keys(rows[0].provenance.parts).sort(),['a1','d1b'],'the malformed part is not carried: '+tag);
  assert.equal(rows[0].actual.minutes,k.m.minutes+1,'the device\'s corrected measurement: '+tag);
  assert.ok(!JSON.stringify(rows[0]).includes('BOGUS'),tag);
 }
});

// SSCTR C-C2 (QRE-CORE-R2-02): rows with no well-formed part keep the E-01 withholding at the RWS level; a row with parts is read as the merge.
test('C-C2: after a device re-sync, a merged row recorded without parts, or whose athlete part is malformed, is withheld from pace evidence (REPORT_NOT_CARRIED); the row with parts is not', ()=>{
 const k=twoVoices('c2-cc2'),d1=addDays(k.s.date,1);
 k.c.review('WEEKLY_REVIEW',at(k.s.date,'21:00'),{eligibility:ELIG(k.s.date),observations:[k.dev('d1'),k.ath('a1',{recovery:'ADVERSE'},{conditions:['HEAT']})]},'both');
 const resync={...k.dev('d1b',{minutes:k.m.minutes+1}),correctionOf:'d1',correctedAt:at(d1,'07:00')};
 const variant=edit=>{const env=JSON.parse(JSON.stringify(k.c.env));env.actualLedger=env.actualLedger.map(o=>o.provenance?.parts?.a1?edit(o):o);const x=client(S,env);
  const r=x.review('WEEKLY_REVIEW',at(d1,'20:00'),{eligibility:ELIG(d1),observations:[resync]},'resync');return {r,x,exec:r.runSessions?.[k.s.id]?.execution??null,row:liveRows(x.env,k.s.id)[0]};};
 const withParts=variant(o=>o);
 assert.ok(withParts.exec,'the executed session is read');assert.notEqual(withParts.exec.paceWithheld,'REPORT_NOT_CARRIED');
 assert.deepEqual([withParts.row.response.recovery,withParts.row.actual.conditions],['ADVERSE',['HEAT']],'the row with parts carries the athlete\'s report');
 const legacy=variant(o=>{const {parts:_p,...prov}=o.provenance;return {...o,provenance:prov};});
 assert.equal(legacy.exec?.paceWithheld,'REPORT_NOT_CARRIED','a row recorded without parts: '+JSON.stringify(legacy.exec));
 assert.equal(legacy.row.response.recovery,'UNKNOWN','corrected as before E-1 (the row replaced)');
 const malformed=variant(o=>({...o,provenance:{...o.provenance,parts:{...o.provenance.parts,a1:{actual:{completed:true},response:{...U,recovery:'BOGUS'}}}}}));
 assert.equal(malformed.exec?.paceWithheld,'REPORT_NOT_CARRIED','a malformed athlete part: '+JSON.stringify(malformed.exec));
 assert.ok(!JSON.stringify(malformed.row).includes('BOGUS'));
});
