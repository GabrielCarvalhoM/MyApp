// SSCTR recheck probe (scratch): DX-02 carriers and flagged behaviours 2 and 5 on a run-only athlete.
//   node dx02-paths.mjs <CoachingCore root>
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.argv[2];
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(root,'src/r6-index.mjs')).href);
const elig=(d,x={})=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,...x});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const review=(p,w,day,kind,x={})=>({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${addDays(p.weeks[w].startDate,day)}T${x.hour??'20:00:00'}Z`,weekIndex:w,event:{id:`${kind}-${w}-${day}-${x.tag??''}`,kind},eligibility:elig(addDays(p.weeks[w].startDate,day),x.elig??{}),observations:[],...Object.fromEntries(Object.entries(x).filter(([k])=>!['hour','tag','elig'].includes(k)))});
const g=generateProgram({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-12-01',startDate:'2026-12-02',weeks:12,learningConsent:false,
 athlete:{id:'w',ageEligible:true,eligibility:elig('2026-12-01'),goals:{run:'REGULAR',strength:'NONE'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60},equipment:['BODYWEIGHT']},
 schedule:{runDays:[0,2,4],strengthDays:[],runTurn:'AM',runMinutes:45,longRunDay:4,longRunMinutes:80}});
const runs=(p,w)=>p.weeks[w]?.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED')??[];
const show=(p,w,from=null)=>runs(p,w).filter(s=>!from||s.date>=from).map(s=>`${s.role}${s.prescription.durationMinutes}${['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','RACE_TOUCH'].includes(s.prescription.family)?'(Q)':''}`).join(',');
let p=g.program,ledger=[],ref=null;
for(const w of [0,1,2]){const r=evaluateProgram(p,{...review(p,w,6,'WEEKLY_REVIEW',{observations:runs(p,w).map((s,i)=>({eventId:`o${w}${i}`,athleteId:p.athleteId,sessionId:s.id,occurrenceDate:s.date,actual:{completed:true,minutes:s.prescription.durationMinutes},response:OK}))}),...(ledger.length?{actualLedger:ledger}:{}),...(ref?{referenceState:ref}:{})});ledger=r.actualLedger??ledger;ref=r.referenceState??ref;if(r.proposal)p=r.proposal;}
const maxExec=Math.max(...ledger.filter(o=>o.actual?.completed).map(o=>o.actual.minutes));
const at=addDays(p.weeks[5].startDate,1);
console.log(`executed max before break: ${maxExec} min; stored plan week 5 from ${at}: ${show(p,5,at)}; week 6: ${show(p,6)}`);
const line=(label,r,q)=>console.log(`${label.padEnd(64)} ${r.status}/${r.action} ${r.planValidity?.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'?'VALID':r.planValidity?.status} pending=${r.referenceState?.pending?.status??r.referenceState?.pending?.kind??'-'} | w5: ${show(q,5,at)} | w6: ${show(q,6)}${r.missingInputs?.length?' missing='+r.missingInputs.join(','):''}`);
const brk=(x={})=>({startDate:p.weeks[3].startDate,endDate:addDays(p.weeks[4].startDate,6),days:14,reasonCategory:'VACATION',nonclinical:true,reason:'Holiday, no training at all',...x});
const ev=(kind,x)=>{const r=evaluateProgram(p,{...review(p,5,1,kind,{hour:'07:00:00',...x}),actualLedger:ledger,referenceState:ref});return r;};
{const r=ev('WEEKLY_REVIEW',{interruption:{startDate:null,endDate:null,reason:null}});line('WR interruption with only null fields',r,r.proposal??p);}
// 1. carriers
for(const kind of ['WEEKLY_REVIEW','RETURN_AFTER_PAUSE']){const r=ev(kind,{interruption:brk()});line(`${kind} nonclinical 14 d`,r,r.proposal??p);}
// break lengths: WR vs RTP equivalence and max
for(const days of [3,6,9,21,35]){
 const b={startDate:addDays(p.weeks[5].startDate,-days),endDate:addDays(p.weeks[5].startDate,0),days,reasonCategory:'WORK',nonclinical:true,reason:'Work, no training'};
 const a=ev('WEEKLY_REVIEW',{interruption:b}),c=ev('RETURN_AFTER_PAUSE',{interruption:b});
 const same=JSON.stringify(a.proposal?.weeks??null)===JSON.stringify(c.proposal?.weeks??null)&&a.status===c.status;
 line(`WR break ${days} d (ends w5 d0) same-as-RTP=${same}`,a,a.proposal??p);
}
// unknown nonclinical status / malformed
{const r=ev('WEEKLY_REVIEW',{interruption:{startDate:p.weeks[3].startDate,endDate:addDays(p.weeks[4].startDate,6),reasonCategory:'OTHER',reason:'stopped'}});line('WR break, nonclinical unknown',r,r.proposal??p);}
{const r=ev('WEEKLY_REVIEW',{interruption:{note:'I stopped for a while'}});line('WR malformed interruption {note}',r,r.proposal??p);}
// future planned break declared in a weekly review
{const r=ev('WEEKLY_REVIEW',{interruption:{startDate:p.weeks[6].startDate,endDate:addDays(p.weeks[6].startDate,6),days:7,reasonCategory:'VACATION',nonclinical:true,reason:'Planned holiday next week'}});line('WR future break (week 6)',r,r.proposal??p);}
// flagged 2: break + clinical flag in WR, then qualified clearance (ref dropped), then plain WR
{
 const r1=ev('WEEKLY_REVIEW',{interruption:brk(),elig:{illness:true}});line('F2 WR break + illness flag',r1,r1.proposal??p);
 const p1=r1.proposal??p,l1=r1.actualLedger??ledger;
 for(const [day,hour] of [[1,'12:00:00'],[3,'07:00:00']]){
  const r2=evaluateProgram(p1,{...review(p1,5,day,'WEEKLY_REVIEW',{hour,tag:'after-clear'}),actualLedger:l1});
  line(`F2 after clearance, plain WR (w5 d${day})`,r2,r2.proposal??p1);
 }
 const r3=ev('RETURN_AFTER_PAUSE',{interruption:brk({reasonCategory:'ILLNESS',reason:'flu',nonclinical:false})});line('F2 RTP clinical reason (flu)',r3,r3.proposal??p);
 const r4=evaluateProgram(p,{...review(p,5,1,'WEEKLY_REVIEW',{hour:'12:00:00',tag:'after-clear2'}),actualLedger:r3.actualLedger??ledger});line('F2 after clearance of RTP flu, plain WR',r4,r4.proposal??p);
}
// flagged 5: another event kind with a break, then the next plain review (reference state carried, nothing re-declared)
for(const [kind,extra] of [['SCHEDULE_CHANGE',{changes:{runDays:[1,3,5]}}],['SYSTEMIC_FATIGUE',{}]]){
 const r1=ev(kind,{interruption:brk(),...extra});line(`F5 ${kind} + break`,r1,r1.proposal??p);
 const p1=r1.proposal??p;
 const r2=evaluateProgram(p1,{...review(p1,5,1,'WEEKLY_REVIEW',{hour:'12:00:00',tag:'next'}),actualLedger:r1.actualLedger??ledger,referenceState:r1.referenceState??ref});
 line(`F5 then plain WR, break not re-sent (ref carried)`,r2,r2.proposal??p1);
 const r3=evaluateProgram(p1,{...review(p1,5,1,'RETURN_AFTER_PAUSE',{hour:'12:00:00',tag:'next-rtp',interruption:brk()}),actualLedger:r1.actualLedger??ledger,referenceState:r1.referenceState??ref});
 line(`F5 then the break on its own (RTP)`,r3,r3.proposal??p1);
}
// sticky: a weekly review re-sending the same, already returned, interruption a week later
{
 const r1=ev('RETURN_AFTER_PAUSE',{interruption:brk()}),p1=r1.proposal;
 const w5=runs(p1,5).filter(s=>s.date>=at).map((s,i)=>({eventId:`s5${i}`,athleteId:p1.athleteId,sessionId:s.id,occurrenceDate:s.date,actual:{completed:true,minutes:s.prescription.durationMinutes},response:OK}));
 const r2=evaluateProgram(p1,{...review(p1,5,6,'WEEKLY_REVIEW',{tag:'resend',interruption:brk(),observations:w5}),actualLedger:r1.actualLedger,referenceState:r1.referenceState});
 const r2b=evaluateProgram(p1,{...review(p1,5,6,'WEEKLY_REVIEW',{tag:'plain',observations:w5}),actualLedger:r1.actualLedger,referenceState:r1.referenceState});
 line('STICKY return then WR w5 d6 re-sending same break',r2,r2.proposal??p1);
 line('STICKY return then WR w5 d6 plain (control)',r2b,r2b.proposal??p1);
}
