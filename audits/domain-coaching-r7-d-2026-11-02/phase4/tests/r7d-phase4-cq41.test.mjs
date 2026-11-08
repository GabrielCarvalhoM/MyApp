// R7-D Phase 4: directed tests for QRE3-P35-01 (QRE-R7D-PHASE35-CHECK-r2, condition CQ4-1). Three clauses of the Phase 3.5 bounded cycle's
// duplicate re-read (returnAfterPause: an unnamed report with the latest break's days re-reads the recorded return, as the named report does) were
// pinned by no test; mutants QF3, QF6 and QF7 survived the whole suite. Each test below is the shape the recheck named and must be RED on its mutant:
//   T39 (N6, QF3): an unnamed re-send by its last day and length only (no first day) is still the latest break's duplicate;
//   T40 (N9, QF7): after a named correction, an unnamed re-send of the corrected dates is a duplicate of the report in force;
//   T41 (N16b, QF6; N2 optional): in the R07 confirmation-first order an unnamed same-dates confirmation asks the start time, as the named one does;
//       with a partial client record it asks for the record, as the named one does.
// Outside CoachingCore on purpose: the suite R7D-FREEZE-5 binds stays 1005 tests and no bound byte changes (R7-D Phase 4 changes no runtime, test or
// harness byte the freeze binds). The tests read the runtime under R7D_P4_ROOT (default: this worktree) through its own fixtures, so the same file
// runs on the frozen bytes and on a mutant copy. No runtime change; no number. Development fixtures only, never holdout evidence.
//   node --test audits/domain-coaching-r7-d-2026-11-02/phase4/tests/r7d-phase4-cq41.test.mjs        (R7D_P4_ROOT=<root> for another runtime)
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const ROOT=path.resolve(process.env.R7D_P4_ROOT??path.resolve(import.meta.dirname,'../../../..'));
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/r7/b/fixtures/helpers.mjs')).href);

