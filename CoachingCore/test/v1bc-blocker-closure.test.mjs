// REPMILE V1 CoachingCore blocker closure (Founder mission of 2026-11-24): the focal tests of the release candidate. Each fails on ee256ae (the
// V1INT line, audits/v1-blocker-closure-2026-11-24/evidence/red-on-ee256ae.txt) and passes here, except the controls, which pass on both.
// Synthetic athletes only. Inventory: audits/v1-blocker-closure-2026-11-24/V1_BLOCKER_INVENTORY.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeObservations,VOICE_LIMIT} from '../src/r6-provenance.mjs';
import {restartIntake,readReadiness,readinessFact,READINESS_SIGNS} from '../src/v1-f08.mjs';
import {createCustody} from '../src/boundary/custody.mjs';
import {LIMITS} from '../src/boundary/admission.mjs';
import * as RF from '../src/v1-run-format.mjs';
import {athlete,spy,S,memoryStore,fileStore,scratchDir,ELIG,addDays,at,CONSENTS,athleteA,json,U,notFeeling100WithSign} from './v1int-helpers.mjs';

const code=r=>r.ok?'OK':r.error.code;
const V=RF.runFormatAuthority({}).values;

// ---------------------------------------------------------------- C-O1-3 ----------------------------------------------------------------
// The athlete's ADVERSE response on a run the watch measured differently (a head-on dispute, O-1): the weekly evidence the engine answers with.
function disputed(order,{resync=false,id}={}){
 const sp=spy(),t=athlete({id,engine:sp.engine});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');
 t.set(run.date,'21:00');assert.equal(code(t.screen(ELIG(run.date))),'OK');
 const watch=()=>t.import([t.watch(run,{endTime:'07:45'})]);
 const form=()=>t.weekly(run.date,[t.form(run,{actual:{minutes:t.form(run).actual.minutes+20},response:{recovery:'ADVERSE',effort:'HARDER'}})]);
 const steps=order==='device first'?[watch,form]:[form,watch];for(const f of steps){t.clock+=60e3;assert.equal(code(f()),'OK');}
 if(resync){t.clock+=60e3;const r=t.import([t.watch(run,{endTime:'07:45',actual:{minutes:t.watch(run).actual.minutes+1}})]);assert.equal(code(r),'OK');}
 t.clock+=60e3;const sun=t.weekly(run.date,[]);assert.equal(code(sun),'OK');
 const out=sp.calls.filter(c=>c.op==='evaluate').at(-1).out,row=t.live(run.id)[0];
 return {t,run,sp,adverse:out.weekEvidence?.adverseSessions,conflicted:out.weekEvidence?.conflicted,flagged:row?.conflicted===true,status:out.weekEvidence?.rows?.find(r=>r.sessionId===run.id)?.status};
}
test('C-O1-3: an uncontradicted adverse response on a disputed session reaches the weekly evidence in every order of arrival and after a device re-sync; never as credit',()=>{
 const seen=[];
 for(const order of ['device first','athlete first'])for(const resync of [false,true]){
  const r=disputed(order,{resync,id:`co13-${order[0]}-${resync}`});seen.push([order,resync,r.adverse]);
  assert.equal(r.flagged,true,'the session is in dispute');assert.equal(r.status,'CONFLICTED','and earns nothing');assert.equal(r.conflicted,1);
  assert.equal(r.adverse,1,`${order}${resync?' + re-sync':''}: adverse heard`);}
 assert.deepEqual(new Set(seen.map(x=>x[2])),new Set([1]),JSON.stringify(seen));
});
test('C-O1-3: the reading survives the next weekly review and a restore from a file store',()=>{
 const dir=scratchDir('co13'),sp=spy(),t=athlete({id:'co13-file',store:fileStore(dir),engine:sp.engine});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');
 t.set(run.date,'21:00');t.screen(ELIG(run.date));t.clock+=60e3;t.import([t.watch(run)]);t.clock+=60e3;
 assert.equal(code(t.weekly(run.date,[t.form(run,{actual:{minutes:t.form(run).actual.minutes+20},response:{recovery:'ADVERSE'}})])),'OK');
 const u=athlete({id:'co13-file',store:fileStore(dir),engine:sp.engine});u.clock=t.clock+3600e3;assert.equal(code(u.submit({kind:'WEEKLY_REVIEW',eligibility:ELIG(run.date),observations:[]},{rid:'after-restore'})),'OK');
 assert.equal(sp.calls.filter(c=>c.op==='evaluate').at(-1).out.weekEvidence.adverseSessions,1,'restored and reviewed again');
});
test('C-O1-3: strength (custody level, two declared sources; the V1 boundary admits one strength speaker): the adverse voice is heard whoever spoke first',()=>{
 const count=order=>{let clock=Date.parse('2026-11-14T12:00:00-03:00');const sp=spy(),store=memoryStore(),actor={athleteId:'co13s'};
  const cu=createCustody({store,key:'k',now:()=>clock,engine:sp.engine});cu.enroll({actor,intake:athleteA({weeks:8,id:'co13s'}),consents:CONSENTS});
  const s=store.load('co13s').program.weeks[0].sessions.find(x=>x.sport==='STRENGTH'),t=athlete({id:'co13s-ref'});t.enroll();const f=t.form(t.sessions(0).find(x=>x.id===s.id));
  const own={...f,response:{...U,recovery:'ADVERSE',nextDayFunction:'IMPAIRED'}},dev={...f,actual:{...f.actual,minutes:(f.actual.minutes??30)+30},source:{provider:'OTHER_APP',activityId:'ext-1',quality:'WEARABLE_FULL'},canonicalActivityId:'ext-1'};
  let v=1;const send=(rid,obs)=>{clock+=60e3;const r=cu.submit({actor,clientRequestId:rid,expectedVersion:v,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:obs}});assert.equal(r.ok,true,JSON.stringify(r.error??null));v=r.version;return r;};
  clock=Date.parse(at(s.date,'20:00'));const seq=order==='athlete first'?[own,dev]:[dev,own];send('a',[seq[0]]);send('b',[seq[1]]);send('c',[]);
  return sp.calls.filter(c=>c.op==='evaluate').at(-1).out.weekEvidence?.adverseSessions;};
 assert.equal(count('athlete first'),1);assert.equal(count('other first'),1);
});

