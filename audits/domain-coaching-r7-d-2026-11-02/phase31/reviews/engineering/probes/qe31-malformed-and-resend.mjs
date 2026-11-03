// R7-D Phase 3.1 engineering check, two follow-ups of qe31-persistence.mjs:
//  1. A review that states a break together with malformed execution facts: does the runtime refuse before it records the break (the break is
//     then lost, as on an integrity refusal), or record it? Several malformations a case author could write.
//  2. The same break re-sent with another event after its return was applied: what differs in the plan from the control that never re-sent it.
//   node qe31-malformed-and-resend.mjs --root <dir holding CoachingCore and the records it reads>
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const root=path.resolve(arg('--root')??'.');
const imp=p=>import(pathToFileURL(path.join(root,'CoachingCore',p)).href);
const H=await imp('r7/b/fixtures/helpers.mjs'),{hash}=await imp('src/value.mjs');
const {opts,K,FULL,program,review,obs,live,addDays,evaluateProgram}=H;
const GEN={id:'qe31-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const DECL='INTERRUPTION_DECLARED';
function step(t,w,x={}){const r=evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},opts);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;}
const weekFacts=(p,w)=>p.weeks[w].sessions.filter(live).map(s=>obs(p,s));
let PREP=null;
function beforeBreak(){if(!PREP){PREP={p:program(GEN),ledger:[],ref:null};for(const w of [0,1,2])step(PREP,w,{observations:weekFacts(PREP.p,w)});}return {p:PREP.p,ledger:[...PREP.ledger],ref:PREP.ref};}
const BREAK=p=>({startDate:p.weeks[3].startDate,endDate:addDays(p.weeks[4].startDate,6),days:14,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true});
const out={root,malformed:{},resend:null};
// 1. Malformed facts with a stated break (on a weekly review and on another event kind).
const strengthObs=t=>{const s=t.p.weeks[5].sessions.find(x=>live(x)&&x.sport==='STRENGTH');return {s,o:obs(t.p,s)};};
const MAL={
 setsNotList:t=>{const {o}=strengthObs(t);o.actual.exercises[0].sets='bad';return [o];},
 exerciseNull:t=>{const {o}=strengthObs(t);o.actual.exercises[0]=null;return [o];},
 loadString:t=>{const {o}=strengthObs(t);o.actual.exercises[0].sets[0].load='heavy';return [o];},
 actualNull:t=>{const {o}=strengthObs(t);o.actual=null;return [o];},
 observationNull:t=>[null],
 responseString:t=>{const {o}=strengthObs(t);o.response='fine';return [o];}
};
for(const [k,mk] of Object.entries(MAL))for(const kind of ['WEEKLY_REVIEW','SYSTEMIC_FATIGUE']){
 const t=beforeBreak(),r=step(t,5,{day:1,hour:'07:00:00',kind,interruption:BREAK(t.p),observations:mk(t)});
 const n=step(t,5,{day:2,hour:'07:00:00'});
 out.malformed[k+'/'+kind]={status:r.status,action:r.action,errors:r.errors??null,recorded:(r.actualLedger??[]).filter(o=>o?.fact===DECL).length,returnedRecord:Array.isArray(r.actualLedger),next:{status:n.status,action:n.action,validity:n.planValidity?.status}};
}
// 2. Re-sent applied break: what differs from the control.
{
 const base=beforeBreak(),brk=BREAK(base.p);
 step(base,5,{day:1,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},interruption:brk});step(base,5,{day:2,hour:'07:00:00'});
 const ctl={p:base.p,ledger:[...base.ledger],ref:base.ref},exp={p:base.p,ledger:[...base.ledger],ref:base.ref};
 for(const t of [ctl,exp])step(t,5,{day:6,hour:'21:00:00',observations:weekFacts(t.p,5).filter(o=>o.observedAt>=`${addDays(t.p.weeks[5].startDate,2)}`)});
 step(exp,6,{day:1,hour:'07:00:00',kind:'LOCAL_FATIGUE',interruption:brk});
 const c=step(ctl,6,{day:2,hour:'07:00:00'}),e=step(exp,6,{day:2,hour:'07:00:00'});
 const diffs=[];
 for(let w=6;w<ctl.p.weeks.length;w++){
  const a=ctl.p.weeks[w],b=exp.p.weeks[w];
  for(const s of a.sessions){const y=b.sessions.find(x=>x.id===s.id);if(!y||hash(s.prescription??null)!==hash(y.prescription??null)||s.status!==y.status)diffs.push({week:w,id:s.id,sport:s.sport,ctl:s.prescription?{fam:s.prescription.family,min:s.prescription.durationMinutes,ex:(s.prescription.exercises??[]).map(x=>`${x.id}:${x.sets}x${x.reps}@${x.load?.value??x.load?.mode}`)}:null,exp:y?.prescription?{fam:y.prescription.family,min:y.prescription.durationMinutes,ex:(y.prescription.exercises??[]).map(x=>`${x.id}:${x.sets}x${x.reps}@${x.load?.value??x.load?.mode}`)}:null});}
  if(JSON.stringify(a.adaptations??null)!==JSON.stringify(b.adaptations??null))diffs.push({week:w,adaptations:{ctl:(a.adaptations??[]).map(x=>x.kind),exp:(b.adaptations??[]).map(x=>x.kind)}});
 }
 out.resend={control:{status:c.status,action:c.action},experiment:{status:e.status,action:e.action,reason:e.reason.slice(0,200)},stateTraceDiffWeeks:ctl.p.stateTrace.map((x,i)=>JSON.stringify(x)!==JSON.stringify(exp.p.stateTrace[i])?i:null).filter(i=>i!==null),diffs:diffs.slice(0,12),totalDiffs:diffs.length};
}
console.log(JSON.stringify(out,null,1));
