// Author runner (R7-A RESIDUAL AUTHORITY, Founder request §22, §27, §30): the one round of evidence this closure cites before the freeze, each run
// bound to the runtime's source digest, recomputed before and after the job exactly as the freeze computes it (the canonical hash of the
// src/*.mjs SHA-256 map). Jobs: the reviewers' finding probes (byte-exact copies in probes/judges/, unchanged) on the candidate and the
// predecessor; the predecessor judge's QE-R7ASC probes and the 35 earlier judge probes, unchanged, from their own folders; the SSCTR kit (the 43
// jobs of the decision authority closure's kit-final, same scripts and environments) and the SSCTR's R7ASC and R7ADA probes; this mission's tests on
// the predecessor, self-challenge, mutation and regression. Outputs go under probes/runs/; the record is probes/EVIDENCE_RUNS_R7ARA.json. Nothing
// else is written (the round-12 instrument's data file is redirected here). Child processes get TMPDIR from the environment.
// Usage: node run-evidence-r7ara.mjs [group|jobName ...]   (CONC, default 4; the mutation job runs alone, last)
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
const here=import.meta.dirname,repo=path.resolve(here,'../../..'),cc=path.join(repo,'CoachingCore'),runs=path.join(here,'runs');
const {hash}=await import(new URL('../../../CoachingCore/src/value.mjs',import.meta.url).href);
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const digest=()=>hash(Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['src/'+f,sha(path.join(cc,'src',f))])));
const AU='audits/domain-coaching-r7a-residual-authority-2026-10-30/',P=AU+'probes/',J=P+'judges/';
const TREES={cand:'CoachingCore',pred:AU+'decision-authority-freeze-source/CoachingCore'},abs=p=>path.join(repo,p);
// A probe that reads the holdout corpus and its evaluator from its tree (the SSCTR's R6-H25 trace) gets, on the predecessor, a rebuild in TMPDIR: the
// predecessor copy (every file its MANIFEST binds, checked byte for byte) plus those unchanged inputs from this tree, each checked against BASELINE.json,
// as the reviewers rebuilt their trees. Built once, when such a job runs.
const SUPPORT=['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json'];
let predSupport=null;
const predSupportTree=()=>{if(predSupport)return predSupport;const man=JSON.parse(fs.readFileSync(abs(AU+'decision-authority-freeze-source/MANIFEST.json'),'utf8')),base=Object.fromEntries(JSON.parse(fs.readFileSync(abs(AU+'BASELINE.json'),'utf8')).entries.map(e=>[e.path,e.sha256]));
 const root=fs.mkdtempSync(path.join(process.env.TMPDIR??'/tmp','r7ara-pred-support-')),put=(from,rel)=>{fs.mkdirSync(path.dirname(path.join(root,rel)),{recursive:true});fs.copyFileSync(from,path.join(root,rel));};
 for(const [rel,d] of Object.entries(man.files)){const f=abs(AU+'decision-authority-freeze-source/'+rel);if(sha(f)!==d)throw Error('predecessor copy drift '+rel);put(f,rel);}
 for(const rel of SUPPORT){if(sha(abs(rel))!==base[rel])throw Error('support input changed since the baseline '+rel);put(abs(rel),rel);}
 return predSupport=path.join(root,'CoachingCore');};
const ASC='audits/domain-coaching-r7a-state-consumer-2026-10-29/reviews/',SMR='audits/domain-coaching-r7a-state-model-2026-10-28/reviews';
const JOBS=[];
const job=(group,name,script,{args=[],env={},cwd='.',stdout=null,why}={})=>JOBS.push({group,name,script,args,env,cwd,stdout:stdout??`runs/${group}/${name}.out.json`,why});
// The round-12 instrument writes its data file relative to its own folder: redirected into this mission's runs folder.
const kit=JSON.parse(fs.readFileSync(abs('audits/domain-coaching-r7a-decision-authority-2026-10-29/probes/kit-final/RUNS.json'),'utf8')).runs;
for(const r of [...kit].sort((a,b)=>b.seconds-a.seconds)){const env={...r.env};if('R7A_PROBE_OUT' in env)env.R7A_PROBE_OUT=path.relative(abs(SMR),path.join(runs,'kit','r12-instrument.data.json'));
 job('kit',r.name,r.script,{env,cwd:path.dirname(r.script),why:'§27: the SSCTR kit (F1-F4, D53/D56-D59, HOLD, MAINTAIN), as the decision authority closure ran it'});}
