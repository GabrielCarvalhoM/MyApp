// SSCTR R7A1-SSCTR-r2 cap diagnostic (own instrument). The same 864 timelines as ssctr-r7a1-grid.mjs (same intake, same timelines, same
// weekly execution), plus an optional NONE/NOVICE strength-experience extension (EXT=1). Read-only runtime use, synthetic data, DEV_TEST_ONLY
// authority, live tree. Usage: node ssctr-r7a1-recheck-caps.mjs > out.json   (env SHARD=i/n; EXT=1 for the extension)
// For every exercise and week from re-entry with a return or regain cap in force (return steps finished) and a row that week:
//  binding   the cap is below the row's normal count (it holds the count back);
//  cause     of each binding week, from the previous week's state and rows:
//            RISING (the cap rose one set after the previous week), AT_CEILING (return cap at the return ceiling, R20),
//            HELD_LAST_TRIMMED / HELD_LAST_PHASED (held after a week whose last exposure was time-fitted / phase-reduced: the D56 "last"),
//            HELD_NOT_EXECUTED (no row of it executed the previous week), FIRST (first week after the return steps or the re-establishment),
//            UNEXPLAINED (held after a whole, executed week below the ceiling): a defect;
//  horizon   caps still on at week 15: binding or not there, and the cause of the last binding week;
//  B         a count more than one set above the largest count executed since the break, covered exercises (as the grid);
//  J         the same for every exercise, with whether a cap or the return steps ever covered it (EXT reads the NONE class through it).
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,ROOT=path.resolve(here,'../../..'),CC=path.join(ROOT,'CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const [shard,shards]=(process.env.SHARD??'0/1').split('/').map(Number),EXT=!!process.env.EXT;
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,conv='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention:conv},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const KNOWN=[K('back-squat',4,5,80),K('barbell-rdl',3,6,90),K('db-bench-press',3,8,18,'PER_HAND')];
let N=0;
const intake=(id,{goal,known,days,minutes,experience})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:experience,recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:experience==='NONE'?0:days.length},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:known?KNOWN:[],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,4,6].filter(d=>!days.includes(d)).length===3?[1,4,6]:[1,5,6],strengthDays:days,runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:minutes,longRunDay:6,longRunMinutes:80}});
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`sc-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`sc-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.log.push(`${x.event.kind}@w${x.weekIndex}:${r.status}/${r.action}`);return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.date<=addDays(t.p.weeks[w].startDate,6)).map(s=>obs(t.p,s))}));
const rowsOf=(P,w,id)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.filter(e=>!id||e.id===id).map(e=>({day:s.day,e})));
const capOf=x=>Number.isInteger(x?.regainCap)?['regainCap',x.regainCap]:Number.isInteger(x?.setCap)?['setCap',x.setCap]:null;
const out={probe:'R7A1-SSCTR-r2-CAPS',runtime:'live tree (check the digest)',extension:EXT,shard:`${shard}/${shards}`,timelines:0,skipped:[],
 capWeeks:0,binding:0,causes:{},unexplained:[],horizon:{capsOn:0,bindingThere:0,notBindingThere:0,lastBindingCause:{},examples:[]},B:{violations:0,examples:[]},J:{jumps:0,covered:0,uncovered:0,byExercise:{},examples:[]}};
