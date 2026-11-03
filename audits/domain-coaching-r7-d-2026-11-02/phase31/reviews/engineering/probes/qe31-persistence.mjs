// R7-D Phase 3.1 narrow engineering check (R7D-ENGINEERING-PHASE31-CHECK-1): factual persistence of a declared break.
// Scenarios the directed tests do not pin: every early-return path (record kept or not), resurrection after a return, the clinical-reason
// dead end, open-ended kept breaks, event separation on more kinds, replay / same-id-other-facts / partial newer declaration, append-only
// order, forged and future rows, and where the free-text reason travels.
//   node qe31-persistence.mjs --root <dir holding CoachingCore and the records it reads> [--out <file>]
// Read-only on the root: it imports the runtime and its synthetic fixtures; it writes only --out (outside the repository).
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const root=path.resolve(arg('--root')??'.'),outFile=arg('--out');
const imp=p=>import(pathToFileURL(path.join(root,'CoachingCore',p)).href);
const H=await imp('r7/b/fixtures/helpers.mjs'),{hash}=await imp('src/value.mjs');
const {opts,K,FULL,elig,program,review,obs,live,addDays,evaluateProgram}=H;
const VALID='VALID_WITHIN_CURRENT_BOUNDED_SCOPE',DECL='INTERRUPTION_DECLARED';
const GEN={id:'qe31-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const J=v=>JSON.parse(JSON.stringify(v)),cj=v=>JSON.stringify(v);
let EID=0;
/** One decision as the C3 client carries it (record and reference state as returned; proposal adopted). */
function step(t,w,x={}){
 const rv={...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{}),...(x.raw??{})};
 if(x.dropLedger)delete rv.actualLedger;
 const r=evaluateProgram(t.p,rv,opts);
 t.trace.push({w,kind:rv.event.kind,id:rv.event.id,status:r.status,action:r.action,validity:r.planValidity?.status??null,returnedLedger:Array.isArray(r.actualLedger)});
 t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;
}
const fresh=(o=GEN)=>({p:program(o),ledger:[],ref:null,trace:[]});
const copy=t=>({p:t.p,ledger:[...t.ledger],ref:t.ref,trace:[...t.trace]});
const weekFacts=(p,w)=>p.weeks[w].sessions.filter(live).map(s=>obs(p,s));
let PREP=null;
function beforeBreak(){if(!PREP){PREP=fresh();for(const w of [0,1,2])step(PREP,w,{observations:weekFacts(PREP.p,w)});}return copy(PREP);}
const BREAK=p=>({startDate:p.weeks[3].startDate,endDate:addDays(p.weeks[4].startDate,6),days:14,reasonCategory:'VACATION',reason:'Holiday, no training at all',nonclinical:true});
const D=(day,hour='07:00:00')=>({day,hour});
const rows=l=>l.filter(o=>o?.fact===DECL);
const returns=p=>p.decisions.filter(d=>d.action==='REESTABLISH');
const added=(before,after)=>after.decisions.slice(before.decisions.length).map(d=>d.action);
const summary=r=>({status:r.status,action:r.action,validity:r.planValidity?.status??null,missing:r.missingInputs??[],returned:Array.isArray(r.actualLedger)});
const out={probe:'qe31-persistence',root,node:process.version,scenarios:{}};
const S=(name,fn)=>{try{out.scenarios[name]=fn();}catch(e){out.scenarios[name]={error:String(e?.stack??e).split('\n').slice(0,3).join(' | ')};}};

