// V1 Coaching Productization, Blocks 3 and 4: the athlete's coaching choices (coach profile; volume and difficulty per sport).
//   P0 (plumbing): the default path carries no `coaching` key, so its canonical intake and program are the reviewed runtime's; stated choices are
//       canonical, an explicit default changes no session, a value outside the vocabulary is an input error; a PREFERENCE_CHANGE review re-plans
//       only the weeks after this one from the current state, keeps every executed and earlier session and the decision log append-only, keeps
//       when the same choices come again, asks for unusable values, and keeps the weeks in the program's last week.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const ROOT=path.resolve(process.env.V1CP_ROOT??path.resolve(import.meta.dirname,'../..'));
const {generateProgram,evaluateProgram,canonicalizeIntake}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-index.mjs')).href);
const {hash}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/value.mjs')).href);
const ELIG=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
export const HYBRID=(coaching)=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-07',startDate:'2026-11-09',weeks:8,timezoneOffsetMinutes:-180,
 athlete:{ageEligible:true,eligibility:ELIG('2026-11-07'),id:'ath-v1cp-hybrid',runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},goals:{run:'REGULAR',strength:'HYPERTROPHY'},equipment:['BODYWEIGHT','DUMBBELLS','BENCH'],...(coaching!==undefined?{coaching}:{})},
 schedule:{runDays:[1,3,5],strengthDays:[0,4],runMinutes:45,strengthMinutes:50,longRunDay:5,longRunMinutes:60}});
const review=(p,w,d,kind,extra={})=>{const day=addDays(p.startDate,w*7+d);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T19:00:00-03:00`,weekIndex:w,event:{id:`v1cp-c-${kind}-${w}-${d}`,kind},eligibility:ELIG(day),observations:[],...extra};};
const sessionsOf=p=>p.weeks.map(w=>w.sessions.map(s=>[s.id,s.status??'PLANNED',hash(s.prescription??null)]));
const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
/** Reports of every live session before week w, done as prescribed (a conforming client's report), so no unreported-training question applies. */
export const doneBefore=(p,w)=>p.weeks.slice(0,w).flatMap(x=>x.sessions.filter(live)).map(s=>{const x=s.prescription,actual={completed:true,minutes:x.durationMinutes};
 if(x.modality==='STRENGTH')actual.exercises=x.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(e.load.mode==='BODYWEIGHT'?{load:{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}}:{}),...(Number.isFinite(e.rir)?{rir:e.rir}:{})}))}));
 return {eventId:`v1cp-done-${s.id}`,athleteId:p.athleteId,sessionId:s.id,actual,response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},occurrenceDate:s.date};});

test('P0-1: the default path carries no coaching key; an explicit default changes no session; stated choices are canonical; bad values are errors',()=>{
 const g0=generateProgram(HYBRID());assert.equal(g0.status,'PROPOSED');assert.ok(!('coaching' in g0.program.canonical));
 const gd=generateProgram(HYBRID({profile:'BALANCED',volume:'STANDARD',difficulty:'STANDARD'}));
 assert.deepEqual(sessionsOf(gd.program),sessionsOf(g0.program),'explicit defaults are the default plan');
 const c=canonicalizeIntake(HYBRID({profile:'conservative',volume:{strength:'lower'},difficulty:{run:'higher'}})).canonical.coaching;
 assert.deepEqual(c,{profile:'CONSERVATIVE',volume:{RUN:'STANDARD',STRENGTH:'LOWER'},difficulty:{RUN:'HIGHER',STRENGTH:'STANDARD'}});
 for(const [bad,err] of [[{profile:'EXTREME'},'coaching.profile'],[{volume:'MAX'},'coaching.volume'],[{difficulty:{swim:'LOWER'}},'coaching.difficulty.swim'],[{tempo:'FAST'},'coaching.tempo']]){
  const x=canonicalizeIntake(HYBRID(bad));assert.equal(x.status,'INVALID_INPUT',JSON.stringify(bad));assert.ok(x.errors.includes(err),JSON.stringify(x.errors));
 }
});

test('P0-2: a preference change re-plans only the weeks after this one, from the current state; history and the decision log stay',()=>{
 const p=generateProgram(HYBRID()).program,r=evaluateProgram(p,review(p,1,2,'PREFERENCE_CHANGE',{changes:{coaching:{profile:'CONSERVATIVE',volume:{strength:'LOWER'}}}}));
 assert.equal(r.action,'PREFERENCE_CHANGE',r.reason);assert.ok(r.proposal,'a re-plan is proposed');
 assert.deepEqual(r.proposal.canonical.coaching,{profile:'CONSERVATIVE',volume:{RUN:'STANDARD',STRENGTH:'LOWER'},difficulty:{RUN:'STANDARD',STRENGTH:'STANDARD'}});
 const before=sessionsOf(p),after=sessionsOf(r.proposal);
 assert.deepEqual(after.slice(0,2),before.slice(0,2),'this week and earlier weeks are unchanged');
 assert.equal(r.proposal.decisions.length,p.decisions.length+1);assert.equal(hash(r.proposal.decisions.slice(0,-1)),hash(p.decisions),'the decision log is append-only');
 assert.match(r.reason,/from next week/);
 // The same choices again change nothing; an unusable value is asked; the program's last week keeps.
 const same=evaluateProgram(r.proposal,review(r.proposal,2,2,'PREFERENCE_CHANGE',{changes:{coaching:{profile:'CONSERVATIVE'}}}));assert.equal(same.status,'KEEP',same.reason);
 const bad=evaluateProgram(p,review(p,1,2,'PREFERENCE_CHANGE',{changes:{coaching:{profile:'HARDCORE'}}}));assert.equal(bad.status,'ASK');assert.deepEqual(bad.missingInputs,['changes.coaching.profile']);
 const none=evaluateProgram(p,review(p,1,2,'PREFERENCE_CHANGE',{changes:{}}));assert.equal(none.status,'ASK');assert.deepEqual(none.missingInputs,['changes.coaching']);
 const last=evaluateProgram(p,review(p,7,2,'PREFERENCE_CHANGE',{changes:{coaching:{profile:'DEMANDING'}},observations:doneBefore(p,7)}));assert.notEqual(last.status,'HOLD',last.reason);assert.ok(!/Malformed/.test(last.reason),last.reason);assert.match(last.reason,/last week/,last.reason);
});
