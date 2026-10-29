// Author runner (R7-A DECISION AUTHORITY, Founder request §24: earlier blockers stay closed): re-runs, unchanged, every earlier judge probe the
// state model consumer closure re-ran (audits/domain-coaching-r7a-state-consumer-2026-10-29/probes/EVIDENCE_RUNS_R7ASC.json, names qe-*), with
// the same environment and the repository root as working directory, on the live tree. Each output goes to <outDir>/<name>.out.json and is
// compared byte for byte with the output that run recorded on STATE-MODEL-CONSUMER-FREEZE-1 (probes/runs/<name>.out.json there); a differing
// output is listed for its named cause. Usage: node rerun-judges-r7ada.mjs <outDir>
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const repo=path.resolve(import.meta.dirname,'../../..'),outDir=path.resolve(process.argv[2]??path.join(import.meta.dirname,'judges'));
const prior='audits/domain-coaching-r7a-state-consumer-2026-10-29/probes',ev=JSON.parse(fs.readFileSync(path.join(repo,prior,'EVIDENCE_RUNS_R7ASC.json'),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
fs.mkdirSync(outDir,{recursive:true});
const results=[];
for(const r of ev.runs.filter(r=>/^qe-/.test(r.name))){
 const abs=path.join(repo,r.script),t0=Date.now(),p=spawnSync(process.execPath,[abs],{cwd:repo,env:{...process.env,...(r.env??{})},encoding:'buffer',maxBuffer:512*1024*1024});
 const out=p.stdout??Buffer.alloc(0),err=p.stderr??Buffer.alloc(0);
 fs.writeFileSync(path.join(outDir,r.name+'.out.json'),out);if(err.length)fs.writeFileSync(path.join(outDir,r.name+'.err.txt'),err);
 const before=path.join(repo,prior,'runs',r.name+'.out.json'),bytes=fs.existsSync(before)?fs.readFileSync(before):null;
 results.push({name:r.name,script:r.script,env:r.env??{},exit:p.status,seconds:Math.round((Date.now()-t0)/1000),scriptSha256:sha(fs.readFileSync(abs)),scriptUnchanged:sha(fs.readFileSync(abs))===r.scriptSha256,outSha256:sha(out),predecessorOutSha256:bytes?sha(bytes):null,identicalToPredecessor:bytes?sha(bytes)===sha(out):null,stderrBytes:err.length});
}
const summary={runs:results.length,failed:results.filter(r=>r.exit!==0).map(r=>r.name),identical:results.filter(r=>r.identicalToPredecessor).length,different:results.filter(r=>r.identicalToPredecessor===false).map(r=>r.name),scriptsChanged:results.filter(r=>!r.scriptUnchanged).map(r=>r.name)};
fs.writeFileSync(path.join(outDir,'RUNS.json'),JSON.stringify({revision:'R7ADA-JUDGES-RERUN',node:process.version,summary,results},null,1)+'\n');
console.log(JSON.stringify(summary,null,1));