for(const [tree,root] of Object.entries(TREES)){
 for(const q of ['Q01-correction-via-handlers','Q01b-correction-via-handlers-robustness','Q04-temporal-and-order','Q05-decision-context','Q06-return-ceiling','Q06b-short-return-entry','Q06c-return-base-run','Q06d-moderate-return-target'])
  job('findings',`${q.split('-')[0]}.${tree}`,J+`qe/qe-r7ada-${q}.mjs`,{env:{QE_ROOT:root},why:'§8, §17: the engineering judge\'s own probes for QE-R7ADA-01/02 and the A/B/C/E classes they cover'});
 for(const s of ['continuous','walkjog-matrix','progression','returnwalks','h25run'])job('findings',`ssctr-${s}.${tree}`,J+`ssctr/ssctr-r7ada-${s}-probe.mjs`,{env:{SSCTR_CC:s==='h25run'&&tree==='pred'?'pred+support':root},why:'§17: the SSCTR\'s own probes (F4-X, F4 matrix, progression authority, return walk days, R6-H25)'});
 for(const s of ['hold','maintain','temporal','walkjog','walkjog-trace','easyreturn'])job('asc',`${s}.${tree}`,ASC+`ssctr-r7asc-${s}${s==='walkjog-trace'?'':'-probe'}.mjs`,{env:{SSCTR_CC:root},cwd:ASC,why:'§19, §27: the SSCTR\'s R7ASC probes (HOLD, MAINTAIN, temporal evidence, walk/jog F4, easy return)'});
 for(const [n,s,e] of [['P01','qe-r7asc-P01-stale-known-row-adoption.mjs',{}],['P01.w3kg24','qe-r7asc-P01-stale-known-row-adoption.mjs',{QE_W3KG:'24'}],['P01b','qe-r7asc-P01b-stale-known-row-robustness.mjs',{}],['P02','qe-r7asc-P02-run-view-e10.mjs',{}],['P02b','qe-r7asc-P02b-run-view-sweep.mjs',{}],['P03','qe-r7asc-P03-correction-boundary.mjs',{}],['P03b','qe-r7asc-P03b-correction-plan-diff.mjs',{}],['P04','qe-r7asc-P04-temporal.mjs',{}],['P05','qe-r7asc-P05-reentry-run-gate.mjs',{}],['P05b','qe-r7asc-P05b-reentry-basis.mjs',{}],['P06','qe-r7asc-P06-strength-dose-sweep.mjs',{}],['P07','qe-r7asc-P07-goal-change-two-readings.mjs',{}]])
  job('r7asc-qe',`${n}.${tree}`,ASC+s,{env:{QE_ROOT:root,...e},cwd:ASC,why:'§2: QE-R7ASC-01..04 stay closed (the predecessor judge\'s probes, unchanged)'});
 job('self-challenge',tree,P+'r7ara-self-challenge.mjs',{env:{R7ADA_ROOT:root},why:'§25: the bounded self-challenge'});
}
const earlier=JSON.parse(fs.readFileSync(abs('audits/domain-coaching-r7a-state-consumer-2026-10-29/probes/EVIDENCE_RUNS_R7ASC.json'),'utf8')).runs.filter(r=>/^qe-/.test(r.name));
for(const r of earlier)job('judges',r.name,r.script,{env:r.env??{},why:'§2: the 35 earlier judge probes stay closed (unchanged, as the decision authority closure re-ran them)'});
job('suite','full-suite',P+'full-suite-r7ara.mjs',{stdout:'runs/full-suite.out.json',why:'§27: the full test suite, once, on these bytes'});
job('tests','tests-on-predecessor',P+'tests-on-predecessor-r7ara.mjs',{stdout:'runs/tests-on-predecessor.out.json',why:'§23: every regression fails on the predecessor and passes here'});
job('regression','regression','CoachingCore/scripts/regress-r7ara.mjs',{stdout:'runs/regression.summary.out.json',why:'§27: R5 corpus, R6 holdout, profiles, simulations against the predecessor'});
job('mutation','mutation',P+'r7ara-mutation.mjs',{stdout:'runs/mutation.out.json',why:'§26: the four targeted mutants'});
const want=process.argv.slice(2),jobs=JOBS.filter(j=>!want.length||want.includes(j.group)||want.includes(j.name)||want.includes(`${j.group}/${j.name}`));
const recPath=path.join(here,'EVIDENCE_RUNS_R7ARA.json'),record=fs.existsSync(recPath)?JSON.parse(fs.readFileSync(recPath,'utf8')):{revision:'R7ARA-EVIDENCE-RUNS',runs:[]};
const run=j=>new Promise(resolve=>{
 const start=digest(),t0=Date.now(),o=[],e=[],env=Object.fromEntries(Object.entries(j.env).map(([k,v])=>[k,['QE_ROOT','SSCTR_CC','R7ADA_ROOT'].includes(k)?(v==='pred+support'?predSupportTree():abs(v)):v]));
 const p=spawn(process.execPath,[abs(j.script),...j.args],{cwd:abs(j.cwd),env:{...process.env,...env}});
 p.stdout.on('data',d=>o.push(d));p.stderr.on('data',d=>e.push(d));
 p.on('close',code=>{const out=path.join(here,j.stdout);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,Buffer.concat(o));const err=Buffer.concat(e).toString(),end=digest();
  resolve({group:j.group,name:j.name,script:j.script,scriptSha256:sha(abs(j.script)),cwd:j.cwd,env:j.env,why:j.why,exit:code,seconds:Math.round((Date.now()-t0)/1000),sourceDigestStart:start,sourceDigestEnd:end,output:P+j.stdout,outSha256:sha(out),stderrTail:err.slice(-600)});});
});
const done=[],queue=jobs.filter(j=>j.group!=='mutation'),last=jobs.filter(j=>j.group==='mutation'),CONC=Number(process.env.CONC??4);
await Promise.all(Array.from({length:CONC},async()=>{while(queue.length){const j=queue.shift(),r=await run(j);done.push(r);process.stderr.write(`${r.group}/${r.name} exit ${r.exit} ${r.seconds}s\n`);}}));
for(const j of last)done.push(await run(j));
const key=r=>r.group+'/'+r.name,names=new Set(done.map(key));
record.runs=[...record.runs.filter(r=>!names.has(key(r))),...done].sort((a,b)=>key(a)<key(b)?-1:1);record.updatedAt=new Date().toISOString();record.node=process.version;record.sourceDigest=digest();
record.rule='Every run is bound to the source digest recomputed before and after it; the freeze refuses a run on other bytes, and a failed run is named (the SSCTR kit\'s regression probe exits with the R6-H35 runner error, as before).';
record.summary={runs:record.runs.length,failed:record.runs.filter(r=>r.exit!==0).map(key),unbound:record.runs.filter(r=>r.sourceDigestStart!==record.sourceDigest||r.sourceDigestEnd!==record.sourceDigest).map(key)};
fs.writeFileSync(recPath,JSON.stringify(record,null,1)+'\n');
console.log(JSON.stringify(record.summary));
