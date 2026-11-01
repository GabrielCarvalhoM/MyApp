// R7-C Phase 3, step 2: the directed holdout regression (challenge reuse of the sealed R6 corpus, never fresh holdout evidence). H34, H20 (learning),
// H19, H22, H17, H21 (longitudinal) and the two expiry cases H35, H23, each evaluated with the sealed adapter (scripts/evaluate-holdout-r6.mjs) on
// R7B2-FREEZE-1 and on R7-C. Per step: status, action, missing inputs, learned patterns and the proposal's prescriptions; the learning cases also
// with learning consent off. A case UNSUPPORTED on both runtimes for the same reason is reported UNSUPPORTED_BY_EXISTING_EXPIRY when that reason is
// the review_by date of a bound record. Read-only; prints JSON.
import {REPO,R7B2_FREEZE_1,extract,load} from './phase3-lib.mjs';
const x=extract(R7B2_FREEZE_1);
const NOW=await load(REPO),B2=await load(x.root);
const CASES=['R6-H34','R6-H20','R6-H19','R6-H22','R6-H17','R6-H21','R6-H35','R6-H23'],LEARNING=['R6-H34','R6-H20','R6-H35'];
const plan=(rt,P)=>P?rt.hash(P.weeks.map(w=>w.sessions.map(s=>[s.id,s.prescription??null]))):null;
const runs=P=>P?P.weeks.map((w,k)=>`${k}:`+w.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED').map(s=>`${s.role}:${s.prescription.durationMinutes}`).join('/')):null;
const step=(rt,s)=>{const r=s.result;return {status:r.status,action:r.action??null,missing:r.missingInputs??[],question:r.question?.kind??null,learned:(r.learnedPatterns??[]).map(p=>p.kind??'REARRANGEMENT'),gates:r.gates??null,plan:plan(rt,r.proposal),reason:String(r.reason??'').slice(0,260)};};
const evalCase=(rt,id,consent=null)=>{const c=rt.clone(rt.corpus.cases.find(k=>k.caseId===id));if(consent!==null){(c.intake??c.programInput).learningConsent=consent;for(const s of c.steps??[])if(s.review&&'learningConsent' in s.review)s.review.learningConsent=consent;}
 try{const r=rt.evaluateHoldoutCase(c,rt.opts);return {generation:r.generation.status,steps:r.steps.map(s=>step(rt,s)),finalRuns:runs(r.steps.at(-1)?.result?.proposal??null)};}catch(e){return {error:String(e.message).slice(0,300)};}};
const out={baseline:{freeze:'R7B2-FREEZE-1',commit:x.commit},adapter:'CoachingCore/scripts/evaluate-holdout-r6.mjs (sealed corpus, challenge reuse)',cases:{}};
for(const id of CASES){
 const a=evalCase(B2,id),b=evalCase(NOW,id),row={B2:a,R7C:b};
 if(a.steps&&b.steps){
  row.stepDiffs=b.steps.map((s,i)=>{const p=a.steps[i];const same=p&&p.status===s.status&&p.action===s.action&&JSON.stringify(p.missing)===JSON.stringify(s.missing)&&p.plan===s.plan&&JSON.stringify(p.learned)===JSON.stringify(s.learned);return same?null:{step:'S'+(i+1),B2:p?`${p.status}/${p.action}`:null,R7C:`${s.status}/${s.action}${s.question?'/'+s.question:''}`,samePlan:p?.plan===s.plan,learnedR7C:s.learned};}).filter(Boolean);
  row.identical=!row.stepDiffs.length;
  const unsup=x=>x.steps.some(s=>s.status==='UNSUPPORTED');
  if(unsup(a)&&unsup(b))row.expiry={bothUnsupported:true,sameReason:a.steps.map(s=>s.reason).join('|')===b.steps.map(s=>s.reason).join('|'),reviewByInReason:b.steps.some(s=>/review_by|expired|review by|past its review/i.test(s.reason)),classification:null};
 }
 if(LEARNING.includes(id)&&b.steps){const off=evalCase(NOW,id,false);row.R7C_consentOff={steps:off.steps?.map(s=>`${s.status}/${s.action}`),plans:off.steps?.map(s=>s.plan)};row.R7C_consentOnEqualsOff=!!off.steps&&off.steps.every((s,i)=>s.plan===b.steps[i].plan&&s.status===b.steps[i].status);}
 out.cases[id]=row;
}
x.cleanup();
console.log(JSON.stringify(out,null,1));
