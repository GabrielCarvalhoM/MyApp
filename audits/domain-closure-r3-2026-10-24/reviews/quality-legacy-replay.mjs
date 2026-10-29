import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {evaluateShadow,ShadowJournal} from '../../../CoachingCore/src/index.mjs';
import {hash} from '../../../CoachingCore/src/value.mjs';
const root=new URL('../../../',import.meta.url);
const files=['CoachingCore/r2/RUNTIME_R2_TRACES.json','CoachingCore/r2/legacy-replay/RUNTIME_TRACE_EXAMPLES.json'];
const rawHash=p=>createHash('sha256').update(fs.readFileSync(new URL(p,root))).digest('hex');
const results=[];
for(const file of files){
 const doc=JSON.parse(fs.readFileSync(new URL(file,root),'utf8'));
 const j=new ShadowJournal();let positive=0;
 for(const t of doc.traces){
  const before=hash(t.input),a=evaluateShadow(t.input),e=Object.fromEntries(['mode','officialPlanState','observedExecutionState','shadowDecision','appliedState'].map(k=>[k,t[k]]));
  assert.deepEqual(a,e,file+' saved trace mismatch');
  assert.equal(hash(t.input),before);
  assert.deepEqual(a.appliedState,t.input.officialPlanState??null);
  assert.equal(a.shadowDecision.applied,false);
  assert.equal(j.record(t.input).duplicate,false);
  assert.equal(j.record(t.input).duplicate,true);
  assert.deepEqual(evaluateShadow(t.input),a);
  if(a.shadowDecision.decisionType==='MODIFY')positive++;
 }
 results.push({file,sha256:rawHash(file),savedUniqueInputs:doc.traces.length,exactReplay:doc.traces.length,positive,identicalInputFlips:0,inputMutations:0,officialPlanMutations:0,appliedEffects:0,journalEntries:j.size});
}
const manifest=JSON.parse(fs.readFileSync(new URL('audits/domain-closure-r3-2026-10-24/before/MANIFEST.json',root),'utf8'));
const corpus=manifest.entries.find(e=>e.path==='CoachingCore/r2/evaluation/REPRESENTATIVE_CORPUS_R2.json');assert.equal(rawHash(corpus.path),corpus.sha256);
const targetHashes=Object.fromEntries(['CoachingCore/src/runtime.mjs','CoachingCore/src/r2-runtime.mjs','CoachingCore/src/semantics.mjs','CoachingCore/src/value.mjs','CoachingCore/r2/POSITIVE_PRESCRIPTION_REGISTRY.json','CoachingCore/r2/SSCTR_RUNTIME_AUTHORITY.json',corpus.path].map(p=>[p,rawHash(p)]));
const out={evaluator:'/root/quality_r3',independent:true,executedAt:new Date().toISOString(),node:process.version,status:'PASS',results,frozenCorpusPreserved:true,targetHashes,limits:'Exact saved executable replay is a synthetic regression/conservation check, not fresh sporting or efficacy approval.'};
fs.writeFileSync(new URL('quality-legacy-replay.raw.json',import.meta.url),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out,null,2));