// The fixtures of CoachingCore/test/r7d-phase35.test.mjs (T33, T36), unchanged.
const GEN={id:'r7d-p35-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const step=(t,w,x={},{ledger=null}={})=>{const L=ledger??t.ledger;const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(L.length?{actualLedger:L}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref});
let BASE=null;
/** Weeks 0-1 executed and reviewed; nothing reported after them. Strength Mon (PM) and Fri (PM), runs Tue and Thu, the long run Sun. */
function base(){if(!BASE){const t={p:program(GEN),ledger:[],ref:null};for(const w of [0,1])step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))});BASE=t;}return copy(BASE);}
const day=n=>addDays(base().p.weeks[2].startDate,n);
const brk=(from,to,x={})=>({startDate:day(from),endDate:day(to),days:to-from+1,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true,...x});
const trip=(from,to,x={})=>brk(from,to,{reasonCategory:'WORK',reason:'Work trip',...x});
const A=()=>brk(0,13);
const notDone=(p,s)=>obs(p,s,{actual:{completed:false,minutes:0}});
const dow=s=>new Date(s.date+'T00:00:00Z').getUTCDay();
const friStrength=s=>s.sport==='STRENGTH'&&dow(s)===5;
const miss=pred=>(p,s)=>pred(s)?notDone(p,s):obs(p,s);
const weekObs=(p,w,f=(q,s)=>obs(q,s))=>p.weeks[w].sessions.filter(live).map(s=>f(p,s));
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH'),lastReturn=p=>returns(p).at(-1)?.interruption;
const stops=d=>(d?.separateBreaks??[]).map(b=>b.stop);
const runsAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from)).map(s=>`${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}`);
const strengthAhead=(p,w,from)=>p.weeks.slice(w,w+2).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.load?.mode==='KNOWN'?e.load.value:e.load?.mode}`));
/** The return in force and the doses ahead from day `d` of week `w`, with each episode id reduced to its role (the part after the last '-'). */
function view(t,w,d=6){const x=lastReturn(t.p),from=addDays(t.p.weeks[w].startDate,d),role=s=>String(s).split('-').at(-1);
 return {stop:x?[x.startDate,x.endDate,x.days,x.class,(x.separateBreaks??[]).map(b=>role(b.episode)+':'+b.stop).join()]:null,runs:runsAhead(t.p,w,from),strength:strengthAhead(t.p,w,from)};}
const isAsk=(r,inputs)=>r.action==='ASK'&&JSON.stringify(r.missingInputs)===JSON.stringify(inputs);
/** The Founder's case: A kept (wk2-3) on Mon wk4; weeks 4-5 reported with Friday strength missed; the trip Mon-Thu wk6 named, declared Fri wk6
 * 07:00; a plain review at 08:00 returns the athlete, the holiday read as its own return (OWN_RETURN). */
function founders(id){
 const t=base();
 step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:A(),event:{id:id+'-A',kind:'SYSTEMIC_FATIGUE'}});
 step(t,6,{day:4,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:{...trip(28,31),episodeId:id+'-D'},event:{id:id+'-D',kind:'LOCAL_FATIGUE'},observations:[4,5].flatMap(w=>weekObs(t.p,w,miss(friStrength)))});
 return {t,r:step(t,6,{day:4,hour:'08:00:00'})};
}
const liftOf=t=>obs(t.p,t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.date===day(0)));
/** The latest break's report again as a return report at `when`, unnamed or named (its episodeId), with the facts `i`. */
const resend=(x,id,i,{named,when={day:5,hour:'11:00:00'},ledger=null})=>step(x.t,6,{...when,kind:'RETURN_AFTER_PAUSE',interruption:named?{...i,episodeId:id+'-D'}:i,event:{id:`${id}-re-${when.hour}`,kind:'RETURN_AFTER_PAUSE'}},{ledger});
/** Both forms on fresh copies of one shape; `before(x,id)` prepares, `act(x,id,named)` sends. */
const both=(tag,before,act)=>Object.fromEntries([['unnamed',false],['named',true]].map(([k,named])=>{const id=`${tag}${named?'n':'u'}`,x=founders(id);
 assert.equal(x.r.action,'REESTABLISH',x.r.reason);assert.deepEqual(stops(lastReturn(x.t.p)),['OWN_RETURN','LATEST'],'the first return reads the holiday as its own return');
 before?.(x,id);return [k,{x,r:act(x,id,named)}];}));

test('R7-D Phase 4 T39 (QRE3-P35-01, N6; kills QF3): an unnamed re-send of the latest break by its last day and length only is its duplicate: the holiday stays its own return and the doses equal the named re-send',()=>{
 const {startDate,...lastDayAndLength}=trip(28,31);
 const {unnamed:u,named:n}=both('t39',null,(x,id,named)=>resend(x,id,lastDayAndLength,{named}));
 assert.equal(u.r.action,'REESTABLISH',u.r.reason);assert.equal(n.r.action,'REESTABLISH',n.r.reason);
 assert.deepEqual(stops(lastReturn(u.x.t.p)),['OWN_RETURN','LATEST'],'QF3 re-established the trip alone (separateBreaks dropped): a duplicate read only from a stated first day');
 assert.deepEqual(view(u.x.t,6),view(n.x.t,6),'the unnamed re-send equals the named one (QF3: back-squat 2x8@85 against 1x7 ESTABLISH)');
});

test('R7-D Phase 4 T40 (QRE3-P35-01, N9; kills QF7): after a named correction of the trip, an unnamed re-send of the corrected dates is a duplicate of the report in force: the holiday stays its own return and the doses equal the named re-send',()=>{
 const corrected=trip(28,32);
 const {unnamed:u,named:n}=both('t40',(x,id)=>{const c=resend(x,id,corrected,{named:true,when:{day:5,hour:'10:00:00'}});assert.equal(c.action,'REESTABLISH',c.reason);assert.deepEqual(stops(lastReturn(x.t.p)),['OWN_RETURN','LATEST'],'the named correction re-reads the record');},
  (x,id,named)=>resend(x,id,corrected,{named}));
 assert.equal(u.r.action,'REESTABLISH',u.r.reason);assert.equal(n.r.action,'REESTABLISH',n.r.reason);
 assert.deepEqual(stops(lastReturn(u.x.t.p)),['OWN_RETURN','LATEST'],'QF7 compared with the first report of the trip and re-established the corrected trip alone');
 assert.equal(lastReturn(u.x.t.p).endDate,day(32),'the corrected last day stays in force');
 assert.deepEqual(view(u.x.t,6),view(n.x.t,6),'the unnamed re-send equals the named one (QF7: back-squat 2x8@85 against 1x7 ESTABLISH)');
});

test('R7-D Phase 4 T41 (QRE3-P35-01, N16b and N2; kills QF6): a decision of the unnamed re-read is the athlete\'s answer exactly as for the named report: the confirmation-first order asks the holiday\'s start time, and a partial record asks for the record',()=>{
 // (a) N16b: the late first-day lift asks the holiday's start time; the trip is then confirmed by the same dates before that time is given.
 const lift=(x)=>{const q=step(x.t,6,{day:5,hour:'09:00:00',observations:[liftOf(x.t)]});assert.ok(isAsk(q,['interruption.startedAt']),q.reason);};
 const {unnamed:u,named:n}=both('t41',lift,(x,id,named)=>resend(x,id,trip(28,31),{named,when:{day:5,hour:'10:00:00'}}));
 assert.ok(isAsk(n.r,['interruption.startedAt']),'the named confirmation asks the start time: '+n.r.reason);
 assert.ok(isAsk(u.r,['interruption.startedAt']),'the unnamed confirmation asks the start time as the named one does (QF6 re-established the trip alone): '+u.r.reason);
 assert.equal(u.r.question?.episodeId,n.r.question?.episodeId?.replace('t41n','t41u'),'the same break is asked about');
 assert.deepEqual(stops(lastReturn(u.x.t.p)),['OWN_RETURN','LATEST'],'nothing is re-established while the start time is asked');
 assert.deepEqual(view(u.x.t,6),view(n.x.t,6),'the plan in force is the named form\'s');
 // (b) N2 (optional in CQ4-1): the client sends a record without the holiday's declaration; the re-read asks for the record, named or not.
 const p=Object.fromEntries([['unnamed',false],['named',true]].map(([k,named])=>{const id=`t41p${named?'n':'u'}`,x=founders(id);
  const r=resend(x,id,trip(28,31),{named,ledger:x.t.ledger.filter(o=>!(o.fact==='INTERRUPTION_DECLARED'&&o.eventId===id+'-A'))});return [k,{x,r}];}));
 assert.ok(isAsk(p.named.r,['actualLedger.interruptionDeclared']),'the named re-send asks for the record: '+p.named.r.reason);
 assert.ok(isAsk(p.unnamed.r,['actualLedger.interruptionDeclared']),'the unnamed re-send asks for the record as the named one does (QF6 applied it): '+p.unnamed.r.reason);
 assert.deepEqual(stops(lastReturn(p.unnamed.x.t.p)),['OWN_RETURN','LATEST']);
});
