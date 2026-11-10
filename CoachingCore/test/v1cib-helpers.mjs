// V1 Coaching Integration Boundary (V1CIB, Founder request of 2026-11-09): shared helpers for its directed tests (not a test file). The timeline is
// the conforming client of the V1CP tests: it keeps the program, the record and the reference state each decision returns.
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const ROOT=path.resolve(process.env.V1CP_ROOT??path.resolve(import.meta.dirname,'../..'));
const imp=p=>import(pathToFileURL(path.join(ROOT,p)).href);
export const I=await imp('CoachingCore/src/r6-index.mjs');
export const F=await imp('CoachingCore/src/v1-f08.mjs');
export const {HYBRID,doneBefore,live}=await imp('CoachingCore/test/v1cp-fixtures.mjs');
export const ELIG=(d,x={})=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,...x});
export const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
export const NO=c=>Object.fromEntries(F.signsFor(c).map(k=>[k,false]));
export const XNO=c=>Object.fromEntries(F.exerciseSignsFor(c).map(k=>[k,false]));
export const RNO=()=>Object.fromEntries(F.READINESS_SIGNS.map(k=>[k,false]));
export const ALLNO=()=>({warningSigns:Object.fromEntries(Object.values(F.WARNING_SIGNS).map(k=>[k,false])),exerciseResponse:Object.fromEntries(Object.values(F.EXERCISE_SIGNS).map(k=>[k,false]))});
export const READY=(sports={RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}})=>({declaredRecovered:true,warningSigns:RNO(),sports});
export const W=F.WARNING_SIGNS;
export const KNOWN=(n,i)=>{i.athlete.knownExercises=['db-bench-press','db-row'].map(id=>({id,load:{value:20,unit:'KG',convention:'PER_HAND'},sets:n,reps:8,rir:2,observedAt:'2026-11-06',current:true,familiar:true,tolerated:true}));return i;};
export const clone=o=>JSON.parse(JSON.stringify(o));
/** The conforming client: it stores what each decision returns and sends the record and the reference state with the next review. */
export function timeline(input=HYBRID(),{prefix='ib'}={}){
 const g=I.generateProgram(input);assert.equal(g.status,'PROPOSED',g.reason);
 const t={p:g.program,ledger:[],ref:null,n:0,results:[]};
 t.review=(w,d,kind,extra={},time='20:00')=>{const day=addDays(t.p.startDate,w*7+d);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T${time}:00-03:00`,weekIndex:w,event:{id:extra.eventId??`${prefix}-${++t.n}`,kind},eligibility:extra.eligibility??ELIG(day),observations:extra.observations??[],...(extra.wellbeing?{wellbeing:extra.wellbeing}:{}),...(extra.check?{wellbeingCheck:extra.check}:{}),...(extra.readiness?{readiness:extra.readiness}:{}),...(extra.interruption?{interruption:extra.interruption}:{}),...(extra.changes?{changes:extra.changes}:{}),...(extra.targetSessionId?{targetSessionId:extra.targetSessionId}:{}),...(extra.noLedger||!t.ledger.length?{}:{actualLedger:extra.ledger??t.ledger}),...('ref' in extra?(extra.ref?{referenceState:extra.ref}:{}):t.ref?{referenceState:t.ref}:{})};};
 t.step=(w,d,kind,extra={},time='20:00')=>{const r=I.evaluateProgram(extra.program??t.p,t.review(w,d,kind,extra,time));if(!extra.dry){t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;}t.results.push(r);return r;};
 t.day=(w,d)=>addDays(t.p.startDate,w*7+d);
 t.fork=()=>{const u=timeline.adopt({p:clone(t.p),ledger:clone(t.ledger),ref:t.ref?clone(t.ref):null,n:t.n},prefix);return u;};
 return t;
}
/** A timeline continuing from stored state (a fork, a restored device). */
timeline.adopt=(state,prefix='ib')=>{
 const t={...state,results:[]};
 t.review=(w,d,kind,extra={},time='20:00')=>{const day=addDays(t.p.startDate,w*7+d);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T${time}:00-03:00`,weekIndex:w,event:{id:extra.eventId??`${prefix}-${++t.n}`,kind},eligibility:extra.eligibility??ELIG(day),observations:extra.observations??[],...(extra.wellbeing?{wellbeing:extra.wellbeing}:{}),...(extra.check?{wellbeingCheck:extra.check}:{}),...(extra.readiness?{readiness:extra.readiness}:{}),...(extra.interruption?{interruption:extra.interruption}:{}),...(extra.changes?{changes:extra.changes}:{}),...(extra.targetSessionId?{targetSessionId:extra.targetSessionId}:{}),...(extra.noLedger||!t.ledger.length?{}:{actualLedger:extra.ledger??t.ledger}),...('ref' in extra?(extra.ref?{referenceState:extra.ref}:{}):t.ref?{referenceState:t.ref}:{})};};
 t.step=(w,d,kind,extra={},time='20:00')=>{const r=I.evaluateProgram(extra.program??t.p,t.review(w,d,kind,extra,time));if(!extra.dry){t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;}t.results.push(r);return r;};
 t.day=(w,d)=>addDays(t.p.startDate,w*7+d);
 t.fork=()=>timeline.adopt({p:clone(t.p),ledger:clone(t.ledger),ref:t.ref?clone(t.ref):null,n:t.n},prefix);
 return t;
};
export const doneWeek=(t,w,{adverse=[],skip=[],sport=null,before=null}={})=>doneBefore(t.p,w+1).filter(o=>t.p.weeks[w].sessions.some(s=>s.id===o.sessionId&&(!sport||s.sport!==sport)&&(!before||s.date<before))&&!skip.includes(o.sessionId)).map(o=>adverse.includes(o.sessionId)?{...o,eventId:o.eventId+'-adv',response:{...o.response,recovery:'ADVERSE'}}:o);
export const reviewWeeks=(t,from,to)=>{for(let k=from;k<to;k++)t.step(k,6,'WEEKLY_REVIEW',{observations:doneWeek(t,k)});};
export const ladder=(p,w)=>(p.weeks[w]?.adaptations??[]).filter(a=>a.kind==='WELLBEING_REDUCTION'&&a.phase==='LADDER'&&!a.endedBy).reduce((o,a)=>({...(o??{}),...a.rungs}),null);
export const setsOf=(p,w,id)=>Math.max(0,...p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises).filter(e=>e.id===id).map(e=>e.sets));
export const lastFact=(t,f)=>t.ledger.filter(o=>o.fact===f).at(-1);
export const plans=t=>t.p.decisions.at(-1)?.wellbeing?.plans??null;
/** The live, non-optional dose of a sport in week k: run minutes per session, strength sets per session (and the lowest reserve). */
export function weekDose(p,k,sport){
 const xs=(p.weeks[k]?.sessions??[]).filter(s=>s.sport===sport&&live(s)&&!s.optional);
 return sport==='RUN'?xs.map(s=>s.prescription.durationMinutes??0):xs.map(s=>(s.prescription.exercises??[]).reduce((a,e)=>a+e.sets,0));
}
const total=a=>a.reduce((x,y)=>x+y,0);
/** True when program `a` prescribes no more of `sport` than program `b` in each week from `from` to the end: total minutes or sets, and the longest
 * single session (the "never less conservative" oracle, measured on doses rather than on the plan's structure). */
export function neverAbove(a,b,sport,from){
 const out=[];
 for(let k=from;k<a.weeks.length;k++){const x=weekDose(a,k,sport),y=weekDose(b,k,sport);if(total(x)>total(y)||Math.max(0,...x)>Math.max(0,...y))out.push(`week ${k}: ${x.join('/')} > ${y.join('/')}`);}
 return out;
}
