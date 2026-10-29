// Author check (round-9 answers, D50): author material, not evidence. Uses the DEV_TEST_ONLY authority. Run from this folder: node author-check-one-increase.mjs
import {generateProgram} from '../../../../CoachingCore/src/r6-index.mjs';
import {simulateProgram} from '../../../../CoachingCore/src/r6-simulator.mjs';
import {devAuthority} from '../../../../CoachingCore/r6/fixtures/dev-authority.mjs';
const opts={authority:devAuthority()};
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
function intake({id,weeks=16,athlete={},schedule={}}){return {version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[],...athlete},schedule:{runDays:[1,3,6],strengthDays:[2,4],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:45,longRunDay:6,longRunMinutes:100,...schedule}};}
const profile=(id,W,Lg,days,goal={run:'REGULAR',strength:'GENERAL'},exp='INTERMEDIATE')=>intake({id,athlete:{goals:goal,runExperience:exp,recent:{runDaysPerWeek:days.length,runMinutesPerWeek:W,longestRunMinutes:Lg,strengthDaysPerWeek:2}},schedule:{runDays:days,strengthDays:[2,5].filter(d=>!days.includes(d)).concat([3,0]).filter((d,i,a)=>!days.includes(d)&&a.indexOf(d)===i).slice(0,2),longRunDay:days.at(-1)}});
const BUILD=['DEVELOPMENT','BUILD','NEXT_BLOCK','SPECIFIC'];
const flags=[];let pairs=0,programs=0,heldWeeks=0,stepAfterHeld=0;
function check(id,P){
 programs++;
 const wk=P.weeks.map(w=>({phase:w.phase,long:w.sessions.find(s=>s.role==='LONG'&&s.prescription)?.prescription.durationMinutes??null,easy:w.sessions.filter(s=>s.role==='EASY'&&s.prescription).map(s=>s.prescription.durationMinutes).sort((a,b)=>a-b),q:w.sessions.find(s=>s.role==='QUALITY'&&s.prescription)?.progression?.value??null,held:w.sessions.some(s=>s.progression?.heldBy==='LONG_RUN_SHARE')}));
 for(let i=1;i<wk.length;i++){
  const a=wk[i-1],b=wk[i];if(!BUILD.includes(a.phase)||!BUILD.includes(b.phase))continue;pairs++;
  if(a.held)heldWeeks++;
  const longUp=a.long!==null&&b.long!==null&&b.long>a.long,easyUp=b.easy.length===a.easy.length&&b.easy.some((x,j)=>x>a.easy[j]),qUp=a.q!==null&&b.q!==null&&b.q>a.q;
  if(a.held&&(easyUp||qUp))stepAfterHeld++;
  if(longUp&&a.long<50&&(easyUp||qUp))flags.push(`${id} w${i}: long ${a.long}->${b.long} with ${easyUp?'easy '+a.easy+'->'+b.easy:''}${qUp?' quality '+a.q+'->'+b.q:''}`);
 }
}
for(const W of [30,45,60,75,90,120,150])for(const Lg of [15,25,35,45,60])for(const days of [[1,3,6],[0,2,4,6]]){if(Lg>W)continue;const id=`S-${W}-${Lg}-${days.length}`,g=generateProgram(profile(id,W,Lg,days),opts);if(g.program)check(id,g.program);}
for(const [W,Lg] of [[45,25],[60,35],[90,45]]){const id=`10K-${W}-${Lg}`,g=generateProgram(profile(id,W,Lg,[1,3,6],{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}},strength:'RUNNING_SUPPORT'}),opts);if(g.program)check(id,g.program);}
for(const [W,Lg] of [[90,40],[120,50],[150,60]]){const id=`Q-${W}-${Lg}`,g=generateProgram(profile(id,W,Lg,[1,3,6],{run:'PERFORMANCE',strength:'GENERAL'},'EXPERIENCED'),opts);if(g.program)check(id,g.program);}
for(const [W,Lg] of [[45,25],[60,35]]){const sim=simulateProgram(profile(`SIM-${W}-${Lg}`,W,Lg,[1,3,6]),{},opts);if(sim.finalProgram)check(`SIM-${W}-${Lg}`,sim.finalProgram);}
console.log('programs',programs,'build pairs',pairs,'held weeks',heldWeeks,'easy/quality steps after a held week',stepAfterHeld,'| two increases under 50:',flags.length);console.log(flags.slice(0,12).join('\n'));
