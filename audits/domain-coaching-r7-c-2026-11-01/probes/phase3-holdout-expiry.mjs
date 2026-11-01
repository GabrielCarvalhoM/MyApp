// R7-C Phase 3, step 2 (companion): (a) the expiry cases H35, H21, H23 under the real records and under a COUNTERFACTUAL copy of the 13 B0 SSCTR
// records whose expiry.review_by is moved past the case dates (nothing else changes). If a case is UNSUPPORTED with the real records on both runtimes
// and supported with the counterfactual records, its UNSUPPORTED is the pre-existing record expiry (UNSUPPORTED_BY_EXISTING_EXPIRY), not R7-C. The
// counterfactual decisions are also compared between the runtimes (development evidence only: those records are not the bound authority).
// (b) H22 per step: gates, week evidence rows of the long run, action and reason on both runtimes (the D2 record-fidelity change).
// Read-only; prints JSON.
import fs from 'node:fs';
import path from 'node:path';
import {REPO,R7B2_FREEZE_1,extract,load} from './phase3-lib.mjs';
const x=extract(R7B2_FREEZE_1);
const NOW=await load(REPO),B2=await load(x.root);
const raw=JSON.parse(fs.readFileSync(path.join(REPO,'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json'),'utf8')),records=Array.isArray(raw)?raw:raw.records;
const extended=records.map(r=>({...r,expiry:{...r.expiry,review_by:'2099-12-31'}}));
const plan=(rt,P)=>P?rt.hash(P.weeks.map(w=>w.sessions.map(s=>[s.id,s.prescription??null]))):null;
// The longest prefix of the case's steps that the sealed adapter resolves (a corpus fact can name a session the adopted proposal no longer has).
const run=(rt,id,options)=>{const c0=rt.corpus.cases.find(k=>k.caseId===id);let error=null;
 for(let n=c0.steps.length;n>=1;n--){const c=rt.clone(c0);c.steps=c.steps.slice(0,n);try{const r=rt.evaluateHoldoutCase(c,options);return {generation:r.generation.status,generationReason:String(r.generation.reason??'').slice(0,200),stepsRun:n,of:c0.steps.length,...(error?{laterStepError:error}:{}),steps:r.steps.map(s=>({status:s.result.status,action:s.result.action??null,question:s.result.question?.kind??null,plan:plan(rt,s.result.proposal),reason:String(s.result.reason??'').slice(0,200)}))};}catch(e){error=error??String(e.message).slice(0,300);}}
 return {error};};
const out={baseline:{freeze:'R7B2-FREEZE-1',commit:x.commit},counterfactual:'expiry.review_by of the 13 B0 records moved to 2099-12-31 (development evidence only)',expiry:{},H22:null};
for(const id of ['R6-H35','R6-H21','R6-H23']){
 const real={B2:run(B2,id,B2.opts),R7C:run(NOW,id,NOW.opts)},cf={B2:run(B2,id,{...B2.opts,repertoireRecords:extended}),R7C:run(NOW,id,{...NOW.opts,repertoireRecords:extended})};
 const unsupported=r=>r.generation==='UNSUPPORTED'||r.steps?.some(s=>s.status==='UNSUPPORTED');
 const supported=r=>!r.error&&r.generation!=='UNSUPPORTED'&&r.steps.length>0&&!r.steps.some(s=>s.status==='UNSUPPORTED');
 const sameDecisions=(a,b)=>a.generation===b.generation&&a.stepsRun===b.stepsRun&&(a.laterStepError??null)===(b.laterStepError??null)&&JSON.stringify(a.steps?.map(s=>[s.status,s.action,s.question,s.plan]))===JSON.stringify(b.steps?.map(s=>[s.status,s.action,s.question,s.plan]));
 out.expiry[id]={real,counterfactual:cf,classification:unsupported(real.B2)&&unsupported(real.R7C)&&sameDecisions(real.B2,real.R7C)&&supported(cf.B2)&&supported(cf.R7C)?'UNSUPPORTED_BY_EXISTING_EXPIRY':'NOT_EXPIRY_ONLY',counterfactualSameOnBothRuntimes:sameDecisions(cf.B2,cf.R7C)};
}
{
 const detail=rt=>{const c=rt.clone(rt.corpus.cases.find(k=>k.caseId==='R6-H22')),r=rt.evaluateHoldoutCase(c,rt.opts);
  return r.steps.map((s,i)=>({step:'S'+(i+1),kind:s.review.event?.kind,status:s.result.status,action:s.result.action,gates:s.result.gates??null,longRows:(s.result.weekEvidence?.rows??[]).filter(x=>x.role==='LONG').map(x=>`${x.sessionId}:${x.status}`),instantiationOnly:s.result.instantiationOnly??null,reason:String(s.result.reason??'').slice(0,240),nextLong:(()=>{const P=s.result.proposal;if(!P)return null;const w=(s.review.weekIndex??0)+1;return P.weeks[w]?.sessions.filter(z=>z.role==='LONG'&&z.prescription).map(z=>z.prescription.durationMinutes)??null;})()}));};
 out.H22={B2:detail(B2),R7C:detail(NOW)};
}
x.cleanup();
console.log(JSON.stringify(out,null,1));
