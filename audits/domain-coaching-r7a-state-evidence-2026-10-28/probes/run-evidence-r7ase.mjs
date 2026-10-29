// COACHING CORE — STATE EVIDENCE MODEL evidence runner: runs every probe and grid this mission relies on against the live runtime and records
// each stdout under runs/, with the runtime source digest taken before and after (so each output is bound to the bytes it ran on). The probes
// are the earlier judges' and authors' (the R7-A boundary runner's whole list, with the same names), the R7-A boundary engineering judge's own
// (P30b, P30c, P40 at four time zones, P40b, P40c, P41, P44, P45, P45b, P46 at F 1 and 3, P47, P47b), the R7-A boundary SSCTR's own probe, and
// this mission's self-challenge (also on the R7A-BOUNDARY-FINAL-FREEZE copy). Each prints only; the round-12 instrument runs from its byte copy
// here and writes its data under runs/. Read-only use of the runtime; synthetic data; DEV_TEST_ONLY authority.
// Usage: node run-evidence-r7ase.mjs [name ...] (default: all), concurrency CONC (default 6).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,root=path.resolve(here,'../../..'),cc=path.join(root,'CoachingCore'),runs=path.join(here,'runs');
const A1R=path.join(root,'audits/domain-coaching-r7a1-2026-10-27/reviews'),A1P=path.join(root,'audits/domain-coaching-r7a1-2026-10-27/probes');
const A2R=path.join(root,'audits/domain-coaching-r7a2-2026-10-28/reviews'),A2P=path.join(root,'audits/domain-coaching-r7a2-2026-10-28/probes');
const FR=path.join(root,'audits/domain-coaching-r7a-final-2026-10-28/reviews'),FP=path.join(root,'audits/domain-coaching-r7a-final-2026-10-28/probes');
const BR=path.join(root,'audits/domain-coaching-r7a-boundary-2026-10-28/reviews'),BP=path.join(root,'audits/domain-coaching-r7a-boundary-2026-10-28/probes');
const BOUNDARY=path.join(root,'audits/domain-coaching-r7a-state-evidence-2026-10-28/boundary-freeze-source/CoachingCore');
const {hash}=await import(pathToFileURL(path.join(cc,'src/value.mjs')).href);
const digest=()=>hash(Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['src/'+f,createHash('sha256').update(fs.readFileSync(path.join(cc,'src',f))).digest('hex')])));
const J=(name,cwd,script,env={})=>({name,cwd,script,env});
const JOBS=[
 // The R7-A boundary runner's list, unchanged (names as there, so each output compares with the one recorded on R7A-BOUNDARY-FINAL-FREEZE).
 J('qe-P13',A1R,'qe-a2-P13-second-break-after-reentry.mjs'),J('qe-P14',A1R,'qe-a2-P14-second-short-break-easy-slot.mjs'),J('qe-P02',A1R,'qe-a2-P02-return-correction-next-week.mjs'),
 J('qe-P09.seed7',A1R,'qe-a2-P09-random-sequences-oracles.mjs',{SEED:'7',N:'2500'}),J('qe-P09.seed1013',A1R,'qe-a2-P09-random-sequences-oracles.mjs',{SEED:'1013',N:'2500'}),
 ...['P01-moved-content-after-equipment','P01b-move-into-equipment-window','P03-timezone-invariance','P04-systemic-signal-paths','P05-learned-rearrangement-systemic','P06-same-day-adaptations','P07-merge-known-definitions','P08-d56-real-legacy-rows','P10-confirmed-load-rederived','P15-noop-equipment-statement','P16-keep-review-then-change'].map(p=>J('qe-'+p.split('-')[0],A1R,`qe-a2-${p}.mjs`)),
 ...['P17-late-correction-then-separate-break','P18-record-as-reported','P19-identity-interleaving-grid','P20-late-correction-easy-slot','P21-gap-before-late-report'].map(p=>J('qe2-'+p.split('-')[0],A2R,`qe-r7a2-${p}.mjs`)),
 J('ssctr-firstweek',A1R,'ssctr-r7a1-recheck-firstweek.mjs'),
 ...[0,1,2,3].map(i=>J('ssctr-grid.shard'+i,A1R,'ssctr-r7a1-grid.mjs',{SHARD:`${i}/4`})),
 ...[0,1,2,3].map(i=>J('ssctr-caps.shard'+i,A1R,'ssctr-r7a1-recheck-caps.mjs',{SHARD:`${i}/4`})),
 ...[0,1].map(i=>J('ssctr-caps-ext.shard'+i,A1R,'ssctr-r7a1-recheck-caps.mjs',{SHARD:`${i}/2`,EXT:'1'})),
 J('ssctr-short',A1R,'ssctr-r7a1-short.mjs'),J('ssctr-d58',A1R,'ssctr-r7a1-recheck-d58.mjs'),J('ssctr-probe',A1R,'ssctr-r7a1-probe.mjs'),
 ...[0,1,2,3,4,5,6,7].map(i=>J('ssctr2-x-firstweek.shard'+i,A2R,'ssctr-r7a2-firstweek-ext.mjs',{SHARD:`${i}/8`})),
 ...['items','sameday','trace-sd','rotation','ceiling','trace-rot'].map(x=>J('ssctr2-x-'+x,A2R,`ssctr-r7a2-${x}.mjs`)),
 J('ssctr-instrument',here,'ssctr-r12-instrument.mjs',{R7A_PROBE_OUT:'runs/ssctr-instrument.data.json'}),
 ...['r7a1-composition-probes','r7a1-handler-grid','r7a1-handler-grid-midweek','r7a1-d56-grid','r7a1-representation-three-step','r7a1-d58-combinations'].map(p=>J(p,A1P,p+'.mjs')),
 J('r7a2-self-challenge',A2P,'r7a2-self-challenge.mjs'),J('r7af-self-challenge',FP,'r7af-self-challenge.mjs'),J('r7af-P02-named',FP,'r7af-P02-named-correction.mjs'),
 ...['P30-earned-week','P30b-earned-week-grid','P30c-reproduction','P30d-executed-adverse','P32-late-evidence','P33-same-day','P34-duplicates','P35-three-short','P36-stale-false-positive','P37-explicit-names','P38-touching-breaks'].map(p=>J('qe7af-'+p.split('-')[0],FR,`qe-r7af-${p}.mjs`)),
 J('qe7af-P31',FR,'qe-r7af-P31-identity-order-grid.mjs'),...[['tz540','540'],['tz-300','-300'],['tz-600','-600']].map(([n,v])=>J('qe7af-P31.'+n,FR,'qe-r7af-P31-identity-order-grid.mjs',{QE_TZ:v})),
 J('ssctr7af-f-probe',FR,'ssctr-r7af-probe.mjs'),J('ssctr7af-f-sameday',FR,'ssctr-r7af-sameday.mjs'),
 J('r7ab-self-challenge',BP,'r7ab-self-challenge.mjs'),
 // The R7-A boundary engineering judge's own probes (compared with its outputs on R7A-BOUNDARY-FINAL-FREEZE).
 // P30b and P30c are the R7-A final judge's scripts, which the R7-A boundary judge ran and recorded as qe-r7ab-P30b/P30c.
 J('qe7ab-P30b',FR,'qe-r7af-P30b-earned-week-grid.mjs'),J('qe7ab-P30c',FR,'qe-r7af-P30c-reproduction.mjs'),
 J('qe7ab-P40',BR,'qe-r7ab-P40-held-outside-return.mjs'),...[['tz540','540'],['tz-300','-300'],['tz-600','-600']].map(([n,v])=>J('qe7ab-P40.'+n,BR,'qe-r7ab-P40-held-outside-return.mjs',{QE_TZ:v})),
 ...[['P40b','P40b-held-variants'],['P40c','P40c-moderate-ceiling'],['P41','P41-held-after-short-return'],['P44','P44-whole-week-absent-exercise'],['P45','P45-temporal-contradiction'],['P45b','P45b-enclosed-training'],['P47','P47-noop-clock-grid'],['P47b','P47b-localfatigue-pre']].map(([n,f])=>J('qe7ab-'+n,BR,`qe-r7ab-${f}.mjs`)),
 J('qe7ab-P46.F1',BR,'qe-r7ab-P46-promotion-outside-return.mjs',{QE_F:'1'}),J('qe7ab-P46.F3',BR,'qe-r7ab-P46-promotion-outside-return.mjs',{QE_F:'3'}),
 // The R7-A boundary SSCTR's own probe.
 J('ssctr7ab-b-probe',BR,'ssctr-r7ab-probe.mjs'),
 // This mission's self-challenge, on the live runtime and on the byte-exact R7A-BOUNDARY-FINAL-FREEZE copy.
 J('r7ase-self-challenge',here,'r7ase-self-challenge.mjs'),J('r7ase-self-challenge.BOUNDARY',here,'r7ase-self-challenge.mjs',{QE_LIVE_ROOT:BOUNDARY})
];
const wanted=process.argv.slice(2),jobs=wanted.length?JOBS.filter(j=>wanted.some(w=>j.name.startsWith(w))):JOBS;
fs.mkdirSync(runs,{recursive:true});
const start=digest(),records=[];
const runOne=j=>new Promise(res=>{const t0=Date.now(),out=fs.createWriteStream(path.join(runs,j.name+'.out.json')),err=[];const p=spawn(process.execPath,[path.join(j.cwd,j.script)],{cwd:j.cwd===here?here:j.cwd,env:{...process.env,...j.env}});p.stdout.pipe(out);p.stderr.on('data',d=>err.push(d));p.on('close',code=>{out.end(()=>{fs.writeFileSync(path.join(runs,j.name+'.err.txt'),Buffer.concat(err));records.push({name:j.name,script:path.relative(root,path.join(j.cwd,j.script)).replace(/\\/g,'/'),env:j.env,exit:code,seconds:Math.round((Date.now()-t0)/100)/10,outSha256:createHash('sha256').update(fs.readFileSync(path.join(runs,j.name+'.out.json'))).digest('hex')});res();});});});
const queue=[...jobs];await Promise.all(Array.from({length:Number(process.env.CONC??6)},async()=>{while(queue.length)await runOne(queue.shift());}));
const end=digest(),file=path.join(here,'EVIDENCE_RUNS_R7ASE.json'),prev=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{runs:[]};
const merged=[...prev.runs.filter(r=>!records.some(x=>x.name===r.name)),...records.map(r=>({...r,sourceDigestStart:start,sourceDigestEnd:end}))].sort((a,b)=>a.name<b.name?-1:1);
fs.writeFileSync(file,JSON.stringify({revision:'R7ASE-EVIDENCE-RUNS-1',updatedAt:new Date().toISOString(),node:process.version,runs:merged},null,1)+'\n');
console.log(JSON.stringify({sourceDigestStart:start,sourceDigestEnd:end,ran:records.length,failed:records.filter(r=>r.exit!==0).map(r=>r.name)}));