// ---------- 1. Every early-return path: is the declared break kept? Then the next plain weekly review (after clearance where clinical). ----------
S('earlyReturns',()=>{
 const res={};
 const cases={
  clinicalFlag:t=>({...D(1),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:BREAK(t.p),eligibility:{...elig(addDays(t.p.weeks[5].startDate,1)),illness:true}}),
  eligibilityUnknown:t=>({...D(1),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:BREAK(t.p),eligibility:{status:'UNKNOWN'}}),
  eligibilityStale:t=>({...D(1),kind:'GOAL_CHANGE',changes:{goals:{run:'GENERAL',strength:'GENERAL'}},interruption:BREAK(t.p),eligibility:elig(addDays(t.p.weeks[2].startDate,0))}),
  standingClinical:t=>{const pre=step(t,5,{...D(0,'07:00:00'),eligibility:{...elig(addDays(t.p.weeks[5].startDate,0)),pain:true}});return {...D(1),kind:'SYSTEMIC_FATIGUE',interruption:BREAK(t.p),pre:pre.status};},
  recoveredGeneric:t=>{const pre=step(t,5,{...D(0,'07:00:00'),eligibility:{status:'UNKNOWN'}});return {...D(1),kind:'RECOVERED',interruption:BREAK(t.p),pre:pre.status};},
  referenceTampered:t=>{step(t,5,{...D(0,'07:00:00'),eligibility:{status:'UNKNOWN'}});const ref={...t.ref,asOf:t.ref.asOf};const tampered={...ref,pending:{...ref.pending,reason:'x'}};return {...D(1),kind:'SYSTEMIC_FATIGUE',interruption:BREAK(t.p),raw:{referenceState:tampered}};},
  chronology:t=>({...D(1),kind:'SYSTEMIC_FATIGUE',interruption:BREAK(t.p),raw:{weekIndex:4}}),
  observationsNotList:t=>({...D(1),kind:'SYSTEMIC_FATIGUE',interruption:BREAK(t.p),raw:{observations:{}}}),
  choicesNotList:t=>({...D(1),kind:'SYSTEMIC_FATIGUE',interruption:BREAK(t.p),raw:{choices:{}}}),
  athleteModelInvalid:t=>({...D(1),kind:'SYSTEMIC_FATIGUE',interruption:BREAK(t.p),raw:{athleteModel:{bogus:true}}}),
  unknownKind:t=>({...D(1),kind:'INJURY_REPORT',interruption:BREAK(t.p)})
 };
 for(const [name,mk] of Object.entries(cases)){
  const t=beforeBreak(),x=mk(t),{pre,...rx}=x;
  if(rx.raw?.weekIndex!==undefined){}
  const r=step(t,5,rx);
  const kept=rows(t.ledger).length;
  const clinical=r.status==='CLINICAL_HUMAN_REQUIRED';if(clinical||t.ref?.pending?.status==='CLINICAL_HUMAN_REQUIRED')t.ref=null;
  const before=t.p,n=step(t,5,D(2));
  res[name]={pre:pre??null,decision:summary(r),rowsKept:kept,returnedLedger:Array.isArray(r.actualLedger),nextPlainWeekly:{...summary(n),applied:added(before,t.p),reason:n.reason.slice(0,140)},lostAndStaleValid:kept===0&&n.planValidity?.status===VALID&&!added(before,t.p).includes('REESTABLISH')};
 }
 return res;
});

// ---------- 2. A retained (not new) break and an early return: is the record returned? ----------
S('retainedThenEarlyReturn',()=>{
 const t=beforeBreak();step(t,5,{...D(1),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:BREAK(t.p)});
 const r=step(t,5,{...D(2),eligibility:{...elig(addDays(t.p.weeks[5].startDate,2)),pain:true}});
 return {decision:summary(r),actualLedgerInOutput:Array.isArray(r.actualLedger),rowsInCarried:rows(t.ledger).length};
});

// ---------- 3. Resurrection: the same break re-sent with another event after its return was applied ----------
S('reSentAfterApplied',()=>{
 const base=beforeBreak(),brk=BREAK(base.p);
 step(base,5,{...D(1),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:brk});
 const ap=step(base,5,D(2));
 // Control: the athlete trains week 5 as planned and reviews; then week 6 the same.
 const ctl=copy(base),exp=copy(base);
 for(const t of [ctl,exp])step(t,5,{...D(6,'21:00:00'),observations:weekFacts(t.p,5).filter(o=>o.observedAt>=`${addDays(t.p.weeks[5].startDate,2)}`)});
 const carrier=step(exp,6,{...D(1),kind:'LOCAL_FATIGUE',interruption:brk});
 const c1=step(ctl,6,{...D(2)}),e1=step(exp,6,{...D(2)});
 const runsOf=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>`${s.role}:${s.prescription.durationMinutes}`);
 const dec=returns(exp.p).at(-1);
 return {applied:ap.action,carrier:summary(carrier),rowsAfterCarrier:rows(exp.ledger).length,control:summary(c1),experiment:{...summary(e1),returnsTotal:returns(exp.p).length,lastReturn:dec?{relation:dec.interruption.relation,basis:dec.interruption.basis,revision:dec.interruption.revision,episode:dec.interruption.episode,class:dec.interruption.class}:null},
  week6Runs:{control:runsOf(ctl.p,6),experiment:runsOf(exp.p,6)},week7Runs:{control:runsOf(ctl.p,7),experiment:runsOf(exp.p,7)},samePlanAhead:cj(ctl.p.weeks.slice(6).map(x=>x.sessions.map(s=>hash(s.prescription??null))))===cj(exp.p.weeks.slice(6).map(x=>x.sessions.map(s=>hash(s.prescription??null))))};
});

