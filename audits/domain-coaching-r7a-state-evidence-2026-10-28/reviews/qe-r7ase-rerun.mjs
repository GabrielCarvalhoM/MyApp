// R7ASE-QE-r1 re-run harness (independent engineering judge): re-runs every engineering probe of probes/EVIDENCE_RUNS_R7ASE.json (the SSCTR
// grids and instrument excluded) on the frozen bytes, with each job's own environment, and compares the SHA-256 of its stdout with the
// author's recorded outSha256. Outputs go to reviews/qe-r7ase-runs/rerun/. Never runs an evidence runner, freeze, prepare, queue, regress or
// mutation script. Usage: node qe-r7ase-rerun.mjs [concurrency]
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const here=import.meta.dirname,repo=path.resolve(here,'../../..'),outDir=path.join(here,'qe-r7ase-runs','rerun');
fs.mkdirSync(outDir,{recursive:true});
const manifest=JSON.parse(fs.readFileSync(path.join(here,'../probes/EVIDENCE_RUNS_R7ASE.json'),'utf8'));
const jobs=manifest.runs.filter(r=>!/ssctr/i.test(r.name)&&!/run-evidence|mutation-check|freeze-|prepare-|queue-|regress-/.test(r.script));
const conc=Number(process.argv[2]??4),results=[];let next=0;
const run=job=>new Promise(res=>{const t0=Date.now(),chunks=[],errs=[];
 const p=spawn(process.execPath,[path.join(repo,job.script)],{cwd:path.dirname(path.join(repo,job.script)),env:{...process.env,...job.env}});
 p.stdout.on('data',d=>chunks.push(d));p.stderr.on('data',d=>errs.push(d));
 p.on('close',code=>{const out=Buffer.concat(chunks),sha=createHash('sha256').update(out).digest('hex');fs.writeFileSync(path.join(outDir,job.name+'.out.json'),out);fs.writeFileSync(path.join(outDir,job.name+'.err.txt'),Buffer.concat(errs));
  results.push({name:job.name,exit:code,seconds:Math.round((Date.now()-t0)/100)/10,sha,authorSha:job.outSha256,identical:sha===job.outSha256});res();});});
const worker=async()=>{while(next<jobs.length){const j=jobs[next++];await run(j);}};
await Promise.all(Array.from({length:conc},worker));
results.sort((a,b)=>a.name<b.name?-1:1);
const summary={harness:'R7ASE-QE-rerun',jobs:jobs.length,identical:results.filter(r=>r.identical).length,differ:results.filter(r=>!r.identical).map(r=>r.name),nonZeroExit:results.filter(r=>r.exit!==0).map(r=>r.name),results};
fs.writeFileSync(path.join(here,'qe-r7ase-rerun.out.json'),JSON.stringify(summary,null,1)+'\n');
console.log(JSON.stringify({jobs:summary.jobs,identical:summary.identical,differ:summary.differ,nonZeroExit:summary.nonZeroExit}));
