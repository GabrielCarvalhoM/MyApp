// R7-D Phase 3.1 engineering check: attribution of every candidate-vs-R7D-FREEZE-1 difference, stronger than "a stated break came before it".
// For each case of the three differential corpora (diagnostic, generated, dev 3):
//  A. the candidate run against the R7D-FREEZE-1 run (canonical step view, the author's comparison);
//  B. the candidate run against R7D-FREEZE-1 run on the same case with the athlete restating the kept break: every later review that states no
//     break of its own carries the latest stated break until the plan records a return at or after it. If the only change is retention
//     ("as if stated there", D2), B is identical at every step;
//  C. the execution record (actualLedger without INTERRUPTION_DECLARED rows) at every step, candidate against R7D-FREEZE-1: must be identical.
//   node qe31-differential-attribution.mjs --cand <root: CoachingCore + audits/domain-coaching-r7-d-2026-11-02> --d1 <R7D-FREEZE-1 root> [--out f]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const cand=path.resolve(arg('--cand')),d1=path.resolve(arg('--d1')),outFile=arg('--out'),AUD='audits/domain-coaching-r7-d-2026-11-02';
const imp=p=>import(pathToFileURL(path.join(cand,AUD,p)).href);
const {loadRuntime,runCase}=await imp('harness/lib/client.mjs'),{stepView,generationView}=await imp('harness/lib/canonical.mjs'),{statedBreakOf}=await imp('harness/lib/properties.mjs'),{canonicalJson,localDate,clone}=await imp('harness/lib/util.mjs');
const C=await loadRuntime(path.join(cand,'CoachingCore')),F1=await loadRuntime(path.join(d1,'CoachingCore'));
const corpora=[['DIAGNOSTIC','diagnostic/R7D_DIAGNOSTIC_CORPUS.json'],['GENERATED','diagnostic/generated/R7D_GENERATED_DIAGNOSTIC.json'],['DEV3','harness/validation/DEV_CASES_R7D_3.json']];
const view=t=>({gen:generationView(t),steps:t.steps.map(s=>({id:s.stepId,...stepView(s,{scope:'ALL'})})),stopped:t.stopped});
const firstDiff=(a,b)=>{if(canonicalJson(a.gen)!==canonicalJson(b.gen))return 'GENERATE';for(let i=0;i<Math.max(a.steps.length,b.steps.length);i++)if(canonicalJson(a.steps[i])!==canonicalJson(b.steps[i]))return a.steps[i]?.id??b.steps[i]?.id;return null;};
const execRecord=t=>t.steps.map(s=>canonicalJson((s.result.actualLedger??null)?.filter(r=>r?.fact!=='INTERRUPTION_DECLARED')??null));
/** The athlete restates the kept break: the latest stated break, until the variant's own plan records a return at or after it. */
const restated=kase=>{let kept=null;return runCase(F1,kase,{review:(r,{st})=>{
 const day=localDate(r.asOf,st.program.timezoneOffsetMinutes??0);
 if(r.interruption!==undefined&&r.interruption!==null){const b=statedBreakOf(r,day);if(b)kept={brk:clone(b),clock:Date.parse(r.asOf)};return r;}
 if(!kept)return r;
 if(st.program.decisions.some(d=>d.action==='REESTABLISH'&&Date.parse(d.asOf)>=kept.clock)){kept=null;return r;}
 return {...r,interruption:clone(kept.brk)};
}});};
const rows=[];
for(const [label,file] of corpora){
 const corpus=JSON.parse(fs.readFileSync(path.join(cand,AUD,file),'utf8'));
 for(const kase of corpus.cases){
  const c=runCase(C,kase),f=runCase(F1,kase),fr=restated(kase);
  const A=firstDiff(view(f),view(c)),B=firstDiff(view(fr),view(c));
  const ec=execRecord(c),ef=execRecord(f),recDiff=ec.findIndex((x,i)=>x!==ef[i]);
  // At the first step whose execution record differs: does each runtime return a record there, and do the two records differ only in order or in a
  // derived field (the binding context), with the same rows and the same facts (actual, observedAt, sessionId)?
  const at=recDiff<0?null:{cand:c.steps[recDiff]?.result.actualLedger,freeze1:f.steps[recDiff]?.result.actualLedger};
  const facts=l=>Array.isArray(l)?l.filter(r=>r?.fact!=='INTERRUPTION_DECLARED').map(r=>canonicalJson({e:r.eventId,a:r.actual,o:r.observedAt,s:r.sessionId,sup:!!r.superseded})).sort():null;
  const recordAt=at?{candReturnsRecord:Array.isArray(at.cand),freeze1ReturnsRecord:Array.isArray(at.freeze1),sameFacts:canonicalJson(facts(at.cand))===canonicalJson(facts(at.freeze1)),
   contextChanged:Array.isArray(at.cand)&&Array.isArray(at.freeze1)?at.cand.filter(r=>r?.fact!=='INTERRUPTION_DECLARED').filter(r=>{const y=at.freeze1.find(x=>x.eventId===r.eventId);return y&&canonicalJson(y.context)!==canonicalJson(r.context);}).map(r=>r.sessionId):null}:null;
  rows.push({corpus:label,caseId:kase.caseId,A_firstDiffVsFreeze1:A,B_firstDiffVsFreeze1Restated:B,C_executionRecordFirstDiffStep:recDiff<0?null:c.steps[recDiff]?.stepId??recDiff,recordAt,
   restatedSteps:fr.steps.filter((s,i)=>s.review.interruption&&!kase.timeline[i]?.event?.interruption&&!kase.timeline[i]?.answer?.declareBreak).map(s=>s.stepId)});
 }
}
const out={probe:'qe31-differential-attribution',cases:rows.length,differVsFreeze1:rows.filter(r=>r.A_firstDiffVsFreeze1).map(r=>r.caseId),
 differVsFreeze1Restated:rows.filter(r=>r.B_firstDiffVsFreeze1Restated).map(r=>({caseId:r.caseId,at:r.B_firstDiffVsFreeze1Restated})),
 executionRecordDiffers:rows.filter(r=>r.C_executionRecordFirstDiffStep!==null).map(r=>({caseId:r.caseId,at:r.C_executionRecordFirstDiffStep})),rows};
const text=JSON.stringify(out,null,1);if(outFile)fs.writeFileSync(outFile,text+'\n');
console.log(JSON.stringify({cases:out.cases,differVsFreeze1:out.differVsFreeze1,differVsFreeze1Restated:out.differVsFreeze1Restated,executionRecordDiffers:out.executionRecordDiffers,restatedIn:rows.filter(r=>r.restatedSteps.length).map(r=>r.caseId+':'+r.restatedSteps.join('/'))},null,1));
