// Safety Continuity & Execution Occurrence (Founder mission of 2026-11-20, after COACHINGCORE-V1-CORE-SAFETY-FREEZE-6). Synthetic athletes only.
// - SEC-O1-01b/c (SEC_O1_R1 item 6, SSCTR_O1_R2 (c)): a declared stop on record after the latest readiness declaration keeps SB-1 asking until a
//   later readiness declaration, wherever the stop sits (the row in force, a kept voice, a history row a correction replaced). A correction, the
//   speaker rule or a dispute resolution settles the amount, never the readiness question. Every declared stop counts, zero-minute ones too
//   (O-NCC-S1). Integrity refusals still never count (P3).
// - C-O1-2 (SSCTR_O1_R1 decision A): a disputed session whose every well-formed kept voice says it took place is an occurrence for the restart
//   pause and the last executed day, whichever conflict path flagged it; its amount stays out of C-Q08-1 and every dose reader.
import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeObservations} from '../src/r6-provenance.mjs';
import {restartIntake,readReadiness,readinessFact,READINESS_SIGNS} from '../src/v1-f08.mjs';
import * as core from '../src/v1-safety-index.mjs';
import {client,athleteA,reportOf,liveSessions,at,ELIG,addDays,notFeeling100WithSign,readiness} from './v1core-helpers.mjs';

const ATH='ath-sc',DAY='2026-11-10',U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const shift=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const json=x=>JSON.parse(JSON.stringify(x));
// The engine binds each row's context to its session (the normalizer drops a client's own): here, by session id.
const bind=o=>({...o,context:o.context??(String(o.sessionId).startsWith('st')?{sport:'STRENGTH',sessionType:'STRENGTH_FULL'}:{sport:'RUN',sessionType:'RUN_EASY'})});
const N=(batch,asOf,prior)=>{const n=normalizeObservations(json(batch),{athleteId:ATH,asOf,maximumAgeDays:36500,incoming:true,...(prior?{prior:json(prior)}:{})});return {...n,accepted:n.accepted.map(bind),supersededRows:n.supersededRows.map(bind)};};
const rec=n=>[...n.accepted,...n.supersededRows];
const dx=shift(DAY,-5),T1=dx+'T13:00:00Z',T2=dx+'T15:00:00Z',T3=dx+'T20:00:00Z',T4=shift(DAY,-1)+'T09:00:00Z';
const WATCH=act=>({source:{provider:'HEALTHKIT',activityId:act,quality:'WEARABLE_FULL'},canonicalActivityId:act});
const rep=(id,sid,d,extra={})=>({athleteId:ATH,sessionId:sid,eventId:id,observedAt:d+'T09:00:00Z',reportedAt:d+'T12:00:00Z',context:{sport:'RUN',sessionType:'RUN_EASY'},response:U,actual:{completed:true,minutes:40},source:{provider:'MANUAL'},...extra});
const fix=(row,extra={},when=dx+'T16:00:00Z')=>({...row,correctionOf:row.eventId,correctedAt:when,reportedAt:when,...extra});
const live=(r,sid='sx')=>r.filter(o=>o.sessionId===sid&&o.superseded!==true&&!o.fact);
const voices=o=>Object.keys(o?.provenance?.parts??{}).sort();
const reread=(r,asOf=T4)=>rec(N([],asOf,r));
const STOP={completed:false,minutes:12,stop:{reason:'SYMPTOM'}},ADV={...U,recovery:'ADVERSE'},NOT_DONE={completed:false,minutes:0};
const READY=readReadiness({declaredRecovered:true,sports:{RUN:{ready:true}},warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false]))},{programmed:['RUN']}).value;
const ready=(at,id='ready-sc')=>readinessFact({athleteId:ATH},{event:{id},readiness:{}},at,READY,null);
const R0=ready(shift(dx,-3)+'T08:00:00.000Z'),LATER=()=>ready(shift(DAY,-1)+'T08:00:00.000Z','ready-later');
const intakeOf=()=>({asOf:DAY,athlete:{id:ATH,recent:{runMinutesPerWeek:600,runDaysPerWeek:7}}});
const restart=(record,referenceState=null)=>restartIntake({intake:intakeOf(),record:json(record),referenceState,asOf:DAY,screen:()=>({status:'NONCLINICAL'}),athleteId:ATH});
/** SB-1: true when the readiness declaration still stands in for the stops on record; undefined when the question is asked. */
const declared=(record,ref)=>restart(record,ref).facts?.pause?.readinessDeclared;
const ASKED=undefined;

