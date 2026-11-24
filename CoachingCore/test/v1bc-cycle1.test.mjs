// REPMILE V1 CoachingCore blocker closure: the single consolidated cycle after R1 on 6e85222. Each test pins one finding: SEC_BC_R1 SEC-BC-01 and
// SEC-BC-02, QRE_BC_R1 QRE-BC-01, and C-BC-2 (the unpinned guards A2, F6, C2, C5, C7, I2, I5, I6, S1, S2, S3). Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeObservations} from '../src/r6-provenance.mjs';
import {restartIntake} from '../src/v1-f08.mjs';
import {createCustody} from '../src/boundary/custody.mjs';
import {LIMITS} from '../src/boundary/admission.mjs';
import {athlete,spy,S,memoryStore,ELIG,addDays,at,CONSENTS,athleteA,json,U,notFeeling100WithSign,readiness} from './v1int-helpers.mjs';

const code=r=>r.ok?'OK':r.error.code;

test('SEC-BC-01: an erasure under a clock set back before a readiness declaration never releases a standing clinical hold (its marker is dated at the latest instant on record)',()=>{
 const scenario=attack=>{
  const t=athlete({id:`bc01-${attack}`});t.enroll();const d0=t.sessions(0)[0].date;
  t.set(d0,'08:00');assert.equal(t.api.notFeeling100({actor:t.actor,clientRequestId:'nf1',expectedVersion:t.version(),...notFeeling100WithSign(d0)}).ok,true);
  const d1=addDays(d0,1);t.set(d1,'09:00');assert.equal(t.api.declareReadiness({actor:t.actor,clientRequestId:'rd1',expectedVersion:t.version(),...readiness(d1)}).ok,true);
  const d3=addDays(d0,3);t.set(d3,'09:00');const h2=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf2',expectedVersion:t.version(),...notFeeling100WithSign(d3)});assert.equal(h2.status,'CLINICAL_HUMAN_REQUIRED');
  const lastAt=t.doc().carried.lastAt;assert.ok(Number.isFinite(Date.parse(lastAt)));
  if(attack)t.set(d0,'20:00');else t.set(d3,'10:00');
  assert.equal(code(t.it.eraseHealthFacts({actor:t.actor,eventIds:[h2.eventId],expectedVersion:t.version()})),'OK');
  const markers=t.it.visible(t.doc()).filter(r=>r.fact==='ERASED_F08').map(r=>Date.parse(r.declaredAt));
  assert.ok(markers.length&&markers.every(m=>m>=Date.parse(lastAt)),'the marker is never earlier than the record');
  t.set(d3,'11:00');assert.equal(t.api.status({actor:t.actor}).state,'BLOCKED');assert.equal(t.weekly(d3,[]).status,'CLINICAL_HUMAN_REQUIRED');
 };
 scenario(false);scenario(true);
});

