// SSCTR R7A1-SSCTR-r2 trace (own instrument): one timeline of ssctr-r7a1-recheck-caps.mjs (EXT), week by week, rows and state of the given
// exercises. Read-only runtime use, live tree, synthetic data, DEV_TEST_ONLY authority.
// RT=freeze2 runs the byte-exact R7A-FREEZE-2 snapshot (freeze2-source/). Usage: node ssctr-r7a1-recheck-trace.mjs <experience NONE|NOVICE|INTERMEDIATE> <goal> <minutes> <mode retEarly|ret16mon|none> <ids,comma>
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,CC=process.env.RT==='freeze2'?path.resolve(here,'../freeze2-source/CoachingCore'):path.resolve(here,'../../../CoachingCore'),load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const [experience,goal,minutes,mode,ids]=process.argv.slice(2);
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
let N=0;
const ia={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id:'tr',ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:experience,recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:experience==='NONE'?0:1},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,4,6],strengthDays:[0],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:Number(minutes),longRunDay:6,longRunMinutes:80}};
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`tr-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`tr-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const log=[];const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;log.push(`${x.event.kind}@w${x.weekIndex}:${r.status}/${r.action}`);return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const g=R.generateProgram(ia,opts),t={p:g.program,ledger:[]};
const pick=x=>x?Object.fromEntries(['mode','sets','returnStep','setCap','setCeiling','regainCap','priorSets','lastExecutedSets','lastPerformed','blocksDone','status','source'].filter(k=>x[k]!==undefined).map(k=>[k,x[k]])):null;
const rows=(w,id)=>t.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.filter(e=>e.id===id).map(e=>`d${s.day}:${e.sets}x${e.reps}@${e.rir} ${e.load.mode} ${e.exposure?.kind} base${e.exposure?.baseSets}/norm${e.exposure?.normalSets}`));
const show=w=>{for(const id of ids.split(','))console.log(`w${w} ${t.p.phases.phases[w]} ${id}: rows ${JSON.stringify(rows(w,id))} state ${JSON.stringify(pick(t.p.stateTrace[w].strength.exercises[id]))}`);};
console.log('class',g.program?.capabilities?.strength?.class??'(see skeleton)','blocks',JSON.stringify(t.p.blocks?.map?.(b=>[b.family,b.startWeek,b.endWeekExclusive])??null));
const end=mode==='none'?8:9;
for(let w=0;w<end;w++){
 show(w);
 if(mode==='retWeek0'&&(w===1||w===2)){weekly(t,w,()=>false);if(w===2){const d=t.p.weeks[3].startDate;ev(t,at(t.p,3,0,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d,-16),endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));console.log('  ',log.at(-1));}continue;}
 if(mode==='retEarly'&&(w===2||w===3)){weekly(t,w,()=>false);if(w===3){const d=t.p.weeks[4].startDate;ev(t,at(t.p,4,0,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d,-16),endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));console.log('  ',log.at(-1));}continue;}
 weekly(t,w);
}
console.log(log.join(' | '));
