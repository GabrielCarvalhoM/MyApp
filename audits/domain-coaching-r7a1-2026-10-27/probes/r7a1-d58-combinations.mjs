// DOMAIN_COACHING_R7-A.1 D58 under the week's other adaptations (author probe, A2). A short return reported with each same-week adaptation
// (systemic or local fatigue, an unavailable later day, a missed key session, an event-period conflict) in both orders, and alone, on Monday
// morning (05:00, 06:00) and on each evening from Tuesday to Sunday (20:00, 21:00), then the weekly review. Checked after the pair: no quality
// run is left in the week after the report, and at most one slot is easy in that week and the next two. Checked after the review: exactly one
// slot is easy, and the first quality slot run after the report (that week or the next two; a skipped session is not run) is that slot.
// It shares the programs and changes of r7a1-handler-grid-midweek.mjs. RT=freeze2 runs the R7A-FREEZE-2 snapshot. Synthetic data,
// DEV_TEST_ONLY authority, read-only runtime use, prints only.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,tag=process.env.RT==='freeze2'?'R7A-FREEZE-2':'CURRENT';
const CC=tag==='CURRENT'?path.resolve(here,'../../../CoachingCore'):path.join(here,'../freeze2-source/CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const intake=(id,athlete={},schedule={})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}:00:00Z`,weekIndex:w,event:{id:`gm-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`gm-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,review)=>{const r=R.evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r.status+'/'+r.action;};
const start=(id,athlete,schedule,weeks)=>{const t={p:R.generateProgram(intake(id,athlete,schedule),opts).program,ledger:[]};for(let w=0;w<weeks;w++)ev(t,at(t.p,w,6,'21',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(t.p,s))}));return t;};
const line=(P,w)=>P.weeks[w].sessions.map(s=>`d${s.day}${s.turn??''} ${s.sport} ${s.role}${s.status==='SKIPPED'?' SKIPPED':''} ${s.prescription?(s.sport==='STRENGTH'?s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.rir}/${e.load.mode}${e.load.value??''}`).join(','):`${s.prescription.family}:${s.prescription.durationMinutes}`):'-'}`).join('\n');
const next=(P,w)=>{const {anchor,...st}=P.stateTrace[w+1];return JSON.stringify(st);};
const RACE={kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}};
// The earlier weeks are reported as prescribed; this week's sessions are unreported unless a change reports them.
const programs={race:()=>start('gm-race',{goals:{run:RACE,strength:'STRENGTH'}},{strengthDays:[0,3]},6),plain:()=>start('gm-plain',{},{},3)};
const W={race:6,plain:3},DAYS=[1,2,3,4,5,6];
const changes=(p,w,isRace,day)=>{const d0=p.weeks[w].startDate,dd=addDays(d0,day),wk=p.weeks[w].sessions;
 const late=wk.find(s=>s.prescription&&s.day>day)??wk.filter(s=>s.prescription).at(-1),key=wk.find(s=>s.prescription&&s.sport==='RUN'&&s.role==='QUALITY'&&s.day<=day)??wk.find(s=>s.prescription&&s.sport==='STRENGTH'&&s.day<day);
 const past=wk.filter(s=>s.prescription&&s.day<day&&s.id!==key?.id);
 return {
 SYSTEMIC_FATIGUE:{kind:'SYSTEMIC_FATIGUE'},LOCAL_FATIGUE:{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}},
 UNAVAILABLE_LATE:{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[late.date]}},
 EQUIPMENT_WINDOW:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:dd,to:addDays(d0,13)}},EQUIPMENT_PERMANENT:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}},
 SCHEDULE_NEXT:{kind:'SCHEDULE_CHANGE',changes:{runDays:[0,3,6],longRunDay:6}},SCHEDULE_MINUTES:{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:30}},
 GOAL_NEXT:{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}},
 RETURN_MODERATE:{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(dd,-16),endDate:addDays(dd,-1),reasonCategory:'TRAVEL',reason:'Work travel'}},
 RETURN_SHORT:{kind:'RETURN_AFTER_PAUSE',interruption:{days:5,startDate:addDays(dd,-5),endDate:addDays(dd,-1),reasonCategory:'TRAVEL',reason:'Work travel'}},
 ...(key?{MISSED_KEY:{kind:'MISSED_SESSION',targetSessionId:key.id}}:{}),
 PARTIAL_REPORTS:{kind:'PARTIAL_SESSION',observations:past.map(s=>obs(p,s))},
 WEEKLY_REPORTS:{kind:'WEEKLY_REVIEW',observations:past.map(s=>obs(p,s))},
 ...(isRace?{EVENT_REACHING:{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(d0,9)}},EVENT_LATER:{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(p.goal.run.event.date,14)}},EVENT_WEEK_CONFLICT:{kind:'EVENT_WEEK_CONFLICT',changes:{unavailableDates:[late.date]}}}:{})};};
const EASY=/short break runs easy/,PARTNERS=['SYSTEMIC_FATIGUE','LOCAL_FATIGUE','UNAVAILABLE_LATE','MISSED_KEY','EVENT_WEEK_CONFLICT',null];
const clocks=[[0,'05','06'],...DAYS.map(d=>[d,'20','21'])];
const out={probe:'R7A1-D58-COMBINATIONS-1',runtime:tag,cases:0,returnNotApplied:[],checked:{afterPair:0,afterReview:0},defects:[],errors:[]};
for(const [name,make] of Object.entries(programs)){
 const t=make(),w=W[name];
 for(const [day,h1,h2] of clocks){
  const C=changes(t.p,w,name==='race',day),hour=Number(h2),ahead=s=>s.day>day||s.day===day&&!(s.turn==='AM'&&hour>=12);
  const easy=P=>P.weeks.slice(w,w+3).flatMap(k=>k.sessions.filter(s=>EASY.test(s.explanation??'')).map(s=>s.id));
  for(const x of PARTNERS){
   if(x&&!C[x])continue;
   for(const order of x?[0,1]:[0]){
    out.cases++;const seq=x?(order?[x,'RETURN_SHORT']:['RETURN_SHORT',x]):['RETURN_SHORT'],label={program:name,day,sequence:seq.join(' then ')};
    try{
     const T={p:t.p,ledger:t.ledger},log=seq.map((k,i)=>ev(T,at(T.p,w,day,i?h2:h1,C[k])));label.log=log;
     if(log[seq.indexOf('RETURN_SHORT')]!=='MODIFY/REESTABLISH'){out.returnNotApplied.push(label);continue;}
     const bad=[];
     if(T.p.weeks[w].sessions.some(s=>s.prescription&&s.status!=='SKIPPED'&&s.sport==='RUN'&&s.role==='QUALITY'&&ahead(s)))bad.push('a quality run is left in the week after the short return');
     if(easy(T.p).length>1)bad.push('more than one easy slot after the pair: '+easy(T.p).join(', '));
     out.checked.afterPair++;
     ev(T,at(T.p,w,6,'22',{kind:'WEEKLY_REVIEW',observations:T.p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&ahead(s)).map(s=>obs(T.p,s))}));
     out.checked.afterReview++;
     const slots=easy(T.p);if(slots.length!==1)bad.push(slots.length+' easy slots after the review'+(slots.length?': '+slots.join(', '):''));
     let first=null;for(let k=w;k<w+3&&!first;k++)first=T.p.weeks[k].sessions.find(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED'&&(k>w||ahead(s))&&(s.role==='QUALITY'||EASY.test(s.explanation??'')))??null;
     if(!first||!EASY.test(first.explanation??''))bad.push('the first quality slot run after the report is not the easy slot: '+(first?first.id+' '+first.role:'none'));
     if(bad.length)out.defects.push({...label,bad,week:line(T.p,w).split('\n'),nextWeek:line(T.p,w+1).split('\n')});
    }catch(e){out.errors.push({...label,error:String(e?.stack??e).slice(0,400)});}
   }
  }
 }
}
console.log(JSON.stringify(out,null,1));
