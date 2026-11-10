// SSCTR fresh-instance probe helpers (V1CP Fix-Forward recheck, candidate 4630bca). Imports the scratch extract only.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
export const ROOT=process.env.PROBE_ROOT??'C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/4a9af017-27d1-4bf0-ba2a-8b07c59ee2e3/scratchpad/ssctr-ffr-4630bca-20261109115024';
const imp=p=>import(pathToFileURL(path.join(ROOT,p)).href);
export const I=await imp('CoachingCore/src/r6-index.mjs');
export const F=await imp('CoachingCore/src/v1-f08.mjs');
export const X=await imp('CoachingCore/test/v1cp-fixtures.mjs');
export const {HYBRID,doneBefore,live}=X;
export const ELIG=(d,x={})=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,...x});
export const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
export const NO=c=>Object.fromEntries(F.signsFor(c).map(k=>[k,false]));
export const XNO=c=>Object.fromEntries(F.exerciseSignsFor(c).map(k=>[k,false]));
export const RNO=()=>Object.fromEntries(F.READINESS_SIGNS.map(k=>[k,false]));
export const S6NO=()=>({warningSigns:Object.fromEntries(F.READINESS_SIGNS.slice(0,9).map(k=>[k,false])),exerciseResponse:Object.fromEntries(Object.values(F.EXERCISE_SIGNS).map(k=>[k,false]))});
export const READY=(sports={RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}})=>({declaredRecovered:true,warningSigns:RNO(),sports});
export const W=F.WARNING_SIGNS;
export const KNOWN=(n,i)=>{i.athlete.knownExercises=['db-bench-press','db-row'].map(id=>({id,load:{value:20,unit:'KG',convention:'PER_HAND'},sets:n,reps:8,rir:2,observedAt:'2026-11-06',current:true,familiar:true,tolerated:true}));return i;};
export const RACE=(i,date='2026-12-27')=>{i.athlete.goals={run:{kind:'RACE',event:{kind:'10K',date}},strength:'GENERAL'};return i;};
export const clone=o=>JSON.parse(JSON.stringify(o));
export function timeline(input=HYBRID()){
 const g=I.generateProgram(input);if(g.status!=='PROPOSED')throw new Error('generate: '+g.reason);
 const t={p:g.program,ledger:[],ref:null,n:0,results:[]};
 t.review=(w,d,kind,extra={},time='20:00')=>{const day=addDays(t.p.startDate,w*7+d);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T${time}:00-03:00`,weekIndex:w,event:{id:extra.eventId??`pr-${++t.n}`,kind},eligibility:extra.eligibility??ELIG(day),observations:extra.observations??[],...(extra.wellbeing?{wellbeing:extra.wellbeing}:{}),...(extra.check?{wellbeingCheck:extra.check}:{}),...(extra.readiness?{readiness:extra.readiness}:{}),...(extra.interruption?{interruption:extra.interruption}:{}),...(extra.changes?{changes:extra.changes}:{}),...(extra.targetSessionId?{targetSessionId:extra.targetSessionId}:{}),...(extra.noLedger||!t.ledger.length?{}:{actualLedger:t.ledger}),...(t.ref&&!extra.noRef?{referenceState:t.ref}:{})};};
 t.step=(w,d,kind,extra={},time='20:00')=>{const r=I.evaluateProgram(t.p,t.review(w,d,kind,extra,time));t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;t.results.push(r);return r;};
 t.day=(w,d)=>addDays(t.p.startDate,w*7+d);
 t.fork=()=>{const u={...t,p:clone(t.p),ledger:clone(t.ledger),ref:t.ref?clone(t.ref):null,results:[...t.results]};u.review=(w,d,kind,extra={},time='20:00')=>t.review.call(null,w,d,kind,extra,time);return rebind(u,t);};
 return t;
}
function rebind(u,t){
 u.review=(w,d,kind,extra={},time='20:00')=>{const day=addDays(u.p.startDate,w*7+d);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T${time}:00-03:00`,weekIndex:w,event:{id:extra.eventId??`pr-${++u.n}`,kind},eligibility:extra.eligibility??ELIG(day),observations:extra.observations??[],...(extra.wellbeing?{wellbeing:extra.wellbeing}:{}),...(extra.check?{wellbeingCheck:extra.check}:{}),...(extra.readiness?{readiness:extra.readiness}:{}),...(extra.interruption?{interruption:extra.interruption}:{}),...(extra.changes?{changes:extra.changes}:{}),...(extra.targetSessionId?{targetSessionId:extra.targetSessionId}:{}),...(extra.noLedger||!u.ledger.length?{}:{actualLedger:u.ledger}),...(u.ref&&!extra.noRef?{referenceState:u.ref}:{})};};
 u.step=(w,d,kind,extra={},time='20:00')=>{const r=I.evaluateProgram(u.p,u.review(w,d,kind,extra,time));u.ledger=r.actualLedger??u.ledger;u.ref=r.referenceState??u.ref;if(r.proposal)u.p=r.proposal;u.results.push(r);return r;};
 u.day=(w,d)=>addDays(u.p.startDate,w*7+d);
 u.fork=()=>rebind({...u,p:clone(u.p),ledger:clone(u.ledger),ref:u.ref?clone(u.ref):null,results:[...u.results]},u);
 return u;
}
export const doneWeek=(t,w,{adverse=[],skip=[],sport=null,onlyThrough=null}={})=>doneBefore(t.p,w+1).filter(o=>t.p.weeks[w].sessions.some(s=>s.id===o.sessionId&&(!sport||s.sport!==sport)&&(!onlyThrough||s.date<=onlyThrough))&&!skip.includes(o.sessionId)).map(o=>adverse.includes(o.sessionId)?{...o,eventId:o.eventId+'-adv',response:{...o.response,recovery:'ADVERSE'}}:o);
export const ladder=(p,w)=>(p.weeks[w]?.adaptations??[]).filter(a=>a.kind==='WELLBEING_REDUCTION'&&a.phase==='LADDER'&&!a.endedBy).reduce((o,a)=>({...o,...a.rungs}),null);
export const marks=(p,w)=>(p.weeks[w]?.adaptations??[]).filter(a=>a.kind==='WELLBEING_REDUCTION'&&!a.endedBy);
export const setsOf=(p,w,id)=>Math.max(0,...p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises).filter(e=>e.id===id).map(e=>e.sets));
export const liveOn=(p,date,sport)=>p.weeks.flatMap(x=>x.sessions).filter(s=>s.date===date&&s.sport===sport&&live(s));
export const reviewWeeks=(t,from,to)=>{for(let k=from;k<to;k++)t.step(k,6,'WEEKLY_REVIEW',{observations:doneWeek(t,k)});};
export const lastFact=(t,f)=>t.ledger.filter(o=>o.fact===f).at(-1);
export const IMP=(...cs)=>Object.fromEntries(cs.map(c=>[c,true]));
/** The dose of sport s on a date: run minutes and a hard flag; strength sets and the minimum reserve. */
export function doseOn(p,date,s){
 const xs=p.weeks.flatMap(x=>x.sessions).filter(z=>z.date===date&&z.sport===s&&live(z)&&!z.optional);
 if(s==='RUN')return {min:xs.reduce((a,z)=>a+(z.prescription.durationMinutes??0),0),hard:xs.some(z=>!['EASY','WALK','EASY_RUN'].includes(z.prescription.family)||(z.prescription.strides??0)>0),roles:xs.map(z=>z.role+':'+z.prescription.family+':'+z.prescription.durationMinutes).join(',')};
 const ex=xs.flatMap(z=>z.prescription.exercises??[]);
 return {sets:ex.reduce((a,e)=>a+e.sets,0),minRir:ex.length?Math.min(...ex.map(e=>Number.isFinite(e.rir)?e.rir:99)):null,rows:ex.map(e=>e.id+':'+e.sets+'x'+e.reps+'@'+e.rir).join(',')};
}
export const above=(a,b,s)=>s==='RUN'?(a.min>b.min||(a.hard&&!b.hard)):(a.sets>b.sets||(a.sets>0&&b.sets>0&&a.minRir<b.minRir)||(a.sets>0&&b.sets===0));
export const days=(from,to)=>{const out=[];for(let d=from;d<=to;d=addDays(d,1))out.push(d);return out;};
