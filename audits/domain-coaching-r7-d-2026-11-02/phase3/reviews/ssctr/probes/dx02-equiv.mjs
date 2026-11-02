// SSCTR recheck probe (scratch): WEEKLY_REVIEW vs RETURN_AFTER_PAUSE carrying the same interruption (same event id), across break lengths,
// a late declaration with the week's own reports (adverse or not), and a sticky re-send over later weeks.
//   node dx02-equiv.mjs <CoachingCore root>
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.argv[2];
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(root,'src/r6-index.mjs')).href);
const elig=(d)=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const BAD={performance:'COMPATIBLE',recovery:'ADVERSE',effort:'ON_TARGET',nextDayFunction:'IMPAIRED'};
const rv=(p,w,day,kind,id,x={})=>({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${addDays(p.weeks[w].startDate,day)}T${x.hour??'20:00:00'}Z`,weekIndex:w,event:{id,kind},eligibility:elig(addDays(p.weeks[w].startDate,day)),observations:x.observations??[],...(x.interruption?{interruption:x.interruption}:{})});
const g=generateProgram({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-12-01',startDate:'2026-12-02',weeks:12,learningConsent:false,
 athlete:{id:'w',ageEligible:true,eligibility:elig('2026-12-01'),goals:{run:'REGULAR',strength:'NONE'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60},equipment:['BODYWEIGHT']},
 schedule:{runDays:[0,2,4],strengthDays:[],runTurn:'AM',runMinutes:45,longRunDay:4,longRunMinutes:80}});
const runs=(p,w)=>p.weeks[w]?.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED')??[];
const show=(p,w,from=null)=>runs(p,w).filter(s=>!from||s.date>=from).map(s=>`${s.role}${s.prescription.durationMinutes}`).join(',');
const report=(p,s,id,resp=OK)=>({eventId:id,athleteId:p.athleteId,sessionId:s.id,occurrenceDate:s.date,actual:{completed:true,minutes:s.prescription.durationMinutes},response:resp});
let p=g.program,ledger=[],ref=null;
for(const w of [0,1,2]){const r=evaluateProgram(p,{...rv(p,w,6,'WEEKLY_REVIEW',`wr${w}`,{observations:runs(p,w).map((s,i)=>report(p,s,`o${w}${i}`))}),...(ledger.length?{actualLedger:ledger}:{}),...(ref?{referenceState:ref}:{})});ledger=r.actualLedger??ledger;ref=r.referenceState??ref;if(r.proposal)p=r.proposal;}
const strip=r=>JSON.stringify({status:r.status,action:r.action,validity:r.planValidity?.status,weeks:r.proposal?.weeks??null,trace:r.proposal?.stateTrace??null,ledger:(r.actualLedger??[]).map(o=>[o.eventId,o.localDate,o.actual?.minutes,o.superseded??false])});
const pair=(label,w,day,x)=>{
 const a=evaluateProgram(p,{...rv(p,w,day,'WEEKLY_REVIEW','same-id',x),actualLedger:ledger,referenceState:ref});
 const b=evaluateProgram(p,{...rv(p,w,day,'RETURN_AFTER_PAUSE','same-id',x),actualLedger:ledger,referenceState:ref});
 console.log(`${label.padEnd(58)} identical=${strip(a)===strip(b)} WR ${a.status}/${a.action} | RTP ${b.status}/${b.action} | WR w${w}: ${show(a.proposal??p,w,addDays(p.weeks[w].startDate,day))} w${w+1}: ${show(a.proposal??p,w+1)} | RTP w${w+1}: ${show(b.proposal??p,w+1)}`);
 return {a,b};
};
for(const days of [3,6,9,14,21,35,60]){
 const end=addDays(p.weeks[5].startDate,0),start=addDays(end,-(days-1));
 pair(`break ${days} d ending w5 d0, declared w5 d1`,5,1,{hour:'07:00:00',interruption:{startDate:start,endDate:end,days,reasonCategory:'WORK',nonclinical:true,reason:'Work, no training'}});
}
// late declaration: the athlete returned on w5 d0 and ran the stored plan; the end-of-week review reports those runs and declares the break
const brk={startDate:p.weeks[3].startDate,endDate:addDays(p.weeks[4].startDate,6),days:14,reasonCategory:'VACATION',nonclinical:true,reason:'Holiday, no training at all'};
for(const [label,resp] of [['OK',OK],['ADVERSE',BAD]]){
 const obs=runs(p,5).map((s,i)=>report(p,s,`late5${i}`,resp));
 const {a,b}=pair(`late declaration w5 d6 with the week's runs (${label})`,5,6,{interruption:brk,observations:obs});
 console.log(`   WR record keeps the week-5 runs: ${obs.every(o=>(a.actualLedger??[]).some(x=>x.eventId===o.eventId))}; gates WR ${JSON.stringify(a.gates??null)} RTP ${JSON.stringify(b.gates??null)}`);
}
// sticky re-send: after a return report on w5 d1, the client keeps sending the same interruption in every later weekly review
for(const sticky of [false,true]){
 let q=p,l=ledger,rf=ref;const r0=evaluateProgram(q,{...rv(q,5,1,'RETURN_AFTER_PAUSE','ret',{hour:'07:00:00',interruption:brk}),actualLedger:l,referenceState:rf});l=r0.actualLedger;rf=r0.referenceState;q=r0.proposal;
 const out=[];
 for(const w of [5,6,7,8]){
  const from=w===5?addDays(q.weeks[5].startDate,1):null;
  const obs=runs(q,w).filter(s=>!from||s.date>=from).map((s,i)=>report(q,s,`st${w}${i}`));
  const r=evaluateProgram(q,{...rv(q,w,6,'WEEKLY_REVIEW',`stwr${w}`,{observations:obs,...(sticky?{interruption:brk}:{})}),actualLedger:l,referenceState:rf});
  l=r.actualLedger??l;rf=r.referenceState??rf;if(r.proposal)q=r.proposal;
  out.push(`w${w}:${r.action} next ${show(q,w+1)}`);
 }
 console.log(`${sticky?'STICKY re-send':'control (no re-send)'.padEnd(14)}  ${out.join(' | ')}`);
}
