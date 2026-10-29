// R7A1-QE-r2 probe helpers (independent engineering judge, re-check of FREEZE-A2): the R7A1-QE-r1 helpers unchanged, except that the live
// runtime root may be pointed at a byte-exact FREEZE-A1 copy (QE_LIVE_ROOT) to reproduce the first review's results. Read-only.
// byte-exact FREEZE-2 copy in ../freeze2-source. Synthetic data, DEV_TEST_ONLY authority, no network, nothing written outside stdout.
// Clocks are built in the athlete's local time and converted with the program's own offset, so every probe can run in any time zone.
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
export const ROOT=path.resolve(here,'../../..');
const roots={A1:process.env.QE_LIVE_ROOT??path.join(ROOT,'CoachingCore'),F2:path.join(ROOT,'audits/domain-coaching-r7a1-2026-10-27/freeze2-source/CoachingCore')};
export async function runtime(tag='A1'){
 const L=rel=>import(pathToFileURL(path.join(roots[tag],rel)).href);
 const R={...(await L('src/r6-index.mjs')),...(await L('src/r6-program.mjs'))},{devAuthority}=await L('r6/fixtures/dev-authority.mjs');
 return {R,opts:{authority:devAuthority()},tag};
}
export const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
export const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
export const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
export const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
export const RDL={...SQUAT,id:'barbell-rdl',reps:6,load:{value:90,unit:'KG',convention:'TOTAL'}};
export const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
/** Local wall time (date + 'HH:MM') to a UTC instant for an offset in minutes east of UTC. */
export const localAt=(date,hm,tz=0)=>new Date(Date.parse(`${date}T${hm}:00Z`)-tz*60000).toISOString().replace('.000Z','Z');
export const intake=({id,weeks=16,tz=0,athlete={},schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,...(tz?{timezoneOffsetMinutes:tz}:{}),
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
export const tzOf=p=>p.timezoneOffsetMinutes??p.canonical?.timezoneOffsetMinutes??0;
/** A review at local day `day` of week w and local time hm. */
export const at=(p,w,day,hm,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:localAt(d,hm,tzOf(p)),weekIndex:w,event:{id:`qa1-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
/** An as-prescribed report, observed at 08:00 local (AM or no shift) or 19:00 local (PM). */
export function obs(p,s,{over={},minutes=null,hm=null}={}){const pr=s.prescription,actual={completed:true,minutes:minutes??pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>{const o=over[e.id]??{},ld=o.load??{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention};return {id:e.id,sets:Array.from({length:o.sets??e.sets},()=>({load:ld,reps:o.reps??e.reps,rir:o.rir??e.rir}))};});
 return {eventId:`qa1-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:localAt(s.date,hm??(s.turn==='PM'?'19:00':'08:00'),tzOf(p)),actual,response:{...OK}};}
export function make(RT){
 const {R,opts}=RT;
 const ev=(t,review)=>{const r=R.evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r.status+'/'+r.action;};
 const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&keep(s)).map(s=>obs(t.p,s))}));
 const start=(ia,weeks)=>{const g=R.generateProgram(intake(ia),opts);if(!g.program)throw Error(`${ia.id}: ${g.status} ${g.reason}`);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
 return {ev,weekly,start,copy:t=>({p:t.p,ledger:t.ledger})};
}
export const row=s=>`d${s.day}${s.turn??''} ${s.sport} ${s.role}${s.status==='SKIPPED'?' SKIPPED':''}${s.moved?' <-'+s.moved.from:''} ${s.prescription?(s.sport==='STRENGTH'?s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.rir}/${e.load.mode}${e.load.value??''}`).join(','):`${s.prescription.family}:${s.prescription.durationMinutes}`):'-'}`;
export const line=(P,w)=>P.weeks[w].sessions.map(row);
export const stateOf=(P,w)=>{const {anchor,...st}=P.stateTrace[w]??{};return JSON.stringify(st);};
export const whole=(P,w)=>JSON.stringify({rows:P.weeks.slice(w).map((x,k)=>line(P,w+k)),states:P.stateTrace.slice(w+1).map(({anchor,...st})=>st)});
export const firstDiff=(A,B,w)=>{for(let i=w;i<A.weeks.length;i++){const a=line(A,i),b=line(B,i);if(a.join('\n')!==b.join('\n'))return {week:i,kind:'rows',a,b};if(i>w&&stateOf(A,i)!==stateOf(B,i))return {week:i,kind:'state'};}return null;};
export const print=obj=>console.log(JSON.stringify(obj,null,1));
