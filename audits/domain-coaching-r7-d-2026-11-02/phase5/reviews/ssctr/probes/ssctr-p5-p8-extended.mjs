// SSCTR Phase 5 r2 probe (read-only): QRE-P5-F02 path P8 extended. F14, no strength before a 25-day break; week 4 runs and the day-0 strength session
// done (loads logged or not), the day-4 session not done; then weeks 5..9 executed as prescribed with loads logged. Checks the D55 limits on the
// exercises first set up after the entry week: no block-boundary set, at most one set more per executed week, never above the normal count.
//   node ssctr-p5-p8-extended.mjs --root <repository root> --out <file>   (--out never overwritten)
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const ROOT=path.resolve(arg('--root')),outFile=arg('--out');if(!outFile||fs.existsSync(outFile))throw Error('--out missing or exists');
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-index.mjs')).href);
const ELIG=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
const F14={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-12-12',startDate:'2026-12-14',weeks:12,timezoneOffsetMinutes:60,athlete:{ageEligible:true,eligibility:ELIG('2026-12-12'),id:'ath-f14-chiara',runExperience:'INTERMEDIATE',strengthExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:1},goals:{run:'REGULAR',strength:'HYPERTROPHY'},equipment:['DUMBBELLS','BENCH','BODYWEIGHT','BANDS']},schedule:{runDays:[1,3,6],strengthDays:[0,4],runMinutes:45,strengthMinutes:50,longRunDay:6,longRunMinutes:80}};
const sessions=(p,w,sport)=>(p.weeks[w]?.sessions??[]).filter(s=>live(s)&&(!sport||s.sport===sport));
const rep=(p,s,{completed=true,loadKg=null}={})=>{const x=s.prescription,actual={completed};if(completed){actual.minutes=x.durationMinutes;if(x.modality==='STRENGTH')actual.exercises=x.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir,...(e.load.mode==='BODYWEIGHT'?{load:{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}}:e.load.mode==='KNOWN'?{load:{value:e.load.value,unit:e.load.unit??'KG',convention:e.load.convention}}:loadKg!==null?{load:{value:loadKg,unit:'KG',convention:e.load.convention??'TOTAL'}}:{})}))}));}
 return {eventId:`x-${s.id}${completed?'':'-nd'}`,athleteId:p.athleteId,sessionId:s.id,actual,response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN'},occurrenceDate:s.date};};
const out={root:ROOT,arms:{}};
for(const [arm,entryLoad] of [['ENTRY_LOGGED',12],['ENTRY_UNLOGGED',null]]){
 let p=generateProgram(structuredClone(F14)).program,ledger=[],ref=null,model=null,n=0;const weeks={};
 const step=(w,obs,interruption)=>{const day=addDays(p.startDate,w*7+6);const r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T20:00:00+01:00`,weekIndex:w,event:{id:`x-${arm}-s${++n}`,kind:'WEEKLY_REVIEW'},eligibility:ELIG(day),observations:obs,...(interruption?{interruption}:{}),...(ledger.length?{actualLedger:ledger}:{}),...(ref?{referenceState:ref}:{}),...(model?{athleteModel:model}:{})});
  ledger=r.actualLedger??ledger;ref=r.referenceState??ref;model=r.updatedModel??model;if(r.proposal)p=r.proposal;
  weeks['after_w'+w]={status:r.status,next:sessions(p,w+1,'STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>`d${s.day}:${e.id}:${e.sets}x${e.reps}@${e.rir}:${e.exposure?.kind??'-'}`)),blocksDone:Object.fromEntries(Object.entries(p.stateTrace?.[w+1]?.strength?.exercises??{}).map(([id,e])=>[id,e.blocksDone??0]))};};
 step(3,[],{startDate:'2026-12-14',endDate:'2027-01-08',reasonCategory:'FAMILY',reason:'family visit abroad',nonclinical:true});
 step(4,[...sessions(p,4,'RUN').map(s=>rep(p,s)),...sessions(p,4,'STRENGTH').map(s=>rep(p,s,{completed:s.day===0,loadKg:entryLoad}))]);
 for(const w of [5,6,7,8,9])step(w,sessions(p,w).map(s=>rep(p,s,{loadKg:12})));
 out.arms[arm]=weeks;}
fs.writeFileSync(outFile,JSON.stringify(out,null,1));
for(const [a,ws] of Object.entries(out.arms)){console.log('##',a);for(const [k,v] of Object.entries(ws))console.log(k,v.status,'|',v.next.filter(x=>/d4:/.test(x)).join(' '),'| blocks',JSON.stringify(Object.fromEntries(Object.entries(v.blocksDone).filter(([,b])=>b>0))));}