// ---------- SEC-O1-01b/c: a declared stop never leaves SB-1 by a correction ----------
// The e7 base (SEC_O1_R1 §4): the athlete's "not done" N in force, then the athlete's symptom stop S of the same run, refused head-on and kept.
const NOTDONE=rep('N','sx',dx,{reportedAt:dx+'T11:00:00Z',actual:NOT_DONE});
const S=(extra={})=>rep('S','sx',dx,{reportedAt:dx+'T12:30:00Z',actual:STOP,response:ADV,...extra});
const e7=()=>rec(N([S()],T2,rec(N([NOTDONE],T1))));
const fixN=(extra={})=>({...NOTDONE,eventId:'N2',correctionOf:'N',correctedAt:dx+'T16:00:00Z',reportedAt:dx+'T16:00:00Z',actual:NOT_DONE,...extra});
const fixS=(extra={})=>({...S(),eventId:'S2',correctionOf:'S',correctedAt:dx+'T16:00:00Z',reportedAt:dx+'T16:00:00Z',actual:NOT_DONE,response:U,...extra});
const SHAPES={
 'B1 the athlete names another report (N)':fixN(),
 'B2 a correction with no source at all (the MANUAL default reads as the athlete)':(()=>{const c=fixN();delete c.source;return c;})(),
 'B3 a SELF_REPORT correction naming N':fixN({source:{provider:'X',quality:'SELF_REPORT'}}),
 'B4 an unknown speaker names the stop':fixS({eventId:'S9',source:{provider:'OTHER',quality:'UNVERIFIED'}}),
 'B5 the athlete names the stop':fixS(),
};
test('SEC-O1-01b/c: on a contested record (a kept stop), no correction shape sets the stop aside: SB-1 asks, after a re-read and a JSON round trip too',()=>{
 assert.equal(declared([R0,...e7()]),ASKED,'base e7 asks (SEC-NCC-02)');
 for(const [label,c] of Object.entries(SHAPES)){
  const n=N([c],T3,e7()),r=rec(n);
  assert.deepEqual(n.excluded,[],label+': the correction is admitted');
  assert.ok(r.some(o=>voices(o).includes('S')||o.eventId==='S'),label+': the stop stays on record (a voice or a history row)');
  assert.equal(declared([R0,...r]),ASKED,label+': FREEZE-6 DECLARED (SB-1 skipped)');
  assert.equal(declared([R0,...reread(json(reread(r)))]),ASKED,label+': after a re-read and a round trip');
  assert.equal(declared([LATER(),...r]),true,label+': a later readiness declaration answers it (no permanent block)');
 }
});
test('SEC-O1-01b/c: the sporting correction is still applied: the amount the record holds in force is the correction\'s, and only SB-1 keeps asking',()=>{
 // B5: the athlete corrects their own stop to "not done": the dispute with N is resolved (both say not done), the row in force is the correction.
 const r=rec(N([SHAPES['B5 the athlete names the stop']],T3,e7()));
 assert.deepEqual(live(r).map(o=>[o.eventId,o.conflicted===true,o.actual]),[['S2',false,NOT_DONE]],'resolved by agreement, as on FREEZE-6');
 assert.equal(declared([R0,...r]),ASKED,'13: a valid resolution of the sporting dispute is no readiness answer');
});
test('SEC-O1-01b/c: an admitted stop (no dispute) corrected away by its own speaker: SB-1 still asks; the reason does not matter, zero minutes included',()=>{
 const cases={
  'symptom stop, corrected to not done':[S({reportedAt:dx+'T11:00:00Z'}),{completed:false,minutes:0}],
  'stop for time (no symptom), corrected to not done':[S({reportedAt:dx+'T11:00:00Z',actual:{completed:false,minutes:12,stop:{reason:'TIME'}}}),{completed:false,minutes:0}],
  'stop with no reason stated, corrected to not done':[S({reportedAt:dx+'T11:00:00Z',actual:{completed:false,minutes:12,stop:{}}}),{completed:false,minutes:0}],
  'zero-minute symptom stop, corrected to not done':[S({reportedAt:dx+'T11:00:00Z',actual:{completed:false,minutes:0,stop:{reason:'SYMPTOM'}}}),{completed:false,minutes:0}],
  'duration corrected (12 to 0 minutes, stop omitted)':[S({reportedAt:dx+'T11:00:00Z'}),{completed:false,minutes:0}],
  'completion corrected (stopped to completed 40 minutes)':[S({reportedAt:dx+'T11:00:00Z'}),{completed:true,minutes:40}],
 };
 for(const [label,[s,actual]] of Object.entries(cases)){
  const l1=rec(N([s],T1));
  assert.equal(declared([R0,...l1]),ASKED,label+': asked before the correction');
  const r=rec(N([fix(s,{eventId:'S2',actual,response:U})],T3,l1));
  assert.deepEqual(live(r).map(o=>[o.eventId,o.actual]),[['S2',actual]],label+': the correction is the row in force');
  assert.equal(declared([R0,...r]),ASKED,label+': still asked');
  assert.equal(declared([LATER(),...r]),true,label+': a later declaration answers it');
 }
});
test('SEC-O1-01b/c (O-NCC-S1): a zero-minute stop after the declaration asks, in force or kept as a voice',()=>{
 const z={completed:false,minutes:0,stop:{reason:'SYMPTOM'}};
 assert.equal(declared([R0,...rec(N([S({actual:z})],T1))]),ASKED,'in force: FREEZE-6 DECLARED');
 // Kept: the athlete's "done 40" in force, then the zero-minute stop of the same run (head-on).
 const r=rec(N([S({actual:z})],T2,rec(N([rep('D','sx',dx,{reportedAt:dx+'T11:00:00Z'})],T1))));
 assert.ok(live(r)[0].conflicted&&voices(live(r)[0]).includes('S'));
 assert.equal(declared([R0,...r]),ASKED);
});
test('SEC-O1-01b/c: what does not ask: a stop-less "done" retracted by its own speaker, a stop observed before the declaration, an integrity refusal',()=>{
 const D=rep('D','sx',dx,{reportedAt:dx+'T11:00:00Z'}),l=rec(N([D],T1));
 assert.equal(declared([R0,...l]),ASKED,'a session done after the declaration asks (SB-1)');
 assert.equal(declared([R0,...rec(N([fix(D,{eventId:'D2',actual:NOT_DONE})],T3,l))]),true,'its own speaker retracts it: released, as before');
 const pre=shift(dx,-5),SP=rep('SP','sp',pre,{reportedAt:pre+'T12:30:00Z',actual:STOP});
 assert.equal(declared([R0,...rec(N([fix(SP,{eventId:'SP2',actual:NOT_DONE},pre+'T16:00:00Z')],pre+'T20:00:00Z',rec(N([SP],pre+'T13:00:00Z'))))]),true,'a stop before the declaration is answered by it');
 for(const [label,o] of Object.entries({'another athlete':S({athleteId:'someone-else'}),'invalid measure':S({actual:{completed:false,minutes:-3,stop:{reason:'SYMPTOM'}}}),'future report':S({reportedAt:shift(DAY,30)+'T00:00:00Z'})})){
  const n=N([o],T2,rec(N([NOTDONE],T1)));assert.equal(n.excluded.length,1,label);assert.equal(declared([R0,...rec(n)]),true,label+': never a signal');
 }
});
test('SEC-O1-01b/c: a refused correction leaves the stop as it was; an earlier declaration replayed never answers it; an independent clinical hold still holds',()=>{
 const l1=rec(N([S({reportedAt:dx+'T11:00:00Z'})],T1));
 for(const [label,c] of Object.entries({'chain to nothing':fix(S(),{eventId:'S2',correctionOf:'nothing',actual:NOT_DONE}),'another athlete':fix(S(),{eventId:'S2',athleteId:'someone-else',actual:NOT_DONE}),'before the report it corrects':fix(S(),{eventId:'S2',actual:NOT_DONE},dx+'T10:00:00Z')})){
  const n=N([c],T3,l1);assert.equal(n.excluded.length,1,label);assert.equal(declared([R0,...rec(n)]),ASKED,label);
 }
 const r=rec(N([fix(S(),{eventId:'S2',actual:NOT_DONE})],T3,l1));
 assert.equal(declared([R0,json(R0),...r]),ASKED,'15: the earlier declaration sent again');
 assert.equal(declared([R0,{...R0,eventId:'ready-copy'},...r]),ASKED,'15: the earlier declaration under another id');
 const held=restart([LATER(),...r],{pending:{status:'CLINICAL_HUMAN_REQUIRED'}});
 assert.equal(held.status,'CLINICAL_HUMAN_REQUIRED','a later declaration answers SB-1, never an independent clinical hold');
});

