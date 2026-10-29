// Author check for D52 (dev authority, read-only). How often a generated program plans a later session of a week with a from-log row
// for an exercise first set up by an establishment row earlier in that week, the row that points to a log a missed first session
// never wrote. Author material, not evidence.
// Run from this folder: node author-check-same-week.mjs [file URL of a CoachingCore copy; default: the current runtime]
const base=process.argv[2]??new URL('../../../../CoachingCore',import.meta.url).href;
const {generateProgram}=await import(base+'/src/r6-index.mjs');
const {devAuthority}=await import(base+'/r6/fixtures/dev-authority.mjs');
const opts={authority:devAuthority()};
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
let programs=0,twice=0,establishThenFromLog=0;const examples=[];
for(const sd of [[0,4],[1,3,5],[0,2,4],[1,4],[2,5],[0,3,5],[1,2,4,6]])for(const goal of ['STRENGTH','HYPERTROPHY','GENERAL','RUNNING_SUPPORT'])for(const exp of ['NONE','NOVICE','INTERMEDIATE'])for(const known of [[],[SQUAT]])for(const pref of ['FIXED','EVERY_2_WEEKS','COACH_DECIDES'])for(const mins of [30,45,60]){
 const runDays=[0,1,2,3,4,5,6].filter(d=>!sd.includes(d)).slice(0,3);
 const input={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:12,learningConsent:true,athlete:{id:`sw-${sd}-${goal}-${exp}-${known.length}-${pref}-${mins}`,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'REGULAR',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:exp,recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:sd.length},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:known,exerciseRotationPreference:pref},schedule:{runDays,strengthDays:sd,runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:mins,longRunDay:runDays.at(-1),longRunMinutes:80}};
 const g=generateProgram(input,opts);if(!g.program)continue;programs++;
 for(const w of g.program.weeks){const seen={};for(const s of w.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription))for(const e of s.prescription.exercises)(seen[e.id]??=[]).push({day:s.day,mode:e.load.mode,sets:e.sets});
  for(const [id,l] of Object.entries(seen)){if(l.length<2)continue;twice++;if(l[0].mode==='ESTABLISH'&&l.slice(1).some(x=>x.mode==='FROM_LOG')){establishThenFromLog++;if(examples.length<4)examples.push(`${input.athlete.id} w${w.index} ${id}: ${l.map(x=>`day ${x.day} ${x.mode} ${x.sets} sets`).join(', ')}`);}}}
}
console.log(JSON.stringify({runtime:base.split('/').slice(-2).join('/'),programs,exerciseWeeksWithTwoOrMoreExposures:twice,establishmentThenFromLogSameWeek:establishThenFromLog,examples},null,1));
