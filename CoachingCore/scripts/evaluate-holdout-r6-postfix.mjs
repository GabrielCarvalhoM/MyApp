import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {evaluateHoldoutCase} from './evaluate-holdout-r6.mjs';

/**
 * Post-fix rerun of the sealed R6 holdout on FREEZE-2, with the same evaluator adapter as the first evaluation. This is
 * challenge reuse, never fresh evidence: the first evaluation on FREEZE-1 stays the primary record and is checked
 * unchanged. Writes CoachingCore/r6/holdout/POSTFIX_EVALUATION_FREEZE2.json once.
 */
const root=path.resolve(import.meta.dirname,'../..'),folder=path.join(root,'CoachingCore/r6/holdout');
const raw=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex'),json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const f1=json(path.join(root,'CoachingCore/r6/RUNTIME_FREEZE_R6.json')),f2=json(path.join(root,'CoachingCore/r6/RUNTIME_FREEZE_R6_2.json'));
for(const e of f2.entries)assert.equal(raw(path.join(root,e.path)),e.sha256,'FREEZE-2 input changed: '+e.path);
assert.equal(f2.predecessor.sourceDigest,f1.sourceDigest,'FREEZE-2 must follow FREEZE-1');
const manifest=json(path.join(folder,'INDEPENDENCE_MANIFEST.json')),corpusPath=path.join(folder,'R6_INDEPENDENT_HOLDOUT.json');
assert.equal(raw(corpusPath),manifest.corpusSha256,'Sealed corpus changed');
const first=path.join(folder,'FIRST_EVALUATION.json');
assert.equal(raw(first),f2.firstEvaluation.sha256,'The first evaluation must be unchanged');
const out=path.join(folder,'POSTFIX_EVALUATION_FREEZE2.json');assert.equal(fs.existsSync(out),false,'Post-fix raw is written once');
const corpus=json(corpusPath);
const rows=corpus.cases.map(c=>{try{return {caseId:c.caseId,output:evaluateHoldoutCase(c),error:null};}catch(e){return {caseId:c.caseId,output:null,error:{name:e.name,message:e.message}};}});
fs.writeFileSync(out,JSON.stringify({revision:'R6-HOLDOUT-POSTFIX-1',evaluatedAt:new Date().toISOString(),sourceDigest:f2.sourceDigest,predecessorDigest:f1.sourceDigest,corpusSha256:manifest.corpusSha256,firstEvaluation:false,challengeReuse:true,firstEvaluationSha256:f2.firstEvaluation.sha256,note:'Same sealed corpus and adapter after the FREEZE-2 engineering fixes; secondary evidence, never fresh holdout evidence',rows},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({cases:rows.length,errors:rows.filter(r=>r.error).length,sourceDigest:f2.sourceDigest}));