// ---------- 4. A break whose own reason is clinical: is there any conforming exit? ----------
S('clinicalReasonLiveness',()=>{
 const t=beforeBreak(),ill={startDate:t.p.weeks[5].startDate,endDate:addDays(t.p.weeks[5].startDate,1),days:2,reasonCategory:'ILLNESS',reason:'flu',nonclinical:false};
 const r0=step(t,5,{...D(2),kind:'RETURN_AFTER_PAUSE',interruption:ill});
 const later=[];
 for(const w of [5,6,7,8,9]){t.ref=null;const r=step(t,w,{...D(w===5?4:6,'21:00:00'),observations:weekFacts(t.p,w).filter(o=>o.observedAt>`${addDays(t.p.weeks[w].startDate,w===5?2:0)}`)});later.push({w,...summary(r)});}
 // Attempts a consumer could make after the qualified clearance, each on a copy.
 const attempts={};
 const tries={
  returnNoBreak:x=>({...D(1),kind:'RETURN_AFTER_PAUSE'}),
  returnSameBreakNonclinicalFlags:x=>({...D(1),kind:'RETURN_AFTER_PAUSE',interruption:{...ill,nonclinical:true,clinicalReason:false}}),
  returnEpisodeOnly:x=>({...D(1),kind:'RETURN_AFTER_PAUSE',interruption:{episodeId:'whatever'}}),
  recovered:x=>({...D(1),kind:'RECOVERED'}),
  newNonclinicalBreak:x=>({...D(1),kind:'RETURN_AFTER_PAUSE',interruption:{startDate:addDays(x.p.weeks[10].startDate,-1),endDate:addDays(x.p.weeks[10].startDate,-1),days:1,reasonCategory:'WORK',reason:'work trip',nonclinical:true}})
 };
 for(const [k,mk] of Object.entries(tries)){const c=copy(t);c.ref=null;const a=step(c,10,mk(c));const b=step(c,10,D(2));attempts[k]={attempt:summary(a),nextWeekly:summary(b)};}
 return {declaring:summary(r0),rowsKept:rows(t.ledger).length,laterWeeklyReviews:later,afterClearanceAttempts:attempts};
});

// ---------- 5. An open-ended break kept, training reported after it, then the weekly review ----------
S('openEndedKeptThenTraining',()=>{
 const t=beforeBreak(),open={startDate:t.p.weeks[4].startDate,reasonCategory:'WORK',reason:'Work project',nonclinical:true};
 const c=step(t,5,{...D(0,'07:00:00'),kind:'GOAL_CHANGE',changes:{goals:{run:'GENERAL',strength:'GENERAL'}},interruption:open});
 const trained=weekFacts(t.p,5).filter(o=>o.observedAt>`${addDays(t.p.weeks[5].startDate,1)}`&&o.observedAt<`${addDays(t.p.weeks[5].startDate,5)}`);
 const a=copy(t),b=copy(t);
 const ra=step(a,5,{...D(5,'21:00:00'),observations:trained}),rb=step(b,5,{...D(5,'21:00:00'),observations:trained,interruption:open,event:{id:'qe31-open-restated',kind:'WEEKLY_REVIEW'}});
 const da=returns(a.p).at(-1),db=returns(b.p).at(-1);
 return {carrier:summary(c),trainedReports:trained.length,kept:{...summary(ra),reason:ra.reason.slice(0,220),interruption:da?{start:da.interruption.startDate,end:da.interruption.endDate,days:da.interruption.days,class:da.interruption.class}:null},restated:{...summary(rb),interruption:db?{start:db.interruption.startDate,end:db.interruption.endDate,days:db.interruption.days,class:db.interruption.class}:null},equalPlans:cj(a.p.weeks.map(x=>x.sessions.map(s=>hash(s.prescription??null))))===cj(b.p.weeks.map(x=>x.sessions.map(s=>hash(s.prescription??null))))};
});

