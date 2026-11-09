// Shared V1CP fixtures (not a test file): the 8-week hybrid athlete and the reports of a conforming client for every session before a week.
const ELIG=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
export const HYBRID=(coaching)=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-07',startDate:'2026-11-09',weeks:8,timezoneOffsetMinutes:-180,
 athlete:{ageEligible:true,eligibility:ELIG('2026-11-07'),id:'ath-v1cp-hybrid',runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},goals:{run:'REGULAR',strength:'HYPERTROPHY'},equipment:['BODYWEIGHT','DUMBBELLS','BENCH'],...(coaching!==undefined?{coaching}:{})},
 schedule:{runDays:[1,3,5],strengthDays:[0,4],runMinutes:45,strengthMinutes:50,longRunDay:5,longRunMinutes:60}});
export const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
/** Reports of every live session before week w, done as prescribed (a conforming client's report), so no unreported-training question applies. */
export const doneBefore=(p,w)=>p.weeks.slice(0,w).flatMap(x=>x.sessions.filter(live)).map(s=>{const x=s.prescription,actual={completed:true,minutes:x.durationMinutes};
 if(x.modality==='STRENGTH')actual.exercises=x.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(e.load.mode==='BODYWEIGHT'?{load:{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}}:{}),...(Number.isFinite(e.rir)?{rir:e.rir}:{})}))}));
 return {eventId:`v1cp-done-${s.id}`,athleteId:p.athleteId,sessionId:s.id,actual,response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},occurrenceDate:s.date};});
