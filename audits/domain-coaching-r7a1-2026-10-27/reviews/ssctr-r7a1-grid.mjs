// SSCTR R7A1-SSCTR-r1 restoration grid (own instrument; written without reading the author's grid output). Read-only runtime use,
// synthetic data, DEV_TEST_ONLY authority. RT=freeze2 runs the byte-exact R7A-FREEZE-2 snapshot (freeze2-source/), otherwise the live tree.
// Usage: node ssctr-r7a1-grid.mjs > out.json   (env SHARD=i/n splits the timelines)
// Timelines: a re-establishment (strength missed weeks 2-6), a 16-day return reported Monday (re-entry this week), a 16-day return reported
// Thursday morning, and a 24-day return; three goals; known or no exercises; one, two or three strength days of 20-40 minutes; the budget kept,
// raised to 75 minutes after the first week back, or raised after the third. Every week executed as prescribed and reviewed on Sunday evening.
// Per exercise and week it measures:
//  A  a regain or return cap that rises or ends after a week whose last executed exposure did not do its whole count after the time fit;
//  A2 a cap held after a week whose last executed exposure did its whole count (the cap then never moves);
//  B  a count more than one set above the largest count executed since the break, for an exercise a cap or the return steps covered;
//  C  a row whose count before the fit is above the cap in force for it;
//  L  weeks where an earlier exposure that week was whole and the last was not, with a cap in force (where "last" and "any" differ);
//  U  the same jump as B for exercises no cap or return step ever covered (the R23 class), with their full history.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,ROOT=path.resolve(here,'../../..'),tag=process.env.RT==='freeze2'?'R7A-FREEZE-2':'R7A1-FREEZE-A1';
const CC=tag==='R7A1-FREEZE-A1'?path.join(ROOT,'CoachingCore'):path.join(here,'../freeze2-source/CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const [shard,shards]=(process.env.SHARD??'0/1').split('/').map(Number);
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,conv='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention:conv},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const KNOWN=[K('back-squat',4,5,80),K('barbell-rdl',3,6,90),K('db-bench-press',3,8,18,'PER_HAND')];
let N=0;
const intake=(id,{goal,known,days,minutes})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:days.length},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:known?KNOWN:[],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,4,6].filter(d=>!days.includes(d)).length===3?[1,4,6]:[1,5,6],strengthDays:days,runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:minutes,longRunDay:6,longRunMinutes:80}});
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`sg-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`sg-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.log.push(`${x.event.kind}@w${x.weekIndex}:${r.status}/${r.action}`);return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.date<=addDays(t.p.weeks[w].startDate,6)).map(s=>obs(t.p,s))}));
const rowsOf=(P,w,id)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.filter(e=>!id||e.id===id).map(e=>({day:s.day,e})));
const capOf=x=>Number.isInteger(x?.regainCap)?['regainCap',x.regainCap]:Number.isInteger(x?.setCap)?['setCap',x.setCap]:null;
const whole=e=>Number.isInteger(e.exposure?.baseSets)?e.sets===e.exposure.baseSets:null;
const out={probe:'R7A1-SSCTR-GRID-1',runtime:tag,shard:`${shard}/${shards}`,timelines:0,skipped:[],
 A:{capWeeksLastNotWhole:0,riseOrEnd:0,byCause:{timeFit:0,phase:0},examples:[]},A2:{capWeeksLastWhole:0,held:0,heldAtReturnCeiling:0,examples:[]},
 B:{violations:0,examples:[]},C:{violations:0,examples:[]},L:{weeks:0,capEndedByHorizon:0,capStillOnAtHorizon:0,examples:[]},
 coverage:{trimmedLastWithRegainCap:0,trimmedLastWithSetCap:0,setCapWeeks:0,regainCapWeeks:0},
 U:{jumps:0,byExercise:{},examples:[]}};