// ---------- C-O1-2: occurrence recognized, amount contested ----------
const P=rep('P','sp',shift(dx,-10),{reportedAt:shift(dx,-10)+'T12:00:00Z'}),base=()=>rec(N([P],shift(dx,-10)+'T13:00:00Z'));
const G=(...batches)=>{let r=base();batches.forEach((b,i)=>{r=rec(N(b,[T1,T2,T3,T4][i],r));});return r;};
const DEVICE=(id='X',extra={})=>rep(id,'sx',dx,{reportedAt:dx+'T11:00:00Z',...WATCH('hk-x'),...extra});
const ATH_A=(id='A',actual={completed:true,minutes:70},extra={})=>rep(id,'sx',dx,{reportedAt:dx+'T12:30:00Z',actual,...extra});
const read=record=>{const r=restart(record);return {pause:r.facts?.pause?{weeks:r.facts.pause.weeks,bySportDays:r.facts.pause.bySportDays}:null,last:r.carried?.priorCapacity?.lastExecutedDay??null,bySport:r.carried?.priorCapacity?.lastExecutedBySport??null,recent:r.intake?.athlete?.recent??null};};
const CONTROL=()=>read(G([DEVICE()])),ABSENT=()=>read(base());
test('C-O1-2: the device and the athlete agree the run took place and dispute its duration: the restart reads it as an occurrence, never its minutes',()=>{
 for(const order of ['device first','athlete first']){
  const r=order==='device first'?G([DEVICE()],[ATH_A()]):G([ATH_A()],[DEVICE()]),row=live(r)[0];
  assert.deepEqual([row.conflicted,row.provenance.conflict,voices(row).length],[true,'CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS',2],order+': a head-on dispute');
  const got=read(r);
  assert.deepEqual([got.pause,got.last,got.bySport],[CONTROL().pause,CONTROL().last,CONTROL().bySport],order+': pause and last executed day as the control (FREEZE-6: as if absent)');
  assert.deepEqual(got.recent,ABSENT().recent,order+': C-Q08-1 counts none of its minutes (the record bounds exposure as without it)');
 }
});
test('C-O1-2: no occurrence when a voice says it did not take place, when a voice is malformed, or when the flag comes from an integrity refusal',()=>{
 assert.deepEqual(read(G([DEVICE()],[ATH_A('Z',NOT_DONE)])).last,ABSENT().last,'2: done vs not done');
 assert.deepEqual(read(G([DEVICE()],[ATH_A('Z',NOT_DONE)],[ATH_A('W')])).last,ABSENT().last,'a third voice saying done does not settle the "not done"');
 const bad=G([DEVICE()],[ATH_A()]).map(o=>o.sessionId==='sx'&&!o.superseded?{...o,provenance:{...o.provenance,parts:{...o.provenance.parts,A:{...o.provenance.parts.A,actual:{completed:'yes',minutes:70}}}}}:o);
 assert.deepEqual(read(bad).last,ABSENT().last,'a malformed voice admits no occurrence (SEC-R2-02)');
 const reused=G([DEVICE()],[DEVICE('X',{actual:{completed:true,minutes:90}})]);
 assert.equal(live(reused)[0].provenance.conflict,'EVENT_ID_REUSED_WITH_DIFFERENT_FACTS');
 assert.deepEqual(read(reused).last,ABSENT().last,'an event id reused with other facts: interim reading kept (errs long)');
});
test('C-O1-2: corrections, late reports, a resolution, a refused correction, duplicates, a re-read and a round trip',()=>{
 const disputed=()=>G([DEVICE()],[ATH_A()]);
 assert.deepEqual(read(G([DEVICE()],[ATH_A()],[fix(ATH_A(),{eventId:'A2',actual:NOT_DONE})])).last,ABSENT().last,'3: the athlete corrects to not done: the device still says done, so disputed occurrence: none');
 assert.deepEqual(read(G([DEVICE()],[fix(DEVICE(),{eventId:'X2',actual:NOT_DONE},dx+'T14:00:00Z')])).last,ABSENT().last,'3: an admitted run corrected to not done: no execution');
 const late=G([DEVICE()],[],[],[ATH_A('A',{completed:true,minutes:70},{reportedAt:shift(DAY,-2)+'T08:00:00Z'})]);
 assert.equal(live(late)[0].conflicted,true);assert.deepEqual(read(late).last,CONTROL().last,'6: a conflicting report received late');
 const resolved=G([DEVICE()],[ATH_A()],[fix(ATH_A(),{eventId:'A2',actual:{completed:true,minutes:40}})]);
 assert.equal(live(resolved)[0].conflicted===true,false);assert.deepEqual(read(resolved),{...CONTROL(),recent:read(resolved).recent},'7: resolved: an execution, as before');
 const refused=rec(N([fix(ATH_A(),{eventId:'A3',correctionOf:'nothing'})],T4,disputed()));
 assert.equal(live(refused)[0].conflicted,true);assert.deepEqual(read(refused).last,CONTROL().last,'9: a refused correction');
 const dup=G([DEVICE(),{...DEVICE('X'),eventId:'X'}],[ATH_A(),ATH_A()]);
 assert.deepEqual([read(dup).pause,read(dup).last],[CONTROL().pause,CONTROL().last],'10: duplicates: one execution');
 assert.deepEqual(read(reread(json(reread(disputed())))),read(disputed()),'11: a re-read and a JSON round trip');
 assert.deepEqual(read(rec(N([ATH_A('M',{completed:true,minutes:55},{reportedAt:dx+'T13:30:00Z'})],T3,disputed()))).last,CONTROL().last,'a third voice saying done: still an occurrence');
});
test('C-O1-2: an interrupted run in dispute (the device whole, the athlete\'s stop) is an occurrence, and SB-1 still asks for its stop; a later declaration answers it',()=>{
 const r=G([DEVICE()],[ATH_A('A',STOP,{response:ADV})]);
 assert.deepEqual(read(r).last,CONTROL().last,'5: the stop says it took place (12 minutes)');
 assert.equal(declared([R0,...r]),ASKED,'SB-1 asks (13: return after a recovery declaration needs a later one)');
 const after=restart([LATER(),...r]);
 assert.deepEqual([after.facts.pause.readinessDeclared,after.carried.priorCapacity.lastExecutedDay],[true,CONTROL().last]);
});
test('C-O1-2: a strength session in dispute on its loads is an occurrence for STRENGTH, never its sets or loads',()=>{
 const ex=kg=>({completed:true,minutes:50,exercises:[{id:'squat',sets:[{reps:5,load:{value:kg,unit:'KG'}},{reps:5,load:{value:kg,unit:'KG'}}]}]});
 const st=(id,kg,extra={})=>rep(id,'st',dx,{context:{sport:'STRENGTH',sessionType:'STRENGTH_FULL'},actual:ex(kg),...extra});
 const r=rec(N([st('L2',100,{reportedAt:dx+'T12:30:00Z'})],T2,rec(N([st('L1',60,{reportedAt:dx+'T11:00:00Z'})],T1,base()))));
 assert.equal(live(r,'st')[0].conflicted,true);
 assert.equal(read(r).bySport.STRENGTH,dx,'FREEZE-6: null');
 assert.equal(read(r).bySport.RUN,P.observedAt.slice(0,10),'the run sport is untouched');
});

