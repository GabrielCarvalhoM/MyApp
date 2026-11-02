// Canonical views of runtime outputs for comparisons: ids, hashes, free text and clocks are dropped; only what a decision does is kept.
import {digestOf} from './util.mjs';
import {live} from './client.mjs';

export function canonicalPrescription(p){
 if(!p)return null;
 if(p.modality==='RUN')return {family:p.family,minutes:p.durationMinutes??null,work:p.work?{reps:p.work.repetitions??null,work:p.work.workMinutes??null,rec:p.work.recoveryMinutes??null}:null,strides:p.strides?{count:p.strides.count??p.strides.repetitions??null}:null,completion:p.completion??null,walkBreaks:p.walkBreaks?true:null};
 return {family:p.family,exercises:(p.exercises??[]).map(e=>({id:e.id,sets:e.sets,reps:e.reps,rir:e.rir??null,load:canonicalLoad(e.load)}))};
}
/** A load as mass: a dumbbell or kettlebell pair PER_HAND v is the same mass as TOTAL 2v (the stated convention is kept by the plan). */
export function canonicalLoad(l){
 if(!l)return null;
 const v=Number.isFinite(l.value)?l.value:null;
 if(v!==null&&l.convention==='PER_HAND')return {mode:l.mode??null,totalKg:v*2};
 if(v!==null&&l.convention==='TOTAL')return {mode:l.mode??null,totalKg:v};
 return {mode:l.mode??null,value:v,convention:l.convention??null};
}
export const canonicalSession=(s,{dates=true}={})=>({week:s.weekIndex,day:s.day,...(dates?{date:s.date}:{}),turn:s.turn??null,sport:s.sport,role:s.role,status:s.status??'PLANNED',rx:canonicalPrescription(s.prescription)});

/** The sessions of the plan from `fromDate` (inclusive) in weeks [fromWeek, toWeek]. */
export function planWindow(program,{fromWeek=0,toWeek=Infinity,fromDate=null,dates=true}={}){
 if(!program)return null;
 return program.weeks.filter(w=>w.index>=fromWeek&&w.index<=toWeek).flatMap(w=>w.sessions.filter(s=>!fromDate||s.date>=fromDate).map(s=>canonicalSession(s,{dates})));
}
export const phasesOf=program=>program?program.weeks.map(w=>w.phase):null;

/** What a decision decided, without ids or text. */
export function decisionView(result){
 if(!result)return null;
 const q=result.question;
 return {status:result.status,action:result.action??null,validity:result.planValidity?.status??null,
  question:q?{kind:q.kind,scope:q.dependentScope??null,fromWeek:q.fromWeek??null,sessions:(q.unreported?.sessionIds??[]).length}:null,
  gates:result.gates?Object.fromEntries(Object.entries(result.gates).sort()):null,
  offers:(result.offers??[]).map(o=>o.type??o.id).sort(),
  pending:result.referenceState?.pending?{status:result.referenceState.pending.status,signal:!!result.referenceState.pending.signal}:null};
}
/** Step-level comparable record for metamorphic relations. */
export function stepView(step,{scope='WINDOW',dates=true}={}){
 const plan=step.planAfter;
 const window=scope==='ALL'?planWindow(plan,{dates}):planWindow(plan,{fromWeek:step.weekIndex,toWeek:step.weekIndex+1,fromDate:dates?step.asOfLocal:null,dates});
 return {decision:decisionView(step.result),plan:window,phases:phasesOf(plan)};
}
export const viewDigest=v=>digestOf(v);
export function generationView(trace,{dates=true}={}){
 const g=trace.generation;
 return g?{status:g.status,plan:g.program?planWindow(g.program,{dates}):null,phases:phasesOf(g.program)}:null;
}
export {live};
