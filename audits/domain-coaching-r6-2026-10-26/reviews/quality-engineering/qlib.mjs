// QRE probe helpers (independent; written by the quality judge, not the runtime author). Read-only use of the runtime.
import fs from 'node:fs';
import path from 'node:path';
export * as R6 from '../../../../CoachingCore/src/r6-index.mjs';
export {r6Authority,allows,loadR6Policy} from '../../../../CoachingCore/src/r6-authority.mjs';
export {hash,canonical} from '../../../../CoachingCore/src/value.mjs';
export {simulateProgram} from '../../../../CoachingCore/src/r6-simulator.mjs';
export {screenInterruptionReason} from '../../../../CoachingCore/src/r6-clinical.mjs';
export {devAuthority} from '../../../../CoachingCore/r6/fixtures/dev-authority.mjs';

export const OUT=import.meta.dirname;
export function write(name,obj){fs.writeFileSync(path.join(OUT,name),JSON.stringify(obj,null,1)+'\n');}
/** Deterministic PRNG for probe generation (mulberry32). */
export function prng(seed){let a=seed>>>0;return ()=>{a=a+0x6D2B79F5>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
export const pick=(r,list)=>list[Math.floor(r()*list.length)];
export const subset=(r,list,min=0,max=list.length)=>{const n=min+Math.floor(r()*(max-min+1));const pool=[...list];const out=[];while(out.length<n&&pool.length)out.push(pool.splice(Math.floor(r()*pool.length),1)[0]);return out.sort((a,b)=>a-b);};
export const elig=(date,over={})=>({status:'NONCLINICAL_CONFIRMED',assessedAt:date,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,...over});
export const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
export function baseIntake({id='q-athlete',asOf='2026-11-01',startDate='2026-11-02',weeks=8,athlete={},schedule={},...rest}={}){
 return {version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,learningConsent:true,...rest,
  athlete:{id,ageEligible:true,eligibility:elig(asOf),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],
   knownExercises:[{id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'},{id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}],...athlete},
  schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80,...schedule}};
}
export function review(program,weekIndex,{kind='WEEKLY_REVIEW',day=6,time='T21:00:00Z',id=null,eligibility=null,...extra}={}){
 const date=addDays(program.weeks[weekIndex].startDate,day);
 return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:date+time,weekIndex,event:{id:id??`q-${kind}-w${weekIndex}-d${day}`,kind},eligibility:eligibility??elig(date),...extra};
}
const RESP={COMPATIBLE:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},EASIER:{performance:'OVER',recovery:'COMPATIBLE',effort:'EASIER',nextDayFunction:'NORMAL'},ADVERSE:{performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'},UNKNOWN:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'}};
export const RESPONSES=RESP;
/** Observation of a session executed as prescribed (strength sets copy planned reps/RIR; loads from KNOWN or a stated value). */
export function obsFor(program,s,{response='COMPATIBLE',eventId=null,observedAt=null,completed=true,minutes=null,rirShift=0,loads={},repsShift=0,source=null,omitRir=false}={}){
 const p=s.prescription,actual={completed,minutes:minutes??p.durationMinutes};
 if(p.modality==='STRENGTH')actual.exercises=p.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:Math.max(1,e.reps+repsShift),load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:(loads[e.id]??20),unit:e.load.unit==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},...(omitRir?{}:{rir:Math.max(0,e.rir+rirShift)})}))}));
 return {eventId:eventId??`q-${program.athleteId}-${s.id}`,athleteId:program.athleteId,sessionId:s.id,observedAt:observedAt??(s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z')),actual,response:structuredClone(RESP[response]??response),...(source?{source}:{})};
}
export const sessionsOf=p=>p.weeks.flatMap(w=>w.sessions);
export function safe(fn){try{return {ok:true,value:fn()};}catch(e){return {ok:false,error:e?.constructor?.name+': '+e?.message,stack:String(e?.stack??'').split('\n').slice(0,4).join(' | ')};}}
