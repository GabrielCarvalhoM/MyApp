// V1CP evidence: F08 reductions and returns on the Founder's synthetic athlete (stated facts only), end to end through the public entry points.
// It never writes under the repository unless an output path is given. Usage: node f08-scenarios.mjs <candidateRoot> [outJson]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const root=process.argv[2],out=process.argv[3];
const {generateProgram,evaluateProgram,restartProgram}=await import(pathToFileURL(path.join(root,'CoachingCore/src/r6-index.mjs')).href);
const F=await import(pathToFileURL(path.join(root,'CoachingCore/src/v1-f08.mjs')).href);
const ELIG=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
// The Founder's synthetic athlete (CoachingCore/test/v1cp-experience.test.mjs FOUNDER_ATHLETE), with the training months stated (E1).
const ATHLETE=()=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-08',startDate:'2026-11-09',timezoneOffsetMinutes:-180,
 athlete:{id:'ath-founder-synthetic',ageYears:30,sex:'M',heightCm:170,weightKg:70,eligibility:ELIG('2026-11-08'),goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},runTrainingMonths:10,strengthTrainingMonths:10,
  performanceAnchors:[{sport:'RUN',kind:'BEST_RESULT',distanceKm:5,time:'30:36'},{sport:'RUN',kind:'BEST_RESULT',distanceKm:10,time:'1:18:00'}],
  knownExercises:[{id:'back-squat',load:{value:20,unit:'KG',convention:'PLATES'}},{id:'bench-press',load:{value:15,unit:'KG',convention:'PLATES'}}]},
 schedule:{runDays:[1,3,5],strengthDays:[0,2,4],runTurn:'PM',strengthTurn:'PM',runMinutes:45,strengthMinutes:60,longRunDay:5}});
const add=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
const NO=c=>Object.fromEntries(F.signsFor(c).map(k=>[k,false])),XNO=c=>Object.fromEntries(F.exerciseSignsFor(c).map(k=>[k,false]));
const RNO=()=>Object.fromEntries(F.READINESS_SIGNS.map(k=>[k,false])),S6=()=>({warningSigns:Object.fromEntries(F.READINESS_SIGNS.slice(0,9).map(k=>[k,false])),exerciseResponse:Object.fromEntries(Object.values(F.EXERCISE_SIGNS).map(k=>[k,false]))});
function done(p,w){return p.weeks[w].sessions.filter(live).map(s=>{const x=s.prescription,actual={completed:true,minutes:x.durationMinutes};
 if(x.modality==='STRENGTH')actual.exercises=x.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir,...(e.load.mode==='BODYWEIGHT'?{load:{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}}:{})}))}));
 return {eventId:`done-${s.id}`,athleteId:p.athleteId,sessionId:s.id,actual,response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},occurrenceDate:s.date};});}