// ---------- the engine: weekly reviews, persistence, the restart (16, 17, 18) ----------
const U3=U,upd=(id,day,pause)=>{const u={...athleteA({weeks:8,id}),asOf:day,startDate:addDays(day,3)};u.athlete.eligibility=ELIG(day);if(pause)u.athlete.pause=pause;else delete u.athlete.pause;return u;};
/** A hold, the readiness declaration, then a run after it reported with a stop; returns the client, the run and its report. */
function afterDeclaration(id,stopActual){
 const c=client(core);c.onboard(athleteA({weeks:8,id}));const p=c.env.program,d0=addDays(p.startDate,6);
 c.review('WEEKLY_REVIEW',at(d0),{eligibility:ELIG(d0),observations:liveSessions(c.env,0).map(s=>reportOf(c.env,s))},'w0');
 const h=addDays(p.startDate,8),rd=addDays(h,4);c.review('NOT_FEELING_100',at(h,'08:00'),notFeeling100WithSign(h),'hold');c.review('READINESS_DECLARATION',at(rd,'08:00'),readiness(rd),'ready');
 const s=liveSessions(c.env,2).find(x=>x.sport==='RUN'&&x.date>rd),b=reportOf(c.env,s,{tag:'-sc'});
 const stop={...b,eventId:'stop-sc',reportedAt:at(s.date,'20:30'),actual:stopActual,response:{...U3,recovery:'ADVERSE'}};
 c.review('WEEKLY_REVIEW',at(s.date,'21:00'),{eligibility:ELIG(s.date),observations:[stop]},'stop');
 return {c,s,stop};
}
for(const [label,stopActual] of [['symptom stop at 12 minutes',{completed:false,minutes:12,stop:{reason:'SYMPTOM'}}],['zero-minute stop, no symptom',{completed:false,minutes:0,stop:{reason:'TIME'}}]]){
 test(`SEC-O1-01b/c engine (${label}): corrected to not done, then weekly reviews, a round trip and a replay: the restart asks; a later declaration or a stated reason answers`,()=>{
  const {c,s,stop}=afterDeclaration('core-sc-'+label.length,stopActual);
  const corr={...stop,eventId:'stop-sc-fix',correctionOf:'stop-sc',correctedAt:at(s.date,'22:00'),reportedAt:at(s.date,'22:00'),actual:{completed:false,minutes:0},response:U3};
  c.review('WEEKLY_REVIEW',at(s.date,'22:30'),{eligibility:ELIG(s.date),observations:[corr]},'fix');
  assert.deepEqual(c.env.actualLedger.filter(o=>o.sessionId===s.id&&!o.fact).map(o=>[o.eventId,o.superseded===true]).sort(),[['stop-sc',true],['stop-sc-fix',false]],'the stop is a history row, the correction in force');
  const next=addDays(s.date,1);c.review('WEEKLY_REVIEW',at(next,'20:00'),{eligibility:ELIG(next)},'next');
  c.env.actualLedger=json(c.env.actualLedger);
  c.review('WEEKLY_REVIEW',at(next,'21:00'),{eligibility:ELIG(next),observations:[corr]},'replay');
  assert.ok(c.env.actualLedger.some(o=>o.eventId==='stop-sc'&&o.superseded===true),'16/18: the history row survives reviews, a round trip and a replay');
  const day=addDays(s.date,3),ask=c.restart(upd(c.env.program.athleteId,day,null),at(day,'10:00'));
  assert.deepEqual([ask.status,ask.missingInputs?.some(k=>k.startsWith('athlete.pause.'))],['ASK',true],'17: FREEZE-6 PROPOSED without asking');
  const reason=client(core,c.env).restart(upd(c.env.program.athleteId,day,{reasonCategory:'SCHEDULE',nonclinical:true,weeks:0}),at(day,'10:00'));
  assert.equal(reason.status,'PROPOSED','with the pause reason stated (the SB-1 question answered)');
  // 14: a readiness declaration made after the stop answers it. The engine records a declaration only while a hold stands, so: a hold, then it.
  const d1=addDays(s.date,2),d2=addDays(s.date,3),later=addDays(s.date,4),c2=client(core,c.env);c2.review('NOT_FEELING_100',at(d1,'08:00'),notFeeling100WithSign(d1),'hold-2');
  assert.equal(c2.review('READINESS_DECLARATION',at(d2,'08:00'),readiness(d2),'ready-2').status!=='KEEP',true,'the declaration is recorded');
  assert.equal(c2.restart(upd(c.env.program.athleteId,later,null),at(later,'10:00')).status,'PROPOSED','14: a later readiness declaration answers it');
 });
}
test('C-O1-2 engine: a run reported by the watch and by the athlete with other minutes (head-on, kept), a round trip: the restart reads the record\'s pause as the control',()=>{
 const go=dispute=>{const c=client(core);c.onboard(athleteA({weeks:8,id:'core-sc-occ'}));const p=c.env.program,d=addDays(p.startDate,6);
  // Week 0 reported up to its d3 run, so that run is the last one the record holds.
  const d3=liveSessions(c.env,0).find(s=>s.id==='w0-run-d3').date,obs=liveSessions(c.env,0).filter(s=>s.date<=d3).map(s=>reportOf(c.env,s)),i=obs.findIndex(o=>o.sessionId==='w0-run-d3'),x=obs[i],m={...x.actual};delete m.rpe;
  obs[i]={...x,eventId:'dev-d3',actual:m,response:U3,source:{provider:'HEALTHKIT',activityId:'HK-SC',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-SC'};
  c.review('WEEKLY_REVIEW',at(d),{eligibility:ELIG(d),observations:obs},'w0');
  if(dispute)c.review('WEEKLY_REVIEW',at(d,'21:00'),{eligibility:ELIG(d),observations:[{sessionId:x.sessionId,occurrenceDate:x.occurrenceDate,eventId:'app-d3',reportedAt:at(d,'20:30'),actual:{completed:true,minutes:(m.minutes??30)+40},response:U3}]},'dispute');
  c.env.actualLedger=json(c.env.actualLedger);
  const row=c.env.actualLedger.find(o=>o.sessionId==='w0-run-d3'&&!o.superseded&&!o.fact);
  const day=addDays(p.startDate,30),r=restartIntake({intake:{...upd('core-sc-occ',day,null),athlete:{id:p.athleteId}},record:c.env.actualLedger,asOf:day,screen:()=>({status:'NONCLINICAL'}),athleteId:p.athleteId});
  return {conflicted:row.conflicted===true,voices:voices(row).length,last:r.carried.priorCapacity.lastExecutedBySport,pause:r.facts.pause.bySportDays,d3};};
 const ctl=go(false),dis=go(true);
 assert.deepEqual([dis.conflicted,dis.voices,ctl.last.RUN],[true,2,ctl.d3],'the control: its last run is d3');
 assert.deepEqual([dis.last,dis.pause],[ctl.last,ctl.pause],'the disputed d3 run is the last executed run, as in the control');
});

// ---------- SEC-O1-02 / QRE-O1-02 (P1): a quarantine with no flagged row on its identity ----------
// A report refused for integrity on an execution (an activity of another session, a self-flagged report whose chain is refused, an event id of
// another session's report) quarantines that execution for the rest of the pass with no row flagged on it, so nothing of it carries to the next
// review. Such a quarantine is no dispute of that execution: a later valid report of it in the same pass is read as in the next review (P7).
const Z=rep('Z','sz',shift(dx,-4),{...WATCH('hk-z'),reportedAt:shift(dx,-4)+'T12:00:00Z'});
const lz=()=>rec(N([NOTDONE,Z],T1));
const BORROWED=rep('B','sx',dx,{reportedAt:dx+'T12:10:00Z',...WATCH('hk-z'),actual:{completed:true,minutes:30}});
const SELF_FLAG={...rep('X','sx',dx,{reportedAt:dx+'T12:10:00Z'}),conflicted:true,correctionOf:'nothing',correctedAt:dx+'T12:10:00Z'};
const shape=r=>live(r).map(o=>[o.eventId,o.conflicted===true,voices(o)]);
test('SEC-O1-02 (p1 C1/C3): a valid stop after a refused borrowed-activity or self-flagged report in one review is read as in the next review: kept, SB-1 asks',()=>{
 const split=rec(N([S()],T3,rec(N([BORROWED],T2,lz()))));
 assert.deepEqual([shape(split),declared([R0,...split])],[[['N',true,['N','S']]],ASKED],'two reviews (the reference)');
 for(const [label,first] of [['C1 borrowed activity',BORROWED],['C3 self-flagged, chain refused',SELF_FLAG]]){
  const n=N([first,S()],T2,lz()),r=rec(n);
  assert.deepEqual(n.excluded.map(e=>e.eventId+':'+e.reason),[first.eventId+':'+(label.startsWith('C1')?'ACTIVITY_BOUND_TO_TWO_SESSIONS':'INVALID_CORRECTION_CHAIN'),'S:DUPLICATE_CONFLICT_QUARANTINED'],label+': FREEZE-6 refused S as IDENTITY_QUARANTINED_BY_CONFLICT, not kept');
  assert.deepEqual(shape(r),shape(split),label+': as the split');
  assert.equal(declared([R0,...r]),ASKED,label);
  assert.deepEqual(shape(reread(json(r))),shape(split),label+': and after a re-read');
 }
 const c2=rec(N([S({reportedAt:dx+'T12:05:00Z'}),BORROWED],T2,lz()));
 assert.deepEqual([shape(c2),declared([R0,...c2])],[[['N',true,['N','S']]],ASKED],'C2: the other order');
});
test('SEC-O1-02: what stays: the borrowed report is refused and never kept, the session that holds the activity is flagged, a carried dispute still quarantines',()=>{
 const n=N([BORROWED,S()],T2,lz()),r=rec(n);
 assert.ok(!r.some(o=>voices(o).includes('B')||o.eventId==='B'),'the borrowed report is no voice');
 assert.equal(live(r,'sz')[0].conflicted,true,'the session holding hk-z is flagged (QRE-R6-13)');
 assert.ok(n.quarantinedIdentities.includes('session:sx')&&n.quarantinedIdentities.includes('session:sz'),'the pass still reports both identities quarantined');
 // A valid report with no row on its identity, after the refusal: admitted in force, as in the next review.
 const fresh=rep('F','sy',dx,{reportedAt:dx+'T12:20:00Z'}),b2={...BORROWED,eventId:'B2',sessionId:'sy'};
 assert.deepEqual(live(rec(N([b2,fresh],T2,lz())),'sy').map(o=>o.eventId),live(rec(N([fresh],T3,rec(N([b2],T2,lz())))),'sy').map(o=>o.eventId));
 // A dispute carried from an earlier review still quarantines: a third voice is kept, never admitted.
 const k=N([rep('T','sx',dx,{reportedAt:dx+'T17:00:00Z',actual:{completed:true,minutes:5}})],T3,e7());
 assert.deepEqual([k.excluded.map(e=>e.reason),shape(rec(k))],[['IDENTITY_QUARANTINED_BY_CONFLICT'],[['N',true,['N','S','T']]]]);
});
test('QRE-O1-02: an event id reused from another session quarantines no dispute here: a later correction meets the row in force and the device voice is heard',()=>{
 const M1=rep('M1','s1',dx,{reportedAt:dx+'T10:00:00Z',actual:{completed:true,minutes:20}}),W1=rep('W1','s1',dx,{reportedAt:dx+'T10:30:00Z',...WATCH('hk-1'),actual:{completed:true,minutes:40}}),M2=rep('M2','s2',dx,{reportedAt:dx+'T10:45:00Z'});
 const l=rec(N([M1,W1,M2],T1));
 assert.deepEqual(shape(l.filter(o=>o.sessionId==='s1').map(o=>({...o,sessionId:'sx'}))),[['M1',true,['M1','W1']]]);
 const C0=fix(M1,{eventId:'C0',actual:{completed:true,minutes:40}},dx+'T13:00:00Z'),reuse={...fix(C0,{eventId:'M2',actual:{completed:true,minutes:30}},dx+'T14:00:00Z'),correctionOf:'C0'};
 const A9=fix(M1,{eventId:'A9',actual:NOT_DONE},dx+'T15:00:00Z');
 const one=rec(N([C0,reuse,A9],T3,l)),split=rec(N([A9],T4,rec(N([C0,reuse],T3,l))));
 const s1=r=>live(r,'s1').map(o=>[o.eventId,o.conflicted===true,voices(o)]);
 assert.ok(s1(one).some(([,c,v])=>c&&v.includes('W1')),'FREEZE-6: A9 in force, clean, not done, W1 retired unheard: '+JSON.stringify(s1(one)));
 assert.deepEqual(s1(one),s1(split),'one review reads as two');
});

// ---------- SEC-O1-03 (P1): a bounded number of kept voices per flagged row ----------
test('SEC-O1-03: 2000 disputing reports on one session keep at most VOICE_LIMIT voices; the row stays disputed; a replay changes nothing; a stop beyond the limit is still kept once',async()=>{
 const {VOICE_LIMIT}=await import('../src/r6-provenance.mjs');
 const dev=rep('D','sd',dx,{reportedAt:dx+'T11:00:00Z',...WATCH('hk-d')}),ld=rec(N([dev],T1));
 const spam=Array.from({length:2000},(_,i)=>rep('sp'+i,'sd',dx,{reportedAt:dx+'T12:30:00Z',source:{provider:'OTHER',quality:'UNVERIFIED'},actual:{completed:true,minutes:5+i%7,pad:'x'.repeat(1000)}}));
 const n=N(spam,T2,ld),r=rec(n),row=live(r,'sd')[0];
 assert.equal(Object.keys(row.provenance.parts).length,VOICE_LIMIT,'FREEZE-6: 2001 voices, 2.6 MB');
 assert.ok(Buffer.byteLength(JSON.stringify(r))<VOICE_LIMIT*1600,'the record is bounded');
 assert.equal(n.excluded.length,2000,'every report is still refused, with its input hash');assert.ok(n.excluded.every(e=>typeof e.inputHash==='string'));
 assert.equal(row.conflicted,true);
 assert.deepEqual(rec(N(spam.slice(1990),T3,r)),json(rec(N([],T3,r))),'a replay of the excess changes nothing');
 const stop=rep('ST','sd',dx,{reportedAt:dx+'T13:00:00Z',actual:{completed:false,minutes:3,stop:{reason:'SYMPTOM'}}});
 const r2=rec(N([stop],T3,r)),row2=live(r2,'sd')[0];
 assert.ok(voices(row2).includes('ST'),'a stop beyond the limit is kept while the row holds none');
 assert.equal(declared([R0,...r2]),ASKED);
 assert.equal(Object.keys(live(rec(N([{...stop,eventId:'ST2'}],T4,r2)),'sd')[0].provenance.parts).length,VOICE_LIMIT+1,'a second stop beyond it is not');
 // At the measured load (a device, the athlete, a re-sync) nothing changes: the voices are all kept.
 const few=rec(N([rep('A','sd',dx,{reportedAt:dx+'T12:00:00Z',actual:{completed:true,minutes:70}}),rep('U','sd',dx,{reportedAt:dx+'T12:10:00Z',source:{provider:'OTHER',quality:'UNVERIFIED'},actual:{completed:true,minutes:9}})],T2,ld));
 assert.deepEqual(voices(live(few,'sd')[0]),['A','D','U']);
});

// ---------- cycle 1 (SEC-SC-01, QRE-SC-02, QRE-SC-03): beyond the limit, arrival order never decides what f08 reads ----------
test('cycle 1 (QRE-SC-02 a): past the limit, the athlete\'s "not done" arriving last is still kept: no occurrence, the same pause in both orders',()=>{
 const dev=rep('D','sd',dx,{reportedAt:dx+'T11:00:00Z',...WATCH('hk-d')}),ld=rec(N([dev],T1));
 const done=Array.from({length:20},(_,i)=>rep('d'+i,'sd',dx,{reportedAt:dx+'T12:'+String(10+i).padStart(2,'0')+':00Z',source:{provider:'OTHER',quality:'UNVERIFIED'},actual:{completed:true,minutes:5+i%7}}));
 const nd=rep('ND','sd',dx,{reportedAt:dx+'T12:45:00Z',actual:NOT_DONE}),ndFirst={...nd,reportedAt:dx+'T12:05:00Z'};
 const last=rec(N([...done,nd],T2,ld)),first=rec(N([ndFirst,...done],T2,ld));
 assert.ok(voices(live(last,'sd')[0]).includes('ND'),'FREEZE-6 kept it; d6348ff dropped it');
 assert.equal(read(last).last,read(first).last,'the same last executed day in both orders');
 assert.deepEqual(read(last).pause,read(first).pause);
 assert.ok(Object.keys(live(last,'sd')[0].provenance.parts).length<=16+3);
});
test('cycle 1 (QRE-SC-02 b, SEC-SC-01 a): past the limit, a "done" after the declaration arriving last is still kept: SB-1 asks in both orders',()=>{
 const N0=rep('N0','sd',dx,{reportedAt:dx+'T11:00:00Z',actual:NOT_DONE}),l=rec(N([N0],T1));
 const nds=Array.from({length:20},(_,i)=>rep('n'+i,'sd',dx,{reportedAt:dx+'T12:'+String(10+i).padStart(2,'0')+':00Z',source:{provider:'OTHER',quality:'UNVERIFIED'},actual:NOT_DONE,response:{...U,recovery:i%2?'ADVERSE':'COMPATIBLE'}}));
 const D=rep('DN','sd',dx,{reportedAt:dx+'T12:45:00Z',actual:{completed:true,minutes:30}}),Dfirst={...D,reportedAt:dx+'T12:05:00Z'};
 const last=rec(N([...nds,D],T2,l)),first=rec(N([Dfirst,...nds],T2,l));
 assert.ok(live(last,'sd')[0].conflicted,'disputed (the responses disagree)');
 assert.equal(declared([R0,...last]),ASKED,'d6348ff: DECLARED');
 assert.equal(declared([R0,...first]),ASKED);
});
test('cycle 1 (QRE-SC-03): a stop:false is no stop; an excess report beyond the limit writes nothing, so its id reused later is not an integrity conflict of the row',()=>{
 const D=rep('D','sx',dx,{reportedAt:dx+'T11:00:00Z'}),l=rec(N([D],T1));
 assert.equal(declared([R0,...rec(N([fix(D,{eventId:'D2',actual:{completed:false,minutes:0,stop:false}})],T3,l))]),true,'stop:false is no stop');
 const dev=rep('D','sd',dx,{reportedAt:dx+'T11:00:00Z',...WATCH('hk-d')}),ld=rec(N([dev],T1));
 const spam=Array.from({length:30},(_,i)=>rep('sp'+i,'sd',dx,{reportedAt:dx+'T12:30:00Z',source:{provider:'OTHER',quality:'UNVERIFIED'},actual:{completed:true,minutes:5+i%7}}));
 const r=rec(N(spam,T2,ld)),row=live(r,'sd')[0];assert.ok(!voices(row).includes('sp29'),'sp29 is an excess report');
 const reuse=rep('sp29','sd',dx,{reportedAt:dx+'T13:00:00Z',source:{provider:'OTHER',quality:'UNVERIFIED'},actual:{completed:true,minutes:99}});
 const after=live(rec(N([reuse],T3,r)),'sd')[0];
 assert.equal(after.provenance.conflict,row.provenance.conflict,'its id was never the record\'s: no EVENT_ID_REUSED flag');
 // the same in one review (the event index of that pass): the reused id meets nothing, the row keeps its head-on dispute (and its occurrence)
 const one=live(rec(N([...spam,reuse],T2,ld)),'sd')[0];
 assert.deepEqual([one.provenance.conflict,voices(one)],[row.provenance.conflict,voices(row)],'in one review too');
});
