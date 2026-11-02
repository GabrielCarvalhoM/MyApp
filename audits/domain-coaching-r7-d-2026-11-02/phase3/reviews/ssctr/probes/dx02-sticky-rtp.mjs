// SSCTR scratch probe: the same already-applied interruption re-sent as RETURN_AFTER_PAUSE reports after the week's review, weeks 5-8.
import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=process.argv[2],mode=process.argv[3]??'RTP';
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(root,'src/r6-index.mjs')).href);
const elig=(d)=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const rv=(p,w,day,kind,id,x={})=>({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${addDays(p.weeks[w].startDate,day)}T${x.hour??'20:00:00'}Z`,weekIndex:w,event:{id,kind},eligibility:elig(addDays(p.weeks[w].startDate,day)),observations:x.observations??[],...(x.interruption?{interruption:x.interruption}:{})});
const g=generateProgram({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-12-01',startDate:'2026-12-02',weeks:12,learningConsent:false,athlete:{id:'w',ageEligible:true,eligibility:elig('2026-12-01'),goals:{run:'REGULAR',strength:'NONE'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60},equipment:['BODYWEIGHT']},schedule:{runDays:[0,2,4],strengthDays:[],runTurn:'AM',runMinutes:45,longRunDay:4,longRunMinutes:80}});
const runs=(p,w)=>p.weeks[w]?.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED')??[];
const show=(p,w)=>runs(p,w).map(s=>`${s.role}${s.prescription.durationMinutes}`).join(',');
const report=(p,s,id)=>({eventId:id,athleteId:p.athleteId,sessionId:s.id,occurrenceDate:s.date,actual:{completed:true,minutes:s.prescription.durationMinutes},response:OK});
let p=g.program,l=[],rf=null;
for(const w of [0,1,2]){const r=evaluateProgram(p,{...rv(p,w,6,'WEEKLY_REVIEW',`wr${w}`,{observations:runs(p,w).map((s,i)=>report(p,s,`o${w}${i}`))}),...(l.length?{actualLedger:l}:{}),...(rf?{referenceState:rf}:{})});l=r.actualLedger??l;rf=r.referenceState??rf;if(r.proposal)p=r.proposal;}
const brk={startDate:p.weeks[3].startDate,endDate:addDays(p.weeks[4].startDate,6),days:14,reasonCategory:'VACATION',nonclinical:true,reason:'Holiday, no training at all'};
let q=p;const r0=evaluateProgram(q,{...rv(q,5,1,'RETURN_AFTER_PAUSE','ret',{hour:'07:00:00',interruption:brk}),actualLedger:l,referenceState:rf});l=r0.actualLedger;rf=r0.referenceState;q=r0.proposal;
const out=[];
for(const w of [5,6,7,8]){
 const from=w===5?addDays(q.weeks[5].startDate,1):null;
 const obs=runs(q,w).filter(s=>!from||s.date>=from).map((s,i)=>report(q,s,`st${w}${i}`));
 let r=evaluateProgram(q,{...rv(q,w,6,'WEEKLY_REVIEW',`stwr${w}`,{observations:obs}),actualLedger:l,referenceState:rf});l=r.actualLedger??l;rf=r.referenceState??rf;if(r.proposal)q=r.proposal;
 let a=r.action;
 if(mode==='RTP'){r=evaluateProgram(q,{...rv(q,w,6,'RETURN_AFTER_PAUSE',`re${w}`,{hour:'21:00:00',interruption:brk}),actualLedger:l,referenceState:rf});l=r.actualLedger??l;rf=r.referenceState??rf;if(r.proposal)q=r.proposal;a+='+'+r.status+'/'+r.action;}
 out.push(`w${w}:${a} next ${show(q,w+1)}`);
}
console.log(mode,out.join(' | '));
