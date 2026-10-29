// Author runner (R7-A DECISION AUTHORITY, Founder request §37–§38): runs, on the live tree, every probe this closure cites before the freeze and
// binds each run to the runtime's source digest, recomputed before and after the job exactly as the freeze computes it (the canonical hash of
// the src/*.mjs SHA-256 map). Outputs go under probes/ (runs/, judges/); the record is probes/EVIDENCE_RUNS_R7ADA.json. Nothing else is written.
// Usage: node run-evidence-r7ada.mjs [jobName ...]   (CONC, default 3; the mutation job runs alone, last)
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
const here=import.meta.dirname,repo=path.resolve(here,'../../..'),cc=path.join(repo,'CoachingCore'),runs=path.join(here,'runs');
const {hash}=await import(new URL('../../../CoachingCore/src/value.mjs',import.meta.url).href);
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const digest=()=>hash(Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['src/'+f,sha(path.join(cc,'src',f))])));
const PRED='audits/domain-coaching-r7a-decision-authority-2026-10-29/state-consumer-freeze-source/CoachingCore',P='audits/domain-coaching-r7a-decision-authority-2026-10-29/probes/';
const JOBS=[
 {name:'blockers.predecessor',script:P+'reproduce-blockers-r7ada.mjs',args:['predecessor','baseline-predecessor'],out:'runs/baseline-predecessor/BLOCKERS.json',why:'§4: the five blockers on STATE-MODEL-CONSUMER-FREEZE-1, with the reviewers\' own probes'},
 {name:'blockers.candidate',script:P+'reproduce-blockers-r7ada.mjs',args:['live','candidate'],out:'runs/candidate/BLOCKERS.json',why:'§37: the same probes on the candidate'},
 {name:'tests-on-predecessor',script:P+'tests-on-predecessor-r7ada.mjs',args:[],stdout:'runs/tests-on-predecessor.out.json',why:'§28: the new and edited tests fail on the predecessor where they guard a finding'},
 {name:'self-challenge.candidate',script:P+'r7ada-self-challenge.mjs',args:[],stdout:'runs/self-challenge.candidate.out.json',why:'§32: equivalence classes on the candidate'},
 {name:'self-challenge.predecessor',script:P+'r7ada-self-challenge.mjs',args:[],env:{R7ADA_ROOT:PRED},stdout:'runs/self-challenge.predecessor.out.json',why:'§32: the same classes on the predecessor'},
 {name:'judges',script:P+'rerun-judges-r7ada.mjs',args:[P+'judges'],stdout:'runs/judges.summary.out.json',why:'§24: every earlier judge probe, unchanged, on the candidate'},
 {name:'regression',script:'CoachingCore/scripts/regress-r7ada.mjs',args:[],stdout:'runs/regression.summary.out.json',why:'§35: R5 corpus, R6 holdout, profiles, simulations against the predecessor'},
 {name:'ablation',script:P+'r7ada-ablation.mjs',args:[],stdout:'runs/ablation.out.json',after:'regression',why:'§35: a named cause for every regression difference'},
 {name:'mutation',script:P+'r7ada-mutation.mjs',args:[],stdout:'runs/mutation.out.json',alone:true,why:'§33: bounded mutation of the new contracts'},
];
const want=process.argv.slice(2),jobs=JOBS.filter(j=>!want.length||want.includes(j.name));
const recPath=path.join(here,'EVIDENCE_RUNS_R7ADA.json'),record=fs.existsSync(recPath)?JSON.parse(fs.readFileSync(recPath,'utf8')):{revision:'R7ADA-EVIDENCE-RUNS',runs:[]};
const run=j=>new Promise(resolve=>{
 const start=digest(),t0=Date.now(),o=[],e=[];
 const p=spawn(process.execPath,[path.join(repo,j.script),...j.args],{cwd:repo,env:{...process.env,...(j.env??{})}});
 p.stdout.on('data',d=>o.push(d));p.stderr.on('data',d=>e.push(d));
 p.on('close',code=>{const stdout=Buffer.concat(o),stderr=Buffer.concat(e).toString();if(j.stdout){fs.mkdirSync(path.dirname(path.join(here,j.stdout)),{recursive:true});fs.writeFileSync(path.join(here,j.stdout),stdout);}
  const outFile=j.stdout??j.out,end=digest();
  resolve({name:j.name,script:j.script,scriptSha256:sha(path.join(repo,j.script)),args:j.args,env:j.env??{},why:j.why,exit:code,seconds:Math.round((Date.now()-t0)/1000),sourceDigestStart:start,sourceDigestEnd:end,output:P+outFile,outSha256:fs.existsSync(path.join(here,outFile))?sha(path.join(here,outFile)):null,stderrTail:stderr.slice(-600)});});
});
const done=[],queue=jobs.filter(j=>!j.alone&&!j.after),later=jobs.filter(j=>j.after&&!j.alone),last=jobs.filter(j=>j.alone),CONC=Number(process.env.CONC??3);
await Promise.all(Array.from({length:CONC},async()=>{while(queue.length)done.push(await run(queue.shift()));}));
for(const j of later)done.push(await run(j));
for(const j of last)done.push(await run(j));
const names=new Set(done.map(r=>r.name));
record.runs=[...record.runs.filter(r=>!names.has(r.name)),...done].sort((a,b)=>a.name<b.name?-1:1);record.updatedAt=new Date().toISOString();record.node=process.version;record.sourceDigest=digest();
record.rule='Every run is bound to the source digest recomputed before and after it; the freeze refuses a run on other bytes or one that failed.';
record.summary={runs:record.runs.length,failed:record.runs.filter(r=>r.exit!==0).map(r=>r.name),unbound:record.runs.filter(r=>r.sourceDigestStart!==record.sourceDigest||r.sourceDigestEnd!==record.sourceDigest).map(r=>r.name)};
fs.writeFileSync(recPath,JSON.stringify(record,null,1)+'\n');
console.log(JSON.stringify(record.summary));
