// SSCTR Phase 5 review probe (read-only): after a moderate return before any strength exposure, the athlete executes every strength row but logs no
// load on any loaded row and leaves the bodyweight rows out, for several weeks: does the return entry repeat (marker never ends), and is anything asked?
//   node ssctr-p5-unlogged-stall.mjs --root <repository root> --out <file>
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const ROOT=path.resolve(arg('--root')),outFile=arg('--out');if(fs.existsSync(outFile))throw Error('--out exists');
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-index.mjs')).href);
const ELIG=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
const F14={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-12-12',startDate:'2026-12-14',weeks:12,timezoneOffsetMinutes:60,athlete:{ageEligible:true,eligibility:ELIG('2026-12-12'),id:'ath-f14-chiara',runExperience:'INTERMEDIATE',strengthExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:1},goals:{run:'REGULAR',strength:'HYPERTROPHY'},equipment:['DUMBBELLS','BENCH','BODYWEIGHT','BANDS']},schedule:{runDays:[1,3,6],strengthDays:[0,4],runMinutes:45,strengthMinutes:50,longRunDay:6,longRunMinutes:80}};
const sessions=(p,w,sport)=>(p.weeks[w]?.sessions??[]).filter(s=>live(s)&&(!sport||s.sport===sport));
const rep=(p,s)=>{const x=s.prescription,actual={completed:true,minutes:x.durationMinutes};if(x.modality==='STRENGTH')actual.exercises=x.exercises.filter(e=>e.load.mode!=='BODYWEIGHT').map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir}))}));
 return {eventId:`u-${s.id}`,athleteId:p.athleteId,sessionId:s.id,actual,response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN'},occurrenceDate:s.date};};
const g=generateProgram(structuredClone(F14));let p=g.program,ledger=[],ref=null,model=null,n=0;const out={root:ROOT,steps:[]};
const step=(w,obs,interruption)=>{const day=addDays(p.startDate,w*7+6);const review={version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T20:00:00+01:00`,weekIndex:w,event:{id:`u-s${++n}`,kind:'WEEKLY_REVIEW'},eligibility:ELIG(day),observations:obs,...(interruption?{interruption}:{}),...(ledger.length?{actualLedger:ledger}:{}),...(ref?{referenceState:ref}:{}),...(model?{athleteModel:model}:{})};
 const r=evaluateProgram(p,review);ledger=r.actualLedger??ledger;ref=r.referenceState??ref;model=r.updatedModel??model;if(r.proposal)p=r.proposal;
 out.steps.push({week:w,status:r.status,action:r.action??null,question:r.question?.kind??null,loadQuestions:(r.loadQuestions??[]).map(q=>q.exerciseId??q.kind??'?'),returnEntry:p.stateTrace?.[w+1]?.strength?.returnEntry??null,next:sessions(p,w+1,'STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.rir}:${e.exposure?.kind??'-'}`))});};
step(3,[],{startDate:'2026-12-14',endDate:'2027-01-08',reasonCategory:'FAMILY',reason:'family visit abroad',nonclinical:true});
for(const w of [4,5,6,7])step(w,sessions(p,w).map(s=>rep(p,s)));
fs.writeFileSync(outFile,JSON.stringify(out,null,1));console.log(JSON.stringify(out.steps.map(s=>({w:s.week,st:s.status+'/'+s.action,q:s.question,lq:s.loadQuestions.length,re:s.returnEntry,next:s.next.join(' ')})),null,1));
