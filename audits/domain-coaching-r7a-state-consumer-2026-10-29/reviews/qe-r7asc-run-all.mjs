// Reviewer-owned: re-runs every qe-r7asc probe with the final scaffolding, compares each output with the run cited in the review
// (qe-r7asc-runs/<name>.out.json) and binds the batch to the source digest recomputed before and after. Writes only qe-r7asc-runs/RUNS.json and
// qe-r7asc-runs/final/*.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const here=import.meta.dirname,runs=path.join(here,'qe-r7asc-runs'),fin=path.join(runs,'final'),repo=path.resolve(here,'../../..');
fs.mkdirSync(fin,{recursive:true});
const sha=b=>createHash('sha256').update(b).digest('hex');
const digest=()=>JSON.parse(spawnSync(process.execPath,[path.join(here,'qe-r7asc-integrity.mjs')],{encoding:'utf8',maxBuffer:64*1024*1024}).stdout);
const PRIOR=path.join(repo,'audits/domain-coaching-r7a-state-consumer-2026-10-29/state-model-freeze-source/CoachingCore'),SE=path.join(repo,'audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source/CoachingCore');
const JOBS=[
 ['P01','qe-r7asc-P01-stale-known-row-adoption.mjs',{}],['P01.w3kg24','qe-r7asc-P01-stale-known-row-adoption.mjs',{QE_W3KG:'24'}],['P01.PRIOR','qe-r7asc-P01-stale-known-row-adoption.mjs',{QE_ROOT:PRIOR}],
 ['P01b','qe-r7asc-P01b-stale-known-row-robustness.mjs',{}],
 ['P02','qe-r7asc-P02-run-view-e10.mjs',{}],['P02b','qe-r7asc-P02b-run-view-sweep.mjs',{}],['P02b.PRIOR','qe-r7asc-P02b-run-view-sweep.mjs',{QE_ROOT:PRIOR}],
 ['P03','qe-r7asc-P03-correction-boundary.mjs',{}],['P03b','qe-r7asc-P03b-correction-plan-diff.mjs',{}],
 ['P04','qe-r7asc-P04-temporal.mjs',{}],
 ['P05','qe-r7asc-P05-reentry-run-gate.mjs',{}],['P05.PRIOR','qe-r7asc-P05-reentry-run-gate.mjs',{QE_ROOT:PRIOR}],['P05.SE','qe-r7asc-P05-reentry-run-gate.mjs',{QE_ROOT:SE}],['P05b','qe-r7asc-P05b-reentry-basis.mjs',{}],
 ['P06','qe-r7asc-P06-strength-dose-sweep.mjs',{}],
 ['P07','qe-r7asc-P07-goal-change-two-readings.mjs',{}],['P07.PRIOR','qe-r7asc-P07-goal-change-two-readings.mjs',{QE_ROOT:PRIOR}],['P07.SE','qe-r7asc-P07-goal-change-two-readings.mjs',{QE_ROOT:SE}],
];
const start=digest(),results=[];
for(const [name,script,env] of JOBS){
 const t0=Date.now(),p=spawnSync(process.execPath,[path.join(here,script)],{cwd:repo,env:{...process.env,...env},encoding:'buffer',maxBuffer:512*1024*1024});
 fs.writeFileSync(path.join(fin,name+'.out.json'),p.stdout);
 const cited=path.join(runs,name+'.out.json'),citedBytes=fs.existsSync(cited)?fs.readFileSync(cited):null;
 results.push({name,script,scriptSha256:sha(fs.readFileSync(path.join(here,script))),env:Object.fromEntries(Object.entries(env).map(([k,v])=>[k,k==='QE_ROOT'?path.relative(repo,v).split(path.sep).join('/'):v])),exit:p.status,seconds:Math.round((Date.now()-t0)/1000),outSha256:sha(p.stdout),stderrBytes:p.stderr.length,identicalToCitedRun:citedBytes?sha(citedBytes)===sha(p.stdout):null});
 console.error(name,p.status,citedBytes&&sha(citedBytes)===sha(p.stdout)?'IDENTICAL':'DIFFERENT');
}
const end=digest();
const record={node:process.version,ranAt:new Date().toISOString(),libSha256:sha(fs.readFileSync(path.join(here,'qe-r7asc-lib.mjs'))),sourceDigestStart:start.recomputed.sourceDigest,sourceDigestEnd:end.recomputed.sourceDigest,boundToFreeze:start.equal.sourceDigest&&end.equal.sourceDigest&&start.mismatched.length===0&&end.mismatched.length===0&&end.unfrozen.length===0,
 summary:{runs:results.length,failed:results.filter(r=>r.exit!==0).map(r=>r.name),notIdenticalToCited:results.filter(r=>r.identicalToCitedRun!==true).map(r=>r.name)},results};
fs.writeFileSync(path.join(runs,'RUNS.json'),JSON.stringify(record,null,1)+'\n');
console.log(JSON.stringify({boundToFreeze:record.boundToFreeze,sourceDigestStart:record.sourceDigestStart,sourceDigestEnd:record.sourceDigestEnd,summary:record.summary},null,1));