const push=(arr,x,n=8)=>{if(arr.length<n)arr.push(x);};
const goals=['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT'],grid=[];
if(!EXT){for(const mode of ['reest','ret16mon','ret16thu','ret24'])for(const goal of goals)for(const known of [true,false])for(const days of [[0],[0,3],[0,2,4]])for(const minutes of [20,25,30,40])for(const raise of ['none','after1','after3'])grid.push({mode,goal,known,days,minutes,raise,experience:'INTERMEDIATE'});}
else{for(const mode of ['reest','ret16mon','ret16thu','ret24','retEarly'])for(const goal of goals)for(const experience of ['NONE','NOVICE'])for(const days of [[0],[0,3]])for(const minutes of [20,30,40])for(const raise of ['none','after1'])grid.push({mode,goal,known:false,days,minutes,raise,experience});}
let k=0;
for(const c of grid){
 const {mode,goal,known,days,minutes,raise,experience}=c,id=`sc-${mode}-${goal}-${experience}-${known?'K':'N'}-${days.length}-${minutes}-${raise}`;
 if((k++)%shards!==shard)continue;
 const g=R.generateProgram(intake(id,c),opts);if(!g.program){out.skipped.push(id+':'+g.status+' '+(g.reason??'').slice(0,120));continue;}
 const t={p:g.program,ledger:[],log:[]};out.timelines++;
 let from,reviewDay=null;
 try{
  if(mode==='reest'){for(let w=0;w<7;w++)weekly(t,w,s=>!(s.sport==='STRENGTH'&&w>=2&&w<=6));from=7;}
  else if(mode==='ret16mon'){for(let w=0;w<4;w++)weekly(t,w);weekly(t,4,()=>false);weekly(t,5,()=>false);const d=t.p.weeks[6].startDate;ev(t,at(t.p,6,0,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d,-16),endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));from=6;}
  else if(mode==='ret16thu'){for(let w=0;w<4;w++)weekly(t,w);weekly(t,4,s=>s.day<=2);weekly(t,5,()=>false);const d=addDays(t.p.weeks[6].startDate,3);ev(t,at(t.p,6,3,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d,-16),endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));from=6;reviewDay=3;}
  else if(mode==='ret24'){for(let w=0;w<3;w++)weekly(t,w);weekly(t,3,s=>s.day<=3);weekly(t,4,()=>false);weekly(t,5,()=>false);const d=t.p.weeks[6].startDate;ev(t,at(t.p,6,0,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:24,startDate:addDays(d,-24),endDate:addDays(d,-1),reasonCategory:'VACATION',reason:'Vacation'}}));from=6;}
  // EXT only: an early 16-day return (after two weeks), so a NONE-class athlete returns inside or before its first development block.
  else{for(let w=0;w<2;w++)weekly(t,w);weekly(t,2,()=>false);weekly(t,3,()=>false);const d=t.p.weeks[4].startDate;ev(t,at(t.p,4,0,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d,-16),endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));from=4;}
  const largest={},covered=new Set(),lastCause={};
  for(let w=from;w<15;w++){
   const st=t.p.stateTrace[w].strength.exercises,prev=w>from?t.p.stateTrace[w-1].strength.exercises:null,fromDay=w===from&&reviewDay!==null?reviewDay:0;
   for(const [x,ex] of Object.entries(st))if(capOf(ex)||Number.isInteger(ex.returnStep))covered.add(x);
   for(const x of [...new Set(rowsOf(t.p,w).map(r=>r.e.id))]){
    const rows=rowsOf(t.p,w,x).filter(r=>r.day>=fromDay);if(!rows.length)continue;
    for(const {e} of rows){const L=largest[x];if(Number.isInteger(L)&&e.sets>L+1){const ex={timeline:id,week:w,id:x,sets:e.sets,largestExecutedSinceBreak:L,kind:e.exposure?.kind??null,covered:covered.has(x),phase:t.p.phases.phases[w]};
     out.J.jumps++;out.J[covered.has(x)?'covered':'uncovered']++;out.J.byExercise[x]=(out.J.byExercise[x]??0)+1;push(out.J.examples,ex);if(covered.has(x)){out.B.violations++;push(out.B.examples,ex);}}}
    const c=capOf(st[x]);if(!c||Number.isInteger(st[x].returnStep))continue;
    out.capWeeks++;
    const normal=Math.max(...rows.map(r=>r.e.exposure?.normalSets).filter(Number.isInteger));if(!Number.isFinite(normal)||c[1]>=normal)continue;
    out.binding++;
    let cause;
    const pc=prev?capOf(prev[x]):null,prevRows=rowsOf(t.p,w-1,x).filter(r=>w-1!==from||reviewDay===null||r.day>=reviewDay);
    if(!pc||Number.isInteger(prev[x]?.returnStep)||pc[0]!==c[0])cause='FIRST';
    else if(c[1]>pc[1])cause='RISING';
    else if(c[0]==='setCap'&&Number.isInteger(st[x].setCeiling)&&c[1]>=st[x].setCeiling)cause='AT_CEILING';
    else if(!prevRows.length)cause='HELD_NOT_EXECUTED';
    else{const last=prevRows.at(-1).e,base=last.exposure?.baseSets,phased=last.exposure?.phasedSets;
     if(Number.isInteger(base)&&last.sets<phased)cause='HELD_LAST_TRIMMED';
     else if(Number.isInteger(base)&&phased<base)cause='HELD_LAST_PHASED';
     else{cause='UNEXPLAINED';push(out.unexplained,{timeline:id,week:w,id:x,cap:c,prevCap:pc,ceiling:st[x].setCeiling??null,normal,prevRows:prevRows.map(r=>`d${r.day}:${r.e.sets}/${r.e.exposure?.phasedSets}/${r.e.exposure?.baseSets}/${r.e.exposure?.normalSets}`)},12);}}
    out.causes[cause]=(out.causes[cause]??0)+1;lastCause[x]=cause;
   }
   weekly(t,w,s=>s.day>=fromDay);
   if((raise==='after1'&&w===from+1)||(raise==='after3'&&w===from+3))ev(t,at(t.p,w,6,'22:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}}));
   for(const {day,e} of rowsOf(t.p,w))if(day>=fromDay)largest[e.id]=Math.max(largest[e.id]??0,e.sets);
  }
  const end=t.p.stateTrace[15]?.strength.exercises??{};
  for(const [x,ex] of Object.entries(end)){const c=capOf(ex);if(!c)continue;out.horizon.capsOn++;
   const rows=rowsOf(t.p,15,x),normal=Math.max(...rows.map(r=>r.e.exposure?.normalSets).filter(Number.isInteger));
   if(Number.isFinite(normal)&&c[1]<normal){out.horizon.bindingThere++;const lc=lastCause[x]??'NONE';out.horizon.lastBindingCause[lc]=(out.horizon.lastBindingCause[lc]??0)+1;push(out.horizon.examples,{timeline:id,id:x,cap:c,ceiling:ex.setCeiling??null,normal,lastCause:lc,rows15:rows.map(r=>`d${r.day}:${r.e.sets}/${r.e.exposure?.phasedSets}/${r.e.exposure?.baseSets}/${r.e.exposure?.normalSets}`)});}
   else out.horizon.notBindingThere++;}
 }catch(err){out.skipped.push(id+':'+String(err?.message??err).slice(0,200)+' after '+t.log.slice(-2).join(','));}
}
console.log(JSON.stringify(out,null,1));
