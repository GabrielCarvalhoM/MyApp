// SSCTR scratch probe: F04 matrix on a run-only athlete; then two flagged long runs within 14 days (confounded or partial) with adverse recovery.
import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=process.argv[2];
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(root,'src/r6-index.mjs')).href);
const elig=(d)=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const rv=(p,w,obs,l,rf)=>({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${addDays(p.weeks[w].startDate,6)}T20:00:00Z`,weekIndex:w,event:{id:'wr'+w,kind:'WEEKLY_REVIEW'},eligibility:elig(addDays(p.weeks[w].startDate,6)),observations:obs,...(l.length?{actualLedger:l}:{}),...(rf?{referenceState:rf}:{})});
const intake={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-12-01',startDate:'2026-12-02',weeks:12,learningConsent:false,athlete:{id:'f4',ageEligible:true,eligibility:elig('2026-12-01'),goals:{run:'REGULAR',strength:'NONE'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60},equipment:['BODYWEIGHT']},schedule:{runDays:[0,2,4],strengthDays:[],runTurn:'AM',runMinutes:45,longRunDay:4,longRunMinutes:80}};
const runs=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED');
const rep=(p,s,id,x={})=>({eventId:id,athleteId:p.athleteId,sessionId:s.id,occurrenceDate:s.date,actual:{completed:true,minutes:s.prescription.durationMinutes,...(x.actual??{})},response:{...OK,...(x.response??{})},...(x.confounded?{confounded:true}:{})});
const cells=[];for(const c of [false,true])for(const pf of ['COMPATIBLE','UNDER'])for(const ef of ['ON_TARGET','HARDER'])for(const rc of ['COMPATIBLE','ADVERSE'])for(const nd of ['NORMAL','IMPAIRED'])cells.push({c,pf,ef,rc,nd});
const out=[];
for(const x of cells){
 const p=generateProgram(intake).program,long=runs(p,0).find(s=>s.role==='LONG');
 const obs=runs(p,0).map((s,i)=>s===long?rep(p,s,'o'+i,{confounded:x.c,response:{performance:x.pf,effort:x.ef,recovery:x.rc,nextDayFunction:x.nd}}):rep(p,s,'o'+i));
 const r=evaluateProgram(p,rv(p,0,obs,[],null));const q=r.proposal??p;
 out.push(`${x.c?'CONF':'----'} ${x.pf.padEnd(10)} ${x.ef.padEnd(9)} ${x.rc.padEnd(10)} ${x.nd.padEnd(8)} kind=${(r.weekEvidence?.rows??[]).find(z=>z.sessionId===long.id)?.kind} gate=${r.gates?.LONG} nextLong=${runs(q,1).find(s=>s.role==='LONG')?.prescription.durationMinutes} (was ${long.prescription.durationMinutes})`);
}
console.log(out.join('\n'));
for(const flag of ['confounded','partial','none']){
 let p=generateProgram(intake).program,l=[],rf=null,g=null;
 for(const w of [0,1]){
  const long=runs(p,w).find(s=>s.role==='LONG');
  const bad={response:{recovery:'ADVERSE',nextDayFunction:'IMPAIRED'},...(flag==='confounded'?{confounded:true}:{}),...(flag==='partial'?{actual:{completed:false,minutes:Math.round(long.prescription.durationMinutes*0.7)}}:{})};
  const obs=runs(p,w).map((s,i)=>s===long?rep(p,s,`b${w}${i}`,bad):rep(p,s,`b${w}${i}`));
  const r=evaluateProgram(p,rv(p,w,obs,l,rf));l=r.actualLedger??l;rf=r.referenceState??rf;if(r.proposal)p=r.proposal;g=r.gates?.LONG;
 }
 console.log(`two adverse long runs within 14 d, flag=${flag}: week-1 LONG gate ${g}; next long ${runs(p,2).find(s=>s.role==='LONG')?.prescription.durationMinutes}`);
}
