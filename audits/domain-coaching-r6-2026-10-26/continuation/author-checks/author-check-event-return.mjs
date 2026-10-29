// Author check (round-8 answers, R6-POLICY-5): author material, not evidence. Uses the DEV_TEST_ONLY authority. Run from this folder: node author-check-event-return.mjs
import {generateProgram,evaluateProgram} from '../../../../CoachingCore/src/r6-index.mjs';
import {devAuthority} from '../../../../CoachingCore/r6/fixtures/dev-authority.mjs';
const opts={authority:devAuthority()},E=opts.authority.policy.operational.event;
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const gap=(a,b)=>(Date.parse(b)-Date.parse(a))/864e5;
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
function intake(id,raceWeek,raceDay,extra={}){return {version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:12,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',raceWeek*7+raceDay)}},strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT],...extra},
 schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:50,longRunDay:6,longRunMinutes:90}};}
const review=(p,w,day,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:d+'T21:00:00Z',weekIndex:w,event:{id:`c-${w}-${day}-${x.kind??'W'}-${Math.random()}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),...x};};
const flags=[];let checked=0;
for(const raceWeek of [6,8,10])for(const raceDay of [2,6])for(const [w,days] of [[raceWeek-3,14],[raceWeek-2,14],[raceWeek-4,21],[raceWeek-2,12],[raceWeek-5,35],[raceWeek-3,30]]){
 if(w<1)continue;
 const g=generateProgram(intake(`c-${raceWeek}-${raceDay}-${w}-${days}`,raceWeek,raceDay),opts);if(!g.program){flags.push('noProgram '+g.status);continue;}
 const p=g.program,r=evaluateProgram(p,review(p,w,1,{kind:'RETURN_AFTER_PAUSE',interruption:{days,reasonCategory:'TRAVEL',nonclinical:true}}),opts);
 if(!r.proposal){flags.push(`no proposal ${r.status} ${r.reason}`);continue;}
 const P=r.proposal,race=P.weeks.flatMap(x=>x.sessions).find(s=>s.role==='RACE'),rs=P.stateTrace[P.phases.raceWeek].run;checked++;
 const item=P.negotiation.find(n=>n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING');
 if(!!race.prescription.completion!==!!item)flags.push(`completion ${race.prescription.completion} vs item ${!!item} (mode ${rs.mode})`);
 for(const s of P.weeks.flatMap(x=>x.sessions).filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.date>P.decisions.at(-1).asOf.slice(0,10))){
  const b=gap(s.date,race.date);
  if(b>=1&&b<=E.raceWindowDays&&s.prescription.exercises.some(e=>e.sets>E.raceWeekStrengthSets||e.rir<E.raceWeekStrengthMinimumRir||e.role!=='MAIN'))flags.push(`window strength not light ${s.id} ${s.prescription.exercises.map(e=>e.id+':'+e.sets+'@'+e.rir).join(',')}`);
  const taperDays=E.raceWindowDays+7*Math.max(0,P.phases.raceWeek-(P.phases.taperStart??P.phases.raceWeek));
  if(b>E.raceWindowDays&&b<=taperDays&&s.prescription.exercises.some(e=>e.rir<3))flags.push(`taper strength RIR<3 ${s.id}`);
 }
 if(raceWeek===8&&raceDay===6&&days>=30&&!globalThis.shown){globalThis.shown=1;console.log('LONG-return item:',item?.detail,'| basis',item?.basis);}
 if(raceWeek===8&&raceDay===6&&days===14&&w===raceWeek-2&&!globalThis.shown2){globalThis.shown2=1;console.log('MODERATE-return item:',item?.detail,'| mode at race',rs.mode);}
}
console.log('checked',checked,'flags',flags.length);console.log(flags.slice(0,20).join('\n'));
