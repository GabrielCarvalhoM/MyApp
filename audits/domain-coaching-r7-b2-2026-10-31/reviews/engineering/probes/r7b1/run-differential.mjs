// QE-R7B2 judge: runs verbatim copies of the R7-B.1 Engineering recheck probes (R7B1-ENG-r2; the at-commit, c-mutation and adversarial copies
// excluded: they archive, mutate or are run separately) on both runtimes and compares their results, label strings removed. The copies write only
// into ./out (lib.mjs resolves out next to itself). Usage: node run-differential.mjs <NOW root> <PRED root>
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),[NOWR,PREDR]=process.argv.slice(2).map(p=>path.resolve(p));
const probes=fs.readdirSync(HERE).filter(f=>f.endsWith('.mjs')&&!['lib.mjs','run-differential.mjs'].includes(f)).sort();
const run=(probe,root,label)=>{const t0=Date.now();const r=spawnSync(process.execPath,[path.join(HERE,probe),root,label],{cwd:HERE,encoding:'utf8',env:{...process.env,PROBE_ROOT:root,PROBE_LABEL:label},maxBuffer:64*1024*1024,timeout:900000});return {status:r.status,ms:Date.now()-t0,stdout:String(r.stdout).trim().split('\n').at(-1),stderr:String(r.stderr).slice(0,400)};};
const norm=(o,label)=>JSON.parse(JSON.stringify(o.results??o).split(label).join('<LABEL>').replace(/"ran":"[^"]*"/g,'"ran":""'));
const rows=[];
for(const p of probes){
 const name=p.replace(/\.mjs$/,''),a=run(p,PREDR,'J-PRED'),b=run(p,NOWR,'J-NOW');
 const fa=fs.readdirSync(path.join(HERE,'out')).find(f=>f.startsWith(name)&&f.includes('J-PRED')),fb=fs.readdirSync(path.join(HERE,'out')).find(f=>f.startsWith(name)&&f.includes('J-NOW'));
 let same=null,verdicts=null,diffIds=[];
 if(fa&&fb){const A=norm(JSON.parse(fs.readFileSync(path.join(HERE,'out',fa),'utf8')),'J-PRED'),B=norm(JSON.parse(fs.readFileSync(path.join(HERE,'out',fb),'utf8')),'J-NOW');
  same=JSON.stringify(A)===JSON.stringify(B);
  if(Array.isArray(A)&&Array.isArray(B)){verdicts={pred:A.map(x=>x.id+':'+x.verdict),now:B.map(x=>x.id+':'+x.verdict)};diffIds=B.filter((x,i)=>JSON.stringify(x)!==JSON.stringify(A[i])).map(x=>x.id);}}
 rows.push({probe:name,exit:{pred:a.status,now:b.status},ms:{pred:a.ms,now:b.ms},same,diffIds,verdicts,stdout:{pred:a.stdout,now:b.stdout},stderr:(a.stderr||b.stderr)?{pred:a.stderr,now:b.stderr}:undefined});
 console.log(name.padEnd(36),'same='+same,'diff='+JSON.stringify(diffIds),'ms',a.ms,b.ms);
}
fs.writeFileSync(path.join(HERE,'out','r7b1-probes-differential.json'),JSON.stringify({ran:new Date().toISOString(),now:'worktree (R7B2-FREEZE-1)',pred:'temporary git archive of 146ebb8 (R7B1-FREEZE-2)',rows},null,1)+'\n');
