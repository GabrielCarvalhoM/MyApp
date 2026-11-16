// GAP-S8 sweep (read-only): 5 equipment profiles x 4 strength goals x 2/3/4 days x 0/24 months, 12 weeks each, on v1-run-index.mjs with no options.
// Prints, per profile, the push/pull planes never selected over the 12 weeks. Run from the repository root:
// node audits/v1-strength-intelligence-2026-11-13/sweep-planes.mjs
import * as X from '../../CoachingCore/src/v1-run-index.mjs';
import {configurationOf} from '../../CoachingCore/src/r7b-repertoire.mjs';
const AS_OF='2026-11-13',ELIG={status:'NONCLINICAL_CONFIRMED',assessedAt:AS_OF,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false};
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const profiles={FULL,DB_BENCH:['DUMBBELLS','BENCH'],DB:['DUMBBELLS'],BW:[],MACH_DB:['DUMBBELLS','BENCH','MACHINES']};
for(const [pn,eq] of Object.entries(profiles))for(const goal of ['GENERAL','HYPERTROPHY','STRENGTH','RUNNING_SUPPORT'])for(const days of [[1,4],[1,3,5],[0,2,4,6]])for(const months of [0,24]){
 const r=X.generateProgram({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:AS_OF,startDate:'2026-11-16',weeks:12,athlete:{id:'v',ageYears:30,eligibility:ELIG,strengthTrainingMonths:months,runTrainingMonths:0,goals:{run:'NONE',strength:goal},equipment:eq,recent:{strengthDaysPerWeek:days.length},exerciseRotationPreference:'COACH_DECIDES'},schedule:{strengthDays:days,strengthMinutes:60}});
 if(!r.program){console.log(pn,goal,days.length,months,'NO PROGRAM',r.status);continue;}
 const ids=new Set(r.program.weeks.flatMap(w=>w.sessions.filter(s=>s.prescription&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))));
 const subs=new Set([...ids].map(id=>configurationOf(id)?.subpattern));
 const missing=['VERTICAL_PUSH','VERTICAL_PULL','HORIZONTAL_PUSH','HORIZONTAL_PULL'].filter(x=>!subs.has(x));
 if(missing.length)console.log(pn.padEnd(8),goal.padEnd(16),days.length,'d',months,'mo  missing over 12 weeks:',missing.join(','));
}
console.log('done');
