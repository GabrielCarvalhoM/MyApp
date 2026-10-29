// Author check (round-8 answers, R6-POLICY-5): author material, not evidence. Uses the DEV_TEST_ONLY authority. Run from this folder: node author-check-restart-taper.mjs
import {generateProgram,evaluateProgram} from '../../../../CoachingCore/src/r6-index.mjs';
import {devAuthority} from '../../../../CoachingCore/r6/fixtures/dev-authority.mjs';
const opts={authority:devAuthority()};
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
function intake(id,raceWeek,kind){return {version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:{kind:'RACE',event:{kind,date:addDays('2026-11-02',raceWeek*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'EXPERIENCED',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:4,runMinutesPerWeek:240,longestRunMinutes:90,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH'],knownExercises:[]},
 schedule:{runDays:[1,3,4,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:45,longRunDay:6,longRunMinutes:120}};}
const review=(p,w,day,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:d+'T21:00:00Z',weekIndex:w,event:{id:`rt-${w}-${day}-${Math.random()}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),...x};};
for(const kind of ['10K','HALF_MARATHON'])for(const [raceWeek,w,days] of [[12,5,35],[13,4,42],[14,6,30]]){
 const p=generateProgram(intake(`rt-${kind}-${raceWeek}-${w}`,raceWeek,kind),opts).program;
 const r=evaluateProgram(p,review(p,w,1,{kind:'RETURN_AFTER_PAUSE',interruption:{days,reasonCategory:'WORK',nonclinical:true}}),opts),P=r.proposal;
 if(!P){console.log(kind,raceWeek,'no proposal',r.status);continue;}
 const from=P.decisions.at(-1).fromWeek,race=P.weeks.flatMap(x=>x.sessions).find(s=>s.role==='RACE');
 const rows=P.weeks.slice(from).map(wk=>wk.index+':'+wk.phase+':'+P.stateTrace[wk.index].run.mode+'['+wk.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.role!=='RACE').map(s=>s.role[0]+s.prescription.durationMinutes).join(' ')+']');
 const rs=P.stateTrace[P.phases.raceWeek].run;
 console.log(kind,'race wk',P.phases.raceWeek,'achieved',JSON.stringify(rs.achieved),'longestContinuous',rs.longestContinuous,'completion',race.prescription.completion);
 console.log('  ',rows.join(' | '));
}
