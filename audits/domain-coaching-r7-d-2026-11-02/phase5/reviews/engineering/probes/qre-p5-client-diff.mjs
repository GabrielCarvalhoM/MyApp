// QRE-R7D-PHASE5-REVIEW-r1 (read-only): client.mjs (R7D-HARNESS-8) against client-9.mjs on the same runtime copy, every case of the DEV-9 and
// diagnostic corpora: the cases whose decisions, corpus errors or stop differ (Δ49 claims only a pattern-only substitution reference changes).
//   node qre-p5-client-diff.mjs --root <extracted root>
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const AUD=path.resolve(import.meta.dirname,'../../../..'),H=p=>pathToFileURL(path.join(AUD,'harness',p)).href;
const c8=await import(H('lib/client.mjs')),c9=await import(H('lib/client-9.mjs')),u=await import(H('lib/util.mjs'));
const rt=await c9.loadRuntime(path.join(arg('--root'),'CoachingCore')),view=b=>u.digestOf({s:b.steps.map(s=>s.result),e:b.corpusErrors.map(x=>x.message),st:b.stopped});
for(const f of ['harness/validation/DEV_CASES_R7D_9.json','diagnostic/R7D_DIAGNOSTIC_CORPUS.json']){const d=JSON.parse(fs.readFileSync(path.join(AUD,f),'utf8'));
 console.log(f,d.cases.length,'differ:',d.cases.filter(k=>view(c8.runCase(rt,k))!==view(c9.runCase(rt,k))).map(k=>k.caseId));}
