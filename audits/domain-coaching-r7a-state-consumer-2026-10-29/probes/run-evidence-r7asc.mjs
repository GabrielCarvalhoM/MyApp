// COACHING CORE — STATE MODEL CONSUMER CLOSURE evidence runner: runs every author probe and every judge probe this mission relies on, binding each
// output to the source digest of the live runtime (recomputed before and after each run, the same canonical digest the freeze records). Read-only
// with respect to CoachingCore/; it writes only this folder's runs/ and EVIDENCE_RUNS_R7ASC.json. The SSCTR's own regression kit is run separately
// by run-ssctr-kit.mjs (its RUNS.json binds each job the same way). Usage: node run-evidence-r7asc.mjs [name-or-prefix ...]   (CONC, default 6)
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {hash} from '../../../CoachingCore/src/value.mjs';
const here=import.meta.dirname,repo=path.resolve(here,'../../..'),cc=path.join(repo,'CoachingCore'),runs=path.join(here,'runs');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const digest=()=>hash(Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['src/'+f,sha(path.join(cc,'src',f))])));
const HERE='audits/domain-coaching-r7a-state-consumer-2026-10-29/probes',HPF1='audits/domain-coaching-r7a-state-consumer-2026-10-29/state-model-freeze-source/CoachingCore';
const SEF='audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source/CoachingCore',QE='audits/domain-coaching-r7a-state-model-2026-10-28/reviews';
const SE='audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews',AB='audits/domain-coaching-r7a-boundary-2026-10-28/reviews',AF='audits/domain-coaching-r7a-final-2026-10-28/reviews',A1='audits/domain-coaching-r7a1-2026-10-27/reviews',A2='audits/domain-coaching-r7a2-2026-10-28/reviews';
// name, script (repo-relative), env, args
const JOBS=[
 // This mission's own evidence: the self-challenge (§24) on this runtime and on the predecessor, the tests on the predecessor, the run side of F1.
 ['r7asc-self-challenge',`${HERE}/r7asc-self-challenge.mjs`,{}],
 ['r7asc-self-challenge.PRIOR',`${HERE}/r7asc-self-challenge.mjs`,{R7ASC_ROOT:HPF1}],
 ['r7asc-tests-on-predecessor',`${HERE}/tests-on-predecessor.mjs`,{}],
 ['r7asc-run-reentry-step',`${HERE}/r7asc-run-reentry-step.mjs`,{}],
 ['r7asc-run-reentry-step.PRIOR',`${HERE}/r7asc-run-reentry-step.mjs`,{R7ASC_ROOT:HPF1}],
 ['r7asc-run-reentry-step.SE',`${HERE}/r7asc-run-reentry-step.mjs`,{R7ASC_ROOT:SEF}],
 ['r7asc-classify-regression',`${HERE}/classify-regression-r7asc.mjs`,{}],
 // The mutation check's one survivor: the battery of run timelines, and its equivalence on the mutant with a positive control (Founder §25).
 ['r7asc-mutant-search',`${HERE}/mutant-search-r7asc.mjs`,{}],
 ['r7asc-mutant-equivalence',`${HERE}/mutant-equivalence-r7asc.mjs`,{}],
 // The SSCTR's restoration grid (the caps grid reads the same 864 timelines), row by row, on three trees: every difference from the approved
 // freeze is explained by grid-explain-r7asc.mjs (run after these jobs).
 ...[0,1,2,3].flatMap(i=>[['grid-signature.live.shard'+i,`${HERE}/grid-signature-r7asc.mjs`,{SHARD:`${i}/4`}],['grid-signature.se.shard'+i,`${HERE}/grid-signature-r7asc.mjs`,{SHARD:`${i}/4`,R7ASC_CC:SEF}],['grid-signature.prior.shard'+i,`${HERE}/grid-signature-r7asc.mjs`,{SHARD:`${i}/4`,R7ASC_CC:HPF1}]]),
 // The engineering judge's probes of HISTORICAL-PROJECTION-FREEZE-1 (QE-R7ASM-01..04 and their controls) on these bytes.
 ...['Q2-correction','Q2b-correction-load','Q3-known-row-setup','Q3b-known-row-conflict','Q4-restart-view','Q4b-restart-rows','Q6-perturb-projection','Q7-p41-facts','Q9-executed-atoms','Q10-noop-sweep','Q11-misc','Q11c-reps-identical','Q12-robustness'].map(n=>['qe-r7asm-'+n,`${QE}/qe-r7asm-${n}.mjs`,{}]),
 // The earlier blockers' probes, as the predecessor ran them: QE-R7ASE-01/02, QE-R7AB-01, the interruption identity and the return's point.
 ['qe-r7ase-P51d',`${SE}/qe-r7ase-P51d-identical-ledgers.mjs`,{}],
 ['qe-r7ase-P51c',`${SE}/qe-r7ase-P51c-atdose-projected-tick-unmet.mjs`,{}],
 ['qe-r7ase-P51b',`${SE}/qe-r7ase-P51b-atdose-projected-tick-dev.mjs`,{}],
 ['qe-r7ase-P50',`${SE}/qe-r7ase-P50-reestablish-projected-date.mjs`,{}],
 ['qe-r7ase-P50.tz540',`${SE}/qe-r7ase-P50-reestablish-projected-date.mjs`,{QE_TZ:'540'}],
 ['qe-r7ase-P50.tz-300',`${SE}/qe-r7ase-P50-reestablish-projected-date.mjs`,{QE_TZ:'-300'}],
 ['qe-r7ase-P52',`${SE}/qe-r7ase-P52-fresh-exercise-entryweek.mjs`,{}],
 ['qe-r7ase-I01',`${SE}/qe-r7ase-I01-sundaylong-trace.mjs`,{}],
 ['qe-r7ase-I02',`${SE}/qe-r7ase-I02-same-facts.mjs`,{}],
 ['qe-r7ab-P40',`${AB}/qe-r7ab-P40-held-outside-return.mjs`,{}],
 ['qe-r7ab-P40.tz540',`${AB}/qe-r7ab-P40-held-outside-return.mjs`,{QE_TZ:'540'}],
 ['qe-r7ab-P40b',`${AB}/qe-r7ab-P40b-held-variants.mjs`,{}],
 ['qe-r7ab-P40c',`${AB}/qe-r7ab-P40c-moderate-ceiling.mjs`,{}],
 ['qe-r7ab-P41',`${AB}/qe-r7ab-P41-held-after-short-return.mjs`,{}],
 ['qe-r7ab-P47b',`${AB}/qe-r7ab-P47b-localfatigue-pre.mjs`,{}],
 ['qe-r7af-P30c',`${AF}/qe-r7af-P30c-reproduction.mjs`,{}],
 ['qe-r7af-P37',`${AF}/qe-r7af-P37-explicit-names.mjs`,{}],
 ['qe-r7af-P32',`${AF}/qe-r7af-P32-late-evidence.mjs`,{}],
 ['qe-r7af-P31',`${AF}/qe-r7af-P31-identity-order-grid.mjs`,{}],
 ['qe-r7a2-P17',`${A2}/qe-r7a2-P17-late-correction-then-separate-break.mjs`,{}],
 ['qe-r7a2-P19',`${A2}/qe-r7a2-P19-identity-interleaving-grid.mjs`,{}],
 ['qe-a1-P07',`${A1}/qe-a1-P07-merge-known-definitions.mjs`,{}]
];
const want=process.argv.slice(2),jobs=JOBS.filter(([n])=>!want.length||want.some(w=>n===w||n.startsWith(w)));
fs.mkdirSync(runs,{recursive:true});
const record=fs.existsSync(path.join(here,'EVIDENCE_RUNS_R7ASC.json'))&&want.length?JSON.parse(fs.readFileSync(path.join(here,'EVIDENCE_RUNS_R7ASC.json'),'utf8')).runs:[];
const runOne=([name,script,env])=>new Promise(resolve=>{
 const abs=path.join(repo,script);if(!fs.existsSync(abs))return resolve({name,script,skipped:'script not found'});
 const start=digest(),t0=Date.now(),file=path.join(runs,name+'.out.json'),o=fs.openSync(file,'w'),e=fs.openSync(path.join(runs,name+'.err.txt'),'w');
 const p=spawn(process.execPath,[abs],{cwd:repo,env:{...process.env,...env},stdio:['ignore',o,e]});
 p.on('close',code=>{fs.closeSync(o);fs.closeSync(e);const end=digest();resolve({name,script,scriptSha256:sha(abs),env,exit:code,seconds:Math.round((Date.now()-t0)/1000),outSha256:sha(file),bytes:fs.statSync(file).size,sourceDigestStart:start,sourceDigestEnd:end,stderrBytes:fs.statSync(path.join(runs,name+'.err.txt')).size});});
});
const queue=[...jobs],done=[],CONC=Number(process.env.CONC??6);
await Promise.all(Array.from({length:CONC},async()=>{while(queue.length){const j=queue.shift();done.push(await runOne(j));}}));
// The grid explanations, from the signatures just recorded: a pure reading of three outputs, given as arguments, bound like the others.
const runArgs=(name,script,args)=>new Promise(resolve=>{const abs=path.join(repo,script),start=digest(),t0=Date.now(),file=path.join(runs,name+'.out.json'),o=fs.openSync(file,'w'),e=fs.openSync(path.join(runs,name+'.err.txt'),'w');
 const p=spawn(process.execPath,[abs,...args],{cwd:repo,env:process.env,stdio:['ignore',o,e]});
 p.on('close',code=>{fs.closeSync(o);fs.closeSync(e);const end=digest();resolve({name,script,scriptSha256:sha(abs),args,exit:code,seconds:Math.round((Date.now()-t0)/1000),outSha256:sha(file),bytes:fs.statSync(file).size,sourceDigestStart:start,sourceDigestEnd:end,stderrBytes:fs.statSync(path.join(runs,name+'.err.txt')).size});});});
