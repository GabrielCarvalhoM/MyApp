// SSCTR R7A1-SSCTR-r1 short-return grid (own instrument): R6-NONCLINICAL-RETURN condition 7, "SHORT: resume the last executed doses; the
// first quality slot runs easy", read with C1 "ahead". Read-only runtime use, synthetic data, DEV_TEST_ONLY authority. RT=freeze2 runs the
// byte-exact R7A-FREEZE-2 snapshot. Usage: node ssctr-r7a1-short.mjs > out.json
// Grid: two run layouts, run shift AM or PM, breaks of 3, 6 and 10 days ending the day before the report, the report on every day of the
// week at 05:00, 09:00, 11:30, 12:30 and 21:00 local time. Before the break every week is executed and reviewed.
// For each case, after the return and again after the weekly review of the return week (remaining sessions executed as prescribed):
//  first   the first run session still ahead of the report that is a quality slot (role QUALITY) or carries the easy-slot explanation;
//          a defect when it is a QUALITY run, or when there is none in the return week and the next two;
//  extra   more than one slot made easy;
//  history a session not ahead of the report whose prescription changed.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,ROOT=path.resolve(here,'../../..'),tag=process.env.RT==='freeze2'?'R7A-FREEZE-2':'R7A1-FREEZE-A1';
const CC=tag==='R7A1-FREEZE-A1'?path.join(ROOT,'CoachingCore'):path.join(here,'../freeze2-source/CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),{hash}=await load('src/value.mjs'),opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
let N=0;
const LAYOUTS={A:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6},B:{runDays:[0,2,4,6],strengthDays:[1,5],longRunDay:6}};
const intake=(id,layout,turn)=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:LAYOUTS[layout].runDays.length,runMinutesPerWeek:180,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT],exerciseRotationPreference:'FIXED'},
 schedule:{...LAYOUTS[layout],runTurn:turn,strengthTurn:turn==='AM'?'PM':'AM',runMinutes:60,strengthMinutes:60,longRunMinutes:100}});
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`ss-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`ss-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return `${r.status}/${r.action}`;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const EASY_SLOT='First quality slot after a short break runs easy';
const W=5,out={probe:'R7A1-SSCTR-SHORT-1',runtime:tag,cases:0,notShort:0,afterReturn:{defects:0,noSlot:0,extra:0,history:0,byShape:{}},afterReview:{defects:0,noSlot:0,extra:0},examples:[]};
const firstOf=(P,w0,isAhead)=>{for(let w=w0;w<Math.min(P.weeks.length,w0+3);w++)for(const s of P.weeks[w].sessions){if(s.sport!=='RUN'||!isAhead(s))continue;if(s.role==='QUALITY'&&s.prescription)return {id:s.id,role:'QUALITY',week:w};if(s.explanation===EASY_SLOT)return {id:s.id,role:'EASY_SLOT',week:w};}return null;};
const easyCount=(P,w0)=>P.weeks.slice(w0,w0+3).flatMap(x=>x.sessions).filter(s=>s.explanation===EASY_SLOT).length;
for(const layout of ['A','B'])for(const turn of ['AM','PM']){
 const gen=R.generateProgram(intake(`ss-${layout}-${turn}`,layout,turn),opts),base=gen.program;
 if(!base){(out.skippedLayouts??=[]).push(`${layout}-${turn}: ${gen.status} ${gen.reason??''}`);continue;}
 for(const days of [3,6,10])for(let d=0;d<7;d++)for(const hour of ['05:00:00','09:00:00','11:30:00','12:30:00','21:00:00']){
  const t={p:base,ledger:[]},day=addDays(base.weeks[W].startDate,d),end=addDays(day,-1),start=addDays(end,-(days-1));
  for(let w=0;w<W;w++)weekly(t,w,s=>s.date<start);
  const beforeP=t.p,hh=Number(hour.slice(0,2)),isAhead=s=>s.date>day||s.date===day&&!(s.turn==='AM'&&hh>=12);
  const r=ev(t,at(t.p,W,d,hour,{kind:'RETURN_AFTER_PAUSE',interruption:{days,startDate:start,endDate:end,reasonCategory:'TRAVEL',reason:'Work travel'}}));out.cases++;
  if(!/REESTABLISH/.test(r)){out.notShort++;continue;}
  const shape=`${layout}-${turn}-d${d}`,f=firstOf(t.p,W,isAhead),n=easyCount(t.p,W);
  const hist=beforeP.weeks.flatMap(x=>x.sessions).filter(s=>!isAhead(s)&&s.date>=beforeP.weeks[W].startDate).filter(s=>{const now=t.p.weeks.flatMap(x=>x.sessions).find(x=>x.id===s.id);return !now||hash(now.prescription)!==hash(s.prescription);});
  const bad=!f||f.role==='QUALITY';
  if(!f)out.afterReturn.noSlot++;if(bad){out.afterReturn.defects++;out.afterReturn.byShape[shape]=(out.afterReturn.byShape[shape]??0)+1;}if(n>1)out.afterReturn.extra++;if(hist.length)out.afterReturn.history++;
  const qBefore=firstOf(beforeP,W,isAhead);
  if(bad&&out.examples.length<12)out.examples.push({case:`${shape} ${hour} break ${days}d`,return:r,firstQualitySlotBefore:qBefore,firstAfterReturn:f,thisWeekRuns:t.p.weeks[W].sessions.filter(s=>s.sport==='RUN').map(s=>`d${s.day}${s.turn??''} ${s.role}${s.prescription?' '+s.prescription.family+':'+s.prescription.durationMinutes:''}${isAhead(s)?'':' (not ahead)'}`),nextWeekRuns:t.p.weeks[W+1].sessions.filter(s=>s.sport==='RUN').map(s=>`d${s.day} ${s.role}${s.prescription?' '+s.prescription.family+':'+s.prescription.durationMinutes:''}`)});
  // The weekly review of the return week, its remaining sessions executed as prescribed.
  weekly(t,W,s=>s.date>=day&&(isAhead(s)||s.date>day));
  const g=firstOf(t.p,W+1,()=>true),easyDoneThisWeek=t.p.weeks[W].sessions.some(s=>s.explanation===EASY_SLOT);
  if(!easyDoneThisWeek){if(!g)out.afterReview.noSlot++;if(!g||g.role==='QUALITY')out.afterReview.defects++;}
  if(easyCount(t.p,W)>1)out.afterReview.extra++;
 }
}
console.log(JSON.stringify(out,null,1));
