// SSCTR final recheck on R7C-FREEZE-1 (record SSCTR-FR-R7C-r3): does the frozen legacy split discriminate between runtimes?
// It runs the five split tests as frozen (the bytes of commit 1890f66) against three runtimes, swapping only src/r6-adaptation.mjs and
// src/r6-composition.mjs and keeping every other frozen byte:
// - FROZEN: the frozen runtime itself (control; all five must pass);
// - PHASE4: the Phase 4 runtime (6240080), which still had SSCTR-SD-01 (a mid-week known-stop answer kept the stale projection);
// - B2: R7B2-FREEZE-1 (1a1c728), which reads an unreported session as missed.
// Read-only on the repository. The frozen tree is extracted with a temporary index file kept under the scratch directory given (git read-tree
// and git checkout-index --prefix; the repository index and worktree are not touched). node_modules (ajv, untracked) is copied from the worktree.
// Usage: node legacy-split-crossruntime.mjs <scratch dir outside the repository>. Prints JSON.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {run} from 'node:test';
const HERE=path.dirname(fileURLToPath(import.meta.url)),REPO=path.resolve(HERE,'../../../../../..'),SCRATCH=path.resolve(process.argv[2]??'');
if(!process.argv[2]||SCRATCH.startsWith(REPO))throw Error('give a scratch directory outside the repository');
const FROZEN='1890f66356455112907d757032a8b1cd2de29c00',BASES={FROZEN,PHASE4:'6240080',B2:'1a1c7286adc8b08d16f97dea86f4973fe33e5a95'};
const SRC=['CoachingCore/src/r6-adaptation.mjs','CoachingCore/src/r6-composition.mjs'];
const FILES=['r6-engineering-fixes.test.mjs','r6-ssctr-revision.test.mjs','r7asc-state-consumer.test.mjs','r7b-hybrid-program.test.mjs','r6-adaptation.test.mjs'];
const LEGACY={'QRE-R6-04':'QRE-R6-04:','D18':'D18: with no completed run','F3/H25':'SSCTR F3 (R6-H25)','§19':'Program-level progression (request §19)','FIFTH':'Adaptation: nonclinical return is staged'};
const git=(args,opts={})=>{const r=spawnSync('git',args,{cwd:REPO,maxBuffer:1<<28,...opts});if(r.status!==0)throw Error('git '+args.join(' ')+': '+String(r.stderr));return r.stdout;};
const sha=b=>createHash('sha256').update(b).digest('hex');
function tree(id,base){
 const dir=path.join(SCRATCH,id),idx=path.join(SCRATCH,id+'.index');fs.rmSync(dir,{recursive:true,force:true});fs.rmSync(idx,{force:true});fs.mkdirSync(dir,{recursive:true});
 const env={...process.env,GIT_INDEX_FILE:idx};
 git(['read-tree',FROZEN],{env});
 const list=String(git(['ls-files','--','CoachingCore','audits/domain-coaching-r7-b0-2026-10-31/reviews'],{env})).split('\n').filter(Boolean).filter(p=>!p.startsWith('CoachingCore/node_modules/'));
 git(['checkout-index','--prefix='+dir.replace(/\\/g,'/')+'/','--stdin'],{env,input:list.join('\n')+'\n'});
 fs.cpSync(path.join(REPO,'CoachingCore/node_modules'),path.join(dir,'CoachingCore/node_modules'),{recursive:true});
 const swapped={};for(const p of SRC){const b=git(['show',`${base}:${p}`]);fs.writeFileSync(path.join(dir,p),b);swapped[p]=sha(b);}
 const tests={};for(const f of FILES)tests[f]=sha(fs.readFileSync(path.join(dir,'CoachingCore/test',f)));
 fs.rmSync(idx,{force:true});
 return {dir,files:list.length,swapped,tests};
}
async function runTests(dir){
 const out={};const core=path.join(dir,'CoachingCore');
 const stream=run({files:FILES.map(f=>path.join(core,'test',f)),cwd:core,concurrency:1});
 const done=new Promise((res,rej)=>{stream.on('end',res);stream.on('error',rej);});
 stream.on('test:pass',d=>{if(d.nesting===0)for(const [k,pre] of Object.entries(LEGACY))if(d.name.startsWith(pre))out[k]={result:'PASS'};});
 stream.on('test:fail',d=>{if(d.nesting===0)for(const [k,pre] of Object.entries(LEGACY))if(d.name.startsWith(pre)){const e=d.details?.error,c=e?.cause??e;out[k]={result:'FAIL',message:String(c?.message??e?.message??e).split('\n').map(s=>s.trim()).filter(Boolean).slice(0,14).join(' | ').slice(0,900)};}});
 stream.resume?.();for await(const _ of stream){}await done.catch(()=>{});
 return out;
}
const result={probe:'legacy-split-crossruntime',record:'SSCTR-FR-R7C-r3',frozenCommit:FROZEN,node:process.version,ran:new Date().toISOString(),runs:{}};
for(const [id,base] of Object.entries(BASES)){
 const t=tree(id,base);
 result.runs[id]={base,extractedFiles:t.files,swappedSrcSha256:t.swapped,testSha256:t.tests,legacy:await runTests(t.dir)};
}
console.log(JSON.stringify(result,null,1));
