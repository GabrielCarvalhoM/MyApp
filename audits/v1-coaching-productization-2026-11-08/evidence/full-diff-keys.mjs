// For each H1 step whose full result differs between FREEZE-6 and the candidate: the top-level keys that differ, and whether the record differs
// only by added CLINICAL_HOLD rows. Usage: node full-diff-keys.mjs <baseRoot> <candidateRoot>
import path from 'node:path';import fs from 'node:fs';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';
const [baseRoot,candRoot]=process.argv.slice(2),audit=r=>path.join(r,'audits/domain-coaching-r7-d-2026-11-02');
const client=await import(pathToFileURL(path.join(audit(candRoot),'harness/lib/client-9.mjs')).href);
const A=await client.loadRuntime(path.join(baseRoot,'CoachingCore')),B=await client.loadRuntime(path.join(candRoot,'CoachingCore'));
const sha=v=>createHash('sha256').update(JSON.stringify(v??null)).digest('hex').slice(0,16);
const H1=JSON.parse(fs.readFileSync(path.join(audit(candRoot),'final2/R7D_FINAL_HOLDOUT_2.json'),'utf8'));
const summaryDiff=new Set(['R7D-H05#s4','R7D-H07#s1','R7D-H07#s2','R7D-H20#s1','R7D-H20#s2','R7D-H28#s4','R7D-H32#s1','R7D-H32#s2','R7D-H32#s3','R7D-H32#s4','R7D-H32#s5','R7D-H34#s2','R7D-H34#s3']);
for(const kase of H1.cases){const ta=client.runCase(A,kase),tb=client.runCase(B,kase);
 for(let i=0;i<Math.max(ta.steps.length,tb.steps.length);i++){const a=ta.steps[i]?.result,b=tb.steps[i]?.result,id=kase.caseId+'#'+(ta.steps[i]?.stepId??tb.steps[i]?.stepId);if(sha(a)===sha(b))continue;
  const keys=[...new Set([...Object.keys(a??{}),...Object.keys(b??{})])].filter(k=>sha(a?.[k])!==sha(b?.[k]));
  const la=(a?.actualLedger??[]),lb=(b?.actualLedger??[]),extra=lb.filter(o=>o?.fact==='CLINICAL_HOLD'),onlyHold=sha(la)===sha(lb.filter(o=>o?.fact!=='CLINICAL_HOLD'));
  console.log(id.padEnd(14),summaryDiff.has(id)?'SUMMARY':'record ',keys.join(','),'| holdRows',extra.length,'| ledger equal without them',onlyHold,'| status',a?.status,'>',b?.status);}}
