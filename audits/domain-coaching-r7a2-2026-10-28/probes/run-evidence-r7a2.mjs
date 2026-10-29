// DOMAIN_COACHING_R7-A.2 evidence runner: runs every probe and grid this mission relies on against the live runtime and records each stdout
// under runs/, with the runtime source digest taken before and after (so each output is bound to the bytes it ran on). The probes are the
// judges' and the author's own; each prints only (the instrument copy writes its JSON next to itself under the name given). Read-only use of
// the runtime; synthetic data; DEV_TEST_ONLY authority. Usage: node run-evidence-r7a2.mjs [name ...] (default: all), concurrency 4.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,root=path.resolve(here,'../../..'),cc=path.join(root,'CoachingCore'),runs=path.join(here,'runs');
const A1R=path.join(root,'audits/domain-coaching-r7a1-2026-10-27/reviews'),A1P=path.join(root,'audits/domain-coaching-r7a1-2026-10-27/probes');
const {hash}=await import(pathToFileURL(path.join(cc,'src/value.mjs')).href);
const digest=()=>hash(Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['src/'+f,createHash('sha256').update(fs.readFileSync(path.join(cc,'src',f))).digest('hex')])));
const J=(name,cwd,script,env={})=>({name,cwd,script,env});
const JOBS=[
 // Engineering judge's R7-A.1 probes (P13, P14, P02 and P09 first, as the re-check names them).
 J('qe-P13',A1R,'qe-a2-P13-second-break-after-reentry.mjs'),J('qe-P14',A1R,'qe-a2-P14-second-short-break-easy-slot.mjs'),J('qe-P02',A1R,'qe-a2-P02-return-correction-next-week.mjs'),
 J('qe-P09.seed7',A1R,'qe-a2-P09-random-sequences-oracles.mjs',{SEED:'7',N:'2500'}),J('qe-P09.seed1013',A1R,'qe-a2-P09-random-sequences-oracles.mjs',{SEED:'1013',N:'2500'}),
 ...['P01-moved-content-after-equipment','P01b-move-into-equipment-window','P03-timezone-invariance','P04-systemic-signal-paths','P05-learned-rearrangement-systemic','P06-same-day-adaptations','P07-merge-known-definitions','P08-d56-real-legacy-rows','P10-confirmed-load-rederived','P15-noop-equipment-statement','P16-keep-review-then-change'].map(p=>J('qe-'+p.split('-')[0],A1R,`qe-a2-${p}.mjs`)),
 // SSCTR's R7-A.1 instruments: the first-week grid (D59), restoration grid, cap causes (and the NONE/NOVICE extension), short grid, D58
 // readings and probe; the round-12 instrument from a byte copy in this folder.
 J('ssctr-firstweek',A1R,'ssctr-r7a1-recheck-firstweek.mjs'),
 ...[0,1,2,3].map(i=>J('ssctr-grid.shard'+i,A1R,'ssctr-r7a1-grid.mjs',{SHARD:`${i}/4`})),
 ...[0,1,2,3].map(i=>J('ssctr-caps.shard'+i,A1R,'ssctr-r7a1-recheck-caps.mjs',{SHARD:`${i}/4`})),
 ...[0,1].map(i=>J('ssctr-caps-ext.shard'+i,A1R,'ssctr-r7a1-recheck-caps.mjs',{SHARD:`${i}/2`,EXT:'1'})),
 J('ssctr-short',A1R,'ssctr-r7a1-short.mjs'),J('ssctr-d58',A1R,'ssctr-r7a1-recheck-d58.mjs'),J('ssctr-probe',A1R,'ssctr-r7a1-probe.mjs'),
 J('ssctr-instrument',here,'ssctr-r12-instrument.mjs',{R7A_PROBE_OUT:'runs/ssctr-instrument.data.json'}),
 // R7-A.1 author probes (composition, both handler grids, D56 grid, three-step, D58 combinations).
 ...['r7a1-composition-probes','r7a1-handler-grid','r7a1-handler-grid-midweek','r7a1-d56-grid','r7a1-representation-three-step','r7a1-d58-combinations'].map(p=>J(p,A1P,p+'.mjs')),
 // R7-A.2 self-challenge.
 J('r7a2-self-challenge',here,'r7a2-self-challenge.mjs')
];
const wanted=process.argv.slice(2),jobs=wanted.length?JOBS.filter(j=>wanted.some(w=>j.name.startsWith(w))):JOBS;
fs.mkdirSync(runs,{recursive:true});
const start=digest(),records=[];
const runOne=j=>new Promise(res=>{const t0=Date.now(),out=fs.createWriteStream(path.join(runs,j.name+'.out.json')),err=[];const p=spawn(process.execPath,[path.join(j.cwd,j.script)],{cwd:j.cwd,env:{...process.env,...j.env}});p.stdout.pipe(out);p.stderr.on('data',d=>err.push(d));p.on('close',code=>{out.end(()=>{const file=path.join(runs,j.name+'.out.json');records.push({name:j.name,script:path.relative(root,path.join(j.cwd,j.script)).replace(/\\/g,'/'),scriptSha256:createHash('sha256').update(fs.readFileSync(path.join(j.cwd,j.script))).digest('hex'),env:j.env,exit:code,seconds:Math.round((Date.now()-t0)/1000),output:'runs/'+j.name+'.out.json',outputSha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex'),stderr:Buffer.concat(err).toString('utf8').slice(0,400)});console.log(`${j.name} exit ${code}`);res();});});});
const queue=[...jobs];await Promise.all(Array.from({length:4},async()=>{while(queue.length)await runOne(queue.shift());}));
const end=digest(),file=path.join(here,'EVIDENCE_RUNS_R7A2.json'),prev=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{runs:[]};
const merged=[...prev.runs.filter(r=>!records.some(x=>x.name===r.name)),...records.map(r=>({...r,sourceDigestStart:start,sourceDigestEnd:end}))].sort((a,b)=>a.name<b.name?-1:1);
fs.writeFileSync(file,JSON.stringify({revision:'R7A2-EVIDENCE-RUNS-1',updatedAt:new Date().toISOString(),node:process.version,runs:merged},null,1)+'\n');
console.log(JSON.stringify({sourceDigestStart:start,sourceDigestEnd:end,ran:records.length,failed:records.filter(r=>r.exit!==0).map(r=>r.name)}));
