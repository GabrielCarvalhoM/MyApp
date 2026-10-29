// R7-A author probe (second cycle): searches reachable timelines for cases that distinguish two single-fix reverts of the mutation check.
// (A) a reviewed week whose exercise has executed exposures of different phase reduction while a return, regain or set cap is active —
// the only place 'Counts from the first executed exposure' still matters once the ceiling reads the largest whole count (SSCTR R20);
// (B) a mid-week event change after an executed session whose rows exceed the new day phase (the QE-R7A-04 revert). Read-only.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const CC=path.resolve(import.meta.dirname,'../../../CoachingCore'),L=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const {generateProgram,evaluateProgram}=await L('src/r6-index.mjs'),{skeletonOf,validateWeeks}=await L('src/r6-program.mjs'),{devAuthority}=await L('r6/fixtures/dev-authority.mjs');
const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
let N=0;
const intake=(id,athlete,schedule,weeks=16)=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',...athlete},schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
const review=(p,w,{day=6,kind='WEEKLY_REVIEW',hour='21',...x}={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}:00:00Z`,weekIndex:w,event:{id:`fm-${w}-${kind}-${N++}`,kind},eligibility:elig(d),...x};};
const obs=(p,s)=>{const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:'fm-o-'+N++,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};};
const rows=(P,w)=>(P.weeks[w]?.sessions??[]).filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.map(e=>({s,e})));
const A=[],B=[];
for(const kind of ['10K','HALF_MARATHON'])for(const strengthDays of [[0,4],[0,3],[1,5]])for(const missFrom of [4,5,6,7,8]){
 const race=addDays('2026-11-02',13*7+6),ia={goals:{run:{kind:'RACE',event:{kind,date:race}},strength:'STRENGTH'}};
 const g=generateProgram(intake(`fm-${kind}-${strengthDays}-${missFrom}`,ia,{strengthDays}),opts);if(!g.program)continue;let p=g.program,ledger=[];
 for(let w=0;w<p.weeks.length-1;w++){
  const st=p.stateTrace[w].strength.exercises;
  const list=p.weeks[w].sessions.filter(s=>s.prescription&&!(s.sport==='STRENGTH'&&w>=missFrom&&w<missFrom+5)).map(s=>obs(p,s));
  const r=evaluateProgram(p,review(p,w,{observations:list,actualLedger:ledger}),opts);ledger=r.actualLedger??ledger;
  // (A) exercises with an active cap and executed exposures of different reduction this week
  const by=new Map();for(const {s,e} of rows(p,w))if(e.exposure&&list.some(o=>o.sessionId===s.id))by.set(e.id,[...(by.get(e.id)??[]),e]);
  for(const [id,l] of by){const red=l.map(e=>(e.exposure.phasedSets??e.sets)===e.exposure.baseSets);const cap=st[id]&&(Number.isInteger(st[id].regainCap)||Number.isInteger(st[id].setCap)||Number.isInteger(st[id].returnStep));if(cap&&l.length>1&&red[0]!==red.at(-1))A.push(`${kind} ${strengthDays} miss${missFrom} w${w} ${id} first=${red[0]?'unreduced':'reduced'} last=${red.at(-1)?'unreduced':'reduced'} phases=${l.map(e=>e.exposure.phase).join('/')} cap=${JSON.stringify({rc:st[id].regainCap,sc:st[id].setCap,rs:st[id].returnStep})} gate=${r.gates?.[id]} after=${JSON.stringify((r.proposal??p).stateTrace[w+1].strength.exercises[id]?.regainCap)}`);}
  if(r.proposal)p=r.proposal;
 }
}
// (B) mid-week event change after executed sessions: day 2..4 asOf, race moved to 6..10 days after asOf
for(const kind of ['10K'])for(const strengthDays of [[0,4],[0,3],[1,4]])for(const w0 of [5,6,7])for(const asDay of [1,2,3])for(const ahead of [5,6,8,10,12]){
 const race=addDays('2026-11-02',13*7+6),ia={goals:{run:{kind:'RACE',event:{kind,date:race}},strength:'STRENGTH'}};
 let p=generateProgram(intake(`fmB-${strengthDays}-${w0}-${asDay}-${ahead}`,ia,{strengthDays}),opts).program,ledger=[];if(!p)continue;
 for(let w=0;w<w0;w++){const r=evaluateProgram(p,review(p,w,{observations:p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s)),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
 const done=p.weeks[w0].sessions.filter(s=>s.prescription&&s.day<asDay);if(!done.some(s=>s.sport==='STRENGTH'))continue;
 const newRace=addDays(p.weeks[w0].startDate,asDay+ahead);
 const r=evaluateProgram(p,review(p,w0,{day:asDay,kind:'EVENT_DATE_CHANGE',changes:{eventDate:newRace},observations:done.map(s=>obs(p,s)),actualLedger:ledger}),opts);
 if(!r.proposal){B.push(`NO-PROPOSAL ${strengthDays} w${w0} d${asDay} +${ahead}: ${r.status}/${r.action} ${(r.errors??[]).slice(0,2)}`);continue;}
 const sk=skeletonOf(r.proposal,opts.authority),from=r.proposal.decisions.at(-1).fromWeek,errs=validateWeeks(sk,r.proposal.weeks.filter(x=>x.index>=from)).filter(x=>x.includes('phaseDose'));
 if(from===w0&&errs.length)B.push(`${strengthDays} w${w0} d${asDay} +${ahead}: status=${r.status} from=${from} historyErrorsWithoutSkip=${errs.length} ${errs.slice(0,2)}`);
}
fs.writeFileSync(path.join(import.meta.dirname,'r7a-mutant-reach-search.out.json'),JSON.stringify({probe:'R7A-MUTANT-REACH-1',runAt:new Date().toISOString(),A:{grid:'10K and HALF_MARATHON x strength days [0,4] [0,3] [1,5] x five missed strength weeks starting at weeks 4..8 (30 timelines, weekly reviews)',cases:A.length,examples:A.slice(0,12)},B:{grid:'10K x strength days [0,4] [0,3] [1,4] x weeks 5..7 x review day 1..3 x race 5..12 days ahead',cases:B.filter(x=>!x.startsWith('NO-PROPOSAL')).length,asked:B.filter(x=>x.startsWith('NO-PROPOSAL')).length,examples:B.filter(x=>!x.startsWith('NO-PROPOSAL')).slice(0,12)}},null,1)+'\n');console.log(JSON.stringify({A:A.length,B:B.filter(x=>!x.startsWith('NO-PROPOSAL')).length}));
