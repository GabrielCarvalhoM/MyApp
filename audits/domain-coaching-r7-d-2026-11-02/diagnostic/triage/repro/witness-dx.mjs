// Minimal witnesses for the R7-D diagnostic findings DX-01 and DX-02 (post-first-evaluation investigation; read-only on the frozen runtime).
//   node witness-dx.mjs [<CoachingCore root>]   (default: this worktree's CoachingCore, R7C-FREEZE-4)
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.argv[2]??path.resolve(import.meta.dirname,'../../../../../CoachingCore');
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(root,'src/r6-index.mjs')).href);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const review=(p,w,day,kind,x={})=>({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${addDays(p.weeks[w].startDate,day)}T20:00:00Z`,weekIndex:w,event:{id:`${kind}-${w}-${day}`,kind},eligibility:elig(addDays(p.weeks[w].startDate,day)),observations:[],...x});
const g=generateProgram({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-12-01',startDate:'2026-12-02',weeks:12,learningConsent:false,
 athlete:{id:'w',ageEligible:true,eligibility:elig('2026-12-01'),goals:{run:'REGULAR',strength:'NONE'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60},equipment:['BODYWEIGHT']},
 schedule:{runDays:[0,2,4],strengthDays:[],runTurn:'AM',runMinutes:45,longRunDay:4,longRunMinutes:80}});
const p0=g.program,runs=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED');
const show=(p,w,from=null)=>runs(p,w).filter(s=>!from||s.date>=from).map(s=>`${s.role}${s.prescription.durationMinutes}`).join(',');

// DX-01: a day-precision report with a same-day reportedAt is recorded by its decision and dropped from the record by the next decision.
{
 const s=runs(p0,0)[0],obs=(reportedAt)=>({eventId:'r1',athleteId:p0.athleteId,sessionId:s.id,occurrenceDate:s.date,...(reportedAt?{reportedAt}:{}),actual:{completed:true,minutes:s.prescription.durationMinutes},response:OK});
 for(const [label,reportedAt] of [['reportedAt same day 09:00Z',`${s.date}T09:00:00Z`],['reportedAt next day',`${addDays(s.date,1)}T09:00:00Z`],['no reportedAt',null]]){
  const r1=evaluateProgram(p0,review(p0,0,6,'WEEKLY_REVIEW',{observations:[obs(reportedAt)]})),p1=r1.proposal??p0;
  const r2=evaluateProgram(p1,{...review(p1,1,6,'WEEKLY_REVIEW'),actualLedger:r1.actualLedger,referenceState:r1.referenceState});
  console.log(`DX-01 ${label.padEnd(28)} recorded by decision 1: ${r1.actualLedger.some(x=>x.eventId==='r1')}  kept by decision 2: ${r2.actualLedger.some(x=>x.eventId==='r1')}  excluded: ${JSON.stringify((r2.provenance?.excluded??[]).map(e=>e.reason))}`);
 }
}
// DX-02: a declared nonclinical break inside a weekly review (no question pending) is not read; the same break as a return report re-enters.
{
 let p=p0,ledger=[],ref=null;
 for(const w of [0,1,2]){const r=evaluateProgram(p,{...review(p,w,6,'WEEKLY_REVIEW',{observations:runs(p,w).map((s,i)=>({eventId:`o${w}${i}`,athleteId:p.athleteId,sessionId:s.id,occurrenceDate:s.date,actual:{completed:true,minutes:s.prescription.durationMinutes},response:OK}))}),...(ledger.length?{actualLedger:ledger}:{}),...(ref?{referenceState:ref}:{})});ledger=r.actualLedger??ledger;ref=r.referenceState??ref;if(r.proposal)p=r.proposal;}
 const brk={startDate:p.weeks[3].startDate,endDate:addDays(p.weeks[4].startDate,6),days:14,reasonCategory:'VACATION',nonclinical:true,reason:'Holiday, no training at all'};
 const at=addDays(p.weeks[5].startDate,1);
 for(const kind of ['WEEKLY_REVIEW','RETURN_AFTER_PAUSE']){
  const r=evaluateProgram(p,{...review(p,5,1,kind,{interruption:brk}),actualLedger:ledger,referenceState:ref}),q=r.proposal??p;
  console.log(`DX-02 break declared in ${kind.padEnd(18)} -> ${r.status}/${r.action} ${r.planValidity.status}; week 5 runs from ${at}: ${show(q,5,at)}; week 6: ${show(q,6)}`);
 }
}
