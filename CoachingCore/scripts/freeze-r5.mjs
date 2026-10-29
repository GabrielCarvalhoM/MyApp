import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {hash} from '../src/value.mjs';
const root=new URL('../../',import.meta.url),out=new URL('../r5/RUNTIME_FREEZE_R5.json',import.meta.url);
const files=fs.readdirSync(new URL('../src/',import.meta.url)).filter(n=>n.startsWith('r5-')&&n.endsWith('.mjs')).map(n=>'CoachingCore/src/'+n).concat(['CoachingCore/src/value.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','CoachingCore/r4/PRESCRIPTION_ENVELOPE_REGISTRY.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json','CoachingCore/scripts/evaluate-holdout-r5.mjs','CoachingCore/r5/holdout/INTERFACE_ONLY.md']);
const entries=files.sort().map(path=>({path,sha256:createHash('sha256').update(fs.readFileSync(new URL(path,root))).digest('hex')}));
const sourceDigest=hash(entries);
if(fs.existsSync(out)){const prior=JSON.parse(fs.readFileSync(out,'utf8'));assert.equal(prior.sourceDigest,sourceDigest,'Frozen inputs changed; preserve freeze/first evidence and explicitly version any successor');console.log('Freeze unchanged '+sourceDigest);}
else{fs.writeFileSync(out,JSON.stringify({revision:'R5-FREEZE-1',frozenAt:new Date().toISOString(),node:process.version,sourceDigest,entries,holdoutAuthorStarted:false,scope:'Implementation and reusable authority frozen before fresh independent corpus author starts'},null,2)+'\n',{flag:'wx'});console.log('Frozen '+sourceDigest);}