// ------------------------------------------------------------ SEC-SC-02 / -03 ------------------------------------------------------------
const ATH='ath-bc',DAY='2026-11-10',shift=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const N=(batch,asOf,prior)=>normalizeObservations(json(batch),{athleteId:ATH,asOf,maximumAgeDays:36500,incoming:true,...(prior?{prior:json(prior)}:{})});
const rec=n=>[...n.accepted,...n.supersededRows];
const rep=(id,sid,d,extra={})=>({athleteId:ATH,sessionId:sid,eventId:id,observedAt:d+'T09:00:00Z',reportedAt:d+'T12:00:00Z',context:{sport:'RUN',sessionType:'RUN_EASY'},response:U,actual:{completed:true,minutes:40},source:{provider:'MANUAL'},...extra});
const READY=readReadiness({declaredRecovered:true,sports:{RUN:{ready:true}},warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false]))},{programmed:['RUN']}).value;
const dx=shift(DAY,-5),R0=readinessFact({athleteId:ATH},{event:{id:'r0'},readiness:{}},shift(dx,-3)+'T08:00:00.000Z',READY,null);
const STOP={completed:false,minutes:12,stop:{reason:'SYMPTOM'}};
const sb1=(record,day=DAY)=>{const r=restartIntake({intake:{asOf:day,athlete:{id:ATH,recent:{runMinutesPerWeek:600,runDaysPerWeek:7}}},record:json(record),asOf:day,screen:()=>({status:'NONCLINICAL'}),athleteId:ATH});
 if(r.status!=='READY')return r.status;const p=r.facts.pause;return p===null?'NO_PAUSE':p.readinessDeclared===true?'DECLARED':'ASK';};
