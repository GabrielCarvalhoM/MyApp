// SSCTR R7ASE-SSCTR-r1 runner (own). Re-runs my unchanged R7-A.1 and R7-A.2 instruments (print-only, loading the live CoachingCore tree), a byte
// copy of my round-12 instrument (ssctr-r7ase-r12-instrument.mjs, byte-equal to ssctr-r7ab-r12-instrument.mjs), my R7-A final probes and my R7-A
// boundary probe, on STATE-EVIDENCE-FREEZE-1 (live tree) and, for the probes that accept SSCTR_CC, on the byte-exact R7A-BOUNDARY-FINAL-FREEZE
// copy (boundary-freeze-source/CoachingCore). Also my regression probe (ssctr-r7ase-regression-probe.mjs). Each stdout goes to
// ssctr-r7ase-runs/<name>.out.json in THIS folder, with the live source digest (and the SSCTR_CC tree's digest when set) recorded before and after
// each job (ssctr-r7ase-runs/RUNS.json). It never writes under CoachingCore/ or into another audit folder. Read-only runtime use; synthetic data;
// DEV_TEST_ONLY authority. Usage: node ssctr-r7ase-run.mjs [name-or-prefix ...]   (concurrency from CONC, default 8)
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,root=path.resolve(here,'../../..'),cc=path.join(root,'CoachingCore'),runs=path.join(here,'ssctr-r7ase-runs');
const BOUNDARY=path.join(root,'audits/domain-coaching-r7a-state-evidence-2026-10-28/boundary-freeze-source/CoachingCore');
const A1R=path.join(root,'audits/domain-coaching-r7a1-2026-10-27/reviews'),A2R=path.join(root,'audits/domain-coaching-r7a2-2026-10-28/reviews'),AFR=path.join(root,'audits/domain-coaching-r7a-final-2026-10-28/reviews'),ABR=path.join(root,'audits/domain-coaching-r7a-boundary-2026-10-28/reviews');
const {hash}=await import(pathToFileURL(path.join(cc,'src/value.mjs')).href);
const digestOf=tree=>hash(Object.fromEntries(fs.readdirSync(path.join(tree,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['src/'+f,createHash('sha256').update(fs.readFileSync(path.join(tree,'src',f))).digest('hex')])));
const J=(name,cwd,script,env={},args=[])=>({name,cwd,script,env,args});
const JOBS=[
 J('firstweek',A1R,'ssctr-r7a1-recheck-firstweek.mjs'),
 ...[0,1,2,3].map(i=>J('grid.shard'+i,A1R,'ssctr-r7a1-grid.mjs',{SHARD:`${i}/4`})),
 ...[0,1,2,3].map(i=>J('caps.shard'+i,A1R,'ssctr-r7a1-recheck-caps.mjs',{SHARD:`${i}/4`})),
 ...[0,1].map(i=>J('caps-ext.shard'+i,A1R,'ssctr-r7a1-recheck-caps.mjs',{SHARD:`${i}/2`,EXT:'1'})),
 J('short',A1R,'ssctr-r7a1-short.mjs'),J('d58',A1R,'ssctr-r7a1-recheck-d58.mjs'),J('probe',A1R,'ssctr-r7a1-probe.mjs'),
 ...[0,1,2,3,4,5,6,7].map(i=>J('x-firstweek.shard'+i,A2R,'ssctr-r7a2-firstweek-ext.mjs',{SHARD:`${i}/8`})),
 J('x-items',A2R,'ssctr-r7a2-items.mjs'),J('x-sameday',A2R,'ssctr-r7a2-sameday.mjs'),J('x-trace-sd',A2R,'ssctr-r7a2-trace-sd.mjs'),
 J('x-rotation',A2R,'ssctr-r7a2-rotation.mjs'),J('x-ceiling',A2R,'ssctr-r7a2-ceiling.mjs'),J('x-trace-rot',A2R,'ssctr-r7a2-trace-rot.mjs'),
 J('r12-instrument',here,'ssctr-r7ase-r12-instrument.mjs',{R7A_PROBE_OUT:'ssctr-r7ase-runs/r12-instrument.data.json'}),
 J('f-probe',AFR,'ssctr-r7af-probe.mjs'),J('f-probe.BOUNDARY',AFR,'ssctr-r7af-probe.mjs',{SSCTR_CC:BOUNDARY}),
 J('f-sameday',AFR,'ssctr-r7af-sameday.mjs'),J('f-sameday.BOUNDARY',AFR,'ssctr-r7af-sameday.mjs',{SSCTR_CC:BOUNDARY}),
 J('b-probe',ABR,'ssctr-r7ab-probe.mjs'),J('b-probe.BOUNDARY',ABR,'ssctr-r7ab-probe.mjs',{SSCTR_CC:BOUNDARY}),
 J('regression',here,'ssctr-r7ase-regression-probe.mjs'),
 J('se-probe',here,'ssctr-r7ase-probe.mjs'),J('se-probe.BOUNDARY',here,'ssctr-r7ase-probe.mjs',{SSCTR_CC:BOUNDARY}),
 J('holdout-detail',here,'ssctr-r7ase-holdout-detail.mjs'),J('systemic',here,'ssctr-r7ase-systemic-probe.mjs'),J('systemic.BOUNDARY',here,'ssctr-r7ase-systemic-probe.mjs',{SSCTR_CC:BOUNDARY}),J('tick',here,'ssctr-r7ase-tick-probe.mjs'),J('tick.BOUNDARY',here,'ssctr-r7ase-tick-probe.mjs',{SSCTR_CC:BOUNDARY})
];
const wanted=process.argv.slice(2),jobs=wanted.length?JOBS.filter(j=>wanted.some(w=>j.name===w||j.name.startsWith(w+'.'))):JOBS;
fs.mkdirSync(runs,{recursive:true});
const file=path.join(runs,'RUNS.json'),records=[];
const rel=p=>path.relative(root,p).replace(/\\/g,'/');
const runOne=j=>new Promise(res=>{const t0=Date.now(),d0=digestOf(cc),c0=j.env.SSCTR_CC?digestOf(j.env.SSCTR_CC):null,o=path.join(runs,j.name+'.out.json'),out=fs.createWriteStream(o),err=[];
 const p=spawn(process.execPath,[path.join(j.cwd,j.script),...j.args],{cwd:j.cwd,env:{...process.env,...j.env}});p.stdout.pipe(out);p.stderr.on('data',d=>err.push(d));
 p.on('close',code=>{out.end(()=>{const e=Buffer.concat(err);if(e.length)fs.writeFileSync(path.join(runs,j.name+'.err.txt'),e);
  records.push({name:j.name,script:rel(path.join(j.cwd,j.script)),scriptSha256:createHash('sha256').update(fs.readFileSync(path.join(j.cwd,j.script))).digest('hex'),env:Object.fromEntries(Object.entries(j.env).map(([k,v])=>[k,k==='SSCTR_CC'?rel(v):v])),exit:code,seconds:Math.round((Date.now()-t0)/1000),
   sourceDigestStart:d0,sourceDigestEnd:digestOf(cc),...(c0?{ssctrCcDigestStart:c0,ssctrCcDigestEnd:digestOf(j.env.SSCTR_CC)}:{}),outSha256:createHash('sha256').update(fs.readFileSync(o)).digest('hex'),stderrBytes:e.length});res();});});});
const queue=[...jobs],conc=Number(process.env.CONC??8);await Promise.all(Array.from({length:conc},async()=>{while(queue.length)await runOne(queue.shift());}));
const prev=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{runs:[]};
const merged=[...prev.runs.filter(r=>!records.some(x=>x.name===r.name)),...records].sort((a,b)=>a.name<b.name?-1:1);
fs.writeFileSync(file,JSON.stringify({revision:'R7ASE-SSCTR-RUNS',updatedAt:new Date().toISOString(),node:process.version,runs:merged},null,1)+'\n');
console.log(JSON.stringify({ran:records.length,failed:records.filter(r=>r.exit!==0).map(r=>r.name),digests:[...new Set(records.flatMap(r=>[r.sourceDigestStart,r.sourceDigestEnd]))],ccDigests:[...new Set(records.flatMap(r=>r.ssctrCcDigestStart?[r.ssctrCcDigestStart,r.ssctrCcDigestEnd]:[]))]}));