// ---------- 6. Event separation on kinds the directed tests do not exercise ----------
S('eventSeparation',()=>{
 const res={};
 const kinds={
  UNAVAILABLE_DAY:p=>({changes:{unavailableDates:[addDays(p.weeks[5].startDate,4)]}}),
  EXERCISE_SUBSTITUTION:p=>({substitution:{exerciseId:p.weeks[5].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0],reason:'SKILL_MISMATCH'}}),
  PROGRESSION_TOO_EASY:p=>({targetSessionId:p.weeks[5].sessions.find(s=>live(s)&&s.sport==='STRENGTH')?.id}),
  DOUBLE_CONFLICT:p=>({changes:{runDays:[1,3,6],strengthDays:[1,4]}}),
  OVERPERFORMANCE:p=>({targetSessionId:p.weeks[5].sessions.find(s=>live(s)&&s.sport==='RUN')?.id})
 };
 for(const [kind,mk] of Object.entries(kinds)){
  const t=beforeBreak(),p0=t.p,r1=step(t,5,{...D(1),kind,interruption:BREAK(t.p),...mk(t.p)});
  const p1=t.p,r2=step(t,5,D(2));
  res[kind]={carrier:{...summary(r1),added:added(p0,p1)},applying:{...summary(r2),added:added(p1,t.p)}};
 }
 // A weekly review that would apply the kept break but carries block choices.
 const t=beforeBreak();step(t,5,{...D(1),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:BREAK(t.p)});
 const p1=t.p,c=step(t,5,{...D(2),choices:[{type:'LADDER_STEP',from:'a',to:'b'}]}),p2=t.p,n=step(t,5,D(3));
 res.weeklyWithChoices={withChoices:{...summary(c),added:added(p1,p2)},next:{...summary(n),added:added(p2,t.p)}};
 return res;
});