function week(p,w){
 const s=p.weeks[w].sessions.filter(x=>x.sport),rung=(p.weeks[w].adaptations??[]).filter(a=>a.kind==='WELLBEING_REDUCTION').map(a=>`${a.phase}${a.rungs?':'+Object.entries(a.rungs).map(([k,v])=>k[0]+v).join('/'):''}`).join(' ');
 return {week:w,phase:p.weeks[w].phase,marks:rung||null,run:s.filter(x=>x.sport==='RUN').map(x=>live(x)?`${x.role} ${x.prescription.durationMinutes}min`:'rest').join(', '),strength:s.filter(x=>x.sport==='STRENGTH').map(x=>live(x)?`${x.prescription.exercises.length} ex, ${Math.max(...x.prescription.exercises.map(e=>e.sets))} sets max @RIR≥${Math.min(...x.prescription.exercises.map(e=>e.rir))}`:'rest').join(' | ')};
}
function timeline(name){
 const t={name,p:generateProgram(ATHLETE()).program,ledger:[],ref:null,n:0,steps:[]};
 t.step=(w,d,kind,extra={},time='20:00')=>{const day=add(t.p.startDate,w*7+d);const r=evaluateProgram(t.p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T${time}:00-03:00`,weekIndex:w,event:{id:`${name}-${++t.n}`,kind},eligibility:ELIG(day),observations:extra.observations??[],...(extra.wellbeing?{wellbeing:extra.wellbeing}:{}),...(extra.check?{wellbeingCheck:extra.check}:{}),...(extra.readiness?{readiness:extra.readiness}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})});
  t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;t.steps.push({day,event:kind,status:r.status,action:r.action,reason:String(r.reason).slice(0,420),...(r.missingInputs?.length?{missing:r.missingInputs}:{}),next:w+1<t.p.weeks.length?week(t.p,w+1):null});return r;};
 return t;
}
const scenarios=[];
{ // A: a mild cold, rest for five days, balanced return; every week done as planned.
 const t=timeline('A-cold'),c='MILD_ILLNESS';t.step(0,6,'WEEKLY_REVIEW',{observations:done(t.p,0)});
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:c,warningSigns:NO(c),intent:'REST',days:5}},'08:00');
 t.step(1,6,'WEEKLY_REVIEW',{observations:done(t.p,1),check:{warningSigns:NO(c),exerciseResponse:XNO(c),improved:true}});
 for(let w=2;w<6;w++)t.step(w,6,'WEEKLY_REVIEW',{observations:done(t.p,w),check:{warningSigns:NO(c),exerciseResponse:XNO(c)}});
 scenarios.push({id:'A',title:'Mild cold: 5 days of rest, balanced return',steps:t.steps});
}
{ // B: a minor knee discomfort, lower body, both sports, easier for 4 days, faster return; the first return week is not all done.
 const t=timeline('B-knee'),c='MINOR_DISCOMFORT';t.step(0,6,'WEEKLY_REVIEW',{observations:done(t.p,0)});
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:c,region:'LOWER_BODY',warningSigns:NO(c),intent:'REDUCE_LIGHT',days:4,returnSpeed:'FASTER'}},'08:00');
 t.step(1,6,'WEEKLY_REVIEW',{observations:done(t.p,1),check:{warningSigns:NO(c),exerciseResponse:XNO(c),improved:true}});
 const missed=t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='RUN').id;
 t.step(2,6,'WEEKLY_REVIEW',{observations:done(t.p,2).filter(o=>o.sessionId!==missed),check:{warningSigns:NO(c),exerciseResponse:XNO(c)}});
 t.step(3,6,'WEEKLY_REVIEW',{observations:done(t.p,3),check:{warningSigns:NO(c),exerciseResponse:XNO(c)}});
 scenarios.push({id:'B',title:'Knee discomfort: easier for 4 days, faster return, one return week not all done',steps:t.steps});
}
{ // C: not better at the window's end: the clinical hold, then the athlete's readiness declaration and a conservative sporting restart.
 const t=timeline('C-hold'),c='MILD_ILLNESS';t.step(0,6,'WEEKLY_REVIEW',{observations:done(t.p,0)});
 t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:c,warningSigns:NO(c),intent:'REST',days:5}},'08:00');
 t.step(1,6,'WEEKLY_REVIEW',{observations:done(t.p,1),check:{warningSigns:NO(c),exerciseResponse:XNO(c),improved:false}});
 t.step(2,3,'WEEKLY_REVIEW');
 t.step(3,1,'READINESS_DECLARATION',{readiness:{declaredRecovered:true,warningSigns:RNO(),sports:{RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}}},'08:00');
 t.step(3,6,'WEEKLY_REVIEW',{observations:done(t.p,3),check:S6()});
 t.step(4,6,'WEEKLY_REVIEW',{observations:done(t.p,4),check:S6()});
 scenarios.push({id:'C',title:'Not better after 5 days: assessment path, then the readiness declaration and the restart',steps:t.steps});
}
{ // D: three weeks of travel with nothing done; a new plan from the record.
 const t=timeline('D-travel');t.step(0,6,'WEEKLY_REVIEW',{observations:done(t.p,0)});
 const day=add(t.p.startDate,28),i=ATHLETE();i.asOf=day;i.startDate=add(day,1);i.athlete.eligibility=ELIG(day);i.athlete.pause={reasonCategory:'TRAVEL',nonclinical:true};
 const g=restartProgram({intake:i,record:t.ledger,referenceState:t.ref});
 scenarios.push({id:'D',title:'Three weeks of travel: a new plan from the record',result:{status:g.status,reason:String(g.reason??'').slice(0,300),runClass:g.program?.capability.run.class,pauseDaysBySport:g.program?.canonical.athlete.pause?.bySportDays,firstWeek:g.program?week(g.program,0):null,recordKept:g.restart?.carriedRecord?.length===t.ledger.length}});
}
const result={generatedWith:'f08-scenarios.mjs',athlete:'Founder synthetic athlete (stated facts) with training months',scenarios};
if(out)fs.writeFileSync(out,JSON.stringify(result,null,1));
for(const s of scenarios){console.log('\n==',s.id,s.title);for(const x of s.steps??[])console.log(` ${x.day} ${x.event}: ${x.status} ${x.action}${x.missing?' missing '+x.missing.join(','):''}\n   next: ${x.next?`w${x.next.week} ${x.next.phase} [${x.next.marks??'-'}] run ${x.next.run} | strength ${x.next.strength}`:'-'}`);if(s.result)console.log(' ',JSON.stringify(s.result));}
