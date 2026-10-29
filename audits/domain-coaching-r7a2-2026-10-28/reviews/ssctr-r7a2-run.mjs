// SSCTR R7-A.2 runner (own). Runs my unchanged R7-A.1 instruments and my R7-A.2 probes against the live CoachingCore tree, writes each stdout
// to runs/<name>.out.json in this folder, and records the source digest before and after each job (runs/RUNS.json). Read-only runtime use;
// synthetic data; DEV_TEST_ONLY authority. Usage: node ssctr-r7a2-run.mjs [prefix ...]  (concurrency from CONC, default 5)
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,root=path.resolve(here,'../../..'),cc=path.join(root,'CoachingCore'),runs=path.join(here,'runs');
const A1R=path.join(root,'audits/domain-coaching-r7a1-2026-10-27/reviews');
const {hash}=await import(pathToFileURL(path.join(cc,'src/value.mjs')).href);
const digest=()=>hash(Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['src/'+f,createHash('sha256').update(fs.readFileSync(path.join(cc,'src',f))).digest('hex')])));
const J=(name,cwd,script,env={})=>({name,cwd,script,env});
const JOBS=[
 J('firstweek',A1R,'ssctr-r7a1-recheck-firstweek.mjs'),
 ...[0,1,2,3].map(i=>J('grid.shard'+i,A1R,'ssctr-r7a1-grid.mjs',{SHARD:`${i}/4`})),
 ...[0,1,2,3].map(i=>J('caps.shard'+i,A1R,'ssctr-r7a1-recheck-caps.mjs',{SHARD:`${i}/4`})),
 ...[0,1].map(i=>J('caps-ext.shard'+i,A1R,'ssctr-r7a1-recheck-caps.mjs',{SHARD:`${i}/2`,EXT:'1'})),
 J('short',A1R,'ssctr-r7a1-short.mjs'),J('d58',A1R,'ssctr-r7a1-recheck-d58.mjs'),J('probe',A1R,'ssctr-r7a1-probe.mjs'),
 ...[0,1,2,3,4,5,6,7].map(i=>J('x-firstweek.shard'+i,here,'ssctr-r7a2-firstweek-ext.mjs',{SHARD:`${i}/8`})),J('x-items',here,'ssctr-r7a2-items.mjs'),J('x-sameday',here,'ssctr-r7a2-sameday.mjs'),J('x-trace-sd',here,'ssctr-r7a2-trace-sd.mjs'),J('x-rotation',here,'ssctr-r7a2-rotation.mjs'),J('x-ceiling',here,'ssctr-r7a2-ceiling.mjs'),J('r12-instrument',here,'ssctr-r7a2-r12-instrument.mjs',{R7A_PROBE_OUT:'runs/r12-instrument.data.json'}),J('x-trace-rot',here,'ssctr-r7a2-trace-rot.mjs')
];
const wanted=process.argv.slice(2),jobs=wanted.length?JOBS.filter(j=>wanted.some(w=>j.name.startsWith(w))):JOBS;
fs.mkdirSync(runs,{recursive:true});
const file=path.join(runs,'RUNS.json'),records=[];
const runOne=j=>new Promise(res=>{const t0=Date.now(),d0=digest(),o=path.join(runs,j.name+'.out.json'),out=fs.createWriteStream(o),err=[];
 const p=spawn(process.execPath,[path.join(j.cwd,j.script)],{cwd:j.cwd,env:{...process.env,...j.env}});p.stdout.pipe(out);p.stderr.on('data',d=>err.push(d));
 p.on('close',code=>{out.end(()=>{records.push({name:j.name,script:path.relative(root,path.join(j.cwd,j.script)).replace(/\\/g,'/'),scriptSha256:createHash('sha256').update(fs.readFileSync(path.join(j.cwd,j.script))).digest('hex'),env:j.env,exit:code,seconds:Math.round((Date.now()-t0)/1000),output:'runs/'+j.name+'.out.json',outputSha256:createHash('sha256').update(fs.readFileSync(o)).digest('hex'),stderr:Buffer.concat(err).toString('utf8').slice(0,600),sourceDigestStart:d0,sourceDigestEnd:digest()});console.log(`${j.name} exit ${code} ${Math.round((Date.now()-t0)/1000)}s`);res();});});});
const queue=[...jobs],conc=Number(process.env.CONC??5);await Promise.all(Array.from({length:conc},async()=>{while(queue.length)await runOne(queue.shift());}));
const prev=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{runs:[]};
const merged=[...prev.runs.filter(r=>!records.some(x=>x.name===r.name)),...records].sort((a,b)=>a.name<b.name?-1:1);
fs.writeFileSync(file,JSON.stringify({revision:'R7A2-SSCTR-RUNS',updatedAt:new Date().toISOString(),node:process.version,runs:merged},null,1)+'\n');
console.log(JSON.stringify({ran:records.length,failed:records.filter(r=>r.exit!==0).map(r=>r.name),digests:[...new Set(records.flatMap(r=>[r.sourceDigestStart,r.sourceDigestEnd]))]}));