// ---------- 7. Replay, same id with other facts, partial newer declaration, two at one instant ----------
S('replayAndCorrection',()=>{
 const res={};
 {const t=beforeBreak(),b1=BREAK(t.p),b2={...b1,startDate:addDays(b1.startDate,7),days:7},ev={id:'qe31-same-id',kind:'SCHEDULE_CHANGE'};
  step(t,5,{...D(1),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:b1,event:ev});
  const r=step(t,5,{...D(1),hour:'08:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:b2,event:ev});
  const n=step(t,5,D(2)),d=returns(t.p).at(-1);
  res.sameIdOtherFacts={replay:{...summary(r),reason:r.reason.slice(0,160)},rows:rows(t.ledger).map(x=>x.interruption.startDate),applied:{...summary(n),start:d?.interruption.startDate??null,days:d?.interruption.days??null},appliedFacts:d?.interruption.startDate===b1.startDate?'FIRST (b1)':d?.interruption.startDate===b2.startDate?'SECOND (b2)':null};}
 {const t=beforeBreak(),b1=BREAK(t.p),ev={id:'qe31-replay-after',kind:'SCHEDULE_CHANGE'},x={...D(1),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:b1,event:ev};
  step(t,5,x);step(t,5,D(2));const p1=t.p,rp=evaluateProgram(t.p,{...review(t.p,5,x),event:ev,actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},opts);
  res.replayAfterApplied={replay:{...summary(rp),added:rp.proposal?added(p1,rp.proposal):[]},rowsAfter:rows(rp.actualLedger??t.ledger).length};}
 {const t=beforeBreak(),b1=BREAK(t.p);
  step(t,5,{...D(1),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:b1});
  const part=step(t,5,{...D(1),hour:'09:00:00',kind:'LOCAL_FATIGUE',interruption:{reason:'Holiday, no training at all'}});
  const n=step(t,5,D(2));
  res.partialNewerDeclaration={partial:summary(part),rows:rows(t.ledger).length,next:{...summary(n),reason:n.reason.slice(0,160)}};}
 {const t=beforeBreak(),b1=BREAK(t.p),b2={...b1,startDate:addDays(b1.startDate,7),days:7};
  const ledger0=t.ledger,ref0=t.ref;
  const r1=evaluateProgram(t.p,{...review(t.p,5,{...D(1),kind:'LOCAL_FATIGUE',interruption:b1}),event:{id:'qe31-inst-a',kind:'LOCAL_FATIGUE'},actualLedger:ledger0},opts);
  const r2=evaluateProgram(t.p,{...review(t.p,5,{...D(1),kind:'SYSTEMIC_FATIGUE',interruption:b2}),event:{id:'qe31-inst-b',kind:'SYSTEMIC_FATIGUE'},actualLedger:r1.actualLedger},opts);
  t.ledger=r2.actualLedger;t.ref=r2.referenceState;const n=step(t,5,D(2)),d=returns(t.p).at(-1);
  res.twoAtOneInstant={rows:rows(t.ledger).map(x=>x.eventId),applied:d?{start:d.interruption.startDate,declaredBy:d.interruption.declaredBy?.eventId}:null};}
 return res;
});

// ---------- 8. Append-only: every carried row survives unchanged; does the order? Forged and future rows ----------
S('appendOnly',()=>{
 const t=beforeBreak(),checks=[];
 const seq=[{...D(1),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:BREAK(t.p)},{...D(1),hour:'09:00:00',kind:'LOCAL_FATIGUE'},{...D(2),observations:weekFacts(t.p,5).filter(o=>o.observedAt<`${addDays(t.p.weeks[5].startDate,2)}`)},{...D(6,'21:00:00')}];
 for(const x of seq){
  const before=t.ledger.map(cj),r=step(t,5,x),after=(r.actualLedger??t.ledger).map(cj);
  const missing=before.filter(b=>!after.includes(b)).length;
  let k=0;for(const a of after){if(k<before.length&&a===before[k])k++;}
  const prefix=before.every((b,i)=>after[i]===b);
  checks.push({kind:x.kind??'WEEKLY_REVIEW',status:r.status,rowsBefore:before.length,rowsAfter:after.length,unchangedMissing:missing,orderPreservedAsSubsequence:k===before.length,inputIsPrefixOfOutput:prefix,declarationPositions:(r.actualLedger??[]).map((o,i)=>o?.fact===DECL?i:null).filter(i=>i!==null)});
 }
 // A forged row with a recomputed hash is read; a row declared after the decision clock is not; a row without its hash is not.
 const u=beforeBreak(),brk=BREAK(u.p),at=`${addDays(u.p.weeks[5].startDate,1)}T07:00:00.000Z`;
 const forged={fact:DECL,eventId:'forged-1',eventKind:'GOAL_CHANGE',athleteId:u.p.athleteId,declaredAt:at,interruption:brk,inputHash:hash(brk),provenance:{firstRecordedAt:at}};
 const later={...forged,eventId:'future-1',declaredAt:`${addDays(u.p.weeks[5].startDate,3)}T07:00:00.000Z`,provenance:{firstRecordedAt:`${addDays(u.p.weeks[5].startDate,3)}T07:00:00.000Z`}};
 const nohash={...forged,eventId:'nohash-1'};delete nohash.inputHash;
 // A row whose facts were changed after recording but stay self-consistent (only the free text): the hash check is the only thing that refuses it.
 const tampered={...forged,eventId:'tampered-1',interruption:{...brk,reason:'Holiday, edited later'}};
 const res={};
 for(const [k,row] of Object.entries({forgedValidHash:forged,declaredAfterClock:later,noHash:nohash,tamperedConsistentFacts:tampered})){
  const r=evaluateProgram(u.p,{...review(u.p,5,D(2)),actualLedger:[...u.ledger,row]},opts);
  res[k]={...summary(r),read:r.action==='REESTABLISH',carried:(r.actualLedger??[]).some(o=>cj(o)===cj(row))};
 }
 return {sequence:checks,rows:res};
});

// ---------- 9. Where the free-text reason travels ----------
S('freeTextReason',()=>{
 const t=beforeBreak(),secret='Holiday SECRET-TOKEN-XYZ';
 const brk={...BREAK(t.p),reason:secret};
 step(t,5,{...D(1),kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:brk});
 const r=step(t,5,D(2));
 const inRecord=cj(t.ledger).includes('SECRET-TOKEN-XYZ'),inProgram=cj(t.p).includes('SECRET-TOKEN-XYZ'),inDecision=cj({...r,actualLedger:null,proposal:null}).includes('SECRET-TOKEN-XYZ'),inReference=cj(t.ref??null).includes('SECRET-TOKEN-XYZ');
 // On a weekly review that declares and applies at once (pre-existing path): is the text recorded too?
 const u=beforeBreak();step(u,5,{...D(2),interruption:{...BREAK(u.p),reason:'Holiday OTHER-TOKEN-ABC'}});
 return {carrierThenApply:{inRecord,inProgram,inDecisionOutput:inDecision,inReferenceState:inReference},declaredAndAppliedAtOnce:{inRecord:cj(u.ledger).includes('OTHER-TOKEN-ABC'),inProgram:cj(u.p).includes('OTHER-TOKEN-ABC')}};
});

const text=JSON.stringify(out,null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');
console.log(text);