const explained=[];
for(const i of [0,1,2,3]){const names=['live','se','prior'].map(t=>`grid-signature.${t}.shard${i}`);if(!names.every(n=>done.some(r=>r.name===n&&r.exit===0)))continue;
 explained.push(await runArgs('grid-explain.shard'+i,`${HERE}/grid-explain-r7asc.mjs`,names.map(n=>path.join(runs,n+'.out.json'))));}
// The SSCTR kit run (kit-final/, bound by its own RUNS.json) compared with the SSCTR's own runs on both earlier freezes, instrument by instrument.
if(!want.length||want.some(w=>'ssctr-kit'.startsWith(w)||w.startsWith('ssctr-kit'))){explained.push(await runArgs('ssctr-kit-compare',`${HERE}/ssctr-kit-compare.mjs`,[path.join(here,'kit-final')]));explained.push(await runArgs('ssctr-kit-explain',`${HERE}/kit-explain-r7asc.mjs`,[path.join(here,'kit-final')]));}
const names=new Set([...done,...explained].map(r=>r.name)),all=[...record.filter(r=>!names.has(r.name)),...done,...explained].sort((a,b)=>a.name<b.name?-1:1);
const result={revision:'R7ASC-EVIDENCE-1',generatedAt:new Date().toISOString(),node:process.version,sourceDigest:digest(),
 rule:'Every output is bound to the source digest of the runtime it ran on, recomputed before and after the run. A run whose two digests differ, or whose exit is not 0, is not evidence.',
 runs:all,summary:{runs:all.length,failed:all.filter(r=>r.exit!==0&&!r.skipped).map(r=>r.name),skipped:all.filter(r=>r.skipped).map(r=>r.name),unbound:all.filter(r=>!r.skipped&&r.sourceDigestStart!==r.sourceDigestEnd).map(r=>r.name)}};
fs.writeFileSync(path.join(here,'EVIDENCE_RUNS_R7ASC.json'),JSON.stringify(result,null,1)+'\n');
console.log(JSON.stringify(result.summary,null,1));
