// Probe helpers (QRE FF recheck): load a CoachingCore root and build timelines like the V1CP tests do. Read-only on the roots.
import path from 'node:path';import {pathToFileURL} from 'node:url';
export const ROOTS={cand:process.env.QRE_CAND,b5ee:process.env.QRE_B5EE,f6:process.env.QRE_F6};
export async function load(name){
 const root=ROOTS[name]??name,u=p=>pathToFileURL(path.join(root,'CoachingCore',p)).href;
 const idx=await import(u('src/r6-index.mjs')),F=await import(u('src/v1-f08.mjs')),fx=await import(u('test/v1cp-fixtures.mjs')),clin=await import(u('src/r6-clinical.mjs'));
 return {root,...idx,F,fx,clin};
}
export const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
export const ELIG=(d,x={})=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,...x});
export function kit(M){
 const {generateProgram,evaluateProgram,restartProgram,F,fx}=M,{HYBRID,doneBefore,live}=fx;
 const NO=c=>Object.fromEntries(F.signsFor(c).map(k=>[k,false])),XNO=c=>Object.fromEntries(F.exerciseSignsFor(c).map(k=>[k,false]));
 const RNO=()=>Object.fromEntries(F.READINESS_SIGNS.map(k=>[k,false])),S6NO=()=>({warningSigns:Object.fromEntries(F.READINESS_SIGNS.slice(0,9).map(k=>[k,false])),exerciseResponse:Object.fromEntries(Object.values(F.EXERCISE_SIGNS).map(k=>[k,false]))});
 const READY=(sports={RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}})=>({declaredRecovered:true,warningSigns:RNO(),sports});
 const KNOWN=(n,i,ids=['db-bench-press','db-row'],rir=2)=>{i.athlete.knownExercises=ids.map(id=>({id,load:{value:20,unit:'KG',convention:'PER_HAND'},sets:n,reps:8,rir,observedAt:'2026-11-06',current:true,familiar:true,tolerated:true}));return i;};
 const RACE=(i,date='2026-12-27')=>{i.athlete.goals={run:{kind:'RACE',event:{kind:'10K',date}},strength:'GENERAL'};return i;};
 function timeline(input=HYBRID()){
  const g=generateProgram(input);if(g.status!=='PROPOSED')throw new Error('generate '+g.status+' '+g.reason);
  const t={p:g.program,ledger:[],ref:null,n:0,results:[],input};
  t.review=(w,d,kind,extra={},time='20:00')=>{const day=addDays(t.p.startDate,w*7+d);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T${time}:00-03:00`,weekIndex:w,event:{id:extra.eventId??`q-${++t.n}`,kind},eligibility:extra.eligibility??ELIG(day),observations:extra.observations??[],...(extra.wellbeing?{wellbeing:extra.wellbeing}:{}),...(extra.check?{wellbeingCheck:extra.check}:{}),...(extra.readiness?{readiness:extra.readiness}:{}),...(extra.interruption?{interruption:extra.interruption}:{}),...(extra.changes?{changes:extra.changes}:{}),...(extra.noLedger||!t.ledger.length?{}:{actualLedger:t.ledger}),...(t.ref&&!extra.noRef?{referenceState:t.ref}:{})};};
  t.step=(w,d,kind,extra={},time='20:00')=>{const rv=t.review(w,d,kind,extra,time);const r=evaluateProgram(t.p,rv);t.last={rv,r};if(!extra.dry){t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;}t.results.push(r);return r;};
  t.day=(w,d)=>addDays(t.p.startDate,w*7+d);
  return t;
 }
 const doneWeek=(t,w,{adverse=[],skip=[],sport=null}={})=>doneBefore(t.p,w+1).filter(o=>t.p.weeks[w].sessions.some(s=>s.id===o.sessionId&&(!sport||s.sport!==sport))&&!skip.includes(o.sessionId)).map(o=>adverse.includes(o.sessionId)?{...o,eventId:o.eventId+'-adv',response:{...o.response,recovery:'ADVERSE'}}:o);
 const ladder=(p,w)=>(p.weeks[w]?.adaptations??[]).filter(a=>a.kind==='WELLBEING_REDUCTION'&&a.phase==='LADDER'&&!a.endedBy).reduce((o,a)=>({...(o??{}),...a.rungs}),null);
 const marks=(p,w)=>(p.weeks[w]?.adaptations??[]).filter(a=>a.kind==='WELLBEING_REDUCTION'&&!a.endedBy);
 const setsOf=(p,w,id)=>Math.max(0,...p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises).filter(e=>e.id===id).map(e=>e.sets));
 const liveOn=(p,date,sport)=>p.weeks.flatMap(x=>x.sessions).filter(s=>s.date===date&&(!sport||s.sport===sport)&&live(s));
 const reviewWeeks=(t,from,to)=>{for(let k=from;k<to;k++)t.step(k,6,'WEEKLY_REVIEW',{observations:doneWeek(t,k)});};
 const raceRow=t=>t.p.weeks.flatMap(x=>x.sessions).find(s=>s.role==='RACE');
 const runs=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='RUN'&&live(s)).map(s=>`${s.role}:${s.prescription.durationMinutes}${s.prescription.family?'/'+s.prescription.family:''}`);
 const facts=(t,f)=>t.ledger.filter(o=>o.fact===f);
 return {NO,XNO,RNO,S6NO,READY,KNOWN,RACE,timeline,doneWeek,ladder,marks,setsOf,liveOn,reviewWeeks,raceRow,runs,facts,HYBRID,doneBefore,live,ELIG,addDays};
}