test('SEC-SC-02: a voice is dated by its own observation: a stop or a "done" kept on a row observed before the declaration, itself after it, asks',()=>{
 const pre=shift(dx,-5),NP=rep('NP','sq',pre,{reportedAt:pre+'T11:00:00Z',actual:{completed:false,minutes:0}}),lq=rec(N([NP],pre+'T13:00:00Z'));
 const stop=N([rep('SQ','sq',dx,{reportedAt:dx+'T12:00:00Z',actual:STOP,response:{...U,recovery:'ADVERSE'}})],dx+'T15:00:00Z',lq);
 assert.equal(stop.accepted.find(o=>o.sessionId==='sq').provenance.parts.SQ.observedAt,dx+'T09:00:00.000Z','the voice keeps its own instant');
 assert.equal(sb1([R0,...rec(stop)]),'ASK','G2');
 const done=N([rep('DQ','sq',dx,{reportedAt:dx+'T12:00:00Z'})],dx+'T15:00:00Z',lq);assert.equal(sb1([R0,...rec(done)]),'ASK','G4');
 // Persistence: the record re-read and restored from JSON keeps the voice's instant and the answer.
 const again=rec(N([],shift(DAY,-1)+'T09:00:00Z',json(rec(stop))));assert.equal(sb1([R0,...again]),'ASK','re-read');
 // Controls (unchanged): a stop before the declaration is answered by it, also when corrected after it (D3, D4); a later declaration answers it.
 const SP=rep('SP','sp',pre,{reportedAt:pre+'T12:00:00Z',actual:STOP}),lp=rec(N([SP],pre+'T13:00:00Z'));assert.equal(sb1([R0,...lp]),'DECLARED','D3');
 assert.equal(sb1([R0,...rec(N([{...SP,eventId:'SP2',correctionOf:'SP',correctedAt:dx+'T10:00:00Z',reportedAt:dx+'T10:00:00Z',actual:{completed:false,minutes:0}}],dx+'T13:00:00Z',lp))]),'DECLARED','D4');
 const RL=readinessFact({athleteId:ATH},{event:{id:'rl'},readiness:{}},shift(DAY,-1)+'T08:00:00.000Z',READY,null);assert.equal(sb1([R0,RL,...rec(stop)]),'DECLARED','a later declaration answers it');
 // A part kept before this line (no instant of its own) is read with its row's, as before.
 const legacy=json(rec(stop));for(const o of legacy)for(const p of Object.values(o.provenance?.parts??{}))delete p.observedAt;assert.equal(sb1([R0,...legacy]),'DECLARED');
});
test('SEC-SC-03: a stop on the restart day asks the existing cause question (0-week pause, no declaration standing in); zero minutes too; without a stop nothing changes',()=>{
 const today=rep('ST','st',DAY,{observedAt:DAY+'T07:00:00Z',reportedAt:DAY+'T08:00:00Z',actual:STOP});
 assert.equal(sb1([R0,...rec(N([today],DAY+'T09:00:00Z'))]),'ASK','G1, after a declaration');
 assert.equal(sb1(rec(N([today],DAY+'T09:00:00Z'))),'ASK','with no declaration');
 assert.equal(sb1([R0,...rec(N([{...today,actual:{completed:false,minutes:0,stop:{reason:'SYMPTOM'}}}],DAY+'T09:00:00Z'))]),'ASK','zero minutes');
 assert.equal(sb1([R0,...rec(N([{...today,actual:{completed:false,minutes:12,stop:{reason:'TIME'}}}],DAY+'T09:00:00Z'))]),'ASK','a stop without symptoms asks too (SB-1 reads every declared stop)');
 const done=rep('DT','dt',DAY,{observedAt:DAY+'T07:00:00Z',reportedAt:DAY+'T08:00:00Z'});
 assert.equal(sb1([R0,...rec(N([done],DAY+'T09:00:00Z'))]),'NO_PAUSE','a session done today, no stop: no pause, as before');
 // The stop before the declaration of the same day is answered by it.
 const R1=readinessFact({athleteId:ATH},{event:{id:'r1'},readiness:{}},DAY+'T08:30:00.000Z',READY,null);
 assert.notEqual(sb1([R1,...rec(N([today],DAY+'T09:00:00Z'))]),'ASK','stop at 07:00, declaration at 08:30');
 // Clinical: a stated clinical reason still routes as before (the screen is the existing one).
 const r=restartIntake({intake:{asOf:DAY,athlete:{id:ATH,pause:{reasonCategory:'INJURY'}}},record:json([R0,...rec(N([today],DAY+'T09:00:00Z'))]),asOf:DAY,screen:()=>({status:'NONCLINICAL'}),athleteId:ATH});
 assert.equal(r.facts.pause.weeks,0);assert.equal(r.facts.pause.readinessDeclared,undefined);
 // Deterministic.
 assert.equal(JSON.stringify(restartIntake({intake:{asOf:DAY,athlete:{id:ATH}},record:json([R0,today]),asOf:DAY,screen:()=>({status:'NONCLINICAL'}),athleteId:ATH})),JSON.stringify(restartIntake({intake:{asOf:DAY,athlete:{id:ATH}},record:json([R0,today]),asOf:DAY,screen:()=>({status:'NONCLINICAL'}),athleteId:ATH})));
});