// FULL=1 keeps every example (diagnostic runs); the default keeps the first few.
const push=(arr,x,n=6)=>{if(process.env.FULL||arr.length<n)arr.push(x);};
let k=0;
for(const mode of ['reest','ret16mon','ret16thu','ret24'])for(const goal of ['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT'])for(const known of [true,false])for(const days of [[0],[0,3],[0,2,4]])for(const minutes of [20,25,30,40])for(const raise of ['none','after1','after3']){
 const id=`sg-${mode}-${goal}-${known?'K':'N'}-${days.length}-${minutes}-${raise}`,TR=process.env.TRACE?.split(':');
 if(TR&&TR[0]!==id)continue;
 if(!TR&&(k++)%shards!==shard)continue;
 const g=R.generateProgram(intake(id,{goal,known,days,minutes}),opts);if(!g.program){out.skipped.push(id+':'+g.status);continue;}
 const t={p:g.program,ledger:[],log:[]};out.timelines++;
 let from,reviewDay=null;
 try{
  if(mode==='reest'){for(let w=0;w<7;w++)weekly(t,w,s=>!(s.sport==='STRENGTH'&&w>=2&&w<=6));from=7;}
  else if(mode==='ret16mon'){for(let w=0;w<4;w++)weekly(t,w);weekly(t,4,()=>false);weekly(t,5,()=>false);const d=t.p.weeks[6].startDate;ev(t,at(t.p,6,0,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d,-16),endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));from=6;}
  else if(mode==='ret16thu'){for(let w=0;w<4;w++)weekly(t,w);weekly(t,4,s=>s.day<=2);weekly(t,5,()=>false);const d=addDays(t.p.weeks[6].startDate,3);ev(t,at(t.p,6,3,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d,-16),endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));from=6;reviewDay=3;}
  else{for(let w=0;w<3;w++)weekly(t,w);weekly(t,3,s=>s.day<=3);weekly(t,4,()=>false);weekly(t,5,()=>false);const d=t.p.weeks[6].startDate;ev(t,at(t.p,6,0,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:24,startDate:addDays(d,-24),endDate:addDays(d,-1),reasonCategory:'VACATION',reason:'Vacation'}}));from=6;}
  const largest={},covered=new Set(),hist={};
  for(let w=0;w<from;w++)for(const {e} of rowsOf(t.p,w))(hist[e.id]??=[]).push(`w${w}:${e.sets}`);
  for(let w=from;w<15;w++){
   const st=t.p.stateTrace[w].strength.exercises;
   for(const [x,ex] of Object.entries(st))if(capOf(ex)||Number.isInteger(ex.returnStep))covered.add(x);
   const ids=[...new Set(rowsOf(t.p,w).map(r=>r.e.id))];
   for(const x of ids){
    const rows=rowsOf(t.p,w,x),fromDay=w===from&&reviewDay!==null?reviewDay:0,mine=rows.filter(r=>r.day>=fromDay);if(!mine.length)continue;
    (hist[x]??=[]).push(`w${w}:${mine.map(r=>r.e.sets).join('/')}`);
    for(const {e} of mine){
     const L=largest[x];
     if(Number.isInteger(L)&&e.sets>L+1){const ex={timeline:id,week:w,id:x,mode:e.load.mode,kind:e.exposure?.kind??null,sets:e.sets,largestExecutedSinceBreak:L};
      if(covered.has(x)){out.B.violations++;push(out.B.examples,ex);}else{out.U.jumps++;const key=`${x}/${e.load.mode}`;out.U.byExercise[key]=(out.U.byExercise[key]??0)+1;push(out.U.examples,{...ex,history:hist[x],state:st[x]??null},8);}}
     const c=capOf(st[x]);if(c&&!Number.isInteger(st[x].returnStep)&&Number.isInteger(e.exposure?.baseSets)&&e.exposure.baseSets>c[1]){out.C.violations++;push(out.C.examples,{timeline:id,week:w,id:x,cap:c,baseSets:e.exposure.baseSets,sets:e.sets});}
    }
   }
   if(TR)for(const x of TR[1].split(','))console.error(JSON.stringify({w,id:x,state:(({regainCap,setCap,setCeiling,returnStep,priorSets,sets,lastExecutedSets,blocksDone,mode})=>({regainCap,setCap,setCeiling,returnStep,priorSets,sets,lastExecutedSets,blocksDone,mode}))(st[x]??{}),rows:rowsOf(t.p,w,x).map(r=>`d${r.day}:${r.e.sets}/${r.e.exposure?.phasedSets}/${r.e.exposure?.baseSets}/${r.e.exposure?.normalSets} ${r.e.exposure?.kind} ${t.p.phases.phases[w]}`)}));
   const before=Object.fromEntries(Object.entries(st).map(([x,ex])=>[x,{cap:capOf(ex),returnStep:ex.returnStep??null,ceiling:Number.isInteger(ex.setCeiling)?ex.setCeiling:null}]));
   const fromDay=w===from&&reviewDay!==null?reviewDay:0;
   weekly(t,w,s=>s.day>=fromDay);
   if((raise==='after1'&&w===from+1)||(raise==='after3'&&w===from+3))ev(t,at(t.p,w,6,'22:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}}));
   for(const x of ids)for(const {day,e} of rowsOf(t.p,w,x))if(day>=fromDay)largest[x]=Math.max(largest[x]??0,e.sets);
   const next=t.p.stateTrace[w+1]?.strength.exercises??{};
   for(const [x,b] of Object.entries(before)){
    const rows=rowsOf(t.p,w,x).filter(r=>r.day>=fromDay);if(!rows.length||!b.cap||Number.isInteger(b.returnStep))continue;
    const last=rows.at(-1).e,wl=whole(last);if(wl===null)continue;
    out.coverage[b.cap[0]==='regainCap'?'regainCapWeeks':'setCapWeeks']++;
    const trimmed=last.sets<last.exposure.phasedSets,phased=last.exposure.phasedSets<last.exposure.baseSets;
    if(trimmed)out.coverage[b.cap[0]==='regainCap'?'trimmedLastWithRegainCap':'trimmedLastWithSetCap']++;
    const nc=capOf(next[x]),movedUp=!nc||nc[1]>b.cap[1];
    if(!wl){out.A.capWeeksLastNotWhole++;if(movedUp){out.A.riseOrEnd++;out.A.byCause[trimmed?'timeFit':'phase']++;push(out.A.examples,{timeline:id,week:w,id:x,cap:b.cap,next:nc,last:`${last.sets}/${last.exposure.phasedSets}/${last.exposure.baseSets}`,earlierWhole:rows.slice(0,-1).some(r=>whole(r.e)),rows:rows.map(r=>`d${r.day}:${r.e.sets}/${r.e.exposure.phasedSets}/${r.e.exposure.baseSets}/${r.e.exposure.normalSets}`)});}
     if(rows.slice(0,-1).some(r=>whole(r.e))){out.L.weeks++;push(out.L.examples,{timeline:id,week:w,id:x,rows:rows.map(r=>`d${r.day}:${r.e.sets}/${r.e.exposure.phasedSets}/${r.e.exposure.baseSets}`),cap:b.cap,next:nc});const end=capOf(t.p.stateTrace[15]?.strength.exercises?.[x]);if(end)out.L.capStillOnAtHorizon++;else out.L.capEndedByHorizon++;}}
    else{out.A2.capWeeksLastWhole++;if(!movedUp&&b.cap[0]==='setCap'&&b.ceiling!==null&&b.cap[1]>=b.ceiling)out.A2.heldAtReturnCeiling++;else if(!movedUp){out.A2.held++;push(out.A2.examples,{timeline:id,week:w,id:x,cap:b.cap,next:nc,last:`${last.sets}/${last.exposure.phasedSets}/${last.exposure.baseSets}`,normalSets:last.exposure.normalSets});}}
   }
  }
 }catch(err){out.skipped.push(id+':'+String(err?.message??err).slice(0,200)+' after '+t.log.slice(-2).join(','));}
}
console.log(JSON.stringify(out,null,1));
