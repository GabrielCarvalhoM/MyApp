// SSCTR R7A1-SSCTR-r2 first-loaded-week return grid (own instrument). Read-only runtime use, synthetic data, DEV_TEST_ONLY authority.
// RT=freeze2 runs the byte-exact R7A-FREEZE-2 snapshot (freeze2-source/), otherwise the live tree. Usage: node ssctr-r7a1-recheck-firstweek.mjs
// A moderate break (14 or 21 days) that starts inside the athlete's first week with loaded strength exposures, after one or more of them;
// strength experience NONE, FAMILIAR (intermediate, no known loads) or KNOWN (control); three goals; one or two strength days; 20-40 minutes.
// Weeks before are executed and reviewed; the report is made at 06:00 the day after the break; every later week is executed and reviewed.
// For every exercise executed (loaded, not practice) before the break, against policy strengthReturnSets (moderate or long return):
//  E  its first exposure after the return is not a RETURN_ENTRY of strengthEntrySets sets at strengthEntryMinimumRir or more;
//  O  a count above its declared ceiling (the last count executed before the break outside a phase reduction) before the end of the
//     block that follows the block of the re-entry (the block in progress earns no set; only a later completed block lifts the ceiling);
//  B  a count more than one set above the largest count executed since the return.
import path from 'node:path';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,F2=process.env.RT==='freeze2',CC=F2?path.resolve(here,'../freeze2-source/CoachingCore'):path.resolve(here,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const P=JSON.parse(fs.readFileSync(path.join(CC,'r6/PROGRAM_POLICY_R6.json'),'utf8').replace(/^﻿/,'')).operational.return;
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,conv='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention:conv},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const KNOWN=[K('back-squat',4,5,80),K('barbell-rdl',3,6,90),K('db-bench-press',3,8,18,'PER_HAND')];
let N=0;
const intake=(id,{goal,cls,days,minutes})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:cls==='NONE'?'NONE':'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:cls==='NONE'?0:days.length},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:cls==='KNOWN'?KNOWN:[],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:days.includes(4)?[1,5,6]:[1,4,6],strengthDays:days,runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:minutes,longRunDay:6,longRunMinutes:80}});
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`fw-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`fw-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.log.push(`${x.event.kind}@w${x.weekIndex}:${r.status}/${r.action}`);return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const loaded=e=>e.load.mode!=='BODYWEIGHT'&&!(e.exposure?.kind==='PRACTICE'||e.role==='PRACTICE');
const rowsOf=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.map(e=>({date:s.date,day:s.day,e})));
const out={probe:'R7A1-SSCTR-r2-FIRSTWEEK',runtime:F2?'R7A-FREEZE-2':'live tree (check the digest)',policyReturn:{shortMaxDays:P.shortMaxDays,moderateMaxDays:P.moderateMaxDays,strengthEntrySets:P.strengthEntrySets,strengthEntryMinimumRir:P.strengthEntryMinimumRir},
 cases:0,skipped:[],byClass:{},examples:{E:[],O:[],B:[]}};
const tally=(cls,k)=>{const c=(out.byClass[cls]??={cases:0,exercises:0,E:0,O:0,B:0,casesWithAny:0});c[k]++;};
for(const cls of ['NONE','FAMILIAR','KNOWN'])for(const goal of ['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT'])for(const days of [[0],[0,3]])for(const minutes of [20,30,40])for(const startDay of [1,4,5])for(const length of [14,21]){
 const id=`fw-${cls}-${goal}-${days.length}-${minutes}-b${startDay}-${length}`;
 const g=R.generateProgram(intake(id,{goal,cls,days,minutes}),opts);if(!g.program){out.skipped.push(id+':'+g.status);continue;}
 const t={p:g.program,ledger:[],log:[]};
 try{
  // The first week whose plan holds a loaded strength exposure.
  const F=t.p.weeks.findIndex(x=>rowsOf(t.p,x.index).some(r=>loaded(r.e)));if(F<0||F>3){out.skipped.push(id+':no loaded week');continue;}
  for(let w=0;w<F;w++)weekly(t,w);
  const bStart=addDays(t.p.weeks[F].startDate,startDay),bEnd=addDays(bStart,length-1),report=addDays(bEnd,1);
  const before=rowsOf(t.p,F).filter(r=>r.date<bStart&&loaded(r.e));if(!before.length){out.skipped.push(id+':nothing before the break');continue;}
  const ceiling={};for(const {e} of before)if(!Number.isInteger(e.exposure?.phasedSets)||e.exposure.phasedSets===e.exposure.baseSets)ceiling[e.id]=e.sets;
  weekly(t,F,s=>s.date<bStart);
  const rw=Math.floor((Date.parse(report)-Date.parse(t.p.startDate))/(7*864e5));
  for(let w=F+1;w<rw;w++)weekly(t,w,()=>false);
  const r=ev(t,at(t.p,rw,(Date.parse(report)-Date.parse(t.p.weeks[rw].startDate))/864e5,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:length,startDate:bStart,endDate:bEnd,reasonCategory:'TRAVEL',reason:'Work travel'}}));
  if(!/REESTABLISH/.test(r.action??'')){out.skipped.push(id+':'+r.status+'/'+r.action);continue;}
  out.cases++;tally(cls,'cases');
  const blocks=t.p.blocks??[],bi=blocks.findIndex(b=>rw>=b.startWeek&&rw<b.endWeekExclusive),limitWeek=blocks[bi+1]?.endWeekExclusive??16;
  const seen=new Set(),largest={};let any=false;
  for(const x of Object.keys(ceiling))tally(cls,'exercises');
  for(let w=rw;w<13;w++){
   for(const {date,e} of rowsOf(t.p,w)){
    if(!(e.id in ceiling)||date<report)continue;
    if(!seen.has(e.id)){seen.add(e.id);if(e.exposure?.kind!=='RETURN_ENTRY'||e.sets>P.strengthEntrySets||e.rir<P.strengthEntryMinimumRir){tally(cls,'E');any=true;if(out.examples.E.length<10)out.examples.E.push({id,week:w,exercise:e.id,kind:e.exposure?.kind??null,sets:e.sets,rir:e.rir,ceiling:ceiling[e.id],preBreak:before.filter(b=>b.e.id===e.id).map(b=>`${b.e.sets}x${b.e.reps}@${b.e.rir} ${b.e.exposure?.kind}`)});}}
    if(w<limitWeek&&e.sets>ceiling[e.id]){tally(cls,'O');any=true;if(out.examples.O.length<10)out.examples.O.push({id,week:w,exercise:e.id,sets:e.sets,ceiling:ceiling[e.id],kind:e.exposure?.kind??null,limitWeek});}
    if(Number.isInteger(largest[e.id])&&e.sets>largest[e.id]+1){tally(cls,'B');any=true;if(out.examples.B.length<10)out.examples.B.push({id,week:w,exercise:e.id,sets:e.sets,largestSinceReturn:largest[e.id]});}
   }
   weekly(t,w,s=>s.date>=report);
   for(const {date,e} of rowsOf(t.p,w))if(date>=report&&e.id in ceiling)largest[e.id]=Math.max(largest[e.id]??0,e.sets);
  }
  if(any)tally(cls,'casesWithAny');
 }catch(err){out.skipped.push(id+':'+String(err?.message??err).slice(0,160)+' after '+t.log.slice(-2).join(','));}
}
console.log(JSON.stringify(out,null,1));