// --------------------------------------------------------------- QRE-INT-02 ---------------------------------------------------------------
const factsOf=(t,sid)=>t.carried().runFormatRecord.filter(x=>x.fact==='RUN_REPORT_RECEIVED'&&x.sessionId===sid);
const reading=(t,sid)=>RF.reportsReading(t.live(sid)[0],RF.readReportFacts(t.carried().runFormatRecord,t.doc().program.athleteId,V,t.rows()),V);
test('QRE-INT-02 (device route, successor of tm-5): a workout the engine asked about (a screen no longer current) is not recorded, its receipt is no report in force; answered and re-delivered it is recorded once and carried',()=>{
 const t=athlete({id:'q2-dev'});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');
 const late=addDays(run.date,40);t.set(late,'09:00');const a=t.import([t.watch(run,{activityId:'HK-late'})]);
 assert.equal(a.status,'ASK');assert.deepEqual(a.activities.map(x=>x.outcome),['NOT_RECORDED']);
 assert.equal(factsOf(t,run.id).length,0,'no report in force for a workout the decision did not record');
 t.set(late,'09:10');assert.equal(code(t.screen(ELIG(late))),'OK');
 t.set(late,'09:20');const b=t.import([t.watch(run,{activityId:'HK-late'})]);assert.deepEqual(b.activities.map(x=>x.outcome),['RECORDED']);
 assert.equal(t.live(run.id).length,1,'one row: no double credit');assert.equal(factsOf(t,run.id).length,1);
 const r=reading(t,run.id);assert.equal(r.withheld,null);assert.equal(r.wholeRow,null,'carried to the pace readers');
 t.set(late,'09:30');const c=t.import([t.watch(run,{activityId:'HK-late'})]);assert.equal(c.duplicate,true,'sent again: a duplicate');assert.equal(t.live(run.id).length,1);
});
test('QRE-INT-02 (athlete route, QRE p03b): a form answered ASK, then sent again with the screen: recorded once, carried; a stop it declared while asked is still screened',()=>{
 const t=athlete({id:'q2-ath'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');
 t.set(s.date,'20:00');const a=t.submit({kind:'WEEKLY_REVIEW',observations:[t.form(s)]});assert.equal(a.status,'ASK');assert.equal(a.notRecorded[0].reason,'NOT_RECORDED_BY_THIS_DECISION');
 t.set(s.date,'20:10');const b=t.weekly(s.date,[t.form(s)]);assert.equal(b.recorded.length,1);
 assert.equal(factsOf(t,s.id).length,1);assert.equal(reading(t,s.id).withheld,null);
 // A stop stated on a form that got ASK is still heard by the warning-sign screen (SSCTR_INT_R2 item 4 constraint).
 const u=athlete({id:'q2-stop'});u.enroll();const s2=u.sessions(0).find(x=>x.id==='w0-run-d1');u.set(s2.date,'20:00');
 const stopForm={...u.form(s2),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}}};
 const c=u.submit({kind:'WEEKLY_REVIEW',observations:[stopForm]});assert.equal(c.status,'ASK');assert.equal(c.warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM');
 const kept=factsOf(u,s2.id);assert.equal(kept.length,1);assert.equal(kept[0].report.standing,false,'the stop only');assert.equal(kept[0].report.stop.reason,'SYMPTOM');
 u.set(s2.date,'20:30');assert.equal(u.submit({kind:'WEEKLY_REVIEW',observations:[]}).warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM','asked again at the next review');
 u.set(s2.date,'20:40');const d=u.weekly(s2.date,[stopForm]);assert.equal(d.recorded.length,1,'sent again with a screen: recorded');assert.equal(d.warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM','a screen answered before the stop does not clear it');
});
test('QRE-INT-02 controls: what the engine refused stays in force for the lineage (a workout dated in the future), and a replay after a restore is identical',()=>{
 const dir=scratchDir('q2'),t=athlete({id:'q2-ctl',store:fileStore(dir)});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');
 t.set(run.date,'06:00');t.screen(ELIG(run.date));t.clock+=60e3;const f=t.import([t.watch(run,{activityId:'HK-future',endTime:'07:45'})]);
 assert.equal(f.activities[0].outcome,'NOT_RECORDED');assert.equal(f.activities[0].reason,'FUTURE_OBSERVATION');
 assert.equal(factsOf(t,run.id).filter(x=>x.report.standing).length,1,'a report the engine refused is a report in force, as before');
 const before=t.store.raw('q2-ctl'),u=athlete({id:'q2-ctl',store:fileStore(dir)});u.clock=t.clock;assert.deepEqual(u.carried(),t.carried());
 assert.equal(t.store.raw('q2-ctl'),before);
});

// -------------------------------------------------------------- SEC-INT-02R --------------------------------------------------------------
const DEV=(b,id='HK1',minutes=40)=>({...b,actual:{completed:true,minutes,distanceKm:7.06,measurement:'GPS'},response:{...U},source:{provider:'HEALTHKIT',activityId:id,quality:'WEARABLE_FULL'},canonicalActivityId:id});
const RESP={performance:'COMPATIBLE',recovery:'ADVERSE',effort:'ON_TARGET',nextDayFunction:'IMPAIRED'};
function rig(alter){
 let clock=Date.parse('2026-11-14T12:00:00-03:00'),mode=null;const store=memoryStore(),actor={athleteId:'rc'};
 const engine={...S,evaluateProgram:(p,i,o)=>{const r=S.evaluateProgram(p,i,o);return mode&&alter?{...r,actualLedger:alter(json(r.actualLedger),i)}:r;}};
 const cu=createCustody({store,key:'k',now:()=>clock,engine});cu.enroll({actor,intake:athleteA({weeks:8,id:'rc'}),consents:CONSENTS});
 const s=store.load('rc').program.weeks[0].sessions.find(x=>x.id==='w0-run-d1'),b={sessionId:s.id,occurrenceDate:s.date};
 let v=1;const send=(rid,obs,time,m=null)=>{clock=Date.parse(at(s.date,time));mode=m;const r=cu.submit({actor,clientRequestId:rid,expectedVersion:v,review:{kind:'WEEKLY_REVIEW',eligibility:ELIG(s.date),observations:obs}});mode=null;if(r.ok)v=r.version;return r;};
 return {b,send};
}
const T=l=>l.find(o=>!o.fact&&o.sessionId==='w0-run-d1'&&!o.superseded),other=t=>Object.keys(t.provenance.parts).find(k=>k!==t.eventId);
test('SEC-INT-02R: the six forgeries of SEC_INT_R2 (p8-evolves-r2) are refused; the unaltered engine rows of both shapes are kept',()=>{
 const cases={
  'MERGE: the new voice\'s ADVERSE/IMPAIRED left out of the merged response':[{completed:true,minutes:40,rpe:4},t=>{t.response={...U};},false],
  'MERGE: rpe fabricated':[{completed:true,minutes:40,rpe:4},t=>{t.provenance.parts[other(t)].actual.rpe=9;t.actual.rpe=9;},false],
  'MERGE: effort fabricated':[{completed:true,minutes:40,rpe:4},t=>{t.provenance.parts[other(t)].response.effort='TOO_HARD';t.response.effort='TOO_HARD';},false],
  'KEPT VOICE read as a MERGE: completed true -> false, unflagged':[{completed:false,minutes:0},t=>{const k=other(t);delete t.conflicted;delete t.provenance.conflict;t.provenance.mergedSourceIds=[t.eventId,k];t.actual={...t.actual,completed:false,minutes:0};},false],
  'KEPT VOICE: a conflict label of no known kind':[{completed:true,minutes:90,rpe:4},t=>{t.provenance.conflict='NO_SUCH_LABEL';},false],
  'KEPT VOICE: the kept voice\'s amount fabricated':[{completed:true,minutes:90,rpe:4},t=>{t.provenance.parts[other(t)].actual.minutes=300;},false],
  'control MERGE':[{completed:true,minutes:40,rpe:4},()=>{},true],
  'control KEPT VOICE':[{completed:true,minutes:90,rpe:4},()=>{},true]};
 for(const [name,[ath,f,kept]] of Object.entries(cases)){
  const r=rig(l=>{f(T(l));return l;});assert.equal(code(r.send('hk',[DEV(r.b)],'08:00')),'OK');
  const x=r.send('form',[{...r.b,actual:ath,response:RESP}],'20:00','x');assert.equal(code(x),kept?'OK':'ENGINE_CONTRACT_VIOLATION',name);}
});
test('SEC-INT-02R: the legitimate shapes with two or more voices are kept: watch then form, form then watch, two watch fragments and a form, a correction of a merged voice with a stop',()=>{
 const t=athlete({id:'legit-1'});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');t.set(run.date,'21:00');t.screen(ELIG(run.date));
 t.clock+=60e3;assert.equal(code(t.import([t.watch(run)])),'OK');t.clock+=60e3;assert.equal(code(t.weekly(run.date,[t.form(run,{response:RESP})])),'OK');
 const row=t.live(run.id)[0];assert.equal(Object.keys(row.provenance.parts).length,2);assert.equal(row.response.recovery,'ADVERSE');
 const own=Object.entries(t.it.carried({actor:t.actor}).origins??{}).find(([,m])=>m.ch==='A'&&m.s===run.id)?.[0]??row.provenance.mergedSourceIds.find(x=>x!==row.eventId);
 t.clock+=60e3;const fix=t.weekly(run.date,[{...t.form(run),correctionOf:own,actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:RESP}]);
 assert.equal(code(fix),'OK',JSON.stringify(fix.error??null));assert.equal(fix.warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM');
 const u=athlete({id:'legit-2'});u.enroll();const r2=u.sessions(0).find(s=>s.id==='w0-run-d1');u.set(r2.date,'21:00');u.screen(ELIG(r2.date));
 u.clock+=60e3;assert.equal(code(u.weekly(r2.date,[u.form(r2,{response:RESP})])),'OK');u.clock+=60e3;assert.equal(code(u.import([u.watch(r2)])),'OK');
 u.clock+=60e3;assert.equal(code(u.import([u.watch(r2,{activityId:'HK-frag-2',endTime:'08:10'})])),'OK','a second fragment');
 assert.ok(Object.keys(u.live(r2.id)[0].provenance.parts).length>=2);
});

// ------------------------------------------------------------ limits (B2) ------------------------------------------------------------
test('SEC-INT-06: a report dated before the record began is refused (BEFORE_RECORD_START), whole, nothing written; reports from the enrollment day on are admitted',()=>{
 const t=athlete({id:'b6'});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');const first=t.doc().createdAt.slice(0,10);
 t.set(run.date,'21:00');t.screen(ELIG(run.date));const v=t.version(),raw=t.store.raw('b6');
 const w=t.watch(run);delete w.sessionId;
 const old=t.import([{...w,activityId:'HK-old',observedAt:at(addDays(first,-3),'07:00')}]);assert.equal(code(old),'BEFORE_RECORD_START');assert.equal(t.version(),v);assert.equal(t.store.raw('b6'),raw);
 const many=t.import(Array.from({length:30},(_,k)=>({...w,activityId:'HK-b'+k,observedAt:at(addDays(first,-1-(k%30)),'07:00')})));assert.equal(code(many),'BEFORE_RECORD_START');
 assert.equal(code(t.import([{...w,activityId:'HK-ok',observedAt:at(run.date,'06:00')}])),'OK');
});
test('SEC-INT-07: past the correction and per-day limits, a report that states a safety signal is still admitted (at most safetyExcess more) and the screen asks; a plain report past the limit is refused',()=>{
 const t=athlete({id:'b7'});t.enroll();const str=t.sessions(0).find(s=>s.sport==='STRENGTH');t.set(str.date,'08:00');let head=t.weekly(str.date,[t.form(str)]).recorded[0];
 for(let k=1;k<=LIMITS.correctionsPerReport;k++){t.clock+=60e3;const r=t.weekly(str.date,[{...t.form(str),correctionOf:head,actual:{...t.form(str).actual,minutes:20+k}}]);assert.equal(code(r),'OK');head=r.recorded[0];}
 t.clock+=60e3;assert.equal(code(t.weekly(str.date,[{...t.form(str),correctionOf:head}])),'LIMIT_EXCEEDED','plain');
 assert.equal(LIMITS.safetyExcess,3);for(let k=0;k<3;k++){t.clock+=60e3;const r=t.weekly(str.date,[{...t.form(str),correctionOf:head,actual:{...t.form(str).actual,stop:{reason:'SYMPTOM'},minutes:5+k},response:{...U,recovery:'ADVERSE'}}]);assert.equal(code(r),'OK',`safety ${k}`);head=r.recorded[0];}
 t.clock+=60e3;assert.equal(code(t.weekly(str.date,[{...t.form(str),correctionOf:head,actual:{...t.form(str).actual,stop:{reason:'SYMPTOM'},minutes:1}}])),'LIMIT_EXCEEDED','bounded');
 // Per day, the device channel: eight unplanned workouts, then a ninth refused; a safety signal cannot come from the device (it states none).
 const u=athlete({id:'b7d'});u.enroll();const run=u.sessions(0).find(s=>s.id==='w0-run-d1');const day=run.date;u.set(day,'23:00');u.screen(ELIG(day));
 const w=u.watch(run);delete w.sessionId;const out=[];for(let k=0;k<LIMITS.reportsPerDayPerChannel+1;k++){u.clock+=60e3;out.push(code(u.import([{...w,activityId:'HK-free-'+k,observedAt:at(day,String(6+k).padStart(2,'0')+':00')}])));}
 assert.deepEqual(out,[...Array(LIMITS.reportsPerDayPerChannel).fill('OK'),'LIMIT_EXCEEDED']);
});
test('O-SC-1 at the V1 entry: the most voices one session can hold through the boundary is bounded (one athlete chain, four device activities), whatever is sent',()=>{
 const t=athlete({id:'osc1'});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');t.set(run.date,'21:00');t.screen(ELIG(run.date));
 assert.equal(code(t.weekly(run.date,[t.form(run)])),'OK');
 for(let k=0;k<50;k++){t.clock+=60e3;t.import([t.watch(run,{activityId:'HK-'+(k%6),actual:{minutes:t.watch(run).actual.minutes+(k%3)}})]);}
 for(let k=0;k<50;k++){t.clock+=60e3;t.weekly(run.date,[t.form(run)]);}
 const parts=Object.keys(t.live(run.id)[0]?.provenance?.parts??{}).length;assert.ok(parts<=1+LIMITS.deviceActivitiesPerSession,`${parts} voices`);
 assert.ok(t.store.raw('osc1').length<400000,'the record stays small');
 assert.ok(VOICE_LIMIT+3>=1+LIMITS.deviceActivitiesPerSession,'the engine bound on a disputed row holds above it');
});

// -------------------------------------------------- SEC-INT-04 (rest), SSCTR-INT-R2-01, G07 --------------------------------------------------
test('SEC-INT-04 (rest): an erasure of health facts passes under a clock behind the record; the latest instant on record never moves back',()=>{
 const t=athlete({id:'b4'});t.enroll();const run=t.sessions(0).find(s=>s.id==='w0-run-d1');t.set(run.date,'08:00');
 const nf=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf-b4',expectedVersion:t.version(),...notFeeling100WithSign(run.date)});assert.equal(nf.ok,true);t.set(run.date,'21:00');t.weekly(run.date,[t.form(run)]);
 const lastAt=t.it.carried({actor:t.actor}).lastAt;t.clock-=86400e3;
 assert.equal(code(t.weekly(run.date,[])),'CLOCK_BEHIND_RECORD','a review still waits for the clock');
 const e=t.it.eraseHealthFacts({actor:t.actor,eventIds:[nf.eventId],expectedVersion:t.version()});assert.equal(code(e),'OK');
 assert.equal(t.it.carried({actor:t.actor}).lastAt,lastAt);
});
test('SSCTR-INT-R2-01: a duplicate-only answer carries the screen the record last asked for, never null while it is required',()=>{
 const t=athlete({id:'r201'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'20:00');
 const f={...t.form(s),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:U};
 assert.equal(t.weekly(s.date,[f]).warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM');t.set(s.date,'21:00');
 const d=t.weekly(s.date,[f]);assert.equal(d.duplicate,true);assert.equal(d.warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM');
});
test('G07: an erasure of health facts erases the stored screen (a delivery then waits for a new one) and keeps the stop as a safety retention (the screen is still asked)',()=>{
 const t=athlete({id:'g07'});t.enroll();const s=t.sessions(0).find(x=>x.id==='w0-run-d1');t.set(s.date,'20:00');
 assert.equal(t.weekly(s.date,[{...t.form(s),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:U}]).warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM');
 t.set(s.date,'21:00');const nf=t.api.notFeeling100({actor:t.actor,clientRequestId:'nf-g07',expectedVersion:t.version(),...notFeeling100WithSign(s.date)});assert.equal(nf.ok,true);
 t.set(s.date,'21:30');assert.equal(code(t.it.eraseHealthFacts({actor:t.actor,eventIds:[nf.eventId],expectedVersion:t.version()})),'OK');
 assert.equal(t.it.carried({actor:t.actor}).screen??null,null,'the athlete\'s answers are erased');
 const run=t.sessions(0).find(x=>x.id==='w0-run-d3');t.set(run.date,'20:00');
 assert.equal(code(t.it.importActivities({actor:t.actor,clientRequestId:'hk-g',expectedVersion:t.version(),activities:[t.watch(run)]})),'SCREEN_REQUIRED');
 assert.ok(t.carried().runFormatRecord.some(x=>x.report?.stop?.reason==='SYMPTOM'),'the stop fact is retained (no free text)');
 assert.equal(t.submit({kind:'WEEKLY_REVIEW',observations:[]}).warningSignScreen?.reason,'RUN_STOPPED_FOR_A_SYMPTOM');
});

// ---------------------------------------------------------- successor of A04L ----------------------------------------------------------
test('successor of QRE-INT-11 A04L: the limits are the reviewed values, with safetyExcess (SEC-INT-07) added',()=>{
 assert.deepEqual({...LIMITS},{observationBytes:16384,requestBytes:131072,observationsPerRequest:32,depth:8,arrayLength:64,keysPerObject:32,stringLength:512,idLength:128,
  correctionsPerReport:16,deviceActivitiesPerSession:4,reportsPerDayPerChannel:8,intakeBytes:65536,intakeArrayLength:512,safetyExcess:3});
});
