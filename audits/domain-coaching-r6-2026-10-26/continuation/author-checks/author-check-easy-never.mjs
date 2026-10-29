// Author check (round-9 answers, D50): author material, not evidence. Uses the DEV_TEST_ONLY authority. Run from this folder: node author-check-easy-never.mjs
import {generateProgram} from '../../../../CoachingCore/src/r6-index.mjs';
import {devAuthority} from '../../../../CoachingCore/r6/fixtures/dev-authority.mjs';
const opts={authority:devAuthority()};
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
function intake({id,weeks=16,athlete={},schedule={}}){return {version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[],...athlete},schedule:{runDays:[1,3,6],strengthDays:[2,4],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:45,longRunDay:6,longRunMinutes:100,...schedule}};}
const profile=(id,W,Lg,days)=>intake({id,athlete:{recent:{runDaysPerWeek:days.length,runMinutesPerWeek:W,longestRunMinutes:Lg,strengthDaysPerWeek:2}},schedule:{runDays:days,strengthDays:[2,5].filter(d=>!days.includes(d)).concat([3,0]).filter((d,i,a)=>!days.includes(d)&&a.indexOf(d)===i).slice(0,2),longRunDay:days.at(-1)}});
for(const W of [30,45,60,75,90,120,150])for(const Lg of [15,25,35,45,60])for(const days of [[1,3,6],[0,2,4,6]]){
 if(Lg>W)continue;const id=`S-${W}-${Lg}-${days.length}`,g=generateProgram(profile(id,W,Lg,days),opts);if(!g.program)continue;
 const P=g.program,st=P.stateTrace,first=st.find(x=>x.run.mode==='EASY')?.run.easy;
 if(!st.every(s=>s.run.mode!=='EASY'||s.run.easy===first))continue;
 const target=P.weeks.map(w=>w.sessions.find(s=>s.role==='LONG')?.prescription?.durationMinutes??'-');
 console.log(id,P.capability.run.class,'easy',first,'walks',st[0].run.walks,'nEasy',st[0].run.nEasy,'| long',target.join(','),'| easyExtra',st.map(s=>s.run.easyExtra??0).join(''),'| E',P.weeks.map(w=>Math.max(0,...w.sessions.filter(s=>s.role==='EASY').map(s=>s.prescription.durationMinutes))).join(','));
}
