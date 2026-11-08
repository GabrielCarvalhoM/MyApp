// SSCTR Phase 5 review probe (read-only): strength and run trajectories after a moderate or long return on a runtime root, for the reviewer's own
// checks of SSCTR-P4-F01, R7D-FC-01 and the run side. Synthetic athletes (the directed tests' intakes); nothing under final/ is evaluated.
//   node ssctr-p5-trajectories.mjs --root <repository root> --out <file>   (--out never overwritten)
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const ROOT=path.resolve(arg('--root')),outFile=arg('--out');if(!outFile)throw Error('--out');if(fs.existsSync(outFile))throw Error('--out exists');
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-index.mjs')).href);
const ELIG=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const offset=m=>(m<0?'-':'+')+String(Math.floor(Math.abs(m)/60)).padStart(2,'0')+':'+String(Math.abs(m)%60).padStart(2,'0');
const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
const intake=({id,asOf,startDate,weeks,tz,runExperience,strengthExperience,recent,goals,equipment,schedule})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,timezoneOffsetMinutes:tz,
 athlete:{ageEligible:true,eligibility:ELIG(asOf),id,runExperience,strengthExperience,recent,goals,equipment},schedule});
const F13=intake({id:'ath-f13-dana',asOf:'2026-11-15',startDate:'2026-11-16',weeks:16,tz:-300,runExperience:'NOVICE',strengthExperience:'NOVICE',recent:{runDaysPerWeek:2,runMinutesPerWeek:60,longestRunMinutes:35,strengthDaysPerWeek:1},goals:{run:'REGULAR',strength:'GENERAL'},equipment:['BODYWEIGHT','BANDS'],schedule:{runDays:[0,2,5],strengthDays:[3],runMinutes:35,strengthMinutes:30,longRunDay:5,longRunMinutes:50}});
const F14=intake({id:'ath-f14-chiara',asOf:'2026-12-12',startDate:'2026-12-14',weeks:12,tz:60,runExperience:'INTERMEDIATE',strengthExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:1},goals:{run:'REGULAR',strength:'HYPERTROPHY'},equipment:['DUMBBELLS','BENCH','BODYWEIGHT','BANDS'],schedule:{runDays:[1,3,6],strengthDays:[0,4],runMinutes:45,strengthMinutes:50,longRunDay:6,longRunMinutes:80}});
// A trained athlete with known barbell loads at intake (R7D-F20's intake, read only, never evaluated as a case): the known exercises carry an intake state.
const GYM=(()=>{const c=JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname,'../../../../final/R7D_FINAL_HOLDOUT.json'),'utf8'));const i=structuredClone(c.cases.find(k=>k.caseId==='R7D-F20').intake);i.athlete.id='ath-ssctr-f20-shape';return i;})();
// A report as prescribed; loadKg gives loaded ESTABLISH/FROM_LOG rows a load (a conforming athlete logs one), else they carry none.
const asPrescribed=(p,s,{completed=true,loadKg=null,skip=[]}={})=>{const x=s.prescription,actual={completed};
 if(completed){actual.minutes=x.durationMinutes;if(x.modality==='STRENGTH')actual.exercises=x.exercises.filter(e=>!skip.includes(e.id)).map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(e.load.mode==='BODYWEIGHT'?{load:{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}}:e.load.mode==='KNOWN'?{load:{value:e.load.value,unit:e.load.unit??'KG',convention:e.load.convention}}:loadKg!==null?{load:{value:loadKg,unit:'KG',convention:e.load.convention??'TOTAL'}}:{}),...(Number.isFinite(e.rir)?{rir:e.rir}:{})}))}));}
 return {eventId:`p-${s.id}${completed?'':'-nd'}`,athleteId:p.athleteId,sessionId:s.id,actual,response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN'},occurrenceDate:s.date};};
const sessions=(p,w,sport)=>(p.weeks[w]?.sessions??[]).filter(s=>live(s)&&(!sport||s.sport===sport));
function timeline(input){
 const g=generateProgram(structuredClone(input));if(g.status!=='PROPOSED')throw Error(g.reason);
 const t={p:g.program,ledger:[],ref:null,model:null,tz:input.timezoneOffsetMinutes??0,n:0,results:[]};
 t.step=(at,{observations=[],interruption=null}={})=>{const p=t.p,day=addDays(p.startDate,at.week*7+at.day),asOf=`${day}T${at.time}:00${offset(t.tz)}`;
  const review={version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,weekIndex:Math.floor((at.week*7+at.day)/7),event:{id:`p-${input.athlete.id}-s${++t.n}`,kind:'WEEKLY_REVIEW'},eligibility:ELIG(day),observations:typeof observations==='function'?observations(p):observations,
   ...(interruption?{interruption}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{}),...(t.model?{athleteModel:t.model}:{})};
  const r=evaluateProgram(p,review);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;t.model=r.updatedModel??t.model;if(r.proposal)t.p=r.proposal;t.results.push(r);return r;};
 return t;}
const str=(p,w)=>sessions(p,w,'STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>`${s.id.split('-').at(-1)}:${e.id}:${e.sets}x${e.reps}@${e.rir}:${e.exposure?.kind??'-'}:${e.load?.mode??'-'}`));
const run=(p,w)=>sessions(p,w,'RUN').map(s=>`${s.role}:${s.prescription.durationMinutes}`);
const res=r=>({status:r.status,action:r.action??null,validity:r.planValidity?.status??null,question:r.question?.kind??null});
const out={root:ROOT,scenarios:{}};
const rec=(name,t,weeks,extra={})=>{out.scenarios[name]={steps:t.results.map(res),weeks:Object.fromEntries(weeks.map(w=>[w,{strength:str(t.p,w),runs:run(t.p,w)}])),...extra};};
// S1: F13 with the answer, then weeks 8..13 executed as prescribed (each week's review).
{const t=timeline(F13);t.step({week:7,day:6,time:'20:00'});
 t.step({week:7,day:6,time:'20:40'},{observations:p=>[...sessions(p,0).map(s=>asPrescribed(p,s)),asPrescribed(p,sessions(p,1,'RUN').find(s=>s.day===0))],interruption:{startDate:'2026-11-24',endDate:'2027-01-09',reasonCategory:'WORK',reason:'night shifts for seven weeks, no training at all',nonclinical:true}});
 const snap={};snap.afterAnswer={8:str(t.p,8),9:str(t.p,9)};
 for(const w of [8,9,10,11,12,13]){t.step({week:w,day:6,time:'20:00'},{observations:p=>sessions(p,w).map(s=>asPrescribed(p,s))});snap['after_w'+w]={next:str(t.p,w+1)};}
 rec('F13_LONG_RETURN_THEN_EXECUTED',t,[8,9,10,11,12,13,14],{snap});}
// S2: W-D49-A extended (F14, break before any strength), loaded rows logged with a load (20 kg), weeks 4..9 executed.
for(const [name,loadKg] of [['WD49A_LOGGED',20],['WD49A_UNLOGGED',null]]){const t=timeline(F14);
 t.step({week:3,day:6,time:'20:00'},{observations:[],interruption:{startDate:'2026-12-14',endDate:'2027-01-08',reasonCategory:'FAMILY',reason:'family visit abroad',nonclinical:true}});
 const snap={entry:str(t.p,4)};
 for(const w of [4,5,6,7,8,9]){t.step({week:w,day:6,time:'20:00'},{observations:p=>sessions(p,w).map(s=>asPrescribed(p,s,{loadKg}))});snap['after_w'+w]={next:str(t.p,w+1)};}
 rec(name,t,[4,5,6,7,8,9,10],{snap});}
// S3: W-D49-B extended (control): week 0 executed, logged, then the break, then weeks 4..8 executed.
{const t=timeline(F14);
 t.step({week:3,day:6,time:'20:00'},{observations:p=>sessions(p,0).map(s=>asPrescribed(p,s,{loadKg:20})),interruption:{startDate:'2026-12-21',endDate:'2027-01-08',reasonCategory:'FAMILY',reason:'family visit abroad',nonclinical:true}});
 for(const w of [4,5,6,7,8])t.step({week:w,day:6,time:'20:00'},{observations:p=>sessions(p,w).map(s=>asPrescribed(p,s,{loadKg:20}))});
 rec('WD49B_LOGGED',t,[4,5,6,7,8,9]);}
// S4: mixed history: F14 week 0 Monday session executed only (day-4-only exercises never executed), then the break, then weeks 4..7.
{const t=timeline(F14);
 t.step({week:3,day:6,time:'20:00'},{observations:p=>sessions(p,0).filter(s=>s.sport!=='STRENGTH'||s.day===0).map(s=>asPrescribed(p,s,{loadKg:20})),interruption:{startDate:'2026-12-21',endDate:'2027-01-08',reasonCategory:'FAMILY',reason:'family visit abroad',nonclinical:true}});
 for(const w of [4,5,6,7])t.step({week:w,day:6,time:'20:00'},{observations:p=>sessions(p,w).map(s=>asPrescribed(p,s,{loadKg:20}))});
 rec('MIXED_HISTORY',t,[4,5,6,7,8]);}
// S5: entry week runs only (strength not done) then executed weeks: the entry is repeated before step 2.
{const t=timeline(F14);
 t.step({week:3,day:6,time:'20:00'},{observations:[],interruption:{startDate:'2026-12-14',endDate:'2027-01-08',reasonCategory:'FAMILY',reason:'family visit abroad',nonclinical:true}});
 t.step({week:4,day:6,time:'20:00'},{observations:p=>[...sessions(p,4,'RUN').map(s=>asPrescribed(p,s)),...sessions(p,4,'STRENGTH').map(s=>asPrescribed(p,s,{completed:false}))]});
 for(const w of [5,6])t.step({week:w,day:6,time:'20:00'},{observations:p=>sessions(p,w).map(s=>asPrescribed(p,s,{loadKg:20}))});
 rec('ENTRY_STRENGTH_NOT_DONE',t,[4,5,6,7,8]);}
// S6: disclosure 2: entry week executed, only the bodyweight/band rows logged; the dumbbell rows reported without a load (D52).
{const t=timeline(F14);
 t.step({week:3,day:6,time:'20:00'},{observations:[],interruption:{startDate:'2026-12-14',endDate:'2027-01-08',reasonCategory:'FAMILY',reason:'family visit abroad',nonclinical:true}});
 t.step({week:4,day:6,time:'20:00'},{observations:p=>sessions(p,4).map(s=>asPrescribed(p,s,{loadKg:null}))});
 const snap={after_w4:str(t.p,5)};
 for(const w of [5,6,7])t.step({week:w,day:6,time:'20:00'},{observations:p=>sessions(p,w).map(s=>asPrescribed(p,s,{loadKg:20}))});
 rec('DISCLOSURE2_UNLOGGED_ENTRY',t,[4,5,6,7,8],{snap});}
// S7: trained barbell athlete, long break before any strength exposure (week 0 day 0), then executed logged weeks.
{const t=timeline(GYM);
 t.step({week:5,day:6,time:'20:00'},{observations:[],interruption:{startDate:'2026-12-21',endDate:'2027-01-23',reasonCategory:'WORK',reason:'project deadline, no training',nonclinical:true}});
 for(const w of [6,7,8,9,10])t.step({week:w,day:6,time:'20:00'},{observations:p=>sessions(p,w).map(s=>asPrescribed(p,s,{loadKg:40}))});
 rec('GYM_LONG_BEFORE_ANY',t,[1,6,7,8,9,10,11]);}
// S8: F13 band row progression with normal reporting (FC-01), weeks 0..9.
{const t=timeline(F13);for(const w of [0,1,2,3,4,5,6,7,8,9])t.step({week:w,day:6,time:'20:00'},{observations:p=>sessions(p,w).map(s=>asPrescribed(p,s))});rec('F13_NORMAL_REPORTING',t,[0,1,2,3,4,5,6,7,8,9,10]);}
fs.writeFileSync(outFile,JSON.stringify(out,null,1));console.log('wrote',outFile);