test('SEC-BC-02 / QRE-BC-01: after an erasure took the readings, re-sending the same stop report asks the engine and names the screen the kept stop requires',()=>{
 const t=athlete({id:'bc02'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'20:00');
 const f={...t.form(s),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:U};assert.equal(t.weekly(s.date,[f]).warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM');
 t.set(s.date,'20:30');const nf=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf',expectedVersion:t.version(),...notFeeling100WithSign(s.date)});
 t.set(s.date,'21:00');assert.equal(code(t.it.eraseHealthFacts({actor:t.actor,eventIds:[nf.eventId],expectedVersion:t.version()})),'OK');
 t.set(s.date,'21:10');const again=t.submit({kind:'WEEKLY_REVIEW',observations:[f]});assert.equal(code(again),'OK');assert.equal(again.warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM');
 t.set(s.date,'21:20');const dup=t.submit({kind:'WEEKLY_REVIEW',observations:[f]});assert.equal(dup.duplicate,true);assert.equal(dup.warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM','readings stored again: the duplicate answer carries them');
});

test('C-BC-2 (A2): an impaired next day alone, said by the athlete on a disputed run the watch measured first, reaches the weekly evidence',()=>{
 const sp=spy(),t=athlete({id:'bc-a2',engine:sp.engine});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');
 t.set(run.date,'21:00');t.screen(ELIG(run.date));t.clock+=60e3;assert.equal(code(t.import([t.watch(run)])),'OK');
 t.clock+=60e3;assert.equal(code(t.weekly(run.date,[t.form(run,{actual:{minutes:t.form(run).actual.minutes+20},response:{nextDayFunction:'IMPAIRED'}})])),'OK');
 assert.equal(t.live(run.id)[0].conflicted,true);t.clock+=60e3;t.weekly(run.date,[]);
 assert.equal(sp.calls.filter(c=>c.op==='evaluate').at(-1).out.weekEvidence.adverseSessions,1);
});

test('C-BC-2 (F6): with no readiness declaration, the 0-week pause is for a stop on the restart day only: an earlier stop then a session today reads as before (SSCTR-BC-03 open)',()=>{
 const ATH='bc-f6',DAY='2026-11-10',prev='2026-11-08';
 const N=batch=>normalizeObservations(json(batch),{athleteId:ATH,asOf:DAY+'T09:00:00Z',maximumAgeDays:36500,incoming:true});
 const rep=(id,sid,d,actual)=>({athleteId:ATH,sessionId:sid,eventId:id,observedAt:d+'T07:00:00Z',reportedAt:d+'T08:00:00Z',context:{sport:'RUN',sessionType:'RUN_EASY'},response:U,actual,source:{provider:'MANUAL'}});
 const n=N([rep('S','s1',prev,{completed:false,minutes:12,stop:{reason:'SYMPTOM'}}),rep('D','s2',DAY,{completed:true,minutes:40})]);
 const r=restartIntake({intake:{asOf:DAY,athlete:{id:ATH}},record:[...n.accepted,...n.supersededRows],asOf:DAY,screen:()=>({status:'NONCLINICAL'}),athleteId:ATH});
 assert.equal(r.facts.pause,null);
});

// C-BC-2 (C2, C5, C7): forgeries each of these evolves guards refuses on its own (QRE p04-evolves-merge-forgery cases 3, 5, 6).
const DEV=(b,id='HK1',minutes=40)=>({...b,actual:{completed:true,minutes,distanceKm:7.06,measurement:'GPS'},response:{...U},source:{provider:'HEALTHKIT',activityId:id,quality:'WEARABLE_FULL'},canonicalActivityId:id});
function rig(alter){
 let clock=Date.parse('2026-11-14T12:00:00-03:00'),mode=null;const store=memoryStore(),actor={athleteId:'rc'};
 const engine={...S,evaluateProgram:(p,i,o)=>{const r=S.evaluateProgram(p,i,o);return mode&&alter?{...r,actualLedger:alter(json(r.actualLedger),i)}:r;}};
 const cu=createCustody({store,key:'k',now:()=>clock,engine});cu.enroll({actor,intake:athleteA({weeks:8,id:'rc'}),consents:CONSENTS});
 const s=store.load('rc').program.weeks[0].sessions.find(x=>x.id==='w0-run-d1'),b={sessionId:s.id,occurrenceDate:s.date};
 let v=1;const send=(rid,obs,time,m=null)=>{clock=Date.parse(at(s.date,time));mode=m;const r=cu.submit({actor,clientRequestId:rid,expectedVersion:v,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:obs}});mode=null;if(r.ok)v=r.version;return r;};
 return {b,send};
}
const T=l=>l.find(o=>!o.fact&&o.sessionId==='w0-run-d1'&&!o.superseded),other=t=>Object.keys(t.provenance.parts).find(k=>k!==t.eventId);
test('C-BC-2 (C2, C5, C7): a non-word key added to a new voice\'s response, a key the report stated dropped from it, and a "not done" voice read as a merge are refused',()=>{
 const cases=[
  ['C2 non-word response key',{completed:true,minutes:40,rpe:4},{...U,recovery:'ADVERSE'},t=>{t.provenance.parts[other(t)].response.note='x';}],
  ['C5 stated key dropped',{completed:true,minutes:40,rpe:4},{...U,recovery:'ADVERSE'},t=>{delete t.provenance.parts[other(t)].actual.rpe;delete t.actual.rpe;}],
  ['C7 "not done" merged',{completed:false,minutes:0},{...U},t=>{const k=other(t);delete t.conflicted;delete t.provenance.conflict;t.provenance.mergedSourceIds=[...new Set([...(t.provenance.mergedSourceIds??[t.eventId]),k])];}]];
 for(const [name,ath,resp,f] of cases){const r=rig(l=>{f(T(l));return l;});assert.equal(code(r.send('hk',[DEV(r.b)],'08:00')),'OK');
  assert.equal(code(r.send('form',[{...r.b,actual:ath,response:resp}],'20:00','x')),'ENGINE_CONTRACT_VIOLATION',name);}
 const ok=rig(l=>l);ok.send('hk',[DEV(ok.b)],'08:00');assert.equal(code(ok.send('form',[{...ok.b,actual:{completed:false,minutes:0},response:{...U}}],'20:00','x')),'OK','control: the engine\'s own kept voice');
});

test('C-BC-2 (I2): a report dated on the enrollment day itself is admitted',()=>{
 const t=athlete({id:'bc-i2'});t.enroll();const first=t.doc().createdAt.slice(0,10),run=t.sessions(0).find(s=>s.id==='w0-run-d1');
 t.set(run.date,'21:00');t.screen(ELIG(run.date));const w=t.watch(run);delete w.sessionId;
 assert.equal(code(t.import([{...w,activityId:'HK-first',observedAt:at(first,'13:00')}])),'OK');
});

test('C-BC-2 (I5, I6, S1-S3): the athlete\'s new reports of one day past the limit: a plain one refused, one stating each signal kind admitted, at most safetyExcess more',()=>{
 const t=athlete({id:'bc-i5'});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1'),day=run.date;t.set(day,'23:00');
 const free=(k,extra={})=>({occurrenceDate:day,actual:{completed:true,minutes:20+k,...(extra.actual??{})},response:{...U,...(extra.response??{})}});
 for(let k=0;k<LIMITS.reportsPerDayPerChannel;k++){t.clock+=60e3;assert.equal(code(t.weekly(day,[free(k)])),'OK',`report ${k}`);}
 t.clock+=60e3;assert.equal(code(t.weekly(day,[free(50)])),'LIMIT_EXCEEDED','plain, past the limit');
 const kinds=[{actual:{completed:false,minutes:5,stop:{reason:'SYMPTOM'}}},{response:{recovery:'ADVERSE'}},{response:{nextDayFunction:'IMPAIRED'}}];
 kinds.forEach((x,i)=>{t.clock+=60e3;assert.equal(code(t.weekly(day,[free(60+i,x)])),'OK',`signal kind ${i} alone`);});
 t.clock+=60e3;assert.equal(code(t.weekly(day,[free(70,kinds[0])])),'LIMIT_EXCEEDED','a fourth signal past the limit');
});

test('C-BC-2 (S1-S3): past the correction limit, a correction stating each signal kind alone is admitted',()=>{
 for(const [i,x] of [{actual:{stop:{reason:'SYMPTOM'}}},{response:{recovery:'ADVERSE'}},{response:{nextDayFunction:'IMPAIRED'}}].entries()){
  const t=athlete({id:'bc-s'+i});t.enroll();const str=t.sessions(0).find(s=>s.sport==='STRENGTH');t.set(str.date,'08:00');let head=t.weekly(str.date,[t.form(str)]).recorded[0];
  for(let k=1;k<=LIMITS.correctionsPerReport;k++){t.clock+=60e3;const r=t.weekly(str.date,[{...t.form(str),correctionOf:head,actual:{...t.form(str).actual,minutes:20+k}}]);head=r.recorded[0];}
  t.clock+=60e3;const f=t.form(str),r=t.weekly(str.date,[{...f,correctionOf:head,actual:{...f.actual,minutes:5,...(x.actual??{})},response:{...f.response,...(x.response??{})}}]);
  assert.equal(code(r),'OK',`kind ${i}`);}
});
