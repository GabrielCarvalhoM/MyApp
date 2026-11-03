// Record carriage: which decisions return the completed-work record (actualLedger) while a break is kept. A decision that returns none leaves
// the client to keep the previous record (the directed tests do: r.actualLedger ?? previous). Run on the candidate.
import {load,kit} from './common.mjs';
const root=process.argv[2];const L=kit(await load(root));
const {step,copy,trained,addDays,elig,evaluateProgram,review,opts}=L;
const t=trained([0,1]),s2=t.p.weeks[2].startDate;
const brk={startDate:s2,endDate:addDays(s2,13),days:14,reasonCategory:'VACATION',reason:'Holiday',nonclinical:true};
step(t,4,{day:0,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',interruption:brk});
const d1=addDays(t.p.weeks[4].startDate,1);
const cases={clinicalFlag:{eligibility:{...elig(d1),pain:true}},eligibilityUnknown:{eligibility:{status:'UNKNOWN'}},plainKind:{kind:'LOCAL_FATIGUE'},weekly:{}};
const out={root};
for(const [k,x] of Object.entries(cases)){const r=evaluateProgram(t.p,{...review(t.p,4,{day:1,hour:'07:00:00',...x}),actualLedger:t.ledger},opts);out[k]={status:r.status,returnsRecord:Array.isArray(r.actualLedger),declarationsInReturned:Array.isArray(r.actualLedger)?r.actualLedger.filter(o=>o.fact==='INTERRUPTION_DECLARED').length:null};}
console.log(JSON.stringify(out,null,1));
