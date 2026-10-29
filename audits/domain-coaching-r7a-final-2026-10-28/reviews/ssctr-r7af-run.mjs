// SSCTR R7-A final runner (own, R7AF-SSCTR-r1). Re-runs my unchanged R7-A.1 and R7-A.2 instruments (print-only, loading the live CoachingCore
// tree) and my R7-A final probes on R7A-FINAL-FREEZE. Each stdout goes to ssctr-r7af-runs/<name>.out.json in THIS folder, with the source
// digest recorded before and after each job (ssctr-r7af-runs/RUNS.json). It never writes under CoachingCore/ or into another audit folder:
// the round-12 instrument is run from its byte copy in this folder (ssctr-r7af-r12-instrument.mjs), whose data file is written here.
// Read-only runtime use; synthetic data; DEV_TEST_ONLY authority. Usage: node ssctr-r7af-run.mjs [prefix ...]  (concurrency from CONC, default 8)
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,root=path.resolve(here,'../../..'),cc=path.join(root,'CoachingCore'),runs=path.join(here,'ssctr-r7af-runs');
const A1R=path.join(root,'audits/domain-coaching-r7a1-2026-10-27/reviews'),A2R=path.join(root,'audits/domain-coaching-r7a2-2026-10-28/reviews');
const {hash}=await import(pathToFileURL(path.join(cc,'src/value.mjs')).href);
const digest=()=>hash(Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['src/'+f,createHash('sha256').update(fs.readFileSync(path.join(cc,'src',f))).digest('hex')])));
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
 J('r12-instrument',here,'ssctr-r7af-r12-instrument.mjs',{R7A_PROBE_OUT:'ssctr-r7af-runs/r12-instrument.data.json'}),
 J('f-probe',here,'ssctr-r7af-probe.mjs'),
 J('f-probe.FREEZE-1',here,'ssctr-r7af-probe.mjs',{SSCTR_CC:path.join(root,'audits/domain-coaching-r7a-final-2026-10-28/freeze1-source/CoachingCore')}),
 J('f-sameday',here,'ssctr-r7af-sameday.mjs'),
 J('f-sameday.FREEZE-1',here,'ssctr-r7af-sameday.mjs',{SSCTR_CC:path.join(root,'audits/domain-coaching-r7a-final-2026-10-28/freeze1-source/CoachingCore')})
];
const wanted=process.argv.slice(2),jobs=wanted.length?JOBS.filter(j=>wanted.some(w=>j.name.startsWith(w))):JOBS;
fs.mkdirSync(runs,{recursive:true});
const file=path.join(runs,'RUNS.json'),records=[];
const runOne=j=>new Promise(res=>{const t0=Date.now(),d0=digest(),o=path.join(runs,j.name+'.out.json'),out=fs.createWriteStream(o),err=[];
 const p=spawn(process.execPath,[path.join(j.cwd,j.script),...j.args],{cwd:j.cwd,env:{...process.env,...j.env}});p.stdout.pipe(out);p.stderr.on('data',d=>err.push(d));
 p.on('close',code=>{out.end(()=>{records.push({name:j.name,script:path.relative(root,path.join(j.cwd,j.script)).replace(/\\/g,'/'),scriptSha256:createHash('sha256').update(fs.readFileSync(path.join(j.cwd,j.script))).digest('hex'),env:Object.fromEntries(Object.entries(j.env).map(([k,v])=>[k,k==='SSCTR_CC'?path.relative(root,v).replace(/\\/g,'/'):v])),exit:code,seconds:Math.round((Date.now()-t0)/1000),output:'ssctr-r7af-runs/'+j.name+'.out.json',outputSha256:createHash('sha256').update(fs.readFileSync(o)).digest('hex'),stderr:Buffer.concat(err).toString('utf8').slice(0,600),sourceDigestStart:d0,sourceDigestEnd:digest()});console.log(`${j.name} exit ${code} ${Math.round((Date.now()-t0)/1000)}s`);res();});});});
const queue=[...jobs],conc=Number(process.env.CONC??8);await Promise.all(Array.from({length:conc},async()=>{while(queue.length)await runOne(queue.shift());}));
const prev=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{runs:[]};
const merged=[...prev.runs.filter(r=>!records.some(x=>x.name===r.name)),...records].sort((a,b)=>a.name<b.name?-1:1);
fs.writeFileSync(file,JSON.stringify({revision:'R7AF-SSCTR-RUNS',updatedAt:new Date().toISOString(),node:process.version,runs:merged},null,1)+'\n');
console.log(JSON.stringify({ran:records.length,failed:records.filter(r=>r.exit!==0).map(r=>r.name),digests:[...new Set(records.flatMap(r=>[r.sourceDigestStart,r.sourceDigestEnd]))]}));
