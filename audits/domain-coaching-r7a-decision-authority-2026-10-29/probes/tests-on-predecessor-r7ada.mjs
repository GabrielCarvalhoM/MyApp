// Author probe: this mission's new and edited test files run against a runtime snapshot (default: the byte-exact STATE-MODEL-CONSUMER-FREEZE-1
// copy), to show which of them discriminate. Builds the snapshot in a temporary folder (every file its MANIFEST binds, checked byte for byte, plus
// the unchanged inputs the tests read), copies the live test files named below into it, runs `node --test` on them there and prints the per-test
// outcome as JSON. Writes nothing outside the temporary folder.
// Usage: node tests-on-predecessor-r7ada.mjs [snapshot]   (snapshot relative to the repository root)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../../..'),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const snap=process.argv[2]??'audits/domain-coaching-r7a-decision-authority-2026-10-29/state-consumer-freeze-source',manifest=JSON.parse(fs.readFileSync(path.join(root,snap,'MANIFEST.json'),'utf8'));
const TESTS=['CoachingCore/test/r7ada-decision-authority.test.mjs','CoachingCore/test/r7asc-state-consumer.test.mjs','CoachingCore/test/r7ab-week-start-authority.test.mjs','CoachingCore/test/r7ase-state-evidence.test.mjs'];
const SUPPORT=['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json','CoachingCore/r6/fixtures/trajectories.mjs'];
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7ada-tests-')),put=(from,to)=>{fs.mkdirSync(path.dirname(path.join(tmp,to)),{recursive:true});fs.copyFileSync(from,path.join(tmp,to));};
try{
 for(const [rel,d] of Object.entries(manifest.files)){if(sha(path.join(root,snap,rel))!==d)throw Error('drift '+rel);put(path.join(root,snap,rel),rel);}
 for(const p of [...SUPPORT,...TESTS])put(path.join(root,p),p);
 const r=spawnSync(process.execPath,['--test','--test-reporter=tap',...TESTS.map(p=>p.replace(/^CoachingCore\//,''))],{cwd:path.join(tmp,'CoachingCore'),encoding:'utf8',maxBuffer:256*1024*1024});
 const tests=[...r.stdout.matchAll(/^\s*(not ok|ok) \d+ - (.+)$/gm)].map(m=>({name:m[2].trim(),pass:m[1]==='ok'})).filter(x=>!/\.test\.mjs$/.test(x.name));
 console.log(JSON.stringify({probe:'tests-on-predecessor-r7ada',snapshot:snap,sourceDigest:manifest.freeze.sourceDigest,files:TESTS,testFileSha256:Object.fromEntries(TESTS.map(p=>[p,sha(path.join(root,p))])),total:tests.length,passing:tests.filter(t=>t.pass).length,failing:tests.filter(t=>!t.pass).map(t=>t.name),passingNames:tests.filter(t=>t.pass).map(t=>t.name)},null,1));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
